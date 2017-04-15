#!/usr/bin/env bash

./node_modules/.bin/knex migrate:latest
yarn test
