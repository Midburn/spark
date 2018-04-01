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
        ns: ['common', 'camps', 'npo', 'gate', 'events','suppliers'],
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
app.set('view engine', 'jade');

// user roles / permissions
var userRole = require('./libs/user_role');
app.use(userRole.middleware());

// Infrastructure Routes
if (app.get('env') === 'development' || app.get('env') === 'testing') {
    app.use('/dev', require('./routes/pages/dev_routes'));
    require('./routes/api/fake_drupal')(app);
}

// Mail
var mail = require('./libs/mail');
mail.setup(app);

/** #####################
 *      Mapping Routes
    ##################### */
// Mapping all Api routes
require('./routes/index.js').api(app, passport);
// Maping all page routes
app.use("/", require('./routes/index.js').app);

// Recaptcha setup with siteId & secret
recaptcha.init(recaptchaConfig.sitekey, recaptchaConfig.secretkey);

log.info('Spark environment: NODE_ENV =', process.env.NODE_ENV, ', app.env =', app.get('env'));

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
