const express = require("express");
const router = express.Router();

const commentController = require("../controller/comment.controller");

router.post('/add/:post_id/:user_id', commentController.CommetInsert);
router.post('/reply/:post_id/:user_id/:comment_id', commentController.replyComment);
router.put('/edit/:post_id/:comment_id/:commented_user', commentController.editComment);
router.delete('/delete/:post_id/:user_id/:comment_id/:commented_user', commentController.deleteComment);
router.put('/replyEdit/:post_id/:comment_reply_id/:commented_user', commentController.replyCommentEdit);
router.delete('/replyDelete/:post_id/:user_id/:comment_reply_id/:commented_user', commentController.replyCommitDelete);

module.exports = router;
