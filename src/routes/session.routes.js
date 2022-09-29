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
router.get('/joinUserlist/:session_id' , sessionController.userList);
router.post('/uploadImages/:session_id/:user_id' , upload.array('upload') ,sessionController.uploadImages);
router.post('/uploadVideos/:session_id/:user_id' , upload.array('upload') ,sessionController.uploadVideos);
router.get('/getUploadeVedioOrImages/:session_id' , sessionController.getUploadeVedioOrImages);
router.get('/commentSessionList/:session_id' , sessionController.commentSessionList);
router.get('/thumbUpCount/:session_id/:participants_id/:user_id' , sessionController.thumbUpCountInSession);
router.get('/info/:session_id' , sessionController.sessionInfo);
router.get('/listOfSessionInfo/:session_id' , sessionController.listOfSessionInfo);
// router.get('/rejectList/:session_id/:user_id' , sessionController.rejectList)
module.exports = router;
