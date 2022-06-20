const express = require("express");
const router = express.Router();

const commentController = require("../controller/comment.controller");

router.post('/add/:postId/:userId', commentController.CommetInsert);
router.post('/reply/:postId/:userId/:commentId', commentController.replyComment);

module.exports = router;