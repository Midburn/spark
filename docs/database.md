# Spark database

The Spark project uses [Knex.js](http://knexjs.org/) to manage database connection and migrations.

### Database configuration

Knex uses the database configuration from the [opsworks.js](/opsworks.js) file.

By default it is configured to use Sqlite which doesn't require any special installation or setup.

### Running migrations

Make sure you have Knex installed:

```
$ npm install -g knex
```

Migrate forward to latest migration

```
spark$ knex migrate:latest
```

See [Knex.js documentation](http://knexjs.org/#Migrations-CLI) for more options and details

### Creating a new migration

Run migrate:make with a relevant migration name:

```
$ knex migrate:make <migration_name>
```

Edit the created file and write your migration.

You can see the other migration files for examples or refer to the [Knex.js documentation](http://knexjs.org/#Schema)

### Using Mysql

By default we use Sqlite for ease of use, but if you want to test the code with a real DB you should setup to use Mysql.

##### Mysql installation

On Mac after installing, please add the following lines to your ~/.bash_profile
```
$ alias mysql=/usr/local/mysql/bin/mysql
$ alias mysqladmin=/usr/local/mysql/bin/mysqladmin
```

Also, On first install, you might get mysql password expired or other root password related issues.

To change mysql default password - run the following commands
```
mysql -u root -p
```
Enter the default root password you got during mysql setup
Then run the following to set your password:
```
SET PASSWORD = PASSWORD('xxxxxxxx');
```

##### Mysql configuration in Spark project

Edit [opsworks.js](/opsworks.js) file and uncomment the relevant lines regarding mysql:

```
exports.db = {
    "client"        : "mysql",
    "debug"         : false,
    "host"          : "localhost",
    "database"      : "spark",
    "username"      : "spark",
    "password"      : "spark",
    "charset"       : "UTF8_GENERAL_CI",
};
```

Create the Spark database and user:

```
spark$ sudo mysql -u root < migrations/create_db.sql
```
