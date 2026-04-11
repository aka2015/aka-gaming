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
