(function () {
    'use strict';

    if (window.AtlasCheckoutRecoveryBoot) {
        return;
    }

    const params =
        new URLSearchParams(
            window.location.search
        );

    const mode =
        params.get('checkoutState') === 'pro'
            ? 'pro'
            : params.get('paymentState') === 'update'
                ? 'payment'
                : '';

    if (!mode) {
        window.AtlasCheckoutRecoveryBoot =
            Object.freeze({
                active: false,
                mode: '',
                release() {}
            });
        return;
    }

    const root =
        document.documentElement;

    const previousOverflow =
        root.style.overflow;

    let released = false;
    let observer = null;
    let pollTimer = null;
    let failSafeTimer = null;

    function readNightMode() {
        let appearance = null;

        try {
            const sessionId =
                sessionStorage.getItem(
                    'atlas::activeSessionId'
                ) || 'default';

            const bySession =
                JSON.parse(
                    localStorage.getItem(
                        'atlas::appearanceBySession'
                    ) || '{}'
                );

            if (
                bySession &&
                typeof bySession === 'object' &&
                !Array.isArray(bySession)
            ) {
                appearance =
                    bySession[sessionId] ||
                    null;
            }

            if (
                appearance !== 'light' &&
                appearance !== 'night'
            ) {
                appearance =
                    localStorage.getItem(
                        'atlas::appearanceMode'
                    );
            }
        } catch {
            appearance = null;
        }

        return appearance === 'night';
    }

    const night =
        readNightMode();

    const style =
        document.createElement('style');

    style.id =
        'atlas-checkout-recovery-boot-style';

    style.textContent = `
        #atlas-checkout-recovery-boot {
            position: fixed;
            inset: 0;
            z-index: 2147483647;
            width: 100vw;
            height: 100dvh;
            display: grid;
            place-items: center;
            margin: 0;
            padding: 0;
            background: ${night ? '#252826' : '#fffdf9'};
            color: ${night ? '#ebe9e4' : '#211f1b'};
            overscroll-behavior: none;
        }

        #atlas-checkout-recovery-boot .atlas-checkout-recovery-content {
            display: grid;
            justify-items: center;
            gap: 18px;
            padding: 32px 24px;
            text-align: center;
            font-family: "DM Sans", system-ui, sans-serif;
        }

        #atlas-checkout-recovery-boot .atlas-checkout-recovery-brand {
            margin: 0;
            font-family: "DM Serif Display", Georgia, serif;
            font-size: 2rem;
            line-height: 1.1;
            font-weight: 400;
            color: ${night ? '#ebe9e4' : '#211f1b'};
        }

        #atlas-checkout-recovery-boot .atlas-checkout-recovery-brand span {
            color: ${night ? '#8fb2c2' : '#4d7184'};
        }

        #atlas-checkout-recovery-boot .atlas-checkout-recovery-dots {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: .42rem;
            height: 1rem;
        }

        #atlas-checkout-recovery-boot .atlas-checkout-recovery-dot {
            width: .46rem;
            height: .46rem;
            border-radius: 50%;
            background: ${night ? '#8fb2c2' : '#4d7184'};
            animation:
                atlas-checkout-recovery-bounce
                .9s ease-in-out infinite;
        }

        #atlas-checkout-recovery-boot .atlas-checkout-recovery-dot:nth-child(2) {
            animation-delay: .12s;
        }

        #atlas-checkout-recovery-boot .atlas-checkout-recovery-dot:nth-child(3) {
            animation-delay: .24s;
        }

        #atlas-checkout-recovery-boot .atlas-checkout-recovery-copy {
            margin: 0;
            color: ${night ? '#a8a39a' : '#7b7469'};
            font-size: .9rem;
            line-height: 1.4;
        }

        @keyframes atlas-checkout-recovery-bounce {
            0%,
            60%,
            100% {
                transform: translateY(0);
            }

            30% {
                transform: translateY(-4px);
            }
        }

        @media (prefers-reduced-motion: reduce) {
            #atlas-checkout-recovery-boot .atlas-checkout-recovery-dot {
                animation: none;
            }
        }
    `;

    document.head.appendChild(
        style
    );

    const layer =
        document.createElement('div');

    layer.id =
        'atlas-checkout-recovery-boot';

    layer.setAttribute(
        'role',
        'status'
    );
    layer.setAttribute(
        'aria-live',
        'polite'
    );
    layer.setAttribute(
        'aria-busy',
        'true'
    );

    layer.innerHTML = `
        <div class="atlas-checkout-recovery-content">
            <p class="atlas-checkout-recovery-brand">
                Atlas<span>.</span>
            </p>
            <div
                class="atlas-checkout-recovery-dots"
                aria-hidden="true"
            >
                <span class="atlas-checkout-recovery-dot"></span>
                <span class="atlas-checkout-recovery-dot"></span>
                <span class="atlas-checkout-recovery-dot"></span>
            </div>
            <p class="atlas-checkout-recovery-copy">
                ${mode === 'payment'
                    ? 'Preparing secure payment…'
                    : 'Preparing secure checkout…'}
            </p>
        </div>
    `;

    root.style.overflow =
        'hidden';

    root.appendChild(
        layer
    );

    function intentStillActive() {
        try {
            const current =
                new URLSearchParams(
                    window.location.search
                );

            return mode === 'payment'
                ? current.get(
                    'paymentState'
                  ) === 'update'
                : current.get(
                    'checkoutState'
                  ) === 'pro';
        } catch {
            return false;
        }
    }

    function handoffReady() {
        if (mode !== 'payment') {
            return false;
        }

        const paymentUpdate =
            document.getElementById(
                'payment-update'
            );

        if (
            !paymentUpdate ||
            paymentUpdate.dataset.open !==
                'true'
        ) {
            return false;
        }

        const style =
            window.getComputedStyle?.(
                paymentUpdate
            );

        if (!style) {
            return false;
        }

        return (
            style.visibility !== 'hidden' &&
            style.display !== 'none' &&
            Number.parseFloat(
                style.opacity || '0'
            ) >= 0.999
        );
    }

    function release() {
        if (released) {
            return;
        }

        released = true;

        observer?.disconnect?.();

        if (pollTimer) {
            window.clearInterval(
                pollTimer
            );
            pollTimer = null;
        }

        if (failSafeTimer) {
            window.clearTimeout(
                failSafeTimer
            );
            failSafeTimer = null;
        }

        layer.remove();
        style.remove();

        root.style.overflow =
            previousOverflow;
    }

    function inspect() {
        if (
            !intentStillActive() ||
            handoffReady()
        ) {
            release();
        }
    }

    if (
        typeof MutationObserver ===
            'function'
    ) {
        observer =
            new MutationObserver(
                inspect
            );

        observer.observe(
            root,
            {
                attributes: true,
                childList: true,
                subtree: true,
                attributeFilter: [
                    'open',
                    'data-open'
                ]
            }
        );
    }

    pollTimer =
        window.setInterval(
            inspect,
            80
        );

    failSafeTimer =
        window.setTimeout(
            release,
            30000
        );

    window.AtlasCheckoutRecoveryBoot =
        Object.freeze({
            active: true,
            mode,
            release
        });

    inspect();
})();