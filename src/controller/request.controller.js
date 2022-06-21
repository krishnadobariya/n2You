const userModel = require("../model/user.model");
const requestModel = require("../model/requests.model");
const status = require("http-status");
const APIResponse = require("../helper/APIResponse");
const postModel = require("../model/post.model");

exports.sendRequest = async (req, res, next) => {
    try {

        const checkUserExist = await userModel.findOne({ email: req.params.userEmail });

        if (checkUserExist) {
            const checkRequestedEmail = await userModel.findOne({ email: req.params.RequestedEmail });

            if (checkRequestedEmail) {
                const emailExitInRequestedModel = await requestModel.findOne({ userEmail: req.params.userEmail })

                if (!emailExitInRequestedModel) {
                    const request = requestModel({
                        userId: checkUserExist._id,
                        userEmail: req.params.userEmail,
                        RequestedEmails: [{
                            requestedEmail: req.params.RequestedEmail,
                            accepted: 2,
                            userId: checkRequestedEmail._id
                        }],

                    })

                    const saveData = await request.save();
                    res.status(status.CREATED).json(
                        new APIResponse("Request Send successfully!", true, 201, saveData)
                    )
                } else {
                    const inRequested = [];
                    const allRequestedEmail = emailExitInRequestedModel.RequestedEmails
                    allRequestedEmail.map((result, index) => {

                        if (result.requestedEmail == req.params.RequestedEmail) {
                            inRequested.push(true)
                        }
                    })
                    if (inRequested[0] == true) {
                        res.status(status.ALREADY_REPORTED).json(
                            new APIResponse("Already requesed!", true, 208)
                        )
                    } else {
                        const updatePosts = await requestModel.updateOne({ userEmail: req.params.userEmail },
                            {
                                $push: {
                                    RequestedEmails: [{
                                        requestedEmail: req.params.RequestedEmail,
                                        accepted: 2,
                                        userId: checkRequestedEmail._id
                                    }]
                                }
                            })

                        res.status(status.CREATED).json(
                            new APIResponse("Request Send successfully!", true, 201)
                        )
                    }

                }

            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found!", false, 404)
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found!", false, 404)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}


exports.userAcceptedRequesteOrNot = async (req, res, next) => {
    try {


        const reqConfirm = req.body.accepted;
        const reqestEmail = req.params.email;


        const checkRequestEmail = await requestModel.findOne({ userId: req.params.userId, "RequestedEmails.requestedEmail": reqestEmail });
        if (!checkRequestEmail) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Request Not Found", false, 404)
            )
        } else {
            const updatePosts = await requestModel.updateOne({ userId: req.params.userId, "RequestedEmails.requestedEmail": reqestEmail },
                {
                    $set: {
                        "RequestedEmails.$.accepted": 1
                    }
                })

            res.status(status.OK).json(
                new APIResponse("request accepted successfully!", true, 200)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}

exports.showPostsOnalyAcceptedPerson = async (req, res, next) => {
    try {

        const userFoundOrNot = await requestModel.findOne({ userEmail: req.params.userEmail })
        if (userFoundOrNot) {
            const acceptedOrNot = await requestModel.find({ RequestedEmails: { $elemMatch: { requestedEmail: req.params.RequestedEmail, accepted: 1 } } });

            if (acceptedOrNot[0] == undefined) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User not Found or Requested Email Not Found which is Accepted by user!", true, 404)
                )
            } else {

                const getAllPostData = await postModel.aggregate([
                    {
                        $match: {
                            email: req.params.RequestedEmail
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
                            new APIResponse("User not Posted Anything", false, 404)
                        )
                    } else {
                        res.status(status.OK).json(
                            new APIResponse("Show All posts", true, 200, finalShowPost)
                        )
                    }
                }

            }

        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found!", false, 404)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}



