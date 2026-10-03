# 🎮 Pong Game

A polished browser-based Pong clone built with vanilla HTML, CSS, and JavaScript. This project delivers a retro arcade experience with a modern interface, multiple difficulty levels, local high-score tracking, and a responsive single-page gameplay loop.

## Live Demo

Play online here:
https://samuel-calderonle.github.io/pong-game/

## Overview

This project recreates the classic Pong experience in the browser with:

- a player-controlled paddle on the left
- an AI opponent on the right
- score tracking and a best-score system
- difficulty settings (Easy, Medium, Hard)
- responsive canvas-based rendering
- keyboard and mouse controls
- game pause / resume / menu flow
- occasional power-ups to add excitement
- lightweight, dependency-free setup

The game is intentionally simple and self-contained, making it a great example of a small arcade project built using only core web technologies.

## Features

### Gameplay

- Classic one-player Pong gameplay against a computer opponent
- First to 7 points wins the match
- Ball collisions with paddles and walls
- Score animation and game-over logic
- Pause/resume via button or keyboard
- Return to menu flow for quick restart

### Controls

- Mouse movement: move the left paddle by moving the cursor over the game canvas
- Arrow keys: Up and Down move the paddle
- Space: pause or resume the match
- Escape: return to the main menu

### Difficulty Modes

- Easy: slower AI speed, gentler ball velocity
- Medium: balanced challenge
- Hard: faster AI and more aggressive ball pace

### Extra Effects

- Particle bursts on collisions and scoring
- Screen shake on key events
- Procedural power-ups such as:
  - paddle growth
  - AI slowdown
- Synthesized sound effects using the Web Audio API
- Persistent best score saved in localStorage

## Project Stack

This repository is composed primarily of:

- HTML for the game structure and UI panels
- CSS for styling, layout, and retro arcade visuals
- JavaScript for game logic, rendering, physics, and controls

Language breakdown:

- JavaScript: core gameplay and rendering engine
- HTML: UI shell and canvas layout
- CSS: visuals, responsiveness, and interface styling

## Repository Structure

```text
pong-game/
├── index.html          # Main page with the game UI and canvas
├── style.css           # Game styling and layout
├── script.js           # Game loop, physics, AI, input handling, rendering
├── README.md           # Project documentation
├── LICENSE             # MIT license
└── .github/            # GitHub metadata and automation (if present)
```

## How to Play

1. Visit the live demo link above, or run the project locally.
2. Choose a difficulty level on the start screen.
3. Press Start Match.
4. Move your paddle to block the ball and score on the AI.
5. Reach 7 points to win the round.

## Running Locally

### Option 1: Open directly in the browser

1. Clone the repository:

```bash
git clone https://github.com/samuel-calderonle/pong-game.git
cd pong-game
```

2. Open `index.html` in a browser.

This project is a static frontend, so no install step or package manager is required.

### Option 2: Serve locally with a lightweight web server

If you want a cleaner experience and to avoid browser restrictions on some local assets, you can run a local server:

```bash
cd pong-game
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Technical Notes

### Game Loop

The game uses a requestAnimationFrame-based loop to continuously update the simulation and redraw the canvas. This allows for smooth motion and a consistent update cadence while keeping the project lightweight.

### Rendering

The canvas element is used to render:

- the paddles
- the ball
- the center divider
- particles and power-ups
- screen shake effects

### Physics

Gameplay includes:

- wall collision detection
- paddle collision detection
- ball direction changes based on impact position
- AI tracking that follows the ball position with smoothing
- difficulty-based speed tuning

### Persistence

The game stores the best score in the browser using `localStorage`, so the leaderboard persists across refreshes in the same browser.

## Customization

You can tweak several aspects of the game directly in `script.js`:

- `WIN_SCORE` to change how many points are needed to win
- `difficultySettings` to adjust AI speed and ball velocity
- `leftPaddle` and `rightPaddle` properties to modify paddle size and movement
- power-up timing or spawn behavior
- visual particle counts and screen-shake intensity

Examples:

```javascript
const WIN_SCORE = 7;

const difficultySettings = {
  easy: { aiSpeed: 3.4, ballSpeed: 5.2, label: "Easy" },
  medium: { aiSpeed: 4.6, ballSpeed: 6, label: "Medium" },
  hard: { aiSpeed: 6.1, ballSpeed: 6.8, label: "Hard" }
};
```

## Browser Compatibility

This project is designed for modern browsers with support for:

- HTML5 canvas
- CSS classes and layout styling
- JavaScript ES6 syntax
- Web Audio API for optional sound generation

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Author

Created by [samuel-calderonle](https://github.com/samuel-calderonle)

## Contributing

This repository is a simple personal project, but improvements are welcome. If you want to expand it, you could consider additions like:

- two-player local mode
- sound toggle settings
- score history or leaderboard
- touch controls for mobile devices
- start menu polish and animations
- stronger AI or alternate game modes

If you make changes, feel free to open a pull request or share your version of the project.

## Summary

`pong-game` is a compact, accessible arcade game that demonstrates how much can be built with just core web technologies. It is ideal for learning canvas animation, game state management, UI interactions, and browser-based game programming with no external dependencies.
