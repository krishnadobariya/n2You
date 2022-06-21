const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const postModel = require("../model/post.model");
const userModel = require("../model/user.model");
const commentModel = require("../model/comment.model");

exports.CommetInsert = async (req, res, next) => {
    try {

        const findPost = await postModel.findOne({ "posts._id": req.params.postId });

        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );

        } else {
            const findUser = await userModel.findOne({ _id: req.params.userId });
            if (findUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found", "false", 404, "0")
                );
            } else {

                const findPostInCommentModel = await commentModel.findOne({ postId: req.params.postId })

                if (findPostInCommentModel) {

                    const finalData = {
                        userId: req.params.userId,
                        comment: req.body.comment
                    }

                    await commentModel.updateOne({ postId: req.params.postId }, { $push: { comments: finalData } });

                    res.status(status.OK).json(
                        new APIResponse("comment added successfully!", "true", 201, "1", finalData)
                    )
                } else {
                    const comment = commentModel({
                        userId: findPost.userId,
                        postId: req.params.postId,
                        comments: {
                            userId: req.params.userId,
                            comment: req.body.comment
                        }
                    })

                    const saveData = await comment.save();
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

        const findPost = await commentModel.findOne({ postId: req.params.postId })

        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );
        } else {
            const findUser = await userModel.findOne({ _id: req.params.userId });
            if (findUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found", "false", 404, "0")
                );
            } else {
                const findComment = await commentModel.findOne({ "comments._id": req.params.commentId })
                if (findComment == null) {
                    res.status(status.NOT_FOUND).json(
                        new APIResponse("Comment Not Found", "false", 404, "0")
                    );
                } else {

                    const postInComment = await commentModel.findOne({ postId: req.params.postId, "comments._id": req.params.commentId })

                    if (postInComment == null) {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("Not Found", "false", 404, "0")
                        );
                    } else {
                        const finalData = {
                            userId: req.params.userId,
                            replyMesage: req.body.replyMesage
                        }

                        await commentModel.updateOne({ postId: req.params.postId, "comments._id": req.params.commentId }, { $push: { "comments.$.replyUser": finalData } });

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

        const findPost = await commentModel.findOne({ postId: req.params.PostId });
        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );
        } else {
            const athorizeUser = await commentModel.findOne({
                postId: req.params.PostId,
                "comments._id": req.params.commentId,
                "comments.userId": req.params.UserId
            })

            if (athorizeUser == null) {
                res.status(status.UNAUTHORIZED).json(
                    new APIResponse("No Have any access", "false", 401, "0")
                );
            } else {
                await commentModel.updateOne({ postId: req.params.PostId, "comments._id": req.params.commentId }, { "comments.$.comment": req.body.comment });

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

        const findPost = await commentModel.findOne({ postId: req.params.PostId });
        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );
        } else {
            const athorizeUser = await commentModel.findOne({
                postId: req.params.PostId,
                "comments._id": req.params.commentId,
                "comments.userId": req.params.UserId
            })

            if (athorizeUser == null) {
                const athorizeUser = await commentModel.findOne({
                    postId: req.params.PostId,
                    userId: req.params.UserId
                })
                if (athorizeUser == null) {
                    res.status(status.UNAUTHORIZED).json(
                        new APIResponse("No Have any access", "false", 401, "0")
                    );
                } else {
                    await commentModel.updateOne(
                        {
                            postId: req.params.PostId,
                        },
                        {
                            $pull: {
                                comments: {
                                    _id: req.params.commentId
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
                        postId: req.params.PostId,
                    },
                    {
                        $pull: {
                            comments: {
                                _id: req.params.commentId
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
        const findPost = await commentModel.findOne({ postId: req.params.PostId });
        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", "false", 404, "0")
            );
        } else {
            const athorizeUser = await commentModel.findOne({
                postId: req.params.PostId,
                "comments._id": req.params.commentId,
                "comments.replyUser.userId": req.params.UserId,
                "comments.replyUser._id": req.params.commentReplayId
            })

            if (athorizeUser == null) {
                res.status(status.UNAUTHORIZED).json(
                    new APIResponse("No Have any access", "false", 401, "0")
                );
            } else {
                await commentModel.updateOne(
                    {
                        postId: req.params.PostId,
                        "comments.replyUser._id": req.params.commentReplayId
                    },
                    {
                        $set: {
                            "comments.$[].replyUser.$.replyMesage": req.body.replyMessage
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