'use strict';
let fivebeans	= require('fivebeans');
let Promise	= require('bluebird');
let request	= require('request');
let mongoClient = require('mongodb').MongoClient;

let assert	= require('assert');

let tubename	= 'h9EhuaQnbE6EzyyF4r6QPQ';
let openExchangeRatesURL = 'https://openexchangerates.org/api/latest.json?app_id=039e11b432be4216ac248605c4ab33c2';
let mongodbURL = 'mongodb://wilsonyip:1234567890@ds027295.mongolab.com:27295/wilsonyip_challenge';

// fivebeans client setup
let client = new fivebeans.client('127.0.0.1', 11300);
client.connect();

function getJob() {
	client.watch(tubename, function (watchErr, numWatched) {
		console.log('numWatched: ' + numWatched);
		client.reserve(function (reserveErr, jobId, payload) {
			console.log('reserve');
			console.log(jobId);
			console.log(JSON.parse(payload));

			getCurrency(JSON.parse(payload).from, JSON.parse(payload).to)
			.then(function (array) {
				console.log('in getCurrency Promise');
				// var [from, to, rate] = array;
				let from	= array[0];
				let to		= array[1];
				let rate	= array[2];
				return saveToMongo(from, to, rate);
			}).then(function (data) {
				console.log(data);
				console.log('---in 2nd then');
			}).catch(function (err) {
				console.log(err);
			});

			client.destroy(jobId, function (err) {
				console.log('jobId ' + jobId + ' destroyed.');
				getJob();
			});
		});
	});
}

function getCurrency(currFrom, currTo) {
	return new Promise(function (resolve, reject) {
		request(openExchangeRatesURL, function (err, response, body) {
			if (err) throw err;

			let currObj = JSON.parse(body);
			if (!err && response.statusCode === 200) {
				let rate = (currObj.rates[currTo] / currObj.rates[currFrom]).toFixed([2]);
				resolve([currFrom, currTo, rate]);
			}else {
				console.log('else');
			}
		});
	});
}

function saveToMongo(currFrom, currTo, rate) {
	return new Promise(function (resolve, reject) {
		mongoClient.connect(mongodbURL, function (mongoConnectErr, db) {
			if (mongoConnectErr) throw mongoConnectErr;

			console.log('mongo connected');

			db.collection('test').insertOne({from: currFrom, to: currTo, rate: rate, created_at: new Date()}, function (mongoInsertErr, result) {
				assert.equal(null, mongoInsertErr);
				console.log('rate inserted');
				resolve(result);
			});
		});
	});
}

getJob();
