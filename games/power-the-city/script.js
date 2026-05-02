/* ============================================================
   POWER THE CITY — Logic Circuit Puzzle for kids (kelas 4-6)
   ============================================================ */

const GAME_ID = "power-the-city";
const STORAGE_KEY = "ptc_progress_v1";
const MUTE_KEY = "ptc_muted_v1";
const TOTAL_LEVELS = 12;

/* ============================================================
   AUDIO SYSTEM (Web Audio API — no asset files)
   ============================================================ */
let audioCtx = null;
let masterGain = null;
let bgmTimer = null;
let bgmStep = 0;
let muted = false;

function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = muted ? 0 : 1;
    masterGain.connect(audioCtx.destination);
  } catch (_) { audioCtx = null; }
}

function ensureAudio() {
  initAudio();
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

function playSfx(type) {
  if (muted) return;
  ensureAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.connect(g); g.connect(masterGain);

  switch (type) {
    case "switchOn":
      osc.type = "square";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.12);
      break;
    case "switchOff":
      osc.type = "square";
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
      g.gain.setValueAtTime(0.15, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      osc.start(now); osc.stop(now + 0.12);
      break;
    case "place":
      osc.type = "triangle";
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.08);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.14);
      break;
    case "wire":
      osc.type = "sine";
      osc.frequency.setValueAtTime(660, now);
      osc.frequency.exponentialRampToValueAtTime(990, now + 0.1);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.18);
      break;
    case "error":
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.2);
      g.gain.setValueAtTime(0.18, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now); osc.stop(now + 0.28);
      break;
    case "win": {
      // Ascending pentatonic chime
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((f, i) => {
        const o = audioCtx.createOscillator();
        const ng = audioCtx.createGain();
        o.connect(ng); ng.connect(masterGain);
        o.type = "sine";
        o.frequency.value = f;
        const t0 = now + i * 0.12;
        ng.gain.setValueAtTime(0.0001, t0);
        ng.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
        ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
        o.start(t0); o.stop(t0 + 0.45);
      });
      // The placeholder osc/g we created above never started — clean up
      try { osc.disconnect(); g.disconnect(); } catch (_) {}
      return;
    }
    case "click":
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      g.gain.setValueAtTime(0.1, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now); osc.stop(now + 0.06);
      break;
  }
}

/* Simple ambient BGM: pentatonic arpeggio + sustained pad */
const BGM_NOTES = [261.63, 329.63, 392.00, 440.00, 523.25, 392.00, 329.63, 220.00];
const BGM_INTERVAL_MS = 600;

function startBgm() {
  if (muted || bgmTimer) return;
  ensureAudio();
  if (!audioCtx) return;

  // Start sustained pad (drone)
  startPad();

  bgmStep = 0;
  bgmTimer = setInterval(() => {
    if (muted || !audioCtx) return;
    const t0 = audioCtx.currentTime;
    const f = BGM_NOTES[bgmStep % BGM_NOTES.length];
    const o = audioCtx.createOscillator();
    const ng = audioCtx.createGain();
    o.connect(ng); ng.connect(masterGain);
    o.type = "triangle";
    o.frequency.value = f;
    ng.gain.setValueAtTime(0.0001, t0);
    ng.gain.exponentialRampToValueAtTime(0.06, t0 + 0.05);
    ng.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
    o.start(t0); o.stop(t0 + 0.55);
    bgmStep++;
  }, BGM_INTERVAL_MS);
}

let padNodes = null;
function startPad() {
  if (!audioCtx || padNodes) return;
  // Two slightly detuned sine waves = warm pad
  const o1 = audioCtx.createOscillator();
  const o2 = audioCtx.createOscillator();
  const pg = audioCtx.createGain();
  o1.type = "sine"; o1.frequency.value = 130.81;       // C3
  o2.type = "sine"; o2.frequency.value = 196.00;       // G3
  o1.connect(pg); o2.connect(pg);
  pg.gain.value = 0.025;
  pg.connect(masterGain);
  o1.start(); o2.start();
  padNodes = { o1, o2, pg };
}

function stopBgm() {
  if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
  if (padNodes) {
    try { padNodes.o1.stop(); padNodes.o2.stop(); padNodes.pg.disconnect(); } catch (_) {}
    padNodes = null;
  }
}

function setMuted(m) {
  muted = m;
  try { localStorage.setItem(MUTE_KEY, m ? "1" : "0"); } catch (_) {}
  if (masterGain) masterGain.gain.value = m ? 0 : 1;
  const btn = document.getElementById("btn-mute");
  if (btn) btn.textContent = m ? "🔇" : "🔊";
  if (m) stopBgm();
  else if (document.getElementById("screen-game").classList.contains("active")) startBgm();
}

function loadMute() {
  try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (_) {}
}

/* ============================================================
   LEVEL DATA
   Each level defines: switches, lamps, allowed gate types,
   target truth-table (output for each input combo), hint, and
   the optimal gate count used for efficiency bonus.
   ============================================================ */
const LEVELS = [
  // ----- WIRE INTRO -----
  {
    id: 1,
    goal: "Hubungkan tombol langsung ke lampu — tap port lampu lalu tap port tombol.",
    switches: [{ id: "S1", label: "Tombol A" }],
    lamps: [{ id: "L1", label: "Lampu 1" }],
    gates: [],                       // no gates allowed
    optimal: 0,                      // 0 gates needed
    truth: (s) => ({ L1: s.S1 }),
    hint: "Lampu menyala persis seperti tombol. Hubungkan langsung tombol A ke lampu 1."
  },
  {
    id: 2,
    goal: "Dua tombol mengontrol dua lampu masing-masing.",
    switches: [{ id: "S1", label: "Tombol A" }, { id: "S2", label: "Tombol B" }],
    lamps: [{ id: "L1", label: "Lampu 1" }, { id: "L2", label: "Lampu 2" }],
    gates: [],
    optimal: 0,
    truth: (s) => ({ L1: s.S1, L2: s.S2 }),
    hint: "Tombol A → Lampu 1, Tombol B → Lampu 2. Tidak perlu gerbang."
  },

  // ----- AND -----
  {
    id: 3,
    goal: "Lampu menyala HANYA jika kedua tombol ON.",
    switches: [{ id: "S1", label: "Tombol A" }, { id: "S2", label: "Tombol B" }],
    lamps: [{ id: "L1", label: "Lampu" }],
    gates: ["AND"],
    optimal: 1,
    truth: (s) => ({ L1: s.S1 && s.S2 }),
    hint: "Pakai 1 gerbang AND. Sambungkan kedua tombol ke input AND, lalu output AND ke lampu."
  },
  {
    id: 4,
    goal: "Tiga tombol semuanya harus ON supaya lampu menyala.",
    switches: [{ id: "S1", label: "A" }, { id: "S2", label: "B" }, { id: "S3", label: "C" }],
    lamps: [{ id: "L1", label: "Lampu" }],
    gates: ["AND"],
    optimal: 2,
    truth: (s) => ({ L1: s.S1 && s.S2 && s.S3 }),
    hint: "Pakai 2 gerbang AND. AND pertama untuk A & B, AND kedua menggabungkan hasilnya dengan C."
  },

  // ----- OR -----
  {
    id: 5,
    goal: "Lampu menyala jika SALAH SATU tombol ON.",
    switches: [{ id: "S1", label: "Tombol A" }, { id: "S2", label: "Tombol B" }],
    lamps: [{ id: "L1", label: "Lampu" }],
    gates: ["OR"],
    optimal: 1,
    truth: (s) => ({ L1: s.S1 || s.S2 }),
    hint: "Pakai 1 gerbang OR. Cukup salah satu tombol ON untuk menyalakan lampu."
  },
  {
    id: 6,
    goal: "Tiga tombol — lampu menyala jika minimal satu ON.",
    switches: [{ id: "S1", label: "A" }, { id: "S2", label: "B" }, { id: "S3", label: "C" }],
    lamps: [{ id: "L1", label: "Lampu" }],
    gates: ["OR"],
    optimal: 2,
    truth: (s) => ({ L1: s.S1 || s.S2 || s.S3 }),
    hint: "Pakai 2 gerbang OR berantai: OR(A,B) lalu OR hasilnya dengan C."
  },

  // ----- NOT -----
  {
    id: 7,
    goal: "Lampu menyala HANYA jika tombol OFF (terbalik).",
    switches: [{ id: "S1", label: "Tombol" }],
    lamps: [{ id: "L1", label: "Lampu" }],
    gates: ["NOT"],
    optimal: 1,
    truth: (s) => ({ L1: !s.S1 }),
    hint: "Pakai 1 gerbang NOT untuk membalik sinyal tombol."
  },
  {
    id: 8,
    goal: "Lampu A menyala saat tombol ON, Lampu B menyala saat tombol OFF.",
    switches: [{ id: "S1", label: "Tombol" }],
    lamps: [{ id: "L1", label: "Lampu A" }, { id: "L2", label: "Lampu B" }],
    gates: ["NOT"],
    optimal: 1,
    truth: (s) => ({ L1: s.S1, L2: !s.S1 }),
    hint: "Tombol langsung ke Lampu A. Untuk Lampu B, lewati gerbang NOT dulu."
  },

  // ----- COMBINATION -----
  {
    id: 9,
    goal: "Lampu menyala jika A ON DAN B OFF.",
    switches: [{ id: "S1", label: "A" }, { id: "S2", label: "B" }],
    lamps: [{ id: "L1", label: "Lampu" }],
    gates: ["AND", "NOT"],
    optimal: 2,
    truth: (s) => ({ L1: s.S1 && !s.S2 }),
    hint: "Balik B dengan NOT, lalu AND-kan dengan A."
  },
  {
    id: 10,
    goal: "Lampu menyala jika (A ATAU B) tapi C harus OFF.",
    switches: [{ id: "S1", label: "A" }, { id: "S2", label: "B" }, { id: "S3", label: "C" }],
    lamps: [{ id: "L1", label: "Lampu" }],
    gates: ["AND", "OR", "NOT"],
    optimal: 3,
    truth: (s) => ({ L1: (s.S1 || s.S2) && !s.S3 }),
    hint: "OR(A,B) → kombinasikan dengan NOT(C) lewat AND."
  },
  {
    id: 11,
    goal: "XOR: lampu menyala jika TEPAT SATU dari A atau B yang ON (tidak keduanya).",
    switches: [{ id: "S1", label: "A" }, { id: "S2", label: "B" }],
    lamps: [{ id: "L1", label: "Lampu" }],
    gates: ["AND", "OR", "NOT"],
    optimal: 5,
    truth: (s) => ({ L1: s.S1 !== s.S2 }),
    hint: "Rumus: (A DAN BUKAN B) ATAU (BUKAN A DAN B). Pakai 2 NOT, 2 AND, dan 1 OR."
  },

  // ----- BOSS -----
  {
    id: 12,
    goal: "Sistem alarm: Lampu MERAH menyala jika sensor pintu ON DAN alarm aktif. Lampu HIJAU menyala jika alarm OFF (aman).",
    switches: [{ id: "S1", label: "Sensor Pintu" }, { id: "S2", label: "Alarm Aktif" }],
    lamps: [{ id: "L1", label: "🔴 Bahaya" }, { id: "L2", label: "🟢 Aman" }],
    gates: ["AND", "OR", "NOT"],
    optimal: 2,
    truth: (s) => ({ L1: s.S1 && s.S2, L2: !s.S2 }),
    hint: "Lampu merah = AND(sensor, alarm). Lampu hijau = NOT(alarm)."
  }
];

/* ============================================================
   STATE
   ============================================================ */
const state = {
  level: null,           // current level def
  levelIdx: 0,
  components: [],        // list of placed components: switches, lamps, gates
  wires: [],             // list of {from: "compId.port", to: "compId.port"}
  switchValues: {},      // {S1: false, S2: true}
  hintsUsed: 0,
  startTs: 0,
  timerInterval: null,
  draggingGate: null,    // gate type being dragged from toolbox
  pendingWire: null,     // {compId, port, kind:'output'|'input'} when one end picked
  progress: loadProgress()
};

/* ============================================================
   PROGRESS / STORAGE
   ============================================================ */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { bestPerLevel: {}, lastUnlocked: 1 };
}

function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); } catch (_) {}
}

function totalScore() {
  return Object.values(state.progress.bestPerLevel).reduce((a, b) => a + b, 0);
}

function levelsDone() {
  return Object.keys(state.progress.bestPerLevel).length;
}

/* ============================================================
   MENU SCREEN
   ============================================================ */
function renderMenu() {
  const grid = document.getElementById("level-grid");
  grid.innerHTML = "";
  const unlocked = state.progress.lastUnlocked;
  for (let i = 1; i <= TOTAL_LEVELS; i++) {
    const btn = document.createElement("button");
    btn.className = "lvl-btn";
    const done = state.progress.bestPerLevel[i];
    const locked = i > unlocked;
    if (locked) btn.classList.add("locked");
    if (done !== undefined) btn.classList.add("done");
    btn.innerHTML = `
      <div class="lvl-num">${locked ? "🔒" : i}</div>
      ${done !== undefined ? `<div class="lvl-best">${done}</div>` : ""}
    `;
    btn.disabled = locked;
    btn.addEventListener("click", () => startLevel(i));
    grid.appendChild(btn);
  }
  document.getElementById("total-score").textContent = totalScore();
  document.getElementById("levels-done").textContent = levelsDone();
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ============================================================
   LEVEL SETUP
   ============================================================ */
function startLevel(num) {
  const lvl = LEVELS[num - 1];
  if (!lvl) return;
  state.level = lvl;
  state.levelIdx = num - 1;
  state.components = [];
  state.wires = [];
  state.switchValues = {};
  state.hintsUsed = 0;
  state.pendingWire = null;
  state.draggingGate = null;

  // Set up switches as components
  lvl.switches.forEach((s, i) => {
    state.switchValues[s.id] = false;
    state.components.push({
      id: s.id,
      kind: "switch",
      label: s.label,
      x: 8,                                        // % of canvas width
      y: 15 + i * (70 / Math.max(lvl.switches.length, 1)),
      fixed: true
    });
  });
  // Set up lamps
  lvl.lamps.forEach((l, i) => {
    state.components.push({
      id: l.id,
      kind: "lamp",
      label: l.label,
      x: 88,
      y: 15 + i * (70 / Math.max(lvl.lamps.length, 1)),
      fixed: true
    });
  });

  // UI prep
  document.getElementById("lvl-num").textContent = num;
  document.getElementById("lvl-goal").textContent = lvl.goal;
  document.getElementById("lvl-gate-count").textContent = "0";
  document.getElementById("lvl-timer").textContent = "0";
  document.getElementById("lvl-total-score").textContent = totalScore();

  buildToolbox();
  renderCanvas();
  redrawWires();

  state.startTs = Date.now();
  if (state.timerInterval) clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    const sec = Math.floor((Date.now() - state.startTs) / 1000);
    document.getElementById("lvl-timer").textContent = sec;
  }, 500);

  showScreen("screen-game");
  startBgm();
}

function backToMenu() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  stopBgm();
  renderMenu();
  showScreen("screen-menu");
}

/* ============================================================
   TOOLBOX (gate palette)
   ============================================================ */
function buildToolbox() {
  const tb = document.getElementById("toolbox");
  tb.innerHTML = "";
  if (!state.level.gates.length) {
    tb.innerHTML = '<span class="toolbox-empty">Tidak perlu gerbang di level ini.</span>';
    return;
  }
  state.level.gates.forEach(type => {
    const item = document.createElement("button");
    item.className = "tool-gate gate-" + type.toLowerCase();
    item.dataset.type = type;
    item.innerHTML = `<span class="gate-shape">${gateSymbol(type)}</span><span class="gate-name">${type}</span>`;
    item.addEventListener("click", () => addGate(type));
    tb.appendChild(item);
  });
}

function gateSymbol(type) {
  if (type === "AND") return "&";
  if (type === "OR")  return "≥1";
  if (type === "NOT") return "¬";
  return "?";
}

function gateInputs(type) { return type === "NOT" ? 1 : 2; }

function addGate(type) {
  const id = "G" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  // Place near center, offset by existing gate count
  const placedGates = state.components.filter(c => c.kind === "gate").length;
  const comp = {
    id,
    kind: "gate",
    type,
    x: 35 + (placedGates % 3) * 12,
    y: 25 + Math.floor(placedGates / 3) * 22,
    inputs: gateInputs(type)
  };
  state.components.push(comp);
  document.getElementById("lvl-gate-count").textContent =
    state.components.filter(c => c.kind === "gate").length;
  playSfx("place");
  renderCanvas();
}

function removeGate(id) {
  state.components = state.components.filter(c => c.id !== id);
  state.wires = state.wires.filter(w =>
    !w.from.startsWith(id + ".") && !w.to.startsWith(id + ".")
  );
  document.getElementById("lvl-gate-count").textContent =
    state.components.filter(c => c.kind === "gate").length;
  renderCanvas();
  redrawWires();
}

/* ============================================================
   CANVAS RENDER
   ============================================================ */
function renderCanvas() {
  const canvas = document.getElementById("canvas");
  canvas.innerHTML = "";
  state.components.forEach(comp => {
    const el = document.createElement("div");
    el.className = "comp comp-" + comp.kind;
    if (comp.kind === "gate") el.classList.add("gate-" + comp.type.toLowerCase());
    el.dataset.id = comp.id;
    el.style.left = comp.x + "%";
    el.style.top  = comp.y + "%";

    if (comp.kind === "switch") {
      const on = state.switchValues[comp.id];
      el.classList.toggle("on", on);
      el.innerHTML = `
        <div class="sw-body">
          <div class="sw-knob"></div>
          <div class="sw-label">${comp.label}</div>
          <div class="sw-state">${on ? "ON" : "OFF"}</div>
        </div>
        <div class="port port-out" data-port="out"></div>
      `;
      el.querySelector(".sw-body").addEventListener("click", e => {
        e.stopPropagation();
        state.switchValues[comp.id] = !state.switchValues[comp.id];
        playSfx(state.switchValues[comp.id] ? "switchOn" : "switchOff");
        renderCanvas();
        redrawWires();
      });
    } else if (comp.kind === "lamp") {
      const lit = computeLampStates()[comp.id];
      el.classList.toggle("lit", !!lit);
      el.innerHTML = `
        <div class="port port-in" data-port="in0"></div>
        <div class="lamp-body">
          <div class="lamp-bulb"></div>
          <div class="lamp-label">${comp.label}</div>
        </div>
      `;
    } else if (comp.kind === "gate") {
      const ins = comp.inputs;
      let portsHtml = "";
      for (let i = 0; i < ins; i++) {
        const top = ins === 1 ? 50 : (30 + i * 40);
        portsHtml += `<div class="port port-in" data-port="in${i}" style="top:${top}%"></div>`;
      }
      portsHtml += `<div class="port port-out" data-port="out"></div>`;
      el.innerHTML = `
        ${portsHtml}
        <div class="gate-body">
          <span class="gate-symbol">${gateSymbol(comp.type)}</span>
          <span class="gate-type">${comp.type}</span>
        </div>
        <button class="gate-remove" title="Hapus">×</button>
      `;
      el.querySelector(".gate-remove").addEventListener("click", e => {
        e.stopPropagation();
        removeGate(comp.id);
      });
      // Drag to reposition
      makeGateDraggable(el, comp);
    }

    // Wire ports: tap to start/finish wire
    el.querySelectorAll(".port").forEach(p => {
      p.addEventListener("click", e => {
        e.stopPropagation();
        handlePortTap(comp.id, p.dataset.port, p.classList.contains("port-out") ? "output" : "input");
      });
    });

    canvas.appendChild(el);
  });

  // After components mount, redraw wires (they need positions)
  requestAnimationFrame(redrawWires);
}

/* ============================================================
   GATE DRAG (single global handler — avoids listener leak across re-renders)
   ============================================================ */
let drag = null;  // { compId, startX, startY, baseX, baseY }

function makeGateDraggable(el, comp) {
  const body = el.querySelector(".gate-body");
  const onDown = e => {
    if (e.target.closest(".port") || e.target.closest(".gate-remove")) return;
    const pt = pointerPos(e);
    drag = { compId: comp.id, startX: pt.x, startY: pt.y, baseX: comp.x, baseY: comp.y };
    el.classList.add("dragging");
    e.preventDefault();
  };
  body.addEventListener("mousedown", onDown);
  body.addEventListener("touchstart", onDown, { passive: false });
}

function onGlobalMove(e) {
  if (!drag) return;
  const comp = state.components.find(c => c.id === drag.compId);
  if (!comp) { drag = null; return; }
  const pt = pointerPos(e);
  const stage = document.querySelector(".game-stage").getBoundingClientRect();
  const dxPct = ((pt.x - drag.startX) / stage.width)  * 100;
  const dyPct = ((pt.y - drag.startY) / stage.height) * 100;
  comp.x = clamp(drag.baseX + dxPct, 18, 82);
  comp.y = clamp(drag.baseY + dyPct, 5, 90);
  const el = document.querySelector(`.comp[data-id="${comp.id}"]`);
  if (el) {
    el.style.left = comp.x + "%";
    el.style.top  = comp.y + "%";
  }
  redrawWires();
  e.preventDefault();
}

function onGlobalUp() {
  if (!drag) return;
  const el = document.querySelector(`.comp[data-id="${drag.compId}"]`);
  if (el) el.classList.remove("dragging");
  drag = null;
}

function pointerPos(e) {
  if (e.touches && e.touches[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
  if (e.changedTouches && e.changedTouches[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
  return { x: e.clientX, y: e.clientY };
}

function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

/* ============================================================
   WIRE CONNECTION (tap-to-tap)
   ============================================================ */
function handlePortTap(compId, port, kind) {
  if (!state.pendingWire) {
    state.pendingWire = { compId, port, kind };
    highlightPort(compId, port, true);
    return;
  }
  // We already have a pending end — try to make connection
  const a = state.pendingWire;
  const b = { compId, port, kind };
  // Cancel if same port tapped again
  if (a.compId === b.compId && a.port === b.port) {
    state.pendingWire = null;
    highlightPort(a.compId, a.port, false);
    return;
  }
  // Must be one output + one input
  if (a.kind === b.kind) {
    flashError("Sambungkan output ke input.");
    highlightPort(a.compId, a.port, false);
    state.pendingWire = null;
    return;
  }
  const out = a.kind === "output" ? a : b;
  const inn = a.kind === "input"  ? a : b;

  // Same component? not allowed
  if (out.compId === inn.compId) {
    flashError("Tidak bisa hubungkan ke diri sendiri.");
    highlightPort(a.compId, a.port, false);
    state.pendingWire = null;
    return;
  }

  // Remove any existing wire going INTO this input (one wire per input)
  state.wires = state.wires.filter(w => w.to !== `${inn.compId}.${inn.port}`);

  state.wires.push({ from: `${out.compId}.${out.port}`, to: `${inn.compId}.${inn.port}` });
  playSfx("wire");
  highlightPort(a.compId, a.port, false);
  state.pendingWire = null;
  renderCanvas();
  redrawWires();
}

function highlightPort(compId, port, on) {
  const p = document.querySelector(`.comp[data-id="${compId}"] .port[data-port="${port}"]`);
  if (p) p.classList.toggle("pending", on);
}

let errorTimer = null;
function flashError(msg) {
  playSfx("error");
  let bar = document.getElementById("err-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "err-bar";
    bar.className = "err-bar";
    document.body.appendChild(bar);
  }
  bar.textContent = msg;
  bar.classList.add("show");
  if (errorTimer) clearTimeout(errorTimer);
  errorTimer = setTimeout(() => bar.classList.remove("show"), 1800);
}

/* ============================================================
   WIRE RENDERING (SVG paths)
   ============================================================ */
function trimPoint(p1, p2, pixels) {
  const dx = p2.x - p1.x, dy = p2.y - p1.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist <= pixels) return { x: p1.x, y: p1.y };
  const t = pixels / dist;
  return { x: p1.x + dx * t, y: p1.y + dy * t };
}

function redrawWires() {
  const svg = document.getElementById("wire-layer");
  const stage = document.querySelector(".game-stage");
  if (!svg || !stage) return;
  const rect = stage.getBoundingClientRect();
  svg.setAttribute("viewBox", `0 0 ${rect.width} ${rect.height}`);
  svg.setAttribute("width", rect.width);
  svg.setAttribute("height", rect.height);
  svg.innerHTML = "";

  // While user is mid-connection, disable wire deletion clicks
  svg.classList.toggle("connecting", !!state.pendingWire);

  state.wires.forEach((w, idx) => {
    const aRaw = portCenter(w.from);
    const bRaw = portCenter(w.to);
    if (!aRaw || !bRaw) return;
    // Trim 12px at each end so wire hit-area never overlaps with port hit-area
    const a = trimPoint(aRaw, bRaw, 12);
    const b = trimPoint(bRaw, aRaw, 12);
    const live = isWireActive(w);
    const dx = (b.x - a.x) * 0.5;
    const d = `M ${a.x} ${a.y} C ${a.x + dx} ${a.y}, ${b.x - dx} ${b.y}, ${b.x} ${b.y}`;

    // Group: wide invisible hit area + visible wire
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.setAttribute("class", "wire-group");

    const hit = document.createElementNS("http://www.w3.org/2000/svg", "path");
    hit.setAttribute("d", d);
    hit.setAttribute("class", "wire-hit");
    hit.addEventListener("click", e => { e.stopPropagation(); removeWire(idx); });
    g.appendChild(hit);

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", d);
    path.setAttribute("class", "wire" + (live ? " live" : ""));
    g.appendChild(path);

    svg.appendChild(g);
  });
}

function removeWire(idx) {
  if (idx < 0 || idx >= state.wires.length) return;
  // Cancel any pending wire start
  if (state.pendingWire) {
    highlightPort(state.pendingWire.compId, state.pendingWire.port, false);
    state.pendingWire = null;
  }
  state.wires.splice(idx, 1);
  playSfx("error");  // brief disconnect blip
  renderCanvas();    // re-evaluate lamp states
  redrawWires();
}

function portCenter(ref) {
  const [compId, port] = ref.split(".");
  const portEl = document.querySelector(`.comp[data-id="${compId}"] .port[data-port="${port}"]`);
  const stage = document.querySelector(".game-stage");
  if (!portEl || !stage) return null;
  const pr = portEl.getBoundingClientRect();
  const sr = stage.getBoundingClientRect();
  return {
    x: pr.left - sr.left + pr.width / 2,
    y: pr.top  - sr.top  + pr.height / 2
  };
}

window.addEventListener("resize", redrawWires);

/* ============================================================
   SIMULATION ENGINE
   ============================================================ */
// For a given switch-value map, compute every component's output.
function simulate(switchValues) {
  const outputs = {};               // {compId: bool}
  const visiting = new Set();

  function getCompOut(compId) {
    if (compId in outputs) return outputs[compId];
    if (visiting.has(compId)) return false; // cycle guard
    visiting.add(compId);

    const comp = state.components.find(c => c.id === compId);
    if (!comp) return false;
    let result = false;

    if (comp.kind === "switch") {
      result = !!switchValues[comp.id];
    } else if (comp.kind === "gate") {
      const inputVals = [];
      for (let i = 0; i < comp.inputs; i++) {
        const wire = state.wires.find(w => w.to === `${compId}.in${i}`);
        if (!wire) { inputVals.push(false); continue; }
        const [srcId] = wire.from.split(".");
        inputVals.push(getCompOut(srcId));
      }
      if (comp.type === "AND") result = inputVals.every(Boolean);
      else if (comp.type === "OR")  result = inputVals.some(Boolean);
      else if (comp.type === "NOT") result = !inputVals[0];
    } else if (comp.kind === "lamp") {
      // lamps don't produce — but support querying their input value
      const wire = state.wires.find(w => w.to === `${compId}.in0`);
      if (!wire) result = false;
      else {
        const [srcId] = wire.from.split(".");
        result = getCompOut(srcId);
      }
    }

    outputs[compId] = result;
    visiting.delete(compId);
    return result;
  }

  state.components.forEach(c => getCompOut(c.id));
  return outputs;
}

function computeLampStates() {
  return simulate(state.switchValues);
}

function isWireActive(wire) {
  const out = simulate(state.switchValues);
  const [srcId] = wire.from.split(".");
  return !!out[srcId];
}

/* ============================================================
   SOLUTION CHECK
   ============================================================ */
function checkSolution() {
  const sws = state.level.switches.map(s => s.id);
  const lamps = state.level.lamps.map(l => l.id);
  const combos = 1 << sws.length;

  for (let i = 0; i < combos; i++) {
    const sv = {};
    sws.forEach((s, k) => { sv[s] = !!(i & (1 << k)); });
    const expected = state.level.truth(sv);
    const actual = simulate(sv);
    for (const lid of lamps) {
      if ((!!expected[lid]) !== (!!actual[lid])) {
        return { ok: false, failCase: { input: sv, expected, actual } };
      }
    }
  }
  return { ok: true };
}

/* ============================================================
   SCORING
   ============================================================ */
function calcScore() {
  const lvl = state.level;
  const base = lvl.id * 100;
  const usedGates = state.components.filter(c => c.kind === "gate").length;
  // Efficiency: +50 if used <= optimal, +25 if optimal+1, 0 if more
  let eff = 0;
  if (usedGates <= lvl.optimal) eff = 50;
  else if (usedGates === lvl.optimal + 1) eff = 25;
  // Time: +50 if < 30s, +25 if < 60s
  const sec = Math.floor((Date.now() - state.startTs) / 1000);
  let time = 0;
  if (sec < 30) time = 50;
  else if (sec < 60) time = 25;
  // Hint penalty
  const pen = state.hintsUsed * 20;
  const total = Math.max(0, base + eff + time - pen);
  return { base, eff, time, pen, total };
}

/* ============================================================
   GAME ACTIONS
   ============================================================ */
function onCheck() {
  const result = checkSolution();
  if (!result.ok) {
    flashError("Belum benar — coba semua kombinasi tombol.");
    return;
  }
  if (state.timerInterval) clearInterval(state.timerInterval);
  const score = calcScore();
  const lvlNum = state.level.id;
  const prevBest = state.progress.bestPerLevel[lvlNum] || 0;
  const isNewBest = score.total > prevBest;
  if (isNewBest) {
    state.progress.bestPerLevel[lvlNum] = score.total;
  }
  if (lvlNum >= state.progress.lastUnlocked && lvlNum < TOTAL_LEVELS) {
    state.progress.lastUnlocked = lvlNum + 1;
  }
  saveProgress();
  // Update running total in game header
  document.getElementById("lvl-total-score").textContent = totalScore();

  // Report total to leaderboard
  if (window.AkaScoreReporter) {
    window.AkaScoreReporter.report(GAME_ID, totalScore(), {
      level: lvlNum,
      levelsCompleted: levelsDone(),
      lastLevelScore: score.total
    });
  }

  // Show win modal
  playSfx("win");
  document.getElementById("win-base").textContent = score.base;
  document.getElementById("win-eff").textContent  = "+" + score.eff;
  document.getElementById("win-time").textContent = "+" + score.time;
  document.getElementById("win-pen").textContent  = "-" + score.pen;
  document.getElementById("win-total").textContent = score.total;
  document.getElementById("win-best").textContent = isNewBest ? "BARU!" : prevBest;
  document.getElementById("modal-win").classList.remove("hidden");
}

function onClear() {
  state.components = state.components.filter(c => c.kind !== "gate");
  state.wires = [];
  state.pendingWire = null;
  document.getElementById("lvl-gate-count").textContent = "0";
  renderCanvas();
  redrawWires();
}

function onHint() {
  // Apply penalty once per level (reopening doesn't multiply)
  if (state.hintsUsed === 0) state.hintsUsed = 1;
  document.getElementById("hint-text").textContent = state.level.hint;
  document.getElementById("modal-hint").classList.remove("hidden");
}

function onHintClose() {
  document.getElementById("modal-hint").classList.add("hidden");
}

function onReplay() {
  document.getElementById("modal-win").classList.add("hidden");
  startLevel(state.level.id);
}

function onNext() {
  document.getElementById("modal-win").classList.add("hidden");
  const next = state.level.id + 1;
  if (next > TOTAL_LEVELS) {
    document.getElementById("done-total").textContent = totalScore();
    document.getElementById("modal-done").classList.remove("hidden");
  } else {
    startLevel(next);
  }
}

/* ============================================================
   BOOT
   ============================================================ */
function init() {
  loadMute();
  // Reflect initial mute state on both buttons
  const reflectMute = () => {
    const m = muted;
    const game = document.getElementById("btn-mute");
    const menu = document.getElementById("btn-mute-menu");
    if (game) game.textContent = m ? "🔇" : "🔊";
    if (menu) menu.textContent = m ? "🔇 Suara" : "🔊 Suara";
  };
  reflectMute();
  const toggleMute = () => { setMuted(!muted); reflectMute(); };
  document.getElementById("btn-mute").addEventListener("click", toggleMute);
  document.getElementById("btn-mute-menu").addEventListener("click", toggleMute);

  document.getElementById("btn-back").addEventListener("click", backToMenu);
  document.getElementById("btn-check").addEventListener("click", onCheck);
  document.getElementById("btn-clear").addEventListener("click", onClear);
  document.getElementById("btn-hint").addEventListener("click", onHint);
  document.getElementById("btn-hint-close").addEventListener("click", onHintClose);
  document.getElementById("btn-replay").addEventListener("click", onReplay);
  document.getElementById("btn-next").addEventListener("click", onNext);
  document.getElementById("btn-done-back").addEventListener("click", () => {
    document.getElementById("modal-done").classList.add("hidden");
    backToMenu();
  });
  document.getElementById("reset-progress").addEventListener("click", () => {
    if (confirm("Yakin reset progress? Semua skor akan terhapus.")) {
      state.progress = { bestPerLevel: {}, lastUnlocked: 1 };
      saveProgress();
      renderMenu();
    }
  });
  // Click empty canvas to cancel pending wire
  document.getElementById("canvas").addEventListener("click", () => {
    if (state.pendingWire) {
      highlightPort(state.pendingWire.compId, state.pendingWire.port, false);
      state.pendingWire = null;
    }
  });

  // Global drag listeners (attached once)
  document.addEventListener("mousemove", onGlobalMove);
  document.addEventListener("touchmove", onGlobalMove, { passive: false });
  document.addEventListener("mouseup", onGlobalUp);
  document.addEventListener("touchend", onGlobalUp);

  renderMenu();
}

document.addEventListener("DOMContentLoaded", init);
