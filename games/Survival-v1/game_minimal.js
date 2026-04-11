// MINIMAL GAME.JS - Debug version
console.log('🔴 MINIMAL GAME.JS LOADING...');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

console.log('✅ Canvas created');

let gameRunning = false;
let score = 0;
let gameTime = 0;
let currentChapter = 1;

const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 40,
    height: 40,
    speed: 300,
    health: 100,
    maxHealth: 100
};

const enemies = [];
const particles = [];

console.log('✅ Player and game state created');

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

console.log('✅ showScreen function created');

// Start game
function startGame() {
    console.log('🎮 startGame() called!');
    gameRunning = true;
    showScreen('none');
    alert('Game started! (Minimal version)');
}

console.log('✅ startGame function created');

function togglePause() {
    gameRunning = !gameRunning;
}

function restartGame() {
    startGame();
}

function displayHighScores() {
    console.log('Display high scores');
}

function showMainMenuChapters() {
    showScreen('chapterListScreen');
}

function continueToNextChapter() {
    currentChapter++;
    startGame();
}

function showChapterList() {
    showScreen('chapterListScreen');
}

function closeSettings() {
    showScreen('mainMenu');
}

function updateShopUI() {
    console.log('Update shop UI');
}

function updateLanguage() {
    console.log('Update language');
}

console.log('✅ All functions created');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    console.log('🟢 DOMContentLoaded fired!');
    
    const startBtn = document.getElementById('startBtn');
    console.log('🔍 Start button:', startBtn);
    
    if (startBtn) {
        startBtn.addEventListener('click', function() {
            console.log('✅ Start button clicked!');
            startGame();
        });
    } else {
        console.error('❌ Start button NOT found!');
    }
    
    // Play button
    const playBtn = document.getElementById('playBtn');
    if (playBtn) {
        playBtn.addEventListener('click', function() {
            showScreen('startScreen');
        });
    }
    
    console.log('✅ Event listeners set up');
    showScreen('mainMenu');
    
    console.log('🟢 MINIMAL GAME.JS LOADED SUCCESSFULLY!');
    console.log(' You should see the main menu now');
});
