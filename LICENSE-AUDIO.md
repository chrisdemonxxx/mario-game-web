# Audio & Sound Effects - License & Attribution

## Overview
The Mario Game Web implementation uses the **Web Audio API** to generate all sound effects and background music synthetically. This approach ensures:
- ✅ Full legal compliance (no copyrighted audio)
- ✅ No external audio files required (reduces distribution size)
- ✅ Responsive, game-feel-appropriate sounds
- ✅ Cross-browser compatibility
- ✅ Accessibility features (visual indicators for audio)

## Sound Effects Generated
All sounds are synthesized using the Web Audio API's oscillators and envelopes:

### 1. Jump Sound
- **Type**: Ascending pitch sweep (triangle wave)
- **Frequency**: 400 Hz → 600 Hz over 100ms
- **Purpose**: Auditory feedback when player jumps
- **Origin**: Procedurally generated (no external audio)

### 2. Coin Collection Sound
- **Type**: Ascending musical progression (three sine waves)
- **Notes**: C5 (523 Hz), E5 (659 Hz), G5 (784 Hz)
- **Duration**: 45ms per note
- **Purpose**: Positive feedback for collectible pickup
- **Origin**: Procedurally generated (no external audio)

### 3. Enemy Defeat Sound
- **Type**: Descending pitch sweep (square wave)
- **Frequency**: 400 Hz → 100 Hz over 300ms
- **Purpose**: Confirmation of successful enemy defeat
- **Origin**: Procedurally generated (no external audio)

### 4. Power-Up Sound
- **Type**: Rising pitch sequence (four sine waves)
- **Frequencies**: 330 Hz, 440 Hz, 550 Hz, 660 Hz
- **Duration**: 100ms per note
- **Purpose**: Notification of power-up activation
- **Origin**: Procedurally generated (no external audio)

### 5. Game Over Sound
- **Type**: Sad descending progression (three sine waves)
- **Frequencies**: 400 Hz, 300 Hz, 200 Hz
- **Duration**: 300ms per note
- **Purpose**: Game end notification
- **Origin**: Procedurally generated (no external audio)

### 6. Background Music
- **Type**: 8-bit chiptune style (square wave oscillator)
- **BPM**: 120 beats per minute
- **Pattern**: Repeating 16-beat melody (4 bars × 4 beats)
- **Melody**: D5, D5, E5, F#5, F#5, E5, D5, D5, E5, E5, E5, D5, D5, D5, E5, D5
- **Style**: Inspired by classic platformer game music
- **Origin**: Procedurally generated (no external audio)

## Technical Implementation

### Web Audio API Standards
- **Specification**: W3C Web Audio API (https://www.w3.org/TR/webaudio/)
- **Browser Compatibility**:
  - Chrome 25+ ✅
  - Firefox 25+ ✅
  - Safari 6+ ✅
  - Edge 12+ ✅
  - Mobile browsers (iOS Safari 6+, Chrome Android) ✅

### Memory & Performance
- **Memory Usage**: < 1 MB (no audio files stored)
- **CPU Impact**: Minimal (oscillators are hardware-accelerated)
- **Load Time**: No additional assets to download
- **Optimization**: Oscillators are disposed after playback completes

### Accessibility
All sound effects should have visual indicators for deaf/hard-of-hearing players:
- Jump sound → Screen shake/visual effect
- Coin collection → Score popup animation
- Enemy defeat → Flash/impact animation
- Power-up → Glow effect on player
- Game over → Fade to black/end screen

## Testing
All audio is tested in the following browsers:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (responsive audio controls)

See `tests/audio.test.js` for unit test coverage.

## Controls
- **Volume Control**: Slider (0 - 100%) in game UI
- **Mute Button**: Toggles all audio on/off
- **Background Music**: Loops during gameplay, stops on game over
- **Sound Effects**: Play immediately on trigger events

## No External Audio Files
**Important**: This implementation contains **zero external audio files** (.mp3, .wav, .ogg, etc.). All audio is generated in real-time using oscillators and envelopes from the Web Audio API.

### Why This Approach?
1. **Legal Compliance**: No risk of copyright infringement
2. **Performance**: No network requests or file I/O for audio
3. **Simplicity**: Single JavaScript module, no asset pipeline
4. **Customization**: Sounds can be easily tweaked via frequency/envelope parameters
5. **Game Feel**: Synthesized sounds are perfect for retro platformer aesthetic

## License Summary
✅ **100% Original**: All code in `src/audio.js` and `src/game-audio.js` is original implementation
✅ **CC0 1.0 Universal**: This audio implementation is placed in the public domain
✅ **Royalty-Free**: No licensing fees or attribution required
✅ **Freely Usable**: Can be used in commercial and non-commercial projects

## References
- W3C Web Audio API: https://www.w3.org/TR/webaudio/
- MDN Web Audio API Guide: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Implementation Author: Mario Game Web Team
- Last Updated: 2026-11-11
