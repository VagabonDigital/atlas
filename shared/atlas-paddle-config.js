/* ============================================================
   ATLAS PADDLE PUBLIC CHECKOUT CONFIG

   Client-side Paddle tokens are publishable credentials intended for
   Paddle.js. Never place Paddle API keys or webhook signing secrets here.

   Sandbox and live use separate tokens and catalog IDs. Stage 6.3 migration
   replaces this sandbox config with live equivalents after end-to-end tests.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasPaddleConfig) return;

    window.AtlasPaddleConfig = Object.freeze({
        environment: 'sandbox',
        clientToken: 'test_4daba62599c4c2a77ca0bed2f0e',
        prices: Object.freeze({
            proMonthly: 'pri_01m32eh22evm0xjtcrm71yndnx'
        })
    });
})();
