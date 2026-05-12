const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const WORLD_WIDTH = 3500;
const WORLD_HEIGHT = 2500;

const camera = { x: 0, y: 0 };

const WEAPONS = {
    knife: { name: 'Pisau', damage: 25, fireRate: 500, range: 60, ammo: Infinity, color: '#888', width: 30, height: 10 },
    glock: { name: 'Glock 19', damage: 15, fireRate: 200, range: 250, ammo: 12, color: '#444', width: 20, height: 8 },
    ak47: { name: 'AK-47', damage: 30, fireRate: 100, range: 300, ammo: 30, color: '#4a4', width: 25, height: 8 },
    m16: { name: 'M-16', damage: 25, fireRate: 80, range: 350, ammo: 30, color: '#5a5', width: 28, height: 8 },
    ar15: { name: 'AR-15', damage: 28, fireRate: 90, range: 320, ammo: 30, color: '#666', width: 27, height: 8 },
    m1: { name: 'M1 Machine Gun', damage: 20, fireRate: 80, range: 200, ammo: 50, color: '#a4a', width: 30, height: 8 },
    minigun: { name: 'Minigun', damage: 10, fireRate: 30, range: 180, ammo: 100, color: '#ea0', width: 35, height: 10 },
    tank: { name: 'M1 Abrams Tank', damage: 50, fireRate: 500, range: 400, ammo: 40, color: '#3a3', width: 60, height: 25 }
};

const WEAPON_DROPS = ['glock', 'ak47', 'm16', 'ar15', 'm1', 'minigun'];

let gameState = 'menu';
let player = null;
let enemies = [];
let bullets = [];
let weaponDrops = [];
let vehicleDrops = [];
let particles = [];
let decorations = [];
let buildings = [];
let lastShot = 0;
let wave = 1;
let kills = 0;
let keys = {};
let mouse = { x: 0, y: 0, down: false };
let gameLoop = null;

class Player {
    constructor() {
        this.x = WORLD_WIDTH / 2;
        this.y = WORLD_HEIGHT / 2;
        this.radius = 15;
        this.speed = 5;
        this.health = 100;
        this.weapon = 'knife';
        this.ammo = { knife: Infinity, glock: 12, ak47: 30, m16: 30, ar15: 30, m1: 50, minigun: 100, tank: 40 };
        this.maxAmmo = { knife: Infinity, glock: 12, ak47: 30, m16: 30, ar15: 30, m1: 50, minigun: 100, tank: 40 };
        this.angle = 0;
        this.invincible = 0;
        this.isReloading = false;
        this.reloadTimer = 0;
        this.reloadTime = { glock: 1000, ak47: 1500, m16: 1200, ar15: 1200, m1: 2000, minigun: 2500, tank: 3000 };
        this.inVehicle = null;
        this.tankMode = 'cannon';
        this.vehicleAmmo = { tank: 40, tankMG: 200 };
        this.vehicleMaxAmmo = { tank: 40, tankMG: 200 };
        this.vehicleReloadTime = { tank: 3000, tankMG: 2000 };
        this.vehicleReloadTimer = 0;
        this.inventory = ['knife', null, null];
        this.currentSlot = 0;
    }

    addToInventory(weaponType) {
        if (weaponType === 'knife') return false;
        for (let i = 0; i < 3; i++) {
            if (this.inventory[i] === weaponType) {
                this.ammo[weaponType] += this.maxAmmo[weaponType];
                return false;
            }
        }
        for (let i = 0; i < 3; i++) {
            if (this.inventory[i] === null) {
                this.inventory[i] = weaponType;
                this.ammo[weaponType] += this.maxAmmo[weaponType];
                if (i === this.currentSlot || this.weapon === 'knife') {
                    this.weapon = weaponType;
                }
                return true;
            }
        }
        const currentSlot = this.currentSlot;
        const oldWeapon = this.inventory[currentSlot];
        if (oldWeapon) {
            this.inventory[currentSlot] = weaponType;
            this.ammo[weaponType] += this.maxAmmo[weaponType];
            this.weapon = weaponType;
            weaponDrops.push(new WeaponDrop(this.x, this.y, oldWeapon));
            showPickup(WEAPONS[oldWeapon].name + ' auto-dropped!');
            return true;
        }
        return false;
    }

    switchSlot(slotIndex, swap = false) {
        if (slotIndex < 0 || slotIndex > 2) return;

        if (swap && this.inventory[slotIndex]) {
            const currentWeaponInSlot = this.inventory[slotIndex];
            this.inventory[slotIndex] = this.weapon;
            this.weapon = currentWeaponInSlot;
        } else {
            this.currentSlot = slotIndex;
            if (this.inventory[slotIndex]) {
                this.weapon = this.inventory[slotIndex];
            }
        }
        updateHUD();
    }

    dropWeapon(slotIndex) {
        if (slotIndex < 0 || slotIndex > 2) return;
        const weapon = this.inventory[slotIndex];
        if (!weapon) return;

        this.inventory[slotIndex] = null;
        if (this.weapon === weapon) {
            this.weapon = 'knife';
            this.currentSlot = 0;
        }
        updateHUD();
        return weapon;
    }

    switchTankMode() {
        if (!this.inVehicle) return;
        this.tankMode = this.tankMode === 'cannon' ? 'mg' : 'cannon';
        updateHUD();
    }

    reload() {
        const weapon = WEAPONS[this.weapon];
        if (weapon.ammo === Infinity || this.isReloading) return;
        if (this.ammo[this.weapon] >= this.maxAmmo[this.weapon]) return;

        this.isReloading = true;
        this.reloadTimer = this.reloadTime[this.weapon];
        updateHUD();
    }

    update() {
        let dx = 0, dy = 0;
        let currentSpeed = this.inVehicle ? this.speed * 1.8 : this.speed;

        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            this.x += (dx / len) * currentSpeed;
            this.y += (dy / len) * currentSpeed;
        }

        this.x = Math.max(this.radius, Math.min(WORLD_WIDTH - this.radius, this.x));
        this.y = Math.max(this.radius, Math.min(WORLD_HEIGHT - this.radius, this.y));

        const screenX = mouse.x + camera.x;
        const screenY = mouse.y + camera.y;
        this.angle = Math.atan2(screenY - this.y, screenX - this.x);

        if (this.invincible > 0) this.invincible--;

        if (this.isReloading && !this.inVehicle) {
            this.reloadTimer -= 16.67;
            if (this.reloadTimer <= 0) {
                this.ammo[this.weapon] = this.maxAmmo[this.weapon];
                this.isReloading = false;
                updateHUD();
            }
        }

        if (this.inVehicle && this.vehicleReloadTimer > 0) {
            this.vehicleReloadTimer -= 16.67;
            if (this.vehicleReloadTimer <= 0) {
                this.vehicleAmmo['tank'] = this.vehicleMaxAmmo['tank'];
                this.vehicleAmmo['tankMG'] = this.vehicleMaxAmmo['tankMG'];
                updateHUD();
            }
        }

        camera.x = Math.max(0, Math.min(WORLD_WIDTH - canvas.width, this.x - canvas.width / 2));
        camera.y = Math.max(0, Math.min(WORLD_HEIGHT - canvas.height, this.y - canvas.height / 2));
    }

    draw() {
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.rotate(this.angle);

        if (this.invincible > 0 && Math.floor(this.invincible / 5) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        if (this.inVehicle) {
            ctx.fillStyle = '#2a4a2a';
            ctx.fillRect(-30, -20, 60, 40);
            ctx.fillStyle = '#3a5a3a';
            ctx.fillRect(-20, -30, 30, 20);
            ctx.fillStyle = '#1a1a1a';
            ctx.beginPath();
            ctx.arc(-20, 20, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(0, 20, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(20, 20, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(30, -5, 30, 10);
        } else {
            ctx.fillStyle = '#ff6644';
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffaa44';
            ctx.beginPath();
            ctx.arc(3, -3, 5, 0, Math.PI * 2);
            ctx.fill();
        }

        if (!this.inVehicle) {
            const weapon = WEAPONS[this.weapon];
            ctx.fillStyle = weapon.color;
            ctx.fillRect(10, -weapon.height / 2, weapon.width, weapon.height);
        }

        ctx.restore();
    }

    shoot() {
        const weapon = this.inVehicle ? WEAPONS['tank'] : WEAPONS[this.weapon];
        const isVehicle = this.inVehicle !== null;
        let damage, range, bulletSpeed, bulletX, bulletColor;

        if (isVehicle) {
            const isMG = this.tankMode === 'mg';

            const now = Date.now();
            const fireRate = isMG ? 50 : 500;
            if (now - lastShot < fireRate) return;
            lastShot = now;

            if (isMG) {
                this.vehicleAmmo.tankMG--;
                damage = 15;
                range = 250;
                bulletSpeed = 15;
                bulletX = 40;
                bulletColor = '#ffff00';
            } else {
                this.vehicleAmmo.tank--;
                damage = 50;
                range = 400;
                bulletSpeed = 18;
                bulletX = 50;
                bulletColor = '#88ff88';
            }

            updateHUD();
            if (weapon.ammo === Infinity) {
                const now = Date.now();
                if (now - lastShot < weapon.fireRate) return;
                lastShot = now;
            } else {
                if (this.isReloading) return;
                if (this.ammo[this.weapon] <= 0) {
                    this.reload();
                    return;
                }

                const now = Date.now();
                if (now - lastShot < weapon.fireRate) return;
                lastShot = now;

                this.ammo[this.weapon]--;
                if (this.ammo[this.weapon] === 0) {
                    this.reload();
                }
                updateHUD();
            }
        }

        const finalBulletSpeed = isVehicle ? bulletSpeed : 12;
        const finalBulletX = isVehicle ? bulletX : 25;
        const finalDamage = isVehicle ? damage : weapon.damage;
        const finalRange = isVehicle ? range : weapon.range;
        const finalColor = isVehicle ? bulletColor : (this.weapon === 'knife' ? '#ff0000' : '#ffff00');

        bullets.push({
            x: this.x + Math.cos(this.angle) * finalBulletX,
            y: this.y + Math.sin(this.angle) * finalBulletX,
            vx: Math.cos(this.angle) * finalBulletSpeed,
            vy: Math.sin(this.angle) * finalBulletSpeed,
            damage: finalDamage,
            range: finalRange,
            traveled: 0,
            color: finalColor
        });

        if (!isVehicle && this.weapon === 'knife') {
            enemies.forEach(enemy => {
                const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
                if (dist < weapon.range) {
                    const angleToEnemy = Math.atan2(enemy.y - this.y, enemy.x - this.x);
                    const angleDiff = Math.abs(angleToEnemy - this.angle);
                    if (angleDiff < 0.5 || angleDiff > Math.PI * 2 - 0.5) {
                        enemy.takeDamage(weapon.damage);
                        spawnParticles(enemy.x, enemy.y, '#ff0000', 10);
                    }
                }
            });
        }
    }

    melee() {
        const weapon = WEAPONS[this.weapon];
        if (this.weapon !== 'knife') return;
        
        const now = Date.now();
        if (now - lastShot < weapon.fireRate) return;
        lastShot = now;
        
        enemies.forEach(enemy => {
            const dist = Math.hypot(enemy.x - this.x, enemy.y - this.y);
            if (dist < weapon.range + enemy.radius) {
                const angleToEnemy = Math.atan2(enemy.y - this.y, enemy.x - this.x);
                const angleDiff = Math.abs(angleToEnemy - this.angle);
                if (angleDiff < 1) {
                    enemy.takeDamage(weapon.damage);
                    spawnParticles(enemy.x, enemy.y, '#ff0000', 15);
                }
            }
        });
    }

    takeDamage(amount) {
        if (this.invincible > 0) return;
        this.health -= amount;
        this.invincible = 30;
        updateHUD();
        if (this.health <= 0) {
            gameOver();
        }
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 15;
        this.speed = 1.5 + Math.random();
        this.health = 50 + wave * 10;
        this.damage = 10;
    }

    update() {
        const angle = Math.atan2(player.y - this.y, player.x - this.x);
        this.x += Math.cos(angle) * this.speed;
        this.y += Math.sin(angle) * this.speed;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < this.radius + player.radius) {
            player.takeDamage(this.damage);
            this.health = 0;
        }
    }

    draw() {
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        ctx.fillStyle = '#aa0000';
        ctx.beginPath();
        ctx.arc(drawX, drawY, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(drawX - 3, drawY - 3, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(drawX + 3, drawY - 3, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    takeDamage(amount) {
        this.health -= amount;
    }
}

class WeaponDrop {
    constructor(x, y, weaponType) {
        this.x = x;
        this.y = y;
        this.weaponType = weaponType;
        this.weapon = WEAPONS[weaponType];
        this.radius = 20;
        this.pulse = 0;
    }

    draw() {
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        this.pulse += 0.1;
        const scale = 1 + Math.sin(this.pulse) * 0.1;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.scale(scale, scale);

        ctx.fillStyle = this.weapon.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 12px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText(this.weapon.name.split(' ')[0], 0, 4);

        ctx.restore();
    }

    checkPickup() {
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < this.radius + player.radius) {
            const added = player.addToInventory(this.weaponType);
            updateHUD();
            if (added) {
                showPickup(this.weapon.name + ' ditambahkan ke inventory!');
            } else {
                showPickup(this.weapon.name + ' ammo +' + this.weapon.ammo);
            }
            return true;
        }
        return false;
    }
}

class VehicleDrop {
    constructor(x, y, vehicleType) {
        this.x = x;
        this.y = y;
        this.vehicleType = vehicleType;
        this.vehicle = WEAPONS[vehicleType];
        this.radius = 40;
        this.pulse = 0;
    }

    draw() {
        const drawX = this.x - camera.x;
        const drawY = this.y - camera.y;

        this.pulse += 0.08;
        const scale = 1 + Math.sin(this.pulse) * 0.08;

        ctx.save();
        ctx.translate(drawX, drawY);
        ctx.scale(scale, scale);

        ctx.fillStyle = '#2a4a2a';
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = this.vehicle.color;
        ctx.fillRect(-25, -15, 50, 30);
        ctx.fillRect(-15, -25, 20, 15);
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.arc(-20, 15, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 15, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(20, 15, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Orbitron';
        ctx.textAlign = 'center';
        ctx.fillText('TANK', 0, 5);

        ctx.restore();
    }

    checkPickup() {
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < this.radius + player.radius) {
            if (!player.inVehicle) {
                player.inVehicle = this.vehicleType;
                player.vehicleAmmo['tank'] = this.vehicle.ammo;
                player.vehicleAmmo['tankMG'] = 200;
                player.tankMode = 'cannon';
                player.vehicleReloadTimer = 0;
                updateHUD();
                showPickup(this.vehicle.name + ' (E to exit, F to switch mode)');
                return true;
            }
        }
        return false;
    }
}

function checkTankReenter() {
    if (player.inVehicle) return;

    for (let drop of vehicleDrops) {
        const dist = Math.hypot(player.x - drop.x, player.y - drop.y);
        if (dist < drop.radius + player.radius + 20) {
            player.inVehicle = drop.vehicleType;
            player.vehicleAmmo['tank'] = drop.vehicle.ammo;
            player.vehicleAmmo['tankMG'] = 200;
            player.tankMode = 'cannon';
            player.vehicleReloadTimer = 0;
            vehicleDrops = vehicleDrops.filter(d => d !== drop);
            updateHUD();
            showPickup('Masuk Tank (E to exit, F switch mode)');
            return;
        }
    }
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 10,
            vy: (Math.random() - 0.5) * 10,
            life: 30,
            color,
            radius: Math.random() * 5 + 2
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        p.radius *= 0.95;
        return p.life > 0;
    });
}

function drawParticles() {
    particles.forEach(p => {
        const drawX = p.x - camera.x;
        const drawY = p.y - camera.y;
        ctx.globalAlpha = p.life / 30;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, p.radius, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
}

function spawnEnemy() {
    const side = Math.floor(Math.random() * 4);
    let x, y;
    switch(side) {
        case 0: x = Math.random() * WORLD_WIDTH; y = -50; break;
        case 1: x = WORLD_WIDTH + 50; y = Math.random() * WORLD_HEIGHT; break;
        case 2: x = Math.random() * WORLD_WIDTH; y = WORLD_HEIGHT + 50; break;
        case 3: x = -50; y = Math.random() * WORLD_HEIGHT; break;
    }
    enemies.push(new Enemy(x, y));
}

function spawnWeaponDrop() {
    const weaponType = WEAPON_DROPS[Math.floor(Math.random() * WEAPON_DROPS.length)];
    const x = 200 + Math.random() * (WORLD_WIDTH - 400);
    const y = 200 + Math.random() * (WORLD_HEIGHT - 400);
    weaponDrops.push(new WeaponDrop(x, y, weaponType));
}

function spawnVehicleDrop() {
    const x = 300 + Math.random() * (WORLD_WIDTH - 600);
    const y = 300 + Math.random() * (WORLD_HEIGHT - 600);
    vehicleDrops.push(new VehicleDrop(x, y, 'tank'));
}

function drawVehicleDrops() {
    vehicleDrops = vehicleDrops.filter(drop => {
        if (drop.checkPickup()) return false;
        drop.draw();
        return true;
    });
}

function updateBullets() {
    bullets = bullets.filter(b => {
        b.x += b.vx;
        b.y += b.vy;
        b.traveled += Math.hypot(b.vx, b.vy);

        if (b.traveled > b.range ||
            b.x < -50 || b.x > WORLD_WIDTH + 50 ||
            b.y < -50 || b.y > WORLD_HEIGHT + 50) {
            return false;
        }

        for (let enemy of enemies) {
            const dist = Math.hypot(b.x - enemy.x, b.y - enemy.y);
            if (dist < enemy.radius + 5) {
                enemy.takeDamage(b.damage);
                spawnParticles(b.x, b.y, '#ff6600', 8);
                return false;
            }
        }

        return true;
    });
}

function drawBullets() {
    bullets.forEach(b => {
        const drawX = b.x - camera.x;
        const drawY = b.y - camera.y;
        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.arc(drawX, drawY, 4, 0, Math.PI * 2);
        ctx.fill();
    });
}

function updateEnemies() {
    enemies = enemies.filter(enemy => {
        enemy.update();
        if (enemy.health <= 0) {
            kills++;
            spawnParticles(enemy.x, enemy.y, '#ff0000', 20);
            if (Math.random() < 0.3) {
                weaponDrops.push(new WeaponDrop(enemy.x, enemy.y, 
                    WEAPON_DROPS[Math.floor(Math.random() * WEAPON_DROPS.length)]));
            }
            updateHUD();
            return false;
        }
        return true;
    });
}

function drawEnemies() {
    enemies.forEach(e => e.draw());
}

function drawWeaponDrops() {
    weaponDrops = weaponDrops.filter(drop => {
        if (drop.checkPickup()) return false;
        drop.draw();
        return true;
    });
}

function generateDecorations() {
    decorations = [];
    for (let i = 0; i < 50; i++) {
        decorations.push({
            x: Math.random() * WORLD_WIDTH,
            y: Math.random() * WORLD_HEIGHT,
            type: Math.random() < 0.5 ? 'tree' : 'rock',
            size: 20 + Math.random() * 30
        });
    }

    buildings = [];
    for (let i = 0; i < 25; i++) {
        const width = 100 + Math.random() * 150;
        const height = 80 + Math.random() * 100;
        buildings.push({
            x: 200 + Math.random() * (WORLD_WIDTH - 400),
            y: 200 + Math.random() * (WORLD_HEIGHT - 400),
            width: width,
            height: height,
            hasTank: Math.random() < 0.05,
            checked: false
        });
    }
}

function drawBuildings() {
    buildings.forEach(b => {
        const drawX = b.x - camera.x;
        const drawY = b.y - camera.y;

        if (drawX > -b.width && drawX < canvas.width + b.width &&
            drawY > -b.height && drawY < canvas.height + b.height) {

            ctx.fillStyle = '#3a3a4a';
            ctx.fillRect(drawX, drawY, b.width, b.height);

            ctx.fillStyle = '#2a2a3a';
            ctx.fillRect(drawX + 5, drawY + 5, b.width - 10, b.height - 10);

            ctx.fillStyle = '#1a1a2a';
            ctx.fillRect(drawX + b.width / 2 - 20, drawY + b.height - 30, 40, 30);

            ctx.fillStyle = b.hasTank ? '#4a4' : '#555';
            ctx.font = 'bold 10px Orbitron';
            ctx.textAlign = 'center';
            ctx.fillText(b.hasTank ? 'TANK' : 'GEDUNG', drawX + b.width / 2, drawY + b.height / 2);

            ctx.strokeStyle = '#4a4a5a';
            ctx.lineWidth = 2;
            ctx.strokeRect(drawX, drawY, b.width, b.height);
        }
    });
}

function checkBuildingEntry() {
    if (!player || player.inVehicle) return;

    buildings.forEach(b => {
        if (player.x > b.x && player.x < b.x + b.width &&
            player.y > b.y && player.y < b.y + b.height) {

            if (!b.checked && b.hasTank) {
                b.checked = true;
                player.inVehicle = 'tank';
                player.vehicleAmmo.tank = 40;
                player.vehicleAmmo.tankMG = 200;
                player.vehicleReloadTimer = 0;
                player.tankMode = 'cannon';
                showPickup('M1 Abrams Tank! (E turun, F switch mode)');
                updateHUD();
            }
        }
    });
}

function drawBackground() {
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const startX = -camera.x;
    const startY = -camera.y;

    ctx.strokeStyle = '#252540';
    ctx.lineWidth = 1;
    const gridStartX = Math.floor(camera.x / 50) * 50;
    const gridStartY = Math.floor(camera.y / 50) * 50;
    for (let x = gridStartX; x < camera.x + canvas.width + 50; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x - camera.x, 0);
        ctx.lineTo(x - camera.x, canvas.height);
        ctx.stroke();
    }
    for (let y = gridStartY; y < camera.y + canvas.height + 50; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y - camera.y);
        ctx.lineTo(canvas.width, y - camera.y);
        ctx.stroke();
    }

    ctx.fillStyle = '#2d5a27';
    decorations.forEach(d => {
        const drawX = d.x - camera.x;
        const drawY = d.y - camera.y;
        if (drawX > -50 && drawX < canvas.width + 50 && drawY > -50 && drawY < canvas.height + 50) {
            if (d.type === 'tree') {
                ctx.beginPath();
                ctx.arc(drawX, drawY, d.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#3d2a17';
                ctx.beginPath();
                ctx.arc(drawX, drawY + d.size * 0.3, d.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#2d5a27';
            } else {
                ctx.beginPath();
                ctx.arc(drawX, drawY, d.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    ctx.strokeStyle = '#ff4444';
    ctx.lineWidth = 3;
    ctx.strokeRect(-camera.x, -camera.y, WORLD_WIDTH, WORLD_HEIGHT);
}

function updateHUD() {
    document.getElementById('health-fill').style.width = player.health + '%';

    const weapon = WEAPONS[player.weapon];
    const ammoDisplay = document.getElementById('ammo-count');
    const vehicleIndicator = document.getElementById('vehicle-indicator');

    if (player.inVehicle) {
        vehicleIndicator.classList.remove('hidden');
        const isMG = player.tankMode === 'mg';
        const vAmmo = isMG ? player.vehicleAmmo['tankMG'] : player.vehicleAmmo['tank'];
        if (player.vehicleReloadTimer > 0) {
            ammoDisplay.textContent = 'RELOADING...';
            ammoDisplay.style.color = '#ffaa00';
        } else {
            ammoDisplay.textContent = vAmmo;
            ammoDisplay.style.color = isMG ? '#ff4' : '#4f4';
        }
        const modeName = isMG ? 'MG MODE' : 'CANNON';
        document.getElementById('weapon-name').textContent = 'M1 ABRAMS ' + modeName;
    } else {
        vehicleIndicator.classList.add('hidden');
        const ammo = player.ammo[player.weapon];
        if (player.isReloading) {
            ammoDisplay.textContent = 'RELOADING...';
            ammoDisplay.style.color = '#ffaa00';
        } else {
            ammoDisplay.textContent = ammo === Infinity ? '∞' : ammo;
            ammoDisplay.style.color = '#ff4444';
        }
        document.getElementById('weapon-name').textContent = weapon.name;
    }

    document.getElementById('kill-count').textContent = kills;
    document.getElementById('wave-count').textContent = wave;

    document.querySelectorAll('.inv-slot').forEach((slot, index) => {
        slot.classList.remove('active');
        const invWeapon = player.inventory[index];
        if (index === player.currentSlot) {
            slot.classList.add('active');
        }
        if (invWeapon) {
            const w = WEAPONS[invWeapon];
            slot.innerHTML = `<span class="slot-num">${index + 1}</span><span class="slot-icon" style="color:${w.color}">${w.name.split(' ')[0]}</span>`;
        } else {
            slot.innerHTML = `<span class="slot-num">${index + 1}</span><span class="slot-icon">-</span>`;
        }
    });
}

function showPickup(weaponName) {
    const pickup = document.getElementById('weapon-pickup');
    const text = document.getElementById('pickup-text');
    text.textContent = `Dapat ${weaponName}!`;
    pickup.classList.remove('hidden');
    setTimeout(() => pickup.classList.add('hidden'), 1500);
}

function gameOver() {
    gameState = 'gameover';
    document.getElementById('final-kills').textContent = kills;
    document.getElementById('final-wave').textContent = wave;
    document.getElementById('hud').classList.add('hidden');
    document.getElementById('game-over').classList.remove('hidden');
}

let enemySpawnTimer = 0;
let weaponSpawnTimer = 0;

function gameUpdate() {
    if (gameState !== 'playing') return;

    player.update();

    if (mouse.down && player.weapon !== 'knife') {
        player.shoot();
    } else if (mouse.down && player.weapon === 'knife') {
        player.melee();
    }

    updateBullets();
    updateEnemies();
    updateParticles();
    drawWeaponDrops();
    drawVehicleDrops();

    checkBuildingEntry();

    enemySpawnTimer++;
    if (enemySpawnTimer > 180) {
        spawnEnemy();
        enemySpawnTimer = 0;
    }

    weaponSpawnTimer++;
    if (weaponSpawnTimer > 400 && weaponDrops.length < 4) {
        spawnWeaponDrop();
        weaponSpawnTimer = 0;
    }

    if (kills >= wave * 8) {
        wave++;
        player.health = Math.min(100, player.health + 20);
        updateHUD();
    }

    drawBackground();
    drawBuildings();
    drawWeaponDrops();
    drawBullets();
    drawEnemies();
    player.draw();
    drawParticles();

    requestAnimationFrame(gameUpdate);
}

function startGame() {
    player = new Player();
    enemies = [];
    bullets = [];
    weaponDrops = [];
    vehicleDrops = [];
    particles = [];
    kills = 0;
    wave = 1;
    enemySpawnTimer = 0;
    weaponSpawnTimer = 0;
    camera.x = 0;
    camera.y = 0;

    generateDecorations();

    for (let i = 0; i < 3; i++) {
        setTimeout(() => spawnEnemy(), i * 800);
    }
    setTimeout(() => spawnWeaponDrop(), 3000);

    gameState = 'playing';
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');

    updateHUD();
    gameLoop = requestAnimationFrame(gameUpdate);
}

function showMenu() {
    gameState = 'menu';
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('pause-menu').classList.add('hidden');
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('hud').classList.add('hidden');
    if (gameLoop) cancelAnimationFrame(gameLoop);
}

function togglePause() {
    if (gameState === 'playing') {
        gameState = 'paused';
        document.getElementById('pause-menu').classList.remove('hidden');
    } else if (gameState === 'paused') {
        gameState = 'playing';
        document.getElementById('pause-menu').classList.add('hidden');
        gameLoop = requestAnimationFrame(gameUpdate);
    }
}

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('retry-btn').addEventListener('click', startGame);
document.getElementById('menu-btn').addEventListener('click', showMenu);
document.getElementById('resume-btn').addEventListener('click', togglePause);
document.getElementById('restart-btn').addEventListener('click', startGame);
document.getElementById('pause-btn').addEventListener('click', togglePause);
document.getElementById('quit-btn').addEventListener('click', showMenu);

document.getElementById('tutorial-btn').addEventListener('click', () => {
    document.getElementById('tutorial-modal').classList.remove('hidden');
});

document.getElementById('close-tutorial').addEventListener('click', () => {
    document.getElementById('tutorial-modal').classList.add('hidden');
});

document.querySelectorAll('.inv-slot').forEach((slot, index) => {
    slot.addEventListener('click', (e) => {
        if (gameState === 'playing' && player) {
            if (e.shiftKey) {
                player.switchSlot(index, true);
                showPickup('Weapon swapped!');
            } else {
                player.switchSlot(index);
            }
        }
    });

    slot.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (gameState === 'playing' && player) {
            const dropped = player.dropWeapon(index);
            if (dropped) {
                weaponDrops.push(new WeaponDrop(player.x, player.y, dropped));
                showPickup(WEAPONS[dropped].name + ' dropped on ground!');
            }
        }
    });
});

document.addEventListener('keydown', e => {
    keys[e.key.toLowerCase()] = true;

    if (e.key === 'Escape' && gameState !== 'menu') {
        togglePause();
    }

    if (e.key >= '1' && e.key <= '3') {
        const slot = parseInt(e.key) - 1;
        if (e.shiftKey) {
            player.switchSlot(slot, true);
            showPickup('Weapon swapped!');
        } else {
            player.switchSlot(slot);
        }
    }

    if ((e.key.toLowerCase() === 'x' || e.key.toLowerCase() === 'g') && player && gameState === 'playing') {
        const dropped = player.dropWeapon(player.currentSlot);
        if (dropped) {
            weaponDrops.push(new WeaponDrop(player.x, player.y, dropped));
            showPickup(WEAPONS[dropped].name + ' dropped on ground!');
        }
    }

    if (e.key === 'Tab') {
        e.preventDefault();
        player.switchSlot((player.currentSlot + 1) % 3);
    }

    if (e.key.toLowerCase() === 'r' && player && gameState === 'playing') {
        if (player.inVehicle) {
            player.vehicleAmmo['tank'] = player.vehicleMaxAmmo['tank'];
            player.vehicleAmmo['tankMG'] = player.vehicleMaxAmmo['tankMG'];
            player.vehicleReloadTimer = 0;
            updateHUD();
            showPickup('Tank reloaded (Cannon & MG)!');
        } else {
            player.reload();
        }
    }

    if (e.key.toLowerCase() === 'e' && player && gameState === 'playing') {
        if (player && player.inVehicle) {
            const exitX = player.x;
            const exitY = player.y;
            player.inVehicle = null;
            player.weapon = 'knife';
            vehicleDrops.push(new VehicleDrop(exitX, exitY, 'tank'));
            showPickup('Turun dari Tank (E untuk masuk lagi)');
            updateHUD();
        } else if (player) {
            checkTankReenter();
        }
    }

    if (e.key.toLowerCase() === 'f' && player && gameState === 'playing' && player.inVehicle) {
        player.switchTankMode();
        const mode = player.tankMode === 'mg' ? 'Machine Gun' : 'Cannon';
        showPickup('Mode: ' + mode);
    }
});

document.addEventListener('keyup', e => {
    keys[e.key.toLowerCase()] = false;
});

canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener('mousedown', () => mouse.down = true);
canvas.addEventListener('mouseup', () => mouse.down = false);
canvas.addEventListener('contextmenu', e => e.preventDefault());