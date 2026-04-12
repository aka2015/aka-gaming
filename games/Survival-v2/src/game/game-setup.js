// ========================================
// GAME SETUP & INITIALIZATION
// ========================================

import { initAuth, registerUser, loginUser, logoutUser, getCurrentUser } from '../system/auth.js';
import { displayLeaderboard } from '../ui/leaderboard.js';

function setupGame() {
    // Initialize Firebase Auth
    initAuth();
    
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

    // ========================================
    // AUTH EVENT HANDLERS
    // ========================================

    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('authModal').classList.remove('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
        document.getElementById('registerForm').classList.add('hidden');
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', async () => {
        const result = await logoutUser();
        if (result.success) {
            console.log('Logged out successfully');
        }
    });

    // Close auth modal
    document.getElementById('closeAuthModal').addEventListener('click', () => {
        document.getElementById('authModal').classList.add('hidden');
        clearAuthForms();
    });

    // Show register form
    document.getElementById('showRegisterBtn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginForm').classList.add('hidden');
        document.getElementById('registerForm').classList.remove('hidden');
        clearAuthForms();
    });

    // Show login form
    document.getElementById('showLoginBtn').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerForm').classList.add('hidden');
        document.getElementById('loginForm').classList.remove('hidden');
        clearAuthForms();
    });

    // Login submit
    document.getElementById('loginSubmitBtn').addEventListener('click', async () => {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        
        if (!email || !password) {
            errorDiv.textContent = 'Email dan password harus diisi';
            return;
        }

        const result = await loginUser(email, password);
        if (result.success) {
            document.getElementById('authModal').classList.add('hidden');
            clearAuthForms();
        } else {
            errorDiv.textContent = result.error;
        }
    });

    // Register submit
    document.getElementById('registerSubmitBtn').addEventListener('click', async () => {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const password = document.getElementById('registerPassword').value;
        const errorDiv = document.getElementById('registerError');
        
        if (!name || !email || !password) {
            errorDiv.textContent = 'Semua field harus diisi';
            return;
        }

        if (password.length < 6) {
            errorDiv.textContent = 'Password minimal 6 karakter';
            return;
        }

        const result = await registerUser(email, password, name);
        if (result.success) {
            document.getElementById('authModal').classList.add('hidden');
            clearAuthForms();
        } else {
            errorDiv.textContent = result.error;
        }
    });

    // High scores button - show leaderboard
    document.getElementById('highScoresBtn').addEventListener('click', async () => {
        hideAllScreens();
        document.getElementById('highScoresScreen').classList.remove('hidden');
        await displayLeaderboard();
    });
}

function clearAuthForms() {
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('loginError').textContent = '';
    document.getElementById('registerName').value = '';
    document.getElementById('registerEmail').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerError').textContent = '';
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
