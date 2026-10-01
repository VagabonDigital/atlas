#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const paths = {
  worker: path.join(root, "shared", "worker.js"),
  cards: path.join(root, "arcade", "forbidden-words", "server", "cards.mjs"),
  game: path.join(root, "arcade", "forbidden-words", "server", "game.mjs"),
  http: path.join(root, "arcade", "forbidden-words", "server", "http.mjs")
};

const START =
  "/* BEGIN GENERATED FORBIDDEN WORDS BACKEND — npm run build:atlas-ai-worker */";
const END =
  "/* END GENERATED FORBIDDEN WORDS BACKEND */";

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

function generatedBlock() {
  const cards = read(paths.cards).replace(/^export\s+/gm, "").trim();
  const game = stripModule(
    read(paths.game),
    /^import\s+\{\s*CARDS\s*\}\s+from\s+["']\.\/cards\.mjs["'];?\s*$/
  );
  const http = stripModule(
    read(paths.http),
    /^import\s+\{\s*initialState,\s*command,\s*view,\s*GameError\s*\}\s+from\s+["']\.\/game\.mjs["'];?\s*$/
  );

  return [
    START,
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
    "})();",
    END
  ].join("\n");
}

function replaceGeneratedBlock(worker, block) {
  const start = worker.indexOf(START);
  const end = worker.indexOf(END);

  if (start < 0 || end < start) {
    throw new Error(
      "shared/worker.js is missing the generated Forbidden Words backend markers."
    );
  }

  return worker.slice(0, start) + block + worker.slice(end + END.length);
}

const worker = read(paths.worker);
const block = generatedBlock();
const currentStart = worker.indexOf(START);
const currentEnd = worker.indexOf(END);
const currentBlock =
  currentStart >= 0 && currentEnd >= currentStart
    ? worker.slice(currentStart, currentEnd + END.length)
    : "";

if (process.argv.includes("--check")) {
  if (currentBlock !== block) {
    console.error(
      "shared/worker.js Forbidden Words backend is stale. Run npm run build:atlas-ai-worker."
    );
    process.exit(1);
  }

  console.log("Atlas AI Worker contains the current Forbidden Words backend.");
  process.exit(0);
}

fs.writeFileSync(paths.worker, replaceGeneratedBlock(worker, block));
console.log("Updated shared/worker.js");
