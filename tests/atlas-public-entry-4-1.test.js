const assert = require('assert');
const fs = require('fs');

const root = fs.readFileSync('index.html', 'utf8');
const inside = fs.readFileSync('tutors/index.html', 'utf8');
const accountGate = fs.readFileSync(
  'shared/atlas-account-gate.js',
  'utf8'
);

assert.match(
  root,
  /function enterAtlasFromWelcome\(\)[\s\S]*?atlas::welcomeSeen:v1[\s\S]*?window\.location\.href = '\.\/tutors\/'/
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

assert.doesNotMatch(
  inside,
  /Message Atlas/
);

assert.match(
  inside,
  /Ready to try it\?[\s\S]*?Open Atlas, choose a subject or game, and use it in your next lesson\./
);


assert.match(
  inside,
  /Compass gives you substantial, structured subjects to teach through\.[\s\S]*?Arcade gives you conversation games[\s\S]*?Two distinct teaching worlds, ready when you are\./
);

assert.doesNotMatch(
  inside,
  /image-led subjects|library-authorship-demo|library-demo-card|libraryDemoPrev|libraryDemoNext/
);

assert.match(
  root,
  /See how Atlas works, create your own material, and keep each student’s lessons connected\./
);

assert.match(
  accountGate,
  /data-account-menu-feedback>Message Atlas<\/button>[\s\S]*?openFeedbackFromAccount/
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
  'Stage 4.1 public-entry contract passed: first-time Welcome routes into Inside Atlas, public pilot/story framing is removed, product exits are obvious, and signed-in tutors retain a shared Message Atlas route.'
);
