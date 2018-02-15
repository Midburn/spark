const BASE_EVENT = {
    "event_id": "MIDBURN2017",
    "name": "Midbrun 2017 מידברן",
    "gate_code": 44075,
    "gate_status": "regular"
};

const BASE_ADMIN = {
    "user_id": 1,
    "created_at": "2017-06-23T01:50:16.763Z",
    "updated_at": "2018-01-21T04:36:24.829Z",
    "email": "admin@admin.com",
    "password": "a",
    "enabled": true,
    "validated": true,
    "roles": "admin",
    "first_name": "Admin",
    "last_name": "Adminson",
    "gender": "female",
    "date_of_birth": "2017-03-09T15:10:44.367Z",
    "israeli_id": 305151563,
    "address": "Somewhere out there in the admin fields",
    "cell_phone": "999-666-999",
    "extra_phone": "666-999-666",
    "npo_member": true,
    "current_event_id_ticket_count": 19409
};

const BASE_CAMP = {
    "id": 1,
    "created_at": "2017-08-29T07:59:19.438Z",
    "updated_at": "2017-02-04T22:38:58.623Z",
    "event_id": "MIDBURN2017",
    "__prototype": "prod_dep",
    "camp_name_he": "מחנה האדמין",
    "camp_name_en": "Admin's Camp",
    "camp_desc_he": "Officiis eum sed ex.",
    "camp_desc_en": "Omnis deserunt molestiae in veniam adipisci esse laboriosam earum minus.",
    "type": "music",
    "status": "open",
    "web_published": true,
    "camp_activity_time": "noon",
    "child_friendly": true,
    "noise_level": "noisy",
    "public_activity_area_sqm": 85973,
    "public_activity_area_desc": "Qui sed laborum sit eaque quo voluptas magni ut sit.",
    "support_art": false,
    "location_comments": "Sint nisi velit minus.",
    "camp_location_street": "Adipisci at nulla.",
    "camp_location_street_time": "Iste in qui.",
    "camp_location_area": "At recusandae occaecati consequatur sapiente sit.",
    "main_contact": 1,
    "moop_contact": 1,
    "safety_contact": 1,
    "accept_families": false,
    "facebook_page_url": "http://riley.name",
    "contact_person_phone": "1-595-471-1183 ",
    "contact_person_email": "Abby_Hilpert46@gmail.com",
    "contact_person_id": 1
};

module.exports = {
    BASE_EVENT,
    BASE_CAMP,
    BASE_ADMIN
};
