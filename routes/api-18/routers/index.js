const campsRouter = require('./camps.router'),
    mainRouter = require('./main.router'),
    eventsRouter = require('./events.router'),
    usersRouter = require('./users.router');
console.log('ROUTERS INIT');
module.exports = {
    campsRouter,
    mainRouter,
    usersRouter,
    eventsRouter
};
