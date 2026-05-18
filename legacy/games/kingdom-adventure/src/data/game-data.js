const TILE_SIZE = 48;
const MAP_WIDTH = 80;
const MAP_HEIGHT = 60;

const TILE_TYPES = {
    GRASS: 0,
    PATH: 1,
    WATER: 2,
    TREE: 3,
    HOUSE: 4,
    BRIDGE: 5,
    FLOWER: 6,
    ROCK: 7,
    FENCE: 8,
    WELL: 9,
    CHEST: 10,
    SIGN: 11
};

const TILE_COLORS = {
    [TILE_TYPES.GRASS]: { base: '#4a7c3f', variant: ['#5a8c4f', '#3a6c2f', '#4a7c3f'] },
    [TILE_TYPES.PATH]: { base: '#c4a45a', variant: ['#b4944a', '#d4b46a', '#c4a45a'] },
    [TILE_TYPES.WATER]: { base: '#3a7abd', variant: ['#4a8acd', '#2a6aad', '#3a7abd'] },
    [TILE_TYPES.TREE]: { base: '#2d5a1e', variant: ['#3d6a2e', '#1d4a0e'] },
    [TILE_TYPES.HOUSE]: { base: '#8b6b4a', variant: ['#9b7b5a', '#7b5b3a'] },
    [TILE_TYPES.BRIDGE]: { base: '#a08050', variant: ['#907040', '#b09060'] },
    [TILE_TYPES.FLOWER]: { base: '#4a7c3f', variant: ['#4a7c3f'] },
    [TILE_TYPES.ROCK]: { base: '#6b6b6b', variant: ['#5b5b5b', '#7b7b7b'] },
    [TILE_TYPES.FENCE]: { base: '#8b7355', variant: ['#7b6345', '#9b8365'] },
    [TILE_TYPES.WELL]: { base: '#5a5a5a', variant: ['#4a4a4a', '#6a6a6a'] },
    [TILE_TYPES.CHEST]: { base: '#8b6914', variant: ['#9b7924', '#7b5904'] },
    [TILE_TYPES.SIGN]: { base: '#8b7355', variant: ['#7b6345'] }
};

const CHARACTER_DATA = {
    knight: {
        name: 'Knight',
        emoji: '⚔️',
        colors: {
            body: '#4a6fa5',
            bodyDark: '#3a5f95',
            bodyLight: '#5a7fb5',
            skin: '#f4c29f',
            skinDark: '#e4b28f',
            helmet: '#888888',
            helmetLight: '#aaaaaa',
            sword: '#cccccc',
            swordHandle: '#8b4513'
        },
        stats: { hp: 150, speed: 2.5, attack: 8 },
        xpToLevel: 100
    },
    mage: {
        name: 'Mage',
        emoji: '🔮',
        colors: {
            body: '#6a3d8f',
            bodyDark: '#5a2d7f',
            bodyLight: '#7a4d9f',
            skin: '#f4c29f',
            skinDark: '#e4b28f',
            hat: '#4a1d6f',
            hatLight: '#5a2d7f',
            staff: '#8b6914',
            staffGem: '#ff44ff'
        },
        stats: { hp: 100, speed: 2.8, attack: 12 },
        xpToLevel: 100
    },
    archer: {
        name: 'Archer',
        emoji: '🏹',
        colors: {
            body: '#3d8b37',
            bodyDark: '#2d7b27',
            bodyLight: '#4d9b47',
            skin: '#f4c29f',
            skinDark: '#e4b28f',
            hood: '#2d5a27',
            hoodLight: '#3d6a37',
            bow: '#8b6914',
            bowString: '#cccccc'
        },
        stats: { hp: 110, speed: 3.5, attack: 7 },
        xpToLevel: 100
    }
};

const NPC_DATA = [
    {
        id: 'elder',
        name: 'Elder Thomas',
        emoji: '👴',
        color: '#8b7355',
        position: { x: 15, y: 20 },
        patrolRadius: 2,
        dialog: [
            { text: 'Selamat datang, petualang! Kerajaan kita sedang dalam bahaya.', choices: null },
            { text: 'Monster-monster mulai muncul dari hutan gelap di timur...', choices: null },
            { text: 'Tolong bantu kami! Temukan 5 Crystal of Light untuk mengusir kegelapan.', choices: null },
            { text: 'Aku akan memberikan hadiah untuk setiap crystal yang kamu kumpulkan.', choices: null }
        ],
        quest: 'find_crystals'
    },
    {
        id: 'merchant',
        name: 'Merchant Luna',
        emoji: '👩‍🦰',
        color: '#d4a574',
        position: { x: 10, y: 30 },
        patrolRadius: 3,
        dialog: [
            { text: 'Hai! Aku Luna, merchant keliling.', choices: null },
            { text: 'Aku punya banyak barang langka! Tapi kamu butuh gold untuk membeli.', choices: null },
            { text: 'Kumpulkan gold dari chest dan monster yang kamu kalahkan!', choices: null }
        ]
    },
    {
        id: 'guard',
        name: 'Guard Marcus',
        emoji: '💂',
        color: '#666666',
        position: { x: 35, y: 15 },
        patrolRadius: 5,
        dialog: [
            { text: 'Berhenti! Area di utara berbahaya.', choices: null },
            { text: 'Monster-monster kuat berkeliaran di sana setelah matahari terbenam.', choices: null },
            { text: 'Pastikan kamu sudah cukup kuat sebelum pergi ke sana!', choices: null }
        ]
    },
    {
        id: 'healer',
        name: 'Healer Elara',
        emoji: '👩‍⚕️',
        color: '#ffffff',
        position: { x: 12, y: 18 },
        patrolRadius: 2,
        dialog: [
            { text: 'Halo, petualang. Apakah kamu terluka?', choices: null },
            { text: 'Tenang, aku akan menyembuhkanmu.', choices: null },
            { text: 'Kunjungi aku kapan saja jika kamu butuh penyembuhan!', choices: null }
        ],
        heals: true
    },
    {
        id: 'blacksmith',
        name: 'Blacksmith Thorin',
        emoji: '🧔',
        color: '#4a4a4a',
        position: { x: 38, y: 28 },
        patrolRadius: 1,
        dialog: [
            { text: 'Hmph! Aku Thorin, pandai besi terbaik di kerajaan.', choices: null },
            { text: 'Kumpulkan ore dari tambang di barat laut, aku akan membuatkan senjata!', choices: null }
        ]
    },
    {
        id: 'farmer',
        name: 'Farmer Joe',
        emoji: '👨‍🌾',
        color: '#8b8b00',
        position: { x: 45, y: 35 },
        patrolRadius: 4,
        dialog: [
            { text: 'Oh, hai! Ladangku diserang monster...', choices: null },
            { text: 'Tolong bantu basmi monster di sekitarku!', choices: null }
        ]
    }
];

const QUEST_DATA = {
    find_crystals: {
        title: 'Crystal of Light',
        description: 'Kumpulkan 5 Crystal of Light yang tersebar di seluruh kerajaan',
        target: 5,
        reward: { gold: 500, xp: 200 }
    },
    defeat_monsters: {
        title: 'Monster Hunter',
        description: 'Kalahkan 10 monster yang mengganggu penduduk',
        target: 10,
        reward: { gold: 300, xp: 150 }
    },
    collect_ore: {
        title: 'Ore Collector',
        description: 'Kumpulkan 8 ore dari area tambang',
        target: 8,
        reward: { gold: 200, xp: 100 }
    }
};

const ITEM_DATA = {
    crystal: { name: 'Crystal of Light', emoji: '💎', color: '#00ffff', type: 'quest' },
    gold_coin: { name: 'Gold Coin', emoji: '🪙', color: '#ffd700', type: 'currency' },
    health_potion: { name: 'Health Potion', emoji: '❤️', color: '#ff4444', type: 'consumable' },
    ore: { name: 'Iron Ore', emoji: '⛏️', color: '#888888', type: 'material' },
    sword: { name: 'Iron Sword', emoji: '⚔️', color: '#cccccc', type: 'weapon' },
    shield: { name: 'Wooden Shield', emoji: '🛡️', color: '#8b6914', type: 'armor' },
    magic_scroll: { name: 'Magic Scroll', emoji: '📜', color: '#ff44ff', type: 'special' }
};

const MONSTER_DATA = {
    slime: {
        name: 'Slime',
        color: '#44cc44',
        hp: 30,
        attack: 5,
        speed: 0.8,
        xp: 15,
        gold: 5,
        size: 0.6
    },
    goblin: {
        name: 'Goblin',
        color: '#6b8e23',
        hp: 50,
        attack: 8,
        speed: 1.2,
        xp: 25,
        gold: 10,
        size: 0.7
    },
    skeleton: {
        name: 'Skeleton',
        color: '#dddddd',
        hp: 70,
        attack: 12,
        speed: 1.0,
        xp: 40,
        gold: 20,
        size: 0.8
    },
    bat: {
        name: 'Bat',
        color: '#4a3050',
        hp: 20,
        attack: 4,
        speed: 1.8,
        xp: 10,
        gold: 3,
        size: 0.4
    },
    boss_dragon: {
        name: 'Dragon',
        color: '#cc2200',
        hp: 500,
        attack: 30,
        speed: 1.5,
        xp: 500,
        gold: 200,
        size: 1.5
    }
};

const SPAWN_POINTS = {
    crystals: [
        { x: 10, y: 10 },
        { x: 60, y: 15 },
        { x: 70, y: 45 },
        { x: 15, y: 50 },
        { x: 40, y: 55 }
    ],
    items: [
        { x: 28, y: 22, item: 'health_potion' },
        { x: 32, y: 30, item: 'health_potion' },
        { x: 50, y: 25, item: 'gold_coin' },
        { x: 55, y: 40, item: 'gold_coin' },
        { x: 18, y: 35, item: 'ore' },
        { x: 12, y: 45, item: 'ore' },
        { x: 65, y: 20, item: 'magic_scroll' }
    ],
    monsters: [
        { x: 55, y: 10, type: 'slime' },
        { x: 60, y: 12, type: 'slime' },
        { x: 65, y: 8, type: 'goblin' },
        { x: 70, y: 15, type: 'goblin' },
        { x: 50, y: 50, type: 'skeleton' },
        { x: 55, y: 52, type: 'skeleton' },
        { x: 60, y: 48, type: 'skeleton' },
        { x: 8, y: 20, type: 'bat' },
        { x: 12, y: 25, type: 'bat' },
        { x: 5, y: 30, type: 'bat' },
        { x: 75, y: 55, type: 'boss_dragon' }
    ]
};
