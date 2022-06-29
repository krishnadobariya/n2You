const express = require("express");
const router = express.Router();

const thumbManageController = require("../controller/thumbManage.controller");

router.put('/count/:admin_user_id/:req_user_id/:user_id', thumbManageController.thumbCount);

module.exports = router;