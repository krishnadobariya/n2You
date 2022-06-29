const express = require("express");
const router = express.Router();

const requestController = require("../controller/request.controller");

router.post("/send/:user_email/:requested_email", requestController.sendRequest);
router.get("/get/:user_email", requestController.getRequestUserWise);
router.post("/userAcceptedRequesteOrNot/:user_id/:email", requestController.userAcceptedRequesteOrNot);
router.get("/showPostsOnalyAcceptedPerson/:user_email/:requested_email", requestController.showPostsOnalyAcceptedPerson);

module.exports = router
                                    