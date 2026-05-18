function gameLoop(currentTime) {
    requestAnimationFrame(gameLoop);

    const deltaTime = Math.min((currentTime - gameState.lastTime) / 1000, 0.1);
    gameState.lastTime = currentTime;

    if (gameState.current === GameStates.PLAYING) {
        gameState.gameTime += deltaTime;
        gameState.dayTime += deltaTime * 0.01;
        if (gameState.dayTime >= 24) {
            gameState.dayTime -= 24;
        }

        updatePlayer(deltaTime);
        updateNPCs(deltaTime);
        updateMonsters(deltaTime);
        updateItems(deltaTime);
        updateParticles(deltaTime);
        updateQuests();
        updateAudio(deltaTime);
        updateHUD();

        const nearestNPC = getNearestNPC(gameState.player, 2.5);
        const justPressed = consumeJustPressed();

        if (justPressed.interact && nearestNPC) {
            interactWithNPC(nearestNPC);
        } else if (justPressed.interact) {
            tryOpenChest(gameState.player);
        }

        if (justPressed.inventory) {
            openInventory();
        }

        if (justPressed.quest) {
            openQuestLog();
        }

        if (justPressed.map) {
            const minimap = document.getElementById('minimap');
            if (minimap) {
                minimap.classList.toggle('hidden');
            }
        }

        render();
        renderMinimap();
    } else if (gameState.current === GameStates.DIALOG) {
        const justPressed = consumeJustPressed();
        if (justPressed.interact) {
            advanceDialog();
        }
        render();
    } else if (gameState.current === GameStates.INVENTORY || gameState.current === GameStates.QUEST) {
        render();
    } else if (gameState.current === GameStates.LOADING) {
        drawLoadingAnimation();
    }
}

function drawLoadingAnimation() {
    const loadingCanvas = document.getElementById('loadingCanvas');
    if (!loadingCanvas) return;

    const ctx = loadingCanvas.getContext('2d');
    const width = loadingCanvas.width;
    const height = loadingCanvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const time = Date.now() / 1000;

    ctx.clearRect(0, 0, width, height);

    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 80);
    gradient.addColorStop(0, '#4a6fa5');
    gradient.addColorStop(1, '#1a2a3a');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 8; i++) {
        const angle = (time * 0.5 + i * Math.PI / 4) % (Math.PI * 2);
        const x = centerX + Math.cos(angle) * 50;
        const y = centerY + Math.sin(angle) * 50;

        ctx.fillStyle = `hsl(${(i * 45 + time * 30) % 360}, 70%, 60%)`;
        ctx.beginPath();
        ctx.arc(x, y, 6, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏰', centerX, centerY + 5);
}

async function initGame() {
    changeState(GameStates.LOADING);

    const loadingProgress = document.getElementById('loadingProgress');
    const loadingPercent = document.getElementById('loadingPercent');
    const loadingSubtitle = document.querySelector('.loading-subtitle');

    const steps = [
        { progress: 20, text: 'Generating sprites...' },
        { progress: 40, text: 'Creating world...' },
        { progress: 60, text: 'Spawning characters...' },
        { progress: 80, text: 'Preparing UI...' },
        { progress: 100, text: 'Ready!' }
    ];

    for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 300));
        if (loadingProgress) loadingProgress.style.width = step.progress + '%';
        if (loadingPercent) loadingPercent.textContent = step.progress + '%';
        if (loadingSubtitle) loadingSubtitle.textContent = step.text;
    }

    await new Promise(resolve => setTimeout(resolve, 500));

    initRenderer();
    initAudio();
    spriteGenerator.generateAll();
    setupInput();
    setupJoystick();
    setupUI();

    gameState.lastTime = performance.now();

    changeState(GameStates.MENU);
    requestAnimationFrame(gameLoop);
}

initGame();
