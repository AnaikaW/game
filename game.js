const BULLET_MAX_DISTANCE = 200; // Max distance in pixels a bullet can travel

document.addEventListener('keydown', movePlayer);
let score = 0;
let playerHealth = 2500; // Set player health to 2500
const MAX_HEALTH = 2500;
let playerSkin = '';
let regularCooldown = 0;
let powerfulCooldown = 0;
let gameInterval;
let enemyHealth = 1500; // Set enemy health to 1500
const ENEMY_MAX_HEALTH = 1500;

// Key state
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Select player skin
document.querySelectorAll('.playerOption').forEach(option => {
    option.addEventListener('click', function() {
        document.querySelectorAll('.playerOption').forEach(opt => opt.classList.remove('selected'));
        option.classList.add('selected');
        playerSkin = option.getAttribute('data-skin');
    });
});

// Start the game when play button is clicked
document.getElementById('playButton').addEventListener('click', function() {
    if (!playerSkin) {
        alert('Please select a player skin to start the game.');
        return;
    }

    document.getElementById('startScreen').style.display = 'none';
    const player = document.getElementById('player1');
    player.style.backgroundImage = `url(${playerSkin})`;
    startGame();
});

function toggleFullScreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        }
    }
}

document.getElementById('fullscreenBtn').addEventListener('click', toggleFullScreen);

window.onload = function() {
    const player = document.getElementById('player1');
    player.style.left = '50px'; // Not too close to the edge
    player.style.top = '50px'; // Not too close to the edge
    updateHealthDisplay(); // Update initial health display
    updateEnemyHealthDisplay(); // Update initial enemy health display
};

window.addEventListener('resize', function() {
    adjustPlayerPosition();
});

function adjustPlayerPosition() {
    const player = document.getElementById('player1');
    player.style.left = `${Math.min(parseInt(player.style.left, 10), window.innerWidth - player.offsetWidth)}px`;
    player.style.top = `${Math.min(parseInt(player.style.top, 10), window.innerHeight - player.offsetHeight)}px`;
}

function updateScore(amount = 0) {
    score += amount; // Increment score by the given amount
    document.getElementById('scoreValue').textContent = score; // Update score display
}

function updateHealthDisplay() {
    document.getElementById('healthValue').textContent = `Health: ${playerHealth}`;
}

function updateEnemyHealthDisplay() {
    document.getElementById('enemyHealthValue').textContent = `Enemy Health: ${enemyHealth}`;
}

function checkCollision() {
    let bullets = document.querySelectorAll('.bullet');
    let enemyBullets = document.querySelectorAll('.enemyBullet');
    const player = document.getElementById('player1');
    const enemy = document.getElementById('player2');

    bullets.forEach(bullet => {
        if (isColliding(bullet, enemy)) {
            bullet.remove();
            enemyHealth -= 500; // Decrease enemy health by 500
            updateScore(1000); // Increase score by 1000
            updateEnemyHealthDisplay(); // Update enemy health display
            if (enemyHealth <= 0) {
                gameOver('You Win!');
            }
        }
    });

    enemyBullets.forEach(bullet => {
        if (isColliding(bullet, player)) {
            bullet.remove();
            playerHealth -= 500; // Decrease player health by 500
            updateHealthDisplay(); // Update player health display
            if (playerHealth <= 0) {
                gameOver('You Lose!');
            }
        }
    });

    if (isColliding(enemy, player)) {
        gameOver('You Lose!');
    }
}

function isColliding(a, b) {
    return (
        a.getBoundingClientRect().right > b.getBoundingClientRect().left &&
        a.getBoundingClientRect().left < b.getBoundingClientRect().right &&
        a.getBoundingClientRect().bottom > b.getBoundingClientRect().top &&
        a.getBoundingClientRect().top < b.getBoundingClientRect().bottom
    );
}

setInterval(checkCollision, 10); // Check for collisions every 10 ms

function movePlayer(event) {
    const player = document.getElementById('player1');
    const step = 10; // Pixels to move per keypress
    let currentLeft = parseInt(player.style.left, 10) || 0;
    let currentTop = parseInt(player.style.top, 10) || 0;

    switch (event.key) {
        case 'ArrowUp':
            player.style.top = `${Math.max(0, currentTop - step)}px`;
            break;
        case 'ArrowDown':
            player.style.top = `${Math.min(window.innerHeight - player.offsetHeight, currentTop + step)}px`;
            break;
        case 'ArrowLeft':
            player.style.left = `${Math.max(0, currentLeft - step)}px`;
            break;
        case 'ArrowRight':
            player.style.left = `${Math.min(window.innerWidth - player.offsetWidth, currentLeft + step)}px`;
            break;
    }
}

function updateCooldownDisplays() {
    document.getElementById('regularCooldown').textContent = `${regularCooldown}s`;
    document.getElementById('powerfulCooldown').textContent = `${powerfulCooldown}s`;
}

function shoot(powerful = false) {
    if (powerful && powerfulCooldown > 0) {
        console.log("Powerful shot is cooling down.");
        return;
    } else if (!powerful && regularCooldown > 0) {
        console.log("Regular shot is cooling down.");
        return;
    }

    var audio = new Audio("data/pop.wav");
    audio.play();
    const player = document.getElementById('player1');
    const gameArea = document.getElementById('gameArea');
    let bullet = document.createElement('div');
    bullet.className = 'bullet';
    if (powerful) {
        bullet.classList.add('powerBullet');
    }
    bullet.style.left = `${parseInt(player.style.left, 10) + player.offsetWidth}px`;
    bullet.style.top = `${parseInt(player.style.top, 10) + player.offsetHeight / 2 - 5}px`;
    gameArea.appendChild(bullet);

    let bulletMove = setInterval(() => {
        bullet.style.left = `${parseInt(bullet.style.left) + 10}px`;
        if (parseInt(bullet.style.left) - parseInt(bullet.dataset.initialLeft) >= BULLET_MAX_DISTANCE) {
            clearInterval(bulletMove);
            bullet.remove();
        }
    }, 10);

    if (powerful) {
        powerfulCooldown = 5; // 5 seconds for powerful shot
        let interval = setInterval(() => {
            powerfulCooldown--;
            updateCooldownDisplays();
            if (powerfulCooldown <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    } else {
        regularCooldown = 2; // 2 seconds for regular shot
        let interval = setInterval(() => {
            regularCooldown--;
            updateCooldownDisplays();
            if (regularCooldown <= 0) {
                clearInterval(interval);
            }
        }, 1000);
    }

    updateCooldownDisplays();
}

setInterval(updateCooldownDisplays, 1000); // Keep the display updated

function enemyShoot() {
    console.log("Enemy shoots!"); // Debugging statement
    const enemy = document.getElementById('player2');
    const gameArea = document.getElementById('gameArea');
    let bullet = document.createElement('div');
    bullet.className = 'enemyBullet';
    bullet.style.left = `${parseInt(enemy.style.left, 10) - 10}px`; // Start from the left of the enemy
    bullet.style.top = `${parseInt(enemy.style.top, 10) + enemy.offsetHeight / 2 - 5}px`;
    gameArea.appendChild(bullet);

    let bulletMove = setInterval(() => {
        bullet.style.left = `${parseInt(bullet.style.left, 10) - 10}px`; // Move the bullet to the left

        // Remove the bullet if it goes off screen
        if (parseInt(bullet.style.left, 10) < 0) {
            clearInterval(bulletMove);
            bullet.remove();
        }
    }, 20);
}

function enemyMove() {
    const enemy = document.getElementById('player2');
    const step = 200; // Distance to move
    const duration = 1000; // Duration of movement in milliseconds
    const directions = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    const direction = directions[Math.floor(Math.random() * directions.length)];
    let currentLeft = parseInt(enemy.style.left, 10) || 0;
    let currentTop = parseInt(enemy.style.top, 10) || 0;

    let targetLeft = currentLeft;
    let targetTop = currentTop;

    switch (direction) {
        case 'ArrowUp':
            targetTop = Math.max(0, currentTop - step);
            break;
        case 'ArrowDown':
            targetTop = Math.min(window.innerHeight - enemy.offsetHeight, currentTop + step);
            break;
        case 'ArrowLeft':
            targetLeft = Math.max(0, currentLeft - step);
            break;
        case 'ArrowRight':
            targetLeft = Math.min(window.innerWidth - enemy.offsetWidth, currentLeft + step);
            break;
    }

    const startTime = performance.now();

    function animate(time) {
        const elapsed = time - startTime;
        const fraction = Math.min(elapsed / duration, 1);

        enemy.style.left = currentLeft + (targetLeft - currentLeft) * fraction + 'px';
        enemy.style.top = currentTop + (targetTop - currentTop) * fraction + 'px';

        if (fraction < 1) {
            requestAnimationFrame(animate);
        }
    }

    requestAnimationFrame(animate);
}

document.addEventListener('keydown', function(event) {
    if (event.key in keys) {
        keys[event.key] = true;
    }
    if (event.key === '1') { // Check if the '1' key is pressed
        shoot();
    } else if (event.key === '2') {
        shoot(true); // Shoot a powerful bullet
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

function updatePlayerPosition() {
    const player = document.getElementById('player1');
    const step = 5; // Smaller step for smoother motion
    let top = parseInt(player.style.top) || 0;
    let left = parseInt(player.style.left) || 0;

    if (keys.ArrowUp && top > 0) top -= step;
    if (keys.ArrowDown && top < window.innerHeight - player.offsetHeight) top += step;
    if (keys.ArrowLeft && left > 0) left -= step;
    if (keys.ArrowRight && left < window.innerWidth - player.offsetWidth) left += step;

    player.style.top = `${top}px`;
    player.style.left = `${left}px`;
}

setInterval(updatePlayerPosition, 20); // Update position every 20 ms

function startGame() {
    gameInterval = setInterval(updateGame, 20); // Ensure this matches your game's update interval
    setInterval(enemyShoot, 3000); // Enemy shoots every 3 seconds
    setInterval(enemyMove, 500); // Enemy moves randomly every 0.5 seconds
}

function gameOver(message) {
    clearInterval(gameInterval); // Stop all game updates
    const player = document.getElementById('player1');
    player.style.display = 'none';

    const enemy = document.getElementById('player2');
    enemy.style.display = 'none';

    // Show the game over screen
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'block';

    // Display final score and message
    alert(`${message}\nFinal Score: ${score}`);

    // Add functionality to the replay button
    const replayButton = gameOverScreen.querySelector('button');
    replayButton.onclick = function() {
        restartGame();
    };
}

function restartGame() {
    clearInterval(gameInterval);

    const player = document.getElementById('player1');
    const enemy = document.getElementById('player2');
    const gameArea = document.getElementById('gameArea');

    // Clear all bullets
    const bullets = document.querySelectorAll('.bullet, .powerBullet, .enemyBullet');
    bullets.forEach(bullet => bullet.remove());

    // Reset player position and display
    player.style.display = 'block';
    player.style.left = '50px';
    player.style.top = '50px';

    // Reset enemy position and display
    enemy.style.display = 'block';
    enemy.style.left = 'calc(100% - 100px)';
    enemy.style.top = '50px';

    // Reset score, health, and other game variables
    score = 0;
    playerHealth = MAX_HEALTH;
    enemyHealth = ENEMY_MAX_HEALTH;
    regularCooldown = 0;
    powerfulCooldown = 0;
    updateScore(0);
    updateHealthDisplay();
    updateEnemyHealthDisplay();
    updateCooldownDisplays();

    // Reset key states
    keys = {
        ArrowUp: false,
        ArrowDown: false,
        ArrowLeft: false,
        ArrowRight: false
    };

    // Hide the game over screen
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'none';

    // Restart the game logic
    startGame();
}

function updateGame() {
    // Add your game logic that needs to run continuously here
}

setupControls(); // Set up controls if needed
