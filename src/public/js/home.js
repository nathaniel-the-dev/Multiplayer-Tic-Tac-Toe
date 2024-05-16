const socket = io();

// DOM Cache
const openCreateModalBtn = document.getElementById('modal__button--create');
const openJoinModalBtn = document.getElementById('modal__button--join');

const createModal = document.getElementById('modal--create');
const joinModal = document.getElementById('modal--join');

// Listen for socket events
socket.on('error', (message) => {
	console.error(message);
});

// Setup event listeners
openCreateModalBtn?.addEventListener('click', () => {
	createModal.showModal();
	joinModal.close();
});
openJoinModalBtn?.addEventListener('click', () => {
	createModal.close();
	joinModal.showModal();
});

createModal?.addEventListener('close', (e) => {
	// Get reason for closing
	// If closed by form submit, create a new room
	// Navigate to new game
});

joinModal?.addEventListener('close', (e) => {
	// Get reason for closing
	// If closed by form submit, create a new room
	// Navigate to new game
});
