const express = require("express");
const router = express.Router();

const upload = require('../utils/multer.userImages.utils');

const userController = require("../controller/user.controller");

router.post('/register', upload.array('posts'), userController.userRegister);

module.exports = router;