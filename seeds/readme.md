## Seeder
### Usage
- Use `npm run seed` for default static data seeding
    - Add `random` for random data injection (without clearing the DB)
    - Add `replace` for replacing static data (and saving it to db)
    - Add `nosave` for data generation without saving to db (combined with `replace` for replacing static)
    - Add `keepdb` to prevent clearing of db (use with `random` to inject more data)
    - **When using random the last arg is the scale of random data generated (use with `random`)**
    
### Scale
- Scale is calculated as n = 25 for the number of camps and n * 25 for the number of users
    - e.g scale 1 = 25 camps and 625 users.
    - Currently one event is injected.
    - **Avoid using large scales**
