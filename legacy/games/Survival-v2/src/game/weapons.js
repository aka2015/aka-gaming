// ========================================
// WEAPON & AUTO-ATTACK SYSTEM
// ========================================

function updateWeapons(deltaTime) {
    if (player.weapons.length === 0) return;

    const currentTime = performance.now();
    const weapon = player.weapons[player.weaponIndex];
    const weaponData = WEAPONS[weapon.type];

    // Character-specific attack speed multipliers
    // Warrior: 10x (melee needs to be fast)
    // Mage: 5x (ranged, homing projectiles)
    // Ranger: 5x (ranged, piercing projectiles)
    let speedMultiplier = 10; // Default for Warrior

    if (player.character === 'mage' || player.character === 'ranger') {
        speedMultiplier = 5;
    }

    // Check if can attack
    const attackCooldown = 1000 / (weaponData.attackSpeed * player.attackSpeedMult * speedMultiplier);
    const timeSinceLastAttack = currentTime - player.lastAttackTime;

    if (timeSinceLastAttack >= attackCooldown) {
        // Find target
        const target = findNearestEnemy(weaponData.range);

        if (target) {
            fireWeapon(weapon, weaponData, target);
            player.lastAttackTime = currentTime;
            
            // Set attack animation flag with longer duration to show full animation
            player.isAttacking = true;
            player.attackTimer = 0.7; // Longer duration to show full attack animation (8 frames at 12fps = ~0.67s)
            
            // DEBUG LOG
            console.log(`🔫 ATTACK! Weapon: ${weapon.name}, Target: enemy at ${Math.round(target.x)},${Math.round(target.y)}, AttackTimer: ${player.attackTimer}s`);

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

    // Find all enemies in arc and range
    const enemiesInArc = [];
    
    enemies.forEach(enemy => {
        const dx = enemy.x - player.x;
        const dy = enemy.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const enemyAngle = Math.atan2(dy, dx);

        let angleDiff = Math.abs(enemyAngle - angle);
        if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;

        if (distance <= weaponData.range && angleDiff < arcAngle / 2) {
            enemiesInArc.push(enemy);
        }
    });

    // Sort by distance (closest first) and hit up to 5 enemies
    enemiesInArc.sort((a, b) => {
        const distA = Math.sqrt((a.x - player.x) ** 2 + (a.y - player.y) ** 2);
        const distB = Math.sqrt((b.x - player.x) ** 2 + (b.y - player.y) ** 2);
        return distA - distB;
    });

    const maxHits = 5;
    const hits = enemiesInArc.slice(0, maxHits);
    
    hits.forEach(enemy => {
        damageEnemy(enemy, weapon.damage);
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
        angle: angle,
        damage: weapon.damage,
        range: weaponData.range,
        traveled: 0,
        type: player.character === 'ranger' ? 'arrow' : 'piercing',
        owner: 'player',
        hitEnemies: [],
        speed: weaponData.speed,
        color: player.character === 'ranger' ? '#22C55E' : '#92400E',
        size: player.character === 'ranger' ? 12 : 5,
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
