'use strict';
const fivebeans	= require('fivebeans');
const config = require('./config').testing;
const job_info = require('./config').job_info;

let client = new fivebeans.client(config.BEANSTALKD_URL, 11300);
client.connect();

// get arguments from CLI
let num_jobs	= parseInt(process.argv[2], 10) || 1;
let curr_from	= process.argv[3] || 'HKD';
let curr_to	= process.argv[4] || 'USD';
let count = 0;

for (let i = 0; i < num_jobs; i++) {
	let payload = {from: curr_from, to: curr_to};
	client.use(config.TUBENAME, function (client_use_err, name) {
		client.put(job_info.priority, job_info.no_delay, job_info.ttr, JSON.stringify(payload), function (client_put_err, jobId) {
			if (client_put_err) throw client_put_err;
			console.log('Inserted JobId: ' + jobId + ', Payload: ' + JSON.stringify(payload));
			count++;
			if (count === num_jobs) {
				client.quit();
			}
		});
	});
}
