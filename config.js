'use strict';
/**
 * @constant {string} tubename
 * @constant {string} open exchange rates url
 * @constant {string} mongodb url
 */
module.exports = {
	production: {
		TUBENAME: 'wil',
		OPEN_EXCHANGE_RATES_URL: 'https://openexchangerates.org/api/latest.json?app_id=039e11b432be4216ac248605c4ab33c2',
		MONGODB_URL: 'mongodb://wilsonyip:1234567890@ds027295.mongolab.com:27295/wilsonyip_challenge',
		DB_COLLECTION: 'currency_rate',
		BEANSTALKD_URL: 'challenge.aftership.net'
	},
	testing: {
		TUBENAME: 'wil',
		OPEN_EXCHANGE_RATES_URL: 'https://openexchangerates.org/api/latest.json?app_id=039e11b432be4216ac248605c4ab33c2',
		DB_COLLECTION: 'test',
		MONGODB_URL: 'mongodb://wilsonyip:1234567890@ds027295.mongolab.com:27295/wilsonyip_challenge',
		BEANSTALKD_URL: '127.0.0.1'
	},
	job_info: {
		succeed_attempt_target: 10,
		succeed_attempt: 0,
		succeed_delay: 5, // seconds
		failed_attempt_limit: 3,
		failed_attempt: 0,
		failed_delay: 3, // seconds
		priority: 0,
		no_delay: 0,
		ttr: 60 // seconds
	}
};
