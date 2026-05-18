// ========================================
// AUDIO SYSTEM - Sound effects and audio management
// ========================================

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        // Create master gain node for background music
        bgMusicGainNode = audioCtx.createGain();
        bgMusicGainNode.gain.setValueAtTime(0.35, audioCtx.currentTime); // Volume backsound 35%
        bgMusicGainNode.connect(audioCtx.destination);
    }

    // Resume audio context if suspended (browser policy)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // Initialize HTML5 Audio for background music
    if (!bgMusicAudio) {
        bgMusicAudio = new Audio('src/assets/sound/backsound.mp3');
        bgMusicAudio.loop = true;
        bgMusicAudio.volume = 0.35;
        bgMusicAudio.addEventListener('error', (e) => {
            console.warn('Background music file not found or error loading:', e);
        });
    }
}

// ========================================
// FILE-BASED BACKGROUND MUSIC
// ========================================

function playFileBackgroundMusic() {
    if (!bgMusicAudio || !bgMusicEnabled) {
        bgMusicPlaying = false;
        return;
    }

    // Resume audio context if needed
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    bgMusicPlaying = true;
    
    // Play the audio file
    bgMusicAudio.play().catch(err => {
        console.warn('Error playing background music:', err);
        bgMusicPlaying = false;
    });
}

function playSound(frequency, duration, type = 'sine', volume = 0.1) {
    if (!audioCtx || !soundEnabled) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + duration);
}

// ========================================
// BACKGROUND MUSIC SYSTEM
// ========================================

// Musical notes frequencies
const NOTES = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99
};

// Boss battle patterns (intense and dramatic)
const BOSS_PATTERNS = [
    // Boss intro - Dramatic announcement
    [
        { notes: ['A3', 'C4', 'E4', 'A4'], duration: 600, type: 'sawtooth' },
        { notes: ['A3', 'C4', 'E4', 'A4'], duration: 600, type: 'sawtooth' },
        { notes: ['G3', 'B3', 'D4', 'G4'], duration: 500, type: 'sawtooth' },
        { notes: ['F3', 'A3', 'C4', 'F4'], duration: 500, type: 'sawtooth' },
    ],
    // Boss fight - Intense combat
    [
        { notes: ['E3', 'G3', 'B3', 'E4'], duration: 400, type: 'sawtooth' },
        { notes: ['F3', 'A3', 'C4', 'F4'], duration: 400, type: 'sawtooth' },
        { notes: ['G3', 'B3', 'D4', 'G4'], duration: 400, type: 'sawtooth' },
        { notes: ['A3', 'C4', 'E4', 'A4'], duration: 400, type: 'sawtooth' },
    ],
    // Boss climax - Very intense
    [
        { notes: ['A3', 'C4', 'E4', 'A4'], duration: 350, type: 'sawtooth' },
        { notes: ['A3', 'C4', 'E4', 'A4'], duration: 350, type: 'sawtooth' },
        { notes: ['G3', 'B3', 'D4', 'G4'], duration: 350, type: 'sawtooth' },
        { notes: ['F3', 'A3', 'C4', 'F4'], duration: 350, type: 'sawtooth' },
    ]
];

// Boss bass lines (more aggressive)
const BOSS_BASS_PATTERNS = [
    ['A3', 'G3', 'F3', 'E3'],
    ['E3', 'F3', 'G3', 'A3'],
    ['A3', 'A3', 'G3', 'F3']
];

// Background music patterns (epic survival theme)
const BG_PATTERNS = [
    // Pattern 1 - Dark atmospheric intro
    [
        { notes: ['A3', 'E4', 'A4'], duration: 800, type: 'sine' },
        { notes: ['A3', 'E4', 'A4'], duration: 800, type: 'sine' },
        { notes: ['G3', 'D4', 'G4'], duration: 800, type: 'sine' },
        { notes: ['F3', 'C4', 'F4'], duration: 800, type: 'sine' },
    ],
    // Pattern 2 - Building tension
    [
        { notes: ['E3', 'B3', 'E4'], duration: 600, type: 'sine' },
        { notes: ['E3', 'B3', 'E4'], duration: 600, type: 'sine' },
        { notes: ['F3', 'C4', 'F4'], duration: 600, type: 'sine' },
        { notes: ['G3', 'D4', 'G4'], duration: 600, type: 'sine' },
    ],
    // Pattern 3 - Epic battle theme
    [
        { notes: ['A3', 'C4', 'E4', 'A4'], duration: 500, type: 'sine' },
        { notes: ['G3', 'B3', 'D4', 'G4'], duration: 500, type: 'sine' },
        { notes: ['F3', 'A3', 'C4', 'F4'], duration: 500, type: 'sine' },
        { notes: ['E3', 'G3', 'B3', 'E4'], duration: 500, type: 'sine' },
    ],
    // Pattern 4 - Intense combat
    [
        { notes: ['E3', 'E4', 'G4'], duration: 400, type: 'sine' },
        { notes: ['F3', 'F4', 'A4'], duration: 400, type: 'sine' },
        { notes: ['G3', 'G4', 'B4'], duration: 400, type: 'sine' },
        { notes: ['A3', 'A4', 'C5'], duration: 400, type: 'sine' },
    ],
    // Pattern 5 - Victory moment
    [
        { notes: ['C4', 'E4', 'G4', 'C5'], duration: 600, type: 'sine' },
        { notes: ['F3', 'A3', 'C4', 'F4'], duration: 600, type: 'sine' },
        { notes: ['G3', 'B3', 'D4', 'G4'], duration: 600, type: 'sine' },
        { notes: ['C4', 'E4', 'G4', 'C5'], duration: 600, type: 'sine' },
    ]
];

// Bass line patterns
const BASS_PATTERNS = [
    ['A3', 'A3', 'G3', 'F3'],
    ['E3', 'E3', 'F3', 'G3'],
    ['A3', 'G3', 'F3', 'E3'],
    ['E3', 'F3', 'G3', 'A3'],
    ['C3', 'F3', 'G3', 'C3']
];

let currentPatternIndex = 0;
let currentNoteIndex = 0;
let currentBassIndex = 0;

function playBackgroundMusic() {
    if (!audioCtx || !bgMusicEnabled) {
        bgMusicPlaying = false;
        return;
    }
    
    // Stop current music if playing
    if (bgMusicPlaying) {
        stopBackgroundMusic();
    }

    bgMusicPlaying = true;
    currentPatternIndex = 0;
    currentNoteIndex = 0;
    currentBassIndex = 0;

    // Determine if we're in boss fight
    const isBossFight = gameState === 'boss_fight' && activeBoss !== null;
    
    // Select patterns based on game state
    let pattern, bassPattern;
    
    if (isBossFight) {
        // Boss battle music
        const bossPatternIndex = Math.min(Math.floor(currentWave / 5), BOSS_PATTERNS.length - 1);
        pattern = BOSS_PATTERNS[bossPatternIndex];
        bassPattern = BOSS_BASS_PATTERNS[bossPatternIndex];
    } else if (currentWave >= 5) {
        // Epic battle for later waves
        pattern = BG_PATTERNS[2];
        bassPattern = BASS_PATTERNS[2];
    } else if (currentWave >= 3) {
        // Building tension
        pattern = BG_PATTERNS[1];
        bassPattern = BASS_PATTERNS[1];
    } else {
        // Dark atmospheric for early waves
        pattern = BG_PATTERNS[0];
        bassPattern = BASS_PATTERNS[0];
    }

    // Play chord
    const chord = pattern[currentNoteIndex % pattern.length];
    chord.notes.forEach(note => {
        if (NOTES[note]) {
            const oscillator = audioCtx.createOscillator();
            const noteGain = audioCtx.createGain();

            oscillator.connect(noteGain);
            noteGain.connect(bgMusicGainNode);

            oscillator.type = chord.type;
            oscillator.frequency.setValueAtTime(NOTES[note], audioCtx.currentTime);

            noteGain.gain.setValueAtTime(0, audioCtx.currentTime);
            noteGain.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + 0.05);
            noteGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + chord.duration / 2000);
            noteGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + chord.duration / 1000);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + chord.duration / 1000);

            bgMusicOscillators.push(oscillator);
        }
    });

    // Play bass note
    const bassNoteName = bassPattern[currentBassIndex % bassPattern.length];
    if (NOTES[bassNoteName]) {
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();

        bassOsc.connect(bassGain);
        bassGain.connect(bgMusicGainNode);

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(NOTES[bassNoteName] / 2, audioCtx.currentTime); // One octave lower

        bassGain.gain.setValueAtTime(0, audioCtx.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.12, audioCtx.currentTime + 0.05);
        bassGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + chord.duration / 1000);

        bassOsc.start(audioCtx.currentTime);
        bassOsc.stop(audioCtx.currentTime + chord.duration / 1000);

        bgMusicOscillators.push(bassOsc);
    }

    // Schedule next note
    bgMusicInterval = setTimeout(() => {
        currentNoteIndex++;
        currentBassIndex++;

        // Reset pattern loop
        if (currentNoteIndex >= pattern.length) {
            currentNoteIndex = 0;
        }
        if (currentBassIndex >= bassPattern.length) {
            currentBassIndex = 0;
        }

        // Check if we should change pattern based on game progress
        const isBossNow = gameState === 'boss_fight' && activeBoss !== null;
        if (isBossNow !== isBossFight) {
            // Game state changed (boss appeared or died)
            stopBackgroundMusic();
            playBackgroundMusic();
            return;
        }

        playBackgroundMusic();
    }, chord.duration);
}

function getPatternIndexForGameState() {
    if (gameState === 'boss_fight' && activeBoss !== null) {
        return 100; // Special value for boss
    } else if (currentWave >= 5) {
        return 2;
    } else if (currentWave >= 3) {
        return 1;
    } else {
        return 0;
    }
}

function stopBackgroundMusic() {
    bgMusicPlaying = false;
    
    // Stop HTML5 Audio if playing
    if (bgMusicAudio) {
        bgMusicAudio.pause();
        bgMusicAudio.currentTime = 0;
    }
    
    if (bgMusicInterval) {
        clearTimeout(bgMusicInterval);
        bgMusicInterval = null;
    }

    // Stop all playing oscillators
    bgMusicOscillators.forEach(osc => {
        try {
            osc.stop();
        } catch (e) {
            // Oscillator already stopped
        }
    });
    bgMusicOscillators = [];

    // Reset indices
    currentPatternIndex = 0;
    currentNoteIndex = 0;
    currentBassIndex = 0;
}

function toggleBackgroundMusic() {
    bgMusicEnabled = !bgMusicEnabled;

    if (bgMusicEnabled) {
        // Turn on - resume audio context if needed
        if (audioCtx && audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        if (gameState === 'playing' || gameState === 'boss_fight' || gameState === 'wave_rest') {
            playFileBackgroundMusic();
        }
    } else {
        stopBackgroundMusic();
    }

    return bgMusicEnabled;
}

function setBgMusicVolume(volume) {
    // volume: 0 to 1
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    // Update HTML5 Audio volume
    if (bgMusicAudio) {
        bgMusicAudio.volume = clampedVolume;
    }
    
    // Update Web Audio API gain node
    if (bgMusicGainNode && audioCtx) {
        bgMusicGainNode.gain.setValueAtTime(clampedVolume, audioCtx.currentTime);
    }
    return clampedVolume;
}

function getBgMusicVolume() {
    return bgMusicAudio ? bgMusicAudio.volume : (bgMusicGainNode ? bgMusicGainNode.gain.value : 0.35);
}

function updateBackgroundMusicForGameState() {
    // Auto-adjust music intensity based on game state
    if (bgMusicPlaying && bgMusicEnabled) {
        const newPatternIndex = getPatternIndexForGameState();
        if (newPatternIndex !== currentPatternIndex) {
            stopBackgroundMusic();
            setTimeout(() => playBackgroundMusic(), 100);
        }
    }
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}
