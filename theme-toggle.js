/**
 * NEGATIVE / POSITIVE TOGGLE — dark/light mode.
 * The no-flash "which theme" decision lives in the inline snippet in each
 * page's <head> (must run before first paint). This file only wires up the
 * button: click to flip themes, with a brief invert() flash standing in for
 * "developing film". Self-contained: if this file fails to load, the site
 * just stays in whatever theme the inline head snippet picked.
 */
(function () {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;

  var root = document.documentElement;
  var label = btn.querySelector('.theme-toggle-label');

  function currentTheme() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function render(theme) {
    var isDark = theme === 'dark';
    if (label) label.textContent = isDark ? 'NEGATIVE' : 'POSITIVE';
    btn.setAttribute('aria-pressed', String(isDark));
  }

  function applyTheme(theme, opts) {
    opts = opts || {};
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (opts.flash && !reduced) {
      root.classList.add('theme-flash');
      window.setTimeout(function () {
        root.classList.remove('theme-flash');
      }, 460);
    }

    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }

    try { localStorage.setItem('rc-theme', theme); } catch (e) {}
    render(theme);
  }

  render(currentTheme());

  btn.addEventListener('click', function () {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark', { flash: true });
  });
})();
