(() => {
    'use strict';

    // ===== AUDIO ENGINE =====
    const Audio = (() => {
        let ctx;
        function getCtx() {
            if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
            if (ctx.state === 'suspended') ctx.resume();
            return ctx;
        }
        function play(freq, type, dur, vol = 0.25) {
            const c = getCtx();
            const osc = c.createOscillator();
            const gain = c.createGain();
            osc.connect(gain);
            gain.connect(c.destination);
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, c.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + dur);
            osc.start();
            osc.stop(c.currentTime + dur);
        }
        return {
            correct() {
                play(523, 'sine', 0.1);
                setTimeout(() => play(659, 'sine', 0.12), 80);
                setTimeout(() => play(784, 'sine', 0.18), 160);
            },
            wrong() {
                play(200, 'square', 0.15, 0.15);
                setTimeout(() => play(150, 'square', 0.2, 0.15), 120);
            },
            combo() {
                play(880, 'sine', 0.08);
                setTimeout(() => play(1047, 'sine', 0.12), 60);
            },
            levelUp() {
                [523, 659, 784, 1047].forEach((f, i) =>
                    setTimeout(() => play(f, 'sine', 0.15), i * 90));
            },
            gameOver() {
                [400, 300, 200, 150].forEach((f, i) =>
                    setTimeout(() => play(f, 'sawtooth', 0.25, 0.12), i * 140));
            },
            star() { play(1200, 'sine', 0.2); },
            drop() { play(100, 'sine', 0.08, 0.1); }
        };
    })();

    // ===== GAME DATA =====
    const TRASH = [
        // Organik
        { emoji: '🍌', name: 'Kulit Pisang', type: 'organik' },
        { emoji: '🍎', name: 'Sisa Apel', type: 'organik' },
        { emoji: '🥬', name: 'Sayur Layu', type: 'organik' },
        { emoji: '🍚', name: 'Sisa Nasi', type: 'organik' },
        { emoji: '🥚', name: 'Cangkang Telur', type: 'organik' },
        { emoji: '🌿', name: 'Daun Kering', type: 'organik' },
        { emoji: '🦴', name: 'Tulang Ayam', type: 'organik' },
        { emoji: '☕', name: 'Ampas Kopi', type: 'organik' },
        { emoji: '🌽', name: 'Tongkol Jagung', type: 'organik' },
        { emoji: '🍞', name: 'Roti Basi', type: 'organik' },
        // Anorganik
        { emoji: '🥤', name: 'Gelas Plastik', type: 'anorganik' },
        { emoji: '🛍️', name: 'Kantong Plastik', type: 'anorganik' },
        { emoji: '🧴', name: 'Botol Shampo', type: 'anorganik' },
        { emoji: '🥡', name: 'Styrofoam', type: 'anorganik' },
        { emoji: '🩹', name: 'Plester Bekas', type: 'anorganik' },
        { emoji: '🖊️', name: 'Pulpen Bekas', type: 'anorganik' },
        { emoji: '👟', name: 'Sepatu Rusak', type: 'anorganik' },
        { emoji: '🧹', name: 'Sikat Gigi Lama', type: 'anorganik' },
        { emoji: '🎈', name: 'Balon Kempes', type: 'anorganik' },
        // Daur Ulang
        { emoji: '📰', name: 'Koran Bekas', type: 'daur-ulang' },
        { emoji: '📦', name: 'Kardus', type: 'daur-ulang' },
        { emoji: '🍾', name: 'Botol Kaca', type: 'daur-ulang' },
        { emoji: '🥫', name: 'Kaleng Bekas', type: 'daur-ulang' },
        { emoji: '🧃', name: 'Kotak Susu', type: 'daur-ulang' },
        { emoji: '📄', name: 'Kertas Bekas', type: 'daur-ulang' },
        { emoji: '🫙', name: 'Toples Kaca', type: 'daur-ulang' },
        { emoji: '🥄', name: 'Sendok Aluminium', type: 'daur-ulang' },
        // B3 (Berbahaya)
        { emoji: '🔋', name: 'Baterai Bekas', type: 'b3' },
        { emoji: '💡', name: 'Lampu Neon', type: 'b3' },
        { emoji: '🧪', name: 'Obat Kadaluarsa', type: 'b3' },
        { emoji: '🎨', name: 'Cat Bekas', type: 'b3' },
        { emoji: '📱', name: 'HP Rusak', type: 'b3' },
        { emoji: '🧯', name: 'Pestisida', type: 'b3' },
    ];

    const LEVELS = [
        { bins: ['organik', 'anorganik'], count: 8, time: 8000, speed: 1 },
        { bins: ['organik', 'anorganik', 'daur-ulang'], count: 12, time: 7000, speed: 1.2 },
        { bins: ['organik', 'anorganik', 'daur-ulang', 'b3'], count: 15, time: 6000, speed: 1.4 },
        { bins: ['organik', 'anorganik', 'daur-ulang', 'b3'], count: 18, time: 5000, speed: 1.6 },
        { bins: ['organik', 'anorganik', 'daur-ulang', 'b3'], count: 22, time: 4000, speed: 2 },
    ];

    const BIN_INFO = {
        organik: { icon: '🟢', label: 'Organik' },
        anorganik: { icon: '🔴', label: 'Anorganik' },
        'daur-ulang': { icon: '🔵', label: 'Daur Ulang' },
        b3: { icon: '🟠', label: 'B3' },
    };

    const FACTS = [
        'Indonesia menghasilkan 67.8 juta ton sampah per tahun. Yuk kurangi!',
        'Plastik butuh 450 tahun untuk terurai di alam. Gunakan tas belanja sendiri!',
        'Sampah organik bisa dijadikan kompos dalam 2-3 bulan.',
        'Mendaur ulang 1 ton kertas menyelamatkan 17 pohon!',
        'Baterai bekas mengandung logam berat yang mencemari tanah dan air.',
        'Botol kaca bisa didaur ulang tanpa batas tanpa kehilangan kualitas!',
        'Kaleng aluminium bisa didaur ulang dan kembali ke rak toko dalam 60 hari.',
        'Styrofoam tidak bisa didaur ulang dan butuh 500 tahun untuk terurai.',
        'Sampah elektronik (e-waste) mengandung emas, perak, dan tembaga yang bisa diambil kembali.',
        'Kompos dari sampah organik membuat tanah lebih subur tanpa pupuk kimia.',
    ];

    // ===== STATE =====
    let state = {
        currentLevel: 1,
        score: 0,
        lives: 3,
        combo: 0,
        maxCombo: 0,
        correct: 0,
        wrong: 0,
        queue: [],
        currentTrash: null,
        timerInterval: null,
        timerRemaining: 0,
        levelProgress: { unlocked: [1], stars: {} },
    };

    // Load progress
    try {
        const saved = JSON.parse(localStorage.getItem('sortir-sampah-progress'));
        if (saved) state.levelProgress = saved;
    } catch (e) {}

    // ===== DOM =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    const screens = {
        start: $('#screen-start'),
        game: $('#screen-game'),
        complete: $('#screen-level-complete'),
        gameover: $('#screen-gameover'),
    };

    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    // ===== START SCREEN =====
    let selectedLevel = 1;

    function renderLevelButtons() {
        const btns = $$('.level-btn');
        btns.forEach(btn => {
            const lvl = +btn.dataset.level;
            const unlocked = state.levelProgress.unlocked.includes(lvl);
            const stars = state.levelProgress.stars[lvl] || 0;
            btn.classList.toggle('unlocked', unlocked);
            btn.classList.toggle('locked', !unlocked);
            btn.classList.toggle('selected', lvl === selectedLevel);
            btn.querySelector('.lvl-stars').textContent = unlocked
                ? (stars > 0 ? '⭐'.repeat(stars) : '---')
                : '🔒';
        });
    }

    $('#level-buttons').addEventListener('click', (e) => {
        const btn = e.target.closest('.level-btn');
        if (!btn || btn.classList.contains('locked')) return;
        selectedLevel = +btn.dataset.level;
        renderLevelButtons();
    });

    $('#btn-play').addEventListener('click', () => startLevel(selectedLevel));
    $('#btn-next-level').addEventListener('click', () => {
        const next = state.currentLevel + 1;
        if (next <= 5) startLevel(next);
        else showScreen('start');
    });
    $('#btn-back-menu').addEventListener('click', () => { showScreen('start'); renderLevelButtons(); });
    $('#btn-retry').addEventListener('click', () => startLevel(state.currentLevel));
    $('#btn-go-menu').addEventListener('click', () => { showScreen('start'); renderLevelButtons(); });

    renderLevelButtons();

    // ===== GAME LOGIC =====
    function startLevel(lvl) {
        state.currentLevel = lvl;
        state.score = 0;
        state.lives = 3;
        state.combo = 0;
        state.maxCombo = 0;
        state.correct = 0;
        state.wrong = 0;
        state.currentTrash = null;

        const levelData = LEVELS[lvl - 1];
        const available = TRASH.filter(t => levelData.bins.includes(t.type));
        state.queue = shuffle(available).slice(0, levelData.count);

        renderBins(levelData.bins);
        updateHUD();
        showScreen('game');
        nextTrash();
    }

    function renderBins(types) {
        const area = $('#bins-area');
        area.innerHTML = types.map(type => `
            <div class="bin" data-type="${type}">
                <div class="bin-icon">${BIN_INFO[type].icon}</div>
                <div class="bin-label">${BIN_INFO[type].label}</div>
            </div>
        `).join('');
        setupBinListeners();
    }

    function nextTrash() {
        clearTimer();
        if (state.queue.length === 0) {
            levelComplete();
            return;
        }
        state.currentTrash = state.queue.pop();
        renderTrash();
        startTimer();
        updateProgress();
    }

    function renderTrash() {
        const zone = $('#drop-zone');
        zone.innerHTML = '';
        const el = document.createElement('div');
        el.className = 'trash-on-belt';
        el.draggable = true;
        el.innerHTML = `
            <span class="t-emoji">${state.currentTrash.emoji}</span>
            <span class="t-name">${state.currentTrash.name}</span>
            <div class="trash-timer" id="trash-timer"></div>
        `;
        zone.appendChild(el);
        setupTrashDrag(el);
    }

    function startTimer() {
        const levelData = LEVELS[state.currentLevel - 1];
        const totalTime = levelData.time;
        state.timerRemaining = totalTime;
        const timerEl = $('#trash-timer');
        if (!timerEl) return;
        timerEl.style.width = '100%';

        const interval = 50;
        state.timerInterval = setInterval(() => {
            state.timerRemaining -= interval;
            const pct = Math.max(0, (state.timerRemaining / totalTime) * 100);
            timerEl.style.width = pct + '%';

            if (pct < 25) timerEl.className = 'trash-timer danger';
            else if (pct < 50) timerEl.className = 'trash-timer warning';

            if (state.timerRemaining <= 0) {
                clearTimer();
                handleTimeout();
            }
        }, interval);
    }

    function clearTimer() {
        if (state.timerInterval) {
            clearInterval(state.timerInterval);
            state.timerInterval = null;
        }
    }

    function handleTimeout() {
        state.lives--;
        state.combo = 0;
        state.wrong++;
        Audio.wrong();
        showFeedback('⏰ Waktu habis!', 'wrong');
        updateHUD();
        if (state.lives <= 0) {
            setTimeout(gameOver, 600);
        } else {
            setTimeout(nextTrash, 800);
        }
    }

    function handleDrop(binType) {
        if (!state.currentTrash) return;
        clearTimer();

        if (binType === state.currentTrash.type) {
            // Correct
            state.combo++;
            if (state.combo > state.maxCombo) state.maxCombo = state.combo;
            const comboBonus = Math.min(state.combo, 5);
            const points = 10 * comboBonus;
            state.score += points;
            state.correct++;
            Audio.correct();
            if (state.combo >= 3) Audio.combo();
            showFeedback(`+${points}`, 'correct');
            spawnParticles(true);
        } else {
            // Wrong
            state.lives--;
            state.combo = 0;
            state.wrong++;
            Audio.wrong();
            showFeedback(`❌ → ${BIN_INFO[state.currentTrash.type].label}`, 'wrong');
            spawnParticles(false);
        }

        state.currentTrash = null;
        updateHUD();

        if (state.lives <= 0) {
            setTimeout(gameOver, 600);
        } else {
            setTimeout(nextTrash, 700);
        }
    }

    function levelComplete() {
        const levelData = LEVELS[state.currentLevel - 1];
        const accuracy = state.correct / (state.correct + state.wrong) || 0;
        const stars = accuracy >= 0.95 ? 3 : accuracy >= 0.75 ? 2 : accuracy >= 0.5 ? 1 : 0;

        // Save progress
        const prev = state.levelProgress.stars[state.currentLevel] || 0;
        if (stars > prev) state.levelProgress.stars[state.currentLevel] = stars;
        const next = state.currentLevel + 1;
        if (next <= 5 && !state.levelProgress.unlocked.includes(next)) {
            state.levelProgress.unlocked.push(next);
        }
        localStorage.setItem('sortir-sampah-progress', JSON.stringify(state.levelProgress));

        // Show screen
        Audio.levelUp();
        $('#stat-correct').textContent = state.correct;
        $('#stat-wrong').textContent = state.wrong;
        $('#stat-combo').textContent = state.maxCombo + 'x';
        $('#stat-score').textContent = state.score;
        $('#fact-text').textContent = FACTS[Math.floor(Math.random() * FACTS.length)];

        // Stars animation
        const starEls = $$('#stars-display .star');
        starEls.forEach((el, i) => {
            el.textContent = '☆';
            el.classList.remove('earned');
            if (i < stars) {
                setTimeout(() => {
                    el.textContent = '⭐';
                    el.classList.add('earned');
                    Audio.star();
                }, 400 + i * 400);
            }
        });

        $('#btn-next-level').style.display = state.currentLevel < 5 ? '' : 'none';
        showScreen('complete');
    }

    function gameOver() {
        Audio.gameOver();
        $('#go-score').textContent = state.score;
        const msg = state.score >= 100 ? 'Hebat! Kamu sudah paham memilah sampah!' :
                    state.score >= 50 ? 'Lumayan! Terus belajar ya!' :
                    'Jangan menyerah! Coba lagi!';
        $('#go-msg').textContent = msg;
        showScreen('gameover');
    }

    // ===== HUD =====
    function updateHUD() {
        $('#hud-score').textContent = state.score;
        $('#hud-level').textContent = state.currentLevel;

        // Lives
        const livesEl = $('#hud-lives');
        livesEl.innerHTML = '';
        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            span.className = 'heart' + (i >= state.lives ? ' lost' : '');
            span.textContent = '❤️';
            livesEl.appendChild(span);
        }

        // Combo
        const comboEl = $('#combo-display');
        if (state.combo >= 2) {
            comboEl.classList.remove('hidden');
            $('#combo-value').textContent = `x${state.combo}`;
        } else {
            comboEl.classList.add('hidden');
        }
    }

    function updateProgress() {
        const levelData = LEVELS[state.currentLevel - 1];
        const total = levelData.count;
        const done = total - state.queue.length - 1;
        const pct = (done / total) * 100;
        $('#progress-fill').style.width = pct + '%';
    }

    // ===== FEEDBACK & PARTICLES =====
    function showFeedback(text, type) {
        const el = $('#feedback-popup');
        el.textContent = text;
        el.className = `feedback-popup ${type}`;
        setTimeout(() => el.classList.add('hidden'), 900);
    }

    function spawnParticles(success) {
        const container = $('#particles-container');
        const colors = success
            ? ['#4caf50', '#69f0ae', '#a5d6a7', '#fdd835']
            : ['#f44336', '#ff8a80', '#ffcdd2'];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'particle';
            p.style.left = (40 + Math.random() * 20) + '%';
            p.style.top = (30 + Math.random() * 20) + '%';
            p.style.background = colors[Math.floor(Math.random() * colors.length)];
            p.style.transform = `translate(${(Math.random() - 0.5) * 100}px, 0)`;
            container.appendChild(p);
            setTimeout(() => p.remove(), 1000);
        }
    }

    // ===== DRAG & DROP =====
    function setupTrashDrag(el) {
        // Mouse drag
        el.addEventListener('dragstart', (e) => {
            el.classList.add('dragging');
            e.dataTransfer.setData('text/plain', '');
        });
        el.addEventListener('dragend', () => el.classList.remove('dragging'));

        // Touch drag
        el.addEventListener('touchstart', () => el.classList.add('dragging'));
        el.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            $$('.bin').forEach(b => b.classList.remove('drag-over'));
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            const bin = target?.closest('.bin');
            if (bin) bin.classList.add('drag-over');
        });
        el.addEventListener('touchend', (e) => {
            el.classList.remove('dragging');
            const touch = e.changedTouches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            $$('.bin').forEach(b => b.classList.remove('drag-over'));
            const bin = target?.closest('.bin');
            if (bin) handleDrop(bin.dataset.type);
        });
    }

    function setupBinListeners() {
        $$('.bin').forEach(bin => {
            bin.addEventListener('dragover', (e) => {
                e.preventDefault();
                bin.classList.add('drag-over');
            });
            bin.addEventListener('dragleave', () => bin.classList.remove('drag-over'));
            bin.addEventListener('drop', (e) => {
                e.preventDefault();
                bin.classList.remove('drag-over');
                handleDrop(bin.dataset.type);
            });
            // Click/tap fallback
            bin.addEventListener('click', () => {
                if (state.currentTrash) handleDrop(bin.dataset.type);
            });
        });
    }

    // ===== UTILS =====
    function shuffle(arr) {
        const a = [...arr];
        for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [a[i], a[j]] = [a[j], a[i]];
        }
        return a;
    }
})();
