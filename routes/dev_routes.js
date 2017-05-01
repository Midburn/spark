const express = require('express');
const router = express.Router({
    mergeParams: true
});
const {User} = require('../models/user');

router.get('/', function (req, res) {
    res.render('dev_tools/dev_home');
});

router.get('/create-admin', function (req, res) {
    const newUser = new User({
        email: 'a',
        first_name: 'Development',
        last_name: 'Admin',
        gender: 'female',
        validated: true,
        enabled: true,
        roles: 'admin'
    });
    newUser.generateHash('a');

    return newUser.save()
                  .then(() => res.redirect("/"))
                  .catch(() => res.redirect("./"));
});

router.get('/view-debug/*', function (req, res) {
    const path = req.path.substr('/view-debug/'.length);
    if (path === '') {
        res.render('dev_tools/view_debug');
    } else {
        res.render('${path}', JSON.parse(req.query.params)); // eslint-disable-line no-template-curly-in-string
    }
});

module.exports = router;
