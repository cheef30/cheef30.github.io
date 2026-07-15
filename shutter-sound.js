/**
 * SHUTTER SOUND — plays sounds/shutter.mp3 when a gallery image is opened
 * in the lightbox. Off by default until the user opts in via #sound-toggle.
 * Self-contained: listens for the 'rc:lightbox-open' event dispatched by
 * script.js's openLightbox(); if that event never fires (or this file fails
 * to load), nothing plays and nothing else on the page is affected.
 */
(function () {
  var btn = document.getElementById('sound-toggle');
  if (!btn) return;

  var STORAGE_KEY = 'rc-sound-enabled';
  var audio = new Audio('sounds/shutter.mp3');
  audio.preload = 'auto';

  function isEnabled() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch (e) {
      return false;
    }
  }

  function render(enabled) {
    btn.classList.toggle('is-on', enabled);
    btn.setAttribute('aria-pressed', String(enabled));
    btn.setAttribute('aria-label', enabled ? 'Mute shutter sound' : 'Unmute shutter sound');
  }

  var enabled = isEnabled();
  render(enabled);

  btn.addEventListener('click', function () {
    enabled = !enabled;
    try { localStorage.setItem(STORAGE_KEY, String(enabled)); } catch (e) {}
    render(enabled);
  });

  document.addEventListener('rc:lightbox-open', function () {
    if (!enabled) return;
    audio.pause();
    audio.currentTime = 0;
    audio.play().catch(function () {
      /* Autoplay-policy or similar rejection: fail silently, no sound. */
    });
  });
})();
