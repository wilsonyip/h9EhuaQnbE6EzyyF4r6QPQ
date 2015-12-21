'use strict';
const fivebeans = require('fivebeans');
const parseArgs = require('minimist');
let config = require('./config');

let args = parseArgs(process.argv);
if (args.test) {
	config = config.testing;
} else {
	config = config.production;
}


let client = new fivebeans.client(config.BEANSTALKD_URL, 11300);
client.connect();

client.list_tubes(function (list_tubes_err, tubes) {
	console.log(tubes);

	client.stats_tube(config.TUBENAME, function (stats_tube_err, response) {
		console.log(response);
		client.quit();
	});
});
