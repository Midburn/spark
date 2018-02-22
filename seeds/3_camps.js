const log = require('../libs/logger')(module);
const Camp = require('../models/camp').Camp;

addCampsToDb = function(camps) {
    log.info('Creating camps...');
    return Promise.all(camps.map(createCamp))
        .catch((error) => {
            log.error('Spark encountered an error while seeding camps:');
            log.error(error);
        });
};

const createCamp = (camp) => {
    return new Camp(camp).save(null, {method: 'insert'});
};

module.exports = addCampsToDb;
