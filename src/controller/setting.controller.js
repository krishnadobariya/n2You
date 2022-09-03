const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const userModel = require("../model/user.model");
const settingModel = require("../model/setting.model");
const router = require("../routes/user.routes");

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

exports.getBasketSetting = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })

        if (findUser) {
            const findUserInBasket = await settingModel.findOne({
                userId: req.params.user_id
            })

            if (findUserInBasket) {
                const data = {
                    userId: findUserInBasket.userId,
                    fullAccess: findUserInBasket.fullAccess,
                    thumpsUpAndDown: findUserInBasket.thumpsUpAndDown
                }
                res.status(status.OK).json(
                    new APIResponse("get Basket Setting", "true", 200, "1", data)
                );
            } else {

                const data = {
                    userId: req.params.user_id,
                    fullAccess: true,
                    thumpsUpAndDown: false
                }

                res.status(status.OK).json(
                    new APIResponse("get Basket Setting", "true", 200, "1", data)
                );
            }
        } else {
            res.status(status.OK).json(
                new APIResponse("user not found", "false", 404, "0")
            );
        }


    } catch (error) {

        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}

exports.getCommentSetting = async (req, res, next) => {
    try {
        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })

        if (findUser) {

            const findUserInSetting = await settingModel.findOne({
                userId: req.params.user_id
            })

            console.log("findUserInSetting", findUserInSetting);

            if (findUserInSetting) {
                const data = {
                    userId: findUserInSetting.userId,
                    commentAccess: findUserInSetting.fullAccess,
                }

                console.log(data);
                res.status(status.OK).json(
                    new APIResponse("get comment Setting", "true", 200, "1", data)
                );
            } else {

                const data = {
                    userId: req.params.user_id,
                    commentAccess: true,
                }

                console.log(data);

                res.status(status.OK).json(
                    new APIResponse("get comment Setting", "true", 200, "1", data)
                );
            }
        } else {
            res.status(status.OK).json(
                new APIResponse("user not found", "false", 404, "0")
            );
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}