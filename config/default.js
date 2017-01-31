const opsworks = require('../opsworks.js');
console.log(opsworks.db  + " " + JSON.stringify(opsworks.db));
module.exports =  {
  database: opsworks.db,
  
  server: opsworks.server,

  mail: opsworks.mail,

  i18n: {
    languages: ["he", "en"]
  },

  payment: opsworks.payment,

  npo: opsworks.npo,
  
  facebook: opsworks.facebook,

  recaptcha: {
    sitekey: opsworks.recaptcha.sitekey,
    secretkey: opsworks.recaptcha.secretkey,
    ignore: opsworks.recaptcha.ignore
  }
};
