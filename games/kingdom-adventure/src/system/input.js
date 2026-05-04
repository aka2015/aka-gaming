const keys = {
    up: false,
    down: false,
    left: false,
    right: false,
    interact: false,
    inventory: false,
    quest: false,
    map: false
};

const keysJustPressed = {
    interact: false,
    inventory: false,
    quest: false,
    map: false
};

function setupInput() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        switch (key) {
            case 'w':
            case 'arrowup':
                keys.up = true;
                break;
            case 's':
            case 'arrowdown':
                keys.down = true;
                break;
            case 'a':
            case 'arrowleft':
                keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                keys.right = true;
                break;
            case ' ':
                e.preventDefault();
                keys.interact = true;
                keysJustPressed.interact = true;
                break;
            case 'e':
                keys.inventory = true;
                keysJustPressed.inventory = true;
                break;
            case 'q':
                keys.quest = true;
                keysJustPressed.quest = true;
                break;
            case 'm':
                keys.map = true;
                keysJustPressed.map = true;
                break;
            case 'escape':
                handleEscape();
                break;
        }
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();

        switch (key) {
            case 'w':
            case 'arrowup':
                keys.up = false;
                break;
            case 's':
            case 'arrowdown':
                keys.down = false;
                break;
            case 'a':
            case 'arrowleft':
                keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                keys.right = false;
                break;
            case ' ':
                keys.interact = false;
                break;
            case 'e':
                keys.inventory = false;
                break;
            case 'q':
                keys.quest = false;
                break;
            case 'm':
                keys.map = false;
                break;
        }
    });

    canvas = document.getElementById('gameCanvas');
    if (canvas) {
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    }

    const mobileInteractBtn = document.getElementById('mobileInteractBtn');
    if (mobileInteractBtn) {
        mobileInteractBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keysJustPressed.interact = true;
        });
    }

    const mobileInventoryBtn = document.getElementById('mobileInventoryBtn');
    if (mobileInventoryBtn) {
        mobileInventoryBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keysJustPressed.inventory = true;
        });
    }

    const mobileQuestBtn = document.getElementById('mobileQuestBtn');
    if (mobileQuestBtn) {
        mobileQuestBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keysJustPressed.quest = true;
        });
    }
}

let touchStartX = 0;
let touchStartY = 0;

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
}

function handleTouchMove(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;

    keys.up = dy < -20;
    keys.down = dy > 20;
    keys.left = dx < -20;
    keys.right = dx > 20;
}

function handleTouchEnd(e) {
    e.preventDefault();
    keys.up = false;
    keys.down = false;
    keys.left = false;
    keys.right = false;
}

function handleEscape() {
    if (gameState.current === GameStates.DIALOG) {
        closeDialog();
    } else if (gameState.current === GameStates.INVENTORY) {
        closeInventory();
    } else if (gameState.current === GameStates.QUEST) {
        closeQuest();
    }
}

function getPlayerDirection() {
    if (keys.up) return 'up';
    if (keys.down) return 'down';
    if (keys.left) return 'left';
    if (keys.right) return 'right';
    return 'down';
}

function isMoving() {
    return keys.up || keys.down || keys.left || keys.right;
}

function consumeJustPressed() {
    const pressed = { ...keysJustPressed };
    keysJustPressed.interact = false;
    keysJustPressed.inventory = false;
    keysJustPressed.quest = false;
    keysJustPressed.map = false;
    return pressed;
}


