// import the required modules
const express = require('express');
const redis = require('redis');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Set up the Express app and middleware
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Create a Redis client and connect to the server
const redisClient = redis.createClient({ url: 'redis://localhost:6379' });
redisClient.connect().catch(console.error);

// Serve static files from the public directory
app.use(express.static('public'));

// Define a root route
app.get('/', (req, res) => {
  res.send('Tic Tac Toe App is running!');
});

// Implement the endpoint to start a new game
app.post('/game', async (req, res) => {
  const gameId = uuidv4();
  let playerMoves = [];
  let computerMoves = [];
  let turn = Math.random() < 0.5 ? 'player' : 'computer';
  
  if (turn === 'computer') {
    // Computer makes its move immediately
    computerMoves.push(getRandomOpenSpot(playerMoves, computerMoves));
    turn = 'player'; // Now it's the player's turn
  }

  await redisClient.hSet(`game:${gameId}`, {
    playerMoves: JSON.stringify(playerMoves),
    computerMoves: JSON.stringify(computerMoves),
    turn: turn,
    winner: '',
  });

  res.json({ 
    gameId, 
    startsFirst: turn, 
    playerMoves, 
    computerMoves // Send the initial move if the computer starts first
  });
});

// Implement the helper function to get a random open spot
function getRandomOpenSpot(playerMoves, computerMoves) {
  const takenMoves = [...playerMoves, ...computerMoves];
  const availableMoves = Array.from({ length: 9 }, (_, i) => i).filter(
    (move) => !takenMoves.includes(move)
  );
  const randomIndex = Math.floor(Math.random() * availableMoves.length);
  return availableMoves[randomIndex];
}

// Implement the endpoint to handle a player's move  
app.post('/game/:gameId/move', async (req, res) => {
  const { gameId } = req.params;
  const move = req.body.move; // May be undefined if the computer is making the first move

  const gameState = await redisClient.hGetAll(`game:${gameId}`);
  let playerMoves = JSON.parse(gameState.playerMoves || "[]");
  let computerMoves = JSON.parse(gameState.computerMoves || "[]");
  let turn = gameState.turn;
  let gameOver = false;

  // Handle the computer's first move if undefined, which means the computer starts the game
  if (move === undefined && turn === 'computer') {
    computerMoves.push(getRandomOpenSpot(playerMoves, computerMoves));
    turn = 'player'; // Set turn to player after the computer's move
  } else if (turn === 'player' && move !== undefined && !playerMoves.includes(move) && !computerMoves.includes(move)) {
    // Handle the player's move
    playerMoves.push(move);
  } else {
    return res.status(400).json({ error: 'Not a valid move' });
  }

  // Check for a win or a draw
  let winner = checkForWin(playerMoves) ? 'player' : checkForWin(computerMoves) ? 'computer' : '';
  const draw = !winner && (playerMoves.length + computerMoves.length === 9);
  if (draw) {
    winner = 'draw';
  }
  gameOver = !!winner || draw;

  // Update the Redis store
  await redisClient.hSet(`game:${gameId}`, {
    playerMoves: JSON.stringify(playerMoves),
    computerMoves: JSON.stringify(computerMoves),
    winner: winner,
    turn: gameOver ? 'end' : 'player',
  });

  res.json({
    playerMoves,
    computerMoves,
    winner,
    gameOver,
  });
});

// Implement the function to check for a win
function checkForWin(moves) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8], // Rows
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8], // Columns
    [0, 4, 8],
    [2, 4, 6] // Diagonals
  ];

  return winningCombinations.some((combination) =>
    combination.every((position) => moves.includes(position))
  );
}

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
