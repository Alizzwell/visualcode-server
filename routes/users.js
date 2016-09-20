'use strict';

var express = require('express');
var router = express.Router();

var model = {
  User: require('../data/models/user'),
  Canvas: require('../data/models/canvas')
};


router.post('/', function (req, res, next) {
  model.User.findOne({_id: req.cookies.id}, function (err, data) {
    if (data) {
      return res.status(204).end();
    }

    var user = new model.User();
    user.save(function (err) {
      if (err) {
        return next(err);
      }
      res.cookie('id', user._id, {expires: new Date(Date.now() + 315360000000)});
      res.status(201).end();
    });
  });
});

router.get('/canvas-list', function (req, res, next) {
  model.Canvas
  .find({_owner: req.cookies.id})
  .select('_id title updateDate')
  .sort({updateDate: -1})
  .exec(function (err, data) {
    if (err) return next(err);
    res.status(200).json(data);
  });
});


module.exports = router;
