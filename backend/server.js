require('dotenv').config();

const path = require('path');
const express = require('express');

const app = express();
const SITE_ROOT = path.join(__dirname, '..');

const PORT = process.env.PORT || 3001;
const BREVO_API_KEY = process.env.BREVO_API_KEY;
const BREVO_LIST_ID = process.env.BREVO_LIST_ID ? Number(process.env.BREVO_LIST_ID) : undefined;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '*';

// Practical RFC 5322-ish check: local-part@domain-labels.tld
const EMAIL_RE =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

app.use(express.json({ limit: '10kb' }));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post('/api/subscribe', async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim() : '';

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Unesi ispravnu email adresu.' });
  }

  if (!BREVO_API_KEY) {
    console.error('BREVO_API_KEY nije podešen — proveri backend/.env');
    return res.status(500).json({ error: 'Server nije podešen. Pokušaj kasnije.' });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      // updateEnabled: true makes re-subscribing idempotent instead of
      // erroring on "contact already exists".
      body: JSON.stringify({
        email,
        listIds: BREVO_LIST_ID ? [BREVO_LIST_ID] : undefined,
        updateEnabled: true,
      }),
    });

    if (!brevoRes.ok) {
      const errorBody = await brevoRes.json().catch(() => ({}));
      console.error('Brevo API error:', brevoRes.status, errorBody);
      return res.status(502).json({ error: 'Prijava nije uspela. Pokušaj ponovo kasnije.' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Greška pri pozivu Brevo API-ja:', err);
    return res.status(502).json({ error: 'Prijava nije uspela. Pokušaj ponovo kasnije.' });
  }
});

// Restrict /admin to specific IPs (comma-separated in ADMIN_ALLOWED_IPS).
// Off by default (empty/unset) so this can't lock you out before it's
// configured. Blocked requests get the branded 404 (not 403), so a visitor
// can't tell an admin panel exists there at all.
// NOTE: req.ip is the direct socket IP. If this ever runs behind a reverse
// proxy/load balancer (Render, Railway, nginx, Cloudflare...), every visitor
// will show up as the proxy's IP unless you set app.set('trust proxy', N) —
// and get that number wrong and the check becomes spoofable via the
// X-Forwarded-For header instead. Only add that once you know your setup.
const ADMIN_ALLOWED_IPS = (process.env.ADMIN_ALLOWED_IPS || '')
  .split(',')
  .map((ip) => ip.trim())
  .filter(Boolean);

app.use('/admin', (req, res, next) => {
  if (ADMIN_ALLOWED_IPS.length === 0) return next();
  const ip = req.ip.replace(/^::ffff:/, ''); // normalize IPv4-mapped IPv6
  if (ADMIN_ALLOWED_IPS.includes(ip)) return next();
  res.status(404).sendFile(path.join(SITE_ROOT, '404.html'));
});

// Clean URLs: redirect any *.html request to its extension-less form (301,
// so search engines consolidate on one canonical URL), preserving the query
// string. /index.html and /admin/index.html collapse to their directory.
app.use((req, res, next) => {
  if (!req.path.endsWith('.html')) return next();
  let clean = req.path.slice(0, -'.html'.length);
  if (clean.endsWith('/index')) clean = clean.slice(0, -'index'.length);
  const queryString = req.url.slice(req.path.length);
  res.redirect(301, clean + queryString);
});

// Serve the static site itself for local testing, so the whole thing runs
// on one origin/port and the widget's relative fetch('/api/subscribe') just
// works. Block /backend/* first — it holds server.js and .env, which must
// never be reachable as static files. `extensions: ['html']` is what makes
// /gallery resolve to gallery.html without a redirect.
app.use('/backend', (req, res) => res.status(404).end());
app.use(express.static(SITE_ROOT, { extensions: ['html'] }));

// Anything that didn't match a real file or the API route above gets the
// branded 404 page, with an actual 404 status (not a silent 200).
app.use((req, res) => {
  res.status(404).sendFile(path.join(SITE_ROOT, '404.html'));
});

app.listen(PORT, () => {
  console.log(`Sajt + newsletter API rade na http://localhost:${PORT}`);
});
