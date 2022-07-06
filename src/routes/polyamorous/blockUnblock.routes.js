const express = require("express");
const router = express.Router();

const blockUnblockController = require('../../controller/polyamorous/blockUnblock.controller');

router.post('/add/:user_id/:block_user_id/:block_unblock', blockUnblockController.blockUnblockUser);
router.get('/list/:user_id', blockUnblockController.blockUserList);
// router.post('/unblockUser/:user_id/:block_user_id/:block_unblock', blockUnblockController.unBlockUser);

module.exports = router;