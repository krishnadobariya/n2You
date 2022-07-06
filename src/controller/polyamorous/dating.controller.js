const APIResponse = require("../../helper/APIResponse");
const status = require("http-status");
const userModel = require("../../model/user.model");
const datingLikeDislikeUserModel = require("../../model/polyamorous/datingLikeDislikeUser.model");
const matchUserModel = require("../../model/polyamorous/matchUser.model");
const invitedFriendModel = require("../../model/polyamorous/invitedFriend.model");
const { default: mongoose } = require("mongoose");
const linkProfileModel = require("../../model/polyamorous/linkProfile.model");


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
                    const findLinkProfileUser = await linkProfileModel.find({})
                    console.log("findLinkProfileUser", findLinkProfileUser);

                    for (const data of findLinkProfileUser) {

                        const chekLikeProfileInLike = await datingLikeDislikeUserModel.findOne({
                            userId: req.params.user_id,
                            "LikeUser.LikeduserId": data._id
                        })

                        const chekLikeProfileInDisLike = await datingLikeDislikeUserModel.findOne({
                            userId: req.params.user_id,
                            "LikeUser.LikeduserId": data._id
                        })

                        if (chekLikeProfileInLike || chekLikeProfileInLike) {

                        } else {
                            if (data.user1 && data.user2 && data.user3 == undefined && data.user4 == undefined) {
                                console.log("efgvwefwe");
                                const user1 = await userModel.findOne({
                                    _id: data.user1
                                })
                                const user2 = await userModel.findOne({
                                    _id: data.user2
                                })



                                let brithDateUser1 = new Date(user1.birthDate);
                                brithDateUser1 = brithDateUser1.getFullYear();
                                let currentDate1 = new Date(Date.now());
                                currentDate1 = currentDate1.getFullYear();

                                const age1 = currentDate1 - brithDateUser1
                                let brithDateUser2 = new Date(user2.birthDate);
                                brithDateUser2 = brithDateUser2.getFullYear();
                                let currentDate2 = new Date(Date.now());
                                currentDate2 = currentDate2.getFullYear();

                                const age2 = currentDate2 - brithDateUser2

                                const userDetail = {
                                    user1: {
                                        _id: user1._id,
                                        name: user1.firstName,
                                        gender: user1.identity,
                                        age: age1,
                                        photo: user1.photo[0]
                                    },
                                    user2: {
                                        _id: user2._id,
                                        name: user2.firstName,
                                        gender: user2.identity,
                                        age: age2,
                                        photo: user2.photo[0]
                                    }
                                }
                                response.push(userDetail)

                            } else if (data.user1 && data.user2 && data.user3 && data.user4 == undefined) {

                                const user1 = await userModel.findOne({
                                    _id: data.user1
                                })
                                const user2 = await userModel.findOne({
                                    _id: data.user2
                                })
                                const user3 = await userModel.findOne({
                                    _id: data.user3
                                })

                                let brithDateUser1 = new Date(user1.birthDate);
                                brithDateUser1 = brithDateUser1.getFullYear();
                                let currentDate1 = new Date(Date.now());
                                currentDate1 = currentDate1.getFullYear();

                                const age1 = currentDate1 - brithDateUser1

                                let brithDateUser2 = new Date(user2.birthDate);
                                brithDateUser2 = brithDateUser2.getFullYear();
                                let currentDate2 = new Date(Date.now());
                                currentDate2 = currentDate2.getFullYear();

                                const age2 = currentDate2 - brithDateUser2

                                let brithDateUser3 = new Date(user3.birthDate);
                                brithDateUser3 = brithDateUser3.getFullYear();
                                let currentDate3 = new Date(Date.now());
                                currentDate3 = currentDate3.getFullYear();

                                const age3 = currentDate3 - brithDateUser3

                                const userDetail = {
                                    user1: {
                                        _id: user1._id,
                                        name: user1.firstName,
                                        gender: user1.identity,
                                        age: age1,
                                        photo: user1.photo[0]
                                    },
                                    user2: {
                                        _id: user2._id,
                                        name: user2.firstName,
                                        gender: user2.identity,
                                        age: age2,
                                        photo: user2.photo[0]
                                    },
                                    user3: {
                                        _id: user3._id,
                                        name: user3.firstName,
                                        gender: user3.identity,
                                        age: age3,
                                        photo: user3.photo[0]
                                    }
                                }
                                response.push(userDetail)
                            } else if (data.user1 && data.user2 && data.user3 && data.user4) {
                                const user1 = await userModel.findOne({
                                    _id: data.user1
                                })
                                const user2 = await userModel.findOne({
                                    _id: data.user2
                                })
                                const user3 = await userModel.findOne({
                                    _id: data.user3
                                })
                                const user4 = await userModel.findOne({
                                    _id: data.user4
                                })



                                let brithDateUser1 = new Date(user1.birthDate);
                                brithDateUser1 = brithDateUser1.getFullYear();
                                let currentDate1 = new Date(Date.now());
                                currentDate1 = currentDate1.getFullYear();

                                const age1 = currentDate1 - brithDateUser1

                                let brithDateUser2 = new Date(user2.birthDate);
                                brithDateUser2 = brithDateUser2.getFullYear();
                                let currentDate2 = new Date(Date.now());
                                currentDate2 = currentDate2.getFullYear();

                                const age2 = currentDate2 - brithDateUser2

                                let brithDateUser3 = new Date(user3.birthDate);
                                brithDateUser3 = brithDateUser3.getFullYear();
                                let currentDate3 = new Date(Date.now());
                                currentDate3 = currentDate3.getFullYear();

                                const age3 = currentDate3 - brithDateUser3

                                let brithDateUser4 = new Date(user4.birthDate);
                                brithDateUser4 = brithDateUser4.getFullYear();
                                let currentDate4 = new Date(Date.now());
                                currentDate4 = currentDate4.getFullYear();

                                const age4 = currentDate4 - brithDateUser4

                                const userDetail = {
                                    user1: {
                                        _id: user1._id,
                                        name: user1.firstName,
                                        gender: user1.identity,
                                        age: age1,
                                        photo: user1.photo[0]
                                    },
                                    user2: {
                                        _id: user2._id,
                                        name: user2.firstName,
                                        gender: user2.identity,
                                        age: age2,
                                        photo: user2.photo[0]
                                    },
                                    user3: {
                                        _id: user3._id,
                                        name: user3.firstName,
                                        gender: user3.identity,
                                        age: age3,
                                        photo: user3.photo[0]
                                    },
                                    user4: {
                                        _id: user4._id,
                                        name: user4.firstName,
                                        gender: user4.identity,
                                        age: age4,
                                        photo: user4.photo[0]
                                    }
                                }

                                response.push(userDetail)
                            }
                        }


                    }

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

                            let brithDate = new Date(allUser.birthDate);
                            brithDate = brithDate.getFullYear();
                            let currentDate = new Date(Date.now());
                            currentDate = currentDate.getFullYear();

                            const age = currentDate - brithDate

                            const userDetail = {
                                name: allUser.firstName,
                                gender: allUser.identity,
                                age: age,
                                photo: allUser.photo[0]

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

exports.getPolyamorousUser = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", "false", 404, "0")
            );
        } else {

            const findPolyamorousUser = await userModel.findOne({
                _id: req.params.user_id,
                polyDating: "polyamorous"
            })

            if (findPolyamorousUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("no User Found Which is not a Polyamorous ", "false", 404, "0")
                );
            } else {

                let brithDate = new Date(findPolyamorousUser.birthDate);
                brithDate = brithDate.getFullYear();
                let currentDate = new Date(Date.now());
                currentDate = currentDate.getFullYear();

                const age = currentDate - brithDate

                const response = {
                    email: findPolyamorousUser.email,
                    firstName: findPolyamorousUser.firstName,
                    gender: findPolyamorousUser.identity,
                    age: age,
                    relationshipSatus: findPolyamorousUser.relationshipSatus,
                    IntrestedIn: findPolyamorousUser.IntrestedIn,
                    Bio: findPolyamorousUser.Bio,
                    photo: findPolyamorousUser.photo,
                    hopingToFind: findPolyamorousUser.hopingToFind,
                    jobTitle: findPolyamorousUser.jobTitle,
                    wantChildren: findPolyamorousUser.wantChildren,
                    phoneNumber: findPolyamorousUser.phoneNumber,
                    bodyType: findPolyamorousUser.extraAtrribute.bodyType,
                    height: findPolyamorousUser.extraAtrribute.height,
                    smoking: findPolyamorousUser.extraAtrribute.smoking,
                    drinking: findPolyamorousUser.extraAtrribute.drinking,
                    hobbies: findPolyamorousUser.extraAtrribute.hobbies
                }
                res.status(status.OK).json(
                    new APIResponse("get Polyamorous User", "true", 200, "1", response)
                );

            }
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, "0", error.message)
        );
    }
}


exports.listLinkProfile = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", "false", 404, "0")
            );
        } else {

            const allRequestList = [];

            for (const allUserInRequest of findUser.linkProfile) {

                const findInUserModel = await userModel.findOne({
                    _id: allUserInRequest.userId
                })

                const response = {
                    id: findInUserModel._id,
                    photo: findInUserModel.photo,
                    name: findInUserModel.firstName
                }
                allRequestList.push(response)
            }

            res.status(status.OK).json(
                new APIResponse("link Profile List...", "true", 200, "1", allRequestList)
            );
        }


    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, "0", error.message)
        );
    }
}

exports.inviteFriends = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id,
            polyDating: "polyamorous"

        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found or user Not polyamorous...!", "false", 404, "0")
            );
        } else {
            const findValidUser = await userModel.findOne({
                _id: req.params.request_id,
                polyDating: "polyamorous"
            })

            if (findValidUser == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("User Not Found or user Not polyamorous...!", "false", 404, "0")
                );
            } else {

                const findInInvitedFriendModel = await invitedFriendModel.findOne({
                    userId: req.params.request_id
                })

                if (findInInvitedFriendModel == null) {
                    const insertInInvitedFriends = invitedFriendModel({
                        userId: req.params.request_id,
                        invitedFriends: {
                            userId: req.params.user_id
                        }
                    })

                    await insertInInvitedFriends.save();

                    res.status(status.OK).json(
                        new APIResponse("Inserted Invited Friends!", "true", 200, "1", insertInInvitedFriends)
                    );

                } else {

                    const findAlreadyExistFriend = await invitedFriendModel.findOne({
                        userId: req.params.request_id,
                        "invitedFriends.userId": req.params.user_id
                    })

                    if (findAlreadyExistFriend == null) {

                        await invitedFriendModel.updateOne({
                            userId: req.params.request_id,
                        }, {
                            $push: {
                                invitedFriends: {
                                    userId: req.params.user_id
                                }
                            }
                        })

                        const insertInInvitedFriends = {
                            userId: req.params.request_id,
                            invitedFriends: req.params.user_id
                        }

                        res.status(status.OK).json(
                            new APIResponse("Inserted Invited Friends!", "true", 200, "1", insertInInvitedFriends)
                        );

                    } else {
                        res.status(status.ALREADY_REPORTED).json(
                            new APIResponse("aleardy Invited!", "false", 208, "0")
                        );
                    }

                }
            }
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, "0", error.message)
        );
    }
}



exports.acceptedLinkProfile = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found or user Not polyamorous...!", "false", 404, "0")
            );
        } else {
            if (req.query.accepted == "true") {

                const findInLinkProfile1 = await linkProfileModel.findOne({
                    $and: [
                        {
                            $or: [
                                {
                                    user1: req.params.user_id
                                },
                                {
                                    user2: req.params.user_id
                                },
                            ]
                        },
                        {
                            user3: null
                        }
                    ]
                })

                console.log("findInLinkProfile1", findInLinkProfile1);

                const findInLinkProfile5 = await linkProfileModel.findOne({
                    $and: [
                        {
                            $or: [
                                {
                                    user1: req.params.user_id
                                },
                                {
                                    user2: req.params.user_id
                                },
                                {
                                    user3: req.params.user_id
                                },
                            ]
                        },
                        {
                            user4: null
                        }
                    ]
                })

                console.log("findInLinkProfile5", findInLinkProfile5);

                if ((findInLinkProfile1 || findInLinkProfile5)) {

                    if (findInLinkProfile1) {

                        await userModel.updateOne({
                            _id: mongoose.Types.ObjectId(req.params.user_id),
                            "linkProfile.userId": mongoose.Types.ObjectId(req.params.request_id)
                        }, {
                            $set: {
                                "linkProfile.$.accepted": 1
                            }
                        })

                        const user1 = findInLinkProfile1.user1

                        const findUser1 = await userModel.findOne({
                            _id: user1,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 1
                                }
                            }
                        })

                        const user2 = findInLinkProfile1.user2
                        const findUser2 = await userModel.findOne({
                            _id: user2,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 1
                                }
                            }

                        })

                        if (findUser1 && findUser2) {

                            await linkProfileModel.updateOne({
                                $or: [
                                    {
                                        user1: mongoose.Types.ObjectId(req.params.user_id)
                                    },
                                    {
                                        user2: mongoose.Types.ObjectId(req.params.user_id)
                                    }
                                ]
                            }, {
                                $set: {
                                    user3: req.params.request_id
                                }
                            })
                            res.status(status.OK).json(
                                new APIResponse("updated link profile!", "true", 200, "1")
                            );
                        } else {
                            res.status(status.OK).json(
                                new APIResponse("updated link profile!", "true", 200, "1")
                            );
                        }
                    } else if (findInLinkProfile5) {

                        await userModel.updateOne({
                            _id: mongoose.Types.ObjectId(req.params.user_id),
                            "linkProfile.userId": mongoose.Types.ObjectId(req.params.request_id)
                        }, {
                            $set: {
                                "linkProfile.$.accepted": 1
                            }
                        })

                        const user1 = findInLinkProfile5.user1

                        const findUser1 = await userModel.findOne({
                            _id: user1,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 1
                                }
                            }
                        })


                        const user2 = findInLinkProfile5.user2
                        const findUser2 = await userModel.findOne({
                            _id: user2,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 1
                                }
                            }

                        })

                        const user3 = findInLinkProfile5.user3
                        const findUser3 = await userModel.findOne({
                            _id: user3,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 1
                                }
                            }

                        })

                        if (findUser1 && findUser2 && findUser3) {

                            await linkProfileModel.updateOne({
                                $or: [
                                    {
                                        user1: mongoose.Types.ObjectId(req.params.user_id)
                                    },
                                    {
                                        user2: mongoose.Types.ObjectId(req.params.user_id)
                                    },
                                    {
                                        user3: mongoose.Types.ObjectId(req.params.user_id)
                                    }
                                ]
                            }, {
                                $set: {
                                    user4: req.params.request_id
                                }
                            })
                            res.status(status.OK).json(
                                new APIResponse("updated link profile!", "true", 200, "1")
                            );
                        } else {
                            res.status(status.OK).json(
                                new APIResponse("updated link profile!", "true", 200, "1")
                            );
                        }
                    }

                } else {
                    await userModel.updateOne({
                        _id: mongoose.Types.ObjectId(req.params.user_id),
                        "linkProfile.userId": mongoose.Types.ObjectId(req.params.request_id)
                    }, {
                        $set: {
                            "linkProfile.$.accepted": 1
                        }
                    })

                    const saveLinkProfile = linkProfileModel({
                        user1: req.params.user_id,
                        user2: req.params.request_id
                    })

                    await saveLinkProfile.save();
                    res.status(status.OK).json(
                        new APIResponse("request Accepted!", "true", 200, "1")
                    );

                }
            }

        }


    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, "0", error.message)
        );
    }
}