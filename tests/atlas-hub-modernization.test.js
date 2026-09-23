'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const html = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');
const hubCss = fs.readFileSync('shared/atlas-hub.css', 'utf8').replace(/\r\n/g, '\n');

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
  /atlas-hub\.css\?v=20260922-hover-motion1/
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
  /--atlas-card-hover-motion: 240ms cubic-bezier\(0\.22, 1, 0\.36, 1\);/,
  'Atlas card movement must use one compositor-friendly motion contract'
);
assert.match(
  hubCss,
  /\.door \{[\s\S]*?transition:\s*\n\s*transform var\(--atlas-card-hover-motion\),\s*\n\s*border-color var\(--atlas-card-hover-fade\);/,
  'Atlas door hover must not animate box-shadow'
);
assert.match(
  hubCss,
  /\.compass-needle-group,\s*\n\.arcade-stick-group,\s*\n\.arcade-button--one \{ transition: transform var\(--atlas-card-hover-motion\); \}/,
  'Atlas card illustration movement must settle with the card'
);
assert.match(
  hubCss,
  /\.door:hover, \.door:focus-visible \{ transform: translateY\(-3px\); box-shadow: var\(--home-shadow\); \}/,
  'Atlas door shadow must remain raster-stable during hover movement'
);
assert.match(
  hubCss,
  /\.welcome-line \{ font-size: clamp\(2rem, var\(--atlas-mobile-welcome-fluid-size\), 2\.65rem\); \}/
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

