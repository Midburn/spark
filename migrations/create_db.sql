DROP DATABASE IF EXISTS spark;

CREATE DATABASE IF NOT EXISTS spark;

ALTER DATABASE spark CHARACTER SET utf8;
ALTER DATABASE spark COLLATE utf8_general_ci;

CREATE USER 'spark'@'localhost'
  IDENTIFIED BY 'spark';

GRANT ALL ON spark.* TO 'spark'@'localhost';
