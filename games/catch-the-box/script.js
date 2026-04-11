// Game State Variables
let score = 0;
let timeLeft = 30;
let gameInterval;
let boxInterval;
let isPlaying = false;
let baseSpeed = 800;
let soundEnabled = true;
let canClick = true; // Prevent multiple clicks
let gameDuration = 30; // Default 30 seconds
let isSpecialMode = false;
let coins = 0;

// Upgrade system
let upgrades = {
  multiplier: { level: 1, cost: 10, bonus: 0 },
  extraTime: { level: 1, cost: 15, bonus: 0 }
};

// Upgrade config
const MULTIPLIER_BONUS_PER_LEVEL = {
  2: 1,  // Lv 2: +1
  3: 2,  // Lv 3: +2
  4: 4,  // Lv 4: +4
  5: 6,  // Lv 5: +6
  6: 10  // Lv 6: +10
};

// Speed settings (in milliseconds)
const speedSettings = {
  easy: 2000,
  normal: 1400,
  hard: 800,
  extreme: 600
};

// Audio Context for sound effects
let audioContext = null;
let backgroundMusic = null;
let musicInterval = null;
let currentNoteIndex = 0;
let menuMusic = null;
let menuMusicInterval = null;

// Simple melody notes (frequencies in Hz) - C major progression
const melodyNotes = [
  261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25,
  493.88, 440.00, 392.00, 349.23, 329.63, 293.66, 261.63, 329.63,
  392.00, 392.00, 440.00, 392.00, 349.23, 329.63, 293.66, 329.63,
  261.63, 261.63, 293.66, 329.63, 349.23, 329.63, 293.66, 261.63
];

let bassNotes = [261.63, 261.63, 329.63, 329.63, 392.00, 392.00, 329.63, 329.63];

// Menu music notes - calmer melody
const menuMelodyNotes = [
  261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 261.63, 329.63,
  392.00, 523.25, 659.25, 523.25, 392.00, 329.63, 261.63, 261.63
];

// DOM Elements
const mainMenu = document.getElementById('main-menu');
const shopPanel = document.getElementById('shop-panel');
const settingsPanel = document.getElementById('settings-panel');
const gameArea = document.getElementById('game-area');
const gameStats = document.getElementById('game-stats');
const box = document.getElementById('box');
const playBtn = document.getElementById('play-btn');
const specialModeBtn = document.getElementById('special-mode-btn');
const shopBtn = document.getElementById('shop-btn');
const settingsBtn = document.getElementById('settings-btn');
const backFromSettings = document.getElementById('back-from-settings');
const backFromShop = document.getElementById('back-from-shop');
const playAgainBtn = document.getElementById('play-again-btn');
const backToMenuBtn = document.getElementById('back-to-menu-btn');
const backToMenuGameover = document.getElementById('back-to-menu-gameover');
const gameOverButtons = document.getElementById('game-over-buttons');
const finalScoreEl = document.getElementById('final-score');
const playerNameInputEl = document.getElementById('player-name-input');
const highscoreListEl = document.getElementById('highscore-list');
const clearScoresBtn = document.getElementById('clear-scores-btn');
const languageSelect = document.getElementById('language-select');
const timeSelect = document.getElementById('time-select');
const speedSelect = document.getElementById('speed-select');
const soundToggle = document.getElementById('sound-toggle');
const scoreEl = document.getElementById('score');
const timeEl = document.getElementById('time');
const bestScoreEl = document.getElementById('best-score');
const totalCoinsEl = document.getElementById('total-coins');
const shopCoinsEl = document.getElementById('shop-coins');
const upgradeMultiplierBtn = document.getElementById('upgrade-multiplier-btn');
const upgradeTimeBtn = document.getElementById('upgrade-time-btn');
const multiplierLevelEl = document.getElementById('multiplier-level');
const multiplierBonusEl = document.getElementById('multiplier-bonus');
const multiplierCostEl = document.getElementById('multiplier-cost');
const timeLevelEl = document.getElementById('time-level');
const timeBonusEl = document.getElementById('time-bonus');
const timeCostEl = document.getElementById('time-cost');

// Translations
const translations = {
  'en-US': {
    title: '🎮 Catch the Box',
    subtitle: 'Click the box before it moves!',
    playBtn: '▶️ Play',
    settingsBtn: '⚙️ Settings',
    settingsTitle: '⚙️ Settings',
    language: '🌐 Language:',
    gameTime: '⏱️ Game Time:',
    difficulty: '🎯 Difficulty:',
    sound: '🔊 Sound:',
    playerName: '👤 Your Name:',
    backBtn: '↩️ Back',
    menuBtn: '↩️ Menu',
    playAgainBtn: '🔄 Play Again',
    score: 'Score:',
    time: 'Time:',
    best: 'Best:',
    highScores: '🏆 High Scores',
    noScores: 'No scores yet - be the first!',
    clearScores: '🗑️ Clear Scores',
    easy: '🟢 Easy',
    normal: '🔵 Normal',
    hard: '🟠 Hard',
    extreme: '🔴 Extreme',
    time15s: '🕐 15 seconds',
    time30s: '🕐 30 seconds',
    time45s: '🕐 45 seconds'
  },
  'en-GB': {
    title: '🎮 Catch the Box',
    subtitle: 'Click the box before it moves!',
    playBtn: '▶️ Play',
    settingsBtn: '⚙️ Settings',
    settingsTitle: '⚙️ Settings',
    language: '🌐 Language:',
    gameTime: '⏱️ Game Time:',
    difficulty: '🎯 Difficulty:',
    sound: '🔊 Sound:',
    playerName: '👤 Your Name:',
    backBtn: '↩️ Back',
    menuBtn: '↩️ Menu',
    playAgainBtn: '🔄 Play Again',
    score: 'Score:',
    time: 'Time:',
    best: 'Best:',
    highScores: '🏆 High Scores',
    noScores: 'No scores yet - be the first!',
    clearScores: '🗑️ Clear Scores',
    easy: '🟢 Easy',
    normal: '🔵 Normal',
    hard: '🟠 Hard',
    extreme: '🔴 Extreme',
    time15s: '🕐 15 seconds',
    time30s: '🕐 30 seconds',
    time45s: '🕐 45 seconds'
  },
  'id': {
    title: '🎮 Tangkap Kotaknya',
    subtitle: 'Klik kotak sebelum bergerak!',
    playBtn: '▶️ Main',
    settingsBtn: '⚙️ Pengaturan',
    settingsTitle: '⚙️ Pengaturan',
    language: '🌐 Bahasa:',
    gameTime: '⏱️ Waktu Main:',
    difficulty: '🎯 Kesulitan:',
    sound: '🔊 Suara:',
    playerName: '👤 Nama Kamu:',
    backBtn: '↩️ Kembali',
    menuBtn: '↩️ Menu',
    playAgainBtn: '🔄 Main Lagi',
    score: 'Skor:',
    time: 'Waktu:',
    best: 'Terbaik:',
    highScores: '🏆 Skor Tertinggi',
    noScores: 'Belum ada skor - jadilah yang pertama!',
    clearScores: '🗑️ Hapus Skor',
    easy: '🟢 Mudah',
    normal: '🔵 Normal',
    hard: '🟠 Sulit',
    extreme: '🔴 Ekstrem',
    time15s: '🕐 15 detik',
    time30s: '🕐 30 detik',
    time45s: '🕐 45 detik'
  },
  'de': {
    title: '🎮 Fang die Box',
    subtitle: 'Klicke auf die Box bevor sie sich bewegt!',
    playBtn: '▶️ Spielen',
    settingsBtn: '⚙️ Einstellungen',
    settingsTitle: '⚙️ Einstellungen',
    language: '🌐 Sprache:',
    gameTime: '⏱️ Spielzeit:',
    difficulty: '🎯 Schwierigkeit:',
    sound: '🔊 Ton:',
    playerName: '👤 Dein Name:',
    backBtn: '↩️ Zurück',
    menuBtn: '↩️ Menü',
    playAgainBtn: '🔄 Nochmal spielen',
    score: 'Punktzahl:',
    time: 'Zeit:',
    best: 'Rekord:',
    highScores: '🏆 Highscores',
    noScores: 'Noch keine Punkte - sei der Erste!',
    clearScores: '🗑️ Punkte löschen',
    easy: '🟢 Einfach',
    normal: '🔵 Normal',
    hard: '🟠 Schwer',
    extreme: '🔴 Extrem',
    time15s: '🕐 15 Sekunden',
    time30s: '🕐 30 Sekunden',
    time45s: '🕐 45 Sekunden'
  },
  'es': {
    title: '🎮 Atrapa la Caja',
    subtitle: '¡Haz clic en la caja antes de que se mueva!',
    playBtn: '▶️ Jugar',
    settingsBtn: '⚙️ Configuración',
    settingsTitle: '⚙️ Configuración',
    language: '🌐 Idioma:',
    gameTime: '⏱️ Tiempo de Juego:',
    difficulty: '🎯 Dificultad:',
    sound: '🔊 Sonido:',
    playerName: '👤 Tu Nombre:',
    backBtn: '↩️ Atrás',
    menuBtn: '↩️ Menú',
    playAgainBtn: '🔄 Jugar de nuevo',
    score: 'Puntuación:',
    time: 'Tiempo:',
    best: 'Récord:',
    highScores: '🏆 Mejores Puntuaciones',
    noScores: '¡Aún no hay puntuaciones - sé el primero!',
    clearScores: '🗑️ Borrar Puntuaciones',
    easy: '🟢 Fácil',
    normal: '🔵 Normal',
    hard: '🟠 Difícil',
    extreme: '🔴 Extremo',
    time15s: '🕐 15 segundos',
    time30s: '🕐 30 segundos',
    time45s: '🕐 45 segundos'
  },
  'it': {
    title: '🎮 Prendi la Scatola',
    subtitle: 'Clicca sulla scatola prima che si muova!',
    playBtn: '▶️ Gioca',
    settingsBtn: '⚙️ Impostazioni',
    settingsTitle: '⚙️ Impostazioni',
    language: '🌐 Lingua:',
    gameTime: '⏱️ Tempo di Gioco:',
    difficulty: '🎯 Difficoltà:',
    sound: '🔊 Suono:',
    playerName: '👤 Il Tuo Nome:',
    backBtn: '↩️ Indietro',
    menuBtn: '↩️ Menu',
    playAgainBtn: '🔄 Gioca di nuovo',
    score: 'Punteggio:',
    time: 'Tempo:',
    best: 'Record:',
    highScores: '🏆 Punteggi Più Alti',
    noScores: 'Nessun punteggio ancora - sii il primo!',
    clearScores: '🗑️ Cancella Punteggi',
    easy: '🟢 Facile',
    normal: '🔵 Normale',
    hard: '🟠 Difficile',
    extreme: '🔴 Estremo',
    time15s: '🕐 15 secondi',
    time30s: '🕐 30 secondi',
    time45s: '🕐 45 secondi'
  }
};

// Highscore settings
const MAX_HIGHSCORES = 5;
let isNewHighscoreAchieved = false;
let hasSavedScore = false; // Prevent multiple saves

// Initialize box position
box.style.left = '50%';
box.style.top = '50%';
box.style.transform = 'translate(-50%, -50%)';

// Load saved upgrades
const savedUpgrades = localStorage.getItem('catchTheBoxUpgrades');
if (savedUpgrades) {
  upgrades = JSON.parse(savedUpgrades);
}

// Load saved coins
const savedCoins = localStorage.getItem('catchTheBoxCoins');
if (savedCoins) {
  coins = parseInt(savedCoins);
}

// Load saved player name
const savedName = localStorage.getItem('catchTheBoxPlayerName');
if (savedName) {
  playerNameInputEl.value = savedName;
}

// Load saved language
const savedLanguage = localStorage.getItem('catchTheBoxLanguage') || 'en-US';
languageSelect.value = savedLanguage;
updateLanguage(savedLanguage);

// Load saved game time
const savedGameTime = localStorage.getItem('catchTheBoxGameTime') || '30';
timeSelect.value = savedGameTime;
gameDuration = parseInt(savedGameTime);

// Time change handler
timeSelect.addEventListener('change', (e) => {
  gameDuration = parseInt(e.target.value);
  localStorage.setItem('catchTheBoxGameTime', e.target.value);
});

// Language change handler
languageSelect.addEventListener('change', (e) => {
  const lang = e.target.value;
  localStorage.setItem('catchTheBoxLanguage', lang);
  updateLanguage(lang);
});

// Update language function
function updateLanguage(lang) {
  const t = translations[lang] || translations['en-US'];
  
  // Update menu
  const titleEl = document.querySelector('.main-menu h1');
  const subtitleEl = document.querySelector('.subtitle');
  const playBtnEl = document.getElementById('play-btn');
  const settingsBtnEl = document.getElementById('settings-btn');
  
  if (titleEl) titleEl.textContent = t.title;
  if (subtitleEl) subtitleEl.textContent = t.subtitle;
  if (playBtnEl) playBtnEl.textContent = t.playBtn;
  if (settingsBtnEl) settingsBtnEl.textContent = t.settingsBtn;
  
  // Update settings panel
  const settingsTitleEl = document.querySelector('.settings-panel h2');
  const backBtnEl = document.getElementById('back-from-settings');
  
  if (settingsTitleEl) settingsTitleEl.textContent = t.settingsTitle;
  if (backBtnEl) backBtnEl.textContent = t.backBtn;
  
  // Update labels
  document.querySelector('[for="language-select"]').textContent = t.language;
  document.querySelector('[for="time-select"]').textContent = t.gameTime;
  document.querySelector('[for="speed-select"]').textContent = t.difficulty;
  document.querySelector('[for="sound-toggle"]').textContent = t.sound;
  document.querySelector('[for="player-name-input"]').textContent = t.playerName;
  
  // Update time options
  const timeOptions = timeSelect.querySelectorAll('option');
  timeOptions[0].textContent = t.time15s;
  timeOptions[1].textContent = t.time30s;
  timeOptions[2].textContent = t.time45s;
  
  // Update game stats
  if (backToMenuBtn) backToMenuBtn.textContent = t.menuBtn;
  if (playAgainBtn) playAgainBtn.textContent = t.playAgainBtn;
  
  // Update stat labels
  const statLabels = document.querySelectorAll('.stat-label');
  if (statLabels[0]) statLabels[0].textContent = t.score;
  if (statLabels[1]) statLabels[1].textContent = t.time;
  if (statLabels[2]) statLabels[2].textContent = t.best;
  
  // Update highscore panel
  const highscoreTitleEl = document.querySelector('.highscore-board h3');
  const clearScoresBtnEl = document.getElementById('clear-scores-btn');
  
  if (highscoreTitleEl) highscoreTitleEl.textContent = t.highScores;
  if (clearScoresBtnEl) clearScoresBtnEl.textContent = t.clearScores;
  
  // Update difficulty options
  const speedOptions = speedSelect.querySelectorAll('option');
  speedOptions[0].textContent = t.easy;
  speedOptions[1].textContent = t.normal;
  speedOptions[2].textContent = t.hard;
  speedOptions[3].textContent = t.extreme;
  
  // Update highscore list
  loadHighscores();
}

// Menu Navigation
playBtn.addEventListener('click', () => {
  stopMenuMusic(); // Stop menu music when game starts
  isSpecialMode = false;
  mainMenu.classList.add('hidden');
  gameArea.classList.remove('hidden');
  gameStats.classList.remove('hidden');
  startGame();
});

specialModeBtn.addEventListener('click', () => {
  stopMenuMusic();
  isSpecialMode = true;
  mainMenu.classList.add('hidden');
  gameArea.classList.remove('hidden');
  gameStats.classList.remove('hidden');
  startGame();
});

shopBtn.addEventListener('click', () => {
  mainMenu.classList.add('hidden');
  shopPanel.classList.remove('hidden');
  updateShopDisplay();
});

settingsBtn.addEventListener('click', () => {
  mainMenu.classList.add('hidden');
  settingsPanel.classList.remove('hidden');
});

backFromSettings.addEventListener('click', () => {
  settingsPanel.classList.add('hidden');
  mainMenu.classList.remove('hidden');
});

backFromShop.addEventListener('click', () => {
  shopPanel.classList.add('hidden');
  mainMenu.classList.remove('hidden');
  updateCoinDisplay();
});

playAgainBtn.addEventListener('click', () => {
  gameOverButtons.classList.add('hidden');
  gameArea.classList.remove('hidden');
  gameStats.classList.remove('hidden');
  startGame();
});

// Back to menu from game over
backToMenuGameover.addEventListener('click', () => {
  gameOverButtons.classList.add('hidden');
  gameArea.classList.add('hidden');
  gameStats.classList.add('hidden');
  mainMenu.classList.remove('hidden');
  // Don't auto-start menu music - let user enjoy silence after special mode
});

// Back to menu button
backToMenuBtn.addEventListener('click', () => {
  // Stop game if playing
  if (isPlaying) {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(boxInterval);
    stopBackgroundMusic();
  }
  
  // Hide game elements
  gameArea.classList.add('hidden');
  gameStats.classList.add('hidden');
  gameOverButtons.classList.add('hidden');
  
  // Show main menu
  mainMenu.classList.remove('hidden');
  startMenuMusic(); // Start menu music
});

box.addEventListener('click', catchBox);
speedSelect.addEventListener('change', (e) => {
  baseSpeed = speedSettings[e.target.value];
});
soundToggle.addEventListener('change', (e) => {
  soundEnabled = e.target.checked;
});

// Save player name on change
playerNameInputEl.addEventListener('change', (e) => {
  const name = e.target.value.trim();
  if (name) {
    localStorage.setItem('catchTheBoxPlayerName', name);
  }
});

// Clear scores button - delete all highscores
clearScoresBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to clear all highscores? This cannot be undone!')) {
    localStorage.removeItem('catchTheBoxHighscores');
    loadHighscores();
  }
});

// Save and load functions
function saveCoins() {
  localStorage.setItem('catchTheBoxCoins', coins.toString());
}

function saveUpgrades() {
  localStorage.setItem('catchTheBoxUpgrades', JSON.stringify(upgrades));
}

function updateCoinDisplay() {
  if (totalCoinsEl) totalCoinsEl.textContent = coins;
  if (shopCoinsEl) shopCoinsEl.textContent = coins;
}

function updateShopDisplay() {
  if (multiplierLevelEl) multiplierLevelEl.textContent = upgrades.multiplier.level;
  if (multiplierBonusEl) multiplierBonusEl.textContent = upgrades.multiplier.bonus;
  if (multiplierCostEl) multiplierCostEl.textContent = upgrades.multiplier.level >= 6 ? 'MAX' : upgrades.multiplier.cost;
  if (timeLevelEl) timeLevelEl.textContent = upgrades.extraTime.level;
  if (timeBonusEl) timeBonusEl.textContent = upgrades.extraTime.bonus;
  if (timeCostEl) timeCostEl.textContent = upgrades.extraTime.level >= 6 ? 'MAX' : upgrades.extraTime.cost;
  
  // Disable buttons at max level
  if (upgradeMultiplierBtn) {
    if (upgrades.multiplier.level >= 6) {
      upgradeMultiplierBtn.disabled = true;
      upgradeMultiplierBtn.textContent = '✅ MAX';
    } else {
      upgradeMultiplierBtn.disabled = false;
      upgradeMultiplierBtn.textContent = '🪙 ' + upgrades.multiplier.cost;
    }
  }
  if (upgradeTimeBtn) {
    if (upgrades.extraTime.level >= 6) {
      upgradeTimeBtn.disabled = true;
      upgradeTimeBtn.textContent = '✅ MAX';
    } else {
      upgradeTimeBtn.disabled = false;
      upgradeTimeBtn.textContent = '🪙 ' + upgrades.extraTime.cost;
    }
  }
}

// Upgrade handlers
upgradeMultiplierBtn.addEventListener('click', () => {
  if (upgrades.multiplier.level >= 6) return;
  
  if (coins >= upgrades.multiplier.cost) {
    coins -= upgrades.multiplier.cost;
    upgrades.multiplier.level++;
    upgrades.multiplier.bonus = MULTIPLIER_BONUS_PER_LEVEL[upgrades.multiplier.level] || 0;
    upgrades.multiplier.cost = Math.floor(upgrades.multiplier.cost * 1.5);
    saveCoins();
    saveUpgrades();
    updateCoinDisplay();
    updateShopDisplay();
  }
});

upgradeTimeBtn.addEventListener('click', () => {
  if (upgrades.extraTime.level >= 6) return;
  
  if (coins >= upgrades.extraTime.cost) {
    coins -= upgrades.extraTime.cost;
    upgrades.extraTime.level++;
    upgrades.extraTime.bonus += 5;
    upgrades.extraTime.cost = Math.floor(upgrades.extraTime.cost * 1.5);
    saveCoins();
    saveUpgrades();
    updateCoinDisplay();
    updateShopDisplay();
  }
});

// Load highscores on page load
loadHighscores();

// Initialize UI after DOM is ready
updateCoinDisplay();
updateShopDisplay();

// Start menu music on page load
document.addEventListener('click', function initMenuMusic() {
  initAudio();
  startMenuMusic();
  document.removeEventListener('click', initMenuMusic);
}, { once: true });

// Initialize Audio Context
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  
  // Resume audio context if suspended (browser autoplay policy)
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }
}

// Play score sound
function playScoreSound() {
  if (!soundEnabled || !audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 880;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.15);
}

// Play game over sound
function playGameOverSound() {
  if (!soundEnabled || !audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = 400;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

// Initialize background music
function initBackgroundMusic() {
  if (!backgroundMusic) {
    backgroundMusic = {
      isPlaying: false,
      melodyOsc: null,
      bassOsc: null,
      melodyGain: null,
      bassGain: null
    };
  }
}

// Play a single note for background music
function playMusicNote(freq, duration, type = 'sine', volume = 0.1) {
  if (!soundEnabled || !audioContext) return;
  
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = freq;
  oscillator.type = type;
  
  gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
}

// Start background music - plays a melodic loop
function startBackgroundMusic() {
  if (!soundEnabled || !audioContext) return;
  
  if (backgroundMusic.isPlaying) return;
  
  // Resume audio context if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  backgroundMusic.isPlaying = true;
  currentNoteIndex = 0;
  
  // Play melody loop
  const noteDuration = 250; // ms per note
  
  musicInterval = setInterval(() => {
    if (!backgroundMusic.isPlaying) return;
    
    // Play melody note
    playMusicNote(melodyNotes[currentNoteIndex % melodyNotes.length], 
                  noteDuration / 1000, 'sine', 0.15);
    
    // Play bass note every 2 beats
    if (currentNoteIndex % 4 === 0) {
      playMusicNote(bassNotes[Math.floor(currentNoteIndex / 4) % bassNotes.length], 
                    noteDuration * 2 / 1000, 'triangle', 0.1);
    }
    
    currentNoteIndex++;
  }, noteDuration);
}

// Stop background music
function stopBackgroundMusic() {
  if (!backgroundMusic || !backgroundMusic.isPlaying) return;
  
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  
  backgroundMusic.isPlaying = false;
}

// Start menu background music - calmer ambient sound
function startMenuMusic() {
  if (!soundEnabled || !audioContext) return;
  
  if (menuMusic && menuMusic.isPlaying) return;
  
  // Resume audio context if suspended
  if (audioContext.state === 'suspended') {
    audioContext.resume();
  }

  menuMusic = { isPlaying: true };
  currentNoteIndex = 0;
  
  // Play calm melody loop
  const noteDuration = 400; // ms per note (slower for menu)
  
  menuMusicInterval = setInterval(() => {
    if (!menuMusic || !menuMusic.isPlaying) return;
    
    // Play melody note
    playMusicNote(menuMelodyNotes[currentNoteIndex % menuMelodyNotes.length], 
                  noteDuration / 1000, 'sine', 0.12);
    
    currentNoteIndex++;
  }, noteDuration);
}

// Stop menu background music
function stopMenuMusic() {
  if (!menuMusic || !menuMusic.isPlaying) return;
  
  if (menuMusicInterval) {
    clearInterval(menuMusicInterval);
    menuMusicInterval = null;
  }
  
  menuMusic.isPlaying = false;
}

// Start Game
function startGame() {
  initAudio();
  initBackgroundMusic();
  isPlaying = true;
  score = 0;
  
  // Calculate game time with upgrade bonus
  const timeBonus = upgrades.extraTime.bonus;
  timeLeft = gameDuration + timeBonus;
  
  canClick = true;
  hasSavedScore = false;

  if (isSpecialMode) {
    scoreEl.textContent = '🪙 0';
  } else {
    scoreEl.textContent = '0';
  }
  timeEl.textContent = timeLeft;
  box.style.display = 'block';

  // Move box to random position initially
  moveBox();

  // Start timer
  gameInterval = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      timeEl.textContent = 0;
      endGame();
    }
  }, 1000);

  // Move box based on selected speed
  boxInterval = setInterval(moveBox, baseSpeed);

  // Start background music
  startBackgroundMusic();
}

// Move box to random position
function moveBox() {
  if (!isPlaying) return;
  
  const maxX = gameArea.clientWidth - box.clientWidth;
  const maxY = gameArea.clientHeight - box.clientHeight;
  
  const randomX = Math.floor(Math.random() * maxX);
  const randomY = Math.floor(Math.random() * maxY);
  
  box.style.left = randomX + 'px';
  box.style.top = randomY + 'px';
  box.style.transform = 'none';
}

// Catch the box
function catchBox() {
  if (!isPlaying || !canClick) return;
  
  canClick = false;

  // Calculate points with multiplier bonus
  let pointsEarned = 1 + upgrades.multiplier.bonus;
  
  if (isSpecialMode) {
    // In special mode, earn coins
    coins += pointsEarned;
    saveCoins();
    updateCoinDisplay();
    scoreEl.textContent = '🪙 ' + coins;
  } else {
    // Regular mode - earn score
    score += pointsEarned;
    scoreEl.textContent = score;
  }

  // Play score sound
  playScoreSound();

  // Make box move faster as score increases
  clearInterval(boxInterval);
  const speedIncrease = Math.min(score * 15, 200);
  const newSpeed = Math.max(300, baseSpeed - speedIncrease);
  boxInterval = setInterval(moveBox, newSpeed);

  // Move box immediately on click
  moveBox();
  
  // Reset click ability after short delay
  setTimeout(() => {
    canClick = true;
  }, 100);
}

// End Game
function endGame() {
  isPlaying = false;
  clearInterval(gameInterval);
  clearInterval(boxInterval);

  box.style.display = 'none';
  
  // Hide game elements and show game over buttons
  gameArea.classList.add('hidden');
  gameStats.classList.add('hidden');
  gameOverButtons.classList.remove('hidden');

  // Show final score
  finalScoreEl.textContent = score + ' points';

  // Check if this score qualifies for top 5 highscores
  const highscores = getHighscores();
  isNewHighscoreAchieved = checkIfQualifyForHighscore(score, highscores);

  // Auto-save score if qualifies and not already saved
  if (isNewHighscoreAchieved && score > 0 && !hasSavedScore) {
    // Get player name from input or generate random
    let playerName = playerNameInputEl.value.trim();
    if (!playerName) {
      const randomNum = Math.floor(Math.random() * 1000) + 1;
      playerName = `Guest${randomNum}`;
    }

    // Save automatically
    autoSaveHighscore(playerName);
    hasSavedScore = true; // Mark as saved
  }

  // Play game over sound
  playGameOverSound();

  // Stop background music (game music stops, menu music will start when back to menu)
  stopBackgroundMusic();

  // Update highscore display
  loadHighscores();
}

// Highscore Functions
function getHighscores() {
  const scores = localStorage.getItem('catchTheBoxHighscores');
  return scores ? JSON.parse(scores) : [];
}

// Check if score qualifies for top 5
function checkIfQualifyForHighscore(newScore, highscores) {
  // If less than MAX_HIGHSCORES, always qualify
  if (highscores.length < MAX_HIGHSCORES) {
    return true;
  }
  
  // Otherwise, check if it beats the lowest score
  const lowestScore = highscores[highscores.length - 1].score;
  return newScore > lowestScore;
}

// Auto-save highscore (no input needed)
function autoSaveHighscore(playerName) {
  const highscores = getHighscores();
  
  // Get current difficulty setting
  const currentDifficulty = speedSelect.value;
  const difficultyLabels = {
    easy: 'Easy',
    normal: 'Normal',
    hard: 'Hard',
    extreme: 'Extreme'
  };
  
  // Get current game time
  const gameTimeLabel = `${gameDuration}s`;

  // Check if player already exists in highscores
  const existingIndex = highscores.findIndex(entry => entry.name === playerName);
  
  if (existingIndex !== -1) {
    // Player exists - update score if new score is higher
    if (score > highscores[existingIndex].score) {
      highscores[existingIndex].score = score;
      highscores[existingIndex].date = new Date().toLocaleDateString();
      highscores[existingIndex].difficulty = difficultyLabels[currentDifficulty];
      highscores[existingIndex].gameTime = gameTimeLabel;
    }
  } else {
    // New player - add to highscores
    highscores.push({
      name: playerName,
      score: score,
      date: new Date().toLocaleDateString(),
      difficulty: difficultyLabels[currentDifficulty],
      gameTime: gameTimeLabel
    });
  }

  // Sort by score (descending) and keep top scores
  highscores.sort((a, b) => b.score - a.score);
  highscores.splice(MAX_HIGHSCORES);

  // Save to localStorage
  localStorage.setItem('catchTheBoxHighscores', JSON.stringify(highscores));
}

function loadHighscores() {
  const highscores = getHighscores();
  updateBestScoreDisplay();

  if (highscores.length === 0) {
    const t = translations[localStorage.getItem('catchTheBoxLanguage') || 'en-US'];
    highscoreListEl.innerHTML = `<li class="no-scores">${t.noScores}</li>`;
    return;
  }

  highscoreListEl.innerHTML = highscores.map((entry, index) => `
    <li>
      <div class="score-info">
        <span class="player-name">${getMedal(index)} ${escapeHtml(entry.name)}</span>
        <span class="score-date">${entry.date}</span>
      </div>
      <div class="score-difficulty">
        <span class="difficulty-badge difficulty-${entry.difficulty?.toLowerCase()}">${entry.difficulty || 'Normal'}</span>
      </div>
      <div class="score-time">
        <span class="time-badge">⏱️ ${entry.gameTime || '30s'}</span>
      </div>
      <span class="score-value">${entry.score} pts</span>
    </li>
  `).join('');
}

function getMedal(index) {
  const medals = ['🥇', '🥈', '🥉', '🏅', '🏅'];
  return medals[index] || '🏅';
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function updateBestScoreDisplay() {
  const highscores = getHighscores();
  const bestScore = highscores.length > 0 ? highscores[0].score : 0;
  bestScoreEl.textContent = bestScore;
}
