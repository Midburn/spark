# Spark database

The Spark project uses [Knex.js](http://knexjs.org/) to manage database connection and migrations.

### Database configuration

Knex uses the database configuration from the [.env](/.env-example) file.

By default (local dev machine) it is configured to use Sqlite which doesn't require any special installation or setup.

### Running migrations

Make sure you have Knex installed:

```shell
npm install -g knex
```

Migrate forward to latest migration

```shell
knex migrate:latest
```

See [Knex.js documentation](http://knexjs.org/#Migrations-CLI) for more options and details

### Creating a new migration

Run migrate:make with a relevant migration name:

```shell
knex migrate:make <migration_name>
```

Edit the created file and write your migration.

You can see the other migration files for examples or refer to the [Knex.js documentation](http://knexjs.org/#Schema)

### Using Mysql

By default we use Sqlite for ease of use, but if you want to test the code with a real DB you should setup to use Mysql.

##### Mysql installation

On Mac after installing, please add the following lines to your ~/.bash_profile
```shell
alias mysql=/usr/local/mysql/bin/mysql
alias mysqladmin=/usr/local/mysql/bin/mysqladmin
```

Also, On first install, you might get mysql password expired or other root password related issues.

To change mysql default password - run the following commands
```shell
mysql -u root -p
```
Enter the default root password you got during mysql setup
Then run the following to set your password:
```
SET PASSWORD = PASSWORD('xxxxxxxx');
```

##### Mysql configuration in Spark project

Edit your .env file and set to use local mysql

```
SPARK_DB_CLIENT=mysql
SPARK_DB_HOSTNAME=localhost
SPARK_DB_DBNAME=spark
SPARK_DB_USER=spark
SPARK_DB_PASSWORD=spark
SPARK_DB_DEBUG=false
```

Create the Spark database and user:

```shell
sudo mysql -u root < migrations/create_db.sql
```
