var security = require('../libs/security');
var i18next = require('i18next');
var mail = require('../libs/mail');

var User = require('../models/user').User;
var UserStatus = require('../models/user').NPO_STATUS;

var config = require('config');
var npoConfig = config.get('npo');
var serverConfig = config.get('server');

var payment = require('../libs/payment');

module.exports = function (app) {

    app.get('/:lng/npo', security.protectGet, function (req, res, next) {
        res.render('pages/npo', {user: req.user});
    });

    app.get('/:lng/npo/join', security.protectGet, function (req, res, next) {
        res.render('pages/npo_join', {user: req.user});
    });

    app.post('/:lng/npo/join', security.protectGet, function (req, res, next) {

        if (!req.files) {
            res.send('No files were uploaded.');
            return;
        }

        var idImage = req.files.id_image;
        idImage.mv(npoConfig.idImagesFolder + idImage.name, function (err) {
            if (err) {
                res.status(500).send(err);
                return;
            }

            //TODO maybe add more field to save
            req.user.set('npo_membership_status', UserStatus.applied_for_membership);
            req.user.set('npo_application_date', new Date());
            req.user.set('npo_form_previous_p', req.body.npo_form_previous_p);
            req.user.set('npo_form_future_p', req.body.npo_form_future_p);
            req.user.set('npo_form_why_join', req.body.npo_form_why_join);
            req.user.set('israeli_id', req.body.israeli_id);
            req.user.set('address', req.body.address);
            req.user.set('cell_phone', req.body.cell_phone);
            req.user.set('extra_phone', req.body.extra_phone);

            req.user.save().then(function () {
                mail.send(
                    req.user.attributes.email,
                    npoConfig.email,
                    'Your Midburn membership application is being processed',
                    'emails/npo_membership_applied',
                    {name: req.user.fullName});
                res.redirect('npo');
            }).catch(User.NotFoundError, function () {
                //TODO handle error
                console.error("User", req.user.user_id, "not found in DB while joining npo");
            });
        })
    });

    app.get('/:lng/npo/pay_fee', security.protectGet, function (req, res, next) {
        payment.doPay(
            [{
                "Id": 0,
                "Quantity": 1,
                "UnitPrice": 1,
                "Description": i18next.t('membership_fee', {year: 2016})
            }],
            serverConfig.url,
            1,
            true,
            req.user.attributes.first_name,
            req.user.attributes.last_name,
            req.user.id,
            res);
    });
};



