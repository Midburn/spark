USE spark;
ALTER TABLE users ADD COLUMN facebook_id VARCHAR(50);
ALTER TABLE users ADD COLUMN facebook_token VARCHAR(255);

