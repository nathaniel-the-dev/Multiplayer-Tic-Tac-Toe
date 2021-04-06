// DOM Cache
const modalContainer = document.querySelector('.modal--container');

const createBtn = document.getElementById('create--game');
const joinBtn = document.getElementById('join--game');

const createForm = document.querySelector('.create--form');
const joinForm = document.querySelector('.join--form');

const roomIDSpan = document.getElementById('room__id').querySelector('span');

createForm.classList.add('hidden');
joinForm.classList.add('hidden');

function showError(message) {
	const error = document.getElementById('error');

	error.innerText = message;

	error.classList.add('show');
	error.classList.remove('hide');

	setTimeout(() => {
		error.classList.remove('show');
		error.classList.add('hide');
	}, 2000);
}

// Client Socket
const socket = io();

// Socket Events
socket.on('error', showError);
socket.on('message', (msg) => console.log(msg));
socket.on('joined', (user) => {
	// Show room id
	roomIDSpan.textContent = user.roomID;

	// Hide modal
	modalContainer.style.display = 'none';
});

// DOM Events
createBtn.addEventListener('click', () => {
	if (createForm.classList.contains('hidden')) {
		createForm.classList.remove('hidden');
		joinForm.classList.add('hidden');
	}
});

joinBtn.addEventListener('click', () => {
	if (joinForm.classList.contains('hidden')) {
		joinForm.classList.remove('hidden');
		createForm.classList.add('hidden');
	}
});

createForm.addEventListener('submit', (e) => {
	e.preventDefault();

	// Get data
	const username = createForm.querySelector('input').value;

	// Create and join room
	socket.emit('create room', username);

	// Reset input field
	createForm.querySelector('input').value = '';
});

joinForm.addEventListener('submit', (e) => {
	e.preventDefault();

	// Get data
	const data = [];
	joinForm.querySelectorAll('input').forEach((i) => data.push(i.value));

	// Try to join existing room
	socket.emit('join room', data);

	// Reset input field
	joinForm.querySelectorAll('input').forEach((i) => (i.value = ''));
});
