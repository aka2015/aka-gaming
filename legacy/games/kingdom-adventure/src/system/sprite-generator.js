class SpriteGenerator {
    constructor() {
        this.characterSprites = {};
        this.npcSprites = {};
        this.monsterSprites = {};
        this.itemSprites = {};
        this.tileSprites = {};
    }

    generateAll() {
        for (const [key, data] of Object.entries(CHARACTER_DATA)) {
            this.characterSprites[key] = this.generateCharacterSprite(data.colors);
        }
        for (const npc of NPC_DATA) {
            this.npcSprites[npc.id] = this.generateNPCSprite(npc.color, npc.emoji);
        }
        for (const [key, data] of Object.entries(MONSTER_DATA)) {
            this.monsterSprites[key] = this.generateMonsterSprite(data.color, data.size);
        }
        for (const [key, data] of Object.entries(ITEM_DATA)) {
            this.itemSprites[key] = this.generateItemSprite(data.emoji, data.color);
        }
        for (const [key, data] of Object.entries(TILE_TYPES)) {
            if (key !== 'GRASS' && key !== 'PATH') {
                this.tileSprites[key] = this.generateTileSprite(parseInt(key));
            }
        }
    }

    generateCharacterSprite(colors) {
        const frames = { down: [], up: [], left: [], right: [] };
        const frameSize = 24;
        const scale = 2;

        for (let f = 0; f < 4; f++) {
            frames.down.push(this.drawCharacterFrame(colors, 'down', f, frameSize, scale));
            frames.up.push(this.drawCharacterFrame(colors, 'up', f, frameSize, scale));
            frames.left.push(this.drawCharacterFrame(colors, 'left', f, frameSize, scale));
            frames.right.push(this.drawCharacterFrame(colors, 'right', f, frameSize, scale));
        }

        return frames;
    }

    drawCharacterFrame(colors, direction, frame, size, scale) {
        const canvas = document.createElement('canvas');
        canvas.width = size * scale;
        canvas.height = size * scale;
        const ctx = canvas.getContext('2d');
        ctx.scale(scale, scale);

        const bobY = frame % 2 === 0 ? 0 : -1;
        const legOffset = Math.sin(frame * Math.PI / 2) * 2;

        ctx.save();
        ctx.translate(size / 2, size / 2 + bobY);

        const headSize = 5;
        const bodyHeight = 8;
        const legLength = 5;

        if (direction === 'down' || direction === 'up') {
            this.drawBody(ctx, colors, bodyHeight, headSize, direction);
            
            ctx.fillStyle = colors.body;
            ctx.fillRect(-4, 0, 3, legLength);
            ctx.fillRect(1, 0, 3, legLength);

            if (direction === 'down') {
                ctx.fillStyle = colors.skin;
                ctx.beginPath();
                ctx.arc(0, -bodyHeight / 2 - headSize / 2 + 1, headSize, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = '#000';
                ctx.fillRect(-2, -bodyHeight / 2 - headSize / 2, 1.5, 1.5);
                ctx.fillRect(1, -bodyHeight / 2 - headSize / 2, 1.5, 1.5);
            } else {
                ctx.fillStyle = colors.bodyDark;
                ctx.beginPath();
                ctx.arc(0, -bodyHeight / 2 - headSize / 2 + 1, headSize, 0, Math.PI * 2);
                ctx.fill();
            }

            if (direction === 'down' && colors.sword) {
                ctx.fillStyle = colors.sword;
                ctx.save();
                ctx.rotate(Math.sin(frame * Math.PI / 2) * 0.2);
                ctx.fillRect(4, -2, 1.5, 8);
                ctx.fillStyle = colors.swordHandle || '#8b4513';
                ctx.fillRect(3.5, 5, 2.5, 2);
                ctx.restore();
            }

            if (direction === 'down' && colors.staff) {
                ctx.fillStyle = colors.staff;
                ctx.save();
                ctx.rotate(Math.sin(frame * Math.PI / 2) * 0.15);
                ctx.fillRect(5, -4, 1.5, 10);
                ctx.fillStyle = colors.staffGem || '#ff44ff';
                ctx.beginPath();
                ctx.arc(5.75, -5, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }

            if (direction === 'down' && colors.bow) {
                ctx.strokeStyle = colors.bow;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(6, -1, 4, -Math.PI / 2, Math.PI / 2);
                ctx.stroke();
                ctx.strokeStyle = colors.bowString || '#ccc';
                ctx.beginPath();
                ctx.moveTo(6, -5);
                ctx.lineTo(6, 3);
                ctx.stroke();
            }

        } else {
            this.drawSideBody(ctx, colors, bodyHeight, headSize, direction === 'left' ? -1 : 1);

            ctx.fillStyle = colors.body;
            ctx.fillRect(-2 + legOffset * (direction === 'left' ? -1 : 1), 0, 3, legLength);
            ctx.fillRect(1 - legOffset * (direction === 'left' ? -1 : 1), 0, 3, legLength);

            const sideX = direction === 'left' ? -1 : 1;
            ctx.fillStyle = colors.skin;
            ctx.beginPath();
            ctx.arc(sideX, -bodyHeight / 2 - headSize / 2 + 1, headSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.fillRect(sideX - 1, -bodyHeight / 2 - headSize / 2, 1.5, 1.5);
        }

        ctx.restore();
        return canvas;
    }

    drawBody(ctx, colors, bodyHeight, headSize, direction) {
        ctx.fillStyle = colors.body;
        ctx.fillRect(-4, -bodyHeight / 2, 8, bodyHeight);

        ctx.fillStyle = colors.bodyLight;
        ctx.fillRect(-4, -bodyHeight / 2, 8, 2);

        if (colors.helmet) {
            ctx.fillStyle = colors.helmet;
            ctx.beginPath();
            ctx.arc(0, -bodyHeight / 2 - headSize / 2 + 2, headSize + 1, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = colors.helmetLight;
            ctx.fillRect(-headSize, -bodyHeight / 2 - headSize / 2 + 1, headSize * 2, 2);
        }

        if (colors.hat) {
            ctx.fillStyle = colors.hat;
            ctx.beginPath();
            ctx.moveTo(-headSize - 2, -bodyHeight / 2 - headSize / 2 + 2);
            ctx.lineTo(0, -bodyHeight / 2 - headSize - 3);
            ctx.lineTo(headSize + 2, -bodyHeight / 2 - headSize / 2 + 2);
            ctx.fill();
            ctx.fillStyle = colors.hatLight;
            ctx.fillRect(-headSize - 1, -bodyHeight / 2 - headSize / 2 + 1, (headSize + 1) * 2, 2);
        }

        if (colors.hood) {
            ctx.fillStyle = colors.hood;
            ctx.beginPath();
            ctx.arc(0, -bodyHeight / 2 - headSize / 2 + 2, headSize + 2, Math.PI, 0);
            ctx.fill();
            ctx.fillStyle = colors.hoodLight;
            ctx.fillRect(-3, -bodyHeight / 2 - headSize / 2 + 1, 6, 2);
        }
    }

    drawSideBody(ctx, colors, bodyHeight, headSize, sideDir) {
        ctx.fillStyle = colors.body;
        ctx.fillRect(-3, -bodyHeight / 2, 6, bodyHeight);

        ctx.fillStyle = colors.bodyDark;
        ctx.fillRect(-3, -bodyHeight / 2, 2, bodyHeight);

        ctx.fillStyle = colors.bodyLight;
        ctx.fillRect(1, -bodyHeight / 2, 2, bodyHeight);

        if (colors.helmet) {
            ctx.fillStyle = colors.helmet;
            ctx.beginPath();
            ctx.arc(sideDir, -bodyHeight / 2 - headSize / 2 + 2, headSize + 1, Math.PI, 0);
            ctx.fill();
        }

        if (colors.hat) {
            ctx.fillStyle = colors.hat;
            ctx.beginPath();
            ctx.moveTo(sideDir * (headSize + 1), -bodyHeight / 2 - headSize / 2 + 2);
            ctx.lineTo(sideDir * 2, -bodyHeight / 2 - headSize - 3);
            ctx.lineTo(sideDir * (headSize + 2), -bodyHeight / 2 - headSize / 2 + 2);
            ctx.fill();
        }

        if (colors.hood) {
            ctx.fillStyle = colors.hood;
            ctx.beginPath();
            ctx.arc(sideDir, -bodyHeight / 2 - headSize / 2 + 2, headSize + 2, Math.PI, 0);
            ctx.fill();
        }
    }

    generateNPCSprite(color, emoji) {
        const frames = { down: [], up: [], left: [], right: [] };
        const frameSize = 24;
        const scale = 2;

        for (let f = 0; f < 4; f++) {
            for (const dir of ['down', 'up', 'left', 'right']) {
                const canvas = document.createElement('canvas');
                canvas.width = frameSize * scale;
                canvas.height = frameSize * scale;
                const ctx = canvas.getContext('2d');
                ctx.scale(scale, scale);

                const bobY = f % 2 === 0 ? 0 : -1;
                const legOffset = Math.sin(f * Math.PI / 2) * 2;

                ctx.save();
                ctx.translate(frameSize / 2, frameSize / 2 + bobY);

                ctx.fillStyle = color;
                ctx.fillRect(-4, -4, 8, 10);

                ctx.fillStyle = '#f4c29f';
                ctx.beginPath();
                ctx.arc(0, -8, 5, 0, Math.PI * 2);
                ctx.fill();

                if (dir === 'down') {
                    ctx.fillStyle = '#000';
                    ctx.fillRect(-2, -9, 1.5, 1.5);
                    ctx.fillRect(1, -9, 1.5, 1.5);
                } else if (dir === 'up') {
                    ctx.fillStyle = color;
                    ctx.beginPath();
                    ctx.arc(0, -8, 5, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    const sideX = dir === 'left' ? -1 : 1;
                    ctx.fillStyle = '#000';
                    ctx.fillRect(sideX - 1, -9, 1.5, 1.5);
                }

                ctx.fillStyle = '#333';
                ctx.fillRect(-4 + legOffset, 6, 3, 5);
                ctx.fillRect(1 - legOffset, 6, 3, 5);

                ctx.restore();
                frames[dir].push(canvas);
            }
        }

        return { frames, emoji };
    }

    generateMonsterSprite(color, size) {
        const frames = [];
        const frameSize = 24;
        const scale = 2;

        for (let f = 0; f < 4; f++) {
            const canvas = document.createElement('canvas');
            canvas.width = frameSize * scale;
            canvas.height = frameSize * scale;
            const ctx = canvas.getContext('2d');
            ctx.scale(scale, scale);

            ctx.save();
            ctx.translate(frameSize / 2, frameSize / 2);

            const squish = Math.sin(f * Math.PI / 2) * 2;
            const monsterSize = size * 10;

            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(0, squish, monsterSize, monsterSize - squish, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#000';
            ctx.fillRect(-3, -2, 2, 2.5);
            ctx.fillRect(2, -2, 2, 2.5);

            ctx.fillStyle = '#fff';
            ctx.fillRect(-2.5, -1.5, 1, 1);
            ctx.fillRect(2.5, -1.5, 1, 1);

            if (size > 1) {
                ctx.fillStyle = '#ff4400';
                ctx.fillRect(-4, -8, 2, 4);
                ctx.fillRect(3, -8, 2, 4);
            }

            ctx.restore();
            frames.push(canvas);
        }

        return frames;
    }

    generateItemSprite(emoji, color) {
        const canvas = document.createElement('canvas');
        canvas.width = 24;
        canvas.height = 24;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color + '40';
        ctx.beginPath();
        ctx.arc(12, 12, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(12, 12, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, 12, 12);

        return canvas;
    }

    generateTileSprite(type) {
        const canvas = document.createElement('canvas');
        canvas.width = TILE_SIZE;
        canvas.height = TILE_SIZE;
        const ctx = canvas.getContext('2d');

        switch (type) {
            case TILE_TYPES.WATER:
                this.drawWaterTile(ctx);
                break;
            case TILE_TYPES.TREE:
                this.drawTreeTile(ctx);
                break;
            case TILE_TYPES.HOUSE:
                this.drawHouseTile(ctx);
                break;
            case TILE_TYPES.BRIDGE:
                this.drawBridgeTile(ctx);
                break;
            case TILE_TYPES.FLOWER:
                this.drawFlowerTile(ctx);
                break;
            case TILE_TYPES.ROCK:
                this.drawRockTile(ctx);
                break;
            case TILE_TYPES.FENCE:
                this.drawFenceTile(ctx);
                break;
            case TILE_TYPES.WELL:
                this.drawWellTile(ctx);
                break;
            case TILE_TYPES.CHEST:
                this.drawChestTile(ctx);
                break;
            case TILE_TYPES.SIGN:
                this.drawSignTile(ctx);
                break;
        }

        return canvas;
    }

    drawWaterTile(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, TILE_SIZE, TILE_SIZE);
        gradient.addColorStop(0, '#3a7abd');
        gradient.addColorStop(0.5, '#4a8acd');
        gradient.addColorStop(1, '#3a7abd');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.strokeStyle = '#5a9add80';
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(0, 12 + i * 12);
            ctx.quadraticCurveTo(12, 8 + i * 12, 24, 12 + i * 12);
            ctx.quadraticCurveTo(36, 16 + i * 12, TILE_SIZE, 12 + i * 12);
            ctx.stroke();
        }
    }

    drawTreeTile(ctx) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = '#5a4a2a';
        ctx.fillRect(20, 28, 8, 20);

        ctx.fillStyle = '#2d5a1e';
        ctx.beginPath();
        ctx.arc(24, 20, 16, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3d6a2e';
        ctx.beginPath();
        ctx.arc(20, 16, 10, 0, Math.PI * 2);
        ctx.fill();
    }

    drawHouseTile(ctx) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = '#8b6b4a';
        ctx.fillRect(8, 16, 32, 28);

        ctx.fillStyle = '#a52a2a';
        ctx.beginPath();
        ctx.moveTo(4, 16);
        ctx.lineTo(24, 2);
        ctx.lineTo(44, 16);
        ctx.fill();

        ctx.fillStyle = '#654321';
        ctx.fillRect(18, 28, 12, 16);

        ctx.fillStyle = '#87ceeb';
        ctx.fillRect(10, 20, 8, 8);
        ctx.fillRect(30, 20, 8, 8);
    }

    drawBridgeTile(ctx) {
        ctx.fillStyle = '#3a7abd';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = '#a08050';
        ctx.fillRect(4, 4, 40, 40);

        ctx.fillStyle = '#907040';
        for (let i = 0; i < 5; i++) {
            ctx.fillRect(4, 4 + i * 8, 40, 2);
        }

        ctx.fillStyle = '#806030';
        ctx.fillRect(4, 4, 4, 40);
        ctx.fillRect(40, 4, 4, 40);
    }

    drawFlowerTile(ctx) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        const flowerColors = ['#ff6b8a', '#ffaa44', '#ff44ff', '#44aaff', '#ffff44'];
        for (let i = 0; i < 5; i++) {
            const x = 8 + (i * 8) % 36;
            const y = 10 + Math.floor(i / 3) * 16;

            ctx.fillStyle = '#2d5a1e';
            ctx.fillRect(x + 3, y + 6, 2, 8);

            ctx.fillStyle = flowerColors[i];
            ctx.beginPath();
            ctx.arc(x + 4, y + 4, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffff44';
            ctx.beginPath();
            ctx.arc(x + 4, y + 4, 1.5, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    drawRockTile(ctx) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = '#6b6b6b';
        ctx.beginPath();
        ctx.ellipse(24, 30, 18, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#7b7b7b';
        ctx.beginPath();
        ctx.ellipse(24, 28, 14, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#5b5b5b';
        ctx.beginPath();
        ctx.ellipse(12, 36, 8, 6, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    drawFenceTile(ctx) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = '#8b7355';
        ctx.fillRect(4, 8, 4, 32);
        ctx.fillRect(20, 8, 4, 32);
        ctx.fillRect(36, 8, 4, 32);

        ctx.fillRect(0, 14, 44, 4);
        ctx.fillRect(0, 28, 44, 4);

        ctx.fillStyle = '#9b8365';
        ctx.fillRect(0, 14, 44, 2);
        ctx.fillRect(0, 28, 44, 2);
    }

    drawWellTile(ctx) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = '#5a5a5a';
        ctx.beginPath();
        ctx.arc(24, 24, 14, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#3a3a5a';
        ctx.beginPath();
        ctx.arc(24, 24, 10, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#4444aa';
        ctx.beginPath();
        ctx.arc(24, 24, 8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#666';
        ctx.fillRect(20, 6, 8, 12);
        ctx.fillRect(16, 4, 16, 4);
    }

    drawChestTile(ctx) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = '#8b6914';
        ctx.fillRect(12, 20, 24, 16);

        ctx.fillStyle = '#9b7924';
        ctx.fillRect(12, 16, 24, 8);

        ctx.fillStyle = '#ffd700';
        ctx.fillRect(22, 22, 4, 6);

        ctx.strokeStyle = '#6b5914';
        ctx.lineWidth = 1;
        ctx.strokeRect(12, 20, 24, 16);
        ctx.strokeRect(12, 16, 24, 8);
    }

    drawSignTile(ctx) {
        ctx.fillStyle = '#4a7c3f';
        ctx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);

        ctx.fillStyle = '#5a4a2a';
        ctx.fillRect(22, 16, 4, 28);

        ctx.fillStyle = '#8b7355';
        ctx.fillRect(8, 8, 32, 20);

        ctx.strokeStyle = '#6b5335';
        ctx.lineWidth = 2;
        ctx.strokeRect(8, 8, 32, 20);

        ctx.fillStyle = '#6b5335';
        ctx.fillRect(12, 14, 24, 2);
        ctx.fillRect(12, 20, 24, 2);
    }

    getCharacterSprite(characterKey, direction, frame) {
        if (!this.characterSprites[characterKey]) return null;
        return this.characterSprites[characterKey][direction][frame % 4];
    }

    getNPCSprite(npcId, direction, frame) {
        if (!this.npcSprites[npcId]) return null;
        return this.npcSprites[npcId].frames[direction][frame % 4];
    }

    getNPCEmoji(npcId) {
        if (!this.npcSprites[npcId]) return '?';
        return this.npcSprites[npcId].emoji;
    }

    getMonsterSprite(monsterKey, frame) {
        if (!this.monsterSprites[monsterKey]) return null;
        return this.monsterSprites[monsterKey][frame % 4];
    }

    getItemSprite(itemKey) {
        if (!this.itemSprites[itemKey]) return null;
        return this.itemSprites[itemKey];
    }

    getTileSprite(type) {
        return this.tileSprites[type] || null;
    }
}

const spriteGenerator = new SpriteGenerator();
