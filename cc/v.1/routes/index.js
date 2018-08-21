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

router.route('/login')
  .post(Auth.isAuthenticated, Usr.spread, Usr.login)
  // x-token, x-username
  // in header field
  .get(Token.authToken, Usr.getLogin)
  .delete(Token.authToken, Usr.deleteLogin);

router.route('/verify')
  .get((req, res) => {
    res.json({
      ok: 1
    });
  })

router.route('/usrs')
  // usrname, usr, pass, type (1:salesman)
  .put(Usr.linkUsr)
// .get(Usr.getUsrs)

router.route('/usrlogins/:id')
  // init, end
  .get(Usr.getUsrLogins)

router.route('/salesmans')
  .get(SalesMan.getSalesMan)
  // name, phone, mail, {"mi": "admin", "ph":"sales"}
  .put(SalesMan.putSalesman)

router.route('/salesmans/:id')
  // name, phone, mail, {"mi": "admin", "ph":"sales"}
  .post(SalesMan.modifySalesman)

router.route('/clients')
  // name, rfc, phone, mail, address
  .put(ClientController.putClient)
  // by =[name, mail, rfc, clientId]
  .get(ClientController.getClients);

router.route('/clients/:id')
  // by =[name, mail, rfc, clientId], search
  .get(ClientController.getClient)

router.route('/physs')
  // {mail, code, phone, address, external, name, first, last, rfc, account}
  .put(PhysController.putPhys)
  // external
  .get(PhysController.getPhyss);

router.route('/physs/:id')
  // by=code|mail|id=default
  .get(PhysController.getPhys)
  .post(PhysController.modifyPhys)




module.exports = router;
