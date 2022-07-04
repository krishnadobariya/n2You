const express = require("express");
const router = express.Router();

const datingController = require('../../controller/polyamorous/dating.controller');

router.get('/getuser/:user_id', datingController.getUserWhichNotChoiceForLikeOrDislike);
router.get('/matchUser/:user_id', datingController.matchTable);
router.get('/polyamorousUser/:user_id', datingController.getPolyamorousUser);
router.get('/linkProfile/:user_id', datingController.listLinkProfile);

module.exports = router;
