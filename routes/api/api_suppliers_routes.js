const Suppliers = require('../../models/suppliers').Suppliers;
knex = require('../../libs/db').knex

module.exports = (app, passport) => {

    /**
    * API: (GET) get all supplires
    * request => /supplires
    */
   app.get('/suppliers', async (req, res) => {
        try {
            let suppliers = await Suppliers.fetchAll()
            res.status(200).json({suppliers: suppliers.toJSON()})
        } catch (err) {
            res.status(500).json({error: true,data: {message: err.message}})
        }
    })

    /**
    * API: (GET) get spesific supplire by id
    * request => /suppliers/:id
    */
    app.get('/suppliers/:supplier_id', async (req, res) => {
        try {
            let supplier_id = req.params.supplier_id
            let supplier = await Suppliers.forge({supplier_id: supplier_id}).fetch()
            if (supplier) {
                res.status(200).json({supplier: supplier.toJSON()})
            }
            else {
                res.status(204).json({message:"id doesnt exist"});
            }
        } catch (err) {
            res.status(500).json({error: true,data: { message: err.message }})
        }
   });

    /**
    * API: (POST) create supplire
    * request => /supplires/new
    */
    app.post('/suppliers/new', async (req, res) => {
        try {
            let data = supplier_data_update_(req,"new")
            let supplier = await Suppliers.forge().save(data)
            res.status(200).json({supplier: supplier.toJSON()})
        } catch (err) {
            res.status(500).json({error: true,data: { message: err.message }})
        }
    });

     /**
    * API: (GET) get spesific supplire by id and update fields
    * request => /suppliers/:id
    */
   app.put('/suppliers/:supplier_id/edit', async (req, res) => {
       try {
            let supplier_id = req.params.supplier_id;
            let supplier = await Suppliers.forge({supplier_id: supplier_id}).fetch()
            if (supplier !== null) {
                let data = supplier_data_update_(req,"update")
                supplier = await supplier.save(data)
                res.status(200).json({supplier: supplier.toJSON()})
            } else {
                res.status(500).json({error: true,data: { message : "Supplier does not exist" }})
            }

        } catch (err) {
            res.status(500).json({error: true,data: { message: err.message }})
        }
    });

    /**
    * API: (GET) get spesific supplire by id and update fields
    * request => /suppliers/:id
    */
   app.delete('/suppliers/:supplier_id/delete', async (req, res) => {
        try {
            let supplier_id = req.params.supplier_id;
            let supplier = await Suppliers.forge({supplier_id: supplier_id}).fetch()

            if (supplier !== null) {
                supplier = await supplier.destroy()
                res.status(200).send("Supplier deleted")
            } else {
                res.status(500).json({error: true,data: { message : "Supplier does not exist" }})
            }
        } catch (err) {
            res.status(500).json({error: true,data: { message: err.message }})
        }
    });

    /**
    * API: (GET) GET all supplire related camp fo the current event
    * request => /suppliers/:supplier_id/camps
    */
   app.get('/suppliers/:supplier_id/camps', async (req, res) => {
        try {
            let supplier_id = req.params.supplier_id;
            let supplier = await Suppliers.forge({supplier_id: supplier_id}).fetch()
            let camps = await supplier.getSupplierCamps()

            if (camps !== null) {
                res.status(200).json({camps: camps})
            } else {
                res.status(204).json({camps: ["empty"]})
            }

        } catch (err) {
            res.status(500).json({error: true,data: { message: err.message }})
        }
    });

    /**
    * API: (GET) GET all supplire related camp for the current event
    * request => /suppliers/:camp_id/suppliers
    */
   app.get('/suppliers/:camp_id/suppliers', async (req, res) => {
    try {
        let camp_id = req.params.camp_id;
        let suppliers = await knex(constants.SUPPLIERS_RELATIONS_TABLE_NAME).select()
            .innerJoin(constants.EVENTS_TABLE_NAME, constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.event_id', constants.EVENTS_TABLE_NAME + '.event_id')
            .innerJoin(constants.SUPPLIERS_TABLE_NAME, constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.supplier_id', constants.SUPPLIERS_TABLE_NAME + '.supplier_id')
            .innerJoin(constants.CAMPS_TABLE_NAME, constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.camp_id', constants.CAMPS_TABLE_NAME + '.id')
            .where(constants.SUPPLIERS_RELATIONS_TABLE_NAME + '.camp_id', camp_id);

        if (camps !== null) {
            res.status(200).json({suppliers: suppliers})
        } else {
            res.status(204).json({suppliers: ["empty"]})
        }
    } catch (err) {
        res.status(500).json({error: true,data: { message: err.message }})
    }
});

    /**
    * API: (PUT) set camp for supplire in the current event
    * request => /suppliers/:supplier_id/camps
    */
   app.put('/suppliers/:supplier_id/camps/:camp_id', async (req, res) => {
    try {
            let supplier_id = req.params.supplier_id;
            let data = {
                camp_id : req.params.camp_id,
                event_id : 'MIDBURN2018',//req.user.currentEventId
                courier_contact_name : req.body.courier_contact_name,
                courier_contact_phone_number : req.body.courier_contact_phone_number,
            }

            let supplier = await Suppliers.forge({supplier_id: supplier_id}).fetch()
            let camp = await supplier.setSupplierCamp(data)

            if (camp !== 0) {
                res.status(200).send("Camp supplier updated")
            } else {
                res.status(400).json({error: true,data: { message : "Set supplier falied to camp" }})
            }

        } catch (err) {
            res.status(500).json({error: true,data: { message: err.message }})
        }
    });

    /**
    * API: (DELETE) delete selected camp from  supplire
    * request => /suppliers/:supplier_id/camps/:camp_id
    */
   app.delete('/suppliers/:supplier_id/camps/:camp_id', async (req, res) => {
        try {
            let data = {
                camp_id: req.params.camp_id,
                event_id: 'MIDBURN2018'//req.user.currentEventId,
            }
            let supplier_id = req.params.supplier_id;
            let supplier = await Suppliers.forge({supplier_id: supplier_id}).fetch()
            let camp = await supplier.removeSupplierCamp(data)

            if (camp !== 0) {
                res.status(200).send("Camp supplier deleted")
            } else {
                res.status(500).json({error: true,data: { message : "No camps found for current supplier" }})
            }

        } catch (err) {
            res.status(500).json({error: true,data: { message: err.message }})
        }
    });

     /**
    * API: (GET) GET all supplire in the gate with the requested status
    * request => /suppliers/:supplier_id/camps
    */
   app.get('/suppliers/suppliers_gate_info/:status', async (req, res) => {
        try {
            let info = await knex(constants.SUPPLIERS_GATE_ENTRANCE_INFO_TABLE_NAME).select()
            .innerJoin(constants.SUPPLIERS_TABLE_NAME, constants.SUPPLIERS_GATE_ENTRANCE_INFO_TABLE_NAME + '.supplier_id', constants.SUPPLIERS_TABLE_NAME + '.supplier_id')
            .where(constants.SUPPLIERS_GATE_ENTRANCE_INFO_TABLE_NAME + ".supplier_status", req.params.status)
            .andWhere(constants.SUPPLIERS_GATE_ENTRANCE_INFO_TABLE_NAME + ".event_id" ,'MIDBURN2018')

            res.status(200).json({suppliers: info})
        } catch (err) {
            res.status(500).json({error: true,data: { message: err.message }})
        }
    });

    /**
    * API: (POST) create supplire enterance record id
    * request => /supplires/new
    */
   app.post('/suppliers/:supplier_id/add_gate_record_info/:status', async (req, res) => {
        try {
            let data
            let gateInfo
            if (req.params.status === constants.SUPPLIER_STATUS_CATEGORIES[0]) {
                data = supplier_entrance_info_(req)
                gateInfo = await knex(constants.SUPPLIERS_GATE_ENTRANCE_INFO_TABLE_NAME).insert(data)
            }
            else if (req.params.status === constants.SUPPLIER_STATUS_CATEGORIES[1]) {
                data = supplier_departure_info_(req)
                gateInfo = await knex(constants.SUPPLIERS_GATE_ENTRANCE_INFO_TABLE_NAME).update(data).where('record_id', data.record_id)
            }
            else {
                res.status(400).json({message: "Status is undefined"})
            }
            res.status(200).json({record_id: gateInfo[0]})
        } catch (err) {
            res.status(500).json({error: true,data: { message: err.message }})
        }
    });

    //sets supplier main information
    function supplier_data_update_(req,action) {
        let data = {
            updated_at: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
            supplier_id: req.params.supplier_id || req.body.supplier_id,
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

        if (action === "new")
        {
            data.created_at = (new Date()).toISOString().substring(0, 19).replace('T', ' ')
        }

        return data;
    }

    function supplier_entrance_info_(req) {

        let data = {
            supplier_id: req.params.supplier_id || req.body.supplier_id,
            event_id : 'MIDBURN2018',
            vehicle_plate_number: req.body.vehicle_plate_number,
            number_of_people_entered: req.body.number_of_people_entered,
            allowed_visa_hours: req.body.allowed_visa_hours,
            enterance_time: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
            supplier_status: constants.SUPPLIER_STATUS_CATEGORIES[0],
        }

        return data;
    }

    function supplier_departure_info_(req) {

        let data = {
            record_id: req.body.record_id,
            departure_time: (new Date()).toISOString().substring(0, 19).replace('T', ' '),
            supplier_status: constants.SUPPLIER_STATUS_CATEGORIES[1],
        }

        return data;
    }
}
