exports.up = function (knex, Promise) {
    return Promise.all([
        knex.raw('DROP TRIGGER IF EXISTS camp_members_groups_after_ins').then(
            knex.raw(
                "CREATE TRIGGER camp_members_groups_after_ins AFTER INSERT ON camp_members " +
                "FOR EACH ROW " +
                "BEGIN " +
                "INSERT INTO users_groups_membership (group_id, user_id, status) VALUES (new.camp_id, new.user_id, new.status); " +
                "END"
            )
        )
    ])
};

exports.down = function (knex, Promise) {
    return Promise.all([]);
};
