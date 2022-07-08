const APIResponse = require("../../helper/APIResponse");
const status = require("http-status");
const userModel = require("../../model/user.model");
const datingLikeDislikeUserModel = require("../../model/polyamorous/datingLikeDislikeUser.model");
const matchUserModel = require("../../model/polyamorous/matchUser.model");
const invitedFriendModel = require("../../model/polyamorous/invitedFriend.model");
const { default: mongoose } = require("mongoose");
const linkProfileModel = require("../../model/polyamorous/linkProfile.model");
const notificationModel = require("../../model/polyamorous/notification.model");
const groupChatRoomModels = require("../../webSocket/models/groupChatRoom.models");
const { update, updateOne } = require("../../model/user.model");


exports.getUserWhichNotChoiceForLikeOrDislike = async (req, res, next) => {
    try {

        const findUser = await userModel.findOne({
            _id: req.params.user_id,
            polyDating: "Polyamorous"
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", "false", 404, "0")
            );
        } else {

            const getAllUserWhichLoginAsPolyamorous = await userModel.find({
                polyDating: "Polyamorous"
            })

            if (getAllUserWhichLoginAsPolyamorous) {

                const findAllUser = await userModel.find({
                    _id:
                    {
                        $ne: req.params.user_id
                    },
                    polyDating: "Polyamorous"
                })

                const response = [];
                if (findAllUser) {
                    const findLinkProfileUser = await linkProfileModel.find({})

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
                                        photo: user1.photo[0] ? user1.photo[0].res : null
                                    },
                                    user2: {
                                        _id: user2._id,
                                        name: user2.firstName,
                                        gender: user2.identity,
                                        age: age2,
                                        photo: user2.photo[0] ? user2.photo[0].res : null
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
                                        photo: user1.photo[0] ? user1.photo[0].res : null
                                    },
                                    user2: {
                                        _id: user2._id,
                                        name: user2.firstName,
                                        gender: user2.identity,
                                        age: age2,
                                        photo: user2.photo[0] ? user2.photo[0].res : null
                                    },
                                    user3: {
                                        _id: user3._id,
                                        name: user3.firstName,
                                        gender: user3.identity,
                                        age: age3,
                                        photo: user3.photo[0] ? user3.photo[0].res : null
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
                                        photo: user1.photo[0] ? user1.photo[0].res : null
                                    },
                                    user2: {
                                        _id: user2._id,
                                        name: user2.firstName,
                                        gender: user2.identity,
                                        age: age2,
                                        photo: user2.photo[0] ? user2.photo[0].res : null
                                    },
                                    user3: {
                                        _id: user3._id,
                                        name: user3.firstName,
                                        gender: user3.identity,
                                        age: age3,
                                        photo: user3.photo[0] ? user3.photo[0].res : null
                                    },
                                    user4: {
                                        _id: user4._id,
                                        name: user4.firstName,
                                        gender: user4.identity,
                                        age: age4,
                                        photo: user4.photo[0] ? user4.photo[0].res : null
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
                                photo: allUser.photo[0] ? allUser.photo[0].res : null

                            }
                            response.push(userDetail)
                        }
                    }

                    const page = parseInt(req.query.page)
                    const limit = parseInt(req.query.limit)
                    const startIndex = (page - 1) * limit;
                    const endIndex = page * limit;

                    // if (endIndex < response.length) {
                    //     results.next = {
                    //         page: page + 1,
                    //         limit: limit
                    //     };
                    // }

                    // if (startIndex > 0) {
                    //     results.previous = {
                    //         page: page - 1,
                    //         limit: limit
                    //     };
                    // }

                    res.status(status.OK).json(
                        new APIResponse("get user", "true", 200, "1", response.slice(startIndex, endIndex))
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

exports.matchUsers = async (req, res, next) => {
    try {
        const findUsers = await datingLikeDislikeUserModel.findOne({
            userId: req.params.user_id,
        })

        if (findUsers == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found", "false", 404, "0")
            );
        } else {

            const matchUser = [];
            for (const allLiked of findUsers.LikeUser) {

                const findInOtherUserForMatching = await datingLikeDislikeUserModel.findOne({
                    userId: allLiked.LikeduserId
                })

                const findMatchUser = await datingLikeDislikeUserModel.findOne({
                    userId: allLiked.LikeduserId
                })

                const findInUserModel = await userModel.findOne({
                    _id: allLiked.LikeduserId
                })


                const findUser = await notificationModel.findOne({
                    userId: req.params.user_id
                })

                if (findUser == null) {
                    const existUser = await notificationModel.findOne({
                        userId: req.params.user_id,
                        notifications: {
                            $elemMatch: {
                                userId: mongoose.Types.ObjectId(findInUserModel._id),
                                notifications: `You found match with ${findInUserModel.firstName}`
                            }
                        }
                    })
                    if (existUser) {

                    } else {
                        const notificationData = notificationModel({
                            userId: req.params.user_id,
                            notifications: {
                                notifications: `You found match with ${findInUserModel.firstName}`,
                                userId: findInUserModel._id,
                                status: 1
                            }
                        })

                        await notificationData.save();
                    }

                } else {
                    const existUser = await notificationModel.findOne({
                        userId: req.params.user_id,
                        notifications: {
                            $elemMatch: {
                                userId: mongoose.Types.ObjectId(findInUserModel._id),
                                notifications: `You found match with ${findInUserModel.firstName}`
                            }
                        }
                    })

                    console.log("existUser", existUser);
                    if (existUser) {

                    } else {
                        await notificationModel.updateOne({
                            userId: req.params.user_id
                        }, {
                            $push: {
                                notifications: {
                                    notifications: `You found match with ${findInUserModel.firstName}`,
                                    userId: findInUserModel._id,
                                    status: 1
                                }
                            }
                        })
                    }
                }

                for (const matchUser of findMatchUser.LikeUser) {



                    if ((matchUser.LikeduserId).toString() == (findUsers.userId).toString()) {



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

            const allMatchUsers = [];
            for (const matchesUser of allMatchUser.allMatches) {
                const data = await userModel.findOne({
                    _id: matchesUser.matchId
                })

                let brithDate = new Date(data.birthDate);
                brithDate = brithDate.getFullYear();
                let currentDate = new Date(Date.now());
                currentDate = currentDate.getFullYear();

                const age = currentDate - brithDate

                const response = {
                    _id: data._id,
                    name: data.firstName,
                    profile: data.photo[0] ? data.photo[0].res : null,
                    age: age
                }

                allMatchUsers.push(response)
            }
            res.status(status.OK).json(
                new APIResponse("all Matches users", "true", 200, "1", allMatchUsers)
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
            _id: req.params.user_id,
            polyDating: "Polyamorous"
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found and not a Polyamorous type user", "false", 404, "0")
            );
        } else {

            const findPolyamorousUser = await userModel.findOne({
                _id: req.params.user_id,
                polyDating: "Polyamorous"
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
            _id: req.params.user_id,
            polyDating: "Polyamorous"
        })

        if (findUser == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found and not Polyamorous type user", "false", 404, "0")
            );
        } else {

            const allRequestList = [];

            for (const allUserInRequest of findUser.linkProfile) {

                const findInUserModel = await userModel.findOne({
                    _id: allUserInRequest.userId
                })

                const response = {
                    id: findInUserModel._id,
                    photo: findInUserModel.photo[0] ? findInUserModel.photo[0].res : null,
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
            polyDating: "Polyamorous"

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
            _id: req.params.user_id,
            polyDating: "Polyamorous"
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

                if ((findInLinkProfile1 || findInLinkProfile5)) {

                    if (findInLinkProfile1) {

                        await userModel.updateOne({
                            _id: mongoose.Types.ObjectId(req.params.user_id),
                            "linkProfile.userId": mongoose.Types.ObjectId(req.params.request_id),
                            polyDating: "Polyamorous"
                        }, {
                            $set: {
                                "linkProfile.$.accepted": 1
                            }
                        })

                        const createRoom = await groupChatRoomModels.findOne({
                            $or: [
                                {
                                    user1: req.params.user_id
                                },
                                {
                                    user2: req.params.user_id
                                },
                            ]
                        })

                        if (createRoom) {
                            await groupChatRoomModels.updateOne({
                                $or: [
                                    {
                                        user1: req.params.user_id
                                    },
                                    {
                                        user2: req.params.user_id
                                    },
                                ]
                            }, {
                                $set: {
                                    user3: req.params.request_id
                                }
                            })
                        }




                        const user2Id = [];
                        if (findInLinkProfile1.user1 == req.params.user_id) {
                            const findUser2Deatil = await userModel.findOne({
                                _id: findInLinkProfile1.user2
                            })
                            user2Id.push(findUser2Deatil.firstName)
                        } else {
                            const findUser2Deatil = await userModel.findOne({
                                _id: findInLinkProfile1.user1
                            })
                            user2Id.push(findUser2Deatil.firstName)
                        }
                        const findUser = await notificationModel.findOne({
                            userId: req.params.request_id
                        })


                        if (findUser == null) {

                            const findUser = await userModel.findOne({
                                _id: req.params.user_id
                            })

                            console.log(findUser);

                            const existUser = await notificationModel.findOne({
                                userId: req.params.request_id,
                                notifications: {
                                    $elemMatch: {
                                        notifications: `You are added in polyamorous group with ${findUser.firstName}, ${user2Id[0]}`
                                    }
                                }
                            })

                            if (existUser) {

                            } else {

                                const notificationData = notificationModel({
                                    userId: req.params.request_id,
                                    notifications: {
                                        notifications: `You are added in polyamorous group with ${findUser.firstName}, ${user2Id[0]}`,
                                        status: 2
                                    }
                                })

                                await notificationData.save();
                            }

                        } else {

                            const findUser = await userModel.findOne({
                                _id: req.params.user_id
                            })

                            const existUser = await notificationModel.findOne({
                                userId: req.params.request_id,
                                notifications: {
                                    $elemMatch: {
                                        notifications: `You are added in polyamorous group with ${findUser.firstName}, ${user2Id[0]}`
                                    }
                                }
                            })


                            if (existUser) {

                            } else {
                                await notificationModel.updateOne({
                                    userId: req.params.request_id
                                }, {
                                    $push: {
                                        notifications: {
                                            notifications: `You are added in polyamorous group with ${findUser.firstName}, ${user2Id[0]}`,
                                            status: 2
                                        }
                                    }
                                })
                            }
                        }

                        const user1 = findInLinkProfile1.user1

                        const findUser1 = await userModel.findOne({
                            _id: user1,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 1
                                }
                            },
                            polyDating: "Polyamorous"
                        })

                        const user2 = findInLinkProfile1.user2
                        const findUser2 = await userModel.findOne({
                            _id: user2,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 1
                                }
                            },
                            polyDating: "Polyamorous"

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
                                new APIResponse("updated link profile...!", "true", 200, "1")
                            );
                        } else {


                            const findUser1 = await userModel.findOne({
                                _id: user1,
                                linkProfile: {
                                    $elemMatch: {
                                        userId: mongoose.Types.ObjectId(req.params.request_id),
                                        accepted: 1
                                    }
                                },
                                polyDating: "Polyamorous"
                            })



                            const user2 = findInLinkProfile1.user2
                            const findUser2 = await userModel.findOne({
                                _id: user2,
                                linkProfile: {
                                    $elemMatch: {
                                        userId: mongoose.Types.ObjectId(req.params.request_id),
                                        accepted: 1
                                    }
                                },
                                polyDating: "Polyamorous"
                            })

                            res.status(status.OK).json(
                                new APIResponse("updated link profile....!", "true", 200, "1")
                            );
                        }
                    } else if (findInLinkProfile5) {

                        await userModel.updateOne({
                            _id: mongoose.Types.ObjectId(req.params.user_id),
                            "linkProfile.userId": mongoose.Types.ObjectId(req.params.request_id),
                            polyDating: "Polyamorous"
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
                            },
                            polyDating: "Polyamorous"
                        })


                        const user2 = findInLinkProfile5.user2
                        const findUser2 = await userModel.findOne({
                            _id: user2,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 1
                                }
                            },
                            polyDating: "Polyamorous"

                        })

                        const user3 = findInLinkProfile5.user3
                        const findUser3 = await userModel.findOne({
                            _id: user3,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 1
                                }
                            },
                            polyDating: "Polyamorous"

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
                        "linkProfile.userId": mongoose.Types.ObjectId(req.params.request_id),
                        polyDating: "Polyamorous"
                    }, {
                        $set: {
                            "linkProfile.$.accepted": 1
                        }
                    })

                    const createRoom = await groupChatRoomModels.findOne({
                        user1: req.params.user_id,
                        user2: req.params.request_id
                    })

                    console.log("createRoom", createRoom);
                    if (createRoom) {
                    } else {
                        const groupRoom = groupChatRoomModels({
                            groupName: "siya",
                            user1: req.params.user_id,
                            user2: req.params.request_id,
                        })

                        await groupRoom.save()

                    }

                    const findUser = await notificationModel.findOne({
                        userId: req.params.request_id
                    })

                    console.log(findUser);

                    if (findUser == null) {

                        const findUser = await userModel.findOne({
                            _id: req.params.user_id
                        })

                        const existUser = await notificationModel.findOne({
                            userId: req.params.user_id,
                            notifications: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    notifications: `You are added in polyamorous group with ${findUser.firstName}`,
                                }
                            }
                        })
                        if (existUser) {

                        } else {

                            const findUser = await userModel.findOne({
                                _id: req.params.user_id
                            })

                            const notificationData = notificationModel({
                                userId: req.params.request_id,
                                notifications: {
                                    notifications: `You are added in polyamorous group with ${findUser.firstName}`,
                                    status: 2
                                }
                            })

                            await notificationData.save();
                        }

                    } else {
                        const existUser = await notificationModel.findOne({
                            userId: req.params.request_id,
                            notifications: {
                                $elemMatch: {
                                    notifications: `You are added in polyamorous group with ${findUser.firstName}`,
                                }
                            }
                        })
                        if (existUser) {

                        } else {
                            await notificationModel.updateOne({
                                userId: req.params.request_id
                            }, {
                                $push: {
                                    notifications: {
                                        notifications: `You are added in polyamorous group with ${findUser.firstName}`,
                                        status: 2
                                    }
                                }
                            })
                        }
                    }


                    const saveLinkProfile = linkProfileModel({
                        user1: req.params.user_id,
                        user2: req.params.request_id
                    })

                    await saveLinkProfile.save();
                    res.status(status.OK).json(
                        new APIResponse("request Accepted!", "true", 200, "1")
                    );

                }
            } else if (req.query.accepted == "false") {

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

                if ((findInLinkProfile1 || findInLinkProfile5)) {

                    if (findInLinkProfile1) {

                        await userModel.updateOne({
                            _id: mongoose.Types.ObjectId(req.params.user_id),
                            "linkProfile.userId": mongoose.Types.ObjectId(req.params.request_id),
                            polyDating: "Polyamorous"
                        }, {
                            $set: {
                                "linkProfile.$.accepted": 2
                            }
                        })


                        const createRoom = await groupChatRoomModels.findOne({
                            $or: [
                                {
                                    user1: req.params.user_id
                                },
                                {
                                    user2: req.params.user_id
                                },
                            ]
                        })


                        if (createRoom) {
                            if (createRoom.user1 && createRoom.user2 && createRoom.user3 == undefined) {
                                await groupChatRoomModels.updateOne({
                                    $or: [
                                        {
                                            user1: req.params.user_id
                                        },
                                        {
                                            user2: req.params.user_id
                                        },
                                    ]
                                }, {
                                    $set: {
                                        user3: req.params.request_id
                                    }
                                })
                            } else if (createRoom.user1 && createRoom.user2 && createRoom.user3) {
                                await groupChatRoomModels.updateOne({
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
                                }, {
                                    $set: {
                                        user4: req.params.request_id
                                    }
                                })
                            }
                        }


                        const user1 = findInLinkProfile1.user1

                        const findUser1 = await userModel.findOne({
                            _id: user1,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 2 || 1
                                }
                            },
                            polyDating: "Polyamorous"
                        })

                        console.log(findUser1);

                        const user2 = findInLinkProfile1.user2
                    
                        const findUser2 = await userModel.findOne({
                            _id: user2,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 2 || 1
                                }
                            },
                            polyDating: "Polyamorous"

                        })

                        console.log(findUser2);

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

                            const findUser = await notificationModel.findOne({
                                userId: req.params.user_id
                            })


                            if (findUser == null) {

                                const findUser = await userModel.findOne({
                                    _id: req.params.request_id
                                })

                                console.log(findUser);

                                const existUser = await notificationModel.findOne({
                                    userId: req.params.user_id,
                                    notifications: {
                                        $elemMatch: {
                                            notifications: `There is Conflict of interest with ${findUser.firstName}, Please discuss in group`
                                        }
                                    }
                                })

                                if (existUser) {

                                } else {

                                    const notificationData = notificationModel({
                                        userId: req.params.user_id,
                                        notifications: {
                                            notifications: `There is Conflict of interest with ${findUser.firstName}, Please discuss in group`,
                                            userId: findUser._id,
                                            status: 3
                                        }
                                    })

                                    await notificationData.save();
                                }

                            } else {

                                const findUser = await userModel.findOne({
                                    _id: req.params.request_id
                                })

                                const existUser = await notificationModel.findOne({
                                    userId: req.params.user_id,
                                    notifications: {
                                        $elemMatch: {
                                            notifications: `There is Conflict of interest with ${findUser.firstName}, Please discuss in group`
                                        }
                                    }
                                })


                                if (existUser) {

                                } else {
                                    await notificationModel.updateOne({
                                        userId: req.params.user_id
                                    }, {
                                        $push: {
                                            notifications: {
                                                notifications: `There is Conflict of interest with ${findUser.firstName}, Please discuss in group`,
                                                status: 3
                                            }
                                        }
                                    })
                                }
                            }
                            res.status(status.OK).json(
                                new APIResponse("updated link profile...!", "true", 200, "1")
                            );
                        } else {
                            const findUser1 = await userModel.findOne({
                                _id: user1,
                                linkProfile: {
                                    $elemMatch: {
                                        userId: mongoose.Types.ObjectId(req.params.request_id),
                                        accepted: 2
                                    }
                                },
                                polyDating: "Polyamorous"
                            })

                            console.log("findUser1", findUser1);

                            const user2 = findInLinkProfile1.user2
                            const findUser2 = await userModel.findOne({
                                _id: user2,
                                linkProfile: {
                                    $elemMatch: {
                                        userId: mongoose.Types.ObjectId(req.params.request_id),
                                        accepted: 2
                                    }
                                },
                                polyDating: "Polyamorous"
                            })

                            console.log(user2);
                            res.status(status.OK).json(
                                new APIResponse("updated link profile!", "true", 200, "1")
                            );
                        }
                    } else if (findInLinkProfile5) {

                        await userModel.updateOne({
                            _id: mongoose.Types.ObjectId(req.params.user_id),
                            "linkProfile.userId": mongoose.Types.ObjectId(req.params.request_id),
                            polyDating: "Polyamorous"
                        }, {
                            $set: {
                                "linkProfile.$.accepted": 2
                            }
                        })

                        const user1 = findInLinkProfile5.user1

                        const findUser1 = await userModel.findOne({
                            _id: user1,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 2
                                }
                            },
                            polyDating: "Polyamorous"
                        })


                        const user2 = findInLinkProfile5.user2
                        const findUser2 = await userModel.findOne({
                            _id: user2,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 2
                                }
                            },
                            polyDating: "Polyamorous"

                        })

                        const user3 = findInLinkProfile5.user3
                        const findUser3 = await userModel.findOne({
                            _id: user3,
                            linkProfile: {
                                $elemMatch: {
                                    userId: mongoose.Types.ObjectId(req.params.request_id),
                                    accepted: 2
                                }
                            },
                            polyDating: "Polyamorous"

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
                        "linkProfile.userId": mongoose.Types.ObjectId(req.params.request_id),
                        polyDating: "Polyamorous"
                    }, {
                        $set: {
                            "linkProfile.$.accepted": 2
                        }
                    })

                    res.status(status.OK).json(
                        new APIResponse("reject link profile!", "true", 200, "1")
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