const WORDS = [
  { word: 'baju', hint: '👕' },
  { word: 'api', hint: '🔥' },
  { word: 'ibu', hint: '👩' },
  { word: 'bola', hint: '⚽' },
  { word: 'buku', hint: '📖' },
  { word: 'mata', hint: '👁️' },
  { word: 'kaki', hint: '🦶' },
  { word: 'batu', hint: '🪨' },
  { word: 'dadu', hint: '🎲' },
  { word: 'meja', hint: '🪑' },
  { word: 'nasi', hint: '🍚' },
  { word: 'ayam', hint: '🐔' },
  { word: 'ikan', hint: '🐟' },
  { word: 'pohon', hint: '🌳' },
  { word: 'rumah', hint: '🏠' },
  { word: 'kucing', hint: '🐱' },
  { word: 'lampu', hint: '💡' },
  { word: 'hujan', hint: '🌧️' },
  { word: 'jalan', hint: '🛣️' },
  { word: 'gajah', hint: '🐘' },
];

const COLORS = [
  ['#ff6b6b', '#ee5a24'],
  ['#48dbfb', '#0abde3'],
  ['#feca57', '#ff9f43'],
  ['#a29bfe', '#6c5ce7'],
  ['#fd79a8', '#e84393'],
  ['#55efc4', '#00b894'],
  ['#fab1a0', '#e17055'],
  ['#74b9ff', '#0984e3'],
  ['#ffeaa7', '#fdcb6e'],
  ['#dfe6e9', '#b2bec3'],
];

class BubblePopABC {
  constructor() {
    this.score = 0;
    this.stars = 0;
    this.level = 0;
    this.correctCount = 0;
    this.totalWords = 10;
    this.currentWord = null;
    this.currentLetters = [];
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isComplete = false;
    this.wordList = [];
    this.dragData = null;

    this.$ = (id) => document.getElementById(id);

    this.$('start-btn').addEventListener('click', () => this.startGame());
    this.$('replay-btn').addEventListener('click', () => this.startGame());

    document.addEventListener('mousemove', (e) => this.onDragMove(e.clientX, e.clientY));
    document.addEventListener('mouseup', () => this.onDragEnd());
    document.addEventListener('touchmove', (e) => {
      if (this.dragData) e.preventDefault();
      const t = e.touches[0];
      this.onDragMove(t.clientX, t.clientY);
    }, { passive: false });
    document.addEventListener('touchend', () => this.onDragEnd());
    window.addEventListener('resize', () => this.constrainBubbles());
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  startGame() {
    this.score = 0;
    this.stars = 0;
    this.level = 0;
    this.correctCount = 0;

    this.wordList = this.shuffle([...WORDS]).slice(0, this.totalWords);

    this.showScreen('game-screen');
    this.nextWord();
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    this.$(id).classList.add('active');
  }

  nextWord() {
    if (this.level >= this.totalWords) {
      this.showResult();
      return;
    }

    this.isComplete = false;
    this.currentWord = this.wordList[this.level];
    this.currentLetters = this.currentWord.word.split('');
    this.currentIndex = 0;

    this.$('word-hint').textContent = this.currentWord.hint;
    this.$('level').textContent = `${this.level + 1}/${this.totalWords}`;
    this.$('score').textContent = this.score;
    this.$('stars').textContent = this.stars;

    // Render slots
    const slots = this.$('slots');
    slots.innerHTML = '';
    this.currentLetters.forEach(() => {
      const div = document.createElement('div');
      div.className = 'slot';
      slots.appendChild(div);
    });

    // Remove any existing completion overlay
    const old = this.$('game-screen').querySelector('.word-complete');
    if (old) old.remove();

    // Create bubbles
    this.createBubbles();
  }

  createBubbles() {
    const area = this.$('bubble-area');
    area.innerHTML = '';
    const bubbles = [];

    const shuffled = this.shuffle([...this.currentLetters]);

    shuffled.forEach((letter, i) => {
      const color = COLORS[i % COLORS.length];
      const el = document.createElement('div');
      el.className = 'bubble';
      el.textContent = letter.toUpperCase();
      el.dataset.letter = letter.toLowerCase();

      // Size based on word length
      const size = Math.min(70, Math.max(50, 380 / shuffled.length));
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.fontSize = (size * 0.45) + 'px';
      el.style.background = `radial-gradient(circle at 35% 35%, ${color[0]}, ${color[1]})`;

      const rect = area.getBoundingClientRect();
      const padding = size;
      const maxX = rect.width - padding;
      const maxY = rect.height - padding;

      el.style.left = Math.random() * maxX + 'px';
      el.style.top = Math.random() * maxY + 'px';

      // Floating animation with random delay
      const dur = 3 + Math.random() * 2;
      const delay = Math.random() * 2;
      el.style.animation = `floatBubble ${dur}s ease-in-out ${delay}s infinite`;

      el.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.onDragStart(el, e.clientX, e.clientY);
      });
      el.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const t = e.touches[0];
        this.onDragStart(el, t.clientX, t.clientY);
      }, { passive: false });

      bubbles.push(el);
      area.appendChild(el);
    });
  }

  popBubble(el) {
    if (this.isComplete) return;

    const letter = el.dataset.letter;

    if (letter === this.currentLetters[this.currentIndex]) {
      // Correct
      this.score += 10;
      this.currentIndex++;

      // Fill slot
      const slots = this.$('slots').querySelectorAll('.slot');
      slots[this.currentIndex - 1].textContent = letter.toUpperCase();
      slots[this.currentIndex - 1].classList.add('filled');

      // Pop animation
      el.classList.add('pop');
      this.spawnParticles(el);
      setTimeout(() => el.remove(), 350);

      this.$('score').textContent = this.score;

      // Check word complete
      if (this.currentIndex === this.currentLetters.length) {
        this.onWordComplete();
      }
    } else {
      // Wrong
      el.classList.add('shake');
      setTimeout(() => el.classList.remove('shake'), 400);
    }
  }

  onDragStart(el, clientX, clientY) {
    if (this.isComplete) return;
    this.dragData = {
      el,
      startX: clientX,
      startY: clientY,
      moved: false,
      offsetX: clientX - el.getBoundingClientRect().left,
      offsetY: clientY - el.getBoundingClientRect().top,
    };
    el.style.animation = 'none';
    el.style.transition = 'none';
    el.style.zIndex = '10';
    el.classList.add('dragging');
  }

  onDragMove(clientX, clientY) {
    if (!this.dragData) return;
    const dx = clientX - this.dragData.startX;
    const dy = clientY - this.dragData.startY;
    if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
      this.dragData.moved = true;
    }
    if (!this.dragData.moved) return;

    const el = this.dragData.el;
    const area = this.$('bubble-area');
    const areaRect = area.getBoundingClientRect();
    const size = el.offsetWidth;

    let left = clientX - areaRect.left - this.dragData.offsetX;
    let top = clientY - areaRect.top - this.dragData.offsetY;

    left = Math.max(0, Math.min(left, areaRect.width - size));
    top = Math.max(0, Math.min(top, areaRect.height - size));

    el.style.left = left + 'px';
    el.style.top = top + 'px';
  }

  onDragEnd() {
    if (!this.dragData) return;
    const el = this.dragData.el;
    el.style.zIndex = '';
    el.classList.remove('dragging');

    if (!this.dragData.moved) {
      this.popBubble(el);
    } else {
      const dur = 3 + Math.random() * 2;
      const delay = Math.random() * 2;
      el.style.animation = `floatBubble ${dur}s ease-in-out ${delay}s infinite`;
    }

    this.dragData = null;
  }

  constrainBubbles() {
    const area = this.$('bubble-area');
    if (!area) return;
    const rect = area.getBoundingClientRect();
    if (rect.width === 0) return;

    area.querySelectorAll('.bubble').forEach(el => {
      const size = el.offsetWidth;
      let left = parseFloat(el.style.left) || 0;
      let top = parseFloat(el.style.top) || 0;
      const maxX = rect.width - size;
      const maxY = rect.height - size;
      left = Math.max(0, Math.min(left, Math.max(0, maxX)));
      top = Math.max(0, Math.min(top, Math.max(0, maxY)));
      el.style.left = left + 'px';
      el.style.top = top + 'px';
    });
  }

  spawnParticles(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const emojis = ['⭐', '✨', '🌟', '💫'];

    for (let i = 0; i < 4; i++) {
      const p = document.createElement('div');
      p.className = 'pop-particle';
      p.textContent = emojis[i % emojis.length];
      const angle = (Math.PI * 2 * i) / 4;
      const dist = 40 + Math.random() * 30;
      p.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        --dx: ${Math.cos(angle) * dist}px;
        --dy: ${Math.sin(angle) * dist}px;
      `;
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 600);
    }
  }

  onWordComplete() {
    this.isComplete = true;

    const bonus = this.currentLetters.length * 5;
    this.score += bonus;
    this.correctCount++;
    this.stars += this.currentLetters.length <= 3 ? 2 : 1;

    this.$('score').textContent = this.score;
    this.$('stars').textContent = this.stars;

    // Remove any leftover overlay
    const old = this.$('game-screen').querySelector('.word-complete');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.className = 'word-complete';
    overlay.innerHTML = `
      <div class="complete-card">
        <div class="complete-title">${this.currentLetters.length <= 3 ? '🎉 Hebat!' : '✨ Mantap!'}</div>
        <div class="complete-word">${this.currentWord.word.toUpperCase()}</div>
        <button class="btn-next">${this.level + 1 >= this.totalWords ? 'Lihat Hasil 🏆' : 'Lanjut ➡️'}</button>
      </div>
    `;
    overlay.querySelector('.btn-next').addEventListener('click', () => {
      overlay.remove();
      this.level++;
      this.nextWord();
    });
    this.$('game-screen').appendChild(overlay);
  }

  showResult() {
    const stars = this.stars;
    let message = 'Kamu hebat sekali!';
    let icon = '🎉';
    if (stars >= 15) { message = 'Luar biasa! 🏆'; icon = '🏆'; }
    else if (stars >= 10) { message = 'Hebat banget! ⭐'; icon = '⭐'; }
    else if (stars >= 5) { message = 'Sudah bagus! 👍'; icon = '👍'; }

    this.$('result-screen').querySelector('.result-icon').textContent = icon;
    this.$('result-screen').querySelector('h2').textContent = message;
    this.$('final-score').textContent = this.score;
    this.$('final-stars').textContent = this.stars;
    this.$('final-correct').textContent = `${this.correctCount}/${this.totalWords}`;

    this.showScreen('result-screen');
  }
}

// Start
new BubblePopABC();
