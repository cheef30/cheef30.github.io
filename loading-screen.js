(function () {
  var overlay = document.getElementById('loading-overlay');
  if (!overlay) return;

  var TOTAL_MS = 3300; // draw 1.6s + hold 0.6s + erase 1.1s
  var REDUCED_MOTION_HOLD_MS = 700;
  var EXIT_FADE_MS = 250;

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reduced) {
    var glyphs = overlay.querySelectorAll('.loading-glyph');
    for (var i = 0; i < glyphs.length; i++) {
      glyphs[i].classList.add('reduced');
    }
  }

  document.body.style.overflow = 'hidden';

  var holdMs = reduced ? REDUCED_MOTION_HOLD_MS : TOTAL_MS;

  setTimeout(function () {
    overlay.classList.add('hiding');
    setTimeout(function () {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }, EXIT_FADE_MS);
  }, holdMs);
})();
