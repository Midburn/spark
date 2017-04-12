const common = require('../libs/common').common;
var User = require('../models/user').User;
var Camp = require('../models/camp').Camp;
const constants = require('../models/constants.js');
var config = require('config');
const knex = require('../libs/db').knex;
const userRole = require('../libs/user_role');
var mail = require('../libs/mail'),
    mailConfig = config.get('mail');

module.exports = (app, passport) => {
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

    var __camps_create_camp_obj = function (req, isNew) {
        var data = {
            __prototype: constants.prototype_camps.THEME_CAMP.id,
            event_id: constants.CURRENT_EVENT_ID,
            // for update or insert, need to merge with create to be the same call
            updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
            camp_desc_he: req.body.camp_desc_he,
            camp_desc_en: req.body.camp_desc_en,
            status: req.body.status,
            type: req.body.type,
            facebook_page_url: req.body.facebook_page_url,
            contact_person_name: req.body.contact_person_name,
            contact_person_email: req.body.contact_person_email,
            contact_person_phone: req.body.contact_person_phone,
            accept_families: req.body.accept_families,
            camp_activity_time: req.body.camp_activity_time,
            child_friendly: req.body.child_friendly,
            noise_level: req.body.noise_level,
            support_art: req.body.support_art,
        }
        var __update_prop_foreign = function (propName) {
            if (parseInt(req.body[propName]) > 0) {
                data[propName] = req.body[propName];
            }
        }
        var __update_prop = function (propName) {
            if (req.body[propName] !== undefined) {
                data[propName] = req.body[propName];
            }
        }
        if (isNew) {
            data.created_at =(new Date()).toISOString().substring(0, 19).replace('T', ' ');
        }
        if (isNew || req.user.isAdmin) {
            __update_prop('camp_name_en');
            __update_prop('camp_name_he');
        }
        __update_prop_foreign('main_contact_person_id');
        __update_prop_foreign('main_contact');
        __update_prop_foreign('moop_contact');
        __update_prop_foreign('safety_contact');

        if (req.user.isAdmin) {
            __update_prop('public_activity_area_sqm');
            __update_prop('public_activity_area_desc');
            __update_prop('location_comments');
            __update_prop('camp_location_street');
            __update_prop('camp_location_street_time');
            __update_prop('camp_location_area');
        }
        // console.log(data);
        return data;
    }
    /**
      * API: (POST) create camp
      * request => /camps/new
      */
    app.post('/camps/new',
        [userRole.isLoggedIn(), userRole.isAllowNewCamp()],
        (req, res) => {
            Camp.forge(__camps_create_camp_obj(req, true)).save().then((camp) => {
                __camps_update_status(camp.attributes.id, camp.attributes.main_contact, 'approve_new_mgr', req.user, res);
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
            Camp.forge({ id: req.params.id }).fetch().then((camp) => {
                camp.save(__camps_create_camp_obj(req, false)).then(() => {
                    res.json({ error: false, status: 'Camp updated' });
                    // });
                }).catch((err) => {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: err.message
                        }
                    });
                });
            }).catch((err) => {
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
            Camp.forge({ id: req.params.id }).fetch().then((camp) => {
                camp.save({ web_published: '1' }).then(() => {
                    res.json({ error: false, status: 'Publish' });
                }).catch((err) => {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: err.message
                        }
                    });
                });
            }).catch((err) => {
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
            Camp.forge({ id: req.params.id }).fetch().then((camp) => {
                camp.save({ web_published: '0' }).then(() => {
                    res.json({ error: false, status: 'Unpublish' });
                }).catch((err) => {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: err.message
                        }
                    });
                });
            }).catch((err) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        });

    __camps_update_status = (camp_id, user_id, action, camp_mgr, res) => {
        var isAdmin = false;
        var camp_mgr_id;
        if (camp_mgr instanceof User) {
            camp_mgr_id = camp_mgr.id;
            isAdmin = camp_mgr.isAdmin;
        } else {
            camp_mgr_id = parseInt(camp_mgr);
        }
        console.log(action + " from camp " + camp_id + " of user " + user_id + " / mgr id: " + camp_mgr_id);
        Camp.forge({ id: camp_id }).fetch().then((camp) => {
            camp.getCampUsers((users) => {
                var new_status;
                var save_method = { require: true };
                var mail_delivery = {
                    template: '',
                    subject: '',
                    to_mail: '',
                };
                var user = camp.isUserInCamp(user_id);

                // camp manager commands
                if (action === 'approve_new_mgr' && (camp_mgr_id === camp.attributes.main_contact || isAdmin)) {
                    new_status = 'approved';
                    if (!user) {
                        save_method.require = false;
                        save_method.method = 'insert';
                    }
                } else if (camp.isCampManager(camp_mgr_id) || isAdmin) {
                    if (user && action === "approve" && user.can_approve) {
                        mail_delivery.to_mail = user.email;
                        mail_delivery.subject = 'Spark: you have been approved!';
                        mail_delivery.template = 'emails/camps/member_approved';
                        new_status = 'approved';
                    } else if (user && action === "remove" && user.can_remove) {
                        new_status = 'deleted';
                    } else if (user && action === "reject" && user.can_reject) {
                        mail_delivery.to_mail = user.email;
                        mail_delivery.subject = 'Spark: you have been Rejected!';
                        mail_delivery.template = 'emails/camps/member_rejected';
                        new_status = 'rejected';
                    } else if (user && action === "revive") {
                        new_status = 'pending';
                    } else if (action === "request_mgr") {
                        new_status = 'pending_mgr';
                        mail_delivery.to_mail = '';
                        mail_delivery.subject = 'Spark: you have been requested to join camp';
                        mail_delivery.template = 'emails/camps/member_request';
                        if (!user) {
                            save_method.require = false;
                            save_method.method = 'insert';
                        } else if (user.member_status === 'approved') {
                            new_status = null;
                        }
                    }
                } else {
                    var camp_manager = camp.isCampManager(camp.attributes.main_contact);
                    if (action === 'join') {
                        new_status = 'pending';
                        if (camp_manager) {
                            mail_delivery.subject = 'Spark: Someone wants to join your camp!';
                            mail_delivery.template = 'emails/camps/join_request';
                            mail_delivery.to_mail = camp_manager.email;
                        }
                        if (!user) {
                            save_method.require = false;
                            save_method.method = 'insert';
                        } else if (user.member_status === 'approved') {
                            new_status = null;
                        }
                    } else if (action === 'join_mgr' && user && user.member_status === 'pending_mgr' && camp_mgr_id === user_id) {
                        new_status = 'approved';
                        if (camp_manager) {
                            mail_delivery.subject = 'Spark: A member approved himself to your camp!';
                            mail_delivery.template = 'emails/camps/member_approved';
                            mail_delivery.to_mail = camp_manager.email;
                        }
                    } else if (action === 'join_cancel' && user && user.member_status !== 'deleted' && camp_mgr_id === user_id) {
                        new_status = 'deleted';
                        if (camp_manager) {
                            mail_delivery.subject = 'Spark: A member canceled himself from your camp!';
                            mail_delivery.template = 'emails/camps/join_cancel';
                            mail_delivery.to_mail = camp_manager.email;
                        }
                    }
                }
                if (new_status) {
                    var data = {
                        camp_id: camp.attributes.id,
                        user_id: user_id,
                        status: new_status
                    };
                    var query = '';
                    if (save_method.method === 'insert') {
                        query = knex(constants.CAMP_MEMBERS_TABLE_NAME).insert(data).toString();
                    } else {
                        query = 'UPDATE ' + constants.CAMP_MEMBERS_TABLE_NAME + ' SET status="' + data.status + '" WHERE camp_id=' + data.camp_id + ' AND user_id=' + data.user_id + ';';
                    }
                    var _after_update = () => {
                        console.log(action + " from camp " + data.camp_id + " of user " + data.user_id + " / status: " + data.status);
                        if (mail_delivery.template !== '') {
                            if (mail_delivery.to_mail !== '') {
                                emailDeliver(mail_delivery.to_mail, mail_delivery.subject, mail_delivery.template, { user: user }); // notify the user
                            } else {
                                User.forge({ user_id: user_id }).fetch().then((user) => {
                                    emailDeliver(user.attributes.email, mail_delivery.subject, mail_delivery.template, { user: user }); // notify the user
                                });
                            }
                        }
                        var res_data = { data: { member: data } };
                        if (action === 'approve_new_mgr') {
                            res_data.data.message = 'camp created';
                            res_data.data.camp_id = camp_id;
                        }
                        res.status(200).json(res_data);

                    }
                    knex.raw(query).then(_after_update);
                } else {
                    res.status(404).json({ error: true, data: { message: "Cannot execute this command." } });
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
        var actions = ['approve', 'remove', 'revive', 'reject'];
        if (actions.indexOf(action) > -1) {
            __camps_update_status(camp_id, user_id, action, req.user, res);
        } else {
            res.status(404).json({ error: true, data: { message: "illegal command (" + action + ")" } });
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
    app.get('/camps/:camp_name_en', userRole.isLoggedIn(), (req, res) => {
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
     * API: (GET) return active user list.
     *  if req.user.isAdmin - return all users
     *  if req.user.isCampManager - return all users from all camps
     *  else return req.user
     * request => /users
     */
    app.get('/users', (req, res) => {
        if (req.user.isAdmin) {
            User.where('validated', '=', '1').fetchAll().then((users) => {
                // User.forge({ validated: true }).fetchAll().then((users) => {
                // console.log(users);
                var _users = users.toJSON();
                for (var i in _users) {
                    common.__updateUserRec(_users[i]);
                    // console.log(_users[i]);
                }
                res.status(200).json({ users: _users })
            }).catch((err) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        } else {
            res.status(200).json({ users: [req.user.toJSON()] })
        }
    });

    /**
     * API: (GET) return camps list
     * request => /camps
     */
    app.get('/camps', (req, res) => {
        Camp.where('status', '=', 'open', 'AND', 'event_id', '=', constants.CURRENT_EVENT_ID, 'AND', '__prototype', '=', constants.prototype_camps.THEME_CAMP.id).fetchAll().then((camp) => {
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
    app.get('/camps_all', userRole.isAdmin(), (req, res) => {
        Camp.where('event_id', '=', constants.CURRENT_EVENT_ID, 'AND', '__prototype', '=', constants.prototype_camps.THEME_CAMP.id).fetchAll().then((camp) => {
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
        Camp.where('status', '=', 'open', 'AND', 'event_id', '=', constants.CURRENT_EVENT_ID, 'AND', '__prototype', '=', constants.prototype_camps.THEME_CAMP.id).fetchAll().then((camp) => {
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
            full_name: [req.user.attributes.first_name, req.user.attributes.last_name].join(', '),
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
                Camp.forge({ id: req.params.id, event_id: constants.CURRENT_EVENT_ID, __prototype: constants.prototype_camps.THEME_CAMP.id }).fetch({
                }).then((camp) => {
                    camp.getCampUsers((users) => {
                        if (camp.managers.length > 0) {
                            user.camp_id = camp.attributes.id;
                            res.status(200).json({
                                data: {
                                    user: user,
                                    camp: {
                                        id: camp.attributes.id,
                                        manager_id: camp.attributes.managers[0].user_id,
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
    app.all('/camps/:id/join/deliver', userRole.isLoggedIn(), (req, res) => {
        var user_id = req.user.attributes.user_id;
        var camp_id = req.params.id;
        __camps_update_status(camp_id, user_id, 'join', user_id, res);
    });

    /**
     * User request to cancel camp-join request
     */
    app.get('/users/:id/join_cancel', userRole.isLoggedIn(), (req, res) => {
        var user_id = req.user.attributes.user_id;
        var camp_id = req.params.id;
        __camps_update_status(camp_id, user_id, 'join_cancel', user_id, res);
    });

    /**
     * User request to cancel camp-join pending
     */
    app.get('/users/:id/join_approve', userRole.isLoggedIn(), (req, res) => {
        var user_id = req.user.attributes.user_id;
        var camp_id = req.params.id;
        __camps_update_status(camp_id, user_id, 'join_mgr', user_id, res);
    });

    app.get('/users/:user_id/join_details', userRole.isLoggedIn(), (req, res) => {
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
                                member_status: camp.member_status,
                                member_status_i18n: camp.member_status_i18n,
                                camp_name_en: camp.camp_name_en,
                                camp_name_he: camp.camp_name_he,
                            }
                        });
                    }
                }, req.t);
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

    var emailDeliver = (recipient, subject, template, props) => {
        /**
         * Deliver email request to camp manager
         * notifiying a user wants to join his camp
         * @return {boolean} should return true if mail delivered. FIXME: in mail.js
         */
        console.log('Trying to send mail to ' + recipient + ' from ' + mailConfig.from + ': ' + subject + ', template ' + template);
        mail.send(
            recipient,
            mailConfig.from,
            subject,
            template, props
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
                if (camp.isCampManager(req.user.id, req.t) || req.user.isAdmin) {
                    res.status(200).json({ members: members });
                } else {
                    res.status(500).json({ error: true, data: { message: 'Permission denied' } });
                }
            }, req.t);
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
            res.status(500).json({ error: true, data: { message: 'Bad email entered!' } });
            return;
        }
        req.user.getUserCamps((camps) => {
            if (req.user.isManagerOfCamp(camp_id) || req.user.isAdmin) {
                User.forge({ email: user_email }).fetch().then((user) => {
                    if (user !== null) {
                        // check that user is only at one camp!
                        user.getUserCamps((camps) => {
                            if (camps.length === 0 || user.isUserInCamp(camp_id)) {
                                __camps_update_status(camp_id, user.attributes.user_id, 'request_mgr', req.user, res);
                            } else {
                                res.status(500).json({ error: true, data: { message: 'Already applied to different camp!' } });
                            }
                        });
                    } else {
                        User.forge().save({
                            updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
                            created_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
                            email: user_email
                        }).then((user) => {
                            __camps_update_status(camp_id, user.attributes.user_id, 'request_mgr', req.user, res);
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

    // Delete, make camp inactive
    app.post('/camps/:id/remove', userRole.isAdmin(), (req, res) => {
        Camp.forge({ id: req.params.id })
            .fetch().then((camp) => {
                camp.save({ status: 'inactive' }).then(() => {
                    res.status(200).end()
                }).catch((err) => {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: err.message
                        }
                    });
                });
            });
    })

}
