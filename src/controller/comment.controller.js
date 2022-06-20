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
                new APIResponse("Post Not Found", false, 404)
            );

        } else {
            const findUser = await userModel.findOne({ _id: req.params.userId });
            if (findUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found", false, 404)
                );
            } else {

                const findPostInCommentModel = await commentModel.findOne({ postId: req.params.postId })
                console.log("findPostInCommentModel", findPostInCommentModel);
                if (findPostInCommentModel) {

                    const finalData = {
                        userId: req.params.userId,
                        comment: req.body.comment
                    }

                    await commentModel.updateOne({ postId: req.params.postId }, { $push: { comments: finalData } });

                    res.status(status.OK).json(
                        new APIResponse("comment added successfully!", true, 201, finalData)
                    )
                } else {
                    const comment = commentModel({
                        postId: req.params.postId,
                        comments: {
                            userId: req.params.userId,
                            comment: req.body.comment
                        }
                    })

                    const saveData = await comment.save();
                    res.status(status.CREATED).json(
                        new APIResponse("comment Added", true, 201, saveData)
                    )
                }

            }
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}


exports.replyComment = async (req, res, next) => {
    try {

        const findPost = await commentModel.findOne({ postId: req.params.postId })

        if (findPost == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("Post Not Found", false, 404)
            );
        } else {
            const findUser = await userModel.findOne({ _id: req.params.userId });
            if (findUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found", false, 404)
                );
            } else {
                const findComment = await commentModel.findOne({ "comments._id": req.params.commentId })
                if (findComment == null) {
                    res.status(status.NOT_FOUND).json(
                        new APIResponse("Comment Not Found", false, 404)
                    );
                } else {

                    const postInComment = await commentModel.findOne({ postId: req.params.postId, "comments._id": req.params.commentId })

                    if (postInComment == null) {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("Not Found", false, 404)
                        );
                    } else {
                        const finalData = {
                            userId: req.params.userId,
                            replyMesage: req.body.replyMesage
                        }

                        await commentModel.updateOne({ postId: req.params.postId, "comments._id": req.params.commentId }, { $push: { "comments.$.replyUser": finalData } });

                        res.status(status.OK).json(
                            new APIResponse("Reply Added Successfully", true, 200, finalData)
                        );
                    }


                }
            }
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}