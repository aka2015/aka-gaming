const camera = {
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    smoothing: 0.1,
    width: 0,
    height: 0,

    update() {
        if (!gameState.player) return;

        this.width = canvas.width;
        this.height = canvas.height;

        const playerScreenX = gameState.player.x * TILE_SIZE + TILE_SIZE / 2;
        const playerScreenY = gameState.player.y * TILE_SIZE + TILE_SIZE / 2;

        this.targetX = playerScreenX - this.width / 2;
        this.targetY = playerScreenY - this.height / 2;

        this.x += (this.targetX - this.x) * this.smoothing;
        this.y += (this.targetY - this.y) * this.smoothing;

        const mapPixelWidth = MAP_WIDTH * TILE_SIZE;
        const mapPixelHeight = MAP_HEIGHT * TILE_SIZE;

        this.x = Math.max(0, Math.min(this.x, mapPixelWidth - this.width));
        this.y = Math.max(0, Math.min(this.y, mapPixelHeight - this.height));
    },

    toScreen(worldX, worldY) {
        return {
            x: worldX - this.x,
            y: worldY - this.y
        };
    },

    toWorld(screenX, screenY) {
        return {
            x: screenX + this.x,
            y: screenY + this.y
        };
    },

    isVisible(worldX, worldY, padding = 0) {
        const screen = this.toScreen(worldX, worldY);
        return screen.x > -padding && screen.x < this.width + padding &&
               screen.y > -padding && screen.y < this.height + padding;
    }
};
