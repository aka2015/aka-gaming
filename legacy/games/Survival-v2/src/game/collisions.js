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
    // Scale damage with wave level: each wave doubles the damage
    // Wave 1 = 1x, Wave 2 = 2x, Wave 3 = 4x, Wave 4 = 8x, etc.
    const waveMultiplier = Math.pow(2, currentWave - 1);
    const scaledDamage = damage * waveMultiplier;

    enemy.hp -= scaledDamage;

    // Show damage number
    damageNumbers.push({
        x: enemy.x,
        y: enemy.y - enemy.size / 2,
        value: Math.round(scaledDamage),
        color: '#FF4444',
        timer: 0.8,
        vy: -80
    });

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
