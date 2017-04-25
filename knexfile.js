console.log("knexfile.js - IN");

if (!process.env.SPARK_DB_CLIENT) {
    console.log("Spark: process.env is undefined in knexfile. Loading...");
    require('dotenv').config();
}

var config = require('config');
var dbConfig = config.get('database');

module.exports = {
    client: dbConfig.client,
    connection: dbConfig,
    debug: dbConfig.debug,
    useNullAsDefault: true
};

module.exports.development = module.exports.staging = module.exports.production = module.exports;

console.log("knexfile.js - OUT");
