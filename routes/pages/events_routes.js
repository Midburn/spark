const userRole = require("../../libs/user_role");
const Event = require("../../models/event").Event;
const express = require("express");
const router = express.Router();

router.get("/", userRole.isAdmin(), (req, res) => {
    req.breadcrumbs([{
        name: 'breadcrumbs.home',
        url: '/' + req.params.lng + '/home'
    },
    {
        name: 'events:nav_admin',
        url: '/' + req.params.lng + '/events-admin'
    }]);
    res.render("pages/events/index", {
        breadcrumbs: req.breadcrumbs(),
        t_prefix: "events:"
    });
});

router.get("/new", userRole.isAdmin(), (req, res) => {
    const data = {
        t_prefix: "events:",
        event: {
            created_at: new Date(),
            addinfo_json: {}
        },
        isNew: true
    };
    res.render("pages/events/edit", data);
});

// Read
router.get("/reset", userRole.isAdmin(), (req, res) => {
    Event.where({ event_id: req.user.currentEventId })
        .fetch()
        .then(json => {
            return json.attributes;
        })
        .then(event => {
            event.addinfo_json = event.addinfo_json ? JSON.parse(event.addinfo_json) : {};
            const data = {
                t_prefix: "events:",
                event: event
            };
            res.render("pages/events/reset", data);
        });
});

// Read
router.get("/:id", userRole.isAdmin(), (req, res) => {
    Event.where({ event_id: req.params.id })
        .fetch()
        .then(json => {
            return json.attributes;
        })
        .then(event => {
            event.addinfo_json = event.addinfo_json ? JSON.parse(event.addinfo_json) : {};
            const data = {
                t_prefix: "events:",
                event: event
            };
            res.render("pages/events/edit", data);
        });
});

module.exports = router;
