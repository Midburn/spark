var config = require('config');
var dbConfig = config.get('database')

module.exports = {

    development: {
        client: 'mysql',
        connection: {
            host: dbConfig.host,
            user: dbConfig.username,
            password: dbConfig.password,
            database: dbConfig.database
        },
        debug: dbConfig.debug
    }
    //    
    //  development: {
    //    client: 'sqlite3',
    //    connection: {
    //      filename: './dev.sqlite3'
    //    }
    //  },
    //
    //  staging: {
    //    client: 'postgresql',
    //    connection: {
    //      database: 'my_db',
    //      user:     'username',
    //      password: 'password'
    //    },
    //    pool: {
    //      min: 2,
    //      max: 10
    //    },
    //    migrations: {
    //      tableName: 'knex_migrations'
    //    }
    //  },
    //
    //  production: {
    //    client: 'postgresql',
    //    connection: {
    //      database: 'my_db',
    //      user:     'username',
    //      password: 'password'
    //    },
    //    pool: {
    //      min: 2,
    //      max: 10
    //    },
    //    migrations: {
    //      tableName: 'knex_migrations'
    //    }
    //  }

};
