const assert = require('assert');
const fs = require('fs');
const vm = require('vm');
const { URL } = require('url');

const root = fs.readFileSync('index.html', 'utf8');
const inside = fs.readFileSync('tutors/index.html', 'utf8');
const accountChrome = fs.readFileSync(
  'shared/atlas-account-chrome.js',
  'utf8'
);
const returnHandoff = fs.readFileSync(
  'shared/atlas-return-handoff.js',
  'utf8'
);
const accountPage = fs.readFileSync(
  'account/index.html',
  'utf8'
);
const accountRuntime = fs.readFileSync(
  'shared/atlas-account.js',
  'utf8'
);
const subjectDeepLink = fs.readFileSync(
  'compass/odyssey-worth-the-hype/index.html',
  'utf8'
);
const gameDeepLink = fs.readFileSync(
  'arcade/truth-trap/index.html',
  'utf8'
);

const antiFlashMarker =
  '<!-- Anti-flash: apply the active session theme before first paint. -->';
const markerIndex = root.indexOf(antiFlashMarker);
const scriptStart = root.indexOf('<script>', markerIndex);
const scriptEnd = root.indexOf('</script>', scriptStart);

assert.ok(
  markerIndex >= 0 &&
  scriptStart > markerIndex &&
  scriptEnd > scriptStart,
  'Root first-paint routing script must remain discoverable'
);

const rootRoutingCode = root.slice(
  scriptStart + '<script>'.length,
  scriptEnd
);

function storage(initial = {}) {
  const values = new Map(Object.entries(initial));

  return {
    getItem(key) {
      return values.has(key)
        ? values.get(key)
        : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
    snapshot() {
      return Object.fromEntries(values);
    }
  };
}

function runRootCase({
  href = 'https://atlasfortutors.com/',
  local = {},
  session = {}
} = {}) {
  const current = new URL(href);
  const localStorage = storage(local);
  const sessionStorage = storage(session);
  const dataset = {};
  const replaceCalls = [];
  const replaceStateCalls = [];

  const window = {
    location: {
      href: current.href,
      search: current.search,
      hash: current.hash,
      replace(value) {
        replaceCalls.push(value);
      }
    },
    history: {
      replaceState(...args) {
        replaceStateCalls.push(args);
      }
    },
    CSS: {
      registerProperty() {}
    }
  };

  const document = {
    documentElement: {
      dataset
    }
  };

  vm.runInNewContext(
    rootRoutingCode,
    {
      window,
      document,
      localStorage,
      sessionStorage,
      CSS: window.CSS,
      URL
    }
  );

  return {
    dataset,
    local: localStorage.snapshot(),
    replaceCalls,
    replaceStateCalls
  };
}

// 1) First anonymous generic root: Welcome owns first paint.
{
  const result = runRootCase();

  assert.strictEqual(
    result.dataset.atlasWelcome,
    undefined
  );
  assert.deepStrictEqual(
    result.replaceCalls,
    []
  );
}

// 2) Welcome passed but product not entered: Inside Atlas owns generic root.
{
  const result = runRootCase({
    local: {
      'atlas::welcomeSeen:v1': '1',
      'atlas::publicEntryStage:v1': 'inside'
    }
  });

  assert.deepStrictEqual(
    result.replaceCalls,
    ['./tutors/']
  );
  assert.strictEqual(
    result.dataset.atlasWelcome,
    undefined
  );
}

// 3) Returning anonymous product user: Hub owns generic root.
{
  const result = runRootCase({
    local: {
      'atlas::welcomeSeen:v1': '1',
      'atlas::publicEntryStage:v1': 'product'
    }
  });

  assert.strictEqual(
    result.dataset.atlasWelcome,
    'seen'
  );
  assert.deepStrictEqual(
    result.replaceCalls,
    []
  );
}

// 4) Explicit product entry marks the product stage and scrubs the routing hint.
{
  const result = runRootCase({
    href:
      'https://atlasfortutors.com/?entry=product&utm_source=inside'
  });

  assert.strictEqual(
    result.local['atlas::publicEntryStage:v1'],
    'product'
  );
  assert.strictEqual(
    result.local['atlas::welcomeSeen:v1'],
    '1'
  );
  assert.strictEqual(
    result.dataset.atlasWelcome,
    'seen'
  );
  assert.strictEqual(
    result.replaceStateCalls[0]?.[2],
    '/?utm_source=inside'
  );
}

// 5) Returning authenticated tutors bypass acquisition entry.
{
  const result = runRootCase({
    local: {
      'sb-jnhjfpagectprceswvqn-auth-token':
        JSON.stringify({
          currentSession: {
            user: {
              id: 'user_123'
            }
          }
        })
    }
  });

  assert.strictEqual(
    result.dataset.atlasWelcome,
    'seen'
  );
  assert.strictEqual(
    result.local['atlas::publicEntryStage:v1'],
    'product'
  );
}

// Legacy welcomeSeen meant Hub entry before public-entry stages existed.
{
  const result = runRootCase({
    local: {
      'atlas::welcomeSeen:v1': '1'
    }
  });

  assert.strictEqual(
    result.dataset.atlasWelcome,
    'seen'
  );
  assert.strictEqual(
    result.local['atlas::publicEntryStage:v1'],
    'product'
  );
}

// Malformed/stale auth storage cannot override a valid public-entry stage.
{
  const result = runRootCase({
    local: {
      'atlas::publicEntryStage:v1': 'product',
      'sb-jnhjfpagectprceswvqn-auth-token':
        '{malformed-json'
    }
  });

  assert.strictEqual(
    result.dataset.atlasWelcome,
    'seen'
  );
}

// Every deliberate exit from Inside Atlas marks real product entry.
assert.match(
  inside,
  /href="\/\?entry=product" data-atlas-product-entry/
);
assert.match(
  inside,
  /href="\.\.\/compass\/index\.html" data-atlas-product-entry/
);
assert.match(
  inside,
  /href="\.\.\/arcade\/index\.html" data-atlas-product-entry/
);
assert.match(
  inside,
  /function markProductEntered\(\)[\s\S]*?atlas::publicEntryStage:v1[\s\S]*?product/
);
assert.match(
  accountChrome,
  /atlas-inside-account-explore" href="\/\?entry=product" data-atlas-product-entry/
);

// 6) Direct resources are their own destinations; generic Welcome is root-only.
assert.doesNotMatch(
  subjectDeepLink,
  /atlas-welcome-screen/
);
assert.doesNotMatch(
  gameDeepLink,
  /atlas-welcome-screen/
);
assert.match(
  subjectDeepLink,
  /\.\/subject-data\.js/
);
assert.match(
  gameDeepLink,
  /Truth Trap/
);

// 7) Auth return uses validated return intent and never resumes during recovery.
assert.match(
  returnHandoff,
  /accountState\?\.recovery/
);
assert.match(
  returnHandoff,
  /queueResume\?\.\(id\)[\s\S]*?window\.location\.replace\(intent\.destination\)/
);

// Account rendering must resolve recovery before ordinary authenticated handoff.
const recoveryBranchIndex = accountPage.indexOf(
  'if (state.authenticated && state.recovery)'
);
const authBranchIndex = accountPage.indexOf(
  'if (state.authenticated) {',
  recoveryBranchIndex + 1
);
const handoffIndex = accountPage.indexOf(
  'AtlasReturnHandoff.resumeIfAuthenticated(state)',
  authBranchIndex
);

assert.ok(
  recoveryBranchIndex >= 0 &&
  authBranchIndex > recoveryBranchIndex &&
  handoffIndex > authBranchIndex,
  'Recovery must own the account surface before normal auth return handoff'
);

assert.match(
  accountRuntime,
  /function accountReturnUrl[\s\S]*?url\.searchParams\.set\('ri', intentId\)/
);
assert.match(
  accountRuntime,
  /async function createAccount[\s\S]*?accountReturnUrl\(\{ returnIntentId \}\)/
);
assert.match(
  accountRuntime,
  /async function completePasswordRecovery[\s\S]*?writeRecoveryHint\(false\)[\s\S]*?recovery: false/
);

console.log(
  'Batch 4.2 deterministic routing contract passed: generic root states are explicit, legacy state migrates safely, direct resources bypass acquisition, auth return preserves intent, and recovery stays distinct.'
);
