const opsworks = require('../opsworks.js');

module.exports =  {
  database: opsworks.db,
  
  server: opsworks.server,

  mail: opsworks.mail,

  i18n: {
    languages: ["he", "en"]
  },

  payment: opsworks.payment,

  npo: opsworks.npo,
  
  facebook: opsworks.facebook
};
