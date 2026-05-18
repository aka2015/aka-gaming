function createNPCs() {
    const npcs = [];

    for (const npcData of NPC_DATA) {
        npcs.push({
            id: npcData.id,
            name: npcData.name,
            emoji: npcData.emoji,
            x: npcData.position.x,
            y: npcData.position.y,
            startX: npcData.position.x,
            startY: npcData.position.y,
            patrolRadius: npcData.patrolRadius,
            direction: 'down',
            animFrame: 0,
            animTimer: 0,
            moveTimer: 0,
            targetX: npcData.position.x,
            targetY: npcData.position.y,
            dialog: npcData.dialog,
            dialogIndex: 0,
            heals: npcData.heals || false,
            speed: 1.5
        });
    }

    return npcs;
}

function updateNPCs(deltaTime) {
    for (const npc of gameState.npcs) {
        const dx = npc.targetX - npc.x;
        const dy = npc.targetY - npc.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0.1) {
            const moveX = (dx / dist) * npc.speed * deltaTime;
            const moveY = (dy / dist) * npc.speed * deltaTime;

            if (Math.abs(dx) > Math.abs(dy)) {
                npc.direction = dx > 0 ? 'right' : 'left';
            } else {
                npc.direction = dy > 0 ? 'down' : 'up';
            }

            npc.x += moveX;
            npc.y += moveY;

            npc.animTimer += deltaTime;
            if (npc.animTimer > 0.2) {
                npc.animTimer = 0;
                npc.animFrame = (npc.animFrame + 1) % 4;
            }
        } else {
            npc.animFrame = 0;

            npc.moveTimer += deltaTime;
            if (npc.moveTimer > 2 + Math.random() * 3) {
                npc.moveTimer = 0;

                const offsetX = (Math.random() - 0.5) * 2 * npc.patrolRadius;
                const offsetY = (Math.random() - 0.5) * 2 * npc.patrolRadius;

                npc.targetX = Math.max(0, Math.min(MAP_WIDTH - 1, npc.startX + offsetX));
                npc.targetY = Math.max(0, Math.min(MAP_HEIGHT - 1, npc.startY + offsetY));

                const tileX = Math.floor(npc.targetX);
                const tileY = Math.floor(npc.targetY);
                if (isTileSolid(tileX, tileY)) {
                    npc.targetX = npc.startX;
                    npc.targetY = npc.startY;
                }
            }
        }
    }
}

function interactWithNPC(npc) {
    if (npc.heals && gameState.player) {
        gameState.player.hp = gameState.player.maxHp;
        showNotification('HP dipulihkan sepenuhnya! ❤️');
        spawnParticles(gameState.player.x * TILE_SIZE + TILE_SIZE / 2, gameState.player.y * TILE_SIZE + TILE_SIZE / 2, '#44ff44', 15);
    }

    playNPCInteractSound();

    gameState.npcDialog = {
        npc: npc,
        index: npc.dialogIndex,
        lines: npc.dialog
    };

    openDialog(npc.name, npc.dialog[npc.dialogIndex].text);
    changeState(GameStates.DIALOG);
}

function advanceDialog() {
    if (!gameState.npcDialog) return;

    gameState.npcDialog.index++;

    if (gameState.npcDialog.index >= gameState.npcDialog.lines.length) {
        gameState.npcDialog.npc.dialogIndex = 0;
        closeDialog();
        changeState(GameStates.PLAYING);
    } else {
        const line = gameState.npcDialog.lines[gameState.npcDialog.index];
        updateDialogText(line.text);
    }
}
