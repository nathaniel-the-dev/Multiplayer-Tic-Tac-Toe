// Imports
const path = require('path');

const socket = require('./socket');
const errorController = require('./controllers/ErrorController');

const express = require('express');

// Catching global errors
process.on('uncaughtException', errorController.handleUncaughtExceptions);

// Create server
const app = express();
const port = process.env.PORT || 3000;

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.resolve(__dirname, 'views'));

// Serve static files
app.use(express.static(path.resolve(__dirname, 'public')));

// Routes
app.use('/api', require('./routes/api'));

app.get('/', (_, res) => res.render('index'));
app.all('*', (_, res) => res.status(301).redirect('/'));

// Start server
const server = app.listen(port, () => console.log(`Server running at http://localhost:${port}...`));
socket.initialize(server);

// Catching more global errors
process.on('unhandledRejection', errorController.handleUnhandledRejections(server));
process.on('SIGTERM', errorController.processSIGTERM(server));
