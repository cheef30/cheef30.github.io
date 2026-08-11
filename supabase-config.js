// Public client config — safe to expose in the browser.
// The publishable key only allows what Row Level Security policies permit
// (public read on photos, insert only for logged-in admins). Never put the
// secret key here.
window.RC_SUPABASE_URL = 'https://vglrybegfjlcwhcdelog.supabase.co';
window.RC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Dvjk1pEX3hb7Q7AkIqoGTw_VDjfWnlT';

// Photos are stored at full upload resolution (up to 2000px) because the
// lightbox needs them, but the filmstrip and the gallery grid display them at
// a fraction of that. This rewrites a public object URL to Supabase's image
// transformation endpoint so those two get a thumbnail instead — a ~145 KB
// original comes back as ~28 KB, and Supabase serves WebP automatically to
// browsers that accept it. Returns the original URL unchanged if it isn't a
// public storage URL, and the <img> falls back to the original on error.
window.RC_THUMB = function (url, width) {
  if (typeof url !== 'string' || !url.includes('/storage/v1/object/public/')) return url;
  return url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/')
    + `?width=${width}&quality=60`;
};

// Categories available across the site — keep in sync with the filter
// buttons on the /gallery page and translations.filter_* in script.js.
window.RC_PHOTO_CATEGORIES = [
  { value: 'studio', label_en: 'Studio', label_sr: 'Studio' },
  { value: 'editorial', label_en: 'Editorial', label_sr: 'Editorijal' },
  { value: 'stage', label_en: 'Stage Makeup', label_sr: 'Scenska šminka' },
  { value: 'events', label_en: 'Events', label_sr: 'Događaji' },
  { value: 'location', label_en: 'On Location', label_sr: 'Na terenu' },
  { value: 'horses', label_en: 'With Horses', label_sr: 'Sa konjima' },
];
