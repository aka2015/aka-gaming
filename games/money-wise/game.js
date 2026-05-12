const Audio = {
  ctx: null,
  enabled: true,

  init() {
    if (this.enabled) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  playTone(freq, duration, type = 'sine', volume = 0.3) {
    if (!this.enabled) return;
    if (!this.ctx) this.init();
    if (!this.ctx) return;
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

  correct() { this.playTone(523, 0.1, 'sine', 0.3); setTimeout(() => this.playTone(659, 0.1, 'sine', 0.3), 100); setTimeout(() => this.playTone(784, 0.2, 'sine', 0.3), 200); },
  wrong() { this.playTone(200, 0.3, 'square', 0.2); setTimeout(() => this.playTone(150, 0.3, 'square', 0.2), 200); },
  coin() { this.playTone(1200, 0.1, 'square', 0.2); setTimeout(() => this.playTone(1500, 0.1, 'square', 0.2), 50); setTimeout(() => this.playTone(1800, 0.15, 'square', 0.2), 100); },
  click() { this.playTone(800, 0.05, 'sine', 0.2); },
  powerup() { this.playTone(440, 0.1, 'sine', 0.2); setTimeout(() => this.playTone(554, 0.1, 'sine', 0.2), 100); setTimeout(() => this.playTone(659, 0.1, 'sine', 0.2), 200); setTimeout(() => this.playTone(784, 0.2, 'sine', 0.25), 300); },
  purchase() { this.playTone(600, 0.1, 'sine', 0.25); setTimeout(() => this.playTone(800, 0.15, 'sine', 0.25), 100); },
  tick() { this.playTone(880, 0.05, 'sine', 0.15); },
  levelup() { this.playTone(523, 0.1); setTimeout(() => this.playTone(659, 0.1), 100); setTimeout(() => this.playTone(784, 0.1), 200); setTimeout(() => this.playTone(1047, 0.2), 300); },
  achievement() { this.playTone(784, 0.15, 'sine', 0.3); setTimeout(() => this.playTone(988, 0.15, 'sine', 0.3), 150); setTimeout(() => this.playTone(1175, 0.3, 'sine', 0.35), 300); },
  streakMilestone() { this.playTone(880, 0.1, 'triangle', 0.25); setTimeout(() => this.playTone(1100, 0.1, 'triangle', 0.25), 100); setTimeout(() => this.playTone(1320, 0.2, 'triangle', 0.3), 200); },

  bgm() {
    if (!this.enabled) return;
    const melodi = [262, 294, 330, 349, 392, 440, 494, 523, 494, 440, 392, 349, 330, 294, 262];
    let i = 0;
    const loop = () => {
      if (this.bgmPlaying && this.enabled && this.ctx) {
        this.playTone(melodi[i % melodi.length], 0.15, 'sine', 0.08);
        i++;
        setTimeout(loop, 200);
      }
    };
    this.bgmPlaying = true;
    loop();
  },

  stopBgm() { this.bgmPlaying = false; }
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
  difficulty: 'easy',
  isEndless: false,
  tutorialStep: 0,
  hintUsed: false,
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
    { id: 'autoSave', name: 'Auto Save', icon: '💾', price: 200, desc: 'Simpan streak kalau salah' }
  ],

  redeemItems: [
    { id: 'extraLife', name: 'Nyawa Extra', icon: '❤️', price: 100, desc: 'Tahan 1x salah tanpa kehilangan streak', type: 'consumable' },
    { id: 'doubleCoins', name: 'Koin Dobel', icon: '✨', price: 150, desc: 'Koin 2x di level berikutnya', type: 'consumable' },
    { id: 'skipLevel', name: 'Skip Level', icon: '🃏', price: 200, desc: 'Lewati 1 level tanpa streak hilang', type: 'consumable' },
    { id: 'customAvatar', name: 'Custom Avatar', icon: '🎨', price: 300, desc: 'Buka pilihan avatar kustom', type: 'unlock' },
    { id: 'goldCard', name: 'Kartu Emas', icon: '💳', price: 500, desc: 'Koin +50% permanen', type: 'permanent' },
    { id: 'vipBadge', name: 'Badge VIP', icon: '⭐', price: 1000, desc: 'Badge khusus di profil', type: 'unlock' }
  ],

  inventory: {
    extraLife: 0,
    doubleCoins: 0,
    skipLevel: 0
  },

  unlockedItems: {
    customAvatar: false,
    goldCard: false,
    vipBadge: false
  },

  bonusMultiplier: 1,

  achievements: [
    { id: 'firstSale', name: 'Penjualan Pertama', desc: 'Selesaikan level pertamamu', icon: '🌟', condition: (g) => g.currentLevel >= 2, reward: 20 },
    { id: 'streak5', name: 'Hot Streak', desc: 'Capai 5 streak', icon: '🔥', condition: (g) => g.streak >= 5, reward: 30 },
    { id: 'streak10', name: 'On Fire!', desc: 'Capai 10 streak', icon: '💥', condition: (g) => g.streak >= 10, reward: 50 },
    { id: 'streak20', name: 'Unstoppable', desc: 'Capai 20 streak', icon: '⚡', condition: (g) => g.streak >= 20, reward: 100 },
    { id: 'richKid', name: 'Si Kaya', desc: 'Kumpulkan 500 koin', icon: '💎', condition: (g) => g.coins >= 500, reward: 50 },
    { id: 'millionaire', name: 'Millionaire', desc: 'Kumpulkan 1000 koin', icon: '👑', condition: (g) => g.coins >= 1000, reward: 100 },
    { id: 'level10', name: 'Kasir Berpengalaman', desc: 'Selesaikan 10 level', icon: '🎯', condition: (g) => g.currentLevel >= 10, reward: 75 },
    { id: 'endlessMaster', name: 'Endless Master', desc: 'Capai level 25 di Endless', icon: '♾️', condition: (g) => g.isEndless && g.currentLevel >= 25, reward: 200 },
    { id: 'perfectRun', name: 'Perfect Run', desc: '10 streak di mode Sulit', icon: '🏆', condition: (g) => g.difficulty === 'hard' && g.streak >= 10, reward: 150 },
    { id: 'veteran', name: 'Veteran', desc: 'Best streak 30+', icon: '🎖️', condition: (g) => g.bestStreak >= 30, reward: 100 }
  ],

  unlockedAchievements: [],

  customers: [
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
  
  uang: [1000, 2000, 5000, 10000, 20000, 50000, 100000],

  difficulties: {
    easy: { time: 45, maxItems: 2, maxPrice: 10000, priceStep: 1000, minChange: 1000 },
    medium: { time: 35, maxItems: 3, maxPrice: 20000, priceStep: 500, minChange: 500 },
    hard: { time: 25, maxItems: 4, maxPrice: 50000, priceStep: 100, minChange: 100 }
  },

  tutorialSteps: [
    { title: 'Selamat Datang!', desc: 'Kamu akan menjadi kasir handal! Tugasmu menghitung kembalian dengan benar.', highlight: '.customer-area' },
    { title: 'Lihat Keranjang', desc: 'Ini barang yang mau dibeli customer. Jumlahkan semua harganya!', highlight: '.cart-area' },
    { title: 'Lihat Uang', desc: 'Ini jumlah uang yang dikasih customer. Selalu lebih dari total belanjaan.', highlight: '.money-given' },
    { title: 'Hitung Kembalian', desc: 'Kembalian = Uang Customer - Total Harga. Ketik jawabannya!', highlight: '.change-input' },
    { title: 'Waktu Terbatas!', desc: 'Kamu punya waktu terbatas. Jawaban salah atau waktu habis = streak hilang!', highlight: '.timer-area' },
    { title: 'Ayo Mulai!', desc: 'Sekarang giliranmu! Hitung kembalian dengan benar dan kumpulkan banyak koin!', highlight: '.btn-check' }
  ],
  
  init() {
    this.loadData();
    this.renderShop();
    this.renderRedeemItems();
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
      this.unlockedAchievements = data.unlockedAchievements || [];
      this.inventory = data.inventory || { extraLife: 0, doubleCoins: 0, skipLevel: 0 };
      this.unlockedItems = data.unlockedItems || { customAvatar: false, goldCard: false, vipBadge: false };
      this.bonusMultiplier = this.unlockedItems.goldCard ? 1.5 : 1;
    }
  },

  saveData() {
    localStorage.setItem('moneywise-data', JSON.stringify({
      coins: this.coins,
      bestStreak: this.bestStreak,
      unlockedAchievements: this.unlockedAchievements,
      inventory: this.inventory,
      unlockedItems: this.unlockedItems
    }));
  },

  checkAchievements() {
    let newUnlocks = [];
    this.achievements.forEach(ach => {
      if (!this.unlockedAchievements.includes(ach.id) && ach.condition(this)) {
        this.unlockedAchievements.push(ach.id);
        this.coins += ach.reward;
        newUnlocks.push(ach);
      }
    });
    if (newUnlocks.length > 0) {
      this.saveData();
      this.showAchievementPopup(newUnlocks);
    }
  },

  showAchievementPopup(achievements) {
    Audio.achievement();
    const ach = achievements[0];
    const popup = document.getElementById('achievement-popup');
    document.getElementById('ach-icon').textContent = ach.icon;
    document.getElementById('ach-name').textContent = ach.name;
    document.getElementById('ach-desc').textContent = ach.desc;
    document.getElementById('ach-reward').textContent = '+' + ach.reward + ' 💰';
    popup.classList.add('active');
    setTimeout(() => popup.classList.remove('active'), 3000);
  },

  showAchievements() {
    Audio.click();
    const container = document.getElementById('achievements-list');
    container.innerHTML = this.achievements.map(ach => {
      const unlocked = this.unlockedAchievements.includes(ach.id);
      return `<div class="achievement-item ${unlocked ? 'unlocked' : 'locked'}">
        <div class="ach-icon">${unlocked ? ach.icon : '🔒'}</div>
        <div class="ach-info">
          <div class="ach-name">${ach.name}</div>
          <div class="ach-desc">${ach.desc}</div>
          <div class="ach-reward">+${ach.reward} 💰</div>
        </div>
      </div>`;
    }).join('');
    this.showScreen('achievements-screen');
  },

  showRedeem() {
    Audio.click();
    this.updateDisplay();
    this.renderRedeemItems();
    this.showScreen('redeem-screen');
  },

  closeRedeem() {
    Audio.click();
    this.showScreen('main-menu');
  },

  renderRedeemItems() {
    const container = document.getElementById('redeem-items');
    container.innerHTML = this.redeemItems.map(item => {
      const owned = this.unlockedItems[item.id];
      const canAfford = this.coins >= item.price;
      const inInventory = this.inventory[item.id] !== undefined;
      
      if (item.type === 'consumable') {
        const qty = this.inventory[item.id] || 0;
        return `<div class="redeem-item ${!canAfford ? 'disabled' : ''}" onclick="Game.redeemItem('${item.id}')">
          <div class="redeem-icon">${item.icon}</div>
          <div class="redeem-info">
            <div class="redeem-name">${item.name}</div>
            <div class="redeem-desc">${item.desc}</div>
            <div class="redeem-qty">Milik: ${qty}</div>
          </div>
          <div class="redeem-price">${item.price} 💰</div>
        </div>`;
      } else {
        return `<div class="redeem-item ${owned || !canAfford ? 'disabled' : ''}" onclick="Game.redeemItem('${item.id}')">
          <div class="redeem-icon">${owned ? item.icon : '🔒'}</div>
          <div class="redeem-info">
            <div class="redeem-name">${item.name}</div>
            <div class="redeem-desc">${item.desc}</div>
            <div class="redeem-owned">${owned ? '✓ Tersedia' : 'Belum punya'}</div>
          </div>
          <div class="redeem-price">${owned ? '✓' : item.price + ' 💰'}</div>
        </div>`;
      }
    }).join('');
  },

  redeemItem(itemId) {
    const item = this.redeemItems.find(i => i.id === itemId);
    if (!item) return;
    
    if (item.type !== 'consumable' && this.unlockedItems[itemId]) {
      this.showItemEffect('Item sudah dimiliki!');
      return;
    }
    
    if (this.coins < item.price) {
      this.showItemEffect('Koin tidak cukup!');
      return;
    }
    
    Audio.purchase();
    this.coins -= item.price;
    
    if (item.type === 'consumable') {
      this.inventory[itemId] = (this.inventory[itemId] || 0) + 1;
      this.showItemEffect(item.icon + ' ' + item.name + ' dibeli! (x1)');
    } else {
      this.unlockedItems[itemId] = true;
      this.showItemEffect(item.icon + ' ' + item.name + ' unlocked!');
      if (itemId === 'goldCard') {
        this.bonusMultiplier = 1.5;
      }
    }
    
    this.saveData();
    this.updateDisplay();
    this.renderRedeemItems();
  },

  useItem(itemId) {
    if (this.inventory[itemId] <= 0) {
      this.showItemEffect('Item habis!');
      return;
    }
    
    Audio.powerup();
    this.inventory[itemId]--;
    
    if (itemId === 'extraLife') {
      this.showItemEffect('❤️ Nyawa Extra aktif! Salah 1x tidak kehilangan streak.');
      this.hasExtraLife = true;
    } else if (itemId === 'doubleCoins') {
      this.showItemEffect('✨ Koin Dobel aktif untuk level ini!');
      this.doubleCoinsActive = true;
    } else if (itemId === 'skipLevel') {
      this.showItemEffect('🃏 Skip Level aktif!');
      this.skipLevelActive = true;
    }
    
    this.saveData();
    this.showScreen('main-menu');
  },
  
  updateDisplay() {
    document.getElementById('total-coins').textContent = this.coins;
    document.getElementById('shop-coins-display').textContent = this.coins;
    document.getElementById('redeem-coins-display').textContent = this.coins;
    document.getElementById('player-rank').textContent = this.getRank();
    const totalItems = Object.values(this.inventory).reduce((a, b) => a + b, 0);
    document.getElementById('inventory-count').textContent = totalItems;
    if (this.unlockedItems.vipBadge) {
      document.getElementById('player-rank').classList.add('vip-badge');
    }
    this.updateInventoryDisplay();
  },
  
  updateInventoryDisplay() {
    const container = document.getElementById('inventory-items');
    if (!container) return;
    const items = Object.entries(this.inventory).filter(([k, v]) => v > 0);
    if (items.length === 0) {
      container.innerHTML = '<p class="empty-inventory">Belum punya item</p>';
      return;
    }
    const itemMap = { extraLife: 'Nyawa Extra', doubleCoins: 'Koin Dobel', skipLevel: 'Skip Level' };
    const iconMap = { extraLife: '❤️', doubleCoins: '✨', skipLevel: '🃏' };
    container.innerHTML = items.map(([id, qty]) => {
      return `<div class="inventory-item" onclick="Game.useItem('${id}')">
        <span class="inv-icon">${iconMap[id]}</span>
        <span class="inv-name">${itemMap[id]}</span>
        <span class="inv-qty">x${qty}</span>
      </div>`;
    }).join('');
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
    this.difficulty = difficulty || 'easy';
    this.isEndless = false;
    this.streak = 0;
    this.currentLevel = 1;
    this.currentItem = null;
    this.maxLevels = 10;
    this.itemActive = { calculator: false, timeShield: false, luckyCoin: false };
    Audio.correct();
    Audio.levelup();
    this.closeDifficulty();
    this.nextLevel();
  },

  startEndless() {
    Audio.click();
    this.isEndless = true;
    this.difficulty = 'hard';
    this.streak = 0;
    this.currentLevel = 1;
    this.currentItem = null;
    this.maxLevels = Infinity;
    this.itemActive = { calculator: false, timeShield: false, luckyCoin: false };
    Audio.correct();
    this.closeDifficulty();
    this.nextLevel();
  },

  startTutorial() {
    Audio.click();
    this.tutorialStep = 0;
    this.showScreen('tutorial-screen');
    this.updateTutorialDisplay();
  },
  
nextLevel() {
    this.hintUsed = false;
    this.generateLevel();
    this.showScreen('gameplay-screen');
    this.updateGameDisplay();
    this.startTimer();
  },

  showHint() {
    if (this.hintUsed || this.streak > 2) return;
    this.hintUsed = true;
    Audio.powerup();
    const hint = '💡 Hint: ' + this.totalHarga.toLocaleString('id-ID') + ' - ' + this.uangDiberikan.toLocaleString('id-ID') + ' = ?';
    this.showItemEffect(hint);
  },

  generateLevel() {
    const level = this.currentLevel;
    const diff = this.difficulties[this.difficulty];
    let numItems, maxPrice, priceStep;
    
    if (this.isEndless) {
      numItems = Math.min(2 + Math.floor(level / 5), 6);
      maxPrice = Math.min(10000 + level * 2000, 100000);
      priceStep = level < 10 ? 500 : level < 20 ? 100 : 50;
    } else if (level <= 3) {
      numItems = diff.maxItems;
      maxPrice = diff.maxPrice;
      priceStep = diff.priceStep;
    } else if (level <= 6) {
      numItems = Math.min(diff.maxItems + 1, 5);
      maxPrice = diff.maxPrice;
      priceStep = diff.priceStep;
    } else {
      numItems = Math.min(diff.maxItems + 1, 5);
      maxPrice = diff.maxPrice;
      priceStep = Math.max(diff.priceStep - 100, 100);
    }
    
    const selectedItems = [];
    const available = [...this.barang].sort(() => Math.random() - 0.5);
    
    for (let i = 0; i < numItems; i++) {
      const item = available[i];
      let price = Math.floor(item.harga / priceStep) * priceStep;
      if (price < priceStep) price = priceStep;
      if (price > maxPrice) price = maxPrice;
      selectedItems.push({ ...item, harga: price });
    }
    
    this.currentItems = selectedItems;
    const total = selectedItems.reduce((sum, item) => sum + item.harga, 0);
    this.totalHarga = total;
    
    let uangDiberikan;
    const minUang = Math.ceil(total / 1000) * 1000;
    const changeSteps = this.isEndless ? [1000, 2000, 5000, 10000] : 
                        this.difficulty === 'hard' ? [1000, 2000, 5000] :
                        this.difficulty === 'medium' ? [500, 1000, 2000] : [1000, 2000, 3000, 4000];
    uangDiberikan = minUang + changeSteps[Math.floor(Math.random() * changeSteps.length)];
    
    this.uangDiberikan = uangDiberikan;
    this.kembalianBenar = uangDiberikan - total;
    
    this.renderCart();
    
    const customerEl = document.getElementById('customer');
    customerEl.textContent = this.customers[Math.floor(Math.random() * this.customers.length)];
    
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
    const diff = this.difficulties[this.difficulty];
    this.timeLeft = this.itemActive.timeShield ? diff.time + 15 : diff.time;
    this.maxTime = this.timeLeft;
    
    if (this.itemActive.calculator) {
      this.showItemEffect('Kalkulator aktif! Kembalian: Rp ' + this.kembalianBenar.toLocaleString('id-ID'));
      Audio.powerup();
      setTimeout(() => this.checkAnswer(true), 500);
      return;
    }
    
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft -= 0.1;
      const percent = (this.timeLeft / this.maxTime) * 100;
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
    
    const oldStreak = this.streak;
    if (this.streak >= 9) {
      baseCoins *= 3;
    } else if (this.streak >= 4) {
      baseCoins *= 2;
    } else if (this.streak >= 2) {
      baseCoins *= 1.5;
    }
    
    if (oldStreak < 5 && oldStreak + 1 >= 5) Audio.streakMilestone();
    else if (oldStreak < 10 && oldStreak + 1 >= 10) Audio.streakMilestone();
    
    let totalCoins = Math.floor(baseCoins + speedBonus);
    totalCoins = Math.floor(totalCoins * this.bonusMultiplier);
    if (this.doubleCoinsActive) {
      totalCoins *= 2;
      this.doubleCoinsActive = false;
    }
    
    this.coins += totalCoins;
    this.streak++;
    if (this.streak > this.bestStreak) this.bestStreak = this.streak;
    
    this.saveData();
    this.checkAchievements();
    this.animateCoinGain(totalCoins);
    this.showResult(true, totalCoins);
  },
  
  animateCoinGain(amount) {
    const el = document.getElementById('game-coins');
    el.classList.add('coin-pop');
    setTimeout(() => el.classList.remove('coin-pop'), 300);
  },
  
  animateTransaction() {
    const cart = document.querySelector('.cart-area');
    const money = document.querySelector('.money-given');
    cart.classList.add('slide-out');
    money.classList.add('slide-in');
    setTimeout(() => {
      cart.classList.remove('slide-out');
      money.classList.remove('slide-in');
    }, 500);
  },
  
  wrongAnswer() {
    if (this.hasExtraLife) {
      this.hasExtraLife = false;
      this.showItemEffect('❤️ Extra Life melindungi streak!');
      Audio.powerup();
      this.nextLevel();
      return;
    }
    
    if (this.itemActive.autoSave) {
      this.showItemEffect('Auto Save! Streak tersimpan!');
      Audio.powerup();
      this.itemActive.autoSave = false;
    }
    
    if (this.skipLevelActive) {
      this.skipLevelActive = false;
      this.showItemEffect('🃏 Skip Level! Streak aman!');
      this.nextLevel();
      return;
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
    this.checkAchievements();
    document.getElementById('final-coins').textContent = this.coins;
    document.getElementById('best-streak').textContent = this.bestStreak;
    document.getElementById('final-level').textContent = this.isEndless ? this.currentLevel + '+' : this.maxLevels;
    this.showScreen('gameover-screen');
  },
  
  getStreakProgress() {
    let nextMilestone = 5;
    let currentMilestone = 0;
    if (this.streak >= 20) { nextMilestone = 30; currentMilestone = 20; }
    else if (this.streak >= 10) { nextMilestone = 20; currentMilestone = 10; }
    else if (this.streak >= 5) { nextMilestone = 10; currentMilestone = 5; }
    const progress = ((this.streak - currentMilestone) / (nextMilestone - currentMilestone)) * 100;
    return { progress: Math.min(progress, 100), next: nextMilestone, current: currentMilestone };
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
    const streakData = this.getStreakProgress();
    document.getElementById('streak-progress-fill').style.width = streakData.progress + '%';
    document.getElementById('streak-progress-text').textContent = '🔥 ' + this.streak + '/' + streakData.next;
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
  },

  showDifficulty() {
    Audio.click();
    this.showScreen('difficulty-screen');
  },

  closeDifficulty() {
    Audio.click();
    this.showScreen('main-menu');
  },

  showSoundToggle() {
    Audio.click();
    this.updateSoundDisplay();
    this.showScreen('sound-screen');
  },

  closeSound() {
    Audio.click();
    this.showScreen('main-menu');
  },

  toggleSound() {
    Audio.enabled = !Audio.enabled;
    if (Audio.enabled) {
      Audio.init();
      Audio.click();
    }
    this.updateSoundDisplay();
    localStorage.setItem('moneywise-sound', Audio.enabled);
  },

  updateSoundDisplay() {
    document.getElementById('sound-icon').textContent = Audio.enabled ? '🔊' : '🔇';
    document.getElementById('sound-status').textContent = Audio.enabled ? 'Nyala' : 'Mati';
  },

  nextTutorial() {
    Audio.click();
    this.tutorialStep++;
    if (this.tutorialStep >= this.tutorialSteps.length) {
      this.showScreen('main-menu');
      this.showItemEffect('Tutorial selesai! Selamat main!');
      return;
    }
    this.updateTutorialDisplay();
  },

  prevTutorial() {
    Audio.click();
    if (this.tutorialStep > 0) {
      this.tutorialStep--;
      this.updateTutorialDisplay();
    } else {
      this.showScreen('main-menu');
    }
  },

  updateTutorialDisplay() {
    const step = this.tutorialSteps[this.tutorialStep];
    document.getElementById('tutorial-title').textContent = step.title;
    document.getElementById('tutorial-desc').textContent = step.desc;
    document.getElementById('tutorial-current').textContent = this.tutorialStep + 1;
    document.getElementById('tutorial-total').textContent = this.tutorialSteps.length;
    document.getElementById('tutorial-prev').style.visibility = this.tutorialStep === 0 ? 'hidden' : 'visible';
    document.getElementById('tutorial-next').textContent = this.tutorialStep === this.tutorialSteps.length - 1 ? 'Mulai Main! 🎮' : 'Berikutnya ➡️';
  }
};

window.Game = Game;
window.startGame = (difficulty) => Game.startGame(difficulty);
window.startEndless = () => Game.startEndless();
window.startTutorial = () => Game.startTutorial();
window.nextTutorial = () => Game.nextTutorial();
window.prevTutorial = () => Game.prevTutorial();
window.showShop = () => Game.showShop();
window.showHelp = () => Game.showHelp();
window.closeShop = () => Game.closeShop();
window.closeHelp = () => Game.closeHelp();
window.showDifficulty = () => Game.showDifficulty();
window.closeDifficulty = () => Game.closeDifficulty();
window.showSoundToggle = () => Game.showSoundToggle();
window.closeSound = () => Game.closeSound();
window.toggleSound = () => Game.toggleSound();
window.checkAnswer = () => Game.checkAnswer();
window.skipLevel = () => Game.skipLevel();
window.continueLevel = () => {
  Game.currentLevel++;
  Game.nextLevel();
};
window.nextLevel = () => Game.nextLevel();
window.backToMenu = () => Game.backToMenu();
window.buyItem = (itemId) => Game.buyItem(itemId);
window.showAchievements = () => Game.showAchievements();
window.closeAchievements = () => {
  Audio.click();
  Game.showScreen('main-menu');
};
window.showRedeem = () => Game.showRedeem();
window.closeRedeem = () => Game.closeRedeem();
window.addEventListener('load', () => {
  const soundPref = localStorage.getItem('moneywise-sound');
  if (soundPref !== null) {
    Audio.enabled = soundPref === 'true';
  }
  Game.init();
});