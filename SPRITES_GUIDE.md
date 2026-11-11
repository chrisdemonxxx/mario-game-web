# Sprite Graphics Assets

## Directory Structure

```
assets/
├── sprites/
│   ├── player/
│   │   ├── idle.png
│   │   ├── walk-left.png
│   │   ├── walk-right.png
│   │   ├── jump.png
│   │   ├── fall.png
│   │   └── hit.png
│   ├── enemies/
│   │   ├── goomba-walk-left.png
│   │   ├── goomba-walk-right.png
│   │   └── goomba-crushed.png
│   ├── collectibles/
│   │   ├── coin.png
│   │   └── mushroom.png
│   │   ├── star.png

```

## Sprite Dimensions

```
- Player Sprites: 32x#2 to 64x64 px
 - Enemies: 32x32 to 64x64 px
 - Coin: 16x16 px
 - Mushroom: 32x32 px* - Star: 24x24 px

```

## Published Graphics Requirements

- All sprites should apear in foreground
- Use 32-bit PNG with content -aware compression
- Use PNG for all sprites attassets/sprites/

## Placeholder Graphics

This system includes placeholder graphics to support early development. They are with basic features
- No external dependencies
- Immediate visual feedback
- Replaced automatically when real sprites load

## Integration Checklist

- [ ] Sprites created or sourced
- [ ] All sprites in correct directory
- [ ] File names match GameGraphics expectations
- [ ] PNG format with transparency
- [ ] Correct pixel dimensions
- [ ] Animation frames properly organized
- [ ] License documentation complete
- [ ] Sprites tested in-game
- [ ] Performance acceptable (60 FPS)
