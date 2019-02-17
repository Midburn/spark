const express = require('express');
const router = express.Router({ mergeParams: true });
const userRole = require('../../libs/user_role');
const passportLib = require('../../libs/passport');

router.get('/', userRole.isLoggedIn(), function (req, res) {
    const options = {httpOnly: true, overwrite: true};
    if (['staging', 'production'].includes(process.env.NODE_ENV)) {
        options.domain = '.midburn.org';
    }
    res.cookie('authToken', passportLib.generateJwtToken(req.user.attributes.email, req.user.currentEventId), options);
    res.redirect(['staging', 'production'].includes(process.env.NODE_ENV) ? `${process.env.COMMUNITIES_URL || 'http://communities:3006'}${req.params.lng}/${req.query.path}` : `http://localhost:3006/${req.params.lng}/${req.query.path}`);
});

module.exports = router;
