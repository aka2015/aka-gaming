// ========================================
// GAME STATE - Global variables and state management
// ========================================

// Game state
let gameState = 'menu'; // menu, character_select, countdown, playing, paused, shop, level_up, game_over, boss_fight, wave_rest
let selectedCharacter = null;
let difficulty = 'normal';

// Player object
let player = {
    x: 0,
    y: 0,
    width: 40,
    height: 60,
    character: null,
    colors: {},
    hp: 100,
    maxHp: 100,
    speed: 200,
    defense: 0,
    damageReduction: 0,
    attackSpeedMult: 1.0,
    baseDamage: 10,
    pickupRange: 50,
    xp: 0,
    level: 1,
    coins: 0,
    weapons: [],
    upgrades: {},
    invincibleTimer: 0,
    hpRegen: 0,
    lifesteal: 0,
    critChance: 0,
    critMultiplier: 1.5,
    xpMultiplier: 1.0,
    hasExtraLife: false,
    weaponIndex: 0,
    lastAttackTime: 0,
    isAttacking: false,
    attackTimer: 0,
    attackIndex: 0, // Track which attack animation to use (alternates between attack01, attack02)
    facingDirection: { x: 0, y: 1 } // Default facing down
};

// Game objects
let enemies = [];
let projectiles = [];
let xpOrbs = [];
let coins = [];
let damageNumbers = [];
let warnings = [];
let particles = [];
let playerTrail = [];

// Game variables
let score = 0;
let currentWave = 1;
let waveTimer = 0;
let waveDuration = 90; // seconds
let restTimer = 0;
let restDuration = 10;
let survivalTime = 0;
let enemiesKilled = 0;
let bossesDefeated = 0;
let activeBoss = null;
let lastSpawnTime = 0;
let spawnRate = 2000; // ms
let gameTime = 0;
let lastTime = 0;
let countdownValue = 0; // Untuk countdown display di canvas
let waveCompletedWarningShown = false; // Track if warning shown for wave completion

// Input
const keys = {};
let mouseX = 0;
let mouseY = 0;

// Audio
let audioCtx = null;
let soundEnabled = true;
let bgMusicEnabled = true;
let bgMusicGainNode = null;
let bgMusicOscillators = [];
let bgMusicInterval = null;
let bgMusicPlaying = false;
let bgMusicAudio = null; // HTML5 Audio element for background music

// Utility functions
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
}

// HP Regen effect state
let hpRegenEffect = {
    active: false,
    timer: 0,
    spriteSheet: null,
    animation: null
};
