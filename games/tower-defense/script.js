// ============================================
// TOWER DEFENSE PRO - Game Engine
// ============================================

const CONFIG = {
  GRID_SIZE: 40,
  STARTING_GOLD: 100,
  STARTING_LIVES: 20,
  WAVE_DELAY: 3000,
  SPAWN_INTERVAL: 800,
};

const TOWER_SPRITES = {};

function loadTowerSprites() {
  const sprites = [
    { name: 'arrow', path: 'assets/Tower-archery.png' },
    { name: 'cannon', path: 'assets/Tower-cannon.png' },
    { name: 'ice', path: 'assets/Tower-ice.png' },
    { name: 'magic', path: 'assets/Tower-magic.png' }
  ];

  sprites.forEach(sprite => {
    const img = new Image();
    img.src = sprite.path;
    img.onload = () => {
      TOWER_SPRITES[sprite.name] = img;
    };
    img.onerror = () => {
      console.log(`Sprite not found: ${sprite.path}`);
    };
  });
}

loadTowerSprites();

const ENEMY_SPRITES = {};

function loadEnemySprites() {
  const sprites = [
    { name: 'basic', path: 'assets/Enemy-basic.png' },
    { name: 'fast', path: 'assets/Enemy-fast.png' },
    { name: 'tank', path: 'assets/Enemy-tank.png' },
    { name: 'miniBoss', path: 'assets/Enemy-miniBoss.png' },
    { name: 'boss', path: 'assets/Enemy-boss.png' },
    { name: 'eliteBoss', path: 'assets/Enemy-eliteBoss.png' },
    { name: 'destroyerBoss', path: 'assets/Enemy-destroyerBoss.png' }
  ];

  sprites.forEach(sprite => {
    const img = new Image();
    img.src = sprite.path;
    img.onload = () => {
      ENEMY_SPRITES[sprite.name] = img;
    };
    img.onerror = () => {
      console.log(`Sprite not found: ${sprite.path}`);
    };
  });
}

loadEnemySprites();

const TOWER_TYPES = {
  arrow: {
    name: 'Arrow',
    cost: 25,
    damage: 10,
    range: 120,
    fireRate: 500,
    color: '#22C55E',
    icon: '🏹',
    projectileSpeed: 8,
    projectileColor: '#22C55E',
    sprite: 'arrow'
  },
  cannon: {
    name: 'Cannon',
    cost: 50,
    damage: 40,
    range: 100,
    fireRate: 1200,
    color: '#F97316',
    icon: '💣',
    projectileSpeed: 5,
    projectileColor: '#F97316',
    aoe: 50
  },
  ice: {
    name: 'Ice',
    cost: 40,
    damage: 5,
    range: 110,
    fireRate: 800,
    color: '#38BDF8',
    icon: '❄️',
    projectileSpeed: 6,
    projectileColor: '#38BDF8',
    slow: 0.5,
    slowDuration: 2000
  },
  magic: {
    name: 'Magic',
    cost: 75,
    damage: 25,
    range: 140,
    fireRate: 700,
    color: '#A855F7',
    icon: '✨',
    projectileSpeed: 10,
    projectileColor: '#A855F7',
    piercing: true
  }
};

const ENEMY_TYPES = {
  basic: { health: 50, speed: 1.5, reward: 5, color: '#EF4444', size: 12 },
  fast: { health: 30, speed: 3, reward: 8, color: '#FACC15', size: 10 },
  tank: { health: 150, speed: 0.8, reward: 15, color: '#6B7280', size: 18 },
  miniBoss: { health: 300, speed: 0.6, reward: 30, color: '#9333EA', size: 22, isBoss: true, canFreezeTower: true, freezeRange: 100, freezeDuration: 3000, freezeCooldown: 5000 },
  boss: { health: 500, speed: 0.5, reward: 50, color: '#DC2626', size: 28, isBoss: true },
  eliteBoss: { health: 1000, speed: 0.4, reward: 100, color: '#FFD700', size: 35, isBoss: true },
  destroyerBoss: { health: 800, speed: 0.3, reward: 150, color: '#FF0066', size: 40, isBoss: true, canDestroyTower: true, attackPower: 50, attackRange: 60 }
};

const WAVES = [
  { enemies: [{ type: 'basic', count: 5 }] },
  { enemies: [{ type: 'basic', count: 8 }] },
  { enemies: [{ type: 'basic', count: 5 }, { type: 'fast', count: 3 }] },
  { enemies: [{ type: 'basic', count: 10 }, { type: 'fast', count: 5 }] },
  { enemies: [{ type: 'miniBoss', count: 1 }, { type: 'basic', count: 8 }], isBossWave: true },
  { enemies: [{ type: 'fast', count: 10 }, { type: 'basic', count: 5 }] },
  { enemies: [{ type: 'tank', count: 3 }, { type: 'fast', count: 8 }] },
  { enemies: [{ type: 'basic', count: 15 }, { type: 'fast', count: 10 }, { type: 'tank', count: 3 }] },
  { enemies: [{ type: 'tank', count: 5 }, { type: 'fast', count: 10 }] },
  { enemies: [{ type: 'boss', count: 1 }, { type: 'basic', count: 10 }], isBossWave: true },
  { enemies: [{ type: 'fast', count: 15 }, { type: 'tank', count: 5 }] },
  { enemies: [{ type: 'basic', count: 20 }, { type: 'fast', count: 10 }, { type: 'tank', count: 5 }] },
  { enemies: [{ type: 'miniBoss', count: 2 }, { type: 'fast', count: 10 }], isBossWave: true },
  { enemies: [{ type: 'tank', count: 8 }, { type: 'fast', count: 15 }] },
  { enemies: [{ type: 'boss', count: 2 }, { type: 'basic', count: 15 }], isBossWave: true },
  { enemies: [{ type: 'destroyerBoss', count: 1 }, { type: 'tank', count: 5 }], isBossWave: true, isDestroyerWave: true },
  { enemies: [{ type: 'fast', count: 20 }, { type: 'tank', count: 10 }, { type: 'boss', count: 1 }], isBossWave: true },
  { enemies: [{ type: 'miniBoss', count: 3 }, { type: 'destroyerBoss', count: 1 }], isBossWave: true, isDestroyerWave: true },
  { enemies: [{ type: 'boss', count: 3 }, { type: 'fast', count: 15 }], isBossWave: true },
  { enemies: [{ type: 'destroyerBoss', count: 2 }, { type: 'tank', count: 8 }], isBossWave: true, isDestroyerWave: true },
  { enemies: [{ type: 'eliteBoss', count: 1 }, { type: 'basic', count: 25 }], isBossWave: true },
  { enemies: [{ type: 'destroyerBoss', count: 2 }, { type: 'boss', count: 2 }], isBossWave: true, isDestroyerWave: true },
  { enemies: [{ type: 'fast', count: 30 }, { type: 'tank', count: 15 }] },
  { enemies: [{ type: 'eliteBoss', count: 1 }, { type: 'destroyerBoss', count: 1 }, { type: 'boss', count: 2 }], isBossWave: true, isDestroyerWave: true },
  { enemies: [{ type: 'destroyerBoss', count: 3 }, { type: 'tank', count: 10 }], isBossWave: true, isDestroyerWave: true },
];

class Particle {
  constructor(x, y, color, velocity, life, size) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.vx = velocity.x;
    this.vy = velocity.y;
    this.life = life;
    this.maxLife = life;
    this.size = size;
    this.alpha = 1;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.life--;
    this.alpha = this.life / this.maxLife;
    this.vy += 0.1;
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size * this.alpha, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  isDead() {
    return this.life <= 0;
  }
}

class Projectile {
  constructor(x, y, target, tower) {
    this.x = x;
    this.y = y;
    this.target = target;
    this.tower = tower;
    this.speed = tower.config.projectileSpeed;
    this.damage = tower.damage;
    this.color = tower.config.projectileColor;
    this.aoe = tower.config.aoe || 0;
    this.slow = tower.config.slow;
    this.slowDuration = tower.config.slowDuration;
    this.piercing = tower.config.piercing;
    this.hit = [];
  }

  update(enemies, particles) {
    if (!this.target || this.target.isDead) {
      return true;
    }

    const dx = this.target.x - this.x;
    const dy = this.target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 10) {
      this.hitTarget(enemies, particles);
      return true;
    }

    this.x += (dx / dist) * this.speed;
    this.y += (dy / dist) * this.speed;
    return false;
  }

  hitTarget(enemies, particles) {
    if (this.aoe > 0) {
      enemies.forEach(enemy => {
        const dx = enemy.x - this.target.x;
        const dy = enemy.y - this.target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.aoe) {
          enemy.takeDamage(this.damage);
          this.createExplosion(enemy.x, enemy.y, particles);
        }
      });
    } else {
      this.target.takeDamage(this.damage);
      if (this.slow) {
        this.target.applySlow(this.slow, this.slowDuration);
      }
      if (this.piercing && !this.hit.includes(this.target.id)) {
        this.hit.push(this.target.id);
      } else if (this.piercing) {
        return;
      }
    }
    this.createHitParticles(particles);
  }

  createHitParticles(particles) {
    for (let i = 0; i < 5; i++) {
      particles.push(new Particle(
        this.x, this.y, this.color,
        { x: (Math.random() - 0.5) * 4, y: (Math.random() - 0.5) * 4 },
        20, 3
      ));
    }
  }

  createExplosion(x, y, particles) {
    for (let i = 0; i < 15; i++) {
      const angle = (Math.PI * 2 * i) / 15;
      particles.push(new Particle(
        x, y, '#F97316',
        { x: Math.cos(angle) * 3, y: Math.sin(angle) * 3 },
        30, 5
      ));
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.fillStyle = this.color;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

class Enemy {
  constructor(type, path, id) {
    this.id = id;
    this.type = type;
    this.config = ENEMY_TYPES[type];
    this.path = path;
    this.pathIndex = 0;
    this.x = path[0].x;
    this.y = path[0].y;
    this.health = this.config.health;
    this.maxHealth = this.config.health;
    this.speed = this.config.speed;
    this.baseSpeed = this.config.speed;
    this.reward = this.config.reward;
    this.isDead = false;
    this.reachedEnd = false;
    this.slowUntil = 0;
    this.angle = 0;
    this.lastAttackTime = 0;
    this.attackCooldown = 2000;
    this.isAttacking = false;
    this.attackTarget = null;
    this.sprite = ENEMY_SPRITES[type];
  }

  update(towers, game) {
    if (this.isDead || this.reachedEnd) return;

    if (Date.now() < this.slowUntil) {
      this.speed = this.baseSpeed * 0.5;
    } else {
      this.speed = this.baseSpeed;
    }

    if (this.config.canDestroyTower) {
      this.updateDestroyerBehavior(towers, game);
      return;
    }

    if (this.config.canFreezeTower) {
      if (Date.now() - (this.lastFreezeTime || 0) > this.config.freezeCooldown) {
        for (const tower of towers) {
          const dx = tower.x - this.x;
          const dy = tower.y - this.y;
          if (Math.sqrt(dx * dx + dy * dy) < this.config.freezeRange) {
            tower.frozenUntil = Date.now() + this.config.freezeDuration;
            this.lastFreezeTime = Date.now();
            game.createFreezeEffect(tower.x, tower.y);
            Audio.play('freeze');
            break;
          }
        }
      }
    }

    if (this.pathIndex >= this.path.length - 1) {
      this.reachedEnd = true;
      return;
    }

    const target = this.path[this.pathIndex + 1];
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    this.angle = Math.atan2(dy, dx);

    if (dist < this.speed) {
      this.pathIndex++;
      if (this.pathIndex >= this.path.length - 1) {
        this.reachedEnd = true;
      }
    } else {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
  }

  updateDestroyerBehavior(towers, game) {
    const inRangeTower = this.findTowerInRange(towers);

    if (inRangeTower) {
      this.isAttacking = true;
      this.attackTarget = inRangeTower;
      this.speed = 0;

      if (Date.now() - this.lastAttackTime > this.attackCooldown) {
        this.performTowerAttack(game);
        this.lastAttackTime = Date.now();
      }
    } else {
      this.isAttacking = false;
      this.attackTarget = null;

      if (this.pathIndex >= this.path.length - 1) {
        this.reachedEnd = true;
        return;
      }

      const target = this.path[this.pathIndex + 1];
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      this.angle = Math.atan2(dy, dx);

      if (dist < this.speed) {
        this.pathIndex++;
      } else {
        this.x += (dx / dist) * this.speed;
        this.y += (dy / dist) * this.speed;
      }
    }
  }

  findTowerInRange(towers) {
    for (const tower of towers) {
      const dx = tower.x - this.x;
      const dy = tower.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.config.attackRange) {
        return tower;
      }
    }
    return null;
  }

  performTowerAttack(game) {
    if (!this.attackTarget) return;

    this.attackTarget.health -= this.config.attackPower;
    game.createAttackEffect(this.attackTarget.x, this.attackTarget.y);
    game.showTowerDamaged(this.attackTarget);

    if (this.attackTarget.health <= 0) {
      game.destroyTower(this.attackTarget);
      this.attackTarget = null;
      this.isAttacking = false;
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isDead = true;
    }
  }

  applySlow(amount, duration) {
    this.slowUntil = Date.now() + duration;
  }

  draw(ctx) {
    if (this.isDead) return;

    ctx.save();

    const color = Date.now() < this.slowUntil ? '#38BDF8' : this.config.color;
    const isBoss = this.config.isBoss;
    const isDestroyer = this.config.canDestroyTower;

    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Try sprite rendering first
    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      const size = this.config.size;
      if (isBoss) {
        ctx.shadowColor = isDestroyer && this.isAttacking ? '#FF0066' : color;
        ctx.shadowBlur = isDestroyer ? (this.isAttacking ? 30 : 20) : 20;
      } else {
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
      }
      ctx.drawImage(this.sprite, -size, -size, size * 2, size * 2);
      if (isDestroyer && this.isAttacking) {
        ctx.strokeStyle = '#FF0066';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.config.attackRange, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
    // Fallback: original shape rendering

    if (isBoss) {
      if (isDestroyer) {
        ctx.shadowColor = this.isAttacking ? '#FF0066' : color;
        ctx.shadowBlur = this.isAttacking ? 30 + Math.sin(Date.now() / 100) * 10 : 20;
      } else {
        ctx.shadowColor = color;
        ctx.shadowBlur = 20 + Math.sin(Date.now() / 200) * 5;
      }
    } else {
      ctx.shadowColor = color;
      ctx.shadowBlur = 8;
    }

    ctx.fillStyle = color;

    if (isBoss) {
      if (isDestroyer) {
        ctx.beginPath();
        const sides = 8;
        for (let i = 0; i < sides; i++) {
          const angle = (Math.PI * 2 * i) / sides;
          const radius = i % 2 === 0 ? this.config.size : this.config.size * 0.6;
          const px = Math.cos(angle) * radius;
          const py = Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = this.isAttacking ? '#FF0066' : '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.config.size * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.font = `bold ${this.config.size * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚔️', 0, 0);

        if (this.isAttacking) {
          ctx.strokeStyle = '#FF0066';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(0, 0, this.config.attackRange, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        ctx.beginPath();
        const sides = this.config.size > 30 ? 6 : 5;
        for (let i = 0; i < sides; i++) {
          const angle = (Math.PI * 2 * i) / sides;
          const px = Math.cos(angle) * this.config.size;
          const py = Math.sin(angle) * this.config.size;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();

        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(0, 0, this.config.size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = color;
        ctx.font = `bold ${this.config.size * 0.5}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💀', 0, 0);
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(this.config.size, 0);
      ctx.lineTo(-this.config.size / 2, -this.config.size / 2);
      ctx.lineTo(-this.config.size / 2, this.config.size / 2);
      ctx.closePath();
      ctx.fill();
    }
    } // end fallback

    ctx.restore();

    const barWidth = isBoss ? 50 : 30;
    const barHeight = isBoss ? 6 : 4;
    const healthPercent = this.health / this.maxHealth;

    ctx.fillStyle = '#374151';
    ctx.fillRect(this.x - barWidth / 2, this.y - this.config.size - (isBoss ? 15 : 10), barWidth, barHeight);

    ctx.fillStyle = healthPercent > 0.5 ? '#10B981' : healthPercent > 0.25 ? '#F59E0B' : '#EF4444';
    ctx.fillRect(this.x - barWidth / 2, this.y - this.config.size - (isBoss ? 15 : 10), barWidth * healthPercent, barHeight);

    if (isBoss) {
      ctx.fillStyle = isDestroyer ? '#FF0066' : '#FFD700';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isDestroyer ? 'DESTROYER' : 'BOSS', this.x, this.y - this.config.size - 20);
    }
  }
}

class Tower {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.config = TOWER_TYPES[type];
    this.level = 1;
    this.damage = this.config.damage;
    this.range = this.config.range;
    this.fireRate = this.config.fireRate;
    this.lastFire = 0;
    this.target = null;
    this.angle = 0;
    this.maxHealth = 100;
    this.health = 100;
    this.id = Date.now() + Math.random();
    this.sprite = TOWER_SPRITES[type];
  }

  findTarget(enemies) {
    let closest = null;
    let closestDist = Infinity;

    enemies.forEach(enemy => {
      if (enemy.isDead || enemy.reachedEnd) return;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < this.range && dist < closestDist) {
        closest = enemy;
        closestDist = dist;
      }
    });

    this.target = closest;
  }

  update(enemies, projectiles) {
    if (this.frozenUntil && Date.now() < this.frozenUntil) return;
    this.findTarget(enemies);

    if (this.target) {
      const dx = this.target.x - this.x;
      const dy = this.target.y - this.y;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx > absDy * 2) {
        this.angle = dx > 0 ? 0 : Math.PI;
      } else if (absDy > absDx * 2) {
        this.angle = dy > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
        this.angle = Math.atan2(dy, dx);
      }

      this.targetDirection = this.getDirectionName();

      if (Date.now() - this.lastFire > this.fireRate) {
        projectiles.push(new Projectile(this.x, this.y, this.target, this));
        this.lastFire = Date.now();
        Audio.play('shoot');
      }
    }
  }

  getDirectionName() {
    const angle = this.angle;
    if (angle >= -Math.PI / 4 && angle < Math.PI / 4) return 'right';
    if (angle >= Math.PI / 4 && angle < 3 * Math.PI / 4) return 'down';
    if (angle >= -3 * Math.PI / 4 && angle < -Math.PI / 4) return 'up';
    return 'left';
  }

  draw(ctx, showRange = false) {
    ctx.save();
    ctx.translate(this.x, this.y);

    if (showRange) {
      ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, this.range, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    const isDamaged = this.health < this.maxHealth;
    const size = 18 + this.level * 2;

    const dir = this.targetDirection || 'right';

    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      if (dir === 'left') {
        ctx.scale(-1, 1);
        ctx.drawImage(this.sprite, -size, -size, size * 2, size * 2);
      } else if (dir === 'down') {
        ctx.rotate(Math.PI / 2);
        ctx.drawImage(this.sprite, -size, -size, size * 2, size * 2);
      } else if (dir === 'up') {
        ctx.rotate(-Math.PI / 2);
        ctx.drawImage(this.sprite, -size, -size, size * 2, size * 2);
      } else {
        ctx.drawImage(this.sprite, -size, -size, size * 2, size * 2);
      }
    } else {
      ctx.rotate(this.angle);

      const baseColor = isDamaged ? (this.damageFlashUntil && Date.now() < this.damageFlashUntil ? '#FF0066' : '#666') : this.config.color;

      ctx.fillStyle = baseColor;
      ctx.shadowColor = baseColor;
      ctx.shadowBlur = isDamaged ? 20 : 15;

      ctx.beginPath();
      ctx.moveTo(size, 0);
      ctx.lineTo(-size / 2, -size / 2);
      ctx.lineTo(-size / 2, size / 2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(0, 0, size / 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.level > 1) {
      ctx.restore();
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 10px Orbitron';
      ctx.textAlign = 'center';
      ctx.fillText('★'.repeat(this.level - 1), 0, size + 12);
    }

    ctx.restore();

    // Frozen indicator
    if (this.frozenUntil && Date.now() < this.frozenUntil) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.6 + Math.sin(Date.now() / 150) * 0.3;
      ctx.beginPath();
      ctx.arc(0, 0, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('❄️', 0, -18);
      ctx.restore();
    }

    if (this.health < this.maxHealth) {
      const barWidth = 30;
      const barHeight = 4;
      const healthPercent = this.health / this.maxHealth;

      ctx.fillStyle = '#374151';
      ctx.fillRect(this.x - barWidth / 2, this.y - 25, barWidth, barHeight);

      ctx.fillStyle = healthPercent > 0.5 ? '#10B981' : healthPercent > 0.25 ? '#F59E0B' : '#EF4444';
      ctx.fillRect(this.x - barWidth / 2, this.y - 25, barWidth * healthPercent, barHeight);
    }
  }

  upgrade() {
    this.level++;
    this.damage = Math.floor(this.config.damage * (1 + this.level * 0.3));
    this.range += 10;
    this.fireRate = Math.max(200, this.config.fireRate - this.level * 50);
  }

  getUpgradeCost() {
    return Math.floor(this.config.cost * 0.5 * this.level);
  }

  getSellValue() {
    return Math.floor(this.config.cost * 0.6 * this.level);
  }
}

// ============================================
// AUDIO SYSTEM
// ============================================
const Audio = {
  ctx: null,
  enabled: true,

  init() {
    if (this.enabled && !this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },

  play(type) {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;

    const sounds = {
      shoot: { freq: 800, dur: 0.05, type: 'square' },
      hit: { freq: 300, dur: 0.1, type: 'sine' },
      enemyDie: { freq: 200, dur: 0.2, type: 'sawtooth' },
      waveStart: { freq: 440, dur: 0.3, type: 'sine' },
      gameOver: { freq: 150, dur: 0.5, type: 'sawtooth' },
      upgrade: { freq: 660, dur: 0.15, type: 'sine' },
      place: { freq: 520, dur: 0.1, type: 'triangle' },
      freeze: { freq: 1200, dur: 0.3, type: 'sine' },
      towerDestroy: { freq: 80, dur: 0.6, type: 'sawtooth' }
    };

    const sound = sounds[type] || sounds.shoot;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.frequency.value = sound.freq;
      osc.type = sound.type;
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + sound.dur);
      osc.start();
      osc.stop(this.ctx.currentTime + sound.dur);
    } catch (e) {}
  },

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }
};

// ============================================
// GAME CLASS
// ============================================
class TowerDefenseGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.particleCanvas = document.getElementById('particle-canvas');
    this.particleCtx = this.particleCanvas.getContext('2d');
    this.uiCanvas = document.getElementById('ui-canvas');
    this.uiCtx = this.uiCanvas.getContext('2d');

    this.particles = [];
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.path = [];

    this.gold = CONFIG.STARTING_GOLD;
    this.lives = CONFIG.STARTING_LIVES;
    this.wave = 0;
    this.score = 0;
    this.highScore = 0;

    this.waveActive = false;
    this.gameRunning = false;
    this.gameSpeed = 1;

    this.selectedTower = 'arrow';
    this.selectedTowerOnMap = null;
    this.hoveredCell = null;

    this.enemyIdCounter = 0;
    this.lastSpawnTime = 0;
    this.spawnQueue = [];

    this.loadData();
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.setupInput();
    this.gameLoop();
  }

  resize() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = window.innerWidth * dpr;
    this.canvas.height = window.innerHeight * dpr;
    this.canvas.style.width = window.innerWidth + 'px';
    this.canvas.style.height = window.innerHeight + 'px';
    this.ctx.scale(dpr, dpr);

    this.particleCanvas.width = this.canvas.width;
    this.particleCanvas.height = this.canvas.height;
    this.particleCtx.scale(dpr, dpr);

    this.uiCanvas.width = window.innerWidth * dpr;
    this.uiCanvas.height = window.innerHeight * dpr;
    this.uiCanvas.style.width = window.innerWidth + 'px';
    this.uiCanvas.style.height = window.innerHeight + 'px';
    this.uiCtx.scale(dpr, dpr);

    this.gridOffsetX = (window.innerWidth - CONFIG.GRID_SIZE * 15) / 2;
    this.gridOffsetY = 80;
    this.generatePath();
  }

  generatePath() {
    const gx = CONFIG.GRID_SIZE;
    const gy = CONFIG.GRID_SIZE;
    
    this.path = [];
    const points = [
      { x: 0, y: 4 }, { x: 4, y: 4 }, { x: 4, y: 2 },
      { x: 10, y: 2 }, { x: 10, y: 6 }, { x: 6, y: 6 },
      { x: 6, y: 8 }, { x: 12, y: 8 }, { x: 12, y: 4 },
      { x: 14, y: 4 }
    ];

    points.forEach(p => {
      this.path.push({
        x: this.gridOffsetX + p.x * gx + gx / 2,
        y: this.gridOffsetY + p.y * gy + gy / 2
      });
    });
  }

  setupInput() {
    this.uiCanvas.addEventListener('mousemove', (e) => {
      const rect = this.uiCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleMouseMove(x, y);
    });

    this.uiCanvas.addEventListener('click', (e) => {
      const rect = this.uiCanvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.handleClick(x, y);
    });

    this.uiCanvas.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.selectedTowerOnMap = null;
    });
  }

  handleMouseMove(x, y) {
    if (!this.gameRunning) return;

    const gx = CONFIG.GRID_SIZE;
    const gridX = Math.floor((x - this.gridOffsetX) / gx);
    const gridY = Math.floor((y - this.gridOffsetY) / gx);

    if (gridX >= 0 && gridX < 15 && gridY >= 0 && gridY < 10) {
      this.hoveredCell = { x: gridX, y: gridY };
    } else {
      this.hoveredCell = null;
    }
  }

  handleClick(x, y) {
    if (!this.gameRunning) return;

    const gx = CONFIG.GRID_SIZE;
    const gridX = Math.floor((x - this.gridOffsetX) / gx);
    const gridY = Math.floor((y - this.gridOffsetY) / gx);

    if (gridX < 0 || gridX >= 15 || gridY < 0 || gridY >= 10) {
      this.selectedTowerOnMap = null;
      return;
    }

    const cellCenterX = this.gridOffsetX + gridX * gx + gx / 2;
    const cellCenterY = this.gridOffsetY + gridY * gx + gx / 2;

    const clickedTower = this.towers.find(t => 
      Math.abs(t.x - cellCenterX) < gx / 2 && Math.abs(t.y - cellCenterY) < gx / 2
    );

    if (clickedTower) {
      this.selectedTowerOnMap = clickedTower;
      this.showUpgradeModal(clickedTower);
    } else if (this.isValidPlacement(gridX, gridY)) {
      this.placeTower(gridX, gridY);
    } else {
      this.selectedTowerOnMap = null;
      this.closeUpgrade();
    }
  }

  isValidPlacement(gridX, gridY) {
    const cellCenterX = this.gridOffsetX + gridX * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
    const cellCenterY = this.gridOffsetY + gridY * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;

    for (let i = 0; i < this.path.length - 1; i++) {
      const p1 = this.path[i];
      const p2 = this.path[i + 1];
      
      const minX = Math.min(p1.x, p2.x) - 25;
      const maxX = Math.max(p1.x, p2.x) + 25;
      const minY = Math.min(p1.y, p2.y) - 25;
      const maxY = Math.max(p1.y, p2.y) + 25;

      if (cellCenterX > minX && cellCenterX < maxX && cellCenterY > minY && cellCenterY < maxY) {
        return false;
      }
    }

    return !this.towers.some(t => 
      Math.abs(t.x - cellCenterX) < CONFIG.GRID_SIZE && 
      Math.abs(t.y - cellCenterY) < CONFIG.GRID_SIZE
    );
  }

  placeTower(gridX, gridY) {
    const cost = TOWER_TYPES[this.selectedTower].cost;
    if (this.gold < cost) return;

    const x = this.gridOffsetX + gridX * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;
    const y = this.gridOffsetY + gridY * CONFIG.GRID_SIZE + CONFIG.GRID_SIZE / 2;

    this.towers.push(new Tower(x, y, this.selectedTower));
    this.gold -= cost;
    Audio.play('place');
    this.updateHUD();
  }

  showUpgradeModal(tower) {
    const modal = document.getElementById('upgrade-modal');
    const info = document.getElementById('upgrade-info');
    const upgradeCost = document.getElementById('upgrade-cost');
    const sellValue = document.getElementById('sell-value');
    const btnUpgrade = document.getElementById('btn-upgrade');

    info.innerHTML = `
      <span class="tower-icon">${tower.config.icon}</span>
      <h3>${tower.config.name} Tower</h3>
      <p class="level">Level ${tower.level}</p>
      <p>Damage: ${tower.damage}</p>
      <p>Range: ${tower.range}</p>
      <p>Fire Rate: ${tower.fireRate}ms</p>
    `;

    upgradeCost.textContent = tower.getUpgradeCost();
    sellValue.textContent = tower.getSellValue();
    btnUpgrade.disabled = this.gold < tower.getUpgradeCost();

    modal.classList.add('active');
  }

  closeUpgrade() {
    document.getElementById('upgrade-modal').classList.remove('active');
  }

  upgradeTower() {
    if (!this.selectedTowerOnMap) return;
    
    const cost = this.selectedTowerOnMap.getUpgradeCost();
    if (this.gold < cost) return;

    this.gold -= cost;
    this.selectedTowerOnMap.upgrade();
    Audio.play('upgrade');
    this.showUpgradeModal(this.selectedTowerOnMap);
    this.updateHUD();
  }

  sellTower() {
    if (!this.selectedTowerOnMap) return;

    const value = this.selectedTowerOnMap.getSellValue();
    this.gold += value;
    this.towers = this.towers.filter(t => t !== this.selectedTowerOnMap);
    this.selectedTowerOnMap = null;
    this.closeUpgrade();
    this.updateHUD();
  }

  selectTower(type) {
    this.selectedTower = type;
    document.querySelectorAll('.tower-btn').forEach(btn => {
      btn.classList.toggle('selected', btn.dataset.tower === type);
    });
  }

  startWave() {
    if (this.waveActive) return;

    this.wave++;
    this.waveActive = true;
    this.spawnQueue = [];

    const waveData = WAVES[(this.wave - 1) % WAVES.length];
    waveData.enemies.forEach(group => {
      for (let i = 0; i < group.count; i++) {
        this.spawnQueue.push(group.type);
      }
    });

    this.shuffleArray(this.spawnQueue);
    this.lastSpawnTime = 0;

    document.getElementById('btn-wave').classList.add('disabled');
    Audio.play('waveStart');

    if (waveData.isBossWave) {
      this.showBossAnnouncement();
    }

    this.updateHUD();
  }

  showBossAnnouncement() {
    const bossNames = {
      'miniBoss': 'MINI BOSS',
      'boss': 'BOSS',
      'eliteBoss': 'ELITE BOSS',
      'destroyerBoss': 'DESTROYER BOSS'
    };

    const waveData = WAVES[this.currentWave];
    const isDestroyerWave = waveData?.isDestroyerWave;

    const bossType = this.spawnQueue.find(type => ENEMY_TYPES[type]?.isBoss);
    const bossName = bossNames[bossType] || 'BOSS WAVE';

    const announcement = document.createElement('div');
    announcement.className = 'boss-announcement';
    announcement.innerHTML = `
      <div class="boss-text">
        <span class="boss-label" style="${isDestroyerWave ? 'color: #FF0066; text-shadow: 0 0 20px #FF0066;' : ''}">${isDestroyerWave ? '🚨 DESTROYER WARNING 🚨' : '⚠️ WARNING ⚠️'}</span>
        <span class="boss-name">${bossName}</span>
        <span class="boss-desc">${isDestroyerWave ? 'Can destroy towers!' : 'Incoming!'}</span>
      </div>
    `;
    document.body.appendChild(announcement);

    setTimeout(() => announcement.classList.add('show'), 100);
    setTimeout(() => announcement.classList.remove('show'), isDestroyerWave ? 3000 : 2000);
    setTimeout(() => announcement.remove(), isDestroyerWave ? 3500 : 2500);
  }

  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  spawnEnemy(type) {
    const enemy = new Enemy(type, this.path, this.enemyIdCounter++);
    this.enemies.push(enemy);
  }

  toggleSpeed() {
    this.gameSpeed = this.gameSpeed === 1 ? 2 : 1;
    const btn = document.getElementById('btn-speed');
    btn.classList.toggle('fast', this.gameSpeed === 2);
    btn.querySelector('.btn-text').textContent = this.gameSpeed + 'X';
  }

  updateHUD() {
    document.getElementById('hud-gold').textContent = this.gold;
    document.getElementById('hud-lives').textContent = this.lives;
    document.getElementById('hud-wave').textContent = this.wave;
    document.getElementById('hud-score').textContent = this.score;
  }

  loadData() {
    const saved = localStorage.getItem('towerdefense-data');
    if (saved) {
      const data = JSON.parse(saved);
      this.highScore = data.highScore || 0;
      document.getElementById('menu-highscore').textContent = this.highScore;
      document.getElementById('menu-wave').textContent = data.maxWave || 0;
    }
  }

  saveData() {
    const maxWave = Math.max(this.highScore, this.wave);
    const newHighScore = Math.max(this.highScore, this.score);
    localStorage.setItem('towerdefense-data', JSON.stringify({
      highScore: newHighScore,
      maxWave: maxWave
    }));
    // Save to Firebase
    if (window.FireScore) {
      window.FireScore.save(this.score, this.wave);
    }
  }

  showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  showTowerInfo() {
    document.getElementById('tower-modal').classList.add('active');
  }

  closeTowerInfo() {
    document.getElementById('tower-modal').classList.remove('active');
  }

  startGame() {
    this.gold = CONFIG.STARTING_GOLD;
    this.lives = CONFIG.STARTING_LIVES;
    this.wave = 0;
    this.score = 0;
    this.waveActive = false;
    this.gameRunning = true;
    this.towers = [];
    this.enemies = [];
    this.projectiles = [];
    this.particles = [];

    document.getElementById('game-hud').classList.remove('hidden');
    document.getElementById('btn-wave').classList.remove('disabled');
    document.getElementById('btn-speed').classList.remove('fast');
    document.getElementById('btn-speed').querySelector('.btn-text').textContent = '1X';
    
    this.updateHUD();
    this.showScreen('main-menu');
    document.getElementById('main-menu').classList.remove('active');
  }

  gameOver() {
    this.gameRunning = false;
    this.saveData();

    document.getElementById('go-wave').textContent = this.wave;
    document.getElementById('go-score').textContent = this.score;
    document.getElementById('go-highscore').textContent = Math.max(this.highScore, this.score);

    document.getElementById('game-hud').classList.add('hidden');
    this.showScreen('gameover-screen');
    Audio.play('gameOver');
  }

  restart() {
    this.loadData();
    this.startGame();
    this.showScreen('main-menu');
    document.getElementById('main-menu').classList.remove('active');
  }

  backToMenu() {
    this.gameRunning = false;
    this.loadData();
    document.getElementById('game-hud').classList.add('hidden');
    this.showScreen('main-menu');
  }

  toggleSound() {
    const enabled = Audio.toggle();
    document.getElementById('btn-sound').querySelector('.btn-icon').textContent = enabled ? '🔊' : '🔇';
  }

  update(deltaTime) {
    if (!this.gameRunning) return;

    const dt = deltaTime * this.gameSpeed;

    if (this.waveActive && this.spawnQueue.length > 0) {
      if (Date.now() - this.lastSpawnTime > CONFIG.SPAWN_INTERVAL / this.gameSpeed) {
        this.spawnEnemy(this.spawnQueue.shift());
        this.lastSpawnTime = Date.now();
      }
    }

    if (this.waveActive && this.spawnQueue.length === 0 && this.enemies.length === 0) {
      this.waveActive = false;
      document.getElementById('btn-wave').classList.remove('disabled');
    }

    this.enemies.forEach(enemy => enemy.update(this.towers, this));

    this.enemies.forEach(enemy => {
      if (enemy.reachedEnd) {
        this.lives--;
        this.updateHUD();
        if (this.lives <= 0) {
          this.gameOver();
        }
      }
      if (enemy.isDead && !enemy.rewarded) {
        enemy.rewarded = true;
        this.gold += enemy.reward;
        this.score += enemy.reward * 10;

        const ex = enemy.x;
        const ey = enemy.y;
        const ecolor = enemy.config.color;
        const isBoss = enemy.config.isBoss;

        this.updateHUD();

        if (isBoss) {
          this.createBossDeathParticles(ex, ey, ecolor);
          this.showBossDefeatedReward(enemy.reward, ex, ey);
          Audio.play('enemyDie');
        } else {
          this.createDeathParticles(ex, ey, ecolor);
          Audio.play('enemyDie');
        }
      }
    });

this.enemies = this.enemies.filter(e => !e.isDead && !e.reachedEnd);

    this.towers.forEach(tower => tower.update(this.enemies, this.projectiles));

    this.projectiles = this.projectiles.filter(p => !p.update(this.enemies, this.particles));

    this.particles.forEach(p => p.update());
    this.particles = this.particles.filter(p => !p.isDead());
  }

  createDeathParticles(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.particles.push(new Particle(
        x, y, color,
        { x: Math.cos(angle) * 3, y: Math.sin(angle) * 3 },
        30, 4
      ));
    }
  }

  createBossDeathParticles(x, y, color) {
    for (let i = 0; i < 30; i++) {
      const angle = (Math.PI * 2 * i) / 30;
      const speed = 2 + Math.random() * 5;
      this.particles.push(new Particle(
        x, y, color,
        { x: Math.cos(angle) * speed, y: Math.sin(angle) * speed },
        60, 6
      ));
    }
    for (let i = 0; i < 20; i++) {
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 40,
        y + (Math.random() - 0.5) * 40,
        '#FFD700',
        { x: (Math.random() - 0.5) * 3, y: -Math.random() * 5 },
        45, 5
      ));
    }
  }

  showBossDefeatedReward(reward, x, y) {
    const popup = document.createElement('div');
    popup.className = 'boss-reward-popup';
    popup.innerHTML = `
      <div class="reward-content">
        <div class="reward-title">🎉 BOSS DEFEATED!</div>
        <div class="reward-amount">+${reward} 💰</div>
        <div class="reward-bonus">+${reward * 15} SCORE</div>
      </div>
    `;
    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add('show'), 50);
    setTimeout(() => popup.classList.remove('show'), 2500);
    setTimeout(() => popup.remove(), 3000);
  }

  destroyTower(tower) {
    const index = this.towers.indexOf(tower);
    if (index > -1) {
      this.towers.splice(index, 1);
      this.createExplosion(tower.x, tower.y, '#FF0066', 30);
      this.showTowerDestroyed(tower);
    }
  }

  showTowerDamaged(tower) {
    tower.damageFlashUntil = Date.now() + 200;
  }

  createAttackEffect(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * 3,
        Math.sin(angle) * 3,
        '#FF0066',
        4,
        500
      ));
    }
  }

  createFreezeEffect(x, y) {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      this.particles.push(new Particle(
        x, y, '#38BDF8',
        { x: Math.cos(angle) * 3, y: Math.sin(angle) * 3 },
        35, 5
      ));
    }
    for (let i = 0; i < 8; i++) {
      this.particles.push(new Particle(
        x + (Math.random() - 0.5) * 20,
        y + (Math.random() - 0.5) * 20,
        '#FFFFFF',
        { x: (Math.random() - 0.5) * 2, y: -Math.random() * 3 },
        25, 3
      ));
    }
  }

  showTowerDestroyed(tower) {
    // Unique tower destruction effect - ring burst + debris
    for (let i = 0; i < 20; i++) {
      const angle = (Math.PI * 2 * i) / 20;
      this.particles.push(new Particle(
        tower.x, tower.y, '#FF0066',
        { x: Math.cos(angle) * 5, y: Math.sin(angle) * 5 },
        50, 6
      ));
    }
    for (let i = 0; i < 15; i++) {
      this.particles.push(new Particle(
        tower.x + (Math.random() - 0.5) * 30,
        tower.y + (Math.random() - 0.5) * 30,
        '#FF6600',
        { x: (Math.random() - 0.5) * 4, y: -Math.random() * 6 },
        40, 4
      ));
    }
    // White flash particles
    for (let i = 0; i < 10; i++) {
      this.particles.push(new Particle(
        tower.x, tower.y, '#FFFFFF',
        { x: (Math.random() - 0.5) * 8, y: (Math.random() - 0.5) * 8 },
        20, 8
      ));
    }
    Audio.play('towerDestroy');
  }

  createExplosion(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 2;
      this.particles.push(new Particle(
        x, y,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed,
        color,
        Math.random() * 4 + 2,
        1000
      ));
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    this.particleCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.drawGrid();
    this.drawPath();

    if (this.gameRunning) {
      this.towers.forEach(tower => {
        tower.draw(this.ctx, this.selectedTowerOnMap === tower);
      });

      this.enemies.forEach(enemy => enemy.draw(this.ctx));

      this.projectiles.forEach(p => p.draw(this.ctx));

      this.particles.forEach(p => p.draw(this.particleCtx));

      if (this.hoveredCell && !this.selectedTowerOnMap) {
        this.drawPlacementPreview();
      }
    }

    this.drawUI();
  }

  drawGrid() {
    const gx = CONFIG.GRID_SIZE;

    for (let x = 0; x < 15; x++) {
      for (let y = 0; y < 10; y++) {
        const px = this.gridOffsetX + x * gx;
        const py = this.gridOffsetY + y * gx;

        this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
        this.ctx.strokeRect(px, py, gx, gx);

        this.ctx.fillStyle = 'rgba(30, 41, 59, 0.3)';
        this.ctx.fillRect(px + 1, py + 1, gx - 2, gx - 2);
      }
    }
  }

  drawPath() {
    if (this.path.length < 2) return;

    this.ctx.save();
    this.ctx.strokeStyle = '#6366F1';
    this.ctx.lineWidth = 30;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.shadowColor = '#6366F1';
    this.ctx.shadowBlur = 15;

    this.ctx.beginPath();
    this.ctx.moveTo(this.path[0].x, this.path[0].y);
    for (let i = 1; i < this.path.length; i++) {
      this.ctx.lineTo(this.path[i].x, this.path[i].y);
    }
    this.ctx.stroke();

    this.ctx.strokeStyle = '#818CF8';
    this.ctx.lineWidth = 20;
    this.ctx.shadowBlur = 0;
    this.ctx.stroke();

    this.ctx.fillStyle = '#10B981';
    this.ctx.beginPath();
    this.ctx.arc(this.path[0].x, this.path[0].y, 15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#EF4444';
    this.ctx.beginPath();
    this.ctx.arc(this.path[this.path.length - 1].x, this.path[this.path.length - 1].y, 15, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  drawPlacementPreview() {
    const gx = CONFIG.GRID_SIZE;
    const x = this.gridOffsetX + this.hoveredCell.x * gx;
    const y = this.gridOffsetY + this.hoveredCell.y * gx;

    const valid = this.isValidPlacement(this.hoveredCell.x, this.hoveredCell.y);
    const canAfford = this.gold >= TOWER_TYPES[this.selectedTower].cost;

    this.ctx.fillStyle = valid && canAfford ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
    this.ctx.fillRect(x, y, gx, gx);

    this.ctx.strokeStyle = valid && canAfford ? '#10B981' : '#EF4444';
    this.ctx.lineWidth = 2;
    this.ctx.strokeRect(x, y, gx, gx);

    if (valid && canAfford) {
      const centerX = x + gx / 2;
      const centerY = y + gx / 2;
      const range = TOWER_TYPES[this.selectedTower].range;

      this.ctx.fillStyle = 'rgba(99, 102, 241, 0.1)';
      this.ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, range, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
    }
  }

  drawUI() {
    this.uiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  gameLoop(timestamp) {
    if (!this.lastTime) this.lastTime = timestamp;
    const deltaTime = timestamp - this.lastTime;
    this.lastTime = timestamp;

    this.update(deltaTime);
    this.draw();

    requestAnimationFrame((t) => this.gameLoop(t));
  }
}

// Initialize
const game = new TowerDefenseGame();

// Direct assignment of methods to window
window.Game = game;

window.addEventListener('load', () => {
  const loadingFill = document.getElementById('loading-fill');
  const loadingText = document.getElementById('loading-text');
  
  let progress = 0;
  const loadingSteps = [
    { progress: 30, text: 'Loading assets...' },
    { progress: 60, text: 'Initializing game...' },
    { progress: 90, text: 'Almost ready...' },
    { progress: 100, text: 'Ready!' }
  ];
  
  let stepIndex = 0;
  
  function updateLoading() {
    if (stepIndex < loadingSteps.length) {
      const step = loadingSteps[stepIndex];
      progress = step.progress;
      loadingFill.style.width = progress + '%';
      loadingText.textContent = step.text;
      stepIndex++;
      
      const delay = stepIndex === loadingSteps.length ? 300 : 400;
      setTimeout(updateLoading, delay);
    } else {
      setTimeout(() => {
        game.showScreen('main-menu');
        Audio.init();
      }, 300);
    }
  }
  
  updateLoading();
});