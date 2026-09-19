'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { URL } = require('node:url');

function read(path) {
    return fs.readFileSync(
        path,
        'utf8'
    );
}

function exists(path) {
    return fs.existsSync(path);
}

const compassCatalogSource =
    read('shared/compass-catalog-data.js');

const arcadeCatalogSource =
    read('shared/arcade-catalog-data.js');

const resourceShareSource =
    read('shared/atlas-resource-share.js');

const returnIntentSource =
    read('shared/atlas-return-intent.js');

const returnHandoffSource =
    read('shared/atlas-return-handoff.js');

const bridgeSource =
    read('shared/atlas-bridge.js');

const atlasOriginalEntrySource =
    read('compass/shared/atlas-original-entry.js');

const atlasSearchSource =
    read('shared/atlas-search.js');

const rootSource =
    read('index.html');

const accountSource =
    read('shared/atlas-account.js');

const accountGateSource =
    read('shared/atlas-account-gate.js');

const accountPageSource =
    read('account/index.html');

const notFoundSource =
    read('404.html');

const frontendDeployConfig =
    JSON.parse(
        read('wrangler.atlas-web.jsonc')
    );

class FakeStorage {
    constructor() {
        this.values = new Map();
    }

    get length() {
        return this.values.size;
    }

    key(index) {
        return Array.from(
            this.values.keys()
        )[index] || null;
    }

    getItem(key) {
        return this.values.has(key)
            ? this.values.get(key)
            : null;
    }

    setItem(key, value) {
        this.values.set(
            key,
            String(value)
        );
    }

    removeItem(key) {
        this.values.delete(key);
    }
}

function makeCatalogRuntime(
    href =
        'https://atlasfortutors.com/'
) {
    const localStorage =
        new FakeStorage();

    const window = {
        location: new URL(href),
        localStorage
    };

    const context = {
        window,
        URL
    };

    vm.runInNewContext(
        compassCatalogSource,
        context,
        {
            filename:
                'shared/compass-catalog-data.js'
        }
    );

    vm.runInNewContext(
        arcadeCatalogSource,
        context,
        {
            filename:
                'shared/arcade-catalog-data.js'
        }
    );

    vm.runInNewContext(
        resourceShareSource,
        context,
        {
            filename:
                'shared/atlas-resource-share.js'
        }
    );

    return {
        window,
        localStorage
    };
}

function makeReturnRuntime(
    href =
        'https://atlasfortutors.com/'
) {
    const localStorage =
        new FakeStorage();

    const sessionStorage =
        new FakeStorage();

    let counter = 0;

    const window = {
        location: new URL(href),
        localStorage,
        sessionStorage,
        crypto: {
            randomUUID() {
                counter += 1;

                return (
                    '12345678-1234-1234-1234-' +
                    String(counter)
                        .padStart(12, '0')
                );
            }
        }
    };

    window.window = window;

    const context = {
        window,
        URL,
        Uint8Array,
        Date,
        Math,
        console
    };

    vm.runInNewContext(
        returnIntentSource,
        context,
        {
            filename:
                'shared/atlas-return-intent.js'
        }
    );

    return {
        window,
        context
    };
}

function installHandoff(
    runtime,
    href
) {
    const replacements = [];
    const historyUrls = [];

    runtime.window.location =
        new URL(href);

    runtime.window.location.replace =
        value => {
            replacements.push(value);
        };

    runtime.window.history = {
        replaceState(
            _state,
            _title,
            value
        ) {
            historyUrls.push(value);
        }
    };

    runtime.context.window =
        runtime.window;

    runtime.context.document = {
        title: 'Atlas Account'
    };

    vm.runInNewContext(
        returnHandoffSource,
        runtime.context,
        {
            filename:
                'shared/atlas-return-handoff.js'
        }
    );

    return {
        Handoff:
            runtime.window
                .AtlasReturnHandoff,
        replacements,
        historyUrls
    };
}

function getCatalogues() {
    const runtime =
        makeCatalogRuntime();

    return {
        compass:
            runtime.window
                .CompassCatalogData
                .getCompassSubjects(),
        arcade:
            runtime.window
                .ArcadeCatalogData
                .getArcadeGames()
    };
}

function testDirectResourceIntegrity() {
    const {
        compass,
        arcade
    } = getCatalogues();

    const availableCompass =
        compass.filter(subject =>
            subject.status ===
                'available'
        );

    assert.ok(
        availableCompass.length > 0
    );

    availableCompass.forEach(
        subject => {
            const expected =
                'compass/' +
                subject.id +
                '/index.html';

            assert.equal(
                subject.launchUrl,
                expected,
                'Compass catalog URL must be its real direct resource path.'
            );

            assert.ok(
                exists(expected),
                'Missing Compass destination: ' +
                    expected
            );

            assert.match(
                read(expected),
                /atlas-original-entry\.js/,
                'Atlas Original must use the shared entry runtime.'
            );
        }
    );

    arcade.forEach(game => {
        const relative =
            String(game.launchUrl || '')
                .replace(/^\.\//, '');

        const expected =
            'arcade/' + relative;

        assert.ok(
            expected.endsWith(
                '/index.html'
            )
        );

        assert.ok(
            exists(expected),
            'Missing Arcade destination: ' +
                expected
        );

        assert.match(
            read(expected),
            /atlas-bridge\.js/,
            'Arcade direct resources must load AtlasBridge.'
        );
    });

    assert.match(
        atlasOriginalEntrySource,
        /atlas-bridge\.js/,
        'Every Atlas Original direct resource must load AtlasBridge through the shared entry.'
    );

    assert.match(
        read('compass/subject/index.html'),
        /atlas-bridge\.js/,
        'Owned subjects must load AtlasBridge directly.'
    );
}

function testAnonymousBaselineAndScopedSharing() {
    const runtime =
        makeCatalogRuntime();

    const fullSubjects =
        runtime.window
            .CompassCatalogData
            .getCompassSubjects()
            .filter(subject =>
                subject.publicAccess ===
                    'full'
            )
            .map(subject =>
                subject.id
            )
            .sort();

    assert.deepEqual(
        fullSubjects,
        [
            'business-meetings-clear-updates',
            'octopuses-change-colour',
            'odyssey-worth-the-hype',
            'words-that-stick'
        ]
    );

    const fullGames =
        runtime.window
            .ArcadeCatalogData
            .getArcadeGames()
            .filter(game =>
                game.publicAccess ===
                    'full'
            )
            .map(game =>
                game.registryId
            );

    assert.deepEqual(
        fullGames,
        [
            'arcade:truth-trap'
        ]
    );

    const sourceUrl =
        '/compass/food-table/index.html' +
        '?utm_source=linkedin' +
        '&utm_medium=social' +
        '&utm_campaign=subject-share' +
        '#teach';

    const sharedUrl =
        runtime.window
            .AtlasResourceShare
            .buildShareUrl({
                world: 'compass',
                resourceId:
                    'food-table',
                launchUrl:
                    sourceUrl
            });

    const parsed =
        new URL(sharedUrl);

    assert.equal(
        parsed.pathname,
        '/compass/food-table/index.html'
    );

    assert.equal(
        parsed.searchParams.get(
            'utm_source'
        ),
        'linkedin'
    );

    assert.equal(
        parsed.searchParams.get(
            'utm_medium'
        ),
        'social'
    );

    assert.equal(
        parsed.searchParams.get(
            'utm_campaign'
        ),
        'subject-share'
    );

    assert.equal(
        parsed.hash,
        '#teach'
    );

    const grant =
        parsed.searchParams.get(
            'share'
        );

    assert.ok(grant);

    assert.equal(
        runtime.window
            .AtlasResourceShare
            .isGranted({
                world: 'compass',
                resourceId:
                    'food-table',
                href:
                    sharedUrl
            }),
        true
    );

    assert.equal(
        runtime.window
            .AtlasResourceShare
            .isGranted({
                world: 'compass',
                resourceId:
                    'work-purpose',
                href:
                    sharedUrl
            }),
        false,
        'A shared-resource grant must never widen into catalogue access.'
    );
}

function testSourceParametersNeverOwnDestination() {
    const runtime =
        makeReturnRuntime();

    const destination =
        '/compass/food-table/index.html' +
        '?share=s1_q4C8yF2tN6pW' +
        '&utm_source=linkedin' +
        '&utm_medium=social' +
        '&utm_campaign=subject-share' +
        '&from=arcade' +
        '#discussion';

    const intent =
        runtime.window
            .AtlasReturnIntent
            .create({
                action:
                    'open-gated-content',
                destination,
                context: {
                    operation:
                        'begin-compass-subject',
                    subjectId:
                        'food-table'
                }
            });

    assert.equal(
        intent.destination,
        destination,
        'Return intent must preserve path, source parameters, share grant and hash exactly.'
    );

    const handoff =
        installHandoff(
            runtime,
            'https://atlasfortutors.com/account/' +
            '?ri=' +
            encodeURIComponent(
                intent.id
            ) +
            '&utm_source=account-page'
        );

    assert.equal(
        handoff.Handoff
            .initialize()
            .destination,
        destination,
        'Account-page source parameters must not replace the stored resource destination.'
    );

    assert.equal(
        handoff.Handoff
            .resumeIfAuthenticated({
                ready: true,
                authenticated: true,
                recovery: true
            }),
        null,
        'Recovery must own the flow before resource resume.'
    );

    assert.deepEqual(
        handoff.replacements,
        []
    );

    const resumed =
        handoff.Handoff
            .resumeIfAuthenticated({
                ready: true,
                authenticated: true,
                recovery: false
            });

    assert.equal(
        resumed.destination,
        destination
    );

    assert.deepEqual(
        handoff.replacements,
        [destination]
    );

    runtime.window.location =
        new URL(
            'https://atlasfortutors.com' +
            destination
        );

    const replayed =
        runtime.window
            .AtlasReturnIntent
            .consumeQueuedResume(
                runtime.window.location.href
            );

    assert.ok(replayed);

    assert.equal(
        replayed.destination,
        destination
    );

    assert.equal(
        replayed.context.subjectId,
        'food-table'
    );
}

function testRootAcquisitionParametersSurviveProductEntry() {
    assert.match(
        rootSource,
        /entryUrl\.searchParams\.delete\('entry'\)/
    );

    assert.match(
        rootSource,
        /entryUrl\.pathname[\s\S]*?entryUrl\.searchParams\.toString\(\)[\s\S]*?entryUrl\.hash/
    );

    assert.match(
        rootSource,
        /'\.\/tutors\/' \+[\s\S]*?window\.location\.search \+[\s\S]*?window\.location\.hash/
    );

    assert.doesNotMatch(
        rootSource,
        /searchParams\.delete\(['"]utm_/,
        'Root routing must not strip acquisition parameters.'
    );
}

function testInternalLaunchOriginStaysWhitelistedContext() {
    assert.match(
        atlasSearchSource,
        /const urlOrigin = new URL\([\s\S]*?searchParams\.get\('from'\)/
    );

    assert.match(
        atlasSearchSource,
        /\['atlas', 'compass', 'arcade'\][\s\S]*?includes\(urlOrigin\)/
    );

    assert.match(
        atlasSearchSource,
        /destination\.searchParams\.set\([\s\S]*?'from'[\s\S]*?getActiveLaunchOrigin\(\)/
    );

    assert.match(
        atlasSearchSource,
        /return 'compass';/,
        'Invalid external from values must fall back to a known Atlas world.'
    );
}

function testAcquisitionMeasurementExistsOnDirectResources() {
    assert.match(
        bridgeSource,
        /const GA_MEASUREMENT_ID = 'G-Q6Z6YWZ5YP'/
    );

    assert.match(
        bridgeSource,
        /window\.gtag\('config', GA_MEASUREMENT_ID\)/
    );

    assert.match(
        bridgeSource,
        /googletagmanager\.com\/gtag\/js\?id=/
    );

    assert.doesNotMatch(
        bridgeSource,
        /searchParams\.delete\(['"]utm_/,
        'Analytics bootstrap must not mutate acquisition parameters before measurement.'
    );
}

function testAuthAndRecoveryPreserveOpaqueIntent() {
    assert.match(
        accountSource,
        /createAccount\([\s\S]*?accountReturnUrl\(\{ returnIntentId \}\)/
    );

    assert.match(
        accountSource,
        /requestPasswordReset\([\s\S]*?\{ returnIntentId = null \}[\s\S]*?accountReturnUrl\(\{ returnIntentId \}\)/
    );

    assert.match(
        accountGateSource,
        /returnIntentId:[\s\S]*?activeReturnIntentId/
    );

    assert.match(
        accountPageSource,
        /returnIntentId:[\s\S]*?AtlasReturnHandoff\.getPendingId\(\)/
    );

    const recoveryIndex =
        accountPageSource.indexOf(
            'state.authenticated && state.recovery'
        );

    const resumeIndex =
        accountPageSource.indexOf(
            'AtlasReturnHandoff.resumeIfAuthenticated(state)'
        );

    assert.ok(
        recoveryIndex >= 0 &&
        resumeIndex > recoveryIndex
    );
}

function testInvalidAndStaleLinksFailHonestly() {
    assert.equal(
        frontendDeployConfig.name,
        'atlas'
    );

    assert.equal(
        frontendDeployConfig.assets?.directory,
        '.'
    );

    assert.equal(
        frontendDeployConfig.assets?.not_found_handling,
        '404-page',
        'Atlas frontend deployment must serve the committed 404.html for unmatched asset routes.'
    );

    assert.match(
        notFoundSource,
        /class="atlas-brand"/
    );

    assert.match(
        notFoundSource,
        /text-indent: 0\.12em/
    );

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

    assert.doesNotMatch(
        notFoundSource,
        /location\.(?:replace|assign)\s*\(/
    );

    assert.doesNotMatch(
        notFoundSource,
        /location\.href\s*=/
    );
}

function testNoAcquisitionParameterBecomesAuthRedirect() {
    assert.match(
        returnIntentSource,
        /url\.origin !== window\.location\.origin/
    );

    assert.match(
        returnIntentSource,
        /pathname === '\/account'/
    );

    assert.match(
        returnHandoffSource,
        /window\.location\.replace\(intent\.destination\)/
    );

    assert.doesNotMatch(
        returnHandoffSource,
        /utm_source|utm_medium|utm_campaign/,
        'Return handoff must use only the validated stored destination, not acquisition parameters.'
    );
}

testDirectResourceIntegrity();
testAnonymousBaselineAndScopedSharing();
testSourceParametersNeverOwnDestination();
testRootAcquisitionParametersSurviveProductEntry();
testInternalLaunchOriginStaysWhitelistedContext();
testAcquisitionMeasurementExistsOnDirectResources();
testAuthAndRecoveryPreserveOpaqueIntent();
testInvalidAndStaleLinksFailHonestly();
testNoAcquisitionParameterBecomesAuthRedirect();

console.log(
    'Batch 4.3D public deep-link QA passed: direct resources are real, anonymous/share access stays scoped, UTM attribution survives without owning routing, GA4 is present on direct resource surfaces, auth/recovery preserves exact intent, and invalid links fail honestly.'
);
