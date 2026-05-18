/* ============================================================
   MATH QUEST — Number Hunter (RPG matematika untuk kelas 4-6)
   ============================================================ */

const GAME_ID = "math-quest";
const STORAGE_KEY = "mq_progress_v1";
const MUTE_KEY = "mq_muted_v1";
const TOTAL_LEVELS = 25;

/* ============================================================
   AUDIO SYSTEM
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
  ensureAudio(); if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const o = audioCtx.createOscillator(), g = audioCtx.createGain();
  o.connect(g); g.connect(masterGain);
  switch (type) {
    case "attack":
      o.type = "sawtooth"; o.frequency.setValueAtTime(800, now); o.frequency.exponentialRampToValueAtTime(200, now + 0.15);
      g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      o.start(now); o.stop(now + 0.22); break;
    case "hit":
      o.type = "sawtooth"; o.frequency.setValueAtTime(160, now); o.frequency.exponentialRampToValueAtTime(80, now + 0.2);
      g.gain.setValueAtTime(0.2, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      o.start(now); o.stop(now + 0.28); break;
    case "correct":
      o.type = "sine"; o.frequency.setValueAtTime(660, now); o.frequency.setValueAtTime(880, now + 0.06);
      g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      o.start(now); o.stop(now + 0.18); break;
    case "wrong":
      o.type = "square"; o.frequency.setValueAtTime(220, now); o.frequency.exponentialRampToValueAtTime(110, now + 0.2);
      g.gain.setValueAtTime(0.16, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      o.start(now); o.stop(now + 0.28); break;
    case "heal": {
      const notes = [523, 659, 784];
      notes.forEach((f, i) => {
        const oo = audioCtx.createOscillator(), gg = audioCtx.createGain();
        oo.connect(gg); gg.connect(masterGain);
        oo.type = "sine"; oo.frequency.value = f;
        const t0 = now + i * 0.06;
        gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(0.18, t0 + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.2);
        oo.start(t0); oo.stop(t0 + 0.22);
      });
      try { o.disconnect(); g.disconnect(); } catch (_) {}
      return;
    }
    case "coin":
      o.type = "triangle"; o.frequency.setValueAtTime(880, now); o.frequency.setValueAtTime(1320, now + 0.05);
      g.gain.setValueAtTime(0.15, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      o.start(now); o.stop(now + 0.18); break;
    case "levelup": {
      const notes = [523, 659, 784, 1047];
      notes.forEach((f, i) => {
        const oo = audioCtx.createOscillator(), gg = audioCtx.createGain();
        oo.connect(gg); gg.connect(masterGain);
        oo.type = "triangle"; oo.frequency.value = f;
        const t0 = now + i * 0.1;
        gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(0.22, t0 + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
        oo.start(t0); oo.stop(t0 + 0.45);
      });
      try { o.disconnect(); g.disconnect(); } catch (_) {}
      return;
    }
    case "victory": {
      const notes = [392, 523, 659, 784, 1047];
      notes.forEach((f, i) => {
        const oo = audioCtx.createOscillator(), gg = audioCtx.createGain();
        oo.connect(gg); gg.connect(masterGain);
        oo.type = "sine"; oo.frequency.value = f;
        const t0 = now + i * 0.1;
        gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(0.25, t0 + 0.02);
        gg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.45);
        oo.start(t0); oo.stop(t0 + 0.5);
      });
      try { o.disconnect(); g.disconnect(); } catch (_) {}
      return;
    }
    case "defeat": {
      const notes = [392, 349, 311, 261];
      notes.forEach((f, i) => {
        const oo = audioCtx.createOscillator(), gg = audioCtx.createGain();
        oo.connect(gg); gg.connect(masterGain);
        oo.type = "sawtooth"; oo.frequency.value = f;
        const t0 = now + i * 0.18;
        gg.gain.setValueAtTime(0.18, t0); gg.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
        oo.start(t0); oo.stop(t0 + 0.42);
      });
      try { o.disconnect(); g.disconnect(); } catch (_) {}
      return;
    }
    case "buy":
      o.type = "sine"; o.frequency.setValueAtTime(523, now); o.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      g.gain.setValueAtTime(0.18, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      o.start(now); o.stop(now + 0.28); break;
  }
}

const BGM_NOTES = [261.63, 311.13, 392, 349.23, 311.13, 261.63, 196, 261.63];
function startBgm() {
  if (muted || bgmTimer) return;
  ensureAudio(); if (!audioCtx) return;
  if (!padNodes) {
    const o1 = audioCtx.createOscillator(), o2 = audioCtx.createOscillator(), pg = audioCtx.createGain();
    o1.type = "sine"; o1.frequency.value = 110;
    o2.type = "sine"; o2.frequency.value = 164.81;
    o1.connect(pg); o2.connect(pg); pg.gain.value = 0.025; pg.connect(masterGain);
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
    gg.gain.setValueAtTime(0.0001, t0); gg.gain.exponentialRampToValueAtTime(0.05, t0 + 0.05);
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
  else if (document.getElementById("screen-battle").classList.contains("active")) startBgm();
}
function loadMute() { try { muted = localStorage.getItem(MUTE_KEY) === "1"; } catch (_) {} }

/* ============================================================
   EQUIPMENT
   ============================================================ */
const WEAPONS = [
  { id: "kayu",    name: "Pedang Kayu",    price: 0,   atk: 5,  emoji: "🪵" },
  { id: "besi",    name: "Pedang Besi",    price: 80,  atk: 12, emoji: "⚔️" },
  { id: "kristal", name: "Pedang Kristal", price: 220, atk: 22, emoji: "💎" },
  { id: "emas",    name: "Pedang Emas",    price: 450, atk: 35, emoji: "🗡" },
  { id: "naga",    name: "Pedang Naga",    price: 850, atk: 55, emoji: "🐉" }
];
const ARMORS = [
  { id: "kain",    name: "Jubah Kain",  price: 0,   hp: 0,   emoji: "🧣" },
  { id: "kulit",   name: "Armor Kulit", price: 60,  hp: 30,  emoji: "🥋" },
  { id: "besi",    name: "Armor Besi",  price: 180, hp: 60,  emoji: "🛡" },
  { id: "mithril", name: "Mithril",     price: 380, hp: 100, emoji: "✨" },
  { id: "naga",    name: "Sisik Naga",  price: 700, hp: 180, emoji: "🐲" }
];
const POTION = { id: "heal", name: "Potion Heal", price: 30, heal: 30, emoji: "🧪" };
const SKINS = [
  { id: "knight", name: "Ksatria",  price: 0,   emoji: "🤺" },
  { id: "ninja",  name: "Ninja",    price: 100, emoji: "🥷" },
  { id: "mage",   name: "Penyihir", price: 150, emoji: "🧙" },
  { id: "robot",  name: "Robot",    price: 250, emoji: "🤖" }
];

/* ============================================================
   WORLDS + MONSTERS
   ============================================================ */
const WORLDS = [
  { id: 0, name: "Hutan", emoji: "🌲", topics: ["basic"],                color: "#22c55e", bg: "linear-gradient(180deg,#14532d,#166534 60%,#15803d)" },
  { id: 1, name: "Gua",   emoji: "🕳", topics: ["basic", "kpkfpb"],      color: "#7c3aed", bg: "linear-gradient(180deg,#1e1b4b,#312e81 60%,#3730a3)" },
  { id: 2, name: "Gurun", emoji: "🏜", topics: ["pecahan"],              color: "#f59e0b", bg: "linear-gradient(180deg,#78350f,#92400e 60%,#b45309)" },
  { id: 3, name: "Es",    emoji: "❄",  topics: ["desimal", "persen"],    color: "#06b6d4", bg: "linear-gradient(180deg,#164e63,#0e7490 60%,#0891b2)" },
  { id: 4, name: "Lava",  emoji: "🌋", topics: ["mixed", "negatif"],     color: "#dc2626", bg: "linear-gradient(180deg,#7f1d1d,#991b1b 60%,#b91c1c)" }
];
const MONSTERS = [
  ["Slime", "Tikus Hutan", "Burung Liar", "Serigala", "Beruang Hutan"],
  ["Laba-laba", "Kalajengking", "Golem Batu", "Kobold", "Naga Gua"],
  ["Ular Pasir", "Mumi", "Iblis Pasir", "Sphinx", "Penjaga Piramid"],
  ["Yeti", "Penyihir Es", "Beruang Kutub", "Iblis Salju", "Raja Es"],
  ["Setan Api", "Naga Lava", "Iblis Gelap", "Penyihir Api", "Raja Naga"]
];
const MONSTER_EMOJIS = [
  ["🟢", "🐀", "🦅", "🐺", "🐻"],
  ["🕷", "🦂", "🗿", "👹", "🐉"],
  ["🐍", "🧟", "👺", "🦁", "🗿"],
  ["🦣", "🧙‍♀️", "🐻‍❄️", "❄️", "👑"],
  ["👿", "🐲", "😈", "🧙‍♂️", "🐉"]
];

/* ============================================================
   QUESTION GENERATORS
   ============================================================ */
function rint(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = rint(0, i); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
function lcm(a, b) { return (a * b) / gcd(a, b); }

function makeOptions(correct, wrongFn) {
  const set = new Set([String(correct)]);
  let tries = 0;
  while (set.size < 4 && tries < 30) {
    const w = wrongFn();
    if (w !== null && w !== undefined) set.add(String(w));
    tries++;
  }
  // Padding fallback
  while (set.size < 4) set.add(String(Math.floor(Math.random() * 99) + 1));
  return shuffle(Array.from(set));
}

// ── BASIC: +, -, ×, ÷ ──
function genBasic(diff) {
  const ops = ["+", "-", "×", "÷"];
  const op = ops[rint(0, 3)];
  let a, b, ans;
  const r = Math.max(1, diff);
  if (op === "+") {
    a = rint(2, 10 + r * 4); b = rint(2, 10 + r * 4); ans = a + b;
  } else if (op === "-") {
    a = rint(10, 25 + r * 4); b = rint(2, a - 1); ans = a - b;
  } else if (op === "×") {
    a = rint(2, 5 + Math.min(r, 7)); b = rint(2, 9); ans = a * b;
  } else {
    b = rint(2, 9); ans = rint(2, 5 + Math.min(r, 9)); a = ans * b;
  }
  return {
    text: `${a} ${op} ${b} = ?`,
    answer: ans,
    options: makeOptions(ans, () => {
      const choice = rint(0, 2);
      if (choice === 0) return ans + (rint(0, 1) ? 1 : -1);
      if (choice === 1) return ans + rint(2, 10) * (rint(0, 1) ? 1 : -1);
      return op === "+" ? a - b : op === "-" ? a + b : op === "×" ? a + b : ans + 1;
    })
  };
}

// ── KPK / FPB ──
function genKpkFpb(diff) {
  const isKpk = rint(0, 1) === 0;
  const a = rint(2, 8 + diff), b = rint(2, 9 + diff);
  const ans = isKpk ? lcm(a, b) : gcd(a, b);
  return {
    text: `${isKpk ? "KPK" : "FPB"} dari ${a} dan ${b} = ?`,
    answer: ans,
    options: makeOptions(ans, () => {
      const c = isKpk ? a + b : Math.max(1, ans + rint(-2, 3));
      return c === ans ? c + 1 : c;
    })
  };
}

// ── PECAHAN ──
function genPecahan(diff) {
  const kind = rint(0, 3);
  if (kind === 0) {
    // Penjumlahan pecahan dengan penyebut sama
    const denom = rint(3, 8);
    const a = rint(1, denom - 1), b = rint(1, denom - a);
    return {
      text: `${a}/${denom} + ${b}/${denom} = ?`,
      answer: `${a + b}/${denom}`,
      options: makeOptions(`${a + b}/${denom}`, () => {
        const choice = rint(0, 2);
        if (choice === 0) return `${a + b}/${denom * 2}`;
        if (choice === 1) return `${a * b}/${denom}`;
        return `${a + b + 1}/${denom}`;
      })
    };
  }
  if (kind === 1) {
    // Mana lebih besar?
    const d1 = rint(2, 8), d2 = rint(2, 8);
    let n1 = rint(1, d1 - 1), n2 = rint(1, d2 - 1);
    const v1 = n1 / d1, v2 = n2 / d2;
    if (v1 === v2) n2 = (n2 % (d2 - 1)) + 1;
    const ans = (n1 / d1) > (n2 / d2) ? `${n1}/${d1}` : `${n2}/${d2}`;
    const other = ans === `${n1}/${d1}` ? `${n2}/${d2}` : `${n1}/${d1}`;
    return {
      text: `Mana lebih besar: ${n1}/${d1} atau ${n2}/${d2}?`,
      answer: ans,
      options: shuffle([ans, other, "Sama besar", "Tidak bisa dibandingkan"])
    };
  }
  if (kind === 2) {
    // Penyederhanaan
    const f = rint(2, 6), n = rint(1, 5), d = rint(n + 1, 9);
    const num = n * f, den = d * f;
    return {
      text: `Sederhanakan: ${num}/${den}`,
      answer: `${n}/${d}`,
      options: makeOptions(`${n}/${d}`, () => {
        const f2 = rint(2, 5);
        return `${n * f2}/${d * f2}`;
      })
    };
  }
  // Pecahan dari "n bagian dari total" (word problem ringan)
  const total = rint(8, 24), part = rint(2, total - 1);
  const g = gcd(part, total);
  const ans = `${part / g}/${total / g}`;
  return {
    text: `Dari ${total} kue, ${part} sudah dimakan. Berapa pecahan yang dimakan?`,
    answer: ans,
    options: makeOptions(ans, () => {
      const off = rint(-2, 2);
      return `${(part / g) + (off || 1)}/${total / g}`;
    })
  };
}

// ── DESIMAL & PERSEN ──
function genDesimal(diff) {
  const kind = rint(0, 3);
  if (kind === 0) {
    // Pecahan ke desimal
    const denom = [2, 4, 5, 10][rint(0, 3)];
    const num = rint(1, denom - 1);
    const ans = (num / denom).toString();
    return {
      text: `Ubah ${num}/${denom} ke desimal:`,
      answer: ans,
      options: makeOptions(ans, () => {
        return ((num + rint(-1, 1)) / denom).toFixed(2).replace(/\.?0+$/, "");
      })
    };
  }
  if (kind === 1) {
    // Persen dari angka
    const pct = [10, 20, 25, 50, 75][rint(0, 4)];
    const total = rint(20, 80) * 5;
    const ans = (pct / 100) * total;
    return {
      text: `${pct}% dari ${total} = ?`,
      answer: ans,
      options: makeOptions(ans, () => ans + rint(2, 20) * (rint(0, 1) ? 1 : -1))
    };
  }
  if (kind === 2) {
    // Penjumlahan desimal
    const a = (rint(10, 50 + diff * 5) / 10);
    const b = (rint(10, 50 + diff * 5) / 10);
    const ans = (Math.round((a + b) * 10) / 10).toString();
    return {
      text: `${a} + ${b} = ?`,
      answer: ans,
      options: makeOptions(ans, () => (Math.round((a + b + (rint(-5, 5) || 1) / 10) * 10) / 10).toString())
    };
  }
  // Pecahan ke persen
  const denom = [4, 5, 10, 20][rint(0, 3)];
  const num = rint(1, denom - 1);
  const ans = (num / denom * 100) + "%";
  return {
    text: `${num}/${denom} = ...% ?`,
    answer: ans,
    options: makeOptions(ans, () => {
      return ((num / denom * 100) + rint(5, 25) * (rint(0, 1) ? 1 : -1)) + "%";
    })
  };
}

// ── BILANGAN BULAT NEGATIF ──
function genNegatif(diff) {
  const kind = rint(0, 2);
  if (kind === 0) {
    const a = rint(-15, 15), b = rint(-15, 15);
    const ans = a + b;
    return {
      text: `${a < 0 ? `(${a})` : a} + ${b < 0 ? `(${b})` : b} = ?`,
      answer: ans,
      options: makeOptions(ans, () => ans + rint(1, 5) * (rint(0, 1) ? 1 : -1))
    };
  }
  if (kind === 1) {
    const a = rint(-15, 15), b = rint(-15, 15);
    const ans = a - b;
    return {
      text: `${a < 0 ? `(${a})` : a} − ${b < 0 ? `(${b})` : b} = ?`,
      answer: ans,
      options: makeOptions(ans, () => ans + rint(1, 5) * (rint(0, 1) ? 1 : -1))
    };
  }
  const a = rint(-9, 9), b = rint(-9, 9);
  const ans = a * b;
  return {
    text: `${a < 0 ? `(${a})` : a} × ${b < 0 ? `(${b})` : b} = ?`,
    answer: ans,
    options: makeOptions(ans, () => ans + rint(2, 10) * (rint(0, 1) ? 1 : -1))
  };
}

// ── MIXED (lava world: campuran semua) ──
function genMixed(diff) {
  const gens = [genBasic, genKpkFpb, genPecahan, genDesimal, genNegatif];
  return gens[rint(0, gens.length - 1)](diff);
}

const TOPIC_GENS = {
  basic: genBasic,
  kpkfpb: genKpkFpb,
  pecahan: genPecahan,
  desimal: genDesimal,
  persen: genDesimal,
  negatif: genNegatif,
  mixed: genMixed
};

function generateQuestion(worldId, level) {
  const world = WORLDS[worldId];
  const topic = world.topics[rint(0, world.topics.length - 1)];
  const gen = TOPIC_GENS[topic] || genBasic;
  // diff scales 1-15 from world & level
  const diff = worldId * 2 + (level - 1) + 1;
  return gen(diff);
}

/* ============================================================
   STATE & PROGRESS
   ============================================================ */
const state = {
  // Battle (transient)
  worldId: 0, levelInWorld: 1, levelGlobal: 1,
  hero: { hp: 100, maxHp: 100, atk: 10 },
  monster: { name: "", emoji: "👾", hp: 0, maxHp: 0, atk: 0 },
  isBoss: false, bossPhase: 0,
  question: null,
  qTimerVal: 0, qTimerInterval: null,
  questionsAnswered: 0,
  correctCount: 0,
  streak: 0, maxStreak: 0,
  shopTab: "weapon",
  selectedWorldTab: 0,
  awaitingNext: false,
  progress: null
};

function defaultProgress() {
  return {
    bestPerLevel: {}, lastUnlocked: 1,
    coin: 50, xp: 0, lv: 1, totalCorrect: 0,
    weapons: ["kayu"], equippedWeapon: "kayu",
    armors: ["kain"], equippedArmor: "kain",
    skins: ["knight"], equippedSkin: "knight",
    potions: 0
  };
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return Object.assign(defaultProgress(), JSON.parse(raw));
  } catch (_) {}
  return defaultProgress();
}
function saveProgress() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state.progress)); } catch (_) {} }

function getWeapon() { return WEAPONS.find(w => w.id === state.progress.equippedWeapon) || WEAPONS[0]; }
function getArmor() { return ARMORS.find(a => a.id === state.progress.equippedArmor) || ARMORS[0]; }
function getSkin() { return SKINS.find(s => s.id === state.progress.equippedSkin) || SKINS[0]; }

function totalScore() { return Object.values(state.progress.bestPerLevel).reduce((a, b) => a + b, 0); }
function levelsDone() { return Object.keys(state.progress.bestPerLevel).length; }

// XP curve: each level needs lv*50 XP
function xpToNext(lv) { return lv * 50; }
function applyLevelUp() {
  let leveled = false;
  while (state.progress.xp >= xpToNext(state.progress.lv)) {
    state.progress.xp -= xpToNext(state.progress.lv);
    state.progress.lv++;
    leveled = true;
  }
  return leveled;
}

function computeHeroAtk() {
  return 5 + (state.progress.lv - 1) * 2 + getWeapon().atk;
}
function computeHeroMaxHp() {
  return 100 + (state.progress.lv - 1) * 15 + getArmor().hp;
}

/* ============================================================
   SCREEN MANAGEMENT
   ============================================================ */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ============================================================
   MENU
   ============================================================ */
function renderMenu() {
  document.getElementById("menu-hero-portrait").textContent = getSkin().emoji;
  document.getElementById("menu-hero-name").textContent = getSkin().name;
  document.getElementById("menu-hero-lv").textContent = state.progress.lv;
  document.getElementById("menu-hero-hp").textContent = computeHeroMaxHp();
  document.getElementById("menu-hero-atk").textContent = computeHeroAtk();
  document.getElementById("menu-hero-def").textContent = getArmor().hp;
  document.getElementById("total-coin").textContent = state.progress.coin;
  document.getElementById("total-score").textContent = totalScore();
  document.getElementById("levels-done").textContent = levelsDone();
}

/* ============================================================
   WORLD MAP
   ============================================================ */
function renderMap() {
  const tabsEl = document.getElementById("world-tabs");
  tabsEl.innerHTML = "";
  WORLDS.forEach((w, i) => {
    const startLvl = i * 5 + 1;
    const accessible = state.progress.lastUnlocked >= startLvl;
    const tab = document.createElement("button");
    tab.className = "world-tab" + (i === state.selectedWorldTab ? " active" : "") + (accessible ? "" : " locked");
    tab.disabled = !accessible;
    tab.innerHTML = `<span class="wt-emoji">${w.emoji}</span><span class="wt-name">${w.name}</span>`;
    tab.style.borderColor = accessible ? w.color : "rgba(255,255,255,0.1)";
    tab.addEventListener("click", () => { state.selectedWorldTab = i; renderMap(); });
    tabsEl.appendChild(tab);
  });

  const grid = document.getElementById("map-grid");
  grid.innerHTML = "";
  const w = WORLDS[state.selectedWorldTab];
  document.getElementById("map-title").textContent = `${w.emoji} ${w.name}`;
  document.getElementById("map-coin").textContent = state.progress.coin;

  for (let i = 1; i <= 5; i++) {
    const lvlGlobal = state.selectedWorldTab * 5 + i;
    const isBoss = i === 5;
    const score = state.progress.bestPerLevel[lvlGlobal];
    const locked = lvlGlobal > state.progress.lastUnlocked;

    const card = document.createElement("button");
    card.className = "map-card" + (isBoss ? " boss" : "") + (locked ? " locked" : "") + (score !== undefined ? " done" : "");
    card.disabled = locked;
    card.innerHTML = `
      <div class="mc-num">${locked ? "🔒" : (isBoss ? "👑 " + i : i)}</div>
      <div class="mc-monster">${MONSTER_EMOJIS[state.selectedWorldTab][i - 1]}</div>
      <div class="mc-name">${MONSTERS[state.selectedWorldTab][i - 1]}</div>
      ${score !== undefined ? `<div class="mc-score">⭐ ${score}</div>` : ""}
    `;
    if (!locked) card.addEventListener("click", () => startLevel(lvlGlobal));
    grid.appendChild(card);
  }
}

/* ============================================================
   SHOP
   ============================================================ */
function renderShop() {
  document.getElementById("shop-coin").textContent = state.progress.coin;
  document.querySelectorAll(".shop-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === state.shopTab);
  });
  const content = document.getElementById("shop-content");
  content.innerHTML = "";
  if (state.shopTab === "weapon")  WEAPONS.forEach(w => content.appendChild(makeShopCard(w, "weapon")));
  if (state.shopTab === "armor")   ARMORS.forEach(a => content.appendChild(makeShopCard(a, "armor")));
  if (state.shopTab === "potion")  content.appendChild(makePotionCard());
  if (state.shopTab === "skin")    SKINS.forEach(s => content.appendChild(makeShopCard(s, "skin")));
}

function makeShopCard(item, type) {
  const owned = state.progress[type + "s"].includes(item.id);
  const equippedKey = "equipped" + type[0].toUpperCase() + type.slice(1);
  const equipped = state.progress[equippedKey] === item.id;
  const card = document.createElement("div");
  card.className = "shop-card" + (equipped ? " equipped" : "") + (owned ? " owned" : "");
  let stat = "";
  if (type === "weapon") stat = `⚔️ +${item.atk}`;
  else if (type === "armor") stat = `❤️ +${item.hp}`;
  card.innerHTML = `
    <div class="sc-icon">${item.emoji}</div>
    <div class="sc-name">${item.name}</div>
    <div class="sc-stat">${stat}</div>
    <div class="sc-action">
      ${equipped ? '<span class="sc-eq">✓ Dipakai</span>' :
        owned ? `<button class="sc-btn equip" data-id="${item.id}" data-type="${type}">Pakai</button>` :
        `<button class="sc-btn buy" data-id="${item.id}" data-type="${type}" data-price="${item.price}">💰 ${item.price}</button>`}
    </div>`;
  return card;
}

function makePotionCard() {
  const card = document.createElement("div");
  card.className = "shop-card potion-card";
  card.innerHTML = `
    <div class="sc-icon">${POTION.emoji}</div>
    <div class="sc-name">${POTION.name}</div>
    <div class="sc-stat">+${POTION.heal} HP saat dipakai</div>
    <div class="sc-stat">Kamu punya: <strong>${state.progress.potions}</strong></div>
    <div class="sc-action">
      <button class="sc-btn buy" data-type="potion" data-price="${POTION.price}">💰 ${POTION.price} (beli 1)</button>
    </div>`;
  return card;
}

function buyItem(type, id, price) {
  if (state.progress.coin < price) { flashError("Koin tidak cukup!"); return; }
  if (type === "potion") {
    state.progress.coin -= price;
    state.progress.potions++;
  } else {
    if (state.progress[type + "s"].includes(id)) return;
    state.progress.coin -= price;
    state.progress[type + "s"].push(id);
    // Auto-equip on first buy
    const equippedKey = "equipped" + type[0].toUpperCase() + type.slice(1);
    state.progress[equippedKey] = id;
  }
  saveProgress();
  playSfx("buy");
  renderShop();
}
function equipItem(type, id) {
  if (!state.progress[type + "s"].includes(id)) return;
  const equippedKey = "equipped" + type[0].toUpperCase() + type.slice(1);
  state.progress[equippedKey] = id;
  saveProgress();
  playSfx("coin");
  renderShop();
}

/* ============================================================
   LEVEL SETUP / BATTLE START
   ============================================================ */
function startLevel(lvlGlobal) {
  if (lvlGlobal > state.progress.lastUnlocked) return;
  state.levelGlobal = lvlGlobal;
  state.worldId = Math.floor((lvlGlobal - 1) / 5);
  state.levelInWorld = ((lvlGlobal - 1) % 5) + 1;
  state.isBoss = state.levelInWorld === 5;
  state.bossPhase = 0;

  // Hero stats
  state.hero.maxHp = computeHeroMaxHp();
  state.hero.hp = state.hero.maxHp;
  state.hero.atk = computeHeroAtk();

  // Monster stats: scale by level
  const monsterHp = Math.round(30 + (lvlGlobal - 1) * 18 + (state.isBoss ? 60 : 0));
  const monsterAtk = Math.round(8 + (lvlGlobal - 1) * 2.5);
  state.monster = {
    name: MONSTERS[state.worldId][state.levelInWorld - 1],
    emoji: MONSTER_EMOJIS[state.worldId][state.levelInWorld - 1],
    hp: monsterHp, maxHp: monsterHp, atk: monsterAtk
  };

  state.questionsAnswered = 0;
  state.correctCount = 0;
  state.streak = 0;
  state.maxStreak = 0;
  state.awaitingNext = false;

  // UI prep
  document.getElementById("battle-lvl").textContent = lvlGlobal;
  document.getElementById("battle-world").textContent = WORLDS[state.worldId].name;
  const stage = document.getElementById("battle-stage");
  stage.style.background = WORLDS[state.worldId].bg;
  document.getElementById("hero-sprite").textContent = getSkin().emoji;
  document.getElementById("monster-sprite").textContent = state.monster.emoji;
  document.getElementById("monster-name").textContent = state.monster.name;
  document.getElementById("potion-count").textContent = state.progress.potions;
  document.getElementById("hero-hp-max").textContent = state.hero.maxHp;
  document.getElementById("mon-hp-max").textContent = state.monster.maxHp;

  updateHpBars();
  // Reset sprite animations
  const heroEl = document.getElementById("hero-sprite");
  const monEl = document.getElementById("monster-sprite");
  heroEl.className = "sprite hero-sprite";
  monEl.className = "sprite monster-sprite";
  // Hero entry + monster entry
  heroEl.classList.add("entering");
  monEl.classList.add("entering");
  setTimeout(() => {
    heroEl.classList.remove("entering");
    monEl.classList.remove("entering");
    heroEl.classList.add("idle");
    monEl.classList.add("idle");
  }, 700);
  // Hide combo badge
  document.getElementById("hero-combo").classList.add("hidden");

  showScreen("screen-battle");
  startBgm();
  setTimeout(nextQuestion, 800);
}

/* ============================================================
   SPRITE ANIMATION HELPERS
   ============================================================ */
function playSpriteAnim(id, cls, ms) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove("idle");
  el.classList.remove(cls);
  // Force reflow so animation can re-trigger
  void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(() => {
    el.classList.remove(cls);
    if (el.dataset.endState !== "permanent") el.classList.add("idle");
  }, ms);
}

function popComboBadge() {
  const badge = document.getElementById("hero-combo");
  if (!badge) return;
  if (state.streak < 3) { badge.classList.add("hidden"); return; }
  const mult = state.streak >= 5 ? "2.0×" : "1.5×";
  badge.textContent = `🔥 ${state.streak} ${mult}`;
  badge.classList.remove("hidden");
  badge.classList.remove("pulse");
  void badge.offsetWidth;
  badge.classList.add("pulse");
}

function updateHpBars() {
  document.getElementById("hero-hp").textContent = Math.max(0, Math.round(state.hero.hp));
  document.getElementById("hero-hp-fill").style.width = Math.max(0, state.hero.hp / state.hero.maxHp * 100) + "%";
  document.getElementById("mon-hp").textContent = Math.max(0, Math.round(state.monster.hp));
  document.getElementById("mon-hp-fill").style.width = Math.max(0, state.monster.hp / state.monster.maxHp * 100) + "%";
  document.getElementById("q-streak").textContent = state.streak;
}

/* ============================================================
   QUESTION FLOW
   ============================================================ */
function nextQuestion() {
  if (state.awaitingNext) return;
  state.question = generateQuestion(state.worldId, state.levelInWorld);
  document.getElementById("q-text").textContent = state.question.text;
  const opts = document.getElementById("q-options");
  opts.innerHTML = "";
  state.question.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "q-opt";
    btn.textContent = opt;
    btn.addEventListener("click", () => onAnswer(i));
    opts.appendChild(btn);
  });
  // Update progress indicator (boss = 3 questions to clear, normal = until HP 0)
  const progEl = document.getElementById("q-progress");
  if (state.isBoss) progEl.textContent = `Boss: soal ${state.bossPhase + 1}/3`;
  else progEl.textContent = "";
  startQTimer();
}

function startQTimer() {
  // Time decreases as level grows: from 18s at level 1 down to ~10s at level 25
  const base = 20 - Math.floor((state.levelGlobal - 1) / 4);
  state.qTimerVal = Math.max(8, base);
  document.getElementById("q-timer").textContent = state.qTimerVal;
  if (state.qTimerInterval) clearInterval(state.qTimerInterval);
  state.qTimerInterval = setInterval(() => {
    state.qTimerVal--;
    document.getElementById("q-timer").textContent = state.qTimerVal;
    if (state.qTimerVal <= 0) {
      clearInterval(state.qTimerInterval);
      onAnswer(-1); // timeout
    }
  }, 1000);
}

function stopQTimer() {
  if (state.qTimerInterval) { clearInterval(state.qTimerInterval); state.qTimerInterval = null; }
}

function onAnswer(idx) {
  if (state.awaitingNext) return;
  state.awaitingNext = true;
  stopQTimer();
  const q = state.question;
  const chosen = idx === -1 ? null : q.options[idx];
  const correct = chosen !== null && String(chosen) === String(q.answer);
  state.questionsAnswered++;

  // Visual feedback
  const opts = document.querySelectorAll(".q-opt");
  opts.forEach(b => b.classList.add("disabled"));
  if (idx >= 0) opts[idx].classList.add(correct ? "correct" : "wrong");
  // Always highlight correct
  opts.forEach((b, i) => { if (String(q.options[i]) === String(q.answer)) b.classList.add("correct"); });

  if (correct) {
    state.correctCount++;
    state.streak++;
    if (state.streak > state.maxStreak) state.maxStreak = state.streak;
    state.progress.totalCorrect++;
    const multiplier = state.streak >= 5 ? 2.0 : state.streak >= 3 ? 1.5 : 1.0;
    const isCrit = multiplier > 1;
    const dmg = Math.round(state.hero.atk * multiplier);
    state.monster.hp -= dmg;
    playSfx("attack");
    // Hero lunges, monster gets damaged with delay (visual hit landing)
    playSpriteAnim("hero-sprite", "attacking", 450);
    setTimeout(() => {
      playSpriteAnim("monster-sprite", "damaged", 500);
      showFx(dmg, "dmg-on-monster", isCrit);
    }, 200);
    popComboBadge();
    setTimeout(() => {
      updateHpBars();
      if (state.monster.hp <= 0) {
        if (state.isBoss) {
          state.bossPhase++;
          if (state.bossPhase >= 3) { onVictory(); return; }
          state.monster.hp = Math.round(state.monster.maxHp * 0.4);
          updateHpBars();
        } else { onVictory(); return; }
      }
      state.awaitingNext = false;
      setTimeout(nextQuestion, 700);
    }, 700);
  } else {
    state.streak = 0;
    const dmg = state.monster.atk;
    state.hero.hp -= dmg;
    playSfx(idx === -1 ? "wrong" : "hit");
    // Monster lunges, hero gets damaged
    playSpriteAnim("monster-sprite", "attacking", 450);
    setTimeout(() => {
      playSpriteAnim("hero-sprite", "damaged", 500);
      showFx(dmg, "dmg-on-hero", false);
    }, 200);
    popComboBadge();
    setTimeout(() => {
      updateHpBars();
      if (state.hero.hp <= 0) { onDefeat(); return; }
      state.awaitingNext = false;
      setTimeout(nextQuestion, 900);
    }, 700);
  }
}

function showFx(value, kind, isCrit) {
  const fxLayer = document.getElementById("fx-layer");
  if (!fxLayer) return;
  const el = document.createElement("div");
  el.className = "fx-num " + kind + (isCrit ? " crit" : "");
  el.textContent = "-" + value;
  fxLayer.appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function flashError(msg) {
  let bar = document.getElementById("err-bar");
  if (!bar) {
    bar = document.createElement("div"); bar.id = "err-bar"; bar.className = "err-bar";
    document.body.appendChild(bar);
  }
  bar.textContent = msg;
  bar.classList.add("show");
  clearTimeout(flashError._t);
  flashError._t = setTimeout(() => bar.classList.remove("show"), 1800);
}

/* ============================================================
   USE POTION / SKIP
   ============================================================ */
function usePotion() {
  if (state.progress.potions <= 0) { flashError("Tidak ada potion!"); return; }
  if (state.hero.hp >= state.hero.maxHp) { flashError("HP sudah penuh!"); return; }
  state.progress.potions--;
  state.hero.hp = Math.min(state.hero.maxHp, state.hero.hp + POTION.heal);
  saveProgress();
  document.getElementById("potion-count").textContent = state.progress.potions;
  playSfx("heal");
  updateHpBars();
}

function skipQuestion() {
  // Force timeout-like wrong answer
  if (state.awaitingNext) return;
  onAnswer(-1);
}

/* ============================================================
   VICTORY / DEFEAT
   ============================================================ */
function onVictory() {
  stopQTimer();
  playSfx("victory");
  // Hero victory pose, monster defeat fade
  const heroEl = document.getElementById("hero-sprite");
  const monEl = document.getElementById("monster-sprite");
  heroEl.classList.remove("idle", "attacking", "damaged");
  heroEl.classList.add("victorious");
  monEl.classList.remove("idle", "attacking", "damaged");
  monEl.classList.add("defeated");
  document.getElementById("hero-combo").classList.add("hidden");
  // Reward
  const baseCoin = 30 + state.levelGlobal * 5 + (state.isBoss ? 50 : 0);
  const baseXp = 20 + state.levelGlobal * 3 + (state.isBoss ? 30 : 0);
  // Streak bonus
  const streakCoin = state.maxStreak * 3;
  const totalCoin = baseCoin + streakCoin;
  const totalXp = baseXp;

  // Score formula
  const accuracy = state.correctCount / Math.max(1, state.questionsAnswered);
  const score = Math.round(
    state.levelGlobal * 100
    + state.correctCount * 20
    + state.maxStreak * 10
    + (state.isBoss ? 100 : 0)
    + accuracy * 50
  );

  const prevBest = state.progress.bestPerLevel[state.levelGlobal] || 0;
  if (score > prevBest) state.progress.bestPerLevel[state.levelGlobal] = score;
  if (state.levelGlobal >= state.progress.lastUnlocked && state.levelGlobal < TOTAL_LEVELS) {
    state.progress.lastUnlocked = state.levelGlobal + 1;
  }
  state.progress.coin += totalCoin;
  state.progress.xp += totalXp;
  const leveledUp = applyLevelUp();
  saveProgress();

  // Report to leaderboard
  if (window.AkaScoreReporter) {
    window.AkaScoreReporter.report(GAME_ID, totalScore(), {
      level: state.levelGlobal, levelsCompleted: levelsDone(),
      lastLevelScore: score, totalCoin: state.progress.coin, heroLv: state.progress.lv
    });
  }

  // Modal
  document.getElementById("vic-coin").textContent = "+" + totalCoin;
  document.getElementById("vic-xp").textContent = "+" + totalXp;
  document.getElementById("vic-score").textContent = score;
  const lvRow = document.getElementById("vic-levelup-row");
  if (leveledUp) {
    lvRow.classList.remove("hidden");
    document.getElementById("vic-newlv").textContent = state.progress.lv;
    setTimeout(() => playSfx("levelup"), 600);
  } else {
    lvRow.classList.add("hidden");
  }
  // Delay modal so hero's victory pose plays first
  setTimeout(() => {
    document.getElementById("modal-victory").classList.remove("hidden");
  }, 900);
}

function onDefeat() {
  stopQTimer();
  playSfx("defeat");
  // Hero defeated pose, monster keeps idle
  const heroEl = document.getElementById("hero-sprite");
  heroEl.classList.remove("idle", "attacking", "damaged");
  heroEl.classList.add("defeated");
  document.getElementById("hero-combo").classList.add("hidden");
  setTimeout(() => {
    document.getElementById("modal-defeat").classList.remove("hidden");
  }, 800);
}

function onVictoryNext() {
  document.getElementById("modal-victory").classList.add("hidden");
  // Check world cleared (boss completed)
  if (state.isBoss && state.worldId < WORLDS.length - 1) {
    document.getElementById("wc-title").textContent = `${WORLDS[state.worldId].name} Selesai!`;
    document.getElementById("wc-text").textContent = `Dunia ${WORLDS[state.worldId + 1].name} ${WORLDS[state.worldId + 1].emoji} terbuka!`;
    document.getElementById("modal-world-cleared").classList.remove("hidden");
    return;
  }
  if (state.levelGlobal >= TOTAL_LEVELS) {
    document.getElementById("done-total").textContent = totalScore();
    document.getElementById("modal-done").classList.remove("hidden");
    return;
  }
  startLevel(state.levelGlobal + 1);
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  state.progress = loadProgress();
  loadMute();

  const reflectMute = () => {
    const m = muted;
    const a = document.getElementById("btn-mute-battle");
    const b = document.getElementById("btn-mute-menu");
    if (a) a.textContent = m ? "🔇" : "🔊";
    if (b) b.textContent = m ? "🔇 Suara" : "🔊 Suara";
  };
  reflectMute();
  const toggleMute = () => { setMuted(!muted); reflectMute(); };
  document.getElementById("btn-mute-battle").addEventListener("click", toggleMute);
  document.getElementById("btn-mute-menu").addEventListener("click", toggleMute);

  // Menu actions
  document.getElementById("btn-play").addEventListener("click", () => {
    state.selectedWorldTab = Math.min(WORLDS.length - 1, Math.floor((state.progress.lastUnlocked - 1) / 5));
    renderMap();
    showScreen("screen-map");
  });
  document.getElementById("btn-shop").addEventListener("click", () => { state.shopTab = "weapon"; renderShop(); showScreen("screen-shop"); });
  document.getElementById("reset-progress").addEventListener("click", () => {
    if (confirm("Yakin reset SEMUA progress? Skor, koin, item, dan skin akan terhapus.")) {
      state.progress = defaultProgress();
      saveProgress();
      renderMenu();
    }
  });

  // Map
  document.getElementById("btn-map-back").addEventListener("click", () => { renderMenu(); showScreen("screen-menu"); });

  // Shop
  document.getElementById("btn-shop-back").addEventListener("click", () => { renderMenu(); showScreen("screen-menu"); });
  document.querySelectorAll(".shop-tab").forEach(t => {
    t.addEventListener("click", () => { state.shopTab = t.dataset.tab; renderShop(); });
  });
  document.getElementById("shop-content").addEventListener("click", e => {
    const buy = e.target.closest(".sc-btn.buy");
    const eq = e.target.closest(".sc-btn.equip");
    if (buy) buyItem(buy.dataset.type, buy.dataset.id || null, parseInt(buy.dataset.price, 10));
    else if (eq) equipItem(eq.dataset.type, eq.dataset.id);
  });

  // Battle
  document.getElementById("btn-battle-quit").addEventListener("click", () => {
    document.getElementById("modal-quit").classList.remove("hidden");
  });
  document.getElementById("btn-quit-cancel").addEventListener("click", () => {
    document.getElementById("modal-quit").classList.add("hidden");
  });
  document.getElementById("btn-quit-confirm").addEventListener("click", () => {
    document.getElementById("modal-quit").classList.add("hidden");
    stopQTimer(); stopBgm();
    renderMap(); showScreen("screen-map");
  });
  document.getElementById("btn-use-potion").addEventListener("click", usePotion);
  document.getElementById("btn-skip").addEventListener("click", skipQuestion);

  // Modal actions
  document.getElementById("btn-vic-replay").addEventListener("click", () => {
    document.getElementById("modal-victory").classList.add("hidden");
    startLevel(state.levelGlobal);
  });
  document.getElementById("btn-vic-next").addEventListener("click", onVictoryNext);
  document.getElementById("btn-def-shop").addEventListener("click", () => {
    document.getElementById("modal-defeat").classList.add("hidden");
    state.shopTab = "weapon"; renderShop(); showScreen("screen-shop");
  });
  document.getElementById("btn-def-retry").addEventListener("click", () => {
    document.getElementById("modal-defeat").classList.add("hidden");
    startLevel(state.levelGlobal);
  });
  document.getElementById("btn-wc-continue").addEventListener("click", () => {
    document.getElementById("modal-world-cleared").classList.add("hidden");
    if (state.levelGlobal >= TOTAL_LEVELS) {
      document.getElementById("done-total").textContent = totalScore();
      document.getElementById("modal-done").classList.remove("hidden");
    } else startLevel(state.levelGlobal + 1);
  });
  document.getElementById("btn-done-back").addEventListener("click", () => {
    document.getElementById("modal-done").classList.add("hidden");
    renderMenu(); showScreen("screen-menu");
  });

  renderMenu();
}
document.addEventListener("DOMContentLoaded", init);
