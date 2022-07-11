const express = require("express");
const router = express.Router();

const groupChatController = require("../../controller/polyamorous/groupChat.controller");

router.get('/allChat/:chat_room_id/:user_id', groupChatController.getGroupChat);
router.get('/groupList/:user_id', groupChatController.groupList);
router.put('/exitGroup/:group_room_id/:user_id', groupChatController.exitGroup);

module.exports = router;