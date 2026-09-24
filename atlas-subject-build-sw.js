/* ============================================================
   ATLAS SUBJECT BUILD SERVICE WORKER — EXPERIMENTAL BRANCH

   Narrow scope only:
   - no fetch handler
   - no page caching
   - no offline-app rewrite
   - owns only resumable subject-build work when explicitly handed off

   Batch 1 establishes the worker-safe runtime/storage seam. Generation
   ownership is not handed to this worker until later batches.
   ============================================================ */

'use strict';

importScripts(
    '/shared/atlas-subject-build-runner.js'
);

const DB_NAME = 'atlas-tutor-subjects';
const DB_VERSION = 1;
const DB_STORE = 'browser-state';

function openBrowserStateDb() {
    return new Promise((resolve, reject) => {
        const request =
            indexedDB.open(
                DB_NAME,
                DB_VERSION
            );

        request.onupgradeneeded = () => {
            const db = request.result;

            if (
                !db.objectStoreNames.contains(
                    DB_STORE
                )
            ) {
                db.createObjectStore(DB_STORE);
            }
        };

        request.onsuccess = () =>
            resolve(request.result);

        request.onerror = () =>
            reject(
                request.error ||
                new Error(
                    'Atlas subject-build storage could not open.'
                )
            );
    });
}

async function readBrowserState(key) {
    const db = await openBrowserStateDb();

    try {
        return await new Promise(
            (resolve, reject) => {
                const transaction =
                    db.transaction(
                        DB_STORE,
                        'readonly'
                    );

                const request =
                    transaction
                        .objectStore(DB_STORE)
                        .get(key);

                request.onsuccess = () =>
                    resolve(
                        request.result ?? null
                    );

                request.onerror = () =>
                    reject(
                        request.error ||
                        new Error(
                            'Atlas subject-build state could not be read.'
                        )
                    );
            }
        );
    } finally {
        db.close();
    }
}

function checkpointKey(subjectId) {
    return (
        'build-checkpoint:' +
        String(subjectId || '').trim()
    );
}

async function postToClient(
    clientId,
    message
) {
    if (!clientId) return false;

    const client =
        await self.clients.get(clientId);

    if (!client) return false;

    client.postMessage(message);
    return true;
}

self.addEventListener(
    'install',
    event => {
        event.waitUntil(
            self.skipWaiting()
        );
    }
);

self.addEventListener(
    'activate',
    event => {
        event.waitUntil(
            self.clients.claim()
        );
    }
);

self.addEventListener(
    'message',
    event => {
        const message =
            event.data &&
            typeof event.data === 'object'
                ? event.data
                : {};

        if (
            message.type !==
            'atlas:subject-build:probe'
        ) {
            return;
        }

        event.waitUntil(
            (async () => {
                const subjectId =
                    String(
                        message.subjectId || ''
                    ).trim();

                const checkpoint =
                    subjectId
                        ? await readBrowserState(
                            checkpointKey(subjectId)
                        )
                        : null;

                await postToClient(
                    event.source?.id,
                    {
                        type:
                            'atlas:subject-build:probe-result',
                        requestId:
                            String(
                                message.requestId ||
                                ''
                            ),
                        subjectId,
                        runnerReady:
                            typeof self
                                .AtlasSubjectBuildRunner
                                ?.run === 'function',
                        indexedDbReady: true,
                        checkpointFound:
                            Boolean(checkpoint)
                    }
                );
            })()
        );
    }
);
