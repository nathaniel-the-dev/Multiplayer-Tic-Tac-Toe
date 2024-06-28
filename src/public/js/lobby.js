document.addEventListener('alpine:init', () => {
	Alpine.data('game', () => ({}));
	Alpine.data('lobby', () => {
		return {
			// Data
			step: 1,
			action: '',
			roomInfo: {
				room_name: '',
				is_private: false,
			},
			rooms: [],

			// Methods
			next() {
				this.step = Math.min(3, this.step + 1);
			},
			back() {
				this.step = Math.max(1, this.step - 1);
				if (this.step === 1) {
					this.action = '';
				}
			},

			createRoom() {
				this.action = 'create';
				this.next();
			},
			setRoomInfo($event) {
				console.log(this.roomInfo);
			},

			joinRoom() {
				this.action = 'join';
				this.getRooms();
				this.next();
			},
			async getRooms() {
				let response = await fetch('/api/rooms');
				let data = await response.json();
				console.log(data);
			},
		};
	});
});
