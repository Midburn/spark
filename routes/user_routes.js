var security = require('../config/security');
var i18next = require('i18next');

module.exports = function (app) {

    app.get('/npo', security.protectGet, function (req, res, next) {
        res.render('pages/npo', {user: req.user});
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
                    //TODO store body.PrivateSaleToken
                    res.redirect(body.URL);
                    //next();
                }
                else {
                    //TODO handle error.
                    console.log("iCredit ERROR!");
                }
            }
        );
    });

    app.get('/payment_received', security.protectGet, function (req, res, next) {
        var token = req.params('Token');
        console.log('Received payment token: ' + token);

        res.render('pages/payment_received', {user: req.user});
    });
};



