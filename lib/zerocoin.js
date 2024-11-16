'use strict';

var request = require('request');
var Common = require('./common');
var Async = require('async');

function ZerocoinController(node) {
  this.node = node;
  this.common = new Common({log: this.node.log});
}

ZerocoinController.prototype.gettotalzeromint = function (req, res) {
  this.node.getAddressBalance("Zeromint", false, function (err, data) {
    if (err) {
      res.status(500).send("Invalid request");
    } else {
      res.jsonp({
        total: data.balance / 1e+8,
      });
    }
  });
};

ZerocoinController.prototype.gettotalzerospend = function (req, res) {
  this.node.getAddressBalance("Zerospend", false, function (err, data) {
    if (err) {
      res.status(500).send("Invalid request");
      throw err;
    } else {
      res.jsonp({
        total: data.balance / -1e+8,
      });
    }
  });
};

ZerocoinController.prototype.getrealsupply = function (req, res) {
  var node = this.node;
  Async.parallel([
    function(callback) {
      node.getAddressBalance("Zeromint", false, function (err, data) {
        if (err || typeof data == 'undefined' || data == null) {
          callback(err, 0);
        } else {
          callback(err, data.balance / 1e+8);
        }
      })
    },
    function(callback) {
      node.getAddressBalance("Zerospend", false, function (err, data) {
        if (err || typeof data == 'undefined' || data == null) {
          callback(err, 0);
        } else {
          callback(err, data.balance / 1e+8);
        }
      })
    },
    function(callback){
      node.getTotalSupply(function (err, data) {
        if (err || typeof data == 'undefined' || data == null) {
          callback(err, 0);
        } else {
          callback(err, data.balance / 1e+8);
        }
      })
    }
  ],
  function(err, results) {
    if(err) {
      res.status(500).send("Invalid request");    }
    res.jsonp({
      total: results[2] - results[0] + results[1],
    });
  });
};

function getZerocoinInformation(addr, node, callback) {
  var result = {};
  result.address = addr;

  Async.parallel([
      function(callback) {
        node.getAddressBalance(addr, false, function (err, data) {
          callback(err, data.balance / 1e+8);
        })
      },
      function(callback) {
        node.getAddressTxids(addr, false, function (err, data) {
          callback(err, data);
        })
      },
    ],
    function(err, results) {
      if(err) {
        callback(err, null);
      }
      result.balance = results[0];
      result.txs = results[1];
      callback(null, result);
    }
  );
};

ZerocoinController.prototype.getzerominttxs = function (req, res) {
  getZerocoinInformation("Zeromint", this.node, function(err, result) {
    res.jsonp({address: result.addr, balance: result.balance, txs: result.txs});
  });
};

ZerocoinController.prototype.getzerospendtxs = function (req, res) {
  getZerocoinInformation("Zerospend", this.node, function(err, result) {
    res.jsonp({address: result.addr, balance: result.balance, txs: result.txs});
  });
};

ZerocoinController.prototype.gettotalsigmamint = function (req, res) {
  this.node.getAddressBalance("Sigmamint", false, function (err, data) {
    if (err) {
      res.status(500).send("Invalid request");
    } else {
      res.jsonp({
        total: data.balance / 1e+8,
      });
    }
  });
};

ZerocoinController.prototype.gettotalsigmaspend = function (req, res) {
  this.node.getAddressBalance("Sigmaspend", false, function (err, data) {
    if (err) {
      res.status(500).send("Invalid request");
    } else {
      res.jsonp({
        total: data.balance / -1e+8,
      });
    }
  });
};

ZerocoinController.prototype.getsigmarealsupply = function (req, res) {
  var node = this.node;
  Async.parallel([
      function(callback) {
        node.getAddressBalance("Sigmamint", false, function (err, data) {
          callback(err, data.balance / 1e+8);
        })
      },
      function(callback) {
        node.getAddressBalance("Sigmaspend", false, function (err, data) {
          callback(err, data.balance / -1e+8);
        })
      },
      function(callback){
        node.getTotalSupply(function (err, data) {
          callback(err, data.balance / 1e+8);
        })
      }
    ],
    function(err, results) {
      if(err) {
        res.status(500).send("Invalid request");    }
      res.jsonp({
        total: results[2] - results[0] + results[1],
      });
    });
};

module.exports = ZerocoinController;
