const express = require('express'),
path = require('path'),
favicon = require('serve-favicon'),
morganLogger = require('morgan'),
bodyParser = require('body-parser'),
passport = require('passport'),
session = require('express-session'),
flash = require('connect-flash'),
cookieParser = require('cookie-parser'),
fileUpload = require('express-fileupload'),
log = require('./libs/logger')(module),
recaptcha = require('express-recaptcha'),
compileSass = require('express-compile-sass'),
recaptchaConfig = require('config').get('recaptcha'),
KnexSessionStore = require('connect-session-knex')(session),
knex = require('./libs/db').knex,
compression = require('compression'),
opbeat = (process.env.NODE_ENV === 'production') ?
    require('opbeat').start({
        appId: process.env.OPBEAT_APP_ID,
        organizationId: process.env.OPBEAT_ORGANIZATION_ID,
        secretToken: process.env.OPBEAT_SECRET_TOKEN
      }) : {}

log.info('Spark is starting...');

// Creating Express application
var app = express();

// FavIcon registration
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));

// Log every HTTP request
app.use(morganLogger('dev', {
    stream: log.logger.stream({
        level: 'info',
        filter: function (message) {
            if ((typeof message === "undefined") || (message === null)) return true;
            return !(message.includes('/stylesheets/') || message.includes('/images/'));
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

app.use(function (req, res, next) {
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

// compress all responses
app.use(compression());

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
        ns: ['common', 'camps', 'npo', 'gate', 'events'],
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
    }, function () {
        middleware.addRoute(i18next, '/:lng', ['en', 'he'], app, 'get', function (req, res) {
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
app.set('view engine', 'pug');

// user roles / permissions
var userRole = require('./libs/user_role');
app.use(userRole.middleware());

// Infrastructure Routes
if (app.get('env') === 'development' || app.get('env') === 'testing') {
    app.use('/dev', require('./routes/dev_routes'));
    require('./routes/fake_drupal')(app);
}
require('./routes/main_routes.js')(app, passport);

app.use('/:lng?/admin', require('./routes/admin_routes'));

// Module's Routes
app.use('/:lng/npo', require('./routes/npo_routes'));
app.use('/:lng/npo-admin', require('./routes/npo_admin_routes'));
app.use('/:lng/gate', require('./routes/gate_routes'));
app.use('/:lng/volunteering', require('./routes/volunteering_routes'));

// Mail
var mail = require('./libs/mail');
mail.setup(app);

// API
require('./routes/api_routes')(app, passport);
app.use('/api/gate', require('./routes/api_gate_routes'));

// Camps / API
// TODO this is not the right way to register routes
require('./routes/api_routes.js')(app, passport);
require('./routes/api_events_routes')(app, passport);
require('./routes/api_camps_routes')(app, passport);
require('./routes/camps_routes')(app, passport);
require('./routes/api/v1/camps')(app); // CAMPS PUBLIC API
require('./routes/api_camps_routes')(app, passport);
require('./routes/api_events_routes')(app, passport);

// Camps
require('./routes/camps_routes')(app, passport);

require('./routes/volunteers_routes')(app, passport);

//Events
require('./routes/events_routes')(app, passport);

// Recaptcha setup with siteId & secret
recaptcha.init(recaptchaConfig.sitekey, recaptchaConfig.secretkey);

log.info('Spark environment: NODE_ENV =', process.env.NODE_ENV, ', app.env =', app.get('env'));

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
            res.render('pages/error.pug', {
                errorMessage: 'Illegal action. Your connection details has been logged.',
                error: {
                    status: 'URL: ' + req.url
                }
            });
            return;
        }
        res.status(err.status || 500);
        res.render('pages/error.pug', {
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
            res.render('pages/error.pug', {
                errorMessage: 'Illegal action. Your connection details has been logged.', //TODO: log if necessary
                error: req.url
            });
            return;
        }
        res.status(err.status || 500);
        res.render('pages/error.pug', {
            errorMessage: err.message,
            error: {}
        });
    });
}

// Handler for unhandled rejections
process.on('unhandledRejection', function (reason, p) {
    log.error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

process.on('warning', function (warning) {
    log.warn(warning.name); // Print the warning name
    log.warn(warning.message); // Print the warning message
    log.warn(warning.stack); // Print the stack trace
});

// ==================
// Opbeat Integration
// ==================
// We want to enable Opbeat in production only,
// so dev. errors don't obscure actual production issues
if (process.env.NODE_ENV === 'production') {
    app.use(opbeat.middleware.express())
}

// == Export our app ==
module.exports = app;

log.info("--- Spark is running :) ---");

if (process.env.DRUPAL_TICKET_SYNC_EVERY_X_MINUTES) {
    log.info("Drupal ticket sync is on. Sync will run every X minutes: ", process.env.DRUPAL_TICKET_SYNC_EVERY_X_MINUTES);
    setTimeout(() => {
        var drupalTicketSync = require('./scripts/drupal_ticket_sync');
        drupalTicketSync.runSyncTicketsLoop(process.env.DRUPAL_TICKET_SYNC_EVERY_X_MINUTES);
    }, 10000);
}
else {
    log.warn("Drupal ticket sync is disabled. To run, set DRUPAL_TICKET_SYNC_EVERY_X_MINUTES in your .env file")
}
