// Treasure Quest Adventure - Game Engine
const STORAGE_KEY = "aka_treasure_quest_progress";

// Audio System
let audioCtx = null;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playSound(type) {
  initAudio();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  const now = audioCtx.currentTime;

  switch (type) {
    case 'jump':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(300, now);
      oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
      oscillator.start(now);
      oscillator.stop(now + 0.15);
      break;
    case 'coin':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(987.77, now);
      oscillator.frequency.setValueAtTime(1318.51, now + 0.08);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);
      break;
    case 'powerup':
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(523.25, now);
      oscillator.frequency.setValueAtTime(659.25, now + 0.1);
      oscillator.frequency.setValueAtTime(783.99, now + 0.2);
      oscillator.frequency.setValueAtTime(1046.50, now + 0.3);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
      oscillator.start(now);
      oscillator.stop(now + 0.4);
      break;
    case 'hit':
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(200, now);
      oscillator.frequency.exponentialRampToValueAtTime(100, now + 0.2);
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      break;
    case 'win':
      oscillator.type = 'sine';
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, now + i * 0.15);
      });
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      oscillator.start(now);
      oscillator.stop(now + 0.6);
      break;
    case 'gameover':
      oscillator.type = 'sawtooth';
      [392, 349.23, 329.63, 261.63].forEach((freq, i) => {
        oscillator.frequency.setValueAtTime(freq, now + i * 0.2);
      });
      gainNode.gain.setValueAtTime(0.3, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.8);
      oscillator.start(now);
      oscillator.stop(now + 0.8);
      break;
  }
}

// World Definitions
const WORLDS = [
  {
    name: "Enchanted Forest",
    emoji: "🌲",
    bgColor1: "#87CEEB",
    bgColor2: "#98FB98",
    groundColor: "#8B4513",
    platformColor: "#228B22",
    levels: 3
  },
  {
    name: "Sandy Desert",
    emoji: "🏜️",
    bgColor1: "#FFD700",
    bgColor2: "#F4A460",
    groundColor: "#D2691E",
    platformColor: "#DEB887",
    levels: 3
  },
  {
    name: "Dark Cave",
    emoji: "🕳️",
    bgColor1: "#2F4F4F",
    bgColor2: "#696969",
    groundColor: "#808080",
    platformColor: "#A9A9A9",
    levels: 3
  },
  {
    name: "Haunted Castle",
    emoji: "🏰",
    bgColor1: "#4B0082",
    bgColor2: "#800080",
    groundColor: "#696969",
    platformColor: "#808080",
    levels: 3
  },
  {
    name: "Mystic Mountain",
    emoji: "⛰️",
    bgColor1: "#B0C4DE",
    bgColor2: "#E6E6FA",
    groundColor: "#808080",
    platformColor: "#A9A9A9",
    levels: 3
  }
];

// Level Definitions
const LEVELS = [];

// Generate 15 levels (3 per world)
for (let worldIdx = 0; worldIdx < 5; worldIdx++) {
  for (let levelIdx = 0; levelIdx < 3; levelIdx++) {
    LEVELS.push({
      world: worldIdx,
      level: levelIdx + 1,
      difficulty: worldIdx * 3 + levelIdx + 1,
      platforms: generatePlatforms(worldIdx, levelIdx),
      enemies: generateEnemies(worldIdx, levelIdx),
      coins: generateCoins(worldIdx, levelIdx),
      powerups: generatePowerups(worldIdx, levelIdx),
      goal: { x: 900, y: 100 }
    });
  }
}

function generatePlatforms(worldIdx, levelIdx) {
  const base = [
    { x: 0, y: 500, w: 1000, h: 100 }, // Ground
    { x: 200, y: 400, w: 100, h: 20 },
    { x: 400, y: 320, w: 100, h: 20 },
    { x: 600, y: 240, w: 100, h: 20 }
  ];

  // Add more platforms based on difficulty
  if (worldIdx >= 1) {
    base.push({ x: 100, y: 250, w: 80, h: 20 });
  }
  if (worldIdx >= 2) {
    base.push({ x: 750, y: 350, w: 80, h: 20 });
    base.push({ x: 300, y: 180, w: 100, h: 20 });
  }
  if (worldIdx >= 3) {
    base.push({ x: 500, y: 420, w: 80, h: 20 });
    base.push({ x: 850, y: 280, w: 80, h: 20 });
  }

  return base;
}

function generateEnemies(worldIdx, levelIdx) {
  const enemies = [];
  const count = Math.min(worldIdx + 1, 5);

  for (let i = 0; i < count; i++) {
    enemies.push({
      x: 300 + i * 150,
      y: 460,
      w: 40,
      h: 40,
      type: getEnemyType(worldIdx),
      speed: 1 + worldIdx * 0.5,
      range: 100,
      startX: 300 + i * 150
    });
  }

  return enemies;
}

function getEnemyType(worldIdx) {
  const types = ['👾', '🦂', '🦇', '👻', '🐉'];
  return types[worldIdx] || '👾';
}

function generateCoins(worldIdx, levelIdx) {
  const coins = [];
  const count = 8 + worldIdx * 2;

  for (let i = 0; i < count; i++) {
    coins.push({
      x: 150 + i * 60,
      y: 350 - (i % 3) * 80,
      collected: false
    });
  }

  return coins;
}

function generatePowerups(worldIdx, levelIdx) {
  const powerups = [];
  const types = ['shield', 'speed', 'magnet'];

  if (worldIdx >= 1) {
    powerups.push({
      x: 500,
      y: 200,
      type: types[levelIdx % 3],
      collected: false
    });
  }

  return powerups;
}

// Game State
let gameState = {
  currentWorld: 0,
  currentLevel: 0,
  score: 0,
  coins: 0,
  health: 100,
  maxHealth: 100,
  lives: 3,
  player: {
    x: 50,
    y: 400,
    w: 40,
    h: 60,
    vx: 0,
    vy: 0,
    speed: 5,
    jumpForce: -12,
    grounded: false,
    facing: 1
  },
  enemies: [],
  coins: [],
  powerups: [],
  platforms: [],
  goal: null,
  activePowerup: null,
  powerupTimer: 0,
  paused: false,
  gameRunning: false,
  startTime: 0
};

// Physics Constants
const GRAVITY = 0.6;
const FRICTION = 0.8;

// DOM Elements
const startScreen = document.getElementById("start-screen");
const gameScreen = document.getElementById("game-screen");
const pauseScreen = document.getElementById("pause-screen");
const gameoverScreen = document.getElementById("gameover-screen");
const levelcompleteScreen = document.getElementById("levelcomplete-screen");
const winScreen = document.getElementById("win-screen");
const gameCanvas = document.getElementById("game-canvas");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const restartBtn = document.getElementById("restart-btn");
const quitBtn = document.getElementById("quit-btn");
const retryBtn = document.getElementById("retry-btn");
const menuBtn = document.getElementById("menu-btn");
const nextLevelBtn = document.getElementById("next-level-btn");
const playAgainBtn = document.getElementById("play-again-btn");
const healthFill = document.getElementById("health-fill");
const coinCount = document.getElementById("coin-count");
const scoreCount = document.getElementById("score-count");
const levelCount = document.getElementById("level-count");
const powerupIcon = document.getElementById("powerup-icon");
const powerupTimer = document.getElementById("powerup-timer");
const worldButtons = document.querySelectorAll(".world-btn");

// Input State
const keys = {};
let animFrame = null;
let lastTime = 0;

// Screen Management
function showScreen(screen) {
  [startScreen, gameScreen, pauseScreen, gameoverScreen, levelcompleteScreen, winScreen].forEach(s => {
    s.classList.add("hidden");
    s.classList.remove("active");
  });
  screen.classList.remove("hidden");
  screen.classList.add("active");
}

// Level Management
function loadLevel(worldIdx, levelIdx) {
  const globalLevelIdx = worldIdx * 3 + levelIdx;
  if (globalLevelIdx >= LEVELS.length) {
    showWinScreen();
    return;
  }

  const level = LEVELS[globalLevelIdx];
  gameState.currentWorld = worldIdx;
  gameState.currentLevel = levelIdx;
  gameState.platforms = level.platforms.map(p => ({ ...p }));
  gameState.enemies = level.enemies.map(e => ({ ...e, startX: e.x }));
  gameState.coins = level.coins.map(c => ({ ...c }));
  gameState.powerups = level.powerups.map(p => ({ ...p }));
  gameState.goal = { ...level.goal };
  gameState.player.x = 50;
  gameState.player.y = 400;
  gameState.player.vx = 0;
  gameState.player.vy = 0;
  gameState.activePowerup = null;
  gameState.powerupTimer = 0;
  gameState.startTime = Date.now();

  updateHUD();
  showScreen(gameScreen);
  gameState.gameRunning = true;
  gameState.paused = false;
  gameLoop();
}

function updateHUD() {
  healthFill.style.width = `${(gameState.health / gameState.maxHealth) * 100}%`;
  coinCount.textContent = gameState.coins;
  scoreCount.textContent = gameState.score;
  const displayWorld = gameState.currentWorld + 1;
  const displayLevel = gameState.currentLevel + 1;
  levelCount.textContent = `${displayWorld}-${displayLevel}`;

  if (gameState.activePowerup) {
    powerupIcon.parentElement.classList.remove("hidden");
    const icons = { shield: '🛡️', speed: '⚡', magnet: '🧲' };
    powerupIcon.textContent = icons[gameState.activePowerup] || '⚡';
    powerupTimer.style.width = `${(gameState.powerupTimer / 10000) * 100}%`;
  } else {
    powerupIcon.parentElement.classList.add("hidden");
  }
}

// Game Loop
function gameLoop(timestamp = 0) {
  if (!gameState.gameRunning) return;
  if (gameState.paused) return;

  const deltaTime = timestamp - lastTime;
  lastTime = timestamp;

  update(deltaTime);
  render();

  animFrame = requestAnimationFrame(gameLoop);
}

function update(deltaTime) {
  const player = gameState.player;

  // Handle Input
  if (keys["ArrowLeft"] || keys["KeyA"]) {
    player.vx -= 1;
    player.facing = -1;
  }
  if (keys["ArrowRight"] || keys["KeyD"]) {
    player.vx += 1;
    player.facing = 1;
  }
  if ((keys["ArrowUp"] || keys["Space"] || keys["KeyW"]) && player.grounded) {
    player.vy = player.jumpForce;
    player.grounded = false;
    playSound('jump');
  }

  // Apply Physics
  player.vx *= FRICTION;
  player.vy += GRAVITY;
  player.x += player.vx * (gameState.activePowerup === 'speed' ? 1.5 : 1);
  player.y += player.vy;

  // Platform Collision
  player.grounded = false;
  gameState.platforms.forEach(platform => {
    if (checkCollision(player, platform)) {
      if (player.vy > 0 && player.y < platform.y) {
        player.y = platform.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    }
  });

  // Keep player in bounds
  if (player.x < 0) player.x = 0;
  if (player.x > 960) player.x = 960;
  if (player.y > 600) {
    takeDamage(20);
    player.x = 50;
    player.y = 400;
    player.vy = 0;
  }

  // Update Enemies
  gameState.enemies.forEach(enemy => {
    enemy.x += enemy.speed * (enemy.x > enemy.startX + enemy.range ? -1 : 1);

    // Check collision with player
    if (checkCollision(player, enemy)) {
      if (player.vy > 0 && player.y < enemy.y) {
        // Stomp enemy
        player.vy = player.jumpForce * 0.7;
        gameState.score += 50;
        playSound('hit');
        enemy.x = -100; // Remove enemy
      } else {
        takeDamage(20);
      }
    }
  });

  // Collect Coins
  gameState.coins.forEach(coin => {
    if (!coin.collected && checkCollision(player, { x: coin.x, y: coin.y, w: 30, h: 30 })) {
      coin.collected = true;
      gameState.coins++;
      gameState.score += 10;
      playSound('coin');
    }
  });

  // Collect Powerups
  gameState.powerups.forEach(powerup => {
    if (!powerup.collected && checkCollision(player, { x: powerup.x, y: powerup.y, w: 40, h: 40 })) {
      powerup.collected = true;
      gameState.activePowerup = powerup.type;
      gameState.powerupTimer = 10000; // 10 seconds
      playSound('powerup');
    }
  });

  // Update Powerup Timer
  if (gameState.activePowerup) {
    gameState.powerupTimer -= deltaTime || 16;
    if (gameState.powerupTimer <= 0) {
      gameState.activePowerup = null;
    }
  }

  // Check Goal
  if (checkCollision(player, { x: gameState.goal.x, y: gameState.goal.y, w: 60, h: 80 })) {
    levelComplete();
  }

  updateHUD();
}

function checkCollision(a, b) {
  return a.x < b.x + b.w &&
         a.x + a.w > b.x &&
         a.y < b.y + b.h &&
         a.y + a.h > b.y;
}

function takeDamage(amount) {
  if (gameState.activePowerup === 'shield') return;

  gameState.health -= amount;
  playSound('hit');

  if (gameState.health <= 0) {
    gameState.lives--;
    if (gameState.lives <= 0) {
      gameOver();
    } else {
      gameState.health = gameState.maxHealth;
      gameState.player.x = 50;
      gameState.player.y = 400;
    }
  }
}

function render() {
  const world = WORLDS[gameState.currentWorld];
  const player = gameState.player;

  // Clear canvas
  gameCanvas.innerHTML = '';

  // Set background
  gameCanvas.style.background = `linear-gradient(to bottom, ${world.bgColor1}, ${world.bgColor2})`;

  // Draw Platforms
  gameState.platforms.forEach(platform => {
    const div = document.createElement('div');
    div.className = 'platform';
    div.style.left = `${platform.x}px`;
    div.style.top = `${platform.y}px`;
    div.style.width = `${platform.w}px`;
    div.style.height = `${platform.h}px`;
    div.style.background = world.platformColor;
    gameCanvas.appendChild(div);
  });

  // Draw Coins
  gameState.coins.forEach(coin => {
    if (!coin.collected) {
      const div = document.createElement('div');
      div.className = 'coin';
      div.style.left = `${coin.x}px`;
      div.style.top = `${coin.y}px`;
      div.textContent = '🪙';
      gameCanvas.appendChild(div);
    }
  });

  // Draw Powerups
  gameState.powerups.forEach(powerup => {
    if (!powerup.collected) {
      const div = document.createElement('div');
      div.className = 'powerup';
      div.style.left = `${powerup.x}px`;
      div.style.top = `${powerup.y}px`;
      const icons = { shield: '🛡️', speed: '⚡', magnet: '🧲' };
      div.textContent = icons[powerup.type] || '⚡';
      gameCanvas.appendChild(div);
    }
  });

  // Draw Enemies
  gameState.enemies.forEach(enemy => {
    if (enemy.x > -50) {
      const div = document.createElement('div');
      div.className = 'enemy';
      div.style.left = `${enemy.x}px`;
      div.style.top = `${enemy.y}px`;
      div.textContent = enemy.type;
      gameCanvas.appendChild(div);
    }
  });

  // Draw Goal
  const goalDiv = document.createElement('div');
  goalDiv.className = 'goal';
  goalDiv.style.left = `${gameState.goal.x}px`;
  goalDiv.style.top = `${gameState.goal.y}px`;
  goalDiv.textContent = '🚪';
  gameCanvas.appendChild(goalDiv);

  // Draw Player
  const playerDiv = document.createElement('div');
  playerDiv.className = 'player';
  playerDiv.style.left = `${player.x}px`;
  playerDiv.style.top = `${player.y}px`;
  playerDiv.style.transform = `scaleX(${player.facing})`;

  if (gameState.activePowerup === 'shield') {
    playerDiv.classList.add('shielded');
  } else if (gameState.activePowerup === 'speed') {
    playerDiv.classList.add('speeding');
  }

  gameCanvas.appendChild(playerDiv);
}

// Game Events
function gameOver() {
  gameState.gameRunning = false;
  cancelAnimationFrame(animFrame);
  playSound('gameover');

  document.getElementById("final-score").textContent = gameState.score;
  document.getElementById("final-coins").textContent = gameState.coins;
  const displayWorld = gameState.currentWorld + 1;
  const displayLevel = gameState.currentLevel + 1;
  document.getElementById("final-level").textContent = `${displayWorld}-${displayLevel}`;

  showScreen(gameoverScreen);
}

function levelComplete() {
  gameState.gameRunning = false;
  cancelAnimationFrame(animFrame);
  playSound('win');

  const timeElapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
  const timeBonus = Math.max(0, 100 - timeElapsed) * 2;
  gameState.score += timeBonus;

  document.getElementById("level-score").textContent = gameState.score;
  document.getElementById("level-coins").textContent = gameState.coins;
  document.getElementById("level-time").textContent = `${timeElapsed}s`;

  showScreen(levelcompleteScreen);

  // Save progress
  saveProgress();

  // Report score
  window.AkaScoreReporter?.report("treasure-quest", gameState.score, {
    coins: gameState.coins,
    world: gameState.currentWorld,
    level: gameState.currentLevel
  });
}

function showWinScreen() {
  document.getElementById("total-score").textContent = gameState.score;
  document.getElementById("total-coins").textContent = gameState.coins;
  document.getElementById("worlds-completed").textContent = "5/5";
  showScreen(winScreen);
}

// Save/Load Progress
function saveProgress() {
  try {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"unlockedWorlds":[0]}');
    const nextWorld = gameState.currentWorld + 1;
    if (!progress.unlockedWorlds.includes(nextWorld) && nextWorld < 5) {
      progress.unlockedWorlds.push(nextWorld);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) {
    // Ignore errors
  }
}

function loadProgress() {
  try {
    const progress = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{"unlockedWorlds":[0]}');
    return progress.unlockedWorlds || [0];
  } catch (e) {
    return [0];
  }
}

function unlockWorlds(worlds) {
  worldButtons.forEach(btn => {
    const worldIdx = parseInt(btn.dataset.world);
    if (worlds.includes(worldIdx)) {
      btn.classList.remove("locked");
      btn.disabled = false;
    }
  });
}

// Event Listeners
startBtn.addEventListener("click", () => {
  initAudio();
  loadLevel(gameState.currentWorld, gameState.currentLevel);
});

pauseBtn.addEventListener("click", () => {
  gameState.paused = true;
  showScreen(pauseScreen);
});

resumeBtn.addEventListener("click", () => {
  gameState.paused = false;
  showScreen(gameScreen);
  lastTime = performance.now();
  gameLoop(lastTime);
});

restartBtn.addEventListener("click", () => {
  gameState.health = gameState.maxHealth;
  gameState.lives = 3;
  loadLevel(gameState.currentWorld, gameState.currentLevel);
});

quitBtn.addEventListener("click", () => {
  gameState.gameRunning = false;
  cancelAnimationFrame(animFrame);
  showScreen(startScreen);
});

retryBtn.addEventListener("click", () => {
  gameState.health = gameState.maxHealth;
  gameState.lives = 3;
  loadLevel(gameState.currentWorld, gameState.currentLevel);
});

menuBtn.addEventListener("click", () => {
  gameState.gameRunning = false;
  cancelAnimationFrame(animFrame);
  showScreen(startScreen);
});

nextLevelBtn.addEventListener("click", () => {
  const nextLevelIdx = gameState.currentWorld * 3 + gameState.currentLevel + 1;
  if (nextLevelIdx >= LEVELS.length) {
    showWinScreen();
    return;
  }

  const nextWorld = Math.floor(nextLevelIdx / 3);
  const nextLevel = nextLevelIdx % 3;

  if (nextWorld > gameState.currentWorld) {
    gameState.currentWorld = nextWorld;
  }
  gameState.currentLevel = nextLevel;
  loadLevel(gameState.currentWorld, gameState.currentLevel);
});

playAgainBtn.addEventListener("click", () => {
  gameState.currentWorld = 0;
  gameState.currentLevel = 0;
  gameState.score = 0;
  gameState.coins = 0;
  gameState.health = gameState.maxHealth;
  gameState.lives = 3;
  showScreen(startScreen);
});

worldButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const worldIdx = parseInt(btn.dataset.world);
    if (!btn.classList.contains("locked")) {
      gameState.currentWorld = worldIdx;
      gameState.currentLevel = 0;
      worldButtons.forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
    }
  });
});

// Keyboard Input
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;

  if (e.code === "Escape" && gameState.gameRunning) {
    if (gameState.paused) {
      resumeBtn.click();
    } else {
      pauseBtn.click();
    }
  }
});

window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

// Mobile Controls
const btnLeft = document.getElementById("btn-left");
const btnRight = document.getElementById("btn-right");
const btnJump = document.getElementById("btn-jump");

function addMobileButton(button, key) {
  button.addEventListener("touchstart", (e) => {
    e.preventDefault();
    keys[key] = true;
  });
  button.addEventListener("touchend", (e) => {
    e.preventDefault();
    keys[key] = false;
  });
  button.addEventListener("mousedown", (e) => {
    keys[key] = true;
  });
  button.addEventListener("mouseup", (e) => {
    keys[key] = false;
  });
}

addMobileButton(btnLeft, "ArrowLeft");
addMobileButton(btnRight, "ArrowRight");
addMobileButton(btnJump, "Space");

// Initialize
unlockWorlds(loadProgress());
