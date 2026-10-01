#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const paths = {
  worker: path.join(root, "shared", "worker.js"),
  cards: path.join(root, "arcade", "forbidden-words", "server", "cards.mjs"),
  game: path.join(root, "arcade", "forbidden-words", "server", "game.mjs"),
  http: path.join(root, "arcade", "forbidden-words", "server", "http.mjs"),
  output: path.join(root, "shared", "worker.cloudflare.js")
};

function read(file) {
  return fs.readFileSync(file, "utf8");
}

function stripModule(source, importRegex) {
  const matches = source.match(new RegExp(importRegex.source, "gm")) || [];
  if (matches.length !== 1) {
    throw new Error(`Expected exactly one import match, found ${matches.length}.`);
  }
  return source
    .replace(new RegExp(importRegex.source, "m"), "")
    .replace(/^export\s+/gm, "")
    .trim();
}

function indent(source, spaces = 4) {
  const pad = " ".repeat(spaces);
  return source
    .split("\n")
    .map(line => (line ? pad + line : ""))
    .join("\n");
}

function build() {
  const worker = read(paths.worker);
  const cards = read(paths.cards).replace(/^export\s+/gm, "").trim();
  const game = stripModule(
    read(paths.game),
    /^import\s+\{\s*CARDS\s*\}\s+from\s+["']\.\/cards\.mjs["'];?\s*$/
  );
  const http = stripModule(
    read(paths.http),
    /^import\s+\{\s*initialState,\s*command,\s*view,\s*GameError\s*\}\s+from\s+["']\.\/game\.mjs["'];?\s*$/
  );

  const workerImport =
    /^import\s+\{\s*handleForbiddenWords\s*\}\s+from\s+["']\.\.\/arcade\/forbidden-words\/server\/http\.mjs["'];?\s*$/m;

  const importMatches =
    worker.match(new RegExp(workerImport.source, "gm")) || [];

  if (importMatches.length !== 1) {
    throw new Error(
      `Expected exactly one Forbidden Words import in shared/worker.js, found ${importMatches.length}.`
    );
  }

  const block = [
    "/* GENERATED FOR CLOUDFLARE DEPLOYMENT.",
    "   Source of truth remains shared/worker.js plus the Forbidden Words server modules.",
    "   Regenerate with: npm run build:atlas-ai-worker",
    "   Do not hand-edit this generated file. */",
    "const handleForbiddenWords = (() => {",
    "    /* arcade/forbidden-words/server/cards.mjs */",
    indent(cards),
    "",
    "    /* arcade/forbidden-words/server/game.mjs */",
    indent(game),
    "",
    "    /* arcade/forbidden-words/server/http.mjs */",
    indent(http),
    "",
    "    return handleForbiddenWords;",
    "})();"
  ].join("\n");

  return worker.replace(workerImport, block);
}

const generated = build();
const checkOnly = process.argv.includes("--check");

if (checkOnly) {
  if (!fs.existsSync(paths.output)) {
    console.error("Missing shared/worker.cloudflare.js. Run npm run build:atlas-ai-worker.");
    process.exit(1);
  }

  const current = read(paths.output);
  if (current !== generated) {
    console.error("shared/worker.cloudflare.js is stale. Run npm run build:atlas-ai-worker.");
    process.exit(1);
  }

  console.log("Atlas AI Cloudflare bundle is current.");
  process.exit(0);
}

fs.writeFileSync(paths.output, generated);
console.log("Built shared/worker.cloudflare.js");
