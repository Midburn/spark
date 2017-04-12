var express = require('express');
var router = express.Router({
    mergeParams: true
});

var userRole = require('../libs/user_role');
var i18next = require('i18next');
var mail = require('../libs/mail');
var log = require('../libs/logger.js')(module);

var config = require('config');
var serverConfig = config.get('server');


router.get('/', userRole.isLoggedIn(), function (req, res) {
    res.render('pages/gate');

    //url: '/' + req.params.lng + '/home'
});

router.post('/api/login', function (req, res) {

});

router.post('/api/logout', function (req, res) {

});

router.post('/api/scan', function (req, res) {

});

router.post('/api/save', function (req, res) {

});

router.post('/api/counter', function (req, res) {

});

module.exports = router;
