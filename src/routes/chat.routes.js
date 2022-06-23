const express = require("express");
const router = express.Router();

const chatRouter = require("../controller/chat.controller");

router.put('/updateRead/:chat_room_id', chatRouter.readChat);
router.get('/getUserWithChat/:user_id', chatRouter.getUserWithChat);
module.exports = router;