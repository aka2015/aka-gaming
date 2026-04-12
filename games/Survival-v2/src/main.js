// ========================================
// SURVIVAL GAME - Main Entry Point
// ========================================

// iOS Safari fullscreen fix
function setupIOSFullscreen() {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // Add iOS-specific body classes
        document.body.classList.add('ios-device');
        
        // Hide address bar on iOS
        setTimeout(() => {
            window.scrollTo(0, 1);
        }, 100);
        
        // Prevent pull-to-refresh on iOS
        document.body.addEventListener('touchmove', (e) => {
            if (e.target.closest('#gameCanvas')) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // Prevent double-tap zoom on iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = Date.now();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
}

// Call iOS setup immediately
setupIOSFullscreen();

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
// ASSET LOADING SYSTEM
// ========================================

// Loading tips
const LOADING_TIPS = [
    '💡 Tip: Use WASD or Arrow Keys to move',
    '💡 Tip: Attack is automatic!',
    '💡 Tip: Collect XP to level up and choose upgrades',
    '💡 Tip: Collect coins to buy upgrades in the shop',
    '💡 Tip: Press SPACE to pause the game',
    '💡 Tip: Press B to open the shop during rest periods',
    '💡 Tip: Different characters have unique weapons',
    '💡 Tip: Defeat bosses every 5 waves for big rewards',
    '💡 Tip: Choose upgrades wisely to build your strategy',
    '💡 Tip: Survive as long as you can!'
];

// Update loading screen UI
function updateLoadingUI(percent, statusText) {
    const progressBar = document.getElementById('loadingProgress');
    const percentText = document.getElementById('loadingPercent');
    const subtitle = document.querySelector('.loading-subtitle');
    
    if (progressBar) {
        progressBar.style.width = percent + '%';
    }
    if (percentText) {
        percentText.textContent = Math.round(percent) + '%';
    }
    if (subtitle) {
        subtitle.textContent = statusText || 'Loading assets...';
    }
    
    // Rotate tips every 10%
    const tipIndex = Math.floor(percent / 10) % LOADING_TIPS.length;
    const tipsElement = document.getElementById('loadingTips');
    if (tipsElement) {
        tipsElement.innerHTML = '<p>' + LOADING_TIPS[tipIndex] + '</p>';
    }
}

// Draw loading animation on canvas
function drawLoadingAnimation() {
    const loadingCanvas = document.getElementById('loadingCanvas');
    if (!loadingCanvas) return;
    
    const ctx = loadingCanvas.getContext('2d');
    const width = loadingCanvas.width;
    const height = loadingCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() / 1000;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw animated character silhouette
    const scale = 2.5;
    const bobY = Math.sin(time * 2) * 5;
    
    // Draw simple character silhouette
    ctx.save();
    ctx.translate(centerX, centerY + bobY);
    
    // Head
    ctx.fillStyle = '#00ffff';
    ctx.beginPath();
    ctx.arc(0, -20 * scale / 2, 15 * scale / 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Body
    ctx.fillStyle = '#0080ff';
    ctx.fillRect(-10 * scale / 2, -5 * scale / 2, 20 * scale / 2, 25 * scale / 2);
    
    // Animated arms
    const armAngle = Math.sin(time * 3) * 0.3;
    ctx.save();
    ctx.rotate(armAngle);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-15 * scale / 2, 0, 5 * scale / 2, 15 * scale / 2);
    ctx.restore();
    
    ctx.save();
    ctx.rotate(-armAngle);
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(10 * scale / 2, 0, 5 * scale / 2, 15 * scale / 2);
    ctx.restore();
    
    ctx.restore();
}

// Main loading sequence - Wait for ALL resources
async function loadAllAssets() {
    updateLoadingUI(0, 'Initializing...');
    
    // Draw loading animation
    const loadingAnimInterval = setInterval(drawLoadingAnimation, 50);
    
    try {
        // Step 1: Load character sprites (this includes all character assets)
        updateLoadingUI(10, 'Loading character sprites...');
        await CharacterSpriteManager.initialize();
        updateLoadingUI(60, 'Character sprites loaded');
        
        // Step 2: Load arrow sprite for Ranger
        updateLoadingUI(65, 'Loading projectiles...');
        await loadArrowSprite();
        updateLoadingUI(75, 'Projectiles loaded');
        
        // Step 3: Initialize audio
        updateLoadingUI(80, 'Loading audio...');
        initAudio();
        updateLoadingUI(90, 'Audio loaded');
        
        // Step 4: Setup game systems
        updateLoadingUI(92, 'Preparing game...');
        setupGame();
        updateLoadingUI(95, 'Almost ready...');
        
        // Small delay to show completion
        await new Promise(resolve => setTimeout(resolve, 300));
        
        clearInterval(loadingAnimInterval);
        updateLoadingUI(100, 'Ready!');
        
        return true;
    } catch (error) {
        console.error('Error loading assets:', error);
        clearInterval(loadingAnimInterval);
        updateLoadingUI(100, 'Ready! (Some assets may have failed)');
        return true; // Still continue game
    }
}

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

// Initialize sprite loader and then start game
async function initGame() {
    // Show loading screen
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
    }
    
    // Load all assets (this also calls setupGame internally)
    const success = await loadAllAssets();
    
    if (!success) {
        console.warn('Some assets failed to load, continuing anyway...');
    }
    
    // Hide loading screen
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    
    // Show main menu
    showMainMenu();
    lastTime = performance.now();
    requestAnimationFrame(mainLoop);
}

initGame();
