const Audio = {
  ctx: null,
  
  init() {
    this.ctx = new (window.AudioContext || window.webkitAudioContext)();
  },
  
  playTone(freq, duration, type = 'sine', volume = 0.3) {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = freq;
    osc.type = type;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },
  
  correct() {
    this.playTone(523, 0.1, 'sine', 0.3);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 100);
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200);
  },
  
  wrong() {
    this.playTone(200, 0.3, 'square', 0.2);
    setTimeout(() => this.playTone(150, 0.3, 'square', 0.2), 200);
  },
  
  coin() {
    this.playTone(1200, 0.1, 'square', 0.2);
    setTimeout(() => this.playTone(1500, 0.1, 'square', 0.2), 50);
    setTimeout(() => this.playTone(1800, 0.15, 'square', 0.2), 100);
  },
  
  click() {
    this.playTone(800, 0.05, 'sine', 0.2);
  },
  
  powerup() {
    this.playTone(440, 0.1, 'sine', 0.2);
    setTimeout(() => this.playTone(554, 0.1, 'sine', 0.2), 100);
    setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 200);
    setTimeout(() => this.playTone(784, 0.2, 'sine', 0.25), 300);
  },
  
  purchase() {
    this.playTone(600, 0.1, 'sine', 0.25);
    setTimeout(() => this.playTone(800, 0.15, 'sine', 0.25), 100);
  },
  
  timer() {
    this.playTone(880, 0.05, 'sine', 0.15);
  },
  
  tick() {
    if (!this.ctx) this.init();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.frequency.value = 1000;
    osc.type = 'square';
    gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  },
  
  bgm() {
    const melodi = [262, 294, 330, 349, 392, 440, 494, 523, 494, 440, 392, 349, 330, 294, 262];
    let i = 0;
    const loop = () => {
      if (this.bgmPlaying && this.ctx) {
        this.playTone(melodi[i % melodi.length], 0.15, 'sine', 0.08);
        i++;
        setTimeout(loop, 200);
      }
    };
    this.bgmPlaying = true;
    loop();
  },
  
  stopBgm() {
    this.bgmPlaying = false;
  }
};

const Game = {
  coins: 0,
  streak: 0,
  bestStreak: 0,
  level: 1,
  currentLevel: 1,
  currentItem: null,
  maxLevels: 10,
  timeLeft: 30,
  timerInterval: null,
  itemActive: {
    calculator: false,
    timeShield: false,
    luckyCoin: false
  },
  
  items: [
    { id: 'calculator', name: 'Kalkulator', icon: '🔢', price: 50, desc: 'Auto hitung kembalian' },
    { id: 'timeShield', name: 'Time Shield', icon: '⏰', price: 80, desc: '+15 detik' },
    { id: 'luckyCoin', name: 'Lucky Coin', icon: '💰', price: 100, desc: 'Kembalian salah 10% diterima' },
    { id: 'quickEyes', name: 'Quick Eyes', icon: '👁️', price: 120, desc: 'Harga tahan lebih lama' },
    { id: 'priceGuide', name: 'Price Guide', icon: '📊', price: 150, desc: 'Lihat semua harga' },
    { id: 'autoSave', name: 'Auto Save', icon: '💾', price: 200, desc: ' 保存 streak kalau salah' }
  ],
  
 顾客: [
    '👨', '👩', '👴', '👵', '🧑', '👦', '👧', '👳', '👱', '🧔'
  ],
  
  barang: [
    { nama: 'Roti', harga: 3000, emoji: '🍞' },
    { nama: 'Susu', harga: 5000, emoji: '🥛' },
    { nama: 'Telur', harga: 2000, emoji: '🥚' },
    { nama: 'Apel', harga: 4000, emoji: '🍎' },
    { nama: 'Pisang', harga: 3000, emoji: '🍌' },
    { nama: 'Jeruk', harga: 5000, emoji: '🍊' },
    { nama: 'Roti Manis', harga: 4000, emoji: '🍰' },
    { nama: 'Kue', harga: 6000, emoji: '🧁' },
    { nama: 'Air Minum', harga: 2000, emoji: '💧' },
    { nama: 'Jus Buah', harga: 7000, emoji: '🧃' },
    { nama: 'Snack', harga: 3500, emoji: '🍟' },
    { nama: 'Es Krim', harga: 5000, emoji: '🍦' },
    { nama: 'Cookies', harga: 4500, emoji: '🍪' },
    { nama: 'Cokelat', harga: 6000, emoji: '🍫' },
    { nama: 'Permen', harga: 1500, emoji: '🍬' }
  ],
  
  uang: [1000, 2000, 5000, 10000, 20000, 50000],
  
  init() {
    this.loadData();
    this.renderShop();
    this.updateDisplay();
    this.hideLoading();
    this.setup();
  },
  
  setup() {
    document.addEventListener('click', () => {
      if (!Audio.ctx) Audio.init();
    }, { once: true });
  },
  
  loadData() {
    const saved = localStorage.getItem('moneywise-data');
    if (saved) {
      const data = JSON.parse(saved);
      this.coins = data.coins || 0;
      this.bestStreak = data.bestStreak || 0;
    }
  },
  
  saveData() {
    localStorage.setItem('moneywise-data', JSON.stringify({
      coins: this.coins,
      bestStreak: this.bestStreak
    }));
  },
  
  updateDisplay() {
    document.getElementById('total-coins').textContent = this.coins;
    document.getElementById('shop-coins-display').textContent = this.coins;
    document.getElementById('player-rank').textContent = this.getRank();
  },
  
  getRank() {
    if (this.bestStreak >= 50) return 'Manager';
    if (this.bestStreak >= 30) return 'Head Cashier';
    if (this.bestStreak >= 15) return 'Senior Cashier';
    if (this.bestStreak >= 5) return 'Cashier';
    return 'Junior Cashier';
  },
  
  hideLoading() {
    setTimeout(() => {
      document.getElementById('loading-screen').style.display = 'none';
    }, 500);
  },
  
  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  },
  
  startGame(difficulty) {
    this.streak = 0;
    this.currentLevel = 1;
    this.currentItem = null;
    this.itemActive = { calculator: false, timeShield: false, luckyCoin: false };
    Audio.correct();
    this.nextLevel();
  },
  
  nextLevel() {
    if (this.currentLevel > this.maxLevels) {
      this.endGame();
      return;
    }
    
    this.generateLevel();
    this.showScreen('gameplay-screen');
    this.updateGameDisplay();
    this.startTimer();
  },
  
  generateLevel() {
    const level = this.currentLevel;
    let numItems, maxPrice, priceStep;
    
    if (level <= 3) {
      numItems = 2;
      maxPrice = 10000;
      priceStep = 1000;
    } else if (level <= 6) {
      numItems = 3;
      maxPrice = 15000;
      priceStep = 500;
    } else if (level <= 10) {
      numItems = 4;
      maxPrice = 25000;
      priceStep = 100;
    }
    
    const selectedItems = [];
    const available = [...this.barang].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numItems; i++) {
      const item = available[i];
      let price = Math.floor(item.harga / priceStep) * priceStep;
      if (price < priceStep) price = priceStep;
      selectedItems.push({ ...item, harga: price });
    }
    
    this.currentItems = selectedItems;
    const total = selectedItems.reduce((sum, item) => sum + item.harga, 0);
    this.totalHarga = total;
    
    let uangDiberikan;
    const minUang = Math.ceil(total / 1000) * 1000;
    if (level <= 3) {
      uangDiberikan = minUang + (Math.floor(Math.random() * 4) + 1) * 1000;
    } else if (level <= 6) {
      uangDiberikan = minUang + (Math.floor(Math.random() * 5) + 1) * 500;
    } else {
      const steps = [1000, 2000, 5000];
      uangDiberikan = minUang + steps[Math.floor(Math.random() * steps.length)];
    }
    
    this.uangDiberikan = uangDiberikan;
    this.kembalianBenar = uangDiberikan - total;
    
    this.renderCart();
    
    const customerEl = document.getElementById('customer');
    customerEl.textContent = this.顾客[Math.floor(Math.random() * this.顾客.length)];
    
    const speechEl = document.getElementById('customer-speech');
    speechEl.textContent = this.getRandomSpeech();
    
    document.getElementById('change-input').value = '';
    document.getElementById('change-input').focus();
  },
  
  getRandomSpeech() {
    const speeches = [
      '"Halo! Ini uangnya..."',
      '"Ini uang Rsemua, mbah!"',
      '"Pak, Mbak, ini uangnya!"',
      '"Ini dong, mbak!"',
      '" Uang nya nih!"'
    ];
    return speeches[Math.floor(Math.random() * speeches.length)];
  },
  
  renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = this.currentItems.map(item => `
      <div class="cart-item">
        <span class="cart-item-name">${item.emoji} ${item.nama}</span>
        <span>Rp ${item.harga.toLocaleString('id-ID')}</span>
      </div>
    `).join('');
    
    document.getElementById('cart-total').textContent = 'Rp ' + this.totalHarga.toLocaleString('id-ID');
    document.getElementById('money-given-display').textContent = 'Rp ' + this.uangDiberikan.toLocaleString('id-ID');
  },
  
  startTimer() {
    this.timeLeft = this.itemActive.timeShield ? 45 : 30;
    if (this.itemActive.calculator) {
      this.showItemEffect('Kalkulator aktif! Kembalian: Rp ' + this.kembalianBenar.toLocaleString('id-ID'));
      Audio.powerup();
      setTimeout(() => this.checkAnswer(true), 500);
      return;
    }
    
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;
      const percent = (this.timeLeft / 30) * 100;
      document.getElementById('timer-fill').style.width = percent + '%';
      
      if (this.timeLeft <= 5 && this.timeLeft > 0) {
        Audio.tick();
      }
      
      if (this.timeLeft <= 0) {
        clearInterval(this.timerInterval);
        this.wrongAnswer();
      }
    }, 100);
  },
  
  checkAnswer(autoCalculate = false) {
    clearInterval(this.timerInterval);
    
    let inputValue;
    if (autoCalculate) {
      inputValue = this.kembalianBenar;
    } else {
      inputValue = parseInt(document.getElementById('change-input').value) || 0;
    }
    
    const benar = inputValue === this.kembalianBenar;
    
    if (!benar && this.itemActive.luckyCoin) {
      const diff = Math.abs(inputValue - this.kembalianBenar);
      const acceptable = this.kembalianBenar * 0.1;
      if (diff <= acceptable) {
        this.showItemEffect('Lucky Coin aktif! Diterima!');
        Audio.powerup();
        this.processCorrect();
        return;
      }
    }
    
    if (benar) {
      Audio.correct();
      this.processCorrect();
    } else {
      Audio.wrong();
      this.wrongAnswer();
    }
  },
  
  processCorrect() {
    let baseCoins = 10;
    const speedBonus = this.timeLeft > 25 ? 5 : 0;
    
    if (this.streak >= 9) {
      baseCoins *= 3;
    } else if (this.streak >= 4) {
      baseCoins *= 2;
    } else if (this.streak >= 2) {
      baseCoins *= 1.5;
    }
    
    const totalCoins = Math.floor(baseCoins + speedBonus);
    this.coins += totalCoins;
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    
    this.saveData();
    this.showResult(true, totalCoins);
  },
  
  wrongAnswer() {
    if (this.itemActive.autoSave) {
      this.showItemEffect('Auto Save! Streak tersimpan!');
      Audio.powerup();
      this.itemActive.autoSave = false;
    }
    
    this.streak = 0;
    this.showResult(false, 0);
  },
  
  showResult(correct, coins) {
    const icon = document.getElementById('result-icon');
    const title = document.getElementById('result-title');
    const message = document.getElementById('result-message');
    const streakEl = document.getElementById('result-streak');
    const multEl = document.getElementById('result-multiplier');
    
    if (correct) {
      icon.textContent = '✓';
      icon.className = 'result-icon correct';
      title.textContent = 'Benar!';
      message.textContent = 'Kamu dapat +' + coins + ' 💰 coins!';
    } else {
      icon.textContent = '✗';
      icon.className = 'result-icon wrong';
      title.textContent = 'Salah!';
      message.textContent = 'Kembalian yang benar Rp ' + this.kembalianBenar.toLocaleString('id-ID');
    }
    
    streakEl.textContent = this.streak;
    let mult = 1;
    if (this.streak >= 10) mult = 3;
    else if (this.streak >= 5) mult = 2;
    else if (this.streak >= 3) mult = 1.5;
    multEl.textContent = mult + 'x';
    
    this.showScreen('result-screen');
    
    this.spawnCoinsAnimation();
  },
  
  spawnCoinsAnimation() {
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'coins-float';
        el.textContent = '💰';
        el.style.left = (30 + Math.random() * 40) + '%';
        el.style.top = (40 + Math.random() * 20) + '%';
        document.body.appendChild(el);
        Audio.coin();
        setTimeout(() => el.remove(), 1000);
      }, i * 100);
    }
},
  
  skipLevel() {
    clearInterval(this.timerInterval);
    Audio.click();
    if (this.itemActive.autoSave) {
      this.streak = 0;
      this.itemActive.autoSave = false;
    }
    this.nextLevel();
  },
  
  endGame() {
    clearInterval(this.timerInterval);
    document.getElementById('final-coins').textContent = this.coins;
    document.getElementById('best-streak').textContent = this.bestStreak;
    document.getElementById('final-level').textContent = this.maxLevels;
    this.showScreen('gameover-screen');
  },
  
  backToMenu() {
    Audio.click();
    this.showScreen('main-menu');
    this.updateDisplay();
  },
  
  updateGameDisplay() {
    document.getElementById('game-coins').textContent = this.coins;
    document.getElementById('game-streak').textContent = this.streak;
    document.getElementById('game-level').textContent = this.currentLevel;
  },
  
  renderShop() {
    const container = document.getElementById('shop-items');
    container.innerHTML = this.items.map(item => `
      <div class="shop-item" onclick="Game.buyItem('${item.id}')" id="shop-item-${item.id}">
        <div class="shop-item-icon">${item.icon}</div>
        <div class="shop-item-name">${item.name}</div>
        <div class="shop-item-price">${item.price} 💰</div>
      </div>
    `).join('');
    this.updateShopButtons();
  },
  
  updateShopButtons() {
    this.items.forEach(item => {
      const el = document.getElementById('shop-item-' + item.id);
      if (el) {
        if (this.coins < item.price) {
          el.classList.add('disabled');
        } else {
          el.classList.remove('disabled');
        }
      }
    });
  },
  
  buyItem(itemId) {
    const item = this.items.find(i => i.id === itemId);
    if (!item || this.coins < item.price) return;
    
    Audio.purchase();
    this.coins -= item.price;
    this.currentItem = itemId;
    this.itemActive[itemId] = true;
    
    this.saveData();
    this.updateDisplay();
    this.updateShopButtons();
    
    this.showItemEffect(item.desc + ' (' + item.name + ' aktif!)');
  },
  
  showItemEffect(msg) {
    const popup = document.getElementById('item-popup');
    document.getElementById('item-popup-message').textContent = msg;
    popup.classList.add('active');
    setTimeout(() => popup.classList.remove('active'), 2000);
  },
  
  showShop() {
    Audio.click();
    this.updateDisplay();
    this.showScreen('shop-screen');
  },
  
  closeShop() {
    Audio.click();
    this.showScreen('main-menu');
  },
  
  showHelp() {
    Audio.click();
    this.showScreen('help-screen');
  },
  
  closeHelp() {
    Audio.click();
    this.showScreen('main-menu');
  }
};

window.Game = Game;
window.startGame = (difficulty) => Game.startGame(difficulty);
window.showShop = () => Game.showShop();
window.showHelp = () => Game.showHelp();
window.closeShop = () => Game.closeShop();
window.closeHelp = () => Game.closeHelp();
window.checkAnswer = () => Game.checkAnswer();
window.skipLevel = () => Game.skipLevel();
window.continueLevel = () => {
  Game.currentLevel++;
  Game.nextLevel();
};
window.nextLevel = () => Game.nextLevel();
window.backToMenu = () => Game.backToMenu();
window.buyItem = (itemId) => Game.buyItem(itemId);
window.addEventListener('load', () => Game.init());