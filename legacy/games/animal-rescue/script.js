const TILE = 48;
const COLS = 12;
const ROWS = 10;
const CANVAS_W = COLS * TILE;
const CANVAS_H = ROWS * TILE;

const ANIMALS = [
  { emoji: "\u{1F98A}", name: "Rubah", fact: "Rubah sangat pintar dan bisa beradaptasi di berbagai lingkungan." },
  { emoji: "\u{1F43B}", name: "Beruang", fact: "Beruang bisa tidur selama 100 hari di musim dingin tanpa makan." },
  { emoji: "\u{1F430}", name: "Kelinci", fact: "Kelinci bisa melihat hampir 360 derajat tanpa memutar kepala." },
  { emoji: "\u{1F981}", name: "Singa", fact: "Auman singa bisa terdengar hingga jarak 8 kilometer." },
  { emoji: "\u{1F418}", name: "Gajah", fact: "Gajah adalah satu-satunya hewan yang tidak bisa melompat." },
  { emoji: "\u{1F43C}", name: "Panda", fact: "Panda menghabiskan 12 jam sehari untuk makan bambu." },
  { emoji: "\u{1F98B}", name: "Kupu-kupu", fact: "Kupu-kupu merasakan makanan dengan kakinya." },
  { emoji: "\u{1F42F}", name: "Harimau", fact: "Setiap harimau memiliki pola belang yang unik." }
];

const LEVELS = [
  {
    keys: 3,
    animals: ["\u{1F98A}", "\u{1F43B}", "\u{1F430}"],
    monsters: 1,
    trees: 15
  },
  {
    keys: 4,
    animals: ["\u{1F98A}", "\u{1F43B}", "\u{1F430}", "\u{1F981}"],
    monsters: 2,
    trees: 20
  },
  {
    keys: 5,
    animals: ["\u{1F98A}", "\u{1F43B}", "\u{1F430}", "\u{1F981}", "\u{1F418}"],
    monsters: 3,
    trees: 25
  }
];

const PLAYER_FRAMES = {
  idle: ["\u{1F9CD}", "\u{1F9CD}\u{200D}\u2640\uFE0F"],
  walk: ["\u{1F6B6}", "\u{1F3C3}", "\u{1F6B6}", "\u{1F3C3}\u200D\u2640\uFE0F"],
  up: ["\u{1F64B}", "\u{1F64B}\u200D\u2640\uFE0F"],
  down: ["\u{1F9CD}", "\u{1F9CD}\u200D\u2640\uFE0F"],
  left: ["\u{1F6B6}", "\u{1F6B6}"],
  right: ["\u{1F3C3}", "\u{1F3C3}\u200D\u2640\uFE0F"]
};

const MONSTER_FRAMES = ["\u{1F47F}", "\u{1F479}", "\u{1F47F}", "\u{1F440}"];

let audioCtx = null;
let bgMusicInterval = null;
let bgMusicGain = null;
let isBgMusicPlaying = false;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playNote(freq, startTime, duration, type = 'sine', volume = 0.15) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
  gain.gain.setValueAtTime(volume, startTime + duration - 0.05);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);
  osc.start(startTime);
  osc.stop(startTime + duration);
}

const MELODY = [
  [262, 0.4], [294, 0.4], [330, 0.4], [349, 0.4],
  [392, 0.6], [349, 0.2], [330, 0.4], [294, 0.4],
  [262, 0.4], [330, 0.4], [392, 0.6], [440, 0.4],
  [392, 0.4], [349, 0.4], [330, 0.6], [294, 0.4],
  [262, 0.8], [0, 0.2], [330, 0.4], [349, 0.4],
  [392, 0.6], [440, 0.4], [523, 0.8], [0, 0.2],
  [440, 0.4], [392, 0.4], [349, 0.4], [330, 0.4],
  [294, 0.4], [262, 0.6], [294, 0.2], [262, 0.8]
];

const BASS_LINE = [
  [131, 0.8], [131, 0.8], [175, 0.8], [175, 0.8],
  [196, 0.8], [196, 0.8], [165, 0.8], [147, 0.8],
  [131, 0.8], [131, 0.8], [196, 0.8], [196, 0.8],
  [175, 0.8], [175, 0.8], [147, 0.8], [131, 0.8],
  [131, 0.8], [131, 0.8], [175, 0.8], [175, 0.8],
  [196, 0.8], [196, 0.8], [220, 0.8], [220, 0.8],
  [196, 0.8], [175, 0.8], [147, 0.8], [131, 0.8],
  [131, 0.8], [147, 0.8], [131, 1.6]
];

function startBgMusic() {
  if (isBgMusicPlaying) return;
  initAudio();
  if (!audioCtx) return;

  bgMusicGain = audioCtx.createGain();
  bgMusicGain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  bgMusicGain.connect(audioCtx.destination);

  let melodyIdx = 0;
  let bassIdx = 0;
  let melodyTime = audioCtx.currentTime + 0.1;
  let bassTime = audioCtx.currentTime + 0.1;

  function scheduleLoop() {
    if (!isBgMusicPlaying || !audioCtx) return;

    while (melodyTime < audioCtx.currentTime + 2) {
      const [freq, dur] = MELODY[melodyIdx % MELODY.length];
      if (freq > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(bgMusicGain);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, melodyTime);
        gain.gain.setValueAtTime(0, melodyTime);
        gain.gain.linearRampToValueAtTime(0.12, melodyTime + 0.02);
        gain.gain.setValueAtTime(0.12, melodyTime + dur - 0.05);
        gain.gain.linearRampToValueAtTime(0, melodyTime + dur);
        osc.start(melodyTime);
        osc.stop(melodyTime + dur);
      }
      melodyTime += dur;
      melodyIdx++;
    }

    while (bassTime < audioCtx.currentTime + 2) {
      const [freq, dur] = BASS_LINE[bassIdx % BASS_LINE.length];
      if (freq > 0) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(bgMusicGain);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, bassTime);
        gain.gain.setValueAtTime(0, bassTime);
        gain.gain.linearRampToValueAtTime(0.08, bassTime + 0.03);
        gain.gain.setValueAtTime(0.08, bassTime + dur - 0.05);
        gain.gain.linearRampToValueAtTime(0, bassTime + dur);
        osc.start(bassTime);
        osc.stop(bassTime + dur);
      }
      bassTime += dur;
      bassIdx++;
    }

    bgMusicInterval = setTimeout(scheduleLoop, 800);
  }

  isBgMusicPlaying = true;
  scheduleLoop();
}

function stopBgMusic() {
  isBgMusicPlaying = false;
  if (bgMusicInterval) {
    clearTimeout(bgMusicInterval);
    bgMusicInterval = null;
  }
  if (bgMusicGain) {
    bgMusicGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 0.3);
    bgMusicGain = null;
  }
}

function playPickupSound() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playNote(600, now, 0.1, 'sine', 0.2);
  playNote(800, now + 0.08, 0.1, 'sine', 0.2);
}

function playUnlockSound() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playNote(523.25, now, 0.2, 'sine', 0.2);
  playNote(659.25, now + 0.1, 0.2, 'sine', 0.2);
  playNote(783.99, now + 0.2, 0.25, 'sine', 0.2);
}

function playHitSound() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  playNote(200, now, 0.15, 'sawtooth', 0.15);
  playNote(150, now + 0.1, 0.15, 'sawtooth', 0.15);
}

function playWinSound() {
  initAudio();
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  const notes = [523.25, 587.33, 659.25, 698.46, 783.99, 880];
  notes.forEach((freq, i) => {
    playNote(freq, now + i * 0.12, 0.2, 'sine', 0.2);
  });
}

const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const pauseScreen = document.getElementById("pause-screen");
const resultScreen = document.getElementById("result-screen");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const quitBtn = document.getElementById("quit-btn");
const nextLevelBtn = document.getElementById("next-level-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const levelDisplay = document.getElementById("level-display");
const keyDisplay = document.getElementById("key-display");
const animalDisplay = document.getElementById("animal-display");
const timerDisplay = document.getElementById("timer-display");
const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const resultTitle = document.getElementById("result-title");
const resultSummary = document.getElementById("result-summary");
const finalStars = document.getElementById("final-stars");
const finalScore = document.getElementById("final-score");
const finalTime = document.getElementById("final-time");
const finalLevel = document.getElementById("final-level");
const animalFacts = document.getElementById("animal-facts");

canvas.width = CANVAS_W;
canvas.height = CANVAS_H;

let gameState = {
  level: 0,
  player: { x: 0, y: 0, frameIdx: 0, frameTimer: 0, isMoving: false, direction: "down" },
  keys: 0,
  keyPositions: [],
  animalCages: [],
  rescuedAnimals: [],
  monsters: [],
  trees: [],
  score: 0,
  seconds: 0,
  hitCooldown: 0,
  isRunning: false,
  isPaused: false,
  animFrame: null,
  timerInterval: null,
  globalTime: 0
};

let keysDown = {};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function switchScreen(target) {
  [startScreen, gameScreen, pauseScreen, resultScreen].forEach((s) => {
    s.classList.add("hidden");
    s.classList.remove("active");
  });
  target.classList.remove("hidden");
  target.classList.add("active");
}

function getFreePositions(count, exclude) {
  const positions = [];
  const occupied = new Set(exclude.map((p) => `${p.x},${p.y}`));
  let attempts = 0;
  while (positions.length < count && attempts < 1000) {
    const x = Math.floor(Math.random() * COLS);
    const y = Math.floor(Math.random() * ROWS);
    const key = `${x},${y}`;
    if (!occupied.has(key) && x > 1 && y > 1) {
      positions.push({ x, y });
      occupied.add(key);
    }
    attempts++;
  }
  return positions;
}

function setupLevel(levelIdx) {
  const config = LEVELS[Math.min(levelIdx, LEVELS.length - 1)];
  const state = gameState;

  state.level = levelIdx;
  state.player = { x: 0, y: 0, frameIdx: 0, frameTimer: 0, isMoving: false, direction: "down" };
  state.keys = 0;
  state.rescuedAnimals = [];
  state.score = 0;
  state.seconds = 0;
  state.hitCooldown = 0;
  state.globalTime = 0;

  const occupied = [{ x: 0, y: 0 }];

  state.trees = getFreePositions(config.trees, occupied).map((p) => ({ ...p }));
  occupied.push(...state.trees);

  const keyPositions = getFreePositions(config.keys, occupied);
  state.keyPositions = keyPositions.map((p) => ({ ...p, collected: false, bobTimer: Math.random() * Math.PI * 2 }));
  occupied.push(...keyPositions);

  state.animalCages = config.animals.map((emoji) => {
    const pos = getFreePositions(1, occupied)[0];
    occupied.push(pos);
    return { x: pos.x, y: pos.y, emoji, unlocked: false, shakeTimer: 0 };
  });

  state.monsters = [];
  for (let i = 0; i < config.monsters; i++) {
    const pos = getFreePositions(1, occupied)[0];
    occupied.push(pos);
    state.monsters.push({
      x: pos.x,
      y: pos.y,
      dir: Math.random() > 0.5 ? 1 : -1,
      axis: Math.random() > 0.5 ? "x" : "y",
      speed: 0.8 + Math.random() * 0.5,
      moveTimer: 0,
      frameIdx: 0,
      frameTimer: 0
    });
  }

  levelDisplay.textContent = String(levelIdx + 1);
  keyDisplay.textContent = "0";
  animalDisplay.textContent = `0 / ${config.animals.length}`;
  timerDisplay.textContent = "0:00";
}

function updateHud() {
  const config = LEVELS[Math.min(gameState.level, LEVELS.length - 1)];
  keyDisplay.textContent = String(gameState.keys);
  animalDisplay.textContent = `${gameState.rescuedAnimals.length} / ${config.animals.length}`;
}

function movePlayer(dx, dy) {
  const state = gameState;
  if (!state.isRunning || state.isPaused) return;

  const nx = state.player.x + dx;
  const ny = state.player.y + dy;

  if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return;

  for (const tree of state.trees) {
    if (tree.x === nx && tree.y === ny) return;
  }

  state.player.x = nx;
  state.player.y = ny;
  state.player.isMoving = true;
  state.player.direction = dx < 0 ? "left" : dx > 0 ? "right" : dy < 0 ? "up" : "down";

  for (const key of state.keyPositions) {
    if (!key.collected && key.x === nx && key.y === ny) {
      key.collected = true;
      state.keys++;
      playPickupSound();
      updateHud();
    }
  }

  for (const cage of state.animalCages) {
    if (!cage.unlocked && cage.x === nx && cage.y === ny && state.keys > 0) {
      cage.unlocked = true;
      cage.shakeTimer = 0.5;
      state.keys--;
      state.rescuedAnimals.push(cage.emoji);
      state.score += 100;
      playUnlockSound();
      updateHud();

      const config = LEVELS[Math.min(state.level, LEVELS.length - 1)];
      if (state.rescuedAnimals.length === config.animals.length) {
        endLevel();
      }
    }
  }
}

function moveMonsters(dt) {
  const state = gameState;
  for (const monster of state.monsters) {
    monster.moveTimer += dt * monster.speed;
    monster.frameTimer += dt;

    if (monster.frameTimer >= 0.25) {
      monster.frameTimer -= 0.25;
      monster.frameIdx = (monster.frameIdx + 1) % MONSTER_FRAMES.length;
    }

    if (monster.moveTimer >= 1) {
      monster.moveTimer -= 1;
      let nx = monster.x;
      let ny = monster.y;

      if (monster.axis === "x") {
        nx += monster.dir;
        if (nx < 0 || nx >= COLS) {
          monster.dir *= -1;
          nx = monster.x;
        }
      } else {
        ny += monster.dir;
        if (ny < 0 || ny >= ROWS) {
          monster.dir *= -1;
          ny = monster.y;
        }
      }

      let blocked = false;
      for (const tree of state.trees) {
        if (tree.x === nx && tree.y === ny) {
          blocked = true;
          monster.dir *= -1;
          break;
        }
      }

      if (!blocked) {
        monster.x = nx;
        monster.y = ny;
      }
    }

    if (monster.x === state.player.x && monster.y === state.player.y && state.hitCooldown <= 0) {
      state.hitCooldown = 2;
      playHitSound();
      state.score = Math.max(0, state.score - 20);
    }
  }
}

function drawEmoji(emoji, x, y, size, scale = 1, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${size * scale}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x, y);
  ctx.restore();
}

function render() {
  const state = gameState;
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = "#4caf50";
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.fillStyle = "#388e3c";
  for (let x = 0; x < COLS; x++) {
    for (let y = 0; y < ROWS; y++) {
      if ((x + y) % 2 === 0) {
        ctx.fillRect(x * TILE, y * TILE, TILE, TILE);
      }
    }
  }

  for (const tree of state.trees) {
    const sway = Math.sin(state.globalTime * 0.8 + tree.x + tree.y) * 2;
    drawEmoji("\u{1F332}", tree.x * TILE + TILE / 2 + sway, tree.y * TILE + TILE / 2, TILE - 4);
  }

  for (const key of state.keyPositions) {
    if (!key.collected) {
      const bob = Math.sin(state.globalTime * 3 + key.bobTimer) * 4;
      const glow = 0.5 + Math.sin(state.globalTime * 4) * 0.3;
      ctx.save();
      ctx.shadowColor = "#ffd700";
      ctx.shadowBlur = 10 + glow * 5;
      drawEmoji("\u{1F511}", key.x * TILE + TILE / 2, key.y * TILE + TILE / 2 + bob, TILE - 8);
      ctx.restore();
    }
  }

  for (const cage of state.animalCages) {
    if (!cage.unlocked) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
      ctx.fillRect(cage.x * TILE + 4, cage.y * TILE + 4, TILE - 8, TILE - 8);
      
      let shakeX = 0;
      if (cage.shakeTimer > 0) {
        shakeX = Math.sin(cage.shakeTimer * 30) * 4;
      }
      
      drawEmoji(cage.emoji, cage.x * TILE + TILE / 2 + shakeX, cage.y * TILE + TILE / 2, TILE - 12);
      drawEmoji("\u{1F512}", cage.x * TILE + TILE / 2, cage.y * TILE + 8, 14);
    }
  }

  for (const monster of state.monsters) {
    const pulse = 1 + Math.sin(state.globalTime * 5) * 0.08;
    const shadow = Math.sin(state.globalTime * 3) * 3;
    
    ctx.save();
    ctx.shadowColor = "#ff0000";
    ctx.shadowBlur = 8 + Math.sin(state.globalTime * 4) * 4;
    drawEmoji(
      MONSTER_FRAMES[monster.frameIdx],
      monster.x * TILE + TILE / 2 + shadow,
      monster.y * TILE + TILE / 2,
      TILE - 4,
      monster.dir > 0 ? pulse : -pulse
    );
    ctx.restore();
  }

  const player = state.player;
  if (player.isMoving) {
    player.frameTimer += 0.016;
    if (player.frameTimer >= 0.15) {
      player.frameTimer = 0;
      player.frameIdx = (player.frameIdx + 1) % PLAYER_FRAMES[player.direction].length;
    }
  } else {
    player.frameIdx = 0;
    player.isMoving = false;
  }

  setTimeout(() => { player.isMoving = false; }, 150);

  const playerEmoji = PLAYER_FRAMES[player.direction][player.frameIdx % PLAYER_FRAMES[player.direction].length];
  
  if (state.hitCooldown > 0) {
    const blink = Math.floor(state.hitCooldown * 10) % 2 === 0;
    if (blink) {
      drawEmoji(playerEmoji, player.x * TILE + TILE / 2, player.y * TILE + TILE / 2, TILE - 4);
    }
  } else {
    const bounce = player.isMoving ? Math.abs(Math.sin(state.globalTime * 10)) * 3 : 0;
    drawEmoji(playerEmoji, player.x * TILE + TILE / 2, player.y * TILE + TILE / 2 - bounce, TILE - 4);
  }
}

let lastTime = 0;

function gameLoop(timestamp) {
  if (!gameState.isRunning) return;

  const dt = lastTime ? (timestamp - lastTime) / 1000 : 0;
  lastTime = timestamp;

  if (!gameState.isPaused) {
    gameState.globalTime += dt;

    if (gameState.hitCooldown > 0) {
      gameState.hitCooldown -= dt;
    }

    for (const cage of gameState.animalCages) {
      if (cage.shakeTimer > 0) {
        cage.shakeTimer -= dt;
      }
    }

    moveMonsters(dt);
    render();
  }

  gameState.animFrame = requestAnimationFrame(gameLoop);
}

function startTimer() {
  if (gameState.timerInterval) return;
  gameState.timerInterval = setInterval(() => {
    if (!gameState.isPaused) {
      gameState.seconds++;
      timerDisplay.textContent = formatTime(gameState.seconds);
    }
  }, 1000);
}

function stopTimer() {
  if (gameState.timerInterval) {
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
  }
}

function endLevel() {
  gameState.isRunning = false;
  stopBgMusic();
  stopTimer();
  if (gameState.animFrame) {
    cancelAnimationFrame(gameState.animFrame);
  }

  playWinSound();

  const timeBonus = Math.max(0, 300 - gameState.seconds * 3);
  gameState.score += timeBonus;

  const config = LEVELS[Math.min(gameState.level, LEVELS.length - 1)];
  const threshold3 = config.animals.length * 15;
  const threshold2 = config.animals.length * 25;
  const stars = gameState.seconds <= threshold3 ? 3 : gameState.seconds <= threshold2 ? 2 : 1;

  resultTitle.textContent = stars === 3 ? "Sempurna!" : stars === 2 ? "Hebat!" : "Bagus!";
  resultSummary.textContent = `Semua ${config.animals.length} hewan berhasil diselamatkan!`;

  finalStars.textContent = "\u2B50".repeat(stars);
  finalScore.textContent = String(gameState.score);
  finalTime.textContent = formatTime(gameState.seconds);
  finalLevel.textContent = String(gameState.level + 1);

  animalFacts.innerHTML = "<h3>\u{1F4DA} Fakta Hewan yang Diselamatkan</h3>";
  const rescuedEmojis = gameState.rescuedAnimals;
  for (const emoji of rescuedEmojis) {
    const animal = ANIMALS.find((a) => a.emoji === emoji);
    if (animal) {
      animalFacts.innerHTML += `
        <div class="fact-item">
          <strong>${animal.emoji} ${animal.name}</strong>
          <p>${animal.fact}</p>
        </div>
      `;
    }
  }

  window.AkaScoreReporter?.report("animal-rescue", gameState.score, {
    stars,
    level: gameState.level + 1,
    time: gameState.seconds,
    animalsRescued: rescuedEmojis.length
  });

  const hasNext = gameState.level + 1 < LEVELS.length;
  nextLevelBtn.style.display = hasNext ? "inline-block" : "none";
  nextLevelBtn.textContent = hasNext ? "Level Berikutnya" : "Selesai!";

  switchScreen(resultScreen);
}

function startGame(levelIdx) {
  setupLevel(levelIdx ?? 0);
  switchScreen(gameScreen);
  gameState.isRunning = true;
  gameState.isPaused = false;
  lastTime = 0;
  startTimer();
  startBgMusic();
  gameState.animFrame = requestAnimationFrame(gameLoop);
}

function togglePause() {
  if (!gameState.isRunning) return;
  gameState.isPaused = !gameState.isPaused;
  if (gameState.isPaused) {
    switchScreen(pauseScreen);
  } else {
    switchScreen(gameScreen);
    lastTime = 0;
  }
}

document.addEventListener("keydown", (e) => {
  keysDown[e.key] = true;

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
    e.preventDefault();
  }

  if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") movePlayer(0, -1);
  if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") movePlayer(0, 1);
  if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") movePlayer(-1, 0);
  if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") movePlayer(1, 0);
  if (e.key === "Escape" || e.key === "p" || e.key === "P") togglePause();
});

document.addEventListener("keyup", (e) => {
  keysDown[e.key] = false;
});

document.querySelectorAll(".ctrl-btn").forEach((btn) => {
  const handleTap = (e) => {
    e.preventDefault();
    const dir = btn.dataset.dir;
    if (dir === "up") movePlayer(0, -1);
    if (dir === "down") movePlayer(0, 1);
    if (dir === "left") movePlayer(-1, 0);
    if (dir === "right") movePlayer(1, 0);
  };
  btn.addEventListener("touchstart", handleTap, { passive: false });
  btn.addEventListener("click", handleTap);
});

startBtn.addEventListener("click", () => startGame(0));
pauseBtn.addEventListener("click", togglePause);
resumeBtn.addEventListener("click", togglePause);
quitBtn.addEventListener("click", () => {
  gameState.isRunning = false;
  stopBgMusic();
  stopTimer();
  if (gameState.animFrame) cancelAnimationFrame(gameState.animFrame);
  switchScreen(startScreen);
});
nextLevelBtn.addEventListener("click", () => {
  if (gameState.level + 1 < LEVELS.length) {
    startGame(gameState.level + 1);
  }
});
playAgainBtn.addEventListener("click", () => startGame(gameState.level));
