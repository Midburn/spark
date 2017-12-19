#!/usr/bin/env bash

WAIT_MSG="Waiting for mysql connection.."
while ! echo "select 1;" | mysql "--host=${SPARK_DB_HOSTNAME}" --protocol=tcp \
                                 "--user=${SPARK_DB_USER}" \
                                 "--password=${SPARK_DB_PASSWORD}"
do
    [ -z "${WAIT_MSG}" ] && echo -n .
    [ ! -z "${WAIT_MSG}" ] && echo "${WAIT_MSG}" && WAIT_MSG=""
    sleep 5
done

if [ "${ALLOW_POPULATE_DB}" == "yes" ]; then
    NUM_USERS=`echo 'select count(1) as num_users from users' | mysql "--host=${SPARK_DB_HOSTNAME}" --protocol=tcp \
                                                                      "--user=${SPARK_DB_USER}" \
                                                                      "--password=${SPARK_DB_PASSWORD}" \
                                                                      "--database=${SPARK_DB_DBNAME}" | tail -1`
    if [ "${NUM_USERS}" == "" ] || [ "${NUM_USERS}" == "0" ] ; then
        echo "Populating DB with initial data"
        echo "This will delete all existing DB data!"

        ! echo 'DROP DATABASE IF EXISTS spark;' \
          | mysql "--host=${SPARK_DB_HOSTNAME}" --protocol=tcp \
                  "--user=${SPARK_DB_USER}" \
                  "--password=${SPARK_DB_PASSWORD}" \
          && echo "Failed to drop spark database, will try to continue anyway"

        ! echo 'CREATE DATABASE IF NOT EXISTS spark;' \
          | mysql "--host=${SPARK_DB_HOSTNAME}" --protocol=tcp \
                  "--user=${SPARK_DB_USER}" \
                  "--password=${SPARK_DB_PASSWORD}" \
          && echo "Failed to create spark database, will try to continue anyway"

        ! node_modules/.bin/knex migrate:latest && echo "Failed migrations" && exit 1

        ! node_modules/.bin/knex seed:run && echo "Failed seed" && exit 1
    else
        echo "DB Already has data, will not overwrite"
    fi
fi

node server.js
