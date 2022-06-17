const cloudinary = require("../utils/cloudinary.utils");
const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const postModal = require("../model/post.model");
const userModal = require("../model/user.model");
const { default: mongoose } = require("mongoose");
const requestsModel = require("../model/requests.model");


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
                }
                )
            })
        }

        const id = req.params.id
        const userFindForViedos = await userModal.findOne({ _id: id });

        if (userFindForViedos) {
            const checkInPost = await postModal.findOne({ userId: req.params.id });
            console.log(checkInPost);
            if (!checkInPost) {
                const urls = []
                const files = req.files

                for (const file of files) {
                    const { path } = file

                    const newPath = await cloudinaryImageUploadMethod(path)
                    urls.push(newPath)
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
                    new APIResponse("Posts Inserted successfully!", true, 201, saveData)
                )
            } else {
                const urls = []
                const files = req.files
                const finalData = [{
                    post: urls,
                    description: req.body.description
                }]

                for (const file of files) {
                    const { path } = file

                    const newPath = await cloudinaryImageUploadMethod(path)
                    urls.push(newPath)
                }
                const updatePosts = await postModal.updateOne({ userId: req.params.id }, { $push: { posts: finalData } })
                res.status(status.OK).json(
                    new APIResponse("Post added successfully!", true, 201, finalData)
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not found", false, 404)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
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
                }
                )
            })
        }
        const id = req.params.id
        const userFindForImages = await userModal.findOne({ _id: id });
        console.log(userFindForImages);
        if (userFindForImages) {
            const checkInPost = await postModal.findOne({ userId: id });
            if (!checkInPost) {
                const urls = [];
                const files = req.files;

                for (const file of files) {
                    const { path } = file

                    const newPath = await cloudinaryImageUploadMethod(path)
                    urls.push(newPath)
                }
                console.log(req.params.id);
                const posts = postModal({
                    userId: mongoose.Types.ObjectId(id),
                    posts: [{
                        post: urls,
                        description: req.body.description
                    }],
                    email: userFindForImages.email
                })
                console.log(posts);
                const saveData = await posts.save();
                res.status(status.CREATED).json(
                    new APIResponse("Posts Inserted successfully!", true, 201, saveData)
                )
            } else {
                const urls = []
                const files = req.files
                const finalData = [{
                    post: urls,
                    description: req.body.description
                }]


                console.log("final data", finalData);
                for (const file of files) {
                    const { path } = file

                    const newPath = await cloudinaryImageUploadMethod(path)
                    urls.push(newPath)
                }
                const updatePosts = await postModal.updateOne({ userId: req.params.id }, { $push: { posts: finalData } })
                res.status(status.OK).json(
                    new APIResponse("Post added successfully!", true, 201, finalData)
                )
            }

        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not found", false, 404)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}

// GetAll Posts User Wise

exports.getPostsbyUseId = async (req, res, next) => {
    try {
        const id = req.params.id
        const userFindInPosts = await postModal.findOne({ userId: id });
        if (userFindInPosts) {

            const userWisePosts = await postModal.findOne({ userId: req.params.id })
            console.log(userWisePosts);
            if (userWisePosts.posts) {
                const storeAllpostsUserWise = [];
                const getAllPostsUserWise = userWisePosts.posts;
                console.log("getAllPostsUserWise", getAllPostsUserWise);
                getAllPostsUserWise.map((result, index) => {
                    console.log("result", result);
                    storeAllpostsUserWise.unshift(result);
                })
                res.status(status.OK).json(
                    new APIResponse("successfully get all Posts!", true, 200, storeAllpostsUserWise)
                )
            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not Posted!", false, 404)
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

        const UserId = req.params.UserId;
        const PostId = req.params.PostId;

        const findData = await postModal.findOne({
            userId: UserId, "posts._id": PostId
        })
        if (findData) {
            const findPostAndUser = await postModal.updateOne(
                {
                    userId: UserId, "posts._id": PostId
                },
                {
                    $set: {
                        "posts.$.description": req.body.description
                    }
                })

            if (findPostAndUser.modifiedCount == 1) {
                res.status(status.OK).json(
                    new APIResponse("successfully Post Updated!", true, 200)
                )
            } else {
                res.status(status.INTERNAL_SERVER_ERROR).json(
                    new APIResponse("Somthing went Wrong", false, 500)
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User or Post Not Found!", false, 404)
            )
        }



    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}

exports.deletePost = async (req, res, next) => {
    try {
        const UserId = req.params.UserId;
        const PostId = req.params.PostId;

        const findData = await postModal.findOne({
            userId: UserId, "posts._id": PostId
        })
        console.log(findData);
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
                })

            if (findPostAndUser.modifiedCount == 1) {
                res.status(status.OK).json(
                    new APIResponse("successfully Post Deleted!", true, 200)
                )
            } else {
                res.status(status.INTERNAL_SERVER_ERROR).json(
                    new APIResponse("Somthing went Wrong", false, 500)
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User or Post Not Found!", false, 404)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}

exports.userAllFriendPost = async (req, res, next) => {
    try {

        const statusByEmail = [];
        const data = await requestsModel.findOne({ userEmail: req.params.UserEmail });
        console.log("data", data);
        const allRequestedEmail = data.RequestedEmails
        console.log("allRequestedEmail", allRequestedEmail);
        const requestedEmailWitchIsInuserRequeted = [];
        allRequestedEmail.map((result, next) => {
            const resultEmail = result.requestedEmail
            requestedEmailWitchIsInuserRequeted.push(resultEmail);
        })


        const meageAllTable = await userModal.aggregate([{
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

                    userEmail: req.params.UserEmail,
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


        const emailDataDetail = meageAllTable[0].result;

        for (const emailData of emailDataDetail) {

            for (const requestEmail of emailData) {

                for (const meageAllTableEmail of meageAllTable) {

                    console.log("meageAllTableEmail", meageAllTableEmail);

                    if (requestEmail.requestedEmail == meageAllTableEmail.email) {

                        if (requestEmail.accepted == 1) {
                            var status1 = {
                                email: requestEmail.requestedEmail,
                                posts: meageAllTableEmail.posts[0].posts
                            }
                            statusByEmail.push(status1)
                        } else {
                            var status2 = {
                                posts: "not accepted request",
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
                    finalStatus.push(final1Data)
                }
        }
        for (const [key, finalData] of meageAllTable.entries()) {

            const response = {
                data: finalStatus[key]
            }
            final_data.push(response);
        }


        res.status(status.OK).json(
            new APIResponse("show all post When accept by the user", true, 201, final_data)
        )
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        )
    }
}