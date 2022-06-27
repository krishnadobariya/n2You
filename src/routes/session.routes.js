const express = require("express");
const router = express.Router();

const sessionController = require("../controller/session.controller");

router.post('/create', sessionController.sessionCreate);
router.get('/public', sessionController.publicSession);
router.get('/invited/:user_id', sessionController.invitedInSession);
router.get('/my/:user_id' , sessionController.mySession);

module.exports = router;