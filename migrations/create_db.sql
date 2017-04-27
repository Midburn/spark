DROP DATABASE IF EXISTS spark;

# Implicitly create the user and then drop the user.
GRANT USAGE ON *.* TO 'spark'@'localhost' IDENTIFIED BY 'password';
DROP USER 'spark'@'localhost';
flush privileges;

CREATE DATABASE IF NOT EXISTS spark;

ALTER DATABASE spark CHARACTER SET utf8;
ALTER DATABASE spark COLLATE utf8_general_ci;

CREATE USER 'spark'@'localhost'
  IDENTIFIED BY 'spark';

GRANT ALL ON spark.* TO 'spark'@'localhost';
