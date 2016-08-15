var config = require('config');

var dbConfig = config.get('database');

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host     : dbConfig.host,
        user     : dbConfig.user,
        password : dbConfig.password,
        database : dbConfig.database,
        charset  : dbConfig.charset
    },
    debug: dbConfig.debug
});

var bookshelf = require('bookshelf')(knex);

bookshelf.plugin('virtuals');

module.exports.bookshelf = bookshelf;
