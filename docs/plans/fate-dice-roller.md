# Fate Dice Roller Plan (Three.js + Cannon-ES)

1. Get approval to add dependencies: `three` and `cannon-es` (dependency changes require asking first).
2. Inspect existing navigation in `/Users/ronan/.codex/worktrees/a28a/fate-cards/src/App.jsx` and nav styles in `/Users/ronan/.codex/worktrees/a28a/fate-cards/src/*.css` to place a new “Roll Fate Dice” button.
3. Create a new component in `src/` (e.g., `FateDiceRoller.jsx`) that owns a page-overlay canvas (pointer-events disabled) so the dice roll directly on the page.
4. Implement a top-down scene: Three.js `OrthographicCamera` looking straight down, ground plane, ambient + directional light, and 4 dice meshes. Use Cannon-ES for physics with a flat ground body.
5. On button click, spawn/reset 4 dice above the ground with randomized positions, velocities, and angular velocities; step physics in a `requestAnimationFrame` loop and sync meshes to bodies.
6. Detect “settled” by checking linear/angular velocity thresholds over a short window; once settled, start a 3-second timer, then fade out materials (set `transparent` and animate `opacity`), and finally dispose meshes/materials/bodies to avoid leaks.
7. Ensure responsiveness: scale camera frustum to the viewport, update on resize, and keep the overlay aligned with the page.
8. Add minimal styling for the nav button in `src/*.css`, and state handling in `App.jsx` (disable button while rolling to prevent overlapping simulations).
