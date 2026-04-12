// ========================================
// GAME SETUP & INITIALIZATION
// ========================================

function setupGame() {
    // Event listeners
    window.addEventListener('keydown', (e) => {
        keys[e.key.toLowerCase()] = true;

        if (e.key === ' ' || e.key === 'Escape') {
            e.preventDefault();
            if (gameState === 'playing') {
                pauseGame();
            } else if (gameState === 'paused') {
                resumeGame();
            } else if (gameState === 'shop') {
                closeShop();
            }
        }

        if (e.key.toLowerCase() === 'b' && (gameState === 'playing' || gameState === 'paused')) {
            if (canOpenShop()) {
                openShop();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key.toLowerCase()] = false;
    });

    // Menu buttons
    document.getElementById('playBtn').addEventListener('click', () => {
        initAudio();
        showCharacterSelect();
    });

    document.getElementById('backToMenuFromCharSelect').addEventListener('click', () => {
        showMainMenu();
    });

    // Character select buttons
    document.querySelectorAll('.select-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const characterId = btn.dataset.character;
            selectCharacter(characterId);
        });
    });

    // Character card hover effects
    document.querySelectorAll('.character-card').forEach(card => {
        card.addEventListener('mouseenter', () => {
            renderCharacterPreview(card.dataset.character);
        });
    });

    document.getElementById('startBtn').addEventListener('click', () => {
        startGame();
    });

    document.getElementById('backToMenuFromStart').addEventListener('click', () => {
        showMainMenu();
    });

    // Shop button
    document.getElementById('shopButton').addEventListener('click', () => {
        if (canOpenShop()) {
            openShop();
        }
    });

    document.getElementById('closeShopBtn').addEventListener('click', () => {
        closeShop();
    });

    // Shop tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderShopItems(btn.dataset.tab);
        });
    });

    // Purchase confirmation
    document.getElementById('confirmPurchase').addEventListener('click', () => {
        completePurchase();
        document.getElementById('purchaseConfirmation').classList.add('hidden');
    });

    document.getElementById('cancelPurchase').addEventListener('click', () => {
        document.getElementById('purchaseConfirmation').classList.add('hidden');
    });

    // Pause buttons
    document.getElementById('resumeBtn').addEventListener('click', () => {
        resumeGame();
    });

    document.getElementById('openShopFromPause').addEventListener('click', () => {
        if (canOpenShop()) {
            openShop();
        }
    });

    document.getElementById('pauseMenuBtn').addEventListener('click', () => {
        showMainMenu();
    });

    // Game over buttons
    document.getElementById('restartBtn').addEventListener('click', () => {
        showCharacterSelect();
    });

    document.getElementById('gameOverMenuBtn').addEventListener('click', () => {
        showMainMenu();
    });

    // Settings & other buttons
    document.getElementById('settingsBtn').addEventListener('click', () => {
        hideAllScreens();
        document.getElementById('settingsScreen').classList.remove('hidden');
    });

    document.getElementById('closeSettingsBtn').addEventListener('click', () => {
        showMainMenu();
    });

    document.getElementById('settingsBackBtn').addEventListener('click', () => {
        showMainMenu();
    });

    document.getElementById('howToPlayBtn').addEventListener('click', () => {
        hideAllScreens();
        document.getElementById('howToPlayScreen').classList.remove('hidden');
    });

    document.getElementById('howToPlayBackBtn').addEventListener('click', () => {
        showMainMenu();
    });

    document.getElementById('highScoresBtn').addEventListener('click', () => {
        hideAllScreens();
        document.getElementById('highScoresScreen').classList.remove('hidden');
        displayHighScores();
    });

    document.getElementById('highScoresBackBtn').addEventListener('click', () => {
        showMainMenu();
    });

    document.getElementById('soundToggle').addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        document.getElementById('soundToggle').textContent = soundEnabled ? '🔊 ON' : '🔇 OFF';
    });
    
    // Background music toggle
    const bgMusicToggle = document.getElementById('bgMusicToggle');
    if (bgMusicToggle) {
        bgMusicToggle.addEventListener('click', () => {
            const isEnabled = toggleBackgroundMusic();
            bgMusicToggle.textContent = isEnabled ? '🎵 ON' : '🔇 OFF';
        });
    }

    // Background music volume slider
    const bgMusicVolumeSlider = document.getElementById('bgMusicVolume');
    const bgMusicVolumeValue = document.getElementById('bgMusicVolumeValue');
    if (bgMusicVolumeSlider) {
        // Set initial volume value
        const currentVolume = Math.round(getBgMusicVolume() * 100);
        bgMusicVolumeSlider.value = currentVolume;
        bgMusicVolumeValue.textContent = currentVolume + '%';

        bgMusicVolumeSlider.addEventListener('input', () => {
            const volume = parseInt(bgMusicVolumeSlider.value) / 100;
            setBgMusicVolume(volume);
            bgMusicVolumeValue.textContent = Math.round(volume * 100) + '%';
        });
    }
}

function showMainMenu() {
    gameState = 'menu';
    hideAllScreens();
    document.getElementById('mainMenu').classList.remove('hidden');
}

function showCharacterSelect() {
    gameState = 'character_select';
    hideAllScreens();
    document.getElementById('characterSelectScreen').classList.remove('hidden');

    // Render character previews for all 4 characters
    renderCharacterPreview('warrior');
    renderCharacterPreview('mage');
    renderCharacterPreview('ranger');
    renderCharacterPreview('orc');
}

function renderCharacterPreview(characterId) {
    const previewDiv = document.getElementById(`${characterId}Preview`);
    if (!previewDiv) return;

    previewDiv.innerHTML = '';

    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');

    const charData = CHARACTERS[characterId];
    
    // Use larger scale for preview (all characters now use TinySword assets)
    const previewScale = 2.0;
    
    drawCharacter(ctx, 75, 90, characterId, charData.colors, Date.now(), { x: 0, y: 1 }, 'preview', previewScale);

    previewDiv.appendChild(canvas);
}

function selectCharacter(characterId) {
    selectedCharacter = characterId;

    // Visual feedback
    document.querySelectorAll('.character-card').forEach(card => {
        card.classList.remove('selected');
    });

    document.querySelector(`[data-character="${characterId}"]`).classList.add('selected');

    // Show start screen
    setTimeout(() => {
        gameState = 'start';
        hideAllScreens();
        document.getElementById('startScreen').classList.remove('hidden');

        const charName = CHARACTERS[characterId].name;
        document.getElementById('selectedCharacterDisplay').textContent = `Karakter: ${charName}`;
    }, 300);
}

function showStartScreen() {
    hideAllScreens();
    document.getElementById('startScreen').classList.remove('hidden');
}
