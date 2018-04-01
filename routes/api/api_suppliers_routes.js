const Suppliers = require('../../models/suppliers').Suppliers;

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
}
