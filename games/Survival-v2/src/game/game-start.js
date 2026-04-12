// ========================================
// GAME START & RESET
// ========================================

function startGame() {
    if (!selectedCharacter) {
        alert('Pilih karakter terlebih dahulu!');
        return;
    }

    // Initialize audio
    initAudio();

    // Initialize player
    const charData = CHARACTERS[selectedCharacter];
    player.character = selectedCharacter;
    player.colors = charData.colors;
    player.x = canvas.width / 2;
    player.y = canvas.height / 2;
    player.hp = 100 + (charData.baseHpBonus || 0); // Orc has HP bonus
    player.maxHp = 100 + (charData.baseHpBonus || 0);
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
    player.isAttacking = false;
    player.attackTimer = 0;
    player.attackIndex = 0; // Reset attack animation index
    player.facingDirection = { x: 0, y: 1 }; // Default facing down

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

    // Initialize joystick for mobile
    if (isMobileDevice()) {
        showJoystick();
        initJoystick();
    } else {
        hideJoystick();
    }

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
            
            // Start background music
            if (bgMusicEnabled) {
                playFileBackgroundMusic();
            }
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

    // Stop background music
    stopBackgroundMusic();

    // Hide joystick
    hideJoystick();

    hideAllScreens();
    showMainMenu();
}
