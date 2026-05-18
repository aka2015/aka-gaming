function generateMap() {
    const map = [];
    for (let y = 0; y < MAP_HEIGHT; y++) {
        map[y] = [];
        for (let x = 0; x < MAP_WIDTH; x++) {
            map[y][x] = TILE_TYPES.GRASS;
        }
    }

    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (Math.random() < 0.05) {
                map[y][x] = TILE_TYPES.FLOWER;
            }
        }
    }

    for (let x = 15; x <= 45; x++) {
        map[22][x] = TILE_TYPES.PATH;
        map[23][x] = TILE_TYPES.PATH;
    }
    for (let y = 15; y <= 40; y++) {
        map[y][25] = TILE_TYPES.PATH;
        map[y][26] = TILE_TYPES.PATH;
    }
    for (let x = 30; x <= 55; x++) {
        map[32][x] = TILE_TYPES.PATH;
    }
    for (let y = 10; y <= 25; y++) {
        map[y][50] = TILE_TYPES.PATH;
    }

    map[19][22] = TILE_TYPES.HOUSE;
    map[19][23] = TILE_TYPES.HOUSE;
    map[18][22] = TILE_TYPES.HOUSE;
    map[18][23] = TILE_TYPES.HOUSE;
    map[24][30] = TILE_TYPES.HOUSE;
    map[24][31] = TILE_TYPES.HOUSE;
    map[25][22] = TILE_TYPES.HOUSE;
    map[27][35] = TILE_TYPES.HOUSE;
    map[27][36] = TILE_TYPES.HOUSE;

    map[22][50] = TILE_TYPES.WATER;
    map[23][50] = TILE_TYPES.WATER;
    map[24][50] = TILE_TYPES.WATER;
    map[22][51] = TILE_TYPES.WATER;
    map[23][51] = TILE_TYPES.WATER;
    map[24][51] = TILE_TYPES.WATER;
    map[10][60] = TILE_TYPES.WATER;
    map[11][60] = TILE_TYPES.WATER;
    map[10][61] = TILE_TYPES.WATER;
    map[11][61] = TILE_TYPES.WATER;

    map[22][49] = TILE_TYPES.BRIDGE;
    map[22][52] = TILE_TYPES.BRIDGE;
    map[23][49] = TILE_TYPES.BRIDGE;
    map[23][52] = TILE_TYPES.BRIDGE;

    const treePositions = [
        [5, 5], [6, 5], [7, 5], [8, 5],
        [5, 6], [6, 6], [7, 6], [8, 6],
        [5, 7], [6, 7], [7, 7], [8, 7],
        [60, 5], [61, 5], [62, 5], [63, 5],
        [60, 6], [61, 6], [62, 6], [63, 6],
        [60, 7], [61, 7], [62, 7], [63, 7],
        [10, 40], [11, 40], [12, 40],
        [10, 41], [11, 41], [12, 41],
        [10, 42], [11, 42], [12, 42],
        [65, 35], [66, 35], [67, 35],
        [65, 36], [66, 36], [67, 36],
        [35, 45], [36, 45], [37, 45],
        [40, 15], [41, 15], [42, 15],
        [55, 55], [56, 55], [57, 55],
        [55, 56], [56, 56], [57, 56],
        [15, 10], [16, 10], [17, 10],
        [30, 50], [31, 50], [32, 50],
        [70, 10], [71, 10], [72, 10], [73, 10],
        [70, 11], [71, 11], [72, 11], [73, 11],
    ];

    for (const [tx, ty] of treePositions) {
        if (tx < MAP_WIDTH && ty < MAP_HEIGHT) {
            map[ty][tx] = TILE_TYPES.TREE;
        }
    }

    map[26][20] = TILE_TYPES.WELL;
    map[28][45] = TILE_TYPES.WELL;

    for (let x = 18; x <= 22; x++) {
        map[16][x] = TILE_TYPES.FENCE;
    }
    for (let y = 16; y <= 20; y++) {
        map[y][18] = TILE_TYPES.FENCE;
    }
    for (let y = 16; y <= 20; y++) {
        map[y][22] = TILE_TYPES.FENCE;
    }

    map[33][40] = TILE_TYPES.ROCK;
    map[34][41] = TILE_TYPES.ROCK;
    map[33][42] = TILE_TYPES.ROCK;
    map[48][20] = TILE_TYPES.ROCK;
    map[49][21] = TILE_TYPES.ROCK;

    map[29][28] = TILE_TYPES.SIGN;
    map[45][30] = TILE_TYPES.SIGN;
    map[15][40] = TILE_TYPES.SIGN;

    if (!SPAWN_POINTS.chests) {
        SPAWN_POINTS.chests = [
            { x: 8, y: 8 },
            { x: 55, y: 15 },
            { x: 50, y: 40 },
            { x: 20, y: 50 },
            { x: 45, y: 55 },
            { x: 45, y: 25 }
        ];
    }

    for (const spawn of SPAWN_POINTS.chests) {
        if (spawn.x < MAP_WIDTH && spawn.y < MAP_HEIGHT) {
            map[spawn.y][spawn.x] = TILE_TYPES.CHEST;
        }
    }

    return map;
}

function renderMap(dayPhase) {
    const startTileX = Math.floor(camera.x / TILE_SIZE);
    const startTileY = Math.floor(camera.y / TILE_SIZE);
    const endTileX = Math.ceil((camera.x + canvas.width) / TILE_SIZE);
    const endTileY = Math.ceil((camera.y + canvas.height) / TILE_SIZE);

    const animOffset = Math.sin(gameState.gameTime * 2) * 2;

    for (let y = Math.max(0, startTileY); y < Math.min(MAP_HEIGHT, endTileY); y++) {
        for (let x = Math.max(0, startTileX); x < Math.min(MAP_WIDTH, endTileX); x++) {
            const tileType = gameState.map[y][x];
            const screenX = x * TILE_SIZE - camera.x;
            const screenY = y * TILE_SIZE - camera.y;

            const colors = TILE_COLORS[tileType];
            const variantIndex = (x + y) % colors.variant.length;
            const color = colors.variant[variantIndex];

            ctx.fillStyle = color;
            ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

            if (tileType === TILE_TYPES.WATER) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + Math.sin(gameState.gameTime * 3 + x + y) * 0.1})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(screenX, screenY + TILE_SIZE / 2 + animOffset);
                ctx.quadraticCurveTo(screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2 + animOffset - 5, screenX + TILE_SIZE, screenY + TILE_SIZE / 2 + animOffset);
                ctx.stroke();
            }

            if (tileType === TILE_TYPES.FLOWER) {
                const flowerColors = ['#ff6b8a', '#ffaa44', '#ff44ff', '#44aaff'];
                for (let i = 0; i < 3; i++) {
                    const fx = screenX + 10 + i * 12;
                    const fy = screenY + 15 + Math.sin(gameState.gameTime * 2 + i) * 2;
                    ctx.fillStyle = '#2d5a1e';
                    ctx.fillRect(fx + 2, fy + 4, 1, 6);
                    ctx.fillStyle = flowerColors[i];
                    ctx.beginPath();
                    ctx.arc(fx + 2.5, fy + 2, 3, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            if (tileType === TILE_TYPES.TREE) {
                const sway = Math.sin(gameState.gameTime + x * 0.5) * 2;
                
                ctx.fillStyle = '#5a4a2a';
                ctx.fillRect(screenX + 20, screenY + 28, 8, 20);

                ctx.fillStyle = '#2d5a1e';
                ctx.beginPath();
                ctx.arc(screenX + 24 + sway, screenY + 20, 16, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#3d6a2e';
                ctx.beginPath();
                ctx.arc(screenX + 20 + sway, screenY + 16, 10, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#4a8a3e';
                ctx.beginPath();
                ctx.arc(screenX + 28 + sway, screenY + 18, 8, 0, Math.PI * 2);
                ctx.fill();
            }

            if (tileType === TILE_TYPES.CHEST) {
                const glow = Math.sin(gameState.gameTime * 4) * 0.3 + 0.7;
                ctx.shadowColor = '#ffd700';
                ctx.shadowBlur = 10 * glow;
                
                ctx.fillStyle = '#8b6914';
                ctx.fillRect(screenX + 12, screenY + 20, 24, 16);
                ctx.fillStyle = '#9b7924';
                ctx.fillRect(screenX + 12, screenY + 16, 24, 8);
                ctx.fillStyle = '#ffd700';
                ctx.fillRect(screenX + 22, screenY + 22, 4, 6);
                
                ctx.shadowBlur = 0;
            }
        }
    }
}
