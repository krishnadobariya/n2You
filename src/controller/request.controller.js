const userModel = require("../model/user.model");
const requestModel = require("../model/requests.model");
const status = require("http-status");
const APIResponse = require("../helper/APIResponse");
const postModel = require("../model/post.model");
const notificationModel = require("../model/polyamorous/notification.model");
const chatRoomModel = require("../webSocket/models/chatRoom.model");

exports.sendRequest = async (req, res, next) => {
    try {

        const checkUserExist = await userModel.findOne({ _id: req.params.user_id, polyDating: 0 });
        const checkRequestedEmail = await userModel.findOne({ _id: req.params.requested_id, polyDating: 0 })

        if (checkUserExist && checkRequestedEmail) {

            if (checkRequestedEmail) {
                const emailExitInRequestedModel = await requestModel.findOne({ userId: req.params.user_id })

                const emailExitInRequestedModel1 = await requestModel.findOne({ userId: req.params.requested_id })


                if (!emailExitInRequestedModel) {
                    const request = requestModel({
                        userId: checkUserExist._id,
                        userEmail: checkUserExist.email,
                        RequestedEmails: [{
                            requestedEmail: checkRequestedEmail.email,
                            accepted: 2,
                            userId: checkRequestedEmail._id
                        }],

                    })

                    const saveData = await request.save();

                    const findUserInNotification = await notificationModel.findOne({
                        userId: checkRequestedEmail._id
                    })

                    if (findUserInNotification) {
                        await notificationModel.updateOne({
                            userId: checkRequestedEmail._id
                        }, {
                            $push: {
                                notifications: {
                                    notifications: `${checkUserExist.firstName} request to follow you`,
                                    userId: checkUserExist._id,
                                    status: 1
                                }
                            }
                        })
                    } else {

                        const data = notificationModel({
                            userId: checkRequestedEmail._id,
                            notifications: {
                                notifications: `${checkUserExist.firstName} request to follow you`,
                                userId: checkUserExist._id,
                                status: 1
                            }
                        })

                        await data.save();
                    }



                    if (!emailExitInRequestedModel1) {



                        const request = requestModel({
                            userId: checkRequestedEmail._id,
                            userEmail: checkRequestedEmail.email,
                            RequestedEmails: [{
                                requestedEmail: checkUserExist.email,
                                accepted: 2,
                                userId: checkUserExist._id
                            }],

                        })

                        const saveData = await request.save();

                    } else {


                        const inRequested = [];
                        const allRequestedEmail = emailExitInRequestedModel1.RequestedEmails
                        allRequestedEmail.map((result, index) => {

                            if (result.requestedEmail == checkUserExist.email) {
                                inRequested.push(true)
                            }
                        })
                        if (inRequested[0] == true) {

                        } else {
                            const updatePosts = await requestModel.updateOne({ userId: emailExitInRequestedModel1.userId },
                                {
                                    $push: {
                                        RequestedEmails: [{
                                            requestedEmail: checkUserExist.email,
                                            accepted: 2,
                                            userId: checkUserExist._id
                                        }]
                                    }
                                })
                        }

                    }
                    res.status(status.CREATED).json(
                        new APIResponse("Request Send successfully!", true, 201, 1)
                    )
                } else {
                    const inRequested = [];
                    const allRequestedEmail = emailExitInRequestedModel.RequestedEmails
                    allRequestedEmail.map((result, index) => {

                        if (result.requestedEmail == checkRequestedEmail.email) {
                            inRequested.push(true)
                        }
                    })

                    if (!emailExitInRequestedModel1) {

                        const request = requestModel({
                            userId: checkRequestedEmail._id,
                            userEmail: checkRequestedEmail.email,
                            RequestedEmails: [{
                                requestedEmail: checkUserExist.email,
                                accepted: 2,
                                userId: checkUserExist._id
                            }],
                        })

                        const saveData = await request.save();

                    } else {
                        const inRequested = [];

                        const allRequestedEmail = emailExitInRequestedModel1.RequestedEmails
                        allRequestedEmail.map((result, index) => {

                            if (result.requestedEmail == checkUserExist.email) {
                                inRequested.push(true)
                            }
                        })
                        if (inRequested[0] == true) {

                        } else {
                            const updatePosts = await requestModel.updateOne({ userId: emailExitInRequestedModel1.userId },
                                {
                                    $push: {
                                        RequestedEmails: [{
                                            requestedEmail: checkUserExist.email,
                                            accepted: 2,
                                            userId: checkUserExist._id
                                        }]
                                    }
                                })
                        }

                    }
                    if (inRequested[0] == true) {
                        res.status(status.ALREADY_REPORTED).json(
                            new APIResponse("Already requesed!", "false", 208, "0")
                        )
                    } else {
                        const updatePosts = await requestModel.updateOne({ userId: req.params.user_id },
                            {
                                $push: {
                                    RequestedEmails: [{
                                        requestedEmail: checkRequestedEmail.email,
                                        accepted: 2,
                                        userId: checkRequestedEmail._id
                                    }]
                                }
                            })
                        const findUserInNotification = await notificationModel.findOne({
                            userId: checkRequestedEmail._id
                        })
                        if (findUserInNotification) {
                            await notificationModel.updateOne({
                                userId: checkRequestedEmail._id
                            }, {
                                $push: {
                                    notifications: {
                                        notifications: `${checkUserExist.firstName} request to follow you`,
                                        userId: checkUserExist._id,
                                        status: 1
                                    }
                                }
                            })
                        } else {
                            const data = notificationModel({
                                userId: checkRequestedEmail._id,
                                notifications: {
                                    notifications: `${checkUserExist.firstName} request to follow you`,
                                    userId: checkUserExist._id,
                                    status: 1
                                }
                            })

                            await data.save();
                        }
                        res.status(status.CREATED).json(
                            new APIResponse("Request Send successfully!", "true", 201, "1")
                        )
                    }

                }

            } else {


            }
        } else {

            res.status(status.NOT_FOUND).json(
                new APIResponse("not found", "false", 404, "0")
            )

        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.getRequestUserWise = async (req, res, next) => {
    try {
        const allNotAcceptedRequestes = [];
        const findUserInRequestModel = await requestModel.findOne({ userId: req.params.user_id });
        if (findUserInRequestModel == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found!", "false", 404, "0")
            )
        } else {
            const RequestEmail = findUserInRequestModel.RequestedEmails;
            const Requests = [];
            for (const allRequestEmail of RequestEmail) {
                const finalResponse = {
                    RequestEmail: allRequestEmail.requestedEmail,
                    accepted: allRequestEmail.accepted
                }
                Requests.push(finalResponse)
            }

            for (const notAcceptedRequest of Requests) {
                const userDeatil = await userModel.findOne({
                    email: notAcceptedRequest.RequestEmail
                });

                if (notAcceptedRequest.accepted == 2) {
                    const response = {
                        id: userDeatil._id,
                        requestUser: notAcceptedRequest.RequestEmail,
                        name: userDeatil.firstName,
                        profile: userDeatil.photo ? userDeatil.photo[0].res : ""
                    }
                    allNotAcceptedRequestes.push(response)
                }
            }

            if (allNotAcceptedRequestes[0] == undefined) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not Have any requested User!", "false", 404, "0")
                )
            } else {
                res.status(status.CREATED).json(
                    new APIResponse("All Reuested User", "true", 200, "1", allNotAcceptedRequestes)
                )
            }

        }


    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.userAcceptedRequesteOrNot = async (req, res, next) => {
    try {


        const reqConfirm = req.body.accepted;
        const reqestId = req.params.id;


        console.log("req.params.user_id", req.params.user_id);
        console.log("reqestId", reqestId);
        const checkRequestEmail = await requestModel.findOne({ userId: req.params.user_id, "RequestedEmails.userId": reqestId });
        console.log("checkRequestEmail", checkRequestEmail);
        if (!checkRequestEmail) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Request Not Found", "false", 404, "0")
            )
        } else {

            if (req.body.accepted == 1) {
                const updatePosts = await requestModel.updateOne({ userId: req.params.user_id, "RequestedEmails.userId": reqestId },
                    {
                        $set: {
                            "RequestedEmails.$.accepted": req.body.accepted
                        }
                    })

                console.log("reqestId", reqestId);

                const updatePosts1 = await requestModel.updateOne({ userId: reqestId, "RequestedEmails.userId": req.params.user_id },
                    {
                        $set: {
                            "RequestedEmails.$.accepted": req.body.accepted
                        }
                    })


                const addChat = chatRoomModel({
                    user1: req.params.user_id,
                    user2: reqestId
                })

                await addChat.save()

                const findUserWhichAcceptRequest = await userModel.findOne({
                    _id: req.params.user_id
                })

                const findUser = await userModel.findOne({
                    _id: reqestId
                })

                const findUser1InNotiofication = await notificationModel.findOne({
                    userId: findUserWhichAcceptRequest._id
                })
                const findUserInNotiofication = await notificationModel.findOne({
                    userId: findUser._id
                })

                if (findUserInNotiofication) {
                    await notificationModel.updateOne({
                        userId: findUser._id
                    }, {
                        $push: {
                            notifications: {
                                notifications: `${findUserWhichAcceptRequest.firstName}, ${findUser.firstName} both are become friend`,
                                userId: findUserWhichAcceptRequest._id,
                                status: 2
                            }
                        }
                    })
                } else {
                    const data = notificationModel({
                        userId: findUser._id,
                        notifications: {
                            notifications: `${findUserWhichAcceptRequest.firstName}, ${findUser.firstName} both are become friend`,
                            userId: findUserWhichAcceptRequest._id,
                            status: 2
                        }
                    })

                    await data.save();
                }

                if (findUser1InNotiofication) {
                    await notificationModel.updateOne({
                        userId: findUserWhichAcceptRequest._id
                    }, {
                        $push: {
                            notifications: {
                                notifications: `${findUser.firstName}, ${findUserWhichAcceptRequest.firstName} both are become friend`,
                                userId: findUser._id,
                                status: 2
                            }
                        }
                    })
                } else {
                    const data = notificationModel({
                        userId: findUser._id,
                        notifications: {
                            notifications: `${findUser.firstName}, ${findUserWhichAcceptRequest.firstName}  both are become friend`,
                            userId: findUser._id,
                            status: 2
                        }
                    })

                    await data.save();
                }



                res.status(status.OK).json(
                    new APIResponse("request accepted successfully!", "true", 200, "1")
                )
            } else {
                const updatePosts = await requestModel.updateOne({ userId: req.params.user_id, "RequestedEmails.userId": reqestId },
                    {
                        $set: {
                            "RequestedEmails.$.accepted": req.body.accepted
                        }
                    })



                const updatePosts1 = await requestModel.updateOne({ userId: reqestId, "RequestedEmails.userId": req.params.user_id },
                    {
                        $set: {
                            "RequestedEmails.$.accepted": req.body.accepted
                        }
                    })

                const findUserWhichAcceptRequest = await userModel.findOne({
                    _id: req.params.user_id
                })

                const findUser = await userModel.findOne({
                    _id: reqestId
                })

                const findUser1InNotiofication = await notificationModel.findOne({
                    userId: findUserWhichAcceptRequest._id
                })
                const findUserInNotiofication = await notificationModel.findOne({
                    userId: findUser._id
                })

                if (findUserInNotiofication) {
                    await notificationModel.updateOne({
                        userId: findUser._id
                    }, {
                        $push: {
                            notifications: {
                                notifications: `${findUser.firstName}, ${findUserWhichAcceptRequest.firstName} both are not become friend`,
                                userId: findUserWhichAcceptRequest._id,
                                status: 3
                            }
                        }
                    })
                } else {
                    const data = notificationModel({
                        userId: findUser._id,
                        notifications: {
                            notifications: `${findUser.firstName}, ${findUserWhichAcceptRequest.firstName} both are not become friend`,
                            userId: findUserWhichAcceptRequest._id,
                            status: 3
                        }
                    })

                    await data.save();
                }


                if (findUser1InNotiofication) {
                    await notificationModel.updateOne({
                        userId: findUserWhichAcceptRequest._id
                    }, {
                        $push: {
                            notifications: {
                                notifications: `${findUser.firstName}, ${findUserWhichAcceptRequest.firstName} both are not become friend`,
                                userId: findUser._id,
                                status: 3
                            }
                        }
                    })
                } else {
                    const data = notificationModel({
                        userId: findUserWhichAcceptRequest._id,
                        notifications: {
                            notifications: `${findUser.firstName}, ${findUserWhichAcceptRequest.firstName} both are not become friend`,
                            userId: findUser._id,
                            status: 3
                        }
                    })

                    await data.save();
                }
                res.status(status.OK).json(
                    new APIResponse("request rejected successfully!", "true", 200, "1")
                )
            }

        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

// exports.showPostsOnalyAcceptedPerson = async (req, res, next) => {
//     try {

//         const userFoundOrNot = await requestModel.findOne({ userEmail: req.params.user_email })
//         if (userFoundOrNot) {
//             const acceptedOrNot = await requestModel.find({ RequestedEmails: { $elemMatch: { requestedEmail: req.params.requested_email, accepted: 1 } } });

//             if (acceptedOrNot[0] == undefined) {
//                 res.status(status.NOT_FOUND).json(
//                     new APIResponse("User not Found or Requested Email Not Found which is Accepted by user!", "false", 404, "0")
//                 )
//             } else {

//                 const getAllPostData = await postModel.aggregate([
//                     {
//                         $match: {
//                             email: req.params.requested_email
//                         }
//                     }])

//                 const showPost = getAllPostData;

//                 if (true) {
//                     const finalShowPost = [];
//                     showPost.map((result, index) => {
//                         finalShowPost.push(result)
//                     })

//                     if (finalShowPost[0] == undefined) {
//                         res.status(status.NOT_FOUND).json(
//                             new APIResponse("User not Posted Anything", "false", 404, "0")
//                         )
//                     } else {
//                         res.status(status.OK).json(
//                             new APIResponse("Show All posts", "true", 200, "1", finalShowPost)
//                         )
//                     }
//                 }

//             }

//         } else {
//             res.status(status.NOT_FOUND).json(
//                 new APIResponse("User Not Found!", "false", 404, "0")
//             )
//         }

//     } catch (error) {
//         console.log("Error:", error);
//         res.status(status.INTERNAL_SERVER_ERROR).json(
//             new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
//         )
//     }
// }
