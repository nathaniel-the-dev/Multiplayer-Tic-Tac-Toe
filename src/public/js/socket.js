// DOM Cache
const modalContainer = document.querySelector('.modal--container');

const createBtn = document.getElementById('create--game');
const joinBtn = document.getElementById('join--game');

const createForm = document.querySelector('.create--form');
const joinForm = document.querySelector('.join--form');
const error = document.getElementById('error');

const roomDataDiv = document.querySelector('#room-data');
const roomCode = document.querySelector('#room-code');
const roomCodeBtn = document.querySelector('.room-links > .btn.code');
const roomLinkBtn = document.querySelector('.room-links > .btn.link');

function showError(message) {
	error.innerText = message;
	error.ariaHidden = false;
	setTimeout(() => (error.ariaHidden = true), 2500);
}

function copyToClipboard({ target }) {
	navigator.permissions.query({ name: 'clipboard-write' }).then((result) => {
		if (result.state == 'granted' || result.state == 'prompt') {
			/* write to the clipboard now */
			navigator.clipboard.writeText(target.value);
		}
	});
}

// Show modal
modalContainer.ariaHidden = false;

// Client Socket
const socket = io();

// Socket Events
socket.on('error', showError);
socket.on('message', (msg) => console.log(msg));
socket.on('joined', ({ player }) => {
	// Show room id
	roomDataDiv.ariaHidden = false;
	roomCode.innerHTML = `Room ID: <span>${player.roomID}</span>`;

	// Set room links
	roomCodeBtn.value = player.roomID;
	roomLinkBtn.value = `${location.href}?room=${player.roomID}`;

	// Hide modal
	modalContainer.ariaHidden = true;
});

// DOM Events
createBtn.addEventListener('click', () => {
	if (createForm.classList.contains('hidden')) {
		createForm.classList.remove('hidden');
		joinForm.classList.add('hidden');
	}

	createForm.querySelector('#hostname').focus();
});

joinBtn.addEventListener('click', () => {
	if (joinForm.classList.contains('hidden')) {
		joinForm.classList.remove('hidden');
		createForm.classList.add('hidden');
	}

	joinForm.querySelector('#playername').focus();
});

createForm.addEventListener('submit', (e) => {
	e.preventDefault();

	// Get data
	const { hostname } = Object.fromEntries(new FormData(e.target));

	// Create and join room
	socket.emit('create room', hostname);

	// Reset input field
	createForm.querySelector('input').value = '';
});

joinForm.addEventListener('submit', (e) => {
	e.preventDefault();

	// Get data
	const { playername, roomID } = Object.fromEntries(new FormData(e.target));

	// Try to join existing room
	socket.emit('join room', { username: playername, roomID });

	// Reset input field
	joinForm.querySelectorAll('input').forEach((i) => (i.value = ''));
});

[roomCodeBtn, roomLinkBtn].forEach((btn) => btn.addEventListener('click', copyToClipboard));

// Attempt to join room if 'RoomID' is present
const query = new URLSearchParams(location.search);
if (query.has('room')) {
	const roomID = query.get('room');

	joinForm.classList.remove('hidden');

	joinForm.querySelector('#playername').focus();
	joinForm.querySelector('#roomID').value = roomID;
}