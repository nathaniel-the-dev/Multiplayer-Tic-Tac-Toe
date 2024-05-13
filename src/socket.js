const socketIO = require('socket.io');

const GameController = require('./controllers/GameController');

exports.initSocket = (server) => {
	const io = socketIO(server);

	// Socket events
	io.on('connection', (socket) => {
		// Create room and add user
		socket.on('create-room', GameController.onCreateRoom({ socket }));

		// Join existing room
		socket.on('join-room', GameController.onJoinRoom({ socket, io }));

		// When a player make a move
		socket.on('player-move', GameController.onPlayerMove({ socket, io }));

		// When a player sends a message
		socket.on('message', GameController.onPlayerMessage({ socket, io }));

		// User disconnects
		socket.on('disconnect', GameController.onLeaveRoom({ socket, io }));
	});
};
