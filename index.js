// Import necessary modules
const express = require('express');
const redis = require('redis');
const bodyParser = require('body-parser');
const path = require('path'); // Add this line to use the path module
const { v4: uuidv4 } = require('uuid');

// Initialize Express app and middleware
const app = express();
app.use(bodyParser.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Initialize Redis client
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis Client Error', err));

// Connect to Redis
(async () => {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Error connecting to Redis', err);
    }
})();

// Function to determine if the game has been won
function checkWin(moves) {
    const winConditions = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    return winConditions.some((condition) => {
        return condition.every((index) => moves.includes(index));
    });
}

// Function to generate a computer move
function generateComputerMove(playerMoves, computerMoves) {
    const availableMoves = [...Array(9).keys()].filter((index) => {
        return !playerMoves.includes(index) && !computerMoves.includes(index);
    });

    if (availableMoves.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        return availableMoves[randomIndex];
    }
    return null;
}

// Function to start a new game
async function startNewGame(req, res) {
    const gameId = uuidv4();
    const startsFirst = Math.random() < 0.5 ? 'computer' : 'player';

    const gameState = {
        playerMoves: [],
        computerMoves: [],
        gameOver: false,
        winner: null
    };

    if (startsFirst === 'computer') {
        // Make the first move as the computer
        gameState.computerMoves.push(generateComputerMove([], []));
    }

    // Use the native async methods of Redis client
    await redisClient.hSet(`game:${gameId}`, 'state', JSON.stringify(gameState));

    res.json({ gameId, startsFirst });
}

// Function to make a move in the game
async function makeMove(req, res) {
    const { gameId } = req.params;
    const { move } = req.body; // This can be undefined for the computer's first move

    const gameStateString = await redisClient.hGet(`game:${gameId}`, 'state');
    const gameState = JSON.parse(gameStateString);

    if (gameState.gameOver) {
        return res.status(400).send('Game is already over.');
    }

    if (move !== undefined && !gameState.playerMoves.includes(move) && !gameState.computerMoves.includes(move)) {
        gameState.playerMoves.push(move);

        if (checkWin(gameState.playerMoves)) {
            gameState.gameOver = true;
            gameState.winner = 'player';
        }
    }

    if (!gameState.gameOver) {
        const computerMove = generateComputerMove(gameState.playerMoves, gameState.computerMoves);
        if (computerMove !== null) {
            gameState.computerMoves.push(computerMove);
        }

        if (checkWin(gameState.computerMoves)) {
            gameState.gameOver = true;
            gameState.winner = 'computer';
        }
    }

    // Check for draw

    // TODO: 


    if (!gameState.gameOver && gameState.playerMoves.length + gameState.computerMoves.length === 9) {
        gameState.gameOver = true;
        gameState.winner = 'draw';
    }

    // Use the native async methods of Redis client
    await redisClient.hSet(`game:${gameId}`, 'state', JSON.stringify(gameState));

    res.json({
        playerMoves: gameState.playerMoves,
        computerMoves: gameState.computerMoves,
        gameOver: gameState.gameOver,
        winner: gameState.winner
    });
}

// Define routes
app.post('/game', startNewGame);
app.post('/game/:gameId/move', makeMove);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
