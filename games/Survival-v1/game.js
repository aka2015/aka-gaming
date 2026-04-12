// ========================================
// 2D SURVIVAL GAME - WITH WEAPONS SYSTEM
// ========================================

'use strict';

console.log('🎮=== GAME SCRIPT LOADING ===');

function waitForDOM(callback) {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(callback, 1);
    } else {
        document.addEventListener('DOMContentLoaded', callback);
    }
}

waitForDOM(function() {
    console.log('✅ DOM is ready!');
    
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        alert('Error: Canvas not found!');
        return;
    }
    
    const ctx = canvas.getContext('2d');
    console.log('✅ Canvas found');
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // ========================================
    // WEAPONS SYSTEM
    // ========================================
    
    const WEAPONS = {
        bat: {
            name: 'Baseball Bat',
            damage: 10,
            range: 40,
            attackSpeed: 0.5, // 1 hit per 2 seconds (melee)
            price: 0,
            color: '#8B4513',
            icon: '🏏',
            description: 'Tongkat baseball - 1 pukulan/2 detik'
        },
        knife: {
            name: 'Knife',
            damage: 20,
            range: 30,
            attackSpeed: 0.5, // 1 hit per 2 seconds (melee)
            price: 100,
            color: '#C0C0C0',
            icon: '🔪',
            description: 'Pisau tajam - 1 tusukan/2 detik'
        },
        pistol: {
            name: 'Pistol',
            damage: 35,
            range: 200,
            attackSpeed: 2,
            price: 300,
            color: '#333333',
            icon: '🔫',
            description: 'Pistol - Damage tinggi, jarak jauh'
        },
        rifle: {
            name: 'Rifle',
            damage: 50,
            range: 300,
            attackSpeed: 3,
            price: 600,
            color: '#1a1a1a',
            icon: '🎯',
            description: 'Rifle - Damage sangat tinggi'
        },
        minigun: {
            name: 'Minigun',
            damage: 80,
            range: 250,
            attackSpeed: 6,
            price: 1200,
            color: '#FF4500',
            icon: '💥',
            description: 'Minigun - Senjata paling mematikan!'
        }
    };
    
    let currentWeapon = 'bat';
    let weaponLevel = 1;
    let attackCooldown = 0;
    let bullets = [];
    
    // ========================================
    // CHAPTER SYSTEM
    // ========================================
    
    const chapterTimes = { 1: 60, 2: 90, 3: 120, 4: 150, 5: 180 };
    let currentChapter = 1;
    let chapterTimeStart = 0;
    let chapterCompleted = false;
    
    // ========================================
    // BOSS SYSTEM
    // ========================================
    
    const bosses = {
        1: { name: 'Training Boss', color: '#ff4444', radius: 35, health: 80, speed: 50 },
        2: { name: 'Fire Boss', color: '#ff6600', radius: 40, health: 100, speed: 60 },
        3: { name: 'Ice Boss', color: '#00ffff', radius: 45, health: 150, speed: 70 },
        4: { name: 'Shadow Boss', color: '#9900ff', radius: 50, health: 200, speed: 80 },
        5: { name: 'Final Boss', color: '#ff0000', radius: 60, health: 300, speed: 100 }
    };
    
    let currentBoss = null;
    let bossSpawned = false;
    let bossWarningShown = false;
    let bossDefeated = false;
    let bossWarningTime = 0;
    
    // ========================================
    // GAME STATE
    // ========================================
    
    let gameRunning = false;
    let gamePaused = false;
    let score = 0;
    let gameTime = 0;
    let lastTime = 0;
    let soundEnabled = true;
    let spawnTimer = 0;
    
    const player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 20,
        speed: 300,
        health: 100,
        maxHealth: 100,
        color: '#00ffff',
        invulnerable: false,
        invulnerableTime: 0,
        facing: { x: 0, y: 1 }
    };
    
    let enemies = [];
    const keys = {};
    let highScores = [];
    let playerName = 'Anonymous';
    
    let settings = {
        difficulty: 'normal',
        playerSize: 'medium',
        theme: 'neon'
    };
    
    let shopUpgrades = {
        speedLevel: 0,
        healLevel: 0
    };

    const speedPrices = [150, 200, 250, 300, 400];
    const speedBoostPerLevel = 50;
    
    const healPrices = [50, 50, 50];
    const healAmounts = [5, 10, 20]; // HP healed per tick
    const healIntervals = [2, 1.5, 1]; // Seconds between heals
    
    let healTimer = 0;
    
    console.log('✅ Game state initialized');
    
    // ========================================
    // UTILITY FUNCTIONS
    // ========================================
    
    function showScreen(screenId) {
        const allScreens = [
            'mainMenu', 'settingsScreen', 'howToPlayScreen', 'highScoresScreen',
            'startScreen', 'shopScreen', 'pauseScreen', 'gameOverScreen',
            'chapterCompleteScreen', 'chapterListScreen'
        ];
        
        allScreens.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                if (screenId === 'none') {
                    el.classList.add('hidden');
                } else if (id === screenId) {
                    el.classList.remove('hidden');
                } else {
                    el.classList.add('hidden');
                }
            }
        });
    }
    
    function playSound(type) {
        if (!soundEnabled) return;
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            if (type === 'hit') {
                osc.frequency.value = 200;
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.2);
            } else if (type === 'kill') {
                osc.frequency.value = 400;
                osc.frequency.setValueAtTime(600, audioCtx.currentTime + 0.05);
                gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.15);
            } else if (type === 'buy') {
                osc.frequency.value = 600;
                osc.frequency.setValueAtTime(800, audioCtx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.2);
            } else if (type === 'gameover') {
                osc.frequency.value = 400;
                osc.frequency.setValueAtTime(300, audioCtx.currentTime + 0.3);
                osc.frequency.setValueAtTime(200, audioCtx.currentTime + 0.6);
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.8);
            } else if (type === 'boss') {
                osc.frequency.value = 100;
                osc.frequency.setValueAtTime(150, audioCtx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.6);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.6);
            } else if (type === 'shoot') {
                osc.frequency.value = 800;
                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
                osc.start();
                osc.stop(audioCtx.currentTime + 0.1);
            }
        } catch (e) {}
    }
    
    // ========================================
    // LOAD/SAVE DATA
    // ========================================
    
    function loadSettings() {
        try {
            const saved = localStorage.getItem('survivalGameSettings');
            if (saved) {
                settings = JSON.parse(saved);
                const diff = document.getElementById('difficultySelect');
                const size = document.getElementById('playerSizeSelect');
                const theme = document.getElementById('themeSelect');
                if (diff) diff.value = settings.difficulty;
                if (size) size.value = settings.playerSize;
                if (theme) theme.value = settings.theme;
            }
        } catch (e) {}
    }
    
    function saveSettings() {
        try {
            const diff = document.getElementById('difficultySelect');
            const size = document.getElementById('playerSizeSelect');
            const theme = document.getElementById('themeSelect');
            
            if (diff) settings.difficulty = diff.value;
            if (size) settings.playerSize = size.value;
            if (theme) settings.theme = theme.value;
            
            localStorage.setItem('survivalGameSettings', JSON.stringify(settings));
            
            const sizeMap = { small: 15, medium: 20, large: 25 };
            player.radius = sizeMap[settings.playerSize] || 20;
        } catch (e) {}
    }
    
    function loadHighScores() {
        try {
            const saved = localStorage.getItem('survivalGameHighScores');
            if (saved) highScores = JSON.parse(saved);
            
            const savedName = localStorage.getItem('survivalGamePlayerName');
            if (savedName) {
                playerName = savedName;
                const nameInput = document.getElementById('playerNameInput');
                if (nameInput) nameInput.value = playerName;
            }
        } catch (e) {}
    }
    
    function saveHighScore() {
        try {
            highScores.push({
                name: playerName,
                score: score,
                time: Math.floor(gameTime),
                difficulty: settings.difficulty,
                chapter: currentChapter,
                weapon: WEAPONS[currentWeapon].name,
                date: new Date().toLocaleDateString()
            });
            highScores.sort((a, b) => b.score - a.score);
            highScores = highScores.slice(0, 10);
            localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));
        } catch (e) {}
    }
    
    function displayHighScores() {
        const scoresList = document.getElementById('scoresList');
        if (!scoresList) return;
        
        if (highScores.length === 0) {
            scoresList.innerHTML = '<p class="no-scores">No scores yet. Play the game to set a record!</p>';
            return;
        }
        
        let html = '';
        highScores.forEach((entry, index) => {
            const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '#' + (index + 1);
            
            html += '<div class="score-entry">' +
                '<span class="score-rank">' + medal + '</span>' +
                '<span class="score-name">' + entry.name + '</span>' +
                '<span class="score-value">' + entry.score + '</span>' +
                '<span class="score-time">' + entry.time + 's</span>' +
                '<span class="score-weapon">' + (entry.weapon || 'Bat') + '</span>' +
                '<span class="score-chapter">Ch.' + (entry.chapter || 1) + '</span>' +
                '<span class="score-difficulty">' + entry.difficulty + '</span>' +
                '<button class="delete-btn" data-index="' + index + '">🗑️</button>' +
            '</div>';
        });
        
        scoresList.innerHTML = html;
        
        scoresList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.index);
                if (confirm('Delete this score?')) {
                    highScores.splice(idx, 1);
                    try {
                        localStorage.setItem('survivalGameHighScores', JSON.stringify(highScores));
                    } catch (e) {}
                    displayHighScores();
                }
            });
        });
    }
    
    // ========================================
    // SHOP FUNCTIONS
    // ========================================
    
    function updateShopUI() {
        try {
            const el = id => document.getElementById(id);
            
            if (el('shopCurrency')) el('shopCurrency').textContent = 'Score: ' + Math.floor(score);
            
            // Weapon shop
            const weaponInfo = WEAPONS[currentWeapon];
            const weaponOrder = ['bat', 'knife', 'pistol', 'rifle', 'minigun'];
            const currentIdx = weaponOrder.indexOf(currentWeapon);
            const nextWeapon = weaponOrder[currentIdx + 1];
            
            if (el('weaponLevel')) el('weaponLevel').textContent = 'Level ' + (currentIdx + 1) + '/5';
            if (el('weaponDesc')) el('weaponDesc').textContent = weaponInfo.icon + ' ' + weaponInfo.name + ' - ' + weaponInfo.description;
            if (el('weaponStats')) el('weaponStats').textContent = 'DMG: ' + weaponInfo.damage + ' | Range: ' + weaponInfo.range + ' | Speed: ' + weaponInfo.attackSpeed;
            
            if (el('weaponNextStat')) {
                if (!nextWeapon) {
                    el('weaponNextStat').textContent = 'MAX LEVEL - Minigun is the ultimate weapon!';
                } else {
                    const nextInfo = WEAPONS[nextWeapon];
                    el('weaponNextStat').textContent = 'Next: ' + nextInfo.icon + ' ' + nextInfo.name + ' - DMG: ' + nextInfo.damage;
                }
            }
            
            if (el('weaponUpgradeBtn')) {
                const btn = el('weaponUpgradeBtn');
                if (!nextWeapon) {
                    btn.textContent = 'MAX LEVEL';
                    btn.disabled = true;
                } else {
                    const nextInfo = WEAPONS[nextWeapon];
                    btn.textContent = 'Upgrade to ' + nextInfo.name + ' - ' + nextInfo.price + ' pts';
                    btn.disabled = score < nextInfo.price;
                }
            }
            
            // Speed shop
            if (el('speedLevel')) el('speedLevel').textContent = 'Level ' + shopUpgrades.speedLevel + '/5';
            
            if (el('speedStat')) {
                el('speedStat').textContent = shopUpgrades.speedLevel === 0 
                    ? 'Current: Base speed (300)' 
                    : 'Current: ' + (300 + shopUpgrades.speedLevel * speedBoostPerLevel) + ' speed';
            }
            
            if (el('speedNextStat')) {
                el('speedNextStat').textContent = shopUpgrades.speedLevel >= 5 
                    ? 'MAX LEVEL' 
                    : 'Next: ' + (300 + (shopUpgrades.speedLevel + 1) * speedBoostPerLevel) + ' speed (+' + speedBoostPerLevel + ')';
            }
            
            if (el('speedBuyBtn')) {
                const btn = el('speedBuyBtn');
                if (shopUpgrades.speedLevel >= 5) {
                    btn.textContent = 'MAX LEVEL';
                    btn.disabled = true;
                } else {
                    const price = speedPrices[shopUpgrades.speedLevel];
                    btn.textContent = 'Buy - ' + price + ' pts';
                    btn.disabled = score < price;
                }
            }
            
            // Heal shop
            if (el('healLevel')) el('healLevel').textContent = 'Level ' + shopUpgrades.healLevel + '/3';
            
            if (el('healStat')) {
                if (shopUpgrades.healLevel === 0) {
                    el('healStat').textContent = 'Current: No auto-heal';
                } else {
                    el('healStat').textContent = 'Current: +' + healAmounts[shopUpgrades.healLevel - 1] + ' HP/' + healIntervals[shopUpgrades.healLevel - 1] + 's';
                }
            }
            
            if (el('healNextStat')) {
                if (shopUpgrades.healLevel >= 3) {
                    el('healNextStat').textContent = 'MAX LEVEL';
                } else {
                    const nextAmount = healAmounts[shopUpgrades.healLevel];
                    const nextInterval = healIntervals[shopUpgrades.healLevel];
                    el('healNextStat').textContent = 'Next: +' + nextAmount + ' HP/' + nextInterval + 's';
                }
            }
            
            if (el('healBuyBtn')) {
                const btn = el('healBuyBtn');
                if (shopUpgrades.healLevel >= 3) {
                    btn.textContent = 'MAX LEVEL';
                    btn.disabled = true;
                } else {
                    const price = healPrices[shopUpgrades.healLevel];
                    btn.textContent = 'Buy - ' + price + ' pts';
                    btn.disabled = score < price;
                }
            }
        } catch (e) {
            console.error('Shop UI error:', e);
        }
    }
    
    function upgradeWeapon() {
        const weaponOrder = ['bat', 'knife', 'pistol', 'rifle', 'minigun'];
        const currentIdx = weaponOrder.indexOf(currentWeapon);

        if (currentIdx >= weaponOrder.length - 1) return;

        const nextWeapon = weaponOrder[currentIdx + 1];
        const nextInfo = WEAPONS[nextWeapon];

        if (score < nextInfo.price) {
            alert('Not enough score! Need ' + nextInfo.price + ', have ' + Math.floor(score));
            return;
        }

        score -= nextInfo.price;
        currentWeapon = nextWeapon;
        weaponLevel = currentIdx + 2;

        console.log('🔫 Upgraded to ' + nextInfo.name + '! Score: ' + Math.floor(score));
        updateShopUI();
        updateUI();
        playSound('buy');
        alert('🎉 Upgraded to ' + nextInfo.name + '!');
    }
    
    function buySpeed() {
        if (shopUpgrades.speedLevel >= 5) return;
        const price = speedPrices[shopUpgrades.speedLevel];
        if (score < price) {
            alert('Not enough score! Need ' + price + ', have ' + Math.floor(score));
            return;
        }
        score -= price;
        shopUpgrades.speedLevel++;
        player.speed = 300 + shopUpgrades.speedLevel * speedBoostPerLevel;
        console.log('💨 Speed upgraded! Level: ' + shopUpgrades.speedLevel + ', Score: ' + Math.floor(score));
        updateShopUI();
        updateUI();
        playSound('buy');
    }
    
    function buyHeal() {
        if (shopUpgrades.healLevel >= 3) return;
        const price = healPrices[shopUpgrades.healLevel];
        if (score < price) {
            alert('Not enough score! Need ' + price + ', have ' + Math.floor(score));
            return;
        }
        score -= price;
        shopUpgrades.healLevel++;
        console.log('❤️ Heal upgraded! Level: ' + shopUpgrades.healLevel + ', Score: ' + Math.floor(score));
        updateShopUI();
        updateUI();
        playSound('buy');
        alert('❤️ Heal upgraded to Level ' + shopUpgrades.healLevel + '!');
    }
    
    // ========================================
    // CHAPTER FUNCTIONS
    // ========================================
    
    function updateChapterSelect() {
        const chapterSelect = document.getElementById('chapterSelect');
        if (!chapterSelect) return;
        
        chapterSelect.innerHTML = '';
        for (let i = 1; i <= 5; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = 'Chapter ' + i;
            option.disabled = i > 1 && !isChapterUnlocked(i - 1);
            chapterSelect.appendChild(option);
        }
        chapterSelect.value = currentChapter;
    }
    
    function isChapterUnlocked(chapterNum) {
        if (chapterNum === 1) return true;
        try {
            const saved = localStorage.getItem('survivalGameUnlockedChapters');
            if (saved) {
                const unlocked = JSON.parse(saved);
                return unlocked.includes(chapterNum);
            }
        } catch (e) {}
        return false;
    }
    
    function unlockChapter(chapterNum) {
        try {
            let unlocked = [];
            const saved = localStorage.getItem('survivalGameUnlockedChapters');
            if (saved) unlocked = JSON.parse(saved);
            
            if (!unlocked.includes(chapterNum)) {
                unlocked.push(chapterNum);
                localStorage.setItem('survivalGameUnlockedChapters', JSON.stringify(unlocked));
            }
        } catch (e) {}
    }
    
    function showMainMenuChapters() {
        showScreen('chapterListScreen');
        renderChapterList();
    }
    
    function renderChapterList() {
        const titleEl = document.getElementById('chapterListTitle');
        const contentEl = document.getElementById('chapterListContent');
        
        if (!titleEl || !contentEl) return;
        
        titleEl.textContent = '📚 Chapter List';
        
        let completedCount = 0;
        try {
            const saved = localStorage.getItem('survivalGameUnlockedChapters');
            if (saved) completedCount = JSON.parse(saved).length;
        } catch (e) {}
        
        const totalCount = 5;
        const progressPercent = Math.round((completedCount / totalCount) * 100);
        
        let html = '<div class="completion-board">' +
            '<div class="completion-title">' + completedCount + '/' + totalCount + ' Chapters Completed</div>' +
            '<div class="completion-bar-container">' +
                '<div class="completion-bar" style="width: ' + progressPercent + '%">' + progressPercent + '%</div>' +
            '</div>' +
            '<div class="completion-stars">';
        
        for (let i = 0; i < 5; i++) {
            html += '<span class="star ' + (i < completedCount ? '' : 'empty') + '">' + 
                    (i < completedCount ? '⭐' : '☆') + '</span>';
        }
        
        html += '</div></div>';
        
        for (let i = 1; i <= 5; i++) {
            const unlocked = i === 1 || isChapterUnlocked(i);
            const completed = isChapterUnlocked(i + 1) || (i === 5 && isChapterUnlocked(5));
            const isCurrent = i === currentChapter && !completed;
            
            let status = '🔒';
            let itemClass = 'locked';
            let timeText = '';
            
            if (completed) {
                status = '✅';
                itemClass = 'completed';
                timeText = 'Survive ' + chapterTimes[i] + 's ✓';
            } else if (unlocked) {
                status = '▶️';
                itemClass = 'current';
                timeText = 'Survive ' + chapterTimes[i] + 's';
            } else {
                timeText = 'Complete Ch.' + (i - 1) + ' to unlock';
            }
            
            html += '<div class="chapter-item ' + itemClass + '">' +
                '<span class="chapter-status">' + status + '</span>' +
                '<span class="chapter-name">Chapter ' + i + '</span>' +
                '<span class="chapter-time">' + timeText + '</span>' +
            '</div>';
        }
        
        contentEl.innerHTML = html;
    }
    
    function showChapterCompleteScreen() {
        showScreen('chapterCompleteScreen');
        
        const titleEl = document.getElementById('chapterCompleteTitle');
        const textEl = document.getElementById('chapterCompleteText');
        const nextTextEl = document.getElementById('chapterNextText');
        const continueBtn = document.getElementById('chapterContinueBtn');
        
        if (titleEl) titleEl.textContent = '🎉 Chapter ' + currentChapter + ' Complete!';
        if (textEl) textEl.textContent = 'Congratulations! You survived!';
        
        if (currentChapter < 5) {
            unlockChapter(currentChapter + 1);
            if (nextTextEl) nextTextEl.textContent = 'Continue to Chapter ' + (currentChapter + 1) + '?';
            if (continueBtn) continueBtn.style.display = 'block';
        } else {
            if (nextTextEl) nextTextEl.textContent = '🏆 You completed all chapters!';
            if (continueBtn) continueBtn.style.display = 'none';
        }
    }
    
    function continueToNextChapter() {
        if (currentChapter < 5) {
            currentChapter++;
            startGame();
        }
    }
    
    function showChapterList() {
        showScreen('chapterListScreen');
        renderChapterList();
    }
    
    // ========================================
    // BOSS FUNCTIONS
    // ========================================
    
    function spawnBoss() {
        if (bossSpawned) return;

        const bossData = bosses[currentChapter];
        if (!bossData) return;
        
        currentBoss = {
            x: canvas.width / 2,
            y: -100,
            name: bossData.name,
            color: bossData.color,
            radius: bossData.radius,
            health: bossData.health,
            maxHealth: bossData.health,
            speed: bossData.speed,
            attackTimer: 0,
            entering: true
        };
        
        bossSpawned = true;
        bossWarningShown = false;
        bossDefeated = false;
        bossWarningTime = 3;
        
        playSound('boss');
    }
    
    function updateBoss(dt) {
        if (!currentBoss) return;
        
        const boss = currentBoss;
        
        if (!bossWarningShown) {
            bossWarningTime -= dt;
            if (bossWarningTime <= 0) {
                bossWarningShown = true;
            }
            return;
        }
        
        if (boss.entering) {
            boss.y += 100 * dt;
            if (boss.y >= 150) {
                boss.entering = false;
            }
            return;
        }
        
        const dx = player.x - boss.x;
        const dy = player.y - boss.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            boss.x += (dx / dist) * boss.speed * dt;
            boss.y += (dy / dist) * boss.speed * dt;
        }
        
        boss.x = Math.max(boss.radius, Math.min(canvas.width - boss.radius, boss.x));
        boss.y = Math.max(boss.radius, Math.min(canvas.height - boss.radius, boss.y));
        
        boss.attackTimer -= dt;
        if (boss.attackTimer <= 0) {
            for (let i = 0; i < 3; i++) {
                const angle = (Math.PI * 2 / 3) * i;
                enemies.push({
                    x: boss.x + Math.cos(angle) * 60,
                    y: boss.y + Math.sin(angle) * 60,
                    radius: 10,
                    speed: 150,
                    color: boss.color
                });
            }
            boss.attackTimer = Math.max(1, 2 - (currentChapter * 0.2));
        }
    }
    
    function damageBoss(damage) {
        if (!currentBoss) return;
        
        currentBoss.health -= damage;
        
        if (currentBoss.health <= 0) {
            bossDefeated = true;
            score += 100 * currentChapter;
            currentBoss = null;
            bossSpawned = false;
        }
    }
    
    function renderBoss() {
        if (!currentBoss || !bossWarningShown) return;

        const boss = currentBoss;

        ctx.fillStyle = boss.color;
        ctx.beginPath();
        ctx.arc(boss.x, boss.y, boss.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(boss.x - boss.radius * 0.3, boss.y - boss.radius * 0.2, boss.radius * 0.2, 0, Math.PI * 2);
        ctx.arc(boss.x + boss.radius * 0.3, boss.y - boss.radius * 0.2, boss.radius * 0.2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(boss.x - boss.radius * 0.3, boss.y - boss.radius * 0.2, boss.radius * 0.1, 0, Math.PI * 2);
        ctx.arc(boss.x + boss.radius * 0.3, boss.y - boss.radius * 0.2, boss.radius * 0.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(boss.x, boss.y + boss.radius * 0.2, boss.radius * 0.4, 0, Math.PI);
        ctx.stroke();

        // Boss health bar with numbers
        const barWidth = 150;
        const barHeight = 15;
        const healthPercent = boss.health / boss.maxHealth;

        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(boss.x - barWidth / 2 - 2, boss.y - boss.radius - 32, barWidth + 4, barHeight + 4);
        
        // Health bar
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(boss.x - barWidth / 2, boss.y - boss.radius - 30, barWidth, barHeight);

        ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
        ctx.fillRect(boss.x - barWidth / 2, boss.y - boss.radius - 30, barWidth * healthPercent, barHeight);
        
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(boss.x - barWidth / 2, boss.y - boss.radius - 30, barWidth, barHeight);

        // HP text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('❤️ ' + Math.ceil(boss.health) + '/' + boss.maxHealth, boss.x, boss.y - boss.radius - 19);

        // Boss name
        ctx.font = 'bold 18px Arial';
        ctx.fillStyle = boss.color;
        ctx.fillText(boss.name, boss.x, boss.y - boss.radius - 40);
    }
    
    function renderBossWarning() {
        if (!currentBoss || bossWarningShown) return;
        
        ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#ff0000';
        ctx.font = 'bold 48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ BOSS INCOMING! ⚠️', canvas.width / 2, canvas.height / 2);
        
        ctx.font = '24px Arial';
        ctx.fillStyle = '#fff';
        ctx.fillText('Prepare yourself!', canvas.width / 2, canvas.height / 2 + 40);
    }
    
    // ========================================
    // GAME FUNCTIONS
    // ========================================
    
    function resetGame() {
        player.x = canvas.width / 2;
        player.y = canvas.height / 2;
        player.health = 100;
        player.maxHealth = 100;
        player.invulnerable = false;
        player.invulnerableTime = 0;
        player.facing = { x: 0, y: 1 };

        // Reset shop upgrades
        shopUpgrades = {
            speedLevel: 0,
            healLevel: 0
        };
        
        // Reset player stats based on upgrades (which are now 0)
        player.speed = 300;

        score = 0;
        gameTime = 0;
        chapterTimeStart = 0;
        spawnTimer = 0;
        healTimer = 0;
        enemies = [];
        bullets = [];
        attackCooldown = 0;

        // Clear all keys to prevent stuck movement
        for (let key in keys) {
            keys[key] = false;
        }

        currentBoss = null;
        bossSpawned = false;
        bossWarningShown = false;
        bossDefeated = false;
    }
    
    function startGame() {
        resetGame();
        gameRunning = true;
        gamePaused = false;
        lastTime = performance.now();
        showScreen('none');
        updateUI();
        updateChapterSelect();
        requestAnimationFrame(gameLoop);
    }
    
    function restartGame() {
        startGame();
    }
    
    function togglePause() {
        if (!gameRunning) return;
        gamePaused = !gamePaused;
        if (!gamePaused) {
            lastTime = performance.now();
            showScreen('none');
            requestAnimationFrame(gameLoop);
        } else {
            showScreen('pauseScreen');
        }
    }
    
    function gameOver() {
        gameRunning = false;
        saveHighScore();
        playSound('gameover');
        showScreen('gameOverScreen');
        document.getElementById('finalScore').textContent = 'Score: ' + Math.floor(score);
        document.getElementById('finalTime').textContent = 'Time: ' + Math.floor(gameTime) + 's | Chapter: ' + currentChapter;
        window.AkaScoreReporter?.report('Survival-v1', Math.floor(score), {
            chapter: currentChapter,
            survivalTime: Math.floor(gameTime)
        });
    }
    
    function completeChapter() {
        if (chapterCompleted) return;
        chapterCompleted = true;
        
        gameRunning = false;
        unlockChapter(currentChapter);
        showChapterCompleteScreen();
    }
    
    function updateUI() {
        try {
            const el = id => document.getElementById(id);
            
            const healthPct = (player.health / player.maxHealth * 100);
            if (el('healthFill')) {
                el('healthFill').style.width = healthPct + '%';
                el('healthFill').style.background = healthPct > 60 ? '#44ff44' : healthPct > 30 ? '#ffaa00' : '#ff4444';
            }
            if (el('healthText')) el('healthText').textContent = 'Health: ' + Math.ceil(player.health);
            if (el('score')) el('score').textContent = 'Score: ' + Math.floor(score);
            if (el('time')) el('time').textContent = 'Time: ' + Math.floor(gameTime) + 's';
            if (el('chapter')) el('chapter').textContent = 'Chapter: ' + currentChapter;
            
            const weaponInfo = WEAPONS[currentWeapon];
            if (el('weaponDisplay')) {
                el('weaponDisplay').textContent = weaponInfo.icon + ' Lv.' + weaponLevel;
            }
            if (el('speedDisplay')) {
                const bonus = shopUpgrades.speedLevel * speedBoostPerLevel;
                el('speedDisplay').textContent = '💨 +' + bonus;
            }
            if (el('healDisplay')) {
                if (shopUpgrades.healLevel === 0) {
                    el('healDisplay').textContent = '❤️ None';
                } else {
                    const amount = healAmounts[shopUpgrades.healLevel - 1];
                    const interval = healIntervals[shopUpgrades.healLevel - 1];
                    el('healDisplay').textContent = '❤️ +' + amount + '/' + interval + 's';
                }
            }
        } catch (e) {
            console.error('UI update error:', e);
        }
    }
    
    // ========================================
    // GAME LOOP
    // ========================================
    
    function gameLoop(timestamp) {
        if (!gameRunning) return;
        
        if (gamePaused) {
            requestAnimationFrame(gameLoop);
            return;
        }
        
        try {
            const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.1);
            lastTime = timestamp;
            
            gameTime += deltaTime;
            chapterTimeStart += deltaTime;

            // Score increases over time (5 points per 2 seconds = 2.5 points per second)
            score += deltaTime * 2.5;
            score = Math.max(0, score); // Ensure score never goes negative
            
            // Auto-heal logic
            if (shopUpgrades.healLevel > 0 && player.health < player.maxHealth) {
                healTimer += deltaTime;
                const healInterval = healIntervals[shopUpgrades.healLevel - 1];
                const healAmount = healAmounts[shopUpgrades.healLevel - 1];
                
                if (healTimer >= healInterval) {
                    healTimer = 0;
                    player.health = Math.min(player.maxHealth, player.health + healAmount);
                    console.log('❤️ Healed +' + healAmount + ' HP. Current:', Math.ceil(player.health));
                }
            }
            
            const chapterTime = chapterTimes[currentChapter] || 60;
            if (chapterTimeStart >= chapterTime && !bossSpawned) {
                spawnBoss();
            }
            
            updatePlayer(deltaTime);
            updateBullets(deltaTime);
            updateBoss(deltaTime);
            spawnEnemies(deltaTime);
            updateEnemies(deltaTime);
            checkCollisions();
            attack();
            render();
            updateUI();
            
            requestAnimationFrame(gameLoop);
        } catch (e) {
            console.error('Game loop error:', e);
            gameRunning = false;
            alert('Game error: ' + e.message);
        }
    }
    
    function updatePlayer(dt) {
        const speed = player.speed * dt;
        let moved = false;
        
        if (keys['KeyW'] || keys['ArrowUp']) { player.y -= speed; player.facing = { x: 0, y: -1 }; moved = true; }
        if (keys['KeyS'] || keys['ArrowDown']) { player.y += speed; player.facing = { x: 0, y: 1 }; moved = true; }
        if (keys['KeyA'] || keys['ArrowLeft']) { player.x -= speed; player.facing = { x: -1, y: 0 }; moved = true; }
        if (keys['KeyD'] || keys['ArrowRight']) { player.x += speed; player.facing = { x: 1, y: 0 }; moved = true; }
        
        player.x = Math.max(player.radius, Math.min(canvas.width - player.radius, player.x));
        player.y = Math.max(player.radius, Math.min(canvas.height - player.radius, player.y));
        
        if (player.invulnerable) {
            player.invulnerableTime -= dt;
            if (player.invulnerableTime <= 0) {
                player.invulnerable = false;
            }
        }
        
        attackCooldown -= dt;
    }
    
    function attack() {
        if (attackCooldown > 0) return;
        
        const weapon = WEAPONS[currentWeapon];
        
        // Ranged weapons shoot bullets
        if (currentWeapon === 'pistol' || currentWeapon === 'rifle' || currentWeapon === 'minigun') {
            bullets.push({
                x: player.x + player.facing.x * (player.radius + 10),
                y: player.y + player.facing.y * (player.radius + 10),
                vx: player.facing.x * 400,
                vy: player.facing.y * 400,
                damage: weapon.damage,
                radius: 4,
                color: weapon.color,
                life: weapon.range / 400
            });
            
            playSound('shoot');
            attackCooldown = 1 / weapon.attackSpeed;
        }
    }
    
    function updateBullets(dt) {
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            bullet.x += bullet.vx * dt;
            bullet.y += bullet.vy * dt;
            bullet.life -= dt;
            
            if (bullet.life <= 0 || bullet.x < 0 || bullet.x > canvas.width || 
                bullet.y < 0 || bullet.y > canvas.height) {
                bullets.splice(i, 1);
            }
        }
    }
    
    function spawnEnemies(dt) {
        spawnTimer += dt;

        const spawnRate = settings.difficulty === 'easy' ? 0.5 :
                          settings.difficulty === 'hard' ? 1.0 : 0.7;
        const spawnInterval = 1 / spawnRate;

        if (spawnTimer >= spawnInterval) {
            spawnTimer = 0;

            const side = Math.floor(Math.random() * 4);
            let x, y;

            switch(side) {
                case 0: x = Math.random() * canvas.width; y = -30; break;
                case 1: x = canvas.width + 30; y = Math.random() * canvas.height; break;
                case 2: x = Math.random() * canvas.width; y = canvas.height + 30; break;
                case 3: x = -30; y = Math.random() * canvas.height; break;
            }

            const speedMult = settings.difficulty === 'easy' ? 0.8 :
                              settings.difficulty === 'hard' ? 1.3 : 1;

            const enemyHealth = 15 + (currentChapter * 5);

            enemies.push({
                x: x,
                y: y,
                radius: 15,
                speed: (80 + gameTime * 0.8) * speedMult,
                color: '#ff4444',
                health: enemyHealth,
                maxHealth: enemyHealth
            });
        }
    }
    
    function updateEnemies(dt) {
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0) {
                enemy.x += (dx / dist) * enemy.speed * dt;
                enemy.y += (dy / dist) * enemy.speed * dt;
            }
            
            if (enemy.x < -100 || enemy.x > canvas.width + 100 || 
                enemy.y < -100 || enemy.y > canvas.height + 100) {
                enemies.splice(i, 1);
            }
        }
    }
    
    function checkCollisions() {
        // Player vs enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            const dx = player.x - enemy.x;
            const dy = player.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < player.radius + enemy.radius) {
                if (currentWeapon === 'bat' || currentWeapon === 'knife') {
                    // Melee weapon - attack enemy on contact
                    if (attackCooldown <= 0) {
                        const weapon = WEAPONS[currentWeapon];
                        enemy.health -= weapon.damage;
                        attackCooldown = 1 / weapon.attackSpeed;
                        playSound('hit');

                        // Did we kill the enemy?
                        if (enemy.health <= 0) {
                            const scoreGain = 10 + currentChapter * 5;
                            score += scoreGain;
                            console.log('💀 Enemy killed! Score: +', scoreGain, 'Total:', score);
                            enemies.splice(i, 1);
                            playSound('kill');
                            continue; // Enemy dead, move to next enemy
                        } else {
                            // Enemy still alive - player takes reduced damage
                            if (!player.invulnerable) {
                                const dmgMult = settings.difficulty === 'easy' ? 0.7 :
                                                settings.difficulty === 'hard' ? 1.5 : 1;
                                player.health -= 5 * dmgMult; // Reduced damage for melee block
                                player.invulnerable = true;
                                player.invulnerableTime = 0.5;
                                console.log('🛡️ Melee block! Player takes reduced damage');
                            }
                        }
                    } else {
                        // Attack on cooldown - player takes damage
                        if (!player.invulnerable) {
                            const dmgMult = settings.difficulty === 'easy' ? 0.7 :
                                            settings.difficulty === 'hard' ? 1.5 : 1;
                            player.health -= 10 * dmgMult;
                            player.invulnerable = true;
                            player.invulnerableTime = 1;
                            enemies.splice(i, 1); // Remove enemy

                            if (player.health <= 0) {
                                gameOver();
                                return;
                            }
                        }
                    }
                } else {
                    // Ranged weapons (pistol, rifle, minigun) - no melee attack
                    // Player takes damage and enemy is removed
                    if (!player.invulnerable) {
                        const dmgMult = settings.difficulty === 'easy' ? 0.7 :
                                        settings.difficulty === 'hard' ? 1.5 : 1;
                        player.health -= 10 * dmgMult;
                        player.invulnerable = true;
                        player.invulnerableTime = 1;
                        enemies.splice(i, 1); // Remove enemy

                        if (player.health <= 0) {
                            gameOver();
                            return;
                        }
                    }
                }
            }
        }
        
        // Bullets vs enemies
        for (let i = bullets.length - 1; i >= 0; i--) {
            const bullet = bullets[i];
            
            for (let j = enemies.length - 1; j >= 0; j--) {
                const enemy = enemies[j];
                const dx = bullet.x - enemy.x;
                const dy = bullet.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < bullet.radius + enemy.radius) {
                    enemy.health -= bullet.damage;
                    bullets.splice(i, 1);
                    
                    if (enemy.health <= 0) {
                        score += 10 + currentChapter * 5;
                        enemies.splice(j, 1);
                        playSound('kill');
                    }
                    break;
                }
            }
        }
        
        // Player vs boss
        if (currentBoss && bossWarningShown && !currentBoss.entering) {
            const dx = player.x - currentBoss.x;
            const dy = player.y - currentBoss.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < player.radius + currentBoss.radius) {
                // Melee vs boss - with cooldown check
                if (currentWeapon === 'bat' || currentWeapon === 'knife') {
                    if (attackCooldown <= 0) {
                        const weapon = WEAPONS[currentWeapon];
                        damageBoss(weapon.damage);
                        attackCooldown = 1 / weapon.attackSpeed; // 2 seconds for melee
                        playSound('hit');
                    } else {
                        // On cooldown - player takes damage
                        if (!player.invulnerable) {
                            player.health -= 20;
                            player.invulnerable = true;
                            player.invulnerableTime = 1;
                            playSound('hit');

                            if (player.health <= 0) {
                                gameOver();
                                return;
                            }
                        }
                    }
                } else if (!player.invulnerable) {
                    // Ranged weapons - player takes damage from boss contact
                    player.health -= 20;
                    player.invulnerable = true;
                    player.invulnerableTime = 1;
                    playSound('hit');

                    if (player.health <= 0) {
                        gameOver();
                        return;
                    }
                }
            }
        }
        
        // Bullets vs boss
        if (currentBoss && bossWarningShown && !currentBoss.entering) {
            for (let i = bullets.length - 1; i >= 0; i--) {
                const bullet = bullets[i];
                const dx = bullet.x - currentBoss.x;
                const dy = bullet.y - currentBoss.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < bullet.radius + currentBoss.radius) {
                    damageBoss(bullet.damage);
                    bullets.splice(i, 1);
                    
                    if (currentBoss && currentBoss.health <= 0) {
                        if (currentChapter < 5) {
                            setTimeout(() => completeChapter(), 1000);
                        } else {
                            setTimeout(() => {
                                gameRunning = false;
                                alert('🏆 You defeated the Final Boss!');
                                showScreen('gameOverScreen');
                                document.getElementById('finalScore').textContent = 'Score: ' + Math.floor(score);
                                document.getElementById('finalTime').textContent = 'Time: ' + Math.floor(gameTime) + 's | All Chapters Complete!';
                            }, 1000);
                        }
                    }
                    break;
                }
            }
        }
    }
    
    function render() {
        try {
            ctx.fillStyle = '#0f0f23';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
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
            
            // Player
            ctx.save();
            ctx.translate(player.x, player.y);
            ctx.fillStyle = player.invulnerable ? 'rgba(0, 255, 255, 0.5)' : player.color;
            ctx.beginPath();
            ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
            ctx.fill();
            
            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(-player.radius * 0.3, -player.radius * 0.2, player.radius * 0.15, 0, Math.PI * 2);
            ctx.arc(player.radius * 0.3, -player.radius * 0.2, player.radius * 0.15, 0, Math.PI * 2);
            ctx.fill();
            
            // Smile
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(0, 0, player.radius * 0.5, 0.2, Math.PI - 0.2);
            ctx.stroke();

            // Weapon rendering
            const weapon = WEAPONS[currentWeapon];
            const weaponX = player.facing.x * (player.radius + 10);
            const weaponY = player.facing.y * (player.radius + 10);
            
            ctx.save();
            ctx.translate(weaponX, weaponY);
            
            // Calculate weapon angle based on facing direction
            const angle = Math.atan2(player.facing.y, player.facing.x);
            ctx.rotate(angle);
            
            // Draw weapon based on type
            if (currentWeapon === 'bat') {
                // Baseball Bat - brown wooden bat
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(-15, -3, 30, 6);
                ctx.fillStyle = '#A0522D';
                ctx.fillRect(-12, -2, 25, 4);
                // Handle
                ctx.fillStyle = '#654321';
                ctx.fillRect(-15, -2, 8, 4);
                // Barrel
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.ellipse(12, 0, 8, 4, 0, 0, Math.PI * 2);
                ctx.fill();
            } else if (currentWeapon === 'knife') {
                // Knife - silver blade with handle
                ctx.fillStyle = '#C0C0C0';
                ctx.beginPath();
                ctx.moveTo(-12, -2);
                ctx.lineTo(15, 0);
                ctx.lineTo(-12, 2);
                ctx.closePath();
                ctx.fill();
                ctx.strokeStyle = '#808080';
                ctx.lineWidth = 1;
                ctx.stroke();
                // Handle
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(-18, -3, 8, 6);
                // Blade shine
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.moveTo(-8, -1);
                ctx.lineTo(10, 0);
                ctx.lineTo(-8, 0);
                ctx.closePath();
                ctx.fill();
            } else if (currentWeapon === 'pistol') {
                // Pistol - black handgun
                ctx.fillStyle = '#333333';
                ctx.fillRect(-8, -4, 20, 8);
                // Barrel
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(12, -2, 10, 4);
                // Handle
                ctx.fillStyle = '#2a2a2a';
                ctx.fillRect(-10, 4, 8, 8);
                // Trigger guard
                ctx.strokeStyle = '#1a1a1a';
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.arc(-2, 4, 4, 0, Math.PI);
                ctx.stroke();
                // Sight
                ctx.fillStyle = '#000';
                ctx.fillRect(20, -3, 2, 2);
            } else if (currentWeapon === 'rifle') {
                // Rifle - long gun with scope
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(-20, -3, 45, 6);
                // Stock
                ctx.fillStyle = '#8B4513';
                ctx.fillRect(-25, -2, 10, 4);
                // Barrel
                ctx.fillStyle = '#333333';
                ctx.fillRect(25, -2, 15, 4);
                // Scope
                ctx.fillStyle = '#000';
                ctx.fillRect(0, -8, 15, 4);
                ctx.fillStyle = '#00ff00';
                ctx.fillRect(2, -7, 2, 2);
                // Magazine
                ctx.fillStyle = '#1a1a1a';
                ctx.fillRect(5, 3, 8, 5);
            } else if (currentWeapon === 'minigun') {
                // Minigun - multiple barrels
                ctx.fillStyle = '#FF4500';
                ctx.fillRect(-15, -5, 35, 10);
                // Barrels (multiple)
                for (let i = 0; i < 3; i++) {
                    ctx.fillStyle = '#cc3700';
                    ctx.fillRect(20, -4 + i * 3, 15, 2);
                }
                // Motor housing
                ctx.fillStyle = '#cc3700';
                ctx.fillRect(-20, -3, 10, 6);
                // Ammo belt
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(-25, 5, 15, 3);
                // Muzzle flash
                ctx.fillStyle = 'rgba(255, 200, 0, 0.6)';
                ctx.beginPath();
                ctx.arc(38, 0, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
            
            ctx.restore();
            
            renderBossWarning();
            renderBoss();
            
            // Bullets
            bullets.forEach(bullet => {
                ctx.save();
                const bulletAngle = Math.atan2(bullet.vy, bullet.vx);
                ctx.translate(bullet.x, bullet.y);
                ctx.rotate(bulletAngle);
                
                // Bullet trail
                ctx.fillStyle = 'rgba(255, 200, 50, 0.4)';
                ctx.fillRect(-12, -1, 10, 2);
                
                // Bullet core
                ctx.fillStyle = bullet.color;
                ctx.beginPath();
                ctx.arc(0, 0, bullet.radius, 0, Math.PI * 2);
                ctx.fill();
                
                // Bullet glow
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.beginPath();
                ctx.arc(0, 0, bullet.radius * 0.5, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            });
            
            // Enemies
            enemies.forEach(enemy => {
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.radius, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(enemy.x - 5, enemy.y - 3, 4, 0, Math.PI * 2);
                ctx.arc(enemy.x + 5, enemy.y - 3, 4, 0, Math.PI * 2);
                ctx.fill();
                
                // Enemy health bar
                const barWidth = 30;
                const barHeight = 4;
                const healthPercent = enemy.health / enemy.maxHealth;
                
                ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
                ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 10, barWidth, barHeight);
                
                ctx.fillStyle = healthPercent > 0.5 ? '#44ff44' : healthPercent > 0.25 ? '#ffaa00' : '#ff4444';
                ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 10, barWidth * healthPercent, barHeight);
                
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 1;
                ctx.strokeRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 10, barWidth, barHeight);
            });
        } catch (e) {
            console.error('Render error:', e);
        }
    }
    
    // ========================================
    // INPUT
    // ========================================
    
    window.addEventListener('keydown', e => {
        keys[e.code] = true;
        if (e.code === 'Space' && gameRunning) {
            e.preventDefault();
            togglePause();
        }
        // Prevent arrow keys from scrolling
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
            e.preventDefault();
        }
    });
    
    window.addEventListener('keyup', e => {
        keys[e.code] = false;
    });
    
    // ========================================
    // SETUP ALL EVENT LISTENERS
    // ========================================
    
    function setupButton(id, handler) {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', handler);
        }
    }
    
    setupButton('playBtn', () => showScreen('startScreen'));
    setupButton('chaptersBtn', showMainMenuChapters);
    setupButton('settingsBtn', () => showScreen('settingsScreen'));
    setupButton('howToPlayBtn', () => showScreen('howToPlayScreen'));
    setupButton('highScoresBtn', () => { displayHighScores(); showScreen('highScoresScreen'); });
    setupButton('settingsBackBtn', () => { saveSettings(); showScreen('mainMenu'); });
    setupButton('closeSettingsBtn', () => { saveSettings(); showScreen('mainMenu'); });
    setupButton('setNameBtn', () => {
        const nameInput = document.getElementById('playerNameInput');
        if (nameInput) {
            playerName = nameInput.value.trim().substring(0, 15) || 'Anonymous';
            try { localStorage.setItem('survivalGamePlayerName', playerName); } catch (e) {}
            alert('Name saved: ' + playerName);
        }
    });
    setupButton('soundToggle', () => {
        soundEnabled = !soundEnabled;
        document.getElementById('soundToggle').textContent = soundEnabled ? '🔊' : '🔇';
    });
    setupButton('howToPlayBackBtn', () => showScreen('mainMenu'));
    setupButton('highScoresBackBtn', () => showScreen('mainMenu'));
    
    const chapterSelect = document.getElementById('chapterSelect');
    if (chapterSelect) {
        chapterSelect.addEventListener('change', () => {
            currentChapter = parseInt(chapterSelect.value);
        });
    }
    
    setupButton('startBtn', startGame);
    setupButton('shopBtn', () => { updateShopUI(); showScreen('shopScreen'); });
    setupButton('menuBtn', () => showScreen('mainMenu'));
    setupButton('shopBackBtn', () => {
        if (gameRunning && gamePaused) {
            gamePaused = false;
            showScreen('none');
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        } else {
            showScreen('startScreen');
        }
    });
    setupButton('weaponUpgradeBtn', upgradeWeapon);
    setupButton('speedBuyBtn', buySpeed);
    setupButton('healBuyBtn', buyHeal);
    setupButton('shopBtnGame', () => {
        if (gameRunning && !gamePaused) {
            gamePaused = true;
            updateShopUI();
            showScreen('shopScreen');
        }
    });
    setupButton('musicToggle', () => {
        soundEnabled = !soundEnabled;
        document.getElementById('musicToggle').textContent = soundEnabled ? '🔊' : '🔇';
    });
    setupButton('resumeBtn', togglePause);
    setupButton('pauseShopBtn', () => { updateShopUI(); showScreen('shopScreen'); });
    setupButton('pauseMenuBtn', () => { gameRunning = false; gamePaused = false; showScreen('mainMenu'); });
    setupButton('restartBtn', restartGame);
    setupButton('gameOverMenuBtn', () => { gameRunning = false; gamePaused = false; showScreen('mainMenu'); });
    setupButton('chapterContinueBtn', continueToNextChapter);
    setupButton('chapterViewBtn', showChapterList);
    setupButton('chapterMenuBtn', () => { gameRunning = false; gamePaused = false; showScreen('mainMenu'); });
    setupButton('chapterListBackBtn', () => showScreen('mainMenu'));
    
    // ========================================
    // INIT
    // ========================================
    
    loadSettings();
    loadHighScores();
    updateChapterSelect();
    showScreen('mainMenu');
    console.log('✅ Game ready to play!');
});
