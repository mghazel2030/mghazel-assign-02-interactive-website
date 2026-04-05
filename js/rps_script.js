/* 
   =========================================================
   Rock-Paper-Scissors App JS File: File: rps_script.js
   ---------------------------------------------------------
   Course: Software Development Bootcamp Course
   Assignment # 2: Interactive Website
   =========================================================
   Content: The main JavaScript file of the App.
   =========================================================
   Developer: Mohsen Ghazel
   Version: 27-Mar-2026
   =========================================================
*/

/*
  Global variable declarations and initializations
*/
// Initialize the player and computer scores
let playerScore = 0, computerScore = 0;
// Initialize the winning-score
const WINNING_SCORE = 8;
// Initialize the countdown time variables
let timeLeft = 5, timerInterval = null, resolveChoice = null, gameActive = false;

// Start the Match
function beginMatch() {
    // Clear the start screen
    document.getElementById('start-screen').style.display = 'none';
    document.getElementById('game-content').style.display = 'block';
    // Initialize the variables
    playerScore = 0; computerScore = 0;
    gameActive = true;
    updateUI("READY?", "Your turn! Make a move.");
    startNewTurn();
}

// Start a new turn
async function startNewTurn() {
    if (!gameActive) return;
    if (timerInterval) clearInterval(timerInterval);
    
    try {
        const choice = await waitForChoice();
        processRound(choice);
    } catch (e) {
        if (e === "timeout" && gameActive) {
            computerScore++;
            updateUI("TOO SLOW! ⏰", "Computer scores.");
            checkMatchWinner();
        }
    }
}

// Wait for the user choice and start clock countdown
function waitForChoice() {
    return new Promise((resolve, reject) => {
        resolveChoice = resolve;
        timeLeft = 5;
        updateTimer();
        timerInterval = setInterval(() => {
            timeLeft--;
            updateTimer();
            if (timeLeft <= 0) { clearInterval(timerInterval); reject("timeout"); }
        }, 1000);
    });
}

// Handle the user choice
function handleUserChoice(choice) {
    if (resolveChoice && gameActive) {
        clearInterval(timerInterval);
        const res = resolveChoice;
        resolveChoice = null; // CRITICAL: Fixes consecutive click issues
        res(choice);
    }
}

// Parse the player choice
function processRound(playerChoice) {
    const options = ['rock', 'paper', 'scissors'];
    const cpu = options[Math.floor(Math.random() * 3)];
    let msg = (playerChoice === cpu) ? "TIE! 🤝" : 
              ((playerChoice === 'rock' && cpu === 'scissors') || 
               (playerChoice === 'paper' && cpu === 'rock') || 
               (playerChoice === 'scissors' && cpu === 'paper')) ? "YOUR POINT! 🎉" : "COMPUTER POINT! 🤖";
    
    if (msg === "YOUR POINT! 🎉") playerScore++;
    if (msg === "COMPUTER POINT! 🤖") computerScore++;

    updateUI(msg, `You: ${playerChoice.toUpperCase()} | CPU: ${cpu.toUpperCase()}`);
    checkMatchWinner();
}

// Check the match winner
function checkMatchWinner() {
    if (playerScore >= WINNING_SCORE || computerScore >= WINNING_SCORE) {
        gameActive = false;
        clearInterval(timerInterval);
        setTimeout(() => {
            document.getElementById('winner-text').innerText = playerScore >= 8 ? "YOU WIN! 🏆" : "COMPUTER WINS! 🤖";
            document.getElementById('victory-modal').style.display = 'flex';
        }, 500);
    } else {
        setTimeout(() => { if(gameActive) startNewTurn(); }, 1000);
    }
}

// Update the UI
function updateUI(m, d) {
    document.getElementById('player-score').innerText = playerScore;
    document.getElementById('computer-score').innerText = computerScore;
    document.getElementById('message').innerText = m;
    document.getElementById('detail').innerText = d;
}

// Update the timer
function updateTimer() {
    document.getElementById('timer-display').innerText = `Your Turn: ${timeLeft} remaining seconds`;
}

// Reset the game
function resetGame() { location.reload(); }

