/**
 * NEWSLETTER SIGNUP — reusable email capture form.
 *
 * Drop this on any page with a single line, no wrapper element needed:
 *   <script src="newsletter-signup.js" defer></script>
 * The script replaces its own <script> tag with the widget markup at the
 * point where it's included.
 *
 * Backend: posts { email } as JSON to POST /api/subscribe (see
 * backend/server.js), which validates the address and forwards it to Brevo.
 *
 * Custom API URL (only needed if the frontend and the API are on different
 * origins/ports):
 *   <script src="newsletter-signup.js" data-endpoint="https://api.example.com/subscribe" defer></script>
 *
 * Styling: override the CSS custom properties on `.newsletter-signup` from
 * your own stylesheet (e.g. styles.css), no need to touch this file:
 *   .newsletter-signup { --ns-accent: var(--red); --ns-radius: 2px; }
 */
(function () {
  var currentScript = document.currentScript;
  if (!currentScript) return;

  injectStyles();

  var endpoint = currentScript.dataset.endpoint || '/api/subscribe';

  // Mirrors contact.js's currentLang() so this widget follows the site's
  // EN/SR switch without depending on script include order.
  var STRINGS = {
    en: {
      label: 'Sign up for the newsletter',
      placeholder: 'you@email.com',
      button: 'Subscribe',
      sending: 'Sending...',
      invalidEmail: 'Enter a valid email address.',
      success: "You're subscribed to the newsletter!",
      genericError: 'Something went wrong. Please try again.',
      networkError: 'Something went wrong. Check your connection and try again.',
    },
    sr: {
      label: 'Prijavi se na newsletter',
      placeholder: 'tvoj@email.com',
      button: 'Prijavi se',
      sending: 'Šaljem...',
      invalidEmail: 'Unesi ispravnu email adresu.',
      success: 'Uspešno si se prijavio/la na newsletter!',
      genericError: 'Došlo je do greške. Pokušaj ponovo.',
      networkError: 'Došlo je do greške. Proveri konekciju i pokušaj ponovo.',
    },
  };
  // Reads the same localStorage key script.js persists the language choice
  // under, so the initial render is correct even though this widget's script
  // tag can run before script.js restores the saved language on
  // DOMContentLoaded (execution order between the two isn't guaranteed).
  var currentLang = () => {
    var stored = localStorage.getItem('rc-lang');
    if (stored === 'sr' || stored === 'en') return stored;
    return document.documentElement.lang === 'sr' ? 'sr' : 'en';
  };
  var t = () => STRINGS[currentLang()];

  var wrapper = document.createElement('div');
  wrapper.className = 'newsletter-signup';
  wrapper.innerHTML = `
    <form class="newsletter-signup-form" novalidate>
      <label class="newsletter-signup-label" for="newsletter-signup-email"></label>
      <div class="newsletter-signup-row">
        <input
          type="email"
          id="newsletter-signup-email"
          class="newsletter-signup-input"
          autocomplete="email"
          required
        >
        <button type="submit" class="newsletter-signup-btn">
          <span class="newsletter-signup-btn-label"></span>
          <svg class="newsletter-signup-star" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
            <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" fill="currentColor"/>
          </svg>
        </button>
      </div>
      <p class="newsletter-signup-message" role="status" aria-live="polite"></p>
    </form>
  `;

  currentScript.parentNode.replaceChild(wrapper, currentScript);

  var form = wrapper.querySelector('.newsletter-signup-form');
  var label = wrapper.querySelector('.newsletter-signup-label');
  var input = wrapper.querySelector('.newsletter-signup-input');
  var button = wrapper.querySelector('.newsletter-signup-btn');
  var buttonLabel = wrapper.querySelector('.newsletter-signup-btn-label');
  var message = wrapper.querySelector('.newsletter-signup-message');

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function showMessage(text, type) {
    message.textContent = text || '';
    message.classList.remove('is-success', 'is-error');
    if (type) message.classList.add('is-' + type);
  }

  function applyStrings() {
    var s = t();
    label.textContent = s.label;
    input.placeholder = s.placeholder;
    buttonLabel.textContent = s.button;
  }

  applyStrings();

  // The site's language toggle doesn't dispatch an event, so watch clicks on
  // its buttons directly. The timeout lets script.js's own click handler
  // (which updates document.documentElement.lang) run first.
  document.addEventListener('click', (e) => {
    if (e.target.closest && e.target.closest('.lang-btn')) {
      setTimeout(applyStrings, 0);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = input.value.trim();
    if (!EMAIL_RE.test(email)) {
      showMessage(t().invalidEmail, 'error');
      input.focus();
      return;
    }

    const defaultButtonLabel = buttonLabel.textContent;
    button.disabled = true;
    buttonLabel.textContent = t().sending;
    showMessage('', null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok) {
        showMessage(t().success, 'success');
        form.reset();
      } else {
        showMessage(result.error || t().genericError, 'error');
      }
    } catch (err) {
      showMessage(t().networkError, 'error');
    } finally {
      button.disabled = false;
      buttonLabel.textContent = defaultButtonLabel;
    }
  });

  function injectStyles() {
    if (document.getElementById('newsletter-signup-styles')) return;

    const style = document.createElement('style');
    style.id = 'newsletter-signup-styles';
    style.textContent = `
      .newsletter-signup {
        --ns-bg: var(--surface, #fff);
        --ns-text: var(--text, #111);
        --ns-border: var(--border, #111);
        --ns-accent: var(--red, #C8262A);
        --ns-accent-hover: #a91f22;
        --ns-muted: var(--muted, #6b6b6b);
        --ns-success: #2e7d32;
        --ns-error: var(--ns-accent);
        --ns-radius: 2px;
        --ns-btn-radius: 40px;
        --ns-gap: 0.6rem;
        --ns-font: inherit;

        max-width: 440px;
        font-family: var(--ns-font);
        color: var(--ns-text);
      }
      .newsletter-signup-form {
        display: flex;
        flex-direction: column;
        gap: 0.6rem;
      }
      .newsletter-signup-label {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: var(--ns-muted);
      }
      .newsletter-signup-row {
        display: flex;
        gap: var(--ns-gap);
      }
      .newsletter-signup-input {
        flex: 1 1 auto;
        min-width: 0;
        padding: 0.8rem 0.9rem;
        font: inherit;
        font-size: 15px;
        color: var(--ns-text);
        background: var(--ns-bg);
        border: 2px solid var(--ns-border);
        border-radius: var(--ns-radius);
        transition: border-color 0.15s ease;
      }
      .newsletter-signup-input::placeholder {
        color: var(--ns-muted);
        opacity: 0.7;
      }
      .newsletter-signup-input:focus {
        outline: none;
        border-color: var(--ns-accent);
      }
      .newsletter-signup-btn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex: 0 0 auto;
        padding: 0.8rem 1.8rem;
        font: inherit;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 1.5px;
        text-transform: uppercase;
        color: #fff;
        background: var(--ns-accent);
        border: none;
        border-radius: var(--ns-btn-radius);
        cursor: pointer;
        transition: background-color 0.15s ease, transform 0.15s ease;
      }
      .newsletter-signup-star {
        transition: transform 0.4s ease;
      }
      .newsletter-signup-btn:hover:not(:disabled) {
        background: var(--ns-accent-hover);
        transform: translateY(-2px);
      }
      .newsletter-signup-btn:hover:not(:disabled) .newsletter-signup-star {
        transform: rotate(90deg);
      }
      .newsletter-signup-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
        transform: none;
      }
      .newsletter-signup-message {
        min-height: 1.1em;
        margin: 0;
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--ns-muted);
      }
      .newsletter-signup-message.is-success {
        color: var(--ns-success);
      }
      .newsletter-signup-message.is-error {
        color: var(--ns-error);
      }
      @media (max-width: 420px) {
        .newsletter-signup-row {
          flex-direction: column;
          align-items: stretch;
        }
        .newsletter-signup-btn {
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }
})();
