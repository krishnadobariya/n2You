const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const userModel = require("../model/user.model");
const settingModel = require("../model/setting.model");

exports.settingBasket = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id,
            polyDating: 0
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found and not a Social Meida & Dating type user", "false", 404, "0")
            );
        } else {

            const findUserInBasket = await settingModel.findOne({
                userId: req.params.user_id
            })

            if (findUserInBasket == null) {
                const settingModelDetail = await settingModel({
                    userId: req.params.user_id,
                    fullAccess: req.body.fullAccess,
                    thumpsUpAndDown: req.body.thumpsUpAndDown,
                })

                await settingModelDetail.save();

                res.status(status.CREATED).json(
                    new APIResponse("basket setting updated", "true", 201, "1")
                );
            } else {

                await settingModel.updateOne({
                    userId: req.params.user_id
                }, {
                    $set: {
                        fullAccess: req.body.fullAccess,
                        thumpsUpAndDown: req.body.thumpsUpAndDown
                    }
                })
                res.status(status.CREATED).json(
                    new APIResponse("basket setting updated", "true", 201, "1")
                );
            }
        }


    } catch (error) {

        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );

    }
}

exports.settingComment = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id,
            polyDating: 0
        })
        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found and not a Social Meida & Dating type user", "false", 404, "0")
            );
        } else {
            const findUserInSetting = await settingModel.findOne({
                userId: req.params.user_id
            })

            if (findUserInSetting == null) {
                const settingModelDetail = await settingModel({
                    userId: req.params.user_id,
                    commentAccess: req.body.comment_access
                })

                await settingModelDetail.save();

                res.status(status.CREATED).json(
                    new APIResponse("basket setting updated", "true", 201, "1")
                );
            } else {
                await settingModel.updateOne({
                    userId: req.params.user_id
                }, {
                    $set: {
                        commentAccess: req.body.comment_access
                    }
                })
                res.status(status.CREATED).json(
                    new APIResponse("basket setting updated", "true", 201, "1")
                );
            }
        }
    } catch (error) {

        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );

    }
}