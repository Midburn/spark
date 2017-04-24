require('dotenv').config();

switch (process.env.SPARK_DB_CLIENT || "mysql") {
    case "mysql":
        exports.database = {
            "client": process.env.SPARK_DB_CLIENT,
            "host": process.env.SPARK_DB_HOSTNAME,
            "database": process.env.SPARK_DB_DBNAME,
            "user": process.env.SPARK_DB_USER,
            "password": process.env.SPARK_DB_PASSWORD,
            "charset": "utf8",
            "debug": (process.env.SPARK_DB_DEBUG === "true")
        };
        break;

    case "sqlite3":
        exports.database = {
            "client": process.env.SPARK_DB_CLIENT || "sqlite3",
            "filename": process.env.SPARK_DB_FILENAME || "./dev.sqlite3",
            "debug": (process.env.SPARK_DB_DEBUG === "true")
        };
        break;

    default:
        console.error("environment variable SPARK_DB_TYPE is configured wrong.");
        console.error("See .env-example file for more details.");
        console.error("");
        process.exit(1);
}

exports.server = {
    port: process.env.SPARK_SERVER_PORT || "3000",
    hostname: process.env.SPARK_SERVER_HOSTNAME || "localhost",
    protocol: process.env.SPARK_SERVER_PROTOCOL || "http",
    url: process.env.SPARK_SERVER_URL || "http://localhost:3000" // full URL including protocol and port. NO trailing slash
};

/**
 * Mail config
 */
if (process.env.NODE_ENV !== 'production') {
    // Mailtrap capture every email sent from Spark
    // in here: mailtrap.io/inboxes/188733/messages
    exports.mail = {
        enabled: true,
        from: "spark_mailtrap@midburn.org",
        host: "smtp.mailtrap.io",
        port: "2525",
        transportMethod: "SMTP",
        secureConnection: false
    };
    exports.mail.auth = {
        user: '91e0015f5afde6',
        pass: 'e60e0a6902a3df'
    }
} else {
    exports.mail = {
        enabled: typeof(process.env.SPARK_MAILSERVER_ENABLE) === "undefined" ? true : (process.env.SPARK_MAILSERVER_ENABLE === "true"),
        from: process.env.SPARK_MAILSERVER_FROM || "spark@localhost",
        host: process.env.SPARK_MAILSERVER_HOST || "localhost",
        port: process.env.SPARK_MAILSERVER_PORT || "25",
        transportMethod: process.env.SPARK_MAILSERVER_METHOD || "SMTP", // default is SMTP. Accepts anything that nodemailer accepts
        secureConnection: (process.env.SPARK_MAILSERVER_SECURE_CONNECTION === "true")
    };

    if (process.env.SPARK_MAILSERVER_USER) {
        exports.mail.auth = {
            user: process.env.SPARK_MAILSERVER_USER,
            pass: process.env.SPARK_MAILSERVER_PASSWORD
        }
    }
}

exports.i18n = {
    languages: ["he", "en"]
};

exports.payment = {
    iCreditUrl: process.env.SPARK_ICREDIT_URL,
    iCreditGroupPrivateToken: process.env.SPARK_ICREDIT_PRIVATETOKEN
};

exports.npo = {
    email: "amuta@midburn.org",
    idImagesFolder: "d:/temp/"
};

exports.facebook = {
    app_id: process.env.SPARK_FACEBOOK_APP || "1083906121721925",
    app_secret: process.env.SPARK_FACEBOOK_SECRET,
    callbackBase: process.env.SPARK_FACEBOOK_CALLBACK || "http://localhost:3000"
};

exports.recaptcha = {
    ignore: typeof(process.env.SPARK_RECAPTCHA_IGNORE) === "undefined" ? true : (process.env.SPARK_RECAPTCHA_IGNORE === "true"), // when ignore is true - recaptcha is enabled but if it fails it ignores and continues sign up anyway
    // TODO change eyalliebermann app in an oficial one
    sitekey: process.env.SPARK_RECAPTCHA_SITEKEY || "6LcdJwwUAAAAAGfkrUCxOp-uCE1_69AlIz8yeHdj",
    secretkey: process.env.SPARK_RECAPTCHA_SECRETKEY || "6LcdJwwUAAAAAFdmy7eFSjyhtz8Y6t-BawcB9ApF"
};

exports.api_tokens = {
  // Using test token if no token is defined
  token: process.env.SPARK_SECRET_TOKEN || "YWxseW91bmVlZGlzbG92ZWFsbHlvdW5lZWRpc2xvdmVsb3ZlbG92ZWlzYWxseW91"
};

exports.profiles_api = {
    url: process.env.DRUPAL_PROFILE_API_URL || 'http://dummy.url',
    username: process.env.DRUPAL_PROFILE_API_USER || 'dummy',
    password: process.env.DRUPAL_PROFILE_API_PASSWORD || 'dummy'
};
