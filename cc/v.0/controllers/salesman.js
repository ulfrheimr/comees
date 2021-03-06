const SalesMan = require('../models/salesman')

const winston = require('winston');

const salesManRoles = {
  level: {
    "adm": "Admin",
    "sales": "Sales"
  },
  platform: {
    "mi": "Medical imaging",
    "ph": "Pharmacy",
    "mc": "Medical consultance"
  }
}

var createSalesMan = (s) => {
  return new Promise((resolve, reject) => {
    var salesMan = new SalesMan();

    salesMan.name = s.name;
    salesMan.phone = s.phone;
    salesMan.role = s.role;

    salesMan.save((err, r) => {
      if (err) reject(err);

      resolve(r);
    });
  });
}

var findSalesMan = (query) => {
  return new Promise((resolve, reject) => {
    SalesMan.find(query)
      .exec((err, sm) => {
        if (err) reject(err);

        resolve(sm);
      });
  });
}

var updateSalesMan = (s) => {
  return new Promise((resolve, reject) => {
    console.log(s);

    SalesMan.findOneAndUpdate({
      _id: s["_id"]
    }, {
      name: s.name,
      phone: s.phone,
      role: s.role
    }, {
      upsert: true
    }, function(err, salesman) {
      if (err) reject(err);
      return resolve(salesman);
    });
  });
};

Promise.all([]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var i = {
  putSalesman: (req, res) => {
    try {
      var s = {
        name: req.body.name,
        phone: req.body.phone,
        role: req.body.role
      };

      if (s.role == undefined)
        throw new Error("Role is needed");

      var r = JSON.parse(s.role);

      Object.keys(r).map((x) => {
        if (salesManRoles.platform[x] == undefined)
          throw new Error("No platform allowed");
        if (salesManRoles.level[r[x]] == undefined)
          throw new Error("No level allowed");
      })

      createSalesMan(s)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          });
        }).catch((err) => {
          throw err;
        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      })
    }


  },
  getSalesMan: (req, res) => {
    findSalesMan({})
      .then((r) => {
        res.json({
          ok: 1,
          data: r
        });
      })
      .catch((err) => {
        throw err;
      })
  },
  modifySalesman: (req, res) => {
    try {
      var s = {
        _id: req.params.id,
        name: req.body.name,
        phone: req.body.phone,
        role: req.body.role
      };

      if (s.role == undefined)
        throw new Error("Role is needed");

      var r = JSON.parse(s.role);

      Object.keys(r).map((x) => {
        if (salesManRoles.platform[x] == undefined)
          throw new Error("No platform allowed");
        if (salesManRoles.level[r[x]] == undefined)
          throw new Error("No level allowed");
      })

      updateSalesMan(s)
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          });
        })
        .catch((err) => {
          throw err
        });
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  querySalesMan: (query) => {
    return findSalesMan(query);
  }
}

module.exports = i;

//
// var findUsr = (query) => {
//   return new Promise((resolve, reject) => {
//     Usr.find(query)
//       .exec((err, r) => {
//         if (err) reject(err);
//
//         resolve(r);
//       });
//   });
// }
//
// var transformUsr = (usr) => {
//   return {
//     name: usr.name,
//     role: usr.role,
//     usr: usr.usr,
//     id: usr._id
//   };
// }
// var u = {
//   getUsr: (req, res) => {
//     var id = req.params.id;
//
//     findUsr({
//         usr: id
//       })
//       .then((r) => {
//         if (r.length != 1) throw "There is an error finding a usr";
//
//         r = r.map((x) => {
//           return {
//             name: x.name,
//             role: x.role,
//             usr: x.usr,
//             id: x._id
//           }
//         });
//
//         res.json({
//           ok: 1,
//           data: r
//         })
//       })
//       .catch((err) => res.status(500).send(err));
//   },
//   getUsrInfo: (req, res) => {
//     findUsr({})
//       .then((r) => {
//         console.log(r);
//         r = r.map((x) => {
//           return {
//             "name": x.name,
//             "id": x._id,
//             "usr": x.usr
//           };
//         });
//
//         res.json({
//           ok: 1,
//           data: r
//         })
//       })
//       .catch((err) => res.status(500).send(err));
//   },
//   getUsrs: (req, res) => {
//     findUsr({})
//       .then((r) => {
//         r = r.map((x) => {
//           return {
//             name: x.name,
//             role: x.role,
//             usr: x.usr
//           }
//         });
//
//         res.json({
//           ok: 1,
//           data: r
//         })
//       })
//       .catch((err) => res.status(500).send(err));
//   }
// };
//
// module.exports = u;
