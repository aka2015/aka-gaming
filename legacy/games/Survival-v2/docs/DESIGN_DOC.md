# Survival Game - Design Document (Survival.io Style)

## 1. Game Overview

**Game Type:** 2D Survival Roguelike  
**Inspiration:** Survival.io / Vampire Survivors  
**Core Loop:** Survive waves of enemies → Gain XP → Level up → Choose upgrades → Get stronger → Survive longer  

---

## 2. Character Design

### 2.1 Player Character

**Name:** Customizable (default: "Survivor")

**Base Stats:**
- **HP (Health Points):** 100
- **Movement Speed:** 200 pixels/second
- **Attack Speed:** 1.0 attacks/second (base)
- **Damage:** 10 (base weapon damage)
- **Defense:** 0 (base armor)
- **Pickup Range:** 50 pixels (for collecting XP orbs)

**Character Abilities:**
1. **Passive Movement:** WASD/Arrow keys for movement
2. **Auto-Attack:** Character automatically attacks nearest enemies within range
3. **No Manual Attacking:** Player focuses solely on positioning and dodging

**Character Visual Design:**
- Simple geometric shape (circle/rounded square)
- Glowing neon outline matching theme color
- Health bar above character
- Level indicator below character
- Weapon visualization (shows equipped weapon type)

### 2.2 Character Progression

**Level System:**
- XP required per level: `Level * 100`
- Max Level: 50
- On level up: Game pauses, player chooses from 3-4 random upgrades

**XP System:**
- Enemies drop XP orbs when defeated
- XP orb values:
  - Normal enemy: 10 XP
  - Elite enemy: 25 XP
  - Boss enemy: 100 XP
- XP orbs auto-collect when player is within pickup range

---

## 3. Weapon System

### 3.1 Weapon Types

**Starting Weapon:** Basic Sword

| Weapon | Type | Damage | Attack Speed | Range | Special |
|--------|------|--------|--------------|-------|---------|
| Basic Sword | Melee | 10 | 1.0/s | 60px | Frontal arc attack |
| Magic Orb | Ranged | 8 | 0.8/s | 300px | Homing projectile |
| Arrow Bow | Ranged | 15 | 0.6/s | 400px | Piercing projectile |
| Fire Wand | AoE | 12 | 0.5/s | 250px | Area damage over time |
| Lightning Rod | Chain | 9 | 0.9/s | 200px | Chains to 3 enemies |
| Ice Staff | Ranged + Slow | 7 | 0.7/s | 280px | Slows enemies by 30% |

### 3.2 Weapon Upgrades

Each weapon can be upgraded:
- **Level 1 → 2:** +20% damage, costs 1 upgrade choice
- **Level 2 → 3:** +20% damage, +1 projectile, costs 1 upgrade choice
- **Level 3 → 4:** +20% damage, +special effect, costs 1 upgrade choice
- **Level 4 → 5 (Max):** +40% damage, visual upgrade, costs 1 upgrade choice

**Multi-Weapon System:**
- Players can equip up to 3 weapons simultaneously
- Each weapon attacks independently
- Weapons fire in sequence (not simultaneously)

---

## 4. Enemy System

### 4.1 Enemy Types

**Basic Enemies:**
| Type | HP | Speed | Damage | Color | Behavior |
|------|-----|-------|--------|-------|----------|
| Slime | 20 | 80px/s | 10 | Green | Moves directly toward player |
| Skeleton | 30 | 100px/s | 15 | White/Gray | Moves directly toward player |
| Bat | 15 | 150px/s | 8 | Purple | Erratic movement |

**Elite Enemies:**
| Type | HP | Speed | Damage | Color | Behavior |
|------|-----|-------|--------|-------|----------|
| Armored Slime | 60 | 70px/s | 20 | Dark Green | High HP, slow |
| Skeleton Warrior | 50 | 90px/s | 25 | Red-tinted | Balanced stats |
| Ghost | 35 | 130px/s | 18 | Transparent Blue | Phases through obstacles |

**Boss Enemies (Every 5 waves):**
| Wave | Boss Name | HP | Speed | Damage | Special Ability |
|------|-----------|-----|-------|--------|-----------------|
| 5 | Giant Slime | 300 | 60px/s | 30 | Spawns 3 slimes on death |
| 10 | Skeleton King | 500 | 80px/s | 40 | Summons 5 skeletons periodically |
| 15 | Dark Dragon | 800 | 100px/s | 50 | Breathes fire in player direction |
| 20 | Death Lord | 1200 | 90px/s | 60 | Teleports near player |
| 25+ | Scaling Boss | 1000 + (wave * 100) | 100px/s | 50 + (wave * 5) | Random special ability |

### 4.2 Wave System

**Wave Mechanics:**
- Each wave lasts **90 seconds**
- **10 second break** between waves (enemies stop spawning, existing enemies remain)
- Wave 1-5: Only basic enemies
- Wave 6-10: Basic + occasional elite enemies
- Wave 11+: Mix of basic and elite, increasing difficulty
- **Boss waves:** 5, 10, 15, 20, 25, etc.

**Enemy Spawn Rate:**
```
Wave 1-3: 1 enemy every 2 seconds
Wave 4-6: 1 enemy every 1.5 seconds
Wave 7-10: 1 enemy every 1 second
Wave 11-15: 1 enemy every 0.8 seconds
Wave 16+: 1 enemy every 0.5 seconds
```

**Enemy Scaling:**
- Enemy HP increases by **10% per wave**
- Enemy damage increases by **5% per wave**
- Enemy speed increases by **2% per wave**

---

## 5. Upgrade System

### 5.1 Upgrade Categories

**Weapon Upgrades:**
- Damage +20%
- Attack Speed +15%
- Projectile Count +1
- Range +25%
- Critical Hit Chance +10%
- Projectile Speed +20%

**Defensive Upgrades:**
- Max HP +20
- Defense +5
- HP Regeneration +2/sec
- Damage Reduction +10%
- Invincibility Frames on Hit +0.5s (cooldown)

**Movement Upgrades:**
- Movement Speed +10%
- Pickup Range +30%
- Dodge Chance +5%

**Special Upgrades:**
- Magnet (auto-collect XP in larger radius)
- Area of Effect Damage +25%
- Lifesteal +10% (heal on kill)
- XP Gain +20%
- Extra Life (revive once per run)

### 5.2 Upgrade Selection

**On Level Up:**
1. Game pauses
2. Show upgrade selection screen with 3-4 random options
3. Player chooses ONE upgrade
4. Game resumes

**Upgrade Pool Logic:**
- Never offer same upgrade twice in one selection
- Weighted random (prioritize upgrades player doesn't have)
- Weapon-specific upgrades only appear if player has that weapon
- Guaranteed to offer at least one new weapon after wave 3

---

## 6. Game Mechanics

### 6.1 Core Loop

```
START GAME
    ↓
Wave Begins → Enemies Spawn → Auto-Attack Enemies
    ↓                                    ↓
Enemies Drop XP Orbs ← Enemies Die      ↓
    ↓                                    ↓
Player Collects XP → Level Up → Choose Upgrade
    ↓
Next Wave (increasing difficulty)
    ↓
BOSS WAVE (every 5 waves)
    ↓
Continue until HP reaches 0
    ↓
GAME OVER → Show Score → Save to High Scores
```

### 6.2 Scoring System

**Score Calculation:**
- Kill enemy: `Enemy HP / 2` points
- Survive 1 second: `1` point
- Kill boss: `Boss HP` points (bonus)
- Final score: `Kill points + Survival points + Boss bonus`

**High Score Features:**
- Top 10 scores saved
- Include: Score, Time survived, Wave reached, Difficulty
- Sort by score (descending)

### 6.3 Damage & Health

**Damage Calculation:**
```
Actual Damage = Enemy Base Damage × Difficulty Multiplier - Player Defense
Minimum Damage = 1 (always deal at least 1 damage)
```

**Health System:**
- Start with 100 HP (modifiable by upgrades)
- Take damage when enemy touches player
- **I-frames (Invincibility Frames):** 0.5s after taking damage (visual: player blinks)
- HP regeneration from upgrades applies every second

**Death:**
- When HP reaches 0 → Game Over
- Show final stats (score, time, wave, kills)
- Option to restart or return to menu

---

## 7. UI/UX Design

### 7.1 In-Game HUD

**Top-Left:**
- Health bar (visual + HP number)
- Level indicator (e.g., "Level 12")
- XP bar (shows progress to next level)

**Top-Right:**
- Score counter
- Wave number
- Timer (MM:SS format)

**Bottom-Center:**
- Equipped weapons display (small icons with levels)
- Active buffs/debuffs (icons with timers)

### 7.2 Level Up Screen

**Display:**
- "LEVEL UP!" header (animated, glowing)
- Current level number
- 3-4 upgrade cards to choose from:
  - Upgrade name
  - Upgrade icon
  - Brief description
  - Current level → New level (if applicable)

### 7.3 Game Over Screen

**Display:**
- "GAME OVER" header
- Final score
- Time survived
- Wave reached
- Enemies defeated
- Level reached
- High score notification (if applicable)
- Buttons: Play Again, Main Menu

---

## 8. Visual Effects

### 8.1 Player Effects
- **Movement trail:** Subtle glowing trail when moving
- **Damage flash:** Brief white flash when taking damage
- **Level up glow:** Golden aura on level up
- **Weapon effects:** Visual indicators for equipped weapons

### 8.2 Enemy Effects
- **Death animation:** Fade out + particle explosion
- **Damage flash:** Red tint when hit
- **Boss aura:** Special glow/pulse effect for bosses
- **Status effects:** Visual indicators (slow = blue, burn = orange, etc.)

### 8.3 Projectile Effects
- **Sword slash:** Arc animation in front of player
- **Magic orb:** Glowing orb with trail
- **Arrow:** Fast projectile with trail
- **Fire:** AoE circle with damage over time
- **Lightning:** Chain lightning effect between enemies
- **Ice:** Slow-moving projectile with frost effect

### 8.4 XP Orbs
- Glowing orbs floating toward player
- Color based on value:
  - Green (10 XP)
  - Blue (25 XP)
  - Purple (100 XP)
- Collect animation (fly to player + disappear)

---

## 9. Audio Design

### 9.1 Music
- **Menu:** Calm, relaxing melody (already implemented)
- **Game:** Upbeat, energetic track (already implemented)
- **Boss fight:** Intense, dramatic music
- **Level up:** Short celebratory jingle

### 9.2 Sound Effects
- **Enemy hit:** Satisfying "thwack" sound
- **Enemy death:** Quick death sound
- **XP collect:** Soft "ding" sound
- **Level up:** Triumphant chord progression
- **Player damage:** Warning sound
- **Boss spawn:** Dramatic boom
- **Wave complete:** Fanfare

---

## 10. Technical Implementation

### 10.1 Game Architecture

**Main Game Objects:**
```javascript
player = {
    x, y, width, height,
    hp, maxHp, speed,
    level, xp, xpToNextLevel,
    weapons: [],
    upgrades: {},
    defense, pickupRange,
    invincibleTimer, blinkTimer
}

enemies = [] // Array of enemy objects
projectiles = [] // Array of projectile objects
xpOrbs = [] // Array of XP orb objects
upgradeChoices = [] // Array of available upgrades on level up
```

**Game Loop:**
```javascript
function gameLoop() {
    if (gamePaused) return;
    
    updatePlayer();
    updateEnemies();
    updateProjectiles();
    updateXpOrbs();
    checkCollisions();
    updateUI();
    render();
    
    requestAnimationFrame(gameLoop);
}
```

**Enemy Spawning:**
```javascript
function spawnEnemy() {
    // Random position on screen edge
    // Based on current wave, determine enemy type
    // Apply wave scaling to stats
    // Add to enemies array
}
```

**Auto-Attack System:**
```javascript
function autoAttack() {
    // Find nearest enemy within weapon range
    // Fire projectile based on weapon stats
    // Respect attack speed cooldown
    // Cycle through equipped weapons
}
```

### 10.2 Performance Optimization
- Use object pooling for enemies, projectiles, and XP orbs
- Limit active projectiles to prevent lag
- Use spatial partitioning for collision detection (grid-based)
- Cap enemy count at 100 on screen simultaneously

---

## 11. Implementation Phases

### Phase 1: Core Mechanics
- [ ] XP system (enemies drop XP, player collects)
- [ ] Level up system (pause game, show UI)
- [ ] Basic upgrade system (3-5 upgrades)
- [ ] Auto-attack system (nearest enemy)
- [ ] Basic projectile system

### Phase 2: Weapon System
- [ ] Multiple weapon types (3 weapons)
- [ ] Weapon upgrade levels
- [ ] Multi-weapon support (up to 3)
- [ ] Weapon-specific projectiles

### Phase 3: Enemy System
- [ ] Multiple enemy types (basic + elite)
- [ ] Wave system with breaks
- [ ] Enemy scaling per wave
- [ ] Boss enemies (every 5 waves)
- [ ] Boss special abilities

### Phase 4: UI/UX Enhancement
- [ ] Improved HUD (level, XP bar, weapons)
- [ ] Level up selection screen
- [ ] Enhanced game over screen
- [ ] Visual effects (particles, trails)

### Phase 5: Polish & Balance
- [ ] Sound effects for all actions
- [ ] Visual polish (glows, animations)
- [ ] Game balance (damage, HP, upgrades)
- [ ] Performance optimization
- [ ] Bug fixes and testing

---

## 12. Future Enhancements (Post-MVP)

- **Multiple Characters:** Unlockable characters with unique starting weapons
- **Daily Challenges:** Special daily game modes with modifiers
- **Achievements:** Unlockable milestones
- **Crafting System:** Combine items for powerful equipment
- **Skill Tree:** Permanent upgrades across runs (meta-progression)
- **Multiplayer:** Co-op survival mode
- **Leaderboards:** Online score rankings
- **More Weapons:** 10+ unique weapons
- **More Enemies:** 15+ enemy types with varied behaviors
- **Map Features:** Obstacles, healing fountains, etc.

---

## 13. Design Philosophy

**Keep It Simple:**
- Easy to learn (just move)
- Hard to master (positioning is key)
- Satisfying feedback loops

**Player Agency:**
- Meaningful upgrade choices
- Multiple viable strategies
- No "wrong" builds, just different approaches

**Fair Difficulty:**
- Challenging but not frustrating
- Player skill matters more than RNG
- Clear cause and effect (deaths feel fair)

**Rewarding Progression:**
- Constant sense of growth
- Regular power spikes (level ups)
- Visible improvement over time

---

## 14. Balance Guidelines

**Early Game (Waves 1-5):**
- Player should feel powerful
- Focus on learning mechanics
- Build foundation with upgrades

**Mid Game (Waves 6-15):**
- Difficulty ramps up
- Player needs good upgrade choices
- Boss fights test positioning

**Late Game (Waves 16+):**
- Intense bullet-hell action
- Only well-built characters survive
- High scores require skill + strategy

**Expected Run Length:**
- New players: 3-5 minutes
- Average players: 8-12 minutes  
- Skilled players: 15-25 minutes
- Expert players: 30+ minutes

---

## 15. Success Metrics

**Engagement:**
- Average session time > 10 minutes
- Players retry multiple times
- Clear progression feeling

**Fun Factor:**
- Satisfying combat feedback
- Exciting level-up moments
- "One more run" mentality

**Accessibility:**
- Easy to understand
- Clear visual feedback
- Adjustable difficulty

---

*Document Version: 1.0*  
*Last Updated: 2026-04-04*  
*Status: Ready for Implementation*
