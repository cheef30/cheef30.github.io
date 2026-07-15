/**
 * VIEWFINDER CURSOR — desktop-only custom cursor.
 * Self-contained: does nothing on touch/coarse-pointer devices, and does
 * nothing if it fails to load (site keeps its default cursor).
 *
 * Hover targets: any element with class="photo". If that element (or an
 * <img> inside it) carries data-exif-fstop / data-exif-iso /
 * data-exif-shutter / data-exif-focal, those are shown next to the cursor.
 */
(function () {
  if (!window.matchMedia || !window.matchMedia('(pointer: fine)').matches) return;

  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cursor = document.createElement('div');
  cursor.className = 'rc-viewfinder';
  cursor.setAttribute('aria-hidden', 'true');
  cursor.innerHTML =
    '<div class="rc-viewfinder-ring"></div>' +
    '<div class="rc-viewfinder-line horizontal"></div>' +
    '<div class="rc-viewfinder-line vertical"></div>' +
    '<div class="rc-viewfinder-exif"></div>';

  document.body.appendChild(cursor);
  document.body.classList.add('rc-cursor-active');

  var exifEl = cursor.querySelector('.rc-viewfinder-exif');

  var mouseX = -100, mouseY = -100;
  var curX = -100, curY = -100;
  var visible = false;

  function readExifTarget(el) {
    if (el.hasAttribute('data-exif-fstop') || el.hasAttribute('data-exif-iso') ||
        el.hasAttribute('data-exif-shutter') || el.hasAttribute('data-exif-focal')) {
      return el;
    }
    return el.querySelector('[data-exif-fstop], [data-exif-iso], [data-exif-shutter], [data-exif-focal]');
  }

  function formatExif(el) {
    if (!el) return '';
    var focal = el.getAttribute('data-exif-focal');
    var fstop = el.getAttribute('data-exif-fstop');
    var shutter = el.getAttribute('data-exif-shutter');
    var iso = el.getAttribute('data-exif-iso');
    var parts = [];
    if (focal) parts.push(focal);
    if (fstop) parts.push('f/' + fstop);
    if (shutter) parts.push(shutter);
    if (iso) parts.push('ISO ' + iso);
    return parts.join(' · ');
  }

  function onMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!visible) {
      visible = true;
      curX = mouseX;
      curY = mouseY;
      cursor.classList.add('rc-visible');
    }
  }

  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', function () {
    visible = false;
    cursor.classList.remove('rc-visible');
  });

  document.addEventListener('mouseover', function (e) {
    if (!e.target.closest) return;
    var photo = e.target.closest('.photo');
    if (!photo) return;
    cursor.classList.add('rc-expanded');
    var exifText = formatExif(readExifTarget(photo));
    if (exifText) {
      exifEl.textContent = exifText;
      cursor.classList.add('rc-has-exif');
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (!e.target.closest) return;
    var photo = e.target.closest('.photo');
    if (!photo) return;
    if (e.relatedTarget && photo.contains(e.relatedTarget)) return;
    cursor.classList.remove('rc-expanded', 'rc-has-exif');
    exifEl.textContent = '';
  });

  function tick() {
    if (reducedMotion) {
      curX = mouseX;
      curY = mouseY;
    } else {
      curX += (mouseX - curX) * 0.18;
      curY += (mouseY - curY) * 0.18;
    }
    cursor.style.transform = 'translate3d(' + curX + 'px,' + curY + 'px,0)';
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
