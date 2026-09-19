const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { URL } = require('url');

const compassCatalogSource = fs.readFileSync(
  'shared/compass-catalog-data.js',
  'utf8'
);

const arcadeCatalogSource = fs.readFileSync(
  'shared/arcade-catalog-data.js',
  'utf8'
);

const resourceShareSource = fs.readFileSync(
  'shared/atlas-resource-share.js',
  'utf8'
);

const ownedSubjectLoaderSource = fs.readFileSync(
  'compass/shared/compass-subject-loader.js',
  'utf8'
);

const ownedSubjectPageSource = fs.readFileSync(
  'compass/subject/index.html',
  'utf8'
);

const notFoundSource = fs.readFileSync(
  '404.html',
  'utf8'
);

function loadCatalogues(
  href = 'https://atlasfortutors.com/'
) {
  const localStorage = new Map();

  const window = {
    location: new URL(href),
    localStorage: {
      getItem(key) {
        return localStorage.has(key)
          ? localStorage.get(key)
          : null;
      },
      setItem(key, value) {
        localStorage.set(
          key,
          String(value)
        );
      }
    }
  };

  const context = {
    window,
    URL
  };

  vm.runInNewContext(
    compassCatalogSource,
    context
  );

  vm.runInNewContext(
    arcadeCatalogSource,
    context
  );

  vm.runInNewContext(
    resourceShareSource,
    context
  );

  return window;
}

function normalizeRepoPath(value) {
  return String(value || '')
    .replace(/^\.\//, '')
    .replace(/^\/+/, '');
}

// Every Compass item advertised as available owns a real direct file.
{
  const window = loadCatalogues();

  const subjects =
    window.CompassCatalogData
      .getCompassSubjects()
      .filter(subject =>
        subject.status === 'available'
      );

  assert.ok(
    subjects.length > 0,
    'Compass must expose available subjects'
  );

  subjects.forEach(subject => {
    const expected =
      'compass/' +
      subject.id +
      '/index.html';

    assert.strictEqual(
      normalizeRepoPath(
        subject.launchUrl
      ),
      expected,
      'Compass launch URL must resolve directly to its subject'
    );

    assert.ok(
      fs.existsSync(expected),
      'Missing Compass deep-link destination: ' +
        expected
    );
  });
}

// Every Arcade catalogue game owns a real direct file.
{
  const window = loadCatalogues();

  const games =
    window.ArcadeCatalogData
      .getArcadeGames();

  assert.ok(
    games.length > 0,
    'Arcade must expose games'
  );

  games.forEach(game => {
    const relative =
      normalizeRepoPath(
        game.launchUrl
      );

    const expected =
      'arcade/' + relative;

    assert.ok(
      relative.endsWith(
        '/index.html'
      ),
      'Arcade launch URL must resolve directly to the game'
    );

    assert.ok(
      fs.existsSync(expected),
      'Missing Arcade deep-link destination: ' +
        expected
    );
  });
}

// Shared grants fail closed and never change catalogue-wide access.
{
  const window = loadCatalogues();

  const foodGrant =
    window.CompassCatalogData
      .getCompassSubjectShareGrant(
        'food-table'
      );

  window.location = new URL(
    'https://atlasfortutors.com/compass/work-purpose/' +
    '?share=' +
    encodeURIComponent(foodGrant)
  );

  assert.strictEqual(
    window.AtlasResourceShare
      .isGranted({
        world: 'compass',
        resourceId: 'work-purpose'
      }),
    false,
    'A subject grant must not unlock a different subject'
  );

  window.location = new URL(
    'https://atlasfortutors.com/arcade/tomorrow-got-weird/' +
    '?share=malformed'
  );

  assert.strictEqual(
    window.AtlasResourceShare
      .isGranted({
        world: 'arcade',
        resourceId:
          'arcade:tomorrow-got-weird'
      }),
    false,
    'Malformed game grants must fail closed'
  );

  const food =
    window.CompassCatalogData
      .getCompassSubjects()
      .find(subject =>
        subject.id === 'food-table'
      );

  const tomorrow =
    window.ArcadeCatalogData
      .getArcadeGames()
      .find(game =>
        game.registryId ===
        'arcade:tomorrow-got-weird'
      );

  assert.strictEqual(
    food.publicAccess,
    'preview'
  );

  assert.strictEqual(
    tomorrow.publicAccess,
    'preview'
  );
}

// Account-owned subject deep links already fail deliberately.
assert.match(
  ownedSubjectLoaderSource,
  /This subject link isn’t available\./
);

assert.match(
  ownedSubjectLoaderSource,
  /This subject isn’t available\./
);

assert.match(
  ownedSubjectPageSource,
  /Back to Compass/
);

// Static bad/stale paths get an Atlas-owned failure surface.
assert.match(
  notFoundSource,
  /This subject isn’t available\./
);

assert.match(
  notFoundSource,
  /Explore Compass/
);

assert.match(
  notFoundSource,
  /This game isn’t available\./
);

assert.match(
  notFoundSource,
  /Explore Arcade/
);

assert.match(
  notFoundSource,
  /This Atlas page isn’t available\./
);

assert.match(
  notFoundSource,
  /\?entry=product/
);

// A missing resource must never be silently rerouted as if it existed.
assert.doesNotMatch(
  notFoundSource,
  /location\.(?:replace|assign)\s*\(/
);

assert.doesNotMatch(
  notFoundSource,
  /location\.href\s*=/
);

assert.doesNotMatch(
  notFoundSource,
  /http-equiv\s*=\s*["']refresh["']/i
);

console.log(
  'Batch 4.3B deep-link contract passed: every advertised Compass/Arcade resource owns a direct destination, scoped share grants fail closed, owned-subject links fail deliberately, and stale static links receive an honest Atlas 404.'
);
