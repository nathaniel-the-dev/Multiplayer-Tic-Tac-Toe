class Game {
	#winningConditions = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];

	currentShape;
	turns;
	selectedTiles;
	isPlaying;
	playerWins;

	/**
	 * Initializes a new instance of the class.
	 *
	 * @constructor
	 */
	constructor() {
		this.startNewGame();
	}

	/**
	 * Resets the game state and starts a new game.
	 *
	 * @param {none}
	 * @return {none}
	 */
	startNewGame() {
		this.turns = 0;
		this.selectedTiles = [];

		this.isPlaying = true;
		this.playerWins = false;
	}

	/**
	 * Save a move in the game.
	 *
	 * @param {any} move - The move to be saved.
	 * @param {boolean} isPlayer1 - Indicates whether the move is made by player 1.
	 */
	saveMove(move, isPlayer1) {
		this.turns++;
		this.selectedTiles.push(move);
		this.currentShape = isPlayer1 ? 'x' : 'o';
	}

	/**
	 * Checks if the current player has won the game or if it's a draw.
	 *
	 * @param {Player} currentPlayer - The current player who made the move.
	 * @return {string|boolean} The status of the game: "player wins", "draw", or false.
	 */
	checkForWin(currentPlayer) {
		let status = false;

		// Check for player win
		if (this.turns >= 5) {
			this.#winningConditions.forEach((condition) => {
				if (!this.playerWins && condition.every((pick) => currentPlayer.state.picks.includes(pick))) {
					this.isPlaying = false;
					this.playerWins = true;

					status = 'player wins';
				}
			});
		}

		// Check for draw
		if (this.turns >= 9 && this.isPlaying) {
			this.isPlaying = false;
			this.playerWins = true;

			status = 'draw';
		}

		// Else, continue game
		return status;
	}
}

module.exports = Game;
