var express = require('express');
var router = express.Router({
    mergeParams: true
});

var userRole = require('../libs/user_role');
var mail = require('../libs/mail');

var User = require('../models/user').User;
var NpoMember = require('../models/npo_member').NpoMember;
var NpoStatus = require('../models/npo_member').NPO_STATUS;

var config = require('config');
var npoConfig = config.get('npo');
var serverConfig = config.get('server');
var log = require('../libs/logger.js')(module);

router.get('/', userRole.isAdmin(), function (req, res, next) {
    res.render('admin/home.jade', {
        user: req.user
    });
});

router.get('/npo', userRole.isAdmin(), function (req, res, next) {
    NpoMember.forge().query({
            where: {
                membership_status: NpoStatus.applied_for_membership
            }
        })
        .fetchAll({
            withRelated: ['user']
        }).then(function (members) {
            res.render('admin/npo.jade', {
                members: members.models
            });
        });
});

router.post('/npo', userRole.isAdmin(), function (req, res, next) {
    if (req.body.action && req.body.emails) {
        switch (req.body.action) {
            case 'approve_membership':
                var rows = req.body.emails.split('\n');
                rows.forEach(function (row) {
                    var recipient = row.trim();
                    if (recipient.length > 0) {
                        new User({
                            email: recipient
                        }).fetch().then(function (theUser) {
                            if (theUser == null) {
                                //TODO handle error.
                                log.error("User not found!");
                                return res.render('admin/admin_npo', {
                                    errorMessage: 'email ' + recipient + ' not found'
                                });
                            }
                            if (theUser.attributes.membership_status === npoStatus.applied_for_membership) {
                                theUser.attributes.membership_status = npoStatus.request_approved;
                                theUser.save().then(function (model) {
                                    var payLink = serverConfig.url + "/he/npo/pay_fee?user='" + recipient;
                                    mail.send(
                                        recipient,
                                        npoConfig.email,
                                        'Your Midburn membership approved!',
                                        'emails/npo_membership_approved', {
                                            name: theUser.fullName,
                                            payLink: payLink
                                        });
                                    res.redirect('/admin/npo');
                                });
                            } else {
                                //TODO handle error.
                                log.warn("Incorrect status - ", theUser.attributes.membership_status);
                                return res.render('admin/admin_npo', {
                                    errorMessage: 'email ' + recipient + ' - incorrect status'
                                });
                            }
                        });
                    }
                })
        }
    }
});

module.exports = router;