#!/bin/bash
# =====================================================
# Tower Defense Pro - Copy-Paste Deployment
# Paste this ENTIRE script into VPS terminal
# =====================================================

echo "🚀 Deploying Tower Defense Pro..."

# 1. Create game directory
mkdir -p /var/www/games/tower-defense-pro

# 2. Create index.html (complete tower defense game)
cat > /var/www/games/tower-defense-pro/index.html << 'HTMLEOF'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Tower Defense Pro</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #1a1a2e; display: flex; justify-content: center; align-items: center; min-height: 100vh; font-family: Arial, sans-serif; }
  #game-container { display: flex; gap: 10px; }
  #gameCanvas { border: 3px solid #4a4a6a; border-radius: 8px; background: #2d2d44; }
  #sidebar { width: 180px; background: #2d2d44; border-radius: 8px; padding: 10px; color: white; }
  .tower-btn { width: 100%; padding: 8px; margin: 5px 0; border: 2px solid #4a4a6a; border-radius: 6px; background: #1a1a2e; color: white; cursor: pointer; font-size: 12px; text-align: left; }
  .tower-btn:hover { border-color: #6a6a9a; }
  .tower-btn.selected { border-color: #ffd700; background: #3a3a5a; }
  .tower-btn .icon { font-size: 20px; }
  .tower-btn .name { font-weight: bold; }
  .tower-btn .cost { color: #ffd700; }
  .tower-btn .damage { color: #ff6b6b; }
  #stats { margin-top: 10px; padding: 10px; background: #1a1a2e; border-radius: 6px; }
  #stats div { margin: 3px 0; font-size: 12px; }
  #wave-btn { width: 100%; padding: 10px; margin-top: 10px; background: #4a9; border: none; border-radius: 6px; color: white; cursor: pointer; font-weight: bold; }
  #wave-btn:hover { background: #5ba; }
  #wave-btn:disabled { background: #666; cursor: not-allowed; }
  #game-over { display: none; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: rgba(0,0,0,0.9); padding: 30px; border-radius: 10px; text-align: center; color: white; }
  #game-over h2 { color: #ff6b6b; margin-bottom: 10px; }
  #restart-btn { padding: 10px 20px; background: #4a9; border: none; border-radius: 6px; color: white; cursor: pointer; font-size: 16px; }
</style>
</head>
<body>
<div id="game-container">
  <canvas id="gameCanvas" width="640" height="480"></canvas>
  <div id="sidebar">
    <h3 style="text-align:center;margin-bottom:10px;">🗼 Towers</h3>
    <button class="tower-btn" data-type="archery">
      <div class="icon"></div>
      <div class="name">Archery</div>
      <div class="cost">💰 50</div>
      <div class="damage">️ Fast, Low dmg</div>
    </button>
    <button class="tower-btn" data-type="cannon">
      <div class="icon"></div>
      <div class="name">Cannon</div>
      <div class="cost"> 100</div>
      <div class="damage">⚔️ Slow, High dmg</div>
    </button>
    <button class="tower-btn" data-type="ice">
      <div class="icon">❄️</div>
      <div class="name">Ice</div>
      <div class="cost">💰 75</div>
      <div class="damage">️ Slows enemies</div>
    </button>
    <button class="tower-btn" data-type="magic">
      <div class="icon">✨</div>
      <div class="name">Magic</div>
      <div class="cost">💰 150</div>
      <div class="damage">️ Splash damage</div>
    </button>
    <div id="stats">
      <div>❤️ Lives: <span id="lives">20</span></div>
      <div>💰 Gold: <span id="gold">200</span></div>
      <div>🌊 Wave: <span id="wave">0</span></div>
      <div> Enemies: <span id="enemies">0</span></div>
    </div>
    <button id="wave-btn">Start Wave</button>
  </div>
</div>
<div id="game-over">
  <h2>Game Over!</h2>
  <p>You survived <span id="final-wave">0</span> waves</p>
  <button id="restart-btn">Play Again</button>
</div>

<script>
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let game = {
  lives: 20, gold: 200, wave: 0, enemies: [], towers: [],
  projectiles: [], particles: [], selectedTowerType: null,
  waveActive: false, gameOver: false, frameCount: 0
};

const path = [
  {x: 0, y: 240}, {x: 100, y: 240}, {x: 100, y: 100}, {x: 300, y: 100},
  {x: 300, y: 380}, {x: 500, y: 380}, {x: 500, y: 240}, {x: 640, y: 240}
];

const towerDefs = {
  archery: { cost: 50, range: 120, damage: 10, fireRate: 30, color: '#4a9', projectileColor: '#6cf', projectileSpeed: 8 },
  cannon: { cost: 100, range: 100, damage: 40, fireRate: 90, color: '#a44', projectileColor: '#f66', projectileSpeed: 5 },
  ice: { cost: 75, range: 110, damage: 5, fireRate: 45, color: '#4af', projectileColor: '#8df', projectileSpeed: 6, slow: true },
  magic: { cost: 150, range: 130, damage: 25, fireRate: 60, color: '#a4a', projectileColor: '#f8f', projectileSpeed: 7, splash: true }
};

class Enemy {
  constructor(type, wave) {
    this.type = type;
    this.pathIndex = 0;
    this.x = path[0].x;
    this.y = path[0].y;
    this.hp = type === 'boss' ? 200 + wave * 50 : type === 'fast' ? 30 + wave * 10 : 60 + wave * 15;
    this.maxHp = this.hp;
    this.speed = type === 'fast' ? 2.5 : type === 'boss' ? 0.8 : 1.5;
    this.baseSpeed = this.speed;
    this.radius = type === 'boss' ? 18 : type === 'fast' ? 10 : 14;
    this.color = type === 'boss' ? '#f00' : type === 'fast' ? '#0f0' : '#ff0';
    this.reward = type === 'boss' ? 50 : type === 'fast' ? 10 : 20;
    this.slowTimer = 0;
  }
  
  update() {
    if (this.slowTimer > 0) {
      this.speed = this.baseSpeed * 0.5;
      this.slowTimer--;
    } else {
      this.speed = this.baseSpeed;
    }
    
    const target = path[this.pathIndex + 1];
    if (!target) return true;
    
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < this.speed) {
      this.x = target.x;
      this.y = target.y;
      this.pathIndex++;
      if (this.pathIndex >= path.length - 1) return true;
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
    return false;
  }
  
  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    
    const barWidth = this.radius * 2;
    const barHeight = 4;
    ctx.fillStyle = '#333';
    ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth, barHeight);
    ctx.fillStyle = '#0f0';
    ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth * (this.hp / this.maxHp), barHeight);
    
    if (this.slowTimer > 0) {
      ctx.strokeStyle = '#8df';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
  
  takeDamage(dmg) {
    this.hp -= dmg;
    return this.hp <= 0;
  }
}

class Tower {
  constructor(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.def = towerDefs[type];
    this.fireTimer = 0;
    this.angle = 0;
  }
  
  update() {
    this.fireTimer++;
    
    let target = null;
    let minDist = Infinity;
    
    for (const enemy of game.enemies) {
      const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
      if (dist <= this.def.range && dist < minDist) {
        minDist = dist;
        target = enemy;
      }
    }
    
    if (target) {
      this.angle = Math.atan2(target.y - this.y, target.x - this.x);
      
      if (this.fireTimer >= this.def.fireRate) {
        this.fireTimer = 0;
        game.projectiles.push(new Projectile(this.x, this.y, target, this.def));
      }
    }
  }
  
  draw() {
    if (game.selectedTowerType === this.type) {
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.def.range, 0, Math.PI * 2);
      ctx.stroke();
    }
    
    ctx.fillStyle = this.def.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const icons = { archery: '🏹', cannon: '💣', ice: '❄️', magic: '✨' };
    ctx.fillText(icons[this.type], this.x, this.y);
  }
}

class Projectile {
  constructor(x, y, target, def) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.def = def;
    this.speed = def.projectileSpeed;
    this.active = true;
  }
  
  update() {
    if (!this.target || this.target.hp <= 0) {
      this.active = false;
      return;
    }
    
    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist < this.speed) {
      this.hit();
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
  }
  
  hit() {
    this.active = false;
    
    if (this.def.splash) {
      for (const enemy of game.enemies) {
        const dist = Math.hypot(enemy.x - this.target.x, enemy.y - this.target.y);
        if (dist < 50) {
          if (enemy.takeDamage(this.def.damage * (1 - dist/50))) {
            game.gold += enemy.reward;
            game.enemies = game.enemies.filter(e => e !== enemy);
          }
        }
      }
    } else {
      if (this.target.takeDamage(this.def.damage)) {
        game.gold += this.target.reward;
        game.enemies = game.enemies.filter(e => e !== this.target);
      }
    }
    
    if (this.def.slow && this.target.hp > 0) {
      this.target.slowTimer = 60;
    }
    
    for (let i = 0; i < 5; i++) {
      game.particles.push({
        x: this.x, y: this.y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        life: 20,
        color: this.def.projectileColor
      });
    }
  }
  
  draw() {
    ctx.fillStyle = this.def.projectileColor;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPath() {
  ctx.strokeStyle = '#4a4a6a';
  ctx.lineWidth = 40;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.stroke();
  
  ctx.strokeStyle = '#3a3a5a';
  ctx.lineWidth = 36;
  ctx.beginPath();
  ctx.moveTo(path[0].x, path[0].y);
  for (let i = 1; i < path.length; i++) {
    ctx.lineTo(path[i].x, path[i].y);
  }
  ctx.stroke();
}

function spawnWave() {
  if (game.waveActive || game.gameOver) return;
  
  game.wave++;
  game.waveActive = true;
  
  const enemyCount = 5 + game.wave * 2;
  let spawned = 0;
  
  const spawnInterval = setInterval(() => {
    if (spawned >= enemyCount) {
      clearInterval(spawnInterval);
      return;
    }
    
    let type = 'normal';
    if (game.wave >= 3 && Math.random() < 0.3) type = 'fast';
    if (game.wave >= 5 && spawned === enemyCount - 1) type = 'boss';
    
    game.enemies.push(new Enemy(type, game.wave));
    spawned++;
  }, 800);
}

function gameLoop() {
  if (game.gameOver) return;
  
  game.frameCount++;
  
  ctx.fillStyle = '#2d2d44';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  drawPath();
  
  for (const tower of game.towers) {
    tower.update();
    tower.draw();
  }
  
  for (let i = game.enemies.length - 1; i >= 0; i--) {
    const enemy = game.enemies[i];
    if (enemy.update()) {
      game.lives--;
      game.enemies.splice(i, 1);
      if (game.lives <= 0) {
        game.gameOver = true;
        document.getElementById('game-over').style.display = 'block';
        document.getElementById('final-wave').textContent = game.wave;
      }
    } else {
      enemy.draw();
    }
  }
  
  for (let i = game.projectiles.length - 1; i >= 0; i--) {
    const proj = game.projectiles[i];
    proj.update();
    if (proj.active) {
      proj.draw();
    } else {
      game.projectiles.splice(i, 1);
    }
  }
  
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const p = game.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;
    if (p.life <= 0) {
      game.particles.splice(i, 1);
    } else {
      ctx.globalAlpha = p.life / 20;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x - 2, p.y - 2, 4, 4);
      ctx.globalAlpha = 1;
    }
  }
  
  if (game.waveActive && game.enemies.length === 0) {
    game.waveActive = false;
    document.getElementById('wave-btn').disabled = false;
  }
  
  document.getElementById('lives').textContent = game.lives;
  document.getElementById('gold').textContent = game.gold;
  document.getElementById('wave').textContent = game.wave;
  document.getElementById('enemies').textContent = game.enemies.length;
  
  requestAnimationFrame(gameLoop);
}

document.querySelectorAll('.tower-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tower-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    game.selectedTowerType = btn.dataset.type;
  });
});

canvas.addEventListener('click', (e) => {
  if (!game.selectedTowerType) return;
  
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  
  const def = towerDefs[game.selectedTowerType];
  if (game.gold < def.cost) return;
  
  for (let i = 0; i < path.length - 1; i++) {
    const p1 = path[i];
    const p2 = path[i + 1];
    const dist = pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y);
    if (dist < 30) return;
  }
  
  for (const tower of game.towers) {
    if (Math.hypot(tower.x - x, tower.y - y) < 40) return;
  }
  
  game.towers.push(new Tower(game.selectedTowerType, x, y));
  game.gold -= def.cost;
});

function pointToSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return Math.hypot(px - x1, py - y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

document.getElementById('wave-btn').addEventListener('click', () => {
  spawnWave();
  document.getElementById('wave-btn').disabled = true;
});

document.getElementById('restart-btn').addEventListener('click', () => {
  game = {
    lives: 20, gold: 200, wave: 0, enemies: [], towers: [],
    projectiles: [], particles: [], selectedTowerType: null,
    waveActive: false, gameOver: false, frameCount: 0
  };
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('wave-btn').disabled = false;
  gameLoop();
});

gameLoop();
</script>
</body>
</html>
HTMLEOF

# 3. Create info.json
cat > /var/www/games/tower-defense-pro/info.json << 'JSONEOF'
{
  "id": "tower-defense-pro",
  "name": "Tower Defense Pro",
  "description": "Defend your base with 4 unique towers! Archery, Cannon, Ice, and Magic towers.",
  "category": "strategy",
  "badge": "🗼",
  "gameFile": "index.html",
  "thumbnail": "thumbnail.svg",
  "createdAt": "2026-05-21",
  "author": "AKA Gaming"
}
JSONEOF

# 4. Create thumbnail.svg
cat > /var/www/games/tower-defense-pro/thumbnail.svg << 'SVGEOF'
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200" viewBox="0 0 320 200">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#2d2d44"/>
      <stop offset="100%" style="stop-color:#1a1a2e"/>
    </linearGradient>
  </defs>
  <rect width="320" height="200" fill="url(#bg)"/>
  <path d="M 0 100 L 80 100 L 80 40 L 160 40 L 160 160 L 240 160 L 240 100 L 320 100" stroke="#4a4a6a" stroke-width="20" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M 0 100 L 80 100 L 80 40 L 160 40 L 160 160 L 240 160 L 240 100 L 320 100" stroke="#2d2d44" stroke-width="16" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="80" cy="100" r="15" fill="#4a9"/>
  <circle cx="160" cy="40" r="15" fill="#a44"/>
  <circle cx="160" cy="160" r="15" fill="#4af"/>
  <circle cx="240" cy="100" r="15" fill="#a4a"/>
  <text x="80" y="105" text-anchor="middle" fill="white" font-size="14"></text>
  <text x="160" y="45" text-anchor="middle" fill="white" font-size="14"></text>
  <text x="160" y="165" text-anchor="middle" fill="white" font-size="14">️</text>
  <text x="240" y="105" text-anchor="middle" fill="white" font-size="14">✨</text>
  <text x="160" y="190" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Tower Defense Pro</text>
</svg>
SVGEOF

echo "✅ Game files created!"
ls -la /var/www/games/tower-defense-pro/
echo ""
echo "📋 Next: Add to Firestore via admin panel or API"
