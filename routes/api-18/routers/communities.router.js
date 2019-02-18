const Router = require ('express').Router,
  constants = require ('../../../models/constants'),
  helperService = require ('../services').helperService,
  apiTokensConfig = config.get ('api_tokens');
class CommunitiesRouter {
  constructor () {
    this.router = Router ();
    this.prefix = constants.ROUTER_PREFIXES.COMMUNITIES;
    this.initOpenRoutes ();
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

  initMiddlewares () {}

  initRoutes () {
    this.router.route.use (async (req, res, next) => {
      try {
        const communitiesResponse = await request
          [req.method] (this.COMMUNITIES_URL + req.url)
          .set ('Accept', 'application/json')
          .set ('token', apiTokensConfig.token);
        return res.status (200).json (communitiesResponse);
      } catch (e) {
        next (e);
      }
    });
  }
}

/**
 * Export singleton
 * @type {CommunitiesRouter}
 */
module.exports = new CommunitiesRouter ();
