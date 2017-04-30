DROP DATABASE IF EXISTS spark_test;

# Implicitly create the user and then drop the user.
GRANT USAGE ON *.* TO 'spark'@'%' IDENTIFIED BY 'password';
DROP USER 'spark'@'%';
flush privileges;

CREATE DATABASE IF NOT EXISTS spark_test;

ALTER DATABASE spark_test CHARACTER SET utf8;
ALTER DATABASE spark_test COLLATE utf8_general_ci;

CREATE USER 'spark'@'%'
  IDENTIFIED BY 'spark';

GRANT ALL ON spark_test.* TO 'spark'@'%';
