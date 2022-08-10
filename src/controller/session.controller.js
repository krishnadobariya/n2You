const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const sessionModel = require("../model/session.model");
const userModel = require("../model/user.model");
const e = require("express");

exports.sessionCreate = async (req, res, next) => {
    try {

        const createSession = sessionModel({
            selectedDate: req.body.selected_date,
            selectedTime: req.body.selected_time,
            cretedSessionUser: req.body.creted_session_user,
            participants: {
                participants_1: req.body.participants_1 ?  req.body.participants_1 : null,
                participants_2: req.body.participants_2 ?  req.body.participants_2 : null,
                participants_3: req.body.participants_3 ?  req.body.participants_3 : null,
                participants_4: req.body.participants_4 ?  req.body.participants_4 : null
            },
            RoomType: req.body.room_type
        })

        const saveData = await createSession.save();

        res.status(status.CREATED).json(
            new APIResponse("successfully Session Created!", "true", 201, "1", saveData)
        )

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
            res.status(status.NOT_FOUND).json(
                new APIResponse("Not Found Any Public Session", "false", 404, "0")
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
                const participants4Find = await userModel.findOne({
                    _id: publicSessionwithUserDetails.participants[0].participants_4,
                    polyDating: 0
                })

                const participants_1 = {
                    _id: participants1Find ? participants1Find._id : " ",
                    name: participants1Find ? participants1Find.firstName : " ",
                    profile: participants1Find ? participants1Find.photo[0] ? participants1Find.photo[0].res : " " : " ",
                }
                const participants_2 = {
                    _id: participants2Find ? participants2Find._id : " ",
                    name: participants2Find ? participants2Find.firstName : " ",
                    profile: participants2Find ? participants2Find.photo[0] ? participants2Find.photo[0].res : " " : " ",
                }
                const participants_3 = {
                    _id: participants3Find ? participants3Find._id : " ",
                    name: participants3Find ? participants3Find.firstName : " ",
                    profile: participants3Find ? participants3Find.photo[0] ? participants3Find.photo[0].res : " " : " ",
                }
                const participants_4 = {
                    _id: participants4Find ? participants4Find._id : " ",
                    name: participants4Find ? participants4Find.firstName : " ",
                    profile: participants4Find ? participants4Find.photo[0] ? participants4Find.photo[0].res : " " : " ",
                }

                const userDetail = findUser.firstName

                const sessionDetail = {
                    selectedDate: publicSessionwithUserDetails.selectedDate,
                    selectedTime: publicSessionwithUserDetails.selectedTime,
                    cretedSessionUser: publicSessionwithUserDetails.cretedSessionUser,
                    participants_1: participants_1,
                    participants_2: participants_2,
                    participants_3: participants_3,
                    participants_4: participants_4,
                }
                const response = {
                    sessionDetail,
                    userDetail
                }
                publicSession.push(response)
            }

            res.status(status.OK).json(
                new APIResponse("successfully Show All Public Session!", "true", 200, "1", publicSession)
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
                    cretedSessionUserName: createdSessionUser.firstName,
                    RoomType: findInvited.RoomType,
                    selectedTime: findInvited.selectedTime,
                    selectedDate: findInvited.selectedDate,
                    photo: createdSessionUser.photo,
                    participants: [{
                        photo: participants_2 == null ? " " : participants_2.photo[0] ? participants_2.photo[0].res : null,
                        name: participants_2 == null ? " " : participants_2.firstName
                    }, {
                        photo: participants_3 == null ? " " : participants_3.photo,
                        name: participants_3 == null ? " " : participants_3.firstName
                    }, {
                        photo: participants_4 == null ? " " : participants_4.photo,
                        name: participants_4 == null ? " " : participants_4.firstName
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
                    cretedSessionUserName: createdSessionUser.firstName,
                    RoomType: findInvited.RoomType,
                    selectedTime: findInvited.selectedTime,
                    selectedDate: findInvited.selectedDate,
                    photo: createdSessionUser.photo,
                    participants: [{
                        photo: participants_1 == null ? " " : participants_1.photo,
                        name: participants_1 == null ? " " : participants_1.firstName
                    }, {
                        photo: participants_3 == null ? " " : participants_3.photo,
                        name: participants_3 == null ? " " : participants_3.firstName
                    }, {
                        photo: participants_4 == null ? " " : participants_4.photo,
                        name: participants_4 == null ? " " : participants_4.firstName
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
                    cretedSessionUserName: createdSessionUser.firstName,
                    RoomType: findInvited.RoomType,
                    selectedTime: findInvited.selectedTime,
                    selectedDate: findInvited.selectedDate,
                    photo: createdSessionUser.photo,
                    participants: [{
                        photo: participants_1 == null ? " " : participants_1.photo,
                        name: participants_1 == null ? " " : participants_1.firstName
                    }, {
                        photo: participants_2 == null ? " " : participants_2.photo,
                        name: participants_2 == null ? " " : participants_2.firstName
                    }, {
                        photo: participants_4 == null ? " " : participants_4.photo,
                        name: participants_4 == null ? " " : participants_4.firstName
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
                    cretedSessionUserName: createdSessionUser.firstName,
                    RoomType: findInvited.RoomType,
                    selectedTime: findInvited.selectedTime,
                    selectedDate: findInvited.selectedDate,
                    photo: createdSessionUser.photo[0] ? createdSessionUser.photo[0].res : null,
                    participants: [{
                        photo: participants_1 == null ? " " : participants_1.photo,
                        name: participants_1 == null ? " " : participants_1.firstName
                    }, {
                        photo: participants_2 == null ? " " : participants_2.photo,
                        name: participants_2 == null ? " " : participants_2.firstName
                    }, {
                        photo: participants_3 == null ? " " : participants_3.photo,
                        name: participants_3 == null ? " " : participants_3.firstName
                    }]
                }
                allInvited.push(createdSessionUserDetail)
            }
        }

        if (allInvited[0] == undefined) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Not have any Invited!", "false", 404, "0")
            )
        } else {
            res.status(status.OK).json(
                new APIResponse("successfully Show All Invited Session!", "true", 200, "1", allInvited)
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
            const findParticipantsiUserDeatil4 = await userModel.findOne({
                _id: findMySession.participants[0].participants_4,
                polyDating: 0
            })

            console.log("findUserDeatil", findUserDeatil);
            const response = {
                selectedTime: findMySession.selectedTime,
                selectedDate: findMySession.selectedDate,
                RoomType: findMySession.RoomType,
                cretedSessionUser: {
                    photo: findUserDeatil.photo[0] ? findUserDeatil.photo[0].res : null,
                    name: findUserDeatil.firstName
                },
                participants_1: {
                    photo: findParticipantsiUserDeatil1 == null ? " " : findParticipantsiUserDeatil1.photo[0] ? findParticipantsiUserDeatil1.photo[0].res : " ",
                    name: findParticipantsiUserDeatil1 == null ? " " : findParticipantsiUserDeatil1.firstName
                },
                participants_2: {
                    photo: findParticipantsiUserDeatil2 == null ? " " : findParticipantsiUserDeatil2.photo[0] ? findParticipantsiUserDeatil2.photo[0].res : " ",
                    name: findParticipantsiUserDeatil2 == null ? " " : findParticipantsiUserDeatil2.firstName
                },
                participants_3: {
                    photo: findParticipantsiUserDeatil3 == null ? " " : findParticipantsiUserDeatil3.photo[0] ? findParticipantsiUserDeatil3.photo[0].res : " ",
                    name: findParticipantsiUserDeatil3 == null ? " " : findParticipantsiUserDeatil3.firstName
                },
                participants_4: {
                    photo: findParticipantsiUserDeatil4 == null ? " " : findParticipantsiUserDeatil4.photo[0] ? findParticipantsiUserDeatil4.photo[0].res : " ",
                    name: findParticipantsiUserDeatil4 == null ? " " : findParticipantsiUserDeatil4.firstName
                }
            }

            mySession.push(response)

        }


        if (mySession[0] == undefined) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("I don't create Any Session!", "false", 404, "0")
            )
        } else {
            res.status(status.OK).json(
                new APIResponse("successfully Show All My Session!", "true", 200, "1", mySession)
            )
        }

    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}



