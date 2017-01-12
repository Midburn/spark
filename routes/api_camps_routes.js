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
        User
            .forge({
                user_id: req.params.id
            })
            .fetch({
                columns: '*'
            })
            .then((user) => {
                res.json({
                    fullname: user.get('fullName'),
                    phone: user.get('email'),
                    email: user.get('cell_phone')
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

        console.log(req.body);

        validate = () => {
            if (camp_name_he != null && camp_name_en != null) {
                return true;
            }
            return false;
        }

        if (validate) {
            Camp
                .forge({
                    camp_name_he: camp_name_he,
                    camp_name_en: camp_name_en,
                    camp_desc_he: req.body.camp_desc_he,
                    camp_desc_en: req.body.camp_desc_en,
                    type: req.body.camp_type,
                    status: 1,
                    main_contact: req.body.camp_main_contact,
                    moop_contact: req.body.camp_moop_contact,
                    safety_contact: req.body.camp_safety_contact
                })
                .save()
                .then((camp) => {
                    res.json({
                        error: false,
                        data: {
                            message: 'camp created'
                        }
                    });
                    CampDetails.forge({
                      camp_id: camp.attributes.id,
                      camp_activity_time: req.body.camp_hours,
                      child_friendly: (req.body.camp_kids_friendly) ? 1: 0,
                      noise_level: req.body.noise_lvl,
                      public_activity_area_sqm: req.body.size_for_activity,
                      public_activity_area_desc: req.body.public_area_reason
                    })
                    .save()
                    .then((campDetails) => {
                      console.log('success adding camp objects');
                    })
                    .catch((e) => {
                      console.log(`Error creating campdetails object for campid ${camp.attributes.id}`);
                      console.log(e);
                    })
                })
                .catch((e) => {
                    res.status(500).json({
                        error: true,
                        data: {
                            message: e.message
                        }
                    });
                });
        } else {
            res.status(500).json({
                error: true,
                data: {
                    message: "No data provided"
                }
            });
        }
    });

    /**
     * API: (PUT) edit camp
     * request => /camps/1/edit
     */
    app.put('/camps/:id/edit', (req, res) => {
        Camp.forge({
                id: req.params.id
            })
            .fetch({
                require: true
            })
            .then(function(camp) {
                camp.save({
                        camp_name_he: req.body.camp_name_he,
                        camp_name_en: req.body.camp_name_en,
                        camp_desc_he: req.body.camp_desc_he,
                        camp_desc_en: req.body.camp_desc_en,
                        main_contact: req.body.main_contact,
                        moop_contact: req.body.moop_contact,
                        safety_contact: req.body.safety_contact,
                        camp_status: req.body.status,
                        camp_type: req.body.type,
                        camp_enabled: req.body.enabled
                    })
                    .then(function() {
                        res.json({
                            error: false,
                            data: camp.toJSON()
                        });
                    })
                    .catch(function(err) {
                        res.status(500).json({
                            error: true,
                            data: {
                                message: err.message
                            }
                        });
                    });
            })
            .catch(function(err) {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
    })

    /**
     * API: (GET) return camp object, provide camp id
     * request => /camps/1.json
     */
    app.get('/camps/:id.json', (req, res) => {
        // find and return camp object by camp id
        Camp
            .forge({
                id: req.params.id
            })
            .fetch()
            .then((collection) => {
                res.json({
                    error: false,
                    data: collection.toJSON()
                });
            })
            .catch((e) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: e.message
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
        Camp
            .forge({
                camp_name_en: req_camp_name_en
            })
            .fetch()
            .then((camp) => {
                if (camp === null) {
                    // camp name is available
                    res.status(204).end();
                } else {
                    res.status(200).end();
                }
            })
            .catch((e) => {
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
        User
            .fetchAll()
            .then((users) => {
                res.status(200).json({
                    users: users.toJSON()
                })
            })
            .catch((err) => {
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
        Camp
            .fetchAll()
            .then((camp) => {
                res.status(200).json({
                    camps: camp.toJSON()
                })
            })
            .catch((err) => {
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
        Camp
            .forge({
                camp_status: 'open',
                camp_enabled: 1
            })
            .fetch()
            .then((camp) => {
                res.status(200).json({
                    camps: camp.toJSON()
                })
            })
            .catch((err) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
    });
}
