var fivebeans   = require('fivebeans'),
    crypto      = require ('crypto');

var tubename    = "h9EhuaQnbE6EzyyF4r6QPQ";


// fivebeans client setup
var client = new fivebeans.client('localhost', 11300);
client.connect();

// get arguments from CLI
var numJobs     = process.argv[2];
var currFrom    = process.argv[3];
var currTo      = process.argv[4];
if(numJobs == undefined) {
    numJobs = 10;
}
if(currFrom == undefined) {
    currFrom = "HKD";
}
if(currTo == undefined) {
    currTo = "USD";
}


for(var i=0; i < numJobs; i++) {

    var payload = {from: currFrom, to: currTo}; 

    client.use(tubename, function(err, tubename) {
        client.put(0, 0, 1, JSON.stringify(payload), function(err, jobId) {
            if(err) throw err;
            console.log('InjectedJobId: ' + jobId + ' | Payload: '+ JSON.stringify(payload));
        });
    });
}
