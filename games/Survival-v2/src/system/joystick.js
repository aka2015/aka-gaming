// ========================================
// MOBILE JOYSTICK - Touch controls for mobile devices
// ========================================

// Joystick state
let joystickActive = false;
let joystickBasePos = { x: 0, y: 0 };
let joystickStickPos = { x: 0, y: 0 };
let joystickTouchId = null;
const JOYSTICK_RADIUS = 60;
const JOYSTICK_OFFSET_BOTTOM = 100; // Distance from bottom of screen

// Check if device is mobile
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        || window.innerWidth <= 1024;
}

// Get joystick center position (centered horizontally, offset from bottom)
function getJoystickCenter() {
    return {
        x: window.innerWidth / 2,
        y: window.innerHeight - JOYSTICK_OFFSET_BOTTOM
    };
}

// Initialize joystick
function initJoystick() {
    if (!isMobileDevice()) return;

    // Set initial joystick position
    const center = getJoystickCenter();
    joystickBasePos.x = center.x;
    joystickBasePos.y = center.y;

    // Show joystick UI (fixed position via CSS)
    const joystickContainer = document.getElementById('joystickContainer');
    if (joystickContainer) {
        joystickContainer.style.display = 'block';
    }

    // Add touch event listeners to canvas
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
    canvas.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    // Shop button touch
    const shopBtn = document.getElementById('mobileShopBtn');
    if (shopBtn) {
        shopBtn.addEventListener('touchstart', handleShopTouch, { passive: false });
    }
}

// Handle touch start for joystick
function handleTouchStart(e) {
    e.preventDefault();

    const joyCenter = getJoystickCenter();

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        const x = touch.clientX;
        const y = touch.clientY;

        // Calculate distance from joystick center (centered at bottom)
        const dx = x - joyCenter.x;
        const dy = y - joyCenter.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Activate if touch is within 120px of joystick center
        if (distance < 120 && joystickTouchId === null) {
            joystickActive = true;
            joystickTouchId = touch.identifier;

            // Update stick position to touch (relative to base)
            joystickStickPos.x = x;
            joystickStickPos.y = y;

            // Update joystick visual
            updateJoystickVisual();
        }
    }
}

// Handle touch move for joystick
function handleTouchMove(e) {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (touch.identifier === joystickTouchId && joystickActive) {
            const x = touch.clientX;
            const y = touch.clientY;

            // Calculate distance from base
            let dx = x - joystickBasePos.x;
            let dy = y - joystickBasePos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Clamp to joystick radius
            if (distance > JOYSTICK_RADIUS) {
                dx = (dx / distance) * JOYSTICK_RADIUS;
                dy = (dy / distance) * JOYSTICK_RADIUS;
            }

            joystickStickPos.x = joystickBasePos.x + dx;
            joystickStickPos.y = joystickBasePos.y + dy;

            // Update joystick visual
            updateJoystickVisual();

            // Update virtual keys for player movement
            updateVirtualKeys(dx, dy, distance);
        }
    }
}

// Handle touch end for joystick
function handleTouchEnd(e) {
    e.preventDefault();

    for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (touch.identifier === joystickTouchId) {
            joystickActive = false;
            joystickTouchId = null;

            // Reset joystick visual
            resetJoystickVisual();

            // Clear virtual keys
            clearVirtualKeys();
        }
    }
}

// Update virtual key presses based on joystick position
function updateVirtualKeys(dx, dy, distance) {
    // Minimum distance to register as key press
    const threshold = 10;

    // Clear all virtual keys first
    keys['w'] = false;
    keys['s'] = false;
    keys['a'] = false;
    keys['d'] = false;
    keys['arrowup'] = false;
    keys['arrowdown'] = false;
    keys['arrowleft'] = false;
    keys['arrowright'] = false;

    if (distance < threshold) return;

    // Map joystick direction to virtual keys
    if (dy < -threshold) {
        keys['w'] = true;
        keys['arrowup'] = true;
    }
    if (dy > threshold) {
        keys['s'] = true;
        keys['arrowdown'] = true;
    }
    if (dx < -threshold) {
        keys['a'] = true;
        keys['arrowleft'] = true;
    }
    if (dx > threshold) {
        keys['d'] = true;
        keys['arrowright'] = true;
    }
}

// Clear all virtual key presses
function clearVirtualKeys() {
    keys['w'] = false;
    keys['s'] = false;
    keys['a'] = false;
    keys['d'] = false;
    keys['arrowup'] = false;
    keys['arrowdown'] = false;
    keys['arrowleft'] = false;
    keys['arrowright'] = false;
}

// Handle attack button touch
function handleAttackStart(e) {
    e.preventDefault();
    // Auto-attack is already implemented, this is just visual feedback
    const attackBtn = document.getElementById('mobileAttackBtn');
    if (attackBtn) {
        attackBtn.classList.add('active');
    }
}

function handleAttackEnd(e) {
    e.preventDefault();
    const attackBtn = document.getElementById('mobileAttackBtn');
    if (attackBtn) {
        attackBtn.classList.remove('active');
    }
}

// Handle shop button touch
function handleShopTouch(e) {
    e.preventDefault();
    if (canOpenShop()) {
        openShop();
    }
}

// Update joystick visual position
function updateJoystickVisual() {
    const joystickBaseEl = document.getElementById('joystickBase');
    const joystickStickEl = document.getElementById('joystickStick');

    if (!joystickBaseEl || !joystickStickEl) return;

    // Always show joystick container
    const container = document.getElementById('joystickContainer');
    if (container) container.style.display = 'block';

    // Position joystick stick (relative to base center)
    const stickOffsetX = joystickStickPos.x - joystickBasePos.x;
    const stickOffsetY = joystickStickPos.y - joystickBasePos.y;
    joystickStickEl.style.transform = `translateX(-50%) translate(${stickOffsetX}px, ${stickOffsetY}px)`;
}

// Reset joystick visual
function resetJoystickVisual() {
    // Reset stick to center
    joystickStickPos.x = joystickBasePos.x;
    joystickStickPos.y = joystickBasePos.y;

    const joystickStickEl = document.getElementById('joystickStick');
    if (joystickStickEl) {
        joystickStickEl.style.transform = `translateX(-50%) translate(0px, 0px)`;
    }
}

// Hide joystick for desktop
function hideJoystick() {
    const joystickContainer = document.getElementById('joystickContainer');
    if (joystickContainer) {
        joystickContainer.style.display = 'none';
    }

    const mobileButtons = document.querySelectorAll('.mobile-btn');
    mobileButtons.forEach(btn => {
        btn.style.display = 'none';
    });
}

// Show joystick for mobile
function showJoystick() {
    if (!isMobileDevice()) {
        hideJoystick();
        return;
    }

    const joystickContainer = document.getElementById('joystickContainer');
    if (joystickContainer) {
        joystickContainer.style.display = 'none'; // Hidden until touch starts
    }

    const mobileButtons = document.querySelectorAll('.mobile-btn');
    mobileButtons.forEach(btn => {
        btn.style.display = 'block';
    });
}
