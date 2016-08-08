DROP DATABASE IF EXISTS spark;

CREATE DATABASE IF NOT EXISTS spark;

CREATE USER 'spark'@'localhost'
  IDENTIFIED BY 'spark';

GRANT ALL ON spark.* TO 'spark'@'localhost';

USE spark;

##########
#  DROP  #
##########

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS payments;


############
#  CREATE  #
############

CREATE TABLE IF NOT EXISTS users (
  created_at                TIMESTAMP,
  updated_at                TIMESTAMP,

  # Basic ID + security fields
  user_id                   INTEGER PRIMARY KEY AUTO_INCREMENT,
  email                     VARCHAR(100) UNIQUE,
  password                  VARCHAR(100),
  reset_password_token      VARCHAR(32) UNIQUE,
  reset_password_expires    DATETIME,

  # Profile fields
  first_name                VARCHAR(64),
  last_name                 VARCHAR(64),
  gender                    ENUM('male', 'female'),

  # NPO fields
  npo_membership_status     ENUM('not_member', 'request_approved', 'member_paid', 'member_should_pay', 'banned', 'request_rejected', 'applied_for_membership') DEFAULT 'not_member',
  npo_application_date      DATE,
  npo_membership_start_date DATE,
  npo_membership_end_date   DATE
)
  ENGINE = innodb;

CREATE TABLE IF NOT EXISTS payments (
  created_at                TIMESTAMP,
  updated_at                TIMESTAMP,

  payment_id                INTEGER PRIMARY KEY AUTO_INCREMENT,
  private_sale_token        VARCHAR(40),
  public_sale_token         VARCHAR(40),
  url                       VARCHAR(256),
  user_id                   INTEGER,
  payed                     BOOLEAN DEFAULT FALSE,

  CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (user_id)
)
  ENGINE = innodb;


