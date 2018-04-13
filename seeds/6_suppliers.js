const log = require('../libs/logger')(module);
const Suppliers = require('../models/suppliers').Suppliers;

addSuppliers = function(suppliers) {
    log.info('Creating suppliers...');
    return Promise.all(suppliers.map(createSupplier))
        .catch((error) => {
            log.error('Spark encountered an error while seeding suppliers:');
            log.error(error);
        });
};

const createSupplier = (supplier) => {
    return new Suppliers(supplier).save(null, {method: 'insert'});
};

module.exports = addSuppliers;
