const User = require('../models/user').User,
log = require('../libs/logger')(module),

addUsersToDb = (users) => {
  log.info('Creating users...');
  return Promise.all(users.map(createUser))
  .catch((error) => {
    log.error('Spark encountered an error while seeding users:');
    log.error(error);
  });
};

/**
* Generate hash for given password and store user
*/
const createUser = (user) => {
  let newUser = new User(user);
  newUser.generateHash(user.password);
  // Force insert (with PK)
  return newUser.save(null, {method: 'insert'});
};

module.exports = addUsersToDb;
