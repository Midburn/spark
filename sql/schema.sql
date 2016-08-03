DROP DATABASE IF EXISTS spark;

CREATE DATABASE IF NOT EXISTS spark;

CREATE USER 'spark'@'localhost'
  IDENTIFIED BY 'spark';

GRANT ALL ON spark.* TO 'spark'@'localhost';

USE spark;

DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
  # Basic ID + security fields
  id                          INTEGER PRIMARY KEY AUTO_INCREMENT,
  email                       VARCHAR(100) UNIQUE,
  password                    VARCHAR(100),
  reset_password_token        VARCHAR(32) UNIQUE,
  reset_password_expires      DATETIME,

  # Profile fields
  first_name                  VARCHAR(64),
  last_name                   VARCHAR(64),
  gender                      ENUM('male', 'female'),

  # NPO fields
  npo_membership_status       ENUM('not_member', 'request_approved', 'member_paid', 'member_should_pay', 'banned', 'request_rejected', 'npo_applied_for_membership') DEFAULT 'not_member',
  npo_membership_start_date   DATE,
  npo_membership_end_date     DATE
) ENGINE = innodb;

