const userRole = require('../../libs/user_role');
const Supplier = require('../../models/suppliers').Suppliers;
const Event = require('../../models/event').Event;
const express = require('express');
const router = express.Router({
    mergeParams: true
});

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
    
};

router.get('/', userRole.isLoggedIn(), (req, res) => {
    req.breadcrumbs([{
        name: 'breadcrumbs.home',
        url: '/' + req.params.lng + '/home'
    }]);
    
    res.render('pages/suppliers/supplier-entries', {
        user: req.user,
        t_prefix: 'suppliers:',
        isAdmin: req.user.isAdmin,
        breadcrumbs: req.breadcrumbs()
    });
});

module.exports = router;
