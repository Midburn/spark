#!/usr/bin/env node
const parse = require('csv-parse/lib/sync');
const fs = require('fs');
const _ = require('lodash');
const knex = require('../libs/db').knex;
const constants = require('../models/constants');
const UserGroup = require('../models/user.js').UsersGroup;
const Camp = require('../models/camp.js').Camp;

function help() {
    console.log("\nImport camps data into the DB\n\nUsage:\n  bin/import_camps_data.js <camp_users_csv_file> <camps_csv_file> [--dry-run]\n")
}

function main(argv) {
    let users_file = argv[2];
    let camps_file = argv[3];
    let users_csv_data = fs.readFileSync(users_file);
    let camps_csv_data = fs.readFileSync(camps_file);

    // [{
    //      name: "", cell_phone: "", email: "", roles: ""
    // }...]
    let users_data = parse(users_csv_data, { columns: true });

    // [{
    //      camp_name_he: "", camp_name_en: "", camp_desc_he: "", camp_desc_en: "",
    //      status: "open" / null, facebook_page_url: "", accept_families: "FALSE" / "TRUE", email: ""
    // }...]
    let camps_data = parse(camps_csv_data, { columns: true });
    Promise.all([
        // Camps table
        // knex.schema.alterTable(constants.CAMPS_TABLE_NAME, function (table) {
        //     table.enu('__prototype', constants.CAMP_PROTOTYPE);
        //     console.log('updating default prototypes: ' + constants.CAMP_PROTOTYPE);
        // }),
        knex.schema.raw("ALTER TABLE  `camps` CHANGE  `__prototype`  `__prototype` ENUM(  'theme_camp',  'art_installation',  'prod_dep') CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL")

    ]
        // , [
        //         Camp.forge({ id: 1 }).fetch().then(function (res) {
        //             console.log(res);
        //             if (res.length > 0 && res[0].id > 0) {
        //                 let camp = {
        //                     early_arrival_quota: 5
        //                 }
        //                 console.log('updating entrance_quota to ' + camp.early_arrival_quota);
        //                 UserGroup.forge({ group_id: res[0].id }).save(
        //                     { 'entrance_quota': camp.early_arrival_quota }
        //                 ).then(() => {
        //                     console.log('updated entrance_quota to ' + camp.early_arrival_quota);
        //                 });
        //                 // let query = 'UPDATE users_groups SET entrance_quota="0" WHERE group_id="' + res[0].id + '";';
        //                 // console.log(query);
        //                 // knex.raw(query).then(() => {
        //                 //     console.log('updated camp early adapter');
        //                 // });
        //             }
        //         })

        //     ]
    );

    Promise.all(_(users_data).map(function (user) {
        let email = user.email;
        if (!email) {
            console.log("bad email. skipping this line!");
            return true;
        }
        email = email.trim().toLowerCase();
        return knex(constants.USERS_TABLE_NAME).where({ email: email }).then(function (res) {
            // console.log(res);
            // process.exit();
            if (res.length > 0) {
                console.log("user already exists for email " + email + " - skipping inserting this user");
                return true;
            } else {
                let _get_name = function (_name) {
                    if (_name && _name !== '') {
                        return _name.split(" ");
                    }
                }
                let _name = _get_name(user.first_name);
                if (!_name) {
                    _name = _get_name(user.full_name);
                }
                var first_name = (_name.length > 0) ? _name[0] : '';
                var last_name = (_name.length > 1) ? _name.slice(1, _name.length).join(" ") : '';
                return knex(constants.USERS_TABLE_NAME).insert({
                    name: user.name,
                    first_name: first_name,
                    last_name: last_name,
                    cell_phone: user.cell_phone,
                    email: email,
                    roles: user.role,
                    validated: false,
                    created_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
                    updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' ')
                }).then(function () {
                    console.log("inserted user: " + email);
                }).catch(function (err) {
                    // console.log(res); 
                    console.log("error inserting user: " + email);
                    // console.log(err);
                    // process.exit();
                });
            }
        });
    })).then(function () {
        let times = 0;
        return Promise.all(_(camps_data).map(function (camp) {
            // find camp or new
            let camp_name_en = camp.camp_name_en;
            let camp_name_he = camp.camp_name_he;
            let event_id = camp.event_id;
            let __prototype = camp.__prototype;
            // console.log('working on ' + camp_name_en + '/' + camp_name_he + ' of event: ' + event_id + ' group type: ' + __prototype)
            if (constants.CAMP_PROTOTYPE.indexOf(camp.__prototype) > -1) {
                __prototype = camp.__prototype;
            } else {
                __prototype = constants.prototype_camps.THEME_CAMP.id;
                // console.log('WARNING: __prototype is not set. Assuiming default '.constants.prototype_camps.THEME_CAMP.id);
                console.log('ERROR: __prototype is not set. skipping.');
                return;
            }

            let _where = {
                event_id: event_id,
                // __prototype: __prototype
            };
            if (camp_name_he && camp_name_he.trim() !== '') {
                _where.camp_name_he = camp_name_he;
            }
            if (camp_name_en && camp_name_en.trim() !== '') {
                if (!_where.camp_name_he) {
                    _where.camp_name_en = camp_name_en;
                }
            }
            if (!_where.camp_name_he && !_where.camp_name_en) {
                console.log('ERROR: camp is missing camp_name. cannot update or create new camp.');
            }
            // console.log(_where);
            // process.exit();
            return knex(constants.CAMPS_TABLE_NAME).where(_where).then(function (res) {
                // console.log(res);
                if (res.length > 0) {
                    // console.log("camp already exists for english camp name: " + camp_name_en + " - skipping inserting this camp");
                } // else {
                var _camp_rec = {};
                var _camp_rec_add_field = function (key, value, default_value) {
                    // console.log(_camp_rec);
                    if (value) {
                        _camp_rec[key] = value;
                    } else if (default_value) {
                        _camp_rec[key] = default_value;
                    }
                }
                let web_published;
                if (camp.web_published) {
                    web_published = (camp.web_published.toLowerCase() === 'true');
                }
                var _camp_rec = {
                    '__prototype': __prototype,
                    event_id: event_id,
                    // camp_name_he: camp.camp_name_he,
                    // camp_name_en: camp.camp_name_en,
                    // camp_desc_he: camp.camp_desc_he,
                    // camp_desc_en: camp.camp_desc_en,
                    // type: '',
                    // status: camp.status.toLowerCase(),
                    // web_published: web_published,
                    // camp_activity_time: '',
                    // facebook_page_url: camp.facebook_page_url,
                    // accept_families: camp.accept_families,
                    // contact_person_name: camp.contact_person_name,
                    // contact_person_email: camp.contact_parson_email,
                    // created_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
                    updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' ')
                };
                _camp_rec_add_field('camp_name_he', camp.camp_name_he);
                _camp_rec_add_field('camp_name_en', camp.camp_name_en);
                _camp_rec_add_field('camp_desc_he', camp.camp_desc_he);
                _camp_rec_add_field('camp_desc_en', camp.camp_desc_en);
                _camp_rec_add_field('type', '', '');
                _camp_rec_add_field('web_published', web_published);
                _camp_rec_add_field('camp_activity_time', '', '');
                _camp_rec_add_field('facebook_page_url', camp.facebook_page_url);
                _camp_rec_add_field('accept_families', camp.accept_families);
                _camp_rec_add_field('contact_person_name', camp.contact_person_name);
                _camp_rec_add_field('contact_person_email', camp.contact_parson_email);
                if (camp.status !== "closed" && camp.status !== "open" && camp.status !== "deleted" && camp.status !== "inactive") {
                    _camp_rec['status'] = 'closed';
                }
                var update_early_quota = function () {
                    // if (camp.early_arrival_quota && camp.early_arrival_quota.trim() !== '') {
                    //     times++;
                    //     if (times > 1)
                    //         return true;
                    //     console.log(camp.early_arrival_quota + " " + times);

                    //     knex.raw('select * from camps where event_id="MIDBURN2017" AND camp_name_he LIKE "Reflectopus";').then(function (res) {
                    //     // return knex.raw('select * from camps where id=1;').then(function (res) {
                    //         // _where = {
                    //         // 'event_id': 'MIDBURN2017',
                    //         // 'camp_name_he': 'Reflectopus',
                    //         // '__prototype': 'art_installation'
                    //         // }
                    //         // _where = {
                    //         // 'id': 1,
                    //         // }
                    //         // console.log(_where);
                    //         // Camps
                    //         // return knex(constants.CAMPS_TABLE_NAME).where(_where).then(function (res) {
                    //         // return Camp.forge(_where).fetch().then(function (res) {
                    //         console.log(res);
                    //         // process.exit();
                    //         if (res.length > 0 && res[0].id > 0) {
                    //             console.log('updating entrance_quota to ' + camp.early_arrival_quota);
                    //             return UserGroup.forge({ group_id: res[0].id }).save(
                    //                 { 'entrance_quota': camp.early_arrival_quota }
                    //             ).then(() => { console.log('updated entrance_quota to ' + camp.early_arrival_quota); });
                    //             // let query = 'UPDATE users_groups SET entrance_quota="0" WHERE group_id="' + res[0].id + '";';
                    //             // console.log(query);
                    //             // knex.raw(query).then(() => {
                    //             //     console.log('updated camp early adapter');
                    //             // });
                    //         }
                    //     });
                    // }
                }
                if (res.length > 0) {
                    // console.log(res[0]);
                    _camp_rec.id = res[0].id;
                    // console.log('updating ' + res[0].id + '/'.camp_name_he);
                    // console.log(_camp_rec);
                    // return knex(constants.CAMPS_TABLE_NAME).update(_camp_rec).then(function () {
                    // console.log("updated camp: " + camp_name_en);
                    // debugger;
                    // console.log('update eaarly quota');
                    return update_early_quota();
                    // }).catch(err => {
                    // console.log(err)
                    // });
                } else {
                    console.log("inserting new camp " + camp_name_en);
                    return knex(constants.CAMPS_TABLE_NAME).insert(_camp_rec).then(function () {
                        console.log("inserted camp: " + camp_name_en);
                        return update_early_quota();
                    }).catch(function (err) {
                        // console.log(res); 
                        console.log("error inserting camp: " + _camp_rec);
                        // console.log(err);
                        // process.exit();
                    });;
                    // }
                }

            }).then(function () {
                if (camp.early_arrival_quota && camp.early_arrival_quota.trim() !== '') {
                    return knex(constants.CAMPS_TABLE_NAME).where(_where).then(function (res) {
                        if (res.length > 0 && res[0].id > 0) {
                            console.log('Updating entrance_quota to ' + camp_name_he + ' early arrival quota: ' + camp.early_arrival_quota);
                            return UserGroup.forge({ group_id: res[0].id }).save(
                                { 'entrance_quota': camp.early_arrival_quota }
                            ).then(() => {
                                console.log('Succesfully updated quota to ' + camp_name_he + ' early arrival quota: ' + camp.early_arrival_quota);
                            });
                        }
                    });
                }

            }).then(function () {
                console.log('Updating camp_members for ' + __prototype + '/' + camp_name_he);
                // if (camp.)
                if (camp.member_status !== '' && camp.email !== '') {
                    return knex(constants.CAMPS_TABLE_NAME).where(_where).then(function (camps) {
                        if (camps.length !== 1) throw new Error();
                        let _camp = camps[0];
                        let camp_id = _camp.id;
                        // console.log(camp.email);
                        return knex(constants.USERS_TABLE_NAME).where({ email: camp.email }).then((users) => {
                            if (users.length !==1) return true;
                            let user_id = users[0].user_id;
                            console.log(users[0]+ ' '+user_id);
                            let query = 'INSERT INTO camp_members (user_id,camp_id,status) VALUES ("' + user_id + '","' + camp_id + '","' + camp.member_status + '") ON DUPLICATE KEY UPDATE status=values(status);';
                            return knex.raw(query).then(() => {
                                console.log('updated approved for user_id ' + user_id + '/'+camp.email+' of camp ' + camp_id + '/' + camp_name_he);
                            });
                        });
                        // return knex(constants.CAMPS_TABLE_NAME).where({ camp_name_en: camp_name_en }).update({
                        //     main_contact: user_id,
                        //     contact_person_id: user_id,
                        // }).then(function (res) {
                        // return knex(constants.USERS_TABLE_NAME).where({ user_id: user_id }).update({
                        //     camp_id: camp_id
                        // }).then(function () {
                        //     if (!user) {
                        //         return false;
                        //     }
                        //     console.log(" updating " + camp_id + "(" + camp_name_en + ") to " + user_id + "(" + user["name"] + ")");
                        //     return knex(constants.CAMP_MEMBERS_TABLE_NAME).insert({
                        //         camp_id: camp_id,
                        //         user_id: user_id,
                        //         status: 'approved'
                        //     }).then(function () {
                        //         console.log("updated camp/users relations for camp " + camp_name_en);
                        //     });
                        // });
                        // });
                    });

                }
            });
        })).then(function () {
            console.log("Great Success!");
            process.exit();
        }).catch(function (err) {
            console.log("ERROR!");
            console.log(err);
            process.exit();
        });
    });

}

if (process.argv.length < 4) {
    help();
    process.exit();
} else {
    main(process.argv);
}
