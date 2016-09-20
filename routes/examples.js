'use strict';

var express = require('express');
var router = express.Router();


var Example = require('../data/models/example');

router.get('/', function (req, res, next) {
  Example.find().select('_id title').sort({regDate: 1})
  .exec(function (err, data) {
    if (err) return next(err);
    res.status(200).json(data);
  });
});


router.get('/:id', function (req, res, next) {
  Example
  .findOne({_id: req.params.id}, {'_id': 0})
  .select('title code input structures breaks')
  .exec(function (err, data) {
    if (err) {
      return next(err);
    }

    if (!data) {
      return res.status(404).end();
    }

    res.status(200).json(data);
  });
});


module.exports = router;
