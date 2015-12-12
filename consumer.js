var fivebeans   = require('fivebeans'),
    Promise     = require('bluebird'),
    co          = require('co'),
    request     = require('request'),
    MongoClient = require('mongodb').MongoClient;

var assert      = require('assert');


var tubename    = "h9EhuaQnbE6EzyyF4r6QPQ";
var openExchangeRatesURL = "https://openexchangerates.org/api/latest.json?app_id=039e11b432be4216ac248605c4ab33c2";
var mongodbURL = "mongodb://wilsonyip:1234567890@ds027295.mongolab.com:27295/wilsonyip_challenge";

// fivebeans client setup 
var client = new fivebeans.client('127.0.0.1', 11300);
client.connect();
                    

function getJob() {
        client.watch(tubename, function(err, numWatched){
            console.log("numWatched: " + numWatched);
            client.reserve(function(err, jobId, payload) {
                console.log("reserve");
                console.log(jobId);
                console.log(JSON.parse(payload));

                getCurrency(JSON.parse(payload).from, JSON.parse(payload).to)
                .then(function(array) {
                    console.log("in getCurrency Promise");
		    // var [from, to, rate] = array;
		    var from	= array[0],
			to	= array[1],
			rate	= array[2];
                    return saveToMongo(from, to, rate);
                }).then(function(data) {
                    console.log(data);
		    console.log("---in 2nd then");    
                }).catch(function(err) {
                    console.log(err);
                });

                client.destroy(jobId, function(err) {
                    console.log("jobId " + jobId + " destroyed.");
                    getJob();
                });
            });
        });
}

function getCurrency(currFrom, currTo) {
    return new Promise(function(resolve, reject) { 
        request(openExchangeRatesURL, function (err, response, body) {
            if(err) throw err;

            var currObj = JSON.parse(body);            
            if (!err && response.statusCode == 200) {
                var rate = (currObj.rates[currTo] / currObj.rates[currFrom]).toFixed([2]);
                resolve([currFrom, currTo, rate]);
            }
            else {
            
            }
        });
    }); 
} 

function saveToMongo(currFrom, currTo, rate) {
    return new Promise(function (resolve, reject) {

            MongoClient.connect(mongodbURL, function(err, db) {
                if(err) throw err;

                console.log("mongo connected");

                db.collection('test').insertOne({from: currFrom, to: currTo, rate: rate, created_at: new Date()}, function(err, result) {
                    assert.equal(null, err);
                    console.log("rate inserted");

                            
                    resolve(result);        
                });
            });
    });
}

getJob();
