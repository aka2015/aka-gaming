const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas to full screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    // Reposition player if out of bounds
    player.x = Math.min(player.x, canvas.width - player.width);
    player.y = Math.min(player.y, canvas.height - player.height);
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

    const menuMelody = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66];
    const menuBass = [130.81, 146.83, 164.81, 174.61, 196.00, 174.61, 164.81, 146.83];
    let noteIndex = 0;

    menuMusicInterval = setInterval(() => {
        if (!musicEnabled) return;

        // Soft melody
        playNote(menuMelody[noteIndex], 0.8, 'sine', 0.25, 0);
        // Bass line
        playNote(menuBass[noteIndex], 1.2, 'sine', 0.15, 0);
        // Gentle chord
        playChord([menuMelody[noteIndex] * 1.5, menuMelody[noteIndex] * 2], 0.6, 'sine', 0.12, 0.1);

        noteIndex = (noteIndex + 1) % menuMelody.length;
    }, 1000);
}

// Game music - energetic and upbeat
function startGameMusic() {
    if (!audioCtx || !musicEnabled) return;
    stopAllMusic();
    
    const gameMelody = [
        523.25, 587.33, 659.25, 698.46, 783.99, 698.46, 659.25, 587.33,
        523.25, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25, 587.33
    ];
    const gameBass = [261.63, 293.66, 329.63, 349.23, 392.00, 349.23, 329.63, 293.66];
    let noteIndex = 0;
    
    gameMusicInterval = setInterval(() => {
        if (!musicEnabled) return;
        
        // Fast melody
        playNote(gameMelody[noteIndex], 0.3, 'square', 0.06, 0);
        // Bass line
        playNote(gameBass[noteIndex % gameBass.length], 0.4, 'triangle', 0.08, 0);
        // Rhythmic pulse
        playNote(130.81, 0.1, 'square', 0.04, 0);
        playNote(130.81, 0.1, 'square', 0.04, 0.25);
        // Accent chord on every 4th note
        if (noteIndex % 4 === 0) {
            playChord([gameMelody[noteIndex] * 1.25, gameMelody[noteIndex] * 1.5], 0.5, 'square', 0.04, 0);
        }
        
        noteIndex = (noteIndex + 1) % gameMelody.length;
    }, 250);
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
        soundOff: 'Off'
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
        soundOff: 'Mati'
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
        soundOff: 'Spento'
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
        soundOff: 'Apagado'
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
        soundOff: 'オフ'
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
        soundOff: '꺼짐'
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
        soundOff: 'Aus'
    }
};

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

// Update language for all UI elements
function updateLanguage() {
    // Main Menu
    document.querySelector('#mainMenu h1').textContent = t('survivalGame');
    document.getElementById('playBtn').textContent = t('play');
    document.getElementById('settingsBtn').textContent = t('settings');
    document.getElementById('howToPlayBtn').textContent = t('howToPlay');
    document.getElementById('highScoresBtn').textContent = t('highScores');
    
    // Settings
    document.querySelector('#settingsScreen h1').textContent = t('settings');
    document.querySelector('#settingsScreen .setting-item:nth-child(1) label').textContent = t('playerName');
    document.querySelector('#settingsScreen .setting-item:nth-child(2) label').textContent = t('difficulty');
    document.querySelector('#settingsScreen .setting-item:nth-child(3) label').textContent = t('playerSize');
    document.querySelector('#settingsScreen .setting-item:nth-child(4) label').textContent = t('theme');
    document.querySelector('#settingsScreen .setting-item:nth-child(5) label').textContent = t('language');
    document.getElementById('playerNameInput').placeholder = t('enterName');
    document.querySelector('#difficultySelect option[value="easy"]').textContent = t('easy');
    document.querySelector('#difficultySelect option[value="normal"]').textContent = t('normal');
    document.querySelector('#difficultySelect option[value="hard"]').textContent = t('hard');
    document.querySelector('#playerSizeSelect option[value="small"]').textContent = t('small');
    document.querySelector('#playerSizeSelect option[value="medium"]').textContent = t('medium');
    document.querySelector('#playerSizeSelect option[value="large"]').textContent = t('large');
    document.querySelector('#themeSelect option[value="neon"]').textContent = t('neon');
    document.querySelector('#themeSelect option[value="dark"]').textContent = t('dark');
    document.querySelector('#themeSelect option[value="retro"]').textContent = t('retro');
    document.querySelector('#languageSelect option[value="en"]').textContent = t('english');
    document.querySelector('#languageSelect option[value="id"]').textContent = t('indonesian');
    document.querySelector('#languageSelect option[value="it"]').textContent = t('italian');
    document.querySelector('#languageSelect option[value="es"]').textContent = t('spanish');
    document.querySelector('#languageSelect option[value="ja"]').textContent = t('japanese');
    document.querySelector('#languageSelect option[value="ko"]').textContent = t('korean');
    document.querySelector('#languageSelect option[value="de"]').textContent = t('german');
    document.getElementById('settingsBackBtn').textContent = t('back');
    document.getElementById('setNameBtn').textContent = t('lock');
    
    // Sound setting
    try {
        const soundLabel = document.querySelector('#settingsScreen .setting-item:nth-child(6) label');
        if (soundLabel) {
            soundLabel.textContent = t('sound');
        }
    } catch (e) {
        // Ignore if sound label not found
    }
    try {
        const soundBtn = document.getElementById('soundToggle');
        if (soundBtn) {
            soundBtn.title = musicEnabled ? t('soundOff') : t('soundOn');
        }
    } catch (e) {
        // Ignore if sound button not found
    }
    updateSoundButton();
    
    // Name change modal
    document.querySelector('#nameChangeModal h2').textContent = t('confirmTitle');
    document.getElementById('confirmNameChange').textContent = t('confirmYes');
    document.getElementById('cancelNameChange').textContent = t('confirmNo');
    
    // How to Play
    document.querySelector('#howToPlayScreen h1').textContent = t('howToPlay');
    document.querySelector('#howToPlayScreen .instruction-item:nth-child(1) span:last-child').textContent = t('moveUp');
    document.querySelector('#howToPlayScreen .instruction-item:nth-child(2) span:last-child').textContent = t('moveDown');
    document.querySelector('#howToPlayScreen .instruction-item:nth-child(3) span:last-child').textContent = t('moveLeft');
    document.querySelector('#howToPlayScreen .instruction-item:nth-child(4) span:last-child').textContent = t('moveRight');
    document.querySelector('#howToPlayScreen .instruction-item:nth-child(5) span:last-child').textContent = t('pauseGame');
    document.querySelector('#howToPlayScreen .instruction-text').textContent = t('instructionText');
    document.getElementById('howToPlayBackBtn').textContent = t('back');
    
    // High Scores
    document.querySelector('#highScoresScreen h1').textContent = t('highScores');
    document.querySelector('#highScoresScreen .no-scores').textContent = t('noScores');
    document.getElementById('highScoresBackBtn').textContent = t('back');
    
    // Start Screen
    document.querySelector('#startScreen h1').textContent = t('getReady');
    document.querySelector('#startScreen p:nth-child(2)').textContent = t('useWASD');
    document.querySelector('#startScreen p:nth-child(3)').textContent = t('survive');
    document.getElementById('startBtn').textContent = t('startGame');
    document.getElementById('menuBtn').textContent = t('backToMenu');
    
    // Pause Screen
    document.querySelector('#pauseScreen h1').textContent = t('paused');
    document.getElementById('resumeBtn').textContent = t('resume');
    document.getElementById('pauseMenuBtn').textContent = t('mainMenu');
    
    // Game Over Screen
    document.querySelector('#gameOverScreen h1').textContent = t('gameOver');
    document.getElementById('newHighScore').textContent = t('newHighScore');
    document.getElementById('restartBtn').textContent = t('playAgain');
    document.getElementById('gameOverMenuBtn').textContent = t('mainMenu');
}

let gridColor = 'rgba(0, 255, 255, 0.1)';
let canvasBgColor = '#0f0f23';
let playerColor = '#00ffff';

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let gameTime = 0;
let lastTime = 0;
let enemySpawnTimer = 0;
let enemySpawnRate = 1500; // ms

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
        }
    } else {
        // Add new entry
        highScores.push({ name: playerName, score, time, date: new Date().toLocaleDateString(), difficulty: settings.difficulty });
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
    
    // Display highest score first (highlighted)
    highScores.forEach((entry, index) => {
        const isOwnScore = entry.name === playerName;
        const isHighest = entry.score === highestScore;
        const deleteButton = isOwnScore ? `<button class="delete-btn" data-index="${index}">🗑️</button>` : '';
        const difficultyText = entry.difficulty ? t(entry.difficulty) : '';
        
        const entryClass = isHighest ? 'score-entry score-top' : 'score-entry';
        const crownIcon = isHighest ? '👑 ' : '';

        html += `
        <div class="${entryClass}">
            <span class="score-rank">${crownIcon}#${index + 1}</span>
            <span class="score-name">${entry.name || 'Anonymous'}</span>
            <span class="score-value">${t('score')}: ${entry.score}</span>
            <span class="score-time">${entry.time}s - ${entry.date}</span>
            ${difficultyText ? `<span class="score-difficulty">${difficultyText}</span>` : ''}
            ${deleteButton}
        </div>
    `;
    });

    scoresList.innerHTML = html;

    // Add event listeners to delete buttons
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.dataset.index);
            deleteHighScore(index);
        });
    });
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
        
        // Speed increases with game time
        const speedMultiplier = (1 + (gameTime / 60) * 0.5) * diff.speedMult;
        this.speed = (100 + Math.random() * 100) * speedMultiplier;
        
        this.vx = (dx / distance) * this.speed;
        this.vy = (dy / distance) * this.speed;
        
        this.damage = (10 + Math.floor(Math.random() * 10)) * diff.damageMult;
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
    const screens = ['mainMenu', 'settingsScreen', 'howToPlayScreen', 'highScoresScreen', 'startScreen', 'pauseScreen', 'gameOverScreen'];
    screens.forEach(id => {
        const el = document.getElementById(id);
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
    score = 0;
    gameTime = 0;
    enemies = [];
    particles = [];
    enemySpawnTimer = 0;
    enemySpawnRate = 1500;
    applySettings();
}

// Main game loop
function gameLoop(timestamp) {
    if (!gameRunning || gamePaused) return;
    
    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1); // Cap delta time
    lastTime = timestamp;
    
    // Update game time
    gameTime += deltaTime;
    
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
    
    // Spawn and update enemies
    spawnEnemy(deltaTime);
    
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        enemy.update(deltaTime);
        enemy.draw();
        
        // Check collision with player
        if (!player.invulnerable && checkCollision(player, enemy)) {
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
    resetGame();
    gameRunning = true;
    gamePaused = false;
    lastTime = performance.now();
    showScreen('none');
    startGameMusic();
    requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('playBtn').addEventListener('click', () => {
    showScreen('startScreen');
});

document.getElementById('settingsBtn').addEventListener('click', () => {
    showScreen('settingsScreen');
});

document.getElementById('howToPlayBtn').addEventListener('click', () => {
    showScreen('howToPlayScreen');
});

document.getElementById('highScoresBtn').addEventListener('click', () => {
    displayHighScores();
    showScreen('highScoresScreen');
});

document.getElementById('settingsBackBtn').addEventListener('click', closeSettings);

document.getElementById('closeSettingsBtn').addEventListener('click', closeSettings);

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
    } catch (e) {
        console.error('Error applying settings:', e);
    }
    
    stopAllMusic();
    startMenuMusic();
    showScreen('mainMenu');
}

document.getElementById('setNameBtn').addEventListener('click', confirmNameChange);

// Sound toggle in settings
document.getElementById('soundToggle').addEventListener('click', () => {
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

document.getElementById('howToPlayBackBtn').addEventListener('click', () => {
    showScreen('mainMenu');
});

document.getElementById('highScoresBackBtn').addEventListener('click', () => {
    showScreen('mainMenu');
});

document.getElementById('startBtn').addEventListener('click', startGame);

document.getElementById('menuBtn').addEventListener('click', () => {
    showScreen('mainMenu');
});

document.getElementById('resumeBtn').addEventListener('click', () => {
    togglePause();
});

document.getElementById('pauseMenuBtn').addEventListener('click', () => {
    gameRunning = false;
    gamePaused = false;
    stopAllMusic();
    startMenuMusic();
    showScreen('mainMenu');
});

document.getElementById('restartBtn').addEventListener('click', startGame);

document.getElementById('gameOverMenuBtn').addEventListener('click', () => {
    stopAllMusic();
    startMenuMusic();
    showScreen('mainMenu');
});

// Music toggle
document.getElementById('musicToggle').addEventListener('click', () => {
    initAudio();
    musicEnabled = !musicEnabled;
    const musicBtn = document.getElementById('musicToggle');
    musicBtn.textContent = musicEnabled ? '🔊' : '🔇';
    musicBtn.title = musicEnabled ? t('musicOff') : t('musicOn');
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

// Initialize
loadSettings();
loadHighScores();
showScreen('mainMenu');
updateSoundButton();

// Start menu music when page loads (will initialize audio on first user interaction)
document.addEventListener('click', function initAudioOnce() {
    initAudio();
    startMenuMusic();
    document.removeEventListener('click', initAudioOnce);
});
