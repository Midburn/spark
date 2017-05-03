const common = require('../libs/common').common;
var User = require('../models/user').User;
// var Camp = require('../models/camp').Camp;
const constants = require('../models/constants.js');
// var config = require('config');
// const knex = require('../libs/db').knex;
// const userRole = require('../libs/user_role');
// var mail = require('../libs/mail'),
//     mailConfig = config.get('mail');
//
var __gate_change_status = function (user_id, status, req, res) {
    if (req.user.isAdmin) {
        if (['in', 'out'].indexOf(status) > -1) {
            let _forge = {};
            if (typeof user_id === "number") {
                _forge.user_id = user_id;
            } else if (common.validateEmail(user_id)) {
                _forge.email = user_id;
            } else {
                res.status(500).json({ error: true, data: { message: 'Unrecognized user id or email' } });
                return;
            }

            User.forge({ _forge }).fetch().then((user) => {
                let addinfo_json = {};
                if (user && typeof(user.attributes.addinfo_json) === 'string') {
                    addinfo_json = JSON.parse(user.attributes.addinfo_json);
                }
                if (addinfo_json.current_status_log instanceof Array) {
                    addinfo_json.current_status_log = [];
                }

                let _newSettings = {
                    current_event_id: constants.CURRENT_EVENT_ID,
                    current_last_status: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
                    current_status: status,
                }
                addinfo_json.current_status_log.push(_newSettings);
                _newSettings.addinfo_json = JSON.stringify(addinfo_json);
                user.save(_newStatus).then((user) => {
                    let _res_data = {
                        user_id: user.attributes.user_id,
                        email: user.attributes.email,
                        event_id: user.attributes.current_event_id,
                        current_status: user.attributes.current_status,
                        current_status_time: user.attributes.current_last_status,
                    };
                    res.status(200).json({ error: false, data: _res_data });
                });
            }).catch((err) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: err.message
                    }
                });
            });
        } else {
            res.status(500).json({ error: true, data: { message: 'Unrecognized status IN and OUT' } });
        }
    } else {
        res.status(500).json({ error: true, data: { message: 'Not authorized to change user status' } });
    }
}

module.exports = (app, passport) => {
    /**
     * API: (GET) Set the location of the profile of event_id current status to be inside event
     *
     * request => /gate/event_in/id/:user_id
     */
    app.get('/gate/event_in/id/:user_id', userRole.isLoggedIn(), (req, res) => {
        let user_id = req.params.user_id;
        __gate_change_status(parseInt(user_id), 'in', req, res);
    });
    /**
     * API: (GET) Set the location of the profile of event_id current status to be inside event
     *
     * request => /gate/event_in/id/:user_id
     */
    app.get('/gate/event_out/id/:user_id', userRole.isLoggedIn(), (req, res) => {
        let user_id = req.params.user_id;
        __gate_change_status(parseInt(user_id), 'out', req, res);
    });
    /**
     * API: (GET) Set the location of the profile of event_id current status to be inside event
     *
     * request => /gate/event_in/id/:user_id
     */
    app.get('/gate/event_in/email/:email', userRole.isLoggedIn(), (req, res) => {
        let email = req.params.email;
        __gate_change_status(email, 'in', req, res);
    });
    /**
     * API: (GET) Set the location of the profile of event_id current status to be inside event
     *
     * request => /gate/event_in/id/:user_id
     */
    app.get('/gate/event_out/email/:email', userRole.isLoggedIn(), (req, res) => {
        let email = req.params.email;
        __gate_change_status(email, 'in', req, res);
    });
}
