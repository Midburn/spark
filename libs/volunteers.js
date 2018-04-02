const request = require('superagent');
const log = require('./logger.js')(module);
const default_config = {api_url : 'http://localhost:3500'}
const { URL } = require('url')

module.exports = function(config_ = undefined) {
    const config = config_ || default_config;
    let VOLUNTEERS_API_URL = config.api_url;
    const EARLY_ENTRY_URL = new URL('/api/v1/public/volunteers/getEarlyEntrance', VOLUNTEERS_API_URL);
    return { 
        
        hasEarlyEntry: async userEmail => {
            try {
                let response = await request
                    .get(EARLY_ENTRY_URL)
                    .query({userEmail});
                let early_arrival_time = Date.parse(response.body);
                return (!isNaN(early_arrival_time)) && early_arrival_time < Date.now();
            }
            catch (err) {
                log.error(`Volunteers API hasEarlyEntry for {email} failed. {err}`)
                return false;
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
