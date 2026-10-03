const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');
const bestScoreEl = document.getElementById('bestScore');
const statusText = document.getElementById('statusText');
const startScreen = document.getElementById('startScreen');
const gameContainer = document.getElementById('gameContainer');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const menuBtn = document.getElementById('menuBtn');
const difficultyButtons = [...document.querySelectorAll('.difficulty-btn')];

const STORAGE_KEY = 'pong-best-score';

const game = {
  width: canvas.width,
  height: canvas.height,
  leftScore: 0,
  rightScore: 0,
  bestScore: Number(localStorage.getItem(STORAGE_KEY)) || 0,
  paused: false,
  difficulty: 'easy',
  running: false,
};

const leftPaddle = {
  x: 24,
  y: game.height / 2 - 45,
  width: 12,
  height: 90,
  speed: 8,
};

const rightPaddle = {
  x: game.width - 36,
  y: game.height / 2 - 45,
  width: 12,
  height: 90,
  speed: 4.2,
};

const ball = {
  x: game.width / 2,
  y: game.height / 2,
  radius: 10,
  vx: 5,
  vy: 3,
};

let mouseY = null;
let animationId = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
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

function resetBall(direction) {
  ball.x = game.width / 2;
  ball.y = game.height / 2;
  const baseSpeed = 5 + Math.random() * 1.6;
  ball.vx = direction * baseSpeed;
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
    leftPaddle.y += (targetY - leftPaddle.y) * 0.18;
  }

  leftPaddle.y = clamp(leftPaddle.y, 0, game.height - leftPaddle.height);
}

function moveComputerPaddle() {
  const targetY = ball.y - rightPaddle.height / 2;
  rightPaddle.y += (targetY - rightPaddle.y) * 0.08;
  rightPaddle.y = clamp(rightPaddle.y, 0, game.height - rightPaddle.height);
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

  const frequencyMap = {
    hit: 180,
    wall: 120,
    score: 280,
    menu: 100,
  };

  oscillator.type = type === 'score' ? 'triangle' : 'square';
  oscillator.frequency.value = frequencyMap[type] || 160;
  gain.gain.value = 0.05;

  oscillator.start();
  gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.08);
  oscillator.stop(audioCtx.currentTime + 0.08);
}

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
    playSound('wall');
  }

  if (ball.y + ball.radius >= game.height) {
    ball.y = game.height - ball.radius;
    ball.vy *= -1;
    playSound('wall');
  }

  if (ball.x - ball.radius <= 0) {
    game.rightScore += 1;
    updateScoreboard();
    playSound('score');
    resetBall(1);
  }

  if (ball.x + ball.radius >= game.width) {
    game.leftScore += 1;
    updateScoreboard();
    playSound('score');
    resetBall(-1);
  }

  if (paddleCollision(ball, leftPaddle) && ball.vx < 0) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    const hitPosition =
      (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    ball.vx = Math.abs(ball.vx) * 1.05;
    ball.vy = hitPosition * 6;
    playSound('hit');
  }

  if (paddleCollision(ball, rightPaddle) && ball.vx > 0) {
    ball.x = rightPaddle.x - ball.radius;
    const hitPosition =
      (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    ball.vx = -Math.abs(ball.vx) * 1.05;
    ball.vy = hitPosition * 6;
    playSound('hit');
  }
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#facc15';
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 4;
  ctx.setLineDash([12, 16]);
  ctx.beginPath();
  ctx.moveTo(game.width / 2, 0);
  ctx.lineTo(game.width / 2, game.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function render() {
  ctx.clearRect(0, 0, game.width, game.height);
  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
}

function setDifficulty(level) {
  game.difficulty = level;

  if (level === 'easy') {
    rightPaddle.speed = 3.5;
  } else if (level === 'medium') {
    rightPaddle.speed = 4.8;
  } else if (level === 'hard') {
    rightPaddle.speed = 6.2;
  }

  difficultyButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.difficulty === level);
  });
}

function updateStatus(text) {
  statusText.textContent = text;
}

function startGame() {
  game.running = true;
  game.paused = false;
  updateStatus('Running');
  pauseBtn.textContent = 'Pause';
  startScreen.classList.add('hidden');
  gameContainer.classList.remove('hidden');
  resetBall(Math.random() > 0.5 ? 1 : -1);
}

function returnToMenu() {
  game.running = false;
  game.paused = false;
  game.leftScore = 0;
  game.rightScore = 0;
  updateScoreboard();
  updateStatus('Menu');
  gameContainer.classList.add('hidden');
  startScreen.classList.remove('hidden');
  pauseBtn.textContent = 'Pause';
  resetBall(1);
  playSound('menu');
}

function togglePause() {
  if (!game.running) return;

  game.paused = !game.paused;
  updateStatus(game.paused ? 'Paused' : 'Running');
  pauseBtn.textContent = game.paused ? 'Resume' : 'Pause';
}

function gameLoop() {
  if (!game.running || game.paused) {
    render();
    animationId = requestAnimationFrame(gameLoop);
    return;
  }

  moveLeftPaddle();
  moveComputerPaddle();
  updateBall();
  render();

  animationId = requestAnimationFrame(gameLoop);
}

difficultyButtons.forEach((btn) => {
  btn.addEventListener('click', () => setDifficulty(btn.dataset.difficulty));
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
menuBtn.addEventListener('click', returnToMenu);
canvas.addEventListener('mousemove', handleMouseMove);

window.addEventListener('keydown', (event) => {
  if (event.code === 'Space') {
    event.preventDefault();
    togglePause();
  }

  if (event.key === 'Escape') {
    returnToMenu();
  }
});

bestScoreEl.textContent = game.bestScore;
setDifficulty('easy');
updateScoreboard();
resetBall(1);
render();

animationId = requestAnimationFrame(gameLoop);
