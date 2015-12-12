var fivebeans   = require('fivebeans'),
    Promise     = require('bluebird'),
    co          = require('co');

var client = new fivebeans.client('127.0.0.1', 11300);

var connection = new Promise(function(resolve, reject) {
        client
            .on('connect', function(){
                resolve();
            })
            .on('err', function(err){
            })
            .on('close', function(){
            })
            .connect();
});
var list_tubes = new Promise(function(resolve, reject) {
                    client.list_tubes(function(err, tubes) {
                         console.log("in client.list_tubes");
                         console.log(tubes);
                         resolve(tubes);
                    });
                });

co(function *(){
    yield connection;
    return yield list_tubes;
}).then(function(value) {
    console.log("last");
    console.log(value);
});
