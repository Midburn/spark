const campsRouter = require ('./camps.router'),
  mainRouter = require ('./main.router'),
  eventsRouter = require ('./events.router'),
  usersRouter = require ('./users.router'),
  communitiesRouter = require ('./communities.router');

module.exports = {
  campsRouter,
  mainRouter,
  usersRouter,
  eventsRouter,
  communitiesRouter,
};
