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
    try {
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
    } catch (e) {}
  },

  click() { this.playTone(800, 0.05, 'sine', 0.2); },

  forward() {
    this.playTone(523, 0.08, 'square', 0.15);
    setTimeout(() => this.playTone(659, 0.08, 'square', 0.15), 50);
  },

  turn() { this.playTone(440, 0.08, 'sine', 0.2); },

  success() {
    this.playTone(523, 0.15, 'sine', 0.3);
    setTimeout(() => this.playTone(659, 0.15, 'sine', 0.3), 100);
    setTimeout(() => this.playTone(784, 0.15, 'sine', 0.3), 200);
    setTimeout(() => this.playTone(1047, 0.3, 'sine', 0.35), 300);
  },

  fail() {
    this.playTone(300, 0.2, 'square', 0.25);
    setTimeout(() => this.playTone(200, 0.3, 'square', 0.2), 200);
  },

  star() {
    this.playTone(880, 0.1, 'triangle', 0.25);
    setTimeout(() => this.playTone(1100, 0.1, 'triangle', 0.25), 100);
    setTimeout(() => this.playTone(1320, 0.15, 'triangle', 0.3), 200);
  },

  levelComplete() {
    const notes = [523, 659, 784, 880, 1047, 1175, 1319, 1568];
    notes.forEach((note, i) => {
      setTimeout(() => this.playTone(note, 0.15, 'sine', 0.2), i * 100);
    });
  },

  commandAdd() {
    this.playTone(600, 0.06, 'sine', 0.2);
  },

  commandRemove() {
    this.playTone(400, 0.06, 'sine', 0.15);
  },

  buttonHover() { this.playTone(1000, 0.03, 'sine', 0.1); },

  toggle() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
      this.click();
    }
    return this.enabled;
  }
};

const Game = {
  currentLevel: 1,
  totalLevels: 15,
  commands: [],
  robotPos: { x: 0, y: 0 },
  robotDir: 0,
  goalPos: { x: 0, y: 0 },
  maze: [],
  mazeSize: { rows: 0, cols: 0 },
  isRunning: false,
  completedLevels: {},
  levelStars: {},
  direction: [
    { x: 0, y: -1 },
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 }
  ],

  levels: [
    {
      maze: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 3, y: 3 },
      optimal: 4
    },
    {
      maze: [
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 3, y: 1 },
      optimal: 2
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 4, y: 4 },
      optimal: 8
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 1, 1, 0, 1, 1],
        [1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 3, y: 3 },
      optimal: 6
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 5, y: 4 },
      optimal: 10
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 4, y: 4 },
      optimal: 6
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 5, y: 5 },
      optimal: 8
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 3, y: 3 },
      optimal: 4
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 5, y: 5 },
      optimal: 14
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 6, y: 6 },
      optimal: 12
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 3, y: 3 },
      goal: { x: 1, y: 1 },
      optimal: 4
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 1],
        [1, 1, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 5, y: 5 },
      goal: { x: 1, y: 1 },
      optimal: 12
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 6, y: 6 },
      optimal: 14
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 1],
        [1, 0, 0, 0, 1, 0, 0, 1],
        [1, 1, 0, 0, 0, 0, 1, 1],
        [1, 0, 0, 1, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 6, y: 6 },
      optimal: 16
    },
    {
      maze: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 0, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
      ],
      start: { x: 1, y: 1 },
      goal: { x: 7, y: 7 },
      optimal: 14
    }
  ],

  init() {
    this.loadData();
    this.setupAudio();
    this.updateDisplay();
    this.hideLoading();
    this.renderLevelSelect();
  },

  setupAudio() {
    const savedPref = localStorage.getItem('robotbuilder-sound');
    if (savedPref !== null) {
      Audio.enabled = savedPref === 'true';
    }
    document.getElementById('btn-sound').textContent = Audio.enabled ? '🔊 Suara' : '🔇 Suara Mati';
    document.addEventListener('click', () => Audio.init(), { once: true });
  },

  loadData() {
    const saved = localStorage.getItem('robotbuilder-data');
    if (saved) {
      const data = JSON.parse(saved);
      this.completedLevels = data.completedLevels || {};
      this.levelStars = data.levelStars || {};
    }
  },

  saveData() {
    localStorage.setItem('robotbuilder-data', JSON.stringify({
      completedLevels: this.completedLevels,
      levelStars: this.levelStars
    }));
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

  updateDisplay() {
    const completedCount = Object.keys(this.completedLevels).length;
    document.getElementById('total-levels').textContent = completedCount;
    
    let totalStars = 0;
    Object.values(this.levelStars).forEach(stars => totalStars += stars);
    document.getElementById('total-stars').textContent = totalStars;
  },

  showLevelSelect() {
    this.renderLevelSelect();
    this.showScreen('level-screen');
  },

  closeLevelSelect() {
    this.showScreen('main-menu');
  },

  renderLevelSelect() {
    const container = document.getElementById('levels-grid');
    container.innerHTML = '';
    
    for (let i = 1; i <= this.totalLevels; i++) {
      const card = document.createElement('div');
      const isCompleted = this.completedLevels[i];
      const stars = this.levelStars[i] || 0;
      const isUnlocked = i === 1 || this.completedLevels[i - 1];
      
      card.className = 'level-card';
      if (isCompleted) card.classList.add('completed');
      if (!isUnlocked) card.classList.add('locked');
      
      if (isUnlocked) {
        card.innerHTML = `
          <div class="level-number">${i}</div>
          <div class="level-stars">${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</div>
        `;
        card.onclick = () => this.startLevel(i);
      } else {
        card.innerHTML = `
          <div class="level-lock">🔒</div>
        `;
      }
      
      container.appendChild(card);
    }
  },

  showHelp() {
    this.showScreen('help-screen');
  },

  closeHelp() {
    this.showScreen('main-menu');
  },

  startLevel(level) {
    this.currentLevel = level;
    this.commands = [];
    this.isRunning = false;
    
    const levelData = this.levels[level - 1];
    this.maze = levelData.maze;
    this.mazeSize.rows = this.maze.length;
    this.mazeSize.cols = this.maze[0].length;
    this.robotPos = { ...levelData.start };
    this.goalPos = { ...levelData.goal };
    this.robotDir = 1;
    
    this.renderMaze();
    this.renderCommands();
    this.updateGameDisplay();
    this.showScreen('gameplay-screen');
  },

  renderMaze() {
    const grid = document.getElementById('maze-grid');
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${this.mazeSize.cols}, 50px)`;
    
    for (let y = 0; y < this.mazeSize.rows; y++) {
      for (let x = 0; x < this.mazeSize.cols; x++) {
        const cell = document.createElement('div');
        cell.className = 'maze-cell';
        cell.id = `cell-${x}-${y}`;
        
        if (this.maze[y][x] === 1) {
          cell.classList.add('wall');
        } else {
          cell.classList.add('path');
        }
        
        grid.appendChild(cell);
      }
    }
    
    this.updateRobotPosition();
    this.updateGoalPosition();
  },

  updateRobotPosition() {
    const robot = document.getElementById('robot');
    const cellSize = 52;
    const offsetX = this.robotPos.x * cellSize + 25 - 16;
    const offsetY = this.robotPos.y * cellSize + 25 - 16;
    
    robot.style.left = `${offsetX + 10}px`;
    robot.style.top = `${offsetY + 10}px`;
    robot.style.transform = `rotate(${this.robotDir * 90}deg)`;
  },

  updateGoalPosition() {
    const goal = document.getElementById('goal-marker');
    const cellSize = 52;
    const offsetX = this.goalPos.x * cellSize + 25 - 14;
    const offsetY = this.goalPos.y * cellSize + 25 - 14;
    
    goal.style.left = `${offsetX + 10}px`;
    goal.style.top = `${offsetY + 10}px`;
  },

  updateGameDisplay() {
    document.getElementById('current-level').textContent = this.currentLevel;
    document.getElementById('move-count').textContent = this.commands.length;
    this.updateStarPreview();
  },

  updateStarPreview() {
    const levelData = this.levels[this.currentLevel - 1];
    const optimal = levelData.optimal;
    const moves = this.commands.length;
    
    let stars = 0;
    if (moves <= optimal) stars = 3;
    else if (moves <= optimal + 2) stars = 2;
    else if (moves <= optimal + 4) stars = 1;
    
    document.getElementById('star-preview').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
  },

addCommand(type) {
    if (this.isRunning) return;

    this.commands.push(type);
    this.renderCommands();
    this.updateGameDisplay();
    Audio.commandAdd();
  },

  clearCommands() {
    if (this.isRunning) return;

    this.commands = [];
    this.renderCommands();
    this.updateGameDisplay();
    this.resetRobotPosition();
    Audio.click();
  },

  undoCommand() {
    if (this.isRunning || this.commands.length === 0) return;

    this.commands.pop();
    this.renderCommands();
    this.updateGameDisplay();
    if (this.commands.length === 0) {
      this.resetRobotPosition();
    }
    Audio.commandRemove();
  },

  clearCommands() {
    if (this.isRunning) return;
    
    this.commands = [];
    this.renderCommands();
    this.updateGameDisplay();
    this.resetRobotPosition();
    this.playClick();
  },

  undoCommand() {
    if (this.isRunning || this.commands.length === 0) return;
    
    this.commands.pop();
    this.renderCommands();
    this.updateGameDisplay();
    this.resetRobotPosition();
    this.playClick();
  },

  renderCommands() {
    const container = document.getElementById('command-blocks');
    const codeText = document.getElementById('code-text');
    
    if (this.commands.length === 0) {
      container.innerHTML = '<span style="color: #9CA3AF; font-size: 14px;">Klik tombol untuk menambah perintah</span>';
      codeText.textContent = '_';
      return;
    }
    
    container.innerHTML = this.commands.map((cmd, i) => {
      const icons = { forward: '⬆️', left: '⬅️', right: '➡️' };
      return `<div class="command-block" onclick="Game.removeCommand(${i})">${icons[cmd]} ${cmd}</div>`;
    }).join('');
    
    codeText.textContent = this.commands.map(c => c === 'forward' ? '▲' : c === 'left' ? '◀' : '▶').join(' ');
  },

  removeCommand(index) {
    if (this.isRunning) return;
    
    this.commands.splice(index, 1);
    this.renderCommands();
    this.updateGameDisplay();
    if (index === this.commands.length) {
      this.resetRobotPosition();
    }
  },

  resetRobotPosition() {
    const levelData = this.levels[this.currentLevel - 1];
    this.robotPos = { ...levelData.start };
    this.robotDir = 1;
    this.updateRobotPosition();
  },

  async runProgram() {
    if (this.isRunning || this.commands.length === 0) return;
    
    this.isRunning = true;
    this.resetRobotPosition();
    
    for (let i = 0; i < this.commands.length; i++) {
      await this.executeCommand(this.commands[i], i * 500);
      
      if (this.robotPos.x === this.goalPos.x && this.robotPos.y === this.goalPos.y) {
        this.onLevelComplete();
        return;
      }
    }
    
    this.onLevelFailed();
  },

  executeCommand(cmd, delay) {
    return new Promise(resolve => {
      setTimeout(() => {
        if (cmd === 'forward') {
          Audio.forward();
          const newX = this.robotPos.x + this.direction[this.robotDir].x;
          const newY = this.robotPos.y + this.direction[this.robotDir].y;

          if (newX >= 0 && newX < this.mazeSize.cols &&
              newY >= 0 && newY < this.mazeSize.rows &&
              this.maze[newY][newX] === 0) {
            this.robotPos.x = newX;
            this.robotPos.y = newY;
          }
        } else if (cmd === 'left') {
          Audio.turn();
          this.robotDir = (this.robotDir + 3) % 4;
        } else if (cmd === 'right') {
          Audio.turn();
          this.robotDir = (this.robotDir + 1) % 4;
        }

        this.updateRobotPosition();
        this.highlightPath(this.robotPos.x, this.robotPos.y);
        resolve();
      }, delay);
    });
  },

  highlightPath(x, y) {
    const cell = document.getElementById(`cell-${x}-${y}`);
    if (cell) {
      cell.classList.add('robot-path');
    }
  },

  onLevelComplete() {
    this.isRunning = false;

    const levelData = this.levels[this.currentLevel - 1];
    const optimal = levelData.optimal;
    const moves = this.commands.length;

    let stars = 0;
    if (moves <= optimal) stars = 3;
    else if (moves <= optimal + 2) stars = 2;
    else if (moves <= optimal + 4) stars = 1;

    this.completedLevels[this.currentLevel] = true;
    if (!this.levelStars[this.currentLevel] || this.levelStars[this.currentLevel] < stars) {
      this.levelStars[this.currentLevel] = stars;
    }

    this.saveData();
    this.updateDisplay();

    document.getElementById('result-icon').textContent = '✓';
    document.getElementById('result-icon').className = 'result-icon success';
    document.getElementById('result-title').textContent = 'Berhasil!';
    document.getElementById('result-message').textContent = 'Robot sampai di tujuan!';
    document.getElementById('result-stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
    document.getElementById('result-moves').textContent = moves;
    document.getElementById('result-optimal').textContent = optimal;

    const nextBtn = document.querySelector('#result-screen .btn-primary');
    if (this.currentLevel >= this.totalLevels) {
      nextBtn.textContent = '🎉 Semua Level Selesai!';
      nextBtn.onclick = () => this.backToMenu();
    } else {
      nextBtn.textContent = 'Level Berikutnya ➡️';
      nextBtn.onclick = () => this.nextLevel();
    }

    Audio.levelComplete();
    setTimeout(() => {
      for (let i = 0; i < stars; i++) {
        setTimeout(() => Audio.star(), i * 300);
      }
    }, 600);
    this.showScreen('result-screen');
  },

  onLevelFailed() {
    this.isRunning = false;

    document.getElementById('result-icon').textContent = '✗';
    document.getElementById('result-icon').className = 'result-icon fail';
    document.getElementById('result-title').textContent = 'Gagal!';
    document.getElementById('result-message').textContent = 'Robot belum sampai di tujuan';
    document.getElementById('result-stars').textContent = '💔';
    document.getElementById('result-moves').textContent = this.commands.length;
    document.getElementById('result-optimal').textContent = this.levels[this.currentLevel - 1].optimal;

    const nextBtn = document.querySelector('#result-screen .btn-primary');
    nextBtn.textContent = '🔄 Coba Lagi';
    nextBtn.onclick = () => this.resetLevel();

    Audio.fail();
    this.showScreen('result-screen');
  },

  nextLevel() {
    if (this.currentLevel < this.totalLevels) {
      this.startLevel(this.currentLevel + 1);
    } else {
      this.backToMenu();
    }
  },

  resetLevel() {
    this.commands = [];
    this.isRunning = false;
    this.startLevel(this.currentLevel);
  },

  backToMenu() {
    this.showScreen('main-menu');
    this.renderLevelSelect();
    this.updateDisplay();
  },

  playClick() { Audio.click(); },
  playSuccess() { Audio.success(); },
  playError() { Audio.fail(); }
};

window.Game = Game;
window.showLevelSelect = () => Game.showLevelSelect();
window.closeLevelSelect = () => Game.closeLevelSelect();
window.showHelp = () => Game.showHelp();
window.closeHelp = () => Game.closeHelp();
window.addCommand = (cmd) => Game.addCommand(cmd);
window.clearCommands = () => Game.clearCommands();
window.undoCommand = () => Game.undoCommand();
window.runProgram = () => Game.runProgram();
window.resetLevel = () => Game.resetLevel();
window.nextLevel = () => Game.nextLevel();
window.backToMenu = () => Game.backToMenu();
window.removeCommand = (index) => Game.removeCommand(index);
window.toggleSound = () => {
  const enabled = Audio.toggle();
  document.getElementById('btn-sound').textContent = enabled ? '🔊 Suara' : '🔇 Suara Mati';
  localStorage.setItem('robotbuilder-sound', enabled);
};
window.addEventListener('load', () => Game.init());