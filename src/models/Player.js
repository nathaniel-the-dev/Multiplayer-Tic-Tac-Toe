class Player {
	id;
	username;
	roomID;
	state;

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
