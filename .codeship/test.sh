#!/usr/bin/env bash

./node_modules/.bin/knex migrate:latest
npm test
