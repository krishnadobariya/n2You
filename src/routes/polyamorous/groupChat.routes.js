const express = require("express");
const router = express.Router();

const groupChatController = require("../../controller/polyamorous/groupChat.controller");

router.get('/allChat/:chat_room_id', groupChatController.getGroupChat);
router.get('/groupList/:user_id', groupChatController.groupList);
module.exports = router;