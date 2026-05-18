// ========================================
// LEVEL UP & UPGRADE SYSTEM
// ========================================

function generateUpgradeChoices() {
    const choices = [];
    const available = [...UPGRADE_POOL];

    // Pick 3 random upgrades
    while (choices.length < 3 && available.length > 0) {
        const index = Math.floor(Math.random() * available.length);
        choices.push(available.splice(index, 1)[0]);
    }

    renderUpgradeChoices(choices);
}

function renderUpgradeChoices(choices) {
    const container = document.getElementById('upgradeChoices');
    container.innerHTML = '';

    choices.forEach(upgrade => {
        const card = document.createElement('div');
        card.className = `upgrade-card ${upgrade.rarity}`;
        card.innerHTML = `
            <div class="upgrade-icon">${upgrade.icon}</div>
            <div class="upgrade-name">${upgrade.name}</div>
            <div class="upgrade-description">${upgrade.description}</div>
            <button class="upgrade-btn">PILIH</button>
        `;

        card.querySelector('.upgrade-btn').addEventListener('click', () => {
            applyUpgrade(upgrade);
            document.getElementById('levelUpScreen').classList.add('hidden');
            gameState = 'playing';
            lastTime = performance.now();
            
            // Keep HUD visible
            document.getElementById('ui').classList.remove('hidden');
            document.getElementById('weaponDisplay').classList.remove('hidden');
        });

        container.appendChild(card);
    });
}

function applyUpgrade(upgrade) {
    upgrade.effect(player);
    playSound(440, 0.3, 'sine', 0.12);
}

function showLevelUpScreen() {
    // Hide only menu screens, NOT the HUD
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    
    document.getElementById('levelUpScreen').classList.remove('hidden');
    
    // Keep HUD visible during level up
    document.getElementById('ui').classList.remove('hidden');
    document.getElementById('weaponDisplay').classList.remove('hidden');
}
