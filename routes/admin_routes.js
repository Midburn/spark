var express = require('express');
var router = express.Router({mergeParams: true});

var userRole = require('../libs/user_role');
var mail = require('../libs/mail');

var User = require('../models/user').User;
var NpoMember = require('../models/npo_member').NpoMember;
var NpoStatus = require('../models/npo_member').NPO_STATUS;

var config = require('config');
var npoConfig = config.get('npo');
var serverConfig = config.get('server');
var log = require('../libs/logger.js')(module);

/**
 * private function to render admin views
 * creates template params for the views
 *
 * currently there are some frontend elements supported in the view but not in backend, you can add them to options if you want:
 *
    // options.notifications = {
    //     number: 8,
    //     items: [
    //         {
    //             title: "John Smith",
    //             time: "3 mins ago",
    //             img: {src: "/gentelella/images/user.png", alt: "Profile Image"},
    //             message: "Film festivals used to be do-or-die moments for movie makers. They were where..."
    //         },
    //         {
    //             title: "John Smith",
    //             time: "3 mins ago",
    //             img: {src: "/gentelella/images/user.png", alt: "Profile Image"},
    //             message: "Film festivals used to be do-or-die moments for movie makers. They were where..."
    //         }
    //     ],
    //     all: {
    //         text: "See All Alerts",
    //         href: "/admin/alerts"
    //     }
    // };

    options.showUserMenu = true;

     options.sideBarFooter = [
         {title: "Settings", glyphicon: "cog"},
         {title: "FullScreen", glyphicon: "fullscreen"},
         {title: "Lock", glyphicon: "eye-close"},
         {title: "Logout", glyphicon: "off"}
     ];
 *
 */
var _adminRender = function(req, res, name, options) {
    if (!options) options = {};
    options.user = req.user;
    options.sideBar = [
        {title: "Home", icon: "home", href: "/admin"},
        {title: "Users", icon: "users", href: "/admin/users"},
        {title: "Camps", icon: "sitemap", href: "/admin/camps"},
        {title: "Midburn NPO", icon: "users", children: [
            {title: "Members", href: "/admin/npo"}
        ]}
    ];
    res.render(name, options);
};

router.get('/', userRole.isAdmin(), function (req, res) {
    _adminRender(req, res, 'admin/home.jade', {
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

router.get('/users', userRole.isAdmin(), function(req, res) {
    User.fetchPage({pageSize: 2, page: 1})
        .then(function(users){
            rows = [];
            users.forEach(function(user) {
                rows.push({
                    even: true,
                    cells: [
                        {text: user.id, last: false, sorting: "asc"},
                        {text: user.attributes.email, last: false},
                        {text: user.attributes.first_name, last: false},
                        {text: user.attributes.last_name, last: true}
                    ]
                })
            });
            _adminRender(req, res, 'admin/users.jade', {
                title: {text: "Spark users", small: ""},
                columns: [
                    {title: "Id", last: false},
                    {title: "Email", last: false},
                    {title: "First name", last: false},
                    {title: "Last name", last: true}
                ],
                rows: rows
            });
        })
    ;
});

router.get('/npo', userRole.isAdmin(), function (req, res) {
    NpoMember.forge().query({where: {membership_status: NpoStatus.applied_for_membership}})
        .fetchAll({withRelated: ['user']}).then(function (members) {
        _adminRender(req, res, 'admin/npo.jade', {members: members.models});
    });
});

router.post('/npo', userRole.isAdmin(), function (req, res, next) {
    if (req.body.action && req.body.emails) {
        switch (req.body.action) {
            case 'approve_membership' :
                var rows = req.body.emails.split('\n');
                rows.forEach(function (row) {
                    var recipient = row.trim();
                    if (recipient.length > 0) {
                        new User({email: recipient}).fetch().then(function (theUser) {
                            if (theUser == null) {
                                //TODO handle error.
                                log.error("User not found!");
                                return _adminRender(req, req, 'admin/admin_npo', {errorMessage: 'email ' + recipient + ' not found'});
                            }
                            if (theUser.attributes.membership_status == npoStatus.applied_for_membership) {
                                theUser.attributes.membership_status = npoStatus.request_approved;
                                theUser.save().then(function (model) {
                                    var payLink = serverConfig.url + "/he/npo/pay_fee?user='" + recipient;
                                    mail.send(
                                        recipient,
                                        npoConfig.email,
                                        'Your Midburn membership approved!',
                                        'emails/npo_membership_approved',
                                        {name: theUser.fullName, payLink: payLink});
                                    res.redirect('/admin/npo');
                                });
                            }
                            else {
                                //TODO handle error.
                                log.warn("Incorrect status - ", theUser.attributes.membership_status);
                                return _adminRender(req, req, 'admin/admin_npo', {errorMessage: 'email ' + recipient + ' - incorrect status'});
                            }
                        });
                    }
                })
        }
    }
});

module.exports = router;
