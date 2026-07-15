// Public client config — safe to expose in the browser.
// The publishable key only allows what Row Level Security policies permit
// (public read on photos, insert only for logged-in admins). Never put the
// secret key here.
window.RC_SUPABASE_URL = 'https://vglrybegfjlcwhcdelog.supabase.co';
window.RC_SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_Dvjk1pEX3hb7Q7AkIqoGTw_VDjfWnlT';

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
