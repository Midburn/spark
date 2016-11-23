const ticketModel = function(req) {
    return {
      state: function() {
          return Promise.resolve({
              canPurchase: true,
              user: req.user,
              language: req.params.language
          });
      },

      updateCart: function(newCart) {
        return this.state();
      }
    }
}
module.exports = ticketModel;
