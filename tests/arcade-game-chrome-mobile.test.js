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
const tomorrow = fs.readFileSync(
  "arcade/tomorrow-got-weird/index.html",
  "utf8",
);
const forbiddenApp = fs.readFileSync(
  "arcade/forbidden-words/app.mjs",
  "utf8",
);
const forbiddenCss = fs.readFileSync(
  "arcade/forbidden-words/game.css",
  "utf8",
);
const millionaire = fs.readFileSync(
  "arcade/millionaire/app.mjs",
  "utf8",
);

assert.ok(
  chromeJs.includes("arcade-game-chrome-game-menu-toggle"),
  "shared Arcade chrome should retain the responsive menu capability for games that genuinely need it",
);

assert.ok(
  chromeJs.includes("settings[control] !== true"),
  "active Atlas management controls should be opt-in rather than default gameplay chrome",
);

assert.ok(
  chromeJs.includes("settings.mobileMenu !== true"),
  "an empty mobile menu shell should survive only when a game explicitly reuses it for game-owned utilities",
);

for (const control of ["session", "search", "appearance"]) {
  assert.ok(
    chromeJs.includes(`arcade-game-chrome-game-menu-${control}`),
    `shared Arcade chrome should still support an explicitly requested ${control} control`,
  );
}

assert.ok(
  chromeJs.includes("document.startViewTransition(apply)"),
  "Arcade appearance should transition the whole viewport when supported",
);
assert.ok(
  !chromeJs.includes("}, 320);"),
  "Arcade appearance should not keep a competing 320ms transition timer",
);
assert.ok(
  chromeCss.includes("--game-chrome-theme-motion: 280ms"),
  "Arcade appearance motion should use the canonical 280ms duration",
);
assert.ok(
  chromeCss.includes("::view-transition-old(root)"),
  "Arcade appearance should define a viewport-level transition",
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
  "explicit desktop utility controls should collapse into the mobile overflow when present",
);

assert.ok(
  chromeCss.includes('grid-template-areas: "left context actions";'),
  "mobile game context should stay on the header row immediately before Arcade actions",
);

assert.ok(
  chromeCss.includes("grid-template-columns: minmax(0, 1fr) auto auto;"),
  "mobile game headers should give the title flexible space while keeping context and actions visible",
);

assert.ok(
  !tomorrow.includes("#progress-label {\n        display: none;"),
  "Tomorrow Got Weird should keep global scenario progress visible in the mobile header",
);

const forbiddenBaseHeader = forbiddenCss.match(
  /\.game-heading \{([\s\S]*?)\n\}/,
);
assert.ok(
  forbiddenBaseHeader &&
    !forbiddenBaseHeader[1].includes("grid-template-columns"),
  "Forbidden Words should not override the shared mobile Chrome grid from its base header rule",
);
assert.ok(
  forbiddenCss.includes("@media (min-width: 821px)"),
  "Forbidden Words may keep its symmetric three-column header only above the shared mobile Chrome breakpoint",
);

assert.match(
  forbiddenApp,
  /ArcadeGameChrome\.mountGame\(\{[\s\S]*?session:\s*false,[\s\S]*?search:\s*false,[\s\S]*?appearance:\s*false,[\s\S]*?mobileMenu:\s*true/,
  "Forbidden Words active play should remove Atlas management controls while retaining its game-owned mobile utility menu",
);

assert.match(
  millionaire,
  /ArcadeGameChrome\.mountLanding\(\{[^}]*appearance:\s*false[^}]*\}\)/,
  "Millionaire entrance should keep its fixed theatrical appearance without an Atlas theme toggle",
);
assert.match(
  millionaire,
  /ArcadeGameChrome\.mountGame\(\{[^}]*session:\s*false,[^}]*search:\s*false,[^}]*appearance:\s*false[^}]*\}\)/,
  "Millionaire active play should remain Back-only",
);

for (const path of [
  "arcade/would-you-rather/index.html",
  "arcade/truth-trap/index.html",
  "arcade/tomorrow-got-weird/index.html",
  "arcade/forbidden-words/app.mjs",
  "arcade/millionaire/app.mjs",
]) {
  const source = fs.readFileSync(path, "utf8");
  assert.ok(
    source.includes("ArcadeGameChrome.mountGame"),
    path + " should use the shared in-game Arcade chrome",
  );
}

console.log("Arcade mobile chrome contract passed.");
