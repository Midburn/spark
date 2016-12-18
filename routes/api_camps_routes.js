var config = require('config');
var serverConfig = config.get('server');
var security = require('../libs/security');

var User = require('../models/user').User;
var Camp = require('../models/camp').Camp;

module.exports = function(app, passport) {

    /**
     * API: (POST) create camp
     * request => /camps/new
     */
    app.post('/camps/new', (req, res) => {
        var camp_name_he = req.body.camp_name_he,
            camp_name_en = req.body.camp_name_en;

        validate = () => {
            if (camp_name_he != null && camp_name_en != null) {
                return true;
            }
            return false;
        }

        if (validate) {
            Camp.forge({
                    camp_name_he: camp_name_he,
                    camp_name_en: camp_name_en
                        // TODO: more data attributes here
                })
                .save()
                .then((camp) => {
                    res.json({
                        error: false,
                        data: {
                            message: 'camp created'
                        }
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
     * API: (PUT) create camp
     * request => /camps/new
     */
    app.put('/camps/:id/edit', (req, res) => {
        Camp.forge({
                camp_id: req.params.id
            })
            .fetch({
                require: true
            })
            .then((camp) => {
                camp.save({
                        camp_name_he: req.params.camp_name_he,
                        camp_name_en: req.params.camp_name_en
                    })
                    .then(() => {
                        res.json({
                            error: false,
                            data: {
                                message: 'Camp details updated'
                            }
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            error: true,
                            data: {
                                message: err.message
                            }
                        });
                    });
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
     * API: (GET) return camp object, provide camp_id
     * request => /camps/1.json
     */
    app.get('/camps/:id.json', (req, res) => {
        // find and return camp object by camp_id
        Camp.forge({
                camp_id: req.params.id
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
        Camp.forge({
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
        User.fetchAll()
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
     * request => /camp-list
     */
    app.get('/camp-list', (req, res) => {
        Camp.fetchAll()
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
