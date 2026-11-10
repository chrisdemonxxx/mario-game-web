# Audio Asset Attribution & Licensing

This document tracks all audio assets used in Mario Game Web and their licenses.

## License Requirements

All audio must be:
- ✅ Royalty-free
- ✅ CC-licensed (CC-BY, CC-BY-SA)
- ✅ Properly attributed
- ✅ Free to use in games

## Recommended Audio Sources

### Royalty-Free Audio Platforms
1. **OpenGameArt.org** - https://opengameart.org/
   - Best for game audio
   - Search filters for license type
   - Many NES-style chiptune tracks

2. **Freesound.org** - https://freesound.org/
   - Thousands of sound effects
   - Filter by CC license
   - Community contributions

3. **Incompetech.com** - https://www.incompetech.com/
   - Free background music
   - CC-BY licensed
   - Various game music styles

4. **Itch.io** - https://itch.io/game-assets/asset/audio
   - Game audio bundles
   - Many free CC-licensed assets
   - Creator support via donations

### Search Terms for Asset Hunting
- "platformer background music"
- "NES chiptune"
- "8-bit video game music"
- "mario-like music"
- "retro game audio"
- "8-bit coin pickup"
- "video game jump sound"

## Audio Assets Template

```
### Sound Effect: [Name]
- **File**: assets/audio/sfx/[name].mp3
- **License**: [CC-BY / CC-BY-SA / etc]
- **Attribution**: [Artist/Creator Name]
- **Source**: [URL]
- **Duration**: [seconds]
```

## Placeholder Sounds

Until real audio is sourced, the system will:
- Gracefully handle missing audio files
- Continue gameplay without audio
- Log warnings for missing assets
- Use Web Audio API for future real audio

## Adding New Audio

1. Download from licensed source
2. Add attribution to this file
3. Place file in appropriate directory (audio/sfx/ or audio/music/)
4. Update GameAudioSystem with file path
5. Test audio playback in-game

