var log = require('../libs/logger')(module);
const camps = require('./dev/camps');

exports.seed = function(knex, Promise) {
    return Promise.resolve(() => {
        let campPromises = [];
        camps.forEach((camp) => {
            campPromises.push(createCamp(knex, camp));
        });
        return Promise.all(campPromises);
    })
    .catch((error) => {
        log.error('Spark encountered an error while seeding camps:');
        log.error(error);
    });
};

/**
* Supplied camp json is expected to hold email address
* of main contact and owner under contact_person_email.
* Entry will then be normalized with respect to users table. 
*/
const createCamp = (knex, camp) => {
    return knex('users').where('email', camp.contact_person_email).first()
    .then((user) => {
        camp.contact_person_id = camp.main_contact = user.user_id;
        return knex('camps').insert(camp);
    });
};
