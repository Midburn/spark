/**
 * provides functionality related to the admin UI
 */
var modules = require('../../../libs/modules');
var userRole = modules.require('users', 'libs/user_role');

/**
 * constants
 */

const SIDE_BAR = [{
        title: "Home",
        icon: "home",
        href: "/admin"
    },
    {
        title: "Users",
        icon: "users",
        href: "/admin/users"
    },
    {
        title: "Camps",
        icon: "sitemap",
        href: "/admin/camps"
    },
    {
        title: "Midburn NPO",
        icon: "users",
        children: [{
            title: "Members",
            href: "/admin/npo"
        }]
    }
];

const PAGE_LENGTH_MENU = [2, 5, 10]; // the options in the results per page select box
const DEFAULT_PAGE_LENGTH = 5; // the default option from the PAGE_LENGTH_MENU
const ADMIN_URL_PREFIX = "/admin";
const ADD_URL_TEMPLATE = "/{name}/add";
const EDIT_URL_TEMPLATE = "/{name}/edit/{id}";
const TABLE_AJAX_URL_TEMPLATE = "/{name}/table";
const TABLE_PAGE_TITLE_TEMPLATE = "Spark {name}";

/**
 * render a template under the admin template
 * generates data for the admin layout template - common to all admin pages
 * @param req - http request
 * @param res - http response
 * @param name - name of the specific admin template to render (should extend the admin layout template)
 * @param options - template options
 */
var adminRender = function(req, res, name, options) {
    if (!options) options = {};
    options.user = req.user;
    options.sideBar = SIDE_BAR;
    res.render(name, options);
};

var datatableAdmin = function(name, router, opts) {

    var _renderTablePage = function(req, res, msg) {
        adminRender(req, res, 'admin/datatable.jade', {
            title: {
                name: name,
                text: TABLE_PAGE_TITLE_TEMPLATE.replace('{name}', name),
                small: msg
            },
            columns: opts.columns,
            ajax: ADMIN_URL_PREFIX + TABLE_AJAX_URL_TEMPLATE.replace('{name}', name),
            tableOptionsString: JSON.stringify({
                "lengthMenu": PAGE_LENGTH_MENU, // the options in the page length select list
                "pageLength": DEFAULT_PAGE_LENGTH, // initial page length (number of rows per page)
                "order": opts.defaultOrder,
                "editKey": opts.editKey,
                "editUrl": ADMIN_URL_PREFIX + EDIT_URL_TEMPLATE.replace('{name}', name)
            }),
            addTitle: opts.addTitle,
            addUrl: ADMIN_URL_PREFIX + ADD_URL_TEMPLATE.replace('{name}', name),
        });
    };

    var _renderEditPage = function(req, res, error, successMsg) {
        var _adminRender = function(titleText) {
            adminRender(req, res, 'admin/datatable-edit.jade', {
                title: {
                    text: titleText,
                    small: successMsg || error,
                    smallType: successMsg ? "success" : "error"
                },
                columns: opts.columns
            });
        };
        if (req.params.object_id) {
            // edit existing object - need to fetch it first
            opts.api.fetchById(req, req.params.object_id).then(function(object) {
                opts.columns.forEach(function(column) {
                    if (object[column.attr]) {
                        column.value = object[column.attr];
                    } else if (req.body && req.body[column.attr]) {
                        column.value = req.body[column.attr]
                    } else {
                        column.value = "";
                    }
                });
                _adminRender(opts.editTitle);
            });
        } else {
            // add new object
            opts.columns.forEach(function(column) {
                if (req.body && req.body[column.attr]) {
                    column.value = req.body[column.attr]
                } else {
                    column.value = "";
                }
            });
            _adminRender(opts.addTitle);
        }
    };

    router.get('/admin/' + name + '/table', userRole.isAdmin(), function(req, res) {
        try {
            // initialize from datatables query params
            var resultsPerPage = req.query.length;
            var currentPage = (req.query.start / resultsPerPage) + 1;
            var orderBy = (req.query.order[0].dir === "asc" ? "" : "-") + req.query.columns[req.query.order[0].column].data;
            var searchTerm = req.query.search.value;
        } catch (e) {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            });
        }
        var recordsTotal = 0;
        opts.api.getTotalCount(req).then(function(count) {
            recordsTotal = count;
            opts.api.fetchPage(req, {
                searchTerm: searchTerm,
                orderBy: orderBy,
                columns: opts.selectColumns,
                pageSize: resultsPerPage,
                page: currentPage
            }).then(function(fetchResponse) {
                // fetchResponse.pagination: { page: 1, pageSize: 2, rowCount: 5, pageCount: 3 }
                // fetchResponse.rows = [{}, {}..]
                fetchResponse.rows.forEach(function(row) {
                    row.actions = "";
                });
                res.status(200).json({
                    data: fetchResponse.rows,
                    recordsTotal: recordsTotal, // total records before filtering
                    recordsFiltered: fetchResponse.pagination.rowCount // total records after filtering
                })
            });
        }).catch(function(e) {
            res.status(500).json({
                error: true,
                data: {
                    message: e.message
                }
            });
        });
    });

    router.get('/admin/' + name + '/add', userRole.isAdmin(), function(req, res) {
        _renderEditPage(req, res, "")
    });

    router.post('/admin/' + name + '/add', userRole.isAdmin(), function(req, res) {
        opts.addCallback(req, req.body, function(ok, msg) {
            if (ok) {
                _renderTablePage(req, res, msg);
            } else {
                _renderEditPage(req, res, msg);
            }
        });
    });

    router.get('/admin/' + name + '/edit/:object_id', userRole.isAdmin(), function(req, res) {
        _renderEditPage(req, res, "")
    });

    router.post('/admin/' + name + '/edit/:object_id', userRole.isAdmin(), function(req, res) {
        opts.editCallback(req, req.params.object_id, req.body, function(ok, msg) {
            if (ok) {
                _renderEditPage(req, res, false, msg);
            } else {
                _renderEditPage(req, res, msg, false);
            }
        })
    });

    router.get('/admin/' + name, userRole.isAdmin(), function(req, res) {
        _renderTablePage(req, res, "")
    });

};

module.exports = {
    datatableAdmin: datatableAdmin,
    adminRender: adminRender
};