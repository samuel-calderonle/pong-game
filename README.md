# 🎮 Pong Game

A classic Pong arcade game built with vanilla HTML, CSS, and JavaScript. Play against an AI opponent in this retro-inspired implementation.

[![Play Now](https://img.shields.io/badge/Play%20Now-🎮-yellow?style=for-the-badge)](https://samuel-calderonle.github.io/pong-game/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## 🚀 Quick Start

### Play Online
No installation needed! **[Play the game directly in your browser](https://samuel-calderonle.github.io/pong-game/)**

### Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/samuel-calderonle/pong-game.git
   cd pong-game
   ```

2. Open `index.html` in your web browser

That's it! No dependencies or build tools required.

## 🎯 How to Play

- **Left Paddle Control:**
  - 🖱️ **Mouse**: Move your paddle by moving your mouse vertically
  - ⌨️ **Arrow Keys**: Press `↑` (Up) and `↓` (Down) to move the paddle

- **Objective**: Prevent the ball from reaching your side while trying to get it past the computer opponent

- **Scoring**: Each time the ball gets past your opponent, you earn 1 point

## 🎨 Features

✨ **Classic Gameplay** - Pure Pong arcade action with smooth animations

🤖 **AI Opponent** - Challenging computer-controlled right paddle with adaptive difficulty

🎯 **Collision Detection** - Realistic ball physics with paddle and wall interactions

📊 **Live Scoreboard** - Real-time score tracking for both players

🌙 **Dark Theme** - Beautiful gradient background with high contrast UI

⚡ **Smooth Performance** - 60 FPS gameplay using requestAnimationFrame

🎮 **Dual Control Options** - Play with mouse or keyboard controls

## 🛠️ Technologies Used

- **HTML5** - Canvas API for graphics rendering
- **CSS3** - Modern styling with gradients and animations
- **JavaScript (ES6+)** - Game logic and physics engine

## 📁 Project Structure

```
pong-game/
├── index.html       # Main game HTML structure
├── style.css        # Styling and layout
├── script.js        # Game logic and physics
└── README.md        # This file
```

## 🎮 Game Mechanics

### Ball Physics
- Ball bounces off top and bottom walls
- Ball speed increases slightly with each paddle hit (max cap at 1.05x)
- Ball angle changes based on where it hits the paddle
- Hitting the ball with different parts of the paddle changes its trajectory

### AI Opponent
- Computer paddle follows the ball with smooth interpolation
- Adaptive difficulty that keeps the game challenging but fair
- AI reaction time is realistic (not instant)

### Collision Detection
- Precise rectangular collision detection for paddles
- Circle-to-rectangle collision for ball-to-paddle interactions
- Automatic ball reset when scoring occurs

## 🎓 Learning Resources

This project demonstrates:
- Canvas 2D rendering and animation
- Game loop implementation with `requestAnimationFrame`
- Collision detection algorithms
- Input handling (keyboard and mouse)
- Game state management
- AI behavior programming

Perfect for learning game development basics with vanilla JavaScript!

## 📝 Code Quality

- **No Dependencies** - Pure JavaScript, no frameworks or libraries
- **Clean Code** - Well-organized, readable, and documented
- **Responsive** - Works on desktop browsers
- **Performant** - Optimized rendering and physics calculations

## 🚀 Future Enhancements

Potential improvements to consider:

- [ ] Difficulty levels (Easy, Medium, Hard)
- [ ] Two-player mode (both players local)
- [ ] Sound effects and background music
- [ ] Particle effects on collision
- [ ] Mobile touch controls
- [ ] Power-ups and special moves
- [ ] High score persistence (localStorage)
- [ ] Replay system
- [ ] Multiple ball modes

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Created by [samuel-calderonle](https://github.com/samuel-calderonle)

## 🎉 Acknowledgments

Inspired by the classic Pong arcade game by Atari (1972)

---

**Enjoy the game!** 🎮 [Play now →](https://samuel-calderonle.github.io/pong-game/)

Have fun and feel free to share your high scores!
