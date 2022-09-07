const APIResponse = require("../../helper/APIResponse");
const status = require("http-status");
const groupChatModel = require("../../webSocket/models/groupChat.model");
const userModel = require("../../model/user.model");
const { default: mongoose } = require("mongoose");
const groupChatRoomModels = require("../../webSocket/models/groupChatRoom.models");
const chatRoomModel = require("../../webSocket/models/chatRoom.model");
const linkProfileModel = require("../../model/polyamorous/linkProfile.model");
const relationShipHistoryModel = require("../../model/polyamorous/relationShipHistory.model");

exports.getGroupChat = async (req, res, next) => {
    try {

        const findRoom = await groupChatModel.findOne({
            chatRoomId: req.params.chat_room_id
        })

        if (findRoom == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("room Not Found!", "false", 404, "0")
            );
        } else {

            const allChat = [];
            for (const finalChatUserWise of findRoom.chat) {
                for (const chatOrUser of finalChatUserWise.read) {
                    if (chatOrUser.userId == req.params.user_id) {
                        const chat = findRoom.chat;


                        const findUser = await userModel.findOne({
                            _id: finalChatUserWise.sender
                        })

                        const date = finalChatUserWise.createdAt
                        let hours = date.getHours();
                        let minutes = date.getMinutes();
                        let ampm = hours >= 12 ? 'pm' : 'am';
                        hours = hours % 12;
                        hours = hours ? hours : 12;
                        minutes = minutes.toString().padStart(2, '0');
                        let strTime = hours + ':' + minutes + ' ' + ampm;

                        const response = {
                            _id: findUser._id,
                            text: finalChatUserWise.text,
                            photo: findUser.photo[0] ? findUser.photo[0].res : "",
                            name: findUser.firstName,
                            time: strTime
                        }
                        allChat.push(response)
                    }

                }
            }

            res.status(status.OK).json(
                new APIResponse("get all Chat", true, 200, "1", allChat)
            );
        }
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}

exports.groupList = async (req, res, next) => {
    try {

        const findRoom = await groupChatRoomModels.find({})
        unReadMessage = [];
        const finalData = [];
        for (const allRoom of findRoom) {


            const findRoom = await groupChatModel.findOne({
                chatRoomId: allRoom._id
            })

            if (findRoom) {

                const userProfile1 = await userModel.findOne({
                    _id: allRoom.user1
                })

                const userProfile2 = await userModel.findOne({
                    _id: allRoom.user2
                })

                var count = 0;

                const lastMessage = [];

                for (const getChat of findRoom.chat) {
                    for (const findReadOrUnread of getChat.read) {

                        if ((findReadOrUnread.userId).toString() == (req.params.user_id).toString()) {



                            const date = getChat.createdAt
                            let hours = date.getHours();
                            let minutes = date.getMinutes();
                            let ampm = hours >= 12 ? 'pm' : 'am';
                            hours = hours % 12;
                            hours = hours ? hours : 12;
                            minutes = minutes.toString().padStart(2, '0');
                            let strTime = hours + ':' + minutes + ' ' + ampm;

                            var count = count + findReadOrUnread.read;
                            const lastUnreadMessage = {
                                text: getChat.text,
                                createdAt: strTime
                            }
                            lastMessage.push(lastUnreadMessage);
                            const lastValue = lastMessage[lastMessage.length - 1];

                            const response = {
                                _id: userProfile1._id,
                                countUnreadMessage: count,
                                lastMessage: lastValue.text,
                                createdAt: lastValue.createdAt,
                                groupName: allRoom.groupName,
                                profile: {
                                    user1: userProfile1.photo[0] == undefined ? "" : userProfile1.photo[0].res,
                                    user2: userProfile2.photo[0] == undefined ? "" : userProfile2.photo[0].res
                                }
                            }

                            unReadMessage.push(response);

                        }
                    }
                }

            }

        }

        let uniqueObjArray = [...new Map(unReadMessage.map((item) => [item["groupName"], item])).values()];
        finalData.push(uniqueObjArray)

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const data = finalData[0].length;
        const pageCount = Math.ceil(data / limit);
        res.status(status.OK).json({
            "message": "all group",
            "status": true,
            "code": 200,
            "statusCode": 1,
            "pageCount": (pageCount).toString() == (NaN).toString() ? 0 : pageCount,
            "data": (startIndex).toString() == (NaN).toString() ? finalData[0] : finalData[0].slice(startIndex, endIndex)

        })
    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}

exports.exitGroup = async (req, res, next) => {
    try {

        const findGrupRoom = await groupChatRoomModels.findOne({
            _id: req.params.group_room_id
        })

        if (findGrupRoom == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("group not Found", "false", 404, "0")
            );
        } else {


            if (findGrupRoom.user1 == req.params.user_id) {

                await groupChatRoomModels.updateOne({
                    _id: req.params.group_room_id
                }, {
                    $set: {
                        user1: null,
                    },
                })
            } else if (findGrupRoom.user2 == req.params.user_id) {

                await groupChatRoomModels.updateOne({
                    _id: req.params.group_room_id
                }, {
                    $set: {
                        user2: null,
                    },

                })
            } else if (findGrupRoom.user3 == req.params.user_id) {
                await groupChatRoomModels.updateOne({
                    _id: req.params.group_room_id
                }, {
                    $set: {
                        user3: null,
                    },

                })
            } else if (findGrupRoom.user4 == req.params.user_id) {
                await groupChatRoomModels.updateOne({
                    _id: req.params.group_room_id
                }, {
                    $set: {
                        user4: null,
                    },

                })
            }


            const findLinkProfileUser = await linkProfileModel.findOne({
                groupId: req.params.group_room_id
            })

            if (findLinkProfileUser == null) {

            } else {


                if (findLinkProfileUser.user1 == req.params.user_id) {
                    await linkProfileModel.updateOne({
                        groupId: req.params.group_room_id
                    }, {
                        $set: {
                            user1: null,
                        },

                    })
                } else if (findLinkProfileUser.user2 == req.params.user_id) {
                    await linkProfileModel.updateOne({
                        groupId: req.params.group_room_id
                    }, {
                        $set: {
                            user2: null,
                        },

                    })
                } else if (findLinkProfileUser.user3 == req.params.user_id) {
                    await linkProfileModel.updateOne({
                        groupId: req.params.group_room_id
                    }, {
                        $set: {
                            user3: null,
                        },

                    })
                } else if (findLinkProfileUser.user4 == req.params.user_id) {
                    await linkProfileModel.updateOne({
                        groupId: req.params.group_room_id
                    }, {
                        $set: {
                            user4: null,
                        },

                    })
                }
            }

            res.status(status.OK).json(
                new APIResponse("Exit group successfully", "true", 200, "1")
            );

        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}

exports.exitByGroupUser = async (req, res, next) => {
    try {

        const findGrupRoom = await groupChatRoomModels.findOne({
            _id: req.params.group_room_id
        })

        if (findGrupRoom == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("chat room not Found", "false", 404, "0")
            );
        } else {
            const allUser = [];
            if (findGrupRoom.user1 == req.params.exituser_id) {
                await groupChatRoomModels.updateOne({
                    _id: req.params.group_room_id
                }, {
                    $set: {
                        user1: null
                    }
                })

                allUser.push(findGrupRoom.user2, findGrupRoom.user3, findGrupRoom.user4)


            } else if (findGrupRoom.user2 == req.params.exituser_id) {
                await groupChatRoomModels.updateOne({
                    _id: req.params.group_room_id
                }, {
                    $set: {
                        user2: null
                    }
                })
                allUser.push(findGrupRoom.user1, findGrupRoom.user3, findGrupRoom.user4)
            } else if (findGrupRoom.user3 == req.params.exituser_id) {
                await groupChatRoomModels.updateOne({
                    _id: req.params.group_room_id
                }, {
                    $set: {
                        user3: null
                    }
                })
                allUser.push(findGrupRoom.user2, findGrupRoom.user1, findGrupRoom.user4)
            } else if (findGrupRoom.user4 == req.params.exituser_id) {
                await groupChatRoomModels.updateOne({
                    _id: req.params.group_room_id
                }, {
                    $set: {
                        user4: null
                    }
                })
                allUser.push(findGrupRoom.user2, findGrupRoom.user3, findGrupRoom.user1)
            }

            const findLinkProfileUser = await linkProfileModel.findOne({
                groupId: req.params.group_room_id
            })

            if (findLinkProfileUser == null) {

            } else {


                if (findLinkProfileUser.user1 == req.params.exituser_id) {
                    await linkProfileModel.updateOne({
                        groupId: req.params.group_room_id
                    }, {
                        $set: {
                            user1: null,
                        },

                    })
                } else if (findLinkProfileUser.user2 == req.params.exituser_id) {
                    await linkProfileModel.updateOne({
                        groupId: req.params.group_room_id
                    }, {
                        $set: {
                            user2: null,
                        },

                    })
                } else if (findLinkProfileUser.user3 == req.params.exituser_id) {
                    await linkProfileModel.updateOne({
                        groupId: req.params.group_room_id
                    }, {
                        $set: {
                            user3: null,
                        },

                    })
                } else if (findLinkProfileUser.user4 == req.params.exituser_id) {
                    await linkProfileModel.updateOne({
                        groupId: req.params.group_room_id
                    }, {
                        $set: {
                            user4: null,
                        },

                    })
                }
            }


            const userName = [];
            for (const getDetail of allUser) {
                if (getDetail == null) {

                } else {

                    const findUser = await userModel.findOne({
                        _id: getDetail
                    })

                    userName.push(findUser.firstName);
                }
            }


            if (userName.length == 3) {

                await relationShipHistoryModel.updateOne({
                    userId: req.params.exituser_id
                }, {
                    $push:
                    {
                        relastionShipHistory: {
                            message: `You got removed from Poly group by ${userName[0]}, ${userName[1]}, ${userName[2]}'s Poly group`
                        }
                    }
                })

            } else if (userName.length == 2) {

                await relationShipHistoryModel.updateOne({
                    userId: req.params.exituser_id
                }, {
                    $push:
                    {
                        relastionShipHistory: {
                            message: `You got removed from Poly group by ${userName[0]}, ${userName[1]}'s Poly group`
                        }
                    }
                })


            } else if (userName.length == 1) {
                await relationShipHistoryModel.updateOne({
                    userId: req.params.exituser_id
                }, {
                    $push:
                    {
                        relastionShipHistory: {
                            message: `You got removed from Poly group by ${userName[0]}'s Poly group`
                        }
                    }
                })
            }
            res.status(status.OK).json(
                new APIResponse("Exit group successfully by group mamber", "true", 200, "1")
            );

        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}