// ========================================
// PLAYER UPDATE
// ========================================

function updatePlayer(deltaTime) {
    // Movement
    let dx = 0;
    let dy = 0;

    if (keys['w'] || keys['arrowup']) dy -= 1;
    if (keys['s'] || keys['arrowdown']) dy += 1;
    if (keys['a'] || keys['arrowleft']) dx -= 1;
    if (keys['d'] || keys['arrowright']) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx *= 0.7071;
        dy *= 0.7071;
    }

    player.x += dx * player.speed * deltaTime;
    player.y += dy * player.speed * deltaTime;

    // Keep player in bounds
    player.x = Math.max(player.width / 2, Math.min(canvas.width - player.width / 2, player.x));
    player.y = Math.max(player.height / 2, Math.min(canvas.height - player.height / 2, player.y));

    // Update invincibility timer
    if (player.invincibleTimer > 0) {
        player.invincibleTimer -= deltaTime;
    }

    // HP regeneration
    if (player.hpRegen > 0 && player.hp < player.maxHp) {
        player.hp = Math.min(player.maxHp, player.hp + player.hpRegen * deltaTime);
    }

    // Update player trail
    if (dx !== 0 || dy !== 0) {
        playerTrail.push({
            x: player.x,
            y: player.y,
            timer: 0.3
        });

        if (playerTrail.length > 10) {
            playerTrail.shift();
        }
    }

    // Update player trail timer
    playerTrail.forEach((pos, index) => {
        pos.timer -= deltaTime;
        if (pos.timer <= 0) {
            playerTrail.splice(index, 1);
        }
    });
}
