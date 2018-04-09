const userRole = require('../../libs/user_role');
const Event = require('../../models/event').Event;
const express = require('express');
const superagent = require('superagent');

const router = express.Router({
    mergeParams: true
});

const __supplier_data_to_json = function (supplier) {
    let supplier_check_null = [
        'updated_at', 'supplier_id', 'supplier_name_en', 'supplier_name_he', 'main_contact_name',
        'main_contact_position', 'main_contact_phone_number', 'supplier_category', 'supplier_website_link',
        'supplier_midmarket_link', 'comments','created_at'];
    for (let i in supplier_check_null) {
        if (supplier[supplier_check_null[i]] === null) {
            supplier[supplier_check_null[i]] = '';
        }
    }
    return supplier;
 };
// INDEX
router.get('/suppliers-admin', userRole.isLoggedIn(), (req, res) => {
    const lang = req.params.lng || 'he';
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
                    language: lang
                });
            });
        } else {
            res.redirect(`${lang}/home`);
        }
});

// SHOW
router.get('/suppliers/:id', userRole.isLoggedIn(), (req, res) => {
    const supplier_id = req.params.id;
    const lang = req.params.lng || 'he';

    superagent
    .get(`${process.env.SPARK_SERVER_URL}/suppliers/${supplier_id}`)
    .then((response) => {
        req.breadcrumbs([{
            name: 'breadcrumbs.home',
            url: '/' + lang + '/home'
        },
        {
            name: 'suppliers:breadcrumbs.manage',
            url: '/' + lang + '/suppliers-admin'
        },
        {
            name: 'suppliers:breadcrumbs.supplier_details',
            url: '/' + lang + '/suppliers/' + supplier_id
        }]);
        supplier = JSON.parse(response.text) || {}
        const currentEventID = req.session.passport.user.currentEventId;
        const supplier_data = __supplier_data_to_json(supplier.supplier);
        const params = {
            user: req.user,
            breadcrumbs: req.breadcrumbs(),
            supplier: supplier_data,
            details: {},
            isNew: false,
            isAdmin: req.user.isAdmin,
            t_prefix: "suppliers:edit_new",
            language: lang,
            currentEventID: currentEventID
        };   
        res.render('pages/suppliers/supplier',params);    
    }).catch((err) => {
        console.log(`get(${process.env.SPARK_SERVER_URL}/suppliers/${supplier_id}) error:`,err);
        res.render('pages/error',{errorMessage: err.message,error: err});  
    });
});
// NEW
router.get('/suppliers/new', userRole.isAdmin(), (req, res) => {
    const lang = req.params.lng || 'he';
    req.breadcrumbs([{
        name: 'breadcrumbs.home',
        url: '/' + lang + '/home'
    },
    {
        name: 'suppliers:breadcrumbs.manage',
        url: '/' + lang + '/suppliers-admin'
    },
    {
        name: 'suppliers:breadcrumbs.new',
        url: '/' + lang + '/suppliers/new/?c=' + req.query.c
    }]);
    let controllDates = {
        appreciation_tickets_allocation_start: null,
        appreciation_tickets_allocation_end: null
    };
    res.render('pages/suppliers/edit', {
        user: req.user,
        breadcrumbs: req.breadcrumbs(),
        supplier: { supplier_id: req.query.c },
        details: {},
        isAdmin: req.user.isAdmin,
        isNew: true,
        t_prefix: 'suppliers:',
        controllDates: controllDates,
        language: lang
    });
});
// EDIT
router.get('/suppliers/:id/edit', userRole.isLoggedIn(), (req, res) => {
    const supplier_id = req.params.id;
    const lang = req.params.lng || 'he';
    let supplier;
    superagent
        .get(`${process.env.SPARK_SERVER_URL}/suppliers/${supplier_id}`)
        .then((response) => {
            req.breadcrumbs([{
                name: 'breadcrumbs.home',
                url: '/' + lang + '/home'
            },
            {
                name: 'suppliers:breadcrumbs.manage',
                url: '/' + lang + '/suppliers-admin'
            },
            {
                name: 'suppliers:breadcrumbs.edit',
                url: '/' + lang + '/suppliers/' + supplier_id + '/edit'
            }]);
            supplier = JSON.parse(response.text) || {}
            const supplier_data = __supplier_data_to_json(supplier.supplier);
            const params = {
                user: req.user,
                breadcrumbs: req.breadcrumbs(),
                supplier: supplier_data,
                details: {},
                isNew: false,
                isAdmin: req.user.isAdmin,
                t_prefix: "suppliers:",
                language: lang
            };   
            res.render('pages/suppliers/edit',params);    
        }).catch((err) => {
            console.log(`get(${process.env.SPARK_SERVER_URL}/suppliers/${supplier_id}) error:`,err);
            res.render('pages/error/edit',{errorMessage: err.message,error: err});  
        });
});

// suppliers documents
router.get('/suppliers-docs', userRole.isLoggedIn(), (req, res) => {
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
module.exports = router;
