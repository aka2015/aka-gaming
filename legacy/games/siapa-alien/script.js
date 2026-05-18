const CHARACTER_POOL = [
  { name: 'Pak RT', emoji: '👨‍💼' },
  { name: 'Bu Guru', emoji: '👩‍🏫' },
  { name: 'Kakek', emoji: '👴' },
  { name: 'Nenek', emoji: '👵' },
  { name: 'Ani', emoji: '👧' },
  { name: 'Budi', emoji: '👦' },
  { name: 'Pak Polisi', emoji: '👮' },
  { name: 'Pak Dokter', emoji: '👨‍⚕️' },
  { name: 'Bu Penjual', emoji: '👩‍🍳' },
  { name: 'Kakak', emoji: '👩' },
  { name: 'Adek', emoji: '👶' },
  { name: 'Pak Tukang', emoji: '👨‍🔧' },
  { name: 'Petani', emoji: '👨‍🌾' },
  { name: 'Pak Satpam', emoji: '💂' },
  { name: 'Bu Dokter', emoji: '👩‍⚕️' },
  { name: 'Koki', emoji: '👨‍🍳' },
];

const VISUAL_CLUES = [
  { id: 'mata-merah', label: 'Mata merah bersinar', icon: '👁️‍🔥' },
  { id: 'kulit-hijau', label: 'Kulit kehijauan', icon: '🟢' },
  { id: 'kuping-lancip', label: 'Kuping lancip', icon: '👂' },
  { id: 'senyum-aneh', label: 'Senyum aneh', icon: '😬' },
  { id: 'jari-panjang', label: 'Jari panjang', icon: '🖐️' },
  { id: 'bayangan-glitch', label: 'Bayangan bergetar', icon: '🌫️' },
];

const TEXT_CLUES = [
  'Bilang matahari itu rasanya asin',
  'Tidak tahu apa itu es krim',
  'Bilang air itu pedas',
  'Tidak tahu warna biru',
  'Kaget lihat kucing, panggil "monster!"',
  'Tanya "apa itu buku?"',
  'Tidak pernah makan nasi',
  'Bilang ayam berkaki 6',
  'Tidak bisa tersenyum',
  'Keringat berwarna hijau',
  'Panggil pohon "tiang hijau"',
  'Bilang api itu dingin',
  'Tidak kenal ikan, bilang "ular air"',
  'Tertawa saat lihat orang menangis',
  'Bilang tidur itu tidak perlu',
  'Tanya kenapa langit biru padahal katanya merah',
  'Tidak tahu rasa gula',
  'Panggil kambing "domba bertanduk"',
  'Bilang hujan itu air dari kran raksasa',
  'Tidak suka bermain',
];

const STORY_TEXTS = [
  'Awas! Ada alien menyamar di antara warga desa!',
  'Hari ini festival desa, tapi ada alien ikut serta!',
  'Para warga sedang berkumpul. Siapa yang bukan manusia?',
  'Alien datang ke desa! Bantu cari penyusup!',
  'Warga desa sedang bermain. Ada yang aneh...',
  'Alien pintar bersembunyi. Bisa kah kamu menemukannya?',
  'Suasana desa ramai. Tapi ada yang tidak biasa...',
  'Cari alien sebelum dia kabur!',
  'Warga desa curiga ada yang berbeda hari ini!',
  'Siapa yang bukan teman kita? Ayo cari!',
];

class SoundManager {
  constructor() {
    this.ctx = null;
  }

  async init() {
    if (this.ctx) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      await this.ctx.resume();
    } catch (e) {
      this.ctx = null;
    }
  }

  _play(freq, duration, type = 'sine', volume = 0.3, delay = 0) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  }

  pop() { this._play(660, 0.07, 'sine', 0.18); }

  suspectDing() { this._play(330, 0.2, 'triangle', 0.22); }

  safeChime() { this._play(880, 0.3, 'sine', 0.18); }

  fanfare() {
    [523, 659, 784, 1047].forEach((f, i) => this._play(f, 0.2, 'sine', 0.2, i * 0.1));
  }

  winJingle() {
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => this._play(f, 0.25, 'triangle', 0.22, i * 0.12));
  }

  buzz() { this._play(160, 0.35, 'sawtooth', 0.12); }

  wrongBuzz() { this._play(120, 0.5, 'square', 0.08); }
}

class SiapaAlien {
  constructor() {
    this.score = 0;
    this.round = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;
    this.totalRounds = 10;
    this.roundChars = [];
    this.alienCount = 0;
    this.suspectedCount = 0;
    this.clearedCount = 0;
    this.isPlaying = false;
    this.roundDone = false;

    this.sfx = new SoundManager();

    this.$ = (id) => document.getElementById(id);

    this.$('start-btn').addEventListener('click', () => this.startGame());
    this.$('replay-btn').addEventListener('click', () => this.startGame());
    this.$('btn-submit').addEventListener('click', () => this.submitInvestigation());
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('investigation-overlay')) {
        this.closeInvestigation();
      }
    });
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  pickRandom(arr, n) {
    return this.shuffle([...arr]).slice(0, n);
  }

  startGame() {
    this.sfx.init();

    this.score = 0;
    this.round = 0;
    this.streak = 0;
    this.maxStreak = 0;
    this.correctCount = 0;

    this.showScreen('game-screen');
    this.nextRound();
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    this.$(id).classList.add('active');
  }

  // ----- Round Generation -----

  nextRound() {
    if (this.round >= this.totalRounds) {
      this.showResult();
      return;
    }

    this.roundDone = false;
    this.suspectedCount = 0;
    this.clearedCount = 0;
    this.round++;

    const difficulty = this.round <= 3 ? 1 : this.round <= 6 ? 2 : 3;
    const charCount = difficulty === 1 ? 4 : difficulty === 2 ? 5 : 6;
    const alienCount = Math.min(
      difficulty === 3 && Math.random() < 0.3 ? 2 : 1,
      charCount - 1
    );
    this.alienCount = alienCount;

    const chosen = this.pickRandom(CHARACTER_POOL, charCount);
    const alienIndices = this.pickRandom(
      chosen.map((_, i) => i),
      alienCount
    );

    this.roundChars = chosen.map((c, i) => {
      const isAlien = alienIndices.includes(i);
      const clues = isAlien ? this.generateClues(difficulty) : [];
      return { ...c, isAlien, clues, status: 'unchecked' };
    });

    this.$('score').textContent = this.score;
    this.$('round').textContent = `${this.round}/${this.totalRounds}`;
    this.$('story-text').textContent = this.pickRandom(STORY_TEXTS)[0];
    this.updateFoundCount();
    this.$('btn-submit').style.display = 'none';

    this.renderCharacters();
  }

  generateClues(difficulty) {
    const visualCount = difficulty === 1 ? 2 : difficulty === 2 ? 1 : 0;
    const textCount = difficulty === 1 ? 1 : difficulty === 2 ? 1 : Math.random() < 0.7 ? 1 : 0;
    const clues = [];
    if (visualCount > 0) clues.push(...this.pickRandom(VISUAL_CLUES, visualCount));
    if (textCount > 0) clues.push(...this.pickRandom(TEXT_CLUES, textCount).map(t => ({ id: 'text', label: t, icon: '💬' })));
    return clues;
  }

  // ----- Rendering -----

  renderCharacters() {
    const area = this.$('character-area');
    area.innerHTML = '';

    this.roundChars.forEach((char, i) => {
      const card = document.createElement('div');
      card.className = 'char-card';
      card.dataset.index = i;

      const avatar = document.createElement('div');
      avatar.className = 'char-avatar';
      avatar.textContent = char.emoji;

      const nameEl = document.createElement('div');
      nameEl.className = 'char-name';
      nameEl.textContent = char.name;

      card.appendChild(avatar);
      card.appendChild(nameEl);

      card.addEventListener('click', () => this.onCharClick(i));
      area.appendChild(card);
    });
  }

  updateCharCard(index) {
    const cards = this.$('character-area').querySelectorAll('.char-card');
    if (index >= cards.length) return;
    const card = cards[index];
    const char = this.roundChars[index];

    card.className = 'char-card';

    if (char.status === 'suspected') {
      card.classList.add('suspected');
      this.addStatusBadge(card, '👽');
    } else if (char.status === 'cleared') {
      card.classList.add('cleared');
      this.addStatusBadge(card, '✅');
    }

    card.classList.add('investigated');
  }

  addStatusBadge(card, icon) {
    let badge = card.querySelector('.char-status');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'char-status';
      card.appendChild(badge);
    }
    badge.textContent = icon;
  }

  // ----- Character Interaction -----

  onCharClick(index) {
    if (this.roundDone) return;
    this.showInvestigationCard(index);
  }

  showInvestigationCard(index) {
    const char = this.roundChars[index];
    const template = document.getElementById('card-template');
    const clone = template.content.cloneNode(true);
    const overlay = clone.querySelector('.investigation-overlay');

    overlay.querySelector('#inv-avatar').textContent = char.emoji;
    overlay.querySelector('#inv-name').textContent = char.name;

    const statusMap = { unchecked: 'Belum diperiksa', suspected: '👽 Dicurigai', cleared: '✅ Dianggap aman' };
    overlay.querySelector('#inv-label').textContent = statusMap[char.status] || 'Belum diperiksa';

    const cluesContainer = overlay.querySelector('#inv-clues');
    cluesContainer.innerHTML = '';

    if (char.clues.length === 0) {
      const div = document.createElement('div');
      div.className = 'no-clues';
      div.textContent = 'Tidak ada petunjuk mencurigakan... 🤔';
      cluesContainer.appendChild(div);
    } else {
      char.clues.forEach((clue, ci) => {
        setTimeout(() => {
          const item = document.createElement('div');
          const isVisual = clue.icon !== '💬';
          item.className = `clue-item ${isVisual ? 'visual-clue' : ''}`;
          item.innerHTML = `
            <span class="clue-icon">${clue.icon}</span>
            <span class="clue-text">${clue.label}</span>
          `;
          cluesContainer.appendChild(item);
        }, ci * 120);
      });
    }

    const suspectBtn = overlay.querySelector('#btn-suspect');
    const clearBtn = overlay.querySelector('#btn-clear');

    if (char.status === 'suspected') {
      suspectBtn.disabled = true;
    } else if (char.status === 'cleared') {
      clearBtn.disabled = true;
    }

    this.sfx.pop();

    suspectBtn.addEventListener('click', () => {
      this.markCharacter(index, 'suspected');
      overlay.remove();
    });

    clearBtn.addEventListener('click', () => {
      this.markCharacter(index, 'cleared');
      overlay.remove();
    });

    overlay.querySelector('#inv-close').addEventListener('click', () => {
      overlay.remove();
    });

    document.body.appendChild(clone);
  }

  closeInvestigation() {
    const overlay = document.querySelector('.investigation-overlay');
    if (overlay) overlay.remove();
  }

  // ----- Marking System -----

  markCharacter(index, status) {
    if (this.roundDone) return;
    const char = this.roundChars[index];

    if (char.status === 'suspected') this.suspectedCount--;
    if (char.status === 'cleared') this.clearedCount--;

    char.status = status;

    if (status === 'suspected') { this.suspectedCount++; this.sfx.suspectDing(); }
    if (status === 'cleared') { this.clearedCount++; this.sfx.safeChime(); }

    this.updateCharCard(index);
    this.updateFoundCount();

    // Show submit button if all characters have been checked
    const totalChecked = this.suspectedCount + this.clearedCount;
    if (totalChecked === this.roundChars.length) {
      this.$('btn-submit').style.display = 'inline-flex';
    }
  }

  // ----- Submission -----

  submitInvestigation() {
    if (this.roundDone) return;
    this.roundDone = true;

    const cards = this.$('character-area').querySelectorAll('.char-card');
    let correctFound = 0;
    let wrongAccusations = 0;
    let missed = 0;

    this.roundChars.forEach((char, i) => {
      if (char.isAlien && char.status === 'suspected') {
        correctFound++;
        cards[i].classList.add('revealed-alien');
      } else if (char.isAlien && char.status !== 'suspected') {
        missed++;
        cards[i].classList.add('revealed-missed');
        this.addStatusBadge(cards[i], '👽');
      } else if (!char.isAlien && char.status === 'suspected') {
        wrongAccusations++;
        cards[i].classList.add('revealed-wrong');
      } else {
        cards[i].classList.add('revealed-human');
      }
    });

    let roundScore = correctFound * 100 - wrongAccusations * 50 - missed * 50;
    const allCorrect = wrongAccusations === 0 && missed === 0;
    if (allCorrect) roundScore += 200;

    if (allCorrect) {
      this.sfx.fanfare();
    } else {
      this.sfx.buzz();
    }

    this.score += roundScore;
    if (allCorrect) {
      this.streak++;
      this.correctCount++;
    } else {
      this.streak = 0;
    }
    if (this.streak > this.maxStreak) this.maxStreak = this.streak;

    this.$('score').textContent = this.score;
    this.$('btn-submit').style.display = 'none';

    // Show result after delay
    setTimeout(() => {
      this.showRoundResult(correctFound, wrongAccusations, missed, roundScore, allCorrect);
    }, 700);
  }

  // ----- Round Result -----

  showRoundResult(correct, wrong, missed, score, perfect) {
    if (perfect) {
      this.sfx.winJingle();
    } else if (wrong > 0) {
      this.sfx.wrongBuzz();
    }

    const overlay = document.createElement('div');
    overlay.className = 'round-result-overlay';

    let icon, title, sub;
    if (perfect) {
      icon = '🏆';
      title = 'Sempurna!';
      sub = `+${score} poin (bonus perfect!)`;
    } else if (wrong === 0 && missed > 0) {
      icon = '👀';
      title = 'Hampir!';
      sub = `${missed} alien lolos! +${score} poin`;
    } else if (wrong > 0 && correct > 0) {
      icon = '😅';
      title = 'Ada yang salah tebak';
      sub = `${correct} benar, ${wrong} salah. +${score} poin`;
    } else {
      icon = '😵';
      title = 'Aduh!';
      sub = `+${score} poin`;
    }

    overlay.innerHTML = `
      <div class="round-result-card">
        <div class="rr-icon">${icon}</div>
        <div class="rr-title">${title}</div>
        <div class="rr-sub">${sub}</div>
        <button class="btn-next">${this.round >= this.totalRounds ? 'Lihat Hasil 🏆' : 'Lanjut ➡️'}</button>
      </div>
    `;

    overlay.querySelector('.btn-next').addEventListener('click', () => {
      overlay.remove();
      this.nextRound();
    });

    document.body.appendChild(overlay);
  }

  updateFoundCount() {
    this.$('found').textContent = `${this.suspectedCount}/${this.alienCount}`;
  }

  // ----- Result Screen -----

  showResult() {
    const pct = Math.round((this.correctCount / this.totalRounds) * 100);
    let msg, icon;
    if (pct >= 90) { msg = 'Luar biasa! Detektif sejati! 🏆'; icon = '🏆'; }
    else if (pct >= 70) { msg = 'Hebat! Kamu jago! ⭐'; icon = '⭐'; }
    else if (pct >= 50) { msg = 'Sudah bagus! Ayo coba lagi! 👍'; icon = '👍'; }
    else { msg = 'Ayo coba lagi! 🧐'; icon = '🧐'; }

    this.$('result-icon').textContent = icon;
    this.$('result-title').textContent = msg;
    this.$('result-sub').textContent = `${this.correctCount} dari ${this.totalRounds} ronde sempurna`;
    this.$('final-score').textContent = this.score;
    this.$('final-correct').textContent = `${this.correctCount}/${this.totalRounds}`;
    this.$('final-streak').textContent = this.maxStreak;

    this.showScreen('result-screen');

    // Report score to Firebase leaderboard
    if (window.AkaScoreReporter) {
      window.AkaScoreReporter.report('siapa-alien', this.score, {
        correctRounds: this.correctCount,
        maxStreak: this.maxStreak,
        totalRounds: this.totalRounds
      });
    }
  }
}

new SiapaAlien();