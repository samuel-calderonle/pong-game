const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const leftScoreEl = document.getElementById('leftScore');
const rightScoreEl = document.getElementById('rightScore');

const game = {
  width: canvas.width,
  height: canvas.height,
  leftScore: 0,
  rightScore: 0,
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
  speed: 4.8,
};

const ball = {
  x: game.width / 2,
  y: game.height / 2,
  radius: 10,
  vx: 5,
  vy: 3,
};

const keys = {};
let mouseY = null;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateScoreboard() {
  leftScoreEl.textContent = game.leftScore;
  rightScoreEl.textContent = game.rightScore;
}

function resetBall(direction) {
  ball.x = game.width / 2;
  ball.y = game.height / 2;
  const baseSpeed = 5 + Math.random() * 1.4;
  ball.vx = direction * baseSpeed;
  ball.vy = (Math.random() * 5 - 2.5);
}

function handleMouseMove(event) {
  const rect = canvas.getBoundingClientRect();
  const relativeY = event.clientY - rect.top;
  mouseY = relativeY;
}

function handleKeyDown(event) {
  keys[event.key] = true;
}

function handleKeyUp(event) {
  keys[event.key] = false;
}

function moveLeftPaddle() {
  if (keys.ArrowUp) {
    leftPaddle.y -= leftPaddle.speed;
  }

  if (keys.ArrowDown) {
    leftPaddle.y += leftPaddle.speed;
  }

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

function updateBall() {
  ball.x += ball.vx;
  ball.y += ball.vy;

  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  }

  if (ball.y + ball.radius >= game.height) {
    ball.y = game.height - ball.radius;
    ball.vy *= -1;
  }

  if (ball.x - ball.radius <= 0) {
    game.rightScore += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (ball.x + ball.radius >= game.width) {
    game.leftScore += 1;
    updateScoreboard();
    resetBall(-1);
  }

  if (paddleCollision(ball, leftPaddle) && ball.vx < 0) {
    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    const hitPosition =
      (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    ball.vx = Math.abs(ball.vx) * 1.05;
    ball.vy = hitPosition * 6;
  }

  if (paddleCollision(ball, rightPaddle) && ball.vx > 0) {
    ball.x = rightPaddle.x - ball.radius;
    const hitPosition =
      (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    ball.vx = -Math.abs(ball.vx) * 1.05;
    ball.vy = hitPosition * 6;
  }
}

function drawPaddle(paddle) {
  ctx.fillStyle = '#f9fafb';
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = '#fbbf24';
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawCenterLine() {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
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

function gameLoop() {
  moveLeftPaddle();
  moveComputerPaddle();
  updateBall();
  render();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', handleKeyDown);
window.addEventListener('keyup', handleKeyUp);
canvas.addEventListener('mousemove', handleMouseMove);

updateScoreboard();
resetBall(1);
requestAnimationFrame(gameLoop);
