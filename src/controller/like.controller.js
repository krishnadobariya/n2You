const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const postModel = require("../model/post.model");
const likeModel = require("../model/like.model");
const requestsModel = require("../model/requests.model");
const userModel = require("../model/user.model");
const { default: mongoose } = require("mongoose");
const { LOCKED } = require("http-status");

exports.LikeOrDislikeInUserPost = async (req, res, next) => {
    try {

        const userFindInPostModel = await postModel.findOne({ userId: req.params.user_id });

        if (userFindInPostModel) {
            const postFindInPostModel = await postModel.findOne({ userId: req.params.user_id, "posts._id": req.params.post_id });

            if (postFindInPostModel) {

                if (req.params.value == 1) {

                    const checkUserInLike = await likeModel.findOne({ reqUserId: req.params.req_user_id, postId: req.params.post_id });

                    if (checkUserInLike == null) {
                        const InsertIntoLikeTable = likeModel({
                            userId: req.params.user_id,
                            reqUserId: req.params.req_user_id,
                            postId: req.params.post_id
                        });

                        await InsertIntoLikeTable.save();

                        const data = await postModel.updateOne({ "posts._id": req.params.post_id }, { $inc: { "posts.$.like": 1 } }).then(() => {
                            const status_code = 1
                            res.status(status.CREATED).json(
                                new APIResponse("Like Added", "true", 201, "1", status_code)
                            );
                        }).catch((e) => {
                            res.status(status.INTERNAL_SERVER_ERROR).json(
                                new APIResponse("somthing went erong", "true", 500, "0", e)
                            );
                        })

                    } else {
                        const status_code = 2
                        res.status(status.ALREADY_REPORTED).json(
                            new APIResponse("Already Liked Post", "true", 208, "1", status_code)
                        );
                    }

                } else {

                    const checkUserInLike = await likeModel.findOne({ reqUserId: req.params.req_user_id, postId: req.params.post_id });

                    if (checkUserInLike) {

                        await postModel.updateOne({ "posts._id": req.params.post_id }, { $inc: { "posts.$.like": -1 } });

                        await likeModel.deleteOne({ reqUserId: req.params.req_user_id, postId: req.params.post_id });
                        const status_code = 3
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("dislike added!", "false", 404, "0", status_code)
                        );

                    } else {
                        const status_code = 4
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("First Time Not Like , Like Not Added", "false", 404, "0", status_code)
                        );
                    }
                }
            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Post Not Found", "false", 404, "0")
                );
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not Found", "false", 404, "0")
            );
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}


exports.showAllUserWhichIsLikePost = async (req, res, next) => {
    try {

        const findUserWichIsLikePost = await likeModel.find({ postId: req.params.post_id });

        if (findUserWichIsLikePost[0] == undefined) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("post not Found", "false", 404, "0")
            );

        } else {


            // all user which is liked post
            const allRequestedId = [];

            for (const findAllRequestedEmail of findUserWichIsLikePost) {

                allRequestedId.push((findAllRequestedEmail.reqUserId).toString());
            }

            const RequestedEmailExiestInUser = await requestsModel.findOne(
                {
                    userId: req.params.user_id,
                    RequestedEmails: {
                        $elemMatch: {
                            userId: {
                                $in: allRequestedId
                            }
                        }
                    }
                }
            )



            if (RequestedEmailExiestInUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Requested Email Not Exiest In User or User not Found", "false", 404, "0")
                )
            } else {
                const emailGet = [];


                for (const getEmail of RequestedEmailExiestInUser.RequestedEmails) {
                    emailGet.push((getEmail.userId).toString())
                }



                var difference = allRequestedId.filter(x => emailGet.indexOf(x) === -1);

                const UniqueId = [];
                for (const uniqueId of difference) {
                    const userDetail = await userModel.findOne({ _id: mongoose.Types.ObjectId(uniqueId) });

                    const response = {
                        _id: uniqueId,
                        email: userDetail.email,
                        firstName: userDetail.firstName,
                        profile: userDetail.photo[0] ? userDetail.photo[0].res : "",
                        status: 3
                    }

                    UniqueId.push(response);
                }
                console.log(RequestedEmailExiestInUser[0]);

                if (RequestedEmailExiestInUser == null) {
                    const responseData = [];
                    for (const allrequestedDataNotAcceptedRequestAndNotFriend of allRequestedId) {
                        const userDetail = await userModel.findOne({ _id: mongoose.Types.ObjectId(allrequestedDataNotAcceptedRequestAndNotFriend) });
                        const response = {
                            _id: allrequestedDataNotAcceptedRequestAndNotFriend,
                            email: userDetail.email,
                            firstName: userDetail.firstName,
                            profile: userDetail.photo[0] ? userDetail.photo[0].res : "",
                            status: 3
                        }

                        responseData.push(response);
                    }
                    res.status(status.OK).json(
                        new APIResponse("not user friend and not requested", "true", 200, "1", responseData)
                    )
                } else {

                    const statusByEmail = [];
                    const allRequestedEmail = RequestedEmailExiestInUser.RequestedEmails;
                    const requestedEmailWitchIsInuserRequeted = [];
                    allRequestedEmail.map((result, next) => {
                        const resultEmail = result.userId
                        requestedEmailWitchIsInuserRequeted.push(resultEmail);
                    });


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

                                userId: mongoose.Types.ObjectId(req.params.user_id),
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
                            photo: "$photo",
                            hopingToFind: "$hopingToFind",
                            jobTitle: "$jobTitle",
                            wantChildren: "$wantChildren",
                            result: "$form_data.RequestedEmails",
                        }
                    }])

                    const finalExistUser = [];

                    const emailDataDetail = meageAllTable;
                    for (const DataDetail of emailDataDetail) {
                        for (const reqEmail of allRequestedId) {
                            if ((DataDetail._id).toString() == reqEmail.toString()) {
                                finalExistUser.push(DataDetail)
                            }
                        }
                    }


                    for (const emailData of finalExistUser[0].result) {

                        for (const requestEmail of emailData) {

                            for (const meageAllTableEmail of finalExistUser) {

                                if (requestEmail.requestedEmail == meageAllTableEmail.email) {

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
                            photo: finalData.photo[0] ? finalData.photo[0].res : "",
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

                    res.status(status.OK).json(
                        new APIResponse("show all record which is Like Post", "true", 201, "1", final_response)
                    )
                }
            }
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}


