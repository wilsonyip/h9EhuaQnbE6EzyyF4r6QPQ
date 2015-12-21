'use strict';
const fivebeans		= require('fivebeans');
const Promise		= require('bluebird');
const request		= require('request');
const co		= require('co');
const parseArgs		= require('minimist');
const getCurrency	= require('./getCurrency');
const saveToMongo	= require('./saveToMongo');
let config		= require('./config');
const job_info		= require('./config').job_info;

let args = parseArgs(process.argv);
console.log(args);
if (args.test) {
	config = config.testing;
} else {
	config = config.production;
}

// Promisify modules
Promise.promisifyAll(fivebeans, {multiArgs: true});
Promise.promisifyAll(request, {multiArgs: true});

// fivebeans client connection setup and main flow
let client = new fivebeans.client(config.BEANSTALKD_URL, 11300);
client
.on('connect', function () {
	getJob();
}).on('error', function (err) {
	// connection failure
}).on('close', function () {
	// underlying connection has closed
}).connect();


/**
 * get and process job
 * @function getJob
 */
function getJob() {
	co(function* () {
		console.log('---------------------------------------------------------------------------------');
		// watch a tube
		yield client.watchAsync(config.TUBENAME);
		console.log('Watching tube: ' + config.TUBENAME);
		// reserve a job
		let job = yield client.reserveAsync();
		let job_id 	= job[0];
		let payload 	= JSON.parse(job[1]);
		let curr_from 	= payload.from;
		let curr_to 	= payload.to;
		console.log('Reserved a job. JobId: ' + job_id);

		// destroy a job
		yield client.destroyAsync(job_id);
		console.log('Destroyed a job. JobId: ' + job_id);

		// get currency rate
		let rate = yield getCurrency(job_id, curr_from, curr_to, config);
		console.log('Get currency rate request succeeded.');

		// save rate to mongo
		yield saveToMongo(job_id, curr_from, curr_to, rate, config);
		console.log('Saved to Mongo successfully.');

		job_info.succeed_attempt++;
		if (job_info.succeed_attempt >= job_info.succeed_attempt_target) {
			// stop after a number of successful attempt
			console.log('Succeeded ' + job_info.succeed_attempt_target + ' times. Stop this job.');
			process.exit(0);
		} else {
			// reput job to queue
			let reput_result_id = yield client.putAsync(job_info.priority, job_info.succeed_delay, job_info.ttr, JSON.stringify(payload));
			console.log('Succeed. Put another job to queue. JobId: ' + reput_result_id);
			getJob();
		}
	}).catch(function (err) {
		console.log(err);
		job_info.failed_attempt++;
		if (job_info.failed_attempt < job_info.failed_attempt_limit) {
			// reput job to queue
			let payload = {from: err[1][1], to: err[1][2]};
			client.put(job_info.priority, job_info.failed_delay, job_info.ttr, JSON.stringify(payload), function (client_put_err, job_id) {
				console.log('Failed. Reput into queue. JobId: ' + job_id + ' | Payload: ' + JSON.stringify(payload));
				getJob();
			});
		} else {
			// bury if failed attempt limit is met
			client.bury(err[1][0], 0, function (bury_err) {
				console.log('Failed ' + job_info.failed_attempt_limit + ' times. Bury this job.');
				client.quit();
			});
		}
	});
}
