// ========================================
// SURVIVAL GAME - Main Entry Point
// ========================================

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// ========================================
// MAIN GAME LOOP
// ========================================

function mainLoop(currentTime) {
    requestAnimationFrame(mainLoop);

    const deltaTime = Math.min((currentTime - lastTime) / 1000, 0.1); // Cap at 100ms
    lastTime = currentTime;

    if (gameState === 'playing' || gameState === 'boss_fight') {
        gameTime += deltaTime;
        survivalTime += deltaTime;
        waveTimer += deltaTime;

        updatePlayer(deltaTime);
        updateWeapons(deltaTime);
        updateEnemies(deltaTime);
        updateProjectiles(deltaTime);
        updateXpOrbs(deltaTime);
        updateCoins(deltaTime);
        updateDamageNumbers(deltaTime);
        checkCollisions();
        checkWaveProgress();
        updateHUD();
        updateWeaponDisplay();

        render();
    } else if (gameState === 'wave_rest') {
        // Allow updating during rest phase to handle remaining enemies
        updatePlayer(deltaTime);
        updateWeapons(deltaTime);
        updateEnemies(deltaTime);
        updateProjectiles(deltaTime);
        updateXpOrbs(deltaTime);
        updateCoins(deltaTime);
        updateDamageNumbers(deltaTime);
        checkCollisions();
        updateWaveRest(deltaTime);
        updateHUD();
        updateWeaponDisplay();

        render();
    } else if (gameState === 'countdown') {
        // Update player during countdown
        updatePlayer(deltaTime);
        updateHUD();
        render();
    } else if (gameState === 'paused' || gameState === 'level_up' || gameState === 'shop') {
        // Still render but don't update game logic
        render();
        if (gameState === 'shop') {
            updateShopCoinDisplay();
        }
    } else if (gameState === 'game_over' || gameState === 'menu' || gameState === 'character_select' || gameState === 'start') {
        // Just render background
        render();
    }
}

// ========================================
// INITIALIZE GAME
// ========================================

setupGame();
showMainMenu();
lastTime = performance.now();
requestAnimationFrame(mainLoop);
