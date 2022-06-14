const cloudinary = require("../utils/cloudinary.utils");
const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const postModal = require("../model/post.model");
const userModal = require("../model/user.model");
exports.addPostVideo = async (req, res) => {
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
                    posts: [urls],
                })

                const saveData = await posts.save();
                res.status(status.CREATED).json(
                    new APIResponse("Posts Inserted successfully!", true, 200, saveData)
                )
            } else {
                const urls = []
                const files = req.files

                for (const file of files) {
                    const { path } = file

                    const newPath = await cloudinaryImageUploadMethod(path)
                    urls.push(newPath)
                }
                const updatePosts = await postModal.updateOne({ userId: req.params.id }, { $push: { posts: urls } })
                res.status(status.OK).json(
                    new APIResponse("Update successfully!", true, 201)
                )
            }
        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not found", true, 404)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", true, 500, error.message)
        )
    }
}

exports.addPostImages = async (req, res) => {
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

        if (userFindForImages) {
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
                    posts: [urls],
                })

                const saveData = await posts.save();
                res.status(status.CREATED).json(
                    new APIResponse("Posts Inserted successfully!", true, 200, saveData)
                )
            } else {
                const urls = []
                const files = req.files

                for (const file of files) {
                    const { path } = file

                    const newPath = await cloudinaryImageUploadMethod(path)
                    urls.push(newPath)
                }
                const updatePosts = await postModal.updateOne({ userId: req.params.id }, { $push: { posts: urls } })
                res.status(status.OK).json(
                    new APIResponse("Update successfully!", true, 201)
                )
            }

        } else {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not found", true, 404)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", true, 500, error.message)
        )
    }
}

exports.getPostsbyUseId = async (req, res) => {
    try {
        const id = req.params.id
        const userFindInPosts = await postModal.findOne({ userId: id });
        if (userFindInPosts) {
            const userWisePosts = await postModal.findOne({ userId: req.params.id })
            if (userWisePosts.posts) {
                res.status(status.OK).json(
                    new APIResponse("successfully get all Posts!", true, 200, userWisePosts.posts)
                )
            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("Not Posted!", true, 200)
                )
            }
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", true, 500, error.message)
        )
    }
}
