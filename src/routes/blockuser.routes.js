const express = require("express");
const router = express.Router();

const blockUnblockUserController = require("../controller/blockuser.controller");

router.post('/add/:userId/:blockUserId/:blockUnblock', blockUnblockUserController.blockUser);
router.get('/list/:userId', blockUnblockUserController.blockUserList);
router.post('/unblockUser/:userId/:blockUserId/:blockUnblock', blockUnblockUserController.unBlockUser);
module.exports = router;