const userRole = require('../../libs/user_role');
const Event = require('../../models/event').Event;
const express = require('express');

const router = express.Router({
    mergeParams: true
});

// INDEX
router.get('/suppliers-admin/:cardId*?', userRole.isAllowedToViewSuppliers(), (req, res) => {
    const lang = req.params.lng || 'he';
    req.breadcrumbs([{
        name: 'breadcrumbs.home',
        url: '/' + req.params.lng + '/home'
    },
    {
        name: 'suppliers:breadcrumbs.manage',
        url: '/' + req.params.lng + '/suppliers-admin'
    }]);

    if (req.user.isAdmin || req.user.isAllowedToViewSuppliers) {
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

// NEW
router.get('/suppliers/new', userRole.isAllowedToViewSuppliers(), (req, res) => {
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
    res.render('pages/suppliers/edit', {
        user: req.user,
        breadcrumbs: req.breadcrumbs(),
        supplier_id: req.query.c,
        details: {},
        isAdmin: req.user.isAdmin,
        isNew: true,
        t_prefix: 'suppliers:',
        language: lang
    });
});

// SHOW
router.get('/suppliers/:id', userRole.isAllowedToViewSuppliers(), (req, res) => {
    const supplier_id = req.params.id;
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
        name: 'suppliers:breadcrumbs.supplier_details',
        url: '/' + lang + '/suppliers/' + supplier_id
    }]);
    const currentEventID = req.session.passport.user.currentEventId;
    const params = {
        user: req.user,
        breadcrumbs: req.breadcrumbs(),
        supplier_id: supplier_id,
        details: {},
        isNew: false,
        isAdmin: req.user.isAdmin,
        t_prefix: "suppliers:edit_new",
        language: lang,
        currentEventID: currentEventID
    };
    res.render('pages/suppliers/supplier',params);
});

// EDIT
router.get('/suppliers/:id/edit', userRole.isAllowedToViewSuppliers(), (req, res) => {
    const supplier_id = req.params.id;
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
        name: 'suppliers:breadcrumbs.edit',
        url: '/' + lang + '/suppliers/' + supplier_id + '/edit'
    }]);
    const params = {
        user: req.user,
        breadcrumbs: req.breadcrumbs(),
        details: {},
        isNew: false,
        isAdmin: req.user.isAdmin,
        t_prefix: "suppliers:",
        language: lang,
        supplier_id: supplier_id
    };
    res.render('pages/suppliers/edit',params);
});

// suppliers documents
router.get('/suppliers-docs', userRole.isAllowedToViewSuppliers(), (req, res) => {
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
