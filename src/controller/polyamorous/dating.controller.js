const APIResponse = require("../../helper/APIResponse");
const status = require("http-status");
const userModel = require("../../model/user.model");
const datingLikeDislikeUserModel = require("../../model/polyamorous/datingLikeDislikeUser.model");
const matchUserModel = require("../../model/polyamorous/matchUser.model");

exports.getUserWhichNotChoiceForLikeOrDislike = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", "false", 404, "0")
            );
        } else {

            const getAllUserWhichLoginAsPolyamorous = await userModel.find({
                "polyDating": "polyamorous"
            })

            if (getAllUserWhichLoginAsPolyamorous) {

                const findAllUser = await userModel.find({
                    _id:
                    {
                        $ne: req.params.user_id
                    },
                    "polyDating": "polyamorous"
                })

                const response = [];
                if (findAllUser) {
                    for (const allUser of findAllUser) {
                        const checkUserInLike = await datingLikeDislikeUserModel.findOne({
                            userId: req.params.user_id,
                            "LikeUser.LikeduserId": allUser._id
                        })

                        const checkUserInDisLike = await datingLikeDislikeUserModel.findOne({
                            userId: req.params.user_id,
                            "disLikeUser.disLikeduserId": allUser._id
                        })


                        if (checkUserInLike || checkUserInDisLike) {

                        } else {
                            const userDetail = {
                                name: allUser.firstName,
                                Bio: allUser.Bio,
                                hopingToFind: allUser.hopingToFind,
                                jobTitle: allUser.jobTitle,
                                wantChildren: allUser.wantChildren
                            }
                            response.push(userDetail)
                        }
                    }

                    res.status(status.OK).json(
                        new APIResponse("get user", "true", 200, "1", response.slice(req.query.skip, req.query.limit))
                    );

                } else {
                    res.status(status.NOT_FOUND).json(
                        new APIResponse("This User Not polyamorous!", "false", 404, "0")
                    );
                }
            } else {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("This User Not polyamorous!", "false", 404, "0")
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


exports.matchTable = async (req, res, next) => {
    try {

        const findUser = await datingLikeDislikeUserModel.findOne({
            userId: req.params.user_id
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", "false", 404, "0")
            );
        } else {

            const matchUser = [];
            for (const allLiked of findUser.LikeUser) {

                const findInOtherUserForMatching = await datingLikeDislikeUserModel.findOne({
                    userId: allLiked.LikeduserId
                })

                const findMatchUser = await datingLikeDislikeUserModel.findOne({
                    userId: allLiked.LikeduserId
                })

                for (const matchUser of findMatchUser.LikeUser) {

                    if ((matchUser.LikeduserId).toString() == (findUser.userId).toString()) {

                        const findinMatchUserModel = await matchUserModel.findOne({
                            userId: req.params.user_id
                        })

                        if (findinMatchUserModel == null) {
                            const saveInMatchUserModel = matchUserModel({
                                userId: req.params.user_id,
                                allMatches: {
                                    matchId: allLiked.LikeduserId
                                }
                            })

                            await saveInMatchUserModel.save();

                        } else {


                            const checkExiest = await matchUserModel.findOne({
                                userId: req.params.user_id,
                                "allMatches.matchId": allLiked.LikeduserId
                            })

                            if (checkExiest) {

                            } else {
                                await matchUserModel.updateOne({
                                    userId: req.params.user_id
                                }, {
                                    $push: {
                                        allMatches: {
                                            matchId: allLiked.LikeduserId
                                        }
                                    }
                                })
                            }
                        }
                    }
                }



            }

            const allMatchUser = await matchUserModel.findOne({
                userId: req.params.user_id
            })

            res.status(status.OK).json(
                new APIResponse("all Matches users", "true", 200, "1", allMatchUser.allMatches)
            );

        }

    } catch (error) {

        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, "0", error.message)
        );

    }
}


