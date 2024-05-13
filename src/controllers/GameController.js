const Player = require('../models/Player');
const Room = require('../models/Room');

exports.onCreateRoom =
	({ socket }) =>
	(username) => {
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
			if (err) socket.emit('error', err.message);
		}
	};

exports.onJoinRoom =
	({ io, socket }) =>
	({ username, roomID }) => {
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
			if (err) socket.emit('error', err.message);
		}
	};

exports.onPlayerMove =
	({ io, socket }) =>
	({ roomID, move }) => {
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
			const gameState = room.currentGame.checkForWin(player);

			if (gameState) {
				if (gameState === 'player wins') {
					// 3.a) If the player won, show result
					player.state.score++;

					io.to(room.id).emit('show result', {
						result: `${player.state.player1 ? 'player1' : 'player2'}`,
						winner: player.username,
					});
				}

				if (gameState === 'draw') {
					// 3.b) If there was a draw, show result and switch players
					room.switchActivePlayer();

					io.to(room.id).emit('show result', { result: 'draw' });
				}

				setTimeout(() => {
					room.startNewGame();
					io.to(room.id).emit('update game state', { game: room.currentGame });
				}, 3000);
			} else {
				// 3.c) If no result, switch the players
				room.switchActivePlayer();

				io.to(room.id).emit('update game state', { game: room.currentGame });
			}

			io.to(room.id).emit('update game state', { game: room.currentGame });
			io.to(room.id).emit('update players state', { players: room.players });
		} catch (err) {
			if (err) socket.emit('error', err.message);
		}
	};

/**
 * Handles when a player sends a message to the server
 */
exports.onPlayerMessage =
	({ io, socket }) =>
	({ roomID, message }) => {
		try {
			/**
			 * Find the room for the given roomID
			 */
			const room = Room.FindRoom(roomID);

			/**
			 * Find the player that sent the message
			 */
			const player = Player.FindPlayer(socket.id);

			/**
			 * Emit the message to all clients in the room
			 */
			io.to(room.id).emit('message', `${player.username}: ${message}`);
		} catch (err) {
			/**
			 * Handle errors and send an error message to the client
			 */
			if (err) socket.emit('error', err.message);
		}
	};

exports.onLeaveRoom =
	({ io, socket }) =>
	() => {
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
	};
