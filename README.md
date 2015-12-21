# h9EhuaQnbE6EzyyF4r6QPQ

##Start Consumer Worker
###use Aftership Beanstalkd server, mongolab 'currency_rate' collection
npm start
or
node consumer.js

##Start Consumer Worker (local)
###use local Beanstalkd server, mongolab 'test' collection
npm run local
or
node consumer.js --test

##Seed a task
npm run seed
or 
node producer.js

##Eslint & Mocha Test
npm test
or
grunt --force

###Travis CI Repositories
[https://travis-ci.org/wilsonyip/h9EhuaQnbE6EzyyF4r6QPQ]
