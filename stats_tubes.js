'use strict';
const fivebeans = require('fivebeans');

const TUBENAME = 'wil';

let client = new fivebeans.client('challenge.aftership.net', 11300);

client.connect();

client.list_tubes(function (list_tubes_err, tubes) {
	console.log(tubes);

	client.stats_tube(TUBENAME, function (stats_tube_err, response) {
		console.log(response);
		client.quit();
	});
});
