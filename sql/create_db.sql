DROP DATABASE IF EXISTS spark;

CREATE DATABASE IF NOT EXISTS spark;

CREATE USER 'spark'@'localhost'
  IDENTIFIED BY 'spark';

GRANT ALL ON spark.* TO 'spark'@'localhost';
