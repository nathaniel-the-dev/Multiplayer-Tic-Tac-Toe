const socket = io();

// DOM Cache
const openCreateModalBtn = document.getElementById('button-modal_create');
const openJoinModalBtn = document.getElementById('button-modal_join');

const createModal = document.getElementById('modal_create');
const joinModal = document.getElementById('modal_join');

// Listen for socket events
socket.on('error', (message) => {
	console.error(message);
});

// Setup event listeners
openCreateModalBtn.addEventListener('click', () => {
	createModal.showModal();
	joinModal.close();
});
openJoinModalBtn.addEventListener('click', () => {
	createModal.close();
	joinModal.showModal();
});

createModal.addEventListener('close', (e) => {
	// Get reason for closing
	// If closed by form submit, create a new room
	// Navigate to new game
});

joinModal.addEventListener('close', (e) => {
	// Get reason for closing
	// If closed by form submit, create a new room
	// Navigate to new game
});