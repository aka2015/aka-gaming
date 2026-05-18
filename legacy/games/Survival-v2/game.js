// ========================================
// SURVIVAL GAME - Survival.io Style
// ========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========================================
// GAME DATA DEFINITIONS
// ========================================

// Character Definitions
const CHARACTERS = {
    warrior: {
        id: 'warrior',
        name: 'Warrior',
        description: 'Petarung berani dengan pedang dan perisai',
        startingWeapon: 'basic_sword',
        baseDefense: 10, // Warrior dapat defense tambahan
        colors: {
            primary: '#2563EB',
            secondary: '#FBBF24',
            skin: '#FDBA74',
            hair: '#78350F',
            outline: '#1E3A8A'
        }
    },
    mage: {
        id: 'mage',
        name: 'Mage',
        description: 'Ahli sihir dengan kekuatan elementer',
        startingWeapon: 'magic_orb',
        colors: {
            primary: '#7C3AED',
            secondary: '#06B6D4',
            skin: '#FED7AA',
            hair: '#E5E7EB',
            outline: '#5B21B6'
        }
    },
    ranger: {
        id: 'ranger',
        name: 'Ranger',
        description: 'Penembak handal dari alam liar',
        startingWeapon: 'arrow_bow',
        colors: {
            primary: '#15803D',
            secondary: '#92400E',
            skin: '#D97706',
            hair: '#DC2626',
            outline: '#14532D'
        }
    }
};

// Weapon Definitions
const WEAPONS = {
    basic_sword: {
        type: 'basic_sword',
        name: 'Pedang Dasar',
        icon: '⚔️',
        damage: 12,
        attackSpeed: 1.0,
        range: 100,
        projectileType: 'melee',
        arcAngle: Math.PI / 2, // 90 degrees
        description: 'Serangan jarak depan'
    },
    magic_orb: {
        type: 'magic_orb',
        name: 'Orb Sihir',
        icon: '🔮',
        damage: 10,
        attackSpeed: 1.2,
        range: 350,
        projectileType: 'homing',
        speed: 280,
        description: 'Proyektil pencari musuh'
    },
    arrow_bow: {
        type: 'arrow_bow',
        name: 'Busur Panah',
        icon: '🏹',
        damage: 18,
        attackSpeed: 0.9,
        range: 450,
        projectileType: 'piercing',
        speed: 450,
        description: 'Panah tembus musuh'
    },
    fire_wand: {
        type: 'fire_wand',
        name: 'Tongkat Api',
        icon: '🔥',
        damage: 12,
        attackSpeed: 0.5,
        range: 250,
        projectileType: 'aoe',
        speed: 200,
        description: 'Damage area over time'
    },
    lightning_rod: {
        type: 'lightning_rod',
        name: 'Tongkat Petir',
        icon: '⚡',
        damage: 9,
        attackSpeed: 0.9,
        range: 200,
        projectileType: 'chain',
        speed: 300,
        chainCount: 3,
        description: 'Chain lightning ke 3 musuh'
    },
    ice_staff: {
        type: 'ice_staff',
        name: 'Tongkat Es',
        icon: '❄️',
        damage: 7,
        attackSpeed: 0.7,
        range: 280,
        projectileType: 'slow',
        speed: 220,
        slowAmount: 0.3,
        description: 'Memperlambat musuh 30%'
    }
};

// Shop Items
const SHOP_ITEMS = {
    weapons: [
        {
            id: 'sword_upgrade',
            name: 'Upgrade Pedang',
            icon: '⚔️',
            description: 'Damage +20% per level',
            basePrice: 50,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'basic_sword',
            effect: (level) => ({ damageMultiplier: 0.20 })
        },
        {
            id: 'bow_upgrade',
            name: 'Upgrade Busur',
            icon: '🏹',
            description: 'Damage +20%, +1 arrow di Lv.3',
            basePrice: 65,
            priceScaling: 1.6,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'arrow_bow',
            effect: (level) => ({ damageMultiplier: 0.20 })
        },
        {
            id: 'magic_orb_upgrade',
            name: 'Upgrade Orb Sihir',
            icon: '🔮',
            description: 'Damage +20%, faster homing',
            basePrice: 60,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'magic_orb',
            effect: (level) => ({ damageMultiplier: 0.20 })
        },
        {
            id: 'new_fire_wand',
            name: 'Tongkat Api',
            icon: '🔥',
            description: 'Senjata baru - AoE damage',
            basePrice: 200,
            priceScaling: 1.8,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'fire_wand',
            isNewWeapon: true,
            effect: (level) => ({ damage: 12 })
        },
        {
            id: 'new_lightning_rod',
            name: 'Tongkat Petir',
            icon: '⚡',
            description: 'Senjata baru - Chain lightning',
            basePrice: 220,
            priceScaling: 1.8,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'lightning_rod',
            isNewWeapon: true,
            effect: (level) => ({ damage: 9 })
        },
        {
            id: 'new_ice_staff',
            name: 'Tongkat Es',
            icon: '❄️',
            description: 'Senjata baru - Slow enemies',
            basePrice: 180,
            priceScaling: 1.8,
            maxLevel: 5,
            category: 'weapon',
            weaponType: 'ice_staff',
            isNewWeapon: true,
            effect: (level) => ({ damage: 7 })
        }
    ],
    armor: [
        {
            id: 'armor_upgrade',
            name: 'Upgrade Armor',
            icon: '🛡️',
            description: 'Defense +5 per level',
            basePrice: 80,
            priceScaling: 1.4,
            maxLevel: 10,
            category: 'armor',
            effect: (level) => ({ defense: 5 })
        },
        {
            id: 'shield_upgrade',
            name: 'Upgrade Shield',
            icon: '🔰',
            description: 'Damage Reduction +5%',
            basePrice: 70,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'armor',
            effect: (level) => ({ damageReduction: 0.05 })
        },
        {
            id: 'boots_upgrade',
            name: 'Upgrade Boots',
            icon: '👢',
            description: 'Movement Speed +10%',
            basePrice: 45,
            priceScaling: 1.4,
            maxLevel: 5,
            category: 'armor',
            effect: (level) => ({ speedMultiplier: 0.10 })
        },
        {
            id: 'helmet_upgrade',
            name: 'Upgrade Helmet',
            icon: '⛑️',
            description: 'Max HP +20 per level',
            basePrice: 60,
            priceScaling: 1.4,
            maxLevel: 10,
            category: 'armor',
            effect: (level) => ({ maxHp: 20 })
        }
    ],
    special: [
        {
            id: 'lifesteal',
            name: 'Lifesteal',
            icon: '❤️‍🔥',
            description: 'Heal 10% damage dealt',
            basePrice: 100,
            priceScaling: 2,
            maxLevel: 3,
            category: 'special',
            effect: (level) => ({ lifesteal: 0.10 })
        },
        {
            id: 'magnet',
            name: 'Magnet',
            icon: '🧲',
            description: 'Pickup Range +50%',
            basePrice: 50,
            priceScaling: 1.5,
            maxLevel: 3,
            category: 'special',
            effect: (level) => ({ pickupRangeMultiplier: 0.50 })
        },
        {
            id: 'xp_boost',
            name: 'XP Boost',
            icon: '⭐',
            description: 'XP Gain +20%',
            basePrice: 40,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'special',
            effect: (level) => ({ xpMultiplier: 0.20 })
        },
        {
            id: 'crit_chance',
            name: 'Critical Chance',
            icon: '💥',
            description: 'Critical Hit Chance +10%',
            basePrice: 80,
            priceScaling: 1.6,
            maxLevel: 5,
            category: 'special',
            effect: (level) => ({ critChance: 0.10 })
        },
        {
            id: 'crit_damage',
            name: 'Critical Damage',
            icon: '💢',
            description: 'Critical Damage +50%',
            basePrice: 120,
            priceScaling: 1.7,
            maxLevel: 3,
            category: 'special',
            effect: (level) => ({ critMultiplier: 0.50 })
        },
        {
            id: 'hp_regen',
            name: 'HP Regeneration',
            icon: '💚',
            description: 'Regenerate 2 HP/detik',
            basePrice: 90,
            priceScaling: 1.6,
            maxLevel: 5,
            category: 'special',
            effect: (level) => ({ hpRegen: 2 })
        },
        {
            id: 'extra_life',
            name: 'Extra Life',
            icon: '💀',
            description: 'Revive 1x dengan 50% HP',
            basePrice: 500,
            priceScaling: 1,
            maxLevel: 1,
            category: 'special',
            effect: (level) => ({ extraLife: true })
        },
        {
            id: 'area_damage',
            name: 'Area Damage',
            icon: '🔥',
            description: 'AoE Damage +25%',
            basePrice: 110,
            priceScaling: 1.5,
            maxLevel: 5,
            category: 'special',
            effect: (level) => ({ areaDamageMultiplier: 0.25 })
        }
    ]
};

// Enemy Definitions
const ENEMY_TYPES = {
    slime: {
        type: 'slime',
        name: 'Slime',
        baseHp: 20,
        baseSpeed: 80,
        baseDamage: 10,
        xpValue: 10,
        coinValue: 5,
        coinChance: 0.3,
        size: 25,
        color: '#22C55E',
        behavior: 'chase'
    },
    skeleton: {
        type: 'skeleton',
        name: 'Tengkorak',
        baseHp: 30,
        baseSpeed: 100,
        baseDamage: 15,
        xpValue: 10,
        coinValue: 5,
        coinChance: 0.3,
        size: 28,
        color: '#E5E7EB',
        behavior: 'chase'
    },
    bat: {
        type: 'bat',
        name: 'Kelelawar',
        baseHp: 15,
        baseSpeed: 150,
        baseDamage: 8,
        xpValue: 10,
        coinValue: 5,
        coinChance: 0.3,
        size: 20,
        color: '#A855F7',
        behavior: 'erratic'
    },
    armored_slime: {
        type: 'armored_slime',
        name: 'Slime Baja',
        baseHp: 60,
        baseSpeed: 70,
        baseDamage: 20,
        xpValue: 25,
        coinValue: 10,
        coinChance: 1.0,
        size: 35,
        color: '#15803D',
        behavior: 'chase',
        isElite: true
    },
    skeleton_warrior: {
        type: 'skeleton_warrior',
        name: 'Pejuang Tengkorak',
        baseHp: 50,
        baseSpeed: 90,
        baseDamage: 25,
        xpValue: 25,
        coinValue: 10,
        coinChance: 1.0,
        size: 32,
        color: '#DC2626',
        behavior: 'chase',
        isElite: true
    },
    ghost: {
        type: 'ghost',
        name: 'Hantu',
        baseHp: 35,
        baseSpeed: 130,
        baseDamage: 18,
        xpValue: 25,
        coinValue: 10,
        coinChance: 1.0,
        size: 30,
        color: 'rgba(59, 130, 246, 0.6)',
        behavior: 'chase',
        isElite: true
    }
};

// Boss Definitions
const BOSSES = {
    5: {
        type: 'boss_giant_slime',
        name: 'Slime Raksasa',
        baseHp: 300,
        speed: 60,
        damage: 30,
        xpValue: 100,
        coinValue: 50,
        size: 60,
        color: '#16A34A',
        ability: 'spawn_on_death'
    },
    10: {
        type: 'boss_skeleton_king',
        name: 'Raja Tengkorak',
        baseHp: 500,
        speed: 80,
        damage: 40,
        xpValue: 100,
        coinValue: 50,
        size: 65,
        color: '#FBBF24',
        ability: 'summon_minions'
    },
    15: {
        type: 'boss_dark_dragon',
        name: 'Naga Gelap',
        baseHp: 800,
        speed: 100,
        damage: 50,
        xpValue: 100,
        coinValue: 50,
        size: 70,
        color: '#7C3AED',
        ability: 'fire_breath'
    },
    20: {
        type: 'boss_death_lord',
        name: 'Dewa Kematian',
        baseHp: 1200,
        speed: 90,
        damage: 60,
        xpValue: 100,
        coinValue: 50,
        size: 75,
        color: '#1F2937',
        ability: 'teleport'
    }
};

// Upgrade Definitions for Level Up
const UPGRADE_POOL = [
    {
        id: 'damage_up',
        name: 'Damage Up',
        icon: '⚔️',
        description: 'Damage semua senjata +20%',
        rarity: 'common',
        effect: (player) => {
            player.weapons.forEach(w => w.damage *= 1.2);
            player.baseDamage = (player.baseDamage || 10) * 1.2;
        }
    },
    {
        id: 'attack_speed_up',
        name: 'Attack Speed Up',
        icon: '⚡',
        description: 'Attack speed +15%',
        rarity: 'common',
        effect: (player) => {
            player.attackSpeedMult *= 1.15;
        }
    },
    {
        id: 'max_hp_up',
        name: 'Max HP Up',
        icon: '❤️',
        description: 'Max HP +20',
        rarity: 'common',
        effect: (player) => {
            player.maxHp += 20;
            player.hp = Math.min(player.hp + 20, player.maxHp);
        }
    },
    {
        id: 'speed_up',
        name: 'Speed Up',
        icon: '👟',
        description: 'Movement speed +10%',
        rarity: 'common',
        effect: (player) => {
            player.speed *= 1.1;
        }
    },
    {
        id: 'defense_up',
        name: 'Defense Up',
        icon: '🛡️',
        description: 'Defense +5',
        rarity: 'common',
        effect: (player) => {
            player.defense += 5;
        }
    },
    {
        id: 'pickup_range_up',
        name: 'Pickup Range Up',
        icon: '🧲',
        description: 'Pickup range +30%',
        rarity: 'common',
        effect: (player) => {
            player.pickupRange *= 1.3;
        }
    },
    {
        id: 'hp_regen_up',
        name: 'HP Regeneration',
        icon: '💚',
        description: 'Regenerate 2 HP/detik',
        rarity: 'rare',
        effect: (player) => {
            player.hpRegen = (player.hpRegen || 0) + 2;
        }
    },
    {
        id: 'crit_chance_up',
        name: 'Critical Chance',
        icon: '💥',
        description: 'Critical hit chance +10%',
        rarity: 'rare',
        effect: (player) => {
            player.critChance = (player.critChance || 0) + 0.10;
        }
    },
    {
        id: 'lifesteal_up',
        name: 'Lifesteal',
        icon: '❤️‍🔥',
        description: 'Lifesteal +10%',
        rarity: 'rare',
        effect: (player) => {
            player.lifesteal = (player.lifesteal || 0) + 0.10;
        }
    }
];

// ========================================
// GAME STATE
// ========================================

let gameState = 'menu'; // menu, character_select, countdown, playing, paused, shop, level_up, game_over
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
    lastAttackTime: 0
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

// ========================================
// CHARACTER RENDERING FUNCTIONS
// ========================================

function drawWarrior(ctx, x, y, colors, time) {
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body (armor)
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -15, -10, 30, 35, 5);
    ctx.fill();
    ctx.stroke();
    
    // Gold trim
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();
    
    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Helmet
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(0, -22, 16, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, -20, 2, 0, Math.PI * 2);
    ctx.arc(5, -20, 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -17, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
    
    // Sword
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(15, 5);
    ctx.lineTo(25, 20);
    ctx.stroke();
    
    // Shield
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-20, 5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
}

function drawMage(ctx, x, y, colors, time) {
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Robe
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(-18, 30);
    ctx.lineTo(18, 30);
    ctx.lineTo(15, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Wizard hat
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.moveTo(-18, -25);
    ctx.lineTo(0, -50);
    ctx.lineTo(18, -25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Hat brim
    ctx.beginPath();
    ctx.ellipse(0, -25, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Glowing eyes
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-5, -20, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Staff
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, -30);
    ctx.lineTo(20, 30);
    ctx.stroke();
    
    // Glowing orb on staff
    const glowIntensity = Math.sin(time * 0.003) * 0.3 + 0.7;
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 15 * glowIntensity;
    ctx.beginPath();
    ctx.arc(20, -35, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Magic particles
    for (let i = 0; i < 5; i++) {
        const angle = (time * 0.002) + (i * Math.PI * 2 / 5);
        const radius = 25 + Math.sin(time * 0.005 + i) * 5;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius - 10;
        
        ctx.fillStyle = colors.secondary;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
    
    ctx.restore();
}

function drawRanger(ctx, x, y, colors, time) {
    ctx.save();
    ctx.translate(x, y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -15, -10, 30, 35, 5);
    ctx.fill();
    ctx.stroke();
    
    // Belt
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-15, 10, 30, 5);
    
    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Hood
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(0, -22, 16, Math.PI, Math.PI * 2);
    ctx.lineTo(16, -15);
    ctx.lineTo(-16, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    
    // Focused eyes
    ctx.fillStyle = '#16A34A';
    ctx.shadowColor = '#16A34A';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-5, -20, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // Bow
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(22, 0, 18, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();
    
    // Quiver
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-25, -15, 8, 25);
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 2;
    ctx.strokeRect(-25, -15, 8, 25);
    
    ctx.restore();
}

function drawCharacter(ctx, x, y, characterId, colors, time) {
    switch(characterId) {
        case 'warrior':
            drawWarrior(ctx, x, y, colors, time);
            break;
        case 'mage':
            drawMage(ctx, x, y, colors, time);
            break;
        case 'ranger':
            drawRanger(ctx, x, y, colors, time);
            break;
    }
}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

// ========================================
// UI FUNCTIONS
// ========================================

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById('ui').classList.add('hidden');
    document.getElementById('weaponDisplay').classList.add('hidden');
    document.getElementById('bossHpBar').classList.add('hidden');
}

function updateHUD() {
    // Health bar
    const healthPercent = (player.hp / player.maxHp) * 100;
    document.getElementById('healthFill').style.width = healthPercent + '%';
    document.getElementById('healthText').textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;
    
    // Level indicator
    document.getElementById('levelIndicator').textContent = `⭐ Lv.${player.level}`;
    
    // XP bar
    const xpNeeded = player.level * 100;
    const xpPercent = (player.xp / xpNeeded) * 100;
    document.getElementById('xpFill').style.width = xpPercent + '%';
    document.getElementById('xpText').textContent = `${player.xp}/${xpNeeded} XP`;
    
    // Coins
    document.getElementById('coinCount').textContent = player.coins;
    
    // Score, wave, timer
    document.getElementById('score').textContent = `Skor: ${score}`;
    document.getElementById('wave').textContent = `Wave: ${currentWave}`;
    const minutes = Math.floor(survivalTime / 60);
    const seconds = Math.floor(survivalTime % 60);
    document.getElementById('timer').textContent = 
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateWeaponDisplay() {
    const display = document.getElementById('weaponDisplay');
    display.innerHTML = '';
    
    player.weapons.forEach(weapon => {
        const icon = document.createElement('div');
        icon.className = 'weapon-icon';
        icon.innerHTML = `
            ${WEAPONS[weapon.type].icon}
            <div class="weapon-level">Lv.${weapon.level}</div>
        `;
        display.appendChild(icon);
    });
}

function showBossHpBar(boss) {
    const bossBar = document.getElementById('bossHpBar');
    bossBar.classList.remove('hidden');
    
    document.getElementById('bossName').textContent = boss.name;
    updateBossHpBar(boss);
}

function updateBossHpBar(boss) {
    const hpPercent = (boss.hp / boss.maxHp) * 100;
    document.getElementById('bossHpFill').style.width = hpPercent + '%';
    document.getElementById('bossHpText').textContent = `${Math.ceil(boss.hp)}/${boss.maxHp}`;
}

function hideBossHpBar() {
    document.getElementById('bossHpBar').classList.add('hidden');
}

function showWarning(text, duration = 2) {
    const warningsDiv = document.getElementById('warnings');
    const warning = document.createElement('div');
    warning.className = 'warning-text';
    warning.textContent = text;
    warningsDiv.appendChild(warning);
    
    setTimeout(() => {
        warning.remove();
    }, duration * 1000);
}

function showDamageNumber(x, y, damage, isCritical = false) {
    damageNumbers.push({
        x: x,
        y: y,
        value: Math.floor(damage),
        timer: 0.8,
        vy: -50,
        color: isCritical ? '#FBBF24' : '#FFF',
        size: isCritical ? 24 : 18,
        isCritical: isCritical
    });
}

function showCoinNumber(x, y, amount) {
    damageNumbers.push({
        x: x,
        y: y,
        value: `+${amount}💰`,
        timer: 0.6,
        vy: -40,
        color: '#FBBF24',
        size: 16,
        isCoin: true
    });
}

// ========================================
// GAME SETUP & INITIALIZATION
// ========================================

function setupGame() {
    // Event listeners
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;
        
        if (e.key === ' ' || e.key === 'Escape') {
            e.preventDefault();
            if (gameState === 'playing') {
                pauseGame();
            } else if (gameState === 'paused') {
                resumeGame();
            } else if (gameState === 'shop') {
                closeShop();
            }
        }
        
        if (e.key.toLowerCase() === 'b' && (gameState === 'playing' || gameState === 'paused')) {
            if (canOpenShop()) {
                openShop();
            }
        }
    });
    
    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });
    
    // Menu buttons
    document.getElementById('playBtn').addEventListener('click', () => {
        initAudio();
        showCharacterSelect();
    });
    
    document.getElementById('backToMenuFromCharSelect').addEventListener('click', () => {
        showMainMenu();
    });
    
    // Character select buttons
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const characterId = btn.dataset.character;
            selectCharacter(characterId);
        });
    });
    
    // Character card hover effects
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            renderCharacterPreview(card.dataset.character);
        });
    });
    
    document.getElementById('startBtn').addEventListener('click', () => {
        startGame();
    });
    
    document.getElementById('backToMenuFromStart').addEventListener('click', () => {
        showMainMenu();
    });
    
    // Shop button
    document.getElementById('shopButton').addEventListener('click', () => {
        if (canOpenShop()) {
            openShop();
        }
    });
    
    document.getElementById('closeShopBtn').addEventListener('click', () => {
        closeShop();
    });
    
    // Shop tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderShopItems(btn.dataset.tab);
        });
    });
    
    // Purchase confirmation
    document.getElementById('confirmPurchase').addEventListener('click', () => {
        completePurchase();
        document.getElementById('purchaseConfirmation').classList.add('hidden');
    });
    
    document.getElementById('cancelPurchase').addEventListener('click', () => {
        document.getElementById('purchaseConfirmation').classList.add('hidden');
    });
    
    // Pause buttons
    document.getElementById('resumeBtn').addEventListener('click', () => {
        resumeGame();
    });
    
    document.getElementById('openShopFromPause').addEventListener('click', () => {
        if (canOpenShop()) {
            openShop();
        }
    });
    
    document.getElementById('pauseMenuBtn').addEventListener('click', () => {
        showMainMenu();
    });
    
    // Game over buttons
    document.getElementById('restartBtn').addEventListener('click', () => {
        showCharacterSelect();
    });
    
    document.getElementById('gameOverMenuBtn').addEventListener('click', () => {
        showMainMenu();
    });
    
    // Settings & other buttons
    document.getElementById('settingsBtn').addEventListener('click', () => {
        hideAllScreens();
        document.getElementById('settingsScreen').classList.remove('hidden');
    });
    
    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
        showMainMenu();
    });
    
    document.getElementById('settingsBackBtn').addEventListener('click', () => {
        showMainMenu();
    });
    
    document.getElementById('howToPlayBtn').addEventListener('click', () => {
        hideAllScreens();
        document.getElementById('howToPlayScreen').classList.remove('hidden');
    });
    
    document.getElementById('howToPlayBackBtn').addEventListener('click', () => {
        showMainMenu();
    });
    
    document.getElementById('highScoresBtn').addEventListener('click', () => {
        hideAllScreens();
        document.getElementById('highScoresScreen').classList.remove('hidden');
        displayHighScores();
    });
    
    document.getElementById('highScoresBackBtn').addEventListener('click', () => {
        showMainMenu();
    });
    
    document.getElementById('soundToggle').addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        document.getElementById('soundToggle').textContent = soundEnabled ? '🔊 ON' : '🔇 OFF';
    });
}

function showMainMenu() {
    gameState = 'menu';
    hideAllScreens();
    document.getElementById('mainMenu').classList.remove('hidden');
}

function showCharacterSelect() {
    gameState = 'character_select';
    hideAllScreens();
    document.getElementById('characterSelectScreen').classList.remove('hidden');
    
    // Render character previews
    renderCharacterPreview('warrior');
    renderCharacterPreview('mage');
    renderCharacterPreview('ranger');
}

function renderCharacterPreview(characterId) {
    const previewDiv = document.getElementById(`${characterId}Preview`);
    if (!previewDiv) return;
    
    previewDiv.innerHTML = '';
    
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    const charData = CHARACTERS[characterId];
    drawCharacter(ctx, 75, 100, characterId, charData.colors, Date.now());
    
    previewDiv.appendChild(canvas);
}

function selectCharacter(characterId) {
    selectedCharacter = characterId;
    
    // Visual feedback
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    document.querySelector(`[data-character="${characterId}"]`).classList.add('selected');
    
    // Show start screen
    setTimeout(() => {
        gameState = 'start';
        hideAllScreens();
        document.getElementById('startScreen').classList.remove('hidden');
        
        const charName = CHARACTERS[characterId].name;
        document.getElementById('selectedCharacterDisplay').textContent = `Karakter: ${charName}`;
    }, 300);
}

function showStartScreen() {
    hideAllScreens();
    document.getElementById('startScreen').classList.remove('hidden');
}

// ========================================
// GAME START & RESET
// ========================================

function startGame() {
    if (!selectedCharacter) {
        alert('Pilih karakter terlebih dahulu!');
        return;
    }
    
    // Initialize player
    const charData = CHARACTERS[selectedCharacter];
    player.character = selectedCharacter;
    player.colors = charData.colors;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.hp = 100;
    player.maxHp = 100;
    player.speed = 200;
    player.defense = charData.baseDefense || 0; // Use character's base defense
    player.damageReduction = 0;
    player.attackSpeedMult = 1.0;
    player.baseDamage = 10;
    player.pickupRange = 50;
    player.xp = 0;
    player.level = 1;
    player.coins = 0;
    player.weapons = [createWeapon(charData.startingWeapon)];
    player.upgrades = {};
    player.invincibleTimer = 0;
    player.hpRegen = 0;
    player.lifesteal = 0;
    player.critChance = 0;
    player.critMultiplier = 1.5;
    player.xpMultiplier = 1.0;
    player.hasExtraLife = false;
    player.weaponIndex = 0;
    player.lastAttackTime = 0;
    
    // Reset game state
    enemies = [];
    projectiles = [];
    xpOrbs = [];
    coins = [];
    damageNumbers = [];
    warnings = [];
    particles = [];
    playerTrail = [];
    
    score = 0;
    currentWave = 1;
    waveTimer = 0;
    restTimer = 0;
    survivalTime = 0;
    enemiesKilled = 0;
    bossesDefeated = 0;
    activeBoss = null;
    lastSpawnTime = 0;
    spawnRate = getSpawnRateForWave(currentWave);
    gameTime = 0;
    lastTime = performance.now();
    waveCompletedWarningShown = false; // Reset warning flag
    
    // Hide all screens
    hideAllScreens();
    
    // Show HUD
    document.getElementById('ui').classList.remove('hidden');
    document.getElementById('weaponDisplay').classList.remove('hidden');
    updateWeaponDisplay();
    
    // Start countdown
    gameState = 'countdown';
    countdownValue = 3;

    const countdownInterval = setInterval(() => {
        if (countdownValue > 0) {
            countdownValue--;
            if (countdownValue > 0) {
                playSound(440, 0.2, 'sine', 0.1);
            }
        } else {
            clearInterval(countdownInterval);
            playSound(880, 0.3, 'sine', 0.15);
            gameState = 'playing';
            countdownValue = 0;
        }
    }, 1000);
}

function createWeapon(weaponType) {
    const weaponData = WEAPONS[weaponType];
    return {
        type: weaponType,
        name: weaponData.name,
        damage: weaponData.damage,
        attackSpeed: weaponData.attackSpeed,
        range: weaponData.range,
        level: 1
    };
}

function resetGame() {
    selectedCharacter = null;
    gameState = 'menu';
    hideAllScreens();
    showMainMenu();
}

// ========================================
// GAME LOOP
// ========================================

function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);
    
    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
    lastTime = currentTime;
    
    if (gameState === 'playing') {
        gameTime += deltaTime;
        survivalTime += deltaTime;
        waveTimer += deltaTime;

        updatePlayer(deltaTime);
        updateWeapons(deltaTime);
        updateEnemies(deltaTime);
        updateProjectiles(deltaTime);
        updateXpOrbs(deltaTime);
        updateCoins(deltaTime);
        updateDamageNumbers(deltaTime);
        checkCollisions();
        checkWaveProgress();
        updateHUD();
        updateWeaponDisplay();

        render();
    } else if (gameState === 'wave_rest') {
        // Allow updating during rest phase to handle remaining enemies
        updatePlayer(deltaTime);
        updateWeapons(deltaTime);
        updateEnemies(deltaTime);
        updateProjectiles(deltaTime);
        updateXpOrbs(deltaTime);
        updateCoins(deltaTime);
        updateDamageNumbers(deltaTime);
        checkCollisions();
        updateWaveRest(deltaTime);
        updateHUD();
        updateWeaponDisplay();

        render();
    } else if (gameState === 'paused' || gameState === 'shop' || gameState === 'level_up') {
        // Still render but don't update game logic
        render();
    }
}

// ========================================
// PLAYER UPDATE
// ========================================

function updatePlayer(deltaTime) {
    // Movement
    let dx = 0;
    let dy = 0;
    
    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
    }
    
    player.x += dx * player.speed * deltaTime;
    player.y += dy * player.speed * deltaTime;
    
    // Keep player in bounds
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));
    
    // Update invincibility timer
    if (player.invincibleTimer > 0) {
        player.invincibleTimer -= deltaTime;
    }
    
    // HP regeneration
    if (player.hpRegen > 0 && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + player.hpRegen * deltaTime);
    }
    
    // Update player trail
    if (dx !== 0 || dy !== 0) {
        playerTrail.push({
            x: player.x,
            y: player.y,
            timer: 0.3
        });
        
        if (playerTrail.length > 10) {
            playerTrail.shift();
        }
    }
    
    // Update player trail timer
    playerTrail.forEach((pos, index) => {
        pos.timer -= deltaTime;
        if (pos.timer <= 0) {
            playerTrail.splice(index, 1);
        }
    });
}

// ========================================
// WEAPON & AUTO-ATTACK SYSTEM
// ========================================

function updateWeapons(deltaTime) {
    if (player.weapons.length === 0) return;
    
    const currentTime = performance.now();
    const weapon = player.weapons[player.weaponIndex];
    const weaponData = WEAPONS[weapon.type];
    
    // Check if can attack
    const attackCooldown = 1000 / (weaponData.attackSpeed * player.attackSpeedMult);
    
    if (currentTime - player.lastAttackTime >= attackCooldown) {
        // Find target
        const target = findNearestEnemy(weaponData.range);
        
        if (target) {
            fireWeapon(weapon, weaponData, target);
            player.lastAttackTime = currentTime;
            
            // Cycle to next weapon
            player.weaponIndex = (player.weaponIndex + 1) % player.weapons.length;
        }
    }
}

function findNearestEnemy(range) {
    let nearest = null;
    let nearestDistance = range;
    
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearest = enemy;
        }
    });
    
    return nearest;
}

function fireWeapon(weapon, weaponData, target) {
    switch(weaponData.projectileType) {
        case 'melee':
            fireMeleeAttack(weapon, weaponData, target);
            break;
        case 'homing':
            fireHomingProjectile(weapon, weaponData, target);
            break;
        case 'piercing':
            firePiercingProjectile(weapon, weaponData, target);
            break;
        case 'aoe':
            fireAoeProjectile(weapon, weaponData, target);
            break;
        case 'chain':
            fireChainProjectile(weapon, weaponData, target);
            break;
        case 'slow':
            fireSlowProjectile(weapon, weaponData, target);
            break;
    }
    
    playSound(300 + Math.random() * 200, 0.15, 'square', 0.08);
}

function fireMeleeAttack(weapon, weaponData, target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    const arcAngle = weaponData.arcAngle || Math.PI / 3; // Default 60 degrees, Warrior sword has 90 degrees
    
    // Damage all enemies in arc
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const enemyAngle = Math.atan2(dy, dx);
        
        let angleDiff = Math.abs(enemyAngle - angle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
        
        if (distance <= weaponData.range && angleDiff < arcAngle / 2) {
            damageEnemy(enemy, weapon.damage);
        }
    });
    
    // Add slash effect
    particles.push({
        x: player.x,
        y: player.y,
        angle: angle,
        range: weaponData.range,
        arc: arcAngle,
        timer: 0.2,
        maxTimer: 0.2,
        type: 'slash'
    });
}

function fireHomingProjectile(weapon, weaponData, target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    
    projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * weaponData.speed,
        vy: Math.sin(angle) * weaponData.speed,
        damage: weapon.damage,
        range: weaponData.range,
        traveled: 0,
        type: 'homing',
        target: target,
        homingStrength: 2,
        speed: weaponData.speed,
        color: '#06B6D4',
        size: 8,
        trail: [],
        weaponType: weapon.type
    });
}

function firePiercingProjectile(weapon, weaponData, target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    
    projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * weaponData.speed,
        vy: Math.sin(angle) * weaponData.speed,
        damage: weapon.damage,
        range: weaponData.range,
        traveled: 0,
        type: 'piercing',
        hitEnemies: [],
        speed: weaponData.speed,
        color: '#92400E',
        size: 5,
        trail: [],
        weaponType: weapon.type
    });
}

function fireAoeProjectile(weapon, weaponData, target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    
    projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * weaponData.speed,
        vy: Math.sin(angle) * weaponData.speed,
        damage: weapon.damage,
        range: weaponData.range,
        traveled: 0,
        type: 'aoe',
        aoeRadius: 60,
        aoeDuration: 2,
        speed: weaponData.speed,
        color: '#EF4444',
        size: 10,
        trail: [],
        weaponType: weapon.type
    });
}

function fireChainProjectile(weapon, weaponData, target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    
    projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * weaponData.speed,
        vy: Math.sin(angle) * weaponData.speed,
        damage: weapon.damage,
        range: weaponData.range,
        traveled: 0,
        type: 'chain',
        chainCount: weaponData.chainCount || 3,
        speed: weaponData.speed,
        color: '#FBBF24',
        size: 7,
        trail: [],
        weaponType: weapon.type
    });
}

function fireSlowProjectile(weapon, weaponData, target) {
    const angle = Math.atan2(target.y - player.y, target.x - player.x);
    
    projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(angle) * weaponData.speed,
        vy: Math.sin(angle) * weaponData.speed,
        damage: weapon.damage,
        range: weaponData.range,
        traveled: 0,
        type: 'slow',
        slowAmount: weaponData.slowAmount || 0.3,
        slowDuration: 2,
        speed: weaponData.speed,
        color: '#3B82F6',
        size: 8,
        trail: [],
        weaponType: weapon.type
    });
}

// ========================================
// ENEMY UPDATE
// ========================================

function updateEnemies(deltaTime) {
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        
        if (enemy.isDying) {
            enemy.deathTimer -= deltaTime;
            if (enemy.deathTimer <= 0) {
                enemies.splice(i, 1);
            }
            continue;
        }
        
        // Move towards player
        const dx = player.x - enemy.x;
        const dy = player.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            const dirX = dx / distance;
            const dirY = dy / distance;
            
            let currentSpeed = enemy.speed;
            if (enemy.slowed) {
                currentSpeed *= (1 - enemy.slowAmount);
                enemy.slowTimer -= deltaTime;
                if (enemy.slowTimer <= 0) {
                    enemy.slowed = false;
                }
            }
            
            enemy.x += dirX * currentSpeed * deltaTime;
            enemy.y += dirY * currentSpeed * deltaTime;
        }
        
        // Update animation
        enemy.animTimer = (enemy.animTimer || 0) + deltaTime;
        
        // Boss abilities
        if (enemy.isBoss) {
            updateBossAbilities(enemy, deltaTime);
        }
    }
}

function updateBossAbilities(boss, deltaTime) {
    if (!boss.ability) return;
    
    boss.abilityTimer = (boss.abilityTimer || 0) + deltaTime;
    
    switch(boss.ability) {
        case 'summon_minions':
            if (boss.abilityTimer >= 10) {
                boss.abilityTimer = 0;
                summonMinionsForBoss(boss);
            }
            break;
            
        case 'fire_breath':
            if (boss.abilityTimer >= 8) {
                boss.abilityTimer = 0;
                bossFireBreath(boss);
            }
            break;
            
        case 'teleport':
            if (boss.abilityTimer >= 6) {
                boss.abilityTimer = 0;
                bossTeleport(boss);
            }
            break;
    }
}

function summonMinionsForBoss(boss) {
    showWarning('⚠ Raja Tengkorak memanggil bala bantuan!', 2);
    playSound(200, 0.5, 'sawtooth', 0.12);
    
    for (let i = 0; i < 5; i++) {
        const enemy = createEnemy('skeleton');
        const angle = Math.random() * Math.PI * 2;
        const distance = 300 + Math.random() * 100;
        enemy.x = player.x + Math.cos(angle) * distance;
        enemy.y = player.y + Math.sin(angle) * distance;
        enemies.push(enemy);
    }
}

function bossFireBreath(boss) {
    showWarning('🔥 Naga Gelap menyemburkan api!', 2);
    playSound(150, 0.6, 'sawtooth', 0.15);
    
    const angle = Math.atan2(player.y - boss.y, player.x - boss.x);
    
    // Create fire zone
    projectiles.push({
        x: boss.x,
        y: boss.y,
        vx: Math.cos(angle) * 100,
        vy: Math.sin(angle) * 100,
        damage: 20,
        range: 250,
        traveled: 0,
        type: 'fire_breath',
        aoeRadius: 80,
        speed: 100,
        color: '#7C3AED',
        size: 20,
        trail: [],
        weaponType: 'boss'
    });
}

function bossTeleport(boss) {
    showWarning('💀 Dewa Kematian teleport!', 2);
    playSound(100, 0.4, 'sine', 0.1);
    
    // Fade out effect could be added here
    const angle = Math.random() * Math.PI * 2;
    const distance = 150;
    boss.x = player.x + Math.cos(angle) * distance;
    boss.y = player.y + Math.sin(angle) * distance;
}

// ========================================
// PROJECTILE UPDATE
// ========================================

function updateProjectiles(deltaTime) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const proj = projectiles[i];
        
        // Move projectile
        proj.x += proj.vx * deltaTime;
        proj.y += proj.vy * deltaTime;
        proj.traveled += Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy) * deltaTime;
        
        // Trail effect
        proj.trail.push({ x: proj.x, y: proj.y, timer: 0.3 });
        proj.trail.forEach(t => t.timer -= deltaTime);
        proj.trail = proj.trail.filter(t => t.timer > 0);
        
        // Check if exceeded range
        if (proj.traveled > proj.range) {
            if (proj.type === 'aoe') {
                // Explode
                explodeAoe(proj);
            }
            projectiles.splice(i, 1);
            continue;
        }
        
        // Homing logic
        if (proj.type === 'homing' && proj.target && enemies.includes(proj.target)) {
            const angle = Math.atan2(proj.target.y - proj.y, proj.target.x - proj.x);
            proj.vx += Math.cos(angle) * proj.homingStrength;
            proj.vy += Math.sin(angle) * proj.homingStrength;
            
            // Normalize speed
            const speed = Math.sqrt(proj.vx * proj.vx + proj.vy * proj.vy);
            if (speed > proj.speed) {
                proj.vx = (proj.vx / speed) * proj.speed;
                proj.vy = (proj.vy / speed) * proj.speed;
            }
        }
        
        // Check collision with enemies
        for (let j = enemies.length - 1; j >= 0; j--) {
            const enemy = enemies[j];
            if (enemy.isDying) continue;
            
            // Skip if already hit (for piercing)
            if (proj.hitEnemies && proj.hitEnemies.includes(enemy)) continue;
            
            const dx = enemy.x - proj.x;
            const dy = enemy.y - proj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < enemy.size + proj.size) {
                // Hit!
                let damage = proj.damage;
                let isCritical = false;
                
                // Check critical hit
                if (Math.random() < player.critChance) {
                    damage *= player.critMultiplier;
                    isCritical = true;
                }
                
                damageEnemy(enemy, damage);
                showDamageNumber(enemy.x, enemy.y - 20, damage, isCritical);
                
                // Apply lifesteal
                if (player.lifesteal > 0) {
                    player.hp = Math.min(player.maxHp, player.hp + damage * player.lifesteal);
                }
                
                // Apply slow
                if (proj.type === 'slow') {
                    enemy.slowed = true;
                    enemy.slowAmount = proj.slowAmount;
                    enemy.slowTimer = proj.slowDuration;
                }
                
                if (proj.type === 'piercing') {
                    proj.hitEnemies.push(enemy);
                } else if (proj.type === 'chain') {
                    // Chain to nearby enemies
                    chainLightning(proj, enemy);
                    projectiles.splice(i, 1);
                } else {
                    projectiles.splice(i, 1);
                }
                
                break;
            }
        }
    }
}

function explodeAoe(proj) {
    showWarning('🔥', 0.5);
    
    enemies.forEach(enemy => {
        if (enemy.isDying) return;
        
        const dx = enemy.x - proj.x;
        const dy = enemy.y - proj.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < proj.aoeRadius) {
            damageEnemy(enemy, proj.damage);
            showDamageNumber(enemy.x, enemy.y - 20, proj.damage);
        }
    });
    
    // Add explosion particle
    particles.push({
        x: proj.x,
        y: proj.y,
        radius: proj.aoeRadius,
        timer: 0.5,
        maxTimer: 0.5,
        type: 'explosion',
        color: proj.color
    });
}

function chainLightning(proj, sourceEnemy) {
    let currentTarget = sourceEnemy;
    let chainsLeft = proj.chainCount - 1; // Already hit first enemy
    
    // Damage source enemy
    damageEnemy(sourceEnemy, proj.damage);
    showDamageNumber(sourceEnemy.x, sourceEnemy.y - 20, proj.damage);
    
    // Chain to nearby enemies
    while (chainsLeft > 0) {
        let nearestEnemy = null;
        let nearestDistance = 150; // Chain range
        
        enemies.forEach(enemy => {
            if (enemy.isDying || enemy === sourceEnemy) return;
            if (proj.hitEnemies && proj.hitEnemies.includes(enemy)) return;
            
            const dx = enemy.x - currentTarget.x;
            const dy = enemy.y - currentTarget.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearestEnemy = enemy;
            }
        });
        
        if (nearestEnemy) {
            damageEnemy(nearestEnemy, proj.damage * 0.8); // 80% damage for chains
            showDamageNumber(nearestEnemy.x, nearestEnemy.y - 20, proj.damage * 0.8);
            
            if (!proj.hitEnemies) proj.hitEnemies = [];
            proj.hitEnemies.push(nearestEnemy);
            
            currentTarget = nearestEnemy;
            chainsLeft--;
        } else {
            break;
        }
    }
}

// ========================================
// ENEMY SPAWNING & WAVE SYSTEM
// ========================================

function checkWaveProgress() {
    if (waveTimer >= waveDuration) {
        // Wave complete - check if there are still enemies alive
        const aliveEnemies = enemies.filter(e => !e.isDying);

        if (aliveEnemies.length === 0) {
            // All enemies dead, start rest phase
            waveCompletedWarningShown = false; // Reset flag
            if (currentWave % 5 === 0 && !activeBoss) {
                // Spawn boss
                spawnBoss(currentWave);
            } else {
                // Start rest phase
                gameState = 'wave_rest';
                restTimer = restDuration;
                showWarning(`⏰ Wave ${currentWave} selesai! Siap ke wave berikutnya...`, 2);
            }
            waveTimer = 0; // Reset timer untuk mencegah trigger berulang
        } else {
            // There are still enemies alive - wait for them to be defeated
            // Show a message to clear remaining enemies (only once)
            if (!waveCompletedWarningShown) {
                showWarning(`⚠️ Bersihkan ${aliveEnemies.length} musuh tersisa untuk melanjutkan!`, 3);
                waveCompletedWarningShown = true;
            }
            // Don't reset waveTimer, keep it at waveDuration to prevent spawning new enemies
            waveTimer = waveDuration;
        }
    }

    // Spawn enemies (only if wave timer hasn't exceeded duration)
    const currentTime = performance.now();
    if (currentTime - lastSpawnTime >= spawnRate && waveTimer < waveDuration) {
        spawnEnemy();
        lastSpawnTime = currentTime;
    }
}

function getSpawnRateForWave(wave) {
    if (wave <= 3) return 2000;
    if (wave <= 6) return 1500;
    if (wave <= 10) return 1000;
    if (wave <= 15) return 800;
    if (wave <= 20) return 600;
    return 500;
}

function spawnEnemy() {
    const enemyType = getRandomEnemyType();
    const enemy = createEnemy(enemyType);
    
    // Random spawn position from edges
    const side = Math.floor(Math.random() * 4);
    const padding = 50;
    
    switch(side) {
        case 0: // Top
            enemy.x = Math.random() * canvas.width;
            enemy.y = -padding;
            break;
        case 1: // Right
            enemy.x = canvas.width + padding;
            enemy.y = Math.random() * canvas.height;
            break;
        case 2: // Bottom
            enemy.x = Math.random() * canvas.width;
            enemy.y = canvas.height + padding;
            break;
        case 3: // Left
            enemy.x = -padding;
            enemy.y = Math.random() * canvas.height;
            break;
    }
    
    enemies.push(enemy);
}

function getRandomEnemyType() {
    const roll = Math.random();
    
    if (currentWave <= 5) {
        // Only basic enemies
        if (roll < 0.5) return 'slime';
        if (roll < 0.8) return 'skeleton';
        return 'bat';
    } else if (currentWave <= 10) {
        // 20% elite
        if (roll < 0.2) {
            const elites = ['armored_slime', 'skeleton_warrior', 'ghost'];
            return elites[Math.floor(Math.random() * elites.length)];
        }
        if (roll < 0.5) return 'slime';
        if (roll < 0.8) return 'skeleton';
        return 'bat';
    } else {
        // 40% elite
        if (roll < 0.4) {
            const elites = ['armored_slime', 'skeleton_warrior', 'ghost'];
            return elites[Math.floor(Math.random() * elites.length)];
        }
        if (roll < 0.6) return 'slime';
        if (roll < 0.8) return 'skeleton';
        return 'bat';
    }
}

function createEnemy(type) {
    const baseData = ENEMY_TYPES[type];
    const scalingFactor = 1 + (currentWave - 1) * 0.10; // 10% per wave
    
    return {
        type: type,
        name: baseData.name,
        hp: baseData.baseHp * scalingFactor,
        maxHp: baseData.baseHp * scalingFactor,
        speed: baseData.baseSpeed * (1 + (currentWave - 1) * 0.02),
        damage: baseData.baseDamage * (1 + (currentWave - 1) * 0.05),
        xpValue: baseData.xpValue,
        coinValue: baseData.coinValue,
        coinChance: baseData.coinChance,
        size: baseData.size,
        color: baseData.color,
        behavior: baseData.behavior,
        isElite: baseData.isElite || false,
        isBoss: false,
        isDying: false,
        deathTimer: 0,
        slowed: false,
        slowAmount: 0,
        slowTimer: 0,
        animTimer: 0
    };
}

function spawnBoss(wave) {
    const bossData = BOSSES[wave];
    if (!bossData) return;
    
    const boss = {
        type: bossData.type,
        name: bossData.name,
        hp: bossData.baseHp,
        maxHp: bossData.baseHp,
        speed: bossData.speed,
        damage: bossData.damage,
        xpValue: bossData.xpValue,
        coinValue: bossData.coinValue,
        size: bossData.size,
        color: bossData.color,
        behavior: 'chase',
        isBoss: true,
        isElite: true,
        isDying: false,
        deathTimer: 0,
        ability: bossData.ability,
        abilityTimer: 0,
        animTimer: 0,
        slowed: false,
        slowAmount: 0,
        slowTimer: 0
    };
    
    // Spawn from top
    boss.x = canvas.width / 2;
    boss.y = -100;
    
    enemies.push(boss);
    activeBoss = boss;
    gameState = 'boss_fight';
    
    showBossHpBar(boss);
    showWarning(`⚠️ BOSS: ${boss.name}! ⚠️`, 3);
    playSound(100, 1, 'sawtooth', 0.2);
}

// ========================================
// COLLISION & DAMAGE
// ========================================

function checkCollisions() {
    // Enemy-player collisions
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (enemy.isDying) continue;
        
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < enemy.size + player.width / 2) {
            // Check invincibility
            if (player.invincibleTimer > 0) continue;
            
            // Calculate damage
            let damage = enemy.damage - player.defense;
            damage = Math.max(1, damage);
            damage *= (1 - player.damageReduction);
            damage = Math.ceil(damage);
            
            // Apply damage
            player.hp -= damage;
            player.invincibleTimer = 0.5;
            
            showDamageNumber(player.x, player.y - 40, damage);
            playSound(150, 0.3, 'sawtooth', 0.15);
            
            // Check death
            if (player.hp <= 0) {
                if (player.hasExtraLife) {
                    player.hasExtraLife = false;
                    player.hp = player.maxHp * 0.5;
                    showWarning('💀 Extra Life digunakan!', 2);
                    playSound(440, 0.5, 'sine', 0.15);
                } else {
                    gameOver();
                    return;
                }
            }
        }
    }
}

function damageEnemy(enemy, damage) {
    enemy.hp -= damage;
    
    if (enemy.hp <= 0 && !enemy.isDying) {
        killEnemy(enemy);
    }
}

function killEnemy(enemy) {
    enemy.isDying = true;
    enemy.deathTimer = 0.3;
    
    // Drop XP orb
    xpOrbs.push({
        x: enemy.x,
        y: enemy.y,
        value: enemy.xpValue,
        size: enemy.isBoss ? 12 : (enemy.isElite ? 8 : 6),
        color: enemy.isBoss ? '#A855F7' : (enemy.isElite ? '#3B82F6' : '#22C55E'),
        lifetime: 30,
        timer: 30,
        magnetized: false
    });
    
    // Drop coins
    if (Math.random() < enemy.coinChance) {
        const coinCount = enemy.isBoss ? 5 : (enemy.isElite ? 2 : Math.floor(Math.random() * 3) + 1);
        const coinValue = Math.ceil(enemy.coinValue / coinCount);
        
        for (let i = 0; i < coinCount; i++) {
            coins.push({
                x: enemy.x + (Math.random() - 0.5) * 30,
                y: enemy.y + (Math.random() - 0.5) * 30,
                value: coinValue,
                size: 8,
                lifetime: 45,
                timer: 45,
                magnetized: false
            });
        }
    }
    
    // Update score
    score += Math.floor(enemy.maxHp / 2);
    enemiesKilled++;
    
    // Boss death
    if (enemy.isBoss) {
        bossesDefeated++;
        score += enemy.maxHp; // Bonus score
        activeBoss = null;
        hideBossHpBar();
        
        showWarning(`🎉 ${enemy.name} dikalahkan!`, 2);
        playSound(523, 0.5, 'sine', 0.15);
        
        // Continue to next wave after boss
        setTimeout(() => {
            if (gameState === 'boss_fight') {
                gameState = 'wave_rest';
                restTimer = restDuration;
            }
        }, 2000);
    }
    
    playSound(200, 0.2, 'square', 0.08);
}

// ========================================
// XP & COIN COLLECTION
// ========================================

function updateXpOrbs(deltaTime) {
    for (let i = xpOrbs.length - 1; i >= 0; i--) {
        const orb = xpOrbs[i];
        
        orb.timer -= deltaTime;
        if (orb.timer <= 0) {
            xpOrbs.splice(i, 1);
            continue;
        }
        
        // Check pickup
        const dx = player.x - orb.x;
        const dy = player.y - orb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.pickupRange) {
            orb.magnetized = true;
        }
        
        if (orb.magnetized) {
            const speed = 300;
            const angle = Math.atan2(player.y - orb.y, player.x - orb.x);
            orb.x += Math.cos(angle) * speed * deltaTime;
            orb.y += Math.sin(angle) * speed * deltaTime;
            
            const newDistance = Math.sqrt((player.x - orb.x) ** 2 + (player.y - orb.y) ** 2);
            if (newDistance < 10) {
                // Collected
                player.xp += Math.floor(orb.value * player.xpMultiplier);
                xpOrbs.splice(i, 1);
                playSound(600, 0.1, 'sine', 0.08);
                
                // Check level up
                checkLevelUp();
            }
        }
    }
}

function updateCoins(deltaTime) {
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        
        coin.timer -= deltaTime;
        if (coin.timer <= 0) {
            coins.splice(i, 1);
            continue;
        }
        
        // Check pickup
        const dx = player.x - coin.x;
        const dy = player.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < player.pickupRange) {
            coin.magnetized = true;
        }
        
        if (coin.magnetized) {
            const speed = 300;
            const angle = Math.atan2(player.y - coin.y, player.x - coin.x);
            coin.x += Math.cos(angle) * speed * deltaTime;
            coin.y += Math.sin(angle) * speed * deltaTime;
            
            const newDistance = Math.sqrt((player.x - coin.x) ** 2 + (player.y - coin.y) ** 2);
            if (newDistance < 10) {
                // Collected
                player.coins += coin.value;
                coins.splice(i, 1);
                playSound(800, 0.1, 'sine', 0.1);
                showCoinNumber(player.x, player.y - 20, coin.value);
            }
        }
    }
}

function checkLevelUp() {
    const xpNeeded = player.level * 100;
    
    if (player.xp >= xpNeeded) {
        player.xp -= xpNeeded;
        player.level++;
        
        // Pause and show level up
        gameState = 'level_up';
        
        document.getElementById('levelUpText').textContent = `Level ${player.level - 1} → ${player.level}`;
        generateUpgradeChoices();
        showLevelUpScreen();
        
        playSound(523, 0.2, 'sine', 0.15);
        setTimeout(() => playSound(659, 0.2, 'sine', 0.15), 100);
        setTimeout(() => playSound(784, 0.3, 'sine', 0.15), 200);
    }
}

// ========================================
// LEVEL UP & UPGRADE SYSTEM
// ========================================

function generateUpgradeChoices() {
    const choices = [];
    const available = [...UPGRADE_POOL];
    
    // Pick 3 random upgrades
    while (choices.length < 3 && available.length > 0) {
        const index = Math.floor(Math.random() * available.length);
        choices.push(available.splice(index, 1)[0]);
    }
    
    renderUpgradeChoices(choices);
}

function renderUpgradeChoices(choices) {
    const container = document.getElementById('upgradeChoices');
    container.innerHTML = '';
    
    choices.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = `upgrade-card ${upgrade.rarity}`;
        card.innerHTML = `
            <div class="upgrade-icon">${upgrade.icon}</div>
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <button class="upgrade-btn">PILIH</button>
        `;
        
        card.querySelector('.upgrade-btn').addEventListener('click', () => {
            applyUpgrade(upgrade);
            document.getElementById('levelUpScreen').classList.add('hidden');
            gameState = 'playing';
            lastTime = performance.now();
        });
        
        container.appendChild(card);
    });
}

function applyUpgrade(upgrade) {
    upgrade.effect(player);
    playSound(440, 0.3, 'sine', 0.12);
}

function showLevelUpScreen() {
    document.getElementById('levelUpScreen').classList.remove('hidden');
}

// ========================================
// SHOP SYSTEM
// ========================================

function canOpenShop() {
    return gameState === 'playing' || gameState === 'paused' || gameState === 'wave_rest';
}

let currentShopTab = 'weapons';
let pendingPurchase = null;

function openShop() {
    gameState = 'shop';

    // Jangan hide all screens, cukup hide menu screens saja
    document.querySelectorAll('.screen').forEach(screen => {
        if (!screen.id.includes('ui') && !screen.id.includes('weaponDisplay')) {
            screen.classList.add('hidden');
        }
    });
    
    document.getElementById('shopScreen').classList.remove('hidden');
    
    // Pastikan HUD tetap visible
    document.getElementById('ui').classList.remove('hidden');
    document.getElementById('weaponDisplay').classList.remove('hidden');

    updateShopCoinDisplay();
    renderShopItems('weapons');

    // Reset tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === 'weapons') btn.classList.add('active');
    });
    currentShopTab = 'weapons';
}

function closeShop() {
    if (gameState === 'shop') {
        gameState = 'playing';
        document.getElementById('shopScreen').classList.add('hidden');
        
        // Pastikan HUD tetap visible
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('weaponDisplay').classList.remove('hidden');
        
        lastTime = performance.now();
    }
}

function updateShopCoinDisplay() {
    document.getElementById('shopCoinCount').textContent = player.coins;
}

function renderShopItems(tab) {
    currentShopTab = tab || currentShopTab;
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';
    
    const items = SHOP_ITEMS[currentShopTab];
    
    items.forEach(item => {
        const currentLevel = player.upgrades[item.id] || 0;
        const price = Math.floor(item.basePrice * Math.pow(item.priceScaling, currentLevel));
        const canAfford = player.coins >= price;
        const isMaxLevel = currentLevel >= item.maxLevel;
        
        // Check if already owned (for new weapons)
        if (item.isNewWeapon && player.weapons.find(w => w.type === item.weaponType)) {
            return;
        }
        
        const card = document.createElement('div');
        card.className = `shop-item-card ${!canAfford && !isMaxLevel ? 'cannot-afford' : ''} ${isMaxLevel ? 'max-level' : ''}`;
        
        card.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-description">${item.description}</div>
            <div class="shop-item-price">
                ${isMaxLevel ? '✅ MAX LEVEL' : `💰 ${price}`}
            </div>
            <div class="shop-item-level">
                ${isMaxLevel ? 'Sudah maksimal' : `Level: ${currentLevel}/${item.maxLevel}`}
            </div>
        `;
        
        if (!isMaxLevel && canAfford) {
            card.addEventListener('click', () => showPurchaseConfirmation(item, price, currentLevel));
        }
        
        grid.appendChild(card);
    });
}

function showPurchaseConfirmation(item, price, currentLevel) {
    pendingPurchase = { item, price, currentLevel };
    
    document.getElementById('confirmItemIcon').textContent = item.icon;
    document.getElementById('confirmItemName').textContent = item.name;
    document.getElementById('confirmItemEffect').textContent = item.description;
    document.getElementById('confirmItemPrice').textContent = `💰 ${price}`;
    document.getElementById('confirmItemLevel').textContent = `Level: ${currentLevel} → ${currentLevel + 1}`;
    
    document.getElementById('purchaseConfirmation').classList.remove('hidden');
}

function completePurchase() {
    if (!pendingPurchase) return;
    
    const { item, price, currentLevel } = pendingPurchase;
    
    if (player.coins < price) {
        alert('❌ Koin tidak cukup!');
        return;
    }
    
    // Deduct coins
    player.coins -= price;
    
    // Apply upgrade
    player.upgrades[item.id] = currentLevel + 1;
    applyShopUpgrade(item, currentLevel + 1);
    
    // If new weapon, add to player weapons
    if (item.isNewWeapon) {
        player.weapons.push(createWeapon(item.weaponType));
        updateWeaponDisplay();
    }
    
    // Update UI
    updateShopCoinDisplay();
    renderShopItems();
    
    playSound(523, 0.2, 'sine', 0.12);
    showWarning(`✅ ${item.name} upgraded!`, 1.5);
    
    pendingPurchase = null;
}

function applyShopUpgrade(item, level) {
    const effect = item.effect(level);
    
    if (effect.damageMultiplier) {
        const weapon = player.weapons.find(w => w.type === item.weaponType);
        if (weapon) {
            weapon.damage *= (1 + effect.damageMultiplier);
        }
    }
    
    if (effect.defense) {
        player.defense += effect.defense;
    }
    
    if (effect.damageReduction) {
        player.damageReduction = (player.damageReduction || 0) + effect.damageReduction;
    }
    
    if (effect.speedMultiplier) {
        player.speed *= (1 + effect.speedMultiplier);
    }
    
    if (effect.maxHp) {
        player.maxHp += effect.maxHp;
        player.hp += effect.maxHp;
    }
    
    if (effect.lifesteal) {
        player.lifesteal = (player.lifesteal || 0) + effect.lifesteal;
    }
    
    if (effect.pickupRangeMultiplier) {
        player.pickupRange *= (1 + effect.pickupRangeMultiplier);
    }
    
    if (effect.xpMultiplier) {
        player.xpMultiplier = (player.xpMultiplier || 1) + effect.xpMultiplier;
    }
    
    if (effect.critChance) {
        player.critChance = (player.critChance || 0) + effect.critChance;
    }
    
    if (effect.critMultiplier) {
        player.critMultiplier = (player.critMultiplier || 1.5) + effect.critMultiplier;
    }
    
    if (effect.hpRegen) {
        player.hpRegen = (player.hpRegen || 0) + effect.hpRegen;
    }
    
    if (effect.extraLife) {
        player.hasExtraLife = true;
    }
    
    if (effect.areaDamageMultiplier) {
        player.areaDamageMultiplier = (player.areaDamageMultiplier || 1) + effect.areaDamageMultiplier;
    }
}

// ========================================
// WAVE REST & GAME STATE
// ========================================

function updateWaveRest(deltaTime) {
    restTimer -= deltaTime;

    // Check if there are still enemies alive
    const aliveEnemies = enemies.filter(e => !e.isDying);

    // If all enemies are dead before rest timer ends, can proceed to next wave early
    if (aliveEnemies.length === 0 && restTimer <= 0) {
        // Next wave
        currentWave++;
        waveTimer = 0;
        spawnRate = getSpawnRateForWave(currentWave);
        gameState = 'playing';
        lastTime = performance.now();

        showWarning(`Wave ${currentWave} dimulai!`, 2);
        playSound(440, 0.3, 'sine', 0.12);
    } else if (aliveEnemies.length > 0) {
        // If enemies are still alive during rest, show message and wait
        // Don't proceed to next wave until all enemies are dead
        if (restTimer <= 0) {
            // Reset rest timer to give player more time to clear enemies
            restTimer = 5; // Give 5 more seconds
            showWarning(`⚠️ Bersihkan ${aliveEnemies.length} musuh tersisa!`, 2);
        }
    }
}

function pauseGame() {
    gameState = 'paused';
    hideAllScreens();
    document.getElementById('pauseScreen').classList.remove('hidden');
}

function resumeGame() {
    gameState = 'playing';
    hideAllScreens();
    lastTime = performance.now();
}

function gameOver() {
    gameState = 'game_over';
    
    // Calculate final score
    const finalScore = score + Math.floor(survivalTime);
    
    // Save high score
    saveHighScore(finalScore);
    
    // Show game over screen
    hideAllScreens();
    document.getElementById('gameOverScreen').classList.remove('hidden');
    
    document.getElementById('finalScore').textContent = `Skor: ${finalScore}`;
    
    const minutes = Math.floor(survivalTime / 60);
    const seconds = Math.floor(survivalTime % 60);
    document.getElementById('finalTime').textContent = `Waktu: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('finalWave').textContent = `Wave: ${currentWave}`;
    document.getElementById('finalLevel').textContent = `Level: ${player.level}`;
    document.getElementById('enemiesKilled').textContent = `Musuh Dikalahkan: ${enemiesKilled}`;
    
    // Check high score
    const highScores = getHighScores();
    if (highScores.length > 0 && finalScore >= highScores[0].score) {
        document.getElementById('newHighScore').classList.remove('hidden');
        playSound(523, 0.2, 'sine', 0.15);
        setTimeout(() => playSound(659, 0.2, 'sine', 0.15), 150);
        setTimeout(() => playSound(784, 0.3, 'sine', 0.15), 300);
    } else {
        document.getElementById('newHighScore').classList.add('hidden');
    }
    
    playSound(300, 0.5, 'sine', 0.12);
}

function saveHighScore(score) {
    const highScores = getHighScores();
    
    highScores.push({
        score: score,
        wave: currentWave,
        level: player.level,
        time: survivalTime,
        character: selectedCharacter,
        date: new Date().toISOString()
    });
    
    // Sort by score
    highScores.sort((a, b) => b.score - a.score);
    
    // Keep top 10
    highScores.splice(10);
    
    localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));
}

function getHighScores() {
    const data = localStorage.getItem('survivalGameHighScores');
    return data ? JSON.parse(data) : [];
}

function displayHighScores() {
    const highScores = getHighScores();
    const container = document.getElementById('scoresList');
    
    if (highScores.length === 0) {
        container.innerHTML = '<p class="no-scores">Belum ada skor. Mainkan game untuk mencetak rekor!</p>';
        return;
    }
    
    container.innerHTML = '';
    
    highScores.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = `score-entry ${index === 0 ? 'score-top' : ''}`;
        
        const minutes = Math.floor(entry.time / 60);
        const seconds = Math.floor(entry.time % 60);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        div.innerHTML = `
            <div>
                <div><strong>#${index + 1}</strong> - ${CHARACTERS[entry.character]?.name || 'Unknown'}</div>
                <div style="font-size: 12px; color: #888;">Wave ${entry.wave} • Level ${entry.level} • ${timeStr}</div>
            </div>
            <div style="font-size: 20px; font-weight: bold; color: #FBBF24;">${entry.score}</div>
        `;
        
        container.appendChild(div);
    });
}

// ========================================
// RENDERING
// ========================================

function render() {
    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    drawGrid();
    
    // Draw player trail
    drawPlayerTrail();
    
    // Draw XP orbs
    drawXpOrbs();
    
    // Draw coins
    drawCoins();
    
    // Draw enemies
    drawEnemies();
    
    // Draw projectiles
    drawProjectiles();
    
    // Draw player
    drawPlayer();
    
    // Draw countdown (if in countdown state)
    if (gameState === 'countdown' && countdownValue > 0) {
        drawCountdown();
    }
    
    // Draw wave rest message
    if (gameState === 'wave_rest') {
        const aliveEnemies = enemies.filter(e => !e.isDying);
        if (aliveEnemies.length > 0) {
            drawWaveRestMessage(aliveEnemies.length);
        }
    }
    
    // Draw damage numbers
    drawDamageNumbers();
    
    // Draw particles
    drawParticles();
}

function drawCountdown() {
    const x = player.x;
    const y = player.y - 100; // 100px di atas player
    
    // Background circle
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow effect
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 20;
    
    // Countdown number
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countdownValue.toString(), x, y);
    
    // "GET READY" text di bawah countdown
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('GET READY', x, y + 80);
    
    ctx.restore();
}

function drawWaveRestMessage(enemyCount) {
    const x = canvas.width / 2;
    const y = canvas.height / 2 - 100;
    
    // Blink effect
    const alpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
    
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Background
    const text = `Bersihkan ${enemyCount} musuh tersisa...`;
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - textWidth / 2 - 20, y - 20, textWidth + 40, 40);
    
    // Text
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(text, x, y);
    
    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    const gridSize = 50;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawPlayerTrail() {
    playerTrail.forEach((pos, index) => {
        const alpha = (index / playerTrail.length) * 0.3;
        ctx.fillStyle = player.colors.primary;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, player.width / 3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawPlayer() {
    // Blink effect when invincible
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }
    
    // Level up glow
    if (gameState === 'level_up') {
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 20;
    }
    
    drawCharacter(ctx, player.x, player.y, player.character, player.colors, performance.now());
    
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.isDying) {
            drawDyingEnemy(enemy);
        } else {
            drawEnemy(enemy);
        }
    });
}

function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    
    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.size, enemy.size * 0.8, enemy.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Outline
    ctx.strokeStyle = enemy.isElite ? '#FBBF24' : '#000';
    ctx.lineWidth = enemy.isElite ? 3 : 2;
    ctx.stroke();
    
    // Eyes
    ctx.fillStyle = enemy.isBoss ? '#FF0000' : '#000';
    ctx.beginPath();
    ctx.arc(-enemy.size * 0.3, -enemy.size * 0.2, enemy.size * 0.15, 0, Math.PI * 2);
    ctx.arc(enemy.size * 0.3, -enemy.size * 0.2, enemy.size * 0.15, 0, Math.PI * 2);
    ctx.fill();
    
    // HP bar for elites and bosses
    if (enemy.isElite || enemy.isBoss) {
        const hpPercent = enemy.hp / enemy.maxHp;
        const barWidth = enemy.size * 2;
        const barHeight = 5;
        const barY = -enemy.size - 10;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);
        
        ctx.fillStyle = hpPercent > 0.5 ? '#22C55E' : (hpPercent > 0.25 ? '#FBBF24' : '#EF4444');
        ctx.fillRect(-barWidth / 2, barY, barWidth * hpPercent, barHeight);
    }
    
    // Slow effect indicator
    if (enemy.slowed) {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size + 5, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawDyingEnemy(enemy) {
    const progress = 1 - (enemy.deathTimer / 0.3);
    const alpha = 1 - progress;
    const scale = 1 - progress * 0.5;
    
    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;
    
    drawEnemy({...enemy, isDying: false});
    
    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawProjectiles() {
    projectiles.forEach(proj => {
        // Draw trail
        proj.trail.forEach(t => {
            const alpha = t.timer / 0.3;
            ctx.fillStyle = proj.color;
            ctx.globalAlpha = alpha * 0.5;
            ctx.beginPath();
            ctx.arc(t.x, t.y, proj.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
        
        // Draw projectile
        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function drawXpOrbs() {
    xpOrbs.forEach(orb => {
        const bobY = Math.sin(performance.now() * 0.005) * 3;
        
        ctx.save();
        ctx.translate(orb.x, orb.y + bobY);
        
        // Glow
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 10;
        
        // Orb
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(0, 0, orb.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.shadowBlur = 0;
        ctx.restore();
    });
}

function drawCoins() {
    coins.forEach(coin => {
        const bobY = Math.sin(performance.now() * 0.005) * 3;
        const scaleX = Math.abs(Math.cos(performance.now() * 0.003));
        
        ctx.save();
        ctx.translate(coin.x, coin.y + bobY);
        ctx.scale(scaleX, 1);
        
        // Glow
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 8;
        
        // Coin
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.shadowBlur = 0;
        
        // Dollar sign
        ctx.fillStyle = '#92400E';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);
        
        ctx.restore();
    });
}

function updateDamageNumbers(deltaTime) {
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const num = damageNumbers[i];
        
        num.y += num.vy * deltaTime;
        num.timer -= deltaTime;
        
        if (num.timer <= 0) {
            damageNumbers.splice(i, 1);
        }
    }
}

function drawDamageNumbers() {
    damageNumbers.forEach(num => {
        ctx.fillStyle = num.color;
        ctx.font = `bold ${num.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.min(1, num.timer / 0.5);
        ctx.fillText(num.value, num.x, num.y);
        ctx.globalAlpha = 1;
    });
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        
        particle.timer -= 0.016;
        
        if (particle.timer <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        const alpha = particle.timer / particle.maxTimer;
        
        if (particle.type === 'slash') {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.angle);
            
            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, particle.range, -particle.arc / 2, particle.arc / 2);
            ctx.stroke();
            
            ctx.restore();
        } else if (particle.type === 'explosion') {
            const radius = particle.radius * (1 - alpha * 0.5);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = alpha * 0.5;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
}

// ========================================
// MAIN LOOP & INITIALIZATION
// ========================================

function mainLoop(currentTime) {
    requestAnimationFrame(mainLoop);

    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1);
    lastTime = currentTime;

    if (gameState === 'playing' || gameState === 'boss_fight') {
        gameTime += deltaTime;
        survivalTime += deltaTime;
        waveTimer += deltaTime;

        updatePlayer(deltaTime);
        updateWeapons(deltaTime);
        updateEnemies(deltaTime);
        updateProjectiles(deltaTime);
        updateXpOrbs(deltaTime);
        updateCoins(deltaTime);
        updateDamageNumbers(deltaTime);
        checkCollisions();
        checkWaveProgress();
        
        // Check if wave is over and all enemies are dead
        if (waveTimer >= waveDuration) {
            const aliveEnemies = enemies.filter(e => !e.isDying);
            if (aliveEnemies.length === 0 && !activeBoss) {
                // Start rest phase
                gameState = 'wave_rest';
                restTimer = restDuration;
                waveTimer = 0;
                showWarning(`⏰ Wave ${currentWave} selesai! Siap ke wave berikutnya...`, 2);
            }
        }
        
        updateHUD();
        updateWeaponDisplay();
    } else if (gameState === 'wave_rest') {
        // Check if all enemies are dead
        const aliveEnemies = enemies.filter(e => !e.isDying);
        
        if (aliveEnemies.length === 0) {
            // All enemies dead, countdown starts
            restTimer -= deltaTime;
            
            if (restTimer <= 0) {
                currentWave++;
                waveTimer = 0;
                spawnRate = getSpawnRateForWave(currentWave);
                gameState = 'playing';
                lastTime = currentTime;
                
                showWarning(`Wave ${currentWave} dimulai!`, 2);
                playSound(440, 0.3, 'sine', 0.12);
            }
        }
        // If there are still enemies, wait for them to die before starting countdown
        
        updatePlayer(deltaTime);
        updateEnemies(deltaTime);
        updateProjectiles(deltaTime);
        updateXpOrbs(deltaTime);
        updateCoins(deltaTime);
        updateDamageNumbers(deltaTime);
        checkCollisions();
        updateHUD();
    } else if (gameState === 'countdown') {
        // Update player during countdown
        updatePlayer(deltaTime);
        updateHUD();
    } else if (gameState === 'paused' || gameState === 'level_up') {
        // Still render but don't update game logic
    } else if (gameState === 'shop') {
        // Update HUD during shop (for coin display, etc)
        updateHUD();
    } else if (gameState === 'game_over' || gameState === 'menu' || gameState === 'character_select' || gameState === 'start') {
        // Just render background
    }

    render();
}

// Initialize game
setupGame();
showMainMenu();
lastTime = performance.now();
requestAnimationFrame(mainLoop);
