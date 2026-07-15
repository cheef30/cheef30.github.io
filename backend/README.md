# Newsletter API

Express endpoint that takes an email from the [`newsletter-signup.js`](../newsletter-signup.js)
widget, validates it, and adds it to a Brevo (Sendinblue) contact list.

## Setup

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and set:

- `BREVO_API_KEY` — your real Brevo API key (Brevo dashboard → Settings → SMTP & API → API Keys). **Never commit this file** — it's already in `.gitignore`.
- `BREVO_LIST_ID` — the numeric ID of the list subscribers should join (Brevo → Contacts → Lists). Optional; leave blank to just add contacts without a list.
- `FRONTEND_ORIGIN` — your site's origin, for CORS. Use `*` only while developing locally.

Run it:

```bash
npm start        # node server.js
npm run dev       # same, restarts on file changes (Node 18+)
```

By default it listens on `http://localhost:3001`. It serves two things on that
one port:

- the static site itself (`index.html`, `contact.html`, `gallery.html`, etc. — everything one level up from `backend/`), so open **http://localhost:3001** in your browser to test the real pages, form included.
- `POST /api/subscribe`, which the widget calls with a relative path — since both are on the same origin/port, it works with no extra config.

(`/backend/*` is explicitly blocked from static serving, so `.env` and `server.js` itself are never reachable over HTTP.)

## Deploying

The frontend widget posts to a relative `/api/subscribe` by default, so in production either:

- reverse-proxy `/api/*` on your site's domain to this server, or
- serve the static site from this same Express app, or
- point the widget at an absolute URL: `<script src="newsletter-signup.js" data-endpoint="https://api.yoursite.com/subscribe" defer></script>`

## Adding the signup form to a page

Add one line where you want the form to appear — no other markup needed, the
script mounts its own form there:

```html
<script src="newsletter-signup.js" defer></script>
```

Put it in `<body>`, e.g. in a footer section of a new page:

```html
<footer>
  <h3>Ostani u toku</h3>
  <script src="newsletter-signup.js" defer></script>
</footer>
```

Styling is done through CSS custom properties on `.newsletter-signup`, so you
can restyle it from `styles.css` without touching the widget file:

```css
.newsletter-signup {
  --ns-accent: var(--red);
  --ns-radius: 2px;
}
```

If the API isn't served from the same origin as the page, pass its URL via
`data-endpoint` as shown above under "Deploying".
