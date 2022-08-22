const express = require("express");
const router = express.Router();

const upload = require('../utils/multer.userImages.utils');

const userController = require("../controller/user.controller");

router.post('/register', upload.array('photo'), userController.userRegister);
router.post('/login', userController.userLogin);
router.put('/update/:user_id', upload.array('photo'), userController.userUpdate);
router.put('/update/token/:user_id', userController.tokenUpdate);
router.get('/search/:user_id', userController.searchFriend);
router.get('/view/:user_id', userController.getDataUserWise);
router.get('/storeBasketValue/:user_id', userController.storeBasketValue);
router.get('/yesBasket/:user_id/:request_user_id', userController.yesBasket);
router.get('/noBasket/:user_id/:request_user_id', userController.noBasket);
router.get('/getUser/:user_id', userController.getAllUser);
router.get('/notification/:user_id', userController.getAllNotification);

// router.get('/add', userController.add)

module.exports = router; 
