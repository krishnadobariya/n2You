const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const userModel = require("../model/user.model");
const blockUnblockUserModel = require("../model/blockuser.model");

exports.blockUnblockUser = async (req, res, next) => {
    try {

        const userFind = await userModel.findOne({ _id: req.params.user_id, polyDating: 0 });
        if (userFind == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found and not Social Meida & Dating type user", "false", 404, "0")
            );
        } else {
            const blockUserFound = await userModel.findOne({ _id: req.params.block_user_id, polyDating: 0 })

            if (blockUserFound == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("blockUser Not Found which is Social Meida & Dating type user", "false", 404, "0")
                );

            } else {
                if (req.query.block_unblock == 1) {
                    const finduserIdInBlockModel = await blockUnblockUserModel.findOne({ userId: req.params.user_id })
                    if (finduserIdInBlockModel == null) {
                        const blockUser = blockUnblockUserModel({
                            userId: req.params.user_id,
                            blockUnblockUser: {
                                blockUserId: req.params.block_user_id,
                                blockUnblock: req.params.block_unblock
                            }
                        })

                        const saveData = await blockUser.save();
                        res.status(status.CREATED).json(
                            new APIResponse("block Added", "true", 201, "1")
                        )
                    } else {
                        const finalData = {
                            blockUserId: req.params.block_user_id,
                            blockUnblock: req.params.block_unblock
                        }

                        await blockUnblockUserModel.updateOne({ userId: req.params.user_id }, { $push: { blockUnblockUser: finalData } });

                        res.status(status.OK).json(
                            new APIResponse("block added successfully!", "false", 201, "1")
                        )
                    }

                } else if (req.query.block_unblock == 0) {
                    const unBlockUser = await blockUnblockUserModel.updateOne(
                        {
                            userId: req.params.user_id,
                        },
                        {
                            $pull: {
                                blockUnblockUser: {
                                    blockUserId: req.params.block_user_id
                                }
                            }
                        });

                    res.status(status.OK).json(
                        new APIResponse("unblockUser successfully!", "true", 200, "1")
                    )
                } else {
                    res.status(status.NOT_ACCEPTABLE).json(
                        new APIResponse("Not Allowed!", "false", 406, "0")
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

exports.blockUserList = async (req, res, next) => {
    try {
        const userFound = await blockUnblockUserModel.findOne({ userId: req.params.user_id })

        if (userFound == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", "false", 404, "0")
            );
        } else {
            const finalListOfBlockUser = [];

            for (const finalData of userFound.blockUnblockUser) {
                const findUser = await userModel.findOne({
                    _id: finalData.blockUserId,
                })
                const blockUser = {
                    photo: findUser.photo[0] ? findUser.photo[0].res : "",
                    name: findUser.firstName,
                    userId: finalData.blockUserId,
                    blockUnblock: 1
                }
                finalListOfBlockUser.push(blockUser)
            }

            res.status(status.CREATED).json(
                new APIResponse("block List!", "true", 201, "1", finalListOfBlockUser)
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}


// exports.unBlockUser = async (req, res, next) => {
//     try {
//         const userFound = await blockUnblockUserModel.findOne({ userId: req.params.user_id })
//         if (userFound == null) {
//             res.status(status.NOT_FOUND).json(
//                 new APIResponse("User Not Found", "false", 404, "0")
//             );
//         } else {
//             const blockUserFound = await blockUnblockUserModel.findOne({ "blockUnblockUser.blockUserId": req.params.block_user_id })
//             if (blockUserFound == null) {
//                 res.status(status.NOT_FOUND).json(
//                     new APIResponse("blockUser Not Found", "false", 404, "0")
//                 );
//             } else {
//                 const checkBlockUserExistInUser = await blockUnblockUserModel.findOne({ userId: req.params.user_id, "blockUnblockUser.blockUserId": req.params.block_user_id })
//                 if (checkBlockUserExistInUser == null) {
//                     res.status(status.NOT_FOUND).json(
//                         new APIResponse("Not Found", "false", 404, "0")
//                     );
//                 } else {
//                     if (req.params.block_unblock == 0) {
//                         const unBlockUser = await blockUnblockUserModel.updateOne(
//                             {
//                                 userId: req.params.user_id,
//                             },
//                             {
//                                 $pull: {
//                                     blockUnblockUser: {
//                                         blockUserId: req.params.block_user_id
//                                     }
//                                 }
//                             });

//                         res.status(status.OK).json(
//                             new APIResponse("unblockUser successfully!", "true", 200, "1")
//                         )

//                     } else {
//                         res.status(status.NOT_FOUND).json(
//                             new APIResponse("Not allowed", "false", 404, "0")
//                         );
//                     }
//                 }
//             }

//         }


//     } catch (error) {
//         console.log("Error:", error);
//         res.status(status.INTERNAL_SERVER_ERROR).json(
//             new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
//         );
//     }
// }
