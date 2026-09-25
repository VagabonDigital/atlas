'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const html = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');
const hubCss = fs.readFileSync('shared/atlas-hub.css', 'utf8').replace(/\r\n/g, '\n');
const compassHtml = fs.readFileSync('compass/index.html', 'utf8').replace(/\r\n/g, '\n');
const arcadeHtml = fs.readFileSync('arcade/index.html', 'utf8').replace(/\r\n/g, '\n');
const insideHtml = fs.readFileSync('tutors/index.html', 'utf8').replace(/\r\n/g, '\n');

assert.match(
  html,
  /--atlas-continue-fluid-size'[\s\S]*width \* 0\.025/,
  'Atlas must snapshot fluid Hub type from the stable layout viewport width'
);
assert.match(
  html,
  /--atlas-mobile-welcome-fluid-size'[\s\S]*width \* 0\.08/
);
assert.match(
  html,
  /atlas-hub\.css\?v=20260922-fluid-type1/
);
assert.match(
  hubCss,
  /\.welcome-line \{ font-size: clamp\(2\.25rem, var\(--atlas-welcome-fluid-size\), 3\.4rem\);/
);
assert.match(
  hubCss,
  /\.continue-title \{ font-size: clamp\(1\.7rem, var\(--atlas-continue-fluid-size\), 2\.35rem\);/
);
assert.match(
  hubCss,
  /\.door-title \{ font-size: clamp\(2rem, var\(--atlas-door-fluid-size\), 2\.65rem\);/
);
assert.match(
  hubCss,
  /\.welcome-line \{ font-size: clamp\(2rem, var\(--atlas-mobile-welcome-fluid-size\), 2\.65rem\); \}/
);

assert.match(
  html,
  /--chrome-surface:\s*rgba\(243, 240, 233, 0\.72\);[\s\S]*?--chrome-surface-mobile:\s*rgba\(243, 240, 233, 0\.72\);/,
  'Atlas desktop and mobile chrome must use the canonical 72% glass opacity.'
);
assert.match(
  html,
  /--chrome-surface:\s*rgba\(27, 29, 28, 0\.72\);[\s\S]*?--chrome-surface-mobile:\s*rgba\(27, 29, 28, 0\.72\);/,
  'Atlas night chrome must use the same canonical 72% glass opacity.'
);
assert.match(
  html,
  /\.spine \{[\s\S]*?backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);/
);
assert.match(
  html,
  /\.mobile-header \{[\s\S]*?backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);/
);

assert.match(
  compassHtml,
  /--chrome-surface:\s*rgba\(247, 244, 238, 0\.72\);[\s\S]*?--chrome-surface-mobile:\s*rgba\(247, 244, 238, 0\.72\);/,
  'Compass must preserve its palette while using the canonical 72% glass opacity.'
);
assert.match(
  compassHtml,
  /--chrome-surface:\s*rgba\(34, 31, 27, 0\.72\);[\s\S]*?--chrome-surface-mobile:\s*rgba\(34, 31, 27, 0\.72\);/,
  'Compass night chrome must use the same canonical 72% glass opacity.'
);
assert.match(
  compassHtml,
  /\.spine \{[\s\S]*?backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);/
);
assert.match(
  compassHtml,
  /\.mobile-header \{[\s\S]*?backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);/
);

assert.match(
  arcadeHtml,
  /--chrome-surface:\s*rgba\(251, 246, 240, 0\.72\);[\s\S]*?--chrome-surface-mobile:\s*rgba\(251, 246, 240, 0\.72\);/,
  'Arcade must preserve its palette while using the canonical 72% glass opacity.'
);
assert.match(
  arcadeHtml,
  /--chrome-surface:\s*rgba\(26, 22, 28, 0\.72\);[\s\S]*?--chrome-surface-mobile:\s*rgba\(26, 22, 28, 0\.72\);/,
  'Arcade night chrome must use the same canonical 72% glass opacity.'
);
assert.match(
  arcadeHtml,
  /\.spine \{[\s\S]*?backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);/
);
assert.match(
  arcadeHtml,
  /\.mobile-header \{[\s\S]*?backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);/
);

assert.match(
  insideHtml,
  /\.site-header \{[\s\S]*?background:\s*color-mix\(in srgb, var\(--surface-canvas\) 72%, transparent\);[\s\S]*?backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);[\s\S]*?-webkit-backdrop-filter:\s*blur\(16px\) saturate\(1\.1\);/,
  'Inside Atlas remains the canonical header-glass reference.'
);
// Compile every inline script as well as exercising the actual selectors.
for (const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)) new vm.Script(match[1]);
execFileSync(process.execPath, ['scripts/sync-compass-covers.js', '--check'], { stdio: 'inherit' });
let registry = { items: {}, sessionStates: {}, recentActivity: [] };
let snapshot = null;
const window = { location: { href: 'https://atlas.test/' }, AtlasCloudCache: { getCompassPresentationSnapshot: () => snapshot } };
const context = vm.createContext({ window, console, URL, Date, COMPASS_ID: 'compass', ARCADE_ID: 'arcade',
  getRegistry: () => registry, getStoredPresentationUserId: () => 'tutor-a',
  WORLDS: { compass: { name: 'Compass' }, arcade: { name: 'Arcade' } }
});
for (const file of ['shared/atlas-structured-subject.js', 'shared/compass-catalog-data.js', 'shared/arcade-catalog-data.js']) {
  vm.runInContext(fs.readFileSync(file, 'utf8'), context);
}
Object.assign(context, { AtlasStructuredSubject: window.AtlasStructuredSubject, CompassCatalog: window.CompassCatalogData, ArcadeCatalog: window.ArcadeCatalogData });
vm.runInContext(html.slice(html.indexOf('    function getContinueItem('), html.indexOf('    // ================================================================\n    // APPEARANCE')), context);
vm.runInContext(html.slice(html.indexOf('    const GAME_COVERS'), html.indexOf('    function toggleContinueRecapFromButton')), context);
const sourceTravel = window.CompassCatalogData.getCompassCatalogMap()['compass:travel-exploration'];
const travel = { ...sourceTravel, world: 'compass', status: 'in-progress', progress: { explored: 2, total: 24 }, lastTouchedAt: 50 };
const arcade = { registryId: 'arcade:truth-trap', world: 'arcade', title: 'Truth Trap', launchUrl: '/arcade/truth-trap/', status: 'in-progress', progress: { covered: 3, total: 20 }, lastTouchedAt: 70 };
registry.items[travel.registryId] = sourceTravel;
registry.items[arcade.registryId] = arcade;
registry.sessionStates.yasmin = { [travel.registryId]: travel, [arcade.registryId]: arcade };
assert.equal(context.getContinueItem(registry, 'yasmin').registryId, arcade.registryId);
assert.equal(context.getContinueItem(registry, 'default'), null, 'Shared must not inherit named-learner continuity');
arcade.status = 'complete';
assert.equal(context.getContinueItem(registry, 'yasmin').registryId, travel.registryId);
arcade.status = 'in-progress'; arcade.progress.covered = 0;
assert.equal(context.getContinueItem(registry, 'yasmin').registryId, travel.registryId, 'An opened game is not meaningful progress');
assert.equal(context.continueCoverage(travel), 8);
assert.equal(context.getHubItemCover({ ...travel, coverImage: undefined }), sourceTravel.coverImage);
registry.items[travel.registryId] = { ...sourceTravel, coverImage: 'https://atlas.test/my-version.jpg', hasMyVersion: true };
assert.equal(context.getHubItemCover(travel), 'https://atlas.test/my-version.jpg', 'Published My Version identity wins');
const owned = { id: 'owned', registryId: 'compass:owned', world: 'compass', ownershipKind: 'my-subject', coverImage: 'https://atlas.test/old.jpg' };
snapshot = { userId: 'tutor-a', summaries: [{ id: 'owned', metadata: { coverImage: 'https://atlas.test/current.jpg' } }] };
assert.equal(context.getHubItemCover(owned), 'https://atlas.test/current.jpg');
snapshot.userId = 'tutor-b';
assert.equal(context.getHubItemCover(owned), owned.coverImage, 'Do not use another account cache');
snapshot = null;
const fallback = window.AtlasStructuredSubject.resolveCoverImage();
assert.equal(context.getHubItemCover({ ...owned, coverImage: '' }), fallback);
assert.equal(window.AtlasStructuredSubject.resolveCoverImage({ document: { module: { bgImage: 'document.jpg' } }, metadata: { coverImage: 'metadata.jpg' } }), 'document.jpg');
registry.recentActivity = [
  { sessionId: 'yasmin', registryId: travel.registryId, timestamp: 90 },
  { sessionId: 'default', registryId: arcade.registryId, timestamp: 100 },
  { sessionId: 'yasmin', registryId: arcade.registryId, timestamp: 80 },
  { sessionId: 'yasmin', registryId: arcade.registryId, timestamp: 70 },
  { sessionId: 'yasmin', registryId: 'compass:missing', timestamp: 60 }
];
const recent = context.getRecentHubItems(registry, 'yasmin', travel);
assert.equal(recent.length, 1);
assert.equal(recent[0].registryId, arcade.registryId);
assert.equal(recent[0].timestamp, 80);
assert.equal(context.getHubItemCover(arcade), './assets/hub/truth-trap.webp');
console.log('Atlas Hub continuity, cover identity, account isolation, and Recent Activity checks passed.');

