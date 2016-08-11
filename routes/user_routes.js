var security = require('../config/security');
var i18next = require('i18next');

var Payment = require('../models/payment').Payment;
var User = require('../models/user').User;

module.exports = function (app) {

    app.get('/npo', security.protectGet, function (req, res, next) {
        res.render('pages/npo', {user: req.user});
    });

    app.get('/npo_join', security.protectGet, function (req, res, next) {
        res.render('pages/npo_join', {user: req.user});
    });

    app.post('/npo_join', security.protectGet, function (req, res, next) {

        //TODO implement npo join form submit here
        //new User({user_id: req.user}).fetch().then(function (user) {
            req.user.set('npo_membership_status', 'applied_for_membership');
            req.user.save().then(function () {
                res.redirect('pages/npo');
            }).catch(User.NotFoundError, function () {
                //TODO handle error
                console.error("User", req.user.user_id, "not found in DB while joining npo");
            });
        //});
    });

    app.get('/npo_pay_fee', security.protectGet, function (req, res, next) {
        var request = require('request');
        request.post(
            //'https://testicredit.rivhit.co.il/API/PaymentPageRequest.svc/GetUrl', // TEST
            'https://icredit.rivhit.co.il/API/PaymentPageRequest.svc/GetUrl',       // PROD
            {
                json: {
                    //"GroupPrivateToken": "7ddd44b1-fcbf-4f95-baea-5169b6788681", // TEST
                    "GroupPrivateToken": "bf0c4ab6-183d-4a97-9ca0-54df2d933e1e",   // PROD
                    "Items": [{
                        "Id": 0,
                        "Quantity": 1,
                        "UnitPrice": 1,
                        "Description": i18next.t('membership_fee', {year: 2016})
                    }],
                    "RedirectURL": "http://localhost:3000/payment_received",
                    "ExemptVAT": true,
                    "MaxPayments": 1,
                    "CustomerFirstName": req.user.attributes.first_name,
                    "CustomerLastName": req.user.attributes.last_name
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    console.log("iCredit result:\n", body);
                    new Payment({
                        user_id: req.user.id,
                        private_sale_token: body.PrivateSaleToken,
                        public_sale_token: body.PublicSaleToken,
                        url: body.URL
                    }).save().then(function (model) {
                            res.redirect(body.URL);
                        });
                }
                else {
                    //TODO handle error.
                    console.error("iCredit ERROR!");
                }
            }
        );
    });

    app.get('/payment_received', security.protectGet, function (req, res, next) {
        var token = req.query.Token;
        console.log('Received payment token: ' + token);

        new Payment({public_sale_token: token}).fetch().then(function (payment) {
            if (payment) {
                payment.attributes.payed = true;
                payment.save().then(function () {
                    //TODO We make temporary HUGH assumption here that we can only pay for NPO. Change before implementing tickets sale.
                    new User({user_id: payment.attributes.user_id}).fetch().then(function (user) {
                        user.set('npo_membership_status', 'member_paid');
                        user.save().then(function () {
                            res.render('pages/payment_received', {user: req.user});
                        }).catch(User.NotFoundError, function () {
                            //TODO handle error
                            console.error("User", user.user_id, "not found in DB while processing payment", payment.payment_id);
                        })
                    });
                });
            }
            else {
                //TODO handle error.
                console.error("ERROR loading payment from DB!");
            }
        });
    });
};



