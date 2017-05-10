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

        knex.select().from('camps').leftJoin('users_groups', 'id', 'group_id').then(camps => {
            if (camps) {
                console.log("Found", camps.length, "camps to migrate");
                _.each(camps, camp => {
                    if (camp.id && !camp.group_id) {
                        console.log("Camp:", camp.id, camp.camp_name_he);
                        knex('users_groups').insert({
                            group_id: camp.id,
                            event_id: "MIDBURN2017",
                            type: "CAMP",
                            name: camp.camp_name_he,
                            created_at: new Date()
                        }).then();
                    }
                })
            }
        }),

        knex.raw("insert into users_groups_membership(user_id, group_id)" + "select cm.user_id, cm.camp_id " +
            "from users u " +
            "inner join camp_members cm on u.user_id = cm.user_id " +
            "where status='approved' " +
            "ON DUPLICATE KEY UPDATE user_id = cm.user_id;")
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([]);
};
