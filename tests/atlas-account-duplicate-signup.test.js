'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const account = fs.readFileSync(
    'shared/atlas-account.js',
    'utf8'
);

const accessBootstrap = fs.readFileSync(
    'shared/atlas-access-bootstrap.js',
    'utf8'
);

const sessionPanel = fs.readFileSync(
    'shared/atlas-session-panel.js',
    'utf8'
);

const atlasHome = fs.readFileSync(
    'index.html',
    'utf8'
);

const compassHome = fs.readFileSync(
    'compass/index.html',
    'utf8'
);

const arcadeHome = fs.readFileSync(
    'arcade/index.html',
    'utf8'
);

const ownedSubject = fs.readFileSync(
    'compass/subject/index.html',
    'utf8'
);

const insideAtlas = fs.readFileSync(
    'tutors/index.html',
    'utf8'
);

const pricing = fs.readFileSync(
    'pricing/index.html',
    'utf8'
);

const accountSettings = fs.readFileSync(
    'account/index.html',
    'utf8'
);

assert.match(
    account,
    /const identities =[\s\S]*?Array\.isArray\([\s\S]*?data\?\.user\?\.identities[\s\S]*?\? data\.user\.identities[\s\S]*?: null/,
    'AtlasAccount must inspect the identity list returned by password signup.'
);

assert.match(
    account,
    /!session &&[\s\S]*?identities &&[\s\S]*?identities\.length === 0[\s\S]*?ATLAS_ACCOUNT_MAY_EXIST/,
    'AtlasAccount must distinguish Supabase obfuscated duplicate signups from real confirmation-pending signups.'
);

assert.match(
    account,
    /You may already have an Atlas account with this email\. Try signing in instead\./,
    'Duplicate signup guidance must be simple, useful, and avoid claiming account existence with certainty.'
);

assert.match(
    account,
    /confirmationRequired:\s*!session/,
    'Real confirmation-pending signups must keep the existing confirmation flow.'
);

assert.match(
    accessBootstrap,
    /atlas-account\.js\?v=20260926-duplicatesignup1/,
    'Access bootstrap must load the duplicate-signup account runtime revision.'
);

assert.match(
    sessionPanel,
    /atlas-access-bootstrap\.js\?v=20260926-duplicatesignup1/,
    'Shared session runtime must refresh the account bootstrap revision.'
);

for (const [label, source] of [
    ['Atlas home', atlasHome],
    ['Compass home', compassHome],
    ['Arcade home', arcadeHome]
]) {
    assert.match(
        source,
        /atlas-session-panel\.js\?v=20260926-duplicatesignup1/,
        `${label} must refresh the session runtime for duplicate-signup handling.`
    );
}

assert.match(
    ownedSubject,
    /atlas-account\.js\?v=20260926-duplicatesignup1/,
    'Owned subjects must refresh their direct account runtime.'
);

assert.match(
    ownedSubject,
    /atlas-session-panel\.js\?v=20260926-duplicatesignup1/,
    'Owned subjects must refresh their session runtime.'
);

for (const [label, source] of [
    ['Inside Atlas', insideAtlas],
    ['Pricing', pricing]
]) {
    assert.match(
        source,
        /atlas-access-bootstrap\.js\?v=20260926-duplicatesignup1/,
        `${label} must refresh the account bootstrap revision.`
    );
}

assert.match(
    accountSettings,
    /atlas-account\.js\?v=20260926-duplicatesignup1/,
    'Account settings must refresh its direct account runtime.'
);

console.log(
    'Atlas duplicate signup handling contract verified.'
);
