const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const sessionModel = require("../model/session.model");
const userModel = require("../model/user.model");
const e = require("express");
const notificationModel = require("../model/polyamorous/notification.model");
const requestsModel = require("../model/requests.model");
const { default: mongoose } = require("mongoose");

exports.sessionCreate = async (req, res, next) => {
    try {

        const findUserInUserModel = await userModel.findOne({
            _id: req.body.creted_session_user
        })

        if (findUserInUserModel) {

            const date = new Date(req.body.selected_date)
            let dates = date.getDate();
            let month = date.toLocaleString('en-us', { month: 'long' });
            let year = date.getFullYear();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes.toString().padStart(2, '0');
            let strTime = hours + ' ' + ampm;
            let timeSession = 'At' + ' ' + hours + ':' + minutes + ' ' + ampm + ' ' + 'on' + ' ' + month + ' ' + dates + ',' + year;
            const createSession = sessionModel({
                selectedDate: req.body.selected_date,
                selectedTime: strTime,
                cretedSessionUser: req.body.creted_session_user,
                participants: {
                    participants_1: req.body.participants_1 ? req.body.participants_1 : null,
                    participants_2: req.body.participants_2 ? req.body.participants_2 : null,
                    participants_3: req.body.participants_3 ? req.body.participants_3 : null,
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
                if (p1 != "") {
                    invitedUsers.push(mongoose.Types.ObjectId(req.body.participants_1))
                }
                if (p2 != "") {
                    invitedUsers.push(mongoose.Types.ObjectId(req.body.participants_2))
                }
                if (p3 != "") {
                    invitedUsers.push(mongoose.Types.ObjectId(req.body.participants_3))
                }


                for (const notification of allRequestedEmails) {
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


                if (p1 != "") {
                    allRequestedEmails.push(mongoose.Types.ObjectId(req.body.participants_1))
                }
                if (p2 != "") {
                    allRequestedEmails.push(mongoose.Types.ObjectId(req.body.participants_2))
                }
                if (p3 != "") {
                    allRequestedEmails.push(mongoose.Types.ObjectId(req.body.participants_3))
                }


                for (const notification of allRequestedEmails) {
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
            res.status(status.OK).json(
                new APIResponse("Not Found Any Public Session", "true", 200, "1")
            )
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

                const userDetail = findUser.firstName

                const sessionDetail = {
                    _id: findUser._id,
                    name: userDetail,
                    selectedDate: publicSessionwithUserDetails.selectedDate,
                    selectedTime: publicSessionwithUserDetails.selectedTime,
                    cretedSessionUser: publicSessionwithUserDetails.cretedSessionUser,
                    roomType: publicSessionwithUserDetails.RoomType,
                    detail: publicSessionwithUserDetails.isLive == "true" ? "100 people joined" : "12 Jan 2020 12:00 PM",
                    isLive: publicSessionwithUserDetails.isLive,
                    participants_1: participants_1,
                    participants_2: participants_2,
                    participants_3: participants_3,
                }
                const response = {
                    sessionDetail
                }
                publicSession.push(response)
            }

            const page = parseInt(req.query.page)
            const limit = parseInt(req.query.limit)
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;

            res.status(status.OK).json(
                new APIResponse("successfully Show All Public Session!", "true", 200, "1", publicSession.slice(startIndex, endIndex).sort((a, b) => new Date(a.sessionDetail.selectedDate) - new Date(b.sessionDetail.selectedDate)))
            )


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


                const participants_4 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_4,
                    polyDating: 0
                })

                const createdSessionUserDetail = {
                    _id: createdSessionUser._id,
                    cretedSessionUserName: createdSessionUser.firstName,
                    RoomType: findInvited.RoomType,
                    isLive: findInvited.isLive,
                    selectedTime: findInvited.selectedTime,
                    selectedDate: findInvited.selectedDate,
                    photo: createdSessionUser.photo[0] ? createdSessionUser.photo[0].res : "",
                    participants: [{
                        _id: participants_2 == null ? "" : participants_2._id,
                        photo: participants_2 == null ? "" : participants_2.photo[0] ? participants_2.photo[0].res : "",
                        name: participants_2 == null ? "" : participants_2.firstName
                    }, {
                        _id: participants_3 == null ? "" : participants_2._id,
                        photo: participants_3 == null ? "" : participants_3.photo,
                        name: participants_3 == null ? "" : participants_3.firstName
                    }, {
                        _id: participants_4 == null ? "" : participants_2._id,
                        photo: participants_4 == null ? "" : participants_4.photo,
                        name: participants_4 == null ? "" : participants_4.firstName
                    }]
                }
                allInvited.push(createdSessionUserDetail)
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


                const participants_4 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_4,
                    polyDating: 0
                })

                const createdSessionUserDetail = {
                    _id: createdSessionUser._id,
                    cretedSessionUserName: createdSessionUser.firstName,
                    RoomType: findInvited.RoomType,
                    isLive: findInvited.isLive,
                    selectedTime: findInvited.selectedTime,
                    selectedDate: findInvited.selectedDate,
                    photo: createdSessionUser.photo[0] ? createdSessionUser.photo[0].res : "",
                    participants: [{
                        _id: participants_1 == null ? "" : participants_1._id,
                        photo: participants_1 == null ? "" : participants_1.photo,
                        name: participants_1 == null ? "" : participants_1.firstName
                    }, {
                        _id: participants_3 == null ? "" : participants_3._id,
                        photo: participants_3 == null ? "" : participants_3.photo,
                        name: participants_3 == null ? "" : participants_3.firstName
                    }, {
                        _id: participants_4 == null ? "" : participants_4._id,
                        photo: participants_4 == null ? "" : participants_4.photo,
                        name: participants_4 == null ? "" : participants_4.firstName
                    }]
                }
                allInvited.push(createdSessionUserDetail)
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
                const participants_4 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_4,
                    polyDating: 0
                })

                const createdSessionUserDetail = {
                    _id: createdSessionUser._id,
                    cretedSessionUserName: createdSessionUser.firstName,
                    isLive: findInvited.isLive,
                    RoomType: findInvited.RoomType,
                    selectedTime: findInvited.selectedTime,
                    selectedDate: findInvited.selectedDate,
                    photo: createdSessionUser.photo[0] ? createdSessionUser.photo[0].res : "",
                    participants: [{
                        _id: participants_1 == null ? "" : participants_1._id,
                        photo: participants_1 == null ? "" : participants_1.photo,
                        name: participants_1 == null ? "" : participants_1.firstName
                    }, {
                        _id: participants_2 == null ? "" : participants_2._id,
                        photo: participants_2 == null ? "" : participants_2.photo,
                        name: participants_2 == null ? "" : participants_2.firstName
                    }, {
                        _id: participants_4 == null ? "" : participants_4._id,
                        photo: participants_4 == null ? "" : participants_4.photo,
                        name: participants_4 == null ? "" : participants_4.firstName
                    }]
                }
                allInvited.push(createdSessionUserDetail)
            } else if (findInvited.participants[0].participants_4 == req.params.user_id) {
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
                const participants_3 = await userModel.findOne({
                    _id: findInvited.participants[0].participants_3,
                    polyDating: 0
                })

                const createdSessionUserDetail = {
                    _id: createdSessionUser._id,
                    cretedSessionUserName: createdSessionUser.firstName,
                    RoomType: findInvited.RoomType,
                    isLive: findInvited.isLive,
                    selectedTime: findInvited.selectedTime,
                    selectedDate: findInvited.selectedDate,
                    photo: createdSessionUser.photo[0] ? createdSessionUser.photo[0].res : "",
                    participants: [{
                        _id: participants_1 == null ? "" : participants_1._id,
                        photo: participants_1 == null ? "" : participants_1.photo,
                        name: participants_1 == null ? "" : participants_1.firstName
                    }, {
                        _id: participants_2 == null ? "" : participants_2._id,
                        photo: participants_2 == null ? "" : participants_2.photo,
                        name: participants_2 == null ? "" : participants_2.firstName
                    }, {
                        _id: participants_3 == null ? "" : participants_3._id,
                        photo: participants_3 == null ? "" : participants_3.photo,
                        name: participants_3 == null ? "" : participants_3.firstName
                    }]
                }
                allInvited.push(createdSessionUserDetail)
            }
        }

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;


        if (allInvited[0] == undefined) {
            res.status(status.OK).json(
                new APIResponse("Not have any Invited!", "true", 200, "1")
            )
        } else {
            res.status(status.OK).json(
                new APIResponse("successfully Show All Invited Session!", "true", 200, "1", allInvited.slice(startIndex, endIndex).sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate)))
            )
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

            const response = {
                _id: findMySession._id,
                selectedTime: findMySession.selectedTime,
                selectedDate: findMySession.selectedDate,
                isLive: findMySession.isLive,
                RoomType: findMySession.RoomType,
                cretedSessionUser: {
                    _id: findUserDeatil ? findUserDeatil._id : "",
                    photo: findUserDeatil.photo ? findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : "" : "",
                    name: findUserDeatil ? findUserDeatil.firstName : ""
                },
                participants_1: {
                    _id: findParticipantsiUserDeatil1 ? findParticipantsiUserDeatil1._id : "",
                    photo: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.photo[0] ? findParticipantsiUserDeatil1.photo[0].res : "",
                    name: findParticipantsiUserDeatil1 == null ? "" : findParticipantsiUserDeatil1.firstName
                },
                participants_2: {
                    _id: findParticipantsiUserDeatil2 ? findParticipantsiUserDeatil2._id : "",
                    photo: findParticipantsiUserDeatil2 == null ? "" : findParticipantsiUserDeatil2.photo[0] ? findParticipantsiUserDeatil2.photo[0].res : "",
                    name: findParticipantsiUserDeatil2 == null ? " " : findParticipantsiUserDeatil2.firstName
                },
                participants_3: {
                    _id: findParticipantsiUserDeatil3 ? findParticipantsiUserDeatil3._id : "",
                    photo: findParticipantsiUserDeatil3 == null ? " " : findParticipantsiUserDeatil3.photo[0] ? findParticipantsiUserDeatil3.photo[0].res : "",
                    name: findParticipantsiUserDeatil3 == null ? "" : findParticipantsiUserDeatil3.firstName
                }

            }

            mySession.push(response)

        }
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;


        if (mySession[0] == undefined) {
            res.status(status.OK).json(
                new APIResponse("I don't create Any Session!", "true", 200, "1")
            )
        } else {
            res.status(status.OK).json(
                new APIResponse("successfully Show All My Session!", "true", 200, "1", mySession.slice(startIndex, endIndex).sort((a, b) => new Date(a.selectedDate) - new Date(b.selectedDate)))
            )
        }

    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}



