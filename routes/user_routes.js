var security = require('../libs/security');
var i18next = require('i18next');
var mail = require('../libs/mail');

var Payment = require('../models/payment').Payment;
var User = require('../models/user').User;
var NpoMember = require('../models/npo_member').NpoMember;
var NpoStatus = require('../models/npo_member').NPO_STATUS;

var config = require('config');
var npoConfig = config.get('npo');

module.exports = function (app) {

    app.get('/:lng/payment_received', security.protectGet, function (req, res, next) {
        var token = req.query.Token;
        console.log('Received payment token: ' + token);

        new Payment({public_sale_token: token}).fetch().then(function (payment) {
            if (payment) {
                payment.attributes.payed = true;
                payment.save().then(function () {
                    //TODO We make temporary HUGH assumption here that we can only pay for NPO. Change before implementing tickets sale.
                    var year = 2016;
                    new NpoMember({user_id: payment.attributes.user_id}).fetch().then(function (member) {
                        member.set('membership_status', NpoStatus.member_paid);
                        member.save().then(function () {
                            mail.send(
                                member.email,
                                npoConfig.email,
                                'Your Midburn membership fee received!',
                                'emails/npo_fee_paid',
                                {name: req.user.fullName, year: year});
                            res.render('pages/payment_received', {user: req.user});
                        }).catch(NpoMember.NotFoundError, function () {
                            //TODO handle error
                            console.error("User", member.user_id, "not found in DB while processing payment", payment.payment_id);
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



