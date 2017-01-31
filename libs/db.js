var config = require('config');
var dbConfig = config.get('database');

var knex = require('knex')({
    client: dbConfig.client,
    connection: dbConfig,
    debug: dbConfig.debug,
    useNullAsDefault: true
});

var bookshelf = require('bookshelf')(knex);

bookshelf.plugin('virtuals');

module.exports = {
    bookshelf: bookshelf,
    knex: knex
};
