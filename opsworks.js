/**
 * configurations are for local development environment
 *
 * should be modified on production with correct configurations
 */

// reads env config from .env file
require('dotenv').load();

switch(process.env.SPARK_DB_TYPE) {

case "mysql":
    exports.db = {
        "client"   : process.env.SPARK_DB_CLIENT,
        "host"     : process.env.SPARK_DB_HOSTNAME,
        "database" : process.env.SPARK_DB_DBNAME,
        "username" : process.env.SPARK_DB_USERNAME,
        "password" : process.env.SPARK_DB_PASSWORD,
        "charset"  : "UTF8_GENERAL_CI",
        "debug"    : false,
    };
    break;

case "sqlite3":
    exports.db = {
        "client"   : process.env.SPARK_DB_CLIENT,
        "filename" : process.env.SPARK_DB_FILENAME,
        "debug"    : false,
    };
    break;

default:
    console.log("environment variable SPARK_DB_TYPE is not set or configured wrong.");
    console.log("See .env-example file for more details.");
    console.log("");
    process.exit(1);
}

exports.server = {
    port      : process.env.SPARK_SERVER_PORT,
    hostname  : process.env.SPARK_SERVER_HOSTNAME,
    protocol  : process.env.SPARK_SERVER_PROTOCOL, // http or https
    url       : process.env.SPARK_SERVER_URL,      // full URL including protocol and port. NO trailing slash
};

exports.mail = {
    enabled         : process.env.SPARK_MAILSERVER_ENABLE,
    from            : process.env.SPARK_MAILSERVER_FROM,
    host            : process.env.SPARK_MAILSERVER_HOST,
    port            : process.env.SPARK_MAILSERVER_PORT,   // port for secure SMTP
    transportMethod : process.env.SPARK_MAILSERVER_METHOD, // default is SMTP. Accepts anything that nodemailer accepts
    secureConnection: false,                               // use SSL

    /*
    auth: {
        user: "",
        pass: ""
    }
    */
};

exports.payment = {
    iCreditUrl              : process.env.SPARK_ICREDIT_URL,
    iCreditGroupPrivateToken: process.env.SPARK_ICREDIT_PRIVATETOKEN,
};

exports.npo = {
    email         : "amuta@localhost",
    idImagesFolder: "d:/temp/"
};

exports.facebook = {
    app_id: process.env.SPARK_FACEBOOK_APP,
    app_secret: process.env.SPARK_FACEBOOK_SECRET,
    callbackBase: process.env.SPARK_FACEBOOK_CALLBACK,
};