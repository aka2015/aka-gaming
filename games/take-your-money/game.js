// Game State
const gameState = {
    currentScreen: 'mainMenu',
    level: 1,
    score: 0,
    timeLeft: 30,
    gridSize: 3,
    moneyTiles: [],
    bombTiles: [],
    totalMoney: 0,
    collectedMoney: 0,
    comboCount: 0,
    lastCollectTime: 0,
    timerInterval: null,
    isPaused: false,
    highScore: parseInt(localStorage.getItem('takeYourMoneyHighScore')) || 0,
    currentLanguage: 'en',
    settings: {
        soundEnabled: true,
        musicEnabled: true,
        startingDifficulty: 'medium'
    }
};

// Translations
const translations = {
    en: {
        gameTitle: '💰 Take Your Money 💰',
        subtitle: 'Collect all the money before time runs out!',
        startGame: '🎮 Start Game',
        settings: '⚙️ Settings',
        howToPlay: '📖 How to Play',
        highScore: 'High Score',
        settingsTitle: '⚙️ Settings',
        soundEffects: 'Sound Effects',
        bgMusic: 'Background Music',
        startingDifficulty: 'Starting Difficulty',
        language: 'Language',
        easy: 'Easy',
        medium: 'Medium',
        hard: 'Hard',
        back: '🔙 Back',
        howToPlayTitle: '📖 How to Play',
        goal: 'Goal:',
        goalDesc: 'Collect all the money 💵 on the grid before time runs out!',
        controls: 'Controls:',
        controlsDesc: 'Click on money tiles to collect them',
        time: 'Time:',
        timeDesc: 'You have limited time - collect money quickly!',
        difficulty: 'Difficulty:',
        difficultyDesc: 'Each level gets harder:',
        diffItem1: 'Grid gets bigger (3x3 → 4x4 → 5x5 → etc.)',
        diffItem2: 'Time gets shorter',
        diffItem3: 'Bomb tiles appear (don\'t click them! 💣)',
        diffItem4: 'Money tiles move after a certain level',
        bombs: 'Bombs:',
        bombsDesc: 'Clicking a bomb loses time!',
        bonus: 'Bonus:',
        bonusDesc: 'Collect combo multipliers for speed!',
        level: '📊 Level:',
        score: '💰 Score:',
        timeLabel: '⏱️ Time:',
        remaining: '💵 Remaining:',
        pause: '⏸️ Pause',
        pausedTitle: '⏸️ Paused',
        resume: '▶️ Resume',
        restartLevel: '🔄 Restart Level',
        quitToMenu: '🏠 Quit to Menu',
        timesUp: '💥 Time\'s Up!',
        levelReached: 'Level Reached',
        finalScore: 'Final Score',
        moneyCollected: 'Money Collected',
        retry: '🔄 Retry',
        mainMenu: '🏠 Main Menu',
        levelComplete: '🎉 Level Complete!',
        levelLabel: 'Level',
        scoreLabel: 'Score',
        timeBonus: 'Time Bonus',
        comboBonus: 'Combo Bonus',
        nextLevel: '➡️ Next Level'
    },
    id: {
        gameTitle: '💰 Ambil Uangmu 💰',
        subtitle: 'Kumpulkan semua uang sebelum waktu habis!',
        startGame: '🎮 Mulai Game',
        settings: '⚙️ Pengaturan',
        howToPlay: '📖 Cara Bermain',
        highScore: 'Skor Tertinggi',
        settingsTitle: '⚙️ Pengaturan',
        soundEffects: 'Efek Suara',
        bgMusic: 'Musik Latar',
        startingDifficulty: 'Kesulitan Awal',
        language: 'Bahasa',
        easy: 'Mudah',
        medium: 'Sedang',
        hard: 'Sulit',
        back: '🔙 Kembali',
        howToPlayTitle: '📖 Cara Bermain',
        goal: 'Tujuan:',
        goalDesc: 'Kumpulkan semua uang 💵 di grid sebelum waktu habis!',
        controls: 'Kontrol:',
        controlsDesc: 'Klik pada tile uang untuk mengambilnya',
        time: 'Waktu:',
        timeDesc: 'Waktumu terbatas - kumpulkan uang dengan cepat!',
        difficulty: 'Kesulitan:',
        difficultyDesc: 'Setiap level semakin sulit:',
        diffItem1: 'Grid membesar (3x3 → 4x4 → 5x5 → dst.)',
        diffItem2: 'Waktu semakin singkat',
        diffItem3: 'Tile bom muncul (jangan klik! 💣)',
        diffItem4: 'Tile uang bergerak setelah level tertentu',
        bombs: 'Bom:',
        bombsDesc: 'Mengklik bom mengurangi waktu!',
        bonus: 'Bonus:',
        bonusDesc: 'Kumpulkan combo multiplier untuk kecepatan!',
        level: '📊 Level:',
        score: '💰 Skor:',
        timeLabel: '⏱️ Waktu:',
        remaining: '💵 Tersisa:',
        pause: '⏸️ Jeda',
        pausedTitle: '⏸️ Dijeda',
        resume: '▶️ Lanjutkan',
        restartLevel: '🔄 Ulangi Level',
        quitToMenu: '🏠 Kembali ke Menu',
        timesUp: '💥 Waktu Habis!',
        levelReached: 'Level Tercapai',
        finalScore: 'Skor Akhir',
        moneyCollected: 'Uang Terkumpul',
        retry: '🔄 Coba Lagi',
        mainMenu: '🏠 Menu Utama',
        levelComplete: '🎉 Level Selesai!',
        levelLabel: 'Level',
        scoreLabel: 'Skor',
        timeBonus: 'Bonus Waktu',
        comboBonus: 'Bonus Combo',
        nextLevel: '➡️ Level Berikutnya'
    },
    de: {
        gameTitle: '💰 Nimm Dein Geld 💰',
        subtitle: 'Sammle das gesamte Geld, bevor die Zeit abläuft!',
        startGame: '🎮 Spiel Starten',
        settings: '⚙️ Einstellungen',
        howToPlay: '📖 Anleitung',
        highScore: 'Höchste Punktzahl',
        settingsTitle: '⚙️ Einstellungen',
        soundEffects: 'Soundeffekte',
        bgMusic: 'Hintergrundmusik',
        startingDifficulty: 'Startschwierigkeit',
        language: 'Sprache',
        easy: 'Einfach',
        medium: 'Mittel',
        hard: 'Schwer',
        back: '🔙 Zurück',
        howToPlayTitle: '📖 Anleitung',
        goal: 'Ziel:',
        goalDesc: 'Sammle das gesamte Geld 💵 auf dem Raster, bevor die Zeit abläuft!',
        controls: 'Steuerung:',
        controlsDesc: 'Klicke auf die Geldkacheln, um sie zu sammeln',
        time: 'Zeit:',
        timeDesc: 'Du hast begrenzte Zeit - sammle schnell Geld!',
        difficulty: 'Schwierigkeit:',
        difficultyDesc: 'Jedes Level wird schwerer:',
        diffItem1: 'Das Raster wird größer (3x3 → 4x4 → 5x5 → usw.)',
        diffItem2: 'Die Zeit wird kürzer',
        diffItem3: 'Bombenkacheln erscheinen (klicke sie nicht an! 💣)',
        diffItem4: 'Geldkacheln bewegen sich ab einem bestimmten Level',
        bombs: 'Bomben:',
        bombsDesc: 'Das Klicken auf eine Bombe kostet Zeit!',
        bonus: 'Bonus:',
        bonusDesc: 'Sammle Combo-Multiplikatoren für Geschwindigkeit!',
        level: '📊 Level:',
        score: '💰 Punkte:',
        timeLabel: '⏱️ Zeit:',
        remaining: '💵 Übrig:',
        pause: '⏸️ Pause',
        pausedTitle: '⏸️ Pausiert',
        resume: '▶️ Fortsetzen',
        restartLevel: '🔄 Level Neustarten',
        quitToMenu: '🏠 Zum Hauptmenü',
        timesUp: '💥 Zeit Abgelaufen!',
        levelReached: 'Erreichtes Level',
        finalScore: 'Endpunktzahl',
        moneyCollected: 'Geld Gesammelt',
        retry: '🔄 Nochmal',
        mainMenu: '🏠 Hauptmenü',
        levelComplete: '🎉 Level Geschafft!',
        levelLabel: 'Level',
        scoreLabel: 'Punkte',
        timeBonus: 'Zeitbonus',
        comboBonus: 'Combobonus',
        nextLevel: '➡️ Nächstes Level'
    },
    fr: {
        gameTitle: '💰 Prends Ton Argent 💰',
        subtitle: 'Collecte tout l\'argent avant que le temps ne s\'écoule !',
        startGame: '🎮 Commencer',
        settings: '⚙️ Paramètres',
        howToPlay: '📖 Comment Jouer',
        highScore: 'Meilleur Score',
        settingsTitle: '⚙️ Paramètres',
        soundEffects: 'Effets Sonores',
        bgMusic: 'Musique de Fond',
        startingDifficulty: 'Difficulté Initiale',
        language: 'Langue',
        easy: 'Facile',
        medium: 'Moyen',
        hard: 'Difficile',
        back: '🔙 Retour',
        howToPlayTitle: '📖 Comment Jouer',
        goal: 'Objectif :',
        goalDesc: 'Collecte tout l\'argent 💵 sur la grille avant que le temps ne s\'écoule !',
        controls: 'Contrôles :',
        controlsDesc: 'Clique sur les tuiles d\'argent pour les collecter',
        time: 'Temps :',
        timeDesc: 'Tu as un temps limité - collecte l\'argent rapidement !',
        difficulty: 'Difficulté :',
        difficultyDesc: 'Chaque niveau devient plus difficile :',
        diffItem1: 'La grille devient plus grande (3x3 → 4x4 → 5x5 → etc.)',
        diffItem2: 'Le temps devient plus court',
        diffItem3: 'Des tuiles bombe apparaissent (ne les clique pas ! 💣)',
        diffItem4: 'Les tuiles d\'argent bougent après un certain niveau',
        bombs: 'Bombes :',
        bombsDesc: 'Cliquer sur une bombe fait perdre du temps !',
        bonus: 'Bonus :',
        bonusDesc: 'Collecte des multiplicateurs combo pour la vitesse !',
        level: '📊 Niveau :',
        score: '💰 Score :',
        timeLabel: '⏱️ Temps :',
        remaining: '💵 Restant :',
        pause: '⏸️ Pause',
        pausedTitle: '⏸️ En Pause',
        resume: '▶️ Reprendre',
        restartLevel: '🔄 Redémarrer le Niveau',
        quitToMenu: '🏠 Retour au Menu',
        timesUp: '💥 Temps Écoulé !',
        levelReached: 'Niveau Atteint',
        finalScore: 'Score Final',
        moneyCollected: 'Argent Collecté',
        retry: '🔄 Réessayer',
        mainMenu: '🏠 Menu Principal',
        levelComplete: '🎉 Niveau Terminé !',
        levelLabel: 'Niveau',
        scoreLabel: 'Score',
        timeBonus: 'Bonus de Temps',
        comboBonus: 'Bonus Combo',
        nextLevel: '➡️ Niveau Suivant'
    },
    it: {
        gameTitle: '💰 Prendi i Tuoi Soldi 💰',
        subtitle: 'Raccogli tutti i soldi prima che scada il tempo!',
        startGame: '🎮 Inizia Gioco',
        settings: '⚙️ Impostazioni',
        howToPlay: '📖 Come Giocare',
        highScore: 'Punteggio Più Alto',
        settingsTitle: '⚙️ Impostazioni',
        soundEffects: 'Effetti Sonori',
        bgMusic: 'Musica di Sottofondo',
        startingDifficulty: 'Difficoltà Iniziale',
        language: 'Lingua',
        easy: 'Facile',
        medium: 'Medio',
        hard: 'Difficile',
        back: '🔙 Indietro',
        howToPlayTitle: '📖 Come Giocare',
        goal: 'Obiettivo:',
        goalDesc: 'Raccogli tutti i soldi 💵 sulla griglia prima che scada il tempo!',
        controls: 'Controlli:',
        controlsDesc: 'Clicca sulle tessere dei soldi per raccoglierle',
        time: 'Tempo:',
        timeDesc: 'Hai un tempo limitato - raccogli i soldi velocemente!',
        difficulty: 'Difficoltà:',
        difficultyDesc: 'Ogni livello diventa più difficile:',
        diffItem1: 'La griglia diventa più grande (3x3 → 4x4 → 5x5 → ecc.)',
        diffItem2: 'Il tempo diventa più breve',
        diffItem3: 'Appaiono tessere bomba (non cliccarle! 💣)',
        diffItem4: 'Le tessere dei soldi si muovono dopo un certo livello',
        bombs: 'Bombe:',
        bombsDesc: 'Cliccare una bomba fa perdere tempo!',
        bonus: 'Bonus:',
        bonusDesc: 'Raccogli moltiplicatori combo per la velocità!',
        level: '📊 Livello:',
        score: '💰 Punteggio:',
        timeLabel: '⏱️ Tempo:',
        remaining: '💵 Rimanenti:',
        pause: '⏸️ Pausa',
        pausedTitle: '⏸️ In Pausa',
        resume: '▶️ Riprendi',
        restartLevel: '🔄 Riavvia Livello',
        quitToMenu: '🏠 Torna al Menu',
        timesUp: '💥 Tempo Scaduto!',
        levelReached: 'Livello Raggiunto',
        finalScore: 'Punteggio Finale',
        moneyCollected: 'Soldi Raccolti',
        retry: '🔄 Riprova',
        mainMenu: '🏠 Menu Principale',
        levelComplete: '🎉 Livello Completato!',
        levelLabel: 'Livello',
        scoreLabel: 'Punteggio',
        timeBonus: 'Bonus Tempo',
        comboBonus: 'Bonus Combo',
        nextLevel: '➡️ Prossimo Livello'
    },
    ko: {
        gameTitle: '💰 돈 가져가 💰',
        subtitle: '시간이 다되기 전에 모든 돈을 모아!',
        startGame: '🎮 게임 시작',
        settings: '⚙️ 설정',
        howToPlay: '📖 플레이 방법',
        highScore: '최고 점수',
        settingsTitle: '⚙️ 설정',
        soundEffects: '소리 효과',
        bgMusic: '배경 음악',
        startingDifficulty: '시작 난이도',
        language: '언어',
        easy: '쉬움',
        medium: '보통',
        hard: '어려움',
        back: '🔙 뒤로',
        howToPlayTitle: '📖 플레이 방법',
        goal: '목표:',
        goalDesc: '시간이 다되기 전에 그리드의 모든 돈 💵을 모아!',
        controls: '조작:',
        controlsDesc: '돈 타일을 클릭해서 모으세요',
        time: '시간:',
        timeDesc: '제한된 시간이 있어요 - 빨리 돈을 모으세요!',
        difficulty: '난이도:',
        difficultyDesc: '각 레벨이 점점 어려워집니다:',
        diffItem1: '그리드가 커집니다 (3x3 → 4x4 → 5x5 → 등)',
        diffItem2: '시간이 짧아집니다',
        diffItem3: '폭탄 타일이 나타납니다 (클릭하지 마세요! 💣)',
        diffItem4: '특정 레벨 이후 돈 타일이 움직입니다',
        bombs: '폭탄:',
        bombsDesc: '폭탄을 클릭하면 시간이 줄어듭니다!',
        bonus: '보너스:',
        bonusDesc: '속도를 위해 콤보 배율을 모으세요!',
        level: '📊 레벨:',
        score: '💰 점수:',
        timeLabel: '⏱️ 시간:',
        remaining: '💵 남은:',
        pause: '⏸️ 일시정지',
        pausedTitle: '⏸️ 일시정지됨',
        resume: '▶️ 계속하기',
        restartLevel: '🔄 레벨 재시작',
        quitToMenu: '🏠 메뉴로 나가기',
        timesUp: '💥 시간 종료!',
        levelReached: '도달한 레벨',
        finalScore: '최종 점수',
        moneyCollected: '모은 돈',
        retry: '🔄 다시 시도',
        mainMenu: '🏠 메인 메뉴',
        levelComplete: '🎉 레벨 완료!',
        levelLabel: '레벨',
        scoreLabel: '점수',
        timeBonus: '시간 보너스',
        comboBonus: '콤보 보너스',
        nextLevel: '➡️ 다음 레벨'
    },
    ja: {
        gameTitle: '💰 お金を取って 💰',
        subtitle: '時間がなくなる前にすべてのお金を集めよう！',
        startGame: '🎮 ゲーム開始',
        settings: '⚙️ 設定',
        howToPlay: '📖 プレイ方法',
        highScore: 'ハイスコア',
        settingsTitle: '⚙️ 設定',
        soundEffects: 'サウンドエフェクト',
        bgMusic: 'BGM',
        startingDifficulty: '開始難易度',
        language: '言語',
        easy: '簡単',
        medium: '普通',
        hard: '難しい',
        back: '🔙 戻る',
        howToPlayTitle: '📖 プレイ方法',
        goal: '目標:',
        goalDesc: '時間がなくなる前にグリッド上のすべてのお金 💵 を集めよう！',
        controls: '操作:',
        controlsDesc: 'お金のタイルをクリックして集める',
        time: '時間:',
        timeDesc: '制限時間があります - 素早くお金を集めて！',
        difficulty: '難易度:',
        difficultyDesc: '各レベルがどんどん難しくなります:',
        diffItem1: 'グリッドが大きくなる (3x3 → 4x4 → 5x5 → など)',
        diffItem2: '時間が短くなる',
        diffItem3: '爆弾タイルが出現 (クリックしないで！ 💣)',
        diffItem4: '特定のレベル後にお金のタイルが動く',
        bombs: '爆弾:',
        bombsDesc: '爆弾をクリックすると時間が減ります！',
        bonus: 'ボーナス:',
        bonusDesc: 'コンボ倍率を集めてスピードアップ！',
        level: '📊 レベル:',
        score: '💰 スコア:',
        timeLabel: '⏱️ 時間:',
        remaining: '💵 残り:',
        pause: '⏸️ 一時停止',
        pausedTitle: '⏸️ 一時停止中',
        resume: '▶️ 再開',
        restartLevel: '🔄 レベルをリスタート',
        quitToMenu: '🏠 メニューに戻る',
        timesUp: '💥 タイムアップ！',
        levelReached: '到達レベル',
        finalScore: '最終スコア',
        moneyCollected: '集めたお金',
        retry: '🔄 リトライ',
        mainMenu: '🏠 メインメニュー',
        levelComplete: '🎉 レベルクリア！',
        levelLabel: 'レベル',
        scoreLabel: 'スコア',
        timeBonus: '時間ボーナス',
        comboBonus: 'コンボボーナス',
        nextLevel: '➡️ 次のレベル'
    },
    'pt-BR': {
        gameTitle: '💰 Pegue Seu Dinheiro 💰',
        subtitle: 'Colete todo o dinheiro antes que o tempo acabe!',
        startGame: '🎮 Iniciar Jogo',
        settings: '⚙️ Configurações',
        howToPlay: '📖 Como Jogar',
        highScore: 'Recorde',
        settingsTitle: '⚙️ Configurações',
        soundEffects: 'Efeitos Sonoros',
        bgMusic: 'Música de Fundo',
        startingDifficulty: 'Dificuldade Inicial',
        language: 'Idioma',
        easy: 'Fácil',
        medium: 'Médio',
        hard: 'Difícil',
        back: '🔙 Voltar',
        howToPlayTitle: '📖 Como Jogar',
        goal: 'Objetivo:',
        goalDesc: 'Colete todo o dinheiro 💵 na grade antes que o tempo acabe!',
        controls: 'Controles:',
        controlsDesc: 'Clique nas peças de dinheiro para coletá-las',
        time: 'Tempo:',
        timeDesc: 'Você tem tempo limitado - colete o dinheiro rápido!',
        difficulty: 'Dificuldade:',
        difficultyDesc: 'Cada nível fica mais difícil:',
        diffItem1: 'A grade fica maior (3x3 → 4x4 → 5x5 → etc.)',
        diffItem2: 'O tempo fica menor',
        diffItem3: 'Peças de bomba aparecem (não clique nelas! 💣)',
        diffItem4: 'As peças de dinheiro se movem após certo nível',
        bombs: 'Bombas:',
        bombsDesc: 'Clicar em uma bomba perde tempo!',
        bonus: 'Bônus:',
        bonusDesc: 'Colete multiplicadores de combo para velocidade!',
        level: '📊 Nível:',
        score: '💰 Pontuação:',
        timeLabel: '⏱️ Tempo:',
        remaining: '💵 Restante:',
        pause: '⏸️ Pausar',
        pausedTitle: '⏸️ Pausado',
        resume: '▶️ Continuar',
        restartLevel: '🔄 Reiniciar Nível',
        quitToMenu: '🏠 Voltar ao Menu',
        timesUp: '💥 Tempo Esgotado!',
        levelReached: 'Nível Alcançado',
        finalScore: 'Pontuação Final',
        moneyCollected: 'Dinheiro Coletado',
        retry: '🔄 Tentar Novamente',
        mainMenu: '🏠 Menu Principal',
        levelComplete: '🎉 Nível Completo!',
        levelLabel: 'Nível',
        scoreLabel: 'Pontuação',
        timeBonus: 'Bônus de Tempo',
        comboBonus: 'Bônus de Combo',
        nextLevel: '➡️ Próximo Nível'
    },
    pt: {
        gameTitle: '💰 Apanha o Teu Dinheiro 💰',
        subtitle: 'Recolhe todo o dinheiro antes que o tempo acabe!',
        startGame: '🎮 Iniciar Jogo',
        settings: '⚙️ Definições',
        howToPlay: '📖 Como Jogar',
        highScore: 'Melhor Pontuação',
        settingsTitle: '⚙️ Definições',
        soundEffects: 'Efeitos Sonoros',
        bgMusic: 'Música de Fundo',
        startingDifficulty: 'Dificuldade Inicial',
        language: 'Idioma',
        easy: 'Fácil',
        medium: 'Médio',
        hard: 'Difícil',
        back: '🔙 Voltar',
        howToPlayTitle: '📖 Como Jogar',
        goal: 'Objetivo:',
        goalDesc: 'Recolhe todo o dinheiro 💵 na grelha antes que o tempo acabe!',
        controls: 'Controlos:',
        controlsDesc: 'Clica nas peças de dinheiro para as recolher',
        time: 'Tempo:',
        timeDesc: 'Tens tempo limitado - recolhe o dinheiro rapidamente!',
        difficulty: 'Dificuldade:',
        difficultyDesc: 'Cada nível fica mais difícil:',
        diffItem1: 'A grelha fica maior (3x3 → 4x4 → 5x5 → etc.)',
        diffItem2: 'O tempo fica mais curto',
        diffItem3: 'Aparecem peças de bomba (não cliques nelas! 💣)',
        diffItem4: 'As peças de dinheiro movem-se após um certo nível',
        bombs: 'Bombas:',
        bombsDesc: 'Clicar numa bomba perde tempo!',
        bonus: 'Bónus:',
        bonusDesc: 'Recolhe multiplicadores de combo para velocidade!',
        level: '📊 Nível:',
        score: '💰 Pontuação:',
        timeLabel: '⏱️ Tempo:',
        remaining: '💵 Restante:',
        pause: '⏸️ Pausar',
        pausedTitle: '⏸️ Em Pausa',
        resume: '▶️ Continuar',
        restartLevel: '🔄 Reiniciar Nível',
        quitToMenu: '🏠 Voltar ao Menu',
        timesUp: '💥 Tempo Esgotado!',
        levelReached: 'Nível Atingido',
        finalScore: 'Pontuação Final',
        moneyCollected: 'Dinheiro Recolhido',
        retry: '🔄 Tentar Novamente',
        mainMenu: '🏠 Menu Principal',
        levelComplete: '🎉 Nível Completo!',
        levelLabel: 'Nível',
        scoreLabel: 'Pontuação',
        timeBonus: 'Bónus de Tempo',
        comboBonus: 'Bónus de Combo',
        nextLevel: '➡️ Próximo Nível'
    }
};

// Apply translations
function applyTranslations(lang) {
    gameState.currentLanguage = lang;
    const t = translations[lang];
    
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.textContent = t[key];
        }
    });
    
    // Update language selector
    document.getElementById('languageSelect').value = lang;
}

// Difficulty settings
const difficultySettings = {
    easy: { baseTime: 40, baseGrid: 3, bombChance: 0 },
    medium: { baseTime: 30, baseGrid: 3, bombChance: 0.1 },
    hard: { baseTime: 25, baseGrid: 4, bombChance: 0.15 }
};

// DOM Elements
const screens = {
    mainMenu: document.getElementById('mainMenu'),
    settingsMenu: document.getElementById('settingsMenu'),
    howToPlayMenu: document.getElementById('howToPlayMenu'),
    gameScreen: document.getElementById('gameScreen'),
    pauseMenu: document.getElementById('pauseMenu'),
    gameOverScreen: document.getElementById('gameOverScreen'),
    levelCompleteScreen: document.getElementById('levelCompleteScreen')
};

// Sound Effects (using Web Audio API for simple beeps)
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let bgMusicInterval = null;

function playSound(frequency, duration, type = 'sine', volume = 0.3) {
    if (!gameState.settings.soundEnabled) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = type;
    
    gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
}

function startBgMusic() {
    if (!gameState.settings.musicEnabled || bgMusicInterval) return;
    
    // Play a simple looping melody
    const melody = [
        { freq: 262, dur: 0.3 },  // C4
        { freq: 330, dur: 0.3 },  // E4
        { freq: 392, dur: 0.3 },  // G4
        { freq: 523, dur: 0.3 },  // C5
        { freq: 440, dur: 0.3 },  // A4
        { freq: 392, dur: 0.3 },  // G4
        { freq: 330, dur: 0.3 },  // E4
        { freq: 262, dur: 0.3 },  // C4
    ];
    
    let noteIndex = 0;
    
    function playNote() {
        if (!gameState.settings.musicEnabled) {
            stopBgMusic();
            return;
        }
        
        const note = melody[noteIndex % melody.length];
        playSound(note.freq, note.dur, 'sine', 0.15);
        noteIndex++;
    }
    
    // Play notes in sequence
    playNote();
    bgMusicInterval = setInterval(playNote, 400);
}

function stopBgMusic() {
    if (bgMusicInterval) {
        clearInterval(bgMusicInterval);
        bgMusicInterval = null;
    }
}

function playCollectSound() {
    playSound(800, 0.1, 'sine');
    setTimeout(() => playSound(1000, 0.1, 'sine'), 50);
}

function playBombSound() {
    playSound(200, 0.2, 'sawtooth');
}

function playLevelCompleteSound() {
    [400, 500, 600, 800].forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.15, 'sine'), i * 100);
    });
}

function playGameOverSound() {
    [400, 350, 300, 200].forEach((freq, i) => {
        setTimeout(() => playSound(freq, 0.2, 'sawtooth'), i * 150);
    });
}

// Screen Management
function showScreen(screenName) {
    Object.values(screens).forEach(screen => screen.classList.remove('active'));
    screens[screenName].classList.add('active');
    gameState.currentScreen = screenName;
}

// Menu Event Listeners
document.getElementById('startBtn').addEventListener('click', () => {
    startGame();
});

document.getElementById('settingsBtn').addEventListener('click', () => {
    showScreen('settingsMenu');
});

document.getElementById('howToPlayBtn').addEventListener('click', () => {
    showScreen('howToPlayMenu');
});

document.getElementById('settingsBackBtn').addEventListener('click', () => {
    saveSettings();
    showScreen('mainMenu');
});

document.getElementById('howToPlayBackBtn').addEventListener('click', () => {
    showScreen('mainMenu');
});

document.getElementById('pauseBtn').addEventListener('click', () => {
    pauseGame();
});

document.getElementById('resumeBtn').addEventListener('click', () => {
    resumeGame();
});

document.getElementById('restartBtn').addEventListener('click', () => {
    resumeGame();
    startLevel();
});

document.getElementById('quitToMenuBtn').addEventListener('click', () => {
    quitToMenu();
});

document.getElementById('retryBtn').addEventListener('click', () => {
    gameState.level = 1;
    gameState.score = 0;
    startGame();
});

document.getElementById('gameOverMenuBtn').addEventListener('click', () => {
    quitToMenu();
});

document.getElementById('nextLevelBtn').addEventListener('click', () => {
    gameState.level++;
    clearInterval(gameState.timerInterval);
    gameState.timerInterval = null;
    showScreen('gameScreen');
    startLevel();
    startBgMusic();
});

// Settings management
function saveSettings() {
    gameState.settings.soundEnabled = document.getElementById('soundToggle').checked;
    gameState.settings.musicEnabled = document.getElementById('musicToggle').checked;
    gameState.settings.startingDifficulty = document.getElementById('difficultySelect').value;
    gameState.currentLanguage = document.getElementById('languageSelect').value;
    localStorage.setItem('takeYourMoneySettings', JSON.stringify(gameState.settings));
    localStorage.setItem('takeYourMoneyLanguage', gameState.currentLanguage);
    applyTranslations(gameState.currentLanguage);
}

function loadSettings() {
    const saved = localStorage.getItem('takeYourMoneySettings');
    if (saved) {
        gameState.settings = JSON.parse(saved);
        document.getElementById('soundToggle').checked = gameState.settings.soundEnabled;
        document.getElementById('musicToggle').checked = gameState.settings.musicEnabled;
        document.getElementById('difficultySelect').value = gameState.settings.startingDifficulty;
    }
    
    // Load language
    const savedLang = localStorage.getItem('takeYourMoneyLanguage');
    if (savedLang) {
        gameState.currentLanguage = savedLang;
    }
    document.getElementById('languageSelect').value = gameState.currentLanguage;
}

// Language change event
document.getElementById('languageSelect').addEventListener('change', (e) => {
    applyTranslations(e.target.value);
    saveSettings();
});

// Game Logic
function startGame() {
    const difficulty = difficultySettings[gameState.settings.startingDifficulty];
    gameState.level = 1;
    gameState.score = 0;
    gameState.gridSize = difficulty.baseGrid;
    gameState.timeLeft = difficulty.baseTime;
    
    showScreen('gameScreen');
    startLevel();
    startBgMusic();
}

function startLevel() {
    // Calculate difficulty based on level
    const difficulty = calculateDifficulty();

    gameState.gridSize = difficulty.gridSize;
    gameState.timeLeft = difficulty.time;
    gameState.collectedMoney = 0;
    gameState.comboCount = 0;
    gameState.lastCollectTime = 0;
    gameState.isPaused = false;

    updateDisplay();
    generateGrid();
    startTimer();
}

function calculateDifficulty() {
    const baseDifficulty = difficultySettings[gameState.settings.startingDifficulty];

    // Progressive difficulty
    let gridSize = baseDifficulty.baseGrid;
    let time = baseDifficulty.baseTime;
    let bombChance = baseDifficulty.bombChance;

    // Grid size increases every 3 levels (slower growth)
    if (gameState.level >= 2) gridSize = Math.min(baseDifficulty.baseGrid + Math.floor((gameState.level - 1) / 3), 7);
    
    // Calculate total tiles to ensure reasonable time
    const totalTiles = gridSize * gridSize;
    
    // Time calculation: base time - reduction per level, but ensure minimum reasonable time
    // Each level reduces time by 1 second (instead of 2), minimum 20 seconds
    time = Math.max(baseDifficulty.baseTime - (gameState.level - 1) * 1, 20);
    
    // Add extra time for larger grids to ensure playability
    if (gridSize >= 6) time += 10;
    if (gridSize >= 7) time += 15;

    // Bomb chance increases more slowly (maximum 0.25 instead of 0.35)
    bombChance = Math.min(baseDifficulty.bombChance + (gameState.level - 1) * 0.02, 0.25);

    return { gridSize, time, bombChance };
}

function generateGrid() {
    const grid = document.getElementById('gameGrid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 80px)`;
    grid.style.gridTemplateRows = `repeat(${gameState.gridSize}, 80px)`;
    
    gameState.moneyTiles = [];
    gameState.bombTiles = [];
    
    const totalTiles = gameState.gridSize * gameState.gridSize;
    const difficulty = calculateDifficulty();
    
    // Generate tiles
    const tileTypes = [];
    
    // 65-75% money tiles (increased from 60-70%)
    const moneyCount = Math.floor(totalTiles * 0.70);
    for (let i = 0; i < moneyCount; i++) {
        tileTypes.push('money');
    }
    
    // Bomb tiles based on difficulty
    const bombCount = Math.floor(totalTiles * difficulty.bombChance);
    for (let i = 0; i < bombCount; i++) {
        tileTypes.push('bomb');
    }
    
    // Empty tiles
    const emptyCount = totalTiles - moneyCount - bombCount;
    for (let i = 0; i < emptyCount; i++) {
        tileTypes.push('empty');
    }
    
    // Shuffle
    tileTypes.sort(() => Math.random() - 0.5);
    
    // Create tiles
    tileTypes.forEach((type, index) => {
        const tile = document.createElement('div');
        tile.className = 'grid-cell';
        tile.dataset.index = index;
        
        if (type === 'money') {
            tile.classList.add('money');
            tile.textContent = ['💵', '💰', '💎'][Math.floor(Math.random() * 3)];
            tile.dataset.value = Math.floor(Math.random() * 50) + 10;
            gameState.moneyTiles.push(tile);
        } else if (type === 'bomb') {
            tile.classList.add('bomb');
            tile.textContent = '💣';
            gameState.bombTiles.push(tile);
        } else {
            tile.classList.add('empty');
            tile.style.background = '#e5e7eb';
            tile.style.cursor = 'default';
        }
        
        tile.addEventListener('click', () => handleTileClick(tile));
        grid.appendChild(tile);
    });
    
    gameState.totalMoney = gameState.moneyTiles.length;
    updateDisplay();
}

function handleTileClick(tile) {
    if (gameState.isPaused || tile.classList.contains('collected')) return;
    
    if (tile.classList.contains('money')) {
        // Collect money
        const value = parseInt(tile.dataset.value);
        const now = Date.now();
        
        // Combo system
        if (now - gameState.lastCollectTime < 1000) {
            gameState.comboCount++;
        } else {
            gameState.comboCount = 1;
        }
        gameState.lastCollectTime = now;
        
        const comboMultiplier = 1 + (gameState.comboCount * 0.1);
        const finalValue = Math.floor(value * comboMultiplier);
        
        gameState.score += finalValue;
        gameState.collectedMoney++;
        
        tile.classList.add('collected');
        tile.textContent = '✓';
        
        playCollectSound();
        updateDisplay();
        
        // Check if level complete
        if (gameState.collectedMoney >= gameState.totalMoney) {
            levelComplete();
        }
    } else if (tile.classList.contains('bomb')) {
        // Hit a bomb - lose time
        gameState.timeLeft = Math.max(gameState.timeLeft - 3, 0);
        gameState.comboCount = 0;
        
        tile.style.animation = 'bomb 0.5s';
        setTimeout(() => {
            tile.style.animation = '';
        }, 500);
        
        playBombSound();
        updateDisplay();
        
        // Check if time ran out
        if (gameState.timeLeft <= 0) {
            gameOver();
        }
    }
}

function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        if (!gameState.isPaused) {
            gameState.timeLeft--;
            updateDisplay();
            
            if (gameState.timeLeft <= 0) {
                gameOver();
            }
        }
    }, 1000);
}

function updateDisplay() {
    document.getElementById('levelDisplay').textContent = gameState.level;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('timeDisplay').textContent = gameState.timeLeft;
    document.getElementById('remainingDisplay').textContent = 
        gameState.totalMoney - gameState.collectedMoney;
    
    // Time warning
    const timeDisplay = document.getElementById('timeDisplay');
    if (gameState.timeLeft <= 5) {
        timeDisplay.classList.add('time-warning');
    } else {
        timeDisplay.classList.remove('time-warning');
    }
}

function pauseGame() {
    gameState.isPaused = true;
    stopBgMusic();
    showScreen('pauseMenu');
}

function resumeGame() {
    gameState.isPaused = false;
    showScreen('gameScreen');
    startBgMusic();
}

function quitToMenu() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    stopBgMusic();
    updateHighScore();
    showScreen('mainMenu');
}

function levelComplete() {
    clearInterval(gameState.timerInterval);
    stopBgMusic();
    playLevelCompleteSound();
    
    // Calculate bonuses
    const timeBonus = gameState.timeLeft * 10;
    const comboBonus = gameState.comboCount * 5;
    
    gameState.score += timeBonus + comboBonus;
    
    document.getElementById('completedLevel').textContent = gameState.level;
    document.getElementById('completedScore').textContent = gameState.score;
    document.getElementById('timeBonus').textContent = timeBonus;
    document.getElementById('comboBonus').textContent = comboBonus;
    
    showScreen('levelCompleteScreen');
}

function gameOver() {
    clearInterval(gameState.timerInterval);
    stopBgMusic();
    playGameOverSound();
    
    document.getElementById('finalLevel').textContent = gameState.level;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('moneyCollected').textContent = gameState.collectedMoney;
    window.AkaScoreReporter?.report('take-your-money', gameState.score, {
        level: gameState.level,
        collectedMoney: gameState.collectedMoney,
        difficulty: gameState.settings.startingDifficulty
    });
    
    updateHighScore();
    showScreen('gameOverScreen');
}

function updateHighScore() {
    if (gameState.score > gameState.highScore) {
        gameState.highScore = gameState.score;
        localStorage.setItem('takeYourMoneyHighScore', gameState.highScore);
    }
    document.getElementById('highScoreDisplay').textContent = gameState.highScore;
}

// Initialize
function init() {
    loadSettings();
    applyTranslations(gameState.currentLanguage);
    document.getElementById('highScoreDisplay').textContent = gameState.highScore;
}

init();
