import { CARDS } from "./cards.mjs";

export const TURN_MS = 60000;
export const COUNTDOWN_MS = 3000;
export const PRESENCE_MS = 12000;
export class GameError extends Error {
  constructor(message, status = 409) {
    super(message);
    this.status = status;
  }
}
function requireThat(value, message, status) {
  if (!value) throw new GameError(message, status);
}
export function shuffle() {
  const pool = CARDS.map((_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    // Rejection sampling avoids modulo bias.
    const limit = Math.floor(0x100000000 / (i + 1)) * (i + 1);
    let n;
    do {
      n = crypto.getRandomValues(new Uint32Array(1))[0];
    } while (n >= limit);
    const j = n % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
}
export function initialState(now) {
  return {
    phase: "waiting",
    round: 0,
    turn: 0,
    describer: "tutor",
    score: 0,
    best: null,
    pool: shuffle(),
    cursor: 0,
    card: null,
    history: [],
    feedback: null,
    ready: [],
    paused: null,
    theme: "light",
    deadline: null,
    startsAt: null,
    late: null,
    learnerHash: null,
    seen: { tutor: now, learner: 0 },
    receipts: [],
    rate: {},
  };
}
function deal(s) {
  if (s.cursor === s.pool.length) {
    s.pool = shuffle();
    s.cursor = 0;
  }
  s.card = { index: s.pool[s.cursor++], nonce: crypto.randomUUID() };
}
function startTurn(s, now) {
  s.phase = "countdown";
  s.ready = [];
  s.late = null;
  s.feedback = null;
  s.startsAt = now + COUNTDOWN_MS;
  s.deadline = s.startsAt + TURN_MS;
  deal(s);
}
function record(s, result, now) {
  const entry = { ...s.card, result, turn: s.turn, describer: s.describer };
  s.history.push(entry);
  if (result === "correct") s.score++;
  s.feedback = {
    result,
    at: now,
    nonce: s.card.nonce,
    ...(result === "correct" ? { target: CARDS[s.card.index].target } : {}),
  };
}
export function advance(s, now) {
  if (s.paused) return;
  if (s.phase === "countdown" && now >= s.startsAt) s.phase = "active";
  if (s.phase === "active" && now >= s.deadline) {
    record(s, "unfinished", s.deadline);
    s.late = { nonce: s.card.nonce, describer: s.describer, credited: false };
    s.card = null;
    s.phase = s.turn === 1 ? "switch" : "results";
    s.ready = [];
    if (s.phase === "switch")
      s.describer = s.describer === "tutor" ? "learner" : "tutor";
    else s.best = Math.max(s.best ?? 0, s.score);
  }
}
export function command(s, actor, input, now) {
  s.rate ||= {};
  const bucket = s.rate[actor];
  if (!bucket || now - bucket.since >= 10000)
    s.rate[actor] = { since: now, count: 1 };
  else {
    requireThat(
      bucket.count < 60,
      "Too many requests. Please wait a moment.",
      429,
    );
    bucket.count++;
  }
  advance(s, now);
  s.seen[actor] = now;
  const { action, id } = input;
  if (action === "poll") {
    if (
      s.phase === "switch" &&
      s.ready.length === 2 &&
      now - s.seen.tutor < PRESENCE_MS &&
      now - s.seen.learner < PRESENCE_MS
    ) {
      s.turn = 2;
      startTurn(s, now);
    }
    return;
  }
  requireThat(
    typeof id === "string" && /^[\w-]{16,80}$/.test(id),
    "Invalid command.",
    400,
  );
  if (s.receipts.includes(`${actor}:${id}`)) return;
  requireThat(
    input.round === s.round && input.turn === s.turn,
    "The game has moved to another turn. Please try again.",
  );
  const tutor = actor === "tutor";
  if (action === "theme") {
    requireThat(tutor, "Only the tutor can change the game theme.", 403);
    requireThat(
      input.theme === "light" || input.theme === "night",
      "Invalid theme.",
      400,
    );
    s.theme = input.theme;
  } else if (action === "replace-learner") {
    requireThat(
      (tutor && !["active", "countdown"].includes(s.phase)) ||
        (tutor && s.paused),
      "Pause before replacing your learner.",
    );
    s.learnerHash = null;
    s.seen.learner = 0;
    s.ready = [];
  } else if (action === "pause") {
    requireThat(
      tutor && ["active", "countdown"].includes(s.phase) && !s.paused,
      "Only the tutor can pause a running turn.",
    );
    s.paused = {
      at: now,
      remaining: s.deadline - now,
      countdown: Math.max(0, s.startsAt - now),
    };
  } else if (action === "resume") {
    requireThat(tutor && s.paused, "Only the tutor can resume.");
    s.deadline = now + s.paused.remaining;
    s.startsAt = now + s.paused.countdown;
    s.paused = null;
  } else if (action === "finish") {
    requireThat(
      tutor && ["waiting", "switch", "results"].includes(s.phase),
      "Finish between turns or rounds.",
    );
    s.phase = "finished";
    s.card = null;
    s.paused = null;
  } else {
    requireThat(!s.paused, "The tutor has paused the game.");
    if (action === "start" || action === "replay") {
      requireThat(
        tutor &&
          (action === "start" ? s.phase === "waiting" : s.phase === "results"),
        "This round has already started.",
      );
      requireThat(
        s.learnerHash && now - s.seen.learner < PRESENCE_MS,
        "Wait for your learner to connect.",
      );
      s.round++;
      s.turn = 1;
      s.score = 0;
      s.history = [];
      s.pool = shuffle();
      s.cursor = 0;
      s.describer = s.round % 2 ? "tutor" : "learner";
      startTurn(s, now);
    } else if (action === "ready") {
      requireThat(
        s.phase === "switch" && input.round === s.round,
        "The next turn is not waiting.",
      );
      if (!s.ready.includes(actor)) s.ready.push(actor);
      if (
        s.ready.length === 2 &&
        now - s.seen.tutor < PRESENCE_MS &&
        now - s.seen.learner < PRESENCE_MS
      ) {
        s.turn = 2;
        startTurn(s, now);
      }
    } else if (action === "late-correct") {
      requireThat(
        ["switch", "results"].includes(s.phase) &&
          s.late &&
          !s.late.credited &&
          s.late.describer === actor &&
          input.card === s.late.nonce,
        "That final card cannot be credited.",
      );
      const last = s.history[s.history.length - 1];
      requireThat(
        last.result === "unfinished",
        "That card is already resolved.",
      );
      last.result = "correct";
      s.late.credited = true;
      s.score++;
      if (s.phase === "results") s.best = Math.max(s.best ?? 0, s.score);
    } else if (["correct", "skip", "oops"].includes(action)) {
      requireThat(
        s.phase === "active" && s.describer === actor,
        "Only the current Describer can resolve a card.",
        403,
      );
      requireThat(
        s.card?.nonce === input.card,
        "That card has already moved on.",
      );
      record(s, action, now);
      deal(s);
    } else throw new GameError("Unknown action.", 400);
  }
  s.receipts = [...s.receipts.slice(-99), `${actor}:${id}`];
}
// Explicit allow-list projection: never serialize state, deck indices or credential hashes.
export function view(s, actor, now, revision) {
  advance(s, now);
  const playing = ["active", "countdown"].includes(s.phase);
  const result = {
    phase: s.phase,
    round: s.round,
    turn: s.turn,
    describer: s.describer,
    role: actor === s.describer ? "Describer" : "Guesser",
    actor,
    score: s.score,
    best: s.best,
    serverNow: now,
    revision,
    startsAt: s.startsAt,
    deadline: s.deadline,
    paused: s.paused,
    theme: s.theme === "night" ? "night" : "light",
    ready: s.ready,
    remaining: s.pool.length - s.cursor,
    played: s.history.filter((x) => x.result !== "unfinished").length,
    connected: {
      tutor: now - s.seen.tutor < PRESENCE_MS,
      learner: !!s.learnerHash && now - s.seen.learner < PRESENCE_MS,
    },
    feedback: s.feedback && now - s.feedback.at < 1800 ? s.feedback : null,
    card:
      playing && s.card
        ? {
            nonce: s.card.nonce,
            ...(actor === s.describer ? CARDS[s.card.index] : {}),
          }
        : null,
    finalCard: null,
    canCredit: false,
    review: [],
  };
  if (["switch", "results", "finished"].includes(s.phase) && s.late) {
    const last = s.history[s.history.length - 1];
    result.finalCard = {
      target: CARDS[last.index].target,
      credited: s.late.credited,
    };
    result.canCredit =
      s.phase !== "finished" && s.late.describer === actor && !s.late.credited;
    result.finalNonce = s.late.nonce;
  }
  if (["results", "finished"].includes(s.phase)) {
    result.review = s.history
      .filter((x) => x.result !== "correct")
      .map((x) => ({ ...CARDS[x.index], result: x.result }));
  }
  return result;
}
