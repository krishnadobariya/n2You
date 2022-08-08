const cloudinary = require("../utils/cloudinary.utils");
const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const postModal = require("../model/post.model");
const userModal = require("../model/user.model");
const { default: mongoose } = require("mongoose");
const requestsModel = require("../model/requests.model");
const commentModel = require("../model/comment.model");
const path = require('path');
const { log } = require("console");

// Mutiple Videos Upload

exports.addPostVideo = async (req, res, next) => {
    try {
        const cloudinaryImageUploadMethod = async file => {
            return new Promise(resolve => {
                cloudinary.uploader.upload(file, { resource_type: "video" }, (err, res) => {
                    if (err) return res.status(500).send("upload image error")
                    resolve({
                        res: res.secure_url
                    })
                })
            })
        }

        const id = req.params.id;
        const userFindForViedos = await userModal.findOne({ _id: id, polyDating: 0 });

        if (userFindForViedos) {
            const checkInPost = await postModal.findOne({ userId: id });

            if (!checkInPost) {
                const urls = [];
                const files = req.files;

                for (const file of files) {
                    const { path } = file

                    const newPath = await cloudinaryImageUploadMethod(path);
                    urls.push(newPath);
                }

                const posts = postModal({
                    userId: mongoose.Types.ObjectId(id),
                    posts: [{
                        post: urls,
                        description: req.body.description
                    }],
                    email: userFindForViedos.email,
                })

                const saveData = await posts.save();
                res.status(status.CREATED).json(
                    new APIResponse("Posts Inserted successfully!", "true", 201, "1", saveData)
                )
            } else {
                const urls = [];
                const files = req.files
                const finalData = [{
                    post: urls,
                    description: req.body.description
                }];

                for (const file of files) {
                    const { path } = file;

                    const newPath = await cloudinaryImageUploadMethod(path);
                    urls.push(newPath);
                }

                await postModal.updateOne({ userId: req.params.id }, { $push: { posts: finalData } });

                res.status(status.OK).json(
                    new APIResponse("Post added successfully!", "true", 201, "1", finalData)
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not found and not Social Meida & Dating type user", "false", 404, "0")
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

// Mutiple Imagdes Posted

exports.addPostImages = async (req, res, next) => {
    try {
        const cloudinaryImageUploadMethod = async file => {
            return new Promise(resolve => {
                cloudinary.uploader.upload(file, (err, res) => {
                    if (err) return res.status(500).send("upload image error")
                    resolve({
                        res: res.secure_url
                    })
                })
            })
        }
        const id = req.params.id;
        const userFindForImages = await userModal.findOne({ _id: id, polyDating: 0 });

        if (userFindForImages) {
            const checkInPost = await postModal.findOne({ userId: id });
            if (!checkInPost) {
                const urls = [];
                const files = req.files;

                for (const file of files) {
                    const { path } = file

                    const newPath = await cloudinaryImageUploadMethod(path);
                    urls.push(newPath);
                }

                const posts = postModal({
                    userId: mongoose.Types.ObjectId(id),
                    posts: [{
                        post: urls,
                        description: req.body.description
                    }],
                    email: userFindForImages.email
                })


                const saveData = await posts.save();
                res.status(status.CREATED).json(
                    new APIResponse("Posts Inserted successfully!", "true", 201, "1", saveData)
                )
            } else {
                const urls = [];
                const files = req.files;
                const finalData = [{
                    post: urls,
                    description: req.body.description
                }];


                for (const file of files) {
                    const { path } = file;

                    const newPath = await cloudinaryImageUploadMethod(path);
                    urls.push(newPath);
                }
                await postModal.updateOne({ userId: req.params.id }, { $push: { posts: finalData } });

                res.status(status.OK).json(
                    new APIResponse("Post added successfully!", "true", 201, "1", finalData)
                )
            }

        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not found and not Social Meida & Dating type user", "false", 404, "0")
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

// GetAll Posts User Wise

exports.getPostsbyUseId = async (req, res, next) => {
    try {
        const id = req.params.id;
        const finalResponse = [];
        const userFindInPosts = await postModal.findOne({ userId: id });


        if (userFindInPosts) {

            const userWisePosts = await postModal.findOne({ userId: id });

            const findUser = await userModal.findOne({
                _id: userWisePosts.userId
            })

            if (userWisePosts.posts) {
                const storeAllpostsUserWise = [];
                const getAllPostsUserWise = userWisePosts.posts;
                getAllPostsUserWise.map((result, index) => {

                    storeAllpostsUserWise.unshift(result);
                })


                for (const createResponse of storeAllpostsUserWise) {


                    datetime = createResponse.createdAt;

                    var userPostedDate = new Date(datetime);
                    now = new Date();
                    var sec_num = (now - userPostedDate) / 1000;
                    var days = Math.floor(sec_num / (3600 * 24));
                    var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                    var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                    var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                    if (hours < 10) { hours = "0" + hours; }
                    if (minutes < 10) { minutes = "0" + minutes; }
                    if (seconds < 10) { seconds = "0" + seconds; }

                    const finalPostedTime = [];
                    const commentData = [];

                    if (days > 30) {
                        const getComment = await commentModel.findOne({ postId: createResponse._id });
                        let whenUserPosted = userPostedDate;
                        const fullDate = new Date(whenUserPosted).toDateString()
                        finalPostedTime.push(`${fullDate}`);
                        commentData.push(getComment)
                    }
                    if (days > 0 && days < 30) {
                        const getComment = await commentModel.findOne({ postId: createResponse._id });
                        finalPostedTime.push(`${days} days`);
                        commentData.push(getComment)
                    } else if (hours > 0 && days == 0) {
                        const getComment = await commentModel.findOne({ postId: createResponse._id });

                        finalPostedTime.push(`${hours} hours`);
                        commentData.push(getComment)
                    } else if (minutes > 0 && hours == 0) {
                        const getComment = await commentModel.findOne({ postId: createResponse._id });
                        finalPostedTime.push(`${minutes} minute`);
                        commentData.push(getComment)
                    } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                        const getComment = await commentModel.findOne({ postId: createResponse._id });
                        finalPostedTime.push(`${seconds} second`);
                        commentData.push(getComment)
                    }

                    const posts = {
                        userName: findUser.firstName,
                        email: findUser.email,
                        profile: findUser.photo[0] ? findUser.photo[0].res : null,
                        postId: createResponse._id,
                        post_data: createResponse.post,
                        description: createResponse.description,
                        like: createResponse.like,
                        comment: createResponse.comment,
                        report: createResponse.report
                    }

                    const response = {
                        posts,
                        finalPostedTime,
                        commentData: commentData[0] == null ? [] : commentData
                    }

                    finalResponse.push(response)


                }

                const page = parseInt(req.query.page)
                const limit = parseInt(req.query.limit)
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;

                res.status(status.OK).json(
                    new APIResponse("Get Post user Wise!", "true", 201, "1", finalResponse.slice(startIndex, endIndex))
                )

            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not Posted!", "false", 404, "0")
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


//get Onlay Images User Id Wise


exports.getPostsVideobyUseId = async (req, res, next) => {

    try {

        const id = req.params.id;
        const finalResponse = [];
        const userFindInPosts = await postModal.findOne({ userId: id });

        const findUser = await userModal.findOne({
            _id: userFindInPosts.userId
        })

        if (userFindInPosts) {

            const userWisePosts = await postModal.findOne({ userId: id });
            if (userWisePosts.posts) {
                const storeAllpostsUserWise = [];
                const getAllPostsUserWise = userWisePosts.posts;

                getAllPostsUserWise.map((result, index) => {

                    storeAllpostsUserWise.unshift(result);
                })

                for (const createResponse of storeAllpostsUserWise) {


                    const getExtName = path.extname(createResponse.post[0] ? createResponse.post[0].res : null);

                    if (getExtName == ".mp4") {
                        datetime = createResponse.createdAt;

                        var userPostedDate = new Date(datetime);
                        now = new Date();
                        var sec_num = (now - userPostedDate) / 1000;
                        var days = Math.floor(sec_num / (3600 * 24));
                        var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                        var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                        var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                        if (hours < 10) { hours = "0" + hours; }
                        if (minutes < 10) { minutes = "0" + minutes; }
                        if (seconds < 10) { seconds = "0" + seconds; }

                        const finalPostedTime = [];
                        const commentData = [];

                        if (days > 30) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            let whenUserPosted = userPostedDate;
                            const fullDate = new Date(whenUserPosted).toDateString()
                            finalPostedTime.push(`${fullDate}`);
                            commentData.push(getComment)
                        }
                        if (days > 0 && days < 30) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${days} days`);
                            commentData.push(getComment)
                        } else if (hours > 0 && days == 0) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${hours} hours`);
                            commentData.push(getComment)
                        } else if (minutes > 0 && hours == 0) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${minutes} minute`);
                            commentData.push(getComment)
                        } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${seconds} second`);
                            commentData.push(getComment)
                        }

                        const posts = {
                            userName: findUser.firstName,
                            email: findUser.email,
                            profile: findUser.photo[0] ? findUser.photo[0].res : null,
                            postId: createResponse._id,
                            post_data: createResponse.post,
                            description: createResponse.description,
                            like: createResponse.like,
                            comment: createResponse.comment,
                            report: createResponse.report


                        }

                        const response = {
                            posts,
                            finalPostedTime,
                            commentData: commentData[0] == null ? [] : commentData
                        }

                        finalResponse.push(response)


                    } else {
                        finalResponse.push()
                    }
                }

                if (finalResponse[0] == undefined) {
                    res.status(status.OK).json(
                        new APIResponse("Not have any Video Posted!", "true", 200, "1")
                    )
                } else {
                    res.status(status.OK).json(
                        new APIResponse("all video!", "true", 200, "1", finalResponse)
                    )
                }

            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not Posted!", "false", 404, "0")
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


exports.getPostsImagesbyUseId = async (req, res, next) => {
    try {


        const id = req.params.id;
        const finalResponse = [];
        const userFindInPosts = await postModal.findOne({ userId: id });

        const findUser = await userModal.findOne({
            _id: userFindInPosts.userId
        })

        if (userFindInPosts) {

            const userWisePosts = await postModal.findOne({ userId: id });
            if (userWisePosts.posts) {
                const storeAllpostsUserWise = [];
                const getAllPostsUserWise = userWisePosts.posts;

                getAllPostsUserWise.map((result, index) => {

                    storeAllpostsUserWise.unshift(result);
                })

                for (const createResponse of storeAllpostsUserWise) {


                    const getExtName = createResponse.post[0] ? createResponse.post[0].res : null;
                    if (getExtName == null) {

                    } else {
                        const getExtName = path.extname(createResponse.post[0].res);
                        if (getExtName != ".mp4") {

                            datetime = createResponse.createdAt;

                            var userPostedDate = new Date(datetime);
                            now = new Date();
                            var sec_num = (now - userPostedDate) / 1000;
                            var days = Math.floor(sec_num / (3600 * 24));
                            var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                            var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                            var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                            if (hours < 10) { hours = "0" + hours; }
                            if (minutes < 10) { minutes = "0" + minutes; }
                            if (seconds < 10) { seconds = "0" + seconds; }

                            const finalPostedTime = [];
                            const commentData = [];

                            if (days > 30) {
                                const getComment = await commentModel.findOne({ postId: createResponse._id });
                                let whenUserPosted = userPostedDate;
                                const fullDate = new Date(whenUserPosted).toDateString()
                                finalPostedTime.push(`${fullDate}`);
                                commentData.push(getComment)
                            }
                            if (days > 0 && days < 30) {
                                const getComment = await commentModel.findOne({ postId: createResponse._id });
                                finalPostedTime.push(`${days} days`);
                                commentData.push(getComment)
                            } else if (hours > 0 && days == 0) {
                                const getComment = await commentModel.findOne({ postId: createResponse._id });
                                finalPostedTime.push(`${hours} hours`);
                                commentData.push(getComment)
                            } else if (minutes > 0 && hours == 0) {
                                const getComment = await commentModel.findOne({ postId: createResponse._id });
                                finalPostedTime.push(`${minutes} minute`);
                                commentData.push(getComment)
                            } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                                const getComment = await commentModel.findOne({ postId: createResponse._id });
                                finalPostedTime.push(`${seconds} second`);
                                commentData.push(getComment)
                            }


                            const posts = {
                                userName: findUser.firstName,
                                email: findUser.email,
                                profile: findUser.photo[0] ? findUser.photo[0].res : null,
                                postId: createResponse._id,
                                post_data: createResponse.post,
                                description: createResponse.description,
                                like: createResponse.like,
                                comment: createResponse.comment,
                                report: createResponse.report
                            }

                            const response = {
                                posts,
                                finalPostedTime,
                                commentData: commentData[0] == null ? [] : commentData
                            }

                            finalResponse.push(response)


                        } else {
                            finalResponse.push()
                        }
                    }

                }

                if (finalResponse[0] == undefined) {
                    res.status(status.OK).json(
                        new APIResponse("Not have any Images Posted!", "true", 200, "1")
                    )
                } else {
                    res.status(status.OK).json(
                        new APIResponse("all video!", "true", 200, "1", finalResponse)
                    )
                }

            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not Posted!", "false", 404, "0")
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found in post Table and not Social Meida & Dating type user!", "false", 404, "0")
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}


// Show all Posts

// exports.showPostsOnalyAcceptedPerson = async (req, res, next) => {
//     try {
//         const getAllUserFinalPost = [];
//         const getAllUserPost = await postModal.find({}); 
//         getAllUserPost.map((result, index) => {
//             const data = result.posts;
//             data.map((result, index) => {
//                 const finalResult = result[0].res;
//                 getAllUserFinalPost.push(finalResult);
//             })
//         })
//         res.status(status.OK).json(
//             new APIResponse("successfully get all Posts!", true, 200, getAllUserFinalPost)
//         )

//     } catch (error) {
//         console.log("Error:", error);
//         res.status(status.INTERNAL_SERVER_ERROR).json(
//             new APIResponse("Something Went Wrong", true, 500, error.message)
//         )
//     }
// }

// Edit Post


exports.EditPosts = async (req, res, next) => {
    try {

        const UserId = req.params.user_id;
        const PostId = req.params.post_id;


        const findData = await postModal.findOne({
            userId: UserId, "posts._id": PostId
        });

        if (findData) {
            const findPostAndUser = await postModal.updateOne(
                {
                    userId: UserId, "posts._id": PostId
                },
                {
                    $set: {
                        "posts.$.description": req.body.description
                    }
                });

            if (findPostAndUser.modifiedCount == 1) {
                res.status(status.OK).json(
                    new APIResponse("successfully Post Updated!", "true", 200, "1")
                )
            } else {
                res.status(status.INTERNAL_SERVER_ERROR).json(
                    new APIResponse("Somthing went Wrong", "false", 500, "0")
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User or Post Not Found!", "false", 404, "0")
            )
        }



    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const UserId = req.params.user_id;
        const PostId = req.params.post_id;

        const findData = await postModal.findOne({
            userId: UserId, "posts._id": PostId
        })

        if (findData) {
            const findPostAndUser = await postModal.updateOne(
                {
                    userId: UserId
                },
                {
                    $pull: {
                        posts: {
                            _id: PostId
                        }
                    }
                });

            if (findPostAndUser.modifiedCount == 1) {
                res.status(status.OK).json(
                    new APIResponse("successfully Post Deleted!", "true", 200, "1")
                )
            } else {
                res.status(status.INTERNAL_SERVER_ERROR).json(
                    new APIResponse("Somthing went Wrong", "false", 500, "0")
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User or Post Not Found!", "false", 404, "0")
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.userAllFriendPost = async (req, res, next) => {
    try {

        const statusByEmail = [];
        const data = await requestsModel.findOne({ userEmail: req.params.user_email });

        if (data != null) {
            const allRequestedEmail = data.RequestedEmails
            const requestedEmailWitchIsInuserRequeted = [];

            allRequestedEmail.map((result, next) => {
                const resultEmail = result.requestedEmail;
                requestedEmailWitchIsInuserRequeted.push(resultEmail);
            });

            const meargAllTable = await userModal.aggregate([{
                $match: {
                    email: {
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

                        userEmail: req.params.user_email,
                        email: "$email"
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$userEmail", "$$userEmail"
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

                    email: "$email",
                    posts: "$req_data",
                    result: "$form_data.RequestedEmails",
                }
            }])

            const emailDataDetail = meargAllTable[0].result;



            for (const emailData of emailDataDetail) {

                for (const requestEmail of emailData) {

                    for (const meargAllTableEmail of meargAllTable) {

                        if (requestEmail.requestedEmail == meargAllTableEmail.email) {

                            if (requestEmail.accepted == 1) {

                                const finalResponse = [];

                                for (const allposts of meargAllTableEmail.posts) {

                                    for (const getallposts of allposts.posts) {
                                        const userPostDate = getallposts.createdAt;

                                        datetime = userPostDate;
                                        var userPostedDate = new Date(datetime);
                                        now = new Date();
                                        var sec_num = (now - userPostedDate) / 1000;
                                        var days = Math.floor(sec_num / (3600 * 24));
                                        var hours = Math.floor((sec_num - (days * (3600 * 24))) / 3600);
                                        var minutes = Math.floor((sec_num - (days * (3600 * 24)) - (hours * 3600)) / 60);
                                        var seconds = Math.floor(sec_num - (days * (3600 * 24)) - (hours * 3600) - (minutes * 60));

                                        if (hours < 10) { hours = "0" + hours; }
                                        if (minutes < 10) { minutes = "0" + minutes; }
                                        if (seconds < 10) { seconds = "0" + seconds; }

                                        const finalPostedTime = [];
                                        const commentData = [];



                                        if (days > 30) {
                                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                                            let whenUserPosted = userPostedDate;
                                            const fullDate = new Date(whenUserPosted).toDateString()
                                            finalPostedTime.push(`${fullDate}`);
                                            commentData.push(getComment)
                                        }
                                        if (days > 0 && days < 30) {
                                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                                            finalPostedTime.push(`${days} days`);
                                            commentData.push(getComment)
                                        } else if (hours > 0 && days == 0) {
                                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                                            finalPostedTime.push(`${hours} hours`);
                                            commentData.push(getComment)
                                        } else if (minutes > 0 && hours == 0) {
                                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                                            finalPostedTime.push(`${minutes} minute`);
                                            commentData.push(getComment)
                                        } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                                            finalPostedTime.push(`${seconds} second`);
                                            commentData.push(getComment)
                                        }

                                        const response = {
                                            userId: allposts.userId,
                                            getallposts,
                                            finalPostedTime,
                                            commentData: commentData[0] == null ? [] : commentData
                                        }
                                        finalResponse.push(response);

                                    }
                                }



                                var status1 = {
                                    email: requestEmail.requestedEmail,
                                    posts: finalResponse.slice(req.query.skip, req.query.limit)
                                }
                                statusByEmail.push(status1)
                            } else {

                            }
                        }
                    }
                }
            }

            const final_data = [];

            const finalStatus = [];
            for (const [key, finalData] of meargAllTable.entries()) {
                for (const [key, final1Data] of statusByEmail.entries())
                    if (finalData.email === final1Data.email) {
                        finalStatus.push(final1Data)
                    }
            }


            for (const [key, finalData] of meargAllTable.entries()) {

                const response = {
                    data: finalStatus[key]
                }


                if (response.data == undefined) {

                } else {

                    const findUser = await userModal.findOne({
                        email: response.data.email
                    })


                    const data = {
                        posts: {
                            userId: findUser._id,
                            postId: response.data.posts[0].getallposts._id,
                            email: response.data.email,
                            userName: findUser.firstName,
                            profile: findUser.photo[0] ? findUser.photo[0].res : null,
                            posts_data: response.data.posts[0].getallposts.post,
                            description: response.data.posts[0].getallposts.description,
                            like: response.data.posts[0].getallposts.like,
                            comment: response.data.posts[0].getallposts.comment,
                            report: response.data.posts[0].getallposts.report,
                        },
                        finalPostedTime: response.data.posts[0].finalPostedTime,
                        commentData: response.data.posts[0].commentData,
                        userId: response.data.userId,

                    }

                    final_data.push(data);
                }


            }

            res.status(status.OK).json(
                new APIResponse("show all post When accept by the user", "true", 201, "1", final_data)
            )
        } else {
            res.status(status.OK).json(
                new APIResponse("user not have any friends", "false", 400, "0")
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.reportAdd = async (req, res, next) => {
    try {

        const userFind = await userModal.findOne({ _id: req.params.user_id })


        if (userFind == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found and not Social Meida & Dating type user!", "false", 404, "0")
            )
        } else {
            const postFind = await userModal.findOne({
                _id: req.params.user_id,
                "posts._id": req.params.post_id
            })

            if (postFind == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User or Post Not Found!", "false", 404, "0")
                )
            } else {

                await postModal.updateOne({ "posts._id": req.params.post_id }, { $inc: { "posts.$.report": 1 } });
                res.status(status.CREATED).json(
                    new APIResponse("report Added", "true", 201, "1")
                );
            }
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}


