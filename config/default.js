const opsworks = require('../opsworks.js');
const dbConfig = opsworks.db;

module.exports =  {
  database: {
      host     : dbConfig.host,
      username : dbConfig.username,
      password : dbConfig.password,
      database : dbConfig.database,
      debug	   : false
  },
  server: opsworks.server,

  mail: opsworks.mail,

  i18n: {
    languages: ["he", "en"]
  },

  payment: opsworks.payment,

  npo: opsworks.npo,

  facebook: opsworks.facebook
};
