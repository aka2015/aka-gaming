let audioCtx = null;
let bgMusicPlaying = false;
let bgMusicEnabled = true;
let bgMusicInterval = null;
let bgMusicOscillators = [];
let bgMusicGainNode = null;
let soundEnabled = true;
let bgMusicVolume = 0.3;
let sfxVolume = 0.15;

const NOTES = {
    'C3': 130.81, 'D3': 146.83, 'E3': 164.81, 'F3': 174.61, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94,
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'G5': 783.99
};

const BG_PATTERNS = [
    [
        { notes: ['C4', 'E4', 'G4'], duration: 1000, type: 'sine' },
        { notes: ['A3', 'C4', 'E4'], duration: 1000, type: 'sine' },
        { notes: ['F3', 'A3', 'C4'], duration: 1000, type: 'sine' },
        { notes: ['G3', 'B3', 'D4'], duration: 1000, type: 'sine' },
    ],
    [
        { notes: ['E4', 'G4', 'B4'], duration: 800, type: 'sine' },
        { notes: ['A3', 'C4', 'E4'], duration: 800, type: 'sine' },
        { notes: ['D4', 'F4', 'A4'], duration: 800, type: 'sine' },
        { notes: ['E4', 'G4', 'C5'], duration: 800, type: 'sine' },
    ],
    [
        { notes: ['A3', 'C4', 'E4', 'A4'], duration: 600, type: 'triangle' },
        { notes: ['G3', 'B3', 'D4', 'G4'], duration: 600, type: 'triangle' },
        { notes: ['F3', 'A3', 'C4', 'F4'], duration: 600, type: 'triangle' },
        { notes: ['E3', 'G3', 'B3', 'E4'], duration: 600, type: 'triangle' },
    ]
];

const BASS_PATTERNS = [
    ['C3', 'A3', 'F3', 'G3'],
    ['E3', 'A3', 'D3', 'E3'],
    ['A3', 'G3', 'F3', 'E3']
];

let currentNoteIndex = 0;
let currentBassIndex = 0;
let bgMusicPattern = BG_PATTERNS[0];
let bgBassPattern = BASS_PATTERNS[0];
let timeSinceLastStep = 0;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        bgMusicGainNode = audioCtx.createGain();
        bgMusicGainNode.gain.setValueAtTime(bgMusicVolume, audioCtx.currentTime);
        bgMusicGainNode.connect(audioCtx.destination);
    }

    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playSound(frequency, duration, type = 'sine', volume = sfxVolume) {
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

function playFootstep() {
    playSound(200 + Math.random() * 50, 0.08, 'triangle', sfxVolume * 0.3);
}

function playAttackSound() {
    playSound(400, 0.1, 'square', sfxVolume * 0.5);
    setTimeout(() => playSound(600, 0.15, 'square', sfxVolume * 0.4), 50);
}

function playHitSound() {
    playSound(150, 0.2, 'sawtooth', sfxVolume * 0.6);
}

function playPickupSound() {
    playSound(800, 0.1, 'sine', sfxVolume * 0.5);
    setTimeout(() => playSound(1000, 0.1, 'sine', sfxVolume * 0.4), 80);
}

function playChestOpenSound() {
    playSound(300, 0.15, 'triangle', sfxVolume * 0.5);
    setTimeout(() => playSound(500, 0.15, 'triangle', sfxVolume * 0.4), 100);
    setTimeout(() => playSound(800, 0.2, 'sine', sfxVolume * 0.5), 200);
}

function playLevelUpSound() {
    playSound(523, 0.2, 'sine', sfxVolume * 0.6);
    setTimeout(() => playSound(659, 0.2, 'sine', sfxVolume * 0.5), 150);
    setTimeout(() => playSound(784, 0.3, 'sine', sfxVolume * 0.6), 300);
}

function playNPCInteractSound() {
    playSound(600, 0.1, 'sine', sfxVolume * 0.3);
}

function playDayNightSound() {
    playSound(440, 0.3, 'sine', sfxVolume * 0.2);
}

let lastFootstepTime = 0;
let lastHour = 0;

function updateAudio(deltaTime) {
    if (!audioCtx || !gameState.player) return;

    if (gameState.player.isMoving) {
        if (audioCtx.currentTime - lastFootstepTime > 0.25) {
            playFootstep();
            lastFootstepTime = audioCtx.currentTime;
        }
    }

    const currentHour = Math.floor(gameState.dayTime);
    if (currentHour !== lastHour) {
        lastHour = currentHour;
        if (currentHour === 6 || currentHour === 18) {
            playDayNightSound();
        }
    }

    if (bgMusicEnabled && !bgMusicPlaying && gameState.current === GameStates.PLAYING) {
        startBackgroundMusic();
    }

    if (bgMusicPlaying) {
        timeSinceLastStep += deltaTime;
    }
}

function playBackgroundMusicStep() {
    if (!audioCtx || !bgMusicEnabled || !bgMusicPlaying) return;

    const chord = bgMusicPattern[currentNoteIndex % bgMusicPattern.length];
    chord.notes.forEach(note => {
        if (NOTES[note]) {
            const oscillator = audioCtx.createOscillator();
            const noteGain = audioCtx.createGain();

            oscillator.connect(noteGain);
            noteGain.connect(bgMusicGainNode);

            oscillator.type = chord.type;
            oscillator.frequency.setValueAtTime(NOTES[note], audioCtx.currentTime);

            noteGain.gain.setValueAtTime(0, audioCtx.currentTime);
            noteGain.gain.linearRampToValueAtTime(0.06, audioCtx.currentTime + 0.05);
            noteGain.gain.linearRampToValueAtTime(0.04, audioCtx.currentTime + chord.duration / 2000);
            noteGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + chord.duration / 1000);

            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + chord.duration / 1000);

            bgMusicOscillators.push(oscillator);
        }
    });

    const bassNoteName = bgBassPattern[currentBassIndex % bgBassPattern.length];
    if (NOTES[bassNoteName]) {
        const bassOsc = audioCtx.createOscillator();
        const bassGain = audioCtx.createGain();

        bassOsc.connect(bassGain);
        bassGain.connect(bgMusicGainNode);

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(NOTES[bassNoteName], audioCtx.currentTime);

        bassGain.gain.setValueAtTime(0, audioCtx.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + 0.05);
        bassGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + chord.duration / 1000);

        bassOsc.start(audioCtx.currentTime);
        bassOsc.stop(audioCtx.currentTime + chord.duration / 1000);

        bgMusicOscillators.push(bassOsc);
    }

    bgMusicInterval = setTimeout(() => {
        currentNoteIndex++;
        currentBassIndex++;

        if (currentNoteIndex >= bgMusicPattern.length) {
            currentNoteIndex = 0;
            const patternIdx = Math.floor(Math.random() * BG_PATTERNS.length);
            bgMusicPattern = BG_PATTERNS[patternIdx];
            bgBassPattern = BASS_PATTERNS[patternIdx];
        }
        if (currentBassIndex >= bgBassPattern.length) {
            currentBassIndex = 0;
        }

        playBackgroundMusicStep();
    }, chord.duration);
}

function startBackgroundMusic() {
    if (bgMusicPlaying) stopBackgroundMusic();

    bgMusicPlaying = true;
    currentNoteIndex = 0;
    currentBassIndex = 0;
    timeSinceLastStep = 0;
    bgMusicPattern = BG_PATTERNS[0];
    bgBassPattern = BASS_PATTERNS[0];

    playBackgroundMusicStep();
}

function stopBackgroundMusic() {
    bgMusicPlaying = false;

    if (bgMusicInterval) {
        clearTimeout(bgMusicInterval);
        bgMusicInterval = null;
    }

    bgMusicOscillators.forEach(osc => {
        try { osc.stop(); } catch (e) {}
    });
    bgMusicOscillators = [];
}

function toggleBackgroundMusic() {
    bgMusicEnabled = !bgMusicEnabled;

    if (bgMusicEnabled && gameState.current === GameStates.PLAYING) {
        startBackgroundMusic();
    } else {
        stopBackgroundMusic();
    }

    return bgMusicEnabled;
}

function setBgMusicVolume(volume) {
    bgMusicVolume = Math.max(0, Math.min(1, volume));
    if (bgMusicGainNode && audioCtx) {
        bgMusicGainNode.gain.setValueAtTime(bgMusicVolume, audioCtx.currentTime);
    }
    return bgMusicVolume;
}
