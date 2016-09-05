var security = require('../libs/security');
var i18next = require('i18next');
var mail = require('../libs/mail');

var NpoMember = require('../models/npo_member').NpoMember;
var NpoStatus = require('../models/npo_member').NPO_STATUS;

var config = require('config');
var npoConfig = config.get('npo');
var serverConfig = config.get('server');

var payment = require('../libs/payment');

var loadMember = function (user_id, next) {
    new NpoMember({user_id: user_id}).fetch().then(function (member) {
        if (member !== null) {
            next(member);
        }
        else {
            next({attributes: {membership_status: NpoStatus.not_member}});
        }
    })
};

module.exports = function (app) {

    app.get('/:lng/npo', security.protectGet, function (req, res) {
        loadMember(req.user.id, function (member) {
            res.render('pages/npo', {user: req.user, npoMember: member});
        });
    });

    app.get('/:lng/npo/join', security.protectGet, function (req, res) {
        loadMember(req.user.id, function (member) {
            res.render('pages/npo_join', {user: req.user, npoMember: member});
        });
    });

    app.post('/:lng/npo/join', security.protectGet, function (req, res) {

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

            // Profile fields
            req.user.set('israeli_id', req.body.israeli_id);
            req.user.set('address', req.body.address);
            req.user.set('cell_phone', req.body.cell_phone);
            req.user.set('extra_phone', req.body.extra_phone);

            // NPO fields
            var member = new NpoMember({
                user_id: req.user.id,
                form_previous_p: req.body.form_previous_p,
                form_future_p: req.body.form_future_p,
                form_why_join: req.body.form_why_join,
                membership_status: NpoStatus.applied_for_membership,
                application_date: new Date()
            });

            //TODO maybe add more field to save

            req.user.save().then(function () {
                member.save(null, {method: 'insert'}).then(function () {
                    mail.send(
                        req.user.attributes.email,
                        npoConfig.email,
                        'Your Midburn membership application is being processed',
                        'emails/npo_membership_applied',
                        {name: req.user.fullName});
                    res.redirect('/' + req.params.lng + '/npo');
                });
            });
        })
    });

    app.get('/:lng/npo/pay_fee', security.protectGet, function (req, res) {
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
}
;



