var _ = require('lodash');

exports.up = function (knex, Promise) {
    return Promise.all([

        knex
            .raw(
            "CREATE TRIGGER camp_members_groups_after_ins AFTER INSERT ON camp_members " +
            "FOR EACH ROW " +
            "BEGIN " +
            "INSERT INTO users_groups_membership (group_id, user_id) VALUES (new.camp_id, new.user_id); " +
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
                console.log("Found", camps.length, "camps to migrate");
                _.each(camps, camp => {
                    console.log("Camp:", camp.camp_name_he);
                    knex('users_groups').insert({
                        group_id: camp.camp_id,
                        event_id: "MIDBURN2017",
                        type: "CAMP",
                        name: camp.camp_name_he,
                        created_at: new Date()
                    }).then();
                })
            }
        }),

        knex.select().from('camp_members').leftJoin('users_groups_membership', function () {
            this.on("camp_members.user_id", "=", "users_groups_membership.user_id")
            .on("users_groups_membership.group_id", "=", "camp_members.camp_id");
        })
            .then(camp_members => {
                if (camp_members) {
                    console.log("Found", camp_members.length, "camp members to migrate");
                    _.each(camp_members, member => {
                        if (member.camp_id && !member.group_id) {
                            console.log("member:", member.user_id, "group:", member.camp_id);
                            knex('users_groups_membership').insert({
                                group_id: member.camp_id,
                                user_id: member.user_id,
                                created_at: new Date()
                            }).then(() => {
                                console.log("OK")
                            });
                        }
                    })
                }
            })
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([]);
};
