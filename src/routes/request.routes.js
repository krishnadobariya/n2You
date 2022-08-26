const express = require("express");
const router = express.Router();

const requestController = require("../controller/request.controller");
router.post("/send/:user_id/:requested_id", requestController.sendRequest);
router.get("/get/:user_id", requestController.getRequestUserWise);
router.get("/getfriend/:user_id/:req_user_id" , requestController.getUserWithFriend);
router.post("/userAcceptedRequesteOrNot/:user_id/:id", requestController.userAcceptedRequesteOrNot);
// router.get("/showPostsOnalyAcceptedPerson/:user_id/:requested_id", requestController.showPostsOnalyAcceptedPerson);

module.exports = router
