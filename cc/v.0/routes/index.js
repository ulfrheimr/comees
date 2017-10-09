const express = require('express');
const Usr = require('../controllers/usr');
const Auth = require('../auth/http');
const Token = require('../auth/token')
const passport = require('passport');

const SalesMan = require('../controllers/salesman');
const PhysController = require('../controllers/phys');
const ClientController = require('../controllers/client');

const router = express.Router();
const app = express();

app.use(passport.initialize())

router.route('/signup')
  .post(Usr.signUp)

router.route('/login')
  .post(Auth.isAuthenticated, Usr.spread, Usr.login)

router.route('/usr')
  // usrname, usr, pass
  .put(Usr.linkUsr)

router.route('/salesman')
  // name, phone, mail, {"mi": "admin", "ph":"sales"}
  .put(SalesMan.putSalesman);

router.route('/client')
  // name, rfc, phone, mail, address
  .put(ClientController.putClient);

router.route('/client/:id')
  .get(ClientController.getClient)

router.route('/physs')
  // {mail, code, phone, address, external, name, first, last, rfc, account}
  .put(PhysController.putPhys)
  .get(PhysController.getPhyss);

router.route('/physs/:id')
  // by=code|mail|id=default
  .get(PhysController.getPhys);



module.exports = router;