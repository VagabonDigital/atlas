const assert = require("node:assert");
const fs = require("node:fs");

const chromeJs = fs.readFileSync(
  "arcade/shared/arcade-game-chrome.js",
  "utf8",
);

const chromeCss = fs.readFileSync(
  "arcade/shared/arcade-game-chrome.css",
  "utf8",
);

assert.ok(
  chromeJs.includes("arcade-game-chrome-game-menu-toggle"),
  "shared Arcade chrome should provide a mobile overflow trigger",
);

assert.ok(
  chromeJs.includes("arcade-game-chrome-game-menu-session"),
  "mobile overflow should preserve Session access",
);

assert.ok(
  chromeJs.includes("arcade-game-chrome-game-menu-search"),
  "mobile overflow should preserve Atlas Search access",
);

assert.ok(
  chromeJs.includes("arcade-game-chrome-game-menu-appearance"),
  "mobile overflow should preserve appearance access",
);

assert.ok(
  chromeJs.includes("markGameHeaderSlots(root, returnTarget, actionsTarget)"),
  "shared chrome should mark mounted header slots for responsive layout",
);

assert.ok(
  chromeCss.includes("@media (max-width: 820px)"),
  "shared chrome should collapse before narrow tablet/mobile widths",
);

assert.ok(
  chromeCss.includes(".arcade-game-chrome-game-direct"),
  "desktop utility controls should collapse into the mobile overflow",
);

assert.ok(
  chromeCss.includes('grid-template-areas: "left context actions";'),
  "mobile game context should stay on the header row immediately before Arcade actions",
);

assert.ok(
  chromeCss.includes("grid-template-columns: minmax(0, 1fr) auto auto;"),
  "mobile game headers should give the title flexible space while keeping context and overflow visible",
);

for (const path of [
  "arcade/would-you-rather/index.html",
  "arcade/truth-trap/index.html",
  "arcade/tomorrow-got-weird/index.html",
  "arcade/forbidden-words/app.mjs",
]) {
  const source = fs.readFileSync(path, "utf8");
  assert.ok(
    source.includes("ArcadeGameChrome.mountGame"),
    path + " should use the shared in-game Arcade chrome",
  );
}

console.log("Arcade mobile chrome contract passed.");
