#!/usr/bin/env bash

WAIT_MSG="Waiting for mysql connection.."

while ! node -e "
    let connection = require('mysql').createConnection({
        host     : '${SPARK_DB_HOSTNAME}',
        user     : '${SPARK_DB_USER}',
        password : '${SPARK_DB_PASSWORD}',
        database : '${SPARK_DB_DBNAME}'
    }); connection.connect(); connection.end();
" >/dev/null 2>&1; do
    [ "${WAIT_MSG}" != "" ] && echo $WAIT_MSG
    WAIT_MSG=""
    sleep 1
done

if [ "${ALLOW_POPULATE_DB}" == "yes" ]; then
    HAS_USERS=`node -e "
        let connection = require('mysql').createConnection({
            host     : '${SPARK_DB_HOSTNAME}',
            user     : '${SPARK_DB_USER}',
            password : '${SPARK_DB_PASSWORD}',
            database : '${SPARK_DB_DBNAME}'
        });
        connection.connect();
        connection.query('select count(1) as num_users from users', function(error, results, fields) {
            if (error) throw error;
            console.log(results[0]['num_users'] > 0 ? '1' : '0');
        });
        connection.end()
    "`
    if [ "${HAS_USERS}" == "1" ]; then
        echo "DB Already has data, will not overwrite"
    else
        echo "Populating DB with initial data"
        echo "This will delete all existing DB data!"
        ! node_modules/.bin/knex migrate:latest && echo "Failed migrations" && exit 1
        ! node_modules/.bin/knex seed:run && echo "Failed seed" && exit 1
    fi
fi

node server.js
