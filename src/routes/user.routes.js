const express = require("express");
const router = express.Router();

const upload = require('../utils/multer.userImages.utils');

const userController = require("../controller/user.controller");

router.post('/register', upload.array('photo'), userController.userRegister);
router.get('/search/:user_email', userController.searchFriend);
router.get('/view/:user_id', userController.getDataUserWise);

module.exports = router;