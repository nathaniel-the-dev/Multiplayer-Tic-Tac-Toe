// DOM Cache
const player1Score = document.getElementById('player1');
const player2Score = document.getElementById('player2');
const announcement = document.querySelector('.announcement');
const waitMessage = document.querySelector('.wait--message');

const board = document.querySelector('.board');
const tiles = document.querySelectorAll('.tile');

function startNewGame() {
	tiles.forEach((tile) => {
		tile.disabled = false;
		tile.textContent = '';
	});
}

// Game Objects
let player,
	game = {};

// Socket Events
socket.on('joined', (payload) => {
	player = payload.player;

	if (!game.isPlaying) waitMessage.textContent = 'Waiting for other player...';
});

socket.on('game ready', (payload) => {
	// Set initial game state
	game = payload.game;

	// Start game
	startNewGame();

	// Update UI
	board.dataset.showBoard = true;
	waitMessage.textContent = '';
});

socket.on('update board', (payload) => {
	payload.selectedTiles?.forEach((item) => {
		const tile = document.querySelector(`.tile[value="${item}"]`);

		if (!tile.disabled) tile.textContent = payload.currentShape;
		tile.disabled = true;
	});
});

socket.on('update game state', (payload) => {
	game = payload.game;
});

socket.on('update players state', (payload) => {
	const currentPlayer = payload.players.find((p) => p.id === player.id);
	currentPlayer && (player = currentPlayer);

	// Update scores
	payload.players.forEach((player) => {
		if (player.state.player1) {
			player1Score.classList.toggle('current', player.state.isPlaying);

			player1Score.querySelector('span[aria-label="player name"]').innerText = player.username;
			player1Score.querySelector('span[aria-label="score number"]').innerText = player.state.score;
		} else {
			player2Score.querySelector('span[aria-label="player name"]').innerText = player.username;
			player2Score.querySelector('span[aria-label="score number"]').innerText = player.state.score;

			player2Score.classList.toggle('current', player.state.isPlaying);
		}
	});
});

socket.on('show result', (payload) => {
	const message = payload.winner ? `${payload.winner} Wins!` : 'Draw!';
	announcement.className = `announcement ${payload.result}`;

	announcement.textContent = message;
	announcement.ariaHidden = false;

	setTimeout(() => {
		announcement.ariaHidden = true;
		announcement.textContent = '';

		startNewGame();
	}, 3000);
});

socket.on('player left', () => {
	console.log('A player left the game');

	// Reset game values
	startNewGame();

	// Reset UI
	board.dataset.showBoard = false;
	waitMessage.textContent = 'Waiting for other player...';
	player1Score.querySelector('span[aria-label="player name"]').innerText = 'Player 1';
	player2Score.querySelector('span[aria-label="player name"]').innerText = 'Player 2';
});

// Handle game events
tiles.forEach((tile) =>
	tile.addEventListener('click', (e) => {
		if (player.state?.isPlaying && game.isPlaying)
			socket.emit('player move', { roomID: player.roomID, move: +e.target.value });
	})
);
