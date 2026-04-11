// ========================================
// CHARACTER RENDERING - Drawing character sprites
// ========================================

function drawWarrior(ctx, x, y, colors, time) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body (armor)
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -15, -10, 30, 35, 5);
    ctx.fill();
    ctx.stroke();

    // Gold trim
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    ctx.lineTo(15, 0);
    ctx.stroke();

    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Helmet
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(0, -22, 16, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Eyes
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(-5, -20, 2, 0, Math.PI * 2);
    ctx.arc(5, -20, 2, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, -17, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Sword
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(15, 5);
    ctx.lineTo(25, 20);
    ctx.stroke();

    // Shield
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(-20, 5, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}

function drawMage(ctx, x, y, colors, time) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Robe
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(-18, 30);
    ctx.lineTo(18, 30);
    ctx.lineTo(15, -10);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Wizard hat
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.moveTo(-18, -25);
    ctx.lineTo(0, -50);
    ctx.lineTo(18, -25);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hat brim
    ctx.beginPath();
    ctx.ellipse(0, -25, 20, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing eyes
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(-5, -20, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Staff
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, -30);
    ctx.lineTo(20, 30);
    ctx.stroke();

    // Glowing orb on staff
    const glowIntensity = Math.sin(time * 0.003) * 0.3 + 0.7;
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 15 * glowIntensity;
    ctx.beginPath();
    ctx.arc(20, -35, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Magic particles
    for (let i = 0; i < 5; i++) {
        const angle = (time * 0.002) + (i * Math.PI * 2 / 5);
        const radius = 25 + Math.sin(time * 0.005 + i) * 5;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius - 10;

        ctx.fillStyle = colors.secondary;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.restore();
}

function drawRanger(ctx, x, y, colors, time) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(0, 30, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = colors.primary;
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    roundRect(ctx, -15, -10, 30, 35, 5);
    ctx.fill();
    ctx.stroke();

    // Belt
    ctx.fillStyle = colors.secondary;
    ctx.fillRect(-15, 10, 30, 5);

    // Head
    ctx.fillStyle = colors.skin;
    ctx.beginPath();
    ctx.arc(0, -20, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 3;
    ctx.stroke();

    // Hood
    ctx.fillStyle = colors.primary;
    ctx.beginPath();
    ctx.arc(0, -22, 16, Math.PI, Math.PI * 2);
    ctx.lineTo(16, -15);
    ctx.lineTo(-16, -15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Focused eyes
    ctx.fillStyle = '#16A34A';
    ctx.shadowColor = '#16A34A';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(-5, -20, 2.5, 0, Math.PI * 2);
    ctx.arc(5, -20, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Bow
    ctx.strokeStyle = '#92400E';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(22, 0, 18, -Math.PI * 0.4, Math.PI * 0.4);
    ctx.stroke();

    // Quiver
    ctx.fillStyle = '#78350F';
    ctx.fillRect(-25, -15, 8, 25);
    ctx.strokeStyle = colors.outline;
    ctx.lineWidth = 2;
    ctx.strokeRect(-25, -15, 8, 25);

    ctx.restore();
}

function drawCharacter(ctx, x, y, characterId, colors, time) {
    switch(characterId) {
        case 'warrior':
            drawWarrior(ctx, x, y, colors, time);
            break;
        case 'mage':
            drawMage(ctx, x, y, colors, time);
            break;
        case 'ranger':
            drawRanger(ctx, x, y, colors, time);
            break;
    }
}
