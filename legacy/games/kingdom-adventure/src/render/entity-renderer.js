function renderEntities(time) {
    renderNPCs(time);
    renderMonsters(time);
    renderPlayer(time);
}

function renderPlayer(time) {
    if (!gameState.player) return;

    const player = gameState.player;
    const screenX = player.x * TILE_SIZE - camera.x;
    const screenY = player.y * TILE_SIZE - camera.y;

    if (!camera.isVisible(player.x * TILE_SIZE, player.y * TILE_SIZE, TILE_SIZE * 2)) return;

    if (player.isAttacking) {
        ctx.shadowColor = '#ffaa00';
        ctx.shadowBlur = 15;
    }

    const sprite = spriteGenerator.getCharacterSprite(player.characterType, player.direction, player.animFrame);
    if (sprite) {
        ctx.drawImage(sprite, screenX, screenY - 8, TILE_SIZE, TILE_SIZE);
    }

    ctx.shadowBlur = 0;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(screenX + TILE_SIZE / 2, screenY + TILE_SIZE - 4, 10, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    if (gameState.current === GameStates.PLAYING) {
        const interactRange = 2.5;
        const nearestNPC = getNearestNPC(player, interactRange);
        if (nearestNPC) {
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('[SPACE] Berbicara', screenX + TILE_SIZE / 2, screenY - 20);
        }

        const nearMonster = gameState.monsters.some(m => {
            if (m.hp <= 0) return false;
            const dx = m.x - player.x;
            const dy = m.y - player.y;
            return Math.sqrt(dx * dx + dy * dy) < ATTACK_RANGE;
        });
        if (nearMonster) {
            ctx.strokeStyle = '#ff4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2, TILE_SIZE * 1.5, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = '#ff4444';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('⚔️ AUTO ATTACK', screenX + TILE_SIZE / 2, screenY - 20);
        }

        const nearChest = isNearChest(player);
        if (nearChest) {
            const chestScreenX = nearChest.x * TILE_SIZE - camera.x + TILE_SIZE / 2;
            const chestScreenY = nearChest.y * TILE_SIZE - camera.y;

            ctx.fillStyle = '#ffd700';
            ctx.font = 'bold 10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('[SPACE] Buka', chestScreenX, chestScreenY - 10);
        }
    }
}

function renderNPCs(time) {
    for (const npc of gameState.npcs) {
        const screenX = npc.x * TILE_SIZE - camera.x;
        const screenY = npc.y * TILE_SIZE - camera.y;

        if (!camera.isVisible(npc.x * TILE_SIZE, npc.y * TILE_SIZE, TILE_SIZE * 2)) continue;

        const sprite = spriteGenerator.getNPCSprite(npc.id, npc.direction, npc.animFrame);
        if (sprite) {
            ctx.drawImage(sprite, screenX, screenY - 8, TILE_SIZE, TILE_SIZE);
        }

        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(screenX + TILE_SIZE / 2, screenY + TILE_SIZE - 4, 10, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(npc.name, screenX + TILE_SIZE / 2, screenY - 12);

        if (npc.heals) {
            ctx.fillStyle = '#44ff44';
            ctx.font = '14px Arial';
            ctx.fillText('❤️', screenX + TILE_SIZE / 2, screenY - 22);
        }

        const bobY = Math.sin(time * 3) * 3;
        const emoji = spriteGenerator.getNPCEmoji(npc.id);
        ctx.font = '16px Arial';
        ctx.fillText(emoji, screenX + TILE_SIZE / 2 + 15, screenY + bobY);
    }
}

function renderMonsters(time) {
    for (const monster of gameState.monsters) {
        if (monster.hp <= 0) continue;

        const screenX = monster.x * TILE_SIZE - camera.x;
        const screenY = monster.y * TILE_SIZE - camera.y;

        if (!camera.isVisible(monster.x * TILE_SIZE, monster.y * TILE_SIZE, TILE_SIZE * 2)) continue;

        const sprite = spriteGenerator.getMonsterSprite(monster.type, monster.animFrame);
        if (sprite) {
            const size = TILE_SIZE * monster.size;
            ctx.drawImage(sprite, screenX + (TILE_SIZE - size) / 2, screenY + (TILE_SIZE - size) / 2, size, size);
        }

        if (monster.hp < monster.maxHp) {
            const barWidth = 30;
            const barHeight = 4;
            const hpPercent = monster.hp / monster.maxHp;

            ctx.fillStyle = '#333';
            ctx.fillRect(screenX + (TILE_SIZE - barWidth) / 2, screenY - 8, barWidth, barHeight);

            ctx.fillStyle = hpPercent > 0.5 ? '#44ff44' : hpPercent > 0.25 ? '#ffaa00' : '#ff4444';
            ctx.fillRect(screenX + (TILE_SIZE - barWidth) / 2, screenY - 8, barWidth * hpPercent, barHeight);
        }

        ctx.fillStyle = '#ff6666';
        ctx.font = 'bold 9px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(monster.name, screenX + TILE_SIZE / 2, screenY - 14);
    }
}

function renderItems(time) {
    for (const item of gameState.items) {
        if (item.collected) continue;

        const screenX = item.x * TILE_SIZE - camera.x;
        const screenY = item.y * TILE_SIZE - camera.y;

        if (!camera.isVisible(item.x * TILE_SIZE, item.y * TILE_SIZE, TILE_SIZE)) continue;

        const bobY = Math.sin(time * 3 + item.x + item.y) * 5;
        const sprite = spriteGenerator.getItemSprite(item.key);
        if (sprite) {
            ctx.drawImage(sprite, screenX + 12, screenY + 8 + bobY, 24, 24);
        }

        ctx.shadowColor = ITEM_DATA[item.key].color;
        ctx.shadowBlur = 10;
        ctx.fillStyle = ITEM_DATA[item.key].color + '20';
        ctx.beginPath();
        ctx.arc(screenX + TILE_SIZE / 2, screenY + TILE_SIZE / 2 + bobY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }
}

function getNearestNPC(player, range) {
    let nearest = null;
    let minDist = range;

    for (const npc of gameState.npcs) {
        const dx = npc.x - player.x;
        const dy = npc.y - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < minDist) {
            minDist = dist;
            nearest = npc;
        }
    }

    return nearest;
}

function isNearChest(player) {
    if (!gameState.map) return null;

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
        if (gameState.map[cy][cx] === TILE_TYPES.CHEST) {
            return { x: cx, y: cy };
        }
    }

    return null;
}
