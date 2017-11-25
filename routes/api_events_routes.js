const Event = require('../models/event').Event
const userRole = require('../libs/user_role');
var _creatEvent = function(req) {

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
            Events.forge(_creatEvent(req)).save()
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

}

