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
select * from art_2018 
where lower(trim(email)) not in (select lower(trim(email)) from users)
```

You can fix/remove any invalid rows.

Insert users for artists which don't already have a spark user (according to the email):

(should be safe to re-run this query if you made updates to art_2018 table)

```
insert into users (email, name, cell_phone) 
select trim(email), trim(name), trim(phone_number)
from art_2018 
where lower(trim(email)) not in (
  select lower(trim(email)) from users
)
and lower(trim(email)) != ''
group by lower(trim(email))
order by lower(trim(email))
```

Insert camps, with relation to users (using the first user for each art installation as the main contact)

```
insert into camps (event_id, __prototype, camp_name_he, camp_name_en, status, main_contact, contact_person_id, moop_contact, safety_contact)
select 'MIDBURN2018', 'art_installation', art_2018.dream_name, concat_ws('_', 'DREAM',art_2018.dream_name), 'closed', users.user_id, users.user_id, users.user_id, users.user_id
from art_2018, users
where lower(trim(art_2018.email)) = lower(trim(users.email))
group by art_2018.dream_name
order by art_2018.dream_name
```

camps has a trigger which will insert a corresponding row to `users_groups`, update the users_groups type to art 

```
update users_groups set event_id='MIDBURN2018', type='art_installation' where group_id in (select id from camps where event_id='MIDBURN2018' and __prototype='art_installation')
```

insert camp members

```
insert into camp_members (camp_id, user_id, status)
select camps.id, users.user_id, 'approved'
from users, camps, art_2018
where lower(trim(users.email)) = lower(trim(art_2018.email))
and art_2018.dream_name = camps.camp_name_he
and camps.event_id='MIDBURN2018' and camps.__prototype='art_installation'
group by users.user_id, camps.id
order by users.user_id, camps.id
```

## set ticket quotas

* Google sheet with the following columns: id, name, leader_name, leader_email, open_in_spark, num_tickets
* Import to adminer table - `art_2018_quotas`
* check how many valid dreams with quotas
```
select count(1) from art_2018_quotas aq where aq.num_tickets is not null  and cast(aq.num_tickets as integer) > 0  
and not (aq.id is null and aq.leader_name is null and aq.leader_email is null and aq.name is null)
```
* update pre sale tickets quota, matching based on camp name
```
update camps set pre_sale_tickets_quota=(
select num_tickets from art_2018_quotas aq
where aq.num_tickets is not null  and cast(aq.num_tickets as integer) > 0  
and not (aq.id is null and aq.leader_name is null and aq.leader_email is null and aq.name is null)
and trim(lower(camps.camp_name_he)) = trim(lower(aq.name))
and camps.event_id='MIDBURN2018' and camps.__prototype='art_installation'
) where camps.event_id='MIDBURN2018' and camps.__prototype='art_installation' and (camps.pre_sale_tickets_quota is null or pre_sale_tickets_quota < 1)
```

## Get list of invalid / missing users

To get a list of invalid users, repeat the import of original data but to a table called `art_2018_original`

Get all rows from original data which don't have a related spark user:

```
select * from art_2018_original where trim(lower(email)) not in (select trim(lower(email)) from users)
```
