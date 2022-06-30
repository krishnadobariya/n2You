const express = require("express");
const router = express.Router();

const basketController = require("../controller/basket.controller");

router.put('/setting/:user_id', basketController.settingBasket);

module.exports = router;