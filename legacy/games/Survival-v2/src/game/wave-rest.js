// ========================================
// WAVE REST & GAME STATE
// ========================================

// Firebase auth functions - loaded dynamically if available
const waveRestAuth = {
    saveGameScore: typeof saveGameScore !== 'undefined' ? saveGameScore : null,
    isLoggedIn: typeof isLoggedIn !== 'undefined' ? isLoggedIn : () => false
};

function updateWaveRest(deltaTime) {
    restTimer -= deltaTime;

    // Check if there are still enemies alive
    const aliveEnemies = enemies.filter(e => !e.isDying);

    // If all enemies are dead before rest timer ends, can proceed to next wave early
    if (aliveEnemies.length === 0 && restTimer <= 0) {
        // Next wave
        currentWave++;
        waveTimer = 0;
        spawnRate = getSpawnRateForWave(currentWave);
        gameState = 'playing';
        lastTime = performance.now();

        showWarning(`Wave ${currentWave} dimulai!`, 2);
        playSound(440, 0.3, 'sine', 0.12);

        // Resume background music for new wave
        if (bgMusicEnabled) {
            playFileBackgroundMusic();
        }
    } else if (aliveEnemies.length > 0) {
        // If enemies are still alive during rest, show message
        // Don't proceed to next wave until all enemies are dead
        if (restTimer <= 0) {
            // Reset rest timer to give player more time to clear enemies
            restTimer = 5; // Give 5 more seconds
            showWarning(`⚠️ Bersihkan ${aliveEnemies.length} musuh tersisa!`, 2);
        }
    }
}

function pauseGame() {
    gameState = 'paused';
    
    // Hide only menu screens, NOT the HUD
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById('pauseScreen').classList.remove('hidden');

    // Keep HUD visible
    document.getElementById('ui').classList.remove('hidden');
    document.getElementById('weaponDisplay').classList.remove('hidden');

    // Stop background music when paused
    stopBackgroundMusic();
}

function resumeGame() {
    gameState = 'playing';

    // Hide pause screen
    document.getElementById('pauseScreen').classList.add('hidden');
    lastTime = performance.now();

    // Keep HUD visible
    document.getElementById('ui').classList.remove('hidden');
    document.getElementById('weaponDisplay').classList.remove('hidden');

    // Resume background music
    if (bgMusicEnabled) {
        playFileBackgroundMusic();
    }
}

function gameOver() {
    gameState = 'game_over';

    // Stop background music
    stopBackgroundMusic();

    // Calculate final score - ensure integer
    const finalScore = Math.floor(score + survivalTime);

    // Report to AkaScoreReporter
    window.AkaScoreReporter?.report('Survival-v2', finalScore, {
        wave: currentWave || 1,
        level: player.level || 1,
        survivalTime: Math.floor(survivalTime),
        enemiesKilled: enemiesKilled || 0
    });

    // Save high score to local storage
    saveHighScore(finalScore);

    // Save score to Firebase if user is logged in
    if (waveRestAuth.isLoggedIn && waveRestAuth.isLoggedIn() && waveRestAuth.saveGameScore) {
        waveRestAuth.saveGameScore(
            finalScore, 
            currentWave || 1, 
            player.level || 1, 
            Math.floor(survivalTime), 
            selectedCharacter || 'warrior', 
            enemiesKilled || 0
        )
            .then(result => {
                if (result.success) {
                    console.log('✅ Score saved to cloud!');
                } else {
                    console.error('Failed to save score:', result.error);
                }
            })
            .catch(err => console.log('Failed to save score to Firebase:', err));
    }

    // Show game over screen
    hideAllScreens();
    document.getElementById('gameOverScreen').classList.remove('hidden');

    document.getElementById('finalScore').textContent = `Skor: ${finalScore}`;

    const minutes = Math.floor(survivalTime / 60);
    const seconds = Math.floor(survivalTime % 60);
    document.getElementById('finalTime').textContent = `Waktu: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('finalWave').textContent = `Wave: ${currentWave || 1}`;
    document.getElementById('finalLevel').textContent = `Level: ${player.level || 1}`;
    document.getElementById('enemiesKilled').textContent = `Musuh Dikalahkan: ${enemiesKilled || 0}`;

    // Check high score
    const highScores = getHighScores();
    if (highScores.length > 0 && finalScore >= highScores[0].score) {
        document.getElementById('newHighScore').classList.remove('hidden');
        playSound(523, 0.2, 'sine', 0.15);
        setTimeout(() => playSound(659, 0.2, 'sine', 0.15), 150);
        setTimeout(() => playSound(784, 0.3, 'sine', 0.15), 300);
    } else {
        document.getElementById('newHighScore').classList.add('hidden');
    }

    playSound(300, 0.5, 'sine', 0.12);
}

function saveHighScore(score) {
    const highScores = getHighScores();

    highScores.push({
        score: Math.floor(score), // Ensure integer
        wave: currentWave || 1,
        level: player.level || 1,
        time: Math.floor(survivalTime), // Store as integer
        character: selectedCharacter || 'warrior',
        date: new Date().toISOString()
    });

    // Sort by score
    highScores.sort((a, b) => b.score - a.score);

    // Keep top 10
    highScores.splice(10);

    localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));
}

function getHighScores() {
    const data = localStorage.getItem('survivalGameHighScores');
    return data ? JSON.parse(data) : [];
}

async function displayHighScores() {
    const highScores = getHighScores();
    const container = document.getElementById('scoresList');

    // Try to load from Firestore first if user is logged in
    let displayScores = highScores;
    let usingFirestore = false;

    if (waveRestAuth.isLoggedIn && waveRestAuth.isLoggedIn()) {
        try {
            const topScoresResult = await waveRestAuth.displayLeaderboard?.();
            if (topScoresResult && topScoresResult.success && topScoresResult.scores) {
                // Convert Firestore scores to display format
                displayScores = topScoresResult.scores.map((score, index) => ({
                    score: score.bestScore || score.score || 0,
                    wave: score.wave || 0,
                    level: score.level || 0,
                    time: score.survivalTime || score.time || 0,
                    character: score.character || 'warrior',
                    date: score.date || new Date().toISOString(),
                    userName: score.userName || 'Player'
                }));
                usingFirestore = true;
                console.log('✅ Loaded scores from Firestore');
            }
        } catch (e) {
            console.log('⚠️ Failed to load from Firestore, using localStorage:', e);
        }
    }

    if (displayScores.length === 0) {
        container.innerHTML = '<p class="no-scores">Belum ada skor. Mainkan game untuk mencetak rekor!</p>';
        return;
    }

    container.innerHTML = '';

    // Show source indicator
    if (usingFirestore) {
        const sourceIndicator = document.createElement('div');
        sourceIndicator.className = 'score-source-indicator';
        sourceIndicator.innerHTML = `
            <div style="text-align: center; padding: 8px; background: rgba(0, 255, 255, 0.1); border: 1px solid rgba(0, 255, 255, 0.3); border-radius: 8px; margin-bottom: 16px; color: #00FFFF; font-size: 14px;">
                ☁️ Skor dari Cloud (Firestore)
            </div>
        `;
        container.appendChild(sourceIndicator);
    }

    displayScores.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = `score-entry ${index === 0 ? 'score-top' : ''}`;

        // Handle time display
        const timeVal = entry.time || 0;
        const minutes = Math.floor(timeVal / 60);
        const seconds = Math.floor(timeVal % 60);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Get character name safely
        const characterName = CHARACTERS[entry.character]?.name || 'Unknown';
        
        // Get wave and level with defaults
        const wave = entry.wave || 0;
        const level = entry.level || 0;
        
        // Format score as integer
        const scoreDisplay = Math.floor(entry.score || 0);
        
        // Get user name (from Firestore or localStorage)
        const userName = entry.userName || 'Player';

        div.innerHTML = `
            <div class="score-rank">#${index + 1}</div>
            <div class="score-info">
                <div class="score-player">${userName}</div>
                <div class="score-character">${characterName}</div>
                <div class="score-stats">Wave ${wave} • Level ${level} • ${timeStr}</div>
            </div>
            <div class="score-value">${scoreDisplay}</div>
        `;

        container.appendChild(div);
    });
}
