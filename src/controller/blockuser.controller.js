const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const userModel = require("../model/user.model");
const blockUnblockUserModel = require("../model/blockuser.model");
const { REQUEST_ENTITY_TOO_LARGE } = require("http-status");

exports.blockUser = async (req, res, next) => {
    try {

        const userFind = await userModel.findOne({ _id: req.params.userId });
        if (userFind == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", false, 404)
            );
        } else {
            const blockUserFound = await userModel.findOne({ _id: req.params.blockUserId })

            if (blockUserFound == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("blockUser Not Found", false, 404)
                );
            } else {
                if (req.params.blockUnblock == 1) {
                    const finduserIdInBlockModel = await blockUnblockUserModel.findOne({ userId: req.params.userId })
                    if (finduserIdInBlockModel == null) {
                        const blockUser = blockUnblockUserModel({
                            userId: req.params.userId,
                            blockUnblockUser: {
                                blockUserId: req.params.blockUserId,
                                blockUnblock: req.params.blockUnblock
                            }
                        })

                        const saveData = await blockUser.save();
                        res.status(status.CREATED).json(
                            new APIResponse("block Added", true, 201, saveData)
                        )
                    } else {
                        const finalData = {
                            blockUserId: req.params.blockUserId,
                            blockUnblock: req.params.blockUnblock
                        }

                        await blockUnblockUserModel.updateOne({ userId: req.params.userId }, { $push: { blockUnblockUser: finalData } });

                        res.status(status.OK).json(
                            new APIResponse("block added successfully!", true, 201, finalData)
                        )
                    }

                } else {
                    res.status(status.NOT_FOUND).json(
                        new APIResponse("Not allowed", false, 404)
                    );
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

exports.blockUserList = async (req, res, next) => {
    try {

        const userFound = await blockUnblockUserModel.findOne({ userId: req.params.userId })
        if (userFound == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", false, 404)
            );
        } else {
            const finalListOfBlockUser = [];
            console.log("userFound", userFound);
            for (const finalData of userFound.blockUnblockUser) {
                const blockUser = {
                    userId: finalData.blockUserId,
                    blockUnblock: 1
                }
                finalListOfBlockUser.push(blockUser)
            }

            res.status(status.CREATED).json(
                new APIResponse("block List!", true, 201, finalListOfBlockUser)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}


exports.unBlockUser = async (req, res, next) => {
    try {
        const userFound = await blockUnblockUserModel.findOne({ userId: req.params.userId })
        if (userFound == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", false, 404)
            );
        } else {
            const blockUserFound = await blockUnblockUserModel.findOne({ "blockUnblockUser._id": req.params.blockUserId })
            if (blockUserFound == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("blockUser Not Found", false, 404)
                );
            } else {
                const checkBlockUserExistInUser = await blockUnblockUserModel.findOne({ userId: req.params.userId, "blockUnblockUser._id": req.params.blockUserId })
                if (checkBlockUserExistInUser == null) {
                    res.status(status.NOT_FOUND).json(
                        new APIResponse("Not Found", false, 404)
                    );
                } else {
                    if (req.params.blockUnblock == 0) {
                        const unBlockUser = await blockUnblockUserModel.updateOne(
                            {
                                userId: req.params.userId,
                            },
                            {
                                $pull: {
                                    blockUnblockUser: {
                                        _id: req.params.blockUserId
                                    }
                                }
                            });

                        res.status(status.OK).json(
                            new APIResponse("unblockUser successfully!", true, 200)
                        )

                    } else {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("Not allowed", false, 404)
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