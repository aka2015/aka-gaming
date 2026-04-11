// ========================================
// UI FUNCTIONS
// ========================================

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById('ui').classList.add('hidden');
    document.getElementById('weaponDisplay').classList.add('hidden');
    document.getElementById('bossHpBar').classList.add('hidden');
}

function updateHUD() {
    // Health bar
    const healthPercent = (player.hp / player.maxHp) * 100;
    document.getElementById('healthFill').style.width = healthPercent + '%';
    document.getElementById('healthText').textContent = `${Math.ceil(player.hp)}/${player.maxHp}`;

    // Level indicator
    document.getElementById('levelIndicator').textContent = `⭐ Lv.${player.level}`;

    // XP bar
    const xpNeeded = player.level * 100;
    const xpPercent = (player.xp / xpNeeded) * 100;
    document.getElementById('xpFill').style.width = xpPercent + '%';
    document.getElementById('xpText').textContent = `${player.xp}/${xpNeeded} XP`;

    // Coins
    document.getElementById('coinCount').textContent = player.coins;

    // Score, wave, timer
    document.getElementById('score').textContent = `Skor: ${score}`;
    document.getElementById('wave').textContent = `Wave: ${currentWave}`;
    const minutes = Math.floor(survivalTime / 60);
    const seconds = Math.floor(survivalTime % 60);
    document.getElementById('timer').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateWeaponDisplay() {
    const display = document.getElementById('weaponDisplay');
    display.innerHTML = '';

    player.weapons.forEach(weapon => {
        const icon = document.createElement('div');
        icon.className = 'weapon-icon';
        icon.innerHTML = `
            ${WEAPONS[weapon.type].icon}
            <div class="weapon-level">Lv.${weapon.level}</div>
        `;
        display.appendChild(icon);
    });
}

function showBossHpBar(boss) {
    const bossBar = document.getElementById('bossHpBar');
    bossBar.classList.remove('hidden');

    document.getElementById('bossName').textContent = boss.name;
    updateBossHpBar(boss);
}

function updateBossHpBar(boss) {
    const hpPercent = (boss.hp / boss.maxHp) * 100;
    document.getElementById('bossHpFill').style.width = hpPercent + '%';
    document.getElementById('bossHpText').textContent = `${Math.ceil(boss.hp)}/${boss.maxHp}`;
}

function hideBossHpBar() {
    document.getElementById('bossHpBar').classList.add('hidden');
}

function showWarning(text, duration = 2) {
    const warningsDiv = document.getElementById('warnings');
    const warning = document.createElement('div');
    warning.className = 'warning-text';
    warning.textContent = text;
    warningsDiv.appendChild(warning);

    setTimeout(() => {
        warning.remove();
    }, duration * 1000);
}

function showDamageNumber(x, y, damage, isCritical = false) {
    damageNumbers.push({
        x: x,
        y: y,
        value: Math.floor(damage),
        timer: 0.8,
        vy: -50,
        color: isCritical ? '#FBBF24' : '#FFF',
        size: isCritical ? 24 : 18,
        isCritical: isCritical
    });
}

function showCoinNumber(x, y, amount) {
    damageNumbers.push({
        x: x,
        y: y,
        value: `+${amount}💰`,
        timer: 0.6,
        vy: -40,
        color: '#FBBF24',
        size: 16,
        isCoin: true
    });
}
