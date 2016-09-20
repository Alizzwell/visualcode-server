'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = new Schema({
  regDate: {type: Date, default: Date.now},
  userCanvas: [{type: Schema.Types.ObjectId, ref: 'Canvas'}]
});


module.exports = mongoose.model('User', userSchema);
