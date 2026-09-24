/* ============================================================
   ATLAS PADDLE PUBLIC CHECKOUT CONFIG

   Client-side Paddle tokens are publishable credentials intended for
   Paddle.js. Never place Paddle API keys or webhook signing secrets here.

   Sandbox and live use separate tokens and catalog IDs. Both environments
   are staged here; changing `environment` is the only public cutover switch.
   ============================================================ */

(function () {
    'use strict';

    if (window.AtlasPaddleConfig) return;

    const environment = 'sandbox';

    const environments = Object.freeze({
        sandbox: Object.freeze({
            clientToken:
                'test_4daba62599c4c2a77ca0bed2f0e',
            prices: Object.freeze({
                proMonthly:
                    'pri_01m32eh22evm0xjtcrm71yndnx'
            })
        }),
        live: Object.freeze({
            clientToken: '',
            prices: Object.freeze({
                proMonthly:
                    'pri_01m3apem2h7h1g2bt44j2hnxqp'
            })
        })
    });

    const selected =
        environments[environment];

    const tokenMatchesEnvironment =
        (
            environment === 'sandbox' &&
            selected?.clientToken
                ?.startsWith('test_')
        ) ||
        (
            environment === 'live' &&
            selected?.clientToken
                ?.startsWith('live_')
        );

    if (
        !selected ||
        !tokenMatchesEnvironment ||
        !selected.prices
            ?.proMonthly
            ?.startsWith('pri_')
    ) {
        throw new Error(
            'Atlas Paddle public checkout configuration is invalid.'
        );
    }

    window.AtlasPaddleConfig = Object.freeze({
        environment,
        clientToken:
            selected.clientToken,
        prices:
            selected.prices
    });
})();
