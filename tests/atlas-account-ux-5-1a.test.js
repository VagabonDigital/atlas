'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const gate = fs.readFileSync('shared/atlas-account-gate.js','utf8');
const css = fs.readFileSync('shared/atlas-account-gate.css','utf8');
const account = fs.readFileSync('account/index.html','utf8');

assert.ok(gate.includes('function installPasswordVisibilityToggles(root)'));
assert.ok(gate.includes("button.setAttribute('aria-label', 'Show password')"));
assert.ok(gate.includes("'Hide password'"));
assert.ok(gate.includes('installPasswordVisibilityToggles(gateLayer)'));
assert.ok(css.includes('.atlas-account-password-toggle'));
assert.ok(account.includes('function installPasswordVisibilityToggles(root = document)'));
assert.ok(account.includes('installPasswordVisibilityToggles();'));
assert.ok(gate.includes('Too many account emails have been sent. Please try again shortly.'));
assert.ok(account.includes('Too many account emails have been sent. Please try again shortly.'));
assert.ok(account.includes('>Cancel password reset</button>'));
assert.ok(account.includes('Cancelling password reset…'));
assert.ok(!account.includes('>Cancel and sign out</button>'));

console.log('Atlas 5.1 account UX contract passed.');
