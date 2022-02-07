const uuid = require('uuid');

const Game = require('./Game');

class Room {
	// Local properties
	#roomID;
	players;

	currentGame;

	get id() {
		return this.#roomID;
	}

	constructor() {
		// Set room ID
		do this.#roomID = uuid.v4().slice(0, 7);
		while (Room.ROOMS.some((r) => r.id === this.#roomID));

		// Initialize players
		this.players = [];

		// Add current room to global rooms
		Room.ROOMS.push(this);
	}

	/**
	 * Determines whether the game can begin or not
	 * @returns {boolean}
	 */
	canStartGame() {
		return this.players.length === Room.#MaxUsers;
	}

	/** Start a new game */
	startNewGame() {
		this.currentGame = new Game();
		this.resetPlayerPicks();
	}

	resetPlayerPicks() {
		this.players.forEach((player) => (player.state.picks = []));
	}

	switchActivePlayer() {
		this.players.forEach((player) => (player.state.isPlaying = !player.state.isPlaying));
	}

	/**
	 * Removes the the player from the room
	 * @param {string} playerID - The id of the player to remove
	 */
	removePlayer(playerID) {
		const index = this.players.findIndex((p) => p.id === playerID);
		index > -1 && this.players.splice(index, 1);
	}

	// Static properties
	static ROOMS = [];
	static #MaxUsers = 2;

	/**
	 * Attempts to find a room by the given ID
	 * @param {string} roomID - The id of the room to find
	 * @param {boolean} [isJoining=false] - Whether the player is attempting to join the room or not
	 *
	 * @throws Will throw an error if the room does not exist
	 * @throws Will throw an error if the room is full
	 *
	 * @returns {Room} The room object
	 */
	static FindRoom(roomID, isJoining = false) {
		const room = Room.ROOMS.find((r) => r.id === roomID);

		if (!room) throw new Error('Room does not exist');
		if ((room.players.length >= Room.#MaxUsers) & isJoining) throw new Error('Room is full');

		return room;
	}

	/**
	 * Removes the room from array
	 * @param {string} roomID - The id of the room to delete
	 */
	static DeleteRoom(roomID) {
		const index = Room.ROOMS.findIndex((r) => r.id === roomID);
		index > -1 && Room.ROOMS.splice(index, 1);
	}
}

module.exports = Room;
