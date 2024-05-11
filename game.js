const BULLET_MAX_DISTANCE = 200;  // Max distance in pixels a bullet can travel

document.addEventListener('keydown', movePlayer);
let score = 0;

let enemiesKilled = 0;

function checkCollision() {
    let bullets = document.querySelectorAll('.bullet');
    let enemies = document.querySelectorAll('.enemy');

    bullets.forEach(bullet => {
        enemies.forEach(enemy => {
            if (bullet.getBoundingClientRect().right > enemy.getBoundingClientRect().left &&
                bullet.getBoundingClientRect().left < enemy.getBoundingClientRect().right &&
                bullet.getBoundingClientRect().bottom > enemy.getBoundingClientRect().top &&
                bullet.getBoundingClientRect().top < enemy.getBoundingClientRect().bottom) {
                if (bullet.classList.contains('powerBullet')) {
                    gameArea.removeChild(enemy); // Instant kill for power bullet
                    score += 10;
                    updateScore();
                } else if (enemy.getAttribute('data-hit') === '0') {
                    enemy.style.backgroundColor = 'red';
                    enemy.setAttribute('data-hit', '1');
                } else {
                    gameArea.removeChild(enemy);
                    score += 10;
                    updateScore();
                }
                enemiesKilled++;
                gameArea.removeChild(bullet);
            }
        });
    });

    enemies.forEach(enemy => {
        if (parseInt(enemy.style.left) < parseInt(player.style.left) + player.offsetWidth &&
            parseInt(enemy.style.left) + enemy.offsetWidth > parseInt(player.style.left) &&
            parseInt(enemy.style.top) < parseInt(player.style.top) + player.offsetHeight &&
            parseInt(enemy.style.top) + enemy.offsetHeight > parseInt(player.style.top)) {
            gameOver();
        }
    });
}

setInterval(checkCollision, 10); // Check for collisions every 20 ms


function updateScore() {
    document.getElementById('score').innerText = `Score: ${score}`;
}

function movePlayer(event) {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('gameArea');
    const step = 10; // change in pixels per move
    let playerPosition = player.getBoundingClientRect();

    if (event.key === 'ArrowUp' && playerPosition.top > gameArea.offsetTop) {
        player.style.top = `${playerPosition.top - step}px`;
    } else if (event.key === 'ArrowDown' && playerPosition.bottom < gameArea.offsetHeight) {
        player.style.top = `${playerPosition.top + step}px`;
    } else if (event.key === 'ArrowLeft' && playerPosition.left > gameArea.offsetLeft) {
        player.style.left = `${playerPosition.left - step}px`;
    } else if (event.key === 'ArrowRight' && playerPosition.right < gameArea.offsetWidth) {
        player.style.left = `${playerPosition.left + step}px`;
    }
}


function shoot(powerful = false) {
    var audio = new Audio("data/pop.wav");
    audio.play();
    const player = document.getElementById('player');
    const gameArea = document.getElementById('gameArea');
    let bullet = document.createElement('div');
    bullet.className = 'bullet';
    if (powerful) {
        bullet.classList.add('powerBullet');  // Adding a class for powerful bullets
    }
    bullet.style.left = `${parseInt(player.style.left) + player.offsetWidth}px`;
    bullet.style.top = `${parseInt(player.style.top) + player.offsetHeight / 2 - 5}px`;
    gameArea.appendChild(bullet);

    // Store initial position for distance calculation
    bullet.dataset.initialLeft = bullet.style.left;

    let bulletMove = setInterval(() => {
        bullet.style.left = `${parseInt(bullet.style.left) + 10}px`; // Move the bullet to the right

        // Check if the bullet has traveled its maximum distance
        if (parseInt(bullet.style.left) - parseInt(bullet.dataset.initialLeft) >= BULLET_MAX_DISTANCE) {
            clearInterval(bulletMove);
            bullet.remove(); // Remove bullet from the DOM
        }
    }, 20);
}


function createEnemy() {
    const gameArea = document.getElementById('gameArea');
    let enemy = document.createElement('div');
    enemy.className = 'enemy';
    enemy.style.left = '800px'; // Start from the right edge of the game area
    enemy.style.top = `${Math.floor(Math.random() * 550)}px`; // Random position within the game area
    enemy.setAttribute('data-hit', '0'); // Track hits on the enemy
    gameArea.appendChild(enemy);

    let interval = setInterval(function() {
        if (parseInt(enemy.style.left) > 0) {
            enemy.style.left = `${parseInt(enemy.style.left) - 5}px`;
        } else {
            clearInterval(interval);
            gameArea.removeChild(enemy);
        }
    }, 70); //speed
}


setInterval(createEnemy, 2000); // Create an enemy every 2000 ms

// Initialize key states
let keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

document.addEventListener('keydown', function(event) {
    if (event.key in keys) {
        keys[event.key] = true;
    }
    if (event.key === '1') {  // Check if the '1' key is pressed
        console.log("1 key pressed");
        shoot();
    } else if (event.key === '2' && enemiesKilled >= 2) {
        shoot(true);  // Shoot a powerful bullet
    }
});

document.addEventListener('keyup', function(event) {
    if (event.key in keys) {
        keys[event.key] = false;
    }
});

function updatePlayerPosition() {
    const player = document.getElementById('player');
    const step = 5; // Smaller step for smoother motion
    let top = parseInt(player.style.top);
    let left = parseInt(player.style.left);

    if (keys.ArrowUp) top -= step;
    if (keys.ArrowDown) top += step;
    if (keys.ArrowLeft) left -= step;
    if (keys.ArrowRight) left += step;

    // Boundary checks
    player.style.top = `${Math.max(0, Math.min(top, 550))}px`; // 600px - 50px (player height)
    player.style.left = `${Math.max(0, Math.min(left, 750))}px`; // 800px - 50px (player width)
}

setInterval(updatePlayerPosition, 20); // Update position every 20 ms

function updateEnemies() {
    const enemies = document.querySelectorAll('.enemy');
    enemies.forEach(enemy => {
        if (parseInt(enemy.style.left) > 0) {
            enemy.style.left = `${parseInt(enemy.style.left) - 5}px`;
            checkPlayerCollision(enemy);
        } else {
            gameArea.removeChild(enemy);
        }
    });
}


let gameInterval;

function startGame() {
    gameInterval = setInterval(updateGame, 20); // Ensure this matches your game's update interval
}



function gameOver() {
    clearInterval(gameInterval); // Stop all game updates

    // Hide the player and enemies
    const player = document.getElementById('player');
    const enemies = document.querySelectorAll('.enemy');
    player.style.display = 'none';
    enemies.forEach(enemy => enemy.remove());

    // Show the game over screen
    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'block';

    // Add functionality to the replay button
    const replayButton = gameOverScreen.querySelector('button');
    replayButton.onclick = function() {
        restartGame();
    };
}




function restartGame() {
    const player = document.getElementById('player');
    const gameArea = document.getElementById('gameArea');
    player.style.display = 'block';
    player.style.left = '375px'; // Adjust based on your game's initial player position
    player.style.top = '275px';

    gameArea.innerHTML = '';  // This removes all children including bullets and enemies
    gameArea.appendChild(player);

    score = 0;  // Reset score
    enemiesKilled = 0;  // Reset enemies killed counter
    updateScore();

    const gameOverScreen = document.getElementById('gameOverScreen');
    gameOverScreen.style.display = 'none';

    startGame();  // Restart game logic
}


function setupControls() {
    document.addEventListener('keydown', function(event) {
        // Your key handling logic here
    });
}





