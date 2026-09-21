'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const pricing = fs.readFileSync('pricing/index.html', 'utf8');
const inside = fs.readFileSync('tutors/index.html', 'utf8');

assert.match(pricing, /https:\/\/atlasfortutors\.com\/pricing\//);
assert.match(pricing, /Atlas Free/);
assert.match(pricing, /Atlas Pro/);
assert.match(pricing, /\$12/);
assert.match(pricing, /USD \/ month/);
assert.match(pricing, /8 fresh AI-built subjects/);
assert.match(pricing, /100 fresh AI-built subjects each month/);
assert.match(pricing, /Unlimited learners/);
assert.match(pricing, /Compass \+ Arcade/);
assert.match(pricing, /Your saved work remains yours if you cancel/);
assert.match(pricing, /unused Free creation bank stays preserved/);
assert.match(pricing, /AI-assisted shaping of existing subjects/);
assert.match(pricing, /failed, incomplete or malformed build does not use the allowance/);
assert.match(pricing, /href="\/refunds\/"/);
assert.match(pricing, /href="\/terms\/"/);
assert.match(pricing, /href="\/privacy\/"/);

assert.match(
  inside,
  /class="footer-links"[\s\S]*?href="\/pricing\/"[\s\S]*?href="\/privacy\/"[\s\S]*?href="\/terms\/"[\s\S]*?href="\/refunds\//,
  'Pricing should be discoverable after the Inside Atlas experience.'
);

console.log(
  'Atlas pricing contract passed: Free/Pro commercial facts, ownership promises, and post-experience discovery are present.'
);
