'use strict';

var express = require('express');
var router = express.Router();

var model = {
  User: require('../data/models/user')
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


module.exports = router;
