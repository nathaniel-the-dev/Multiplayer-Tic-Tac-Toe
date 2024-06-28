const { Router } = require('express');
const router = Router();

router.get('/rooms', (req, res) => {
	// Get all (public) rooms

	return res.json({
		rooms: [
			{
				id: '123',
				name: 'Room 1',
				num_of_players: 1,
			},
		],
	});
});

module.exports = router;
