const express = require("express");
const router = express.Router();

const upload = require('../utils/multer.utils');

const userController = require("../controller/user.controller");

router.post('/register', upload.array('photo'), userController.userRegister);

module.exports = router;