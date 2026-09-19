const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { URL } = require('url');

const compassCatalog = fs.readFileSync(
  'shared/compass-catalog-data.js',
  'utf8'
);
const arcadeCatalog = fs.readFileSync(
  'shared/arcade-catalog-data.js',
  'utf8'
);
const resourceShare = fs.readFileSync(
  'shared/atlas-resource-share.js',
  'utf8'
);
const compassEngine = fs.readFileSync(
  'compass/shared/compass-engine.js',
  'utf8'
);
const arcadeAccess = fs.readFileSync(
  'arcade/shared/arcade-public-access.js',
  'utf8'
);
const tomorrow = fs.readFileSync(
  'arcade/tomorrow-got-weird/index.html',
  'utf8'
);
const wouldYouRather = fs.readFileSync(
  'arcade/would-you-rather/index.html',
  'utf8'
);

function storage() {
  const values = new Map();

  return {
    getItem(key) {
      return values.has(key)
        ? values.get(key)
        : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    snapshot() {
      return Object.fromEntries(values);
    }
  };
}

function makeRuntime(
  href = 'https://atlasfortutors.com/'
) {
  const localStorage = storage();
  const window = {
    location: new URL(href),
    localStorage
  };

  const context = {
    window,
    localStorage,
    URL
  };

  vm.runInNewContext(
    compassCatalog,
    context
  );
  vm.runInNewContext(
    arcadeCatalog,
    context
  );
  vm.runInNewContext(
    resourceShare,
    context
  );

  return {
    window,
    localStorage
  };
}

// Normal anonymous catalog access stays exactly as configured.
{
  const runtime = makeRuntime();

  const fullSubjects =
    runtime.window.CompassCatalogData
      .getCompassSubjects()
      .filter(subject =>
        subject.publicAccess === 'full'
      )
      .map(subject => subject.id)
      .sort();

  assert.deepStrictEqual(
    fullSubjects,
    [
      'business-meetings-clear-updates',
      'octopuses-change-colour',
      'odyssey-worth-the-hype',
      'words-that-stick'
    ]
  );

  const fullGames =
    runtime.window.ArcadeCatalogData
      .getArcadeGames()
      .filter(game =>
        game.publicAccess === 'full'
      )
      .map(game => game.registryId);

  assert.deepStrictEqual(
    fullGames,
    ['arcade:truth-trap']
  );
}

// A valid subject share grant unlocks that exact subject only.
{
  const runtime = makeRuntime();
  const grant =
    runtime.window.CompassCatalogData
      .getCompassSubjectShareGrant(
        'food-table'
      );

  assert.ok(grant);

  runtime.window.location = new URL(
    'https://atlasfortutors.com/compass/food-table/' +
    '?share=' + encodeURIComponent(grant) +
    '&utm_source=direct'
  );

  assert.strictEqual(
    runtime.window.AtlasResourceShare
      .accept({
        world: 'compass',
        resourceId: 'food-table'
      }),
    true
  );

  assert.strictEqual(
    runtime.window.AtlasResourceShare
      .isGranted({
        world: 'compass',
        resourceId: 'work-purpose'
      }),
    false
  );

  assert.deepStrictEqual(
    runtime.localStorage.snapshot(),
    {
      'atlas::welcomeSeen:v1': '1',
      'atlas::publicEntryStage:v1':
        'product'
    }
  );
}

// A valid Arcade share grant unlocks only its promised game.
{
  const runtime = makeRuntime();
  const grant =
    runtime.window.ArcadeCatalogData
      .getArcadeGameShareGrant(
        'arcade:tomorrow-got-weird'
      );

  assert.ok(grant);

  runtime.window.location = new URL(
    'https://atlasfortutors.com/arcade/tomorrow-got-weird/' +
    '?share=' + encodeURIComponent(grant)
  );

  assert.strictEqual(
    runtime.window.AtlasResourceShare
      .accept({
        world: 'arcade',
        resourceId:
          'arcade:tomorrow-got-weird'
      }),
    true
  );

  assert.strictEqual(
    runtime.window.AtlasResourceShare
      .isGranted({
        world: 'arcade',
        resourceId:
          'arcade:would-you-rather'
      }),
    false
  );
}

// Atlas can build a direct resource URL without changing default access.
{
  const runtime = makeRuntime();

  const url =
    runtime.window.AtlasResourceShare
      .buildShareUrl({
        world: 'compass',
        resourceId: 'game-theory',
        launchUrl:
          '/compass/game-theory/'
      });

  const parsed = new URL(url);

  assert.strictEqual(
    parsed.pathname,
    '/compass/game-theory/'
  );

  assert.strictEqual(
    parsed.searchParams.get('share'),
    runtime.window.CompassCatalogData
      .getCompassSubjectShareGrant(
        'game-theory'
      )
  );
}

// The real Compass and Arcade preview decisions consume the shared grant.
assert.match(
  compassEngine,
  /function hasCompassShareGrant\(\)[\s\S]*?AtlasResourceShare[\s\S]*?world: 'compass'[\s\S]*?resourceId: MODULE\.id/
);
assert.match(
  compassEngine,
  /getCompassSubjectPublicAccess\(\) !== 'full'[\s\S]*?!hasCompassShareGrant\(\)[\s\S]*?!hasCompassAccountSession\(\)/
);
assert.match(
  arcadeAccess,
  /function hasSharedResourceGrant[\s\S]*?AtlasResourceShare[\s\S]*?world: 'arcade'[\s\S]*?resourceId: registryId/
);
assert.match(
  arcadeAccess,
  /getPublicAccess\(registryId\) ===[\s\S]*?'preview'[\s\S]*?!hasSharedResourceGrant\(registryId\)/
);

// Auth interruption still preserves the exact shared resource URL.
assert.match(
  compassEngine,
  /destination: window\.location\.href/
);
assert.match(
  arcadeAccess,
  /destination:[\s\S]*?window\.location\.href/
);

// Preview games load the scoped grant runtime before enforcing public access.
for (const page of [
  tomorrow,
  wouldYouRather
]) {
  const catalogIndex = page.indexOf(
    '../../shared/arcade-catalog-data.js'
  );
  const shareIndex = page.indexOf(
    '../../shared/atlas-resource-share.js'
  );
  const accessIndex = page.indexOf(
    '../shared/arcade-public-access.js'
  );

  assert.ok(
    catalogIndex >= 0 &&
    shareIndex > catalogIndex &&
    accessIndex > shareIndex,
    'Arcade shared-resource access must load after catalog identity and before public-access enforcement'
  );
}

assert.doesNotMatch(
  resourceShare,
  /unlock=true/
);

console.log(
  'Batch 4.3 shared-resource contract passed: direct share grants unlock only the promised subject/game, normal anonymous catalog access remains unchanged, and ownership/auth boundaries stay intact.'
);
