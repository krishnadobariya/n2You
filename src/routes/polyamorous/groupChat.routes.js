const express = require("express");
const router = express.Router();

const groupChatController = require("../../controller/polyamorous/groupChat.controller");

router.get('/allChat/:chat_room_id', groupChatController.getGroupChat);
router.get('/readUnread/message/:chat_room_id/:user_id', groupChatController.readUnreadMessageUserWise);
module.exports = router;