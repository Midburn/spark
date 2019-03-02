const Router = require ('express').Router,
  constants = require ('../../../models/constants'),
  userRole = require ('../../../libs/user_role'),
  helperService = require ('../services').helperService,
  request = require ('request'),
  config = require ('config'),
  apiTokensConfig = config.get ('api_tokens');
class CommunitiesRouter {
  constructor () {
    this.router = Router ();
    this.prefix = constants.ROUTER_PREFIXES.COMMUNITIES;
    this.initMiddlewares ();
    this.initRoutes ();
    /**
         * Error middleware - catch all `next(Error)` in a single place
         * keep this as the last middleware (and after all routes)
         */
    this.COMMUNITIES_URL = ['staging', 'production'].includes (
      process.env.NODE_ENV
    )
      ? `${process.env.COMMUNITIES_URL || 'http://communities:3006'}`
      : `http://localhost:3006`;
    this.router.use (helperService.errorMiddleware (this.prefix));
  }

  initMiddlewares () {
    this.router.use (userRole.isApiLoggedIn (userRole.isLoggedIn ()));
  }

  initRoutes () {
    console.log ('Communities router running');
    this.router.use ((req, res, next) => {
      const method = req.method.toLowerCase ();
      const headers = {
        Accept: 'application/json',
        token: apiTokensConfig.token,
          Cookie: req.headers.cookie
      };
      const cb = (err, response, body) => {
        if (err) {
          return next (err);
        }
        return res.status (response.statusCode).json (body);
      };
      request[method] (
        this.COMMUNITIES_URL + req.url,
        {headers, json: true},
        cb
      );
    });
  }
}

/**
 * Export singleton
 * @type {CommunitiesRouter}
 */
module.exports = new CommunitiesRouter ();
