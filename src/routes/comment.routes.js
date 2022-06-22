const express = require("express");
const router = express.Router();

const commentController = require("../controller/comment.controller");

router.post('/add/:postId/:userId', commentController.CommetInsert);
router.post('/reply/:postId/:userId/:commentId', commentController.replyComment);
router.put('/edit/:PostId/:UserId/:commentId', commentController.editComment);
router.delete('/delete/:PostId/:UserId/:commentId' , commentController.deleteComment);
router.put('/replyEdit/:PostId/:UserId/:commentId/:commentReplayId' , commentController.replyCommentEdit);
router.delete('/replyDelete/:post_id/:user_id/:comment_id/:comment_reply_id' , commentController.replyCommitDelete);

module.exports = router;
