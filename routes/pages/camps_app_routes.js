const express = require('express');
const router = express.Router({ mergeParams: true });
const userRole = require('../../libs/user_role');
const passportLib = require('../../libs/passport');

router.get('/', userRole.isLoggedIn(), function (req, res) {
    const options = { httpOnly: true, overwrite: true };
    if (process.env.NODE_ENV === 'production') {
        options.domain = '.midburn.org';
    }
    res.cookie('authToken', passportLib.generateJwtToken(req.user.attributes.email, req.user.currentEventId), options);
    res.redirect(process.env.CAMPS_APP_BASE_URL ?`${process.env.CAMPS_APP_BASE_URL}/${req.params.lng}/camps` : `http://localhost:3006/${req.params.lng}/camps`);
});

module.exports = router;
