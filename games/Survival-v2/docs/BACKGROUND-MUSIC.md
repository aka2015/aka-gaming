# Background Music System - Survival Game

## Overview
This update adds a dynamic background music system to the Survival game using the Web Audio API. The music adapts to different game states and wave progressions.

## Features

### 🎵 Dynamic Music Patterns
The background music changes based on game progression:
- **Waves 1-2**: Dark atmospheric intro - slower, moody chords
- **Waves 3-4**: Building tension - increased tempo
- **Waves 5+**: Epic battle theme - fuller chords and faster pace
- **Boss Fights**: Intense combat music - fastest tempo, dramatic chords
- **Wave Rest**: Music pauses during rest phases

### 🎼 Musical System
- **5 Different Patterns**: Each with unique chord progressions and bass lines
- **Adaptive Tempo**: Music speed increases with game difficulty
- **Bass Lines**: Separate bass pattern for depth
- **Smooth Transitions**: Cross-fades between musical phrases
- **Procedural Generation**: No external audio files needed!

### 🎛️ Controls
- **Sound Toggle**: Controls all sound effects (existing feature)
- **Background Music Toggle**: New control specifically for BGM
  - Located in Settings screen
  - Can be toggled ON/OFF independently
  - Shows 🎵 icon when enabled

## Implementation Details

### Modified Files

1. **`src/system/audio.js`**
   - Added background music variables and state
   - Created `NOTES` constant with musical note frequencies
   - Implemented `BG_PATTERNS` and `BASS_PATTERNS` arrays
   - Added functions:
     - `playBackgroundMusic()` - Plays adaptive BGM
     - `stopBackgroundMusic()` - Stops BGM and cleans up
     - `toggleBackgroundMusic()` - Toggles BGM on/off
     - `updateBackgroundMusicForGameState()` - Auto-adjusts to game state
     - `getPatternIndexForGameState()` - Determines appropriate pattern

2. **`src/game/game-start.js`**
   - Added `initAudio()` call at game start
   - Starts background music after countdown completes
   - Stops music on game reset

3. **`src/game/wave-rest.js`**
   - Stops music when game is paused
   - Resumes music when game is unpaused
   - Stops music on game over
   - Resumes music when new wave starts from rest phase

4. **`src/game/wave-system.js`**
   - Updates music when transitioning to wave rest
   - Updates music when boss fight begins

5. **`src/game/game-setup.js`**
   - Added event listener for background music toggle button

6. **`index.html`**
   - Added Background Music toggle UI element in Settings screen

### Audio Architecture

```
AudioContext (Master)
├── Sound Effects (direct connection)
└── Background Music (bgMusicGainNode @ 15% volume)
    ├── Chord Oscillators (3-4 notes)
    └── Bass Oscillator (1 note, octave lower)
```

### Volume Levels
- **Background Music**: 15% master gain
  - Individual notes: 8% peak gain
  - Bass: 12% peak gain
- **Sound Effects**: 10-15% gain (existing)

## How to Use

### For Players
1. Open the game in your browser
2. Go to **Settings** from the main menu
3. Toggle **Background Music** ON/OFF
4. Start playing - music will begin after the 3-2-1 countdown
5. Music will automatically adapt as you progress through waves

### For Developers

#### Starting Background Music
```javascript
// Initialize audio context (must be called from user interaction)
initAudio();

// Start background music
if (bgMusicEnabled) {
    playBackgroundMusic();
}
```

#### Stopping Background Music
```javascript
stopBackgroundMusic();
```

#### Toggling Music
```javascript
const isEnabled = toggleBackgroundMusic();
```

#### Manual Pattern Selection
```javascript
// This happens automatically, but can be called manually
updateBackgroundMusicForGameState();
```

## Technical Notes

### Web Audio API
- Uses oscillator-based synthesis
- No external audio files required
- Procedurally generated in real-time
- Compatible with all modern browsers

### Performance
- Lightweight: Only 2-4 oscillators active at any time
- Automatic cleanup: Oscillators are properly disposed
- Throttled: setTimeout-based scheduling prevents buildup

### Browser Autoplay Policy
- Audio context is initialized on user interaction (click)
- Music starts after countdown (which requires user action)
- Complies with modern browser autoplay restrictions

## Testing

A test file is included: `test-bg-music.html`
- Open in browser to test the music system independently
- Includes Start, Stop, and Toggle buttons
- Useful for debugging and development

## Future Enhancements

Potential improvements for future versions:

1. **More Music Patterns**: Add variety within same wave range
2. **Volume Control**: Slider for BGM volume
3. **Custom Music**: Support for loading external audio files
4. **Loop Points**: Smoother transitions between patterns
5. **More Bass Variation**: Additional bass line patterns
6. **Percussion**: Add rhythmic elements
7. **Melody Lines**: Add lead melody on top of chords
8. **Dynamic Mixing**: Fade between layers instead of hard switches

## Troubleshooting

### Music Not Playing
- Check if audio context is initialized (requires user interaction)
- Verify `bgMusicEnabled` is true
- Check browser console for errors
- Ensure browser supports Web Audio API

### Music Too Loud/Quiet
- Adjust `bgMusicGainNode.gain.setValueAtTime(0.15, ...)` in `audio.js`
- Lower values = quieter, higher = louder
- Recommended range: 0.1 - 0.2

### Music Not Stopping
- Ensure `stopBackgroundMusic()` is called on pause/game over
- Check that all code paths call the stop function
- Verify timeout is being cleared properly

## Credits
- Procedural music system inspired by classic game audio
- Built entirely with Web Audio API
- No external audio dependencies

---

**Enjoy the enhanced survival experience with dynamic background music! 🎮🎵**
