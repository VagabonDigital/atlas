'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const source = fs.readFileSync(
    path.join(__dirname, '..', 'compass', 'index.html'),
    'utf8'
);

function openMenu({ buttonTop, menuHeight, viewportHeight = 823 }) {
    const start = source.indexOf(
        '    function toggleOwnedSubjectMenu(button, event) {'
    );
    const end = source.indexOf(
        '    function syncAnonymousCreatePreviewState(', start
    );
    assert.ok(start >= 0 && end > start, 'menu function is present');

    const classes = new Set();
    const style = {};
    let expanded = 'false';
    const menu = {
        hidden: true,
        style,
        classList: {
            add(name) { classes.add(name); },
            remove(name) { classes.delete(name); }
        },
        getBoundingClientRect() {
            const height = style.maxHeight
                ? Math.min(parseFloat(style.maxHeight), menuHeight)
                : menuHeight;
            const anchoredTop = classes.has('is-flipped')
                ? buttonTop - 8 - height
                : buttonTop + 32 + 8;
            const shift = style.transform
                ? parseFloat(style.transform.match(/translateY\(([-\d.]+)/)?.[1] || 0)
                : 0;
            const top = anchoredTop + shift;
            return { top, bottom: top + height, height };
        }
    };
    const button = {
        closest() {
            return { querySelector() { return menu; } };
        },
        getBoundingClientRect() {
            return { top: buttonTop, bottom: buttonTop + 32 };
        },
        setAttribute(name, value) {
            if (name === 'aria-expanded') expanded = value;
        }
    };
    const fakeWindow = {
        innerHeight: viewportHeight,
        getComputedStyle() {
            return { display: 'block', visibility: 'visible' };
        }
    };
    const fakeDocument = {
        documentElement: { clientHeight: viewportHeight },
        querySelector(selector) {
            return selector === '.spine'
                ? { getBoundingClientRect() { return { bottom: 77 }; } }
                : null;
        }
    };
    const closeMenus = () => {
        menu.hidden = true;
        expanded = 'false';
    };
    const toggle = new Function(
        'window', 'document', 'closeOwnedSubjectMenus',
        source.slice(start, end) + 'return toggleOwnedSubjectMenu;'
    )(fakeWindow, fakeDocument, closeMenus);

    toggle(button, {
        preventDefault() {},
        stopPropagation() {}
    });

    return {
        menu,
        rect: menu.getBoundingClientRect(),
        expanded,
        flipped: classes.has('is-flipped')
    };
}

function assertFitsViewport({ rect }, height) {
    assert.ok(rect.top >= 89, 'menu must not overlap the sticky header');
    assert.ok(
        rect.bottom <= height - 12,
        'menu must not extend beneath the viewport'
    );
}

test('cover surface is clipped separately from the menu', () => {
    assert.match(
        source,
        /\.subject-card-content\s*\{[^}]*overflow:\s*clip;/
    );
    assert.match(
        source,
        /:has\(\.subject-card-manage-btn\[aria-expanded="true"\]\)/
    );
});

test('dropdown opens below a top-of-screen button without scrolling', () => {
    const state = openMenu({ buttonTop: 90, menuHeight: 445 });
    assertFitsViewport(state, 823);
    assert.equal(state.menu.hidden, false);
    assert.equal(state.expanded, 'true');
    assert.equal(state.menu.style.overflowY, '');
});

test('dropdown near viewport middle shifts instead of scrolling', () => {
    const state = openMenu({ buttonTop: 430, menuHeight: 445 });
    assertFitsViewport(state, 823);
    assert.equal(state.rect.height, 445);
    assert.equal(state.menu.style.overflowY, '');
});

test('dropdown near bottom flips above the button', () => {
    const state = openMenu({ buttonTop: 760, menuHeight: 445 });
    assertFitsViewport(state, 823);
    assert.equal(state.flipped, true);
    assert.equal(state.menu.style.overflowY, '');
});

test('a dropdown taller than the viewport stays scrollable', () => {
    const state = openMenu({
        buttonTop: 400,
        menuHeight: 1100,
        viewportHeight: 600
    });
    assertFitsViewport(state, 600);
    assert.equal(state.menu.style.overflowY, 'auto');
    assert.equal(state.rect.height, 499);
});

test('page scroll dismisses a menu without blocking menu-internal scroll', () => {
    assert.match(
        source,
        /window\.addEventListener\('scroll',\s*e\s*=>\s*\{[^}]*\.subject-card-menu[^}]*closeOwnedSubjectMenus\(\)/
    );
});
