var request = require('request');
var Payment = require('../models/payment').Payment;
var log = require('./logger.js')(module);

var config = require('config');
var paymentConfig = config.get('payment');

module.exports = {

    doPay: function (items, redirectUrl, maxPayments, exemptVat, customerFirstName, customerLastName, userId, res) {
        request.post(
            paymentConfig.iCreditUrl,
            {
                json: {
                    "GroupPrivateToken": paymentConfig.iCreditGroupPrivateToken,
                    "Items": items,
                    "RedirectURL": redirectUrl,
                    "ExemptVAT": exemptVat,
                    "MaxPayments": maxPayments,
                    "CustomerFirstName": customerFirstName,
                    "CustomerLastName": customerLastName
                }
            },
            function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    log.info("iCredit result:\n", body);
                    new Payment({
                        user_id: userId,
                        private_sale_token: body.PrivateSaleToken,
                        public_sale_token: body.PublicSaleToken,
                        url: body.URL
                    }).save().then(function (model) {
                            res.redirect(body.URL);
                        });
                }
                else {
                    //TODO handle error.
                    log.error("iCredit ERROR!");
                }
            }
        );
    }
}
;
