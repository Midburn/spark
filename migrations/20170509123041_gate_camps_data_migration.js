var _ = require('lodash');

exports.up = function (knex, Promise) {
    return Promise.all([

        knex
            .raw(
            "CREATE TRIGGER camp_members_groups_after_ins AFTER INSERT ON camp_members " +
            "FOR EACH ROW " +
            "BEGIN " +
            "INSERT INTO users_groups_membership (group_id, user_id) VALUES (new.user_id, new.camp_id); " +
            "END"),

        knex.raw(
            "CREATE TRIGGER camp_members_groups_after_del AFTER DELETE ON camp_members " +
            "FOR EACH ROW " +
            "BEGIN " +
            "DELETE FROM users_groups_membership WHERE group_id = old.user_id AND user_id = old.camp_id; " +
            "END"),

        knex
            .raw(
            "CREATE TRIGGER camp_groups_after_ins AFTER INSERT ON camps " +
            "FOR EACH ROW " +
            "BEGIN " +
            "INSERT INTO users_groups (group_id, event_id, type, name) VALUES (new.id, 'MIDBURN2017', 'CAMP', new.camp_name_he); " +
            "END"),

        knex
            .raw(
            "CREATE TRIGGER camp_groups_after_del AFTER DELETE ON camps " +
            "FOR EACH ROW " +
            "BEGIN " +
            "DELETE FROM users_groups WHERE group_id = old.id; " +
            "END"),

        knex.select().from('camps').then(camps => {
            if (camps) {
                _.each(camps, camp => {
                    knex('users_groups').insert({
                        group_id: camp.camp_id,
                        event_id: "MIDBURN2017",
                        type: "CAMP",
                        name: camp.camp_name_he,
                        created_at: new Date()
                    });
                })
            }
        }),

        knex.select().from('camp_members').then(camp_members => {
            if (camp_members) {
                _.each(camp_members, member => {
                    knex('users_groups_membership').insert({
                        group_id: member.camp_id,
                        user_id: member.user_id,
                        created_at: new Date()
                    });
                })
            }
        })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([]);
};
