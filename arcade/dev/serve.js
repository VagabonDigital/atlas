#!/usr/bin/env node
/* Engine One — the development server.

   ES modules need a server, so this serves `arcade/` over HTTP and pushes a
   reload when a file under it changes. Development only: it binds to the
   loopback address, serves nothing outside the folder and caches nothing.

     node dev/serve.js [--port 4173]
*/

import { createServer } from 'node:http';
import { createReadStream, watch } from 'node:fs';
import { stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const HOME = '/engines/shared-plan-workbench/';
const IGNORED = ['node_modules', 'test-results'];

const TYPES = Object.freeze({
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.mjs': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.webp': 'image/webp',
    '.woff2': 'font/woff2',
    '.md': 'text/markdown; charset=utf-8'
});

function resolveWithin(urlPath) {
    const decoded = decodeURIComponent(urlPath.split('?')[0]);
    const withIndex = decoded.endsWith('/') ? `${decoded}index.html` : decoded;
    const full = resolve(join(ROOT, normalize(withIndex)));
    return full === ROOT || full.startsWith(ROOT + sep) ? full : null;
}

export async function startServer({ port = 4173, host = '127.0.0.1', liveReload = true } = {}) {
    const listeners = new Set();
    const sockets = new Set();

    const server = createServer(async (request, response) => {
        const url = request.url ?? '/';

        if (url.startsWith('/__reload')) {
            response.writeHead(200, {
                'content-type': 'text/event-stream',
                'cache-control': 'no-store',
                connection: 'keep-alive'
            });
            response.write(': waiting\n\n');
            listeners.add(response);
            request.on('close', () => listeners.delete(response));
            return;
        }

        if (url === '/' || url === '') {
            response.writeHead(302, { location: HOME });
            response.end();
            return;
        }

        const file = resolveWithin(url);
        if (!file) {
            response.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
            response.end('Outside the served folder.');
            return;
        }

        try {
            const info = await stat(file);
            if (info.isDirectory()) {
                response.writeHead(302, { location: `${url.replace(/\/?$/u, '')}/` });
                response.end();
                return;
            }
            response.writeHead(200, {
                'content-type': TYPES[extname(file).toLowerCase()] ?? 'application/octet-stream',
                'cache-control': 'no-store'
            });
            createReadStream(file).pipe(response);
        } catch {
            response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
            response.end(`Not found: ${url}`);
        }
    });

    server.on('connection', (socket) => {
        sockets.add(socket);
        socket.on('close', () => sockets.delete(socket));
    });

    await new Promise((ready) => server.listen(port, host, ready));
    const actual = server.address().port;

    let watcher = null;
    let pending = null;
    if (liveReload) {
        watcher = watch(ROOT, { recursive: true }, (_event, filename) => {
            if (filename && IGNORED.some((skip) => String(filename).startsWith(skip))) return;
            clearTimeout(pending);
            pending = setTimeout(() => {
                for (const listener of listeners) listener.write('data: reload\n\n');
            }, 120);
        });
    }

    const origin = `http://${host}:${actual}`;
    return {
        url: origin,
        home: `${origin}${HOME}`,
        async close() {
            clearTimeout(pending);
            watcher?.close();
            for (const listener of listeners) listener.end();
            listeners.clear();
            for (const socket of sockets) socket.destroy();
            await new Promise((done) => server.close(done));
        }
    };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
    const flag = process.argv.indexOf('--port');
    const port = flag === -1 ? 4173 : Number(process.argv[flag + 1]);
    const server = await startServer({ port });
    console.log(`Engine One workbench: ${server.home}`);
    console.log('Serving', ROOT, '— press Ctrl+C to stop.');
}
