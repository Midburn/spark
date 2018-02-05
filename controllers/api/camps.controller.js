const Camp = require('../../models/camp').Camp,
    campService = require('../../services/camps.service');

class CampsController {
    addNewCamp(req, res) {
        Camp.forge(__camps_create_camp_obj(req, true)).save().then((camp) => {
            campService.campStatusUpdate(req.user.currentEventId,camp.attributes.id, camp.attributes.main_contact, 'approve_new_mgr', req.user, res);
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            });
        });
    }
}

module.exports = new CampsController();
