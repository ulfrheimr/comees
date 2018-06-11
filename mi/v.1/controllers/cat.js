var Cat = require('../models/cat');
const winston = require('winston');

var saveCat = (cat) => {
  return new Promise((resolve, reject) => {
    try {
      var mic = new Cat();
      mic.name = cat.name;

      mic.save((err, cat) => {
        if (err) reject(err);

        resolve(cat);
      });
    } catch (err) {
      reject(err);
    }
  });
}

var findCats = (query) => {
  return new Promise((resolve, reject) => {
    try {
      Cat.find(query)
        .exec((err, cats) => {
          if (err) reject(err);

          resolve(cats);
        });
    } catch (err) {
      reject(err);
    }
  });
}

Promise.all([saveCat, findCats]).catch((error) => {
  winston.log('error', error);
  return Promise.reject(error.message || error);
});

var s = {
  putCat: (req, res) => {
    try {
      console.log("adsdas");
      saveCat({
          name: req.body.name
        })
        .then((r) => {
          res.json({
            ok: 1,
            message: "Category added",
            data: r
          });
        }).catch((err) => {
          throw err
        })
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }
  },
  getCats: (req, res) => {
    try {
      findCats({})
        .then((r) => {
          res.json({
            ok: 1,
            data: r
          });
        })
        .catch((err) => {
          throw err
        })
    } catch (err) {
      winston.log('error', err);
      res.status(500).json({
        err: err.message
      });
    }


  }

}

module.exports = s;
