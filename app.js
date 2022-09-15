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
const Notification = require("./src/helper/firebaseHelper");


cron.schedule("*/60 * * * * *", async function () {

    const findSession = await sessionModel.find()
    for (const getDate of findSession) {


        var userSessionDate = new Date(new Date(getDate.selectedDate).toUTCString())
        let userSessionDates = userSessionDate.getUTCDate();
        let userSessionmonth = userSessionDate.getUTCMonth();
        let userSessionyear = userSessionDate.getUTCFullYear();
        let userSessionhour = userSessionDate.getUTCHours();
        let userSessionminute = userSessionDate.getUTCMinutes();
        const finalMinute = userSessionminute >= 30 ? userSessionminute - 30 : userSessionminute + 30;
        const finalHours = userSessionminute >= 30 ? userSessionhour - 5 : userSessionhour - 6;
        let userSessionsecond = userSessionDate.getUTCSeconds();
        const finalUserSessionDate = new Date(`${userSessionyear}-${userSessionmonth + 1}-${userSessionDates} ${finalHours}:${finalMinute}:${userSessionsecond}`)

        const date = new Date(new Date().toUTCString())
        let dates = date.getUTCDate();
        let month = date.getUTCMonth()
        let year = date.getUTCFullYear();
        let hour = date.getUTCHours();
        let minute = date.getUTCMinutes();
        let second = date.getUTCSeconds();
        now = new Date(`${year}-${month + 1}-${dates} ${hour}:${minute}:${second}`)

        console.log("now", now);
        var sec_num = (finalUserSessionDate - now) / 1000;
        var days = Math.floor(sec_num / (3600 * 24));
        var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
        var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);


        console.log("hours", hours);
        console.log("days", days);
        console.log("minutes", minutes);

        if (hours == 0 && days == 0 && minutes == 30) {


            const findUserInUserModel = await userModel.findOne({
                _id: getDate.cretedSessionUser
            })

            const title = findUserInUserModel.firstName;
            const body = "after 30 min started your session";

            const text = "join session";
            const sendBy = (findUserInUserModel._id).toString();
            const registrationToken = findUserInUserModel.fcm_token
            Notification.sendPushNotificationFCM(
                registrationToken,
                title,
                body,
                text,
                sendBy,
                true
            );

            const findInNotification = await notificationModel.findOne({
                userId: findUserInUserModel._id
            })
            if (findInNotification) {

                await notificationModel.updateOne({
                    userId: findUserInUserModel._id
                }, {
                    $push: {
                        notifications: {
                            notifications: "after 30 min started your session",
                            userId: findUserInUserModel._id,
                            status: 11
                        }
                    }
                })
            } else {
                const savedata = notificationModel({
                    userId: findUserInUserModel._id,
                    notifications: {
                        notifications: "after 30 min started your session",
                        userId: findUserInUserModel._id,
                        status: 11
                    }
                })
                await savedata.save();
            }

            if (getDate.RoomType == "Public") {
                const allRequestedEmails = [];
                const findAllFriend = await requestsModel.findOne({
                    userId: getDate.cretedSessionUser
                })

                const p1 = getDate.participants[0].participants_1 == null ? "" : getDate.participants[0].participants_1
                const p2 = getDate.participants[0].participants_2 == null ? "" : getDate.participants[0].participants_2
                const p3 = getDate.participants[0].participants_3 == null ? "" : getDate.participants[0].participants_3


                for (const allRequestedEmail of findAllFriend.RequestedEmails) {

                    if (allRequestedEmail.accepted == 1) {
                        if (((allRequestedEmail.userId).toString() != (p1).toString()) && ((allRequestedEmail.userId).toString() != (p2).toString()) && ((allRequestedEmail.userId).toString() != (p3).toString())) {
                            allRequestedEmails.push(allRequestedEmail.userId)
                        }
                    }
                }

                const invitedUsers = [];
                if (p1 != null) {
                    invitedUsers.push(getDate.participants[0].participants_1)
                }
                if (p2 != null) {
                    invitedUsers.push(getDate.participants[0].participants_2)
                }
                if (p3 != null) {
                    invitedUsers.push(getDate.participants[0].participants_3)
                }
                for (const notification of allRequestedEmails) {


                    const findUser = await userModel.findOne({
                        _id: notification
                    })

                    const findCreateSessionUser = await userModel.findOne({
                        _id: getDate.cretedSessionUser
                    })

                    const title = findCreateSessionUser.firstName;
                    const body = "after 30 min join session";

                    const text = "join session";
                    const sendBy = (findCreateSessionUser._id).toString();
                    const registrationToken = findUser.fcm_token
                    Notification.sendPushNotificationFCM(
                        registrationToken,
                        title,
                        body,
                        text,
                        sendBy,
                        true
                    );


                    const findInNotification = await notificationModel.findOne({
                        userId: notification
                    })
                    if (findInNotification) {

                        await notificationModel.updateOne({
                            userId: notification
                        }, {
                            $push: {
                                notifications: {
                                    notifications: `after 30 min join session`,
                                    userId: findUserInUserModel._id,
                                    status: 11
                                }
                            }
                        })
                    } else {
                        const savedata = notificationModel({
                            userId: notification,
                            notifications: {
                                notifications: `after 30 min join session`,
                                userId: findUserInUserModel._id,
                                status: 11
                            }
                        })
                        await savedata.save();
                    }
                }

                for (const invitedUser of invitedUsers) {
                    const findUser = await userModel.findOne({
                        _id: invitedUser
                    })

                    const findCreateSessionUser = await userModel.findOne({
                        _id: getDate.cretedSessionUser
                    })

                    const title = findCreateSessionUser.firstName;
                    const body = "after 30 min join session";

                    const text = "join session";
                    const sendBy = (findCreateSessionUser._id).toString();
                    const registrationToken = findUser.fcm_token
                    Notification.sendPushNotificationFCM(
                        registrationToken,
                        title,
                        body,
                        text,
                        sendBy,
                        true
                    );

                    const findInNotification = await notificationModel.findOne({
                        userId: invitedUser
                    })

                    if (findInNotification) {
                        await notificationModel.updateOne({
                            userId: invitedUser
                        }, {
                            $push: {
                                notifications: {
                                    notifications: `after 30 min join session`,
                                    userId: findUserInUserModel._id,
                                    status: 11
                                }
                            }
                        })
                    } else {
                        const savedata = notificationModel({
                            userId: invitedUser,
                            notifications: {
                                notifications: `after 30 min join session`,
                                userId: findUserInUserModel._id,
                                status: 11
                            }
                        })
                        await savedata.save();
                    }
                }

            } else {
                const allRequestedEmails = [];
                const p1 = getDate.participants[0].participants_1 == null ? "" : getDate.participants[0].participants_1
                const p2 = getDate.participants[0].participants_2 == null ? "" : getDate.participants[0].participants_2
                const p3 = getDate.participants[0].participants_3 == null ? "" : getDate.participants[0].participants_3

                if (p1 != null) {
                    allRequestedEmails.push(getDate.participants[0].participants_1)
                }
                if (p2 != null) {
                    allRequestedEmails.push(getDate.participants[0].participants_2)
                }
                if (p3 != null) {
                    allRequestedEmails.push(getDate.participants[0].participants_3)
                }

                for (const notification of allRequestedEmails) {

                    const findUser = await userModel.findOne({
                        _id: notification
                    })

                    const findCreateSessionUser = await userModel.findOne({
                        _id: getDate.cretedSessionUser
                    })

                    const title = findCreateSessionUser.firstName;
                    const body = "after 30 min join session";

                    const text = "join session";
                    const sendBy = (findCreateSessionUser._id).toString();
                    const registrationToken = findUser.fcm_token
                    Notification.sendPushNotificationFCM(
                        registrationToken,
                        title,
                        body,
                        text,
                        sendBy,
                        true
                    );

                    const findInNotification = await notificationModel.findOne({
                        userId: notification
                    })

                    if (findInNotification) {

                        await notificationModel.updateOne({
                            userId: notification
                        }, {
                            $push: {
                                notifications: {
                                    notifications: `after 30 min join session`,
                                    userId: findUserInUserModel._id,
                                    status: 11
                                }
                            }
                        })

                    } else {
                        const savedata = notificationModel({
                            userId: notification,
                            notifications: {
                                notifications: `after 30 min join session`,
                                userId: findUserInUserModel._id,
                                status: 11
                            }
                        })
                        await savedata.save();

                    }
                }
            }

        } else {
        }
    }
    console.log("running a task every 10 second");
});


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
const userModel = require("./src/model/user.model");
const requestsModel = require("./src/model/requests.model");
const notificationModel = require("./src/model/polyamorous/notification.model");

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
