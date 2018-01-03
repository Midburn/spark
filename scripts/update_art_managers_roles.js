let knex = require('../libs/db').knex;

async function updateRoles() {

    //load data from csv....
    const managers = [
        {'email' : 'krisssy193@gmail.com', 'camp_id' : 162},
        {'email' : 'shoonami@gmail.com','camp_id' : 77},
        {'email' : 'ittayr@gmail.com', 'camp_id' : 55}
    ];
    //console.log(emails)
    await Promise.all(managers.map(async manager => {
        try {
            console.log('Extracting user data for' + manager.email)
            let users = await knex.select('user_id', 'roles', 'email').from('users').where('email', manager.email);
            if (users.length === 0) {
                console.log('Could not find ' + manager.email)
                return;
            }
            let user = users[0];
            console.log(user);
             
            let user_roles = user.roles.split(',').filter((x) => x);
            if (!user_roles.includes('camp_manager')) {
                user_roles.push('camp_manager');
                await knex('users').where('email', manager.email).update('roles', user_roles.join(','));

            }
        }
        catch (e) {
            console.log(e)
        }
    }));
    console.log('Finished');
    process.exit(0);
}

updateRoles();
