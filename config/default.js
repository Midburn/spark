const path = require('path');
process.env.version = require('../package.json').version;

console.log("Spark config: package.json version:", process.env.version);

var fs = require('fs');
if (!fs.existsSync(".env")) {
    console.log("Spark config: .env file was not found, using default config.");
}
else {
    console.log("Spark config: Loading .env file:",
        path.format({
            dir: process.cwd(),
            base: ".env"
        }));
    require('dotenv').config();
}

switch (process.env.SPARK_DB_CLIENT || "mysql") {
    case "mysql":
        console.log("Spark config: Using MySQL database",
            process.env.SPARK_DB_HOSTNAME || "localhost", "/",
            process.env.SPARK_DB_DBNAME || "spark");
        exports.database = {
            "client": process.env.SPARK_DB_CLIENT || "mysql",
            "host": process.env.SPARK_DB_HOSTNAME || "localhost",
            "database": process.env.SPARK_DB_DBNAME || "spark",
            "user": process.env.SPARK_DB_USER || "spark",
            "password": process.env.SPARK_DB_PASSWORD || "spark",
            "charset": "utf8",
            "debug": (process.env.SPARK_DB_DEBUG === "true")
        };
        break;

    case "sqlite3":
        console.log("Spark config: Using sqlite3 database", process.env.SPARK_DB_FILENAME || "./dev.sqlite3");
        exports.database = {
            "client": process.env.SPARK_DB_CLIENT || "sqlite3",
            "filename": process.env.SPARK_DB_FILENAME || "./dev.sqlite3",
            "debug": (process.env.SPARK_DB_DEBUG === "true")
        };
        break;

    default:
        console.error("Spark config: environment variable SPARK_DB_TYPE is configured wrong.");
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
if (process.env.NODE_ENV !== 'production' && !process.env.SPARK_DISABLE_MAILTRAP) {
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
        enabled: typeof process.env.SPARK_MAILSERVER_ENABLE === "undefined" ? true : (process.env.SPARK_MAILSERVER_ENABLE === "true"),
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
    ignore: typeof process.env.SPARK_RECAPTCHA_IGNORE === "undefined" ? true : (process.env.SPARK_RECAPTCHA_IGNORE === "true"), // when ignore is true - recaptcha is enabled but if it fails it ignores and continues sign up anyway
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
    password: process.env.DRUPAL_PROFILE_API_PASSWORD || 'dummy',
    useCache: process.env.USE_DRUPAL_CACHE || false,
    cacheTTL: process.env.USE_DRUPAL_CACHE_TTL || 3600*24,
    skipDrupalLogin: process.env.SKIP_DRUPAL_LOGIN || false
};

/**
 * Aws Config FIXME: This should most likely be in env variables.
 */
let aws_config = {
    defualt_region: process.env.SPARK_CAMP_FILES_REGION,
    buckets: {
        camp_file_upload: process.env.SPARK_CAMP_FILES_BUCKET,
        supplier_contract_upload: process.env.SPARK_SUPPLIER_CONTRACTS_BUCKET
    },
    presignedUrlExpireSeconds: parseInt(process.env.SPARK_CAMP_FILES_PRESIGN_URL_EXPIRE_SECONDS)
};
exports.aws_config = aws_config
exports.volunteers_config = {
    api_url: process.env.VOLUNTEERS_BASE_URL || 'http://localhost:3500'
}
/**
 * Camp files config
 */
let camp_files_config = {
    upload_start_date: '',
    upload_end_date: ''
}
exports.camp_files_config = camp_files_config

exports.gate = {
    force_entry_pwd: process.env.GATE_FORCE_ENTRY_PASSWORD || 'Nju5B=Hu'
};