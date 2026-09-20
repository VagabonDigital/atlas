'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const atlas = fs.readFileSync('index.html', 'utf8');
const inside = fs.readFileSync('tutors/index.html', 'utf8');
const privacy = fs.readFileSync('privacy/index.html', 'utf8');
const terms = fs.readFileSync('terms/index.html', 'utf8');
const css = fs.readFileSync('shared/atlas-legal.css', 'utf8');

assert.match(
  atlas,
  /class="atlas-welcome-screen"[\s\S]*?href="\/privacy\/"[\s\S]*?href="\/terms\/"[\s\S]*?<\/section>/,
  'Fresh public entry must expose Privacy and Terms without sign-in.'
);
assert.match(
  atlas,
  /class="drawer-legal-links"[\s\S]*?href="\/privacy\/"[\s\S]*?href="\/terms\/"/,
  'Atlas product navigation must retain legal links after entry.'
);
assert.match(
  inside,
  /class="footer-links"[\s\S]*?href="\/privacy\/"[\s\S]*?href="\/terms\/"[\s\S]*?support@atlasfortutors\.com/,
  'Inside Atlas must expose Privacy, Terms, and Support publicly.'
);

assert.match(
  privacy,
  /https:\/\/atlasfortutors\.com\/privacy\//
);
assert.match(
  privacy,
  /Google Sign-In information/
);
assert.match(
  privacy,
  /openid/
);
assert.match(
  privacy,
  /does not request access to your Gmail, Google Drive, Google Calendar/
);
assert.match(
  privacy,
  /Google account data is used only to support account sign-in and account identity/
);
assert.match(
  privacy,
  /does not sell Google user data/
);
assert.match(
  privacy,
  /Supabase/
);
assert.match(
  privacy,
  /Google Analytics/
);
assert.match(
  privacy,
  /Cloudflare/
);
assert.match(
  privacy,
  /OpenAI/
);
assert.match(
  privacy,
  /Pexels and Serper/
);
assert.match(
  privacy,
  /does not currently provide a self-service “Delete account” button/
);
assert.match(
  privacy,
  /support@atlasfortutors\.com/
);

assert.match(
  terms,
  /https:\/\/atlasfortutors\.com\/terms\//
);
assert.match(
  terms,
  /you retain the rights you already have/
);
assert.match(
  terms,
  /AI output can be incomplete, inaccurate, outdated, biased, or unsuitable/
);
assert.match(
  terms,
  /Atlas does not give Atlas access to Gmail|Using Google Sign-In does not give Atlas access to Gmail/
);
assert.match(
  terms,
  /support@atlasfortutors\.com/
);
assert.match(
  terms,
  /Nothing in these Terms limits liability that cannot lawfully be limited/
);

assert.match(
  privacy,
  /atlas-legal\.css\?v=20260920-legal1/
);
assert.match(
  terms,
  /atlas-legal\.css\?v=20260920-legal1/
);
assert.match(
  css,
  /\.legal-main/
);
assert.match(
  css,
  /\.legal-footer-links/
);

console.log(
  'Atlas legal-page contract passed: public discovery, Google-data disclosure, support contact, ownership, and AI terms are present.'
);
