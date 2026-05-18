const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Reposition player if out of bounds (only if player is defined)
    if (typeof player !== 'undefined') {
        player.x = Math.min(player.x, canvas.width - player.width);
        player.y = Math.min(player.y, canvas.height - player.height);
    }
});

// Audio system using Web Audio API
let audioCtx = null;
let menuMusicInterval = null;
let gameMusicInterval = null;
let musicEnabled = true;
let masterGain = null;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.connect(audioCtx.destination);
        masterGain.gain.setValueAtTime(1, audioCtx.currentTime);
    }
}

function playNote(frequency, duration, type = 'sine', volume = 0.1, delay = 0) {
    if (!audioCtx || !musicEnabled) return;
    
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + delay);
    
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime + delay);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
    
    oscillator.start(audioCtx.currentTime + delay);
    oscillator.stop(audioCtx.currentTime + delay + duration);
}

function playChord(frequencies, duration, type = 'sine', volume = 0.05, delay = 0) {
    frequencies.forEach(freq => {
        playNote(freq, duration, type, volume, delay);
    });
}

// Menu music - calm and relaxing
function startMenuMusic() {
    if (!audioCtx || !musicEnabled) return;
    stopAllMusic();

    // C major scale progression - calm and peaceful
    const menuMelody = [
        261.63, 329.63, 392.00, 349.23,  // C4, E4, G4, F4
        329.63, 293.66, 349.23, 329.63,  // E4, D4, F4, E4
        261.63, 349.23, 440.00, 392.00,  // C4, F4, A4, G4
        349.23, 329.63, 293.66, 261.63   // F4, E4, D4, C4
    ];
    const menuBass = [
        130.81, 164.81, 196.00, 174.61,  // C3, E3, G3, F3
        164.81, 146.83, 174.61, 164.81,  // E3, D3, F3, E3
        130.81, 174.61, 220.00, 196.00,  // C3, F3, A3, G3
        174.61, 164.81, 146.83, 130.81   // F3, E3, D3, C3
    ];
    // Proper major triad chords (root, 3rd, 5th)
    const menuChords = [
        [261.63, 329.63, 392.00],  // C major
        [293.66, 349.23, 440.00],  // D minor
        [329.63, 392.00, 493.88],  // E minor
        [261.63, 349.23, 440.00],  // F major
    ];
    let noteIndex = 0;

    menuMusicInterval = setInterval(() => {
        if (!musicEnabled) return;

        // Soft melody
        playNote(menuMelody[noteIndex], 1.0, 'sine', 0.35, 0);
        // Bass line (one octave lower)
        playNote(menuBass[noteIndex], 1.2, 'sine', 0.2, 0);
        // Harmonious chord (every 4 notes)
        if (noteIndex % 4 === 0) {
            const chordIndex = Math.floor(noteIndex / 4) % menuChords.length;
            const chord = menuChords[chordIndex];
            playNote(chord[0], 1.5, 'sine', 0.14, 0);
            playNote(chord[1], 1.5, 'sine', 0.14, 0);
            playNote(chord[2], 1.5, 'sine', 0.14, 0);
        }

        noteIndex = (noteIndex + 1) % menuMelody.length;
    }, 800);
}

// Game music - energetic and upbeat
function startGameMusic() {
    if (!audioCtx || !musicEnabled) return;
    stopAllMusic();

    // Upbeat E minor rock progression
    const gameMelody = [
        329.63, 392.00, 493.88, 523.25,  // E4, G4, B4, C5
        493.88, 440.00, 392.00, 329.63,  // B4, A4, G4, E4
        329.63, 349.23, 392.00, 440.00,  // E4, F4, G4, A4
        493.88, 523.25, 587.33, 493.88,  // B4, C5, D5, B4
        440.00, 392.00, 349.23, 329.63,  // A4, G4, F4, E4
        293.66, 329.63, 349.23, 392.00,  // D4, E4, F4, G4
        440.00, 493.88, 523.25, 587.33,  // A4, B4, C5, D5
        493.88, 440.00, 392.00, 329.63   // B4, A4, G4, E4
    ];
    const gameBass = [
        164.81, 164.81, 164.81, 164.81,  // E3
        196.00, 196.00, 196.00, 196.00,  // G3
        174.61, 174.61, 174.61, 174.61,  // F3
        164.81, 164.81, 164.81, 164.81,  // E3
        146.83, 146.83, 146.83, 146.83,  // D3
        146.83, 146.83, 146.83, 146.83,  // D3
        164.81, 164.81, 164.81, 164.81,  // E3
        196.00, 196.00, 196.00, 196.00   // G3
    ];
    let noteIndex = 0;

    gameMusicInterval = setInterval(() => {
        if (!musicEnabled) return;

        // Melody (triangle wave - softer than square)
        playNote(gameMelody[noteIndex], 0.25, 'triangle', 0.12, 0);
        // Bass line
        playNote(gameBass[noteIndex], 0.35, 'triangle', 0.1, 0);
        // Drum-like beat on every beat
        if (noteIndex % 2 === 0) {
            playNote(82.41, 0.15, 'square', 0.05, 0);  // E2 kick
        }
        if (noteIndex % 2 === 1) {
            playNote(110.00, 0.1, 'square', 0.04, 0);  // A2 snap
        }
        // Harmony on strong beats (every 8 notes)
        if (noteIndex % 8 === 0) {
            playNote(gameMelody[noteIndex] * 1.25, 0.5, 'triangle', 0.06, 0);  // 3rd
            playNote(gameMelody[noteIndex] * 1.5, 0.5, 'triangle', 0.06, 0);   // 5th
        }

        noteIndex = (noteIndex + 1) % gameMelody.length;
    }, 200);
}

function stopAllMusic() {
    if (menuMusicInterval) {
        clearInterval(menuMusicInterval);
        menuMusicInterval = null;
    }
    if (gameMusicInterval) {
        clearInterval(gameMusicInterval);
        gameMusicInterval = null;
    }
}

// Play sound effects
function playHitSound() {
    if (!audioCtx || !musicEnabled) return;
    playNote(200, 0.2, 'sawtooth', 0.15, 0);
    playNote(150, 0.3, 'sawtooth', 0.1, 0.05);
}

function playGameOverSound() {
    if (!audioCtx || !musicEnabled) return;
    playNote(400, 0.3, 'sine', 0.1, 0);
    playNote(350, 0.3, 'sine', 0.1, 0.3);
    playNote(300, 0.3, 'sine', 0.1, 0.6);
    playNote(200, 0.8, 'sine', 0.1, 0.9);
}

function playNewHighScoreSound() {
    if (!audioCtx || !musicEnabled) return;
    playNote(523.25, 0.2, 'sine', 0.1, 0);
    playNote(659.25, 0.2, 'sine', 0.1, 0.15);
    playNote(783.99, 0.2, 'sine', 0.1, 0.3);
    playNote(1046.50, 0.5, 'sine', 0.15, 0.45);
}

// Game settings
let settings = {
    difficulty: 'normal',
    playerSize: 'medium',
    theme: 'neon',
    language: 'en'
};

// Shop upgrades
let shopUpgrades = {
    swordLevel: 0,      // Max 3 levels (resets each game)
    speedLevel: 0,      // Max 5 levels (resets each game)
    swordCharges: 0     // Current charges for sword
};

const swordPrices = [100, 200, 350]; // Price for each sword level
const speedPrices = [150, 200, 250, 300, 400]; // Price for each speed level
const speedBoostPerLevel = 100; // Additional speed per upgrade
const maxSwordCharges = [3, 6, 10]; // Charges per sword level

// Translations
const translations = {
    en: {
        survivalGame: 'Survival Game',
        play: 'Play',
        settings: 'Settings',
        howToPlay: 'How to Play',
        highScores: 'High Scores',
        back: 'Back',
        difficulty: 'Difficulty:',
        playerSize: 'Player Size:',
        theme: 'Theme:',
        language: 'Language:',
        easy: 'Easy',
        normal: 'Normal',
        hard: 'Hard',
        small: 'Small',
        medium: 'Medium',
        large: 'Large',
        neon: 'Neon',
        dark: 'Dark',
        retro: 'Retro',
        english: 'English',
        indonesian: 'Bahasa Indonesia',
        italian: 'Italiano',
        spanish: 'Español',
        japanese: '日本語',
        korean: '한국어',
        german: 'Deutsch',
        getReady: 'Get Ready!',
        useWASD: 'Use WASD or Arrow Keys to move',
        survive: 'Survive as long as you can!',
        startGame: 'Start Game',
        backToMenu: 'Back to Menu',
        paused: 'Paused',
        resume: 'Resume',
        mainMenu: 'Main Menu',
        gameOver: 'Game Over',
        score: 'Score',
        time: 'Time',
        newHighScore: '🏆 New High Score!',
        playAgain: 'Play Again',
        noScores: 'No scores yet. Play the game to set a record!',
        moveUp: 'Move Up',
        moveDown: 'Move Down',
        moveLeft: 'Move Left',
        moveRight: 'Move Right',
        pauseGame: 'Pause Game',
        instructionText: 'Survive as long as possible! Enemies will spawn from all sides and get faster over time. Dodge them to stay alive!',
        health: 'Health',
        playerName: 'Player Name:',
        enterName: 'Enter name',
        lock: '🔒',
        confirmTitle: 'Change Name?',
        confirmYes: 'Yes',
        confirmNo: 'No',
        delete: 'Delete',
        deleteConfirm: 'Delete this score?',
        musicOn: 'Music On',
        musicOff: 'Music Off',
        sound: 'Sound:',
        soundOn: 'On',
        soundOff: 'Off',
        comingSoon: 'Coming Soon',
        chapterList: 'Chapter List',
        currentChapter: 'Current',
        completed: 'Completed',
        unlockText: 'Survive {0}s to unlock this',
        secondsUnit: 's',
        chaptersCompletedText: 'Chapters Completed',
        scrollDown: '⬇️ Scroll down',
        shop: '🛒 Shop',
        shopTitle: '🛒 Shop',
        shopCurrency: 'Available Score',
        sword: '⚔️ Sword',
        swordLevel: 'Level {0}/3',
        swordDesc: 'Deflects enemies back! (Max 3 upgrades)',
        swordCurrent: 'Current',
        swordNoSword: 'No sword',
        swordNext: 'Next',
        swordDeflection: '+1 deflection',
        swordMaxLevel: 'MAX LEVEL',
        speedBoost: '💨 Speed Boost',
        speedLevel: 'Level {0}/5',
        speedDesc: 'Increase movement speed! (Max 5 upgrades)',
        speedCurrent: 'Current',
        speedBase: 'Base speed',
        speedNext: 'Next',
        speedBonus: '+{0} speed',
        speedMaxLevel: 'MAX LEVEL',
        buyButton: 'Buy - {0} pts',
        maxLevelButton: 'MAX LEVEL',
        notEnoughScore: 'Not enough score!',
        back: 'Back',
        bossIncoming: '⚠️ BOSS INCOMING! ⚠️',
        prepareYourself: 'Prepare yourself!',
        chapter: 'Chapter'
    },
    id: {
        survivalGame: 'Game Bertahan Hidup',
        play: 'Main',
        settings: 'Pengaturan',
        howToPlay: 'Cara Bermain',
        highScores: 'Skor Tertinggi',
        back: 'Kembali',
        difficulty: 'Kesulitan:',
        playerSize: 'Ukuran Pemain:',
        theme: 'Tema:',
        language: 'Bahasa:',
        easy: 'Mudah',
        normal: 'Normal',
        hard: 'Sulit',
        small: 'Kecil',
        medium: 'Sedang',
        large: 'Besar',
        neon: 'Neon',
        dark: 'Gelap',
        retro: 'Retro',
        english: 'English',
        indonesian: 'Bahasa Indonesia',
        italian: 'Italiano',
        spanish: 'Español',
        japanese: '日本語',
        korean: '한국어',
        german: 'Deutsch',
        getReady: 'Bersiap!',
        useWASD: 'Gunakan WASD atau Tombol Panah untuk bergerak',
        survive: 'Bertahan selama kamu bisa!',
        startGame: 'Mulai Bermain',
        backToMenu: 'Kembali ke Menu',
        paused: 'Jeda',
        resume: 'Lanjutkan',
        mainMenu: 'Menu Utama',
        gameOver: 'Permainan Selesai',
        score: 'Skor',
        time: 'Waktu',
        newHighScore: '🏆 Skor Tertinggi Baru!',
        playAgain: 'Main Lagi',
        noScores: 'Belum ada skor. Mainkan game untuk mencetak rekor!',
        moveUp: 'Gerak ke Atas',
        moveDown: 'Gerak ke Bawah',
        moveLeft: 'Gerak ke Kiri',
        moveRight: 'Gerak ke Kanan',
        pauseGame: 'Jeda Permainan',
        instructionText: 'Bertahan selama mungkin! Musuh akan muncul dari semua sisi dan semakin cepat seiring waktu. Hindari mereka untuk tetap hidup!',
        health: 'Darah',
        playerName: 'Nama Pemain:',
        enterName: 'Masukkan nama',
        lock: '🔒',
        confirmTitle: 'Ganti Nama?',
        confirmYes: 'Ya',
        confirmNo: 'Tidak',
        delete: 'Hapus',
        deleteConfirm: 'Hapus skor ini?',
        musicOn: 'Musik Hidup',
        musicOff: 'Musik Mati',
        sound: 'Suara:',
        soundOn: 'Hidup',
        soundOff: 'Mati',
        comingSoon: 'Segera Hadir',
        chapterList: 'Daftar Chapter',
        currentChapter: 'Saat Ini',
        completed: 'Selesai',
        unlockText: 'Bertahan {0} detik untuk membuka ini',
        secondsUnit: '',
        chaptersCompletedText: 'Chapter Selesai',
        scrollDown: '⬇️ Scroll ke bawah',
        shop: '🛒 Toko',
        shopTitle: '🛒 Toko',
        shopCurrency: 'Skor Tersedia',
        sword: '⚔️ Pedang',
        swordLevel: 'Level {0}/3',
        swordDesc: 'Memantulkan musuh! (Maks 3 upgrade)',
        swordCurrent: 'Saat ini',
        swordNoSword: 'Tidak ada pedang',
        swordNext: 'Berikutnya',
        swordDeflection: '+1 pemantulan',
        swordMaxLevel: 'LEVEL MAKS',
        speedBoost: '💨 Kecepatan',
        speedLevel: 'Level {0}/5',
        speedDesc: 'Tingkatkan kecepatan gerak! (Maks 5 upgrade)',
        speedCurrent: 'Saat ini',
        speedBase: 'Kecepatan dasar',
        speedNext: 'Berikutnya',
        speedBonus: '+{0} kecepatan',
        speedMaxLevel: 'LEVEL MAKS',
        buyButton: 'Beli - {0} pts',
        maxLevelButton: 'LEVEL MAKS',
        notEnoughScore: 'Skor tidak cukup!',
        back: 'Kembali',
        bossIncoming: '⚠️ BOSS DATANG! ⚠️',
        prepareYourself: 'Bersiaplah!',
        chapter: 'Chapter'
    },
    it: {
        survivalGame: 'Gioco di Sopravvivenza',
        play: 'Gioca',
        settings: 'Impostazioni',
        howToPlay: 'Come Giocare',
        highScores: 'Punteggi Migliori',
        back: 'Indietro',
        difficulty: 'Difficoltà:',
        playerSize: 'Dimensione Giocatore:',
        theme: 'Tema:',
        language: 'Lingua:',
        easy: 'Facile',
        normal: 'Normale',
        hard: 'Difficile',
        small: 'Piccolo',
        medium: 'Medio',
        large: 'Grande',
        neon: 'Neon',
        dark: 'Scuro',
        retro: 'Retro',
        english: 'English',
        indonesian: 'Bahasa Indonesia',
        italian: 'Italiano',
        spanish: 'Español',
        japanese: '日本語',
        korean: '한국어',
        german: 'Deutsch',
        getReady: 'Preparati!',
        useWASD: 'Usa WASD o i Tasti Freccia per muoverti',
        survive: 'Sopravvivi più che puoi!',
        startGame: 'Inizia a Giocare',
        backToMenu: 'Torna al Menu',
        paused: 'In Pausa',
        resume: 'Riprendi',
        mainMenu: 'Menu Principale',
        gameOver: 'Game Over',
        score: 'Punteggio',
        time: 'Tempo',
        newHighScore: '🏆 Nuovo Punteggio Migliore!',
        playAgain: 'Gioca Ancora',
        noScores: 'Nessun punteggio ancora. Gioca per stabilire un record!',
        moveUp: 'Muovi Su',
        moveDown: 'Muovi Giù',
        moveLeft: 'Muovi a Sinistra',
        moveRight: 'Muovi a Destra',
        pauseGame: 'Metti in Pausa',
        instructionText: 'Sopravvivi più a lungo possibile! I nemici appariranno da tutti i lati e diventeranno più veloci nel tempo. Evitali per restare in vita!',
        health: 'Salute',
        playerName: 'Nome Giocatore:',
        enterName: 'Inserisci nome',
        lock: '🔒',
        confirmTitle: 'Cambiare Nome?',
        confirmYes: 'Sì',
        confirmNo: 'No',
        delete: 'Elimina',
        deleteConfirm: 'Eliminare questo punteggio?',
        musicOn: 'Musica Attiva',
        musicOff: 'Musica Disattivata',
        sound: 'Suono:',
        soundOn: 'Acceso',
        soundOff: 'Spento',
        comingSoon: 'Prossimamente',
        chapterList: 'Elenco Capitoli',
        currentChapter: 'Attuale',
        completed: 'Completato',
        unlockText: 'Sopravvivi {0}s per sbloccare questo',
        secondsUnit: 's',
        chaptersCompletedText: 'Capitoli Completati',
        scrollDown: '⬇️ Scorri verso il basso',
        shop: '🛒 Negozio',
        shopTitle: '🛒 Negozio',
        shopCurrency: 'Punteggio Disponibile',
        sword: '⚔️ Spada',
        swordLevel: 'Livello {0}/3',
        swordDesc: 'Respingi i nemici! (Max 3 aggiornamenti)',
        swordCurrent: 'Attuale',
        swordNoSword: 'Nessuna spada',
        swordNext: 'Prossimo',
        swordDeflection: '+1 deflessione',
        swordMaxLevel: 'LIVELLO MAX',
        speedBoost: '💨 Velocità',
        speedLevel: 'Livello {0}/5',
        speedDesc: 'Aumenta la velocità di movimento! (Max 5 aggiornamenti)',
        speedCurrent: 'Attuale',
        speedBase: 'Velocità base',
        speedNext: 'Prossimo',
        speedBonus: '+{0} velocità',
        speedMaxLevel: 'LIVELLO MAX',
        buyButton: 'Compra - {0} pts',
        maxLevelButton: 'LIVELLO MAX',
        notEnoughScore: 'Punteggio insufficiente!',
        back: 'Indietro'
    },
    es: {
        survivalGame: 'Juego de Supervivencia',
        play: 'Jugar',
        settings: 'Ajustes',
        howToPlay: 'Cómo Jugar',
        highScores: 'Mejores Puntuaciones',
        back: 'Atrás',
        difficulty: 'Dificultad:',
        playerSize: 'Tamaño del Jugador:',
        theme: 'Tema:',
        language: 'Idioma:',
        easy: 'Fácil',
        normal: 'Normal',
        hard: 'Difícil',
        small: 'Pequeño',
        medium: 'Mediano',
        large: 'Grande',
        neon: 'Neón',
        dark: 'Oscuro',
        retro: 'Retro',
        english: 'English',
        indonesian: 'Bahasa Indonesia',
        italian: 'Italiano',
        spanish: 'Español',
        japanese: '日本語',
        korean: '한국어',
        german: 'Deutsch',
        getReady: '¡Prepárate!',
        useWASD: 'Usa WASD o las Teclas de Flecha para moverte',
        survive: '¡Sobrevive todo lo que puedas!',
        startGame: 'Empezar a Jugar',
        backToMenu: 'Volver al Menú',
        paused: 'En Pausa',
        resume: 'Reanudar',
        mainMenu: 'Menú Principal',
        gameOver: 'Fin del Juego',
        score: 'Puntuación',
        time: 'Tiempo',
        newHighScore: '🏆 ¡Nueva Mejor Puntuación!',
        playAgain: 'Jugar de Nuevo',
        noScores: '¡Aún no hay puntuaciones. ¡Juega para establecer un récord!',
        moveUp: 'Mover Arriba',
        moveDown: 'Mover Abajo',
        moveLeft: 'Mover a la Izquierda',
        moveRight: 'Mover a la Derecha',
        pauseGame: 'Pausar Juego',
        instructionText: '¡Sobrevive todo lo posible! Los enemigos aparecerán desde todos los lados y se volverán más rápidos con el tiempo. ¡Esquívalos para mantenerte con vida!',
        health: 'Salud',
        playerName: 'Nombre del Jugador:',
        enterName: 'Ingresa nombre',
        lock: '🔒',
        confirmTitle: '¿Cambiar Nombre?',
        confirmYes: 'Sí',
        confirmNo: 'No',
        delete: 'Eliminar',
        deleteConfirm: '¿Eliminar esta puntuación?',
        musicOn: 'Música Activada',
        musicOff: 'Música Desactivada',
        sound: 'Sonido:',
        soundOn: 'Encendido',
        soundOff: 'Apagado',
        comingSoon: 'Próximamente',
        chapterList: 'Lista de Capítulos',
        currentChapter: 'Actual',
        completed: 'Completado',
        unlockText: 'Sobrevive {0}s para desbloquear esto',
        secondsUnit: 's',
        chaptersCompletedText: 'Capítulos Completados',
        scrollDown: '⬇️ Desplázate hacia abajo',
        shop: '🛒 Tienda',
        shopTitle: '🛒 Tienda',
        shopCurrency: 'Puntuación Disponible',
        sword: '⚔️ Espada',
        swordLevel: 'Nivel {0}/3',
        swordDesc: '¡Repele enemigos! (Máx 3 mejoras)',
        swordCurrent: 'Actual',
        swordNoSword: 'Sin espada',
        swordNext: 'Siguiente',
        swordDeflection: '+1 deflexión',
        swordMaxLevel: 'NIVEL MÁX',
        speedBoost: '💨 Velocidad',
        speedLevel: 'Nivel {0}/5',
        speedDesc: '¡Aumenta la velocidad de movimiento! (Máx 5 mejoras)',
        speedCurrent: 'Actual',
        speedBase: 'Velocidad base',
        speedNext: 'Siguiente',
        speedBonus: '+{0} velocidad',
        speedMaxLevel: 'NIVEL MÁX',
        buyButton: 'Comprar - {0} pts',
        maxLevelButton: 'NIVEL MÁX',
        notEnoughScore: '¡Puntuación insuficiente!',
        back: 'Atrás'
    },
    ja: {
        survivalGame: 'サバイバルゲーム',
        play: 'プレイ',
        settings: '設定',
        howToPlay: '遊び方',
        highScores: 'ハイスコア',
        back: '戻る',
        difficulty: '難易度:',
        playerSize: 'プレイヤーサイズ:',
        theme: 'テーマ:',
        language: '言語:',
        easy: '簡単',
        normal: '普通',
        hard: '難しい',
        small: '小',
        medium: '中',
        large: '大',
        neon: 'ネオン',
        dark: 'ダーク',
        retro: 'レトロ',
        english: 'English',
        indonesian: 'Bahasa Indonesia',
        italian: 'Italiano',
        spanish: 'Español',
        japanese: '日本語',
        korean: '한국어',
        german: 'Deutsch',
        getReady: '準備して！',
        useWASD: 'WASDまたは矢印キーで移動',
        survive: 'できるだけ長く生き延びよう！',
        startGame: 'ゲームスタート',
        backToMenu: 'メニューに戻る',
        paused: '一時停止',
        resume: '再開',
        mainMenu: 'メインメニュー',
        gameOver: 'ゲームオーバー',
        score: 'スコア',
        time: '時間',
        newHighScore: '🏆 新ハイスコア！',
        playAgain: 'もう一度プレイ',
        noScores: 'まだスコアがありません。プレイして記録を樹立しよう！',
        moveUp: '上に移動',
        moveDown: '下に移動',
        moveLeft: '左に移動',
        moveRight: '右に移動',
        pauseGame: '一時停止',
        instructionText: 'できるだけ長く生き延びよう！敵は全方向から出現し、時間とともに速くなります。避けて生き残れ！',
        health: '体力',
        playerName: 'プレイヤー名:',
        enterName: '名前を入力',
        lock: '🔒',
        confirmTitle: '名前を変更しますか？',
        confirmYes: 'はい',
        confirmNo: 'いいえ',
        delete: '削除',
        deleteConfirm: 'このスコアを削除しますか？',
        musicOn: '音楽オン',
        musicOff: '音楽オフ',
        sound: 'サウンド:',
        soundOn: 'オン',
        soundOff: 'オフ',
        comingSoon: '近日公開',
        chapterList: 'チャプターリスト',
        currentChapter: '現在',
        completed: '完了',
        unlockText: 'このチャプターを開くには{0}秒生き残ろう',
        secondsUnit: 's',
        chaptersCompletedText: 'クリアしたチャプター',
        scrollDown: '⬇️ 下にスクロール',
        shop: '🛒 ショップ',
        shopTitle: '🛒 ショップ',
        shopCurrency: '利用可能スコア',
        sword: '⚔️ 剣',
        swordLevel: 'レベル {0}/3',
        swordDesc: '敵を反射！(最大3アップグレード)',
        swordCurrent: '現在',
        swordNoSword: '剣なし',
        swordNext: '次',
        swordDeflection: '+1 反射',
        swordMaxLevel: 'MAXレベル',
        speedBoost: '💨 速度',
        speedLevel: 'レベル {0}/5',
        speedDesc: '移動速度上昇！(最大5アップグレード)',
        speedCurrent: '現在',
        speedBase: '基本速度',
        speedNext: '次',
        speedBonus: '+{0} 速度',
        speedMaxLevel: 'MAXレベル',
        buyButton: '購入 - {0} pts',
        maxLevelButton: 'MAXレベル',
        notEnoughScore: 'スコアが足りない！',
        back: '戻る'
    },
    ko: {
        survivalGame: '서바이벌 게임',
        play: '플레이',
        settings: '설정',
        howToPlay: '플레이 방법',
        highScores: '최고 점수',
        back: '뒤로',
        difficulty: '난이도:',
        playerSize: '플레이어 크기:',
        theme: '테마:',
        language: '언어:',
        easy: '쉬움',
        normal: '보통',
        hard: '어려움',
        small: '작게',
        medium: '중간',
        large: '크게',
        neon: '네온',
        dark: '다크',
        retro: '레트로',
        english: 'English',
        indonesian: 'Bahasa Indonesia',
        italian: 'Italiano',
        spanish: 'Español',
        japanese: '日本語',
        korean: '한국어',
        german: 'Deutsch',
        getReady: '준비하세요!',
        useWASD: 'WASD 또는 화살표 키로 이동',
        survive: '가능한 한 오래 살아남으세요!',
        startGame: '게임 시작',
        backToMenu: '메뉴로 돌아가기',
        paused: '일시정지',
        resume: '계속하기',
        mainMenu: '메인 메뉴',
        gameOver: '게임 오버',
        score: '점수',
        time: '시간',
        newHighScore: '🏆 새로운 최고 점수!',
        playAgain: '다시 플레이',
        noScores: '아직 점수가 없습니다. 플레이하여 기록을 세우세요!',
        moveUp: '위로 이동',
        moveDown: '아래로 이동',
        moveLeft: '왼쪽으로 이동',
        moveRight: '오른쪽으로 이동',
        pauseGame: '게임 일시정지',
        instructionText: '가능한 한 오래 살아남으세요! 적들은 모든 방향에서 나타나 시간이 지날수록 빨라집니다. 피해서 살아남으세요!',
        health: '체력',
        playerName: '플레이어 이름:',
        enterName: '이름 입력',
        lock: '🔒',
        confirmTitle: '이름을 변경하시겠습니까?',
        confirmYes: '예',
        confirmNo: '아니요',
        delete: '삭제',
        deleteConfirm: '이 점수를 삭제하시겠습니까?',
        musicOn: '음악 켜짐',
        musicOff: '음악 꺼짐',
        sound: '사운드:',
        soundOn: '켜짐',
        soundOff: '꺼짐',
        comingSoon: '곧 출시',
        chapterList: '챕터 목록',
        currentChapter: '현재',
        completed: '완료',
        unlockText: '잠금 해제하려면 {0}초 생존',
        secondsUnit: 's',
        chaptersCompletedText: '완료된 챕터',
        scrollDown: '⬇️ 아래로 스크롤',
        shop: '🛒 상점',
        shopTitle: '🛒 상점',
        shopCurrency: '사용 가능 점수',
        sword: '⚔️ 검',
        swordLevel: '레벨 {0}/3',
        swordDesc: '적을 반사! (최대 3 업그레이드)',
        swordCurrent: '현재',
        swordNoSword: '검 없음',
        swordNext: '다음',
        swordDeflection: '+1 반사',
        swordMaxLevel: '최대 레벨',
        speedBoost: '💨 속도',
        speedLevel: '레벨 {0}/5',
        speedDesc: '이동 속도 증가! (최대 5 업그레이드)',
        speedCurrent: '현재',
        speedBase: '기본 속도',
        speedNext: '다음',
        speedBonus: '+{0} 속도',
        speedMaxLevel: '최대 레벨',
        buyButton: '구매 - {0} pts',
        maxLevelButton: '최대 레벨',
        notEnoughScore: '점수가 부족합니다!',
        back: '뒤로'
    },
    de: {
        survivalGame: 'Überlebensspiel',
        play: 'Spielen',
        settings: 'Einstellungen',
        howToPlay: 'Spielanleitung',
        highScores: 'Bestenliste',
        back: 'Zurück',
        difficulty: 'Schwierigkeit:',
        playerSize: 'Spielergröße:',
        theme: 'Thema:',
        language: 'Sprache:',
        easy: 'Leicht',
        normal: 'Normal',
        hard: 'Schwer',
        small: 'Klein',
        medium: 'Mittel',
        large: 'Groß',
        neon: 'Neon',
        dark: 'Dunkel',
        retro: 'Retro',
        english: 'English',
        indonesian: 'Bahasa Indonesia',
        italian: 'Italiano',
        spanish: 'Español',
        japanese: '日本語',
        korean: '한국어',
        german: 'Deutsch',
        getReady: 'Mach dich bereit!',
        useWASD: 'Benutze WASD oder Pfeiltasten zum Bewegen',
        survive: 'Überlebe so lange du kannst!',
        startGame: 'Spiel Starten',
        backToMenu: 'Zurück zum Menü',
        paused: 'Pausiert',
        resume: 'Fortsetzen',
        mainMenu: 'Hauptmenü',
        gameOver: 'Spiel Vorbei',
        score: 'Punktzahl',
        time: 'Zeit',
        newHighScore: '🏆 Neue Bestpunktzahl!',
        playAgain: 'Nochmal Spielen',
        noScores: 'Noch keine Punktzahlen. Spiele, um einen Rekord aufzustellen!',
        moveUp: 'Nach Oben',
        moveDown: 'Nach Unten',
        moveLeft: 'Nach Links',
        moveRight: 'Nach Rechts',
        pauseGame: 'Spiel Pausieren',
        instructionText: 'Überlebe so lange wie möglich! Feinde erscheinen von allen Seiten und werden mit der Zeit schneller. Weiche ihnen aus, um am Leben zu bleiben!',
        health: 'Gesundheit',
        playerName: 'Spielername:',
        enterName: 'Name eingeben',
        lock: '🔒',
        confirmTitle: 'Namen ändern?',
        confirmYes: 'Ja',
        confirmNo: 'Nein',
        delete: 'Löschen',
        deleteConfirm: 'Diesen Punktzahl löschen?',
        musicOn: 'Musik An',
        musicOff: 'Musik Aus',
        sound: 'Ton:',
        soundOn: 'An',
        soundOff: 'Aus',
        comingSoon: 'Demnächst',
        chapterList: 'Kapitelliste',
        currentChapter: 'Aktuell',
        completed: 'Abgeschlossen',
        unlockText: 'Überlebe {0}s, um dies freizuschalten',
        secondsUnit: 's',
        chaptersCompletedText: 'Abgeschlossene Kapitel',
        scrollDown: '⬇️ Nach unten scrollen',
        shop: '🛒 Shop',
        shopTitle: '🛒 Shop',
        shopCurrency: 'Verfügbare Punkte',
        sword: '⚔️ Schwert',
        swordLevel: 'Stufe {0}/3',
        swordDesc: 'Feinde abwehren! (Max 3 Upgrades)',
        swordCurrent: 'Aktuell',
        swordNoSword: 'Kein Schwert',
        swordNext: 'Nächstes',
        swordDeflection: '+1 Abwehr',
        swordMaxLevel: 'MAX STUFE',
        speedBoost: '💨 Geschwindigkeit',
        speedLevel: 'Stufe {0}/5',
        speedDesc: 'Bewegungsgeschwindigkeit erhöhen! (Max 5 Upgrades)',
        speedCurrent: 'Aktuell',
        speedBase: 'Basisgeschwindigkeit',
        speedNext: 'Nächstes',
        speedBonus: '+{0} Geschwindigkeit',
        speedMaxLevel: 'MAX STUFE',
        buyButton: 'Kaufen - {0} Pkt',
        maxLevelButton: 'MAX STUFE',
        notEnoughScore: 'Nicht genug Punkte!',
        back: 'Zurück'
    }
};

// Helper to format strings with placeholders like "Survive {0}s to unlock"
function formatString(str, ...args) {
    return str.replace(/\{(\d+)\}/g, (match, index) => args[index] || '');
}

function t(key) {
    return translations[settings.language]?.[key] || translations.en[key];
}

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem('survivalGameSettings');
    if (saved) {
        settings = JSON.parse(saved);
        document.getElementById('difficultySelect').value = settings.difficulty;
        document.getElementById('playerSizeSelect').value = settings.playerSize;
        document.getElementById('themeSelect').value = settings.theme;
        document.getElementById('languageSelect').value = settings.language;
        applySettings();
        updateLanguage();
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('survivalGameSettings', JSON.stringify(settings));
}

// Apply settings to game
function applySettings() {
    // Check if player is defined first
    if (typeof player === 'undefined') {
        console.warn('applySettings: player not defined yet, skipping');
        return;
    }
    
    // Apply player size
    const sizeMap = { small: 30, medium: 40, large: 50 };
    const size = sizeMap[settings.playerSize];
    player.width = size;
    player.height = size;

    // Apply difficulty
    const diffMap = {
        easy: { spawnRate: 2000, damageMult: 0.7, speedMult: 0.8 },
        normal: { spawnRate: 1500, damageMult: 1, speedMult: 1 },
        hard: { spawnRate: 800, damageMult: 1.5, speedMult: 1.3 }
    };
    const diff = diffMap[settings.difficulty];
    enemySpawnRate = diff.spawnRate;

    // Apply theme - update grid color and canvas background
    const themeMap = {
        neon: { bg: '#0f0f23', grid: 'rgba(0, 255, 255, 0.1)', playerColor: '#00ffff', enemyHue: 'red-orange' },
        dark: { bg: '#000000', grid: 'rgba(255, 255, 255, 0.05)', playerColor: '#888888', enemyHue: 'monochrome' },
        retro: { bg: '#000000', grid: 'rgba(0, 255, 0, 0.15)', playerColor: '#00ff00', enemyHue: 'green' }
    };
    const theme = themeMap[settings.theme];
    gridColor = theme.grid;
    canvasBgColor = theme.bg;
    playerColor = theme.playerColor;
}

// Apply shop upgrades to player (called at game start)
function applyShopUpgrades() {
    // Apply speed upgrades for this game
    const speedBonus = shopUpgrades.speedLevel * speedBoostPerLevel;
    player.speed = 300 + speedBonus;
    
    // Apply sword charges for this game
    if (shopUpgrades.swordLevel > 0) {
        shopUpgrades.swordCharges = maxSwordCharges[shopUpgrades.swordLevel - 1];
    } else {
        shopUpgrades.swordCharges = 0;
    }
}

// Update in-game shop display
function updateInGameShopDisplay() {
    const swordDisplay = document.getElementById('swordDisplay');
    if (swordDisplay) {
        const charges = shopUpgrades.swordCharges;
        const maxCharges = shopUpgrades.swordLevel > 0 ? maxSwordCharges[shopUpgrades.swordLevel - 1] : 0;
        swordDisplay.textContent = `⚔️ ${charges}/${maxCharges}`;
    }
    
    const speedDisplay = document.getElementById('speedDisplay');
    if (speedDisplay) {
        const bonus = shopUpgrades.speedLevel * speedBoostPerLevel;
        speedDisplay.textContent = `💨 +${bonus}`;
    }
}

// Update shop UI
function updateShopUI() {
    const shopCurrency = document.getElementById('shopCurrency');
    if (shopCurrency) {
        shopCurrency.textContent = `${t('shopCurrency')}: ${score}`;
    }

    // Sword shop
    const swordLevel = document.getElementById('shopSwordLevel');
    if (swordLevel) {
        swordLevel.textContent = formatString(t('swordLevel'), shopUpgrades.swordLevel);
    }

    const swordStat = document.getElementById('shopSwordStat');
    if (swordStat) {
        if (shopUpgrades.swordLevel === 0) {
            swordStat.textContent = `${t('swordCurrent')}: ${t('swordNoSword')}`;
        } else {
            const maxCharges = maxSwordCharges[shopUpgrades.swordLevel - 1];
            swordStat.textContent = `${t('swordCurrent')}: Level ${shopUpgrades.swordLevel} - ${maxCharges} charges`;
        }
    }

    const swordNextStat = document.getElementById('shopSwordNextStat');
    if (swordNextStat) {
        if (shopUpgrades.swordLevel >= 3) {
            swordNextStat.textContent = t('swordMaxLevel');
        } else {
            const nextCharges = maxSwordCharges[shopUpgrades.swordLevel];
            swordNextStat.textContent = `${t('swordNext')}: Level ${shopUpgrades.swordLevel + 1} - ${nextCharges} deflections/game`;
        }
    }

    const swordBuyBtn = document.getElementById('shopSwordBuyBtn');
    if (swordBuyBtn) {
        if (shopUpgrades.swordLevel >= 3) {
            swordBuyBtn.textContent = t('maxLevelButton');
            swordBuyBtn.disabled = true;
            swordBuyBtn.classList.add('max-level');
        } else {
            const price = swordPrices[shopUpgrades.swordLevel];
            swordBuyBtn.textContent = formatString(t('buyButton'), price);
            swordBuyBtn.disabled = score < price;
            swordBuyBtn.classList.remove('max-level');
        }
    }

    // Speed shop
    const speedLevel = document.getElementById('shopSpeedLevel');
    if (speedLevel) {
        speedLevel.textContent = formatString(t('speedLevel'), shopUpgrades.speedLevel);
    }

    const speedStat = document.getElementById('shopSpeedStat');
    if (speedStat) {
        if (shopUpgrades.speedLevel === 0) {
            speedStat.textContent = `${t('speedCurrent')}: ${t('speedBase')} (300)`;
        } else {
            const currentSpeed = 300 + shopUpgrades.speedLevel * speedBoostPerLevel;
            speedStat.textContent = `${t('speedCurrent')}: ${currentSpeed} speed (+${shopUpgrades.speedLevel * speedBoostPerLevel})`;
        }
    }

    const speedNextStat = document.getElementById('shopSpeedNextStat');
    if (speedNextStat) {
        if (shopUpgrades.speedLevel >= 5) {
            speedNextStat.textContent = t('speedMaxLevel');
        } else {
            const nextSpeed = 300 + (shopUpgrades.speedLevel + 1) * speedBoostPerLevel;
            speedNextStat.textContent = `${t('speedNext')}: ${nextSpeed} speed (${formatString(t('speedBonus'), speedBoostPerLevel)})`;
        }
    }

    const speedBuyBtn = document.getElementById('shopSpeedBuyBtn');
    if (speedBuyBtn) {
        if (shopUpgrades.speedLevel >= 5) {
            speedBuyBtn.textContent = t('maxLevelButton');
            speedBuyBtn.disabled = true;
            speedBuyBtn.classList.add('max-level');
        } else {
            const price = speedPrices[shopUpgrades.speedLevel];
            speedBuyBtn.textContent = formatString(t('buyButton'), price);
            speedBuyBtn.disabled = score < price;
            speedBuyBtn.classList.remove('max-level');
        }
    }
}

// Update language for all UI elements
function updateLanguage() {
    try {
    // Main Menu
    const mainMenuH1 = document.querySelector('#mainMenu h1');
    if (mainMenuH1) mainMenuH1.textContent = t('survivalGame');
    const playBtn = document.getElementById('playBtn');
    if (playBtn) playBtn.textContent = t('play');
    const chaptersBtn = document.getElementById('chaptersBtn');
    if (chaptersBtn) chaptersBtn.textContent = 'Chapters';
    const settingsBtn = document.getElementById('settingsBtn');
    if (settingsBtn) settingsBtn.textContent = t('settings');
    const howToPlayBtn = document.getElementById('howToPlayBtn');
    if (howToPlayBtn) howToPlayBtn.textContent = t('howToPlay');
    const highScoresBtn = document.getElementById('highScoresBtn');
    if (highScoresBtn) highScoresBtn.textContent = t('highScores');

    // Settings
    const settingsH1 = document.querySelector('#settingsScreen h1');
    if (settingsH1) settingsH1.textContent = t('settings');
    const settingLabels = document.querySelectorAll('#settingsScreen .setting-item label');
    if (settingLabels.length >= 5) {
        settingLabels[0].textContent = t('playerName');
        settingLabels[1].textContent = t('difficulty');
        settingLabels[2].textContent = t('playerSize');
        settingLabels[3].textContent = t('theme');
        settingLabels[4].textContent = t('language');
    }
    const nameInput = document.getElementById('playerNameInput');
    if (nameInput) nameInput.placeholder = t('enterName');

    // Update scroll hint
    const scrollHint = document.querySelector('.scroll-hint');
    if (scrollHint) scrollHint.textContent = t('scrollDown');

    // Difficulty options
    const diffEasy = document.querySelector('#difficultySelect option[value="easy"]');
    if (diffEasy) diffEasy.textContent = t('easy');
    const diffNormal = document.querySelector('#difficultySelect option[value="normal"]');
    if (diffNormal) diffNormal.textContent = t('normal');
    const diffHard = document.querySelector('#difficultySelect option[value="hard"]');
    if (diffHard) diffHard.textContent = t('hard');

    // Player size options
    const sizeSmall = document.querySelector('#playerSizeSelect option[value="small"]');
    if (sizeSmall) sizeSmall.textContent = t('small');
    const sizeMedium = document.querySelector('#playerSizeSelect option[value="medium"]');
    if (sizeMedium) sizeMedium.textContent = t('medium');
    const sizeLarge = document.querySelector('#playerSizeSelect option[value="large"]');
    if (sizeLarge) sizeLarge.textContent = t('large');

    // Theme options
    const themeNeon = document.querySelector('#themeSelect option[value="neon"]');
    if (themeNeon) themeNeon.textContent = t('neon');
    const themeDark = document.querySelector('#themeSelect option[value="dark"]');
    if (themeDark) themeDark.textContent = t('dark');
    const themeRetro = document.querySelector('#themeSelect option[value="retro"]');
    if (themeRetro) themeRetro.textContent = t('retro');

    // Language options
    const langEn = document.querySelector('#languageSelect option[value="en"]');
    if (langEn) langEn.textContent = t('english');
    const langId = document.querySelector('#languageSelect option[value="id"]');
    if (langId) langId.textContent = t('indonesian');
    const langIt = document.querySelector('#languageSelect option[value="it"]');
    if (langIt) langIt.textContent = t('italian');
    const langEs = document.querySelector('#languageSelect option[value="es"]');
    if (langEs) langEs.textContent = t('spanish');
    const langJa = document.querySelector('#languageSelect option[value="ja"]');
    if (langJa) langJa.textContent = t('japanese');
    const langKo = document.querySelector('#languageSelect option[value="ko"]');
    if (langKo) langKo.textContent = t('korean');
    const langDe = document.querySelector('#languageSelect option[value="de"]');
    if (langDe) langDe.textContent = t('german');

    const settingsBackBtn = document.getElementById('settingsBackBtn');
    if (settingsBackBtn) settingsBackBtn.textContent = t('back');
    const setNameBtn = document.getElementById('setNameBtn');
    if (setNameBtn) setNameBtn.textContent = t('lock');

    // Sound setting
    const soundLabel = document.querySelector('#settingsScreen .setting-item:nth-child(6) label');
    if (soundLabel) soundLabel.textContent = t('sound');
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) soundBtn.title = musicEnabled ? t('soundOff') : t('soundOn');
    updateSoundButton();

    // Name change modal
    const modalH2 = document.querySelector('#nameChangeModal h2');
    if (modalH2) modalH2.textContent = t('confirmTitle');
    const confirmBtn = document.getElementById('confirmNameChange');
    if (confirmBtn) confirmBtn.textContent = t('confirmYes');
    const cancelBtn = document.getElementById('cancelNameChange');
    if (cancelBtn) cancelBtn.textContent = t('confirmNo');

    // How to Play
    const htpH1 = document.querySelector('#howToPlayScreen h1');
    if (htpH1) htpH1.textContent = t('howToPlay');
    const instructions = document.querySelectorAll('#howToPlayScreen .instruction-item span:last-child');
    if (instructions.length >= 5) {
        instructions[0].textContent = t('moveUp');
        instructions[1].textContent = t('moveDown');
        instructions[2].textContent = t('moveLeft');
        instructions[3].textContent = t('moveRight');
        instructions[4].textContent = t('pauseGame');
    }
    const instructionText = document.querySelector('#howToPlayScreen .instruction-text');
    if (instructionText) instructionText.textContent = t('instructionText');
    const htpBackBtn = document.getElementById('howToPlayBackBtn');
    if (htpBackBtn) htpBackBtn.textContent = t('back');

    // High Scores
    const hsH1 = document.querySelector('#highScoresScreen h1');
    if (hsH1) hsH1.textContent = t('highScores');
    const noScores = document.querySelector('#highScoresScreen .no-scores');
    if (noScores) noScores.textContent = t('noScores');
    const hsBackBtn = document.getElementById('highScoresBackBtn');
    if (hsBackBtn) hsBackBtn.textContent = t('back');

    // Chapter List Screen
    const clBackBtn = document.getElementById('chapterListBackBtn');
    if (clBackBtn) clBackBtn.textContent = t('back');

    // Start Screen
    const startTitle = document.getElementById('startScreenTitle');
    if (startTitle) startTitle.textContent = t('getReady');
    const startControls = document.getElementById('startScreenControls');
    if (startControls) startControls.textContent = t('useWASD');
    const startSurvive = document.getElementById('startScreenSurvive');
    if (startSurvive) startSurvive.textContent = t('survive');
    const startBtn = document.getElementById('startBtn');
    if (startBtn) startBtn.textContent = t('startGame');
    const shopBtn = document.getElementById('shopBtn');
    if (shopBtn) shopBtn.textContent = t('shop');
    const menuBtn = document.getElementById('menuBtn');
    if (menuBtn) menuBtn.textContent = t('backToMenu');

    // Pause Screen
    const pauseH1 = document.querySelector('#pauseScreen h1');
    if (pauseH1) pauseH1.textContent = t('paused');
    const resumeBtn = document.getElementById('resumeBtn');
    if (resumeBtn) resumeBtn.textContent = t('resume');
    const pauseMenuBtn = document.getElementById('pauseMenuBtn');
    if (pauseMenuBtn) pauseMenuBtn.textContent = t('mainMenu');

    // Game Over Screen
    const goH1 = document.querySelector('#gameOverScreen h1');
    if (goH1) goH1.textContent = t('gameOver');
    const newHS = document.getElementById('newHighScore');
    if (newHS) newHS.textContent = t('newHighScore');
    const restartBtn = document.getElementById('restartBtn');
    if (restartBtn) restartBtn.textContent = t('playAgain');
    const goMenuBtn = document.getElementById('gameOverMenuBtn');
    if (goMenuBtn) goMenuBtn.textContent = t('mainMenu');
    } catch (e) {
        console.error('Error in updateLanguage:', e);
    }
}

let gridColor = 'rgba(0, 255, 255, 0.1)';
let canvasBgColor = '#0f0f23';
let playerColor = '#00ffff'; // Initialize with default neon color

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let gameTime = 0;
let lastTime = 0;
let enemySpawnTimer = 0;
let enemySpawnRate = 1500; // ms

// Chapter system
let currentChapter = 1;
const chapterTimes = {
    1: 120,  // Chapter 1: 120 seconds
    2: 180,  // Chapter 2: 180 seconds (3 minutes)
    3: 300,  // Chapter 3: 300 seconds (5 minutes)
    4: 480,  // Chapter 4: 480 seconds (8 minutes)
    5: 600   // Chapter 5: 600 seconds (10 minutes)
};
let chapterCompleted = false; // Prevent multiple triggers
let chapterTimeStart = 0; // Track time since chapter started

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    speed: 300, // pixels per second
    health: 100,
    maxHealth: 100,
    color: '#00ffff',
    invulnerable: false,
    invulnerableTime: 0
};

// High scores
let highScores = [];
let playerName = 'Anonymous';
let nameAutoSaved = false; // Flag to track if name was auto-saved from leaderboard
let hasExistingScore = false; // Track if player has existing scores

function loadHighScores() {
    const saved = localStorage.getItem('survivalGameHighScores');
    if (saved) {
        highScores = JSON.parse(saved);
    }
    
    // Also load the highest score separately to ensure it's preserved
    const highestSaved = localStorage.getItem('survivalGameHighestScore');
    if (highestSaved) {
        const highest = JSON.parse(highestSaved);
        // Check if it's not already in the array
        const exists = highScores.some(entry => 
            entry.name === highest.name && entry.score === highest.score
        );
        if (!exists) {
            highScores.unshift(highest);
            highScores.sort((a, b) => b.score - a.score);
            localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));
        }
    }

    // Load player name
    const savedName = localStorage.getItem('survivalGamePlayerName');
    if (savedName) {
        playerName = savedName;
        nameAutoSaved = true; // Name already saved before
    }

    // Check if player has existing scores
    if (highScores.length > 0 && playerName !== 'Anonymous') {
        hasExistingScore = highScores.some(entry => entry.name === playerName);
    }

    // Update name input in settings
    updateNameInputUI();
}

function updateNameInputUI() {
    const nameInput = document.getElementById('playerNameInput');
    
    if (nameInput) {
        nameInput.value = playerName;
    }
}

function confirmNameChange() {
    const nameInput = document.getElementById('playerNameInput');
    const newName = nameInput.value.trim();

    if (!newName) {
        return;
    }

    // If player has existing scores, warn about name change
    if (hasExistingScore && playerName !== 'Anonymous') {
        showNameChangeWarningModal(newName);
    } else {
        showNameChangeModal(newName);
    }
}

function showNameChangeWarningModal(newName) {
    const modal = document.getElementById('nameChangeModal');
    const modalTitle = document.querySelector('#nameChangeModal h2');
    const confirmBtn = document.getElementById('confirmNameChange');
    const cancelBtn = document.getElementById('cancelNameChange');

    modalTitle.textContent = `⚠️ Change name from "${playerName}" to "${newName}"? This will affect your saved scores.`;
    confirmBtn.textContent = t('confirmYes');
    cancelBtn.textContent = t('confirmNo');

    modal.classList.remove('hidden');

    confirmBtn.onclick = () => {
        playerName = newName.substring(0, 15);
        localStorage.setItem('survivalGamePlayerName', playerName);
        updateNameInputUI();
        hasExistingScore = false;
        modal.classList.add('hidden');
        // Reset modal text
        modalTitle.textContent = t('confirmTitle');
        confirmBtn.textContent = t('confirmYes');
        cancelBtn.textContent = t('confirmNo');
    };

    cancelBtn.onclick = () => {
        updateNameInputUI(); // Reset input to current name
        modal.classList.add('hidden');
        // Reset modal text
        modalTitle.textContent = t('confirmTitle');
        confirmBtn.textContent = t('confirmYes');
        cancelBtn.textContent = t('confirmNo');
    };
}

function showNameChangeModal(newName) {
    const modal = document.getElementById('nameChangeModal');
    const confirmBtn = document.getElementById('confirmNameChange');
    const cancelBtn = document.getElementById('cancelNameChange');
    
    modal.classList.remove('hidden');
    
    confirmBtn.onclick = () => {
        playerName = newName.substring(0, 15);
        localStorage.setItem('survivalGamePlayerName', playerName);
        updateNameInputUI();
        modal.classList.add('hidden');
    };
    
    cancelBtn.onclick = () => {
        updateNameInputUI(); // Reset input to current name
        modal.classList.add('hidden');
    };
}

function saveHighScore(score, time) {
    // Check if entry with same name already exists
    const existingIndex = highScores.findIndex(entry => entry.name === playerName);

    if (existingIndex !== -1) {
        // Update only if new score is higher
        if (score > highScores[existingIndex].score) {
            highScores[existingIndex].score = score;
            highScores[existingIndex].time = time;
            highScores[existingIndex].date = new Date().toLocaleDateString();
            highScores[existingIndex].difficulty = settings.difficulty;
            highScores[existingIndex].chapter = currentChapter;
        }
    } else {
        // Add new entry
        highScores.push({ name: playerName, score, time, date: new Date().toLocaleDateString(), difficulty: settings.difficulty, chapter: currentChapter });
        hasExistingScore = true;
    }

    // Auto-save highest score to top position
    highScores.sort((a, b) => b.score - a.score);

    // Save highest score separately for persistence
    if (highScores.length > 0) {
        localStorage.setItem('survivalGameHighestScore', JSON.stringify(highScores[0]));
    }

    highScores = highScores.slice(0, 10); // Keep top 10
    localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));
}

function isNewHighScore(score) {
    if (highScores.length < 10) return true;
    return score > highScores[highScores.length - 1].score;
}

function displayHighScores() {
    // Auto-save name from leaderboard if not already set
    if (!nameAutoSaved && highScores.length > 0) {
        // Find first non-Anonymous entry to auto-save
        for (const entry of highScores) {
            if (entry.name && entry.name !== 'Anonymous') {
                playerName = entry.name;
                localStorage.setItem('survivalGamePlayerName', playerName);
                nameAutoSaved = true;
                updateNameInputUI();
                break;
            }
        }
    }
    
    // Ensure scores are sorted by highest first
    highScores.sort((a, b) => b.score - a.score);
    localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));

    const scoresList = document.getElementById('scoresList');
    if (highScores.length === 0) {
        scoresList.innerHTML = `<p class="no-scores">${t('noScores')}</p>`;
        return;
    }

    // Get the highest score
    const highestScore = highScores.length > 0 ? highScores[0].score : 0;
    
    // Find player's highest score
    let playerHighestScore = -1;
    highScores.forEach(entry => {
        if (entry.name === playerName && entry.score > playerHighestScore) {
            playerHighestScore = entry.score;
        }
    });

    let html = '';

    // Add "Delete All My Scores" button if player has scores
    const playerScores = highScores.filter(entry => entry.name === playerName);
    if (playerScores.length > 0) {
        html += `
        <div class="delete-all-container" style="text-align: center; margin-bottom: 15px;">
            <button id="deleteAllScoresBtn" class="delete-all-btn">🗑️ Delete All My Scores (${playerScores.length})</button>
        </div>
    `;
    }

    // Display highest score first (highlighted)
    highScores.forEach((entry, index) => {
        const isOwnScore = entry.name === playerName;
        const isHighest = entry.score === highestScore;
        // Show delete button for ALL scores
        const deleteButton = `<button class="delete-btn" data-index="${index}" data-name="${entry.name}">🗑️</button>`;
        const difficultyText = entry.difficulty ? t(entry.difficulty) : '';
        const chapterText = entry.chapter ? `Chapter ${entry.chapter}` : 'Chapter 1';

        const entryClass = isHighest ? 'score-entry score-top' : 'score-entry';
        const crownIcon = isHighest ? '👑 ' : '';

        html += `
        <div class="${entryClass}">
            <span class="score-rank">${crownIcon}#${index + 1}</span>
            <span class="score-name">${entry.name || 'Anonymous'}</span>
            <span class="score-value">${t('score')}: ${entry.score}</span>
            <span class="score-time">${entry.time}s - ${entry.date}</span>
            <span class="score-chapter">📚 ${chapterText}</span>
            ${difficultyText ? `<span class="score-difficulty">${difficultyText}</span>` : ''}
            ${deleteButton}
        </div>
    `;
    });

    scoresList.innerHTML = html;

    // Add event listeners to delete buttons (use event delegation for reliability)
    scoresList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering other click events
            const index = parseInt(e.target.dataset.index);
            const name = e.target.dataset.name;
            console.log(`Delete score at index ${index} for player: ${name}`);
            deleteHighScore(index);
        });
    });

    // Add event listener for "Delete All My Scores" button
    const deleteAllBtn = document.getElementById('deleteAllScoresBtn');
    if (deleteAllBtn) {
        deleteAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            console.log(`Delete all scores for player: ${playerName}`);
            deleteAllMyScores();
        });
    } else {
        console.log(`No "Delete All" button found. Player has ${playerScores.length} scores.`);
    }
}

function deleteHighScore(index) {
    // Show confirmation modal
    const modal = document.getElementById('nameChangeModal');
    const modalTitle = document.querySelector('#nameChangeModal h2');
    const confirmBtn = document.getElementById('confirmNameChange');
    const cancelBtn = document.getElementById('cancelNameChange');
    
    modalTitle.textContent = t('deleteConfirm');
    confirmBtn.textContent = t('confirmYes');
    cancelBtn.textContent = t('confirmNo');
    
    modal.classList.remove('hidden');
    
    confirmBtn.onclick = () => {
        highScores.splice(index, 1);
        localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));
        displayHighScores();
        modal.classList.add('hidden');
        
        // Reset modal text
        modalTitle.textContent = t('confirmTitle');
        confirmBtn.textContent = t('confirmYes');
        cancelBtn.textContent = t('confirmNo');
    };
    
    cancelBtn.onclick = () => {
        modal.classList.add('hidden');

        // Reset modal text
        modalTitle.textContent = t('confirmTitle');
        confirmBtn.textContent = t('confirmYes');
        cancelBtn.textContent = t('confirmNo');
    };
}

function deleteAllMyScores() {
    // Count how many scores belong to current player
    const countBefore = highScores.length;
    highScores = highScores.filter(entry => entry.name !== playerName);
    const countRemoved = countBefore - highScores.length;

    if (countRemoved === 0) return;

    // Save updated scores
    localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));

    // Also remove highest score if it belonged to this player
    const highestSaved = localStorage.getItem('survivalGameHighestScore');
    if (highestSaved) {
        const highest = JSON.parse(highestSaved);
        if (highest.name === playerName) {
            localStorage.removeItem('survivalGameHighestScore');
            // Set new highest if there are scores left
            if (highScores.length > 0) {
                localStorage.setItem('survivalGameHighestScore', JSON.stringify(highScores[0]));
            }
        }
    }

    // Update hasExistingScore flag
    hasExistingScore = false;

    // Refresh display
    displayHighScores();
}

// Input handling
const keys = {};
window.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    
    // Pause with space
    if (e.key === ' ' && gameRunning) {
        e.preventDefault();
        togglePause();
    }
});
window.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

// Enemies array
let enemies = [];

// Boss system
let currentBoss = null;
let bossSpawned = false;
let bossWarningShown = false;
let bossDefeated = false;

// Boss class
class Boss {
    constructor(chapter) {
        this.width = 80 + (chapter * 10); // Gets bigger each chapter
        this.height = this.width;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = -this.height;
        this.chapter = chapter;
        
        // Boss stats scale with chapter
        this.maxHealth = 200 + (chapter * 100); // More HP each chapter
        this.health = this.maxHealth;
        this.speed = (80 + (chapter * 20)) * (settings.difficulty === 'hard' ? 1.5 : settings.difficulty === 'easy' ? 0.8 : 1);
        this.damage = (20 + (chapter * 10)) * (settings.difficulty === 'hard' ? 1.5 : settings.difficulty === 'easy' ? 0.8 : 1);
        
        // Movement pattern
        this.vx = 0;
        this.vy = this.speed;
        this.phase = 1; // Phase changes at 50% HP
        this.attackTimer = 0;
        this.attackCooldown = Math.max(1, 3 - (chapter * 0.3)); // Attacks faster each chapter
        
        // Visual
        this.color = `hsl(${chapter * 60}, 100%, 50%)`; // Different color per chapter
        this.glowIntensity = 30;
    }
    
    update(deltaTime) {
        // Movement: Move down then side to side
        if (this.y < 100) {
            this.y += this.vy * deltaTime;
        } else {
            // Side to side movement
            this.x += Math.sin(gameTime * 2) * this.speed * deltaTime;
            this.y = 100 + Math.sin(gameTime * 1.5) * 50; // Float up and down
            
            // Keep in bounds
            this.x = Math.max(0, Math.min(canvas.width - this.width, this.x));
        }
        
        // Attack pattern: Spawn projectiles or charge at player
        this.attackTimer += deltaTime;
        if (this.attackTimer >= this.attackCooldown) {
            this.attackTimer = 0;
            this.attack();
        }
        
        // Phase change at 50% HP
        if (this.health <= this.maxHealth * 0.5 && this.phase === 1) {
            this.phase = 2;
            this.speed *= 1.5; // Gets faster in phase 2
            this.attackCooldown *= 0.7; // Attacks faster
        }
    }
    
    attack() {
        // Boss attack: Spawn fast enemies toward player
        if (this.phase === 2) {
            // Phase 2: Spawn 2 enemies
            for (let i = 0; i < 2; i++) {
                const enemy = new Enemy();
                enemy.x = this.x + this.width / 2;
                enemy.y = this.y + this.height;
                enemy.speed *= 1.5; // Boss spawns are faster
                enemies.push(enemy);
            }
        } else {
            // Phase 1: Spawn 1 enemy
            const enemy = new Enemy();
            enemy.x = this.x + this.width / 2;
            enemy.y = this.y + this.height;
            enemies.push(enemy);
        }
    }
    
    draw() {
        // Draw boss with glow
        ctx.fillStyle = this.color;
        ctx.shadowBlur = this.glowIntensity + (this.phase === 2 ? 20 : 0);
        ctx.shadowColor = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        
        // Inner detail
        ctx.fillStyle = '#ffffff';
        const innerSize = this.width * 0.4;
        ctx.fillRect(
            this.x + (this.width - innerSize) / 2,
            this.y + (this.height - innerSize) / 2,
            innerSize,
            innerSize
        );
        
        // Boss health bar
        const barWidth = this.width;
        const barHeight = 8;
        const barX = this.x;
        const barY = this.y - 15;
        
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
        ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);
        
        // Boss name
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`BOSS Chapter ${this.chapter}`, this.x + this.width / 2, barY - 5);
        ctx.textAlign = 'left';
    }
    
    takeDamage(damage) {
        this.health -= damage;
        
        // Flash effect
        this.glowIntensity = 50;
        setTimeout(() => {
            this.glowIntensity = 30;
        }, 100);
    }
}

// Particles array for effects
let particles = [];

// Enemy class
class Enemy {
    constructor() {
        this.width = 30 + Math.random() * 20;
        this.height = this.width;

        // Spawn from random edge
        const side = Math.floor(Math.random() * 4);
        switch(side) {
            case 0: // top
                this.x = Math.random() * canvas.width;
                this.y = -this.height;
                break;
            case 1: // right
                this.x = canvas.width + this.width;
                this.y = Math.random() * canvas.height;
                break;
            case 2: // bottom
                this.x = Math.random() * canvas.width;
                this.y = canvas.height + this.height;
                break;
            case 3: // left
                this.x = -this.width;
                this.y = Math.random() * canvas.height;
                break;
        }

        // Calculate direction towards player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Get difficulty multiplier
        const diffMap = {
            easy: { damageMult: 0.7, speedMult: 0.8 },
            normal: { damageMult: 1, speedMult: 1 },
            hard: { damageMult: 1.5, speedMult: 1.3 }
        };
        const diff = diffMap[settings.difficulty];
        
        // Chapter scaling: enemies get faster and stronger each chapter
        const chapterSpeedMult = 1 + ((currentChapter - 1) * 0.2); // +20% speed per chapter
        const chapterDamageMult = 1 + ((currentChapter - 1) * 0.15); // +15% damage per chapter

        // Speed increases with game time AND chapter
        const speedMultiplier = (1 + (gameTime / 60) * 0.5) * diff.speedMult * chapterSpeedMult;
        this.speed = (100 + Math.random() * 100) * speedMultiplier;

        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;

        this.damage = (10 + Math.floor(Math.random() * 10)) * diff.damageMult * chapterDamageMult;
        // Use theme-appropriate colors
        const hueRanges = {
            neon: [0, 60],      // Red-orange
            dark: [0, 30],      // Dark reds
            retro: [90, 140]    // Green tones
        };
        const range = hueRanges[settings.theme] || hueRanges.neon;
        const hue = Math.random() * (range[1] - range[0]) + range[0];
        this.color = `hsl(${hue}, 100%, 50%)`;
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
    }
    
    isOffScreen() {
        return this.x < -100 || this.x > canvas.width + 100 || 
               this.y < -100 || this.y > canvas.height + 100;
    }
}

// Particle class
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 200;
        this.vy = (Math.random() - 0.5) * 200;
        this.size = Math.random() * 5 + 2;
        this.color = color;
        this.life = 1;
        this.decay = Math.random() * 0.02 + 0.02;
    }
    
    update(deltaTime) {
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        this.life -= this.decay;
    }
    
    draw() {
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.globalAlpha = 1;
    }
}

// Update player
function updatePlayer(deltaTime) {
    let dx = 0;
    let dy = 0;
    
    if (keys['w'] || keys['arrowup']) dy = -1;
    if (keys['s'] || keys['arrowdown']) dy = 1;
    if (keys['a'] || keys['arrowleft']) dx = -1;
    if (keys['d'] || keys['arrowright']) dx = 1;
    
    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }
    
    player.x += dx * player.speed * deltaTime;
    player.y += dy * player.speed * deltaTime;
    
    // Keep player in bounds
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x));
    player.y = Math.max(0, Math.min(canvas.height - player.height, player.y));
    
    // Update invulnerability
    if (player.invulnerable) {
        player.invulnerableTime -= deltaTime;
        if (player.invulnerableTime <= 0) {
            player.invulnerable = false;
        }
    }
}

// Draw player
function drawPlayer() {
    // Flicker when invulnerable
    if (player.invulnerable && Math.floor(Date.now() / 100) % 2 === 0) {
        return;
    }

    ctx.fillStyle = playerColor;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = playerColor;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowBlur = 0;

    // Inner detail
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 10, player.y + 10, player.width - 20, player.height - 20);
}

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Check circle-circle collision (for player vs enemies)
function checkCircleCollision(obj1, obj2) {
    const cx1 = obj1.x + obj1.width / 2;
    const cy1 = obj1.y + obj1.height / 2;
    const r1 = obj1.width / 2;

    const cx2 = obj2.x + obj2.width / 2;
    const cy2 = obj2.y + obj2.height / 2;
    const r2 = obj2.width / 2;

    const dx = cx2 - cx1;
    const dy = cy2 - cy1;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance < (r1 + r2);
}

// Spawn enemies
function spawnEnemy(deltaTime) {
    enemySpawnTimer -= deltaTime * 1000;
    
    if (enemySpawnTimer <= 0) {
        enemies.push(new Enemy());
        
        // Decrease spawn rate over time (minimum 400ms)
        const spawnRateDecrease = (gameTime / 60) * 200;
        enemySpawnTimer = Math.max(400, enemySpawnRate - spawnRateDecrease);
    }
}

// Create explosion effect
function createExplosion(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// Update UI
function updateUI() {
    const healthFill = document.getElementById('healthFill');
    const healthText = document.getElementById('healthText');
    const scoreEl = document.getElementById('score');
    const timeEl = document.getElementById('time');
    const chapterEl = document.getElementById('chapter');

    const healthPercent = (player.health / player.maxHealth) * 100;
    healthFill.style.width = healthPercent + '%';
    healthText.textContent = `${t('health')}: ${Math.ceil(player.health)}`;

    // Change health bar color based on health percentage
    if (healthPercent > 60) {
        healthFill.style.background = '#44ff44'; // Green
    } else if (healthPercent > 30) {
        healthFill.style.background = '#ffaa00'; // Orange
    } else {
        healthFill.style.background = '#ff4444'; // Red
    }

    scoreEl.textContent = `${t('score')}: ${score}`;
    timeEl.textContent = `${t('time')}: ${Math.floor(gameTime)}s`;
    if (chapterEl) {
        chapterEl.textContent = `Chapter: ${currentChapter}`;
    }
    
    // Update shop upgrades display
    updateInGameShopDisplay();
}

// Game over
function gameOver() {
    gameRunning = false;
    stopAllMusic();
    playGameOverSound();

    // Check and save high score
    const wasNewHighScore = isNewHighScore(score);
    if (wasNewHighScore) {
        saveHighScore(score, Math.floor(gameTime));
        document.getElementById('newHighScore').classList.remove('hidden');
        playNewHighScoreSound();
    } else {
        document.getElementById('newHighScore').classList.add('hidden');
    }

    document.getElementById('finalScore').textContent = `${t('score')}: ${score}`;
    document.getElementById('finalTime').textContent = `${t('time')}: ${Math.floor(gameTime)}s`;
    document.getElementById('gameOverScreen').classList.remove('hidden');
}

// Chapter complete
function chapterComplete() {
    gameRunning = false;
    chapterCompleted = true;
    stopAllMusic();

    // Show chapter complete screen
    const nextChapter = currentChapter + 1;
    document.getElementById('chapterCompleteTitle').textContent = `🎉 Chapter ${currentChapter} ${settings.language === 'en' ? 'Complete!' : 'Selesai!'}`;
    document.getElementById('chapterCompleteText').textContent = `${settings.language === 'en' ? 'Congratulations! You survived for' : 'Selamat! Kamu berhasil bertahan selama'} ${chapterTimes[currentChapter]} ${t('secondsUnit').trim()}`;
    document.getElementById('chapterNextText').textContent = chapterTimes[nextChapter] 
        ? `${settings.language === 'en' ? 'Continue to Chapter' : 'Lanjut ke Chapter'} ${nextChapter}? (${chapterTimes[nextChapter]} ${t('secondsUnit').trim()})` 
        : `${settings.language === 'en' ? 'This is the final chapter!' : 'Ini adalah chapter terakhir!'}`;

    // Update continue button text based on next chapter
    const continueBtn = document.getElementById('chapterContinueBtn');
    if (chapterTimes[nextChapter]) {
        continueBtn.textContent = `${settings.language === 'en' ? 'Continue to Chapter' : 'Lanjut ke Chapter'} ${nextChapter}`;
        continueBtn.style.display = 'block';
    } else {
        continueBtn.textContent = `🏆 ${settings.language === 'en' ? 'You have completed all chapters!' : 'Kamu sudah menyelesaikan semua chapter!'}`;
        continueBtn.style.display = 'block';
        continueBtn.disabled = true;
        continueBtn.style.opacity = '0.5';
        continueBtn.style.cursor = 'not-allowed';
    }

    showScreen('chapterCompleteScreen');
}

// Continue to next chapter
function continueToNextChapter() {
    const nextChapter = currentChapter + 1;

    if (!chapterTimes[nextChapter]) {
        return; // No more chapters
    }

    currentChapter = nextChapter;
    chapterCompleted = false;

    // Reset game but keep the chapter progress
    resetGameForChapter();
    gameRunning = true;
    gamePaused = false;
    lastTime = performance.now();
    showScreen('none');
    startGameMusic();
    requestAnimationFrame(gameLoop);
}

// Reset game for new chapter
function resetGameForChapter() {
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height / 2 - player.height / 2;
    player.health = player.maxHealth;
    player.invulnerable = false;
    player.invulnerableTime = 0;
    score = Math.floor(gameTime * 10); // Keep the score
    enemies = [];
    particles = [];
    enemySpawnTimer = 0;
    chapterTimeStart = gameTime; // Reset chapter timer but keep total game time
    // Increase difficulty for next chapter
    enemySpawnRate = Math.max(300, enemySpawnRate - 200);
    player.speed += 30; // Slight speed boost
    applySettings();
    enemies.push(new Enemy());
}

// Restart game (called from game over screen)
function restartGame() {
    resetGame();
    gameRunning = true;
    gamePaused = false;
    lastTime = performance.now();
    showScreen('none');
    startGameMusic();
    requestAnimationFrame(gameLoop);
}

// Toggle pause
function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        document.getElementById('pauseScreen').classList.remove('hidden');
    } else {
        document.getElementById('pauseScreen').classList.add('hidden');
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
}

// Show screen helper
function showScreen(screenId) {
    const screens = ['mainMenu', 'settingsScreen', 'howToPlayScreen', 'highScoresScreen', 'startScreen', 'shopScreen', 'pauseScreen', 'gameOverScreen', 'chapterCompleteScreen', 'chapterListScreen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        if (screenId === 'none') {
            el.classList.add('hidden');
        } else if (id === screenId) {
            el.classList.remove('hidden');
        } else {
            el.classList.add('hidden');
        }
    });
}

// Reset game
function resetGame() {
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height / 2 - player.height / 2;
    player.health = player.maxHealth;
    player.invulnerable = false;
    player.invulnerableTime = 0;
    player.swordRefillTimer = 0; // Reset sword refill timer
    score = 0;
    gameTime = 0;
    enemies = [];
    particles = [];
    enemySpawnTimer = 0;
    enemySpawnRate = 1500;
    currentChapter = 1;
    chapterCompleted = false;
    chapterTimeStart = 0;
    player.speed = 300; // Reset speed
    
    // Reset boss system
    currentBoss = null;
    bossSpawned = false;
    bossWarningShown = false;
    bossDefeated = false;
    
    // Reset shop upgrades
    shopUpgrades = {
        swordLevel: 0,
        speedLevel: 0,
        swordCharges: 0
    };
    
    applySettings();
    applyShopUpgrades(); // Apply shop upgrades & refill charges
    // Spawn first enemy immediately so player doesn't wait
    enemies.push(new Enemy());
}

// Main game loop
function gameLoop(timestamp) {
    if (!gameRunning || gamePaused) return;

    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1); // Cap delta time
    lastTime = timestamp;

    // Update game time
    gameTime += deltaTime;
    
    // Auto-refill sword charges: 1 charge per 2 seconds
    if (shopUpgrades.swordLevel > 0) {
        const maxCharges = maxSwordCharges[shopUpgrades.swordLevel - 1];
        
        // Only refill if charges are below max
        if (shopUpgrades.swordCharges < maxCharges) {
            // Track refill timer
            if (!player.swordRefillTimer) player.swordRefillTimer = 0;
            player.swordRefillTimer += deltaTime;
            
            if (player.swordRefillTimer >= 2.0) { // Every 2 seconds
                shopUpgrades.swordCharges = Math.min(maxCharges, shopUpgrades.swordCharges + 1);
                updateInGameShopDisplay(); // Update display
                
                console.log(`Sword charge refilled: ${shopUpgrades.swordCharges}/${maxCharges}`);
            }
            player.swordRefillTimer = player.swordRefillTimer >= 2.0 ? 0 : player.swordRefillTimer;
        } else {
            // Reset timer when full
            player.swordRefillTimer = 0;
        }
    }

    // Check chapter completion
    if (!chapterCompleted && chapterTimes[currentChapter]) {
        const chapterTime = gameTime - chapterTimeStart;
        const chapterDuration = chapterTimes[currentChapter];
        
        // Spawn boss at 80% of chapter time
        if (!bossSpawned && chapterTime >= chapterDuration * 0.8) {
            currentBoss = new Boss(currentChapter);
            bossSpawned = true;
            bossDefeated = false;
            
            // Boss warning
            bossWarningShown = true;
            setTimeout(() => { bossWarningShown = false; }, 3000);
        }
        
        // Chapter complete only if boss is defeated (or no boss yet)
        if (chapterTime >= chapterDuration) {
            if (!currentBoss || bossDefeated) {
                chapterComplete();
                return; // Stop the game loop
            }
        }
    }

    // Score increases over time
    score = Math.floor(gameTime * 10);

    // Clear canvas and draw background
    ctx.fillStyle = canvasBgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
    
    // Update and draw player
    updatePlayer(deltaTime);
    drawPlayer();
    
    // Draw boss warning
    if (bossWarningShown) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.8)';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(t('bossIncoming'), canvas.width / 2, canvas.height / 2 - 100);
        ctx.font = '24px Arial';
        ctx.fillText(t('prepareYourself'), canvas.width / 2, canvas.height / 2 - 50);
        ctx.textAlign = 'left';
    }
    
    // Update and draw boss
    if (currentBoss && !bossDefeated) {
        currentBoss.update(deltaTime);
        currentBoss.draw();
        
        // Check sword deflection on boss
        if (shopUpgrades.swordCharges > 0 && checkCircleCollision(player, currentBoss)) {
            const dx = currentBoss.x + currentBoss.width / 2 - (player.x + player.width / 2);
            const dy = currentBoss.y + currentBoss.height / 2 - (player.y + player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                // Boss takes damage from sword
                currentBoss.takeDamage(50);
                
                // Use one deflection charge
                shopUpgrades.swordCharges--;
                updateInGameShopDisplay();
                
                // Visual feedback
                createExplosion(currentBoss.x + currentBoss.width / 2, currentBoss.y + currentBoss.height / 2, '#ffd700', 30);
                playNote(600, 0.2, 'sine', 0.1, 0);
                playNote(800, 0.2, 'sine', 0.1, 0.1);
                
                // Screen shake
                canvas.style.transform = `translate(${Math.random() * 12 - 6}px, ${Math.random() * 12 - 6}px)`;
                setTimeout(() => {
                    canvas.style.transform = 'translate(0, 0)';
                }, 100);
                
                // Check if boss defeated
                if (currentBoss.health <= 0) {
                    bossDefeated = true;
                    createExplosion(currentBoss.x + currentBoss.width / 2, currentBoss.y + currentBoss.height / 2, '#ffd700', 50);
                    playNewHighScoreSound();
                    score += 500; // Bonus score for defeating boss
                    currentBoss = null;
                }
                
                continue; // Skip normal collision
            }
        }
        
        // Check boss collision with player (damage player)
        if (!player.invulnerable && checkCircleCollision(player, currentBoss)) {
            player.health -= currentBoss.damage;
            playHitSound();
            player.invulnerable = true;
            player.invulnerableTime = 1.0; // Longer invulnerability from boss
            
            createExplosion(player.x + player.width / 2, player.y + player.height / 2, '#ff0000', 25);
            
            // Strong screen shake for boss hit
            canvas.style.transform = `translate(${Math.random() * 15 - 7.5}px, ${Math.random() * 15 - 7.5}px)`;
            setTimeout(() => {
                canvas.style.transform = 'translate(0, 0)';
            }, 150);
            
            if (player.health <= 0) {
                player.health = 0;
                createExplosion(player.x + player.width / 2, player.y + player.height / 2, playerColor, 30);
                gameOver();
            }
            continue;
        }
    }

    // Spawn and update enemies
    spawnEnemy(deltaTime);
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(deltaTime);
        enemy.draw();

        // Check sword deflection first (if player has sword charges)
        if (shopUpgrades.swordCharges > 0 && checkCircleCollision(player, enemy)) {
            // Deflect enemy back with increased speed
            const dx = enemy.x + enemy.width / 2 - (player.x + player.width / 2);
            const dy = enemy.y + enemy.height / 2 - (player.y + player.height / 2);
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.vx = (dx / distance) * enemy.speed * 3; // Bounce back faster (3x)
                enemy.vy = (dy / distance) * enemy.speed * 3;
                
                // Use one deflection charge
                shopUpgrades.swordCharges--;
                
                // Update display immediately
                updateInGameShopDisplay();
                
                // Visual feedback - golden explosion
                createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ffd700', 20);
                
                // Play deflect sound
                playNote(800, 0.15, 'sine', 0.1, 0);
                playNote(1000, 0.15, 'sine', 0.08, 0.05);
                
                // Screen shake effect
                canvas.style.transform = `translate(${Math.random() * 8 - 4}px, ${Math.random() * 8 - 4}px)`;
                setTimeout(() => {
                    canvas.style.transform = 'translate(0, 0)';
                }, 80);
                
                continue; // Skip normal collision
            }
        }

        // Check collision with player (circle-based for accuracy)
        if (!player.invulnerable && checkCircleCollision(player, enemy)) {
            player.health -= enemy.damage;
            playHitSound();
            player.invulnerable = true;
            player.invulnerableTime = 0.5; // 500ms invulnerability

            createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color, 15);

            enemies.splice(i, 1);

            // Screen shake effect
            canvas.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
            setTimeout(() => {
                canvas.style.transform = 'translate(0, 0)';
            }, 100);

            if (player.health <= 0) {
                player.health = 0;
                createExplosion(player.x + player.width / 2, player.y + player.height / 2, playerColor, 30);
                gameOver();
            }
            continue;
        }
        
        // Remove off-screen enemies
        if (enemy.isOffScreen()) {
            enemies.splice(i, 1);
            score += 5; // Bonus for surviving
        }
    }
    
    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];
        particle.update(deltaTime);
        particle.draw();
        
        if (particle.life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    // Update UI
    updateUI();
    
    requestAnimationFrame(gameLoop);
}

// Start game
function startGame() {
    initAudio();
    
    // Set chapter from select dropdown before reset
    const chapterSelect = document.getElementById('chapterSelect');
    if (chapterSelect) {
        currentChapter = parseInt(chapterSelect.value);
        console.log(`Starting Chapter ${currentChapter}`);
    }
    
    resetGame();
    gameRunning = true;
    gamePaused = false;
    lastTime = performance.now();
    showScreen('none');
    startGameMusic();
    requestAnimationFrame(gameLoop);
}

// Event listeners
try {
const playBtnEl = document.getElementById('playBtn');
if (playBtnEl) {
    playBtnEl.addEventListener('click', () => {
        try { updateLanguage(); } catch (e) { console.error(e); }
        showScreen('startScreen');
    });
}

const chaptersBtn = document.getElementById('chaptersBtn');
if (chaptersBtn) {
    chaptersBtn.addEventListener('click', () => {
        showMainMenuChapters();
    });
}

const settingsBtnEl = document.getElementById('settingsBtn');
if (settingsBtnEl) settingsBtnEl.addEventListener('click', () => {
    showScreen('settingsScreen');
});

const howToPlayBtnEl = document.getElementById('howToPlayBtn');
if (howToPlayBtnEl) howToPlayBtnEl.addEventListener('click', () => {
    showScreen('howToPlayScreen');
});

const highScoresBtnEl = document.getElementById('highScoresBtn');
if (highScoresBtnEl) highScoresBtnEl.addEventListener('click', () => {
    displayHighScores();
    showScreen('highScoresScreen');
});

const settingsBackBtnEl = document.getElementById('settingsBackBtn');
if (settingsBackBtnEl) settingsBackBtnEl.addEventListener('click', closeSettings);

const closeSettingsBtnEl = document.getElementById('closeSettingsBtn');
if (closeSettingsBtnEl) closeSettingsBtnEl.addEventListener('click', closeSettings);
} catch (e) {
    console.error('Error setting up menu event listeners:', e);
}

function closeSettings() {
    // Always save settings, even if some fail
    try {
        settings.difficulty = document.getElementById('difficultySelect').value;
        settings.playerSize = document.getElementById('playerSizeSelect').value;
        settings.theme = document.getElementById('themeSelect').value;
        settings.language = document.getElementById('languageSelect').value;
        saveSettings();
        applySettings();
        updateLanguage();
        
        // Save player name if it was changed
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput && nameInput.value.trim()) {
            const newName = nameInput.value.trim().substring(0, 15);
            if (newName !== playerName) {
                playerName = newName;
                localStorage.setItem('survivalGamePlayerName', playerName);
            }
        }
    } catch (e) {
        console.error('Error applying settings:', e);
    }

    stopAllMusic();
    startMenuMusic();
    showScreen('mainMenu');
}

const setNameBtnEl = document.getElementById('setNameBtn');
if (setNameBtnEl) setNameBtnEl.addEventListener('click', confirmNameChange);

// Sound toggle in settings
const soundToggleEl = document.getElementById('soundToggle');
if (soundToggleEl) {
    soundToggleEl.addEventListener('click', () => {
        initAudio();
        musicEnabled = !musicEnabled;
        updateSoundButton();

        if (musicEnabled) {
            if (gameRunning) {
                startGameMusic();
            } else {
                startMenuMusic();
            }
        } else {
            stopAllMusic();
        }
    });
}

function updateSoundButton() {
    const soundBtn = document.getElementById('soundToggle');
    if (soundBtn) {
        soundBtn.textContent = musicEnabled ? '🔊' : '🔇';
    }
    
    // Immediately mute/unmute all audio
    if (masterGain && audioCtx) {
        masterGain.gain.setValueAtTime(musicEnabled ? 1 : 0, audioCtx.currentTime);
    }
}

const howToPlayBackBtnEl = document.getElementById('howToPlayBackBtn');
if (howToPlayBackBtnEl) howToPlayBackBtnEl.addEventListener('click', () => {
    showScreen('mainMenu');
});

const highScoresBackBtnEl = document.getElementById('highScoresBackBtn');
if (highScoresBackBtnEl) highScoresBackBtnEl.addEventListener('click', () => {
    showScreen('mainMenu');
});

const startBtnEl = document.getElementById('startBtn');
if (startBtnEl) {
    startBtnEl.addEventListener('click', () => {
        console.log('Start button clicked!');
        startGame();
    });
}

const menuBtnEl = document.getElementById('menuBtn');
if (menuBtnEl) menuBtnEl.addEventListener('click', () => {
    showScreen('mainMenu');
});

const resumeBtnEl = document.getElementById('resumeBtn');
if (resumeBtnEl) resumeBtnEl.addEventListener('click', () => {
    togglePause();
});

const pauseMenuBtnEl = document.getElementById('pauseMenuBtn');
if (pauseMenuBtnEl) pauseMenuBtnEl.addEventListener('click', () => {
    gameRunning = false;
    gamePaused = false;
    stopAllMusic();
    startMenuMusic();
    showScreen('mainMenu');
});

const restartBtnEl = document.getElementById('restartBtn');
if (restartBtnEl) restartBtnEl.addEventListener('click', restartGame);

const gameOverMenuBtnEl = document.getElementById('gameOverMenuBtn');
if (gameOverMenuBtnEl) gameOverMenuBtnEl.addEventListener('click', () => {
    stopAllMusic();
    startMenuMusic();
    showScreen('mainMenu');
});

// Chapter screen event listeners
const chapterContinueBtnEl = document.getElementById('chapterContinueBtn');
if (chapterContinueBtnEl) chapterContinueBtnEl.addEventListener('click', continueToNextChapter);

const chapterViewBtnEl = document.getElementById('chapterViewBtn');
if (chapterViewBtnEl) chapterViewBtnEl.addEventListener('click', () => {
    showChapterList();
});

const chapterMenuBtnEl = document.getElementById('chapterMenuBtn');
if (chapterMenuBtnEl) chapterMenuBtnEl.addEventListener('click', () => {
    stopAllMusic();
    startMenuMusic();
    showScreen('mainMenu');
});

const chapterListBackBtnEl = document.getElementById('chapterListBackBtn');
if (chapterListBackBtnEl) chapterListBackBtnEl.addEventListener('click', () => {
    showScreen('mainMenu');
});

// Shop event listeners
const shopBtnEl = document.getElementById('shopBtn');
if (shopBtnEl) {
    shopBtnEl.addEventListener('click', () => {
        updateShopUI();
        showScreen('shopScreen');
    });
}

// In-game shop button
const shopBtnGameEl = document.getElementById('shopBtnGame');
if (shopBtnGameEl) {
    shopBtnGameEl.addEventListener('click', () => {
        if (gameRunning && !gamePaused) {
            gamePaused = true;
            updateShopUI();
            showScreen('shopScreen');
        }
    });
}

// Pause screen shop button
const pauseShopBtnEl = document.getElementById('pauseShopBtn');
if (pauseShopBtnEl) {
    pauseShopBtnEl.addEventListener('click', () => {
        updateShopUI();
        showScreen('shopScreen');
    });
}

const shopBackBtnEl = document.getElementById('shopBackBtn');
if (shopBackBtnEl) {
    shopBackBtnEl.addEventListener('click', () => {
        showScreen('none');
        // If we're in a game, resume game
        if (gameRunning && gamePaused) {
            gamePaused = false;
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        } else if (!gameRunning) {
            // Go back to start screen
            showScreen('startScreen');
        }
    });
}

// Sword purchase
const shopSwordBuyBtnEl = document.getElementById('shopSwordBuyBtn');
if (shopSwordBuyBtnEl) {
    shopSwordBuyBtnEl.addEventListener('click', () => {
        // STRICT check - max level is 3
        if (shopUpgrades.swordLevel >= 3) {
            console.warn('Sword already at max level 3!');
            return;
        }

        const price = swordPrices[shopUpgrades.swordLevel];
        if (score < price) {
            alert(t('notEnoughScore'));
            return;
        }

        // Deduct score
        score -= price;
        
        // Apply upgrade with validation
        shopUpgrades.swordLevel = Math.min(3, shopUpgrades.swordLevel + 1); // Cap at 3
        shopUpgrades.swordCharges = maxSwordCharges[shopUpgrades.swordLevel - 1];

        console.log(`Sword upgraded to level ${shopUpgrades.swordLevel} with ${shopUpgrades.swordCharges} charges`);

        // Update displays
        updateShopUI();
        updateUI(); // Update in-game display to show reduced score

        // Visual feedback
        playNote(600, 0.1, 'sine', 0.08, 0);
        playNote(800, 0.15, 'sine', 0.1, 0.1);
    });
}

// Speed purchase
const shopSpeedBuyBtnEl = document.getElementById('shopSpeedBuyBtn');
if (shopSpeedBuyBtnEl) {
    shopSpeedBuyBtnEl.addEventListener('click', () => {
        if (shopUpgrades.speedLevel >= 5) {
            return; // Max level
        }

        const price = speedPrices[shopUpgrades.speedLevel];
        if (score < price) {
            alert(t('notEnoughScore'));
            return;
        }

        // Deduct score
        score -= price;
        
        // Apply upgrade
        shopUpgrades.speedLevel++;
        applyShopUpgrades();
        
        // Update displays
        updateShopUI();
        updateUI(); // Update in-game display to show reduced score
        
        // Visual feedback
        playNote(600, 0.1, 'sine', 0.08, 0);
        playNote(800, 0.15, 'sine', 0.1, 0.1);
    });
}

// Show chapter list from main menu
function showMainMenuChapters() {
    showScreen('chapterListScreen');
    renderChapterList();
}

// Render chapter list
function renderChapterList() {
    const titleEl = document.getElementById('chapterListTitle');
    const contentEl = document.getElementById('chapterListContent');

    titleEl.textContent = `📚 ${t('chapterList')}`;

    // Count completed chapters
    const completedCount = currentChapter - 1;
    const totalCount = Object.keys(chapterTimes).length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    let html = '';

    // Add completion board at the top
    html += `
    <div class="completion-board">
        <div class="completion-title">${t('chaptersCompletedText')}</div>
        <div class="completion-bar-container">
            <div class="completion-bar" style="width: ${progressPercent}%">
                ${completedCount}/${totalCount}
            </div>
        </div>
        <div class="completion-stars">
            ${Array.from({length: completedCount}, () => '<span class="star">⭐</span>').join('')}
            ${Array.from({length: totalCount - completedCount}, () => '<span class="star empty">☆</span>').join('')}
        </div>
    </div>
    `;

    for (let i = 1; i <= 5; i++) {
        const completed = i < currentChapter;
        const current = i === currentChapter;
        const locked = i > currentChapter;
        const time = chapterTimes[i];

        let status, className, timeDisplay;

        if (completed) {
            status = '✅';
            className = 'chapter-item completed';
            timeDisplay = `${time}${t('secondsUnit')} - ${t('completed')}`;
        } else if (current) {
            status = '🔵';
            className = 'chapter-item current';
            timeDisplay = t('currentChapter');
        } else {
            status = '🔒';
            className = 'chapter-item locked';
            const unlockMsg = formatString(t('unlockText'), time);
            timeDisplay = unlockMsg;
        }

        html += `
        <div class="${className}">
            <span class="chapter-status">${status}</span>
            <span class="chapter-name">Chapter ${i}</span>
            <span class="chapter-time">${timeDisplay}</span>
        </div>
    `;
    }
    contentEl.innerHTML = html;
}

// Show chapter list (modal overlay)
function showChapterList() {
    const chapterScreen = document.getElementById('chapterCompleteScreen');
    const titleEl = document.getElementById('chapterCompleteTitle');
    const textEl = document.getElementById('chapterCompleteText');
    const nextEl = document.getElementById('chapterNextText');
    const continueBtn = document.getElementById('chapterContinueBtn');
    const viewBtn = document.getElementById('chapterViewBtn');
    const menuBtn = document.getElementById('chapterMenuBtn');

    // Show chapter progress
    titleEl.textContent = `📚 ${t('chapterList')}`;

    // Count completed chapters
    const completedCount = currentChapter - 1;
    const totalCount = Object.keys(chapterTimes).length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    let chapterHTML = `
    <div class="completion-board">
        <div class="completion-title">${t('chaptersCompletedText')}</div>
        <div class="completion-bar-container">
            <div class="completion-bar" style="width: ${progressPercent}%">
                ${completedCount}/${totalCount}
            </div>
        </div>
        <div class="completion-stars">
            ${Array.from({length: completedCount}, () => '<span class="star">⭐</span>').join('')}
            ${Array.from({length: totalCount - completedCount}, () => '<span class="star empty">☆</span>').join('')}
        </div>
    </div>
    `;

    for (let i = 1; i <= 5; i++) {
        const completed = i < currentChapter;
        const current = i === currentChapter;
        const locked = i > currentChapter;
        const time = chapterTimes[i];
        
        let status, className, timeDisplay;
        
        if (completed) {
            status = '✅';
            className = 'chapter-item completed';
            timeDisplay = `${time}${t('secondsUnit')} - ${t('completed')}`;
        } else if (current) {
            status = '🔵';
            className = 'chapter-item current';
            timeDisplay = `${time}${t('secondsUnit')} - ${t('currentChapter')}`;
        } else {
            status = '🔒';
            className = 'chapter-item locked';
            const unlockMsg = formatString(t('unlockText'), time);
            timeDisplay = unlockMsg;
        }
        
        chapterHTML += `
        <div class="${className}">
            <span class="chapter-status">${status}</span>
            <span class="chapter-name">Chapter ${i}</span>
            <span class="chapter-time">${timeDisplay}</span>
        </div>
    `;
    }
    chapterHTML += '</div>';
    textEl.innerHTML = chapterHTML;
    nextEl.style.display = 'none';

    // Change buttons
    continueBtn.textContent = t('back');
    continueBtn.onclick = () => {
        // Reset to chapter complete screen
        const nextChapter = currentChapter + 1;
        titleEl.textContent = `🎉 Chapter ${currentChapter} ${settings.language === 'en' ? 'Complete!' : 'Selesai!'}`;
        textEl.textContent = `${settings.language === 'en' ? 'Congratulations! You survived for' : 'Selamat! Kamu berhasil bertahan selama'} ${chapterTimes[currentChapter]} ${t('secondsUnit').trim()}`;
        nextEl.textContent = chapterTimes[nextChapter] 
            ? `${settings.language === 'en' ? 'Continue to Chapter' : 'Lanjut ke Chapter'} ${nextChapter}? (${chapterTimes[nextChapter]} ${t('secondsUnit').trim()})` 
            : `${settings.language === 'en' ? 'This is the final chapter!' : 'Ini adalah chapter terakhir!'}`;
        nextEl.style.display = 'block';
        continueBtn.textContent = chapterTimes[nextChapter] 
            ? `${settings.language === 'en' ? 'Continue to Chapter' : 'Lanjut ke Chapter'} ${nextChapter}` 
            : `🏆 ${settings.language === 'en' ? 'You have completed all chapters!' : 'Kamu sudah menyelesaikan semua chapter!'}`;
        continueBtn.style.display = 'block';
        if (!chapterTimes[nextChapter]) {
            continueBtn.disabled = true;
            continueBtn.style.opacity = '0.5';
            continueBtn.style.cursor = 'not-allowed';
        } else {
            continueBtn.disabled = false;
            continueBtn.style.opacity = '1';
            continueBtn.style.cursor = 'pointer';
            continueBtn.onclick = continueToNextChapter;
        }
    };

    viewBtn.textContent = t('back');
    viewBtn.onclick = () => {
        viewBtn.textContent = t('chapterList');
        viewBtn.onclick = () => showChapterList();
    };

    menuBtn.style.display = 'block';
}

// Music toggle
const musicToggleBtn = document.getElementById('musicToggle');
if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', () => {
        initAudio();
        musicEnabled = !musicEnabled;
        const musicBtn = document.getElementById('musicToggle');
        if (musicBtn) {
            musicBtn.textContent = musicEnabled ? '🔊' : '🔇';
            musicBtn.title = musicEnabled ? t('musicOff') : t('musicOn');
        }
        updateSoundButton();

        if (musicEnabled) {
            if (gameRunning) {
                startGameMusic();
            } else {
                startMenuMusic();
            }
        } else {
            stopAllMusic();
        }
    });
}

// Initialize
try {
    console.log('=== GAME INITIALIZATION STARTED ===');
    console.log('✅ Game.js loaded successfully!');
    console.log('📄 DOM ready:', document.readyState);
    
    // Check if critical functions exist
    console.log('🔍 Checking critical functions...');
    console.log('  - startGame:', typeof startGame);
    console.log('  - showScreen:', typeof showScreen);
    console.log('  - togglePause:', typeof togglePause);
    
    loadSettings();
    loadHighScores();

    console.log('Settings loaded, showing main menu...');
    showScreen('mainMenu');
    updateSoundButton();

    // Verify buttons exist
    const playBtn = document.getElementById('playBtn');
    const startBtn = document.getElementById('startBtn');
    console.log('🔍 Button elements found:');
    console.log('  - playBtn:', playBtn ? '✅' : '❌');
    console.log('  - startBtn:', startBtn ? '✅' : '❌');

    if (playBtn && startBtn) {
        console.log('✅ All buttons found! Game ready to play.');
    } else {
        console.error('❌ Some buttons NOT found!');
    }

    console.log('=== GAME INITIALIZATION COMPLETE ===');
} catch (e) {
    console.error('❌ Error during initialization:', e);
    console.error('Stack trace:', e.stack);
    alert('Game initialization error: ' + e.message + '\n\nCheck console (F12) for details.');
}

// Start menu music when page loads (will initialize audio on first user interaction)
document.addEventListener('click', function initAudioOnce() {
    initAudio();
    startMenuMusic();
    document.removeEventListener('click', initAudioOnce);
});
