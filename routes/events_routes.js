const userRole = require("../libs/user_role");
const Event = require("../models/event").Event;

module.exports = function(app, passport) {
    app.get("/:lng/events-admin", userRole.isAdmin(), (req, res) => {
        // res.send('Events Index')
        res.render("pages/events/index", {
            t_prefix: "events:",
            event: {}
        });
    });

    app.get("/:lng/events-admin/new", userRole.isAdmin(), (req, res) => {
        const data = {
            t_prefix: "events:",
            event: {
                addinfo_json : {
                    created_at : new Date()
                },

            },
            isNew: true
        };
        res.render("pages/events/edit", data);
    });

    // Read
    app.get("/:lng/events-admin/:id", userRole.isAdmin(), (req, res) => {
        Event.where({ event_id: req.params.id })
            .fetch()
            .then(json => {
                return json.attributes;
            })
            .then(event => {
                event.addinfo_json = event.addinfo_json ? JSON.parse(event.addinfo_json) : {};
                const data = {
                    t_prefix: "events:",
                    event: event,
                    isNew: false
                };
                res.render("pages/events/edit", data);
            });
    });
};
