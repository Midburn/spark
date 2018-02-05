const express = require('express'),
    _ = require('lodash'),
    path = require('path');
/**
 * Base router definition - all other routers can be derived of this.
 */
class BaseRouter {

    /**
     *
     * @param prefix - String - prefix for all routes.
     * @param middlewares - Array<Function> function: (req, res, next) => something[]
     * @param routes - Array<Object> { path: string, methods: Array<Object { [methodName: string]: (req, res)}>, middelwares: Array<Function>}
     */
    constructor(prefix, middlewares, routes) {
        try {
            this.router = new express.Router();
            this.prefix = prefix;
            this.middlewares = middlewares;
            this.routes = routes;
            this.initMiddleWares().bind(this);
            this.initRoutes().bind(this);
        } catch (err) {
            // TODO - add logger for errors initilizing routes.
        }
    }

    initMiddleWares() {
        /**
         * Init router level middlewares
         * @type {Array}
         */
        for (const middleware of this.middlewares) {
            this.router.use(this.prefix, middleware);
        }
    }

    initRoutes() {
        /**
         * Init all routes using paths, prefix and functions.
         */
        for (const route of this.routes) {
            let orderedMiddlewares = route.middlewares ?_.orderBy(route.middlewares, middleware => middleware.order) : [];
            orderedMiddlewares = orderedMiddlewares.map(middleware => middleware.function);
            for (const method in route.methods) {
                if (route.methods.hasOwnProperty(method)) {
                    const controlFunction = route.methods[method];
                    this.router.route[method.toLowerCase()](path.join(this.prefix, orderedMiddlewares, method), controlFunction);
                }
            }
        }
    }
}

module.exports = BaseRouter;
