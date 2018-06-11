const express = require('express');
const passport = require('passport');

const Auth = require('../auth/auth');
const AuthToken = require('../auth/token')

var CatController = require('../controllers/cat');
var MIController = require('../controllers/mi');
var SaleController = require('../controllers/sale');
var PhysComissionController = require('../controllers/phys-comission')
var PhysMiController = require('../controllers/phys-mi')
var Discount = require('../controllers/discount')
var Invoices = require('../controllers/invoice')

const router = express.Router();
const app = express();

app.use(passport.initialize())

router.route('/init')
  .post(Auth.init)

router.route('/cats')
  // {name}
  .put(CatController.putCat)
  .get(CatController.getCats);

router.route('/mis')
  // {name, catId, price, desc, delivery, sample}
  .put(MIController.putMI)
  .get(MIController.getMIs);

router.route('/sales')
  // usr, paymentType, paymentAccount, auth
  .put(SaleController.putSale)
  //   // id_sale, qty, mi, sale_price, type_discount, discount,
  //   .post(SaleController.addMis)
  .get(SaleController.getSales);

router.route('/sales/:id')
  .get(SaleController.getSale)

// router.route('/mis/:mi')
//   // {sample, price, delivery_time, desc, name, catId, usr}
//   .post(MIController.modifyMI)
//
// router.route('/phys_comissions')
//   // physId,bottom,perc
//   .put(PhysComissionController.putPhysComission);
//
// router.route('/phys_discounts/:id')
//   .get(Discount.getCurrentPhysDiscount);
//
// router.route('/coupons')
//   // code, init_date, end_date, discount, description
//   .put(Discount.putCoupon);
//
// router.route('/coupons/:code')
//   .get(Discount.getCoupon)
//
// router.route('/pmis/:phys')
//   .get(PhysMiController.getPhysMI);
//
// router.route('/invoices')
//   .put(Invoices.putInvoice)
//   .post(Invoices.setAsInvoiced)
//   .get(Invoices.getInvoices)
//
// router.route('/partials')
//   // client
//   .put(SaleController.putPartial)
//   // id_sale, qty, mc, phys, sale_price, observations
//   .post(SaleController.addPartialMi)
//   .get(SaleController.getPartial);
//
// router.route('/partial_payments')
//   // id_sale, payment, usr
//   .put(SaleController.addPayment)
//
// router.route('/partials/:saleId/:partialId')
//   .delete(SaleController.closePartial)
//
// router.route('/partials_cut')
//   .get(SaleController.partialsCut)


module.exports = router;
