USE spark;
ALTER TABLE users CHANGE gender gender ENUM('male','female', 'other');
