# Camps Import and DB manipulations

This method can be used to do the yearly manual import of camps data to spark DB and manual fixes / adjustments as required.


## Initial Camps Import

### Input Data

The input data is an excel or google sheet with the following columns:

* camp_name_he
* camp_name_en
* camp_leader_name
* camp_leader_email

### import process

* login to adminer, create a new table for this event's camps data
  * **set collation to UTF-8**
* using adminer UI - import the camp data as CSV (or export from existing DB which has the data)
* remove leading/trailing whitespaces which might interefere with relation to users table
  * `update camps_2018 set camp_leader_email=trim(camp_leader_email)`
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
* update all camp status to open (if status field is null it causes problems in spark)
```
update camps set status='open' where event_id='MIDBURN2018';
```


## Importing additional camps

After the initial import you can add additional camps using an `import_group` column and incrementing the group number on each additional import

* for the first additional import - edit `camps_2018` table and add `import_group` column with default value of `1`
* prepare import csv file for the additional camps with the additional `import_group` column with value of max import group + 1 (e.g. `2`)
* import the additional camps using adminer
* continue import process, but add ` and import_group=` to all where queries of `camps_2018` table:

**Replace 2 in following example with the actual latest import_group**

```
update camps_2018 set camp_leader_email=trim(camp_leader_email) where import_group=2;

insert into users (name, email, roles)
select camp_leader_name, camp_leader_email, 'camp_manager' 
from camps_2018 where camp_leader_email not in (select email from users) and import_group=2;

insert into camps (event_id, __prototype, camp_name_he, camp_name_en, main_contact)
select 'MIDBURN2018', 'theme_camp', camps_2018.camp_name_he, camps_2018.camp_name_en, users.user_id
from camps_2018, users
where camps_2018.camp_leader_email = users.email and camps_2018.import_group=2;

update users set camp_id=(select id from camps where main_contact=users.user_id and event_id='MIDBURN2018') 
where email in (select camp_leader_email from camps_2018 where import_group=2);

insert into camp_members (camp_id, user_id, status)
select id, main_contact, 'approved_mgr' from camps where event_id='MIDBURN2018' and camp_name_he in (select camp_name_he from camps_2018 where import_group=2);

update camps set contact_person_id=main_contact, moop_contact=main_contact, safety_contact=main_contact where event_id='MIDBURN2018' and camp_name_he in (select camp_name_he from camps_2018 where import_group=2);

update camps set status='open' where event_id='MIDBURN2018' and camp_name_he in (select camp_name_he from camps_2018 where import_group=2);
```


## Importing additional approved camp members

* You should have a list of approved camp members emails to add to the camp
* All camp members should have a spark / drupal profile
* You can get the relevant camp ID: `select id from camps where camp_name_he like '%%'` and event_id='MIDBURN2018'
* Create a table: `camp_members_2018` with columns: `camp_id,email` (and additional fields if there were in the source data)
* Import the aproved members list to the table
* Trim emails: `update camp_members_2018 set email=trim(email)`
* Update camp members users table camp indication:
```
update users set camp_id=(select camp_id from camp_members_2018 where email = users.email)
where email in (select email from camp_members_2018 where approved_text='מאושרים כחבר מחנה');
```
* Insert camp members (users not already member of 2018 camps)
```
insert into camp_members (camp_id, user_id, status)
select camp_members_2018.camp_id, users.user_id, 'approved'
from camp_members_2018, users
where camp_members_2018.approved_text='מאושרים כחבר מחנה'
and camp_members_2018.email = users.email
and users.user_id not in (select user_id from camp_members where camp_id in (select id from camps where event_id='MIDBURN2018'))
```


## Importing pre sale ticket allocations
* Backup - `select id, pre_sale_tickets_quota from camps where event_id='MIDBURN2018' and __prototype='theme_camp'`
* sheet file with columns: `camp_id`, `num_tickets`
* add a forumla field, something like: `="update camps set pre_sale_tickets_quota="&B107&" where id='"&A107&"' and event_id='MIDBURN2018' and __prototype='theme_camp';"`
* duplicate to all rows, paste and run in adminer

