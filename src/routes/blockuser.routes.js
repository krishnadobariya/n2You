const express = require("express");
const router = express.Router();

const blockUnblockUserController = require("../controller/blockuser.controller");

router.post('/:user_id/:block_user_id', blockUnblockUserController.blockUnblockUser);
router.get('/list/:user_id', blockUnblockUserController.blockUserList);
// router.post('/unblockUser/:user_id/:block_user_id/:block_unblock', blockUnblockUserController.unBlockUser);
module.exports = router;