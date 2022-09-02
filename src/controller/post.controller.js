const cloudinary = require("../utils/cloudinary.utils");
const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const postModal = require("../model/post.model");
const userModal = require("../model/user.model");
const { default: mongoose, Mongoose } = require("mongoose");
const requestsModel = require("../model/requests.model");
const commentModel = require("../model/comment.model");
const path = require('path');
const { log } = require("console");
const likeModel = require("../model/like.model");
const notificationModel = require("../model/polyamorous/notification.model");
const blockUnblockModel = require("../model/blockuser.model");
const settingModel = require("../model/setting.model");

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

                const findAllEmail = await requestsModel.findOne({
                    userId: req.params.id
                })


                const allRequestEmail = [];
                if (allRequestEmail[0] == undefined) {

                } else {
                    for (const postData of findAllEmail.RequestedEmails) {
                        if (postData.accepted == 1) {
                            allRequestEmail.push(postData.userId)
                        }
                    }

                    for (const sendNotification of allRequestEmail) {

                        const findNotification = await notificationModel.findOne({
                            userId: sendNotification
                        })

                        const findUser = await userModal.findOne({
                            _id: req.params.id
                        }).select("firstName")

                        if (findNotification) {

                            await notificationModel.updateOne({
                                userId: sendNotification
                            },
                                {
                                    $push: {
                                        notifications: {
                                            userId: req.params.id,
                                            notifications: `${findUser.firstName} add post`,
                                            status: 6
                                        }
                                    }
                                }
                            )

                        } else {

                            const dataSave = notificationModel({
                                userId: sendNotification,
                                notifications: {
                                    userId: req.params.id,
                                    notifications: `${findUser.firstName} add post`,
                                    status: 6
                                }
                            })

                            await dataSave.save();
                        }
                    }
                }


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

                const findAllEmail = await requestsModel.findOne({
                    userId: req.params.id
                })



                const allRequestEmail = [];

                if (allRequestEmail[0] == undefined) {

                } else {
                    for (const postData of findAllEmail.RequestedEmails) {
                        if (postData.accepted == 1) {
                            allRequestEmail.push(postData.userId)
                        }
                    }

                    for (const sendNotification of allRequestEmail) {

                        const findNotification = await notificationModel.findOne({
                            userId: sendNotification
                        })

                        const findUser = await userModal.findOne({
                            _id: req.params.id
                        }).select("firstName")

                        if (findNotification) {

                            await notificationModel.updateOne({
                                userId: sendNotification
                            },
                                {
                                    $push: {
                                        notifications: {
                                            userId: req.params.id,
                                            notifications: `${findUser.firstName} add post`,
                                            status: 6
                                        }
                                    }
                                }
                            )

                        } else {

                            const dataSave = notificationModel({
                                userId: sendNotification,
                                notifications: {
                                    userId: req.params.id,
                                    notifications: `${findUser.firstName} add post`,
                                    status: 6
                                }
                            })

                            await dataSave.save();
                        }
                    }

                }

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


                const findAllEmail = await requestsModel.findOne({
                    userId: req.params.id
                })


                const allRequestEmail = [];

                if (allRequestEmail[0] == undefined) {

                } else {
                    for (const postData of findAllEmail.RequestedEmails) {
                        if (postData.accepted == 1) {
                            allRequestEmail.push(postData.userId)
                        }
                    }

                    for (const sendNotification of allRequestEmail) {

                        const findNotification = await notificationModel.findOne({
                            userId: sendNotification
                        })

                        const findUser = await userModal.findOne({
                            _id: req.params.id
                        }).select("firstName")

                        if (findNotification) {

                            await notificationModel.updateOne({
                                userId: sendNotification
                            },
                                {
                                    $push: {
                                        notifications: {
                                            userId: req.params.id,
                                            notifications: `${findUser.firstName} add post`,
                                            status: 6
                                        }
                                    }
                                }
                            )

                        } else {

                            const dataSave = notificationModel({
                                userId: sendNotification,
                                notifications: {
                                    userId: req.params.id,
                                    notifications: `${findUser.firstName} add post`,
                                    status: 6
                                }
                            })

                            await dataSave.save();
                        }
                    }
                }



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


                const findAllEmail = await requestsModel.findOne({
                    userId: req.params.id
                })


                const allRequestEmail = [];
                if (allRequestEmail[0] == undefined) {

                } else {
                    for (const postData of findAllEmail.RequestedEmails) {
                        if (postData.accepted == 1) {
                            allRequestEmail.push(postData.userId)
                        }
                    }


                    for (const sendNotification of allRequestEmail) {

                        const findNotification = await notificationModel.findOne({
                            userId: sendNotification
                        })


                        const findUser = await userModal.findOne({
                            _id: req.params.id
                        }).select("firstName")

                        if (findNotification) {

                            await notificationModel.updateOne(
                                {
                                    userId: sendNotification,
                                },
                                {
                                    $push: {
                                        notifications: {
                                            userId: req.params.id,
                                            notifications: `${findUser.firstName} add post`,
                                            status: 6
                                        }
                                    }
                                }
                            )

                        } else {

                            const dataSave = notificationModel({
                                userId: sendNotification,
                                notifications: {
                                    userId: req.params.id,
                                    notifications: `${findUser.firstName} add post`,
                                    status: 6
                                }
                            })

                            await dataSave.save();
                        }
                    }
                }


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

exports.getPostById = async (req, res, next) => {
    try {

        const id = req.params.post_id;
        const finalResponse = [];
        const userFindInPosts = await postModal.findOne({ userId: req.params.user_id, "posts._id": id });



        if (userFindInPosts) {

            const findUser = await userModal.findOne({
                _id: userFindInPosts.userId
            })

            const userWisePosts = await postModal.findOne({ userId: userFindInPosts.userId, "posts._id": id });

            const getOnePost = [];
            if (userWisePosts == null) {
                res.status(status.OK).json(
                    new APIResponse("get post by post id", "true", 200, "1", [])
                )
            } else {
                for (const getPost of userWisePosts.posts) {
                    if ((getPost._id).toString() == (id).toString()) {
                        getOnePost.push(getPost)
                    } else {

                    }
                }
                if (userWisePosts.posts) {
                    const storeAllpostsUserWise = [];
                    const getAllPostsUserWise = getOnePost;

                    getAllPostsUserWise.map((result, index) => {

                        storeAllpostsUserWise.unshift(result);
                    })

                    for (const createResponse of storeAllpostsUserWise) {
                        const post = [];
                        for (const postwithType of createResponse.post) {
                            const getExt1Name = postwithType ? postwithType.res : null;
                            if (getExt1Name == null) {

                            } else {
                                const getExt1Name = path.extname(postwithType.res);
                                if (getExt1Name == ".mp4" || getExt1Name == ".mov" || getExt1Name == ".avi" || getExt1Name == ".wmv" || getExt1Name == ".m3u8" || getExt1Name == ".webm" || getExt1Name == ".flv" || getExt1Name == ".ts" || getExt1Name == ".3gp") {
                                    post.push({
                                        res: postwithType.res,
                                        type: "video"
                                    })
                                } else {
                                    post.push({
                                        res: postwithType.res,
                                        type: "image"
                                    })
                                }
                            }
                        }
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
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        }
                        if (days > 0 && days < 30) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${days} days`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (hours > 0 && days == 0) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${hours} hours`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (minutes > 0 && hours == 0) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${minutes} minute`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${seconds} second`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        }


                        const posts = {
                            _id: findUser._id,
                            userName: findUser.firstName,
                            email: findUser.email,
                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                            postId: createResponse._id,
                            post_data: post,
                            description: createResponse.description,
                            like: createResponse.like,
                            comment: createResponse.comment,
                            report: createResponse.report
                        }

                        const findUserInLike = await likeModel.findOne({
                            postId: createResponse._id,
                            reqUserId: req.params.req_id
                        })

                        if (findUserInLike) {
                            const response = {
                                posts,
                                finalPostedTime,
                                commentData: commentData[0] == null ? [] : commentData,
                                postShowStatus: 1
                            }

                            finalResponse.push(response)

                        } else {
                            const response = {
                                posts,
                                finalPostedTime,
                                commentData: commentData[0] == null ? [] : commentData,
                                postShowStatus: 0
                            }

                            finalResponse.push(response)

                        }





                    }

                    if (finalResponse[0] == undefined) {
                        res.status(status.OK).json(
                            new APIResponse("Not have any Images Posted!", "true", 200, "1")
                        )
                    } else {
                        res.status(status.OK).json(
                            new APIResponse("get post by post id", "true", 200, "1", finalResponse)
                        )
                    }

                } else {
                    res.status(status.NOT_FOUND).json(
                        new APIResponse("Not Posted!", "false", 404, "0")
                    )
                }
            }

        } else {
            res.status(status.OK).json(
                new APIResponse("get post by post id", "true", 200, "1", [])
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}

exports.getPostsbyUseId = async (req, res, next) => {
    try {


        const id = req.params.id;
        const finalResponse = [];
        const userFindInPosts = await postModal.findOne({ userId: id });



        if (userFindInPosts) {

            const findUser = await userModal.findOne({
                _id: userFindInPosts.userId
            })

            const userWisePosts = await postModal.findOne({ userId: id });
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
                        if (getComment == null) {
                        } else {
                            for (const commnetData of getComment.comments) {
                                const user = await userModal.findOne({ _id: commnetData.userId })
                                const replyUser = []
                                for (const commentId of commnetData.replyUser) {
                                    const findUser = await userModal.findOne({
                                        _id: commentId.userId
                                    })

                                    const response = {
                                        commentId: commnetData._id,
                                        profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                        firstName: findUser.firstName,
                                        userId: findUser._id,
                                        replyId: commentId._id,
                                        replyMessage: commentId.replyMessage,
                                        date: commentId.date
                                    }

                                    replyUser.push(response)
                                }
                                const response = {
                                    userId: user._id,
                                    comment: commnetData.comment,
                                    commentId: commnetData._id,
                                    photourl: user.photo[0] ? user.photo[0].res : "",
                                    username: user.firstName,
                                    date: commnetData.date,
                                    replyUser: replyUser,
                                }
                                commentData.push(response)
                            }

                        }
                    }
                    if (days > 0 && days < 30) {
                        const getComment = await commentModel.findOne({ postId: createResponse._id });
                        finalPostedTime.push(`${days} days`);
                        if (getComment == null) {
                        } else {
                            for (const commnetData of getComment.comments) {
                                const user = await userModal.findOne({ _id: commnetData.userId })
                                const replyUser = []
                                for (const commentId of commnetData.replyUser) {
                                    const findUser = await userModal.findOne({
                                        _id: commentId.userId
                                    })

                                    const response = {
                                        commentId: commnetData._id,
                                        profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                        firstName: findUser.firstName,
                                        userId: findUser._id,
                                        replyId: commentId._id,
                                        replyMessage: commentId.replyMessage,
                                        date: commentId.date
                                    }

                                    replyUser.push(response)
                                }
                                const response = {
                                    userId: user._id,
                                    comment: commnetData.comment,
                                    commentId: commnetData._id,
                                    photourl: user.photo[0] ? user.photo[0].res : "",
                                    username: user.firstName,
                                    date: commnetData.date,
                                    replyUser: replyUser,
                                }
                                commentData.push(response)
                            }

                        }
                    } else if (hours > 0 && days == 0) {
                        const getComment = await commentModel.findOne({ postId: createResponse._id });
                        finalPostedTime.push(`${hours} hours`);
                        if (getComment == null) {
                        } else {
                            for (const commnetData of getComment.comments) {
                                const user = await userModal.findOne({ _id: commnetData.userId })
                                const replyUser = []
                                for (const commentId of commnetData.replyUser) {
                                    const findUser = await userModal.findOne({
                                        _id: commentId.userId
                                    })

                                    const response = {
                                        commentId: commnetData._id,
                                        profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                        firstName: findUser.firstName,
                                        userId: findUser._id,
                                        replyId: commentId._id,
                                        replyMessage: commentId.replyMessage,
                                        date: commentId.date
                                    }

                                    replyUser.push(response)
                                }
                                const response = {
                                    userId: user._id,
                                    comment: commnetData.comment,
                                    commentId: commnetData._id,
                                    photourl: user.photo[0] ? user.photo[0].res : "",
                                    username: user.firstName,
                                    date: commnetData.date,
                                    replyUser: replyUser,
                                }
                                commentData.push(response)
                            }

                        }
                    } else if (minutes > 0 && hours == 0) {
                        const getComment = await commentModel.findOne({ postId: createResponse._id });
                        finalPostedTime.push(`${minutes} minute`);
                        if (getComment == null) {
                        } else {
                            for (const commnetData of getComment.comments) {
                                const user = await userModal.findOne({ _id: commnetData.userId })
                                const replyUser = []
                                for (const commentId of commnetData.replyUser) {
                                    const findUser = await userModal.findOne({
                                        _id: commentId.userId
                                    })

                                    const response = {
                                        commentId: commnetData._id,
                                        profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                        firstName: findUser.firstName,
                                        userId: findUser._id,
                                        replyId: commentId._id,
                                        replyMessage: commentId.replyMessage,
                                        date: commentId.date
                                    }

                                    replyUser.push(response)
                                }
                                const response = {
                                    userId: user._id,
                                    comment: commnetData.comment,
                                    commentId: commnetData._id,
                                    photourl: user.photo[0] ? user.photo[0].res : "",
                                    username: user.firstName,
                                    date: commnetData.date,
                                    replyUser: replyUser,
                                }
                                commentData.push(response)
                            }

                        }
                    } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                        const getComment = await commentModel.findOne({ postId: createResponse._id });
                        finalPostedTime.push(`${seconds} second`);
                        if (getComment == null) {
                        } else {
                            for (const commnetData of getComment.comments) {
                                const user = await userModal.findOne({ _id: commnetData.userId })
                                const replyUser = []
                                for (const commentId of commnetData.replyUser) {
                                    const findUser = await userModal.findOne({
                                        _id: commentId.userId
                                    })

                                    const response = {
                                        commentId: commnetData._id,
                                        profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                        firstName: findUser.firstName,
                                        userId: findUser._id,
                                        replyId: commentId._id,
                                        replyMessage: commentId.replyMessage,
                                        date: commentId.date
                                    }

                                    replyUser.push(response)
                                }
                                const response = {
                                    userId: user._id,
                                    comment: commnetData.comment,
                                    commentId: commnetData._id,
                                    photourl: user.photo[0] ? user.photo[0].res : "",
                                    username: user.firstName,
                                    date: commnetData.date,
                                    replyUser: replyUser,
                                }
                                commentData.push(response)
                            }

                        }
                    }


                    const posts = {
                        _id: findUser._id,
                        userName: findUser.firstName,
                        email: findUser.email,
                        profile: findUser.photo[0] ? findUser.photo[0].res : "",
                        postId: createResponse._id,
                        post_data: createResponse.post,
                        description: createResponse.description,
                        like: createResponse.like,
                        comment: createResponse.comment,
                        report: createResponse.report
                    }

                    const findUserInLike = await likeModel.findOne({
                        postId: createResponse._id,
                        userId: findUser._id
                    })
                    if (findUserInLike) {
                        const response = {
                            posts,
                            finalPostedTime,
                            commentData: commentData[0] == null ? [] : commentData,
                            postShowStatus: 1
                        }

                        finalResponse.push(response)

                    } else {
                        const response = {
                            posts,
                            finalPostedTime,
                            commentData: commentData[0] == null ? [] : commentData,
                            postShowStatus: 0
                        }

                        finalResponse.push(response)

                    }

                }

                if (finalResponse[0] == undefined) {
                    res.status(status.OK).json(
                        new APIResponse("all post!", "true", 200, "1", [])
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
            res.status(status.OK).json(
                new APIResponse("all post!", "true", 200, "1", [])
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

        const id = mongoose.Types.ObjectId(req.params.id);
        const finalResponse = [];
        const userFindInPosts = await postModal.findOne({ userId: id });

        if (userFindInPosts) {
            const findUser = await userModal.findOne({
                _id: userFindInPosts.userId
            })

            const userWisePosts = await postModal.findOne({ userId: id });
            if (userWisePosts.posts) {
                const storeAllpostsUserWise = [];
                const getAllPostsUserWise = userWisePosts.posts;

                getAllPostsUserWise.map((result, index) => {

                    storeAllpostsUserWise.unshift(result);
                })

                for (const createResponse of storeAllpostsUserWise) {
                    const post = [];
                    for (const postwithType of createResponse.post) {
                        const getExt1Name = postwithType ? postwithType.res : null;
                        if (getExt1Name == null) {

                        } else {
                            const getExt1Name = path.extname(postwithType.res);
                            if (getExt1Name == ".mp4" || getExt1Name == ".mov" || getExt1Name == ".avi" || getExt1Name == ".wmv" || getExt1Name == ".m3u8" || getExt1Name == ".webm" || getExt1Name == ".flv" || getExt1Name == ".ts" || getExt1Name == ".3gp") {
                                post.push({
                                    res: postwithType.res,
                                    type: "video"
                                })
                            }
                        }
                    }

                    const getExtName = path.extname(createResponse.post[0] ? createResponse.post[0].res : "");

                    if (getExtName == ".mp4" || getExtName == ".mov" || getExtName == ".avi" || getExtName == ".wmv" || getExtName == ".m3u8" || getExtName == ".webm" || getExtName == ".flv" || getExtName == ".ts" || getExtName == ".3gp") {
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
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        }
                        if (days > 0 && days < 30) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${days} days`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (hours > 0 && days == 0) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${hours} hours`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (minutes > 0 && hours == 0) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${minutes} minute`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                            const getComment = await commentModel.findOne({ postId: createResponse._id });
                            finalPostedTime.push(`${seconds} second`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        }

                        const posts = {
                            _id: findUser._id,
                            userName: findUser.firstName,
                            email: findUser.email,
                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                            postId: createResponse._id,
                            post_data: post,
                            description: createResponse.description,
                            like: createResponse.like,
                            comment: createResponse.comment,
                            report: createResponse.report


                        }

                        const findUserInLike = await likeModel.findOne({
                            postId: createResponse._id,
                            userId: findUser._id
                        })
                        if (findUserInLike) {
                            const response = {
                                posts,
                                finalPostedTime,
                                commentData: commentData[0] == null ? [] : commentData,
                                postShowStatus: 1
                            }

                            finalResponse.push(response)

                        } else {
                            const response = {
                                posts,
                                finalPostedTime,
                                commentData: commentData[0] == null ? [] : commentData,
                                postShowStatus: 0
                            }

                            finalResponse.push(response)

                        }



                    } else {
                        finalResponse.push()
                    }
                }

                if (finalResponse[0] == undefined) {
                    res.status(status.OK).json(
                        new APIResponse("all Video!", "true", 200, "1", [])
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
            res.status(status.OK).json(
                new APIResponse("all Video!", "true", 200, "1", [])
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


        if (userFindInPosts) {

            const findUser = await userModal.findOne({
                _id: userFindInPosts.userId
            })


            const userWisePosts = await postModal.findOne({ userId: id });
            if (userWisePosts.posts) {
                const storeAllpostsUserWise = [];
                const getAllPostsUserWise = userWisePosts.posts;

                getAllPostsUserWise.map((result, index) => {

                    storeAllpostsUserWise.unshift(result);
                })

                for (const createResponse of storeAllpostsUserWise) {
                    const post = [];
                    for (const postwithType of createResponse.post) {
                        const getExt1Name = postwithType ? postwithType.res : null;
                        if (getExt1Name == null) {

                        } else {
                            const getExt1Name = path.extname(postwithType.res);
                            if (getExt1Name == ".jpeg" || getExt1Name == ".jpg" || getExt1Name == ".png" || getExt1Name == ".apng" || getExt1Name == ".avif" || getExt1Name == ".gif" || getExt1Name == ".svg+xml" || getExt1Name == ".webp") {
                                post.push({
                                    res: postwithType.res,
                                    type: "image"
                                })
                            }
                        }
                    }
                    const getExtName = createResponse.post[0] ? createResponse.post[0].res : null;
                    if (getExtName == null) {

                    } else {
                        const getExtName = path.extname(createResponse.post[0].res);
                        if (getExtName == ".jpeg" || getExtName == ".jpg" || getExtName == ".png" || getExtName == ".apng" || getExtName == ".avif" || getExtName == ".gif" || getExtName == ".svg+xml" || getExtName == ".webp") {

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
                                if (getComment == null) {
                                } else {
                                    for (const commnetData of getComment.comments) {
                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                        const replyUser = []
                                        for (const commentId of commnetData.replyUser) {
                                            const findUser = await userModal.findOne({
                                                _id: commentId.userId
                                            })

                                            const response = {
                                                commentId: commnetData._id,
                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                firstName: findUser.firstName,
                                                userId: findUser._id,
                                                replyId: commentId._id,
                                                replyMessage: commentId.replyMessage,
                                                date: commentId.date
                                            }

                                            replyUser.push(response)
                                        }
                                        const response = {
                                            userId: user._id,
                                            comment: commnetData.comment,
                                            commentId: commnetData._id,
                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                            username: user.firstName,
                                            date: commnetData.date,
                                            replyUser: replyUser,
                                        }
                                        commentData.push(response)
                                    }

                                }
                            }
                            if (days > 0 && days < 30) {
                                const getComment = await commentModel.findOne({ postId: createResponse._id });
                                finalPostedTime.push(`${days} days`);
                                if (getComment == null) {
                                } else {
                                    for (const commnetData of getComment.comments) {
                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                        const replyUser = []
                                        for (const commentId of commnetData.replyUser) {
                                            const findUser = await userModal.findOne({
                                                _id: commentId.userId
                                            })

                                            const response = {
                                                commentId: commnetData._id,
                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                firstName: findUser.firstName,
                                                userId: findUser._id,
                                                replyId: commentId._id,
                                                replyMessage: commentId.replyMessage,
                                                date: commentId.date
                                            }

                                            replyUser.push(response)
                                        }
                                        const response = {
                                            userId: user._id,
                                            comment: commnetData.comment,
                                            commentId: commnetData._id,
                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                            username: user.firstName,
                                            date: commnetData.date,
                                            replyUser: replyUser,
                                        }
                                        commentData.push(response)
                                    }

                                }
                            } else if (hours > 0 && days == 0) {
                                const getComment = await commentModel.findOne({ postId: createResponse._id });
                                finalPostedTime.push(`${hours} hours`);
                                if (getComment == null) {
                                } else {
                                    for (const commnetData of getComment.comments) {
                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                        const replyUser = []
                                        for (const commentId of commnetData.replyUser) {
                                            const findUser = await userModal.findOne({
                                                _id: commentId.userId
                                            })

                                            const response = {
                                                commentId: commnetData._id,
                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                firstName: findUser.firstName,
                                                userId: findUser._id,
                                                replyId: commentId._id,
                                                replyMessage: commentId.replyMessage,
                                                date: commentId.date
                                            }

                                            replyUser.push(response)
                                        }
                                        const response = {
                                            userId: user._id,
                                            comment: commnetData.comment,
                                            commentId: commnetData._id,
                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                            username: user.firstName,
                                            date: commnetData.date,
                                            replyUser: replyUser,
                                        }
                                        commentData.push(response)
                                    }

                                }
                            } else if (minutes > 0 && hours == 0) {
                                const getComment = await commentModel.findOne({ postId: createResponse._id });
                                finalPostedTime.push(`${minutes} minute`);
                                if (getComment == null) {
                                } else {
                                    for (const commnetData of getComment.comments) {
                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                        const replyUser = []
                                        for (const commentId of commnetData.replyUser) {
                                            const findUser = await userModal.findOne({
                                                _id: commentId.userId
                                            })

                                            const response = {
                                                commentId: commnetData._id,
                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                firstName: findUser.firstName,
                                                userId: findUser._id,
                                                replyId: commentId._id,
                                                replyMessage: commentId.replyMessage,
                                                date: commentId.date
                                            }

                                            replyUser.push(response)
                                        }
                                        const response = {
                                            userId: user._id,
                                            comment: commnetData.comment,
                                            commentId: commnetData._id,
                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                            username: user.firstName,
                                            date: commnetData.date,
                                            replyUser: replyUser,
                                        }
                                        commentData.push(response)
                                    }

                                }
                            } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                                const getComment = await commentModel.findOne({ postId: createResponse._id });
                                finalPostedTime.push(`${seconds} second`);
                                if (getComment == null) {
                                } else {
                                    for (const commnetData of getComment.comments) {
                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                        const replyUser = []
                                        for (const commentId of commnetData.replyUser) {
                                            const findUser = await userModal.findOne({
                                                _id: commentId.userId
                                            })

                                            const response = {
                                                commentId: commnetData._id,
                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                firstName: findUser.firstName,
                                                userId: findUser._id,
                                                replyId: commentId._id,
                                                replyMessage: commentId.replyMessage,
                                                date: commentId.date
                                            }

                                            replyUser.push(response)
                                        }
                                        const response = {
                                            userId: user._id,
                                            comment: commnetData.comment,
                                            commentId: commnetData._id,
                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                            username: user.firstName,
                                            date: commnetData.date,
                                            replyUser: replyUser,
                                        }
                                        commentData.push(response)
                                    }

                                }
                            }


                            const posts = {
                                _id: findUser._id,
                                userName: findUser.firstName,
                                email: findUser.email,
                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                postId: createResponse._id,
                                post_data: post,
                                description: createResponse.description,
                                like: createResponse.like,
                                comment: createResponse.comment,
                                report: createResponse.report
                            }

                            const findUserInLike = await likeModel.findOne({
                                postId: createResponse._id,
                                userId: findUser._id
                            })
                            if (findUserInLike) {
                                const response = {
                                    posts,
                                    finalPostedTime,
                                    commentData: commentData[0] == null ? [] : commentData,
                                    postShowStatus: 1
                                }

                                finalResponse.push(response)

                            } else {
                                const response = {
                                    posts,
                                    finalPostedTime,
                                    commentData: commentData[0] == null ? [] : commentData,
                                    postShowStatus: 0
                                }

                                finalResponse.push(response)

                            }


                        } else {
                            finalResponse.push()
                        }
                    }

                }

                if (finalResponse[0] == undefined) {
                    res.status(status.OK).json(
                        new APIResponse("all Images!", "true", 200, "1", [])
                    )
                } else {
                    res.status(status.OK).json(
                        new APIResponse("all Images!", "true", 200, "1", finalResponse)
                    )
                }

            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not Posted!", "false", 404, "0")
                )
            }
        } else {
            res.status(status.OK).json(
                new APIResponse("all Images!", "true", 200, "1", [])
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
        const data = await requestsModel.findOne({ userId: req.params.user_id });

        console.log(data);
        const user = await userModal.findOne({ _id: req.params.user_id })
        if (data != null && user != null) {


            const allRequestedEmail = data.RequestedEmails
            const requestedEmailWitchIsInuserRequeted = [];
            const allData = [];

            for (const result of allRequestedEmail) {

            }
            for (const result of allRequestedEmail) {
                const resultEmail = result.userId;

                const findInBlockUser = await blockUnblockModel.findOne({
                    userId: req.params.user_id,
                    "blockUnblockUser.blockUserId": resultEmail
                })

                console.log("findInBlockUser", findInBlockUser);


                const findInBlockUsers = await blockUnblockModel.findOne({
                    userId: resultEmail,
                    "blockUnblockUser.blockUserId": req.params.user_id
                })

                console.log("findInBlockUser", findInBlockUsers);

                if (findInBlockUser || findInBlockUsers) {

                } else {
                    requestedEmailWitchIsInuserRequeted.push(resultEmail);
                }


                allData.push(resultEmail)
            };
            allData.push(user._id)

            const meargAllTable = await userModal.aggregate([{
                $match: {
                    _id: {
                        $in: requestedEmailWitchIsInuserRequeted
                    }
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'req_data'
                }
            },
            {
                $lookup: {
                    from: 'requests',
                    let: {
                        userId: mongoose.Types.ObjectId(req.params.user_id),
                        id: "$_id"
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
                                                    "$$id", "$RequestedEmails.userId"
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






            const final_data = [];
            if (meargAllTable[0] == undefined) {

            } else {
                const emailDataDetail = meargAllTable[0].result;

                for (const emailData of emailDataDetail) {

                    for (const requestEmail of emailData) {

                        for (const meargAllTableEmail of meargAllTable) {
                            if ((requestEmail.userId).toString() == (meargAllTableEmail._id).toString()) {


                                if (requestEmail.accepted == 1) {

                                    const finalResponse = [];

                                    for (const allposts of meargAllTableEmail.posts) {


                                        for (const getallposts of allposts.posts) {

                                            const post = [];
                                            if (getallposts.post[0] != undefined) {

                                                for (const postwithType of getallposts.post) {


                                                    const getExt1Name = postwithType ? postwithType.res : null;
                                                    if (getExt1Name == null) {

                                                    } else {
                                                        const getExt1Name = path.extname(postwithType.res);

                                                        if (getExt1Name == ".mp4" || getExt1Name == ".mov" || getExt1Name == ".avi" || getExt1Name == ".wmv" || getExt1Name == ".m3u8" || getExt1Name == ".webm" || getExt1Name == ".flv" || getExt1Name == ".ts" || getExt1Name == ".3gp") {
                                                            post.push({
                                                                post: [
                                                                    {
                                                                        res: postwithType.res,
                                                                        type: "video"
                                                                    }
                                                                ],
                                                                description: getallposts.description,
                                                                like: getallposts.like,
                                                                comment: getallposts.comment,
                                                                report: getallposts.report,
                                                                _id: getallposts._id,
                                                                createdAt: getallposts.createdAt
                                                            })

                                                        } else {
                                                            post.push({
                                                                post: [
                                                                    {
                                                                        res: postwithType.res,
                                                                        type: "image"
                                                                    }
                                                                ],
                                                                description: getallposts.description,
                                                                like: getallposts.like,
                                                                comment: getallposts.comment,
                                                                report: getallposts.report,
                                                                _id: getallposts._id,
                                                                createdAt: getallposts.createdAt
                                                            })
                                                        }
                                                    }
                                                }

                                            } else {

                                                post.push({
                                                    post: [],
                                                    description: getallposts.description,
                                                    like: getallposts.like,
                                                    comment: getallposts.comment,
                                                    report: getallposts.report,
                                                    _id: getallposts._id,
                                                    createdAt: getallposts.createdAt
                                                })

                                            }

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
                                                if (getComment == null) {
                                                } else {
                                                    for (const commnetData of getComment.comments) {
                                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                                        const replyUser = []
                                                        for (const commentId of commnetData.replyUser) {
                                                            const findUser = await userModal.findOne({
                                                                _id: commentId.userId
                                                            })

                                                            const response = {
                                                                commentId: commnetData._id,
                                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                                firstName: findUser.firstName,
                                                                userId: findUser._id,
                                                                replyId: commentId._id,
                                                                replyMessage: commentId.replyMessage,
                                                                date: commentId.date

                                                            }

                                                            replyUser.push(response)
                                                        }
                                                        const response = {
                                                            userId: user._id,
                                                            comment: commnetData.comment,
                                                            commentId: commnetData._id,
                                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                                            username: user.firstName,
                                                            date: commnetData.date,
                                                            replyUser: replyUser,
                                                        }
                                                        commentData.push(response)
                                                    }

                                                }
                                            }
                                            if (days > 0 && days < 30) {
                                                const getComment = await commentModel.findOne({ postId: getallposts._id });
                                                finalPostedTime.push(`${days} days`);
                                                if (getComment == null) {
                                                } else {
                                                    for (const commnetData of getComment.comments) {
                                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                                        const replyUser = []
                                                        for (const commentId of commnetData.replyUser) {
                                                            const findUser = await userModal.findOne({
                                                                _id: commentId.userId
                                                            })

                                                            const response = {
                                                                commentId: commnetData._id,
                                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                                firstName: findUser.firstName,
                                                                userId: findUser._id,
                                                                replyId: commentId._id,
                                                                replyMessage: commentId.replyMessage,
                                                                date: commentId.date
                                                            }

                                                            replyUser.push(response)
                                                        }
                                                        const response = {
                                                            userId: user._id,
                                                            comment: commnetData.comment,
                                                            commentId: commnetData._id,
                                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                                            username: user.firstName,
                                                            date: commnetData.date,
                                                            replyUser: replyUser,
                                                        }
                                                        commentData.push(response)
                                                    }

                                                }
                                            } else if (hours > 0 && days == 0) {
                                                const getComment = await commentModel.findOne({ postId: getallposts._id });
                                                finalPostedTime.push(`${hours} hours`);

                                                if (getComment == null) {
                                                } else {
                                                    for (const commnetData of getComment.comments) {
                                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                                        const replyUser = []
                                                        for (const commentId of commnetData.replyUser) {

                                                            const findUser = await userModal.findOne({
                                                                _id: commentId.userId
                                                            })

                                                            const response = {
                                                                commentId: commnetData._id,
                                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                                firstName: findUser.firstName,
                                                                userId: findUser._id,
                                                                replyId: commentId._id,
                                                                replyMessage: commentId.replyMessage,
                                                                date: commentId.date
                                                            }

                                                            replyUser.push(response)
                                                        }
                                                        const response = {
                                                            userId: user._id,
                                                            comment: commnetData.comment,
                                                            commentId: commnetData._id,
                                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                                            username: user.firstName,
                                                            date: commnetData.date,
                                                            replyUser: replyUser,
                                                        }
                                                        commentData.push(response)
                                                    }

                                                }
                                            } else if (minutes > 0 && hours == 0) {


                                                const getComment = await commentModel.findOne({ postId: getallposts._id });
                                                finalPostedTime.push(`${minutes} minute`);


                                                if (getComment == null) {
                                                } else {
                                                    for (const commnetData of getComment.comments) {
                                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                                        const replyUser = []
                                                        for (const commentId of commnetData.replyUser) {
                                                            const findUser = await userModal.findOne({
                                                                _id: commentId.userId
                                                            })

                                                            const response = {
                                                                commentId: commnetData._id,
                                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                                firstName: findUser.firstName,
                                                                userId: findUser._id,
                                                                replyId: commentId._id,
                                                                replyMessage: commentId.replyMessage,
                                                                date: commentId.date
                                                            }

                                                            replyUser.push(response)
                                                        }
                                                        const response = {
                                                            userId: user._id,
                                                            comment: commnetData.comment,
                                                            commentId: commnetData._id,
                                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                                            username: user.firstName,
                                                            date: commnetData.date,
                                                            replyUser: replyUser,
                                                        }
                                                        commentData.push(response)
                                                    }

                                                }
                                            } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                                                const getComment = await commentModel.findOne({ postId: getallposts._id });
                                                finalPostedTime.push(`${seconds} second`);
                                                if (getComment == null) {
                                                } else {
                                                    for (const commnetData of getComment.comments) {
                                                        const user = await userModal.findOne({ _id: commnetData.userId })
                                                        const replyUser = []
                                                        for (const commentId of commnetData.replyUser) {
                                                            const findUser = await userModal.findOne({
                                                                _id: commentId.userId
                                                            })

                                                            const response = {
                                                                commentId: commnetData._id,
                                                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                                firstName: findUser.firstName,
                                                                userId: findUser._id,
                                                                replyId: commentId._id,
                                                                replyMessage: commentId.replyMessage,
                                                                date: commentId.date
                                                            }

                                                            replyUser.push(response)
                                                        }
                                                        const response = {
                                                            userId: user._id,
                                                            comment: commnetData.comment,
                                                            commentId: commnetData._id,
                                                            photourl: user.photo[0] ? user.photo[0].res : "",
                                                            username: user.firstName,
                                                            date: commnetData.date,
                                                            replyUser: replyUser,
                                                        }
                                                        commentData.push(response)
                                                    }

                                                }
                                            }

                                            const posts = [];
                                            posts.push(post)

                                            const finalPosts = [...post]

                                            const response = {
                                                userId: allposts.userId,
                                                finalPosts,
                                                finalPostedTime,
                                                commentData: commentData[0] == null ? [] : commentData
                                            }
                                            finalResponse.push(response);
                                        }
                                    }

                                    var status1 = {
                                        id: requestEmail.userId,
                                        posts: finalResponse
                                    }
                                    statusByEmail.push(status1)

                                } else {

                                }
                            }
                        }
                    }
                }


                const finalStatus = [];
                for (const [key, finalData] of meargAllTable.entries()) {
                    for (const [key, final1Data] of statusByEmail.entries())
                        if ((finalData._id).toString() == (final1Data.id).toString()) {
                            for (const data of final1Data.posts) {
                                if (data.finalPosts[0]) {
                                    const findUserInLike = await likeModel.findOne({
                                        postId: data.finalPosts[0]._id,
                                        reqUserId: req.params.user_id
                                    })

                                    const accessforComment = await settingModel.findOne({
                                        userId: data.userId
                                    })

                                    var access = accessforComment == null ? true : accessforComment.commentAccess

                                    const findUser = await userModal.findOne({
                                        email: finalData.email
                                    })
                                    if (findUserInLike) {
                                        for (const allPost of data.finalPosts) {
                                            finalStatus.push({
                                                posts: {
                                                    _id: findUser._id,
                                                    userName: findUser.firstName,
                                                    email: finalData.email,
                                                    profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                    postId: allPost._id,
                                                    post_data: allPost.post,
                                                    description: allPost.description,
                                                    like: allPost.like,
                                                    comment: allPost.comment,
                                                    report: allPost.report,
                                                    createdAt: allPost.createdAt,

                                                },
                                                finalPostedTime: data.finalPostedTime, commentData: data.commentData[0] == undefined ? [] : data.commentData, postShowStatus: 1, commentAccess: access

                                            })

                                        }
                                    } else {

                                        for (const allPost of data.finalPosts) {
                                            finalStatus.push({
                                                posts: {
                                                    _id: findUser._id,
                                                    userName: findUser.firstName,
                                                    email: finalData.email,
                                                    profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                                    postId: allPost._id,
                                                    post_data: allPost.post,
                                                    description: allPost.description,
                                                    like: allPost.like,
                                                    comment: allPost.comment,
                                                    report: allPost.report,
                                                    createdAt: allPost.createdAt
                                                },
                                                finalPostedTime: data.finalPostedTime, commentData: data.commentData[0] == undefined ? [] : data.commentData, postShowStatus: 0, commentAccess: access

                                            })

                                        }

                                    }
                                } else {

                                }


                            }
                        }
                }

                // const data = {
                //     posts: {
                //         // userId: findUser._id,
                //         // email: finalData.email,
                //         // userName: findUser.firstName,
                //         // profile: findUser.photo[0] ? findUser.photo[0].res : "",
                //         finalPosts: finalStatus
                //     },
                // }

                final_data.push(...finalStatus);
            }



            const meargAllTable2 = await userModal.aggregate([{
                $match: {
                    _id: mongoose.Types.ObjectId(req.params.user_id)
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: '_id',
                    foreignField: 'userId',
                    as: 'req_data'
                }
            },
            {
                $project: {
                    _id: "$_id",
                    posts: "$req_data"
                }
            }])

            for (const meargAllTableEmail of meargAllTable2) {

                const finalResponse = [];

                for (const allposts of meargAllTableEmail.posts) {

                    for (const getallposts of allposts.posts) {
                        const post = [];
                        for (const postwithType of (getallposts.post)) {

                            const getExt1Name = postwithType ? postwithType.res : null;
                            if (getExt1Name == null) {

                            } else {

                                const getExt1Name = path.extname(postwithType.res);
                                if (getExt1Name == ".mp4" || getExt1Name == ".mov" || getExt1Name == ".avi" || getExt1Name == ".wmv" || getExt1Name == ".m3u8" || getExt1Name == ".webm" || getExt1Name == ".flv" || getExt1Name == ".ts" || getExt1Name == ".3gp") {
                                    post.push({
                                        post: [
                                            {
                                                res: postwithType.res,
                                                type: "video"
                                            }
                                        ],
                                        description: getallposts.description,
                                        like: getallposts.like,
                                        comment: getallposts.comment,
                                        report: getallposts.report,
                                        _id: getallposts._id,
                                        createdAt: getallposts.createdAt
                                    })
                                } else {
                                    post.push({
                                        post: [
                                            {
                                                res: postwithType.res,
                                                type: "image"
                                            }
                                        ],
                                        description: getallposts.description,
                                        like: getallposts.like,
                                        comment: getallposts.comment,
                                        report: getallposts.report,
                                        _id: getallposts._id,
                                        createdAt: getallposts.createdAt
                                    })
                                }
                            }
                        }


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
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        }
                        if (days > 0 && days < 30) {
                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                            finalPostedTime.push(`${days} days`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (hours > 0 && days == 0) {
                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                            finalPostedTime.push(`${hours} hours`);

                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {


                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }

                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (minutes > 0 && hours == 0) {
                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                            finalPostedTime.push(`${minutes} minute`);
                            if (getComment == null) {
                            } else {


                                for (const commnetData of getComment.comments) {
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,

                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                            finalPostedTime.push(`${seconds} second`);
                            if (getComment == null) {
                            } else {

                                for (const commnetData of getComment.comments) {

                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }

                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        }

                        const posts = [];

                        posts.push(post)
                        const finalPosts = [...posts, ...posts]


                        const response = {
                            userId: allposts.userId,
                            finalPosts,
                            finalPostedTime,
                            commentData: commentData[0] == null ? [] : commentData
                        }
                        finalResponse.push(response);



                    }
                }
                var status1 = {
                    _id: meargAllTable2[0]._id,
                    posts: finalResponse
                }
                statusByEmail.push(status1)
            }

            const final_data1 = [];

            const finalStatus1 = [];
            for (const [key, finalData] of meargAllTable2.entries()) {
                for (const [key, final1Data] of statusByEmail.entries())
                    if (finalData._id === final1Data._id) {
                        for (const data of final1Data.posts) {
                            const findUserInLike = await likeModel.findOne({
                                postId: data.finalPosts[0][0]._id,
                                reqUserId: req.params.user_id
                            })

                            const findUser = await userModal.findOne({
                                _id: finalData._id
                            })

                            if (findUserInLike) {

                                for (const allPost of data.finalPosts[0]) {
                                    finalStatus1.push({
                                        posts: {
                                            _id: findUser._id,
                                            userName: findUser.firstName,
                                            email: finalData.email,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            postId: allPost._id,
                                            post_data: allPost.post,
                                            description: allPost.description,
                                            like: allPost.like,
                                            comment: allPost.comment,
                                            report: allPost.report,
                                            createdAt: allPost.createdAt
                                        },
                                        finalPostedTime: data.finalPostedTime, commentData: data.commentData[0] == undefined ? [] : data.commentData, postShowStatus: 1, commentAccess: true

                                    })

                                }
                            } else {

                                for (const allPost of data.finalPosts[0]) {
                                    finalStatus1.push({
                                        posts: {
                                            _id: findUser._id,
                                            userName: findUser.firstName,
                                            email: finalData.email,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            postId: allPost._id,
                                            post_data: allPost.post,
                                            description: allPost.description,
                                            like: allPost.like,
                                            comment: allPost.comment,
                                            report: allPost.report,
                                            createdAt: allPost.createdAt
                                        },
                                        finalPostedTime: data.finalPostedTime, commentData: data.commentData[0] == undefined ? [] : data.commentData, postShowStatus: 0, commentAccess: true

                                    })

                                }

                            }
                        }

                    }
            }


            for (const [key, finalData] of meargAllTable2.entries()) {

                const findUser = await userModal.findOne({
                    email: finalData.email
                })

                final_data.push(...finalStatus1);

            }

            const getNotification = await notificationModel.findOne({
                userId: req.params.user_id
            })

            console.log("getNotification", getNotification);
            var count = 0
            for (const allNotification of getNotification.notifications) {
                count = count + allNotification.read;
            }
            console.log("count", count);
            res.status(status.OK).json(
                new APIResponse("show all post When accept by the user", "true", 201, "1", final_data.sort((a, b) => b.posts.createdAt - a.posts.createdAt), count.toString())
            )
        } else if (user) {

            console.log("fwefwefwerf");
            const meargAllTable = await userModal.aggregate([{
                $match: {
                    _id: mongoose.Types.ObjectId(req.params.user_id)
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
                $project: {
                    email: "$email",
                    posts: "$req_data"
                }
            }])


            for (const meargAllTableEmail of meargAllTable) {

                const finalResponse = [];

                for (const allposts of meargAllTableEmail.posts) {

                    for (const getallposts of allposts.posts) {

                        const post = [];
                        for (const postwithType of getallposts.post) {
                            const getExt1Name = postwithType ? postwithType.res : null;
                            if (getExt1Name == null) {

                            } else {
                                const getExt1Name = path.extname(postwithType.res);
                                if (getExt1Name == ".mp4" || getExt1Name == ".mov" || getExt1Name == ".avi" || getExt1Name == ".wmv" || getExt1Name == ".m3u8" || getExt1Name == ".webm" || getExt1Name == ".flv" || getExt1Name == ".ts" || getExt1Name == ".3gp") {
                                    post.push({
                                        post: [
                                            {
                                                res: postwithType.res,
                                                type: "video"
                                            }
                                        ],
                                        description: getallposts.description,
                                        like: getallposts.like,
                                        comment: getallposts.comment,
                                        report: getallposts.report,
                                        _id: getallposts._id,
                                        createdAt: getallposts.createdAt
                                    })
                                } else {
                                    post.push({
                                        post: [
                                            {
                                                res: postwithType.res,
                                                type: "image"
                                            }
                                        ],
                                        description: getallposts.description,
                                        like: getallposts.like,
                                        comment: getallposts.comment,
                                        report: getallposts.report,
                                        _id: getallposts._id,
                                        createdAt: getallposts.createdAt
                                    })
                                }
                            }
                        }

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
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }

                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        }
                        if (days > 0 && days < 30) {
                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                            finalPostedTime.push(`${days} days`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }
                        } else if (hours > 0 && days == 0) {
                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                            finalPostedTime.push(`${hours} hours`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })


                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {

                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,

                                    }
                                    commentData.push(response)
                                }

                            }

                        } else if (minutes > 0 && hours == 0) {
                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                            finalPostedTime.push(`${minutes} minute`);

                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }
                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }

                        } else if (seconds > 0 && minutes == 0 && hours == 0 && days === 0) {
                            const getComment = await commentModel.findOne({ postId: getallposts._id });
                            finalPostedTime.push(`${seconds} second`);
                            if (getComment == null) {
                            } else {
                                for (const commnetData of getComment.comments) {
                                    const user = await userModal.findOne({ _id: commnetData.userId })
                                    const replyUser = []
                                    for (const commentId of commnetData.replyUser) {
                                        const findUser = await userModal.findOne({
                                            _id: commentId.userId
                                        })

                                        const response = {
                                            commentId: commnetData._id,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            firstName: findUser.firstName,
                                            userId: findUser._id,
                                            replyId: commentId._id,
                                            replyMessage: commentId.replyMessage,
                                            date: commentId.date
                                        }

                                        replyUser.push(response)
                                    }

                                    const response = {
                                        userId: user._id,
                                        comment: commnetData.comment,
                                        commentId: commnetData._id,
                                        photourl: user.photo[0] ? user.photo[0].res : "",
                                        username: user.firstName,
                                        date: commnetData.date,
                                        replyUser: replyUser,
                                    }
                                    commentData.push(response)
                                }

                            }

                        }

                        const posts = [];
                        posts.push(post)

                        const finalPosts = [...posts, ...posts]
                        const response = {
                            userId: allposts.userId,
                            finalPosts,
                            finalPostedTime,
                            commentData: commentData[0] == null ? [] : commentData
                        }
                        finalResponse.push(response);

                    }
                }
                var status1 = {
                    email: meargAllTable[0].email,
                    posts: finalResponse
                }
                statusByEmail.push(status1)
            }



            const final_data = [];

            const finalStatus = [];
            for (const [key, finalData] of meargAllTable.entries()) {
                for (const [key, final1Data] of statusByEmail.entries())
                    if (finalData.email === final1Data.email) {
                        for (const data of final1Data.posts) {


                            const findUserInLike = await likeModel.findOne({
                                postId: data.finalPosts[0]._id,
                                reqUserId: req.params.user_id
                            })

                            const findUser = await userModal.findOne({
                                email: finalData.email
                            })


                            if (findUserInLike) {
                                for (const allPost of data.finalPosts[0]) {
                                    finalStatus.push({
                                        posts: {
                                            _id: findUser._id,
                                            userName: findUser.firstName,
                                            email: finalData.email,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            postId: allPost._id,
                                            post_data: allPost.post,
                                            description: allPost.description,
                                            like: allPost.like,
                                            comment: allPost.comment,
                                            report: allPost.report,
                                            createdAt: allPost.createdAt
                                        },
                                        finalPostedTime: data.finalPostedTime, commentData: data.commentData[0] == undefined ? [] : data.commentData, postShowStatus: 1, commentAccess: true

                                    })

                                }
                            } else {
                                for (const allPost of data.finalPosts[0]) {
                                    finalStatus.push({
                                        posts: {
                                            _id: findUser._id,
                                            userName: findUser.firstName,
                                            email: finalData.email,
                                            profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                            postId: allPost._id,
                                            post_data: allPost.post,
                                            description: allPost.description,
                                            like: allPost.like,
                                            comment: allPost.comment,
                                            report: allPost.report,
                                            createdAt: allPost.createdAt
                                        },
                                        finalPostedTime: data.finalPostedTime, commentData: data.commentData[0] == undefined ? [] : data.commentData, postShowStatus: 0, commentAccess: true

                                    })

                                }
                            }

                        }
                    }
            }



            for (const [key, finalData] of meargAllTable.entries()) {
                const findUser = await userModal.findOne({
                    email: finalData.email
                })


                // const data = {
                //     // posts: {
                //     //     userId: findUser._id,
                //     //     email: finalData.email,
                //     //     userName: findUser.firstName,
                //     //     profile: findUser.photo[0] ? findUser.photo[0].res : "",
                //         finalPosts: finalStatus
                //     },
                // }

                final_data.push(...finalStatus);

            }

            const getNotification = await notificationModel.findOne({
                userId: req.params.user_id
            })

            console.log("getNotification", getNotification);
            var count = 0
            for (const allNotification of getNotification.notifications) {
                count = count + allNotification.read;
            }

            res.status(status.OK).json(
                new APIResponse("show all post When accept by the user", "true", 201, "1", final_data.sort((a, b) => b.posts.createdAt - a.posts.createdAt), count.toString())
            )
        }

    } catch (error) {
        console.log(error);
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


