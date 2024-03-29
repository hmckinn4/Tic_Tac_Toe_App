document.getElementById('startGame').addEventListener('click', startNewGame);

function startNewGame() {
  fetch('/game', {
      method: 'POST',
  })
  .then((response) => response.json())
  .then((data) => {
      document.getElementById('startGame').style.display = 'none';
      generateGameBoard(data.gameId);
      if (data.startsFirst === 'computer') {
          // We will rely on the server to make the first move for the computer.
          makeMove(null, data.gameId);
      }
      console.log('Game started:', data);
  })
  .catch((error) => console.error('Error starting game:', error));
}

function makeMove(event, gameId) {
  // If this function was triggered by a computer starting the game, there won't be an event
  const cellIndex = event ? event.target.getAttribute('data-cell-index') : null;

  // Check if the game is already over
  const gameOver = localStorage.getItem('gameOver');
  if (gameOver === 'true') {
    return;
  }

  // For the computer's first move, we won't send a move value
  const body = cellIndex !== null ? { move: parseInt(cellIndex) } : {};

  fetch(`/game/${gameId}/move`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  .then((response) => response.json())
  .then((data) => {
    updateGameBoard(data.playerMoves, data.computerMoves);
    if (data.gameOver) {
      handleGameOver(data.winner);
    }
  })
  .catch((error) => console.error('Error making move:', error));
}

function generateGameBoard(gameId) {
  const gameBoard = document.getElementById('gameBoard');
  gameBoard.innerHTML = '';
  gameBoard.style.display = 'grid';
  gameBoard.style.gridTemplateColumns = 'repeat(3, 1fr)';
  gameBoard.style.gap = '10px';
  gameBoard.style.maxWidth = '300px';
  gameBoard.style.margin = 'auto';

  for (let i = 1; i <= 9; i++) {
    const cell = document.createElement('div');
    cell.style.border = '1px solid #000';
    cell.style.height = '100px';
    cell.style.display = 'flex';
    cell.style.alignItems = 'center';
    cell.style.justifyContent = 'center';
    cell.style.fontSize = '2em';
    cell.setAttribute('data-cell-index', i);
    cell.addEventListener('click', (event) => makeMove(event, gameId));
    gameBoard.appendChild(cell);
  }
}

function updateGameBoard(playerMoves, computerMoves) {
  console.log("Current playerMoves:", playerMoves);
  console.log("Current computerMoves:", computerMoves);

  const cells = document.querySelectorAll('#gameBoard > div');
  Array.from(cells).forEach((cell) => {
    const cellIndex = parseInt(cell.getAttribute('data-cell-index'));

    if (playerMoves && playerMoves.includes(cellIndex)) {
      cell.textContent = 'X';
    } else if (computerMoves && computerMoves.includes(cellIndex)) {
      cell.textContent = 'O';
    } else {
      cell.textContent = '';
    }
  });
}

function handleGameOver(winner) {
  const gameBoard = document.getElementById('gameBoard');
  const message = document.createElement('div');
  message.style.fontSize = '2em';
  message.style.marginTop = '20px';
  message.style.textAlign = 'center';

  if (winner === 'player') {
    message.textContent = 'You win!';
  } else if (winner === 'computer') {
    message.textContent = 'Computer wins!';
  } else {
    message.textContent = 'Draw!';
  }

  localStorage.removeItem('gameOver');
  gameBoard.appendChild(message);
  const cells = document.querySelectorAll('#gameBoard > div');
  Array.from(cells).forEach((cell) => {
    cell.removeEventListener('click', makeMove);
  });

  setTimeout(() => {
    gameBoard.innerHTML = '';
    gameBoard.style.display = 'none';
    document.getElementById('startGame').style.display = 'block';
  }, 3000);
}