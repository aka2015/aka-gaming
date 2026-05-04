const ATTACK_COOLDOWN = 0.8;
const ATTACK_RANGE = 1.5;
let lastAttackTime = 0;

function createPlayer(characterType) {
    const data = CHARACTER_DATA[characterType];
    
    return {
        characterType: characterType,
        x: 25,
        y: 24,
        direction: 'down',
        animFrame: 0,
        animTimer: 0,
        speed: data.stats.speed,
        hp: data.stats.hp,
        maxHp: data.stats.hp,
        attack: data.stats.attack,
        isMoving: false,
        isAttacking: false,
        attackTimer: 0
    };
}

function updatePlayer(deltaTime) {
    if (!gameState.player) return;

    const player = gameState.player;
    let dx = 0;
    let dy = 0;

    if (keys.up) dy = -1;
    if (keys.down) dy = 1;
    if (keys.left) dx = -1;
    if (keys.right) dx = 1;

    if (dx !== 0 && dy !== 0) {
        dx *= 0.707;
        dy *= 0.707;
    }

    player.isMoving = dx !== 0 || dy !== 0;

    if (dx > 0) player.direction = 'right';
    else if (dx < 0) player.direction = 'left';
    else if (dy > 0) player.direction = 'down';
    else if (dy < 0) player.direction = 'up';

    if (player.isAttacking) {
        player.attackTimer -= deltaTime;
        if (player.attackTimer <= 0) {
            player.isAttacking = false;
        }
    }

    if (player.isMoving) {
        player.animTimer += deltaTime;
        if (player.animTimer > 0.15) {
            player.animTimer = 0;
            player.animFrame = (player.animFrame + 1) % 4;
        }

        const newX = player.x + dx * player.speed * deltaTime;
        const newY = player.y + dy * player.speed * deltaTime;

        if (!isTileSolid(Math.floor(newX), Math.floor(player.y))) {
            player.x = newX;
        }
        if (!isTileSolid(Math.floor(player.x), Math.floor(newY))) {
            player.y = newY;
        }

        player.x = Math.max(0, Math.min(MAP_WIDTH - 1, player.x));
        player.y = Math.max(0, Math.min(MAP_HEIGHT - 1, player.y));
    } else {
        player.animFrame = 0;
    }

    checkItemPickup();
    autoAttack(deltaTime);
    checkMonsterDamage();
}

function isTileSolid(x, y) {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return true;
    
    const tile = gameState.map[y][x];
    const solidTiles = [TILE_TYPES.WATER, TILE_TYPES.TREE, TILE_TYPES.HOUSE, TILE_TYPES.FENCE, TILE_TYPES.ROCK, TILE_TYPES.WELL];
    return solidTiles.includes(tile);
}

function checkItemPickup() {
    const player = gameState.player;

    for (const item of gameState.items) {
        if (item.collected) continue;

        const dx = item.x - player.x;
        const dy = item.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.8) {
            item.collected = true;
            addItem(item.key);
            playPickupSound();

            if (item.key === 'gold_coin') {
                addGold(10);
            } else if (item.key === 'health_potion') {
                player.hp = Math.min(player.hp + 30, player.maxHp);
                spawnParticles(item.x * TILE_SIZE + TILE_SIZE / 2, item.y * TILE_SIZE + TILE_SIZE / 2, '#ff4444', 8);
            }

            addXP(5);
            spawnParticles(item.x * TILE_SIZE + TILE_SIZE / 2, item.y * TILE_SIZE + TILE_SIZE / 2, '#ffd700', 12);
        }
    }
}

function autoAttack(deltaTime) {
    const player = gameState.player;
    
    if (player.isAttacking) return;

    for (const monster of gameState.monsters) {
        if (monster.hp <= 0) continue;

        const dx = monster.x - player.x;
        const dy = monster.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < ATTACK_RANGE) {
            player.isAttacking = true;
            player.attackTimer = 0.3;

            const playerDamage = player.attack + Math.floor(gameState.level / 2);
            monster.hp -= playerDamage;
            addXP(monster.xp);
            addGold(monster.gold);

            playAttackSound();
            setTimeout(() => playHitSound(), 100);

            spawnParticles(monster.x * TILE_SIZE + TILE_SIZE / 2, monster.y * TILE_SIZE + TILE_SIZE / 2, '#ffaa00', 10);

            if (monster.hp <= 0) {
                gameState.monstersDefeated++;
                if (!gameState.quests.defeat_monsters) {
                    gameState.quests.defeat_monsters = { progress: 0, target: 10, completed: false };
                }
                gameState.quests.defeat_monsters.progress = gameState.monstersDefeated;
                if (gameState.quests.defeat_monsters.progress >= 10 && !gameState.quests.defeat_monsters.completed) {
                    gameState.quests.defeat_monsters.completed = true;
                    addXP(QUEST_DATA.defeat_monsters.reward.xp);
                    addGold(QUEST_DATA.defeat_monsters.reward.gold);
                    showNotification('Quest Complete: Monster Hunter!');
                }
            }

            return;
        }
    }
}

function checkMonsterDamage() {
    const player = gameState.player;

    for (const monster of gameState.monsters) {
        if (monster.hp <= 0) continue;

        const dx = monster.x - player.x;
        const dy = monster.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 0.6) {
            const damage = Math.max(1, monster.attack - Math.floor(gameState.level / 2));
            player.hp -= damage;

            if (player.hp <= 0) {
                player.hp = player.maxHp;
                player.x = 25;
                player.y = 24;
                showNotification('Kamu pingsan! HP dipulihkan.');
            }

            const knockbackX = (player.x - monster.x) * 3;
            const knockbackY = (player.y - monster.y) * 3;
            player.x += knockbackX;
            player.y += knockbackY;

            spawnParticles(player.x * TILE_SIZE + TILE_SIZE / 2, player.y * TILE_SIZE + TILE_SIZE / 2, '#ff0000', 5);
        }
    }
}

function tryOpenChest(player) {
    if (!gameState.map) return;

    const px = Math.floor(player.x);
    const py = Math.floor(player.y);

    const nearby = [
        [px, py],
        [px + 1, py],
        [px - 1, py],
        [px, py + 1],
        [px, py - 1],
        [px + 1, py + 1],
        [px - 1, py - 1],
        [px + 1, py - 1],
        [px - 1, py + 1]
    ];

    for (const [cx, cy] of nearby) {
        if (cx < 0 || cx >= MAP_WIDTH || cy < 0 || cy >= MAP_HEIGHT) continue;
        if (gameState.map[cy][cx] !== TILE_TYPES.CHEST) continue;

        const goldReward = 20 + Math.floor(Math.random() * 30);
        const xpReward = 10 + Math.floor(Math.random() * 20);

        addGold(goldReward);
        addXP(xpReward);

        const itemRoll = Math.random();
        if (itemRoll < 0.3) {
            addItem('health_potion');
        } else if (itemRoll < 0.5) {
            addItem('magic_scroll');
        }

        gameState.map[cy][cx] = TILE_TYPES.GRASS;

        playChestOpenSound();
        showNotification(`Mendapatkan chest! +${goldReward} gold, +${xpReward} XP`);
        spawnParticles(cx * TILE_SIZE + TILE_SIZE / 2, cy * TILE_SIZE + TILE_SIZE / 2, '#ffd700', 20);
        return;
    }
}
