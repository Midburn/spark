
var log = require('../../libs/logger')(module);
Event = require('../../models/event').Event
const userRole = require('../../libs/user_role');
const _ = require('lodash')
/*
.
event_id,
ext_id_event_id,
addinfo_json,
name,
gate_code,
gate_status
*/
var createEvent = function(req) 
{
    var new_event = {
        event_id: _.get(req, 'body.event_id'),
        ext_id_event_id: _.get(req, 'body.ext_id_event_id'),
        name: req.body.addinfo_json.name_he + " " + req.body.addinfo_json.name_en,
        gate_code: _.get(req, 'body.gate_code'),
        gate_status: _.get(req, 'body.gate_status'),
        created_at: _.get(req, 'body.created_at'),
        start_date: _.get(req, 'body.start_date'),
        end_date: _.get(req, 'body.end_date'),
        addinfo_json: JSON.stringify(_.get(req, 'body.addinfo_json')),
    }
    log.debug('Event received ' + new_event);
    return new_event;
}

module.exports = (app, passport) => {

    app.get('/events', (req, res) => {
        Event.fetchAll()
        .then((events) => {
            res.status(200).json(
                { 
                    events: events.toJSON()
                }
            )
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

    app.post('/events/new', 
        [userRole.isLoggedIn(), userRole.isAllowNewCamp()],
        (req, res) => {
            var new_event = createEvent(req);
            Event.forge().save(new_event)
            .then(res.send(200))
            .catch((e) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: e.message
                    }
                });
            });
        }); 

        app.put('/events/update', 
        [userRole.isLoggedIn(), userRole.isAllowNewCamp()],
        (req, res) => {
            var new_event = createEvent(req);
            var event_id = new_event.event_id;
            Event.forge({event_id: event_id}).save(new_event)
            .then(res.send(200))
            .catch((e) => {
                res.status(500).json({
                    error: true,
                    data: {
                        message: e.message
                    }
                });
            });
        }); 

    app.get('/events/:event_id',
        [userRole.isLoggedIn()],
        (req, res) => {
            var event_id = req.params.event_id;
            Event.forge({ event_id: event_id }).fetch().then((event) => {
                let props = {};
                if (typeof event.attributes.json_data === 'string') {
                    props = JSON.parse(event.attributes.json_data);
                }
                for (var prop in props) { events.attributes[prop] = props[prop]; }
                console.log(event);
                res.json({ event: event });
            });    
        });

    app.put('/events/:event/edit', 
        userRole.isLoggedIn(),
        (req, res) => {
            log.debug('EventsAPI edit ' + _.get(req, 'params.event'));
        });

    //change the current event id for camps manager or admin 
    app.post('/events/change', userRole.isLoggedIn(), (req, res) => {
        //set the new event id in the session 
        req.session.passport.user.currentEventId = req.body.currentEventId;
        req.session.save()
        res.send(200);
    });

}
