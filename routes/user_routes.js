var security = require('../config/security');
var mail = require('../config/mail');

module.exports = function (app) {

    app.get('/npo', security.protectGet, function (req, res, next) {
        res.render('pages/npo', {user: req.user});
    });

    app.get('/npo_pay_fee', security.protectGet, function (req, res, next) {
        //TODO temp code & parameters - just for testing
        var request = require('request');
        request.post(
            'https://testicredit.rivhit.co.il/API/PaymentPageRequest.svc/GetUrl',
            {
                json: {
                    "GroupPrivateToken": "7ddd44b1-fcbf-4f95-baea-5169b6788681",
                    "Items": [{
                        "Id": 6969,
                        "Quantity": 1,
                        "UnitPrice": 60,
                        "Description": "Membership Fee 2016"
                    }],
                    "RedirectURL": "http://localhost:3000/home",
                    "ExemptVAT": true,
                    "MaxPayments": 1,
                    "CustomerFirstName": req.user.first_name,
                    "CustomerLastName": req.user.last_name
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
};



