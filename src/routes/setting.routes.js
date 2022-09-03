const express = require("express");
const router = express.Router();

const settingController = require("../controller/setting.controller");

router.put('/basket/:user_id', settingController.settingBasket);
router.put('/comment/:user_id', settingController.settingComment);
router.get('/basketAccess/:user_id', settingController.getBasketSetting);
router.get('/commentAccess/:user_id', settingController.getCommentSetting);

module.exports = router;