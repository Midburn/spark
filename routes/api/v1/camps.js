/**
 * Public API routes for camp model
 */
var Camp = require('../../../models/camp').Camp;
var constants = require('../../../models/constants.js');

module.exports = function(app) {
    /**
     * API: (GET) return published camps with:
     * camp_name_en, camp_name_he, camp_desc_en, camp_desc_he, status,
     * accept_families, contact_person_full_name, phone, email, facebook_page
     * request => /api/v1/camps/published
     */
    app.get('/api/v1/camps/published', (req, res, next) => {
        Camp.query((q) => {
          q
            .where({'event_id': constants.CURRENT_EVENT_ID, web_published: '1'})
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