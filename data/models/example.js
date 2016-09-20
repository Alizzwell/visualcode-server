'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var canvasSchema = require('./canvas').schema;

// TODO: example만의 기능이 생기면 스키마 정의 수정
var exampleSchema = canvasSchema;

module.exports = mongoose.model('Examples', exampleSchema);
