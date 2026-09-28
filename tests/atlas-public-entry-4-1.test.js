const assert = require('assert');
const fs = require('fs');

const root = fs.readFileSync('index.html', 'utf8');
const inside = fs.readFileSync('inside-atlas/index.html', 'utf8');
const accountGate = fs.readFileSync(
  'shared/atlas-account-gate.js',
  'utf8'
);

assert.match(
  root,
  /function enterAtlasFromWelcome\(\)[\s\S]*?atlas::welcomeSeen:v1[\s\S]*?window\.location\.href = '\.\/inside-atlas\/'/
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
  /atlas-inside-account-explore" href="\/\?entry=product"[\s\S]*?atlas-inside-account-explore-label">Explore Atlas/
);

assert.match(
  inside,
  /hero-actions[\s\S]*?href="\/\?entry=product"[^>]*>Explore Atlas/
);

assert.match(
  inside,
  /product-entry-final[\s\S]*?href="\/compass\/"[^>]*>Find a subject<[\s\S]*?href="\/arcade\/"[^>]*>Find a game</
);

assert.doesNotMatch(
  inside,
  /Message Atlas/
);

assert.match(
  inside,
  /Get your next lesson sorted[\s\S]*?If nothing fits, tell Atlas what your learner needs\./
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

assert.match(
  inside,
  /hero-lede[\s\S]*?Create or choose[\s\S]*?shape it around the learner[\s\S]*?return with context, language and momentum/
);

assert.match(
  inside,
  /power-rail[\s\S]*?<strong>Teach<\/strong>[\s\S]*?<strong>Create<\/strong>[\s\S]*?<strong>Remember<\/strong>/
);

console.log(
  'Stage 4.1 public-entry contract passed: first-time Welcome routes into Inside Atlas, public pilot/story framing is removed, product exits are obvious, and signed-in tutors retain a shared Message Atlas route.'
);
