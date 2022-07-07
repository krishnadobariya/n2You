const userModel = require("../model/user.model");
const requestModel = require("../model/requests.model");
const status = require("http-status");
const APIResponse = require("../helper/APIResponse");
const postModel = require("../model/post.model");
const { response } = require("express");

exports.sendRequest = async (req, res, next) => {
    try {

        const checkUserExist = await userModel.findOne({ email: req.params.user_email, polyDating: "Social Meida & Dating" });

        if (checkUserExist) {
            const checkRequestedEmail = await userModel.findOne({ email: req.params.requested_email, polyDating: "Social Meida & Dating" });

            if (checkRequestedEmail) {
                const emailExitInRequestedModel = await requestModel.findOne({ userEmail: req.params.user_email })

                if (!emailExitInRequestedModel) {
                    const request = requestModel({
                        userId: checkUserExist._id,
                        userEmail: req.params.user_email,
                        RequestedEmails: [{
                            requestedEmail: req.params.requested_email,
                            accepted: 2,
                            userId: checkRequestedEmail._id
                        }],

                    })

                    const saveData = await request.save();
                    res.status(status.CREATED).json(
                        new APIResponse("Request Send successfully!", true, 201, 1, saveData)
                    )
                } else {
                    const inRequested = [];
                    const allRequestedEmail = emailExitInRequestedModel.RequestedEmails
                    allRequestedEmail.map((result, index) => {

                        if (result.requestedEmail == req.params.requested_email) {
                            inRequested.push(true)
                        }
                    })
                    if (inRequested[0] == true) {
                        res.status(status.ALREADY_REPORTED).json(
                            new APIResponse("Already requesed!", "false", 208, "0")
                        )
                    } else {
                        const updatePosts = await requestModel.updateOne({ userEmail: req.params.user_email },
                            {
                                $push: {
                                    RequestedEmails: [{
                                        requestedEmail: req.params.requested_email,
                                        accepted: 2,
                                        userId: checkRequestedEmail._id
                                    }]
                                }
                            })

                        res.status(status.CREATED).json(
                            new APIResponse("Request Send successfully!", "true", 201, "1")
                        )
                    }

                }

            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found and not Social Meida & Dating type user!", "false", 404, "0")
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found and not Social Meida & Dating type user!", "false", 404, "0")
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
        const findUserInRequestModel = await requestModel.findOne({ userEmail: req.params.user_email });
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
                        profile: userDeatil.photo[0] ? userDeatil.photo[0].res : null
                    }
                    allNotAcceptedRequestes.push(response)
                }
            }

            if (allNotAcceptedRequestes[0] == undefined) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not Have any requested User!", "false", 404, "0")
                )
            } else {
                res.status(status.NOT_FOUND).json(
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
        const reqestEmail = req.params.email;


        const checkRequestEmail = await requestModel.findOne({ userId: req.params.user_id, "RequestedEmails.requestedEmail": reqestEmail });
        if (!checkRequestEmail) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Request Not Found", "false", 404, "0")
            )
        } else {
            const updatePosts = await requestModel.updateOne({ userId: req.params.user_id, "RequestedEmails.requestedEmail": reqestEmail },
                {
                    $set: {
                        "RequestedEmails.$.accepted": 1
                    }
                })

            res.status(status.OK).json(
                new APIResponse("request accepted successfully!", "true", 200, "1")
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.showPostsOnalyAcceptedPerson = async (req, res, next) => {
    try {

        const userFoundOrNot = await requestModel.findOne({ userEmail: req.params.user_email })
        if (userFoundOrNot) {
            const acceptedOrNot = await requestModel.find({ RequestedEmails: { $elemMatch: { requestedEmail: req.params.requested_email, accepted: 1 } } });

            if (acceptedOrNot[0] == undefined) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User not Found or Requested Email Not Found which is Accepted by user!", "false", 404, "0")
                )
            } else {

                const getAllPostData = await postModel.aggregate([
                    {
                        $match: {
                            email: req.params.requested_email
                        }
                    }])

                const showPost = getAllPostData;

                if (true) {
                    const finalShowPost = [];
                    showPost.map((result, index) => {
                        finalShowPost.push(result)
                    })

                    if (finalShowPost[0] == undefined) {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("User not Posted Anything", "false", 404, "0")
                        )
                    } else {
                        res.status(status.OK).json(
                            new APIResponse("Show All posts", "true", 200, "1", finalShowPost)
                        )
                    }
                }

            }

        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found!", "false", 404, "0")
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}
