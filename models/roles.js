const bookshelf = require('../libs/db').bookshelf;
const constants = require('./constants.js');

let Roles = bookshelf.Model.extend({
    tableName: constants.USER_ROLES_TABLE_NAME
});

module.exports = { Roles };
