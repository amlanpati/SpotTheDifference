let config, score = 0, interval;
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const messageDisplay = document.getElementById('message');

// Load game configuration dynamically
async function loadGameConfig() {
  const gameId = localStorage.getItem('currentGame');
  if (!gameId) {
    //console.warn("No game selected. Redirecting to home...");
    window.location.href = 'index.html'; // Redirect to index.html if no game is selected
    return;
  }

  try {
    const response = await fetch(`${gameId}-config.json`);
    if (!response.ok) throw new Error(`Failed to load configuration for ${gameId}`);
    config = await response.json();
    //console.log(`Loading configuration for: ${gameId}`);
    //console.log("Game configuration loaded:", config);
    setupGame();
  } catch (error) {
    //console.error("Error loading game configuration:", error);
    alert("Could not load game configuration. Please try again.");
    window.location.href = 'index.html'; // Redirect to index.html on error
  }
}

// Set up the game
function setupGame() {
  //console.log("Setting up the game...");

  // Update game title
  document.getElementById('game-title').innerText = config.gameTitle;

  // Load images dynamically
  document.getElementById('image1').src = config.images.image1;
  document.getElementById('image2').src = config.images.image2;

  // Setup canvases for differences
  const canvas1 = document.getElementById('canvas1');
  const canvas2 = document.getElementById('canvas2');
  setupCanvas(canvas1, config.differences, "Canvas 1");
  setupCanvas(canvas2, config.differences, "Canvas 2");

  // Start the game timer
  startTimer();

  // Reset score and message
  score = 0;
  scoreDisplay.innerText = score;
  messageDisplay.innerText = '';
}

// Highlight differences on click
function setupCanvas(canvas, differences, canvasName) {
  //console.log(`Setting up ${canvasName}...`);
  //console.log("Differences passed to setupCanvas:", differences);
  const ctx = canvas.getContext('2d');
  const image = canvas.previousElementSibling;

  // Set up canvas resizing
  const resizeCanvas = () => {
    canvas.width = image.clientWidth;
    canvas.height = image.clientHeight;

    // Adjust drawing scale to match the canvas resolution
    ctx.scale(canvas.width / 650, canvas.height / 500); // Match original image dimensions

    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  };

  // Call resizeCanvas initially and on window resize
  //resizeCanvas();
  //window.addEventListener('resize', resizeCanvas);

  canvas.addEventListener('click', (event) => {
    //console.log(`${canvasName} clicked.`);
    //console.log(`Canvas clicked at: ${event.clientX}, ${event.clientY}`);
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    //console.log(`Click coordinates: x=${x}, y=${y}`);

    // Calculate scale factors
    const scaleX = image.clientWidth / 650; // Original image width
    const scaleY = image.clientHeight / 500; // Original image height
    //console.log(image.clientWidth);
    //console.log(image.clientWidth);
    //console.log(scaleX);
    //console.log(scaleY);

    // Scale the click coordinates
    const scaledX = x / scaleX;
    const scaledY = y / scaleY;

    //console.log(`Scaled click coordinates: x=${scaledX}, y=${scaledY}`);

    // Check if the scaled click is within any difference
    const hit = differences.find(diff =>
      scaledX >= diff.x &&
      scaledX <= diff.x + diff.width &&
      scaledY >= diff.y &&
      scaledY <= diff.y + diff.height
    );

    if (hit) {
      console.log("Hit detected:", hit);
      //console.log('Drawing rectangle at:', hit.x * scaleX, hit.y * scaleY, hit.width * scaleX, hit.height * scaleY);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2;

      // Draw the rectangle with scaling applied
      ctx.strokeRect(
        hit.x,
        hit.y,
        hit.width,
        hit.height
      );

      score++;
      scoreDisplay.innerText = score;
      //console.log(`Score updated: ${score}`);

      // Remove the found difference
      differences.splice(differences.indexOf(hit), 1);

      // Check if the game is completed
      if (differences.length === 0) endGame();
    }
  });
}


// Start the game timer
function startTimer() {
  let seconds = 0;
  interval = setInterval(() => {
    seconds++;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    timerDisplay.innerText = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, 1000);
}

// End the game
function endGame() {
  clearInterval(interval);
  messageDisplay.innerText = "Congratulations! You found all the differences!";
  //console.log("Game ended. All differences found!");
}

// Load game configuration when the page is loaded
window.onload = loadGameConfig;