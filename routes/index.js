var express = require('express');
var util = require('../config/util.js');
var router = express.Router();

router.get('/', function(req, res) {
    res.render('partials/play', {
        title: "Mind Fk",
        newGame: true,
        joinGame: false,
        token: util.randomString(20),
    });
});

router.get('/game/:token', function(req, res) {
	var token = req.params.token;
    res.render('partials/play', {
        title: "Mind Fk",
        newGame: false,
        joinGame: true,
        token: token,
    });
});

module.exports = router;
