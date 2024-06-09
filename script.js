const canvas = document.getElementById("ping-pong");
const ctx = canvas.getContext("2d");
const mainMenu = document.getElementById("main-menu");
const singlePlayerButton = document.getElementById("single-player");
const multiplayerButton = document.getElementById("multiplayer");

// Adjust canvas size to prevent pixelation
const dpi = window.devicePixelRatio;
canvas.width = 800 * dpi;
canvas.height = 600 * dpi;
canvas.style.width = "800px";
canvas.style.height = "600px";

// Game variables
const width = canvas.width;
const height = canvas.height;
const paddleHeight = 80;
const paddleWidth = 10;
let player1PaddleY = height / 2 - paddleHeight / 2;
let player2PaddleY = height / 2 - paddleHeight / 2;
const ballRadius = 10;
let ballX = width / 2;
let ballY = height / 2;
let ballDx = 2;
let ballDy = -2;
let player1Lives = 3;
let player2Lives = 3;
let winner = null;
let gameOver = false;
let ballSpeedMultiplier = 1.05;
const CPUSpeed = 3;
let multiplayerMode = false;

let player1UpPressed = false;
let player1DownPressed = false;
let player2UpPressed = false;
let player2DownPressed = false;

let powerUpX = 0;
let powerUpY = 0;
let powerUpRadius = 40;
let powerUpActive = false;
let powerUpImage = ""; // Store the image URL for the power-up
const powerUpImages = {};
const imageUrls = ["1up.png", "1down.png", "sw.png"];

imageUrls.forEach((url) => {
  const img = new Image();
  img.src = url;
  powerUpImages[url] = img;
});

// Show main menu
function showMainMenu() {
  canvas.style.display = "none";
  mainMenu.style.display = "flex";
}

// Start single player game
function startSinglePlayer() {
  mainMenu.style.display = "none";
  canvas.style.display = "block";
  gameOver = false;
  winner = null;
  player1Lives = 3;
  player2Lives = 3;
  ballX = width / 2;
  ballY = height / 2;
  ballDx = 2;
  ballDy = -2;
  ballSpeedMultiplier = 1.05;
  multiplayerMode = false;
  gameLoop();
}

// Start multiplayer game
function startMultiplayer() {
  mainMenu.style.display = "none";
  canvas.style.display = "block";
  gameOver = false;
  winner = null;
  player1Lives = 3;
  player2Lives = 3;
  ballX = width / 2;
  ballY = height / 2;
  ballDx = 2;
  ballDy = -2;
  ballSpeedMultiplier = 1.05;
  multiplayerMode = true;
  gameLoop();
}

// Add event listeners for buttons
singlePlayerButton.addEventListener("click", startSinglePlayer);
multiplayerButton.addEventListener("click", startMultiplayer);

// Update game state
function update() {
  // Move player 1 paddle
  if (player1UpPressed) {
    player1PaddleY -= 5;
  } else if (player1DownPressed) {
    player1PaddleY += 5;
  }
  // Move player 2 paddle
  if (multiplayerMode) {
    if (player2UpPressed) {
      player2PaddleY -= 5;
    } else if (player2DownPressed) {
      player2PaddleY += 5;
    }
  }

  // Constrain paddles within canvas
  player1PaddleY = Math.max(Math.min(player1PaddleY, height - paddleHeight), 0);
  player2PaddleY = Math.max(Math.min(player2PaddleY, height - paddleHeight), 0);

  // Move the ball
  ballX += ballDx * ballSpeedMultiplier;
  ballY += ballDy * ballSpeedMultiplier;

  // Wall collision
  if (ballY + ballRadius >= height || ballY - ballRadius <= 0) {
    ballDy *= -1;
  }

  // Paddle collision (reverse X direction)
  if (
    ballX - ballRadius <= paddleWidth &&
    ballY >= player1PaddleY &&
    ballY <= player1PaddleY + paddleHeight
  ) {
    ballDx *= -1;
    ballSpeedMultiplier *= 1.05;
  } else if (
    ballX + ballRadius >= width - paddleWidth &&
    ballY >= player2PaddleY &&
    ballY <= player2PaddleY + paddleHeight
  ) {
    ballDx *= -1;
    ballSpeedMultiplier *= 1.05;
  }

  // Ball goes out (game over for player who missed)
  if (ballX + ballRadius <= 0) {
    player1Lives--;
    if (player1Lives === 0) {
      winner = 2;
      endGame();
    } else {
      resetBall();
    }
  } else if (ballX - ballRadius >= width) {
    player2Lives--;
    if (player2Lives === 0) {
      winner = 1;
      endGame();
    } else {
      resetBall();
    }
  }

  // Move CPU paddle (simple AI with delay)
  if (!multiplayerMode && ballDx > 0) {
    if (player2PaddleY + paddleHeight / 2 > ballY + ballRadius) {
      player2PaddleY -= CPUSpeed;
    } else {
      player2PaddleY += CPUSpeed;
    }
  }

  player2PaddleY = Math.max(Math.min(player2PaddleY, height - paddleHeight), 0);

  // Generate power-up every 15 seconds if not already active
  if (!powerUpActive && Math.random() < 1 / (60 * 15)) {
    powerUpX = Math.random() * (width - 2 * powerUpRadius) + powerUpRadius;
    powerUpY = Math.random() * (height - 2 * powerUpRadius) + powerUpRadius;
    powerUpActive = true;

    // Randomly select power-up color
    const random = Math.random();
    if (random < 0.35) {
      powerUpImage = powerUpImages["1up.png"];
    } else if (random < 0.7) {
      powerUpImage = powerUpImages["1down.png"];
    } else {
      powerUpImage = powerUpImages["sw.png"];
    }
  }

  // Check for collision with power-up
  if (
    powerUpActive &&
    Math.abs(ballX - powerUpX) <= ballRadius + powerUpRadius &&
    Math.abs(ballY - powerUpY) <= ballRadius + powerUpRadius
  ) {
    if (powerUpImage.src.includes("1up.png")) {
      if (ballDx > 0) {
        player1Lives++;
      } else {
        player2Lives++;
      }
    } else if (powerUpImage.src.includes("1down.png")) {
      if (ballDx > 0) {
        player2Lives--;
      } else {
        player1Lives--;
      }
    } else if (powerUpImage.src.includes("sw.png")) {
      if (ballDx > 0) {
        if (player1Lives < player2Lives) {
          const temp = player1Lives;
          player1Lives = player2Lives;
          player2Lives = temp;
        } else {
          player1Lives++;
          player2Lives--;
        }
      } else {
        if (player2Lives < player1Lives) {
          const temp = player2Lives;
          player2Lives = player1Lives;
          player1Lives = temp;
        } else {
          player2Lives++;
          player1Lives--;
        }
      }
    }

    // Check for game over immediately after power-up effects
    if (player1Lives <= 0) {
      winner = 2;
      endGame();
    } else if (player2Lives <= 0) {
      winner = 1;
      endGame();
    }

    powerUpActive = false;
  }
}

// Reset ball position and speed

function resetBall() {
  ballX = width / 2;
  ballY = height / 2;
  ballDx = -ballDx * (Math.random() < 0.5 ? -1 : 1); // Reverse ball direction after a score
  ballSpeedMultiplier = 1.05; // Reset ball speed multiplier
}

// End game
function endGame() {
  gameOver = true;
  canvas.addEventListener("click", showMainMenu);
}

// Restart game
function showMainMenu() {
  player1Lives = 3;
  player2Lives = 3;
  winner = null;
  gameOver = false;
  resetBall();
  canvas.removeEventListener("click", showMainMenu);
  canvas.style.display = "none";
  mainMenu.style.display = "flex";

  // Reset canvas dimensions
  const dpi = window.devicePixelRatio;
  canvas.width = 800 * dpi;
  canvas.height = 600 * dpi;
  canvas.style.width = "800px";
  canvas.style.height = "600px";
  width = canvas.width;
  height = canvas.height;
}

// Draw the game
function draw() {
  ctx.clearRect(0, 0, width, height);

  // Draw the ball
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  // Draw the paddles
  ctx.fillRect(0, player1PaddleY, paddleWidth, paddleHeight);
  ctx.fillRect(width - paddleWidth, player2PaddleY, paddleWidth, paddleHeight);

  // Draw the lives
  ctx.font = "16px Arial";
  ctx.fillStyle = "white";
  ctx.fillText(`Player 1 Lives: ${player1Lives}`, 20, 20);
  ctx.fillText(`Player 2 Lives: ${player2Lives}`, width - 160, 20);

  // Draw power-up if active
  // Draw power-up if active
  if (powerUpActive && powerUpImage) {
    ctx.drawImage(
      powerUpImage,
      powerUpX - powerUpRadius,
      powerUpY - powerUpRadius,
      powerUpRadius * 2,
      powerUpRadius * 2
    );
  }
}

// Main game loop
function gameLoop() {
  if (!gameOver) {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  } else {
    ctx.clearRect(0, 0, width, height);
    ctx.font = "30px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(`Player ${winner} Wins!`, width / 2, height / 2);
    ctx.fillText("Click to return to main menu", width / 2, height / 2 + 40);
  }
}

// Add event listeners for paddle movement
window.addEventListener("keydown", (e) => {
  if (e.key === "w") {
    player1UpPressed = true;
  } else if (e.key === "s") {
    player1DownPressed = true;
  }
  if (multiplayerMode) {
    if (e.key === "ArrowUp") {
      player2UpPressed = true;
    } else if (e.key === "ArrowDown") {
      player2DownPressed = true;
    }
  }
});

window.addEventListener("keyup", (e) => {
  if (e.key === "w") {
    player1UpPressed = false;
  } else if (e.key === "s") {
    player1DownPressed = false;
  }
  if (multiplayerMode) {
    if (e.key === "ArrowUp") {
      player2UpPressed = false;
    } else if (e.key === "ArrowDown") {
      player2DownPressed = false;
    }
  }
});

window.addEventListener("mousemove", (e) => {
  if (!multiplayerMode) {
    const canvasPosition = canvas.getBoundingClientRect();
    const mouseY = e.clientY - canvasPosition.top;
    player1PaddleY = Math.max(
      Math.min(mouseY - paddleHeight / 2, height - paddleHeight),
      0
    );
  }
});

// Initial display of main menu
showMainMenu();
