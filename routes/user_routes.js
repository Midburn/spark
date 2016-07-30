var security = require('../config/security');
var mail = require('../config/mail');

module.exports = function (app) {

    app.get('/npo', security.isLoggedIn, function (req, res, next) {
        res.render('pages/npo', {user: req.user});
    });

    app.get('/npo_pay_fee', security.isLoggedIn, function (req, res, next) {
        mail.send('roy.zahor@gmail.com', 'Approved', 'emails/ngo_membership_approved', null);

        //TODO temp - just for testing
        res.redirect('https://icredit.rivhit.co.il/payment/PaymentFullPage.aspx?GroupId=cf39475a-d625-4062-8ad2-d367142df157');
        //res.render('pages/ngo_pay_fee', {user: req.user});
    });
};



