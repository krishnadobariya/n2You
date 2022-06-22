const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const postModel = require("../model/post.model");
const userModel = require("../model/user.model");
const commentModel = require("../model/comment.model");
const { default: mongoose } = require("mongoose");

exports.CommetInsert = async (req, res, next) => {
    try {

        const findPost = await postModel.findOne({ "posts._id": req.params.post_id });

        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );

        } else {
            const findUser = await userModel.findOne({ _id: req.params.user_id });
            if (findUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found", "false", 404, "0")
                );
            } else {

                const findPostInCommentModel = await commentModel.findOne({ postId: req.params.post_id })

                if (findPostInCommentModel) {

                    const finalData = {
                        userId: req.params.user_id,
                        comment: req.body.comment
                    }

                    await commentModel.updateOne({ postId: req.params.post_id }, { $push: { comments: finalData } });
                    await postModel.updateOne({ "posts._id": req.params.post_id }, { $inc: { "posts.$.comment": 1 } });

                    res.status(status.OK).json(
                        new APIResponse("comment added successfully!", "true", 201, "1", finalData)
                    )
                } else {
                    const comment = commentModel({
                        userId: findPost.userId,
                        postId: req.params.post_id,
                        comments: {
                            userId: req.params.user_id,
                            comment: req.body.comment
                        }
                    })

                    const saveData = await comment.save();

                    await postModel.updateOne({ "posts._id": req.params.post_id }, { $inc: { "posts.$.comment": 1 } });
                    res.status(status.CREATED).json(
                        new APIResponse("comment Added", "true", 201, "1", saveData)
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


exports.replyComment = async (req, res, next) => {
    try {

        const findPost = await commentModel.findOne({ postId: req.params.post_id })

        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );
        } else {
            const findUser = await userModel.findOne({ _id: req.params.user_id });
            if (findUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found", "false", 404, "0")
                );
            } else {
                const findComment = await commentModel.findOne({ "comments._id": req.params.comment_id })
                if (findComment == null) {
                    res.status(status.NOT_FOUND).json(
                        new APIResponse("Comment Not Found", "false", 404, "0")
                    );
                } else {

                    const postInComment = await commentModel.findOne({ postId: req.params.post_id, "comments._id": req.params.comment_id })

                    if (postInComment == null) {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("Not Found", "false", 404, "0")
                        );
                    } else {
                        const finalData = {
                            userId: req.params.user_id,
                            replyMesage: req.body.replyMesage
                        }

                        await commentModel.updateOne({ postId: req.params.post_id, "comments._id": req.params.comment_id }, { $push: { "comments.$.replyUser": finalData } });

                        res.status(status.OK).json(
                            new APIResponse("Reply Added Successfully", "true", 200, "1", finalData)
                        );
                    }


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


exports.editComment = async (req, res, next) => {
    try {

        const findPost = await commentModel.findOne({ postId: req.params.post_id });
        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );
        } else {
            const athorizeUser = await commentModel.findOne({
                postId: req.params.post_id,
                "comments._id": req.params.comment_id
            })

            if (athorizeUser == null) {
                res.status(status.UNAUTHORIZED).json(
                    new APIResponse("No Have any access", "false", 401, "0")
                );
            } else {
                await commentModel.updateOne({ postId: req.params.post_id, "comments._id": req.params.comment_id }, { "comments.$.comment": req.body.comment });

                res.status(status.OK).json(
                    new APIResponse("Reply updated Successfully", "true", 200, "1")
                );
            }
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}

exports.deleteComment = async (req, res, next) => {
    try {

        const findPost = await commentModel.findOne({ postId: req.params.post_id });
        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );
        } else {
            const athorizeUser = await commentModel.findOne({
                postId: req.params.post_id,
                "comments._id": req.params.comment_id
            })

            if (athorizeUser == null) {
                const athorizeUser = await commentModel.findOne({
                    postId: req.params.post_id,
                    userId: req.params.user_id,

                })
                if (athorizeUser == null) {
                    res.status(status.UNAUTHORIZED).json(
                        new APIResponse("No Have any access", "false", 401, "0")
                    );
                } else {
                    await commentModel.updateOne(
                        {
                            postId: req.params.post_id,
                        },
                        {
                            $pull: {
                                comments: {
                                    _id: req.params.comment_id
                                }
                            }
                        }
                    );

                    res.status(status.OK).json(
                        new APIResponse("Reply updated Successfully", "true", 200, "1")
                    );
                }

            } else {
                await commentModel.updateOne(
                    {
                        postId: req.params.post_id,
                    },
                    {
                        $pull: {
                            comments: {
                                _id: req.params.comment_id
                            }
                        }
                    }
                );

                res.status(status.OK).json(
                    new APIResponse("Reply updated Successfully", "true", 200, "1")
                );
            }
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}

exports.replyCommentEdit = async (req, res, next) => {
    try {
        const findPost = await commentModel.findOne({ postId: req.params.post_id });
        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );
        } else {
            const athorizeUser = await commentModel.findOne({
                postId: req.params.post_id,
                "comments.replyUser._id": req.params.comment_reply_id
            })

            if (athorizeUser == null) {
                res.status(status.UNAUTHORIZED).json(
                    new APIResponse("No Have any access", "false", 401, "0")
                );
            } else {

                await commentModel.updateOne(
                    {
                        postId: mongoose.Types.ObjectId(req.params.post_id),
                        "comments.replyUser._id": req.params.comment_reply_id

                    },
                    {
                        $set: {
                            "comments.$.replyUser.$[i].replyMesage": req.body.replyMessage
                        },

                    },
                    { arrayFilters: [{ "i._id": req.params.comment_reply_id }] }
                );

                res.status(status.OK).json(
                    new APIResponse("Reply updated Successfully", "true", 200, "1")
                );
            }
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}

exports.replyCommitDelete = async (req, res, next) => {
    try {


        const findPost = await commentModel.findOne({ postId: req.params.post_id });
        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );
        } else {
            const athorizeUser = await commentModel.findOne({
                postId: req.params.post_id,
                "comments.replyUser._id": req.params.comment_reply_id
            })

            if (athorizeUser == null) {
                const athorizeUser = await commentModel.findOne({
                    postId: req.params.post_id,
                    userId: req.params.user_id,
                    "comments.replyUser._id": req.params.comment_reply_id
                })
                if (athorizeUser == null) {
                    res.status(status.UNAUTHORIZED).json(
                        new APIResponse("No Have any access", "false", 401, "0")
                    );
                } else {
                    await commentModel.updateOne(
                        {
                            postId: req.params.post_id,
                            userId: req.params.user_id,
                        },
                        {
                            $pull: {
                                "comments.$[].replyUser": {
                                    _id: req.params.comment_reply_id
                                }
                            }
                        },
                    );

                    res.status(status.OK).json(
                        new APIResponse("Reply deleted Successfully", "true", 200, "1")
                    );
                }

            } else {

                await commentModel.updateOne(
                    {
                        postId: mongoose.Types.ObjectId(req.params.post_id)

                    },
                    {
                        $pull: {
                            "comments.$[].replyUser": {
                                _id: req.params.comment_reply_id
                            }
                        }

                    },

                );

                res.status(status.OK).json(
                    new APIResponse("Reply deleted Successfully", "true", 200, "1")
                );
            }
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}
