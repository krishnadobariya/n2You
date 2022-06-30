const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const userModel = require("../model/user.model");
const thumbUpModel = require("../model/thumbUp.model");
const thumbDownModel = require("../model/thumDown.model");
const basketModel = require("../model/basket.model");

exports.thumbCount = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.admin_user_id
        })
        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User not found", "false", 404, "0")
            )
        } else {

            const findExistUser = await userModel.findOne({
                _id: req.params.user_id
            })


            const findExistUserInUser = await userModel.findOne({
                _id: req.params.req_user_id
            })

            if (findExistUser == null && findExistUserInUser == null) {


                res.status(status.NOT_FOUND).json(
                    new APIResponse("User not found", "false", 404, "0")
                )

            } else {

                if (req.query.value == 1) {


                    const findUserInBasket = await basketModel.findOne({
                        userId: req.params.admin_user_id
                    })

                    if (findUserInBasket == null) {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("Not In Basket", "false", 404, "0")
                        )
                    } else {
                        const accessBasket = findUserInBasket.thumpsUpAndDown

                        if (accessBasket == true) {
                            const updateThumb = await userModel.updateOne(
                                {
                                    _id: req.params.admin_user_id, "basket.userId": req.params.user_id
                                },

                                { $inc: { "basket.$.thumbUp": 1 } }
                            )

                            const checkInThumbModel = await thumbUpModel.find({
                                adminUserId: req.params.admin_user_id,
                            })


                            if (checkInThumbModel[0] == undefined) {


                                await thumbDownModel.updateOne(
                                    {
                                        adminUserId: req.params.admin_user_id
                                    },
                                    {
                                        $pull: {
                                            thumbDetail: {
                                                reqUserId: req.params.req_user_id,
                                                userId: req.params.user_id

                                            }
                                        }
                                    }
                                );

                                const insertThumbUp = thumbUpModel({
                                    adminUserId: req.params.admin_user_id,
                                    thumbDetail: {
                                        reqUserId: req.params.req_user_id,
                                        userId: req.params.user_id
                                    }
                                });


                                const findThumb = await thumbUpModel.findOne(
                                    {
                                        adminUserId: req.params.admin_user_id,
                                        "thumbDetail.reqUserId": req.params.req_user_id,
                                        "thumbDetail.userId": req.params.user_id
                                    }
                                );

                                if (findThumb) {
                                    const updateThumb = await userModel.updateOne(
                                        {
                                            _id: req.params.admin_user_id, "basket.userId": req.params.user_id
                                        },

                                        { $inc: { "basket.$.thumbDown": -1 } }
                                    )
                                }

                                await insertThumbUp.save();
                                res.status(status.CREATED).json(
                                    new APIResponse("thumbUp Added", "true", 201, "1")
                                );
                            } else {

                                const checkExiestReqUserId = await thumbUpModel.findOne({
                                    adminUserId: req.params.admin_user_id,
                                    "thumbDetail.reqUserId": req.params.req_user_id,
                                    "thumbDetail.userId": req.params.user_id
                                })


                                if (checkExiestReqUserId == null) {

                                    const checkExiestReqUserId = await thumbDownModel.findOne({
                                        adminUserId: req.params.admin_user_id,
                                        "thumbDetail.reqUserId": req.params.req_user_id,
                                        "thumbDetail.userId": req.params.user_id
                                    })

                                    if (checkExiestReqUserId != null) {

                                        await thumbDownModel.updateOne(
                                            {
                                                adminUserId: req.params.admin_user_id
                                            },
                                            {
                                                $pull: {
                                                    thumbDetail: {
                                                        reqUserId: req.params.req_user_id,
                                                        userId: req.params.user_id

                                                    }
                                                }
                                            }
                                        );

                                        const thumbAdd = await thumbUpModel.updateOne({ adminUserId: req.params.admin_user_id },
                                            {
                                                $push: {
                                                    thumbDetail: {
                                                        reqUserId: req.params.req_user_id,
                                                        userId: req.params.user_id
                                                    }
                                                }
                                            })

                                        const findThumb = await thumbUpModel.findOne(
                                            {
                                                adminUserId: req.params.admin_user_id,
                                                "thumbDetail.reqUserId": req.params.req_user_id,
                                                "thumbDetail.userId": req.params.user_id
                                            }
                                        );

                                        if (findThumb) {
                                            const updateThumb = await userModel.updateOne(
                                                {
                                                    _id: req.params.admin_user_id, "basket.userId": req.params.user_id
                                                },

                                                { $inc: { "basket.$.thumbDown": -1 } }
                                            )
                                        }

                                        res.status(status.OK).json(
                                            new APIResponse("thumUp Added successfully", "true", 200, "1")
                                        );

                                    } else {
                                        const thumbAdd = await thumbUpModel.updateOne({ adminUserId: req.params.admin_user_id },
                                            {
                                                $push: {
                                                    thumbDetail: {
                                                        reqUserId: req.params.req_user_id,
                                                        userId: req.params.user_id
                                                    }
                                                }
                                            })

                                        res.status(status.OK).json(
                                            new APIResponse("thumUp Added successfully", "true", 200, "1")
                                        );
                                    }


                                } else {

                                    const updateThumb = await userModel.updateOne(
                                        {
                                            _id: req.params.admin_user_id, "basket.userId": req.params.user_id
                                        },

                                        { $inc: { "basket.$.thumbUp": -1 } }
                                    )

                                    res.status(status.CREATED).json(
                                        new APIResponse("Already add ThumbUp", "true", 201, "1")
                                    );
                                }


                            }

                        } else {
                            res.status(status.NOT_ACCEPTABLE).json(
                                new APIResponse("Not have Any Access, All Access Lock By User", "false", 406, "0")
                            );

                        }

                    }

                } else if (req.query.value == 0) {

                    const findUserInBasket = await basketModel.findOne({
                        userId: req.params.admin_user_id
                    })

                    if (findUserInBasket == null) {
                        res.status(status.NOT_FOUND).json(
                            new APIResponse("Not In Basket", "false", 404, "0")
                        )
                    } else {
                        const accessBasket = findUserInBasket.thumpsUpAndDown

                        if (accessBasket == true) {
                            const updateThumb = await userModel.updateOne(
                                {
                                    _id: req.params.admin_user_id, "basket.userId": req.params.user_id
                                },

                                { $inc: { "basket.$.thumbDown": 1 } }
                            )

                            const checkInThumbModel = await thumbDownModel.find({
                                adminUserId: req.params.admin_user_id,
                            })


                            if (checkInThumbModel[0] == undefined) {


                                await thumbUpModel.updateOne(
                                    {
                                        adminUserId: req.params.admin_user_id
                                    },
                                    {
                                        $pull: {
                                            thumbDetail: {
                                                reqUserId: req.params.req_user_id,
                                                userId: req.params.user_id

                                            }
                                        }
                                    }
                                );


                                const insertThumbDown = thumbDownModel({
                                    adminUserId: req.params.admin_user_id,
                                    thumbDetail: {
                                        reqUserId: req.params.req_user_id,
                                        userId: req.params.user_id
                                    }
                                });


                                const findThumb = await thumbDownModel.findOne(
                                    {
                                        adminUserId: req.params.admin_user_id,
                                        "thumbDetail.reqUserId": req.params.req_user_id,
                                        "thumbDetail.userId": req.params.user_id
                                    }
                                );

                                if (findThumb) {
                                    const updateThumb = await userModel.updateOne(
                                        {
                                            _id: req.params.admin_user_id, "basket.userId": req.params.user_id
                                        },

                                        { $inc: { "basket.$.thumbUp": -1 } }
                                    )
                                }

                                await insertThumbDown.save();
                                res.status(status.CREATED).json(
                                    new APIResponse("thumbDown Added", "true", 201, "1")
                                );
                            } else {

                                const checkExiestReqUserId = await thumbDownModel.findOne({
                                    adminUserId: req.params.admin_user_id,
                                    "thumbDetail.reqUserId": req.params.req_user_id,
                                    "thumbDetail.userId": req.params.user_id
                                })


                                if (checkExiestReqUserId == null) {

                                    const checkExiestReqUserId = await thumbUpModel.findOne({
                                        adminUserId: req.params.admin_user_id,
                                        "thumbDetail.reqUserId": req.params.req_user_id,
                                        "thumbDetail.userId": req.params.user_id
                                    })

                                    if (checkExiestReqUserId != null) {
                                        await thumbUpModel.updateOne(
                                            {
                                                adminUserId: req.params.admin_user_id
                                            },
                                            {
                                                $pull: {
                                                    thumbDetail: {
                                                        reqUserId: req.params.req_user_id,
                                                        userId: req.params.user_id

                                                    }
                                                }
                                            }
                                        );

                                        const thumbAdd = await thumbDownModel.updateOne({ adminUserId: req.params.admin_user_id },
                                            {
                                                $push: {
                                                    thumbDetail: {
                                                        reqUserId: req.params.req_user_id,
                                                        userId: req.params.user_id
                                                    }
                                                }
                                            })


                                        const findThumb = await thumbDownModel.findOne(
                                            {
                                                adminUserId: req.params.admin_user_id,
                                                "thumbDetail.reqUserId": req.params.req_user_id,
                                                "thumbDetail.userId": req.params.user_id
                                            }
                                        );

                                        if (findThumb) {

                                            const updateThumb = await userModel.updateOne(
                                                {
                                                    _id: req.params.admin_user_id, "basket.userId": req.params.user_id
                                                },

                                                { $inc: { "basket.$.thumbUp": -1 } }
                                            )
                                        }
                                        res.status(status.OK).json(
                                            new APIResponse("thumDown add successfully", "true", 200, "1")
                                        );


                                    } else {
                                        const thumbAdd = await thumbDownModel.updateOne({ adminUserId: req.params.admin_user_id },
                                            {
                                                $push: {
                                                    thumbDetail: {
                                                        reqUserId: req.params.req_user_id,
                                                        userId: req.params.user_id
                                                    }
                                                }
                                            })

                                        res.status(status.OK).json(
                                            new APIResponse("thumDown Added successfully", "true", 200, "1")
                                        );
                                    }

                                } else {

                                    const updateThumbDown = await userModel.updateOne(
                                        {
                                            _id: req.params.admin_user_id, "basket.userId": req.params.user_id
                                        },

                                        { $inc: { "basket.$.thumbDown": -1 } }
                                    )

                                    res.status(status.CREATED).json(
                                        new APIResponse("Already add ThumbDowns", "true", 201, "1")
                                    );
                                }
                            }
                        } else {
                            res.status(status.NOT_ACCEPTABLE).json(
                                new APIResponse("Not have Any Access, All Access Lock By User", "false", 406, "0")
                            );
                        }
                    }


                }
            }
        }

    } catch (error) {
        console.log("error", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        )
    }
}