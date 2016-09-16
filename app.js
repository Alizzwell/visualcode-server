'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');

var server = express();
var env = process.env.NODE_ENV;
var directory = (env === 'production' ? 'dist' : 'client');
var port = (env === 'production' ? 3000 : 20080);

var mongoose = require('./dbcon');
mongoose(env === 'production' ? 'visualcode' : 'test');

server.use(cookieParser());
server.use(express.static(path.join(__dirname + '/../', directory)));

server.use('/api/users', require('./routes/users'));



server.listen(port);

// eslint-disable-line no-console
console.log(`Server the ${directory}/ directory at http://localhost:${port}/`);