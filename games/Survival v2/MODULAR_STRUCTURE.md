# Survival Game - Modular Structure

This game has been refactored into a modular structure for better maintainability and code organization.

## 📁 Folder Structure

```
new-game/
├── index.html              # Main HTML file (loads all modules)
├── style.css               # Styles
├── game.js                 # Original monolithic file (kept for backup)
├── src/                    # Modular game code
│   ├── main.js             # Main entry point & game loop
│   ├── data/               # Game data definitions
│   │   └── game-data.js    # Characters, weapons, enemies, bosses, upgrades, shop items
│   ├── system/             # Core system modules
│   │   ├── game-state.js   # Global state variables (player, enemies, game vars)
│   │   └── audio.js        # Audio system & utility functions
│   ├── render/             # Rendering modules
│   │   ├── character-render.js  # Character drawing functions
│   │   └── rendering.js         # All game rendering functions
│   ├── ui/                 # UI modules
│   │   └── ui-functions.js # HUD updates, warnings, damage numbers
│   └── game/               # Game logic modules
│       ├── game-setup.js       # Event listeners & screen setup
│       ├── game-start.js       # Game initialization
│       ├── player.js           # Player movement & updates
│       ├── weapons.js          # Weapon system & attacks
│       ├── enemies.js          # Enemy AI & boss abilities
│       ├── projectiles.js      # Projectile system
│       ├── wave-system.js      # Wave management & spawning
│       ├── collisions.js       # Collision detection & damage
│       ├── collectibles.js     # XP orbs & coins
│       ├── level-up.js         # Level up & upgrade system
│       ├── shop.js             # Shop system
│       └── wave-rest.js        # Wave rest & high scores
```

## 🎯 Module Descriptions

### Data Layer (`src/data/`)
- **game-data.js**: All static game data including characters, weapons, enemies, bosses, upgrades, and shop items

### System Layer (`src/system/`)
- **game-state.js**: Global variables and game state management
- **audio.js**: Audio system for sound effects and utility functions

### Rendering Layer (`src/render/`)
- **character-render.js**: Character sprite drawing (warrior, mage, ranger)
- **rendering.js**: All canvas rendering functions (enemies, projectiles, UI elements, etc.)

### UI Layer (`src/ui/`)
- **ui-functions.js**: DOM manipulation for HUD, warnings, damage numbers, boss HP bar

### Game Logic Layer (`src/game/`)
- **game-setup.js**: Event binding and screen management
- **game-start.js**: Game initialization and reset functions
- **player.js**: Player movement, boundary checking, HP regeneration
- **weapons.js**: Auto-attack system, weapon firing, target finding
- **enemies.js**: Enemy movement, boss abilities, AI behaviors
- **projectiles.js**: Projectile updates, homing, chain lightning, AoE
- **wave-system.js**: Wave progression, enemy spawning, boss spawning
- **collisions.js**: Collision detection and damage calculation
- **collectibles.js**: XP orb and coin pickup with magnet effect
- **level-up.js**: Level up system and upgrade choices
- **shop.js**: Shop UI, purchasing, and upgrade application
- **wave-rest.js**: Rest phase between waves and high score management

## 🚀 How to Run

Simply open `index.html` in a web browser. All modules are loaded via `<script>` tags in the correct order.

## 📝 Module Loading Order

The modules are loaded in this specific order to ensure dependencies are met:

1. **Data** - All game constants and definitions
2. **System** - Game state and audio system
3. **Render** - Character and game rendering
4. **UI** - User interface functions
5. **Game** - All game logic modules (in dependency order)
6. **Main** - Game loop and initialization

## 🎮 Game Features

- 3 unique characters (Warrior, Mage, Ranger)
- 6 weapon types with different projectile behaviors
- Wave-based survival gameplay
- Boss fights every 5 waves
- Level-up upgrade system
- In-game shop for permanent upgrades
- High score tracking

## 🔧 Future Improvements

Potential enhancements for better architecture:
- Convert to ES6 modules with proper imports/exports
- Implement a proper game engine class
- Add TypeScript for type safety
- Implement entity-component system
- Add proper state management (Redux-like pattern)

## 📊 Code Statistics

- **Original**: 1 file, ~3,263 lines
- **Modular**: 16 files, organized by functionality
- Average file size: ~200-400 lines (much more manageable)

## ⚠️ Important Notes

1. The original `game.js` file is kept as a backup
2. All modules share global scope (same as original)
3. No build process required - just open in browser!
4. All dependencies are managed via script loading order in index.html
