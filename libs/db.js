var config = require('config');
var dbConfig = config.get('database');
var log = require('./logger');

var parameters = {
    client: dbConfig.client,
    connection: dbConfig,
    debug: dbConfig.debug,
    useNullAsDefault: true
};

if (process.env.SPARK_DB_CLIENT == "mysql") {
    parameters.pool = { min: 0 };
}

var knex = require('knex')(parameters);

var bookshelf = require('bookshelf')(knex);

knex.on('query-error', function (err) {
    console.error('knex query-error:', err.stack);
    //TODO log.error('knex query-error:', err.stack);
});

bookshelf.plugin('virtuals');
bookshelf.plugin('pagination');

module.exports = {
    bookshelf: bookshelf,
    knex: knex
};
