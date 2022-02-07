exports.handleUncaughtExceptions = function (err) {
	console.error(`
    *** UNCAUGHT EXCEPTION ***
        **************************
        ${err}
    `);

	process.exit(1);
};

exports.handleUnhandledRejections = function (server) {
	return (err) => {
		console.error(`
        *** UNHANDLED REJECTION ***
        ***************************
        ${err}
        `);

		server.close(() => process.exit(1));
	};
};

exports.processSIGTERM = function () {
	return (server) => {
		console.log('SIGTERM RECEIVED. Server shutting down...');
		server.close();
	};
};
