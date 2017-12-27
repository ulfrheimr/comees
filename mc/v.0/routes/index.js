const express = require('express');
const passport = require('passport');

var MCController = require('../controllers/mc');
var CatController = require('../controllers/cat');
var SaleController = require('../controllers/sale');

// const Auth = require('../auth/auth');
// const AuthToken = require('../auth/token')


const router = express.Router();
const app = express();

app.use(passport.initialize())

router.route('/cats')
  // {name}
  .put(CatController.putCat)
  .get(CatController.getCats);

router.route('/mcs')
  // {name, desc, catID, price, observations}
  .put(MCController.putMC)
  .get(MCController.getMCs);

router.route('/partials')
  // client
  .put(SaleController.putPartial)
  // id_sale, qty, mc, phys, sale_price, observations
  .post(SaleController.addPartialMc)
  .get(SaleController.getPartial)

router.route('/partials/:saleId/:partialId')
  .delete(SaleController.closePartial)

router.route('/partial_payments')
  // id_sale, payment, usr
  .put(SaleController.addPayment)

router.route('/sales')
  // usr, paymentType, paymentAccount, auth
  .put(SaleController.putSale)
  // id_sale, qty, mc, sale_price, phys
  .post(SaleController.addMcs)
  .get(SaleController.getSales);

router.route('/sales/:id')
  .get(SaleController.getSale);

router.route('/partials_cut')
  .get(SaleController.partialsCut)

module.exports = router;
