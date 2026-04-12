// ========================================
// WAVE REST & GAME STATE
// ========================================

import { saveGameScore, isLoggedIn } from '../system/auth.js';

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

    // Calculate final score
    const finalScore = score + Math.floor(survivalTime);

    // Save high score to local storage (legacy)
    saveHighScore(finalScore);
    
    // Save score to Firebase if user is logged in
    if (isLoggedIn()) {
        saveGameScore(finalScore, currentWave, player.level, survivalTime, selectedCharacter, enemiesKilled)
            .then(result => {
                if (result.success) {
                    console.log('✅ Score saved to cloud!');
                } else {
                    console.error('Failed to save score:', result.error);
                }
            });
    }

    // Show game over screen
    hideAllScreens();
    document.getElementById('gameOverScreen').classList.remove('hidden');

    document.getElementById('finalScore').textContent = `Skor: ${finalScore}`;

    const minutes = Math.floor(survivalTime / 60);
    const seconds = Math.floor(survivalTime % 60);
    document.getElementById('finalTime').textContent = `Waktu: ${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    document.getElementById('finalWave').textContent = `Wave: ${currentWave}`;
    document.getElementById('finalLevel').textContent = `Level: ${player.level}`;
    document.getElementById('enemiesKilled').textContent = `Musuh Dikalahkan: ${enemiesKilled}`;

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
        score: score,
        wave: currentWave,
        level: player.level,
        time: survivalTime,
        character: selectedCharacter,
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

function displayHighScores() {
    const highScores = getHighScores();
    const container = document.getElementById('scoresList');

    if (highScores.length === 0) {
        container.innerHTML = '<p class="no-scores">Belum ada skor. Mainkan game untuk mencetak rekor!</p>';
        return;
    }

    container.innerHTML = '';

    highScores.forEach((entry, index) => {
        const div = document.createElement('div');
        div.className = `score-entry ${index === 0 ? 'score-top' : ''}`;

        const minutes = Math.floor(entry.time / 60);
        const seconds = Math.floor(entry.time % 60);
        const timeStr = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        div.innerHTML = `
            <div>
                <div><strong>#${index + 1}</strong> - ${CHARACTERS[entry.character]?.name || 'Unknown'}</div>
                <div style="font-size: 12px; color: #888;">Wave ${entry.wave} • Level ${entry.level} • ${timeStr}</div>
            </div>
            <div style="font-size: 20px; font-weight: bold; color: #FBBF24;">${entry.score}</div>
        `;

        container.appendChild(div);
    });
}
