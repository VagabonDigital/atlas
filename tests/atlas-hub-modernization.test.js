'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const html = fs.readFileSync('index.html', 'utf8').replace(/\r\n/g, '\n');
assert.match(
  html,
  /html\.atlas-theme-snap[\s\S]*?transition:\s*none !important;/
);
assert.match(
  html,
  /root\.classList\.remove\('theme-changing'\)/
);
assert.match(
  html,
  /root\.classList\.remove\('atlas-theme-snap'\)/
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

