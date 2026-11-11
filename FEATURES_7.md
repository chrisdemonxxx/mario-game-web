# Issue #7: Physics Engine & AABB Collision Detection

## Status: In Progress

Implementing core physics simulation:
- Gravity simulation (0.6 px/frame²)
- Terminal velocity cap (15 px/frame)
- AABB (Axis-Aligned Bounding Box) collision detection
- Collision resolution for all 4 directions (top, bottom, left, right)
- Platform collision and grounding
- Friction/momentum physics
- Physics queries for collision detection

See src/physics.js for implementation.