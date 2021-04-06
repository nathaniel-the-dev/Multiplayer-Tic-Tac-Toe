const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const { createRoom, joinRoom, createUser, removeUser, getRoom } = require('./utils/rooms');

// Create and link server
const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Variables
const port = process.env.PORT || 3000;

// Serve static files
app.use(express.static(`${__dirname}/public`));

// Socket events
io.on('connection', (socket) => {
	// Create room and add user
	socket.on('create room', (username) => {
		try {
			const room = createRoom();
			const user = createUser(username, socket.id);

			joinRoom(room.id, user);
			socket.join(room.id);

			socket.emit('joined', user);
		} catch (err) {
			socket.emit('error', err.message);
		}
	});

	// Join existing room
	socket.on('join room', ([username, id]) => {
		try {
			const user = createUser(username, socket.id);
			const room = joinRoom(id, user);

			socket.join(room.id);

			socket.broadcast.to(room.id).emit('message', `${user.username} has joined`);
			socket.emit('joined', user);
		} catch (err) {
			socket.emit('error', err.message);
		}
	});

	// Start game
	socket.on('checkForStart', (user) => {
		const room = getRoom(user.roomID);
		io.to(room.id).emit('new game', room.users);
	});

	// Update games
	socket.on('update', (gameState, reset = false) => {
		io.to(gameState.room).emit('updateAll', gameState, reset);
	});

	// Player selects box
	socket.on('box selected', (boxInfo, room) => {
		io.to(room).emit('draw shape', boxInfo);
	});

	// Match result
	socket.on('result', (result, room) => {
		io.to(room).emit('show result', result);
	});

	// User disconnects
	socket.on('disconnect', () => {
		const removedFrom = removeUser(socket.id);

		if (!removedFrom) return;

		io.to(removedFrom.id).emit('new game', removedFrom.users);
	});
});

// Start server
server.listen(port, () => console.log(`Server running at http://localhost:${port}...`));
