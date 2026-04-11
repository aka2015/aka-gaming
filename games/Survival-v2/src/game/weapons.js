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
