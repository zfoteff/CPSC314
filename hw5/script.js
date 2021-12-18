var color1 = "#000000";
var startMenuColor = "#3366CC";
var titleColor = '#CCCC00';

window.onload = function() {
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var ballRadius = 10;
    var x = canvas.width / 2;
    var y = canvas.height - 30;
    var dx = 2;
    var dy = -2;
    var paddleHeight = 10;
    var paddleWidth = 75;
    var paddleX = (canvas.width - paddleWidth) / 2;
    var rightPressed = false;
    var leftPressed = false;
    var brickRowCount = 5;
    var brickColumnCount = 3;
    var brickWidth = 75;
    var brickHeight = 20;
    var brickPadding = 10;
    var brickOffsetTop = 30;
    var brickOffsetLeft = 30;
    var score = 0;
    var lives = 3;
    //controls game speed
    var gameSpeed = 1.0;
    //pause game variable
    let isPlaying = false;
    let endstate = false;
    //high score tracking variables
    var highScore = 0;
    var animationFrame;

    var resetButton = document.getElementById('reset-button');
    var pauseButton = document.getElementById('pause-button');

    var bricks = [];
    generateBricks();

    document.addEventListener("keydown", keyDownHandler, false);
    document.addEventListener("keyup", keyUpHandler, false);
    //document.addEventListener("mousemove", mouseMoveHandler, false);

    function keyDownHandler(e) {
        if (e.keyCode == 39) {
            rightPressed = true;
        } else if (e.keyCode == 37) {
            leftPressed = true;
        }
    }

    function keyUpHandler(e) {
        if (e.keyCode == 39) {
            rightPressed = false;
        } else if (e.keyCode == 37) {
            leftPressed = false;
        }
    }

    function mouseMoveHandler(e) {
        var relativeX = e.clientX - canvas.offsetLeft;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
        }
    }

    function collisionDetection() {
        for (var c = 0; c < brickColumnCount; c++) {
            for (var r = 0; r < brickRowCount; r++) {
                var b = bricks[c][r];
                if (b.status == 1) {
                    if (x > b.x && x < b.x + brickWidth && y > b.y && y < b.y + brickHeight) {
                        dy = -dy;
                        b.status = 0;
                        score++;

                    }
                }
            }
        }
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(x, y, ballRadius, 0, Math.PI * 2);
        ctx.fillStyle = color1;
        ctx.fill();
        ctx.closePath();
    }

    function drawPaddle() {
        ctx.beginPath();
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
        ctx.fillStyle = color1;
        ctx.fill();
        ctx.closePath();
    }

    function drawBricks() {
        for (var c = 0; c < brickColumnCount; c++) {
            for (var r = 0; r < brickRowCount; r++) {
                if (bricks[c][r].status == 1) {
                    var brickX = (r * (brickWidth + brickPadding)) + brickOffsetLeft;
                    var brickY = (c * (brickHeight + brickPadding)) + brickOffsetTop;
                    bricks[c][r].x = brickX;
                    bricks[c][r].y = brickY;
                    ctx.beginPath();
                    ctx.rect(brickX, brickY, brickWidth, brickHeight);
                    ctx.fillStyle = color1;
                    ctx.fill();
                    ctx.closePath();
                }
            }
        }
    }

    function drawScore() {
        ctx.font = "16px Arial";
        ctx.fillStyle = color1;
        ctx.fillText("Score: " + score, 10, 20);
    }

    function drawLives() {
        ctx.font = "16px Arial";
        ctx.fillStyle = color1;
        ctx.fillText("Lives: " + lives, canvas.width - 65, 20);
    }

    function drawGame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawBricks();
        drawBall();
        drawPaddle();
        drawScore();
        drawHighScore();
        drawLives();
        collisionDetection();

        if (x + dx > canvas.width - ballRadius || x + dx < ballRadius) {
            dx = -dx;
        }
        if (y + dy < ballRadius) {
            dy = -dy;
        } else if (y + dy > canvas.height - ballRadius) {
            if (x > paddleX && x < paddleX + paddleWidth) {
                dy = -dy;
            } else {
                lives--;
                if (lives <= 0) {
                    togglePauseGame();
                    displayGameOver();
                    endstate = true;
                } else {
                    x = canvas.width / 2;
                    y = canvas.height - 30;
                    paddleX = (canvas.width - paddleWidth) / 2;
                }
            }
        }

        if (rightPressed && paddleX < canvas.width - paddleWidth && endstate == false) {
            paddleX += 7;
        } else if (leftPressed && paddleX > 0 && endstate == false) {
            paddleX -= 7;
        }

        x += dx * gameSpeed;
        y += dy * gameSpeed;

        if (isPlaying == true)
            animationFrame = requestAnimationFrame(drawGame);

        checkWinState();
    }

    //Drawing a high score
    function drawHighScore() {
        ctx.beginPath()
        ctx.font = "16px Arial";
        ctx.fillStyle = color1;
        ctx.fillText("High Score: " + highScore, (canvas.width / 2) - 50, 20);
    }

    //draw the menu screen, including labels and button
    function drawMenu() {
        //draw the rectangle menu backdrop
        ctx.beginPath();
        ctx.fillStyle = startMenuColor;
        ctx.fillRect(10, 10, canvas.width - 20, canvas.height - 20);
        ctx.closePath();
        //draw the menu header
        ctx.beginPath();
        ctx.font = '108px Impact';
        ctx.fillStyle = titleColor;
        ctx.fillText("Breakout!", 20, (canvas.height / 3));
        ctx.closePath();

        //start game button area
        ctx.beginPath();
        setShadow();
        ctx.fillStyle = titleColor;
        ctx.fillRect((canvas.width * (1 / 3) - 10), (canvas.height * (2 / 3)), 200, 75);
        resetShadow();
        ctx.closePath();

        //  Start game button text
        ctx.beginPath();
        ctx.font = '36px Arial';
        ctx.fillStyle = "#000000";
        ctx.fillText("Start", (canvas.width * (1 / 2) - 30), (canvas.height * (4 / 5) + 5));
        ctx.closePath();
        canvas.addEventListener('mousedown', startGameClick);
    };

    //function used to set shadow properties
    function setShadow() {
        ctx.shadowColor = "#000066";
        ctx.shadowBlur = 35;
    };

    //function used to reset shadow properties to 'normal'
    function resetShadow() {
        ctx.shadowBlur = 0;
    };

    //function to start the game
    //this should check to see if the player clicked the button
    //i.e., did the user click in the bounds of where the button is drawn
    //if so, we want to trigger the draw(); function to start our game
    function startGameClick(event) {
        let rect = canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;

        if (x >= 150 && x < 350 && y >= 212 && y < 287) {
            canvas.removeEventListener('mousedown', startGameClick);
            isPlaying = true;
            drawGame();
        }
    };

    //function to handle game speed adjustments when we move our slider
    function adjustGameSpeed() {
        //update the slider display                
        //update the game speed multiplier
        gameSpeed = document.getElementById("ball-speed").value;
        document.getElementById('speed-text').innerHTML = "Speed: " + gameSpeed;
    };

    //function to toggle the play/paused game state
    function togglePauseGame() {
        //toggle state                
        //if we are not paused, we want to continue animating (hint: zyBook 8.9)
        if (isPlaying == true) {
            cancelAnimationFrame(animationFrame);
            isPlaying = false;
        } else {
            console.log("unpause");
            animationFrame = requestAnimationFrame(drawGame);
            isPlaying = true;
        }
    };

    //function to reset the board and continue playing (accumulate high score)
    //should make sure we didn't lose before accumulating high score
    function continuePlaying() {
        console.log("Continue")
        if (isPlaying == false && endstate == true) {
            highScore += score;
            resetBoard();
        }
    };

    //function to clear the board state and start a new game (no high score accumulation)
    function startNewGame() {
        console.log("Reset game")
        if (isPlaying == false && endstate == true) {
            highScore = 0;
            resetBoard();
        }
    };

    //function to reset starting game info
    function resetBoard() {
        //reset paddle position
        //reset bricks               
        //reset score and lives
        paddleX = (canvas.width - paddleWidth) / 2;
        score = 0;
        lives = 3;
        x = canvas.width / 2;
        y = canvas.height - 30;
        adjustGameSpeed();
        endstate = false;
        isPlaying = true;
        generateBricks()
        drawGame();
    };

    function displayGameOver() {
        ctx.beginPath();
        ctx.font = '38px Impact';
        setShadow();
        ctx.fillStyle = "#FF0000";
        ctx.fillText("Sorry you lose...\nGame over!", 30, ((canvas.height) / 2));
        resetShadow();
        ctx.closePath();
    };

    function displayGameWin() {
        ctx.beginPath();
        ctx.font = '38px Impact';
        setShadow();
        ctx.fillStyle = "#00FF00";
        ctx.fillText("You Win!\nCongratulations", 40, ((canvas.height) / 2));
        resetShadow();
        ctx.closePath();
    };

    //function to check win state
    //if we win, we want to accumulate high score and draw a message to the canvas
    //if we lose, we want to draw a losing message to the canvas
    function checkWinState() {
        if (score == brickRowCount * brickColumnCount) {
            togglePauseGame()
            displayGameWin();
            endstate = true;
        }
    };

    function reloadPage() {
        document.location.reload();
    }

    function generateBricks() {
        bricks = [];
        //  Reset bricks
        for (var c = 0; c < brickColumnCount; c++) {
            bricks[c] = [];
            for (var r = 0; r < brickRowCount; r++) {
                bricks[c][r] = {
                    x: 0,
                    y: 0,
                    status: 1
                };
            }
        }
    };

    document.getElementById("pause-button").addEventListener('click', togglePauseGame);
    document.getElementById("reload").addEventListener('click', reloadPage);
    document.getElementById("reset-button").addEventListener('click', startNewGame);
    document.getElementById("continue-button").addEventListener('click', continuePlaying)
    document.getElementById("ball-speed").addEventListener('click', adjustGameSpeed);

    drawMenu();
};