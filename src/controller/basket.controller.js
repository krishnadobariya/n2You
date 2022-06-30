const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const userModel = require("../model/user.model");
const basketModel = require("../model/basket.model");

exports.settingBasket = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", "false", 404, "0")
            );
        } else {

            const findUserInBasket = await basketModel.findOne({
                userId: req.params.user_id
            })

            if (findUserInBasket == null) {
                const basketModelDetail = await basketModel({
                    userId: req.params.user_id,
                    fullAccess: req.body.fullAccess,
                    thumpsUpAndDown: req.body.thumpsUpAndDown
                })

                await basketModelDetail.save();

                res.status(status.CREATED).json(
                    new APIResponse("basket setting updated", "true", 201, "1")
                );
            } else {

                await basketModel.updateOne({
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