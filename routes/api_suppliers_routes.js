Suppliers = require('../models/suppliers').Suppliers
const common = require('../libs/common').common
constants = require('../models/constants.js')
const userRole = require('../libs/user_role')

module.exports = (app, passport) => {

    /**
    * API: (GET) get all supplires
    * request => /supplires
    */
   app.get('/suppliers',
   (req, res) => {
    Suppliers.fetchAll()
        .then((suppliers) => {
            res.status(200).json(
                { 
                    suppliers: suppliers.toJSON()
                }
            )
        })
        .catch((err) => {
            res.status(500).json({
                error: true,
                data: {
                    message: err.message
                }
            });
        });
   });

    /**
    * API: (POST) create supplire
    * request => /supplires/new
    */
    app.post('/suppliers/new',
    (req, res) => {
        Suppliers.forge().save(create_new_supplier_data_(req)).then((supplier) => {
            res.send(200)
        }).catch((e) => {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            });
        });
    });

    function create_new_supplier_data_(req) {
        var data = {
            created_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
            updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
            supplier_id: req.body.supplier_id,
            supplier_name_en: req.body.supplier_name_en,
            supplier_name_he: req.body.supplier_name_he,
            main_contact_name: req.body.main_contact_name,
            main_contact_position: req.body.main_contact_position,
            main_contact_phone_number: req.body.main_contact_phone_number,
            supplier_category: req.body.supplier_category,
            supplier_website_link: req.body.supplier_website_link,
            supplier_midmarket_link: req.body.supplier_midmarket_link,
            comments: req.body.comments
        }

        return data;
    }
}