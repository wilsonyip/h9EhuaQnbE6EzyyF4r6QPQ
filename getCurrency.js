'use strict';
const Promise = require('bluebird');
const request = require('request');
Promise.promisifyAll(request, {multiArgs: true});

/**
 * get Currency from https://openexchangerates.org/
 * get a sample response by curl:
 * curl https://openexchangerates.org/api/latest.json?app_id=039e11b432be4216ac248605c4ab33c2
 * @function getCurrency
 *
 * @param {number} job_id - job id number
 * @param {string} curr_from - exchange from this currency
 * @param {string} curr_to - exchange to this currency
 * @param {string} config - configuration
 * @returns {Promise} if resolved: exchange rate (i.e.: currencyToRate / currencyFromRate), if rejected: [error, [job id, currency from, currency to]]
 */
module.exports = function getCurrency(job_id, curr_from, curr_to, config) {
	return new Promise(function (resolve, reject) {
		request.getAsync(config.OPEN_EXCHANGE_RATES_URL)
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
};
