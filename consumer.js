'use strict';
const fivebeans		= require('fivebeans');
const Promise		= require('bluebird');
const request		= require('request');
const mongo_client 	= require('mongodb').MongoClient;
const co		= require('co');
const assert		= require('assert');

// Promisify modules
Promise.promisifyAll(fivebeans, {multiArgs: true});
Promise.promisifyAll(request, {multiArgs: true});

/**
 * @constant {string} tubename
 * @constant {string} open exchange rates url
 * @constant {string} mongodb url
 */
const TUBENAME	= 'wil';
const OPEN_EXCHANGE_RATES_URL = 'https://openexchangerates.org/api/latest.json?app_id=039e11b432be4216ac248605c4ab33c2';
const MONGODB_URL = 'mongodb://wilsonyip:1234567890@ds027295.mongolab.com:27295/wilsonyip_challenge';
let succeed_attempt_target = 10;
let succeed_attempt = 0;
let failed_attempt_limit = 3;
let failed_attempt = 0;

// fivebeans client connection setup and main flow
let client = new fivebeans.client('challenge.aftership.net', 11300);
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
		yield client.watchAsync(TUBENAME);
		console.log('Watching tube: ' + TUBENAME);
		let job = yield client.reserveAsync();
		let job_id 	= job[0];
		let payload 	= JSON.parse(job[1]);
		let curr_from 	= payload.from;
		let curr_to 	= payload.to;
		console.log('Reserved a job. JobId: ' + job_id);

		yield client.destroyAsync(job_id);
		console.log('JobId: ' + job_id + ' destroyed.');

		let rate = yield getCurrency(job_id, curr_from, curr_to);
		console.log('Currency request succeeded.');

		yield saveToMongo(job_id, curr_from, curr_to, rate);
		console.log('Saved to Mongo successfully.');

		succeed_attempt++;
		if (succeed_attempt >= succeed_attempt_target) {
			console.log('Succeeded 10 times. Stop this job.');
			client.quit();
		} else {
			let reput_result_id = yield client.putAsync(0, 60, 60, JSON.stringify(payload));
			console.log('Succeed. Put another job to queue. JobId: ' + reput_result_id);
			console.log(reput_result_id);
			getJob();
		}
	}).catch(function (err) {
		console.log(err);
		failed_attempt++;
		console.log('main error catch');
		// bury if failed attempt limit is met
		if (failed_attempt < failed_attempt_limit) {
			console.log('abc');
			let payload = {from: err[1][1], to: err[1][2]};
			console.log(payload);
			client.put(0, 3, 60, JSON.stringify(payload), function (client_put_err, job_id) {
				console.log('Failed. Reput into queue. JobId: ' + job_id + ' | Payload: ' + JSON.stringify(payload));
				getJob();
			});
		} else {
			client.bury(err[1][0], 0, function (bury_err) {
				console.log('Failed 3 times. Bury this job.');
				client.quit();
			});
		}
	});
}


/**
 * get Currency from https://openexchangerates.org/
 * get a sample response by curl:
 * curl https://openexchangerates.org/api/latest.json?app_id=039e11b432be4216ac248605c4ab33c2
 * @function getCurrency
 *
 * @param {number} job_id - job id number
 * @param {string} curr_from - exchange from this currency
 * @param {string} curr_to - exchange to this currency
 * @returns {Promise} if resolved: exchange rate (i.e.: currencyToRate / currencyFromRate), if rejected: [error, [job id, currency from, currency to]]
 */
function getCurrency(job_id, curr_from, curr_to) {
	return new Promise(function (resolve, reject) {
		request.getAsync(OPEN_EXCHANGE_RATES_URL)
		.then(function (response) {
			let currObj = JSON.parse(response[1]);
			if (response[0].statusCode === 200) {
				let rate = (currObj.rates[curr_to] / currObj.rates[curr_from]).toFixed([2]);
				resolve(rate);
			}
		}).catch(function (request_err) {
			console.log(request_err);
			return reject([new Error('request_err'), [job_id, curr_from, curr_to]]);
		});
	});
}


/**
 * save retrieved exchange rate to mongodb
 * @function saveToMongo
 *
 * @param {number} job_id - job id number
 * @param {string} curr_from - exchange from this currency
 * @param {string} curr_to - exchange to this currency
 * @param {number} rate - exchange in 2 decimals
 * @returns {Promise} if resolved: result object, if reject: [error, [job id, currency from, currency to]]
 */
function saveToMongo(job_id, curr_from, curr_to, rate) {
	return new Promise(function (resolve, reject) {
		mongo_client.connect(MONGODB_URL, function (mongo_connect_err, db) {
			if (mongo_connect_err) return reject([mongo_connect_err, [job_id, curr_from, curr_to]]);

			db.collection('currency_rate').insertOne({from: curr_from, to: curr_to, rate: rate, created_at: new Date()}, function (mongo_insert_err, result) {
				if (mongo_insert_err) return reject([mongo_insert_err, [job_id, curr_from, curr_to]]);
				assert.equal(null, mongo_insert_err);
				resolve(result);
			});
		});
	});
}
