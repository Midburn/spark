
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
  updated_at                TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

  # General information
  id                        INTEGER PRIMARY KEY AUTO_INCREMENT,
  camp_name_he              VARCHAR(50) UNIQUE,
  camp_name_en              VARCHAR(50) UNIQUE,
  camp_desc_he              MEDIUMTEXT,
  camp_desc_en              MEDIUMTEXT,

  # Modifiers
  type                      VARCHAR(50),
  status                    VARCHAR(50),
  enabled                   BOOLEAN NOT NULL DEFAULT 0,

  # Users relations
  main_contact              INTEGER,
  moop_contact              INTEGER,
  safety_contact            INTEGER,
  CONSTRAINT FOREIGN KEY (main_contact) REFERENCES users (user_id),
  CONSTRAINT FOREIGN KEY (moop_contact) REFERENCES users (user_id),
  CONSTRAINT FOREIGN KEY (safety_contact) REFERENCES users (user_id)
)
go
CREATE TABLE IF NOT EXISTS camp_details (
  id                        INTEGER PRIMARY KEY AUTO_INCREMENT,
  camp_activity_time        VARCHAR(50),
  child_friendly            BOOLEAN NOT NULL DEFAULT 0,
  noise_level               VARCHAR(50),
  public_activity_area_sqm  INTEGER,
  public_activity_area_desc MEDIUMTEXT,
  support_art               BOOLEAN NOT NULL DEFAULT 0,

  # Location
  location_comments         MEDIUMTEXT,
  camp_location_street      TEXT,
  camp_location_street_time TEXT,
  camp_location_area        INTEGER,
  camp_id                   INTEGER,

  CONSTRAINT FOREIGN KEY (camp_id) REFERENCES camps (id)
);

-- CHARSET
ALTER TABLE camps CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;
ALTER TABLE camp_details CONVERT TO CHARACTER SET utf8 COLLATE utf8_general_ci;

-- FAKE DATA
INSERT INTO camps (camp_name_he, camp_name_en, camp_desc_he, camp_desc_en, type, status, enabled, main_contact, moop_contact, safety_contact) VALUES ('Camp Lebowski', 'Camp Lebowski', 'לפעמים יש מחנה. מחנה שנכון לזמן ולמקום שלו... שפשוט מתאים בול. לא צריך להגיד, אבל אנחנו מדברים על הדודאים. בואו סובבו גלגל מזל וקבלו White Russian בזמן שאתם מוקפים בניהליסטים. בואו להרגע עם Creedence ותזכו לחזות איך השטיח סוגר את הפינות. לא מפריע לנו שתדליקו איזה J תוך כדי. אתם נכנסים לעולם של כאב.', 'לפעמים יש מחנה. מחנה שנכון לזמן ולמקום שלו... שפשוט מתאים בול. לא צריך להגיד, אבל אנחנו מדברים על הדודאים. בואו סובבו גלגל מזל וקבלו White Russian בזמן שאתם מוקפים בניהליסטים. בואו להרגע עם Creedence ותזכו לחזות איך השטיח סוגר את הפינות. לא מפריע לנו שתדליקו איזה J תוך כדי. אתם נכנסים לעולם של כאב.', 'bar', null, null, 1, 1, 1);
INSERT INTO camp_details (camp_activity_time, child_friendly, noise_level, public_activity_area_sqm, public_activity_area_desc, support_art, location_comments, camp_location_street, camp_location_street_time, camp_location_area, camp_id) VALUES ('morning', null, 'quiet', null, 10, 'playground', null, 'comments?', null, null, 1, 1);
