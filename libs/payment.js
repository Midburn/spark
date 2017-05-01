var request = require('superagent');
var Payment = require('../models/payment').Payment;
var log = require('./logger.js')(module);

var config = require('config');
var paymentConfig = config.get('payment');

module.exports = {

    doPay: function (
        items,
        redirectUrl,
        maxPayments,
        exemptVat,
        customerFirstName,
        customerLastName,
        userId,
        res
    ) {
        return request
            .post(paymentConfig.iCreditUrl)
            .send({
                'GroupPrivateToken' : paymentConfig.iCreditGroupPrivateToken,
                'Items'             : items,
                'RedirectURL'       : redirectUrl,
                'ExemptVAT'         : exemptVat,
                'MaxPayments'       : maxPayments,
                'CustomerFirstName' : customerFirstName,
                'CustomerLastName'  : customerLastName
            }).then(function (body) {
                const {
                    PrivateSaleToken,
                    PublicSaleToken,
                    URL
                } = body;

                log.info('iCredit result:\n', body);
                return new Payment({
                    user_id: userId,
                    private_sale_token: PrivateSaleToken,
                    public_sale_token: PublicSaleToken,
                    url: URL
                }).save().then(function (model) {
                    res.redirect(URL);
                });
            }, function(err) {
                log.error('iCredit ERROR', err);
            });
    }
};
