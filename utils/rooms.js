const uuid = require('uuid');
const rooms = [];
const maxUsers = 2;

module.exports.createRoom = function () {
	// Generate room id
	let id = uuid.v4().slice(0, 7);

	while (rooms.some((r) => r.id === id)) id = uuid.v4().slice(0, 7);

	const room = {
		id,
		users: [],
	};

	rooms.push(room);

	return room;
};

module.exports.createUser = function (username, id) {
	return {
		id,
		username,
		state: {
			player1: true,
			isPlaying: true,
			score: 0,
			picks: [],
		},
	};
};

module.exports.joinRoom = function (roomID, user) {
	const room = rooms.find((r) => r.id === roomID);

	if (!room) throw new Error('Room does not exist');
	if (room.users.length >= maxUsers) throw new Error('Room is full');

	if (room.users.length) {
		user.state.isPlaying = room.users[0].state.isPlaying ? false : true;
		user.state.player1 = room.users[0].state.player1 ? false : true;
	}

	user.roomID = room.id;

	room.users.push(user);

	return room;
};

module.exports.getRoom = function (roomid) {
	return rooms.find((r) => r.id === roomid);
};

module.exports.removeUser = function (userid) {
	const [userData] = rooms.map((room) => {
		const user = room.users.find((u) => u.id === userid);
		if (user) return user;
	});

	if (!userData) return;

	const room = rooms.find((r) => r.id === userData.roomID);
	const index = room.users.findIndex((u) => u.id === userData.id);

	room.users.splice(index, 1)[0];

	if (!room.users.length) {
		rooms.splice(rooms.indexOf(room), 1);
	}

	return room;
};
