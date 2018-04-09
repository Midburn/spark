const express = require("express");
const app = express();
const sparkApi = require('./api-18');

// TODO: Wrap Pages as Router like api.
// Use locals
app.locals.moment = require('moment');

//Pages
app.use("/:lng?/admin", require("./pages/admin_routes"));
app.use("/:lng/events-admin", require("./pages/events_routes"));
app.use("/:lng/npo", require("./pages/npo_routes"));
app.use("/:lng/npo-admin", require("./pages/npo_admin_routes"));
app.use("/:lng/gate", require("./pages/gate_routes"));
app.use("/:lng/volunteering", require("./pages/volunteering_routes"));
app.use('/:lng/', require('./pages/suppliers_routes'));
//TODO: refactor camps routes
app.use("/:lng/", require("./pages/camps_routes"));

//TODO map to api in consistant way
app.use("/api/gate", require("./api/api_gate_routes"));
app.use("/:lng/camp-files-admin", require('./camp_file_admin_routes'));

function mapApi(app, passport) {

    // TODO: main route api & render are mixed, might need a split
    require("./main_routes.js")(app, passport);
    require("./api/api_suppliers_routes")(app, passport);
    app.use('/', sparkApi.router);
}

module.exports = {
    app: app,
    api: (app, passport) => {
        mapApi(app, passport);
    }
};

// ==============
// Error handlers
// ==============

// Catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found: ' + req.url);
    err.status = 404;
    next(err);
});

// Development error handler - will print stacktrace
if (app.get('env') === 'development') {

    app.use(function (err, req, res, next) {
        // Handle CSRF token errors
        if (err.code === 'EBADCSRFTOKEN') {
            res.status(403);
            res.render('pages/error', {
                errorMessage: 'Illegal action. Your connection details has been logged.',
                error: {
                    status: 'URL: ' + req.url
                }
            });
            return;
        }
        res.status(err.status || 500);
        res.render('pages/error', {
            errorMessage: err.message,
            error: err
        });
    });
}
// Production error handler - no stacktraces leaked to user
else {
    app.use(function (err, req, res, next) {
        // Handle CSRF token errors
        if (err.code === 'EBADCSRFTOKEN') {
            res.status(403);
            res.render('pages/error', {
                errorMessage: 'Illegal action. Your connection details has been logged.', //TODO: log if necessary
                error: req.url
            });
            return;
        }
        res.status(err.status || 500);
        res.render('pages/error', {
            errorMessage: err.message,
            error: {}
        });
    });
}
