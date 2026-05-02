/* ============================================================
   ROBO PATH — Visual programming for kids (kelas 4-6)
   ============================================================ */

const GAME_ID = "robo-path";
const STORAGE_KEY = "rp_progress_v1";
const MUTE_KEY = "rp_muted_v1";
const TOTAL_LEVELS = 20;
const STEP_MS = 350;        // animation step duration

/* ============================================================
   AUDIO (Web Audio API — synthesized)
   ============================================================ */
let audioCtx = null, masterGain = null, bgmTimer = null, bgmStep = 0, padNodes = null;
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
function ensureAudio() { initAudio(); if (audioCtx && audioCtx.state === "suspended") audioCtx.resume(); }

function playSfx(type) {
  if (muted) return;
  ensureAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(masterGain);
  switch (type) {
    case "move":
      o.type = "triangle"; o.frequency.setValueAtTime(440, now); o.frequency.exponentialRampToValueAtTime(620, now + 0.05);
      g.gain.setValueAtTime(0.22, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      o.start(now); o.stop(now + 0.12); break;
    case "turn":
      o.type = "sine"; o.frequency.setValueAtTime(320, now); o.frequency.exponentialRampToValueAtTime(460, now + 0.07);
      g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
      o.start(now); o.stop(now + 0.12); break;
    case "place":
      o.type = "triangle"; o.frequency.setValueAtTime(320, now); o.frequency.exponentialRampToValueAtTime(180, now + 0.08);
      g.gain.setValueAtTime(0.28, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      o.start(now); o.stop(now + 0.15); break;
    case "click":
      o.type = "triangle"; o.frequency.setValueAtTime(800, now);
      g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
      o.start(now); o.stop(now + 0.07); break;
    case "undo":
      o.type = "triangle"; o.frequency.setValueAtTime(500, now); o.frequency.exponentialRampToValueAtTime(280, now + 0.1);
      g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      o.start(now); o.stop(now + 0.14); break;
    case "run": {
      // Engine start sound — ascending blip
      const notes = [330, 440, 554];
      notes.forEach((f, i) => {
        const oo = audioCtx.createOscillator(), gg = audioCtx.createGain();
        oo.connect(gg); gg.connect(masterGain);
        oo.type = "square"; oo.frequency.value = f;
        const t0 = now + i * 0.06;
        gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.12);
        oo.start(t0); oo.stop(t0 + 0.14);
      });
      try { o.disconnect(); g.disconnect(); } catch (_) {}
      return;
    }
    case "star": {
      const notes = [659, 880, 1175];
      notes.forEach((f, i) => {
        const oo = audioCtx.createOscillator(), gg = audioCtx.createGain();
        oo.connect(gg); gg.connect(masterGain);
        oo.type = "sine"; oo.frequency.value = f;
        const t0 = now + i * 0.06;
        gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(0.28, t0 + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.22);
        oo.start(t0); oo.stop(t0 + 0.24);
      });
      try { o.disconnect(); g.disconnect(); } catch (_) {}
      return;
    }
    case "hit":
      o.type = "sawtooth"; o.frequency.setValueAtTime(180, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.2);
      g.gain.setValueAtTime(0.3, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      o.start(now); o.stop(now + 0.3); break;
    case "fall":
      o.type = "sawtooth"; o.frequency.setValueAtTime(440, now); o.frequency.exponentialRampToValueAtTime(60, now + 0.4);
      g.gain.setValueAtTime(0.28, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      o.start(now); o.stop(now + 0.55); break;
    case "win": {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
      notes.forEach((f, i) => {
        const oo = audioCtx.createOscillator(), gg = audioCtx.createGain();
        oo.connect(gg); gg.connect(masterGain);
        oo.type = "sine"; oo.frequency.value = f;
        const t0 = now + i * 0.11;
        gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(0.35, t0 + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
        oo.start(t0); oo.stop(t0 + 0.45);
      });
      try { o.disconnect(); g.disconnect(); } catch (_) {}
      return;
    }
    case "levelStart": {
      // Welcome chime when entering a level
      const notes = [392, 523, 659];
      notes.forEach((f, i) => {
        const oo = audioCtx.createOscillator(), gg = audioCtx.createGain();
        oo.connect(gg); gg.connect(masterGain);
        oo.type = "triangle"; oo.frequency.value = f;
        const t0 = now + i * 0.08;
        gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
        oo.start(t0); oo.stop(t0 + 0.32);
      });
      try { o.disconnect(); g.disconnect(); } catch (_) {}
      return;
    }
    case "buy":
      o.type = "sine"; o.frequency.setValueAtTime(523, now); o.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      g.gain.setValueAtTime(0.28, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      o.start(now); o.stop(now + 0.3); break;
  }
}

const BGM_NOTES = [261.63, 329.63, 392, 523.25, 392, 329.63, 440, 329.63];
function startBgm() {
  if (muted || bgmTimer) return;
  ensureAudio(); if (!audioCtx) return;
  if (!padNodes) {
    const o1 = audioCtx.createOscillator(), o2 = audioCtx.createOscillator(), pg = audioCtx.createGain();
    o1.type = "sine"; o1.frequency.value = 130.81;
    o2.type = "sine"; o2.frequency.value = 196;
    o1.connect(pg); o2.connect(pg); pg.gain.value = 0.038; pg.connect(masterGain);
    o1.start(); o2.start(); padNodes = { o1, o2, pg };
  }
  bgmStep = 0;
  bgmTimer = setInterval(() => {
    if (muted || !audioCtx) return;
    const t0 = audioCtx.currentTime;
    const f = BGM_NOTES[bgmStep % BGM_NOTES.length];
    const oo = audioCtx.createOscillator(), gg = audioCtx.createGain();
    oo.connect(gg); gg.connect(masterGain);
    oo.type = "triangle"; oo.frequency.value = f;
    gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(0.075, t0 + 0.05);
    gg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.5);
    oo.start(t0); oo.stop(t0 + 0.55);
    bgmStep++;
  }, 580);
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
  if (m) stopBgm();
  else if (document.getElementById("screen-game").classList.contains("active")) startBgm();
}
function loadMute() { try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (_) {} }

/* ============================================================
   SKINS
   ============================================================ */
const SKINS = [
  { id: "robo",    name: "Robo",     price: 0,  emoji: "🤖", color: "#94a3b8" },
  { id: "ninja",   name: "Ninja",    price: 10, emoji: "🥷", color: "#1f2937" },
  { id: "wizard",  name: "Penyihir", price: 15, emoji: "🧙", color: "#7c3aed" },
  { id: "alien",   name: "Alien",    price: 20, emoji: "👽", color: "#10b981" },
  { id: "unicorn", name: "Unicorn",  price: 25, emoji: "🦄", color: "#ec4899" },
  { id: "dragon",  name: "Naga",     price: 35, emoji: "🐉", color: "#dc2626" }
];

/* ============================================================
   LEVELS (20)
   Direction: 0=N, 1=E, 2=S, 3=W
   ============================================================ */
const LEVELS = [
  // ── 1-3: pure forward ──
  {
    id: 1, grid: { w: 4, h: 1 }, start: { x: 0, y: 0, dir: 1 }, goal: { x: 3, y: 0 },
    walls: [], holes: [], stars: [],
    blocks: ["move"], optimal: 3,
    goalText: "Maju 3 langkah ke kanan.",
    hint: "Tambah 3 blok 'Maju' lalu jalankan."
  },
  {
    id: 2, grid: { w: 5, h: 1 }, start: { x: 0, y: 0, dir: 1 }, goal: { x: 4, y: 0 },
    walls: [], holes: [], stars: [{ x: 2, y: 0 }],
    blocks: ["move"], optimal: 4,
    goalText: "Maju lurus, ambil bintang di tengah.",
    hint: "4 blok 'Maju'. Robot otomatis ambil bintang yang dilewati."
  },
  {
    id: 3, grid: { w: 6, h: 1 }, start: { x: 0, y: 0, dir: 1 }, goal: { x: 5, y: 0 },
    walls: [], holes: [], stars: [{ x: 1, y: 0 }, { x: 3, y: 0 }],
    blocks: ["move"], optimal: 5,
    goalText: "Lurus terus, ambil 2 bintang.",
    hint: "5 langkah lurus."
  },

  // ── 4-6: turning ──
  {
    id: 4, grid: { w: 3, h: 3 }, start: { x: 0, y: 2, dir: 0 }, goal: { x: 2, y: 0 },
    walls: [], holes: [], stars: [{ x: 0, y: 0 }],
    blocks: ["move", "turnRight", "turnLeft"], optimal: 5,
    goalText: "Naik, lalu belok kanan menuju ⭐.",
    hint: "Maju 2× → Belok Kanan → Maju 2×."
  },
  {
    id: 5, grid: { w: 4, h: 3 }, start: { x: 0, y: 2, dir: 1 }, goal: { x: 3, y: 0 },
    walls: [], holes: [], stars: [{ x: 2, y: 2 }, { x: 3, y: 1 }],
    blocks: ["move", "turnRight", "turnLeft"], optimal: 6,
    goalText: "Maju kanan, lalu naik.",
    hint: "Maju 3× → Belok Kiri → Maju 2×."
  },
  {
    id: 6, grid: { w: 4, h: 4 }, start: { x: 0, y: 3, dir: 0 }, goal: { x: 3, y: 0 },
    walls: [{ x: 1, y: 1 }, { x: 1, y: 2 }], holes: [], stars: [{ x: 0, y: 0 }, { x: 2, y: 0 }],
    blocks: ["move", "turnRight", "turnLeft"], optimal: 7,
    goalText: "Hindari dinding, ambil bintang di atas.",
    hint: "Maju 3× → Belok Kanan → Maju 3× — atau lewat sisi kiri dulu."
  },

  // ── 7-9: single loop ──
  {
    id: 7, grid: { w: 7, h: 1 }, start: { x: 0, y: 0, dir: 1 }, goal: { x: 6, y: 0 },
    walls: [], holes: [], stars: [{ x: 2, y: 0 }, { x: 4, y: 0 }],
    blocks: ["move", "loop"], optimal: 2,
    goalText: "Pakai LOOP untuk menghemat blok!",
    hint: "Loop 6× berisi blok Maju. Total: 2 blok."
  },
  {
    id: 8, grid: { w: 4, h: 4 }, start: { x: 0, y: 3, dir: 0 }, goal: { x: 3, y: 0 },
    walls: [], holes: [], stars: [{ x: 0, y: 0 }, { x: 3, y: 3 }],
    blocks: ["move", "turnRight", "turnLeft", "loop"], optimal: 5,
    goalText: "Naik, belok, maju lagi — pakai loop.",
    hint: "Loop 3×{Maju} → Belok Kanan → Loop 3×{Maju}."
  },
  {
    id: 9, grid: { w: 5, h: 5 }, start: { x: 0, y: 4, dir: 0 }, goal: { x: 4, y: 0 },
    walls: [], holes: [], stars: [{ x: 2, y: 2 }],
    blocks: ["move", "turnRight", "turnLeft", "loop"], optimal: 5,
    goalText: "Diagonal naik-kanan, ambil bintang tengah.",
    hint: "Loop 4×{Maju, Belok Kanan, Maju, Belok Kiri} — pola zig-zag."
  },

  // ── 10-12: combined sequencing + single loop ──
  {
    id: 10, grid: { w: 5, h: 3 }, start: { x: 0, y: 2, dir: 1 }, goal: { x: 4, y: 0 },
    walls: [{ x: 2, y: 1 }], holes: [], stars: [{ x: 1, y: 2 }, { x: 4, y: 2 }],
    blocks: ["move", "turnRight", "turnLeft", "loop"], optimal: 6,
    goalText: "Hindari dinding, ambil bintang.",
    hint: "Loop 4×{Maju} → Belok Kiri → Maju 2×."
  },
  {
    id: 11, grid: { w: 5, h: 5 }, start: { x: 0, y: 4, dir: 1 }, goal: { x: 4, y: 0 },
    walls: [], holes: [{ x: 2, y: 2 }], stars: [{ x: 4, y: 4 }, { x: 0, y: 0 }],
    blocks: ["move", "turnRight", "turnLeft", "loop"], optimal: 7,
    goalText: "Hati-hati lubang!",
    hint: "Lewat tepi grid, hindari lubang di tengah."
  },
  {
    id: 12, grid: { w: 6, h: 4 }, start: { x: 0, y: 3, dir: 1 }, goal: { x: 5, y: 0 },
    walls: [{ x: 2, y: 2 }, { x: 3, y: 1 }], holes: [{ x: 4, y: 2 }],
    stars: [{ x: 1, y: 3 }, { x: 5, y: 3 }, { x: 5, y: 1 }],
    blocks: ["move", "turnRight", "turnLeft", "loop"], optimal: 8,
    goalText: "Path bercabang dengan banyak rintangan.",
    hint: "Lurus 5×, belok kiri, naik."
  },

  // ── 13-16: nested loops ──
  {
    id: 13, grid: { w: 6, h: 1 }, start: { x: 0, y: 0, dir: 1 }, goal: { x: 5, y: 0 },
    walls: [], holes: [], stars: [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 5, y: 0 }],
    blocks: ["move", "loop"], optimal: 3,
    goalText: "Coba LOOP DALAM LOOP! 5 langkah dengan 3 blok.",
    hint: "Loop 5×{Maju} ATAU Loop 5×{Loop 1×{Maju}} — eksperimen!"
  },
  {
    id: 14, grid: { w: 5, h: 5 }, start: { x: 0, y: 4, dir: 0 }, goal: { x: 4, y: 0 },
    walls: [], holes: [], stars: [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 2, y: 2 }],
    blocks: ["move", "turnRight", "turnLeft", "loop"], optimal: 5,
    goalText: "Pola berulang: nested loop bisa membuatnya lebih ringkas.",
    hint: "Loop 4×{Maju, Belok Kanan, Maju, Belok Kiri}."
  },
  {
    id: 15, grid: { w: 6, h: 3 }, start: { x: 0, y: 1, dir: 1 }, goal: { x: 5, y: 1 },
    walls: [{ x: 2, y: 0 }, { x: 2, y: 2 }, { x: 4, y: 0 }, { x: 4, y: 2 }],
    holes: [], stars: [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 5, y: 1 }],
    blocks: ["move", "loop"], optimal: 2,
    goalText: "Lurus terus dengan loop singkat.",
    hint: "Loop 5×{Maju}."
  },
  {
    id: 16, grid: { w: 4, h: 4 }, start: { x: 0, y: 0, dir: 2 }, goal: { x: 3, y: 3 },
    walls: [], holes: [], stars: [{ x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }],
    blocks: ["move", "turnRight", "turnLeft", "loop"], optimal: 5,
    goalText: "Diagonal turun-kanan dengan nested loop.",
    hint: "Loop 3×{Loop 1×{Maju, Belok Kiri, Maju, Belok Kanan}}."
  },

  // ── 17-20: conditional + advanced ──
  {
    id: 17, grid: { w: 6, h: 1 }, start: { x: 0, y: 0, dir: 1 }, goal: { x: 5, y: 0 },
    walls: [{ x: 3, y: 0 }], holes: [], stars: [],
    blocks: ["move", "turnRight", "turnLeft", "loop", "if"],
    optimal: 4,
    goalText: "Pakai IF untuk hindari dinding di depan!",
    hint: "Loop berisi IF (dinding di depan) → belok-balik. Atau path manual."
  },
  {
    id: 18, grid: { w: 5, h: 3 }, start: { x: 0, y: 1, dir: 1 }, goal: { x: 4, y: 1 },
    walls: [{ x: 2, y: 1 }], holes: [], stars: [{ x: 0, y: 0 }, { x: 4, y: 0 }],
    blocks: ["move", "turnRight", "turnLeft", "loop", "if"],
    optimal: 6,
    goalText: "Belok atas saat ada dinding, lalu turun lagi.",
    hint: "Maju 2× → Belok Kiri → Maju → Belok Kanan → Maju 2× → Belok Kanan → Maju → Belok Kiri."
  },
  {
    id: 19, grid: { w: 7, h: 3 }, start: { x: 0, y: 2, dir: 1 }, goal: { x: 6, y: 2 },
    walls: [{ x: 2, y: 2 }, { x: 4, y: 2 }], holes: [], stars: [{ x: 0, y: 0 }, { x: 3, y: 0 }, { x: 6, y: 0 }],
    blocks: ["move", "turnRight", "turnLeft", "loop", "if"],
    optimal: 6,
    goalText: "Lewati 2 dinding dengan logika yang sama.",
    hint: "Loop yang isinya: Maju, IF wall → Belok Kiri-Maju-Belok Kanan-Maju-Belok Kanan-Maju-Belok Kiri."
  },
  {
    id: 20, grid: { w: 6, h: 5 }, start: { x: 0, y: 4, dir: 0 }, goal: { x: 5, y: 0 },
    walls: [{ x: 1, y: 3 }, { x: 3, y: 2 }, { x: 4, y: 4 }],
    holes: [{ x: 2, y: 1 }],
    stars: [{ x: 0, y: 0 }, { x: 5, y: 4 }, { x: 5, y: 0 }],
    blocks: ["move", "turnRight", "turnLeft", "loop", "if"],
    optimal: 10,
    goalText: "🏆 BOSS: kombinasi semua skill — sequencing, loop, conditional!",
    hint: "Tidak ada satu jalur tunggal — bagi grid jadi segmen, pakai loop+if untuk segmen yang mirip."
  }
];

/* ============================================================
   STATE
   ============================================================ */
const state = {
  level: null, levelIdx: 0,
  program: [],
  focus: null,           // ref to currently-focused container array
  focusBlock: null,      // the loop/if block whose body is focused (null = root)
  robot: null,           // {x, y, dir, alive, atGoal, starsCollected}
  collectedStars: new Set(),
  hintsUsed: 0,
  running: false,
  pendingLoopAdd: false, // true while loop-times modal is open
  progress: loadProgress()
};

/* ============================================================
   PROGRESS
   ============================================================ */
function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign({
      bestPerLevel: {}, bestStarsPerLevel: {}, lastUnlocked: 1,
      ownedSkins: ["robo"], equippedSkin: "robo", starsSpent: 0
    }, JSON.parse(raw));
  } catch (_) {}
  return {
    bestPerLevel: {}, bestStarsPerLevel: {}, lastUnlocked: 1,
    ownedSkins: ["robo"], equippedSkin: "robo", starsSpent: 0
  };
}
function saveProgress() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); } catch (_) {}
}
function totalScore() { return Object.values(state.progress.bestPerLevel).reduce((a, b) => a + b, 0); }
function levelsDone() { return Object.keys(state.progress.bestPerLevel).length; }
function totalStarsEarned() { return Object.values(state.progress.bestStarsPerLevel).reduce((a, b) => a + b, 0); }
function availableStars() { return totalStarsEarned() - state.progress.starsSpent; }
function getEquippedSkin() {
  return SKINS.find(s => s.id === state.progress.equippedSkin) || SKINS[0];
}

/* ============================================================
   SCREEN MANAGEMENT
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
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
    const score = state.progress.bestPerLevel[i];
    const stars = state.progress.bestStarsPerLevel[i] || 0;
    const lvl = LEVELS[i - 1];
    const maxStars = lvl ? lvl.stars.length : 0;
    const locked = i > unlocked;
    if (locked) btn.classList.add("locked");
    if (score !== undefined) btn.classList.add("done");

    let starHtml = "";
    if (maxStars > 0 && !locked) {
      starHtml = `<div class="lvl-stars">${"⭐".repeat(stars)}${"☆".repeat(maxStars - stars)}</div>`;
    }
    btn.innerHTML = `<div class="lvl-num">${locked ? "🔒" : i}</div>${starHtml}`;
    btn.disabled = locked;
    btn.addEventListener("click", () => startLevel(i));
    grid.appendChild(btn);
  }
  document.getElementById("total-score").textContent = totalScore();
  document.getElementById("total-stars").textContent = availableStars();
  document.getElementById("levels-done").textContent = levelsDone();
}

/* ============================================================
   SHOP SCREEN
   ============================================================ */
function renderShop() {
  const grid = document.getElementById("shop-grid");
  grid.innerHTML = "";
  document.getElementById("shop-stars").textContent = availableStars();
  SKINS.forEach(skin => {
    const owned = state.progress.ownedSkins.includes(skin.id);
    const equipped = state.progress.equippedSkin === skin.id;
    const card = document.createElement("div");
    card.className = "skin-card" + (equipped ? " equipped" : "") + (owned ? " owned" : "");
    card.innerHTML = `
      <div class="skin-preview" style="background:${skin.color}">
        <div class="skin-emoji">${skin.emoji}</div>
      </div>
      <div class="skin-name">${skin.name}</div>
      <div class="skin-status">
        ${equipped ? '<span class="badge-eq">✓ Dipakai</span>' :
          owned ? '<button class="btn-equip" data-id="'+skin.id+'">Pakai</button>' :
          '<button class="btn-buy" data-id="'+skin.id+'">⭐ '+skin.price+'</button>'}
      </div>`;
    grid.appendChild(card);
  });
  grid.querySelectorAll(".btn-buy").forEach(b => b.addEventListener("click", () => buySkin(b.dataset.id)));
  grid.querySelectorAll(".btn-equip").forEach(b => b.addEventListener("click", () => equipSkin(b.dataset.id)));
}

function buySkin(id) {
  const skin = SKINS.find(s => s.id === id);
  if (!skin || state.progress.ownedSkins.includes(id)) return;
  if (availableStars() < skin.price) {
    flashError(`Butuh ${skin.price - availableStars()} bintang lagi!`);
    return;
  }
  state.progress.ownedSkins.push(id);
  state.progress.starsSpent += skin.price;
  state.progress.equippedSkin = id;
  saveProgress();
  playSfx("buy");
  renderShop();
}
function equipSkin(id) {
  if (!state.progress.ownedSkins.includes(id)) return;
  state.progress.equippedSkin = id;
  saveProgress();
  playSfx("place");
  renderShop();
}

/* ============================================================
   LEVEL SETUP
   ============================================================ */
function startLevel(num) {
  const lvl = LEVELS[num - 1];
  if (!lvl) return;
  state.level = lvl;
  state.levelIdx = num - 1;
  state.program = [];
  state.focus = state.program;
  state.focusBlock = null;
  state.hintsUsed = 0;
  state.running = false;

  // UI prep
  document.getElementById("lvl-num").textContent = num;
  document.getElementById("lvl-goal").textContent = lvl.goalText;
  document.getElementById("lvl-block-count").textContent = "0";
  document.getElementById("lvl-star-max").textContent = lvl.stars.length;
  document.getElementById("lvl-star-count").textContent = "0";

  resetRobot();
  buildToolbox();
  renderProgram();
  renderGrid();

  showScreen("screen-game");
  startBgm();
  playSfx("levelStart");
}

function backToMenu() {
  state.running = false;
  stopBgm();
  renderMenu();
  showScreen("screen-menu");
}

/* ============================================================
   GRID RENDER
   ============================================================ */
function renderGrid() {
  const lvl = state.level;
  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  grid.style.setProperty("--cols", lvl.grid.w);
  grid.style.setProperty("--rows", lvl.grid.h);

  for (let y = 0; y < lvl.grid.h; y++) {
    for (let x = 0; x < lvl.grid.w; x++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.x = x; cell.dataset.y = y;
      if (lvl.walls.some(w => w.x === x && w.y === y)) cell.classList.add("wall");
      if (lvl.holes.some(h => h.x === x && h.y === y)) cell.classList.add("hole");
      if (lvl.goal.x === x && lvl.goal.y === y) {
        cell.classList.add("goal");
        cell.innerHTML = '<div class="goal-star">⭐</div>';
      }
      const star = lvl.stars.find(s => s.x === x && s.y === y);
      if (star && !state.collectedStars.has(`${x},${y}`)) {
        cell.classList.add("has-star");
        cell.innerHTML = (cell.innerHTML || "") + '<div class="bonus-star">⭐</div>';
      }
      grid.appendChild(cell);
    }
  }

  // Robot element
  const robotEl = document.createElement("div");
  robotEl.id = "robot";
  robotEl.className = "robot";
  const skin = getEquippedSkin();
  robotEl.style.background = skin.color;
  robotEl.innerHTML = `<div class="robot-face">${skin.emoji}</div><div class="robot-arrow"></div>`;
  grid.appendChild(robotEl);
  positionRobot();
}

function positionRobot() {
  const r = state.robot;
  const lvl = state.level;
  const robotEl = document.getElementById("robot");
  if (!robotEl) return;
  const cellW = 100 / lvl.grid.w;
  const cellH = 100 / lvl.grid.h;
  robotEl.style.left = (r.x * cellW + cellW / 2) + "%";
  robotEl.style.top  = (r.y * cellH + cellH / 2) + "%";
  robotEl.style.width = cellW + "%";
  robotEl.style.height = cellH + "%";
  robotEl.style.transform = `translate(-50%, -50%) rotate(${r.dir * 90}deg)`;
  robotEl.classList.toggle("dead", !r.alive);
}

function resetRobot() {
  const lvl = state.level;
  state.robot = { x: lvl.start.x, y: lvl.start.y, dir: lvl.start.dir, alive: true, atGoal: false };
  state.collectedStars = new Set();
  document.getElementById("lvl-star-count").textContent = "0";
}

/* ============================================================
   TOOLBOX (drag/tap palette)
   ============================================================ */
const BLOCK_META = {
  move:      { label: "Maju",        icon: "⬆",  cls: "move" },
  turnRight: { label: "Belok Kanan", icon: "↻",  cls: "turn" },
  turnLeft:  { label: "Belok Kiri",  icon: "↺",  cls: "turn" },
  loop:      { label: "Loop",        icon: "🔁", cls: "loop" },
  if:        { label: "Jika Dinding", icon: "❓", cls: "if" }
};

function buildToolbox() {
  const tb = document.getElementById("toolbox");
  tb.innerHTML = "";
  state.level.blocks.forEach(type => {
    const meta = BLOCK_META[type];
    const item = document.createElement("button");
    item.className = "tool-block tool-" + meta.cls;
    item.dataset.type = type;
    item.innerHTML = `<span class="tool-icon">${meta.icon}</span><span class="tool-name">${meta.label}</span>`;
    item.addEventListener("click", () => onToolClick(type));
    tb.appendChild(item);
  });
}

function onToolClick(type) {
  if (state.running) return;
  if (type === "loop") {
    state.pendingLoopAdd = true;
    document.getElementById("modal-loop").classList.remove("hidden");
    return;
  }
  let block;
  if (type === "if") {
    block = { type: "if", cond: "wallAhead", then: [] };
  } else if (type === "move") {
    block = { type: "move" };
  } else if (type === "turnRight") {
    block = { type: "turnRight" };
  } else if (type === "turnLeft") {
    block = { type: "turnLeft" };
  }
  insertBlock(block);
}

function insertBlock(block) {
  state.focus.push(block);
  // Auto-focus into new container
  if (block.type === "loop") {
    state.focus = block.body;
    state.focusBlock = block;
  } else if (block.type === "if") {
    state.focus = block.then;
    state.focusBlock = block;
  }
  playSfx("place");
  renderProgram();
}

function chooseLoopTimes(times) {
  if (!state.pendingLoopAdd) return;
  state.pendingLoopAdd = false;
  document.getElementById("modal-loop").classList.add("hidden");
  insertBlock({ type: "loop", times, body: [] });
}

/* ============================================================
   PROGRAM RENDER (tree-aware, with focus indicator)
   ============================================================ */
function renderProgram() {
  const root = document.getElementById("program");
  root.innerHTML = "";
  renderBlockList(state.program, root, /*isRoot=*/true);
  if (state.focus === state.program) {
    root.classList.add("focused");
  } else {
    root.classList.remove("focused");
  }
  document.getElementById("lvl-block-count").textContent = countBlocks(state.program);
}

function countBlocks(arr) {
  let n = 0;
  for (const b of arr) {
    n++;
    if (b.type === "loop") n += countBlocks(b.body);
    else if (b.type === "if") n += countBlocks(b.then);
  }
  return n;
}

function renderBlockList(arr, container, isRoot) {
  arr.forEach((block, i) => {
    const el = document.createElement("div");
    const meta = BLOCK_META[block.type];
    el.className = "block block-" + meta.cls;
    if (block.type === "loop") {
      el.innerHTML = `
        <div class="block-head">
          <span class="block-icon">🔁</span>
          <span class="block-label">Loop ${block.times}×</span>
          <button class="block-remove" title="Hapus">×</button>
        </div>
        <div class="block-body" data-role="body"></div>`;
    } else if (block.type === "if") {
      el.innerHTML = `
        <div class="block-head">
          <span class="block-icon">❓</span>
          <span class="block-label">Jika dinding di depan</span>
          <button class="block-remove" title="Hapus">×</button>
        </div>
        <div class="block-body" data-role="body"></div>`;
    } else {
      el.innerHTML = `
        <span class="block-icon">${meta.icon}</span>
        <span class="block-label">${meta.label}</span>
        <button class="block-remove" title="Hapus">×</button>`;
    }
    container.appendChild(el);

    if (block.type === "loop" || block.type === "if") {
      const bodyEl = el.querySelector('[data-role="body"]');
      const bodyArr = block.type === "loop" ? block.body : block.then;
      renderBlockList(bodyArr, bodyEl, false);
      if (state.focus === bodyArr) {
        bodyEl.classList.add("focused");
        // Add a visual "tap untuk tambah" hint inside body
        const hint = document.createElement("div");
        hint.className = "focus-hint";
        hint.textContent = "← klik blok di toolbox di bawah";
        bodyEl.appendChild(hint);
      }
      // Tap on the body to focus it
      bodyEl.addEventListener("click", e => {
        if (e.target.closest(".block-remove")) return;
        e.stopPropagation();
        state.focus = bodyArr;
        state.focusBlock = block;
        renderProgram();
      });
    }

    el.querySelector(".block-remove").addEventListener("click", e => {
      e.stopPropagation();
      removeBlockAt(arr, i);
    });
  });

  // "Exit nested" button at end of focused non-root container
  if (!isRoot && state.focus === arr) {
    const exitBtn = document.createElement("button");
    exitBtn.className = "exit-focus";
    exitBtn.textContent = "↑ Keluar (lanjut di luar)";
    exitBtn.addEventListener("click", e => {
      e.stopPropagation();
      state.focus = state.program;
      state.focusBlock = null;
      renderProgram();
    });
    container.appendChild(exitBtn);
  }

  // "Tap untuk fokus root" hint when arr is root and focus is elsewhere
  if (isRoot && state.focus !== state.program) {
    const back = document.createElement("button");
    back.className = "exit-focus";
    back.textContent = "↑ Kembali ke program utama";
    back.addEventListener("click", e => {
      e.stopPropagation();
      state.focus = state.program;
      state.focusBlock = null;
      renderProgram();
    });
    container.appendChild(back);
  }
}

function removeBlockAt(arr, i) {
  const removed = arr[i];
  arr.splice(i, 1);
  // If we removed the focused container, reset focus to root
  if (removed.type === "loop" && state.focus === removed.body) {
    state.focus = state.program; state.focusBlock = null;
  } else if (removed.type === "if" && state.focus === removed.then) {
    state.focus = state.program; state.focusBlock = null;
  }
  renderProgram();
}

/* ============================================================
   SIMULATOR (generator-based)
   ============================================================ */
function* interpret(blocks) {
  for (const b of blocks) {
    if (b.type === "loop") {
      for (let i = 0; i < b.times; i++) yield* interpret(b.body);
    } else if (b.type === "if") {
      if (evalCond(b.cond)) yield* interpret(b.then);
    } else {
      yield b;
    }
  }
}
function evalCond(cond) {
  if (cond === "wallAhead") {
    const [nx, ny] = nextCell();
    return isBlocked(nx, ny);
  }
  return false;
}
function nextCell() {
  const r = state.robot;
  let dx = 0, dy = 0;
  if (r.dir === 0) dy = -1;
  else if (r.dir === 1) dx = 1;
  else if (r.dir === 2) dy = 1;
  else dx = -1;
  return [r.x + dx, r.y + dy];
}
function isBlocked(x, y) {
  const lvl = state.level;
  if (x < 0 || y < 0 || x >= lvl.grid.w || y >= lvl.grid.h) return true;
  if (lvl.walls.some(w => w.x === x && w.y === y)) return true;
  return false;
}
function isHole(x, y) {
  return state.level.holes.some(h => h.x === x && h.y === y);
}

function applyInstr(instr) {
  const r = state.robot;
  if (instr.type === "move") {
    const [nx, ny] = nextCell();
    if (isBlocked(nx, ny)) return { kind: "wall" };
    r.x = nx; r.y = ny;
    if (isHole(nx, ny)) { r.alive = false; return { kind: "fall" }; }
    // Collect star?
    const star = state.level.stars.find(s => s.x === nx && s.y === ny);
    if (star && !state.collectedStars.has(`${nx},${ny}`)) {
      state.collectedStars.add(`${nx},${ny}`);
      return { kind: "moveStar" };
    }
    return { kind: "move" };
  }
  if (instr.type === "turnRight") { r.dir = (r.dir + 1) % 4; return { kind: "turn" }; }
  if (instr.type === "turnLeft")  { r.dir = (r.dir + 3) % 4; return { kind: "turn" }; }
  return { kind: "noop" };
}

async function runProgram() {
  if (state.running) return;
  if (countBlocks(state.program) === 0) {
    flashError("Program kosong! Tambahkan blok dulu.");
    return;
  }
  state.running = true;
  playSfx("run");
  resetRobot();
  positionRobot();
  // Re-render grid to restore stars visually
  renderGrid();

  const gen = interpret(state.program);
  let stepCount = 0;
  const MAX_STEPS = 500;
  for (const instr of gen) {
    if (++stepCount > MAX_STEPS) {
      flashError("Program berjalan terlalu lama (loop tak berujung?).");
      break;
    }
    const res = applyInstr(instr);
    if (res.kind === "wall") { playSfx("hit"); shakeRobot(); flashError("Robot menabrak dinding!"); break; }
    if (res.kind === "fall") { playSfx("fall"); positionRobot(); await sleep(STEP_MS); failModal("fall"); state.running = false; return; }
    if (res.kind === "turn") playSfx("turn");
    if (res.kind === "move") playSfx("move");
    if (res.kind === "moveStar") {
      playSfx("star");
      document.getElementById("lvl-star-count").textContent = state.collectedStars.size;
    }
    positionRobot();
    if (res.kind === "moveStar") removeStarFromGrid(state.robot.x, state.robot.y);
    await sleep(STEP_MS);

    // Reach goal?
    if (state.robot.x === state.level.goal.x && state.robot.y === state.level.goal.y) {
      state.robot.atGoal = true;
      break;
    }
  }
  state.running = false;
  if (state.robot.alive && state.robot.x === state.level.goal.x && state.robot.y === state.level.goal.y) {
    onWin();
  } else if (state.robot.alive) {
    failModal("noGoal");
  }
}

function removeStarFromGrid(x, y) {
  const cell = document.querySelector(`.cell[data-x="${x}"][data-y="${y}"]`);
  if (!cell) return;
  const s = cell.querySelector(".bonus-star");
  if (s) s.classList.add("collected");
}
function shakeRobot() {
  const el = document.getElementById("robot");
  if (!el) return;
  el.classList.add("shake");
  setTimeout(() => el.classList.remove("shake"), 400);
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/* ============================================================
   SCORING
   ============================================================ */
function calcScore(starsCollected) {
  const lvl = state.level;
  const base = lvl.id * 100;
  const used = countBlocks(state.program);
  let eff = 0;
  if (used <= lvl.optimal) eff = 50;
  else if (used <= lvl.optimal + 2) eff = 25;
  const starBonus = starsCollected * 30;
  const pen = state.hintsUsed * 20;
  const total = Math.max(0, base + eff + starBonus - pen);
  return { base, eff, starBonus, pen, total };
}

function onWin() {
  playSfx("win");
  const stars = state.collectedStars.size;
  const score = calcScore(stars);
  const lvlNum = state.level.id;
  const prevBest = state.progress.bestPerLevel[lvlNum] || 0;
  const prevStars = state.progress.bestStarsPerLevel[lvlNum] || 0;
  if (score.total > prevBest) state.progress.bestPerLevel[lvlNum] = score.total;
  if (stars > prevStars) state.progress.bestStarsPerLevel[lvlNum] = stars;
  if (lvlNum >= state.progress.lastUnlocked && lvlNum < TOTAL_LEVELS) {
    state.progress.lastUnlocked = lvlNum + 1;
  }
  saveProgress();
  if (window.AkaScoreReporter) {
    window.AkaScoreReporter.report(GAME_ID, totalScore(), {
      level: lvlNum, levelsCompleted: levelsDone(),
      lastLevelScore: score.total, totalStars: totalStarsEarned()
    });
  }

  // Display modal
  const maxStars = state.level.stars.length;
  let starHtml = "";
  for (let i = 0; i < maxStars; i++) starHtml += i < stars ? "⭐" : "☆";
  document.getElementById("win-stars").innerHTML = starHtml || "—";
  document.getElementById("win-base").textContent = score.base;
  document.getElementById("win-eff").textContent  = "+" + score.eff;
  document.getElementById("win-star-bonus").textContent = "+" + score.starBonus;
  document.getElementById("win-pen").textContent  = "-" + score.pen;
  document.getElementById("win-total").textContent = score.total;
  document.getElementById("modal-win").classList.remove("hidden");
}

function failModal(reason) {
  const icon = document.getElementById("fail-icon");
  const title = document.getElementById("fail-title");
  const text = document.getElementById("fail-text");
  if (reason === "fall") { icon.textContent = "💧"; title.textContent = "Robot Jatuh!"; text.textContent = "Hindari lubang dengan path yang tepat."; }
  else if (reason === "noGoal") { icon.textContent = "🎯"; title.textContent = "Belum Sampai Tujuan"; text.textContent = "Robot tidak mencapai bintang besar. Sesuaikan programnya."; }
  document.getElementById("modal-fail").classList.remove("hidden");
}

function flashError(msg) {
  let bar = document.getElementById("err-bar");
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "err-bar";
    bar.className = "err-bar";
    document.body.appendChild(bar);
  }
  bar.textContent = msg;
  bar.classList.add("show");
  clearTimeout(flashError._t);
  flashError._t = setTimeout(() => bar.classList.remove("show"), 1800);
}

/* ============================================================
   ACTIONS
   ============================================================ */
function onUndo() {
  if (state.running) return;
  if (state.focus.length === 0) return;
  playSfx("undo");
  removeBlockAt(state.focus, state.focus.length - 1);
}
function onClear() {
  if (state.running) return;
  state.program.length = 0;
  state.focus = state.program;
  state.focusBlock = null;
  playSfx("undo");
  renderProgram();
}
function onResetRun() {
  if (state.running) return;
  playSfx("click");
  resetRobot();
  renderGrid();
}
function onHint() {
  playSfx("click");
  document.getElementById("hint-text").textContent = state.level.hint;
  document.getElementById("modal-hint").classList.remove("hidden");
}
function onHintConfirm() {
  state.hintsUsed++;
  playSfx("click");
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
    document.getElementById("done-stars").textContent = totalStarsEarned();
    document.getElementById("modal-done").classList.remove("hidden");
  } else startLevel(next);
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  loadMute();
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
  document.getElementById("btn-run").addEventListener("click", runProgram);
  document.getElementById("btn-reset-run").addEventListener("click", onResetRun);
  document.getElementById("btn-undo").addEventListener("click", onUndo);
  document.getElementById("btn-clear").addEventListener("click", onClear);
  document.getElementById("btn-hint").addEventListener("click", onHint);
  document.getElementById("btn-hint-cancel").addEventListener("click",
    () => document.getElementById("modal-hint").classList.add("hidden"));
  document.getElementById("btn-hint-confirm").addEventListener("click", onHintConfirm);
  document.getElementById("btn-replay").addEventListener("click", onReplay);
  document.getElementById("btn-next").addEventListener("click", onNext);
  document.getElementById("btn-fail-close").addEventListener("click",
    () => document.getElementById("modal-fail").classList.add("hidden"));
  document.getElementById("btn-loop-cancel").addEventListener("click", () => {
    state.pendingLoopAdd = false;
    document.getElementById("modal-loop").classList.add("hidden");
  });
  document.querySelectorAll(".loop-opt").forEach(b => {
    b.addEventListener("click", () => chooseLoopTimes(parseInt(b.dataset.times, 10)));
  });
  document.getElementById("btn-done-back").addEventListener("click", () => {
    document.getElementById("modal-done").classList.add("hidden");
    backToMenu();
  });
  document.getElementById("reset-progress").addEventListener("click", () => {
    if (confirm("Yakin reset semua progress? Skin & bintang juga akan terhapus.")) {
      state.progress = {
        bestPerLevel: {}, bestStarsPerLevel: {}, lastUnlocked: 1,
        ownedSkins: ["robo"], equippedSkin: "robo", starsSpent: 0
      };
      saveProgress();
      renderMenu();
    }
  });
  document.getElementById("btn-shop").addEventListener("click", () => {
    renderShop();
    showScreen("screen-shop");
  });
  document.getElementById("btn-shop-back").addEventListener("click", () => {
    renderMenu();
    showScreen("screen-menu");
  });
  // Window resize: re-position robot
  window.addEventListener("resize", () => {
    if (state.robot && state.level) positionRobot();
  });

  renderMenu();
}
document.addEventListener("DOMContentLoaded", init);
