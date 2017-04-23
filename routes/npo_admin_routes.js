var express = require('express');
var router = express.Router({
    mergeParams: true
});

var knex = require('../libs/db').knex;
var userRole = require('../libs/user_role');
var i18next = require('i18next');
var mail = require('../libs/mail');
var log = require('../libs/logger.js')(module);

var NpoMember = require('../models/npo_member').NpoMember;
var NpoStatus = require('../models/npo_member').NPO_STATUS;

var config = require('config');
var npoConfig = config.get('npo');
var serverConfig = config.get('server');

let getNextMemberNumber = () => {
    knex('npo_members').max('member_number').then((number) => {
        return number + 1;
    })
};

// TODO protect by npm_admin role
router.get('/', userRole.isLoggedIn(), function (req, res) {
    res.render('pages/npo/admin');
});

// TODO protect by npm_admin role
router.get('/application/:user_id', userRole.isLoggedIn(), (req, res) => {
    knex.select('*').from('npo_members')
        .leftJoin('users', 'users.user_id', 'npo_members.user_id')
        .where('users.user_id', req.params.user_id)
        .then((members) => {
            if (members && members[0]) {
                return res.render('pages/npo/application',
                    {member: members[0], adminMode: true, formUrl: '/' + req.params.lng + '/npo-admin/application/'});
            }
            else {
                //TODO return error
            }
        });
});

router.post('/application/:action', (req, res) => {
    let action = req.params.action;

    if (action && req.body.members) {
        switch (action) {
            case 'approve':
                var members = JSON.parse(req.body.members);
                for (member in members) {
                    let memberEmail = members[member].email;
                    NpoMember.forge({
                        user_id: members[member].user_id
                    }).fetch().then((theMember) => {
                        if (theMember == null) {
                            //TODO handle error.
                            log.error("User not found!");
                            return res.render('pages/npo/admin', {
                                errorMessage: 'email ' + memberEmail + ' not found'
                            });
                        }
                        if (theMember.attributes.membership_status === NpoStatus.applied_for_membership) {
                            theMember.attributes.membership_status = NpoStatus.request_approved;
                            theMember.attributes.member_number = getNextMemberNumber();
                            theMember.save().then(() => {
                                var payLink = serverConfig.url + "/he/npo/pay_fee?user='" + memberEmail;
                                mail.send(
                                    memberEmail,
                                    npoConfig.email,
                                    'Your Midburn membership approved!',
                                    'emails/npo_membership_approved', {
                                        name: theMember.fullName,
                                        payLink: payLink
                                    });
                                res.redirect('/');
                            });
                        } else {
                            //TODO handle error.
                            log.warn("Incorrect status - ", theMember.attributes.membership_status);
                            return res.render('pages/npo/admin', {
                                errorMessage: 'email ' + memberEmail + ' - incorrect status'
                            });
                        }
                    });

                }
        }
    }
});

router.get('/ajax/members', /*TODO security.protectJwt,*/ (req, res) => {

    let searchTerm = req.query.search;
    let sort = req.query.sort ? req.query.sort : 'member_number';

    var query = knex.select('*').from('npo_members')
        .leftJoin('users', 'users.user_id', 'npo_members.user_id');

    if (searchTerm && searchTerm.length > 0) {
        searchTerm = '%' + searchTerm + '%';
        query.where('first_name', 'like', searchTerm)
            .orWhere('last_name', 'like', searchTerm)
            .orWhere('email', 'like', searchTerm)
            .orWhere('member_number', 'like', searchTerm);
    }

    query.orderBy(sort, req.query.order)
        .then((records) => {
            for (i in records) {
                //if (record.hasOwnProperty()) {
                records[i].status_text = i18next.t('npo:status.' + records[i].membership_status);
                //}
            }
            res.status(200).json({rows: records, total: (records.length ? records.length : 0)});
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
});

module.exports = router;
