const uuid = require('uuid');

const Game = require('./Game');
const Player = require('./Player');

class Room {
	// Local
	/** Room ID
	 * @type {string}
	 */
	#roomID;

	/**
	 * Players in the room
	 * @type {Player[]}
	 */
	players;

	/** Current game
	 * @type {Game}
	 */
	currentGame;

	/**
	 * Chat messages
	 * @type {{senderId: string, message: string, createdAt: Date}[]}
	 *
	 */
	chat = [];

	get id() {
		return this.#roomID;
	}

	/**
	 * Constructor function for creating a new Room object.
	 *
	 * @constructor
	 */
	constructor() {
		// Sets a unique room ID
		do this.#roomID = uuid.v4().slice(0, 7);
		while (Room.ROOMS[this.id]);

		// Initialize players
		this.players = [];

		// Add current room to global rooms
		Room.ROOMS[this.#roomID] = this;
	}

	/**
	 * Determines whether the game can begin or not
	 * @returns {boolean}
	 */
	canStartGame() {
		return this.players.length === Room.#MAX_USERS;
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
	static ROOMS = {};
	static #MAX_USERS = 2;

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
		const room = Room.ROOMS[roomID];

		if (!room) throw new Error('Room does not exist');
		if ((room.players.length >= Room.#MAX_USERS) & isJoining) throw new Error('Room is full');

		return room;
	}

	/**
	 * Removes the room from array
	 * @param {string} roomID - The id of the room to delete
	 */
	static DeleteRoom(roomID) {
		if (Room.ROOMS[roomID]) delete Room.ROOMS[roomID];
	}
}

module.exports = Room;
