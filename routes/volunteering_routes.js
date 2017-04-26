var express = require('express');
var router = express.Router({
    mergeParams: true
});
var passportLib = require('../libs/passport');
var userRole = require('../libs/user_role');
var User = require('../models/user').User;

router.get('/', userRole.isLoggedIn(), function (req, res) {
    User.forge({user_id: req.user.attributes.user_id}).fetch().then(user => {
        if (user) {
            var token = passportLib.generateJwtToken(user.attributes.email);
            res.redirect("http://URL.OF.VOLUNTEERING.SYSTEM.LANDING.PAGE?auth_token=" + token);
        }
        else {
            res.status(500).send("Redirect error");
        }
    });
});

module.exports = router;
