var modules = require('../../libs/modules');

var userRole = modules.require('users', 'libs/user_role');
var mail = modules.require('core', 'libs/mail');

var User = modules.require('users', 'models/user').User;
var Camp = modules.require('core', 'models/camp').Camp;
var NpoMember = modules.require('core', 'models/npo_member').NpoMember;
var NpoStatus = modules.require('core', 'models/npo_member').NPO_STATUS;

var config = require('config');
var npoConfig = config.get('npo');
var serverConfig = config.get('server');
var log = modules.require('core', 'libs/logger.js')(module);
var datatableAdmin = modules.require('admin', 'libs/admin').datatableAdmin;
var adminRender = modules.require('admin', 'libs/admin').adminRender;
var api = modules.require('api', 'libs/api');

module.exports = function(app, passport) {

    app.get('/admin', userRole.isAdmin(), function (req, res) {
        adminRender(req, res, 'admin/home.jade', {
            tiles: [
                {top: {icon: "user", title: "Total Users"}, count: {text: "250", green: false}, bottom: {title: "Users admin", href: "/admin/users"}},
                {top: {icon: "sitemap", title: "Total Camps"}, count: {text: "5", green: false}, bottom: {title: "Camps admin", href: "/admin/camps"}}
                // {top: {icon: "user", title: "Total Users"}, count: {text: "2500", green: false}, bottom: {small: "4%", sort: "", color: "green", title: "From last week"}},
                // {top: {icon: "clock-o", title: "Average Time"}, count: {text: "123.50", green: false}, bottom: {small: "3%", sort: "asc", color: "green", title: "From last week"}},
                // {top: {icon: "user", title: "Total Males"}, count: {text: "2,500", green: true}, bottom: {small: "34%", sort: "asc", color: "green", title: "From last week"}},
                // {top: {icon: "user", title: "Total Females"}, count: {text: "4,567", green: false}, bottom: {small: "12%", sort: "desc", color: "red", title: "From last week"}},
                // {top: {icon: "user", title: "Total Collections"}, count: {text: "2,315", green: false}, bottom: {small: "4%", sort: "asc", color: "green", title: "From last week"}},
                // {top: {icon: "user", title: "Total Connections"}, count: {text: "7,325", green: false}, bottom: {small: "56%", sort: "asc", color: "green", title: "From last week"}}
            ]
        });
    });

    datatableAdmin("users", app, {
        "api": {
            "fetchById": api.users.fetchById,
            "getTotalCount": api.users.getTotalCount,
            "fetchPage": api.users.fetchPage
        },
        "columns": [
            {title: "Id", attr: "user_id", type: "primary"},
            {title: "Email", attr: "email", type: "string"},
            {title: "First name", attr: "first_name", type: "string"},
            {title: "Last name", attr: "last_name", type: "string"}
        ],
        selectColumns: ["user_id", "email", "first_name", "last_name"],
        defaultOrder: [[ 1, "asc" ]],
        addTitle: "Add User",
        editTitle: "Edit User",
        editKey: "user_id",
        addCallback: function(req, body, done) {
            api.users.signUp(req, body.email, "", body, function(user, error) {
                if (user) {
                    done(true, "Great Success! 1 user added");
                } else {
                    done(false, error);
                }
            });
        },
        editCallback: function(req, user_id, body, done) {
            api.users.edit(req, {user_id: user_id}, body).then(function() {
                done(true, "Great success! updated user id "+user_id);
            }).catch(function(e) {
                done(false, "unexpected error: "+e);
            });

        }
    });

    datatableAdmin("camps", app, {
        "model": Camp,
        "columns": [
            {"attr": "id", type: "primary"},
            {"attr": "camp_name_he", type: "string"},
            {"attr": "camp_name_en", type: "string"},
            {"attr": "camp_desc_he", type: "string"},
            {"attr": "camp_desc_en", type: "string"},
            {"attr": "type", type: "string"},
            {"attr": "status", type: "string"},
            {"attr": "enabled", type: "string"}
        ],
        selectColumns: ["id", "camp_name_he", "camp_name_en", "camp_desc_he", "camp_desc_en", "type", "status", "enabled"],
        defaultOrder: [[ 1, "asc" ]],
        filter: function(qb, searchTerm) {
            qb
                .where('camp_name_he', 'LIKE', '%'+searchTerm+'%')
                .orWhere('camp_name_en', 'LIKE', '%'+searchTerm+'%')
                .orWhere('camp_desc_he', 'LIKE', '%'+searchTerm+'%')
                .orWhere('camp_desc_en', 'LIKE', '%'+searchTerm+'%')
            ;
            if (!isNaN(searchTerm)) {
                qb.orWhere('id', '=', searchTerm)
            }
        },
        addTitle: "Add Camp",
        addCallback: function(body, done) {
            Camp.forge().save(body).then(function() {
                done(true, "Great success! 1 camp added");
            }).catch(function(e) {
                done(false, "unexpected error: "+e);
            });
        },
        editTitle: "Edit Camp",
        editKey: "id",
        editCallback: function(camp_id, body, done) {
            Camp.forge({camp_id:camp_id}).save(body).then(function() {
                done(true, "Great success! updated camp id "+camp_id);
            }).catch(function(e) {
                done(false, "unexpected error: "+e);
            });
        }
    });

    app.get('/admin/npo', userRole.isAdmin(), function (req, res) {
        NpoMember.forge().query({where: {membership_status: NpoStatus.applied_for_membership}})
            .fetchAll({withRelated: ['user']}).then(function (members) {
            res.render('admin/npo.jade', {members: members.models});
        });
    });

    app.get('/admin/npo', userRole.isAdmin(), function (req, res, next) {
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

    app.post('/admin/npo', userRole.isAdmin(), function (req, res, next) {
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

};
