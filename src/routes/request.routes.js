const express = require("express");
const router = express.Router();

const requestController = require("../controller/request.controller");

router.post("/send/:userEmail/:RequestedEmail", requestController.sendRequest);

module.exports = router
