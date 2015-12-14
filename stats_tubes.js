'use strict';

let fivebeans = require('fivebeans');

// let client = new fivebeans.client('127.0.0.1', 11300);
let client = new fivebeans.client('challenge.aftership.net', 11300);

let tubename = 'h9EhuaQnbE6EzyyF4r6QPQ';

client.connect();

client.list_tubes(function (listTubesErr, tubes) {
	console.log(tubes);

	client.stats(tubename, function (statsTubeErr, response) {
		console.log(response);
		process.exit();
	});
});
