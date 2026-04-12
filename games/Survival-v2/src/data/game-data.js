// ========================================
// GAME DATA - Characters, Weapons, Enemies, Bosses, Upgrades
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
    },
    orc: {
        id: 'orc',
        name: 'Orc',
        description: 'Makhluk kuat dengan damage tinggi dan HP besar',
        startingWeapon: 'basic_sword',
        baseDefense: 5,
        baseHpBonus: 20, // Orc punya HP tambahan
        colors: {
            primary: '#15803D',
            secondary: '#78350F',
            skin: '#4ADE80',
            hair: '#1F2937',
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
