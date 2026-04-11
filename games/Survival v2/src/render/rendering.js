// ========================================
// RENDERING
// ========================================

function render() {
    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    drawGrid();

    // Draw player trail
    drawPlayerTrail();

    // Draw XP orbs
    drawXpOrbs();

    // Draw coins
    drawCoins();

    // Draw enemies
    drawEnemies();

    // Draw projectiles
    drawProjectiles();

    // Draw player
    drawPlayer();

    // Draw countdown (if in countdown state)
    if (gameState === 'countdown' && countdownValue > 0) {
        drawCountdown();
    }

    // Draw wave rest message
    if (gameState === 'wave_rest') {
        const aliveEnemies = enemies.filter(e => !e.isDying);
        if (aliveEnemies.length > 0) {
            drawWaveRestMessage(aliveEnemies.length);
        }
    }

    // Draw damage numbers
    drawDamageNumbers();

    // Draw particles
    drawParticles();
}

function drawCountdown() {
    const x = player.x;
    const y = player.y - 100; // 100px di atas player

    // Background circle
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, 50, 0, Math.PI * 2);
    ctx.fill();

    // Glow effect
    ctx.shadowColor = '#00FFFF';
    ctx.shadowBlur = 20;

    // Countdown number
    ctx.fillStyle = '#00FFFF';
    ctx.font = 'bold 64px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(countdownValue.toString(), x, y);

    // "GET READY" text di bawah countdown
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#FFF';
    ctx.font = 'bold 24px Arial';
    ctx.fillText('GET READY', x, y + 80);

    ctx.restore();
}

function drawWaveRestMessage(enemyCount) {
    const x = canvas.width / 2;
    const y = canvas.height / 2 - 100;

    // Blink effect
    const alpha = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Background
    const text = `Bersihkan ${enemyCount} musuh tersisa...`;
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(x - textWidth / 2 - 20, y - 20, textWidth + 40, 40);

    // Text
    ctx.fillStyle = '#FBBF24';
    ctx.fillText(text, x, y);

    ctx.restore();
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;

    const gridSize = 50;

    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function drawPlayerTrail() {
    playerTrail.forEach((pos, index) => {
        const alpha = (index / playerTrail.length) * 0.3;
        ctx.fillStyle = player.colors.primary;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, player.width / 3, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function drawPlayer() {
    // Blink effect when invincible
    if (player.invincibleTimer > 0 && Math.floor(player.invincibleTimer * 10) % 2 === 0) {
        ctx.globalAlpha = 0.5;
    }

    // Level up glow
    if (gameState === 'level_up') {
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 20;
    }

    drawCharacter(ctx, player.x, player.y, player.character, player.colors, performance.now());

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
}

function drawEnemies() {
    enemies.forEach(enemy => {
        if (enemy.isDying) {
            drawDyingEnemy(enemy);
        } else {
            drawEnemy(enemy);
        }
    });
}

function drawEnemy(enemy) {
    ctx.save();
    ctx.translate(enemy.x, enemy.y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, enemy.size, enemy.size * 0.8, enemy.size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = enemy.color;
    ctx.beginPath();
    ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = enemy.isElite ? '#FBBF24' : '#000';
    ctx.lineWidth = enemy.isElite ? 3 : 2;
    ctx.stroke();

    // Eyes
    ctx.fillStyle = enemy.isBoss ? '#FF0000' : '#000';
    ctx.beginPath();
    ctx.arc(-enemy.size * 0.3, -enemy.size * 0.2, enemy.size * 0.15, 0, Math.PI * 2);
    ctx.arc(enemy.size * 0.3, -enemy.size * 0.2, enemy.size * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // HP bar for elites and bosses
    if (enemy.isElite || enemy.isBoss) {
        const hpPercent = enemy.hp / enemy.maxHp;
        const barWidth = enemy.size * 2;
        const barHeight = 5;
        const barY = -enemy.size - 10;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(-barWidth / 2, barY, barWidth, barHeight);

        ctx.fillStyle = hpPercent > 0.5 ? '#22C55E' : (hpPercent > 0.25 ? '#FBBF24' : '#EF4444');
        ctx.fillRect(-barWidth / 2, barY, barWidth * hpPercent, barHeight);
    }

    // Slow effect indicator
    if (enemy.slowed) {
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size + 5, 0, Math.PI * 2);
        ctx.stroke();
    }

    ctx.restore();
}

function drawDyingEnemy(enemy) {
    const progress = 1 - (enemy.deathTimer / 0.3);
    const alpha = 1 - progress;
    const scale = 1 - progress * 0.5;

    ctx.save();
    ctx.translate(enemy.x, enemy.y);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    drawEnemy({...enemy, isDying: false});

    ctx.globalAlpha = 1;
    ctx.restore();
}

function drawProjectiles() {
    projectiles.forEach(proj => {
        // Draw trail
        proj.trail.forEach(t => {
            const alpha = t.timer / 0.3;
            ctx.fillStyle = proj.color;
            ctx.globalAlpha = alpha * 0.5;
            ctx.beginPath();
            ctx.arc(t.x, t.y, proj.size * 0.6, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Draw projectile
        ctx.fillStyle = proj.color;
        ctx.shadowColor = proj.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, proj.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function drawXpOrbs() {
    xpOrbs.forEach(orb => {
        const bobY = Math.sin(performance.now() * 0.005) * 3;

        ctx.save();
        ctx.translate(orb.x, orb.y + bobY);

        // Glow
        ctx.shadowColor = orb.color;
        ctx.shadowBlur = 10;

        // Orb
        ctx.fillStyle = orb.color;
        ctx.beginPath();
        ctx.arc(0, 0, orb.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowBlur = 0;
        ctx.restore();
    });
}

function drawCoins() {
    coins.forEach(coin => {
        const bobY = Math.sin(performance.now() * 0.005) * 3;
        const scaleX = Math.abs(Math.cos(performance.now() * 0.003));

        ctx.save();
        ctx.translate(coin.x, coin.y + bobY);
        ctx.scale(scaleX, 1);

        // Glow
        ctx.shadowColor = '#FBBF24';
        ctx.shadowBlur = 8;

        // Coin
        ctx.fillStyle = '#FBBF24';
        ctx.beginPath();
        ctx.arc(0, 0, coin.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#92400E';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.shadowBlur = 0;

        // Dollar sign
        ctx.fillStyle = '#92400E';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('$', 0, 0);

        ctx.restore();
    });
}

function updateDamageNumbers(deltaTime) {
    for (let i = damageNumbers.length - 1; i >= 0; i--) {
        const num = damageNumbers[i];

        num.y += num.vy * deltaTime;
        num.timer -= deltaTime;

        if (num.timer <= 0) {
            damageNumbers.splice(i, 1);
        }
    }
}

function drawDamageNumbers() {
    damageNumbers.forEach(num => {
        ctx.fillStyle = num.color;
        ctx.font = `bold ${num.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.min(1, num.timer / 0.5);
        ctx.fillText(num.value, num.x, num.y);
        ctx.globalAlpha = 1;
    });
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        particle.timer -= 0.016;

        if (particle.timer <= 0) {
            particles.splice(i, 1);
            continue;
        }

        const alpha = particle.timer / particle.maxTimer;

        if (particle.type === 'slash') {
            ctx.save();
            ctx.translate(particle.x, particle.y);
            ctx.rotate(particle.angle);

            ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, particle.range, -particle.arc / 2, particle.arc / 2);
            ctx.stroke();

            ctx.restore();
        } else if (particle.type === 'explosion') {
            const radius = particle.radius * (1 - alpha * 0.5);
            ctx.fillStyle = particle.color;
            ctx.globalAlpha = alpha * 0.5;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }
    }
}
