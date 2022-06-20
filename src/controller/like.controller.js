const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const postModel = require("../model/post.model");
const likeModel = require("../model/like.model");
const requestsModel = require("../model/requests.model");
const userModel = require("../model/user.model");
const { default: mongoose } = require("mongoose");

exports.LikeOrDislikeInUserPost = async (req, res, next) => {
    try {

        const userFindInPostModel = await postModel.findOne({ userId: req.params.UserId });

        if (userFindInPostModel) {
            const postFindInPostModel = await postModel.findOne({ userId: req.params.UserId, "posts._id": req.params.PostId });

            if (postFindInPostModel) {
                console.log(req.params.Value);
                if (req.params.Value == 1) {
                    const data = await postModel.updateOne({ "posts._id": req.params.PostId }, { $inc: { "posts.$.like": 1 } });

                    const checkUserInLike = await likeModel.findOne({ reqUserId: req.params.reqUserId, postId: req.params.PostId });
                    console.log(checkUserInLike);
                    if (checkUserInLike == null) {
                        const InsertIntoLikeTable = likeModel({
                            userId: req.params.UserId,
                            reqUserId: req.params.reqUserId,
                            postId: req.params.PostId
                        });

                        await InsertIntoLikeTable.save();

                        res.status(status.CREATED).json(
                            new APIResponse("Like Added", true, 201)
                        );
                    } else {
                        res.status(status.CREATED).json(
                            new APIResponse("Already Liked Post", true, 201)
                        );
                    }

                } else {
                    await postModel.updateOne({ "posts._id": req.params.PostId }, { $inc: { "posts.$.like": -1 } });

                    const checkUserInLike = await likeModel.findOne({ userId: req.params.reqUserId });
                    if (checkUserInLike) {

                        await likeModel.deleteOne({ userId: req.params.reqUserId });
                        res.status(status.OK).json(
                            new APIResponse("First Time Like Or Second Time Dislike , Like Not Added", true, 200)
                        );

                    } else {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("First Time Not Like , Like Not Added", false, 404)
                        );
                    }
                }
            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Post Not Found", false, 404)
                );
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not Found", false, 404)
            );
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}


exports.showAllUserWhichIsLikePost = async (req, res, next) => {
    try {

        const findUserWichIsLikePost = await likeModel.find({ postId: req.params.PostId });

        if (findUserWichIsLikePost[0] == undefined) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("post not Found", false, 404)
            );

        } else {


            // all user which is liked post
            const allRequestedId = [];

            for (const findAllRequestedEmail of findUserWichIsLikePost) {

                allRequestedId.push((findAllRequestedEmail.reqUserId).toString());
            }
            console.log("allRequestedId", allRequestedId);




            const RequestedEmailExiestInUser = await requestsModel.find(
                {
                    userId: req.params.userId,
                    RequestedEmails: {
                        $elemMatch: {
                            userId: {
                                $in: allRequestedId
                            }
                        }
                    }
                }
            )



            const emailGet = [];

            for (const emailExist of RequestedEmailExiestInUser) {

                console.log("emailExist", emailExist);
                for (const getEmail of emailExist.RequestedEmails) {
                    emailGet.push((getEmail.userId).toString())
                }
            }

            console.log("emailGet", emailGet);
            console.log("allRequestedId", allRequestedId);
            var difference = allRequestedId.filter(x => emailGet.indexOf(x) === -1);

            const UniqueId = [];
            for (const uniqueId of difference) {
                const userDetail = await userModel.findOne({ _id: mongoose.Types.ObjectId(uniqueId) });
                console.log("userDetail", userDetail);
                const response = {
                    _id: uniqueId,
                    email: userDetail.email,
                    firstName: userDetail.firstName,
                    status: 3
                }

                UniqueId.push(response);
            }


            console.log("UniqueId", UniqueId);

            if (RequestedEmailExiestInUser[0] == undefined) {
                const responseData = [];
                for (const allrequestedDataNotAcceptedRequestAndNotFriend of allRequestedId) {
                    const userDetail = await userModel.findOne({ _id: mongoose.Types.ObjectId(allrequestedDataNotAcceptedRequestAndNotFriend) });
                    const response = {
                        _id: allrequestedDataNotAcceptedRequestAndNotFriend,
                        email: userDetail.email,
                        firstName: userDetail.firstName,
                        status: 3
                    }

                    responseData.push(response);
                }
                res.status(status.NOT_FOUND).json(
                    new APIResponse("not user friend and not requested", true, 200, responseData)
                )
            } else {

                console.log("RequestedEmailExiestInUser", RequestedEmailExiestInUser);
                const statusByEmail = [];
                const allRequestedEmail = RequestedEmailExiestInUser[0].RequestedEmails;
                const requestedEmailWitchIsInuserRequeted = [];
                allRequestedEmail.map((result, next) => {
                    const resultEmail = result.userId
                    console.log("resultEmail", resultEmail);
                    requestedEmailWitchIsInuserRequeted.push(resultEmail);
                });

                console.log("requestedEmailWitchIsInuserRequeted", requestedEmailWitchIsInuserRequeted);

                const meageAllTable = await userModel.aggregate([{
                    $match: {
                        _id: {
                            $in: requestedEmailWitchIsInuserRequeted
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'posts',
                        localField: 'email',
                        foreignField: 'email',
                        as: 'req_data'
                    }
                },
                {
                    $lookup: {
                        from: 'requests',
                        let: {

                            userId: mongoose.Types.ObjectId(req.params.userId),
                            email: "$email"
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [
                                            {
                                                $eq: [
                                                    "$userId", "$$userId"
                                                ]
                                            },
                                            {
                                                $in:
                                                    [
                                                        "$$email", "$RequestedEmails.requestedEmail"
                                                    ]
                                            }
                                        ]
                                    }
                                }
                            },
                        ],
                        as: 'form_data'
                    }
                },
                {
                    $project: {
                        polyDating: "$polyDating",
                        HowDoYouPoly: "$HowDoYouPoly",
                        loveToGive: "$loveToGive",
                        polyRelationship: "$polyRelationship",
                        firstName: "$firstName",
                        email: "$email",
                        firstName: "$firstName",
                        relationshipSatus: "$relationshipSatus",
                        Bio: "$Bio",
                        hopingToFind: "$hopingToFind",
                        jobTitle: "$jobTitle",
                        wantChildren: "$wantChildren",
                        result: "$form_data.RequestedEmails",
                    }
                }])



                console.log("meageAllTable", meageAllTable);

                const finalExistUser = [];

                const emailDataDetail = meageAllTable;
                for (const DataDetail of emailDataDetail) {
                    for (const reqEmail of allRequestedId) {
                        if ((DataDetail._id).toString() == reqEmail.toString()) {
                            finalExistUser.push(DataDetail)
                        }
                    }
                }

                console.log("finalExistUser", finalExistUser);

                for (const emailData of finalExistUser[0].result) {

                    for (const requestEmail of emailData) {

                        for (const meageAllTableEmail of finalExistUser) {

                            if (requestEmail.requestedEmail == meageAllTableEmail.email) {

                                console.log("requestEmail", requestEmail);
                                if (requestEmail.accepted == 1) {
                                    var status1 = {
                                        status: 1,
                                        email: requestEmail.requestedEmail
                                    }
                                    statusByEmail.push(status1)
                                } else {
                                    var status2 = {
                                        status: 2,
                                        email: requestEmail.requestedEmail
                                    }
                                    statusByEmail.push(status2)
                                }
                            }
                        }
                    }
                }

                const final_data = [];

                const finalStatus = []
                for (const [key, finalData] of meageAllTable.entries()) {
                    for (const [key, final1Data] of statusByEmail.entries())
                        if (finalData.email === final1Data.email) {
                            finalStatus.push(final1Data.status)
                        }
                }
                for (const [key, finalData] of finalExistUser.entries()) {

                    const response = {
                        _id: finalData._id,
                        // polyDating: finalData.polyDating,
                        // HowDoYouPoly: finalData.HowDoYouPoly,
                        // loveToGive: finalData.loveToGive,
                        // polyRelationship: finalData.polyRelationship,
                        firstName: finalData.firstName,
                        email: finalData.email,
                        // relationshipSatus: finalData.relationshipSatus,
                        // Bio: finalData.Bio,
                        // hopingToFind: finalData.hopingToFind,
                        // jobTitle: finalData.jobTitle,
                        // wantChildren: finalData.wantChildren,
                        status: finalStatus[key]
                    }
                    final_data.push(response);
                }
                // // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];
                const final_response = [...final_data, ...UniqueId]
                console.log(final_data, ...UniqueId);
                // let uniqueObjArray = [...new Map(final_data.map((item) => [item["details"], item])).values()];
                res.status(status.OK).json(
                    new APIResponse("show all record which is Like Post", true, 201, final_response)
                )
            }


        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}
