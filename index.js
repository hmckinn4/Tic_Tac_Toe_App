// index.js

// Import the required modules
const express = require('express');
const redis = require('redis');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

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

// Define the scores for minimax evaluation
const scores = {
  player: -10,
  computer: 10,
  tie: 0,
};

// Helper function to check for a win
function checkForWin(moves) {
  const winningCombinations = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  return winningCombinations.some(combination => 
    combination.every(index => moves.includes(index))
  );
}
function minimax(board, depth, isMaximizingPlayer) {
  // Check if there is a winner or it's a tie
  if (checkForWin(board, 'X')) return -10 + depth;
  if (checkForWin(board, 'O')) return 10 - depth;
  if (isBoardFull(board)) return 0;

  if (isMaximizingPlayer) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      // Is the spot available?
      if (board[i] === '') {
        board[i] = 'O'; // O is the maximizing player (computer)
        let score = minimax(board, depth + 1, false);
        board[i] = '';
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      // Is the spot available?
      if (board[i] === '') {
        board[i] = 'X'; // X is the minimizing player (human)
        let score = minimax(board, depth + 1, true);
        board[i] = '';
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function isBoardFull(board) {
  return board.every(cell => cell !== '');
}


// Endpoint to start a new game
app.post('/game', async (req, res) => {
  const gameId = uuidv4();
  const player = 'X'; // Assuming player is always 'X'
  const computer = 'O'; // Assuming computer is always 'O'
  const board = Array(9).fill('');

  // Decide who starts first
  let turn = Math.random() < 0.5 ? 'player' : 'computer';

  if (turn === 'computer') {
    // Computer makes its move
    const move = bestMove(board);
    board[move] = computer;
    turn = 'player'; // Switch turn to player
  }

  // Save initial game state to Redis
  await redisClient.hSet(`game:${gameId}`, {
    board: JSON.stringify(board),
    player,
    computer,
    turn,
    winner: '',
  });

  res.json({ gameId, board, player, computer, turn });
});

// Function to find the best move
function bestMove(board) {
  let bestScore = -Infinity;
  let move;
  for (let i = 0; i < board.length; i++) {
    if (board[i] === '') {
      board[i] = 'computer';
      let score = minimax(board, 0, false);
      board[i] = '';
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

// Check who has won
function checkWin(board) {
  let winner = null;
  if (checkForWin(board, 'X')) {
    winner = 'player';
  } else if (checkForWin(board, 'O')) {
    winner = 'computer';
  } else if (board.every(spot => spot !== '')) {
    winner = 'tie';
  }
  return winner;
}

// Endpoint to handle a player's move
app.post('/game/:gameId/move', async (req, res) => {
  const { gameId } = req.params;
  const { move } = req.body; // This is the index of the move from 0 to 8

  const gameData = await redisClient.hGetAll(`game:${gameId}`);
  const board = JSON.parse(gameData.board);
  const player = gameData.player;
  const computer = gameData.computer;
  let turn = gameData.turn;

  // Player's move
  if (turn === 'player' && board[move] === '') {
    board[move] = player;
    turn = 'computer';
  } else {
    return res.status(400).json({ error: 'Spot is already taken or invalid' });
  }

  // Check for win or tie
  let winner = checkWin(board);
  if (winner) {
    turn = 'end';
  } else {
    // Computer's move
    const computerMove = bestMove(board);
    board[computerMove] = computer;
    turn = 'player';
    winner = checkWin(board);
    if (winner) {
      turn = 'end';
    }
  }

  // Save updated game state to Redis
  await redisClient.hSet(`game:${gameId}`, {
    board: JSON.stringify(board),
    turn,
    winner: winner || '',
  });

  res.json({ board, turn, winner });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
