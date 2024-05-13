class Player {
	/**
	 * The ID of the player
	 * @type {string}
	 */
	id;

	/**
	 * The name of the player
	 * @type {string}
	 */
	username;

	/**
	 * The ID of the room the player is in
	 * @type {string}
	 */
	roomID;

	/**
	 * The player's state
	 * @type {{player1: boolean, isPlaying: boolean, score: number, picks: string[]}}
	 */
	state;

	/**
	 * Constructs a new instance of the Player class.
	 *
	 * @param {type} playerId - the ID of the player
	 * @param {type} username - the username of the player
	 */
	constructor(playerId, username) {
		this.id = playerId;
		this.username = username;

		this.state = {
			player1: true,
			isPlaying: true,
			score: 0,
			picks: [],
		};

		Player.#PLAYERS.push(this);
	}

	joinRoom(room) {
		this.roomID = room.id;
		room.players.push(this);
	}

	saveMove(move) {
		this.state.picks.push(move);
	}

	resetPlayerScore() {
		this.state.score = 0;
		this.state.picks = [];
	}

	// Static properties
	/**
	 * Collection of all players
	 * @type { Player[] }
	 * */
	static #PLAYERS = [];

	/**
	 * Attempts to find a player by the given ID
	 * @param {string} playerID - The id of the player to find
	 *
	 * @returns {Player?} The player object
	 */
	static FindPlayer(playerID) {
		const player = Player.#PLAYERS.find((player) => player.id === playerID);
		return player ? player : null;
	}
}

module.exports = Player;
