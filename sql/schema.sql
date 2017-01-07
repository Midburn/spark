use spark;
############
#  CREATE  #
############

CREATE TABLE IF NOT EXISTS users (
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP NULL DEFAULT NULL,

  # Basic ID + security fields
  user_id                   INTEGER PRIMARY KEY AUTO_INCREMENT,
  email                     VARCHAR(100) UNIQUE,
  password                  VARCHAR(100),
  reset_password_token      VARCHAR(32) UNIQUE,
  reset_password_expires    TIMESTAMP NULL DEFAULT NULL,
  email_validation_token    VARCHAR(32) UNIQUE,
  email_validation_expires  TIMESTAMP NULL DEFAULT NULL,
  enabled                   BOOLEAN DEFAULT TRUE,
  validated                 BOOLEAN DEFAULT FALSE,
  roles                     VARCHAR(200) DEFAULT  '',

  # Profile fields
  first_name                VARCHAR(64),
  last_name                 VARCHAR(64),
  gender                    ENUM('male', 'female', 'other'),
  date_of_birth             DATE,
  israeli_id                CHAR(9),
  address                   VARCHAR(100),
  cell_phone                CHAR(10),
  extra_phone               CHAR(10),
  npo_member                BOOLEAN DEFAULT FALSE,
  facebook_id		        VARCHAR(50),
  facebook_token            VARCHAR(255)

)
  ENGINE = innodb, DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS payments (
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP NULL DEFAULT NULL,

  payment_id                INTEGER PRIMARY KEY AUTO_INCREMENT,
  private_sale_token        VARCHAR(40),
  public_sale_token         VARCHAR(40),
  url                       VARCHAR(256),
  user_id                   INTEGER,
  payed                     BOOLEAN DEFAULT FALSE,

  CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (user_id)
)
  ENGINE = innodb, DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS npo_members (
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP NULL DEFAULT NULL,

  user_id                   INTEGER PRIMARY KEY,

  membership_status     ENUM('not_member', 'request_approved', 'member_paid', 'member_should_pay', 'banned', 'request_rejected', 'applied_for_membership') DEFAULT 'not_member',
  application_date      TIMESTAMP NULL DEFAULT NULL,
  membership_start_date DATE,
  membership_end_date   DATE,
  form_previous_p       LONGTEXT,
  form_future_p         LONGTEXT,
  form_why_join         LONGTEXT,

  CONSTRAINT FOREIGN KEY (user_id) REFERENCES users (user_id)
)
  ENGINE = innodb, DEFAULT CHARSET=utf8;
