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

log.info('Spark is starting...');

// Creating Express application
var app = express();

// Middleware registration
app.use(favicon(__dirname + '/public/favicon.ico'));

// Log every HTTP request
app.use(morganLogger('dev', { stream: log.logger.stream(
    {level: 'info',
     filter: function(message){    
         return !
             (message.includes('/stylesheets/') || message.includes('/images/'));
    }
    }) }));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload());

app.use(function(req, res, next) {
    res.locals.req = req;
    res.locals.path = req.path.split('/');
    next();
});

// Passport setup
require('./libs/passport')(passport);
app.use(session({
    secret: 'SparklePoniesAreFlyingOnEsplanade',
    resave: false,
    saveUninitialized: false,
    maxAge: 1000 * 60 * 30
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
        backend: {
            // path where resources get loaded from
            loadPath: 'locales/{{lng}}.json',

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
            log.info("ROUTE");
        })
    });
app.use(middleware.handle(i18next, {
    ignoreRoutes: ['images/', 'images', 'images/', '/images/', 'stylesheets', '/favicon.ico'],
    removeLngFromUrl: false
}));
//i18next.addRoute('/:lng', ['en', 'de'], app, 'get', function(req, res) {
//    log.info('SEO friendly route ...');
//    res.render('index');
//});

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');


// Built-in Routes
app.use('/:lng?/admin', require('./routes/admin_routes'));
require('./routes/main_routes.js')(app, passport);

// Module's Routes
app.use('/:lng/npo', require('./routes/npo_routes'));

// Mail
var mail = require('./libs/mail');
mail.setup(app);

log.info('Spark environment: NODE_ENV =', process.env.NODE_ENV, ', app.env =' , app.get('env'));

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
        if (err.code == 'EBADCSRFTOKEN') {
            res.status(403);
            res.render('pages/error', {
                errorMessage: 'Illegal action. Your connection details has been logged.',
                error: {status: 'URL: ' + req.url}
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
        if (err.code == 'EBADCSRFTOKEN') {
            res.status(403);
            res.render('pages/error', {
                errorMessage: 'Illegal action. Your connection details has been logged.',
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
process.on('unhandledRejection', function (reason, p) {
    log.error("Possibly Unhandled Rejection at: Promise ", p, " reason: ", reason);
});

process.on('warning', function (warning) {
    log.warn(warning.name);    // Print the warning name
    log.warn(warning.message); // Print the warning message
    log.warn(warning.stack);   // Print the stack trace
});

// == Export our app ==
module.exports = app;

log.info("------   Spark is running at http://localhost:3000/ :) ------");