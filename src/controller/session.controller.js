const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const sessionModel = require("../model/session.model");
const userModel = require("../model/user.model");
const e = require("express");
const notificationModel = require("../model/polyamorous/notification.model");
const requestsModel = require("../model/requests.model");
const { default: mongoose } = require("mongoose");
const cron = require("node-cron");
const Notification = require("../helper/firebaseHelper")

exports.sessionCreate = async (req, res, next) => {
    try {

        const findUserInUserModel = await userModel.findOne({
            _id: req.body.creted_session_user
        })

        if (findUserInUserModel) {

            console.log("req.body.selected_date", req.body.selected_date);
            const date = new Date(req.body.selected_date)
            let dates = date.getDate();
            let months = date.getMonth()
            let year = date.getFullYear();
            let hour = date.getHours();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let second = date.getSeconds();
            let month = date.toString('en-us', { month: 'long' });
            const mon = month.toString().split(" ")
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes.toString().padStart(2, '0');
            let strTime = hours + ' ' + ampm;
            let timeSession = 'At' + ' ' + hours + ':' + minutes + ' ' + ampm + ' ' + 'on' + ' ' + mon[0] + ' ' + mon[1] + ' ' + mon[2] + ' ' + mon[3]
            const createSession = sessionModel({
                selectedDate: `${year}-${months + 1}-${dates} ${hour}:${minutes}:${second}`,
                selectedTime: strTime,
                cretedSessionUser: req.body.creted_session_user,
                participants: {
                    participants_1: req.body.participants_1 ? req.body.participants_1 : null,
                    participants_2: req.body.participants_2 ? req.body.participants_2 : null,
                    participants_3: req.body.participants_3 ? req.body.participants_3 : null
                },
                RoomType: req.body.room_type
            })

            const saveData = await createSession.save();

            if (req.body.room_type == "public") {

                const allRequestedEmails = [];
                const findAllFriend = await requestsModel.findOne({
                    userId: req.body.creted_session_user
                })

                const p1 = req.body.participants_1 ? req.body.participants_1 : ""
                const p2 = req.body.participants_2 ? req.body.participants_2 : ""
                const p3 = req.body.participants_3 ? req.body.participants_3 : ""


                for (const allRequestedEmail of findAllFriend.RequestedEmails) {

                    if (((allRequestedEmail.userId).toString() != (p1).toString()) && ((allRequestedEmail.userId).toString() != (p2).toString()) && ((allRequestedEmail.userId).toString() != (p3).toString())) {
                        allRequestedEmails.push(allRequestedEmail.userId)
                    }

                }
                const invitedUsers = [];
                if (p1) {
                    invitedUsers.push(mongoose.Types.ObjectId(req.body.participants_1))
                }
                if (p2) {
                    invitedUsers.push(mongoose.Types.ObjectId(req.body.participants_2))
                }
                if (p3) {
                    invitedUsers.push(mongoose.Types.ObjectId(req.body.participants_3))
                }



                for (const notification of allRequestedEmails) {

                    const findUser = await userModel.findOne({
                        _id: notification
                    })

                    const title = findUserInUserModel.firstName;
                    const body = `${findUserInUserModel.firstName} create session ${timeSession}`;

                    const text = "join session";
                    const sendBy = (findUserInUserModel._id).toString();
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
                                    notifications: `${findUserInUserModel.firstName} create session ${timeSession}`,
                                    userId: findUserInUserModel._id,
                                    status: 8
                                }
                            }
                        })
                    } else {

                        const savedata = notificationModel({
                            userId: notification,
                            notifications: {
                                notifications: `${findUserInUserModel.firstName} create session ${timeSession}`,
                                userId: findUserInUserModel._id,
                                status: 8
                            }
                        })

                        await savedata.save();

                    }
                }

                for (const invitedUser of invitedUsers) {

                    const findUser = await userModel.findOne({
                        _id: invitedUser
                    })

                    const title = findUserInUserModel.firstName;
                    const body = `${findUserInUserModel.firstName} invited you in session ${timeSession}`;

                    const text = "join session";
                    const sendBy = (findUserInUserModel._id).toString();
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
                                    notifications: `${findUserInUserModel.firstName} invited you in session ${timeSession}`,
                                    userId: findUserInUserModel._id,
                                    status: 8
                                }
                            }
                        })
                    } else {

                        const savedata = notificationModel({
                            userId: invitedUser,
                            notifications: {
                                notifications: `${findUserInUserModel.firstName} invited you in session ${timeSession}`,
                                userId: findUserInUserModel._id,
                                status: 8
                            }
                        })

                        await savedata.save();

                    }
                }
            } else {

                const allRequestedEmails = [];

                const p1 = req.body.participants_1 ? req.body.participants_1 : ""
                const p2 = req.body.participants_2 ? req.body.participants_2 : ""
                const p3 = req.body.participants_3 ? req.body.participants_3 : ""


                if (p1) {
                    allRequestedEmails.push(mongoose.Types.ObjectId(req.body.participants_1))
                }
                if (p2) {
                    allRequestedEmails.push(mongoose.Types.ObjectId(req.body.participants_2))
                }
                if (p3) {
                    allRequestedEmails.push(mongoose.Types.ObjectId(req.body.participants_3))
                }


                for (const notification of allRequestedEmails) {

                    const findUser = await userModel.findOne({
                        _id: notification
                    })

                    const title = findUserInUserModel.firstName;
                    const body = `${findUserInUserModel.firstName} invited you in session ${timeSession}`;

                    const text = "join session";
                    const sendBy = (findUserInUserModel._id).toString();
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
                                    notifications: `${findUserInUserModel.firstName} invited you in session ${timeSession}`,
                                    userId: findUserInUserModel._id,
                                    status: 8
                                }
                            }
                        })

                    } else {

                        const savedata = notificationModel({
                            userId: notification,
                            notifications: {
                                notifications: `${findUserInUserModel.firstName} invited you in session ${timeSession}`,
                                userId: findUserInUserModel._id,
                                status: 8
                            }
                        })

                        await savedata.save();

                    }
                }

            }

            res.status(status.CREATED).json(
                new APIResponse("successfully Session Created!", "true", 201, "1")
            )
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("usernot found!", "false", 404, "0")
            )
        }

    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.publicSession = async (req, res, next) => {
    try {

        const findPublicSession = await sessionModel.find({
            RoomType: "public"
        })

        if (findPublicSession[0] == null) {
            res.status(status.OK).json({
                "message": "Not Found Any Public Session",
                "status": true,
                "code": 200,
                "statusCode": 1,
                "pageCount": 0,
                "data": []

            })
        } else {

            const publicSession = [];

            for (const publicSessionwithUserDetails of findPublicSession) {

                const findUser = await userModel.findOne({
                    _id: publicSessionwithUserDetails.cretedSessionUser,
                    polyDating: 0
                })

                const participants1Find = await userModel.findOne({
                    _id: publicSessionwithUserDetails.participants[0].participants_1,
                    polyDating: 0
                })
                const participants2Find = await userModel.findOne({
                    _id: publicSessionwithUserDetails.participants[0].participants_2,
                    polyDating: 0
                })
                const participants3Find = await userModel.findOne({
                    _id: publicSessionwithUserDetails.participants[0].participants_3,
                    polyDating: 0
                })

                const participants_1 = {
                    _id: participants1Find ? participants1Find._id : "",
                    name: participants1Find ? participants1Find.firstName : "",
                    profile: participants1Find ? participants1Find.photo[0] ? participants1Find.photo[0].res : "" : "",
                }
                const participants_2 = {
                    _id: participants2Find ? participants2Find._id : "",
                    name: participants2Find ? participants2Find.firstName : "",
                    profile: participants2Find ? participants2Find.photo[0] ? participants2Find.photo[0].res : "" : "",
                }
                const participants_3 = {
                    _id: participants3Find ? participants3Find._id : "",
                    name: participants3Find ? participants3Find.firstName : "",
                    profile: participants3Find ? participants3Find.photo[0] ? participants3Find.photo[0].res : "" : "",
                }


                if (participants1Find && participants2Find && participants3Find) {
                    // const sessionDetail = 
                    // const response = {
                    //     sessionDetail
                    // }
                    publicSession.push({
                        _id: publicSessionwithUserDetails._id,
                        cretedSessionUserId: findUser._id,
                        cretedSessionUsername: findUser.firstName,
                        selectedDate: publicSessionwithUserDetails.selectedDate,
                        selectedTime: publicSessionwithUserDetails.selectedTime,
                        roomType: publicSessionwithUserDetails.RoomType,
                        detail: publicSessionwithUserDetails.started == "true" ? "100 people joined" : "12 Jan 2020 12:00 PM",
                        isLive: publicSessionwithUserDetails.started,
                        isAbleToJoin: publicSessionwithUserDetails.started,
                        cretedSessionUserphoto: findUser.photo == undefined ? "" : findUser.photo[0] ? findUser.photo[0].res : "",
                        participants: [
                            participants_1,
                            participants_2,
                            participants_3
                        ]
                    })
                } else if (participants1Find == null && participants2Find && participants3Find) {
                    // const sessionDetail = 
                    // const response = {
                    //     sessionDetail
                    // }
                    publicSession.push({
                        _id: publicSessionwithUserDetails._id,
                        cretedSessionUserId: findUser._id,
                        cretedSessionUsername: findUser.firstName,
                        selectedDate: publicSessionwithUserDetails.selectedDate,
                        selectedTime: publicSessionwithUserDetails.selectedTime,
                        roomType: publicSessionwithUserDetails.RoomType,
                        detail: publicSessionwithUserDetails.started == "true" ? "100 people joined" : "12 Jan 2020 12:00 PM",
                        isLive: publicSessionwithUserDetails.started,
                        isAbleToJoin: publicSessionwithUserDetails.started,
                        cretedSessionUserphoto: findUser.photo == undefined ? "" : findUser.photo[0] ? findUser.photo[0].res : "",
                        participants: [
                            participants_2,
                            participants_3
                        ]
                    })
                } else if (participants1Find && participants2Find == null && participants3Find) {
                    const sessionDetail = {
                        _id: publicSessionwithUserDetails._id,
                        cretedSessionUserId: findUser._id,
                        cretedSessionUsername: findUser.firstName,
                        selectedDate: publicSessionwithUserDetails.selectedDate,
                        selectedTime: publicSessionwithUserDetails.selectedTime,
                        roomType: publicSessionwithUserDetails.RoomType,
                        detail: publicSessionwithUserDetails.started == "true" ? "100 people joined" : "12 Jan 2020 12:00 PM",
                        isLive: publicSessionwithUserDetails.started,
                        isAbleToJoin: publicSessionwithUserDetails.started,
                        cretedSessionUserphoto: findUser.photo == undefined ? "" : findUser.photo[0] ? findUser.photo[0].res : "",
                        participants: [
                            participants_1,
                            participants_3
                        ]
                    }
                    const response = {
                        sessionDetail
                    }
                    publicSession.push(response)
                } else if (participants1Find && participants2Find && participants3Find == null) {
                    // const sessionDetail = 
                    // const response = {
                    //     sessionDetail
                    // }
                    publicSession.push({
                        _id: publicSessionwithUserDetails._id,
                        cretedSessionUserId: findUser._id,
                        cretedSessionUsername: findUser.firstName,
                        selectedDate: publicSessionwithUserDetails.selectedDate,
                        selectedTime: publicSessionwithUserDetails.selectedTime,
                        roomType: publicSessionwithUserDetails.RoomType,
                        detail: publicSessionwithUserDetails.started == "true" ? "100 people joined" : "12 Jan 2020 12:00 PM",
                        isLive: publicSessionwithUserDetails.started,
                        isAbleToJoin: publicSessionwithUserDetails.started,
                        cretedSessionUserphoto: findUser.photo == undefined ? "" : findUser.photo[0] ? findUser.photo[0].res : "",
                        participants: [
                            participants_1,
                            participants_2
                        ]
                    })

                } else if (participants1Find == null && participants2Find == null && participants3Find == null) {
                    // const sessionDetail =
                    // const response = {
                    //     sessionDetail
                    // }
                    publicSession.push({
                        _id: publicSessionwithUserDetails._id,
                        cretedSessionUserId: findUser._id,
                        cretedSessionUsername: findUser.firstName,
                        selectedDate: publicSessionwithUserDetails.selectedDate,
                        selectedTime: publicSessionwithUserDetails.selectedTime,
                        roomType: publicSessionwithUserDetails.RoomType,
                        detail: publicSessionwithUserDetails.started == "true" ? "100 people joined" : "12 Jan 2020 12:00 PM",
                        isLive: publicSessionwithUserDetails.started,
                        isAbleToJoin: publicSessionwithUserDetails.started,
                        cretedSessionUserphoto: findUser.photo == undefined ? "" : findUser.photo[0] ? findUser.photo[0].res : "",
                        participants: []
                    })
                }


            }

            const page = parseInt(req.query.page)
            const limit = parseInt(req.query.limit)
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const data = publicSession.length;
            const pageCount = Math.ceil(data / limit);
            res.status(status.OK).json({
                "message": "successfully Show All Public Session!",
                "status": true,
                "code": 200,
                "statusCode": 1,
                "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                "data": (startIndex).toString() == (NaN).toString() ? publicSession.sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate)) : publicSession.slice(startIndex, endIndex).sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate))

            })
        }

    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.invitedInSession = async (req, res, next) => {
    try {

        const allInvited = [];
        const findMyIdInSession = await sessionModel.find({})


        for (const findInvited of findMyIdInSession) {


            if (findInvited.participants[0].participants_1 == req.params.user_id) {

                const createdSessionUser = await userModel.findOne({
                    _id: findInvited.cretedSessionUser,
                    polyDating: 0
                })

                const participants_2 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_2,
                    polyDating: 0
                })
                const participants_3 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_3,
                    polyDating: 0
                })

                if (participants_2 == null && participants_3) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: [{
                            _id: participants_3 == null ? "" : participants_3._id,
                            photo: participants_3.photo ? participants_3.photo[0].res : "",
                            name: participants_3 == null ? "" : participants_3.firstName
                        }]
                    }
                    allInvited.push(createdSessionUserDetail)
                } else if (participants_3 == null && participants_2) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: [{
                            _id: participants_2 == null ? "" : participants_2._id,
                            photo: participants_2.photo ? participants_2.photo[0].res : "",
                            name: participants_2 == null ? "" : participants_2.firstName
                        }]
                    }
                    allInvited.push(createdSessionUserDetail)
                } else if (participants_2 && participants_3) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: [{
                            _id: participants_2 == null ? "" : participants_2._id,
                            photo: participants_2.photo ? participants_2.photo[0].res : "",
                            name: participants_2 == null ? "" : participants_2.firstName
                        },
                        {
                            _id: participants_3 == null ? "" : participants_3._id,
                            photo: participants_3.photo ? participants_3.photo[0].res : "",
                            name: participants_3 == null ? "" : participants_3.firstName
                        }]
                    }
                    allInvited.push(createdSessionUserDetail)
                } else if (participants_2 == null && participants_3 == null) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: []
                    }
                    allInvited.push(createdSessionUserDetail)
                }

            } else if (findInvited.participants[0].participants_2 == req.params.user_id) {
                const createdSessionUser = await userModel.findOne({
                    _id: findInvited.cretedSessionUser,
                    polyDating: 0
                })
                const participants_1 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_1,
                    polyDating: 0
                })
                const participants_3 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_3,
                    polyDating: 0
                })

                if (participants_1 == null && participants_3) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: [{
                            _id: participants_3 == null ? "" : participants_3._id,
                            photo: participants_3.photo ? participants_3.photo[0].res : "",
                            name: participants_3 == null ? "" : participants_3.firstName
                        }]
                    }
                    allInvited.push(createdSessionUserDetail)
                } else if (participants_3 == null && participants_1) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: [{
                            _id: participants_1 == null ? "" : participants_1._id,
                            photo: participants_1.photo ? participants_1.photo[0].res : "",
                            name: participants_1 == null ? "" : participants_1.firstName
                        }]
                    }
                    allInvited.push(createdSessionUserDetail)

                } else if (participants_1 && participants_3) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: [{
                            _id: participants_1 == null ? "" : participants_1._id,
                            photo: participants_1.photo ? participants_1.photo[0].res : "",
                            name: participants_1 == null ? "" : participants_1.firstName
                        }, {
                            _id: participants_3 == null ? "" : participants_3._id,
                            photo: participants_3.photo ? participants_3.photo[0].res : "",
                            name: participants_3 == null ? "" : participants_3.firstName
                        }]
                    }
                    allInvited.push(createdSessionUserDetail)
                } else if (participants_1 == null && participants_3 == null) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: []
                    }
                    allInvited.push(createdSessionUserDetail)
                }

            } else if (findInvited.participants[0].participants_3 == req.params.user_id) {

                const createdSessionUser = await userModel.findOne({
                    _id: findInvited.cretedSessionUser,
                    polyDating: 0
                })
                const participants_1 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_1,
                    polyDating: 0
                })
                const participants_2 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_2,
                    polyDating: 0
                })

                if (participants_1 == null && participants_2) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: [{
                            _id: participants_2 == null ? "" : participants_2._id,
                            photo: participants_2.photo ? participants_2.photo[0].res : "",
                            name: participants_2 == null ? "" : participants_2.firstName
                        }]
                    }
                    allInvited.push(createdSessionUserDetail)
                } else if (participants_2 == null && participants_1) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: [{
                            _id: participants_1 == null ? "" : participants_1._id,
                            photo: participants_1.photo ? participants_1.photo[0].res : "",
                            name: participants_1 == null ? "" : participants_1.firstName
                        }]
                    }
                    allInvited.push(createdSessionUserDetail)

                } else if (participants_1 && participants_2) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: [{
                            _id: participants_1 == null ? "" : participants_1._id,
                            photo: participants_1.photo ? participants_1.photo[0].res : "",
                            name: participants_1 == null ? "" : participants_1.firstName
                        }, {
                            _id: participants_2 == null ? "" : participants_2._id,
                            photo: participants_2.photo ? participants_2.photo[0].res : "",
                            name: participants_2 == null ? "" : participants_2.firstName
                        }]
                    }
                    allInvited.push(createdSessionUserDetail)

                } else if (participants_1 == null && participants_2 == null) {
                    const createdSessionUserDetail = {
                        _id: findInvited._id,
                        cretedSessionUserId: createdSessionUser._id,
                        cretedSessionUsername: createdSessionUser.firstName,
                        isLive: findInvited.started,
                        isAbleToJoin: findInvited.started,
                        RoomType: findInvited.RoomType,
                        selectedTime: findInvited.selectedTime,
                        selectedDate: findInvited.selectedDate,
                        cretedSessionUserphoto: createdSessionUser.photo ? createdSessionUser.photo[0].res : "",
                        participants: []
                    }
                    allInvited.push(createdSessionUserDetail)
                }
            }
        }

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const data = allInvited.length;
        const pageCount = Math.ceil(data / limit);

        if (allInvited[0] == undefined) {
            res.status(status.OK).json({
                "message": "Not have any Invited!",
                "status": true,
                "code": 200,
                "statusCode": 1,
                "pageCount": 0,
                "data": []

            })
        } else {
            res.status(status.OK).json({
                "message": "successfully Show All Invited Session!",
                "status": true,
                "code": 200,
                "statusCode": 1,
                "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                "data": (startIndex).toString() == (NaN).toString() ? allInvited.sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate)) : allInvited.slice(startIndex, endIndex).sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate))

            })
        }


    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.mySession = async (req, res, next) => {
    try {

        const mySession = [];
        const findUserInsession = await sessionModel.find({
            cretedSessionUser: req.params.user_id
        })

        for (const findMySession of findUserInsession) {



            var userSessionDate = new Date(new Date(findMySession.selectedDate).toUTCString())
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

            const findUserDeatil = await userModel.findOne({
                _id: findMySession.cretedSessionUser,
                polyDating: 0
            })

            const findParticipantsiUserDeatil1 = await userModel.findOne({
                _id: findMySession.participants[0].participants_1,
                polyDating: 0
            })

            const findParticipantsiUserDeatil2 = await userModel.findOne({
                _id: findMySession.participants[0].participants_2,
                polyDating: 0
            })
            const findParticipantsiUserDeatil3 = await userModel.findOne({
                _id: findMySession.participants[0].participants_3,
                polyDating: 0
            })


            if (findMySession.sessionEndOrNot == false) {
                console.log("i am false");
                if (findUserDeatil && findParticipantsiUserDeatil1 && findParticipantsiUserDeatil2 && findParticipantsiUserDeatil3) {

                    console.log(((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)));
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        participants: [
                            {
                                _id: findParticipantsiUserDeatil1 ? findParticipantsiUserDeatil1._id : "",
                                photo: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.photo[0] ? findParticipantsiUserDeatil1.photo[0].res : "",
                                name: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.firstName
                            },
                            {
                                _id: findParticipantsiUserDeatil2 ? findParticipantsiUserDeatil2._id : "",
                                photo: findParticipantsiUserDeatil2 == null ? "" : findParticipantsiUserDeatil2.photo[0] ? findParticipantsiUserDeatil2.photo[0].res : "",
                                name: findParticipantsiUserDeatil2 == null ? " " : findParticipantsiUserDeatil2.firstName
                            },
                            {
                                _id: findParticipantsiUserDeatil3 ? findParticipantsiUserDeatil3._id : "",
                                photo: findParticipantsiUserDeatil3 == null ? " " : findParticipantsiUserDeatil3.photo[0] ? findParticipantsiUserDeatil3.photo[0].res : "",
                                name: findParticipantsiUserDeatil3 == null ? "" : findParticipantsiUserDeatil3.firstName
                            }
                        ]
                    }

                    mySession.push(response)
                } else if (findUserDeatil && findParticipantsiUserDeatil1 == null && findParticipantsiUserDeatil2 == null && findParticipantsiUserDeatil3 == null) {

                    console.log(((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)));
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        participants: []

                    }

                    mySession.push(response)
                } else if (findUserDeatil && findParticipantsiUserDeatil1 == null && findParticipantsiUserDeatil2 && findParticipantsiUserDeatil3) {
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        participants: [
                            {
                                _id: findParticipantsiUserDeatil2 ? findParticipantsiUserDeatil2._id : "",
                                photo: findParticipantsiUserDeatil2 == null ? "" : findParticipantsiUserDeatil2.photo[0] ? findParticipantsiUserDeatil2.photo[0].res : "",
                                name: findParticipantsiUserDeatil2 == null ? " " : findParticipantsiUserDeatil2.firstName
                            },
                            {
                                _id: findParticipantsiUserDeatil3 ? findParticipantsiUserDeatil3._id : "",
                                photo: findParticipantsiUserDeatil3 == null ? " " : findParticipantsiUserDeatil3.photo[0] ? findParticipantsiUserDeatil3.photo[0].res : "",
                                name: findParticipantsiUserDeatil3 == null ? "" : findParticipantsiUserDeatil3.firstName
                            }
                        ]

                    }

                    mySession.push(response)
                } else if (findUserDeatil && findParticipantsiUserDeatil1 && findParticipantsiUserDeatil2 == null && findParticipantsiUserDeatil3) {
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        participants: [
                            {
                                _id: findParticipantsiUserDeatil1 ? findParticipantsiUserDeatil1._id : "",
                                photo: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.photo[0] ? findParticipantsiUserDeatil1.photo[0].res : "",
                                name: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.firstName
                            }, {
                                _id: findParticipantsiUserDeatil3 ? findParticipantsiUserDeatil3._id : "",
                                photo: findParticipantsiUserDeatil3 == null ? " " : findParticipantsiUserDeatil3.photo[0] ? findParticipantsiUserDeatil3.photo[0].res : "",
                                name: findParticipantsiUserDeatil3 == null ? "" : findParticipantsiUserDeatil3.firstName
                            }
                        ]
                    }

                    mySession.push(response)
                } else if (findUserDeatil && findParticipantsiUserDeatil1 && findParticipantsiUserDeatil2 && findParticipantsiUserDeatil3 == null) {
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: ((days < 0 && hours >= 0 && minutes >= 0) || (days == 0 && hours == 0 && minutes == 0)) == true ? true : false,
                        participants: [
                            {
                                _id: findParticipantsiUserDeatil1 ? findParticipantsiUserDeatil1._id : "",
                                photo: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.photo[0] ? findParticipantsiUserDeatil1.photo[0].res : "",
                                name: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.firstName
                            },
                            {
                                _id: findParticipantsiUserDeatil2 ? findParticipantsiUserDeatil2._id : "",
                                photo: findParticipantsiUserDeatil2 == null ? "" : findParticipantsiUserDeatil2.photo[0] ? findParticipantsiUserDeatil2.photo[0].res : "",
                                name: findParticipantsiUserDeatil2 == null ? " " : findParticipantsiUserDeatil2.firstName
                            }
                        ]
                    }

                    mySession.push(response)
                }
            } else if (findMySession.sessionEndOrNot == true) {
                console.log("i am true");
                if (findUserDeatil && findParticipantsiUserDeatil1 && findParticipantsiUserDeatil2 && findParticipantsiUserDeatil3) {
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: false,
                        participants: [
                            {
                                _id: findParticipantsiUserDeatil1 ? findParticipantsiUserDeatil1._id : "",
                                photo: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.photo[0] ? findParticipantsiUserDeatil1.photo[0].res : "",
                                name: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.firstName
                            },
                            {
                                _id: findParticipantsiUserDeatil2 ? findParticipantsiUserDeatil2._id : "",
                                photo: findParticipantsiUserDeatil2 == null ? "" : findParticipantsiUserDeatil2.photo[0] ? findParticipantsiUserDeatil2.photo[0].res : "",
                                name: findParticipantsiUserDeatil2 == null ? " " : findParticipantsiUserDeatil2.firstName
                            },
                            {
                                _id: findParticipantsiUserDeatil3 ? findParticipantsiUserDeatil3._id : "",
                                photo: findParticipantsiUserDeatil3 == null ? " " : findParticipantsiUserDeatil3.photo[0] ? findParticipantsiUserDeatil3.photo[0].res : "",
                                name: findParticipantsiUserDeatil3 == null ? "" : findParticipantsiUserDeatil3.firstName
                            }
                        ]
                    }

                    mySession.push(response)
                } else if (findUserDeatil && findParticipantsiUserDeatil1 == null && findParticipantsiUserDeatil2 == null && findParticipantsiUserDeatil3 == null) {
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: false,
                        participants: []

                    }

                    mySession.push(response)
                } else if (findUserDeatil && findParticipantsiUserDeatil1 == null && findParticipantsiUserDeatil2 && findParticipantsiUserDeatil3) {
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: false,
                        participants: [
                            {
                                _id: findParticipantsiUserDeatil2 ? findParticipantsiUserDeatil2._id : "",
                                photo: findParticipantsiUserDeatil2 == null ? "" : findParticipantsiUserDeatil2.photo[0] ? findParticipantsiUserDeatil2.photo[0].res : "",
                                name: findParticipantsiUserDeatil2 == null ? " " : findParticipantsiUserDeatil2.firstName
                            },
                            {
                                _id: findParticipantsiUserDeatil3 ? findParticipantsiUserDeatil3._id : "",
                                photo: findParticipantsiUserDeatil3 == null ? " " : findParticipantsiUserDeatil3.photo[0] ? findParticipantsiUserDeatil3.photo[0].res : "",
                                name: findParticipantsiUserDeatil3 == null ? "" : findParticipantsiUserDeatil3.firstName
                            }
                        ]

                    }

                    mySession.push(response)
                } else if (findUserDeatil && findParticipantsiUserDeatil1 && findParticipantsiUserDeatil2 == null && findParticipantsiUserDeatil3) {
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: false,
                        participants: [
                            {
                                _id: findParticipantsiUserDeatil1 ? findParticipantsiUserDeatil1._id : "",
                                photo: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.photo[0] ? findParticipantsiUserDeatil1.photo[0].res : "",
                                name: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.firstName
                            }, {
                                _id: findParticipantsiUserDeatil3 ? findParticipantsiUserDeatil3._id : "",
                                photo: findParticipantsiUserDeatil3 == null ? " " : findParticipantsiUserDeatil3.photo[0] ? findParticipantsiUserDeatil3.photo[0].res : "",
                                name: findParticipantsiUserDeatil3 == null ? "" : findParticipantsiUserDeatil3.firstName
                            }
                        ]
                    }

                    mySession.push(response)
                } else if (findUserDeatil && findParticipantsiUserDeatil1 && findParticipantsiUserDeatil2 && findParticipantsiUserDeatil3 == null) {
                    const response = {
                        _id: findMySession._id,
                        selectedTime: findMySession.selectedTime,
                        selectedDate: findMySession.selectedDate,
                        isLive: false,
                        RoomType: findMySession.RoomType,
                        cretedSessionUserId: findUserDeatil ? findUserDeatil._id : "",
                        cretedSessionUserphoto: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                        cretedSessionUsername: findUserDeatil ? findUserDeatil.firstName : "",
                        isStart: false,
                        participants: [
                            {
                                _id: findParticipantsiUserDeatil1 ? findParticipantsiUserDeatil1._id : "",
                                photo: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.photo[0] ? findParticipantsiUserDeatil1.photo[0].res : "",
                                name: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.firstName
                            },
                            {
                                _id: findParticipantsiUserDeatil2 ? findParticipantsiUserDeatil2._id : "",
                                photo: findParticipantsiUserDeatil2 == null ? "" : findParticipantsiUserDeatil2.photo[0] ? findParticipantsiUserDeatil2.photo[0].res : "",
                                name: findParticipantsiUserDeatil2 == null ? " " : findParticipantsiUserDeatil2.firstName
                            }
                        ]
                    }

                    mySession.push(response)
                }
            }





        }
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const data = mySession.length;
        const pageCount = Math.ceil(data / limit);

        if (mySession[0] == undefined) {
            res.status(status.OK).json({
                "message": "I don't create Any Session!",
                "status": true,
                "code": 200,
                "statusCode": 1,
                "pageCount": 0,
                "data": []

            })
        } else {
            res.status(status.OK).json({
                "message": "successfully Show All My Session!",
                "status": true,
                "code": 200,
                "statusCode": 1,
                "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
                "data": (mySession).toString() == (NaN).toString() ? mySession.sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate)) : mySession.slice(startIndex, endIndex).sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate))

            })
        }
    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}


exports.endSession = async (req, res, next) => {
    try {
        const findSession = await sessionModel.findOne({
            _id: req.params.session_id
        })

        if (findSession) {

            await sessionModel.updateOne({
                _id: req.params.session_id
            }, {
                $set: {
                    sessionEndOrNot: true
                }
            })

            res.status(status.OK).json(
                new APIResponse("end session success", "true", 200, "1")
            )

        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("session not found", "true", 404, "1")
            )
        }
    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }

}



