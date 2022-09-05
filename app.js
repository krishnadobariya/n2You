const express = require("express");
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require("body-parser");
require('./src/db/conn');
const cron = require("node-cron");

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/images', express.static('images'));


// cron.schedule("*/1 * * * * *", async function () {

//     const findSession = await sessionModel.find()
//     for (const getDate of findSession) {
//         var userSessionDate = new Date(getDate.selectedDate);
//         now = new Date();
//         var sec_num = (now - userSessionDate) / 1000;
//         var days = Math.floor(sec_num / (3600 * 24));
//         var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
//         var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);

//         if (minutes == 30) {
//             const allRequestedEmails = [];
//             const findAllFriend = await requestsModel.findOne({
//                 userId: getDate.cretedSessionUser
//             })

//             const p1 = participants.participants_1 == null ? "" : participants.participants_1
//             const p2 = participants.participants_2 == null ? "" : participants.participants_2
//             const p3 = participants.participants_3 == null ? "" : participants.participants_3


//             for (const allRequestedEmail of findAllFriend.RequestedEmails) {

//                 if (((allRequestedEmail.userId).toString() != (p1).toString()) && ((allRequestedEmail.userId).toString() != (p2).toString()) && ((allRequestedEmail.userId).toString() != (p3).toString())) {
//                     allRequestedEmails.push(allRequestedEmail.userId)
//                 }

//             }
//             const invitedUsers = [];
//             if (p1 != "") {
//                 invitedUsers.push(mongoose.Types.ObjectId(req.body.participants_1))
//             }
//             if (p2 != "") {
//                 invitedUsers.push(mongoose.Types.ObjectId(req.body.participants_2))
//             }
//             if (p3 != "") {
//                 invitedUsers.push(mongoose.Types.ObjectId(req.body.participants_3))
//             }

//         }
//     }
//     console.log("running a task every 10 second");
// });


const userRoutes = require("./src/routes/user.routes");
const postRoutes = require("./src/routes/post.routes");
const requestRoutes = require("./src/routes/request.routes");
const likeRoutes = require("./src/routes/like.routes");
const commentRoutes = require("./src/routes/comment.routes");
const blockUnblockUserRoutes = require("./src/routes/blockuser.routes");
const chatRoutes = require("./src/routes/chat.routes");
const sessionRoutes = require('./src/routes/session.routes');
const thumbManageRoutes = require("./src/routes/thumbManage.routes");
const settingRoutes = require("./src/routes/setting.routes");


// polyamorous
const datingRoutes = require("./src/routes/polyamorous/dating.routes");
const blockUnblockRoutes = require('./src/routes/polyamorous/blockUnblock.routes');
const groupChatRoutes = require("./src/routes/polyamorous/groupChat.routes");
const notificationRoutes = require('./src/routes/polyamorous/notification.routes');
const conflictRoutes = require('./src/routes/polyamorous/conflict.routes');
const relastionShipHistoryRoutes = require('./src/routes/polyamorous/relationShipHistory.routes');
const sessionModel = require("./src/model/session.model");

app.use('/user', userRoutes);
app.use('/posts', postRoutes);
app.use('/request', requestRoutes);
app.use('/like', likeRoutes);
app.use('/comment', commentRoutes);
app.use('/blockUnblockUser', blockUnblockUserRoutes);
app.use('/chat', chatRoutes);
app.use('/session', sessionRoutes);
app.use('/thumb', thumbManageRoutes);
app.use('/setting', settingRoutes);

// polyamorous
app.use('/dating', datingRoutes);
app.use('/blockUnblockUsers', blockUnblockRoutes);
app.use('/groupChat', groupChatRoutes);
app.use('/notification', notificationRoutes);
app.use('/conflict', conflictRoutes);
app.use('/retaionship/histoy', relastionShipHistoryRoutes);

module.exports = app;