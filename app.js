var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var morganLogger = require('morgan');
var bodyParser = require('body-parser');
var passport = require('passport');
var session = require('express-session');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var fileUpload = require('express-fileupload');
var log = require('./libs/logger')(module);
var recaptcha = require('express-recaptcha');
var compileSass = require('express-compile-sass');
var recaptchaConfig = require('config').get('recaptcha');
var KnexSessionStore = require('connect-session-knex')(session);
var knex = require('./libs/db').knex;

log.info('Spark is starting...');

// Creating Express application
var app = express();

// FavIcon registration
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));

// Log every HTTP request
app.use(morganLogger('dev', {
    stream: log.logger.stream({
        level: 'info',
        filter: function(message) {
            if ((typeof message === "undefined") || (message === null)) return true;
            return !
                (message.includes('/stylesheets/') || message.includes('/images/'));
        }
    })
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(fileUpload());

var root = process.cwd();
app.use(compileSass({
    root: root + '/public',
    sourceMap: true, // Includes Base64 encoded source maps in output css
    sourceComments: true, // Includes source comments in output css
    watchFiles: true, // Watches sass files and updates mtime on main files for each change
    logToConsole: false // If true, will log to console.error on errors
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

app.use('/bower_components', express.static(path.join(__dirname, '/bower_components')));

app.use(function(req, res, next) {
    res.locals.req = req;
    res.locals.path = req.path.split('/');
    next();
});

// Passport setup
require('./libs/passport')(passport);

// using session storage in DB - allows multiple server instances + cross session support between node js apps
var sessionStore = new KnexSessionStore({
    knex: knex
});
app.use(session({
    secret: 'SparklePoniesAreFlyingOnEsplanade', //TODO check - should we put this on conifg / dotenv files?
    resave: false,
    saveUninitialized: false,
    maxAge: 1000 * 60 * 30,
    store: sessionStore
}));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(flash()); // use connect-flash for flash messages stored in session

// i18N Setup
var i18next = require('i18next');
var middleware = require('i18next-express-middleware');
var backend = require('i18next-node-fs-backend');
i18next
    .use(middleware.LanguageDetector)
    .use(backend)
    .init({
        whitelist: ['en', 'he'],
        fallbackLng: 'en',
        load: 'languageOnly',
        debug: false,
        //namespaces
        ns: ['common', 'camps', 'npo', 'gate'],
        defaultNS: 'common',
        fallbackNS: 'common',

        backend: {
            // path where resources get loaded from
            loadPath: 'locales/{{lng}}/{{ns}}.json',

            // path to post missing resources
            addPath: 'locales/{{lng}}.missing.json',

            // jsonIndent to use when storing json files
            jsonIndent: 2
        },
        detection: {
            // order and from where user language should be detected
            order: ['path', 'session', 'querystring', 'cookie', 'header'],

            // keys or params to lookup language from
            lookupQuerystring: 'lng',
            lookupCookie: 'i18next',
            lookupSession: 'lng',
            //lookupPath: 'lng',
            lookupFromPathIndex: 0

            // cache user language
            //caches: true // ['cookie']

            // optional expire and domain for set cookie
            //cookieExpirationDate: new Date(),
            //cookieDomain: 'SparkMidburn'
        }
    }, function() {
        middleware.addRoute(i18next, '/:lng', ['en', 'he'], app, 'get', function(req, res) {
            //endpoint function
            //log.info("ROUTE");
        });
    });
app.use(middleware.handle(i18next, {
    ignoreRoutes: ['images/', 'images', 'images/', '/images/', 'stylesheets', '/favicon.ico'],
    removeLngFromUrl: false
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// user roles / permissions
var userRole = require('./libs/user_role');
app.use(userRole.middleware());

// Infrastructure Routes
if (app.get('env') === 'development') {
    app.use('/dev', require('./routes/dev_routes'));
    require('./routes/fake_drupal')(app);
}
require('./routes/main_routes.js')(app, passport);

app.use('/:lng?/admin', require('./routes/admin_routes'));

// Module's Routes
app.use('/:lng/npo', require('./routes/npo_routes'));
app.use('/:lng/npo-admin', require('./routes/npo_admin_routes'));
app.use('/:lng/gate', require('./routes/gate_routes'));

// Mail
var mail = require('./libs/mail');
mail.setup(app);

// API
require('./routes/api_routes')(app, passport);

// Camps / API
// TODO this is not the right way to register routes
require('./routes/api_routes.js')(app, passport);
require('./routes/api_camps_routes')(app, passport);
require('./routes/camps_routes')(app, passport);
require('./routes/api/v1/camps')(app); // CAMPS PUBLIC API
require('./routes/api_camps_routes')(app, passport);

// Camps
require('./routes/camps_routes')(app, passport);

//TODO this is not the right way to register routes
var ticket_routes = require('./routes/ticket_routes');
app.use('/:lng/tickets/', ticket_routes);

require('./routes/volunteers_routes')(app, passport);

// Recaptcha setup with siteId & secret
recaptcha.init(recaptchaConfig.sitekey, recaptchaConfig.secretkey);

log.info('Spark environment: NODE_ENV =', process.env.NODE_ENV, ', app.env =', app.get('env'));

// ==============
// Error handlers
// ==============

// Catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found: ' + req.url);
    err.status = 404;
    next(err);
});

// Development error handler - will print stacktrace
if (app.get('env') === 'development') {

    app.use(function(err, req, res, next) {
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
    app.use(function(err, req, res, next) {
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

// Handler for unhandled rejections
process.on('unhandledRejection', function(reason, p) {
    log.error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

process.on('warning', function(warning) {
    log.warn(warning.name); // Print the warning name
    log.warn(warning.message); // Print the warning message
    log.warn(warning.stack); // Print the stack trace
});

// == Export our app ==
module.exports = app;

log.info("--- Spark is running :) ---");

