const gameState = {
    board: [],
    emptyPos: { row: 0, col: 0 },
    size: 3,
    moves: 0,
    startTime: null,
    timer: null,
    gameMode: 'classic',
    difficulty: 3,
    isGameOver: false,
    isAnimating: false,
    touchStartX: 0,
    touchStartY: 0,
    
    setTouchStart(x, y) {
        this.touchStartX = x;
        this.touchStartY = y;
    },
    resetTouch() {
        this.touchStartX = 0;
        this.touchStartY = 0;
    }
};

let boardElement = null;
let movesElement = null;
let timeElement = null;
let gameModeElement = null;
let difficultyElement = null;
let shuffleBtn = null;
let hintBtn = null;
let menuBtn = null;
let gameOverModal = null;
let menuModal = null;
let hintOverlay = null;
let closeHintBtn = null;
let nextLevelBtn = null;
let menuModalBtn = null;
let resumeBtn = null;
let restartBtn = null;
let levelSelectBtn = null;
let mainMenuBtn = null;
let finalMovesElement = null;
let finalTimeElement = null;
let highscoreElement = null;

function initializeGame() {
    initializeElements();
    initializeEventListeners();
    
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'classic';
    const difficulty = parseInt(urlParams.get('difficulty')) || 3;
    gameState.gameMode = mode;
    gameState.difficulty = difficulty;
    
    startGame();
}

const CONFIG = {
    modes: {
        classic: 'Klassisch',
        pattern: 'Muster',
        image: 'Bilder'
    },
    difficulties: {
        3: '3×3',
        4: '4×4',
        5: '5×5'
    }
};


document.addEventListener('DOMContentLoaded', initializeGame);


function initializeElements() {
    boardElement = document.getElementById('puzzle-board');
    movesElement = document.getElementById('moves');
    timeElement = document.getElementById('time');
    gameModeElement = document.getElementById('game-mode');
    difficultyElement = document.getElementById('difficulty');
    shuffleBtn = document.getElementById('shuffleBtn');
    hintBtn = document.getElementById('hintBtn');
    menuBtn = document.getElementById('menuBtn');
    gameOverModal = document.getElementById('gameOverModal');
    menuModal = document.getElementById('menuModal');
    hintOverlay = document.getElementById('hintOverlay');
    closeHintBtn = document.getElementById('closeHintBtn');
    nextLevelBtn = document.getElementById('nextLevelBtn');
    menuModalBtn = document.getElementById('menuModalBtn');
    resumeBtn = document.getElementById('resumeBtn');
    restartBtn = document.getElementById('restartBtn');
    levelSelectBtn = document.getElementById('levelSelectBtn');
    mainMenuBtn = document.getElementById('mainMenuBtn');
    finalMovesElement = document.getElementById('final-moves');
    finalTimeElement = document.getElementById('final-time');
    highscoreElement = document.getElementById('highscore');
}

// Load saved game state from localStorage
function loadGameState() {
    // Try to get game state from URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'classic';
    const difficulty = parseInt(urlParams.get('difficulty')) || 3;
    
    // Update game state
    gameState.gameMode = mode;
    gameState.difficulty = difficulty;
    
    // Also load from localStorage if available
    const savedState = localStorage.getItem('slidePuzzleState');
    if (savedState) {
        const state = JSON.parse(savedState);
        Object.assign(gameState, state);
    }
    
    // Update the game mode display
    if (gameModeElement) {
        gameModeElement.textContent = CONFIG.modes[gameState.gameMode] || gameState.gameMode;
    }
}

window.addEventListener('beforeunload', function() {
    localStorage.removeItem('slidePuzzleState');
});

// Set up event listeners
function initializeEventListeners() {
    // Preview toggle for mobile
    const previewToggle = document.getElementById('preview-toggle');
    const closePreview = document.getElementById('close-preview');
    const previewModal = document.getElementById('preview-modal');
    
    if (previewToggle) {
        previewToggle.addEventListener('click', () => {
            previewModal.classList.add('active');
            // Update the preview image in the modal
            const modalPreview = previewModal.querySelector('.preview-image');
            const mainPreview = document.querySelector('.puzzle-preview .preview-image');
            if (modalPreview && mainPreview) {
                modalPreview.style.backgroundImage = mainPreview.style.backgroundImage;
            }
        });
    }
    
    if (closePreview) {
        closePreview.addEventListener('click', () => {
            previewModal.classList.remove('active');
        });
    }
    
    // Close modal when clicking outside the content
    if (previewModal) {
        previewModal.addEventListener('click', (e) => {
            if (e.target === previewModal) {
                previewModal.classList.remove('active');
            }
        });
    }
    
    // Game controls
    if (shuffleBtn) shuffleBtn.addEventListener('click', shuffleBoard);
    if (hintBtn) hintBtn.addEventListener('click', showHint);
    if (menuBtn) menuBtn.addEventListener('click', showMenu);
    if (solveBtn) solveBtn.addEventListener('click', solvePuzzle);
    
    // Check if we're in test mode
    const urlParams = new URLSearchParams(window.location.search);
    const isTestMode = urlParams.get('test') === 'true' || sessionStorage.getItem('testMode') === 'true';
    
    // Show solve button in test mode
    if (isTestMode && solveBtn) {
        solveBtn.style.display = 'flex';
    }
    
    // Menu buttons
    if (resumeBtn) resumeBtn.addEventListener('click', hideMenu);
    if (restartBtn) restartBtn.addEventListener('click', confirmRestart);
    if (levelSelectBtn) {
        levelSelectBtn.addEventListener('click', () => {
            window.location.href = 'level-selection.html';
        });
    }
    
    // Close modal button
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            const gameOverModal = document.getElementById('gameOverModal');
            if (gameOverModal) {
                gameOverModal.classList.remove('show');
            }
        });
    }
    if (mainMenuBtn) {
        mainMenuBtn.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
    
    // Game over modal
    if (nextLevelBtn) nextLevelBtn.addEventListener('click', goToNextLevel);
    if (menuModalBtn) {
        menuModalBtn.addEventListener('click', () => {
            window.location.href = 'level-selection.html';
        });
    }
    
    // Hint overlay
    if (closeHintBtn) closeHintBtn.addEventListener('click', hideHint);
    if (hintOverlay) {
        hintOverlay.addEventListener('click', (e) => {
            if (e.target === hintOverlay) hideHint();
        });
    }
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Start the game
function startGame() {
    // Reset game state
    gameState.moves = 0;
    gameState.startTime = Date.now();
    gameState.isGameOver = false;
    
    // Set the board size based on difficulty
    gameState.size = gameState.difficulty;
    
    // Update the difficulty display
    if (difficultyElement) {
        difficultyElement.textContent = `${gameState.size}×${gameState.size}`;
    }
    
    // Update game info
    updateGameInfo();
    
    // Initialize and shuffle the board
    initializeBoard();
    shuffleBoard();
    
    // Show/hide preview based on game mode
    const previewElement = document.querySelector('.puzzle-preview');
    if (gameState.gameMode === 'image' || gameState.gameMode === 'pattern') {
        previewElement.style.display = 'block';
        updatePreviewImage();
    } else {
        previewElement.style.display = 'none';
    }
    
    // Start the timer
    startTimer();
    
    // Update UI
    updateGameInfo();
    renderBoard();
    
    // Mark as playing
    gameState.isPlaying = true;
}

// Initialize the game board
function initializeBoard() {
    const size = gameState.size;
    const totalTiles = size * size;
    
    // Create solved board
    gameState.board = [];
    let counter = 1;
    
    // Initialize the board with numbers 1 to (size*size-1) and 0 for empty
    for (let i = 0; i < size; i++) {
        gameState.board[i] = [];
        for (let j = 0; j < size; j++) {
            if (i === size - 1 && j === size - 1) {
                // Last position is empty (0)
                gameState.board[i][j] = 0;
                gameState.emptyPos = { row: i, col: j };
            } else {
                gameState.board[i][j] = counter++;
            }
        }
    }
    
    // For image/pattern modes, we need to ensure the preview shows the correct image
    if (gameState.gameMode === 'image' || gameState.gameMode === 'pattern') {
        updatePreviewImage();
    }
    
    // Shuffle the board
    shuffleBoard();
}

// Shuffle the board
function shuffleBoard() {
    const size = gameState.size;
    let shuffleMoves = size * 50; // Number of random moves to make
    
    // Make random valid moves
    while (shuffleMoves > 0) {
        const possibleMoves = [];
        const { row, col } = gameState.emptyPos;
        
        // Check all four directions
        if (row > 0) possibleMoves.push({ row: row - 1, col }); // Up
        if (row < size - 1) possibleMoves.push({ row: row + 1, col }); // Down
        if (col > 0) possibleMoves.push({ row, col: col - 1 }); // Left
        if (col < size - 1) possibleMoves.push({ row, col: col + 1 }); // Right
        
        // Choose a random move
        if (possibleMoves.length > 0) {
            const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            swapTiles(randomMove.row, randomMove.col);
            shuffleMoves--;
        }
    }
    
    // Reset moves and timer
    gameState.moves = 0;
    if (gameState.startTime) {
        gameState.startTime = Date.now();
    }
    
    // Update UI
    updateGameInfo();
    renderBoard();
}

// Swap two tiles on the board
function swapTiles(row, col) {
    const { row: emptyRow, col: emptyCol } = gameState.emptyPos;
    const temp = gameState.board[row][col];
    
    gameState.board[row][col] = 0;
    gameState.board[emptyRow][emptyCol] = temp;
    gameState.emptyPos = { row, col };
}

// Render the game board
function renderBoard() {
    if (!boardElement) return;
    
    const size = gameState.size;
    boardElement.innerHTML = '';
    
    // Ensure the board is visible and properly sized
    boardElement.style.display = 'grid';
    boardElement.style.gridTemplateColumns = `repeat(${size}, 1fr)`;
    boardElement.style.gridTemplateRows = `repeat(${size}, 1fr)`;
    boardElement.style.gap = '4px';
    boardElement.style.width = '100%';
    boardElement.style.maxWidth = 'min(90vw, 500px)';
    boardElement.style.aspectRatio = '1/1';
    boardElement.style.margin = '0 auto';
    boardElement.style.background = '#f0f9fa';
    boardElement.style.borderRadius = '10px';
    boardElement.style.padding = '10px';
    boardElement.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    boardElement.style.overflow = 'hidden';
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const value = gameState.board[i][j];
            const tile = document.createElement('div');
            tile.className = 'puzzle-tile';
            
            if (value === 0) {
                tile.classList.add('empty');
                tile.style.visibility = 'hidden';
            } else {
                // Add click handler for movable tiles
                if (isAdjacentToEmpty(i, j)) {
                    tile.classList.add('movable');
                    tile.addEventListener('click', () => moveTile(i, j));
                }
                
                // Set content based on game mode
                if (gameState.gameMode === 'classic') {
                    tile.textContent = value;
                } else if (gameState.gameMode === 'image') {
                    const tileValue = gameState.board[i][j];
                    if (tileValue !== 0) {  // Skip the empty tile
                        // Use the pre-split images from the appropriate folder based on difficulty
                        let folder, imageNum;
                        if (gameState.difficulty === 3) {
                            folder = 'b-1-splitter';
                            imageNum = tileValue < 10 ? `0${tileValue}` : tileValue.toString();
                        } else if (gameState.difficulty === 4) {
                            folder = 'b-2-splitter';
                            imageNum = tileValue.toString();
                        } else {
                            folder = 'b-3-splitter';
                            imageNum = tileValue.toString();
                        }
                        const extension = gameState.difficulty === 5 ? '.webp' : '.jpg';
                        tile.style.backgroundImage = `url('images/${folder}/${imageNum}${extension}')`;
                        tile.style.backgroundSize = 'cover';
                        tile.style.backgroundPosition = 'center';
                    } else {
                        // Empty tile
                        tile.style.backgroundImage = 'none';
                        tile.style.backgroundColor = '#f0f0f0';
                    }
                } else if (gameState.gameMode === 'pattern') {
                    const tileValue = gameState.board[i][j];
                    if (tileValue !== 0) {  // Skip the empty tile
                        // Wähle den richtigen Ordner basierend auf der Schwierigkeit
                        let folder, extension;
                        if (gameState.difficulty === 3) {
                            folder = 'm-1-splitter';
                            extension = '.jpg';
                        } else if (gameState.difficulty === 4) {
                            folder = 'm-2-splitter';
                            extension = '.jpg';
                        } else {
                            folder = 'm-3-splitter';
                            extension = '.webp';
                        }
                        const imageNum = tileValue.toString();
                        tile.style.backgroundImage = `url('images/${folder}/${imageNum}${extension}')`;
                        tile.style.backgroundSize = 'cover';
                        tile.style.backgroundPosition = 'center';
                    } else {
                        // Empty tile
                        tile.style.backgroundImage = 'none';
                        tile.style.backgroundColor = '#f0f0f0';
                    }
                }
            }
            
            // Set tile styles
            tile.style.width = '100%';
            tile.style.height = '100%';
            tile.style.display = 'flex';
            tile.style.alignItems = 'center';
            tile.style.justifyContent = 'center';
            tile.style.fontSize = '2rem';
            tile.style.fontWeight = '600';
            tile.style.borderRadius = '8px';
            tile.style.cursor = 'pointer';
            tile.style.transition = 'all 0.2s ease';
            tile.style.boxShadow = '0 2px 8px rgba(0, 105, 135, 0.1)';
            
            // Add tile to board
            boardElement.appendChild(tile);
        }
    }
}

// Check if a tile is adjacent to the empty space
function isAdjacentToEmpty(row, col) {
    const { row: emptyRow, col: emptyCol } = gameState.emptyPos;
    return (
        (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
        (Math.abs(col - emptyCol) === 1 && row === emptyRow)
    );
}

// Move a tile to the empty space
function moveTile(row, col) {
    if (gameState.isGameOver || gameState.isAnimating) return;
    
    const { row: emptyRow, col: emptyCol } = gameState.emptyPos;
    
    // Check if the move is valid
    if (!isAdjacentToEmpty(row, col)) return;
    
    // Update game state
    gameState.board[emptyRow][emptyCol] = gameState.board[row][col];
    gameState.board[row][col] = 0;
    gameState.emptyPos = { row, col };
    
    // Update moves
    gameState.moves++;
    if (movesElement) movesElement.textContent = gameState.moves;
    
    // Re-render the board
    renderBoard();
    
    // Check for win condition
    if (checkWin()) {
        gameOver();
    }
}

// Handle keyboard controls
function handleKeyPress(e) {
    if (gameState.isGameOver || gameState.isAnimating) return;
    
    const { row, col } = gameState.emptyPos;
    let newRow = row;
    let newCol = col;
    
    switch (e.key) {
        case 'ArrowUp':
            if (row < gameState.size - 1) newRow++;
            break;
        case 'ArrowDown':
            if (row > 0) newRow--;
            break;
        case 'ArrowLeft':
            if (col < gameState.size - 1) newCol++;
            break;
        case 'ArrowRight':
            if (col > 0) newCol--;
            break;
        default:
            return; // Exit if no relevant key was pressed
    }
    
    // If position changed, move the tile
    if (newRow !== row || newCol !== col) {
        moveTile(newRow, newCol);
    }
}

// Check if the puzzle is solved
function checkWin() {
    const size = gameState.size;
    
    // For all modes, check if the pieces are in the correct visual positions
    // The correct position is when the tile's value matches its expected position
    // in a left-to-right, top-to-bottom order (1 to size*size-1, with 0 as empty)
    const expectedBoard = [];
    let counter = 1;
    
    // Create the expected board configuration
    for (let i = 0; i < size; i++) {
        expectedBoard[i] = [];
        for (let j = 0; j < size; j++) {
            if (i === size - 1 && j === size - 1) {
                expectedBoard[i][j] = 0; // Empty space at bottom-right
            } else {
                expectedBoard[i][j] = counter++;
            }
        }
    }
    
    // Compare current board with expected board
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (gameState.board[i][j] !== expectedBoard[i][j]) {
                return false;
            }
        }
    }
    return true;
}

// Update the preview image for 'Bilder' and 'Muster' modes
function updatePreviewImage() {
    const desktopPreview = document.querySelector('.puzzle-preview .preview-image');
    const mobilePreview = document.querySelector('.preview-modal .preview-image');
    
    if (gameState.gameMode === 'image' || gameState.gameMode === 'pattern') {
        let imageUrl = '';
        
        if (gameState.gameMode === 'image') {
            // Wähle das korrekte Vorschaubild basierend auf der Schwierigkeit
            let previewImage;
            if (gameState.difficulty === 3) {
                previewImage = 'b-1.jpg';
            } else if (gameState.difficulty === 4) {
                previewImage = 'b-2.jpg';
            } else {
                previewImage = 'b-3.jpg';
            }
            imageUrl = `url('images/${previewImage}')`;
        } else {
            // Wähle das korrekte Vorschaubild basierend auf der Schwierigkeit
            let previewImage;
            if (gameState.difficulty === 3) {
                previewImage = 'm-1.jpg';
            } else if (gameState.difficulty === 4) {
                previewImage = 'm-2.jpg';
            } else {
                previewImage = 'm-3.webp';
            }
            imageUrl = `url('images/${previewImage}')`;
        }
        
        // Update both desktop and mobile previews
        if (desktopPreview) {
            desktopPreview.style.backgroundImage = imageUrl;
            desktopPreview.style.display = 'block';
        }
        
        if (mobilePreview) {
            mobilePreview.style.backgroundImage = imageUrl;
            mobilePreview.style.display = 'block';
        }
    } else {
        // Hide previews for classic mode
        if (desktopPreview) desktopPreview.style.display = 'none';
        if (mobilePreview) mobilePreview.style.display = 'none';
    }
}

// Start the game timer
function startTimer() {
    // Clear any existing timer
    stopTimer();
    
    // Update the timer immediately
    updateTimer();
    
    // Set up the timer to update every second
    gameState.timer = setInterval(updateTimer, 1000);
}

// Stop the game timer
function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

// Update the timer display
function updateTimer() {
    if (!timeElement) return;
    
    const elapsed = Math.floor((Date.now() - gameState.startTime) / 1000);
    const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
    const seconds = (elapsed % 60).toString().padStart(2, '0');
    timeElement.textContent = `${minutes}:${seconds}`;
}

// Update game info in the UI
function updateGameInfo() {
    if (gameModeElement) {
        gameModeElement.textContent = CONFIG.modes[gameState.gameMode] || gameState.gameMode;
    }
    if (difficultyElement) {
        difficultyElement.textContent = CONFIG.difficulties[gameState.difficulty] || `${gameState.difficulty}×${gameState.difficulty}`;
    }
    if (movesElement) {
        movesElement.textContent = gameState.moves;
    }
}

// Show the game over modal
function gameOver() {
    gameState.isGameOver = true;
    stopTimer();
    
    // Update final stats
    if (finalMovesElement) finalMovesElement.textContent = gameState.moves;
    if (finalTimeElement) finalTimeElement.textContent = timeElement ? timeElement.textContent : '00:00';
    
    // Show high score if available
    updateHighScore();
    
    // Unlock the next level
    if (window.unlockNextLevel) {
        window.unlockNextLevel(gameState.gameMode, gameState.difficulty);
    }
    
    // Show/hide Next Level button based on current mode and difficulty
    const nextLevelBtn = document.getElementById('nextLevelBtn');
    if (nextLevelBtn) {
        // Hide Next Level button only if it's the last level of Bilder mode
        if (gameState.gameMode === 'image' && gameState.difficulty >= 5) {
            nextLevelBtn.style.display = 'none';
        } else {
            nextLevelBtn.style.display = 'flex';
        }
    }
    
    // Show the game over modal
    if (gameOverModal) gameOverModal.classList.add('show');
}

// Update the high score display
function updateHighScore() {
    if (!highscoreElement) return;
    
    const highScores = JSON.parse(localStorage.getItem('highScores') || '{}');
    const modeKey = `${gameState.gameMode}-${gameState.difficulty}`;
    const currentScore = {
        moves: gameState.moves,
        time: Math.floor((Date.now() - gameState.startTime) / 1000)
    };
    
    if (!highScores[modeKey] || 
        currentScore.moves < highScores[modeKey].moves || 
        (currentScore.moves === highScores[modeKey].moves && currentScore.time < highScores[modeKey].time)) {
        // New high score!
        highScores[modeKey] = currentScore;
        localStorage.setItem('highScores', JSON.stringify(highScores));
        highscoreElement.textContent = 'Neuer Rekord!';
    } else {
        // Show existing high score
        const highScore = highScores[modeKey];
        const minutes = Math.floor(highScore.time / 60).toString().padStart(2, '0');
        const seconds = (highScore.time % 60).toString().padStart(2, '0');
        highscoreElement.textContent = `Bester: ${highScore.moves} Züge, ${minutes}:${seconds}`;
    }
}

// Show the menu modal
function showMenu() {
    if (menuModal) menuModal.classList.add('show');
}

// Hide the menu modal
function hideMenu() {
    if (menuModal) menuModal.classList.remove('show');
}

// Show a hint
function showHint() {
    if (hintOverlay) hintOverlay.classList.add('show');
}

// Hide the hint
function hideHint() {
    if (hintOverlay) hintOverlay.classList.remove('show');
}

// Confirm before restarting the game
function confirmRestart() {
    if (confirm('Möchten Sie das Spiel wirklich neu starten?')) {
        hideMenu();
        startGame();
    }
}

// Solve the puzzle (for test mode)
function solvePuzzle() {
    const size = gameState.size;
    let counter = 1;
    
    // Create a solved board
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (i === size - 1 && j === size - 1) {
                gameState.board[i][j] = 0; // Empty space
                gameState.emptyPos = { row: size - 1, col: size - 1 };
            } else {
                gameState.board[i][j] = counter++;
            }
        }
    }
    
    // Update the board display
    renderBoard();
    
    // Mark as solved
    gameState.isGameOver = true;
    stopTimer();
    
    // Show game over modal
    setTimeout(() => {
        gameOver();
    }, 500);
}

// Go to the next level
function goToNextLevel() {
    if (gameOverModal) gameOverModal.classList.remove('show');
    
    const modes = ['classic', 'pattern', 'image'];
    const currentModeIndex = modes.indexOf(gameState.gameMode);
    
    // If we're at max difficulty (5x5)
    if (gameState.difficulty >= 5) {
        // If this is the last mode (Bilder), don't show next level button
        if (currentModeIndex === modes.length - 1) {
            const nextLevelBtn = document.getElementById('nextLevelBtn');
            if (nextLevelBtn) {
                nextLevelBtn.style.display = 'none';
            }
            startGame();
            return;
        }
        
        // Move to next mode at 3x3
        gameState.gameMode = modes[currentModeIndex + 1];
        gameState.difficulty = 3;
    } else {
        // Move to next difficulty in current mode
        gameState.difficulty++;
    }
    
    gameState.size = gameState.difficulty;
    
    // Save the new game state
    const currentGame = JSON.parse(localStorage.getItem('currentGame') || '{}');
    currentGame.mode = gameState.gameMode;
    currentGame.difficulty = gameState.difficulty;
    localStorage.setItem('currentGame', JSON.stringify(currentGame));
    
    // Restart the game with new settings
    startGame();
}

// Handle touch events for mobile
function handleTouchStart(e) {
    gameState.setTouchStart(e.touches[0].clientX, e.touches[0].clientY);
    e.preventDefault();
}

function handleTouchEnd(e) {
    if (!gameState.touchStartX || !gameState.touchStartY) return;
    
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    
    const diffX = gameState.touchStartX - touchEndX;
    const diffY = gameState.touchStartY - touchEndY;
    
    // Only consider the swipe if it's more horizontal or vertical than a threshold
    if (Math.abs(diffX) > 20 || Math.abs(diffY) > 20) {
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // Horizontal swipe
            if (diffX > 0) {
                // Swipe left
                handleKeyPress({ key: 'ArrowLeft' });
            } else {
                // Swipe right
                handleKeyPress({ key: 'ArrowRight' });
            }
        } else {
            // Vertical swipe
            if (diffY > 0) {
                // Swipe up
                handleKeyPress({ key: 'ArrowUp' });
            } else {
                // Swipe down
                handleKeyPress({ key: 'ArrowDown' });
            }
        }
    }
    
    // Reset touch coordinates
    gameState.resetTouch();
    e.preventDefault();
}