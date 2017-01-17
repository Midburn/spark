#!/usr/bin/env bash

# this script assumes "clean" environment like Travis
# TODO: modify for developer environment which already have the DB

# when PR #3 is merged this will work
mysql -u root < sql/create_db.sql
mysql -u root < sql/schema.sql
mysql -u root < sql/camps.sql

npm install
npm test
