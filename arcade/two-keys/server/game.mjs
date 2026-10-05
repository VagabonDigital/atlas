export class GameError extends Error {
  constructor(message, status = 409) {
    super(message);
    this.status = status;
  }
}
export const MISSIONS = [
  {
    id: "vault",
    title: "The Glass Vault",
    place: "A private collection · Geneva",
    objective:
      "Reach the vault. Open its three glass layers. Extract the case.",
    roles: ["Service Corridor", "Security Control"],
    tags: "Correspondence · Remote operation",
    steps: [
      "Trace the circuits",
      "Open the route",
      "Balance the locks",
      "Two-key release",
    ],
  },
  {
    id: "gallery",
    title: "The Black Gallery",
    place: "After hours · Copenhagen",
    objective: "Reshape the laser lattice. Cross the gallery. Lift the piece.",
    roles: ["Gallery Floor", "Security Lens"],
    tags: "Spatial reasoning · Transformation",
    steps: [
      "Map the gallery",
      "Reshape the lattice",
      "Cross the floor",
      "Extraction window",
    ],
  },
  {
    id: "zero",
    title: "Room Zero",
    place: "A sealed research wing · Zürich",
    objective:
      "Build a three-part bypass. Connect the energy route. Open the chamber.",
    roles: ["Specimen Lab", "Control Chamber"],
    tags: "Construction · Shared constraints",
    steps: [
      "Test the components",
      "Build the bypass",
      "Transform the fields",
      "Activate the chamber",
    ],
  },
  {
    id: "express",
    title: "Midnight Express",
    place: "Northbound · 00:17",
    objective:
      "Find the protected cargo. Create a scan gap. Release the package.",
    roles: ["Cargo Car", "Signal Desk"],
    tags: "Shared constraints · Coordination",
    steps: [
      "Map the cargo",
      "Find the target",
      "Create a scan gap",
      "Release the case",
    ],
  },
];
const SYMBOLS = ["Triangle", "Crescent", "Diamond", "Ring", "Wave", "Star"];
const SHAPES = ["Fork", "Coil", "Prism", "Ring", "Bridge", "Crown"];
const SIGS = ["Stable", "Inverter", "Bridge", "Echo", "Split", "Sink"];
const LANDMARKS = ["Wing", "Sphere", "Arch", "Spiral", "Obelisk", "Crown"];
function random(seed) {
  let n = seed >>> 0;
  return () => {
    n += 0x6d2b79f5;
    let t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle(list, r) {
  const a = [...list];
  for (let i = a.length - 1; i; i--) {
    const j = Math.floor(r() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
export function makePuzzle(id, seed) {
  const r = random(seed),
    perm = (n) =>
      shuffle(
        Array.from({ length: n }, (_, i) => i),
        r,
      ),
    int = (n) => Math.floor(r() * n);
  const common = { pulse: -1, pulseUntil: 0, release: {}, alerts: 0 };
  if (id === "vault")
    return {
      ...common,
      map: perm(3),
      emblems: shuffle(SYMBOLS, r).slice(0, 3),
      order: perm(3),
      doors: 0,
      dialMap: perm(3),
      dials: [0, 0, 0],
      targets: [1 + int(3), 1 + int(3), 1 + int(3)],
      signs: [0, 1, 2].map(() => (r() > 0.5 ? 1 : -1)),
      isolate: 0,
    };
  if (id === "gallery") {
    const route = r() > 0.5 ? [0, 1, 2, 5, 4, 3] : [2, 1, 0, 3, 4, 5];
    const transforms = [
      [0, 1, 2, 3, 4, 5],
      [2, 1, 0, 5, 4, 3],
      [3, 4, 5, 0, 1, 2],
      [5, 4, 3, 2, 1, 0],
    ];
    return {
      ...common,
      map: transforms[int(4)],
      landmarks: shuffle(LANDMARKS, r),
      route,
      mirrors: [0, 0, 0],
      mirrorMap: perm(3),
      targets: [1 + int(3), 1 + int(3), 1 + int(3)],
      position: -1,
      travel: 0,
      disabled: false,
      shields: route.map(() => int(3)),
      emitterMap: perm(3),
      ready: false,
      window: 0,
    };
  }
  if (id === "zero")
    return {
      ...common,
      map: perm(6),
      test: -1,
      tested: [],
      required: perm(6).slice(0, 3),
      slots: [-1, -1, -1],
      rotations: [0, 0, 0],
      targets: [int(4), int(4), int(4)],
      fieldMap: perm(3),
      fieldEffects: [1, 3, 1],
      fields: [],
      locked: false,
      route: int(2),
    };
  const map = perm(4),
    target = int(4),
    mate = (target + 1 + int(3)) % 4,
    marks = [0, 1, 2, 3].map((i) =>
      i === target || i === [0, 1, 2, 3].find((j) => j !== target && j !== mate)
        ? "Double notch"
        : "Single notch",
    );
  const configs = perm(4).map((i) => ({
    power: [i, (i + 1) % 4],
    scan: (i + 2) % 4,
  }));
  const good = configs.findIndex((c) => c.power.includes(target));
  return {
    ...common,
    map,
    emblems: shuffle(SYMBOLS, r).slice(0, 4),
    target,
    candidates: [target, mate].sort(),
    marks,
    configs,
    lever: (good + 2) % 4,
    scanOrder: perm(4),
    scanTick: 0,
    opened: false,
    window: 0,
    station: 0,
  };
}
export function initialState() {
  return {
    phase: "library",
    mission: null,
    run: 0,
    version: 0,
    roleA: "tutor",
    ready: {},
    seen: { tutor: 0, learner: 0 },
    receipts: [],
    history: [],
    hints: { A: 0, B: 0 },
    hintStage: "",
    feedback: "",
    feedbackId: 0,
    learnerHash: null,
    invite: null,
    rate: {},
  };
}
const roleOf = (s, a) => (s.roleA === a ? "A" : "B");
const online = (s, now) =>
  ["tutor", "learner"].every((a) => s.seen[a] > 0 && now - s.seen[a] < 12000);
function need(ok, msg = "That control is not available now.") {
  if (!ok) throw new GameError(msg);
}
function integer(n, max) {
  need(Number.isInteger(n) && n >= 0 && n < max, "Invalid control.");
  return n;
}
function note(s, text) {
  s.feedback = text;
  s.feedbackId++;
}
function stage(s, n) {
  if (s.stage !== n) {
    s.stage = n;
    s.hints = { A: 0, B: 0 };
  }
}
function won(s, now) {
  s.phase = "success";
  s.history.push({
    mission: s.mission,
    seed: s.seed,
    roleA: s.roleA,
    completed: true,
    at: now,
    hints: s.hintCount,
  });
  s.history = s.history.slice(-100);
  note(s, "Two perspectives. One impossible job.");
}
function mistake(s, text, hard = false) {
  if (hard) s.puzzle.alerts++;
  note(s, text);
  if (hard && s.puzzle.alerts >= 3) {
    s.phase = "failure";
    note(s, "Security lockdown. The job can be retried immediately.");
  }
}
function start(s, seed) {
  s.seed = seed >>> 0;
  s.run++;
  s.puzzle = makePuzzle(s.mission, s.seed);
  s.phase = "briefing";
  s.stage = 0;
  s.ready = {};
  s.hints = { A: 0, B: 0 };
  s.hintCount = 0;
  s.feedback = "";
}
export function command(s, actor, input, now) {
  need(["tutor", "learner"].includes(actor), "Unknown seat.");
  const action = input.action || "poll",
    key = `${actor}:${input.id}`;
  const budget = s.rate[actor] || { at: now, count: 0 };
  if (now - budget.at > 10000) {
    budget.at = now;
    budget.count = 0;
  }
  need(++budget.count <= 100, "Too many actions. Please wait a moment.");
  s.rate[actor] = budget;
  if (!online(s, now) && s.puzzle) {
    s.puzzle.release = {};
    s.puzzle.window = 0;
  }
  s.seen[actor] = now;
  if (action === "poll") return;
  need(
    typeof input.id === "string" && input.id.length <= 80,
    "An action ID is required.",
  );
  if (s.receipts.includes(key)) return;
  s.serial ||= { A: 0, B: 0 };
  need(
    input.version === s.version ||
      (input.serial === s.serial[roleOf(s, actor)] &&
        input.run === s.run &&
        input.stage === s.stage),
    "The mechanism changed. Check its new state and try again.",
  );
  const role = roleOf(s, actor),
    p = s.puzzle;
  if (
    [
      "select",
      "restart",
      "leave",
      "finish",
      "swap",
      "replace-learner",
    ].includes(action)
  ) {
    need(actor === "tutor", "Only the tutor can manage the session.");
    if (action === "select") {
      need(["library", "success", "failure", "finished"].includes(s.phase));
      need(MISSIONS.some((m) => m.id === input.mission));
      s.mission = input.mission;
      start(s, input.seed);
    }
    if (action === "restart") {
      need(s.mission);
      start(s, input.seed);
    }
    if (action === "leave") {
      s.phase = "library";
      s.ready = {};
    }
    if (action === "finish") s.phase = "finished";
    if (action === "swap") {
      need(s.phase === "briefing");
      s.roleA = s.roleA === "tutor" ? "learner" : "tutor";
      s.ready = {};
    }
    if (action === "replace-learner") {
      need(!online(s, now), "Your partner is still connected.");
      s.learnerHash = null;
      s.seen.learner = 0;
      s.ready = {};
      if (s.phase === "active") s.phase = "briefing";
    }
  } else if (action === "ready") {
    need(s.phase === "briefing");
    s.ready[actor] = true;
    if (s.ready.tutor && s.ready.learner && online(s, now)) s.phase = "active";
  } else {
    need(s.phase === "active", "The mission is not active.");
    need(
      online(s, now),
      "Waiting for your partner to reconnect. Your progress is safe.",
    );
    if (action === "hint") {
      s.hints[role] = Math.min(3, s.hints[role] + 1);
      s.hintCount++;
    } else if (action === "reset") {
      if (s.mission === "vault") {
        p.dials = [0, 0, 0];
        if (s.stage === 3) stage(s, 2);
      }
      if (s.mission === "gallery") {
        p.mirrors = [0, 0, 0];
        p.position = -1;
        p.travel = 0;
        p.disabled = false;
        p.ready = false;
        stage(s, 1);
      }
      if (s.mission === "zero") {
        p.slots = [-1, -1, -1];
        p.rotations = [0, 0, 0];
        p.locked = false;
        p.fields = [];
        stage(s, 1);
      }
      if (s.mission === "express") {
        p.opened = false;
        stage(s, 1);
      }
      p.window = 0;
      p.release = {};
      note(s, "Local mechanism reset. Your discoveries are still useful.");
    } else if (action === "pulse") {
      need(role === "B" && s.mission !== "zero");
      p.pulse = integer(
        input.index,
        s.mission === "gallery" ? 6 : s.mission === "vault" ? 3 : 4,
      );
      p.pulseUntil = now + 5000;
      if (s.stage === 0) stage(s, 1);
    } else if (s.mission === "vault") vault(s, role, input, now);
    else if (s.mission === "gallery") gallery(s, role, input, now);
    else if (s.mission === "zero") zero(s, role, input, now);
    else if (s.mission === "express") express(s, role, input, now);
    else throw new GameError("Unknown action.");
  }
  s.version++;
  s.serial[role]++;
  s.receipts.push(key);
  s.receipts = s.receipts.slice(-256);
}
const pressure = (p, c) => (p.dials[p.dialMap[c]] * p.signs[c] + 4) % 4;
function vault(s, r, a, now) {
  const p = s.puzzle;
  if (a.action === "door") {
    need(r === "A" && s.stage < 2);
    const i = integer(a.index, 3);
    if (i === p.map[p.order[p.doors]]) {
      p.doors++;
      note(s, "A security door slides open.");
      if (p.doors === 3) stage(s, 2);
    } else
      mistake(
        s,
        "Security pulse. That door stays closed; the open route is preserved.",
      );
  } else if (a.action === "dial") {
    need(r === "A" && s.stage === 2);
    const i = integer(a.index, 3);
    p.dials[i] = (p.dials[i] + 1) % 4;
    if (p.targets.every((n, c) => pressure(p, c) === n)) {
      stage(s, 3);
      note(s, "Three lock channels aligned. Both releases are live.");
    }
  } else if (a.action === "isolate") {
    need(r === "B" && s.stage === 2);
    p.isolate = integer(a.index, 3);
  } else if (a.action === "release") {
    need(s.stage === 3);
    p.release[r] = now;
    if (
      p.release.A &&
      p.release.B &&
      Math.abs(p.release.A - p.release.B) <= 15000
    )
      won(s, now);
    else note(s, "One release is held. Your partner has 15 seconds.");
  } else throw new GameError("This control belongs to the other perspective.");
}
function gallery(s, r, a, now) {
  const p = s.puzzle;
  if (a.action === "mirror") {
    need(r === "A" && s.stage < 3);
    const i = integer(a.index, 3);
    p.mirrors[i] = (p.mirrors[i] + 1) % 4;
    p.disabled = false;
    if (p.targets.every((n, c) => p.mirrors[p.mirrorMap[c]] === n)) {
      stage(s, 2);
      note(s, "The laser lattice is redirected. A route is possible.");
    } else stage(s, 1);
  } else if (a.action === "disable") {
    need(r === "B" && s.stage === 2);
    const i = integer(a.index, 3);
    if (p.emitterMap[i] === p.shields[p.travel]) {
      p.disabled = true;
      note(s, "One emitter goes dark. The next crossing is protected.");
    } else
      mistake(
        s,
        "The shield rejects this emitter. Ask which shield mark is visible.",
      );
  } else if (a.action === "move") {
    need(r === "A" && s.stage === 2);
    const i = integer(a.index, 6);
    if (p.disabled && i === p.map[p.route[p.travel]]) {
      p.position = p.route[p.travel];
      p.travel++;
      p.disabled = false;
      note(s, "A floor sensor settles behind you.");
      if (p.travel === 6) stage(s, 3);
    } else
      mistake(
        s,
        "An active beam catches the crossing. Back at the previous safe position.",
        true,
      );
  } else if (a.action === "prepare") {
    need(r === "A" && s.stage === 3);
    p.ready = true;
    note(s, "The display mechanism is ready.");
  } else if (a.action === "blackout") {
    need(
      r === "B" && s.stage === 3 && p.ready,
      "Wait for the physical extraction mechanism.",
    );
    p.window = now + 15000;
    note(s, "The lattice is dark for 15 seconds. Lift the piece.");
  } else if (a.action === "extract") {
    need(r === "A" && s.stage === 3);
    if (p.window > now) won(s, now);
    else
      mistake(
        s,
        "The blackout is closed. Ask your partner to open another window.",
      );
  } else throw new GameError("This control is not available in your position.");
}
function zero(s, r, a, now) {
  const p = s.puzzle;
  if (a.action === "test") {
    need(r === "A");
    p.test = integer(a.index, 6);
    if (!p.tested.includes(p.test)) p.tested.push(p.test);
    if (s.stage === 0) stage(s, 1);
  } else if (a.action === "place") {
    need(r === "A" && !p.locked);
    const i = integer(a.index, 6),
      slot = integer(a.slot, 3);
    need(
      !p.slots.includes(i) || p.slots[slot] === i,
      "That component is already in a socket.",
    );
    p.slots[slot] = i;
    if (p.slots.filter((n) => n >= 0).length >= 2) stage(s, 2);
  } else if (a.action === "rotate") {
    need(r === "A" && !p.locked);
    const i = integer(a.index, 3);
    need(p.slots[i] >= 0, "Place a component first.");
    p.rotations[i] = (p.rotations[i] + 1) % 4;
  } else if (a.action === "field") {
    need(
      r === "B" && !p.locked && p.slots.filter((n) => n >= 0).length >= 2,
      "Place at least two components first.",
    );
    const i = integer(a.index, 3),
      slot = p.fieldMap[i];
    p.rotations[slot] = (p.rotations[slot] + p.fieldEffects[i]) % 4;
    if (!p.fields.includes(slot)) p.fields.push(slot);
    note(s, "A field turns a socket and reveals its alignment mark.");
  } else if (a.action === "lock") {
    need(r === "A");
    if (
      p.slots.every(
        (n, i) =>
          n >= 0 &&
          p.map[n] === p.required[i] &&
          p.rotations[i] === p.targets[i],
      ) &&
      p.fields.length === 3
    ) {
      p.locked = true;
      stage(s, 3);
      note(s, "The physical assembly is locked. Complete the energy route.");
    } else
      mistake(
        s,
        "Assembly rejected. Check signatures, revealed alignment marks, and all three fields.",
      );
  } else if (a.action === "energy") {
    need(r === "B" && p.locked);
    if (integer(a.index, 2) === p.route) won(s, now);
    else {
      p.locked = false;
      stage(s, 2);
      mistake(
        s,
        "Energy returns to the bench. Check the physical coupling shape, then lock again.",
      );
    }
  } else throw new GameError("This control is not available in your position.");
}
export function trainScan(p, now) {
  const tick = Math.floor(now / 20000);
  return {
    active: p.scanOrder[(tick + p.configs[p.lever].scan) % 4],
    next: p.scanOrder[(tick + 1 + p.configs[p.lever].scan) % 4],
    station: p.opened ? Math.floor((now - p.openedAt) / 10000) % 3 : 0,
  };
}
function express(s, r, a, now) {
  const p = s.puzzle,
    c = p.configs[p.lever],
    scan = trainScan(p, now),
    safe =
      c.power.includes(p.target) &&
      scan.active !== p.target &&
      scan.next !== p.target;
  if (a.action === "lever") {
    need(r === "A" && !p.opened);
    p.lever = integer(a.index, 4);
    stage(s, 2);
    note(s, "Power moves between the cargo channels.");
  } else if (a.action === "unlock") {
    need(r === "A" && !p.opened);
    if (integer(a.index, 4) === p.map[p.target] && safe) {
      p.opened = true;
      p.openedAt = now;
      stage(s, 3);
      note(s, "The protected case is revealed.");
    } else
      mistake(
        s,
        "Scan warning. The latch closes again. Check the marks, power, and next scan.",
      );
  } else if (a.action === "arm") {
    need(
      r === "B" && p.opened && scan.station === 2,
      "The extraction point is not in range yet. It comes around again.",
    );
    if (!safe)
      mistake(
        s,
        "Release crosses a scan. Wait for a gap covering this scan and the next.",
        true,
      );
    else {
      p.window = now + 15000;
      note(s, "Remote release armed for 15 seconds.");
    }
  } else if (a.action === "latch") {
    need(r === "A" && p.opened);
    if (p.window > now) won(s, now);
    else
      mistake(
        s,
        "The release is outside the safe window. The case remains secured.",
        true,
      );
  } else throw new GameError("This control is not available in your position.");
}
function hint(s, r) {
  const n = s.hints[r];
  if (!n) return null;
  const p = s.puzzle;
  const base = {
    vault: [
      "Test one circuit or one dial in isolation.",
      "A physical object and a remote channel are linked. Describe the change, not just its colour.",
    ],
    gallery: [
      "Pulse one channel and describe the nearby sculpture.",
      "The numbered security nodes and the sculptures occupy the same gallery. Mirrors redirect remote beams.",
    ],
    zero: [
      "Put one unknown component in the test socket.",
      "Your partner sees a signature rather than a physical shape. Fields reveal alignment marks on the bench.",
    ],
    express: [
      "Route power to one channel and describe the responding emblem.",
      "Combine the physical double notch with the two candidate security channels. The lever changes power and the next scan.",
    ],
  }[s.mission];
  if (n < 3) return base[n - 1];
  if (s.mission === "vault")
    return s.stage === 3
      ? "Both partners must press their release within 15 seconds. If the window closes, agree on a new moment and press again."
      : s.stage < 2
        ? `Circuit ${p.order[p.doors] + 1} lights the ${p.emblems[p.map[p.order[p.doors]]]} door. That is the next route step.`
        : `Lock ${p.isolate + 1} responds to dial ${p.dialMap[p.isolate] + 1}. Move it until the remote reading matches its target.`;
  if (s.mission === "gallery")
    return s.stage < 2
      ? `Mirror ${p.mirrorMap[0] + 1} controls beam 1. Its receiver needs position ${p.targets[0] + 1}.`
      : s.stage === 2
        ? `The next crossing is node ${p.route[p.travel] + 1}, beside ${p.landmarks[p.map[p.route[p.travel]]]}, after the matching shield emitter is disabled.`
        : "Prepare the display, open a blackout from Security Lens, then lift the piece.";
  if (s.mission === "zero")
    return s.stage < 3
      ? `${SHAPES[p.map.indexOf(p.required[0])]} carries ${SIGS[p.required[0]]}, needed in the left socket. All three fields must reveal their alignment marks.`
      : "The lab sees the coupling shape. Choose the matching energy path remotely.";
  return s.stage < 3
    ? `Channel ${p.candidates[0] + 1} lights ${p.emblems[p.map[p.candidates[0]]]}. Compare its notch with the other candidate. Keep the target powered and outside the active and next scans.`
    : "The extraction point and scans repeat. When the point is in range and both scans miss the target, arm remotely, then open the physical latch within 15 seconds.";
}
export function view(s, actor, now, revision = 0) {
  const role = roleOf(s, actor),
    m = MISSIONS.find((m) => m.id === s.mission),
    p = s.puzzle;
  const v = {
    phase: s.phase,
    mission: s.mission,
    run: s.run,
    version: s.version,
    revision,
    serverNow: now,
    role,
    roleName: m?.roles[role === "A" ? 0 : 1],
    partnerRole: m?.roles[role === "A" ? 1 : 0],
    ready: !!s.ready[actor],
    partnerReady: !!s.ready[actor === "tutor" ? "learner" : "tutor"],
    connected: online(s, now),
    partnerConnected:
      now - s.seen[actor === "tutor" ? "learner" : "tutor"] < 12000 &&
      s.seen[actor === "tutor" ? "learner" : "tutor"] > 0,
    stage: s.stage || 0,
    feedback: s.feedback,
    feedbackId: s.feedbackId,
    hint: s.phase === "active" ? hint(s, role) : null,
    hintLevel: s.hints[role],
    hintCount: s.hintCount || 0,
    library: MISSIONS.map((m) => ({
      ...m,
      played: s.history.filter((h) => h.mission === m.id).length,
      roles: [
        ...new Set(
          s.history
            .filter((h) => h.mission === m.id)
            .map((h) => (h.roleA === actor ? "A" : "B")),
        ),
      ],
    })),
  };
  v.serial = s.serial?.[role] || 0;
  if (!p || !["active", "success", "failure"].includes(s.phase)) return v;
  v.alerts = p.alerts;
  v.window = Math.max(0, (p.window || 0) - now);
  v.releaseHeld = !!p.release[role] && now - p.release[role] < 15000;
  if (s.phase !== "active") return v;
  const pulsed = p.pulseUntil > now ? p.pulse : -1;
  if (s.mission === "vault")
    v.world =
      role === "A"
        ? {
            emblems: p.emblems,
            lit: pulsed < 0 ? -1 : p.map[pulsed],
            doors: p.doors,
            openedDoors: p.order.slice(0, p.doors).map((c) => p.map[c]),
            dials: p.dials,
          }
        : {
            order: p.order,
            doors: p.doors,
            pulse: pulsed,
            isolate: p.isolate,
            channels: p.targets.map((target, i) => ({
              target,
              value: pressure(p, i),
            })),
          };
  if (s.mission === "gallery")
    v.world =
      role === "A"
        ? {
            landmarks: p.landmarks,
            lit: pulsed < 0 ? -1 : p.map[pulsed],
            mirrors: p.mirrors,
            position: p.position < 0 ? -1 : p.map[p.position],
            shield: p.shields[p.travel] ?? null,
            ready: p.ready,
            travel: p.travel,
          }
        : {
            pulse: pulsed,
            beams: p.targets.map((target, i) => ({
              target,
              value: p.mirrors[p.mirrorMap[i]],
            })),
            next: s.stage === 2 ? p.route[p.travel] : null,
            position: p.position,
            disabled: p.disabled,
            emitters: p.emitterMap,
            ready: p.ready,
            travel: p.travel,
          };
  if (s.mission === "zero")
    v.world =
      role === "A"
        ? {
            components: SHAPES,
            test: p.test,
            slots: p.slots,
            rotations: p.rotations,
            marks: p.targets.map((v, i) => (p.fields.includes(i) ? v : null)),
            locked: p.locked,
            coupling: p.route === 0 ? "Parallel" : "Crossed",
          }
        : {
            test: p.test < 0 ? null : SIGS[p.map[p.test]],
            slots: p.slots.map((n) => (n < 0 ? null : SIGS[p.map[n]])),
            required: p.required.map((n) => SIGS[n]),
            fields: p.fields.length,
            locked: p.locked,
          };
  if (s.mission === "express") {
    const scan = trainScan(p, now);
    v.world =
      role === "A"
        ? {
            emblems: p.emblems,
            marks: p.emblems.map((_, i) => p.marks[p.map.indexOf(i)]),
            lit: pulsed < 0 ? -1 : p.map[pulsed],
            lever: p.lever,
            opened: p.opened,
          }
        : {
            pulse: pulsed,
            candidates: p.candidates,
            power: p.configs[p.lever].power,
            nextScan: scan.next,
            scanOrder: p.scanOrder,
            activeScan: scan.active,
            opened: p.opened,
            station: scan.station,
          };
  }
  return v;
}
