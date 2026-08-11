// Fetches published photos from Supabase and renders them into #gallery-grid.
// Fires 'rc:gallery-loaded' when done so script.js can wire up filters/lightbox
// against the freshly-inserted elements.
(function () {
  const grid = document.getElementById('gallery-grid');
  const emptyMsg = document.getElementById('gallery-empty');
  if (!grid || !window.supabase || !window.RC_SUPABASE_URL) return;

  const client = window.supabase.createClient(window.RC_SUPABASE_URL, window.RC_SUPABASE_PUBLISHABLE_KEY);
  const categories = window.RC_PHOTO_CATEGORIES || [];
  const lang = localStorage.getItem('rc-lang') === 'sr' ? 'sr' : 'en';

  function categoryLabel(value) {
    const cat = categories.find((c) => c.value === value);
    if (!cat) return value;
    return lang === 'sr' ? cat.label_sr : cat.label_en;
  }

  function renderItem(photo, index) {
    const figure = document.createElement('figure');
    figure.className = 'gallery-item' + (index % 5 === 2 ? ' span-2' : '');
    figure.dataset.category = photo.category;

    const img = document.createElement('img');
    // Grid cells top out around 260px, so they get a thumbnail; the full-size
    // original is kept on the figure for the lightbox to swap in on open.
    img.src = window.RC_THUMB ? window.RC_THUMB(photo.image_url, 600) : photo.image_url;
    img.addEventListener('error', () => {
      if (img.src !== photo.image_url) img.src = photo.image_url;
    });
    figure.dataset.full = photo.image_url;
    img.alt = photo.alt_text || '';
    img.title = photo.title || '';
    img.loading = 'lazy';
    img.className = 'photo';

    const caption = document.createElement('figcaption');
    caption.textContent = photo.title || categoryLabel(photo.category);

    figure.appendChild(img);
    figure.appendChild(caption);
    return figure;
  }

  async function load() {
    const { data, error } = await client
      .from('photos')
      .select('image_url, alt_text, title, seo_description, category, created_at')
      .order('created_at', { ascending: false });

    grid.innerHTML = '';

    if (error) {
      console.error('Failed to load gallery:', error.message);
      if (emptyMsg) emptyMsg.style.display = 'block';
      document.dispatchEvent(new CustomEvent('rc:gallery-loaded'));
      return;
    }

    if (!data || data.length === 0) {
      if (emptyMsg) emptyMsg.style.display = 'block';
      document.dispatchEvent(new CustomEvent('rc:gallery-loaded'));
      return;
    }

    data.forEach((photo, i) => grid.appendChild(renderItem(photo, i)));
    document.dispatchEvent(new CustomEvent('rc:gallery-loaded'));
  }

  load();
})();
