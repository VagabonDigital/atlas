// Development only. Never deployed. Real game handler + real PostgreSQL (PGlite).
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { database, OWNER } from "./database.mjs";
import { handleForbiddenWords } from "../server/http.mjs";
const { rpc } = await database(process.env.FW_DEV_DATABASE || undefined);
const root = path.resolve(fileURLToPath(new URL("../../../", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const origin = `http://localhost:${port}`;
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    if (url.pathname.startsWith("/forbidden-words/")) {
      let chunks = [],
        size = 0;
      for await (const chunk of req) {
        size += chunk.length;
        if (size > 4096) {
          res.writeHead(413).end();
          return;
        }
        chunks.push(chunk);
      }
      const request = new Request(url, {
        method: req.method,
        headers: req.headers,
        ...(["GET", "HEAD"].includes(req.method)
          ? {}
          : { body: Buffer.concat(chunks) }),
      });
      const response = await handleForbiddenWords(
        request,
        { ALLOWED_ORIGIN: origin },
        {
          rpc,
          authenticate: async (r) =>
            r.headers.get("Authorization") === "Bearer local-verification"
              ? { ok: true, userId: OWNER }
              : { ok: false, status: 401 },
        },
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(await response.text());
      return;
    }
    let relative = decodeURIComponent(url.pathname).replace(/^\/+/, "");
    if (
      /(^|\/)(server|dev|supabase|tests|scripts|node_modules|\.[^/]*)(\/|$)/.test(
        relative,
      ) ||
      relative === "shared/worker.js"
    ) {
      res.writeHead(404).end();
      return;
    }
    let file = path.resolve(
      root,
      relative || "arcade/forbidden-words/index.html",
    );
    if (!file.startsWith(root + path.sep)) {
      res.writeHead(403).end();
      return;
    }
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    let data = await readFile(file);
    if (
      file.endsWith(".html") &&
      file.includes(`${path.sep}forbidden-words${path.sep}`)
    ) {
      data = Buffer.from(
        data
          .toString()
          .replace(
            "<head>",
            '<head><meta name="fw-api" content="/forbidden-words/"><meta name="fw-local-verification" content="true">',
          ),
      );
    }
    res.writeHead(200, {
      "Content-Type": types[path.extname(file)] || "application/octet-stream",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
    });
    res.end(data);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(port, "127.0.0.1", () =>
  console.log(
    `Forbidden Words local verification: ${origin}/arcade/forbidden-words/`,
  ),
);
