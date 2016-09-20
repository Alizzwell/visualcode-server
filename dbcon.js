'use strict';

var mongoose = require('mongoose');

var dbURI = 'mongodb://localhost';
var dbname;
var db = mongoose.connection;
var retry;


db.on('connecting', function() {
  console.log('connecting to MongoDB...');
});

db.on('error', function(error) {
  console.error('Error in MongoDb connection: ' + error);
  mongoose.disconnect();
});

db.on('connected', function() {
  clearInterval(retry);
  console.log('MongoDB connected!');
});

db.once('open', function() {
  console.log('MongoDB connection opened!');
});

db.on('reconnected', function () {
  console.log('MongoDB reconnected!');
});

db.on('disconnected', function() {
  console.log('MongoDB disconnected!');
  clearInterval(retry);
  retry = setInterval(connect, 5000);
});

mongoose.reconnect = reconnect;

module.exports = function (_dbname) {
  dbname = _dbname;
  connect();
  return mongoose;
};

// module.exports = mongoose;


function connect() {
  mongoose.connect(dbURI + '/' + dbname, {server: {auto_reconnect: true}});
}

function reconnect() {
  mongoose.disconnect();
}
