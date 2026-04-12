# Bug Fix - HUD Disappearing During Pause/Shop/Level-Up

## 🐛 Bug Description

**Issue:** When pausing the game, opening the shop, or leveling up, the HUD (HP bar, XP bar, coins, score, wave, timer) and weapon display would disappear.

**Impact:** Players couldn't see their vital stats during gameplay interruptions, causing confusion and poor user experience.

---

## 🔍 Root Cause

The `hideAllScreens()` function in `src/ui/ui-functions.js` was being called when transitioning to pause, shop, or level-up states. This function hides:
- All `.screen` elements
- `#ui` (HUD with HP, XP, coins, score, wave, timer)
- `#weaponDisplay` (weapon level indicators)
- `#bossHpBar` (boss health bar)

**Problematic Code:**
```javascript
function pauseGame() {
    gameState = 'paused';
    hideAllScreens(); // ❌ This hides the HUD!
    document.getElementById('pauseScreen').classList.remove('hidden');
}
```

---

## ✅ Solution

Replaced `hideAllScreens()` calls with selective screen hiding that preserves the HUD during gameplay interruptions.

### Files Modified

#### 1. `src/game/wave-rest.js`

**Before:**
```javascript
function pauseGame() {
    gameState = 'paused';
    hideAllScreens();
    document.getElementById('pauseScreen').classList.remove('hidden');
    stopBackgroundMusic();
}

function resumeGame() {
    gameState = 'playing';
    hideAllScreens();
    lastTime = performance.now();
    if (bgMusicEnabled) {
        playBackgroundMusic();
    }
}
```

**After:**
```javascript
function pauseGame() {
    gameState = 'paused';
    
    // Hide only menu screens, NOT the HUD
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById('pauseScreen').classList.remove('hidden');

    // Keep HUD visible
    document.getElementById('ui').classList.remove('hidden');
    document.getElementById('weaponDisplay').classList.remove('hidden');

    stopBackgroundMusic();
}

function resumeGame() {
    gameState = 'playing';
    
    // Hide pause screen
    document.getElementById('pauseScreen').classList.add('hidden');
    lastTime = performance.now();

    // Keep HUD visible
    document.getElementById('ui').classList.remove('hidden');
    document.getElementById('weaponDisplay').classList.remove('hidden');

    if (bgMusicEnabled) {
        playBackgroundMusic();
    }
}
```

#### 2. `src/game/shop.js`

**Before:**
```javascript
function openShop() {
    gameState = 'shop';
    
    document.querySelectorAll('.screen').forEach(screen => {
        if (!screen.id.includes('ui') && !screen.id.includes('weaponDisplay')) {
            screen.classList.add('hidden');
        }
    });
    // ... rest of code
}
```

**After:**
```javascript
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
    // ... rest of code
}
```

#### 3. `src/game/level-up.js`

**Before:**
```javascript
function showLevelUpScreen() {
    document.getElementById('levelUpScreen').classList.remove('hidden');
}
```

**After:**
```javascript
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
```

Also updated the upgrade selection handler:
```javascript
card.querySelector('.upgrade-btn').addEventListener('click', () => {
    applyUpgrade(upgrade);
    document.getElementById('levelUpScreen').classList.add('hidden');
    gameState = 'playing';
    lastTime = performance.now();
    
    // Keep HUD visible
    document.getElementById('ui').classList.remove('hidden');
    document.getElementById('weaponDisplay').classList.remove('hidden');
});
```

---

## 📋 Behavior After Fix

### ✅ What Stays Visible
- **HP Bar** - Health bar with current/max HP
- **Level Indicator** - Current character level
- **XP Bar** - Experience progress
- **Coin Display** - Current coin count
- **Score** - Current game score
- **Wave Indicator** - Current wave number
- **Timer** - Survival time
- **Weapon Display** - Weapon icons with levels
- **Boss HP Bar** - When fighting a boss (if applicable)

### ✅ What Gets Hidden/Shown
| Action | Hidden Elements | Visible Elements |
|--------|----------------|------------------|
| **Pause** | Pause menu only | HUD + Game canvas |
| **Shop** | Shop screen only | HUD + Game canvas |
| **Level Up** | Level up screen only | HUD + Game canvas |
| **Game Over** | All screens, HUD hidden | Game over screen only |

---

## 🎯 Testing Steps

1. **Start the game** and select a character
2. **Play for a few seconds** until HUD is visible
3. **Test Pause:**
   - Press `SPACE` or `ESC`
   - ✅ Verify HP bar, XP bar, coins, score, wave, timer are still visible
   - ✅ Verify weapon display at bottom is still visible
   - Press "Lanjutkan" to resume
   - ✅ Verify HUD remains visible
4. **Test Shop:**
   - Press `B` during gameplay or from pause menu
   - ✅ Verify HUD elements remain visible
   - ✅ Verify weapon display remains visible
   - Close shop with `B` or `ESC`
   - ✅ Verify HUD remains visible
5. **Test Level Up:**
   - Collect XP orbs to level up
   - ✅ Verify HUD elements remain visible during upgrade selection
   - Select an upgrade
   - ✅ Verify HUD remains visible after selection

---

## 📊 Files Changed Summary

| File | Lines Changed | Description |
|------|--------------|-------------|
| `src/game/wave-rest.js` | ~30 lines | Fixed pause/resume HUD visibility |
| `src/game/shop.js` | ~10 lines | Simplified and fixed shop HUD visibility |
| `src/game/level-up.js` | ~15 lines | Fixed level-up screen HUD visibility |

**Total:** 3 files modified, ~55 lines changed

---

## 🔧 Technical Notes

### Why Not Modify `hideAllScreens()`?

We considered modifying the `hideAllScreens()` function itself to exclude HUD elements, but decided against it because:

1. **Intentional Design:** Some screens (main menu, game over) SHOULD hide the HUD
2. **Explicit Control:** It's clearer to explicitly show/hide HUD elements where needed
3. **Flexibility:** Different game states have different visibility requirements
4. **Backwards Compatibility:** Other code might rely on the current behavior

### Best Practice Going Forward

When adding new overlay screens during gameplay:
```javascript
// ❌ DON'T: This hides everything
hideAllScreens();

// ✅ DO: This hides only menu screens
document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
});

// Keep HUD visible
document.getElementById('ui').classList.remove('hidden');
document.getElementById('weaponDisplay').classList.remove('hidden');
```

---

## 📝 Version

**Fixed in:** v1.1.1  
**Date:** 2026-04-12  
**Severity:** High (affects core gameplay experience)  
**Status:** ✅ Resolved

---

**Players can now pause, shop, and level up without losing visibility of their vital stats!** 🎉
