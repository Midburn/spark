const userRole = require('../libs/user_role');
const Event = require('../models/event').Event;
    
module.exports = function (app, passport) {

    app.get('/:lng/events-admin', userRole.isAdmin(), (req, res) => {
        // res.send('Events Index')
        res.render('pages/events/index', {
            t_prefix: 'events:',
            event: {},
        })
    });

    // Read
    app.get('/:lng/events-admin/:id', userRole.isAdmin(), (req, res) => {
        Event.where({ event_id: req.params.id }).fetch()
            .then(json => {
                return json.attributes
            }).then(event => {
                event.addinfo_json = JSON.parse(event.addinfo_json);
                const data = {
                    t_prefix: 'events:',
                    'event': event,
                }
                res.render('pages/events/edit', data);
            })
    });

};
