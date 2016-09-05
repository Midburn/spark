
USE spark;

##########
#  DROP  #
##########

DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS npo_members;
DROP TABLE IF EXISTS users;

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
  enabled                   BOOLEAN DEFAULT TRUE,
  activated                 BOOLEAN DEFAULT FALSE,
  roles                     VARCHAR(200) DEFAULT  '',

  # Profile fields
  first_name                VARCHAR(64),
  last_name                 VARCHAR(64),
  gender                    ENUM('male', 'female'),
  date_of_birth             DATE,
  israeli_id                CHAR(9),
  address                   VARCHAR(100),
  cell_phone                CHAR(10),
  extra_phone               CHAR(10),
  npo_member                BOOLEAN DEFAULT FALSE
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

CREATE TABLE IF NOT EXISTS npo_members (
  created_at                TIMESTAMP,
  updated_at                TIMESTAMP,

  user_id                   INTEGER PRIMARY KEY,

  membership_status     ENUM('not_member', 'request_approved', 'member_paid', 'member_should_pay', 'banned', 'request_rejected', 'applied_for_membership') DEFAULT 'not_member',
  application_date      TIMESTAMP,
  membership_start_date DATE,
  membership_end_date   DATE,
  form_previous_p       LONGTEXT,
  form_future_p         LONGTEXT,
  form_why_join         LONGTEXT,

  CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (user_id)
)
  ENGINE = innodb;


