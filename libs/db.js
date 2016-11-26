var config = require('config');
var dbConfig = config.get('database')

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : dbConfig.host,
        user     : dbConfig.username,
        password : dbConfig.password,
        database : dbConfig.database
    },
    debug: dbConfig.debug
});

var bookshelf = require('bookshelf')(knex);

bookshelf.plugin('virtuals');

module.exports.bookshelf = bookshelf;
