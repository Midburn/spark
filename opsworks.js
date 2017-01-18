/**
 * configurations are for local development environment
 *
 * should be modified on production with correct configurations
 */

exports.db = {
    "client"        : "sqlite3",
    "debug"         : false,
    "filename"      : "./dev.sqlite3"
};

// mysql configuration example
// exports.db = {
//     "client"        : "mysql",
//     "debug"         : false,
//     "host"          : "localhost",
//     "database"      : "spark",
//     "username"      : "spark",
//     "password"      : "spark",
//     "charset"       : "UTF8_GENERAL_CI",
// };

exports.server = {
    port      : 3000,
    hostname  : "localhost",
    protocol  : "http",                  // http or https
    url       : "http://localhost:3000"  // full URL including protocol and port. NO trailing slash
};

exports.mail = {
    enabled         : true,
    from            : "spark@localhost",
    host            : "localhost",
    secureConnection: false,         // use SSL
    port            : 25,          // port for secure SMTP
    transportMethod : "SMTP"       // default is SMTP. Accepts anything that nodemailer accepts
    /*
    auth: {
        user: "",
        pass: ""
    }
    */
};

exports.payment = {
    // iCreditUrl              : ""
    // iCreditGroupPrivateToken: ""
};

exports.npo = {
    email         : "amuta@localhost",
    idImagesFolder: "d:/temp/"
};

exports.facebook = {
    app_id: "1083906121721925",
    app_secret: "",
    callbackBase: "http://localhost:3000"
};
