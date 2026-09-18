const assert = require('assert');
const fs = require('fs');

const root = fs.readFileSync('index.html', 'utf8');
const inside = fs.readFileSync('tutors/index.html', 'utf8');

assert.match(
  root,
  /window\.location\.replace\(\s*'\.\/tutors\/'/
);

assert.match(
  root,
  /searchParams\.get\('entry'\) === 'product'[\s\S]*?atlas::welcomeSeen:v1[\s\S]*?dataset\.atlasWelcome =[\s\S]*?'seen'/
);

assert.doesNotMatch(
  root,
  /For tutors · Pilot|help shape what comes next/
);

assert.doesNotMatch(
  inside,
  /The Atlas Pilot|Buy us a coffee|buymeacoffee|shareAtlas|href="#early">Story|id="early"/
);

assert.match(
  inside,
  /atlas-inside-account-explore" href="\/\?entry=product">Explore Atlas/
);

assert.match(
  inside,
  /hero-actions[\s\S]*?href="\/\?entry=product">Explore Atlas/
);

assert.match(
  inside,
  /href="\.\.\/compass\/index\.html">Explore Compass/
);

assert.match(
  inside,
  /href="\.\.\/arcade\/index\.html">Explore Arcade/
);

assert.match(
  inside,
  /product-entry-final[\s\S]*?href="\/\?entry=product">Explore Atlas/
);

assert.match(
  inside,
  /href="\.\/feedback\.html">Message Atlas<\/a>/
);

const createIndex = inside.indexOf('<strong>Create</strong>');
const shapeIndex = inside.indexOf('<strong>Shape</strong>');
const teachIndex = inside.indexOf('<strong>Teach</strong>');

assert.ok(
  createIndex >= 0 &&
  shapeIndex > createIndex &&
  teachIndex > shapeIndex,
  'Inside Atlas should present Create → Shape → Teach in that order'
);

console.log(
  'Stage 4.1 public-entry contract passed: generic first visits route through Inside Atlas, public pilot/story framing is removed, and product exits are obvious and contextual.'
);
