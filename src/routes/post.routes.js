const express = require("express");
const router = express.Router();
const postController = require("../controller/post.controller");
const upload = require("../utils/multer.postImages.utils");

router.post('/upload/videos/:id', upload.array('posts'), postController.addPostVideo);
router.post('/upload/images/:id', upload.array('posts'), postController.addPostImages);
router.get('/userWisePosts/:id', postController.getPostsbyUseId);
router.get('/postWise/:post_id/:user_id', postController.getPostById);
router.put('/update/:user_id/:post_id', postController.EditPosts);
router.delete('/delete/:user_id/:post_id', postController.deletePost);
router.get('/show/friend/:user_id', postController.userAllFriendPost);
router.put('/reportAdd/:user_id/:post_id', postController.reportAdd);
router.get('/videos/:id', postController.getPostsVideobyUseId);
router.get('/images/:id', postController.getPostsImagesbyUseId);

module.exports = router;    