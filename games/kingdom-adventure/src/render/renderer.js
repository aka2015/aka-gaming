function initRenderer() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameState.current === GameStates.MENU || gameState.current === GameStates.CHARACTER_SELECT) {
        return;
    }

    camera.update();

    const time = gameState.gameTime;
    const dayPhase = getDayPhase();
    const darkness = getDarkness(dayPhase);

    renderMap(dayPhase);
    renderItems(time);
    renderEntities(time);
    renderParticles();

    if (darkness > 0) {
        applyDarkness(darkness, dayPhase);
    }
}

function getDayPhase() {
    const hour = gameState.dayTime;
    if (hour >= 6 && hour < 8) return 'dawn';
    if (hour >= 8 && hour < 17) return 'day';
    if (hour >= 17 && hour < 19) return 'dusk';
    return 'night';
}

function getDarkness(phase) {
    switch (phase) {
        case 'day': return 0;
        case 'dawn': return 0.15;
        case 'dusk': return 0.25;
        case 'night': return 0.45;
        default: return 0;
    }
}

function applyDarkness(alpha, phase) {
    ctx.fillStyle = `rgba(0, 0, 30, ${alpha})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (phase === 'night') {
        const playerScreenX = gameState.player.x * TILE_SIZE - camera.x + TILE_SIZE / 2;
        const playerScreenY = gameState.player.y * TILE_SIZE - camera.y + TILE_SIZE / 2;

        const gradient = ctx.createRadialGradient(playerScreenX, playerScreenY, 0, playerScreenX, playerScreenY, 150);
        gradient.addColorStop(0, 'rgba(0, 0, 30, 0)');
        gradient.addColorStop(1, `rgba(0, 0, 30, ${alpha})`);

        ctx.globalCompositeOperation = 'destination-in';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalCompositeOperation = 'source-over';
    }
}

function clearJustPressed() {
    keysJustPressed.interact = false;
    keysJustPressed.inventory = false;
    keysJustPressed.quest = false;
    keysJustPressed.map = false;
}
