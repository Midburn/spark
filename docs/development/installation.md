# Installing the Spark development environment

This is a step-by-step guide to getting you up and running with Spark so you can start developing as soon as possible.

### Preconditions

* **NodeJS** ( https://nodejs.org/en/ ) (use latest version 6.9+, we use ECMAScript 2015)
* **GIT** ( https://git-scm.com/downloads )

Download and install as described on the websites.

### Getting the source files

* Fork the project on GitHub (this can be done in the GitHub web interface)
* clone your forked repo

```shell
git clone https://github.com/<YOUR_GITHUB_USER>/Spark.git
```

To be able to sync with Midburn repository you should add it as a remote:

```shell
git remote add midburn https://github.com/Midburn/Spark.git
```

### Installing NVM

Optional - It is recommended to use [nvm](https://github.com/creationix/nvm#installation) to get the correct node version.
If you are not planning to use nvm or running Windows and having trouble setup things, just skip these section.

We have a .nvmrc file which will be detected automatically, so you will get the correct node version.

```shell
cd spark
nvm install
nvm use
```

### Installing Node modules

```shell
cd spark
npm install
npm install -g nodemon knex bower
```

### Installing bower dependencies

[Bower](https://bower.io/) provides web static files dependencies

```shell
bower install
```

### Setting up the database

Local development environment uses MySQL by default.

We use Knex to run and manage the migrations.

```shell
knex migrate:latest
```

See [/docs/database.md](/docs/development/database.md) for more details about our database setup.

## Light the spark

Fire up the server after installation, with `nodemon` to monitor changes and re-run the server:

```shell
nodemon server.js
```

and navigate to [http://localhost:3000](http://localhost:3000).

**Note** nodemon should take care of refreshing the server when you make changes.

### Creating an admin account

After lighting the spark, if this is the first time or if you have recreated the DB
browse to the development console at [http://localhost:3000/dev](http://localhost:3000/dev) and select **Create admin user**.

This will create a user: **a**, password: **a**

### Configure your environment

All the configurations are set in the config file in the `/config` folder.

To override this configurations to match your development environment:

1. Create a file named `/config/local-evelopment.json`
2. Open the file and copy all the settings you wish to override from `/config/default.json`

**Notes**:

* You only need to copy the settings you need to override, not all the settings.
* The file format should be the same as `/config/default.json`
