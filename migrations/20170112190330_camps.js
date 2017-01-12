exports.up = function (knex, Promise) {
    return Promise.all([

        // Camps table
        knex.schema.createTable('camps', function (table) {
            table.timestamps();

            // General information

            table.increments('id').primary();

            table.string('camp_name_he', 50).unique();
            table.string('camp_name_en', 50).unique();
            table.text('camp_desc_he', 'mediumtext');
            table.text('camp_desc_en', 'mediumtext');

            // Modifiers
            table.enu('type', ['food', 'drinking/bar', 'music', 'workshops', 'art-supporting', 'other']);
            table.enu('status', ['deleted', 'open', 'closed', 'inactive']);
            table.boolean('enabled').defaultTo(false);

            // Users relations
            table.integer('main_contact').unsigned();
            table.foreign('main_contact').references('users.user_id');
            table.integer('moop_contact').unsigned();
            table.foreign('moop_contact').references('users.user_id');
            table.integer('safety_contact').unsigned();
            table.foreign('safety_contact').references('users.user_id');
        }),

        // Camp Details table
        knex.schema.createTable('camp_details', function (table) {
            table.enu('camp_activity_time', ['morning', 'noon' ,'evening' ,'night']);
            table.boolean('child_friendly');
            table.enu('noise_level', ['quiet' ,'medium' ,'noisy' ,'very noisy']);
            table.integer('public_activity_area_sqm');
            table.text('public_activity_area_desc', 'mediumtext');
            table.boolean('support_art');

            // Location
            table.text('location_comments', 'mediumtext');
            table.text('camp_location_street');
            table.text('camp_location_street_time');
            table.integer('camp_location_area');
            table.integer('camp_id').unsigned();
            table.foreign('camp_id').references('camps.id');
        }),
        
        // Add users camp_id field
        knex.schema.table('users', function (table) {
            table.integer('camp_id').unsigned();
            table.foreign('camp_id').references('camps.id');
        })
    ]);
};

exports.down = function (knex, Promise) {};
