function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        gameState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 100,
            vy: (Math.random() - 0.5) * 100 - 50,
            life: 1,
            decay: 0.5 + Math.random() * 1.5,
            size: 2 + Math.random() * 4,
            color: color
        });
    }
}

function spawnAmbientParticles(x, y) {
    if (Math.random() < 0.1) {
        gameState.particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 10,
            vy: -10 - Math.random() * 20,
            life: 1,
            decay: 0.3,
            size: 1 + Math.random() * 2,
            color: '#ffffff'
        });
    }
}

function updateParticles(deltaTime) {
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        const p = gameState.particles[i];
        
        p.x += p.vx * deltaTime;
        p.y += p.vy * deltaTime;
        p.vy += 100 * deltaTime;
        p.life -= p.decay * deltaTime;

        if (p.life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }
}

function renderParticles() {
    for (const p of gameState.particles) {
        const screenX = p.x - camera.x;
        const screenY = p.y - camera.y;

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.globalAlpha = 1;
}
