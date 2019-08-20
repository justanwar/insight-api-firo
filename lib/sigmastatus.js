const request = require('request');
const pgp = require('pg-promise')();

class SigmaStatusController {

  constructor(options) {
    this.node = options.node;
    this.connection_params = options.connection_params;
  }

  getSigmaStatus(req, res) {
    var db = pgp(this.connection_params);

    var query_sql = `
    with m as (
      select sum(o.value_sat) total, o.value_sat denom from vout o join address a on o.address_uid = a.uid
    join address_single sa on a.uid = sa.address_uid and sa.address_hash_uid = 3
    group by o.value_sat
    ), s as (
        select sum(i.value_sat) total, i.value_sat denom from vin i join address a on i.address_uid = a.uid
      join address_single sa on a.uid = sa.address_uid and sa.address_hash_uid = 4
      group by i.value_sat
    ) select m.denom denomination, m.total mint, s.total spent from m join s on m.denom = s.denom
      order by m.denom desc;
    `

    db.query(query_sql)
      .then(data => {
        res.jsonp(data);
      })
      .catch(error => {
        console.log(error); // print the error;
      });
  }
}

module.exports = SigmaStatusController;
