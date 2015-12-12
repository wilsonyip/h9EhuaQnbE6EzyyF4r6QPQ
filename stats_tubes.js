var fivebeans = require('fivebeans');

var client = new fivebeans.client('127.0.0.1', 11300);

var tubename = "h9EhuaQnbE6EzyyF4r6QPQ";

client.connect();

client.list_tubes(function(err, tubes) {
    
    console.log(tubes);

    client.stats_tube(tubename, function(err, response) {

        console.log(response);
        process.exit();
    });
});

