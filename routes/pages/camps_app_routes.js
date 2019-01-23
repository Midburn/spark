const express = require('express');
const router = express.Router({ mergeParams: true });
const userRole = require('../../libs/user_role');
const passportLib = require('../../libs/passport');
const constants = require('../../models/constants');

router.get('/', userRole.isLoggedIn(), function (req, res) {
    const cookieOptions = process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'staging' ?
        { overwrite: true, httpOnly: true, domain: constants.MIDBURN_DOMAIN } : { overwrite: true, httpOnly: true };
    res.cookie('authToken', passportLib.generateJwtToken(req.user.attributes.email, req.user.currentEventId), cookieOptions);
    res.redirect(process.env.COMMUNITIES_URL ?`${process.env.COMMUNITIES_URL}${req.params.lng}/${req.query.path}` : `http://localhost:3006/${req.params.lng}/${req.query.path}`);
});

module.exports = router;
