const express = require("express");
const router = express.Router();

const settingController = require("../controller/setting.controller");

router.put('/basket/:user_id', settingController.settingBasket);

module.exports = router;