// Imports
const http = require('http');
const path = require('path');

const { initSocket } = require('./socket');
const errorController = require('./controllers/ErrorController');

const express = require('express');

// Catching global errors (Part 1)
process.on('uncaughtException', errorController.handleUncaughtExceptions);

// Create and link server
const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

// Intialize Socket.IO
initSocket(server);

// Serve static files
app.use(express.static(path.resolve(__dirname, 'public')));

// Start server
server.listen(port, () => console.log(`Server running at http://localhost:${port}...`));

// Catching global errors (Part 2)
process.on('unhandledRejection', errorController.handleUnhandledRejections(server));
process.on('SIGTERM', errorController.processSIGTERM(server));
