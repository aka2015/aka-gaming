// ========================================
// XP & COIN COLLECTION
// ========================================

function updateXpOrbs(deltaTime) {
    for (let i = xpOrbs.length - 1; i >= 0; i--) {
        const orb = xpOrbs[i];

        orb.timer -= deltaTime;
        if (orb.timer <= 0) {
            xpOrbs.splice(i, 1);
            continue;
        }

        // Check pickup
        const dx = player.x - orb.x;
        const dy = player.y - orb.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.pickupRange) {
            orb.magnetized = true;
        }

        if (orb.magnetized) {
            const speed = 300;
            const angle = Math.atan2(player.y - orb.y, player.x - orb.x);
            orb.x += Math.cos(angle) * speed * deltaTime;
            orb.y += Math.sin(angle) * speed * deltaTime;

            const newDistance = Math.sqrt((player.x - orb.x) ** 2 + (player.y - orb.y) ** 2);
            if (newDistance < 10) {
                // Collected
                player.xp += Math.floor(orb.value * player.xpMultiplier);
                xpOrbs.splice(i, 1);
                playSound(600, 0.1, 'sine', 0.08);

                // Check level up
                checkLevelUp();
            }
        }
    }
}

function updateCoins(deltaTime) {
    for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];

        coin.timer -= deltaTime;
        if (coin.timer <= 0) {
            coins.splice(i, 1);
            continue;
        }

        // Check pickup
        const dx = player.x - coin.x;
        const dy = player.y - coin.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < player.pickupRange) {
            coin.magnetized = true;
        }

        if (coin.magnetized) {
            const speed = 300;
            const angle = Math.atan2(player.y - coin.y, player.x - coin.x);
            coin.x += Math.cos(angle) * speed * deltaTime;
            coin.y += Math.sin(angle) * speed * deltaTime;

            const newDistance = Math.sqrt((player.x - coin.x) ** 2 + (player.y - coin.y) ** 2);
            if (newDistance < 10) {
                // Collected
                player.coins += coin.value;
                coins.splice(i, 1);
                playSound(800, 0.1, 'sine', 0.1);
                showCoinNumber(player.x, player.y - 20, coin.value);
            }
        }
    }
}

function checkLevelUp() {
    const xpNeeded = player.level * 100;

    if (player.xp >= xpNeeded) {
        player.xp -= xpNeeded;
        player.level++;

        // Pause and show level up
        gameState = 'level_up';

        document.getElementById('levelUpText').textContent = `Level ${player.level - 1} → ${player.level}`;
        generateUpgradeChoices();
        showLevelUpScreen();

        playSound(523, 0.2, 'sine', 0.15);
        setTimeout(() => playSound(659, 0.2, 'sine', 0.15), 100);
        setTimeout(() => playSound(784, 0.3, 'sine', 0.15), 200);
    }
}
