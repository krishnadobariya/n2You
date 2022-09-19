const express = require("express");
const router = express.Router();
const upload = require("../utils/multer.postImages.utils");


const sessionController = require("../controller/session.controller");

router.post('/create', sessionController.sessionCreate);
router.get('/public/:user_id', sessionController.publicSession);
router.get('/invited/:user_id', sessionController.invitedInSession);
router.get('/my/:user_id', sessionController.mySession);
router.get('/end/:session_id', sessionController.endSession);
router.get('/raisHandList/:session_id' , sessionController.raisHandList);
router.get('/detail/:session_id' , sessionController.sessionDetail);
router.get('/uploadImages/:session_id/:user_id' , upload.array('upload') ,sessionController.uploadImages);
router.get('/uploadVideos/:session_id/:user_id' , upload.array('upload') ,sessionController.uploadVideos);
router.get('/getUploadeVedioOrImages/:session_id' , sessionController.getUploadeVedioOrImages);
module.exports = router;
