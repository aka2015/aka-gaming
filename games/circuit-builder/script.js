const COMPONENTS = {
  battery:  { icon: '🔋', label: 'Battery',  inputs: [],        outputs: ['E'], isSource: true },
  lamp:     { icon: '💡', label: 'Lamp',     inputs: ['W'],      outputs: [],    isSink: true },
  wire:     { icon: '➡️',  label: 'Wire',     inputs: ['W'],      outputs: ['E'] },
  switchOn: { icon: '🔛', label: 'Switch ON', inputs: ['W'],     outputs: ['E'], togglable: true },
  andGate:  { icon: '&',  label: 'AND Gate', inputs: ['W','S'], outputs: ['E'] },
  orGate:   { icon: '≥1', label: 'OR Gate',  inputs: ['W','S'], outputs: ['E'] },
  notGate:  { icon: '!',  label: 'NOT Gate', inputs: ['W'],     outputs: ['E'] },
};

const DIR = { N: [-1,0], E: [0,1], S: [1,0], W: [0,-1] };

const LEVELS = [
  {
    id: 1, cols: 4, rows: 1,
    fixed: [
      [{ type: 'battery' }, null, null, { type: 'lamp' }]
    ],
    slots: [{ r: 0, c: 1 }, { r: 0, c: 2 }],
    available: ['wire'],
    targets: [{ r: 0, c: 3 }],
    goalText: 'Hubungkan baterai ke lampu!',
    hint: 'Letakkan kabel (➡️) di slot antara baterai dan lampu.',
  },
  {
    id: 2, cols: 5, rows: 1,
    fixed: [
      [{ type: 'battery' }, null, { type: 'switchOn' }, null, { type: 'lamp' }]
    ],
    slots: [{ r: 0, c: 1 }, { r: 0, c: 3 }],
    available: ['wire', 'wire'],
    targets: [{ r: 0, c: 4 }],
    goalText: 'Lengkapi rangkaian dengan saklar!',
    hint: 'Pasang kabel di kedua slot yang kosong.',
  },
  {
    id: 3, cols: 5, rows: 1,
    fixed: [
      [{ type: 'battery' }, null, null, null, { type: 'lamp' }]
    ],
    slots: [{ r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }],
    available: ['wire', 'wire', 'switchOn'],
    targets: [{ r: 0, c: 4 }],
    goalText: 'Gunakan saklar untuk mengontrol lampu!',
    hint: 'Kamu butuh kabel dan saklar ON untuk menghubungkan baterai ke lampu.',
  },
  {
    id: 4, cols: 6, rows: 2,
    fixed: [
      [{ type: 'battery' }, { type: 'switchOn' }, null, null, { type: 'lamp' }, null],
      [null,                { type: 'switchOn' }, null, null, null,              null]
    ],
    slots: [{ r: 0, c: 2 }, { r: 0, c: 3 }, { r: 1, c: 2 }, { r: 1, c: 3 }],
    available: ['wire', 'wire', 'wire', 'andGate'],
    targets: [{ r: 0, c: 4 }],
    goalText: 'Gunakan gerbang AND! Kedua saklar harus ON.',
    hint: 'AND Gate perlu dua input: dari kiri (saklar atas) dan dari bawah (saklar bawah).',
  },
  {
    id: 5, cols: 6, rows: 2,
    fixed: [
      [{ type: 'battery' }, { type: 'switchOn' }, null, null, { type: 'lamp' }, null],
      [null,                { type: 'switchOn' }, null, null, null,              null]
    ],
    slots: [{ r: 0, c: 2 }, { r: 0, c: 3 }, { r: 1, c: 2 }, { r: 1, c: 3 }],
    available: ['wire', 'wire', 'wire', 'orGate'],
    targets: [{ r: 0, c: 4 }],
    goalText: 'Gunakan gerbang OR! Salah satu saklar ON sudah cukup.',
    hint: 'OR Gate menyalakan lampu jika salah satu dari dua input menyala.',
  },
  {
    id: 6, cols: 5, rows: 1,
    fixed: [
      [{ type: 'battery' }, null, null, null, { type: 'lamp' }]
    ],
    slots: [{ r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }],
    available: ['wire', 'wire', 'notGate'],
    targets: [{ r: 0, c: 4 }],
    goalText: 'Gunakan NOT Gate untuk membalik sinyal!',
    hint: 'NOT Gate membalikkan input. Jika input ON, output OFF. Pastikan sinyal sampai ke lampu.',
  },
  {
    id: 7, cols: 6, rows: 2,
    fixed: [
      [{ type: 'battery' }, { type: 'switchOn' }, null, null, null, { type: 'lamp' }],
      [null,                null,                 null, null, null, null             ]
    ],
    slots: [{ r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 1, c: 2 }, { r: 1, c: 3 }],
    available: ['wire', 'wire', 'wire', 'wire', 'andGate'],
    targets: [{ r: 0, c: 5 }],
    goalText: 'Rangkaian AND dengan saklar input dari bawah!',
    hint: 'AND Gate di baris atas. Input utama dari kiri (via saklar), input kedua dari bawah.',
  },
  {
    id: 8, cols: 6, rows: 2,
    fixed: [
      [{ type: 'battery' }, { type: 'switchOn' }, null, null, null, null],
      [null,                null,                 null, null, null, null]
    ],
    slots: [{ r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 0, c: 5 }, { r: 1, c: 2 }, { r: 1, c: 3 }],
    available: ['wire', 'wire', 'wire', 'wire', 'lamp', 'andGate'],
    targets: [{ r: 0, c: 5 }],
    goalText: 'Pasang lampu di ujung! Rangkaian AND dengan input dari bawah.',
    hint: 'Lampu harus dipasang di slot terakhir. AND Gate di tengah dengan input dari kiri dan bawah.',
  },
  {
    id: 9, cols: 6, rows: 2,
    fixed: [
      [{ type: 'battery' }, null, null, null, null, null],
      [null,                null, null, null, null, null]
    ],
    slots: [
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 },
      { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }
    ],
    available: ['wire', 'wire', 'wire', 'wire', 'lamp', 'switchOn', 'switchOn', 'andGate', 'orGate', 'notGate'],
    targets: [{ r: 0, c: 5 }],
    goalText: 'Kombinasi bebas! Gunakan komponen yang ada untuk menyalakan lampu.',
    hint: 'Ada banyak solusi. Coba pakai AND/OR/NOT Gate dengan saklar sebagai input!',
  },
  {
    id: 10, cols: 7, rows: 2,
    fixed: [
      [{ type: 'battery' }, null, null, null, null, null, { type: 'lamp' }],
      [null,                null, null, null, null, null, null             ]
    ],
    slots: [
      { r: 0, c: 1 }, { r: 0, c: 2 }, { r: 0, c: 3 }, { r: 0, c: 4 }, { r: 0, c: 5 },
      { r: 1, c: 0 }, { r: 1, c: 1 }, { r: 1, c: 2 }, { r: 1, c: 3 }
    ],
    available: ['wire', 'wire', 'wire', 'wire', 'wire', 'switchOn', 'switchOn', 'andGate', 'orGate'],
    targets: [{ r: 0, c: 6 }],
    goalText: 'Boss! Rangkaian kompleks dengan dua gerbang logika.',
    hint: 'Gunakan 2 saklar sebagai input. AND + OR bisa digabung untuk tantangan maksimal!',
  },
];

const STORAGE_KEY = 'cb_progress_v1';

class CircuitBuilder {
  constructor() {
    this.level = 0;
    this.score = 0;
    this.stars = 0;
    this.totalLevels = LEVELS.length;
    this.grid = [];
    this.switchStates = {};
    this.selectedTool = null;
    this.isTesting = false;
    this.progress = this.loadProgress();

    this.$ = id => document.getElementById(id);

    this.$('start-btn').addEventListener('click', () => this.startGame());
    this.$('replay-btn').addEventListener('click', () => this.startGame());
    this.$('btn-test').addEventListener('click', () => this.testCircuit());
    this.$('btn-reset').addEventListener('click', () => this.resetLevel());
  }

  // ----- Progress -----

  loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return {};
  }

  saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress)); } catch (_) {}
  }

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ----- Game Flow -----

  startGame() {
    this.score = 0;
    this.stars = 0;
    this.level = 0;
    this.showScreen('game-screen');
    this.loadLevel();
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    this.$(id).classList.add('active');
  }

  loadLevel() {
    if (this.level >= this.totalLevels) {
      this.showResult();
      return;
    }

    this.isTesting = false;
    this.selectedTool = null;

    const data = LEVELS[this.level];
    const rows = data.rows;
    const cols = data.cols;

    // Build grid
    this.grid = [];
    this.switchStates = {};

    // Initialize all cells as null (inactive)
    for (let r = 0; r < rows; r++) {
      this.grid[r] = [];
      for (let c = 0; c < cols; c++) {
        this.grid[r][c] = null;
      }
    }

    // Place fixed components
    for (const slot of data.slots) {
      this.grid[slot.r][slot.c] = { type: null, fixed: false, powered: false, lit: false };
    }

    // Place fixed components
    if (data.fixed) {
      for (let r = 0; r < data.fixed.length && r < rows; r++) {
        for (let c = 0; c < data.fixed[r].length && c < cols; c++) {
          const cellDef = data.fixed[r][c];
          if (cellDef && cellDef.type) {
            const cell = { type: cellDef.type, fixed: true, powered: false, lit: false };
            this.grid[r][c] = cell;
            if (cellDef.type === 'switchOn') {
              this.switchStates[`${r},${c}`] = true;
            }
          }
        }
      }
    }

    this.$('level-num').textContent = `${this.level + 1}/${this.totalLevels}`;
    this.$('score').textContent = this.score;
    this.$('stars').textContent = this.stars;
    this.$('level-goal').textContent = data.goalText;
    this.$('power-text').textContent = 'Tekan TEST untuk menjalankan';

    const dot = this.$('power-dot');
    dot.className = 'power-dot';

    this.renderBoard();
    this.renderToolbox(data.available);
  }

  // ----- Rendering -----

  renderBoard() {
    const board = this.$('circuit-board');
    const data = LEVELS[this.level];
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${data.cols}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${data.rows}, 1fr)`;

    for (let r = 0; r < data.rows; r++) {
      for (let c = 0; c < data.cols; c++) {
        const cell = this.grid[r][c];
        const div = document.createElement('div');
        div.className = 'board-cell';
        div.dataset.r = r;
        div.dataset.c = c;

        if (cell) {
          if (cell.fixed) {
            div.classList.add('fixed');
          } else {
            div.classList.add('slot');
            div.addEventListener('click', () => this.onSlotClick(r, c));
          }

          if (cell.type) {
            const def = this.getComponentDef(cell.type);
            const icon = document.createElement('span');
            icon.className = 'cell-icon';
            icon.textContent = def ? def.icon : '?';
            div.appendChild(icon);

            if (cell.lit) {
              div.classList.add('lamp-lit');
            }
            if (cell.powered && !cell.isSink) {
              div.classList.add('powered');
            }

            if (def && def.togglable) {
              const isOn = this.switchStates[`${r},${c}`];
              div.classList.add(isOn ? 'switch-on' : 'switch-off');
              const toggle = document.createElement('span');
              toggle.className = 'cell-switch-toggle';
              toggle.textContent = isOn ? '🔛' : '🔴';
              toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleSwitch(r, c);
              });
              div.appendChild(toggle);
            }
          } else {
            const emptyIcon = document.createElement('span');
            emptyIcon.className = 'cell-empty-icon';
            emptyIcon.textContent = '+';
            div.appendChild(emptyIcon);
          }
        } else {
          div.style.visibility = 'hidden';
        }

        board.appendChild(div);
      }
    }
  }

  renderToolbox(available) {
    const toolbox = this.$('toolbox');
    toolbox.innerHTML = '';
    this.selectedTool = null;

    const counts = {};
    available.forEach(id => { counts[id] = (counts[id] || 0) + 1; });

    Object.entries(counts).forEach(([id, count]) => {
      const def = this.getComponentDef(id);
      if (!def) return;
      const item = document.createElement('div');
      item.className = 'tool-item';
      item.dataset.component = id;
      item.innerHTML = `
        <span class="tool-icon">${def.icon}</span>
        <span class="tool-label">${def.label}${count > 1 ? ` (${count})` : ''}</span>
      `;
      item.addEventListener('click', () => {
        if (this.selectedTool === id) {
          this.selectedTool = null;
          document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('selected'));
        } else {
          this.selectedTool = id;
          document.querySelectorAll('.tool-item').forEach(t => t.classList.remove('selected'));
          item.classList.add('selected');
        }
      });
      toolbox.appendChild(item);
    });
  }

  getComponentDef(type) {
    if (type === 'switch') return COMPONENTS.switchOn;
    return COMPONENTS[type];
  }

  // ----- Interaction -----

  onSlotClick(r, c) {
    if (this.isTesting) return;
    const cell = this.grid[r][c];
    if (!cell || cell.fixed) return;

    if (this.selectedTool) {
      const def = this.getComponentDef(this.selectedTool);
      if (!def) return;

      // Remove previous component from this slot
      if (cell.type) {
        this.returnComponent(cell.type);
      }

      cell.type = this.selectedTool;
      this.useComponent(this.selectedTool);
      this.clearTestState();
      this.renderBoard();
      this.renderToolbox(LEVELS[this.level].available);
    } else {
      // If slot has a component but no tool selected, remove it
      if (cell.type) {
        this.returnComponent(cell.type);
        cell.type = null;
        this.clearTestState();
        this.renderBoard();
        this.renderToolbox(LEVELS[this.level].available);
      }
    }
  }

  useComponent(id) {
    const data = LEVELS[this.level];
    const idx = data.available.indexOf(id);
    if (idx >= 0) {
      data.available.splice(idx, 1);
    }
    this.selectedTool = null;
  }

  returnComponent(id) {
    const data = LEVELS[this.level];
    data.available.push(id);
  }

  toggleSwitch(r, c) {
    if (this.isTesting) return;
    const key = `${r},${c}`;
    this.switchStates[key] = !this.switchStates[key];
    // Update cell type based on state
    const cell = this.grid[r][c];
    if (cell) {
      if (cell.type === 'switchOn' || cell.type === 'switch') {
        cell.type = this.switchStates[key] ? 'switchOn' : 'switch';
      } else {
        cell.type = this.switchStates[key] ? 'switchOn' : 'switch';
      }
    }
    this.clearTestState();
    this.renderBoard();
  }

  clearTestState() {
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < this.grid[r].length; c++) {
        const cell = this.grid[r][c];
        if (cell) {
          cell.powered = false;
          cell.lit = false;
        }
      }
    }
    this.isTesting = false;
    const dot = this.$('power-dot');
    dot.className = 'power-dot';
    this.$('power-text').textContent = 'Tekan TEST untuk menjalankan';
  }

  // ----- Circuit Simulation -----

  testCircuit() {
    if (this.isTesting) return;
    this.clearTestState();

    const data = LEVELS[this.level];
    const rows = this.grid.length;
    const cols = rows > 0 ? this.grid[0].length : 0;

    // Reset power states
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.grid[r][c];
        if (cell) {
          cell.powered = false;
          cell.lit = false;
        }
      }
    }

    // Step 1: Find and mark batteries
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = this.grid[r][c];
        if (cell && cell.type) {
          const def = this.getComponentDef(cell.type);
          if (def && def.isSource) {
            cell.powered = true;
          }
        }
      }
    }

    // Step 2: Propagate power (iterative until stable)
    let changed = true;
    let iterations = 0;
    while (changed && iterations < 50) {
      changed = false;
      iterations++;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = this.grid[r][c];
          if (!cell || !cell.type || cell.powered) continue;

          const def = this.getComponentDef(cell.type);
          if (!def) continue;

          // Check all inputs for power
          let hasPower = false;
          for (const inputDir of def.inputs) {
            const [dr, dc] = DIR[inputDir];
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              const neighbor = this.grid[nr][nc];
              if (neighbor && neighbor.powered) {
                let canPass = true;

                // For switches, check if they're ON
                const neighborDef = this.getComponentDef(neighbor.type);
                if (neighborDef && neighborDef.togglable) {
                  const key = `${nr},${nc}`;
                  if (!this.switchStates[key]) {
                    canPass = false;
                  }
                }

                // Check if neighbor has output toward this cell
                if (neighborDef && canPass) {
                  const reverseDir = { N: 'S', E: 'W', S: 'N', W: 'E' }[inputDir];
                  if (neighborDef.outputs.includes(reverseDir) || neighborDef.isSource) {
                    hasPower = true;
                    break;
                  }
                }
              }
            }
          }

          if (hasPower) {
            cell.powered = true;
            changed = true;

            // Check if lamp
            if (def.isSink) {
              cell.lit = true;
            }
          }
        }
      }
    }

    // Animate the result
    this.isTesting = true;
    this.renderBoard();

    // Check targets
    const allLit = data.targets.every(t => {
      const cell = this.grid[t.r] ? this.grid[t.r][t.c] : null;
      return cell && cell.lit;
    });

    const dot = this.$('power-dot');
    if (allLit) {
      dot.className = 'power-dot success';
      this.$('power-text').textContent = '✅ Lampu menyala! Rangkaian berhasil!';
      setTimeout(() => this.onLevelComplete(), 800);
    } else {
      dot.className = 'power-dot fail';
      this.$('power-text').textContent = '❌ Lampu tidak menyala. Coba perbaiki rangkaian!';
    }
  }

  // ----- Level Complete -----

  onLevelComplete() {
    const lvl = this.level + 1;
    const data = LEVELS[this.level];

    // Stars: 3 if solved with all available (efficient), fewer if extras unused
    const totalComponents = data.available.length + data.slots.filter(s => {
      const cell = this.grid[s.r]?.[s.c];
      return cell && cell.type !== null;
    }).length;
    const unused = data.available.length;
    const placed = totalComponents - unused;
    const optimalCount = data.slots.length;
    let earnedStars;
    if (placed <= optimalCount) earnedStars = 3;
    else if (placed <= optimalCount + 2) earnedStars = 2;
    else earnedStars = 1;

    const prev = this.progress[lvl];
    if (!prev || earnedStars > prev.stars) {
      this.progress[lvl] = { stars: earnedStars };
      this.saveProgress();
    }

    this.stars += earnedStars;
    const scoreGain = 100 + earnedStars * 50;
    this.score += scoreGain;

    this.$('score').textContent = this.score;
    this.$('stars').textContent = this.stars;

    // Show win overlay
    const overlay = document.createElement('div');
    overlay.className = 'overlay-win';
    overlay.innerHTML = `
      <div class="win-card">
        <div class="win-icon">🎉</div>
        <div class="win-title">Level ${lvl} Selesai!</div>
        <div class="win-score">+${scoreGain} pts</div>
        <div class="big-stars">${'⭐'.repeat(earnedStars)}${'☆'.repeat(3 - earnedStars)}</div>
        <button class="btn-next" id="win-next">${this.level + 1 >= this.totalLevels ? 'Lihat Hasil 🏆' : 'Level Berikutnya ➡️'}</button>
      </div>
    `;

    const btnNext = overlay.querySelector('#win-next');
    btnNext.style.cssText = `
      display: inline-block; padding: 14px 36px; border: none; border-radius: 16px;
      background: linear-gradient(135deg, #00b894, #00a381); color: white;
      font-size: 18px; font-weight: 700; font-family: inherit; cursor: pointer;
      box-shadow: 0 6px 20px rgba(0, 184, 148, 0.45); margin-top: 16px;
    `;

    btnNext.addEventListener('click', () => {
      overlay.remove();
      this.level++;
      this.loadLevel();
    });

    document.body.appendChild(overlay);
  }

  resetLevel() {
    if (this.isTesting) {
      // Just clear test state
      this.clearTestState();
      this.renderBoard();
      return;
    }

    // Full reset - reload level
    const data = LEVELS[this.level];
    // Reset available components
    const originalTotal = data.optimal;
    // Count currently placed
    let placed = 0;
    for (let r = 0; r < this.grid.length; r++) {
      for (let c = 0; c < (this.grid[r] || []).length; c++) {
        const cell = this.grid[r][c];
        if (cell && !cell.fixed && cell.type) placed++;
      }
    }
    // Reset
    this.loadLevel();
  }

  // ----- Result -----

  showResult() {
    this.$('result-icon').textContent = '🏆';
    this.$('result-title').textContent = 'Circuit Completed!';
    this.$('result-sub').textContent = `Kamu menyelesaikan ${this.totalLevels} level!`;
    this.$('final-score').textContent = this.score;
    this.$('final-stars').textContent = this.stars;
    this.$('final-level').textContent = `${this.totalLevels}/${this.totalLevels}`;
    this.showScreen('result-screen');

    if (window.AkaScoreReporter) {
      window.AkaScoreReporter.report('circuit-builder', this.score, {
        stars: this.stars, levelsCompleted: this.totalLevels
      });
    }
  }
}

new CircuitBuilder();