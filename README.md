[![Build Status](https://travis-ci.org/Midburn/Spark.svg?branch=master)](https://travis-ci.org/Midburn/Spark)

# Spark by Midburn

Spark is "burn in a box" suite of services that composes everything required to run a burn event throughout the year.

It contains:
- Profiles
- Ticketing
- Theme Camps & Art
- ... ?

It **does not** contain:
- Static Content
- Ticket Queue Management

Spark is being developed by the Midburn Tech Team, with the purpose of utilizing it to run Midburn 2017, and in the future other regional events. The Minimal Viable Product we're starting with is the Camps system.

### Quickstart

- [Development guide](/docs/development/README.md) - how to work on the development of the Spark project.
- [Usage guide](/docs/usage/README.md) - how to use the Spark system and description of what it provides.
- [Slack](https://www.hamsterpad.com/chat/midburnos)

### Tech Stack
- Node.js
- Express web server
- Mysql/SQLite, Bookshelf & Knex
- Bootstrap
- Pug/Jade templates, SaaS
- Morgan & Winston loggers
- Webpack
- Tests: Mocha, Chai & supertest
- Babel for ES2015 support
