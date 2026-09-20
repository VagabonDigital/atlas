/* ============================================================
   ATLAS GOOGLE IDENTITY
   Google Identity Services button + credential delivery.

   Google owns the popup/account-chooser UI. This adapter receives the
   Google ID token in-page and hands it to Atlas account UI callers.
   Supabase never participates in the browser redirect journey.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasGoogleIdentity) return;

    const CLIENT_ID =
        '557655283318-jb0eopspea509ra2bg6878ajiio88ekh.apps.googleusercontent.com';
    const GIS_SRC =
        'https://accounts.google.com/gsi/client';

    let libraryPromise = null;
    let initialized = false;
    let sequence = 0;

    const handlers = new Map();

    function randomState() {
        const bytes = new Uint8Array(16);

        if (
            window.crypto &&
            typeof window.crypto.getRandomValues === 'function'
        ) {
            window.crypto.getRandomValues(bytes);

            return 'atlas_google_' +
                Array.from(bytes, byte =>
                    byte.toString(16).padStart(2, '0')
                ).join('');
        }

        sequence += 1;
        return 'atlas_google_' +
            Date.now().toString(36) +
            '_' +
            sequence.toString(36);
    }

    function ensureLibrary() {
        if (
            window.google?.accounts?.id &&
            typeof window.google.accounts.id.initialize === 'function'
        ) {
            return Promise.resolve(window.google.accounts.id);
        }

        if (libraryPromise) return libraryPromise;

        libraryPromise = new Promise((resolve, reject) => {
            let script = document.querySelector(
                'script[data-atlas-google-identity-library]'
            );

            function complete() {
                const Identity =
                    window.google?.accounts?.id;

                if (
                    Identity &&
                    typeof Identity.initialize === 'function' &&
                    typeof Identity.renderButton === 'function'
                ) {
                    resolve(Identity);
                    return;
                }

                libraryPromise = null;
                reject(new Error(
                    'Google sign-in did not initialize.'
                ));
            }

            function fail() {
                libraryPromise = null;
                reject(new Error(
                    'Atlas could not load Google sign-in.'
                ));
            }

            if (script) {
                script.addEventListener(
                    'load',
                    complete,
                    { once: true }
                );
                script.addEventListener(
                    'error',
                    fail,
                    { once: true }
                );
                return;
            }

            script = document.createElement('script');
            script.src = GIS_SRC;
            script.async = true;
            script.defer = true;
            script.dataset.atlasGoogleIdentityLibrary = 'true';
            script.addEventListener(
                'load',
                complete,
                { once: true }
            );
            script.addEventListener(
                'error',
                fail,
                { once: true }
            );
            document.head.appendChild(script);
        });

        return libraryPromise;
    }

    function handleCredential(response) {
        const state =
            String(response?.state || '').trim();
        const handler =
            state ? handlers.get(state) : null;

        if (!handler) {
            console.error(
                '[AtlasGoogleIdentity] Google returned a credential without a matching Atlas button state.'
            );
            return;
        }

        const credential =
            String(response?.credential || '').trim();

        if (!credential) {
            handler.onError?.(
                new Error(
                    'Google did not return a sign-in credential.'
                )
            );
            return;
        }

        Promise.resolve(
            handler.onCredential?.(
                credential,
                {
                    selectBy:
                        String(
                            response?.select_by || ''
                        ).trim(),
                    state
                }
            )
        ).catch(error => {
            handler.onError?.(error);
        });
    }

    async function initialize() {
        const Identity = await ensureLibrary();

        if (!initialized) {
            Identity.initialize({
                client_id: CLIENT_ID,
                callback: handleCredential,
                ux_mode: 'popup',
                auto_select: false
            });

            initialized = true;
        }

        return Identity;
    }

    function clearButton(container) {
        if (!container) return;

        const priorState =
            String(
                container.dataset
                    ?.atlasGoogleIdentityState ||
                ''
            ).trim();

        if (priorState) {
            handlers.delete(priorState);
        }

        container.replaceChildren();
        delete container.dataset
            .atlasGoogleIdentityState;
    }

    function waitForRenderedButton(container) {
        return new Promise(resolve => {
            let settled = false;
            let observer = null;
            let fallbackTimer = null;
            let settleTimer = null;

            const finish = () => {
                if (settled) return;
                settled = true;

                observer?.disconnect();

                if (fallbackTimer) {
                    window.clearTimeout(
                        fallbackTimer
                    );
                }

                if (settleTimer) {
                    window.clearTimeout(
                        settleTimer
                    );
                }

                requestAnimationFrame(() => {
                    requestAnimationFrame(resolve);
                });
            };

            const settleAfterLoad = () => {
                if (settled) return;

                if (settleTimer) {
                    window.clearTimeout(
                        settleTimer
                    );
                }

                /*
                 * Google's iframe can fire load before its webfont has
                 * completed first paint. Keep it off-screen for a short,
                 * deterministic settle window so Atlas never exposes that
                 * internal font swap.
                 */
                settleTimer =
                    window.setTimeout(
                        finish,
                        420
                    );
            };

            const watch = () => {
                const iframe =
                    container.querySelector('iframe');

                if (!iframe) return false;

                iframe.addEventListener(
                    'load',
                    settleAfterLoad,
                    { once: true }
                );

                /*
                 * Cross-origin iframes do not expose a reliable "already
                 * loaded" flag. This fallback is deliberately long enough
                 * to cover an iframe inserted after its load event fired;
                 * unlike the old 140ms fallback it cannot win the race
                 * against a normal cold Google render.
                 */
                fallbackTimer =
                    window.setTimeout(
                        finish,
                        1000
                    );

                return true;
            };

            if (watch()) return;

            observer =
                new MutationObserver(() => {
                    if (watch()) {
                        observer.disconnect();
                    }
                });

            observer.observe(
                container,
                {
                    childList: true,
                    subtree: true
                }
            );

            fallbackTimer =
                window.setTimeout(
                    finish,
                    1600
                );
        });
    }

    async function renderButton(
        container,
        {
            onCredential = null,
            onClick = null,
            onError = null,
            text = 'continue_with'
        } = {}
    ) {
        if (!(container instanceof Element)) {
            throw new Error(
                'Atlas Google sign-in requires a button container.'
            );
        }

        const Identity = await initialize();

        clearButton(container);

        const state = randomState();

        handlers.set(state, {
            onCredential,
            onClick,
            onError
        });

        container.dataset.atlasGoogleIdentityState =
            state;

        const measuredWidth =
            Math.floor(
                container.getBoundingClientRect()
                    .width || 400
            );

        Identity.renderButton(
            container,
            {
                type: 'standard',
                theme: 'outline',
                size: 'large',
                text,
                shape: 'rectangular',
                logo_alignment: 'left',
                locale: 'en',
                width: Math.max(
                    200,
                    Math.min(400, measuredWidth)
                ),
                state,
                click_listener: () => {
                    try {
                        onClick?.();
                    } catch (error) {
                        onError?.(error);
                    }
                }
            }
        );

        await waitForRenderedButton(
            container
        );

        return state;
    }

    window.AtlasGoogleIdentity = Object.freeze({
        CLIENT_ID,
        initialize,
        renderButton,
        clearButton
    });
})();
