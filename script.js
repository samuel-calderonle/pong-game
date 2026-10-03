const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const leftScoreEl = document.getElementById("leftScore");
const rightScoreEl = document.getElementById("rightScore");
const bestScoreEl = document.getElementById("bestScore");
const statusText = document.getElementById("statusText");
const startScreen = document.getElementById("startScreen");
const gameContainer = document.getElementById("gameContainer");
const gameOverOverlay = document.getElementById("gameOverOverlay");
const winnerText = document.getElementById("winnerText");
const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const menuBtn = document.getElementById("menuBtn");
const playAgainBtn = document.getElementById("playAgainBtn");
const overlayMenuBtn = document.getElementById("overlayMenuBtn");
const difficultyButtons = [...document.querySelectorAll(".difficulty-btn")];

const STORAGE_KEY = "pong-best-score";
const WIN_SCORE = 7;

const difficultySettings = {
  easy: { aiSpeed: 3.4, ballSpeed: 5.2, label: "Easy" },
  medium: { aiSpeed: 4.6, ballSpeed: 6, label: "Medium" },
  hard: { aiSpeed: 6.1, ballSpeed: 6.8, label: "Hard" }
};

const game = {
  width: canvas.width,
  height: canvas.height,
  leftScore: 0,
  rightScore: 0,
  bestScore: Number(localStorage.getItem(STORAGE_KEY)) || 0,
  difficulty: "easy",
  running: false,
  paused: false,
  gameOver: false
};

const leftPaddle = {
  x: 24,
  y: game.height / 2 - 45,
  width: 12,
  height: 90,
  baseHeight: 90,
  speed: 8,
  growTimer: 0
};

const rightPaddle = {
  x: game.width - 36,
  y: game.height / 2 - 45,
  width: 12,
  height: 90,
  baseHeight: 90,
  speed: 4.2,
  slowTimer: 0
};

const ball = {
  x: game.width / 2,
  y: game.height / 2,
  radius: 10,
  vx: 5,
  vy: 3
};

let mouseY = null;
let animationId = null;
let particles = [];
let powerUp = null;
let lastPowerUpSpawn = 0;
const screenShake = { intensity: 0, duration: 0 };

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

function loadBestScore() {
  game.bestScore = Number(localStorage.getItem(STORAGE_KEY)) || 0;
  bestScoreEl.textContent = game.bestScore;
}

function setBestScore() {
  game.bestScore = Math.max(game.bestScore, game.leftScore, game.rightScore);
  localStorage.setItem(STORAGE_KEY, String(game.bestScore));
  bestScoreEl.textContent = game.bestScore;
}

function updateScoreboard() {
  leftScoreEl.textContent = game.leftScore;
  rightScoreEl.textContent = game.rightScore;
  setBestScore();
}

function setDifficulty(level) {
  game.difficulty = level;
  const cfg = difficultySettings[level];

  rightPaddle.speed = cfg.aiSpeed;
  ball.baseSpeed = cfg.ballSpeed;

  difficultyButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.difficulty === level);
  });
}

function resetBall(direction) {
  ball.x = game.width / 2;
  ball.y = game.height / 2;
  const speed = ball.baseSpeed || 5.2;
  ball.vx = direction * speed;
  ball.vy = (Math.random() * 5 - 2.5);
}

function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const relativeY = event.clientY - rect.top;
  mouseY = relativeY;
}

function moveLeftPaddle() {
  if (mouseY !== null) {
    const targetY = mouseY - leftPaddle.height / 2;
    leftPaddle.y += (targetY - leftPaddle.y) * 0.2;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, game.height - leftPaddle.height);
}

function moveComputerPaddle() {
  const targetY = ball.y - rightPaddle.height / 2;
  rightPaddle.y += (targetY - rightPaddle.y) * 0.08;
  rightPaddle.y = clamp(rightPaddle.y, 0, game.height - rightPaddle.height);
}

function spawnParticles(x, y, color, amount = 12) {
  for (let i = 0; i < amount; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 4.5,
      vy: (Math.random() - 0.5) * 4.5,
      life: 0.7 + Math.random() * 0.5,
      maxLife: 0.7 + Math.random() * 0.5,
      color,
      size: 2 + Math.random() * 4
    });
  }
}

function updateParticles(dt) {
  particles = particles.filter((p) => {
    p.x += p.vx * 60 * dt;
    p.y += p.vy * 60 * dt;
    p.life -= dt;
    p.vx *= 0.97;
    p.vy *= 0.97;
    return p.life > 0;
  });
}

function triggerScreenShake(intensity = 8, duration = 0.18) {
  screenShake.intensity = intensity;
  screenShake.duration = duration;
}

function updateScreenShake(dt) {
  if (screenShake.duration > 0) {
    screenShake.duration -= dt;
    if (screenShake.duration <= 0) {
      screenShake.intensity = 0;
    }
  }
}

function playSound(type) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return;

  if (!playSound.ctx) {
    playSound.ctx = new AudioCtx();
  }

  const audioCtx = playSound.ctx;
  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  const tones = {
    hit: 180,
    wall: 120,
    score: 260,
    menu: 110,
    power: 320
  };

  oscillator.type = type === "score" ? "triangle" : "square";
  oscillator.frequency.value = tones[type] || 160;
  gain.gain.value = 0.04;

  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
  oscillator.stop(audioCtx.currentTime + 0.08);
}

function startPowerUp() {
  if (powerUp || !game.running) return;

  const types = ["grow", "slow"];
  const type = types[Math.floor(Math.random() * types.length)];
  powerUp = {
    type,
    x: 200 + Math.random() * 400,
    y: 80 + Math.random() * 330,
    radius: 12,
    color: type === "grow" ? "#7dd3fc" : "#facc15"
  };
}

function updatePowerUp(dt) {
  if (!game.running) return;

  lastPowerUpSpawn += dt;
  if (lastPowerUpSpawn > 8.5 && !powerUp) {
    startPowerUp();
    lastPowerUpSpawn = 0;
  }

  if (!powerUp) return;

  const ballDist = Math.hypot(ball.x - powerUp.x, ball.y - powerUp.y);
  if (ballDist < ball.radius + powerUp.radius) {
    if (powerUp.type === "grow") {
      leftPaddle.height = 128;
      leftPaddle.growTimer = 6;
      spawnParticles(powerUp.x, powerUp.y, "#7dd3fc", 18);
      triggerScreenShake(7, 0.12);
      playSound("power");
    } else {
      rightPaddle.speed = rightPaddle.speed * 0.7;
      rightPaddle.slowTimer = 6;
      spawnParticles(powerUp.x, powerUp.y, "#facc15", 18);
      triggerScreenShake(7, 0.12);
      playSound("power");
    }

    powerUp = null;
  }
}

function updatePaddleTimers(dt) {
  if (leftPaddle.growTimer > 0) {
    leftPaddle.growTimer -= dt;
    if (leftPaddle.growTimer <= 0) {
      leftPaddle.height = leftPaddle.baseHeight;
    }
  }

  if (rightPaddle.slowTimer > 0) {
    rightPaddle.slowTimer -= dt;
    if (rightPaddle.slowTimer <= 0) {
      rightPaddle.speed = difficultySettings[game.difficulty].aiSpeed;
    }
  }
}

function paddleCollision(ballObj, paddle) {
  const withinX =
    ballObj.x + ballObj.radius > paddle.x &&
    ballObj.x - ballObj.radius < paddle.x + paddle.width;

  const withinY =
    ballObj.y + ballObj.radius > paddle.y &&
    ballObj.y - ballObj.radius < paddle.y + paddle.height;

  return withinX && withinY;
}

function updateBall(dt) {
  ball.x += ball.vx * 60 * dt;
  ball.y += ball.vy * 60 * dt;

  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
    spawnParticles(ball.x, ball.y, "#f8fafc", 10);
    triggerScreenShake(6, 0.1);
    playSound("wall");
  }

  if (ball.y + ball.radius >= game.height) {
    ball.y = game.height - ball.radius;
    ball.vy *= -1;
    spawnParticles(ball.x, ball.y, "#f8fafc", 10);
    triggerScreenShake(6, 0.1);
    playSound("wall");
  }

  if (ball.x - ball.radius <= 0) {
    game.rightScore += 1;
    updateScoreboard();
    spawnParticles(ball.x, ball.y, "#fb7185", 20);
    triggerScreenShake(7, 0.12);
    playSound("score");
    resetBall(1);

    if (game.rightScore >= WIN_SCORE) {
      finishGame("Computer Wins!");
    }
  }

  if (ball.x + ball.radius >= game.width) {
    game.leftScore += 1;
    updateScoreboard();
    spawnParticles(ball.x, ball.y, "#34d399", 20);
    triggerScreenShake(7, 0.12);
    playSound("score");
    resetBall(-1);

    if (game.leftScore >= WIN_SCORE) {
      finishGame("You Win!");
    }
  }

  if (paddleCollision(ball, leftPaddle) && ball.vx < 0) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    const hitPosition =
      (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);

    ball.vx = Math.abs(ball.vx) * 1.05;
    ball.vy = hitPosition * 6;
    spawnParticles(ball.x, ball.y, "#7dd3fc", 16);
    triggerScreenShake(7, 0.12);
    playSound("hit");
  }

  if (paddleCollision(ball, rightPaddle) && ball.vx > 0) {
    ball.x = rightPaddle.x - ball.radius;
    const hitPosition =
      (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);

    ball.vx = -Math.abs(ball.vx) * 1.05;
    ball.vy = hitPosition * 6;
    spawnParticles(ball.x, ball.y, "#facc15", 16);
    triggerScreenShake(7, 0.12);
    playSound("hit");
  }
}

function drawPaddle(paddle) {
  ctx.fillStyle = "#eaf4ff";
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = "#facc15";
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = "rgba(255,255,255,0.35)";
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 16]);
  ctx.beginPath();
  ctx.moveTo(game.width / 2, 0);
  ctx.lineTo(game.width / 2, game.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPowerUp() {
  if (!powerUp) return;

  ctx.beginPath();
  ctx.fillStyle = powerUp.color;
  ctx.arc(powerUp.x, powerUp.y, powerUp.radius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.arc(powerUp.x, powerUp.y, powerUp.radius + 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawParticles() {
  particles.forEach((particle) => {
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = Math.max(0, particle.life / particle.maxLife);
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    ctx.globalAlpha = 1;
  });
}

function render() {
  ctx.save();
  const shakeX =
    screenShake.intensity > 0 ? (Math.random() - 0.5) * screenShake.intensity : 0;
  const shakeY =
    screenShake.intensity > 0 ? (Math.random() - 0.5) * screenShake.intensity : 0;

  ctx.translate(shakeX, shakeY);

  ctx.clearRect(0, 0, game.width, game.height);

  drawCenterLine();
  drawPowerUp();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
  drawParticles();
  ctx.restore();
}

function startGame() {
  game.running = true;
  game.paused = false;
  game.gameOver = false;
  leftScoreEl.textContent = "0";
  rightScoreEl.textContent = "0";
  game.leftScore = 0;
  game.rightScore = 0;
  updateScoreboard();

  startScreen.classList.add("hidden");
  gameContainer.classList.remove("hidden");
  gameOverOverlay.classList.add("hidden");

  leftPaddle.y = game.height / 2 - leftPaddle.height / 2;
  rightPaddle.y = game.height / 2 - rightPaddle.height / 2;
  leftPaddle.height = leftPaddle.baseHeight;
  rightPaddle.speed = difficultySettings[game.difficulty].aiSpeed;
  rightPaddle.slowTimer = 0;
  leftPaddle.growTimer = 0;

  resetBall(Math.random() > 0.5 ? 1 : -1);
  lastPowerUpSpawn = 0;
  powerUp = null;
  statusText.textContent = "Running";
  pauseBtn.textContent = "Pause";
}

function returnToMenu() {
  game.running = false;
  game.paused = false;
  game.gameOver = false;

  game.leftScore = 0;
  game.rightScore = 0;
  updateScoreboard();

  startScreen.classList.remove("hidden");
  gameContainer.classList.add("hidden");
  gameOverOverlay.classList.add("hidden");

  leftPaddle.height = leftPaddle.baseHeight;
  rightPaddle.speed = difficultySettings[game.difficulty].aiSpeed;
  rightPaddle.slowTimer = 0;
  leftPaddle.growTimer = 0;

  statusText.textContent = "Menu";
  pauseBtn.textContent = "Pause";
  playSound("menu");
}

function togglePause() {
  if (!game.running || game.gameOver) return;

  game.paused = !game.paused;
  statusText.textContent = game.paused ? "Paused" : "Running";
  pauseBtn.textContent = game.paused ? "Resume" : "Pause";
}

function finishGame(winnerLabel) {
  game.running = false;
  game.paused = false;
  game.gameOver = true;
  winnerText.textContent = winnerLabel;
  gameOverOverlay.classList.remove("hidden");
  playSound("score");
}

function gameLoop(timestamp) {
  const dt = Math.min((timestamp - (game.lastTime || timestamp)) / 1000, 0.033);
  game.lastTime = timestamp;

  if (game.running && !game.paused && !game.gameOver) {
    moveLeftPaddle();
    moveComputerPaddle();
    updatePaddleTimers(dt);
    updatePowerUp(dt);
    updateBall(dt);
    updateParticles(dt);
    updateScreenShake(dt);
  }

  render();
  requestAnimationFrame(gameLoop);
}

difficultyButtons.forEach((btn) => {
  btn.addEventListener("click", () => setDifficulty(btn.dataset.difficulty));
});

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);
menuBtn.addEventListener("click", returnToMenu);
playAgainBtn.addEventListener("click", startGame);
overlayMenuBtn.addEventListener("click", returnToMenu);
canvas.addEventListener("mousemove", handleMouseMove);

window.addEventListener("keydown", (event) => {
  if (event.code === "Space") {
    event.preventDefault();
    togglePause();
  }

  if (event.key === "Escape") {
    event.preventDefault();
    returnToMenu();
  }
});

loadBestScore();
setDifficulty("easy");
updateScoreboard();
resetBall(1);
render();
requestAnimationFrame(gameLoop);
