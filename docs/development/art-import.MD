# Importing art data

This method can be used to do the yearly manual import of art data (AKA dreams) to spark DB

## Input Data

The input data is an excel or google sheet with the following columns:

* Email
* Name
* Phone Number
* Responsibilities
* Dream Name
* Dream Number
* Needs Early Arrival
* Has Ticket

## import process

create a new table for this event's art data

```
SET NAMES utf8;
CREATE TABLE `art_2018` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` text NOT NULL,
  `name` text NOT NULL,
  `phone_number` text NOT NULL,
  `responsibilities` text NOT NULL,
  `dream_name` text NOT NULL,
  `dream_number` text NOT NULL,
  `needs_early_arrival` text NOT NULL,
  `has_ticket` text NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

Use adminer to import the camp data as csv

remove leading/trailing whitespaces which might interefere with relation to users table

```
update art_2018 set email=trim(email)
```

Review the potential new spark users, there were some invalid emails / details - need to edit them manually

```
select name, email, phone_number
from art_2018 where email not in (select email from users)
```

Insert users for artist emails which don't already have a spark user:

```
insert into users (email, name, cell_phone) 
select email, name, phone_number
from art_2018 where email not in (select email from users) and email != ''
group by email
order by email
```

Insert the art camps, with relation to users
```
insert into camps (event_id, __prototype, camp_name_he, camp_name_en, status, main_contact)
select 'MIDBURN2018', 'art_installation', art_2018.dream_name, concat_ws('_', 'DREAM',art_2018.dream_name), 'closed', users.user_id
from art_2018, users
where art_2018.email = users.email
group by art_2018.dream_name
order by art_2018.dream_name
```

update camp_id in users table
```
update users 
set camp_id=(select id from camps where main_contact=users.user_id and event_id='MIDBURN2018' limit 1) 
where email in (select distinct(email) from art_2018)
```

* insert camp members
```
insert into camp_members (camp_id, user_id, status)
select id, main_contact, 'approved' from camps where event_id='MIDBURN2018' and __prototype='art_installation'
```

update all contact person ids to the leader user id

```
update camps set contact_person_id=main_contact, moop_contact=main_contact, safety_contact=main_contact where event_id='MIDBURN2018';
```
