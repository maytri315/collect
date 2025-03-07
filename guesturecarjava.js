const car = document.getElementById('car');
const video = document.getElementById('video');
const carContainer = document.getElementById('car-container');
const point = document.getElementById('point');
const obstacle = document.getElementById('obstacle');
const scoreDisplay = document.getElementById('score');
const startGameButton = document.getElementById('start-game');

let score = 0;
let isGameOver = false;
let model;
let isGameRunning = false;

// Load the Handtrack.js model
const modelParams = { flipHorizontal: true, maxNumBoxes: 1, iouThreshold: 0.5, scoreThreshold: 0.6 };
handTrack.load(modelParams).then((loadedModel) => {
    model = loadedModel;
    console.log('Handtrack.js Model Loaded!');
});

// Start the game when the Start button is clicked
startGameButton.addEventListener('click', () => {
    isGameRunning = true;
    startGameButton.style.display = 'none'; // Hide the Start button
    handTrack.startVideo(video).then((status) => {
        if (status) {
            console.log('Camera started');
            runDetection(); // Begin gesture detection
            moveElements(); // Start moving points and obstacles
        } else {
            alert('Please enable camera access!');
        }
    });
});

// Detect gestures and move the car
function runDetection() {
    if (!isGameRunning || isGameOver) return;

    model.detect(video).then((predictions) => {
        if (predictions.length > 0) {
            const hand = predictions[0].bbox; // [x, y, width, height]
            moveCar(hand);
        }
        if (!isGameOver) requestAnimationFrame(runDetection);
    });
}

// Move the car using hand gestures
function moveCar(hand) {
    const [handX] = hand; // Use the x-coordinate of the hand's bounding box
    const containerWidth = carContainer.offsetWidth; // Container width
    const carWidth = car.offsetWidth;

    // Map hand position (camera width to container width)
    let newLeft = (handX / video.offsetWidth) * containerWidth;

    // Constrain the car within the boundaries
    if (newLeft < 0) newLeft = 0;
    if (newLeft + carWidth > containerWidth) newLeft = containerWidth - carWidth;

    // Apply the new position to the car
    car.style.left = `${newLeft}px`;
}

// Move the points and obstacles
function moveElements() {
    if (!isGameRunning || isGameOver) return;

    // Move point
    let pointY = point.offsetTop;
    if (pointY > carContainer.offsetHeight) {
        point.style.top = '-50px';
        point.style.left = `${Math.random() * (carContainer.offsetWidth - 30)}px`;
    } else {
        point.style.top = `${pointY + 5}px`;
    }

    // Move obstacle
    let obstacleY = obstacle.offsetTop;
    if (obstacleY > carContainer.offsetHeight) {
        obstacle.style.top = '-50px';
        obstacle.style.left = `${Math.random() * (carContainer.offsetWidth - 30)}px`;
    } else {
        obstacle.style.top = `${obstacleY + 7}px`;
    }

    checkCollisions();
    requestAnimationFrame(moveElements);
}

// Check for collisions with points or obstacles
function checkCollisions() {
    const carRect = car.getBoundingClientRect();
    const pointRect = point.getBoundingClientRect();
    const obstacleRect = obstacle.getBoundingClientRect();

    // Point collection
    if (
        carRect.top < pointRect.bottom &&
        carRect.bottom > pointRect.top &&
        carRect.left < pointRect.right &&
        carRect.right > pointRect.left
    ) {
        score++;
        scoreDisplay.textContent = score;
        point.style.top = '-50px'; // Reset point position
        point.style.left = `${Math.random() * (carContainer.offsetWidth - 30)}px`;
    }

    // Obstacle collision
    if (
        carRect.top < obstacleRect.bottom &&
        carRect.bottom > obstacleRect.top &&
        carRect.left < obstacleRect.right &&
        carRect.right > obstacleRect.left
    ) {
        endGame();
    }
}

// End the game and display the final score
function endGame() {
    isGameOver = true;
    alert(`Game Over! Final Score: ${score}`);

    // Blur the background
    carContainer.style.filter = 'blur(5px)';

    // Show final score box
    const scoreBox = document.createElement('div');
    scoreBox.style.position = 'absolute';
    scoreBox.style.top = '50%';
    scoreBox.style.left = '50%';
    scoreBox.style.transform = 'translate(-50%, -50%)';
    scoreBox.style.backgroundColor = 'white';
    scoreBox.style.padding = '20px';
    scoreBox.style.border = '2px solid black';
    scoreBox.innerHTML = `<h2>Final Score: ${score}</h2>`;
    carContainer.appendChild(scoreBox);
}
