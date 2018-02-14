# Importing camps data

This method can be used to do the yearly manual import of camps data to spark DB

## Input Data

The input data is an excel or google sheet with the following columns:

* camp_name_he
* camp_name_en
* camp_leader_name
* camp_leader_email

## import process

* login to adminer, create a new table for this event's camps data
  * **set collation to UTF-8**
* using adminer UI - import the camp data as CSV
* Insert users for camp leaders which don't already have a spark user:
```
insert into users (name, email, roles) 
select camp_leader_name, camp_leader_email, 'camp_manager' 
from camps_2018 where camp_leader_email not in (select email from users)
```
* Insert the camps, with relation to users
```
insert into camps (event_id, __prototype, camp_name_he, camp_name_en, main_contact)
select 'MIDBURN2018', 'theme_camp', camps_2018.camp_name_he, camps_2018.camp_name_en, users.user_id
from camps_2018, users
where camps_2018.camp_leader_email = users.email
```
* update camp_id in users table to the 2018 camps
```
update users set camp_id=(select id from camps where main_contact=users.user_id and event_id='MIDBURN2018') 
where email in (select camp_leader_email from camps_2018)
```
* insert the camp leaders as camp members
```
insert into camp_members (camp_id, user_id, status)
select id, main_contact, 'approved_mgr' from camps where event_id='MIDBURN2018'
```
* update all contact person ids to the leader user id
```
update camps set contact_person_id=main_contact, moop_contact=main_contact, safety_contact=main_contact where event_id='MIDBURN2018';
```
