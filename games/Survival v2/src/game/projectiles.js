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
