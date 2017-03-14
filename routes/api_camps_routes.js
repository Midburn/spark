// var config = require('config');

var User = require('../models/user').User;
var Camp = require('../models/camp').Camp;
var CampDetails = require('../models/camp').CampDetails;
var config = require('config');

const userRole = require('../libs/user_role');

var mail = require('../libs/mail'),
    mailConfig = config.get('mail');

module.exports = function (app, passport) {
    /**
     * API: (GET) get user by id
     * request => /users/:id
     */
    app.get('/users/:id', (req, res) => {
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
     * API: (POST) create camp
     * request => /camps/new
     */
    app.post('/camps/new', (req, res) => {
        var camp_name_he = req.body.camp_name_he,
            camp_name_en = req.body.camp_name_en;

        Camp.forge({
            camp_name_he: camp_name_he,
            camp_name_en: camp_name_en,
            camp_desc_he: req.body.camp_desc_he,
            camp_desc_en: req.body.camp_desc_en,
            contact_person_id: req.body.contact_person_id,
            facebook_page_url: req.body.facebook_page_url,
            main_contact: req.body.camp_main_contact,
            moop_contact: req.body.camp_moop_contact,
            safety_contact: req.body.camp_safety_contact,
            type: req.body.camp_type,
            created_at: Date(),
            updated_at: Date()
        }).save().then((camp) => {
            res.json({
                error: false,
                data: {
                    message: 'camp created',
                    camp_id: camp.attributes.id
                }
            });
            CampDetails.forge({
                camp_id: camp.attributes.id,
                camp_activity_time: req.body.camp_hours,
                child_friendly: req.body.camp_kids_friendly,
                noise_level: req.body.noise_lvl,
                public_activity_area_sqm: req.body.size_for_activity,
                public_activity_area_desc: req.body.public_area_reason
            }).save().then((campDetails) => {
                res.status(200).json({
                    error: false,
                    data: {
                        message: 'success'
                    }
                });
            }).catch((e) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: e.message
                    }
                });
            })
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
    app.put('/camps/:id/edit', (req, res) => {

        Camp.forge({ id: req.params.id }).fetch().then(function (camp) {

            camp.save({
                // camp_name_en: req.body.camp_name_en,
                camp_name_he: req.body.camp_name_he,
                camp_desc_he: req.body.camp_desc_he,
                camp_desc_en: req.body.camp_desc_en,
                status: req.body.status,
                type: req.body.type,
                contact_person_id: req.body.contact_person_id,
                facebook_page_url: req.body.facebook_page_url,
                accept_families: req.body.accept_families,
                main_contact: req.body.main_contact,
                moop_contact: req.body.moop_contact,
                safety_contact: req.body.safety_contact
            }).then(function () {
                // TODO: not working with this table. need-a-fix
                CampDetails.forge({
                    camp_id: req.params.id,
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
                }).save().then(() => {
                    res.json({ error: false, status: 'Camp updated' });
                });
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
    app.put('/camps/:id/publish', (req, res) => {
        // If camp met all its requirements, can publish
        Camp.forge({ id: req.params.id }).fetch().then(function (camp) {
            camp.save({ enabled: '1' }).then(function () {
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
    app.put('/camps/:id/unpublish', (req, res) => {
        Camp.forge({ id: req.params.id }).fetch().then(function (camp) {
            camp.save({ enabled: '0' }).then(function () {
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
                if (camp.models[i].attributes.enabled === '1' && camp.models[i].attributes.status !== 'inactive') {
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
    /**
     * API: (GET) return camp's contact person with:
     * name_en, name_he, email, phone
     * request => /camps_contact_person/:id
     * method: JSONP
     */
    app.get('/camps_contact_person/:id', (req, res, next) => {
        // Allow this address to http-request to this endpoint.
        // var API_PUBLISHED_CAMPS_ALLOW_ORIGIN;
        // if (app.get('env') === 'development') {
        //    API_PUBLISHED_CAMPS_ALLOW_ORIGIN = config.get('published_camps_origin.dev');
        // } else {
        //   API_PUBLISHED_CAMPS_ALLOW_ORIGIN = config.get('published_camps_origin.prod');
        // }
        //
        // res.header('Access-Control-Allow-Origin', API_PUBLISHED_CAMPS_ALLOW_ORIGIN);
        // res.header('Access-Control-Allow-Methods', 'GET');
        // res.header('Access-Control-Allow-Headers', 'Content-Type');
        User.forge({ user_id: req.params.id }).fetch({
            require: true,
            columns: ['first_name', 'last_name', 'email', 'cell_phone']
        }).then((user) => {
            res.status(200).jsonp({ user: user.toJSON() })
        }).catch((err) => {
            res.status(500).jsonp({
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
    app.get('/users', (req, res) => {
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
    app.get('/camps_open', (req, res) => {
        Camp.forge({ status: 'open' }).fetch({
            require: true,
            columns: ['id', 'camp_name_en']
        }).then((camp) => {
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
        var camp_id = req.params.id,
            user_id = req.user.attributes.user_id,
            user_email = req.user.attributes.email,
            users_camp_id = req.user.attributes.camp_id;

        // User is camp free and doesn't have pending request
        // User details will be sent to camp manager for approval
        if (users_camp_id === null || users_camp_id === 0 || users_camp_id !== -1) {
            // Fetch camp manager email address
            var camp_manager_email;

            User.forge({ camp_id: req.params.id })
                .fetch({
                    require: true,
                    columns: ['email', 'roles']
                })
                .then((user) => {
                    if (user.get('roles').indexOf('camp_manager') > -1) {
                        camp_manager_email = user.get('email')
                        _deliverRequest()
                    } else {
                        console.log('Couldn\'t find camp manager');
                    }
                }).catch((e) => {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: e.message
                        }
                    });
                });

            function _deliverRequest() {
                // Send email request to camp manager
                mail.send(
                    camp_manager_email,
                    mailConfig.from,
                    'Spark: someone wants to join your camp!',
                    'emails/camps/join_request', {
                        camp: { name: req.body.camp_name_en },
                        user: { name: req.body.user_fullname, email: req.body.user_email }
                    });
            }

            // Response
            res.json({ data: { message: 'Join request sent to camp manager.' } });
        } else {
            // User cannot join another camp
            res.status(404).json({ data: { message: 'User can only join one camp!' } })
        }
    });

    /**
     * API: (POST) create Program
     * request => /camps/program
     */
    app.post('/camps/program', (req, res) => {
        console.log(success);
        //TODO
    });

    /**
     * API: (GET) return camp members, provide camp id
     * query user with attribute: camp_id
     * request => /camps/1/members
     */
    app.get('/camps/:id/members', (req, res) => {
        User.forge({ camp_id: req.params.id }).fetch({ require: true }).then((users) => {
            res.status(200).json({ users: users.toJSON() })
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
     * API: (GET) return camp manager email
     * query user with attribute: camp_id
     * request => /camps/1/camp_manager
     */
    app.get('/camps/:id/manager', (req, res) => {
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
