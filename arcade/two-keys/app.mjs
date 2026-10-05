const app = document.querySelector("#app"),
  learner = document.body.dataset.player === "learner";
const LOCAL =
  document.querySelector('meta[name="tk-local-verification"]')?.content ===
  "true";
const API =
  document.querySelector('meta[name="tk-api"]')?.content ||
  "https://atlas-ai.savvy989.workers.dev/two-keys/";
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const storage = {
  get: (k) => {
    try {
      return localStorage.getItem(k);
    } catch {
      return null;
    }
  },
  set: (k, v) => {
    try {
      localStorage.setItem(k, v);
    } catch {}
  },
};
const token = () =>
  [...crypto.getRandomValues(new Uint8Array(32))]
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
let state,
  session,
  credential,
  owner,
  invite,
  busy = false,
  failed = false,
  lastSync = 0,
  pending = null,
  lastRender = "",
  selected = 0,
  sound = storage.get("tk:sound") === "on",
  audio,
  authRequired = false,
  polling = null,
  priorExposure = [];
let tutorStorageKey;
const brand =
  '<span class="brand">TWO<span class="keyline">◇</span><b>KEYS</b></span>';
const button = (action, label, cls = "", extra = {}, disabled = false) =>
  `<button class="${cls}" data-action="${action}" ${Object.entries(extra)
    .map(([k, v]) => `data-${k}="${esc(v)}"`)
    .join(" ")} ${disabled ? "disabled" : ""}>${label}</button>`;
const marks = ["↑", "→", "↓", "←"],
  glyphs = {
    Triangle: "△",
    Crescent: "☾",
    Diamond: "◇",
    Ring: "◎",
    Wave: "≋",
    Star: "✧",
    Fork: "⋔",
    Coil: "§",
    Prism: "◈",
    Bridge: "Π",
    Crown: "♜",
    Wing: "⋱",
    Sphere: "●",
    Arch: "∩",
    Spiral: "◎",
    Obelisk: "▴",
  };
const glyph = (name) =>
  `<span class="glyph" aria-hidden="true">${glyphs[name] || "◇"}</span>`;
const names = [
  "The Glass Vault",
  "The Black Gallery",
  "Room Zero",
  "Midnight Express",
];
const ids = ["vault", "gallery", "zero", "express"];
let noticeTimer;
function notify(msg) {
  clearTimeout(noticeTimer);
  document.querySelector("#notice").textContent = msg;
  if (msg)
    noticeTimer = setTimeout(() => {
      document.querySelector("#notice").textContent = "";
    }, 5500);
}
function beep(win = false) {
  if (!sound) return;
  try {
    audio ||= new AudioContext();
    audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.connect(g);
    g.connect(audio.destination);
    o.type = "sine";
    o.frequency.value = win ? 660 : 320;
    g.gain.setValueAtTime(0.035, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
    o.start();
    o.stop(audio.currentTime + 0.4);
  } catch {}
}
function dialog(html) {
  document.querySelector("#dialog-body").innerHTML = html;
  document.querySelector("#utility").showModal();
}
function joinURL() {
  const u = new URL("join.html", location.href);
  u.search = `session=${session}`;
  u.hash = `invite=${state.invite}`;
  const shared = window.AtlasResourceShare?.buildShareUrl({
    world: "arcade",
    resourceId: "arcade:two-keys",
    launchUrl: u.href,
  });
  if (shared) {
    const s = new URL(shared);
    s.hash = u.hash;
    return s.href;
  }
  return u.href;
}
async function script(src) {
  await new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });
}
async function setup() {
  if (learner) {
    session = new URLSearchParams(location.search).get("session");
    if (!session)
      throw new Error("Open the private link shared by your tutor.");
    credential = storage.get(`tk:seat:${session}`) || token();
    storage.set(`tk:seat:${session}`, credential);
    invite =
      new URLSearchParams(location.hash.slice(1)).get("invite") ||
      storage.get(`tk:invite:${session}`);
    if (invite) storage.set(`tk:invite:${session}`, invite);
    history.replaceState(null, "", location.pathname + location.search);
    return;
  }
  for (const file of [
    "atlas-bridge",
    "atlas-cloud",
    "atlas-access-bootstrap",
    "arcade-catalog-data",
    "atlas-resource-share",
    "atlas-session-panel",
    "compass-catalog-data",
    "atlas-content-registry",
    "atlas-search",
  ]) {
    if (file === "atlas-bridge" && window.AtlasBridge) continue;
    if (LOCAL && ["atlas-cloud", "atlas-access-bootstrap"].includes(file))
      continue;
    await script(`/shared/${file}.js`);
  }
  await script("/arcade/shared/arcade-public-access.js");
  await script("/arcade/shared/arcade-game-chrome.js");
  window.ArcadeGameChrome?.mountLanding({ root: "#landing-chrome" });
  window.AtlasSessionPanel?.mount({
    root: "#atlas-session-panel-root",
    initialView: "manage",
  });
  if (LOCAL) owner = "local-verification";
  else {
    await window.AtlasAccessBootstrap.prepareAccount();
    const auth = await window.AtlasCloud.getSession();
    if (!auth) {
      authRequired = true;
      window.ArcadePublicAccess.subscribeGameResume("arcade:two-keys", () =>
        location.reload(),
      );
      return;
    }
    owner = auth.user.id;
  }
  const context = window.AtlasBridge?.readActiveSession?.()?.id || "open";
  const key = `tk:tutor:${owner}:${context}`;
  tutorStorageKey = key;
  session = storage.get(key) || crypto.randomUUID();
  storage.set(key, session);
  priorExposure =
    window.AtlasBridge?.readRegistry?.()?.sessionStates?.[context]?.[
      "arcade:two-keys"
    ]?.exposure || [];
}
async function request(action, extra = {}, id = crypto.randomUUID()) {
  let auth;
  if (!learner) {
    if (LOCAL) auth = "local-verification";
    else {
      const a = await window.AtlasCloud.getSession();
      if (!a || a.user.id !== owner)
        throw new Error("Your Atlas account changed. Reload to continue.");
      auth = a.access_token;
    }
  }
  const response = await fetch(
    API + (action === "create" ? "create" : "session"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      body: JSON.stringify({
        session,
        action,
        id,
        version: state?.version,
        ...(learner ? { credential } : {}),
        ...extra,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    },
  );
  const data = await response.json();
  if (!response.ok) {
    const e = new Error(data.error || "Connection interrupted.");
    e.status = response.status;
    throw e;
  }
  const previous = state;
  lastSync = Date.now();
  failed = false;
  if (!state || data.state.revision >= state.revision) state = data.state;
  if (previous && previous.phase !== state.phase) notify("");
  if (previous && previous.feedbackId !== state.feedbackId) {
    beep(state.phase === "success");
    notify(state.feedback);
    document.body.classList.remove("mechanism-error");
    if (
      /warning|pulse|reject|active beam|outside the safe/i.test(state.feedback)
    ) {
      void document.body.offsetWidth;
      document.body.classList.add("mechanism-error");
    }
  }
  render();
  if (!learner && action !== "poll") continuity();
  return state;
}
function continuity() {
  try {
    const b = window.AtlasBridge,
      s = b?.readActiveSession?.();
    if (!s?.id) return;
    b.upsertSessionState(s.id, "arcade:two-keys", {
      world: "arcade",
      status: state.phase === "finished" ? "complete" : "in-progress",
      launchUrl: location.href,
      currentLabel: names[ids.indexOf(state.mission)] || "Mission library",
      progress: {
        covered: state.library.filter((m) => m.played).length,
        total: 4,
      },
      twoKeysSession: session,
      exposure: state.library.map((m) => {
        const old = priorExposure.find((p) => p.id === m.id);
        return {
          id: m.id,
          played: Math.max(m.played, old?.played || 0),
          roles: [...new Set([...m.roles, ...(old?.roles || [])])],
        };
      }),
      lastTouchedAt: Date.now(),
    });
  } catch {}
}
async function act(action, extra = {}) {
  if (busy) return;
  busy = true;
  document.body.classList.add("busy");
  if (polling) await polling.catch(() => {});
  if (pending) {
    busy = false;
    document.body.classList.remove("busy");
    notify("Reconnecting your last action. Please wait a moment.");
    return;
  }
  const job = {
    action,
    extra: {
      version: state?.version,
      run: state?.run,
      stage: state?.stage,
      serial: state?.serial,
      ...extra,
    },
    id: crypto.randomUUID(),
  };
  pending = job;
  try {
    await request(job.action, job.extra, job.id);
    pending = null;
  } catch (e) {
    notify(e.message);
    if (e.status >= 400 && e.status < 500 && e.status !== 429) {
      pending = null;
      await request("poll").catch(() => {});
    } else {
      failed = true;
      render();
    }
  } finally {
    busy = false;
    document.body.classList.remove("busy");
  }
}
async function poll() {
  if (!busy && session && !authRequired) {
    try {
      polling = (async () => {
        if (pending) {
          await request(pending.action, pending.extra, pending.id);
          pending = null;
        } else await request("poll");
      })();
      await polling;
    } catch (e) {
      failed = true;
      notify(e.message);
      if ([401, 403, 410].includes(e.status)) {
        pending = null;
        fatal(e);
        return;
      }
      if (e.status >= 400 && e.status < 500 && e.status !== 429) {
        pending = null;
        await request("poll").catch(() => {});
      }
      render();
    } finally {
      polling = null;
    }
  }
  setTimeout(poll, failed ? 2200 : 850);
}
function status() {
  return `<span class="connection ${state?.partnerConnected ? "online" : ""}"><i></i>${failed ? "Reconnecting…" : state?.partnerConnected ? "Partner connected" : "Waiting for partner"}</span>`;
}
function header() {
  return `<header class="gamebar">${brand}<div class="position">${esc(state.roleName || "Operation room")}</div><div class="utilities">${status()}${button("help", "?", "icon", {}, false)}${button("menu", "☰", "icon", {}, false)}</div></header>`;
}
function hero() {
  return `<div class="hero-art" aria-hidden="true"></div><div class="hero-copy"><p class="eyebrow">AN ATLAS COOPERATIVE ORIGINAL</p><h1>TWO<span>◇</span>KEYS</h1><p class="tagline">Some doors<br>take two.</p><p class="intro">Two perspectives. One impossible job.<br>Neither of you gets through alone.</p><div class="hero-meta"><span>02 PLAYERS</span><span>04 MISSIONS</span><span>6–12 MIN / JOB</span></div></div>`;
}
function library() {
  const list =
    state?.library?.map((m) => {
      const old = priorExposure.find((p) => p.id === m.id);
      return {
        ...m,
        played: Math.max(m.played, old?.played || 0),
        roles: [...new Set([...m.roles, ...(old?.roles || [])])],
      };
    }) ||
    names.map((title, i) => ({
      title,
      id: ids[i],
      played: 0,
      tags: [
        "Correspondence · Remote operation",
        "Spatial reasoning · Transformation",
        "Construction · Shared constraints",
        "Shared constraints · Coordination",
      ][i],
    }));
  const fresh = list.find((m) => !m.played)?.id;
  return `<section class="entrance">${hero()}<div class="library"><div class="section-title"><div><p class="eyebrow">CHOOSE YOUR NEXT JOB</p><h2>The mission files</h2></div>${state ? status() : ""}</div><div class="missions">${list.map((m, i) => `<button class="mission ${m.id}" data-action="select" data-mission="${m.id}" ${learner ? "disabled" : ""}><span class="mission-art">${miniArt(m.id)}</span><span class="mission-number">0${i + 1} / ${m.played ? "COMPLETED" : m.id === fresh ? "FRESH JOB" : "AVAILABLE"}</span><strong>${m.title}</strong><small>${m.tags}</small><span class="mission-arrow">↗</span></button>`).join("")}</div><div class="library-foot"><p>${learner ? "Your partner chooses the job. Keep your lesson call open." : "Keep your lesson call open. Your partner gets a private view."}</p>${!learner && state ? button("invite", "Invite your partner ↗", "text") : ""}</div></div></section>`;
}
function miniArt(id) {
  return `<span class="mini-scene ${id}">${id === "vault" ? "<i></i><i></i><i></i>" : id === "gallery" ? "<i></i><i></i><i></i><i></i>" : id === "zero" ? "<i>◇</i><i>◎</i><i>⋔</i>" : "<i></i><i></i><i></i><i></i>"}</span>`;
}
function briefing() {
  const m = state.library.find((m) => m.id === state.mission);
  return `<section class="briefing"><div class="hero-art"></div><div class="briefing-inner"><p class="eyebrow">THE BRIEF / ${esc(m.place)}</p><h1>${m.title}</h1><p class="brief-objective">${m.objective}</p><div class="role-pair"><article class="role-card"><small>YOUR POSITION</small><div class="role-illustration ${state.role === "A" ? "physical" : "remote"}">${miniArt(m.id)}</div><h2>${state.roleName}</h2><p>${state.role === "A" ? "You are inside. Inspect the objects. Your hands change their systems." : "You see the hidden systems. Your controls change their world."}</p></article><article class="role-card partner"><small>PARTNER POSITION</small><div class="abstract-key">◇</div><h2>${state.partnerRole}</h2><p>A different view of the same job.<br>Talk to connect the two.</p></article></div><div class="brief-actions">${button("ready", state.ready ? "✓ Ready · waiting for partner" : "I’m ready →", "primary", {}, state.ready)}${!learner ? button("swap", "Swap positions", "text") : ""}</div><p class="quiet">${state.partnerReady ? "Your partner is ready." : "Both players confirm before the mission begins."}</p>${!state.partnerConnected && !learner ? button("invite", "Share private invite ↗", "text") : ""}</div></section>`;
}
function scenery() {
  return `<svg class="architecture" viewBox="0 0 1200 700" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="wall" x2="1" y2="1"><stop stop-color="#101d28"/><stop offset="1" stop-color="#04080d"/></linearGradient><linearGradient id="floor" x2="0" y2="1"><stop stop-color="#182b37"/><stop offset="1" stop-color="#05090d"/></linearGradient></defs><path d="M0 0H1200V700H0Z" fill="url(#wall)"/><path d="M0 700L340 430H860L1200 700" fill="url(#floor)"/><path d="M0 0L340 145H860L1200 0M340 145V430M860 145V430M0 700L340 430H860L1200 700" fill="none" stroke="#648399" stroke-opacity=".2"/><g stroke="#7091a4" stroke-opacity=".15">${[80, 250, 430, 600, 770, 950, 1120].map((x) => `<path d="M600 430L${x} 700"/>`).join("")}<path d="M250 500H950M160 570H1040M65 645H1135"/></g><g stroke="#a9d7e9" stroke-width="3"><path d="M90 42L335 145M865 145L1110 42" opacity=".6"/><path d="M25 105V460M1175 105V460" opacity=".2"/></g></svg>`;
}
function controls(title, copy, html) {
  return `<div class="control-deck"><div><p class="eyebrow">${title}</p><p>${copy}</p></div><div class="control-row">${html}</div></div>`;
}
function channelButtons(n) {
  return Array.from({ length: n }, (_, i) =>
    button(
      "pulse",
      `<span class="channel-dot"></span> ${String(i + 1).padStart(2, "0")}`,
      "channel",
      { index: i },
    ),
  ).join("");
}
function dial(i, value, action = "dial", name = "Dial") {
  return button(
    action,
    `<span class="dial-face" style="--turn:${value * 90}deg"><i></i><b>◆</b></span><strong>${name} ${i + 1}</strong><small>Position ${value + 1} · turn ↻</small>`,
    "dial",
    { index: i },
  );
}
function meters(channels) {
  return `<div class="meters">${channels.map((c, i) => `<article class="meter"><p>LOCK ${i + 1}</p><div class="meter-track">${[0, 1, 2, 3].map((n) => `<i class="${c.value === n ? "current" : ""} ${c.target === n ? "target" : ""}"><span>${n + 1}</span></i>`).join("")}</div><strong>${c.value === c.target ? "✓ ALIGNED" : `${c.value + 1} → TARGET ${c.target + 1}`}</strong></article>`).join("")}</div>`;
}
function vault(w, A) {
  if (state.stage < 2)
    return A
      ? `<div class="doorway objects">${w.emblems.map((e, i) => button("door", `${glyph(e)}<strong>${e}</strong><span class="door-seam"></span><small>Operate switch</small>`, "security-door " + (w.lit === i ? "lit" : "") + (w.openedDoors?.includes(i) ? " route-open" : ""), { index: i }, w.openedDoors?.includes(i))).join("")}</div><p class="world-caption">${w.doors} / 3 doors open · A remote circuit lights one emblem.</p>`
      : `<div class="schematic floorplan"><div class="plan-grid">${[0, 1, 2].map((i) => `<div class="plan-room ${w.pulse === i ? "lit" : ""}"><span>CIRCUIT ${i + 1}</span><b>${w.order.indexOf(i) + 1}</b><small>${w.order.indexOf(i) < w.doors ? "ROUTE OPEN" : "ROUTE ORDER"}</small></div>`).join("")}</div><div class="plan-link"></div><div class="target-case">◇</div></div>${controls("POWER ROUTING", "Energise one circuit. Ask which physical emblem responds.", channelButtons(3))}`;
  if (state.stage === 2)
    return A
      ? `<div class="vault-object"><div class="containment"><div class="case">◇</div></div></div><div class="dial-bank">${w.dials.map((n, i) => dial(i, n)).join("")}</div><p class="world-caption">Turn one dial. Ask which lock changed and how.</p>`
      : `<div class="schematic">${meters(w.channels)}<p class="world-caption">Solid light = current pressure. Gold outline = target.</p></div>${controls("ISOLATE A CHANNEL", `Watching lock ${w.isolate + 1}. Ask your partner to move one dial at a time.`, w.channels.map((c, i) => button("isolate", `Lock ${i + 1}`, w.isolate === i ? "selected" : "", { index: i })).join(""))}`;
  return `<div class="vault-object released"><div class="containment"><div class="case">◇</div></div></div><div class="final-control"><h2>All three layers are aligned.</h2><p>Agree on the moment. Both releases must be pressed within 15 seconds.</p>${button("release", state.releaseHeld ? "✓ Release held · press again to renew" : "Hold your release", "primary")}</div>`;
}
function gallery(w, A) {
  if (state.stage === 3)
    return `<div class="extraction-sculpture">${glyph("Wing")}</div><div class="final-control"><h2>The piece is within reach.</h2><p>${A ? "Prepare the display. Ask for a blackout, then lift the piece." : "Wait for the physical mechanism, then open a generous blackout."}</p>${A ? button("prepare", w.ready ? "✓ Display ready" : "Prepare display", "", {}, w.ready) + button("extract", "Lift the piece", "primary") : button("blackout", "Open 15-second blackout", "primary", {}, !w.ready)}${state.window ? '<p class="window-live">BLACKOUT OPEN · act together</p>' : ""}</div>`;
  if (A)
    return `<div class="gallery-floor">${w.landmarks.map((n, i) => button("move", `${glyph(n)}<span class="plinth"></span><strong>${n}</strong><small>${w.position === i ? "YOU ARE HERE" : state.stage === 2 ? "Cross to this position" : "Landmark"}</small>`, "sculpture " + (w.lit === i ? "lit" : "") + " " + (w.position === i ? "occupied" : ""), { index: i }, state.stage !== 2)).join("")}</div>${state.stage < 2 ? `<div class="mirror-bank">${w.mirrors.map((n, i) => dial(i, n, "mirror", "Mirror")).join("")}</div>` : `<div class="shield-readout">Your local shield: <strong>${["Ring ◎", "Triangle △", "Wave ≋"][w.shield]}</strong><span>Tell your partner before each crossing.</span></div>`}`;
  return `<div class="schematic gallery-map"><div class="node-grid">${[0, 1, 2, 3, 4, 5].map((i) => `<div class="node ${w.pulse === i ? "lit" : ""} ${w.position === i ? "occupied" : ""} ${w.next === i ? "next" : ""}"><b>${i + 1}</b><small>${w.next === i ? (w.disabled ? "SAFE TO CROSS" : "NEXT · SHIELDED") : w.position === i ? "CREW POSITION" : "SENSOR"}</small></div>`).join("")}</div>${state.stage < 2 ? `<div class="beam-readings">${w.beams.map((b, i) => `<div><span>BEAM ${i + 1}</span><i style="--angle:${b.value * 22 - 33}deg"></i><strong>${b.value + 1} → ${b.target + 1} ${b.value === b.target ? "✓" : ""}</strong></div>`).join("")}</div>` : ""}</div>${state.stage < 2 ? controls("PULSE THE LATTICE", "Ask which sculpture the beam passes. Mirrors change receiver positions.", channelButtons(6)) : controls("EMITTER SHIELDS", "Ask for the physical shield mark. Disable its matching emitter before guiding the next crossing.", w.emitters.map((n, i) => button("disable", `${["◎ Ring", "△ Triangle", "≋ Wave"][n]}`, "", { index: i })).join(""))}`;
}
function zero(w, A) {
  if (A)
    return `<div class="workbench"><div class="component-tray">${w.components.map((n, i) => button("component", `${glyph(n)}<strong>${n}</strong>`, "component " + (selected === i ? "selected" : ""), { index: i })).join("")}</div><div class="test-socket">${button("test", `Test ${w.components[selected]} →`, "", { index: selected })}<span>${w.test < 0 ? "Test socket empty" : `${w.components[w.test]} under test · ask what appears remotely`}</span></div><div class="sockets">${w.slots.map((n, i) => `<article class="socket"><p>${["LEFT", "MIDDLE", "RIGHT"][i]}</p>${n < 0 ? '<div class="empty-socket">+</div>' : glyph(w.components[n]) + `<strong class="placed-name">${w.components[n]}</strong>`}<span class="orientation">${marks[w.rotations[i]]}</span><small>${w.marks[i] === null ? "Alignment mark sealed" : `Etched alignment: ${marks[w.marks[i]]}`}</small>${button("place", `Place ${w.components[selected]}`, "", { index: selected, slot: i }, w.locked)}${button("rotate", "Turn ↻", "text", { index: i }, w.locked || n < 0)}</article>`).join("")}</div><p class="coupling">Physical coupling: <strong>${w.coupling === "Parallel" ? "∥ Parallel" : "⋈ Crossed"}</strong></p>${button("lock", w.locked ? "✓ Assembly locked" : "Lock assembly", "primary", {}, w.locked)}</div>`;
  return `<div class="schematic blueprint"><div class="signature">TEST SIGNATURE<strong>${w.test || "Waiting for a component"}</strong></div><div class="blueprint-slots">${w.required.map((n, i) => `<article><small>${["LEFT", "MIDDLE", "RIGHT"][i]} SOCKET</small><span>${w.slots[i] || "—"}</span><strong>Requires ${n}</strong></article>`).join("")}</div><p class="world-caption">Three different signatures. The middle links the outside pair.<br>Physical shapes are known only inside the lab.</p></div>${state.stage === 3 ? controls("COMPLETE THE ENERGY ROUTE", "Ask which coupling is visible on the physical device.", button("energy", "∥ Parallel", "primary", { index: 0 }) + button("energy", "⋈ Crossed", "primary", { index: 1 })) : controls("FIELD TRANSFORMATION", `Place two components to enable fields. Each turns a physical socket and reveals its alignment mark. ${w.fields}/3 revealed.`, [0, 1, 2].map((i) => button("field", `Field ${i + 1}`, "", { index: i }, w.slots.filter(Boolean).length < 2)).join(""))}`;
}
function express(w, A) {
  if (A)
    return `<div class="train-windows"><i></i><i></i><i></i></div><div class="cargo-bay">${w.emblems.map((n, i) => button("unlock", `${glyph(n)}<strong>${n}</strong><span class="notch">${w.marks[i] === "Double notch" ? "Ⅱ" : "Ⅰ"}</span><small>${w.marks[i]}</small><span class="latch-handle"></span>`, "cargo " + (w.lit === i ? "lit" : ""), { index: i }, w.opened)).join("")}</div>${w.opened ? `<div class="final-control"><div class="case">◇</div><p>Case located. Wait for the remote release at the extraction point.</p>${button("latch", "Open physical latch", "primary")}${state.window ? '<p class="window-live">REMOTE RELEASE ARMED</p>' : ""}</div>` : controls("LOCAL POWER ROUTING", "Change the lever. Ask which channels have power and which one will be scanned.", [0, 1, 2, 3].map((i) => button("lever", `${["I", "II", "III", "IV"][i]}`, w.lever === i ? "selected" : "", { index: i })).join(""))}`;
  return `<div class="schematic train-map"><div class="train-line">${[0, 1, 2, 3].map((i) => `<article class="car ${w.power.includes(i) ? "powered" : ""} ${w.activeScan === i ? "scanned" : ""}"><small>CARGO CHANNEL</small><b>${i + 1}</b><span>${w.power.includes(i) ? "● POWER" : "○ NO POWER"}</span></article>`).join("")}</div><div class="security-note">${!w.opened ? `<p>Target condition</p><strong>Channel ${w.candidates[0] + 1} or ${w.candidates[1] + 1}</strong><span>The real target has a double notch. Ask your partner to inspect it.</span>` : `<p>Extraction point</p><strong>${["Approaching", "Almost in range", "IN RANGE"][w.station]}</strong>`}</div><div class="scan-track"><span>SCAN ORDER ${w.scanOrder.map((i) => i + 1).join(" → ")} ↻</span><strong>Active: ${w.activeScan + 1} · next scan: ${w.nextScan + 1}</strong></div></div>${w.opened ? controls("COORDINATE THE RELEASE", "Scans repeat every 20 seconds. Arm when the point is in range and the target is outside this scan and the next.", button("arm", "Arm release", "primary", {}, w.station !== 2)) : controls("CARGO POWER", "Pulse a channel to discover its emblem. Keep the target powered and outside the active and next scans.", channelButtons(4))}`;
}
function active() {
  const m = state.library.find((m) => m.id === state.mission),
    A = state.role === "A";
  return `<section class="mission-view ${state.mission} ${A ? "physical-view" : "remote-view"}"><div class="mission-top"><div><p class="eyebrow">${m.place}</p><h1>${m.title}</h1></div><div class="step-label"><span>0${state.stage + 1} / 04</span><strong>${m.steps[state.stage]}</strong></div></div><div class="world ${A ? "physical" : "remote"}">${scenery()}${A && state.world.lit >= 0 ? `<div class="world-cause" role="status">Remote signal · ${(state.world.emblems || state.world.landmarks)[state.world.lit]}</div>` : ""}<div class="world-content" ${!state.connected || failed ? "inert" : ""}>${{ vault, gallery, zero, express }[state.mission](state.world, A)}</div>${!state.connected || failed ? `<div class="pause-veil"><span>◌</span><h2>${failed ? "Reconnecting your position" : "Waiting for your partner"}</h2><p>Your discoveries and mission progress are safe.<br>Controls resume when both positions are connected.</p></div>` : ""}</div><footer class="mission-footer"><span>${state.alerts ? `ALERTS ${state.alerts} / 3` : "NO GLOBAL COUNTDOWN · TAKE YOUR TIME"}</span><div>${button("hint", "◇ " + ["Request a hint", "Connection hint", "Rescue hint", "Hint available"][state.hintLevel], "text")}${button("reset", "Reset mechanism", "text")}</div></footer>${state.hint ? `<aside class="hint"><small>${["", "FOCUS", "CONNECTION", "RESCUE"][state.hintLevel]}</small><p>${state.hint}</p></aside>` : ""}</section>`;
}
function payoff() {
  const captions = {
    vault: "Three glass layers retract. The case rises into reach.",
    gallery: "The lattice goes dark. The display opens.",
    zero: "The bypass carries power. Room Zero opens.",
    express: "The cargo signal leaves the train. The package is yours.",
  };
  return `<div class="payoff ${state.mission}" aria-label="${captions[state.mission]}"><div class="payoff-layers"><i></i><i></i><i></i></div><div class="payoff-target">${state.mission === "zero" ? "◇—◎—⋔" : state.mission === "gallery" ? "✧" : "◇"}</div></div><p class="payoff-caption">${captions[state.mission]}</p>`;
}
function result() {
  const success = state.phase === "success",
    finished = state.phase === "finished";
  return `<section class="result ${success ? "success" : ""}"><div class="hero-art"></div><div class="result-inner">${success ? payoff() : `<div class="success-rings"><i></i><i></i></div>`}<p class="eyebrow">${finished ? "UNTIL THE NEXT JOB" : names[ids.indexOf(state.mission)]}</p><h1>${finished ? "Every good job<br>takes two." : success ? (state.mission === "express" ? "Package secured." : "Mission complete.") : "Security lockdown."}</h1><p>${success ? "Neither of you had the whole picture.<br>Together, you found the way through." : finished ? "Your lesson can continue. The mission files will be here." : "The alarm caught the crew. Start a fresh run and try again."}</p>${!finished ? `<div class="result-details"><span>${state.roleName}</span><span>${state.hintCount} hints used</span><span>${state.alerts} alerts</span></div>` : ""}<div class="result-actions">${!learner ? (finished ? button("leave", "Open mission files", "primary") : button("leave", "Play another →", "primary") + button("restart", success ? "Replay with a fresh solution" : "Retry the mission") + button("finish", "Finish", "text")) : "<p>Your partner can choose another job or finish.</p>"}</div></div></section>`;
}
function render() {
  if (authRequired) {
    app.innerHTML = library();
    return;
  }
  if (!state) return;
  const key = JSON.stringify({
    ...state,
    serverNow: 0,
    revision: 0,
    window: state.window > 0,
  });
  if (key === lastRender) return;
  lastRender = key;
  const oldTurns = new Map(
    [...app.querySelectorAll(".dial")].map((e) => [
      e.dataset.action + e.dataset.index,
      e.querySelector(".dial-face").style.getPropertyValue("--turn"),
    ]),
  );
  const focus = document.activeElement?.dataset;
  const scroll = window.scrollY;
  const previousPhase = document.body.dataset.phase;
  document.body.dataset.phase = state.phase;
  app.innerHTML =
    (state.phase === "library" && !learner ? "" : header()) +
    (["library"].includes(state.phase)
      ? library()
      : state.phase === "briefing"
        ? briefing()
        : state.phase === "active"
          ? active()
          : result());
  document.body.dataset.role = state.role;
  if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
    for (const e of app.querySelectorAll(".dial")) {
      const before = oldTurns.get(e.dataset.action + e.dataset.index),
        after = e.querySelector(".dial-face").style.getPropertyValue("--turn");
      if (before && before !== after)
        e.querySelector("i").animate(
          [
            { transform: `rotate(${before})` },
            { transform: `rotate(${parseFloat(before) + 90}deg)` },
          ],
          { duration: 350, easing: "ease-out" },
        );
    }
  document
    .querySelector("#landing-chrome")
    ?.toggleAttribute("hidden", state.phase !== "library");
  if (focus?.action) {
    const el = [...app.querySelectorAll("button")].find(
      (b) =>
        b.dataset.action === focus.action &&
        b.dataset.index === focus.index &&
        b.dataset.slot === focus.slot,
    );
    el?.focus({ preventScroll: true });
  }
  window.scrollTo(0, previousPhase !== state.phase ? 0 : scroll);
}
function fatal(e) {
  const expired = e.status === 410;
  app.innerHTML = `<section class="entry-error">${brand}<h1>${expired ? "This operation has ended." : "Let’s reconnect."}</h1><p>${expired && !learner ? "Your six-hour session has expired. Start a new operation and share its new private link." : esc(e.message)}</p>${expired && !learner ? button("new-session", "Start a new operation", "primary") : button("reload", "Try again", "primary")}<a href="/arcade/">Back to Arcade</a></section>`;
  notify(e.message);
}
document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-action]");
  if (!b || b.disabled) return;
  const action = b.dataset.action;
  if (action === "new-session" && !learner && tutorStorageKey) {
    storage.set(tutorStorageKey, crypto.randomUUID());
    location.reload();
    return;
  }
  if (action === "close") {
    document.querySelector("#utility").close();
    return;
  }
  if (action === "reload") {
    location.reload();
    return;
  }
  if (action === "sound") {
    sound = !sound;
    storage.set("tk:sound", sound ? "on" : "off");
    b.textContent = sound ? "Sound on" : "Sound off";
    beep();
    return;
  }
  if (action === "help") {
    dialog(
      `<p class="eyebrow">TWO POSITIONS. ONE JOB.</p><h2>Tell them what changed.</h2><p>You see different parts of the same world. Inspect your objects, try one control, and ask what happened on your partner’s screen.</p><p>Keep your lesson call open. There is no mission countdown. Use hints whenever you get stuck.</p><p>Your private clues stay yours until you describe them.</p>`,
    );
    return;
  }
  if (action === "menu") {
    dialog(
      `<h2>Operation controls</h2>${button("sound", sound ? "Sound on" : "Sound off")} ${!learner ? button("restart", "Restart mission", "", {}, !state.mission) + button("leave", "Mission library") + button("finish", "Finish game") + button("invite", "Private invite") + (!state.partnerConnected ? button("replace-learner", "Replace disconnected seat") : "") : "<p>Your partner manages the session. Your puzzle role has equal agency.</p>"}<a href="/arcade/">Back to Arcade</a>`,
    );
    return;
  }
  if (action === "invite") {
    dialog(
      `<p class="eyebrow">ONE PRIVATE POSITION</p><h2>Bring your partner in.</h2><p>Share this link in your existing lesson conversation. The first person to open it claims the learner seat.</p><input aria-label="Private learner link" value="${esc(joinURL())}" readonly>${button("copy", "Copy invite", "primary")}<p class="quiet">Reloads restore the same position on this browser. Links expire with the session after six hours.</p>`,
    );
    return;
  }
  if (action === "copy") {
    try {
      await navigator.clipboard.writeText(joinURL());
      b.textContent = "✓ Copied";
    } catch {
      document.querySelector("input").select();
      notify("Select and copy the invite link.");
    }
    return;
  }
  if (action === "component") {
    selected = Number(b.dataset.index);
    lastRender = "";
    render();
    return;
  }
  if (authRequired) {
    await window.ArcadePublicAccess.requestGameAccess("arcade:two-keys", b);
    return;
  }
  document.querySelector("#utility").close();
  const extra = {};
  for (const k of ["index", "slot"])
    if (b.dataset[k] !== undefined) extra[k] = Number(b.dataset[k]);
  if (b.dataset.mission) extra.mission = b.dataset.mission;
  await act(action, extra);
});
setInterval(() => {
  if (state && Date.now() - lastSync > 10000 && !failed) {
    failed = true;
    lastRender = "";
    render();
  }
}, 1000);
try {
  await setup();
  if (authRequired) render();
  else {
    await request(learner ? "join" : "create", learner ? { invite } : {});
    poll();
  }
} catch (e) {
  fatal(e);
}
