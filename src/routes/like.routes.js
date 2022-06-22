const express = require("express");
const app = require("../../app");
const router = express.Router();
const likeController = require('../controller/like.controller');

router.put('/:user_id/:post_id/:req_user_id/:value', likeController.LikeOrDislikeInUserPost);
router.get('/:post_id/:user_id', likeController.showAllUserWhichIsLikePost);

module.exports = router