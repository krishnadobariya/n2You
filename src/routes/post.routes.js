const express = require("express");
const router = express.Router();
const postController = require("../controller/post.controller");
const upload = require("../utils/multer.postImages.utils");

router.post('/upload/videos/:id', upload.array('posts'), postController.addPostVideo);
router.post('/upload/images/:id', upload.array('posts'), postController.addPostImages);
router.get('/userWisePosts/:id', postController.getPostsbyUseId);
module.exports = router;