const express = require("express");
const router = express.Router();

const sessionController = require("../controller/session.controller");

router.post('/create', sessionController.sessionCreate);
router.get('/public/:user_id', sessionController.publicSession);
router.get('/invited/:user_id', sessionController.invitedInSession);
router.get('/my/:user_id', sessionController.mySession);
router.get('/end/:session_id', sessionController.endSession);
router.get('/raisHandList/:session_id' , sessionController.raisHandList);
router.get('/detail/:session_id' , sessionController.sessionDetail);
module.exports = router;
