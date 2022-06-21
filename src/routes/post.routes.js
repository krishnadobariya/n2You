const express = require("express");
const router = express.Router();
const postController = require("../controller/post.controller");
const upload = require("../utils/multer.postImages.utils");

router.post('/upload/videos/:id', upload.array('posts'), postController.addPostVideo);
router.post('/upload/images/:id', upload.array('posts'), postController.addPostImages);
router.get('/userWisePosts/:id', postController.getPostsbyUseId);
router.put('/update/:UserId/:PostId', postController.EditPosts);
router.delete('/delete/:UserId/:PostId', postController.deletePost);
router.get('/show/friend/:UserEmail', postController.userAllFriendPost);
router.put('/reportAdd/:UserId/:PostId', postController.reportAdd);

module.exports = router;