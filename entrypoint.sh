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

node server.js
