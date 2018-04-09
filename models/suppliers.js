let bookshelf = require('../libs/db').bookshelf;
let knex = require('../libs/db').knex;
let constants = require('./constants.js');

let Suppliers = bookshelf.Model.extend({

    tableName: constants.SUPPLIERS_TABLE_NAME,
    idAttribute: 'supplier_id',

    getSupplierCamps: async function (done, req) {

        try {
            let camps = await knex(constants.SUPPLIERS_RELATIONS_TABLE_NAME).select()
            .innerJoin(constants.EVENTS_TABLE_NAME, constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.event_id', constants.EVENTS_TABLE_NAME + '.event_id')
            .innerJoin(constants.SUPPLIERS_TABLE_NAME, constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.supplier_id', constants.SUPPLIERS_TABLE_NAME + '.supplier_id')
            .innerJoin(constants.CAMPS_TABLE_NAME, constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.camp_id', constants.CAMPS_TABLE_NAME + '.id')
            .where(constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.supplier_id', this.attributes.supplier_id);
            if (typeof done === 'function') {
                done(camps);
            }
            return camps;
        } catch (err) {
            throw err;
        }

    },

    setSupplierCamp: async function (data) {

        try {
            data.supplier_id = this.attributes.supplier_id;
            return await knex(constants.SUPPLIERS_RELATIONS_TABLE_NAME).insert(data)
        } catch (err) {
            throw err;
        }
    },

    removeSupplierCamp: async function (data) {

        try {
            data.supplier_id = this.attributes.supplier_id;
            return await knex(constants.SUPPLIERS_RELATIONS_TABLE_NAME).delete().where(data)
        } catch (err) {
            throw err;
        }
    }
});

let SupplierContract = bookshelf.Model.extend({

    tableName: constants.SUPPLIERS_CONTRACTS_TABLE_NAME,
    idAttribute: 'supplier_id'
    });

module.exports = {
    Suppliers: Suppliers,
    SupplierContract: SupplierContract
};
