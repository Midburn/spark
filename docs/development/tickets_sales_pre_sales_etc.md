# documentation of tickets / sales related stuff

## Updating addinfo_json fields

The addinfo_json field (in camp_members table) contains some details regarding ticket allocations

Occasionally we might need to manually update it for some users, the following procedure allows to do it directly in DB using plain SQL

First, check the current data and the replace data, in this example - we replace pre_sale_ticket with dgs_allocation
```
select camp_id, user_id, addinfo_json, replace(addinfo_json, '"pre_sale_ticket":', '"dgs_allocation":')
from camp_members
where camp_id in (select id from camps where event_id='MIDBURN2018')
```

If results are ok, make the update 

```
update camp_members
set addinfo_json=replace(addinfo_json, '"pre_sale_ticket":', '"dgs_allocation":')
where camp_id in (select id from camps where event_id='MIDBURN2018')
```

## Updating ticket statuses

Spark only enters into the event tickets from `tickets` table which have a `ticket_status` of `Completed` or `Entered`

You might need to update statuses in DB to fix some problems with unsynced tickets:

```
update tickets set ticket_status='Completed' where ticket_status is null
```
