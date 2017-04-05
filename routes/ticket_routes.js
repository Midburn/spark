var express = require('express');
var ticketRouter = express.Router({mergeParams: true});
var ticketModel = require('../models/tickets');
ticketRouter.get('/', (req, res) => {
  ticketModel(req).state().then(state => {
    res.render('pages/tickets/index.jade', state);
  });
});

ticketRouter.get('/purchase', (req, res) => {
  ticketModel(req).state().then(state => res.render('pages/tickets/purchase.jade', state));
});

ticketRouter.post('/cart', (req, res) => {
  ticketModel(req).updateCart(req.body).then(state => res.render('pages/tickets/cart.jade', state));
});

ticketRouter.post('/confirm', (req, res) => {
  ticketModel(req).state().then(state => res.render('pages/tickets/agreement.jade', state));
});

module.exports = ticketRouter;
