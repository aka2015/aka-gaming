function setupJoystick() {
    if (!isMobile()) return;

    const container = document.getElementById('joystickContainer');
    if (!container) return;

    container.style.display = 'block';

    const base = document.getElementById('joystickBase');
    const stick = document.getElementById('joystickStick');

    if (!base || !stick) return;

    let joystickActive = false;
    let baseX, baseY;
    const maxDistance = 40;

    container.addEventListener('touchstart', (e) => {
        e.preventDefault();
        joystickActive = true;
        const rect = base.getBoundingClientRect();
        baseX = rect.left + rect.width / 2;
        baseY = rect.top + rect.height / 2;
    });

    container.addEventListener('touchmove', (e) => {
        e.preventDefault();
        if (!joystickActive) return;

        const touch = e.touches[0];
        let dx = touch.clientX - baseX;
        let dy = touch.clientY - baseY;

        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > maxDistance) {
            dx = (dx / distance) * maxDistance;
            dy = (dy / distance) * maxDistance;
        }

        stick.style.transform = `translate(${dx}px, ${dy}px)`;

        keys.left = dx < -15;
        keys.right = dx > 15;
        keys.up = dy < -15;
        keys.down = dy > 15;
    });

    container.addEventListener('touchend', () => {
        joystickActive = false;
        stick.style.transform = 'translate(0, 0)';
        keys.up = false;
        keys.down = false;
        keys.left = false;
        keys.right = false;
    });
}
