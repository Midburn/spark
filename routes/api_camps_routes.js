var config = require('config');
var serverConfig = config.get('server');
var security = require('../libs/security');

var User = require('../models/user').User;
var Camp = require('../models/camp').Camp;
var CampDetails = require('../models/camp').CampDetails;

module.exports = function(app, passport) {
    /**
     * API: (GET) get user by id
     * request => /userss/:id
     */
    app.get('/users/:id', (req, res) => {
        User.forge({user_id: req.params.id}).fetch({columns: '*'}).then((user) => {
            res.json({name: user.get('name'), email: user.get('email'), cell_phone: user.get('cell_phone')})
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });;
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
            contact_person_id: req.body.contact_person,
            facebook_page_url: req.body.facebook_page_url,
            main_contact: req.body.camp_main_contact,
            moop_contact: req.body.camp_moop_contact,
            safety_contact: req.body.camp_safety_contact,
            type: req.body.camp_type,
            created_at: Date()
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
                        message: err.message
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
        Camp.forge({id: req.params.id}).fetch().then(function(camp) {
            camp.save({
                // camp_name_en: req.body.camp_name_en,
                camp_name_he: req.body.camp_name_he,
                camp_desc_he: req.body.camp_desc_he,
                camp_desc_en: req.body.camp_desc_en,
                status: req.body.status,
                type: req.body.type,
                contact_person_id: req.body.contact_person,
                facebook_page_url: req.body.facebook_page_url,
                main_contact: req.body.main_contact,
                moop_contact: req.body.moop_contact,
                safety_contact: req.body.safety_contact,
            }).then(function() {
                res.json({error: false, status: 'updated'});
            }).catch(function(err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        }).catch(function(err) {
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
        Camp.forge({id: req.params.id}).fetch().then(function(camp) {
            camp.save({enabled: '1'}).then(function() {
                res.json({error: false, status: 'Publish'});
            }).catch(function(err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        }).catch(function(err) {
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
        Camp.forge({id: req.params.id}).fetch().then(function(camp) {
            camp.save({enabled: '0'}).then(function() {
                res.json({error: false, status: 'Unpublish'});
            }).catch(function(err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        }).catch(function(err) {
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
     * request => /published_camps
     */
    app.get('/published_camps', (req, res) => {
        Camp.forge({enabled: 1}).fetch({
            columns: ['camp_name_en', 'camp_name_he', 'camp_desc_en', 'camp_desc_he', 'status', 'accept_families', 'facebook_page_url', 'contact_person_id']
        }).then((camp) => {
            res.status(200).json({camps: camp.toJSON()})
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
        Camp.forge({camp_name_en: req_camp_name_en}).fetch().then((camp) => {
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
            res.status(200).json({users: users.toJSON()})
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
            res.status(200).json({camps: camp.toJSON()})
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
     * API: (GET) return enabled & open camps list
     * request => /camps_open
     */
    app.get('/camps_open', (req, res) => {
        Camp.forge({status: 'open', enabled: '1'}).fetch().then((camp) => {
            if (camp !== null) {
                res.status(200).json({camps: camp.toJSON()})
            } else {
                res.status(404).send('Not found');
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
     * API: (GET) send camp join request
     * request => /camps/join
     */
    app.get('/camps/join/:camp_id/:id', (req, res) => {
        var camp_id = req.params.camp_id,
            user_id = req.params.id;
        // Send email to camp manager for a join request, with user details;
        User.forge({user_id: user_id}).fetch({require: true, columns: '*'}).then((user) => {
            res.json({first_name: user.get('first_name'), last_name: user.get('last_name'), email: user.get('email'), cell_phone: user.get('cell_phone')});
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
     * API: (POST) receive request and forward to mail
     * request => /camps/join/request
     */
    app.post('/camps/join/request', (req, res) => {
        res.status(200).json({error: false})
    });

    /**
     * API: (POST) create Program
     * request => /camps/program
     */
    app.post('/camps/program', (req, res) => {
        console.log(success);
        //TODO
    });
}
