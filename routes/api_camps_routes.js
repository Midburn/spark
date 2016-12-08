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
    app.post('/camps/new', function(req, res) {
        var camp_name_he = req.body.camp_name_he,
            camp_name_en = req.body.camp_name_en;
        if (camp_name_he != null && camp_name_en != null) {
            Camp.forge({
                    camp_name_he: camp_name_he,
                    camp_name_en: camp_name_en
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
                .catch(function(e) {
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
     * API: (GET) return camp, provide camp_id
     * request => /camps/1.json
     */
    app.get('/camps/:id.json', function(req, res) {
        var req_camp_id = req.params.id;
        // find and return camp object by camp_id
        return new Camp({
                camp_id: req_camp_id
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
     * API: (GET) return true/false if camp exist, provide camp_name_en
     * request => /camps/<camp_name_en>
     */
    app.get('/camps/:camp_name_en', (req, res) => {
        var req_camp_name_en = req.params.camp_name_en;
        // TODO: create service for name choosing
    });
}
