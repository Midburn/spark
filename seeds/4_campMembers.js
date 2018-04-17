const log = require('../libs/logger')(module);
const CampMember = require('../models/user').CampMember;

addCampMembers = function(campMembers) {
    log.info('Creating camps...');
    return Promise.all(campMembers.map(createCampMember))
        .catch((error) => {
            log.error('Spark encountered an error while seeding camps:');
            log.error(error);
        });
};

const createCampMember = (campMember) => {
    return new CampMember(campMember).save(null, {method: 'insert'});
};

module.exports = addCampMembers;
