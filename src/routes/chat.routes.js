const express = require("express");
const router = express.Router();

const chatRouter = require("../controller/chat.controller");

router.put('/updateRead/:chat_room_id', chatRouter.readChat);
router.get('/getUserWithChat/:user_id', chatRouter.getUserWithChat);
router.get('/allUserListWithUnreadCount/:user_id', chatRouter.allUserListWithUnreadCount);
module.exports = router;