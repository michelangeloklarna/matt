const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const heroImg = document.getElementById('heroImage');
const jumpSound = document.getElementById('jumpSound');
const scoreSound = document.getElementById('scoreSound');
const gameOverSound = document.getElementById('gameOverSound');

const bird = {
    x: 100,
    y: 300,
    width: 57,  // Increased from 50 to 57 (15% increase)
    height: 57, // Increased from 50 to 57 (15% increase)
    velocity: 0,
    gravity: 0.2,  // Reduced gravity
    jump: -5  // Reduced jump force
};

const pipes = [];
const pipeWidth = 80;
const pipeGap = 250;  // Increased gap between pipes
const pipeSpeed = 1.5;  // Reduced pipe speed

const pipeNames = [
    'Disputes', 'Jira', 'Gembas', 'Templates', 'Buy rates', 'Sell rates',
    'Pre-reads', 'Escalations', 'London', 'Amsterdam', 'Stockholm'
];
let unusedPipeNames = [...pipeNames];

let score = 0;
let gameOver = false;
let gameStarted = false;
let frameCount = 0;

function drawBird() {
    ctx.drawImage(heroImg, bird.x, bird.y, bird.width, bird.height);
}

function drawPipes() {
    ctx.fillStyle = '#FF4500';
    pipes.forEach(pipe => {
        // Draw top pipe
        ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
        // Draw bottom pipe
        ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height - pipe.bottom);

        // Function to draw text with adjusted size
        function drawAdjustedText(text, centerX, centerY, maxWidth, maxHeight) {
            ctx.font = 'bold 20px Arial';
            let fontSize = 20;
            let textWidth = ctx.measureText(text).width;
            let textHeight = fontSize;

            // Adjust font size if text is too wide or tall
            while ((textWidth > maxWidth || textHeight > maxHeight) && fontSize > 10) {
                fontSize--;
                ctx.font = `bold ${fontSize}px Arial`;
                textWidth = ctx.measureText(text).width;
                textHeight = fontSize;
            }

            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(centerX - textWidth / 2 - 5, centerY - textHeight / 2 - 5, textWidth + 10, textHeight + 10);
            ctx.fillStyle = '#FFD700';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, centerX, centerY);
        }

        // Draw name on top pipe
        ctx.save();
        ctx.translate(pipe.x + pipeWidth / 2, pipe.top / 2);
        ctx.rotate(-Math.PI / 2);
        drawAdjustedText(pipe.name, 0, 0, pipe.top, pipeWidth);
        ctx.restore();

        // Draw name on bottom pipe
        ctx.save();
        ctx.translate(pipe.x + pipeWidth / 2, (pipe.bottom + canvas.height) / 2);
        ctx.rotate(-Math.PI / 2);
        drawAdjustedText(pipe.name, 0, 0, canvas.height - pipe.bottom, pipeWidth);
        ctx.restore();
    });
}

function updatePipes() {
    if (frameCount > 10 && (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 250)) {
        if (unusedPipeNames.length === 0) {
            unusedPipeNames = [...pipeNames];
        }
        const pipeNameIndex = Math.floor(Math.random() * unusedPipeNames.length);
        const pipeName = unusedPipeNames.splice(pipeNameIndex, 1)[0];
        
        const minPipeHeight = 50;
        const maxPipeHeight = canvas.height - pipeGap - 50;
        const topPipeHeight = Math.random() * (maxPipeHeight - minPipeHeight) + minPipeHeight;
        
        pipes.push({
            x: canvas.width,
            top: topPipeHeight,
            bottom: topPipeHeight + pipeGap,
            name: pipeName
        });
    }

    pipes.forEach(pipe => {
        pipe.x -= pipeSpeed;
    });

    if (pipes[0] && pipes[0].x < -pipeWidth) {
        pipes.shift();
        score++;
        scoreSound.play();
    }
}

function checkCollision() {
    const collision = pipes.some(pipe => 
        (bird.x + bird.width * 0.7 > pipe.x &&  // Reduced collision box
         bird.x + bird.width * 0.3 < pipe.x + pipeWidth) &&
        (bird.y + bird.height * 0.3 < pipe.top || 
         bird.y + bird.height * 0.7 > pipe.bottom)
    ) || bird.y + bird.height > canvas.height;

    if (collision && !gameOver) {
        gameOverSound.play();  // Play game over sound
    }

    return collision;
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameStarted && !gameOver) {
        frameCount++;
        bird.velocity += bird.gravity;
        bird.y += bird.velocity;

        updatePipes();
        
        if (checkCollision()) {
            gameOver = true;
        }
    }

    drawPipes();
    drawBird();

    ctx.fillStyle = '#FFD700';
    ctx.font = '24px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);

    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = '36px Arial';
        ctx.fillText('Flappy Matt', canvas.width / 2 - 90, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE or Click to start', canvas.width / 2 - 150, canvas.height / 2 + 50);
    } else if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#FFD700';
        ctx.font = '48px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        ctx.font = '24px Arial';
        ctx.fillText(`Score: ${score}`, canvas.width / 2 - 50, canvas.height / 2 + 50);
        ctx.fillText('Press SPACE or Click to restart', canvas.width / 2 - 150, canvas.height / 2 + 100);
    }

    requestAnimationFrame(gameLoop);
}

function jump() {
    if (!gameStarted) {
        gameStarted = true;
        createSnowflakes();
    }
    if (!gameOver) {
        bird.velocity = bird.jump;
        jumpSound.play();  // Play jump sound
    }
}

function restart() {
    bird.y = canvas.height / 2;  // Start bird in the middle of the screen
    bird.velocity = 0;
    pipes.length = 0;
    score = 0;
    gameOver = false;
    gameStarted = false;
    frameCount = 0;
}

document.addEventListener('keydown', event => {
    if (event.code === 'Space') {
        if (gameOver) {
            restart();
        } else {
            jump();
        }
    }
});

canvas.addEventListener('click', () => {
    if (gameOver) {
        restart();
    } else {
        jump();
    }
});

function createSnowflakes() {
    const snowflakesCount = 50;
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < snowflakesCount; i++) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.textContent = '❄';
        snowflake.style.left = Math.random() * window.innerWidth + 'px';
        snowflake.style.animationDelay = Math.random() * 10 + 's';
        fragment.appendChild(snowflake);
    }
    document.body.appendChild(fragment);
}

gameLoop();