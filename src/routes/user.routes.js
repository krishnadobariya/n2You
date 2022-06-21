const express = require("express");
const router = express.Router();

const upload = require('../utils/multer.userImages.utils');

const userController = require("../controller/user.controller");

router.post('/register', upload.array('photo'), userController.userRegister);
router.get('/search/:userEmail', userController.searchFriend);
router.get('/view/:UserId', userController.getDataUserWise);


module.exports = router;