// ========================================
// SHOP SYSTEM
// ========================================

function canOpenShop() {
    return gameState === 'playing' || gameState === 'paused' || gameState === 'wave_rest';
}

let currentShopTab = 'weapons';
let pendingPurchase = null;

function openShop() {
    gameState = 'shop';

    // Hide only menu screens, NOT the HUD
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });

    document.getElementById('shopScreen').classList.remove('hidden');

    // Keep HUD visible
    document.getElementById('ui').classList.remove('hidden');
    document.getElementById('weaponDisplay').classList.remove('hidden');

    updateShopCoinDisplay();
    renderShopItems('weapons');

    // Reset tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === 'weapons') btn.classList.add('active');
    });
    currentShopTab = 'weapons';
}

function closeShop() {
    if (gameState === 'shop') {
        gameState = 'playing';
        document.getElementById('shopScreen').classList.add('hidden');

        // Keep HUD visible
        document.getElementById('ui').classList.remove('hidden');
        document.getElementById('weaponDisplay').classList.remove('hidden');

        lastTime = performance.now();
    }
}

function updateShopCoinDisplay() {
    document.getElementById('shopCoinCount').textContent = player.coins;
}

function renderShopItems(tab) {
    currentShopTab = tab || currentShopTab;
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = '';

    const items = SHOP_ITEMS[currentShopTab];

    items.forEach(item => {
        const currentLevel = player.upgrades[item.id] || 0;
        const price = Math.floor(item.basePrice * Math.pow(item.priceScaling, currentLevel));
        const canAfford = player.coins >= price;
        const isMaxLevel = currentLevel >= item.maxLevel;

        // Check if already owned (for new weapons)
        if (item.isNewWeapon && player.weapons.find(w => w.type === item.weaponType)) {
            return;
        }

        const card = document.createElement('div');
        card.className = `shop-item-card ${!canAfford && !isMaxLevel ? 'cannot-afford' : ''} ${isMaxLevel ? 'max-level' : ''}`;

        card.innerHTML = `
            <div class="shop-item-icon">${item.icon}</div>
            <div class="shop-item-name">${item.name}</div>
            <div class="shop-item-description">${item.description}</div>
            <div class="shop-item-price">
                ${isMaxLevel ? '✅ MAX LEVEL' : `💰 ${price}`}
            </div>
            <div class="shop-item-level">
                ${isMaxLevel ? 'Sudah maksimal' : `Level: ${currentLevel}/${item.maxLevel}`}
            </div>
        `;

        if (!isMaxLevel && canAfford) {
            card.addEventListener('click', () => showPurchaseConfirmation(item, price, currentLevel));
        }

        grid.appendChild(card);
    });
}

function showPurchaseConfirmation(item, price, currentLevel) {
    pendingPurchase = { item, price, currentLevel };

    document.getElementById('confirmItemIcon').textContent = item.icon;
    document.getElementById('confirmItemName').textContent = item.name;
    document.getElementById('confirmItemEffect').textContent = item.description;
    document.getElementById('confirmItemPrice').textContent = `💰 ${price}`;
    document.getElementById('confirmItemLevel').textContent = `Level: ${currentLevel} → ${currentLevel + 1}`;

    document.getElementById('purchaseConfirmation').classList.remove('hidden');
}

function completePurchase() {
    if (!pendingPurchase) return;

    const { item, price, currentLevel } = pendingPurchase;

    if (player.coins < price) {
        alert('❌ Koin tidak cukup!');
        return;
    }

    // Deduct coins
    player.coins -= price;

    // Apply upgrade
    player.upgrades[item.id] = currentLevel + 1;
    applyShopUpgrade(item, currentLevel + 1);

    // If new weapon, add to player weapons
    if (item.isNewWeapon) {
        player.weapons.push(createWeapon(item.weaponType));
        updateWeaponDisplay();
    }

    // Update UI
    updateShopCoinDisplay();
    renderShopItems();

    playSound(523, 0.2, 'sine', 0.12);
    showWarning(`✅ ${item.name} upgraded!`, 1.5);

    pendingPurchase = null;
}

function applyShopUpgrade(item, level) {
    const effect = item.effect(level);

    if (item.weaponType) {
        const weapon = player.weapons.find(w => w.type === item.weaponType);
        if (weapon) {
            // Update weapon level
            weapon.level = level;
            
            // Apply damage multiplier
            if (effect.damageMultiplier) {
                // Recalculate from base damage to avoid compounding
                const baseWeaponData = WEAPONS[item.weaponType];
                weapon.damage = baseWeaponData.damage * (1 + effect.damageMultiplier * level);
            }
        }
    }

    if (effect.defense) {
        player.defense += effect.defense;
    }

    if (effect.damageReduction) {
        player.damageReduction = (player.damageReduction || 0) + effect.damageReduction;
    }

    if (effect.speedMultiplier) {
        player.speed *= (1 + effect.speedMultiplier);
    }

    if (effect.maxHp) {
        player.maxHp += effect.maxHp;
        player.hp += effect.maxHp;
    }

    if (effect.lifesteal) {
        player.lifesteal = (player.lifesteal || 0) + effect.lifesteal;
    }

    if (effect.pickupRangeMultiplier) {
        player.pickupRange *= (1 + effect.pickupRangeMultiplier);
    }

    if (effect.xpMultiplier) {
        player.xpMultiplier = (player.xpMultiplier || 1) + effect.xpMultiplier;
    }

    if (effect.critChance) {
        player.critChance = (player.critChance || 0) + effect.critChance;
    }

    if (effect.critMultiplier) {
        player.critMultiplier = (player.critMultiplier || 1.5) + effect.critMultiplier;
    }

    if (effect.hpRegen) {
        player.hpRegen = (player.hpRegen || 0) + effect.hpRegen;
    }

    if (effect.extraLife) {
        player.hasExtraLife = true;
    }

    if (effect.areaDamageMultiplier) {
        player.areaDamageMultiplier = (player.areaDamageMultiplier || 1) + effect.areaDamageMultiplier;
    }
}
