'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var structureSchema = new Schema({
  id: String,
  type: String
}, {_id: false});


var apiParamSchema = new Schema({
  name: String,
  description: String,
  optional: {type: Boolean, default: false},
  value: String
}, {_id: false});


var apiSchema = new Schema({
  name: String,
  description: String,
  params: [apiParamSchema]
}, {_id: false});


var drawSchema = new Schema({
  structure: structureSchema,
  api: apiSchema
}, {_id: false});


var breakSchema = new Schema({
  line: Number,
  draws: [drawSchema]
}, {_id: false});


var canvasSchema = new Schema({
  _owner: {type: Schema.Types.ObjectId, ref: 'User'},
  title: String,
  code: String,
  input: String,
  regDate: {type: Date, default: Date.now},
  updateDate: {type: Date, default: Date.now},
  structures: [structureSchema],
  breaks: [breakSchema]
});


module.exports = mongoose.model('Canvas', canvasSchema);
