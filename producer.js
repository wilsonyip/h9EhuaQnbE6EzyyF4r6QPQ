'use strict';
const fivebeans	= require('fivebeans');

const TUBENAME	= 'wil';

// fivebeans client setup
let client = new fivebeans.client('challenge.aftership.net', 11300);
client.connect();

// get arguments from CLI
let num_jobs	= parseInt(process.argv[2], 10) || 1;
let curr_from	= process.argv[3] || 'HKD';
let curr_to	= process.argv[4] || 'USD';
let count = 0;

for (let i = 0; i < num_jobs; i++) {
	let payload = {from: curr_from, to: curr_to};
	client.use(TUBENAME, function (client_use_err, name) {
		client.put(0, 0, 60, JSON.stringify(payload), function (client_put_err, jobId) {
			if (client_put_err) throw client_put_err;
			console.log('Inserted JobId: ' + jobId + ', Payload: ' + JSON.stringify(payload));
			count++;
			if (count === num_jobs) {
				client.quit();
			}
		});
	});
}
