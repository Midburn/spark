const express = require('express');
const router = express.Router({ mergeParams: true });
const userRole = require('../../libs/user_role');
const passportLib = require('../../libs/passport');

router.get('/', userRole.isLoggedIn(), function (req, res) {
    const options = {httpOnly: true, overwrite: true, domain: '.midburn.org'};
    if (process.env.NODE_ENV === 'development') {
        delete options.domain;
    }
    res.cookie('authToken', passportLib.generateJwtToken(req.user.attributes.email, req.user.currentEventId), options);
    res.redirect(process.env.COMMUNITIES_URL ?`${process.env.COMMUNITIES_URL}${req.params.lng}/${req.query.path}` : `http://localhost:3006/${req.params.lng}/${req.query.path}`);
});

module.exports = router;
