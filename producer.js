'use strict';
let fivebeans	= require('fivebeans');

const tubename	= 'h9EhuaQnbE6EzyyF4r6QPQ';

// fivebeans client setup
let client = new fivebeans.client('localhost', 11300);
client.connect();

// get arguments from CLI
let numJobs	= process.argv[2];
let currFrom	= process.argv[3];
let currTo	= process.argv[4];
if (numJobs === undefined) {
	numJobs = 10;
}
if (currFrom === undefined) {
	currFrom = 'HKD';
}
if (currTo === undefined) {
	currTo = 'USD';
}


for (let i = 0; i < numJobs; i++) {
	let payload = {from: currFrom, to: currTo};
	client.use(tubename, function (clientUseErr, name) {
		client.put(0, 0, 1, JSON.stringify(payload), function (clientPutErr, jobId) {
			if (clientPutErr) throw clientPutErr;
			console.log('InjectedJobId: ' + jobId + ' | Payload: ' + JSON.stringify(payload));
		});
	});
}
