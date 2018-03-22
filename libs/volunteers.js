const request = require('superagent');
const log = require('./logger.js')(module);
const default_config = {api_url : 'localhost'}
const { URL } = require('url')
module.exports = function(config_) {
    const config = config_ || default_config;
    let VOLUNTEERS_API_URL = config.api_url;
    const EARLY_ENTRY_URL = new URL('/early_entry', VOLUNTEERS_API_URL);
    return { 
        
        hasEarlyEntry: async email => {
            try {
                let response = await request
                    .get(EARLY_ENTRY_URL)
                    .query({email});
                return response.body;
            }
            catch (err) {
                log.error(`Volunteers API hasEarlyEntry for {email} failed. {err}`)
            }
        },

        setState: async (email, state) => {
            try {
                let response = await request
                    .put(EARLY_ENTRY_URL)
                    .query({email, state});
                return response.ok;
            }
            catch (err) {
                log.error(`Volunteers API setState for {email}, {state} failed. {err}`)
            }
        }

    }
}
