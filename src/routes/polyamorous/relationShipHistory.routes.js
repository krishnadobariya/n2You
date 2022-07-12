const express = require("express");
const router = express.Router();

const relationShipHistoryController = require('../../controller/polyamorous/relationShipHistory.controller');

router.get('/user/:user_id', relationShipHistoryController.relationShipHistory);

module.exports = router;