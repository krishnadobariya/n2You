const express = require("express");
const router = express.Router();

const requestController = require("../controller/request.controller");

router.post("/send/:userEmail/:RequestedEmail", requestController.sendRequest);
router.post("/userAcceptedRequesteOrNot/:email", requestController.userAcceptedRequesteOrNot);
router.post("/showPostsOnalyAcceptedPerson/:userEmail/:RequestedEmail", requestController.showPostsOnalyAcceptedPerson);

module.exports = router
