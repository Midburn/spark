
USE spark;

##########
#  DROP  #
##########

DROP TABLE IF EXISTS camps;
DROP TABLE IF EXISTS camp_details;

############
#  CREATE  #
############

CREATE TABLE IF NOT EXISTS camps (
  created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at                TIMESTAMP NULL DEFAULT NULL,

  # General information
  camp_id                   INTEGER PRIMARY KEY AUTO_INCREMENT,
  camp_name_he              VARCHAR(50) UNIQUE,
  camp_name_en              VARCHAR(50) UNIQUE,
  camp_desc_he              MEDIUMTEXT,
  camp_desc_en              MEDIUMTEXT,

  # Modifiers
  type                      TEXT,
  status                    ENUM('deleted', 'open', 'closed', 'inactive'),
  enabled                   BOOLEAN DEFAULT FALSE,

  # Users relations
  main_contact              INTEGER,
  moop_contact              INTEGER,
  safety_contact            INTEGER,
  CONSTRAINT FOREIGN KEY (main_contact) REFERENCES users (user_id),
  CONSTRAINT FOREIGN KEY (moop_contact) REFERENCES users (user_id),
  CONSTRAINT FOREIGN KEY (safety_contact) REFERENCES users (user_id)
)
  ENGINE = innodb, DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS camp_details (

  camp_id                   INTEGER PRIMARY KEY,
  camp_activity_time        ENUM('morning', 'noon' ,'evening' ,'night'),
  child_friendly            BOOLEAN,
  noise_level               ENUM('quiet' ,'medium' ,'noisy' ,'very noisy'),
  public_activity_area_sqm  INTEGER,
  public_activity_area_desc MEDIUMTEXT,
  support_art               BOOLEAN,

  # Location
  location_comments         MEDIUMTEXT,
  camp_location_street      TEXT,
  camp_location_street_time TEXT,
  camp_location_area        INTEGER,

  CONSTRAINT FOREIGN KEY (camp_id) REFERENCES camps (camp_id)
)

-- FAKE DATA
-- INSERT INTO camps (camp_name_he, camp_name_en, camp_desc_he) VALUES ('campNameHE', 'campNameEN', 'campDesc');
