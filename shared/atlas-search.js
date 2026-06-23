// ============================================================
// ATLAS SEARCH
// Shared global search launcher for Atlas OS.
//
// Owns:
// - global Search modal
// - Search result groups
// - registry-based destination reading
// - URL resolving from Atlas root
// - Cmd/Ctrl-K shortcut
//
// Depends on:
// - window.AtlasBridge
//
// Does NOT own:
// - sessions/registry storage
// - learning ledger
// - world-specific page rendering
// ============================================================

(function () {
    'use strict';

    if (window.AtlasSearch) return;

    const SCRIPT_URL = document.currentScript && document.currentScript.src
        ? document.currentScript.src
        : window.location.href;

    const IDS = {
        overlay: 'atlas-search-overlay',
        panel: 'atlas-search-panel',
        input: 'atlas-search-input',
        results: 'atlas-search-results',
        hint: 'atlas-search-hint'
    };

    let focusIdx = -1;
    let flatRows = [];
    let previousBodyOverflow = '';

    const SEARCH_ICON = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" stroke-width="1.3" />
        <path d="M10.5 10.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
    </svg>`;

    function getBridge() {
        return window.AtlasBridge || null;
    }

    function escHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function getAtlasRootUrl() {
        try {
            return new URL('../', SCRIPT_URL).href;
        } catch {
            return new URL('./', window.location.href).href;
        }
    }

    function resolveAtlasUrl(url) {
        let raw = String(url || '').trim();

        if (!raw) return '';

        if (/^(https?:|file:|mailto:|tel:)/i.test(raw)) {
            return raw;
        }

        raw = raw.replace(/^\/+/, '');

        while (raw.startsWith('../')) {
            raw = raw.slice(3);
        }

        if (raw.startsWith('./')) {
            raw = raw.slice(2);
        }

        try {
            return new URL(raw, getAtlasRootUrl()).href;
        } catch {
            return url;
        }
    }

    function navigateTo(url) {
        const resolved = resolveAtlasUrl(url);

        if (!resolved) return;

        window.location.href = resolved;
    }

    function readRegistrySafe() {
        const Bridge = getBridge();

        if (!Bridge || typeof Bridge.readRegistry !== 'function') {
            return { worlds: {}, items: {}, sessionStates: {}, recentActivity: [] };
        }

        try {
            return Bridge.readRegistry() || { worlds: {}, items: {}, sessionStates: {}, recentActivity: [] };
        } catch {
            return { worlds: {}, items: {}, sessionStates: {}, recentActivity: [] };
        }
    }

    function readActiveSessionSafe() {
        const Bridge = getBridge();

        if (!Bridge || typeof Bridge.readActiveSession !== 'function') {
            return { id: 'default', name: 'Default' };
        }

        try {
            return Bridge.readActiveSession() || { id: 'default', name: 'Default' };
        } catch {
            return { id: 'default', name: 'Default' };
        }
    }

    function itemTypeLabel(item) {
        if (item.world === 'arcade') return 'Arcade Game';
        if (item.world === 'compass') return 'Compass Subject';
        return item.type || 'Atlas Item';
    }

    function itemGroupLabel(item) {
        if (item.world === 'arcade') return 'Arcade Games';
        if (item.world === 'compass') return 'Compass Subjects';
        return 'Other';
    }

    function itemIconType(item) {
        if (item.world === 'arcade') return 'game';
        if (item.world === 'compass') return 'subject';
        return 'item';
    }

    function getRegisteredItems(reg) {
        return Object.entries(reg.items || {})
            .map(([key, item]) => {
                if (!item || !item.launchUrl) return null;

                const world = item.world || '';
                const allowed = world === 'compass' || world === 'arcade';

                if (!allowed) return null;

                return {
                    ...item,
                    registryId: item.registryId || key
                };
            })
            .filter(Boolean)
            .sort((a, b) => {
                const worldA = a.world === 'compass' ? 1 : 2;
                const worldB = b.world === 'compass' ? 1 : 2;

                if (worldA !== worldB) return worldA - worldB;

                return String(a.title || a.navTitle || '').localeCompare(String(b.title || b.navTitle || ''));
            });
    }

    function getRecentRows(reg, itemsById) {
        const activeSession = readActiveSessionSafe();
        const seen = new Set();
        const rows = [];

        const recent = Array.isArray(reg.recentActivity)
            ? reg.recentActivity.slice()
            : [];

        recent
            .sort((a, b) => Number(b.timestamp || 0) - Number(a.timestamp || 0))
            .forEach(activity => {
                if (!activity || activity.sessionId !== activeSession.id) return;
                if (!activity.registryId || seen.has(activity.registryId)) return;

                const item = itemsById[activity.registryId];

                if (!item || !item.launchUrl) return;

                seen.add(activity.registryId);

                rows.push({
                    group: 'Recent',
                    title: item.title || item.navTitle || 'Untitled',
                    sub: itemTypeLabel(item),
                    type: itemIconType(item),
                    disabled: false,
                    searchText: [
                        item.title,
                        item.navTitle,
                        item.world,
                        item.type,
                        itemTypeLabel(item),
                        'recent'
                    ].join(' '),
                    action: () => navigateTo(item.launchUrl)
                });
            });

        return rows.slice(0, 4);
    }

    function buildRows() {
        const reg = readRegistrySafe();
        const items = getRegisteredItems(reg);
        const itemsById = {};

        items.forEach(item => {
            itemsById[item.registryId] = item;
        });

        const rows = [];

        rows.push(...getRecentRows(reg, itemsById));

        rows.push({
            group: 'Home',
            title: 'Atlas',
            sub: 'Atlas Gateway',
            type: 'home',
            disabled: false,
            searchText: 'atlas home gateway start root',
            action: () => navigateTo('index.html')
        });

        rows.push({
            group: 'Worlds',
            title: 'Compass',
            sub: 'Subject Library',
            type: 'world',
            disabled: false,
            searchText: 'compass world subjects subject library discussion human compass',
            action: () => navigateTo('compass/index.html')
        });

        rows.push({
            group: 'Worlds',
            title: 'Arcade',
            sub: 'Game Library',
            type: 'world',
            disabled: false,
            searchText: 'arcade world games conversation games activities',
            action: () => navigateTo('arcade/index.html')
        });

        items.forEach(item => {
            rows.push({
                group: itemGroupLabel(item),
                title: item.title || item.navTitle || 'Untitled',
                sub: itemTypeLabel(item),
                type: itemIconType(item),
                disabled: false,
                searchText: [
                    item.title,
                    item.navTitle,
                    item.id,
                    item.registryId,
                    item.world,
                    item.type,
                    itemTypeLabel(item),
                    itemGroupLabel(item),
                    Array.isArray(item.keywords) ? item.keywords.join(' ') : ''
                ].join(' '),
                action: () => navigateTo(item.launchUrl)
            });
        });

        return rows;
    }

    function iconFor(type) {
        if (type === 'home') {
            return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 2.1L13.2 6.8V13.2H9.7V9.5H6.3V13.2H2.8V6.8L8 2.1Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M6.2 13.2H9.8" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>';
        }

        if (type === 'world') {
            return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="5.3" stroke="currentColor" stroke-width="1.35"/><path d="M3.1 8H12.9" stroke="currentColor" stroke-width="1.15" stroke-linecap="round"/><path d="M8 2.8C9.45 4.2 10.15 5.95 10.15 8C10.15 10.05 9.45 11.8 8 13.2C6.55 11.8 5.85 10.05 5.85 8C5.85 5.95 6.55 4.2 8 2.8Z" stroke="currentColor" stroke-width="1.15" stroke-linejoin="round"/></svg>';
        }

        if (type === 'subject') {
            return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M8 1.8L13.3 8L8 14.2L2.7 8L8 1.8Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M8 4.7L9.55 8L8 11.3L6.45 8L8 4.7Z" fill="currentColor" opacity="0.72"/><circle cx="8" cy="8" r="0.8" fill="currentColor"/></svg>';
        }

        if (type === 'game') {
            return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.3" y="4.1" width="11.4" height="7.8" rx="2.2" stroke="currentColor" stroke-width="1.35"/><path d="M5.1 8H7.2M6.15 6.95V9.05" stroke="currentColor" stroke-width="1.25" stroke-linecap="round"/><circle cx="10.15" cy="7.35" r="0.62" fill="currentColor"/><circle cx="11.35" cy="8.65" r="0.62" fill="currentColor"/></svg>';
        }

        return '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M4 3.4H12M4 8H10.8M4 12.6H11.2" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>';
    }

    function ensureModal() {
        if (document.getElementById(IDS.overlay)) return;

        const overlay = document.createElement('div');

        overlay.className = 'atlas-search-overlay';
        overlay.id = IDS.overlay;
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Atlas Search');
        overlay.setAttribute('aria-modal', 'true');

        overlay.innerHTML = `
            <div class="atlas-search-panel" id="${IDS.panel}">
                <div class="atlas-search-input-row">
                    ${SEARCH_ICON}
                    <input class="atlas-search-input" id="${IDS.input}" placeholder="Search subjects, games, and worlds…" autocomplete="off" autocorrect="off" spellcheck="false">
                </div>
                <div class="atlas-search-results" id="${IDS.results}"></div>
                <div class="atlas-search-hint" id="${IDS.hint}"></div>
            </div>
        `;

        document.body.appendChild(overlay);

        overlay.addEventListener('click', event => {
            if (event.target === overlay) {
                close();
            }
        });

        const input = document.getElementById(IDS.input);

        input.addEventListener('input', event => {
            focusIdx = -1;
            renderResults(event.target.value);
        });

        input.addEventListener('keydown', event => {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                moveFocus(1);
                return;
            }

            if (event.key === 'ArrowUp') {
                event.preventDefault();
                moveFocus(-1);
                return;
            }

            if (event.key === 'Enter') {
                event.preventDefault();
                openFocusedResult();
                return;
            }

            if (event.key === 'Escape') {
                event.preventDefault();
                close();
            }
        });
    }

    function open() {
        ensureModal();

        const overlay = document.getElementById(IDS.overlay);
        const input = document.getElementById(IDS.input);

        previousBodyOverflow = document.body.style.overflow || '';

        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';

        input.value = '';
        focusIdx = -1;

        renderResults('');

        window.setTimeout(() => {
            input.focus();
        }, 40);
    }

    function close() {
        const overlay = document.getElementById(IDS.overlay);

        if (!overlay) return;

        overlay.classList.remove('open');
        document.body.style.overflow = previousBodyOverflow;
        focusIdx = -1;
    }

    function isOpen() {
        const overlay = document.getElementById(IDS.overlay);

        return !!overlay && overlay.classList.contains('open');
    }

    function renderResults(query) {
        const q = String(query || '').trim().toLowerCase();
        const rows = buildRows();

        const filtered = rows.filter(row => {
            if (!q) return true;

            return String(row.searchText || `${row.title} ${row.sub} ${row.group}`)
                .toLowerCase()
                .includes(q);
        });

        flatRows = filtered;

        const results = document.getElementById(IDS.results);
        const hint = document.getElementById(IDS.hint);

        if (!results || !hint) return;

        if (!filtered.length) {
            results.innerHTML = '<div class="atlas-search-empty">No matches.</div>';
            hint.innerHTML = '<span>Search by subject, game, or world name</span><kbd>Esc</kbd>';
            return;
        }

        let currentGroup = '';
        let html = '';

        filtered.forEach((row, idx) => {
            if (row.group !== currentGroup) {
                currentGroup = row.group;
                html += '<div class="atlas-search-group-label">' + escHtml(currentGroup) + '</div>';
            }

            html += `
                <div class="atlas-search-result${row.disabled ? ' is-disabled' : ''}" data-atlas-search-idx="${idx}" role="option">
                    <div class="atlas-search-result-icon atlas-search-result-icon-${escHtml(row.type)}">${iconFor(row.type)}</div>
                    <div class="atlas-search-result-body">
                        <div class="atlas-search-result-title">${escHtml(row.title)}</div>
                        <div class="atlas-search-result-sub">${escHtml(row.sub)}</div>
                    </div>
                </div>
            `;
        });

        results.innerHTML = html;

        results.querySelectorAll('.atlas-search-result').forEach(el => {
            el.addEventListener('click', () => {
                const idx = Number(el.getAttribute('data-atlas-search-idx'));
                const row = flatRows[idx];

                if (!row || row.disabled || !row.action) return;

                close();
                row.action();
            });
        });

        hint.innerHTML = '<span>Enter opens the selected result</span><kbd>Esc</kbd>';
    }

    function moveFocus(delta) {
        const enabled = Array.from(document.querySelectorAll(`#${IDS.results} .atlas-search-result:not(.is-disabled)`));

        if (!enabled.length) return;

        focusIdx = Math.max(0, Math.min(focusIdx + delta, enabled.length - 1));

        document.querySelectorAll(`#${IDS.results} .atlas-search-result`).forEach(row => {
            row.classList.remove('focused');
        });

        const focused = enabled[focusIdx];

        if (focused) {
            focused.classList.add('focused');
            focused.scrollIntoView({ block: 'nearest' });
        }
    }

    function openFocusedResult() {
        const focused = document.querySelector(`#${IDS.results} .atlas-search-result.focused:not(.is-disabled)`);

        if (focused) {
            const idx = Number(focused.getAttribute('data-atlas-search-idx'));
            const row = flatRows[idx];

            if (row && row.action) {
                close();
                row.action();
            }

            return;
        }

        const first = flatRows.find(row => !row.disabled && row.action);

        if (first) {
            close();
            first.action();
        }
    }

    function bindGlobalKeys() {
        document.addEventListener('keydown', event => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                open();
                return;
            }

            if (event.key === 'Escape' && isOpen()) {
                event.preventDefault();
                close();
            }
        });
    }

    function bindSearchButtons() {
        document.addEventListener('click', event => {
            const btn = event.target.closest('[data-atlas-search]');

            if (!btn) return;

            event.preventDefault();
            open();
        });
    }

    function init() {
        ensureModal();
    }

    window.AtlasSearch = {
        open,
        close,
        isOpen,
        init,
        icon: SEARCH_ICON,
        resolveAtlasUrl,
        navigateTo
    };

    bindGlobalKeys();
    bindSearchButtons();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();