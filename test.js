'use strict';
const fivebeans		= require('fivebeans');
const Promise		= require('bluebird');
const request		= require('request');
const expect		= require('chai').expect;
const getCurrency	= require('./getCurrency');
const saveToMongo	= require('./saveToMongo');
const config		= require('./config').testing;
require('co-mocha');

// Promisify modules
Promise.promisifyAll(fivebeans, {multiArgs: true});
Promise.promisifyAll(request, {multiArgs: true});

describe('consumer worker', function () {
	let client = new fivebeans.client(config.BEANSTALKD_URL, 11300);
	before(function (done) {
		client.on('connect', function () {
			done();
		}).connect();
	});
	it('should reserve a job', function* () {
		let exec = require('child_process').exec;
		exec('node ./producer.js', function (error, stdout, stderr) {
			// console.log('stdout: ' + stdout);
			// console.log('stderr: ' + stderr);
			if (error !== null) {
				// console.log('exec error: ' + error);
			}
		});
		yield client.watchAsync(config.TUBENAME);
		let job = yield client.reserveAsync();
		expect(job[0]).to.not.equal(null);
	});
	it('should get currency rate from openexchangerates.org', function* () {
		let job_id = 1;
		let curr_from = 'HKD';
		let curr_to = 'USD';
		let rate = yield getCurrency(job_id, curr_from, curr_to, config);
		expect(rate).to.not.equal(null);
	});
	it('should save to mongo', function* () {
		this.timeout(10000);
		let job_id = 1;
		let curr_from = 'HKD';
		let curr_to = 'USD';
		let rate = '0.13';
		yield saveToMongo(job_id, curr_from, curr_to, rate, config);
	});
});
