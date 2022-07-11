const express = require("express");
const router = express.Router();

const conflictController = require("../../controller/polyamorous/conflict.controller");

router.put('/update/:user_id/:conflict_id/:group_room_id', conflictController.updateConflictOfIntrest);

module.exports = router;