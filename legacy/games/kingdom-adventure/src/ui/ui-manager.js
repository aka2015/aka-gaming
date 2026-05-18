function setupUI() {
    const playBtn = document.getElementById('playBtn');
    const controlsBtn = document.getElementById('controlsBtn');
    const aboutBtn = document.getElementById('aboutBtn');
    const backToMenuFromCharSelect = document.getElementById('backToMenuFromCharSelect');
    const backToMenuFromControls = document.getElementById('backToMenuFromControls');
    const backToMenuFromAbout = document.getElementById('backToMenuFromAbout');
    const selectBtns = document.querySelectorAll('.select-btn');

    console.log('Setting up UI...');

    if (playBtn) {
        playBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            initAudio();
            changeState(GameStates.CHARACTER_SELECT);
            drawCharacterPreviews();
        });
    }

    if (controlsBtn) {
        controlsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeState(GameStates.CONTROLS);
        });
    }

    if (aboutBtn) {
        aboutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeState(GameStates.ABOUT);
        });
    }

    if (backToMenuFromCharSelect) {
        backToMenuFromCharSelect.addEventListener('click', (e) => {
            e.stopPropagation();
            changeState(GameStates.MENU);
        });
    }

    if (backToMenuFromControls) {
        backToMenuFromControls.addEventListener('click', (e) => {
            e.stopPropagation();
            changeState(GameStates.MENU);
        });
    }

    if (backToMenuFromAbout) {
        backToMenuFromAbout.addEventListener('click', (e) => {
            e.stopPropagation();
            changeState(GameStates.MENU);
        });
    }

    selectBtns.forEach((btn) => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            initAudio();
            const characterType = btn.dataset.character;
            selectCharacter(characterType);
        });
    });

    document.getElementById('dialogBox').addEventListener('click', () => {
        if (gameState.current === GameStates.DIALOG) {
            advanceDialog();
        }
    });

    document.getElementById('closeInventoryBtn').addEventListener('click', () => {
        closeInventory();
    });

    document.getElementById('musicToggleBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        const enabled = toggleBackgroundMusic();
        document.getElementById('musicToggleBtn').textContent = enabled ? '🎵' : '🔇';
    });

    document.getElementById('closeQuestBtn').addEventListener('click', () => {
        closeQuest();
    });
}

function drawCharacterPreviews() {
    for (const [key, data] of Object.entries(CHARACTER_DATA)) {
        const previewCanvas = document.getElementById(key + 'Preview');
        if (!previewCanvas) continue;

        const ctx = previewCanvas.getContext('2d');
        ctx.clearRect(0, 0, 96, 96);

        const sprite = spriteGenerator.getCharacterSprite(key, 'down', 0);
        if (sprite) {
            ctx.drawImage(sprite, 24, 24, 48, 48);
        }
    }
}

function selectCharacter(characterType) {
    gameState.selectedCharacter = characterType;
    gameState.player = createPlayer(characterType);
    gameState.npcs = createNPCs();
    gameState.items = createItems();
    gameState.map = generateMap();
    gameState.monsters = createMonsters();
    gameState.crystals = [...SPAWN_POINTS.crystals];
    gameState.inventory = [];
    gameState.gold = 50;
    gameState.xp = 0;
    gameState.level = 1;
    gameState.quests = { find_crystals: { progress: 0, target: 5, completed: false } };
    gameState.monstersDefeated = 0;
    gameState.oreCollected = 0;
    gameState.gameTime = 0;
    gameState.dayTime = 6;
    gameState.particles = [];

    changeState(GameStates.PLAYING);
}

function openInventory() {
    const inventoryGrid = document.getElementById('inventoryGrid');
    if (!inventoryGrid) return;

    inventoryGrid.innerHTML = '';

    if (gameState.inventory.length === 0) {
        inventoryGrid.innerHTML = '<p class="empty-inventory">Inventory kosong</p>';
    } else {
        for (const item of gameState.inventory) {
            const itemEl = document.createElement('div');
            itemEl.className = 'inventory-item';
            itemEl.innerHTML = `
                <span class="item-emoji">${item.emoji}</span>
                <span class="item-name">${item.name}</span>
            `;
            inventoryGrid.appendChild(itemEl);
        }
    }

    changeState(GameStates.INVENTORY);
}

function closeInventory() {
    changeState(GameStates.PLAYING);
}

function renderMinimap() {
    const minimapCanvas = document.getElementById('minimapCanvas');
    if (!minimapCanvas || !gameState.player) return;

    const ctx = minimapCanvas.getContext('2d');
    const scale = 150 / MAP_WIDTH;

    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 150, 150);

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            const tile = gameState.map[y][x];
            if (tile === TILE_TYPES.WATER) {
                ctx.fillStyle = '#3a7abd';
            } else if (tile === TILE_TYPES.PATH) {
                ctx.fillStyle = '#c4a45a';
            } else if (tile === TILE_TYPES.TREE) {
                ctx.fillStyle = '#2d5a1e';
            } else if (tile === TILE_TYPES.HOUSE) {
                ctx.fillStyle = '#8b6b4a';
            } else {
                ctx.fillStyle = '#2a3a20';
            }
            ctx.fillRect(x * scale, y * scale, scale + 0.5, scale + 0.5);
        }
    }

    for (const npc of gameState.npcs) {
        ctx.fillStyle = '#ffff00';
        ctx.fillRect(npc.x * scale - 1, npc.y * scale - 1, 3, 3);
    }

    for (const monster of gameState.monsters) {
        if (monster.hp > 0) {
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(monster.x * scale - 1, monster.y * scale - 1, 3, 3);
        }
    }

    ctx.fillStyle = '#44ff44';
    ctx.fillRect(gameState.player.x * scale - 2, gameState.player.y * scale - 2, 5, 5);

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    const camX = camera.x / TILE_SIZE * scale;
    const camY = camera.y / TILE_SIZE * scale;
    const camW = canvas.width / TILE_SIZE * scale;
    const camH = canvas.height / TILE_SIZE * scale;
    ctx.strokeRect(camX, camY, camW, camH);
}

function createMonsters() {
    const monsters = [];

    for (const spawn of SPAWN_POINTS.monsters) {
        const data = MONSTER_DATA[spawn.type];
        monsters.push({
            type: spawn.type,
            name: data.name,
            x: spawn.x,
            y: spawn.y,
            startX: spawn.x,
            startY: spawn.y,
            hp: data.hp,
            maxHp: data.hp,
            attack: data.attack,
            speed: data.speed,
            xp: data.xp,
            gold: data.gold,
            size: data.size,
            animFrame: 0,
            animTimer: 0,
            moveTimer: 0,
            patrolRadius: 3
        });
    }

    return monsters;
}

function updateMonsters(deltaTime) {
    for (const monster of gameState.monsters) {
        if (monster.hp <= 0) continue;

        if (gameState.player) {
            const dx = gameState.player.x - monster.x;
            const dy = gameState.player.y - monster.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 8) {
                monster.moveTimer += deltaTime;
                if (monster.moveTimer > 0.5) {
                    monster.moveTimer = 0;

                    const moveX = (dx / dist) * monster.speed * deltaTime;
                    const moveY = (dy / dist) * monster.speed * deltaTime;

                    const newX = monster.x + moveX;
                    const newY = monster.y + moveY;

                    if (!isTileSolid(Math.floor(newX), Math.floor(monster.y))) {
                        monster.x = newX;
                    }
                    if (!isTileSolid(Math.floor(monster.x), Math.floor(newY))) {
                        monster.y = newY;
                    }
                }
            } else {
                monster.moveTimer += deltaTime;
                if (monster.moveTimer > 2 + Math.random() * 2) {
                    monster.moveTimer = 0;

                    const offsetX = (Math.random() - 0.5) * monster.patrolRadius * 2;
                    const offsetY = (Math.random() - 0.5) * monster.patrolRadius * 2;

                    monster.x = Math.max(0, Math.min(MAP_WIDTH - 1, monster.startX + offsetX));
                    monster.y = Math.max(0, Math.min(MAP_HEIGHT - 1, monster.startY + offsetY));
                }
            }
        }

        monster.animTimer += deltaTime;
        if (monster.animTimer > 0.3) {
            monster.animTimer = 0;
            monster.animFrame = (monster.animFrame + 1) % 4;
        }
    }
}
