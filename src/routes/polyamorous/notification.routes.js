const express = require("express");
const router = express.Router();

const notificationController = require("../../controller/polyamorous/notification.controller");

router.get('/:user_id', notificationController.getAllNotification);

module.exports = router