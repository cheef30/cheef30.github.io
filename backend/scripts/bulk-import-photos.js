// One-off script: bulk-uploads a local folder of pre-resized photos (grouped
// in subfolders named after categories) into Supabase Storage + the photos
// table, mirroring exactly what admin.js does for a single manual upload.
// Uses the secret key (service role), so it must run server-side only.
// Usage: node backend/scripts/bulk-import-photos.js <path-to-staging-folder>
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SECRET_KEY in backend/.env');
  process.exit(1);
}

const stagingRoot = process.argv[2];
if (!stagingRoot) {
  console.error('Usage: node backend/scripts/bulk-import-photos.js <path-to-staging-folder>');
  process.exit(1);
}

const CATEGORY_LABELS = {
  studio: 'Studio',
  editorial: 'Editorial',
  stage: 'Stage Makeup',
  events: 'Events',
  location: 'On Location',
  horses: 'With Horses',
};

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
  let uploaded = 0;
  let failed = 0;

  const categories = fs.readdirSync(stagingRoot).filter((name) =>
    fs.statSync(path.join(stagingRoot, name)).isDirectory()
  );

  for (const category of categories) {
    const label = CATEGORY_LABELS[category];
    if (!label) {
      console.warn(`Skipping unknown category folder: ${category}`);
      continue;
    }

    const dir = path.join(stagingRoot, category);
    const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = path.extname(file).slice(1).toLowerCase();
      const storagePath = `${category}/${crypto.randomUUID()}.${ext}`;
      const buffer = fs.readFileSync(path.join(dir, file));
      const n = String(i + 1).padStart(2, '0');
      const title = `${label} ${n}`;
      const altText = `${label} photography — Rotten Cherry Co.`;

      try {
        const { error: uploadError } = await supabase.storage.from('photos').upload(storagePath, buffer, {
          cacheControl: '3600',
          upsert: false,
          contentType: ext === 'png' ? 'image/png' : 'image/jpeg',
        });
        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage.from('photos').getPublicUrl(storagePath);

        const { error: insertError } = await supabase.from('photos').insert({
          image_url: publicUrlData.publicUrl,
          storage_path: storagePath,
          alt_text: altText,
          title,
          category,
        });
        if (insertError) throw insertError;

        uploaded++;
        console.log(`OK  ${category}/${file} -> ${storagePath}`);
      } catch (err) {
        failed++;
        console.error(`FAIL ${category}/${file}:`, err.message);
      }
    }
  }

  console.log(`\nDone. Uploaded: ${uploaded}, Failed: ${failed}`);
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
