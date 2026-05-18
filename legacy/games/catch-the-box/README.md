# 🎮 Catch the Box

A fun and addictive web-based reaction game where you need to click the box before it moves! Built with vanilla HTML, CSS, and JavaScript.

![Preview](https://img.shields.io/badge/Game-Catch%20the%20Box-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

## ✨ Features

- **🎯 Classic Mode**: Click the box to score points before time runs out
- **⭐ Special Mode**: Earn coins instead of points
- **🛒 Shop System**: Upgrade your multiplier and extra time
- **🏆 High Scores**: Compete for the top 5 high scores
- **⚙️ Settings**: 
  - Multiple languages (English, Indonesian, German, Spanish, Italian)
  - Adjustable game time (15s, 30s, 45s)
  - Difficulty levels (Easy, Normal, Hard, Extreme)
  - Sound toggle
  - Player name customization
- **🎵 Background Music**: Procedurally generated melody using Web Audio API
- **💾 Local Storage**: Saves your coins, upgrades, high scores, and settings

## 🚀 How to Play

1. Open `index.html` in your browser
2. Click **▶️ Play** to start the game
3. Click the moving box as fast as you can
4. Each click earns you 1 point (plus multiplier bonus)
5. Game ends when time runs out

## 🛒 Shop Items

| Item | Description | Effect |
|------|-------------|--------|
| 📈 Point Multiplier | Get more points per box | +1 to +10 bonus points at max level |
| ⏱️ Extra Time | +5 seconds game time | Up to +25 seconds at max level |

## ⚙️ Settings

### Languages
- 🇺🇸 English (US)
- 🇬🇧 English (UK)
- 🇮🇩 Indonesian
- 🇩🇪 German
- 🇪🇸 Spanish
- 🇮🇹 Italian

### Difficulty Levels
| Level | Speed |
|-------|-------|
| 🟢 Easy | 2000ms |
| 🔵 Normal | 1400ms |
| 🟠 Hard | 800ms |
| 🔴 Extreme | 600ms |

### Game Time Options
- 🕐 15 seconds
- 🕐 30 seconds (default)
- 🕐 45 seconds

## 📁 Project Structure

```
web-game/
├── index.html          # Main HTML file
├── style.css           # Styles and animations
├── script.js           # Game logic
├── README.md           # This file
├── docs/
│   └── PLAN.md         # Original design document
└── assets/
    └── background-music.mp3  # Background music file
```

## 🎮 Game Modes

### Classic Mode
- Earn points by clicking the box
- Compete for high scores
- Save your name on the leaderboard

### Special Mode
- Earn coins instead of points
- Use coins to buy upgrades in the shop
- Progress persists across game sessions

## 💡 Tips

1. Start with **Easy** difficulty to get comfortable
2. Save coins in Special Mode to buy upgrades
3. Upgrade **Point Multiplier** first for better scores
4. The box moves faster as your score increases!

## 🛠️ Technical Details

- **No dependencies** - Pure vanilla JavaScript
- **Web Audio API** - Procedurally generated music
- **Local Storage** - Persistent game data
- **Responsive Design** - Works on desktop and mobile
- **CSS Gradients** - Modern UI design

## 🌐 Browser Support

Works on all modern browsers:
- Chrome
- Firefox
- Safari
- Edge

## 📝 Local Storage Keys

The game uses the following localStorage keys:
- `catchTheBoxCoins` - Player's coin balance
- `catchTheBoxUpgrades` - Shop upgrades
- `catchTheBoxHighscores` - High score list
- `catchTheBoxPlayerName` - Player's name
- `catchTheBoxLanguage` - Selected language
- `catchTheBoxGameTime` - Game duration setting

## 🤝 Contributing

Feel free to fork this project and add new features:
- More game modes
- Additional languages
- Power-ups
- Achievements system

## 📄 License

MIT License - Feel free to use this code for your own projects!

## 🙏 Acknowledgments

Built with ❤️ using vanilla web technologies.

---

**Enjoy the game!** 🎮✨
