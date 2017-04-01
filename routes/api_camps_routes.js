var User = require('../models/user').User;
var Camp = require('../models/camp').Camp;
var CampMember = require('../models/camp_member').CampMember;
var constants = require('../models/constants.js');
var config = require('config');

const userRole = require('../libs/user_role');

var mail = require('../libs/mail'),
    mailConfig = config.get('mail');

module.exports = function (app, passport) {
    /**
     * API: (GET) get user by id
     * request => /users/:id
     */
    app.get('/users/:id',
        [userRole.isLoggedIn(), userRole.isAllowToViewUser()],
        (req, res) => {
            User.forge({ user_id: req.params.id }).fetch({ columns: '*' }).then((user) => {
                if (user !== null) {
                    res.json({ name: user.get('name'), email: user.get('email'), cell_phone: user.get('cell_phone') })
                } else {
                    res.status(404).json({ message: 'Not found' })
                }

            }).catch((err) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        });
    /**
     * API: (GET) get user by email
     * request => /users/:email
     */
    app.get('/users/:email',
        [userRole.isLoggedIn()],
        (req, res) => {
            User.forge({ email: req.params.email }).fetch().then((user) => {
                if (user !== null) {
                    res.status(200).end()
                } else {
                    res.status(404).end()
                }
            }).catch((err) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        });
    /**
      * API: (POST) create camp
      * request => /camps/new
      */
    app.post('/camps/new',
        [userRole.isLoggedIn(), userRole.isAllowNewCamp()],
        (req, res) => {
            Camp.forge({
                // for new fields!
                created_at: Date(),
                event_id: constants.CURRENT_EVENT_ID,
                // for update or insert, need to merge with create to be the same call
                updated_at: Date(),
                camp_name_en: req.body.camp_name_en,
                camp_name_he: req.body.camp_name_he,
                camp_desc_he: req.body.camp_desc_he,
                camp_desc_en: req.body.camp_desc_en,
                status: req.body.status,
                type: req.body.type,
                contact_person_id: req.body.contact_person_id,
                facebook_page_url: req.body.facebook_page_url,
                contact_person_name: req.body.contact_person_name,
                contact_person_email: req.body.contact_person_email,
                contact_person_phone: req.body.contact_person_phone,
                accept_families: req.body.accept_families,
                main_contact: req.body.main_contact,
                moop_contact: req.body.moop_contact,
                safety_contact: req.body.safety_contact,
                camp_activity_time: req.body.camp_activity_time,
                child_friendly: req.body.child_friendly,
                noise_level: req.body.noise_level,
                public_activity_area_sqm: req.body.public_activity_area_sqm,
                public_activity_area_desc: req.body.public_activity_area_desc,
                support_art: req.body.support_art,
                location_comments: req.body.location_comments,
                camp_location_street: req.body.camp_location_street,
                camp_location_street_time: req.body.camp_location_street_time,
                camp_location_area: req.body.camp_location_area
            }).save().then((camp) => {
                res.json({
                    error: false,
                    data: {
                        message: 'camp created',
                        camp_id: camp.attributes.id
                    }
                });
            }).catch((e) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: e.message
                    }
                });
            });
        });

    /**
       * API: (PUT) edit camp
       * request => /camps/1/edit
       */
    app.put('/camps/:id/edit',
        [userRole.isLoggedIn(), userRole.isAllowEditCamp()],
        (req, res) => {
            Camp.forge({ id: req.params.id }).fetch().then(function (camp) {
                camp.save({
                    // for update or insert
                    updated_at: Date(),
                    event_id: constants.CURRENT_EVENT_ID,
                    camp_name_en: req.body.camp_name_en,
                    camp_name_he: req.body.camp_name_he,
                    camp_desc_he: req.body.camp_desc_he,
                    camp_desc_en: req.body.camp_desc_en,
                    status: req.body.status,
                    type: req.body.type,
                    contact_person_id: req.body.contact_person_id,
                    facebook_page_url: req.body.facebook_page_url,
                    accept_families: req.body.accept_families,
                    contact_person_name: req.body.contact_person_name,
                    contact_person_email: req.body.contact_person_email,
                    contact_person_phone: req.body.contact_person_phone,
                    main_contact: req.body.main_contact,
                    moop_contact: req.body.moop_contact,
                    safety_contact: req.body.safety_contact,
                    camp_activity_time: req.body.camp_activity_time,
                    child_friendly: req.body.child_friendly,
                    noise_level: req.body.noise_level,
                    public_activity_area_sqm: req.body.public_activity_area_sqm,
                    public_activity_area_desc: req.body.public_activity_area_desc,
                    support_art: req.body.support_art,
                    location_comments: req.body.location_comments,
                    camp_location_street: req.body.camp_location_street,
                    camp_location_street_time: req.body.camp_location_street_time,
                    camp_location_area: req.body.camp_location_area
                }).then(function () {
                    res.json({ error: false, status: 'Camp updated' });
                    // });
                }).catch(function (err) {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: err.message
                        }
                    });
                });
            }).catch(function (err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        });

    // PUBLISH
    app.put('/camps/:id/publish',
        [userRole.isAdmin()], // userRole.isAllowEditCamp() is work-in-progress
        (req, res) => {
            // If camp met all its requirements, can publish
            Camp.forge({ id: req.params.id }).fetch().then(function (camp) {
                camp.save({ web_published: '1' }).then(function () {
                    res.json({ error: false, status: 'Publish' });
                }).catch(function (err) {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: err.message
                        }
                    });
                });
            }).catch(function (err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        });
    // UNPUBLISH
    app.put('/camps/:id/unpublish',
        [userRole.isAdmin()], // userRole.isAllowEditCamp() is work-in-progress
        (req, res) => {
            Camp.forge({ id: req.params.id }).fetch().then(function (camp) {
                camp.save({ web_published: '0' }).then(function () {
                    res.json({ error: false, status: 'Unpublish' });
                }).catch(function (err) {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: err.message
                        }
                    });
                });
            }).catch(function (err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        });

    /**
     * API: (GET) return published camps with:
     * camp_name_en, camp_name_he, camp_desc_en, camp_desc_he, status,
     * accept_families, contact_person_full_name, phone, email, facebook_page
     * request => /camps_published
     * method: JSONP
     */
    app.get('/camps_published', (req, res, next) => {
        Camp.fetchAll().then((camp) => {
            var published_camps = [];
            for (var i = 0; i < camp.models.length; i++) {
                if (camp.models[i].attributes.web_published === '1' && camp.models[i].attributes.status !== 'inactive') {
                    var fetched_camp = {
                        id: camp.models[i].attributes.id,
                        name_en: camp.models[i].attributes.camp_name_en,
                        name_he: camp.models[i].attributes.camp_name_he,
                        desc_en: camp.models[i].attributes.camp_desc_en,
                        desc_he: camp.models[i].attributes.camp_desc_he,
                        contact_person_id: camp.models[i].attributes.contact_person_id,
                        facebook_page_url: camp.models[i].attributes.facebook_page_url,
                        status: camp.models[i].attributes.status,
                        accept_families: camp.models[i].attributes.accept_families
                    };
                    published_camps.push(fetched_camp);
                }
            }
            res.status(200).jsonp({ published_camps })
        }).catch((err) => {
            res.status(500).jsonp({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    __camps_update_status = function (camp_id, user_id, action, camp_mgr_id, res) {
        console.log(action + " from camp " + camp_id + " of user " + user_id + " / mgr id: " + camp_mgr_id);
        Camp.forge({ id: camp_id }).fetch().then((camp) => {
            camp.getCampUsers((users) => {
                if (camp.isCampManager(camp_mgr_id)) {
                    var user = camp.isUserInCamp(user_id);
                    var new_status;
                    var save_method = { require: true };
                    if (user && action === "approved" && user.member_status === 'pending') {
                        new_status = 'approved';
                    } else if (user && action === "remove") {
                        new_status = 'deleted';
                    } else if (user && action === "revive") {
                        new_status = 'pending';
                    } else if (action === "request_mgr") {
                        new_status = 'pending_mgr';
                        if (!user) {
                            save_method.require = false;
                            save_method.method = 'insert';
                        } else if (user.member_status === 'approved') {
                            new_status = null;
                        }

                    }
                    if (new_status) {
                        CampMember.forge({
                            camp_id: camp.attributes.id,
                            user_id: user_id,
                            // status: new_status
                        }).save({ status: new_status }, save_method).then((camp_member) => {
                            console.log(action + " from camp " + camp_member.attributes.camp_id + " of user " + camp_member.attributes.user_id + " / status: " + camp_member.attributes.status);
                            if (action === "approved") {
                                emailDeliver(user.email, 'Spark: you have been approved!', 'emails/camps/member_approved'); // notify the user
                            }
                            if (action === "request_mgr") {
                                User.forge({ user_id: user_id }).fetch().then((user) => {
                                    emailDeliver(user.attributes.email, 'Spark: Your camp manager requested to add you!', 'emails/camps/join_request');
                                });
                                // emailDeliver(user.email, 'Spark: you have been approved!', 'emails/camps/member_approved'); // notify the user
                            }
                            res.status(200).json({ data: { member: camp_member.attributes } });
                        });
                    } else {
                        res.status(404).json({ error: true, data: { message: "Cannot execute this command." } });
                    }
                } else {
                    res.status(404).json({ error: true, data: { message: "Logged user does not have permission for this command." } });
                }
            });
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            })
        });
    }
    /**
     * approve user request
     */
    app.get('/camps/:camp_id/members/:user_id/:action', userRole.isLoggedIn(), (req, res) => {
        var user_id = req.params.user_id;
        var camp_id = req.params.camp_id;
        var action = req.params.action;
        var actions = ['approved', 'remove', 'revive'];
        if (actions.indexOf(action)) {
            __camps_update_status(camp_id, user_id, action, req.user.id, res);
        } else {
            res.status(404).end();
        }

    })

    /**
     * API: (GET) return camp's contact person with:
     * name_en, name_he, email, phone
     * request => /camps_contact_person/:id
     */
    app.get('/camps_contact_person/:id', (req, res, next) => {
        User.forge({ user_id: req.params.id }).fetch({
            require: true,
            columns: ['first_name', 'last_name', 'email', 'cell_phone']
        }).then((user) => {
            res.status(200).json({ user: user.toJSON() })
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) return indication if camp exist, provide camp_name_en
     * request => /camps/<camp_name_en>
     */
    app.get('/camps/:camp_name_en', (req, res) => {
        var req_camp_name_en = req.params.camp_name_en;
        Camp.forge({ camp_name_en: req_camp_name_en }).fetch().then((camp) => {
            if (camp === null) {
                // camp name is available
                res.status(204).end();
            } else {
                res.status(200).end();
            }
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            });
        });
    });

    /**
     * API: (GET) return active user list
     * request => /users
     */
    app.get('/users', userRole.isAdmin(), (req, res) => {
        User.fetchAll().then((users) => {
            res.status(200).json({ users: users.toJSON() })
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) return camps list
     * request => /camps
     */
    app.get('/camps', (req, res) => {
        Camp.fetchAll().then((camp) => {
            res.status(200).json({ camps: camp.toJSON() })
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) return camps list which are open to new members
     * request => /camps_open
     */
    app.get('/camps_all', userRole.isAdmin(), (req, res) => {
        Camp.where('event_id', '=', constants.CURRENT_EVENT_ID).fetchAll().then((camp) => {
            if (camp !== null) {
                res.status(200).json({ camps: camp.toJSON() })
            } else {
                res.status(404).json({ data: { message: 'Not found' } })
            }
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) return camps list which are open to new members
     * request => /camps_open
     */
    app.get('/camps_open', userRole.isLoggedIn(), (req, res) => {
        Camp.where('status', '=', 'open', 'AND', 'event_id', '=', constants.CURRENT_EVENT_ID).fetchAll().then((camp) => {
            if (camp !== null) {
                res.status(200).json({ camps: camp.toJSON() })
            } else {
                res.status(404).json({ data: { message: 'Not found' } })
            }
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });

    /**
     * API: (GET) camp join request
     * params: camp_id
     * request => /camps/2/join
     */
    app.get('/camps/:id/join', userRole.isLoggedIn(), (req, res) => {
        var user = {
            id: req.user.attributes.user_id,
            full_name: [req.user.attributes.first_name, req.user.attributes.first_name].join(', '),
            email: req.user.attributes.email
        }
        var camp = {
            id: req.params.id,
            manager_email: '' // later to be added
        };

        // User is camp free and doesn't have pending join request
        // User details will be sent to camp manager for approval
        req.user.getUserCamps((camps) => {
            if (req.user.isCampFree) {
                // Fetch camp manager email address
                Camp.forge({ id: req.params.id, event_id: constants.CURRENT_EVENT_ID }).fetch({
                }).then((camp) => {
                    camp.getCampUsers((users) => {
                        if (camp.managers.length > 0) {
                            user.camp_id = camp.attributes.id;
                            res.status(200).json({
                                data: {
                                    user: user,
                                    camp: {
                                        id: camp.attributes.managers[0].user_id,
                                        manager_email: camp.attributes.managers[0].email
                                    }
                                }
                            });
                        } else {
                            res.status(404).json({
                                data: { message: 'Couldn\'t find camp manager' }
                            });
                        }
                    });
                }).catch((e) => {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: 'Failed to fetch camp ' + camp.id
                        }
                    });
                });
            } else {
                // User cannot join another camp
                res.status(404).json({ data: { message: 'User can only join one camp!' } })
            }
        });
    });
    /**
     * Deliver join request email to camp manager
     * @type {[type]}
     */
    app.post('/camps/:id/join/deliver', userRole.isLoggedIn(), (req, res) => {
        var camp_manager_email = req.body['camp[manager_email]']
        var user_id = req.user.attributes.user_id
        var camp_id = req.params.id

        CampMember.forge({ user_id: user_id }).fetch().then((join_details) => {
            join_details.save({ camp_id: camp_id, status: 'pending' }).then(() => {
                User.forge({ user_id: user_id }).fetch().then((user) => {
                    user.save({ camp_id: -1 }).then(() => {
                        emailDeliver(camp_manager_email, 'Spark: someone wants to join your camp!', 'emails/camps/join_request') // notify camp manager
                        res.status(200).json({ details: join_details.toJSON() })
                    })
                })
            })
        })
    });

    /**
     * User request to cancel camp-join pending
     */
    app.get('/users/:user_id/join_cancel', userRole.isLoggedIn(), (req, res) => {
        var user_id = req.params.user_id
        var camp_id
        var camp_manager_email

        // update relation model between user and camp
        CampMember.forge({ user_id: req.params.user_id }).fetch().then((camp_member) => {
            camp_id = camp_member.attributes.camp_id

            // fetch camp manager email,
            User.forge({ camp_id: camp_id })
                .fetch({ require: true, columns: ['email', 'roles'] })
                .then((user) => {
                    if (user.attributes.roles.indexOf('camp_manager') > -1) {
                        camp_manager_email = user.attributes.email
                    }
                    res.status(200).json({ details: camp_member.toJSON() })
                    // update camp_members request
                    camp_member.save({ camp_id: 0, status: 'user_canceled' }).then(() => {
                        // reset user's camp_id 
                        User.forge({ user_id: user_id }).fetch().then((user) => {
                            user.save({ camp_id: 0 }).then(() => {
                                // notify camp manager
                                if (camp_manager_email !== 'undefined' || camp_manager_email !== '') {
                                    emailDeliver(camp_manager_email, 'Spark: someone canceled his join request.', 'emails/camps/join_cancel')
                                }
                                res.status(200).json({ details: camp_member.toJSON() })
                            })
                        })
                    })
                })
        })
    });
    app.get('/users/:user_id/join_details', (req, res) => {
        if (req.user.isAdmin || req.user.attributes.user_id === parseInt(req.params.user_id)) {
            User.forge({ user_id: req.params.user_id }).fetch().then((user) => {
                user.getUserCamps((camps) => {
                    var camp = user.attributes.camp;
                    if (user.attributes.camp) {
                        res.status(200).json({
                            details: // camp,
                            {
                                user_id: user.attributes.user_id,
                                camp_id: camp.id,
                                status: camp.member_status,
                                camp_name_en: camp.camp_name_en,
                                camp_name_he: camp.camp_name_he,
                            }
                        });
                    }
                });
            });
        } else {
            res.status(404).json({
                error: true,
                data: {
                    message: 'Access denied for user',
                }
            });
        }
    });

    var emailDeliver = (recipient, subject, template) => {
        /**
         * Deliver email request to camp manager
         * notifiying a user wants to join his camp
         * @return {boolean} should return true if mail delivered. FIXME: in mail.js
         */
        mail.send(
            recipient,
            mailConfig.from,
            subject,
            template, {}
        )
    }

    /**
     * API: (POST) create Program
     * request => /camps/program
     */
    app.post('/camps/program', (req, res) => {
        console.log(success);
        //TODO
    });

    /**
     * API: (GET) return camp members without details
     * request => /camps/1/members/count
     */
    app.get('/camps/:id/members/count', userRole.isLoggedIn(), (req, res) => {
        Camp.forge({ id: req.params.id }).fetch({ withRelated: ['members'] }).then((camp) => {
            res.status(200).json({ members: camp.related('members').toJSON() })
        })
    })

    /**
     * API: (GET) return camp members with details
     * request => /camps/1/members
     */
    app.get('/camps/:id/members', userRole.isLoggedIn(), (req, res) => {
        Camp.forge({ id: req.params.id }).fetch().then((camp) => {
            camp.getCampUsers((members) => {
                // let _members = [];
                // for (let i in members) {
                //     if (['approved','pending','pending_mgr','appeoved_mgr'].indexOf(members[i].member_status)>-1) {
                //         _members.push(members[i]);
                //     }
                //     if (['approved','approved_mgr'].indexOf(members[i].member_status)>-1) {
                //         app_member.push(members[i]);
                //     }

                // }
                res.status(200).json({ members: members });
            });
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: 'Failed to fetch camp ' + camp.id
                }
            });
        });
    });

    /**
    * API: (POST) camp manager send member join request
    * request => /camps/1/members/add
    */
    app.post('/camps/:id/members/add', userRole.isLoggedIn(), (req, res) => {
        var user_email = req.body.user_email
        var camp_id = req.params.id
        var filter = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
        if (!filter.test(user_email)) {
            res.status(404).end();
            return;
        }
        req.user.getUserCamps((camps) => {
            if (req.user.isManagerOfCamp(req.params.id) || userRole.isAdmin()) {
                User.forge({ email: user_email }).fetch().then((user) => {
                    if (user !== null) {
                        __camps_update_status(camp_id, user.attributes.user_id, 'request_mgr', req.user.id, res);
                    } else {
                        User.forge().save({
                            email: user_email
                        }).then((user) => {
                            __camps_update_status(camp_id, user.attributes.user_id, 'request_mgr', req.user.id, res);
                        });

                    }
                });

            } else {
                res.status(404).end();
            }
        });
    })

    /**
    * API: (GET) return camp manager email
    * query user with attribute: camp_id
    * request => /camps/1/camp_manager
    */
    app.get('/camps/:id/manager', userRole.isLoggedIn(), (req, res) => {
        User.forge({ camp_id: req.params.id })
            .fetch({
                require: true,
                columns: ['email', 'roles']
            })
            .then((user) => {
                if (user.get('roles').indexOf('camp_manager')) {
                    res.status(200).json({ user: { email: user.get('email') } })
                } else {
                    res.status(404).json({ data: { message: 'Not found' } })
                }
            }).catch((e) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: e.message
                    }
                });
            });
    })
}
