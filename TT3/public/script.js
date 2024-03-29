// public/script.js
const socket = io();

const game = document.getElementById('game');
const currentPlayer = 'X'; // This could be dynamic or chosen by the player

for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.addEventListener('click', () => makeMove(i, currentPlayer));
    game.appendChild(cell);
}

function makeMove(index, player) {
    socket.emit('moveMade', { cell: index.toString(), player: player });
}

socket.on('moveMade', (data) => {
    const cells = document.querySelectorAll('.cell');
    cells[data.cell].innerText = data.player;
});
