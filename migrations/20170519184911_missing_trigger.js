var constants = require('../models/constants');

exports.up = function (knex, Promise) {
    return Promise.all([

        knex.raw(
            "CREATE TRIGGER camp_members_groups_after_ins AFTER INSERT ON camp_members " +
            "FOR EACH ROW " +
            "BEGIN " +
            "INSERT INTO users_groups_membership (group_id, user_id, status) VALUES (new.camp_id, new.user_id, new.status); " +
            "END"),

        knex.schema.table("events", table => {
            table.enu("gate_status", constants.EVENT_GATE_STATUS);
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([]);
};
