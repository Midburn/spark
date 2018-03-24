const userRole = require('../../libs/user_role');
const Supplier = require('../../models/suppliers').Suppliers;
const Event = require('../../models/event').Event;

const __supplier_data_to_json = function (supplier) {
    let supplier_data = supplier.toJSON();
    let supplier_check_null = [
        'updated_at', 'supplier_id', 'supplier_name_en', 'supplier_name_he', 'main_contact_name',
        'main_contact_position', 'main_contact_phone_number', 'supplier_category', 'supplier_website_link',
        'supplier_midmarket_link', 'comments','created_at'];
    for (let i in supplier_check_null) {
        if (supplier_data[supplier_check_null[i]] === null) {
            supplier_data[supplier_check_null[i]] = '';
        }
    }
    return supplier_data;
};
const __render_supplier = function (supplier, req, res) {
    let supplier_id;
    if (['int', 'string'].indexOf(typeof supplier) > -1) {
        supplier_id = parseInt(supplier);
    } else {
        supplier_id = camp.id;
    }
    Supplier.forge({
        supplier_id: supplier_id,
      //  event_id: req.user.currentEventId
    }).fetch({}).then((supplier) => {
           // supplier.init_t(req.t);

            // if user is camp_member, we can show all
            // let _user = camp.isUserCampMember(req.user.id);
            let supplier_data = __supplier_data_to_json(supplier);
            let data = {
                user: req.user,
                userLoggedIn: req.user.hasRole('logged in'),
                id: supplier_id,
                camp: supplier_data,
                breadcrumbs: req.breadcrumbs(),
                details: supplier_data,
                isAdmin: req.user.isAdmin,
                // isUserCampMember: (supplier.isUserCampMember(req.user.id) || req.user.isAdmin),
                // isUserInCamp: (supplier.isUserInCamp(req.user.id) || req.user.isAdmin),
                // isCampManager: (supplier.isCampManager(req.user.id) || req.user.isAdmin),
                // main_contact: supplier.isUserInCamp(supplier.attributes.main_contact),
                // moop_contact: supplier.isUserInCamp(supplier.attributes.moop_contact),
                // safety_contact: supplier.isUserInCamp(supplier.attributes.safety_contact),
            };
            Event.get_event_controllDates(req.user.currentEventId).then(controllDates => {
                controllDates = controllDates || {};
                data.supplierslastEditDate = controllDates.edit_suppliers_lastDate || new Date(Date.now() + 1000*60*60*24*30);
                res.render('pages/suppliers/camp', data);
            })
    }).catch((e) => {
        res.status(500).json({
            error: true,
            data: {
                message: e.message
            }
        });
    });
};

module.exports = function (app, passport) {
    // ==============
    // suppliers Routing
    // ==============
    // suppliers index page, create new camp
    app.get('/:lng/suppliers', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'suppliers:breadcrumbs.join_camp',
            url: '/' + req.params.lng + '/suppliers'
        }]);
        Supplier.getSupplierCamps((suppliers) => {
            if (suppliers.length === 0 || !req.user.attributes.camp || !req.user.attributes.camp_manager) {
                // if (req.user.attributes.suppliers.length === 0 || !req.user.attributes.camp_manager) {
                camp = req.user.attributes.camp;
                res.render('pages/suppliers/index_user', {
                    user: req.user,
                    camp: camp,
                    breadcrumbs: req.breadcrumbs()
                });
            } else {
                __render_supplier(req.user.attributes.camp, req, res);
            }
        }, req.t);
    });
    // Read
    app.get('/:lng/suppliers/:id(\\d+)/', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'suppliers:breadcrumbs.my_camp',
            url: '/' + req.params.lng + '/suppliers'
        },
        {
            name: 'suppliers:breadcrumbs.camp_stat',
            url: '/' + req.params.lng + '/suppliers/' + req.params.id
        }]);
        __render_supplier(req.params.id, req, res);
    });

    // new suppliers
    app.get('/:lng/suppliers/new', userRole.isAdmin(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'suppliers:breadcrumbs.manage',
            url: '/' + req.params.lng + '/suppliers-admin'
        },
        {
            name: 'suppliers:breadcrumbs.new',
            url: '/' + req.params.lng + '/suppliers/new/?c=' + req.query.c
        }]);

        // let prototype = constants.prototype_camps.THEME_CAMP.id;
        // let result = Camp.prototype.__parsePrototype(prototype, req.user);
        let controllDates = {
            appreciation_tickets_allocation_start: null,
            appreciation_tickets_allocation_end: null
        }
        res.render('pages/suppliers/edit', {
            user: req.user,
            breadcrumbs: req.breadcrumbs(),
            supplier: { supplier_id: req.query.c },
            details: {},
            isAdmin: req.user.isAdmin,
            isNew: true,
          //  __groups_prototype: prototype,
            t_prefix: 'suppliers:',//
            //isArt: prototype === constants.prototype_suppliers.ART_INSTALLATION.id,
            //isCamp: prototype === constants.prototype_suppliers.THEME_CAMP.id,
            //isProd: prototype === constants.prototype_suppliers.PROD_DEP.id,
            controllDates: controllDates
        });
    });
    // Edit
    app.get('/:lng/suppliers/:id/edit', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'suppliers:breadcrumbs.manage',
            url: '/' + req.params.lng + '/suppliers-admin'
        },
        {
            name: 'suppliers:breadcrumbs.edit',
            url: '/' + req.params.lng + '/suppliers/' + req.params.id + '/edit'
        }]);
        Supplier.forge({
            supplier_id: req.params.id,
        }).fetch({
           // withRelated: [constants.SUPPLIERS_RELATIONS_TABLE_NAME]
        }).then((supplier) => {
            supplier.getSupplierCamps((camps) => {
                let supplier_data = __supplier_data_to_json(supplier);
                let _edit_rec = {
                    user: req.user,
                    breadcrumbs: req.breadcrumbs(),
                    supplier: supplier_data,
                    camps: camps,
                    details:supplier_data,
                    isNew: false,
                    isAdmin: req.user.isAdmin,
                    __groups_prototype: supplier.attributes.__prototype,
                    t_prefix: "suppliers:",
                 //   isArt: supplier.attributes.__prototype === constants.prototype_suppliers.ART_INSTALLATION.id,
                 //   isCamp: supplier.attributes.__prototype === constants.prototype_suppliers.THEME_CAMP.id,
                 //   isProd: supplier.attributes.__prototype === constants.prototype_suppliers.PROD_DEP.id,
                }
                const currentEventID = req.session.passport.user.currentEventId;
                Event.get_event_controllDates(currentEventID)
                .then(controllDates => {
                    _edit_rec.controllDates = controllDates || {}
                    res.render('pages/suppliers/edit',_edit_rec);
                    });

            },req,req.params.id);
        })
    });
    // suppliers statistics
    app.get('/:lng/suppliers-stats', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'suppliers:breadcrumbs.manage',
            url: '/' + req.params.lng + '/suppliers-admin'
        },
        {
            name: 'suppliers:breadcrumbs.stats',
            url: '/' + req.params.lng + '/suppliers-stats'
        }]);
        res.render('pages/suppliers/stats', {
            user: req.user,
            breadcrumbs: req.breadcrumbs()
        });
    });
    // suppliers members board
    app.get('/:lng/suppliers-members', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'suppliers:breadcrumbs.manage',
            url: '/' + req.params.lng + '/suppliers-admin'
        },
        {
            name: 'suppliers:breadcrumbs.members',
            url: '/' + req.params.lng + '/suppliers-members'
        }]);
        res.render('pages/suppliers/members', {
            user: req.user,
            breadcrumbs: req.breadcrumbs()
        });
    });
    // suppliers documents
    app.get('/:lng/suppliers-docs', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'suppliers:breadcrumbs.manage',
            url: '/' + req.params.lng + '/suppliers-admin'
        },
        {
            name: 'suppliers:breadcrumbs.docs',
            url: '/' + req.params.lng + '/suppliers-docs'
        }]);
        res.render('pages/suppliers/docs', {
            user: req.user,
            breadcrumbs: req.breadcrumbs()
        });
    });
    // suppliers admin management panel
    app.get('/:lng/suppliers-admin/:cardId*?', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + req.params.lng + '/home'
        },
        {
            name: 'suppliers:breadcrumbs.manage',
            url: '/' + req.params.lng + '/suppliers-admin'
        }]);

        if (req.user.isAdmin || req.user.issuppliersAdmin) {
            const currentEventID = req.session.passport.user.currentEventId;
            Event.get_event_controllDates(currentEventID)
                .then(controllDates => {
                    res.render('pages/suppliers/index_admin', {
                        user: req.user,
                        breadcrumbs: req.breadcrumbs(),
                        __groups_prototype: 'theme_suppliers',
                        t_prefix: 'suppliers:',
                        isCamp: true,
                        controllDates: controllDates || {},
                    });
                });
            } else {
                // user not admin
                res.render('pages/suppliers/index_user', {
                    user: req.user,
                    breadcrumbs: req.breadcrumbs()
                });
            }

    });

    // Program
    app.get('/:lng/program', userRole.isLoggedIn(), (req, res) => {
        req.breadcrumbs('suppliers-new_program');
        res.render('pages/suppliers/program', {
            user: req.user,
            camp_name_en: req.query.c
        });
    });
};
