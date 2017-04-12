/**
 * Public API routes for camp model
 */
var Camp = require('../../../models/camp').Camp;
var constants = require('../../../models/constants.js');

module.exports = function(app) {
    /**
     * API: (GET) return published camps, for specific event id
     * request => /api/v1/camps/published
     */
    app.get('/api/v1/camps/published', (req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'https://midburn-camps.firebaseapp.com');
        res.header('Access-Control-Allow-Methods', 'GET');
        res.header('Access-Control-Allow-Headers', 'Content-Type');
        Camp.query((q) => {
          q
            .select([
                "camp_name_he",
                "camp_name_en",
                "camp_desc_he",
                "camp_desc_en",
                "status",
                "contact_person_name",
                "contact_person_phone",
                "contact_person_email",
                "facebook_page_url",
                "accept_families",
                "support_art"
            ])
            .where({'event_id': constants.CURRENT_EVENT_ID, web_published: '1', '__prototype':constants.prototype_camps.THEME_CAMP.id})
        }).fetchAll().then((camps) => {
            res.status(200).json({
                quantity: camps.length,
                camps: camps.toJSON()
            })
        }).catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
    });
}
