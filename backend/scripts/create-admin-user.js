// One-off script: creates the single Supabase Auth user allowed to log into /admin.
// Uses the secret key (service role), so it must run server-side only — never in the browser.
// Usage: node backend/scripts/create-admin-user.js
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY || !ADMIN_EMAIL) {
  console.error('Missing SUPABASE_URL, SUPABASE_SECRET_KEY or ADMIN_EMAIL in backend/.env');
  process.exit(1);
}

function generatePassword() {
  // 20 chars, URL-safe alphabet, crypto-random.
  return crypto.randomBytes(15).toString('base64').replace(/[+/=]/g, '').slice(0, 20);
}

async function main() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY);
  const password = generatePassword();

  const { data: existing } = await supabase.auth.admin.listUsers();
  const alreadyExists = existing?.users?.find((u) => u.email === ADMIN_EMAIL);

  if (alreadyExists) {
    const { error } = await supabase.auth.admin.updateUserById(alreadyExists.id, { password });
    if (error) throw error;
    console.log('Admin user already existed — password reset.');
  } else {
    const { error } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password,
      email_confirm: true,
    });
    if (error) throw error;
    console.log('Admin user created.');
  }

  console.log('\n=== /admin login ===');
  console.log('Email:   ', ADMIN_EMAIL);
  console.log('Password:', password);
  console.log('=====================\n');
}

main().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});
