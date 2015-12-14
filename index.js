'use strict';

let fivebeans	= require('fivebeans');
let Promise	= require('bluebird');
let co		= require('co');

let client = new fivebeans.client('127.0.0.1', 11300);

let connection = new Promise(function (resolve, reject) {
	client.on('connect', function () {
		resolve();
	}).on('err', function (err) {
	})
        .on('close', function () {
        }).connect();
});
let list_tubes = new Promise(function (resolve, reject) {
	client.list_tubes(function (err, tubes) {
		console.log('in client.list_tubes');
		console.log(tubes);
		resolve(tubes);
	});
});

co(function* () {
	yield connection;
	return yield list_tubes;
}).then(function (value) {
	console.log('last');
	console.log(value);
});
