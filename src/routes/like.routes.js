const express = require("express");
const app = require("../../app");
const router = express.Router();
const likeController = require('../controller/like.controller');

router.put('/:UserId/:PostId/:reqUserId/:Value', likeController.LikeOrDislikeInUserPost);
router.get('/:PostId/:userId', likeController.showAllUserWhichIsLikePost);

module.exports = router