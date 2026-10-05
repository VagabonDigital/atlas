import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initialState,
  makePuzzle,
  command,
  view,
  MISSIONS,
  trainScan,
} from "../server/game.mjs";
export function crew(seed, id, swap = false) {
  const s = initialState();
  let now = 100000;
  let seq = 0;
  const doAction = (role, action, extra = {}) => {
    now += 200;
    s.seen = { tutor: now, learner: now };
    const actor =
      role === "T"
        ? "tutor"
        : role === "A"
          ? s.roleA
          : s.roleA === "tutor"
            ? "learner"
            : "tutor";
    command(
      s,
      actor,
      { action, id: String(++seq), version: s.version, ...extra },
      now,
    );
    return s;
  };
  doAction("T", "select", { mission: id, seed });
  if (swap) doAction("T", "swap");
  doAction("A", "ready");
  doAction("B", "ready");
  return {
    s,
    doAction,
    now: () => now,
    advance: (ms) => {
      now += ms;
    },
  };
}
export function solve({ s, doAction: d, now, advance }) {
  const p = s.puzzle;
  if (s.mission === "vault") {
    for (const c of p.order) {
      d("B", "pulse", { index: c });
      d("A", "door", { index: p.map[c] });
    }
    for (let c = 0; c < 3; c++) {
      d("B", "isolate", { index: c });
      while ((p.dials[p.dialMap[c]] * p.signs[c] + 4) % 4 !== p.targets[c])
        d("A", "dial", { index: p.dialMap[c] });
    }
    d("A", "release");
    d("B", "release");
  }
  if (s.mission === "gallery") {
    for (let c = 0; c < 6; c++) d("B", "pulse", { index: c });
    for (let c = 0; c < 3; c++)
      while (p.mirrors[p.mirrorMap[c]] !== p.targets[c])
        d("A", "mirror", { index: p.mirrorMap[c] });
    while (p.travel < 6) {
      d("B", "disable", { index: p.emitterMap.indexOf(p.shields[p.travel]) });
      d("A", "move", { index: p.map[p.route[p.travel]] });
    }
    d("A", "prepare");
    d("B", "blackout");
    d("A", "extract");
  }
  if (s.mission === "zero") {
    for (let c = 0; c < 6; c++) d("A", "test", { index: c });
    for (let c = 0; c < 3; c++)
      d("A", "place", { index: p.map.indexOf(p.required[c]), slot: c });
    for (let c = 0; c < 3; c++) d("B", "field", { index: c });
    for (let c = 0; c < 3; c++)
      while (p.rotations[c] !== p.targets[c]) d("A", "rotate", { index: c });
    d("A", "lock");
    d("B", "energy", { index: p.route });
  }
  if (s.mission === "express") {
    for (let c = 0; c < 4; c++) d("B", "pulse", { index: c });
    let safe = -1;
    for (let tries = 0; safe < 0 && tries < 20; tries++) {
      safe = p.configs.findIndex((c, i) => {
        const scan = trainScan({ ...p, lever: i }, now() + 400);
        return (
          c.power.includes(p.target) &&
          scan.active !== p.target &&
          scan.next !== p.target
        );
      });
      if (safe < 0) advance(20000);
    }
    d("A", "lever", { index: safe });
    d("A", "unlock", { index: p.map[p.target] });
    assert.equal(p.opened, true);
    for (let t = 0; t < 240; t++) {
      const scan = trainScan(p, now() + 200);
      if (
        scan.station === 2 &&
        scan.active !== p.target &&
        scan.next !== p.target
      )
        break;
      advance(1000);
    }
    d("B", "arm");
    d("A", "latch");
  }
}
test("four missions resolve across 80 seeds and both role assignments", () => {
  for (const m of MISSIONS)
    for (let seed = 1; seed <= 80; seed++)
      for (const swap of [false, true]) {
        const c = crew(seed, m.id, swap);
        solve(c);
        assert.equal(c.s.phase, "success", m.id + seed);
        assert.equal(c.s.history.length, 1);
        assert.equal(
          view(c.s, "tutor", c.now()).phase,
          view(c.s, "learner", c.now()).phase,
        );
      }
});
test("seeded puzzles repeat exactly and change real solutions", () => {
  for (const m of MISSIONS) {
    assert.deepEqual(makePuzzle(m.id, 12), makePuzzle(m.id, 12));
    assert.notDeepEqual(makePuzzle(m.id, 12), makePuzzle(m.id, 13));
  }
});
test("projections exclude seed, mappings, targets from physical seats, and physical clues from remote seats", () => {
  for (const m of MISSIONS) {
    const { s, now } = crew(123, m.id);
    const a = view(s, "tutor", now()),
      b = view(s, "learner", now());
    for (const v of [a, b]) {
      for (const k of [
        "seed",
        "puzzle",
        "learnerHash",
        "receipts",
        "map",
        "targets",
      ])
        assert.equal(v[k], undefined);
    }
    assert.equal(a.world.map, undefined);
    assert.equal(b.world.map, undefined);
    assert.equal(a.world.targets, undefined);
    for (const k of ["emblems", "landmarks", "components", "marks", "dials"])
      assert.equal(b.world[k], undefined);
    assert.equal(a.world.required, undefined);
    assert.equal(b.world.coupling, undefined);
  }
});
test("authorization, disconnect, stale scope and duplicate safety", () => {
  const c = crew(13, "vault"),
    { s, doAction: d } = c;
  assert.throws(() => d("B", "door", { index: 0 }));
  assert.throws(() => d("B", "finish"));
  const input = { id: "unique", version: s.version, action: "pulse", index: 0 };
  command(s, "learner", input, c.now());
  const version = s.version;
  command(s, "learner", input, c.now());
  assert.equal(s.version, version);
  assert.throws(() =>
    command(s, "learner", { ...input, id: "stale" }, c.now()),
  );
  s.seen.tutor = c.now() - 15000;
  assert.throws(() =>
    command(
      s,
      "learner",
      { action: "pulse", index: 1, id: "offline", version: s.version },
      c.now(),
    ),
  );
  assert.equal(view(s, "learner", c.now()).partnerConnected, false);
});
test("gallery lockdown and retry; room assembly diagnostics; train alerts", () => {
  const g = crew(4, "gallery");
  for (let i = 0; i < 3; i++)
    while (
      g.s.puzzle.mirrors[g.s.puzzle.mirrorMap[i]] !== g.s.puzzle.targets[i]
    )
      g.doAction("A", "mirror", { index: g.s.puzzle.mirrorMap[i] });
  for (let i = 0; i < 3; i++) g.doAction("A", "move", { index: 0 });
  assert.equal(g.s.phase, "failure");
  g.doAction("T", "restart", { seed: 5 });
  assert.equal(g.s.phase, "briefing");
  const z = crew(4, "zero");
  z.doAction("A", "lock");
  assert.equal(z.s.phase, "active");
  assert.equal(z.s.puzzle.locked, false);
  const e = crew(3, "express");
  const p = e.s.puzzle;
  p.opened = true;
  p.openedAt = e.now();
  e.s.stage = 3;
  for (let i = 0; i < 3; i++) e.doAction("A", "latch");
  assert.equal(e.s.phase, "failure");
});
test("authored progressive hints and local reset preserve the seed", () => {
  for (const m of MISSIONS) {
    const c = crew(5, m.id),
      seed = c.s.seed;
    for (let i = 1; i <= 3; i++) {
      c.doAction("A", "hint");
      assert.ok(view(c.s, c.s.roleA, c.now()).hint);
      assert.equal(c.s.hints.A, i);
    }
    c.doAction("A", "reset");
    assert.equal(c.s.seed, seed);
  }
  const vault = crew(5, "vault");
  vault.s.stage = 3;
  vault.s.hints.A = 3;
  assert.match(view(vault.s, vault.s.roleA, vault.now()).hint, /15 seconds/);
});
