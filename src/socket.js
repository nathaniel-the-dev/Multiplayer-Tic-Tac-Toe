const socketio = require('socket.io');

const Room = require('./models/Room');
const Player = require('./models/Player');

exports.initSocket = (server) => {
	const io = socketio(server);

	// Socket events
	io.on('connection', (socket) => {
		// Create room and add user
		socket.on('create room', (username) => {
			try {
				// 1) Create a room and a new player
				const room = new Room();
				const player = new Player(socket.id, username);

				// 2) Add the player to the room
				player.joinRoom(room);

				// 3) Join the SocketIO room
				socket.join(room.id);

				// 4) Send the response
				socket.emit('joined', { player });
			} catch (err) {
				socket.emit('error', err.message);
			}
		});

		// Join existing room
		socket.on('join room', ({ username, roomID }) => {
			try {
				// 1) Create a new player
				const player = new Player(socket.id, username);

				// 2) Try to add the player to the room
				const room = Room.FindRoom(roomID, true);
				player.joinRoom(room);

				// 3) Join the SocketIO room and send a "JOINED" message
				socket.join(room.id);
				socket.broadcast.to(room.id).emit('message', `${player.username} has joined`);

				// 4) Set initial player state
				if (room.players.length && room.players[0].state.player1) {
					player.state.player1 = false;
					player.state.isPlaying = false;
				}

				// 5) Send the response
				socket.emit('joined', { player });

				// 6) Check if can start game
				if (room.canStartGame()) {
					room.startNewGame();
					io.to(room.id).emit('game ready', { game: room.currentGame });
					io.to(room.id).emit('update players state', { players: room.players });
				}
			} catch (err) {
				socket.emit('error', err.message);
			}
		});

		socket.on('player move', ({ roomID, move }) => {
			try {
				// 1) Get the corresponding player and room
				const room = Room.FindRoom(roomID);
				const player = Player.FindPlayer(socket.id);

				// 2) Save the player's move
				player.saveMove(move);
				room.currentGame.saveMove(move, player.state.player1);
				io.to(room.id).emit('update board', {
					selectedTiles: room.currentGame.selectedTiles,
					currentShape: room.currentGame.currentShape,
				});

				// 3) Check if the player won
				const result = room.currentGame.checkForWin(player);

				if (!result) {
					// 3.a) If no result, switch the players
					room.switchActivePlayer();
				} else {
					if (result === 'player wins') {
						// 3.b) If the player won, show result
						player.state.score++;

						io.to(room.id).emit('show result', {
							result: `${player.state.player1 ? 'player1' : 'player2'}`,
							winner: player.username,
						});
					}

					if (result === 'draw') {
						// 3.b) If there was a draw, show result and switch players
						room.switchActivePlayer();

						io.to(room.id).emit('show result', { result: 'draw' });
					}

					room.startNewGame();
				}

				io.to(room.id).emit('update players state', { players: room.players });
				io.to(room.id).emit('update game state', { game: room.currentGame });
			} catch (error) {
				socket.emit('error', err.message);
			}
		});

		// User disconnects
		socket.on('disconnect', () => {
			try {
				const player = Player.FindPlayer(socket.id);
				if (!player) return;

				const room = Room.FindRoom(player.roomID);
				room.removePlayer(player.id);

				if (room.players.length) {
					// Start new game
					room.currentGame.startNewGame();

					// Make remaining player host
					room.players[0].state.player1 = true;
					room.players[0].state.isPlaying = true;
					room.players[0].resetPlayerScore();

					// Send data to client
					io.to(room.id).emit('player left');
					socket.broadcast.to(room.id).emit('update players state', { players: room.players });
				} else {
					Room.DeleteRoom(room.id);
				}
			} catch (err) {
				console.error(err.message);
			}
		});
	});
};
