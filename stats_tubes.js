'use strict';

let fivebeans = require('fivebeans');

let client = new fivebeans.client('127.0.0.1', 11300);

let tubename = 'h9EhuaQnbE6EzyyF4r6QPQ';

client.connect();

client.list_tubes(function (err, tubes) {
	console.log(tubes);

	client.stats_tube(tubename, function (err2, response) {
		console.log(response);
		process.exit();
	});
});
