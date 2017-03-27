var DrupalAccess = {
    //This is a temporary stub as long as we dont have connection to Drupal.
    get_user_info: function(user_id) {
        return new Promise((resolve, reject) => {
            //access drupal to get data...
            //GET https://<env(DRUPAL_PROFILE_API)>/api/views/api_user_search?uid=1467
            var user_data = {
                id: user_id,
                email: 'name@domain.com'
            }
            resolve(user_data);
        });
    },
    get_user_by_email: function(email) {
        return new Promise((resolve, reject) => {
            //access drupal to get data...
            //GET https://<env(DRUPAL_PROFILE_API)>/api/views/api_user_search?uid=1467
            var user_data = {
                id: 1,
                email: email
            }
            resolve(user_data);
        });
    }
};

module.exports = {
    DrupalAccess: DrupalAccess
};