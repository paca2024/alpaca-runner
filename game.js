const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Load images
const alpacaImg = new Image();
alpacaImg.src = 'https://na-703498136.imgix.net/alpacanobg%20(1).png';
let alpacaLoaded = false;
alpacaImg.onload = () => {
    console.log('Alpaca image loaded');
    alpacaLoaded = true;
};
alpacaImg.onerror = (e) => {
    console.error('Error loading alpaca image:', e);
};

const carrotImg = new Image();
carrotImg.src = 'https://na-703498136.imgix.net/carrots.png';
let carrotLoaded = false;
carrotImg.onload = () => {
    console.log('Carrot image loaded');
    carrotLoaded = true;
};
carrotImg.onerror = (e) => {
    console.error('Error loading carrot image:', e);
};

const fenceImgs = [
    'https://na-703498136.imgix.net/[removal.ai]_6d93e5d4-d09b-4ad1-adb9-0e4f5172915a-keith.png',
    'https://na-703498136.imgix.net/[removal.ai]_d21b5b13-7fd5-47f6-875a-615e7f38974a_Lee.png',
    'https://na-703498136.imgix.net/[removal.ai]_5c74c1e5-b6a4-40f2-9a82-817179f0aa88_scott.png'
].map((src, index) => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
        console.log(`Fence image ${index + 1} loaded`);
        fenceImgsLoaded[index] = true;
    };
    img.onerror = (e) => {
        console.error(`Error loading fence image ${index + 1}:`, e);
    };
    return img;
});

let fenceImgsLoaded = fenceImgs.map(() => false);

const grassImg = new Image();
grassImg.src = 'https://na-703498136.imgix.net/grass%20field.png';
let grassLoaded = false;
grassImg.onload = () => {
    console.log('Grass image loaded');
    grassLoaded = true;
};
grassImg.onerror = (e) => {
    console.error('Error loading grass image:', e);
};

// Set canvas size for landscape
canvas.width = 1000;
canvas.height = 400;

// Game settings
let gameSpeed = 3;
let speedIncrement = 0.0003;

// Alpaca properties
const alpaca = {
    x: 100,
    y: canvas.height/2,
    width: 80,
    height: 80,
    speed: 8  // Adjusted for smoother movement
};

// Game objects
const carrots = [];
const fences = [];
const FENCE_WIDTH = 60;
const FENCE_HEIGHT = 90;
const CARROT_SIZE = 30;

// Movement state
const keys = {
    ArrowUp: false,
    ArrowDown: false
};

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (isGameOver) return;
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        keys[e.code] = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        keys[e.code] = false;
    }
});

// Touch controls
function handleTouch(event, direction) {
    event.preventDefault();
    if (direction === 'up') {
        keys.ArrowUp = true;
        keys.ArrowDown = false;
    } else if (direction === 'down') {
        keys.ArrowDown = true;
        keys.ArrowUp = false;
    } else if (direction === 'stop') {
        keys.ArrowUp = false;
        keys.ArrowDown = false;
    }
}

// Make handleTouch available globally
window.handleTouch = handleTouch;

// Prevent default touch behavior
document.addEventListener('touchstart', function(e) {
    if (e.target.closest('.control-button')) {
        e.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

// Game state
let isGameOver = false;
let carrotsCollected = 0;
let backgroundOffset = 0;

// Clear any existing high scores and start fresh
localStorage.removeItem('alpacaHighScores');
let highScores = [];

// Draw background
function drawBackground() {
    if (grassLoaded) {
        // Create a repeating pattern by drawing the grass image multiple times
        const patternWidth = canvas.width;
        const patternHeight = canvas.height;
        
        // Draw two images side by side and scroll them
        ctx.drawImage(grassImg, backgroundOffset, 0, patternWidth, patternHeight);
        ctx.drawImage(grassImg, backgroundOffset + patternWidth, 0, patternWidth, patternHeight);
        
        // Update the scroll position
        backgroundOffset -= gameSpeed;
        if (backgroundOffset <= -patternWidth) {
            backgroundOffset = 0;
        }
    } else {
        // Fallback to green background if image hasn't loaded
        ctx.fillStyle = '#90EE90';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Update game state
function update() {
    if (isGameOver) return;

    // Update alpaca position with smoother movement
    if (keys.ArrowUp && alpaca.y > alpaca.height/2) {
        alpaca.y = Math.max(alpaca.height/2, alpaca.y - alpaca.speed);
    }
    if (keys.ArrowDown && alpaca.y < canvas.height - alpaca.height/2) {
        alpaca.y = Math.min(canvas.height - alpaca.height/2, alpaca.y + alpaca.speed);
    }

    // Update game speed
    gameSpeed += speedIncrement * 0.8;

    // Update carrots
    carrots.forEach((carrot, index) => {
        carrot.x -= gameSpeed;
        if (carrot.x + carrot.width < 0) {
            carrots.splice(index, 1);
        }
    });

    // Update fences
    fences.forEach((fence, index) => {
        fence.x -= gameSpeed;
        if (fence.x + fence.width < 0) {
            fences.splice(index, 1);
        }
    });

    // Spawn new objects
    spawnObjects();

    // Check collisions
    checkCollisions();
}

// Spawn objects
function spawnObjects() {
    if (!isGameOver && Math.random() < 0.02) {
        if (Math.random() < 0.6) { // 60% chance for carrot
            carrots.push({
                x: canvas.width,
                y: CARROT_SIZE + Math.random() * (canvas.height - CARROT_SIZE * 2),
                width: CARROT_SIZE,
                height: CARROT_SIZE
            });
        } else { // 40% chance for fence
            fences.push({
                x: canvas.width,
                y: FENCE_HEIGHT + Math.random() * (canvas.height - FENCE_HEIGHT * 2),
                width: FENCE_WIDTH,
                height: FENCE_HEIGHT,
                fenceType: Math.floor(Math.random() * 3) + 1
            });
        }
    }
}

function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw scrolling background
    drawBackground();
    
    // Draw game elements
    carrots.forEach(carrot => {
        drawObject(carrot, 'carrot');
    });

    fences.forEach(fence => {
        drawFence(fence);
    });

    drawAlpaca();

    // Draw score
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Carrots: ${carrotsCollected}`, 10, 30);

    if (isGameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over!', canvas.width/2 - 100, canvas.height/2);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${carrotsCollected} carrots`, canvas.width/2 - 100, canvas.height/2 + 40);
    }
}

// Draw game objects
function drawObject(obj, type) {
    if (type === 'carrot') {
        if (carrotLoaded) {
            ctx.drawImage(carrotImg, obj.x, obj.y, obj.width, obj.height);
        } else {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        }
    }
}

function drawFence(fence) {
    let fenceImg, isLoaded;
    
    switch(fence.fenceType) {
        case 1:
            fenceImg = fenceImgs[0];
            isLoaded = fenceImgsLoaded[0];
            break;
        case 2:
            fenceImg = fenceImgs[1];
            isLoaded = fenceImgsLoaded[1];
            break;
        case 3:
            fenceImg = fenceImgs[2];
            isLoaded = fenceImgsLoaded[2];
            break;
    }
    
    if (isLoaded) {
        ctx.drawImage(fenceImg, fence.x, fence.y - fence.height/2, fence.width, fence.height);
    } else {
        ctx.fillStyle = 'brown';
        ctx.fillRect(fence.x, fence.y - fence.height/2, fence.width, fence.height);
    }
}

// Draw alpaca
function drawAlpaca() {
    if (alpacaLoaded) {
        ctx.drawImage(alpacaImg, alpaca.x, alpaca.y - alpaca.height/2, alpaca.width, alpaca.height);
    } else {
        ctx.fillStyle = 'white';
        ctx.fillRect(alpaca.x, alpaca.y - alpaca.height/2, alpaca.width, alpaca.height);
    }
}

// Check collisions
function checkCollisions() {
    // Check collisions with carrots
    carrots.forEach((carrot, index) => {
        if (isColliding(alpaca, carrot)) {
            carrots.splice(index, 1);
            carrotsCollected++;
        }
    });

    // Check collisions with fences
    fences.forEach(fence => {
        if (isColliding(alpaca, fence)) {
            gameOver();
        }
    });
}

// Collision detection helper
function isColliding(obj1, obj2) {
    return obj1.x < obj2.x + obj2.width &&
           obj1.x + obj1.width > obj2.x &&
           obj1.y < obj2.y + obj2.height &&
           obj1.y + obj1.height > obj2.y;
}

// Game over
function gameOver() {
    isGameOver = true;
    
    // Update high scores
    const score = carrotsCollected;
    highScores.push(score);
    highScores.sort((a, b) => b - a);  // Sort in descending order
    highScores = highScores.slice(0, 5);  // Keep only top 5 scores
    localStorage.setItem('alpacaHighScores', JSON.stringify(highScores));
    
    document.getElementById('gameOver').style.display = 'flex';
    document.getElementById('finalScore').textContent = score;
    document.getElementById('highScores').innerHTML = getHighScoresHTML();
}

function getHighScoresHTML() {
    if (highScores.length === 0) return '';
    
    return `
        <h3>High Scores:</h3>
        <ol>
            ${highScores.map(score => `<li>${score} carrots</li>`).join('')}
        </ol>
    `;
}

// Restart game
function resetGame() {
    isGameOver = false;
    gameSpeed = 3;
    carrotsCollected = 0;
    alpaca.y = canvas.height/2;
    backgroundOffset = 0;
    carrots.length = 0;
    fences.length = 0;
    document.getElementById('gameOver').style.display = 'none';
}
window.resetGame = resetGame;

// Resize canvas for mobile
function resizeCanvas() {
    const container = document.getElementById('gameContainer');
    const containerWidth = container.clientWidth;
    const aspectRatio = canvas.height / canvas.width;
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = (containerWidth * aspectRatio) + 'px';
}

// Listen for window resize
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Initialize game
gameLoop();
