const GameStates = {
    MENU: 'menu',
    CHARACTER_SELECT: 'character_select',
    PLAYING: 'playing',
    DIALOG: 'dialog',
    INVENTORY: 'inventory',
    QUEST: 'quest',
    CONTROLS: 'controls',
    ABOUT: 'about',
    PAUSED: 'paused',
    LOADING: 'loading'
};

var canvas, ctx;

const gameState = {
    current: GameStates.LOADING,
    selectedCharacter: null,
    player: null,
    npcs: [],
    monsters: [],
    items: [],
    particles: [],
    crystals: [],
    map: null,
    inventory: [],
    gold: 0,
    xp: 0,
    level: 1,
    quests: {},
    monstersDefeated: 0,
    oreCollected: 0,
    gameTime: 0,
    dayTime: 6,
    lastTime: 0,
    animFrame: 0,
    animTimer: 0
};

function changeState(newState) {
    gameState.current = newState;
    updateUIState(newState);
}

function updateUIState(state) {
    const ui = document.getElementById('ui');
    const mainMenu = document.getElementById('mainMenu');
    const characterSelect = document.getElementById('characterSelectScreen');
    const dialogBox = document.getElementById('dialogBox');
    const inventoryScreen = document.getElementById('inventoryScreen');
    const questScreen = document.getElementById('questScreen');
    const controlsScreen = document.getElementById('controlsScreen');
    const aboutScreen = document.getElementById('aboutScreen');
    const minimap = document.getElementById('minimap');
    const mobileButtons = document.getElementById('mobileButtons');
    const loadingScreen = document.getElementById('loadingScreen');

    if (ui) ui.classList.toggle('hidden', state !== GameStates.PLAYING && state !== GameStates.DIALOG);
    if (mainMenu) mainMenu.classList.toggle('hidden', state !== GameStates.MENU);
    if (characterSelect) characterSelect.classList.toggle('hidden', state !== GameStates.CHARACTER_SELECT);
    if (dialogBox) dialogBox.classList.toggle('hidden', state !== GameStates.DIALOG);
    if (inventoryScreen) inventoryScreen.classList.toggle('hidden', state !== GameStates.INVENTORY);
    if (questScreen) questScreen.classList.toggle('hidden', state !== GameStates.QUEST);
    if (controlsScreen) controlsScreen.classList.toggle('hidden', state !== GameStates.CONTROLS);
    if (aboutScreen) aboutScreen.classList.toggle('hidden', state !== GameStates.ABOUT);
    if (minimap) minimap.classList.toggle('hidden', state !== GameStates.PLAYING);
    if (mobileButtons) mobileButtons.classList.toggle('hidden', !isMobile() || state !== GameStates.PLAYING);
    if (loadingScreen) loadingScreen.classList.toggle('hidden', state !== GameStates.LOADING);
}

function isMobile() {
    return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
}

function updateHUD() {
    if (!gameState.player) return;

    const player = gameState.player;
    const data = CHARACTER_DATA[player.characterType];

    document.getElementById('playerName').textContent = data.name;
    document.getElementById('playerLevel').textContent = `Lv.${gameState.level}`;

    const xpNeeded = gameState.level * data.xpToLevel;
    const xpPercent = (gameState.xp / xpNeeded) * 100;
    document.getElementById('xpFill').style.width = xpPercent + '%';
    document.getElementById('xpText').textContent = `${gameState.xp}/${xpNeeded} XP`;

    document.getElementById('goldCount').textContent = gameState.gold;
    document.getElementById('itemCount').textContent = gameState.inventory.length;

    const hours = Math.floor(gameState.dayTime);
    const minutes = Math.floor((gameState.dayTime % 1) * 60);
    const timeIcon = hours >= 6 && hours < 18 ? '☀️' : '🌙';
    document.getElementById('timeDisplay').textContent = `${timeIcon} ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    const activeQuest = Object.keys(gameState.quests).find(q => !gameState.quests[q].completed);
    if (activeQuest && QUEST_DATA[activeQuest]) {
        document.getElementById('questText').textContent = `Quest: ${QUEST_DATA[activeQuest].title}`;
    } else {
        document.getElementById('questText').textContent = 'Quest: -';
    }
}

function addXP(amount) {
    gameState.xp += amount;
    const data = CHARACTER_DATA[gameState.player.characterType];
    const xpNeeded = gameState.level * data.xpToLevel;

    if (gameState.xp >= xpNeeded) {
        gameState.xp -= xpNeeded;
        gameState.level++;
        showNotification(`Level Up! Sekarang level ${gameState.level}!`);
        playLevelUpSound();
        gameState.player.maxHp += 10;
        gameState.player.hp = Math.min(gameState.player.hp + 20, gameState.player.maxHp);
    }
}

function addGold(amount) {
    gameState.gold += amount;
}

function addItem(itemKey) {
    const item = ITEM_DATA[itemKey];
    if (!item) return;

    gameState.inventory.push({ key: itemKey, ...item });
    showNotification(`Mendapatkan ${item.emoji} ${item.name}!`);

    if (itemKey === 'crystal') {
        if (!gameState.quests.find_crystals) {
            gameState.quests.find_crystals = { progress: 0, target: 5, completed: false };
        }
        gameState.quests.find_crystals.progress++;
        if (gameState.quests.find_crystals.progress >= 5) {
            gameState.quests.find_crystals.completed = true;
            addXP(QUEST_DATA.find_crystals.reward.xp);
            addGold(QUEST_DATA.find_crystals.reward.gold);
            showNotification('Quest Complete: Crystal of Light!');
        }
    }

    if (itemKey === 'ore') {
        gameState.oreCollected++;
        if (!gameState.quests.collect_ore) {
            gameState.quests.collect_ore = { progress: 0, target: 8, completed: false };
        }
        gameState.quests.collect_ore.progress = gameState.oreCollected;
        if (gameState.quests.collect_ore.progress >= 8 && !gameState.quests.collect_ore.completed) {
            gameState.quests.collect_ore.completed = true;
            addXP(QUEST_DATA.collect_ore.reward.xp);
            addGold(QUEST_DATA.collect_ore.reward.gold);
            showNotification('Quest Complete: Ore Collector!');
        }
    }
}

function showNotification(text) {
    const notification = document.getElementById('notification');
    const textEl = document.getElementById('notificationText');
    if (notification && textEl) {
        textEl.textContent = text;
        notification.classList.remove('hidden');
        notification.style.animation = 'none';
        notification.offsetHeight;
        notification.style.animation = 'slideIn 0.3s ease-out, fadeOut 0.5s ease-in 2s';
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 2500);
    }
}
