// ============================================================
// COMPASS HUB ACTION RENDER STABILIZER
// Coalesces Hub rerenders while a hidden ownership worker persists a
// duplicate / My Subjects copy. This keeps the visible library stable
// until the action has finished, then allows one final render.
// ============================================================

(function () {
    'use strict';

    if (window.parent === window) return;

    let requestId = '';

    try {
        requestId = new URL(window.location.href)
            .searchParams
            .get('atlasHubRequest') || '';
    } catch { }

    if (!requestId) return;

    let host = null;

    try {
        host = window.parent;
        void host.location.href;
    } catch {
        return;
    }

    if (typeof host.renderHub !== 'function') return;

    if (!host.__atlasHubActionRenderGate) {
        try {
            host.Function(`
                (function () {
                    if (window.__atlasHubActionRenderGate) return;
                    if (typeof window.renderHub !== 'function') return;

                    const originalRenderHub = window.renderHub;
                    const originalPostMessage = window.postMessage.bind(window);

                    const gate = {
                        active: new Map(),
                        queued: false,
                        renderTimer: null,
                        fallbackTimer: null,
                        quietDelay: 450,
                        originalRenderHub,
                        originalPostMessage
                    };

                    gate.allComplete = function () {
                        if (!gate.active.size) return false;

                        for (const record of gate.active.values()) {
                            if (!record.complete) return false;
                        }

                        return true;
                    };

                    gate.clearTimers = function () {
                        if (gate.renderTimer !== null) {
                            window.clearTimeout(gate.renderTimer);
                            gate.renderTimer = null;
                        }

                        if (gate.fallbackTimer !== null) {
                            window.clearTimeout(gate.fallbackTimer);
                            gate.fallbackTimer = null;
                        }
                    };

                    gate.release = function ({ render = true } = {}) {
                        gate.clearTimers();

                        const shouldRender =
                            render && gate.queued;

                        gate.active.clear();
                        gate.queued = false;
                        window.renderHub = originalRenderHub;

                        if (shouldRender) {
                            Promise.resolve(
                                originalRenderHub()
                            ).catch(() => {});
                        }
                    };

                    gate.scheduleQuietRelease = function () {
                        if (!gate.allComplete()) return;

                        if (gate.renderTimer !== null) {
                            window.clearTimeout(gate.renderTimer);
                        }

                        gate.renderTimer = window.setTimeout(
                            () => gate.release({ render: true }),
                            gate.quietDelay
                        );
                    };

                    gate.begin = function (requestId) {
                        gate.active.set(requestId, {
                            complete: false
                        });

                        if (gate.fallbackTimer !== null) {
                            window.clearTimeout(gate.fallbackTimer);
                        }

                        gate.fallbackTimer = window.setTimeout(
                            () => gate.release({ render: gate.queued }),
                            20000
                        );
                    };

                    gate.complete = function (requestId) {
                        const record = gate.active.get(requestId);

                        if (!record) return;

                        record.complete = true;

                        // Do not release here. The Hub may still be moving
                        // session/category state after receiving the message.
                        // Its render requests are intentionally coalesced.
                        if (gate.fallbackTimer !== null) {
                            window.clearTimeout(gate.fallbackTimer);
                        }

                        gate.fallbackTimer = window.setTimeout(
                            () => gate.release({ render: gate.queued }),
                            3000
                        );
                    };

                    window.renderHub = function (...args) {
                        if (!gate.active.size) {
                            return originalRenderHub.apply(this, args);
                        }

                        gate.queued = true;

                        if (gate.allComplete()) {
                            gate.scheduleQuietRelease();
                        }

                        return Promise.resolve(null);
                    };

                    window.postMessage = function (message, targetOrigin, transfer) {
                        const result = transfer === undefined
                            ? originalPostMessage(message, targetOrigin)
                            : originalPostMessage(message, targetOrigin, transfer);

                        if (
                            message &&
                            message.type === 'atlas:hub-subject-action-complete' &&
                            message.requestId
                        ) {
                            gate.complete(String(message.requestId));
                        }

                        return result;
                    };

                    window.__atlasHubActionRenderGate = gate;
                })();
            `)();
        } catch {
            return;
        }
    }

    try {
        host.__atlasHubActionRenderGate
            ?.begin(requestId);
    } catch { }
})();
