const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerScoreElement = document.getElementById('player-score');
const computerScoreElement = document.getElementById('computer-score');

const state = {
  width: canvas.width,
  height: canvas.height,
  paddleWidth: 14,
  paddleHeight: 110,
  paddleOffset: 24,
  paddleSpeed: 7,
  ballSize: 12,
  playerY: (canvas.height - 110) / 2,
  computerY: (canvas.height - 110) / 2,
  ballX: canvas.width / 2,
  ballY: canvas.height / 2,
  ballSpeed: 5,
  ballVX: 0,
  ballVY: 0,
  playerScore: 0,
  computerScore: 0,
  keys: {
    ArrowUp: false,
    ArrowDown: false,
  },
  mouseY: null,
};

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function resetBall(direction) {
  const angle = (Math.random() * 1.4 - 0.7);
  state.ballX = state.width / 2;
  state.ballY = state.height / 2;
  state.ballVX = direction * (state.ballSpeed + Math.random() * 1.2);
  state.ballVY = angle * state.ballSpeed * 1.2;
}

function updateScoreboard() {
  playerScoreElement.textContent = state.playerScore;
  computerScoreElement.textContent = state.computerScore;
}

function handleWallCollision() {
  if (state.ballY - state.ballSize <= 0) {
    state.ballY = state.ballSize;
    state.ballVY *= -1;
  }

  if (state.ballY + state.ballSize >= state.height) {
    state.ballY = state.height - state.ballSize;
    state.ballVY *= -1;
  }
}

function handlePaddleCollision() {
  const leftPaddleX = state.paddleOffset;
  const rightPaddleX = state.width - state.paddleOffset - state.paddleWidth;

  const leftPaddle = {
    x: leftPaddleX,
    y: state.playerY,
    width: state.paddleWidth,
    height: state.paddleHeight,
  };

  const rightPaddle = {
    x: rightPaddleX,
    y: state.computerY,
    width: state.paddleWidth,
    height: state.paddleHeight,
  };

  if (
    state.ballX - state.ballSize <= leftPaddle.x + leftPaddle.width &&
    state.ballX + state.ballSize >= leftPaddle.x &&
    state.ballY + state.ballSize >= leftPaddle.y &&
    state.ballY - state.ballSize <= leftPaddle.y + leftPaddle.height &&
    state.ballVX < 0
  ) {
    const hitPosition = (state.ballY - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);
    state.ballX = leftPaddle.x + leftPaddle.width + state.ballSize;
    state.ballVX = Math.abs(state.ballVX) + 0.5;
    state.ballVY = hitPosition * state.ballSpeed * 1.7;
  }

  if (
    state.ballX + state.ballSize >= rightPaddle.x &&
    state.ballX - state.ballSize <= rightPaddle.x + rightPaddle.width &&
    state.ballY + state.ballSize >= rightPaddle.y &&
    state.ballY - state.ballSize <= rightPaddle.y + rightPaddle.height &&
    state.ballVX > 0
  ) {
    const hitPosition = (state.ballY - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);
    state.ballX = rightPaddle.x - state.ballSize;
    state.ballVX = -Math.abs(state.ballVX) - 0.5;
    state.ballVY = hitPosition * state.ballSpeed * 1.7;
  }
}

function updateComputerPaddle() {
  const paddleCenter = state.computerY + state.paddleHeight / 2;
  const targetY = state.ballY - state.paddleHeight / 2;
  const movement = (targetY - paddleCenter) * 0.1;

  state.computerY += movement;
  state.computerY = clamp(state.computerY, 0, state.height - state.paddleHeight);
}

function updatePlayerPaddle() {
  if (state.keys.ArrowUp) {
    state.playerY -= state.paddleSpeed;
  }

  if (state.keys.ArrowDown) {
    state.playerY += state.paddleSpeed;
  }

  if (!state.keys.ArrowUp && !state.keys.ArrowDown && state.mouseY !== null) {
    state.playerY = clamp(state.mouseY, 0, state.height - state.paddleHeight);
  }

  state.playerY = clamp(state.playerY, 0, state.height - state.paddleHeight);
}

function updateBall() {
  state.ballX += state.ballVX;
  state.ballY += state.ballVY;

  if (state.ballX - state.ballSize <= 0) {
    state.computerScore += 1;
    updateScoreboard();
    resetBall(1);
  }

  if (state.ballX + state.ballSize >= state.width) {
    state.playerScore += 1;
    updateScoreboard();
    resetBall(-1);
  }

  handleWallCollision();
  handlePaddleCollision();
}

function drawCenterLine() {
  ctx.beginPath();
  ctx.setLineDash([10, 12]);
  ctx.moveTo(state.width / 2, 0);
  ctx.lineTo(state.width / 2, state.height);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(x, y, width, height) {
  ctx.fillStyle = '#f4f7ff';
  ctx.fillRect(x, y, width, height);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(state.ballX, state.ballY, state.ballSize, 0, Math.PI * 2);
  ctx.fillStyle = '#ffcc66';
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, state.width, state.height);
  drawCenterLine();
  drawPaddle(state.paddleOffset, state.playerY, state.paddleWidth, state.paddleHeight);
  drawPaddle(state.width - state.paddleOffset - state.paddleWidth, state.computerY, state.paddleWidth, state.paddleHeight);
  drawBall();
}

function gameLoop() {
  updatePlayerPaddle();
  updateComputerPaddle();
  updateBall();
  draw();
  requestAnimationFrame(gameLoop);
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
    event.preventDefault();
  }

  if (event.key in state.keys) {
    state.keys[event.key] = true;
  }
});

window.addEventListener('keyup', (event) => {
  if (event.key in state.keys) {
    state.keys[event.key] = false;
  }
});

canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  const pointerY = ((event.clientY - rect.top) / rect.height) * state.height;
  state.mouseY = pointerY - state.paddleHeight / 2;

  if (!state.keys.ArrowUp && !state.keys.ArrowDown) {
    state.playerY = clamp(state.mouseY, 0, state.height - state.paddleHeight);
  }
});

updateScoreboard();
resetBall(1);
requestAnimationFrame(gameLoop);
