#!/bin/sh
knex migrate:latest
npm $*