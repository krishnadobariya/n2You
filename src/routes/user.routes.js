const express = require("express");
const router = express.Router();

const upload = require('../utils/multer.userImages.utils');

const userController = require("../controller/user.controller");

router.post('/register', upload.array('photo'), userController.userRegister);
router.post('/update/:user_id', upload.array('photo'), userController.userUpdate);
router.get('/search/:user_email', userController.searchFriend);
router.get('/view/:user_id', userController.getDataUserWise);
router.get('/nearestMe/:user_id', userController.userNearestMe);
router.get('/yesBasket', userController.yesBasket);
router.get('/noBasket', userController.noBasket);
module.exports = router; 