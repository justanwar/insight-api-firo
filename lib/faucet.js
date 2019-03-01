'use strict';

var Common = require('./common');

function FaucetController(node) {
    this.node = node;
    this.common = new Common({log: this.node.log});
}

FaucetController.prototype.sendto = function (req, res) {
  this.node.sendToAddress(req.query.sendToAddr, function(err, data) {
    if (err) {
      if(err.hasOwnProperty('message')) {
        res.jsonp({
          result: 'error: ' + err.message
        });
      }
    } else {
      res.jsonp({
        result: 'success: ' + data.result
      });
    }
  });
};

FaucetController.prototype.info = function (req, res) {
  this.node.getWalletInfo(function (err, data) {
    if (err) {
      this.node.log.error(err);
      throw err;
    } else {
      res.jsonp({
        balance: data.balance,
        txcount: data.txcount
      });
    }
  });
};


module.exports = FaucetController;
