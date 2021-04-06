// DOM Cache
const player1Score = document.getElementById('player1');
const player2Score = document.getElementById('player2');
const announcement = document.querySelector('.message');
const waitMessage = document.querySelector('.wait--message');

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions
canvas.width = screen.width / 2;
canvas.height = screen.height / 1.5;
announcement.classList.add('hidden');

// Game Objects
let current;

let game = {
	players: [],
	boxes: [],
	turns: 0,
	room: '',

	_isPlaying: true,
	_playerWins: false,
};

const winningConditions = [
	[0, 1, 2],
	[3, 4, 5],
	[6, 7, 8],
	[0, 3, 6],
	[1, 4, 7],
	[2, 5, 8],
	[0, 4, 8],
	[2, 4, 6],
];

// Socket Events
socket.on('joined', (user) => {
	// Checks for full room
	socket.emit('checkForStart', user);
});

socket.on('new game', (users) => {
	// Get users
	game.players = users;

	// Check for all users
	if (users.length !== 2) {
		game._isPlaying = false;
		waitMessage.style.opacity = 1;
		waitMessage.textContent = 'Waiting for other player...';
		return;
	}

	// Create player
	current = users.findIndex((u) => u.id === socket.id);

	// Start game
	waitMessage.style.opacity = 0;
	newGame(true);
});

socket.on('updateAll', (gameState, reset) => {
	// Sync games
	game = gameState;

	// Update UI
	update(reset);
});

socket.on('draw shape', drawPlayerShape);

socket.on('show result', showResult);

// Utility Functions
function wait(sec) {
	return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

function update(reset = false) {
	// Set scores
	if (reset) game.players.forEach((p) => (p.state.score = 0));

	player1Score.innerHTML = `${game.players[0].username} <span>${game.players[0].state.score}</span>`;
	player2Score.innerHTML = `${game.players[1].username} <span>${game.players[1].state.score}</span>`;
	player1Score.classList.toggle('current', game.players[0].state.isPlaying);
	player2Score.classList.toggle('current', game.players[1].state.isPlaying);

	// Set announcement
	announcement.classList.add('hidden');
	announcement.classList.remove('player1');
	announcement.classList.remove('player2');
	announcement.classList.remove('draw');
}

async function showResult(res) {
	const result = res === 'draw' ? 'draw' : res.state.player1 ? 'player1' : 'player2';

	if (result === 'draw') {
		announcement.textContent = 'Draw!';
	} else {
		let winner;

		if (result === 'player1') {
			winner = game.players.find((p) => p.state.player1);
			winner.state.score++;
		} else {
			winner = game.players.find((p) => !p.state.player1);
			winner.state.score++;
		}

		announcement.textContent = `${winner.username} Wins!`;
	}

	announcement.classList.remove('hidden');
	announcement.classList.add(result);

	await wait(4);
	announcement.classList.add('hidden');
	announcement.classList.remove(result);

	newGame();
}

// Game Functions
function drawGrid() {
	ctx.fillStyle = 'rgb(30, 30, 30)';

	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			// Draw spaces
			ctx.fillRect(i * (canvas.width / 3 + 5), j * (canvas.height / 3 + 5), canvas.width / 3, canvas.height / 3);
			// Define boxes
			game.boxes.push([j, i, false]);
		}
	}
}

function selectBox(e) {
	// Check if game is being played
	if (!game._isPlaying) return;

	// Ckeck if it is the current player's turn
	if (!game.players[current].state.isPlaying) return;

	// Get mouse coords
	const mouseCoords = [Math.floor(e.layerX / (canvas.width / 3)), Math.floor(e.layerY / (canvas.height / 3))];

	// Get the selected box
	let boxInfo = game.boxes.find((box) => box[0] === mouseCoords[0] && box[1] === mouseCoords[1]);
	let boxIndex = game.boxes.findIndex((box) => box[0] === mouseCoords[0] && box[1] === mouseCoords[1]);
	if (boxInfo[2]) return;

	// Set box as selected
	boxInfo[2] = true;
	boxInfo[3] = game.players[current].state.player1 ? 'x' : 'o';

	game.players[current].state.picks.push(boxIndex);
	game.players[current].state.picks.sort((a, b) => a - b);

	game.turns = game.players[0].state.picks.length + game.players[1].state.picks.length;

	// Draw player shape
	socket.emit('box selected', boxInfo, game.room);
}

function drawPlayerShape(boxInfo) {
	// Define shape dimensions
	const shapeSize = 50;
	const boxCenterCoords = [(canvas.width / 3) * boxInfo[0] + canvas.width / 6, (canvas.height / 3) * boxInfo[1] + canvas.height / 6];

	// Draw x (player 1)
	if (boxInfo[3] === 'x') {
		ctx.strokeStyle = '#0090eb';
		ctx.lineCap = 'round';
		ctx.lineWidth = 7.5;

		ctx.beginPath();
		ctx.moveTo(boxCenterCoords[0] - shapeSize, boxCenterCoords[1] - shapeSize);
		ctx.lineTo(boxCenterCoords[0] + shapeSize, boxCenterCoords[1] + shapeSize);
		ctx.moveTo(boxCenterCoords[0] - shapeSize, boxCenterCoords[1] + shapeSize);
		ctx.lineTo(boxCenterCoords[0] + shapeSize, boxCenterCoords[1] - shapeSize);
		ctx.stroke();
	}

	// Draw circle (player 2)
	if (boxInfo[3] === 'o') {
		ctx.strokeStyle = '#eb1a01';
		ctx.lineWidth = 7.5;

		ctx.beginPath();
		ctx.arc(boxCenterCoords[0], boxCenterCoords[1], shapeSize, 0, Math.PI * 2);
		ctx.stroke();
	}

	// Check for win
	if (game.players[current].state.isPlaying) checkForWin();
}

function checkForWin() {
	// Check for player win
	if (game.turns >= 5) {
		winningConditions.forEach((condition) => {
			if (condition.every((pick) => game.players[current].state.picks.includes(pick)) && !game._playerWins) {
				game._isPlaying = false;
				game._playerWins = true;
				socket.emit('result', game.players[current], game.room);
			}
		});
		if (!game._isPlaying) return;
	}

	// Check for draw
	if (game.turns === 9 && game._isPlaying) {
		game._isPlaying = false;
		game._playerWins = true;
		return socket.emit('result', 'draw', game.room);
	}

	// Otherwise, change player
	game.players[0].state.isPlaying = !game.players[0].state.isPlaying;
	game.players[1].state.isPlaying = !game.players[1].state.isPlaying;

	// Sync games
	socket.emit('update', game);
}

function newGame(reset = false) {
	// Clear board
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	// Reset game variables
	game._isPlaying = true;
	game._playerWins = false;
	game.players[0].state.player1 = true;
	game.players[1].state.player1 = false;
	game.players[0].state.isPlaying = true;
	game.players[1].state.isPlaying = false;
	game.players[current].state.picks = [];
	game.boxes = [];
	game.turns = 0;
	game.room = game.players[current].roomID;

	// Draw grid and reset boxes
	drawGrid();

	// Sync games
	socket.emit('update', game, reset);
}

// Event Handlers
canvas.addEventListener('click', selectBox);
