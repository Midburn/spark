var config = require('config');
var dbConfig = config.get('database');

module.exports = {
    client: dbConfig.client,
    connection: dbConfig,
    debug: dbConfig.debug,
    useNullAsDefault: true
};
