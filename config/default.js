const dbConfig = require('../opsworks.js').db;


module.exports =  {
  database: dbConfig,

  server: {
    port      : 80,
    hostname  : "spark.midburn.org",
    protocol  : "https",                     // http or https
    url       : "https://spark.midburn.org"  // full URL including protocol and port. NO trailing slash
  },

  mail: {
	  enabled         : true,
    from            : "spark@midburn.org",
    host            : "email-smtp.eu-west-1.amazonaws.com",
    secureConnection: true,         // use SSL
    port            : 465,          // port for secure SMTP
    transportMethod : "SMTP",       // default is SMTP. Accepts anything that nodemailer accepts
    auth: {
      user: "AKIAJBTYEDTLL5MBD7SQ",
      pass: "AiqqkfPX50kbTkJPAfeOhzxaSI4Ln9eszK+pCo7+5s4/"
    }
  },

  i18n: {
    languages: ["he", "en"]
  },

  // ** PRODUCTION server **
  payment: {
    iCreditUrl              : "https://icredit.rivhit.co.il/API/PaymentPageRequest.svc/GetUrl",
    iCreditGroupPrivateToken: "bf0c4ab6-183d-4a97-9ca0-54df2d933e1e"
  },

  // ** TEST server **
//  "payment": {
//    "iCreditUrl": "https://testicredit.rivhit.co.il/API/PaymentPageRequest.svc/GetUrl",
//    "iCreditGroupPrivateToken": "7ddd44b1-fcbf-4f95-baea-5169b6788681", // TEST
//  },

  npo: {
    email         : "amuta@midburn.org",
    idImagesFolder: "d:/temp/"
  },
  // This is a Facebook app I set up for debugging. Before launching, should
  // be replaced by an app set by the Midburn facebook account.
  facebook: {
    app_id: "1083906121721925",
    app_secret: "d60f362df1e9f35b6633b6f819ea7ccf",
    callbackBase: "http://localhost:3000"
  }
};
