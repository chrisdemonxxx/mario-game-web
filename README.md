# Mario Game Web

A Mario-like web-based platformer game built with vanilla JavaScript, HTML5 Canvas, and a comprehensive automated testing pipeline.

## Overview

This project implements a classic platformer game engine with the following core systems:

- **Game Engine**: Core game loop with 60 FPS rendering using requestAnimationFrame
- **Canvas Rendering**: HTML5 Canvas-based 2D graphics (800x600 viewport)
- **Game State Management**: Centralized state for game objects and lifecycle
- **Physics System**: Gravity, velocity, and collision detection
- **Level System**: Tilemap-based level design with entity spawning
- **Player Controls**: Keyboard input for movement and jumping
- **Enemy AI**: Basic enemy pathfinding and behavior
- **Scoring System**: Collectible items and score tracking
- **Audio System**: Sound effects for events
- **HUD/UI**: Health display, score counter, level info

## Setup Instructions

### Prerequisites
- Node.js >= 18
- npm >= 8

### Installation

```bash
# Clone the repository
git clone https://github.com/chrisdemonxxx/mario-game-web.git
cd mario-game-web

# Install dependencies
npm install

# Start the development server
npm start

# Open your browser and navigate to http://localhost:8080
```

### Development

```bash
# Run linting
npm run lint

# Fix linting errors automatically
npm run lint:fix

# Run tests
npm test

# Run linting and tests (CI mode)
npm run ci

# Run security audit
npm audit
```

## Project Structure

```
mario-game-web/
├── index.html              # Main entry point with canvas
├── css/
│   └── style.css          # Game styles and layout
├── src/
│   ├── game.js            # Core Game class and game loop
│   ├── player.js          # Player character class
│   ├── enemy.js           # Enemy class
│   ├── level.js           # Level management
│   ├── ui.js              # UI and HUD rendering
│   ├── physics.js         # Physics engine and collision detection
│   └── utils.js           # Utility functions
├── assets/
│   ├── sprites/           # Player, enemy, tileset sprites
│   ├── sounds/            # Audio effects
│   └── data/
│       └── levels.json    # Level definitions
├── tests/                 # Jest unit tests
├── server.js              # Static file server with /health endpoint
├── jest.config.js         # Jest configuration
├── .eslintrc.json         # ESLint configuration
├── package.json           # Dependencies and scripts
└── README.md              # This file
```

## Game Engine Architecture

### Core Game Loop

The Game class manages the main game loop using requestAnimationFrame:

1. **Initialization** (`init()`): Sets up canvas context and game state
2. **Update** (`update()`): Updates game logic (physics, collisions, AI)
3. **Render** (`render()`): Draws game state to canvas
4. **Loop** (`gameLoop()`): Schedules frames via requestAnimationFrame at 60 FPS
5. **Start** (`start()`): Initializes and begins the game loop

### Game States
- **Menu**: Start screen
- **Playing**: Active gameplay
- **Paused**: Game paused by player
- **GameOver**: Player defeated
- **Win**: Level completed

### Physics System
- Delta time-based movement for frame-independent gameplay
- Gravity simulation
- Velocity and acceleration
- Collision detection using pixel-perfect or AABB algorithms
- Platform collision responses

## Testing

This project uses Jest for unit testing. Tests are located in the `tests/` directory and follow the naming convention `*.test.js`.

Key test areas:
- Game initialization and lifecycle
- Physics calculations
- Collision detection
- Player input handling
- Enemy AI
- Level loading
- UI rendering
- Audio system

Run tests with:
```bash
npm test          # Run all tests with coverage
npm run ci        # Lint and test (CI mode)
```

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

Minimum viewport: 800x600

## Deployment

The game is deployed via Railway. The `server.js` file provides a minimal static file server with a `/health` endpoint for monitoring.

Deploy commands:
```bash
git push main    # Automatically deploys to staging
# Approved merges deploy to production
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes with clear messages
4. Push to your fork
5. Open a pull request with acceptance criteria

## Testing Standards

- All PRs must have unit tests
- Target 80%+ code coverage
- Follow ESLint rules (4-space indent, semicolons)
- Tests validate functionality for the specific feature

## Architecture Decisions

- **Vanilla JavaScript**: No external frameworks for core engine (Vue/React added later)
- **Entity-Component System**: Flexible architecture for game objects
- **Canvas Rendering**: Direct control over graphics pipeline
- **Tilemap Design**: Efficient level data representation
- **Delta Time Physics**: Frame-rate independent gameplay

## Future Enhancements

- Level editor UI
- Mobile touch controls
- Multiplayer support
- Advanced graphics (parallax, particles)
- More complex enemy AI
- Boss encounters
- Power-ups and upgrades
- Leaderboard system

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue on GitHub.