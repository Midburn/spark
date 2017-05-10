const express = require('express');
const router = express.Router({ mergeParams: true });
const userRole = require('../libs/user_role');

router.get('/', userRole.isLoggedIn(), function (req, res) {
    res.redirect('http://URL.OF.VOLUNTEERING.SYSTEM.LANDING.PAGE');
});

module.exports = router;
