#!/usr/bin/env bash

echo In codeship/test.sh

#./node_modules/.bin/knex migrate:latest
npm test
