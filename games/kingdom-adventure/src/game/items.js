function createItems() {
    const items = [];

    for (const spawn of SPAWN_POINTS.items) {
        items.push({
            key: spawn.item,
            x: spawn.x,
            y: spawn.y,
            collected: false,
            respawnTimer: 0
        });
    }

    for (const spawn of SPAWN_POINTS.crystals) {
        items.push({
            key: 'crystal',
            x: spawn.x,
            y: spawn.y,
            collected: false,
            respawnTimer: 0
        });
    }

    return items;
}

function updateItems(deltaTime) {
    for (const item of gameState.items) {
        if (item.collected) {
            item.respawnTimer += deltaTime;
            if (item.respawnTimer > 60) {
                item.collected = false;
                item.respawnTimer = 0;
            }
        }
    }
}
