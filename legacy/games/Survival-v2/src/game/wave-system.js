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
                
                // Update background music for wave rest
                updateBackgroundMusicForGameState();
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
    // INCREASED: 5x faster spawn rate
    const currentTime = performance.now();
    const adjustedSpawnRate = spawnRate / 5; // 5x faster
    if (currentTime - lastSpawnTime >= adjustedSpawnRate && waveTimer < waveDuration) {
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
    
    // Update background music for boss fight
    updateBackgroundMusicForGameState();
}
