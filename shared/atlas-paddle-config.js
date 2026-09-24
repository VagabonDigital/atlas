/* ============================================================
   ATLAS PADDLE PUBLIC CHECKOUT CONFIG

   Client-side Paddle tokens are publishable credentials intended for
   Paddle.js. Never place Paddle API keys or webhook signing secrets here.

   Sandbox and live use separate tokens and catalog IDs. Keep these three
   values together so an environment cutover is one coherent config change.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasPaddleConfig) return;

    const environment = 'sandbox';
    const clientToken = 'test_4daba62599c4c2a77ca0bed2f0e';
    const proMonthly = 'pri_01m32eh22evm0xjtcrm71yndnx';

    const tokenMatchesEnvironment =
        (
            environment === 'sandbox' &&
            clientToken.startsWith('test_')
        ) ||
        (
            environment === 'live' &&
            clientToken.startsWith('live_')
        );

    if (
        !tokenMatchesEnvironment ||
        !proMonthly.startsWith('pri_')
    ) {
        throw new Error(
            'Atlas Paddle public checkout configuration is invalid.'
        );
    }

    window.AtlasPaddleConfig = Object.freeze({
        environment,
        clientToken,
        prices: Object.freeze({
            proMonthly
        })
    });
})();
