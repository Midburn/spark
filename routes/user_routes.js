var security = require('../libs/security');
var i18next = require('i18next');

var Payment = require('../models/payment').Payment;
var User = require('../models/user').User;

module.exports = function (app) {

    app.get('/:lng/payment_received', security.protectGet, function (req, res, next) {
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



