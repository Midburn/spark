var config = require('config');
var dbConfig = config.get('database');

module.exports = {
    client: dbConfig.client,
    connection: dbConfig,
    debug: dbConfig.debug,
    useNullAsDefault: true
};

module.exports.development = module.exports.staging = module.exports.production = module.exports;
