const request = require('request');
const pgp = require('pg-promise')();

class SigmaStatusController {

  constructor(options) {
    this.node = options.node;
    this.connection_params = options.connection_params;
    this.block_height = 0;
  }

  getSigmaStatus(req, res) {
    var db = pgp(this.connection_params);

    var bh_sql = `
    select max(height) mh from block_info;
    `;

    db.query(bh_sql)
      .then(max_heigh => {
        if(this.block_height == max_heigh[0].mh) {
          res.jsonp(this.sigma_status);
        } else {
          var query_sql = `
          with m as (
            select count(o.value_sat) total, o.value_sat denom from vout o join address a on o.address_uid = a.uid
          join address_single sa on a.uid = sa.address_uid and sa.address_hash_uid = 3
          group by o.value_sat
          ), s as (
              select count(i.value_sat) total, i.value_sat denom from vin i join address a on i.address_uid = a.uid
            join address_single sa on a.uid = sa.address_uid and sa.address_hash_uid = 4
            group by i.value_sat
          ) select m.denom denomination, m.total mint, s.total spent from m join s on m.denom = s.denom
            order by m.denom desc;
          `;

          db.query(query_sql)
            .then(data => {
              this.sigma_status = data;
              this.block_height = max_heigh[0].mh;
              res.jsonp(data);

            })
            .catch(error => {
              console.log(error);
            });

        }

      })
      .catch(error => {
        console.log(error);
      });
  }
}

module.exports = SigmaStatusController;
