'use strict';
const Promise = require('bluebird');
const mongo_client = require('mongodb').MongoClient;

/**
 * save retrieved exchange rate to mongodb
 * @function saveToMongo
 *
 * @param {number} job_id - job id number
 * @param {string} curr_from - exchange from this currency
 * @param {string} curr_to - exchange to this currency
 * @param {number} rate - exchange in 2 decimals
 * @param {number} config - configuration
 * @returns {Promise} if resolved: result object, if reject: [error, [job id, currency from, currency to]]
 */
module.exports = function saveToMongo(job_id, curr_from, curr_to, rate, config) {
	return new Promise(function (resolve, reject) {
		mongo_client.connect(config.MONGODB_URL, function (mongo_connect_err, db) {
			if (mongo_connect_err) return reject([mongo_connect_err, [job_id, curr_from, curr_to]]);
			db.collection(config.DB_COLLECTION).insertOne({from: curr_from, to: curr_to, rate: rate, created_at: new Date()}, function (mongo_insert_err, result) {
				if (mongo_insert_err) return reject([mongo_insert_err, [job_id, curr_from, curr_to]]);
				resolve(result);
			});
		});
	});
};
