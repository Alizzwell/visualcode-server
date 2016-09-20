'use strict';

var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();
var env = process.env.NODE_ENV;
var directory = (env === 'production' ? 'dist' : 'client');
var port = (env === 'production' ? 3000 : 20080);
var dbname = (env === 'production' ? 'visualcode' : 'test');
var mongoose = require('./dbcon')(dbname);
mongoose.Promise = require('promise');

global.appRoot = __dirname;

app.set('views', path.join(__dirname + '/../', directory));
app.set('view engine', 'ejs');

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname + '/../', directory)));


app.use('/api/users', require('./routes/users'));
app.use('/api/canvas', require('./routes/canvas'));
app.use('/api/examples', require('./routes/examples'));


var fs = require('fs');
app.get('/api/drawapis', function (req, res, next) {
  fs.readFile(__dirname + '/data/draw-apis.json', 'utf8', function (err, data) {
    if (err) return next(err);
    res.json(JSON.parse(data));
  });
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (env !== 'production') {
  app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


app.listen(port);

// eslint-disable-line no-console
console.log(`Server the ${directory}/ directory at http://localhost:${port}/`);
