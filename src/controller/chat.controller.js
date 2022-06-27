const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const chatModels = require("../webSocket/models/chat.models");
const { default: mongoose } = require("mongoose");
const chatRoomModel = require("../webSocket/models/chatRoom.model");
const userModel = require("../model/user.model");


exports.readChat = async (req, res, next) => {
    try {

      
        const findChatId = await chatModels.findOne({ chatRoomId: mongoose.Types.ObjectId(req.params.chat_room_id) })

        if (findChatId == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found in Chat", "true", 404, "0")
            )

        } else {
            await chatModels.updateMany({ chatRoomId: req.params.chat_room_id }, { $set: { "chat.$[].read": 0 } });

            res.status(status.OK).json(
                new APIResponse("Read updated", "true", 200, "1")
            )
        }

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}


exports.getUserWithChat = async (req, res, next) => {
    try {

        const findAllRecordInChat1 = await chatRoomModel.find({ user1: req.params.user_id });
        const findAllRecordInChat2 = await chatRoomModel.find({ user2: req.params.user_id });

        if (findAllRecordInChat1[0] == undefined && findAllRecordInChat2[0] == undefined) {

            res.status(status.NOT_FOUND).json(
                new APIResponse("user don't chat with any person", "false", 404, "0")
            )

        } else {

            const meargeData = [...findAllRecordInChat1, ...findAllRecordInChat2]
            const data = await userModel.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(req.params.user_id)
                    }
                },
                {
                    $lookup: {
                        from: 'chatrooms',
                        let: {
                            firstUser: mongoose.Types.ObjectId(req.params.user_id),
                            secondUser: mongoose.Types.ObjectId(req.params.user_id)
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $or: [
                                            {
                                                $eq: [
                                                    "$user1",
                                                    "$$firstUser"
                                                ]
                                            },
                                            {
                                                $eq: [
                                                    "$user2",
                                                    "$$secondUser"
                                                ]
                                            }
                                        ]

                                    }
                                }
                            }
                        ],
                        as: "result"
                    }
                },
                {
                    $project: {
                        firstName: "$firstName",
                        email: "$email",
                        photo: "$photo",
                        result: "$result"
                    }
                }
            ])


            const getAllChat = [];
            const findData = data[0].result

            for (const getChatId of findData) {

                const data = await chatModels.find({
                    chatRoomId: getChatId._id
                })





                for (const getChat of data) {
                    const getAllChatUser = getChat.chat
                    const getChatPageWise = getAllChatUser.slice(req.query.skip, req.query.limit);
                    getAllChat.push(getChatPageWise);
                }
            }


            const response = {
                _id: data[0]._id,
                firstName: data[0].firstName,
                email: data[0].email,
                photo: data[0].photo,
                result: getAllChat
            }

            res.status(status.OK).json(
                new APIResponse("show all record with chat", "true", 201, "1", response)
            )
        }


    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}


exports.countReadUnreadMessage = async (req, res, next) => {
    try {

        const findData = await chatRoomModel.findOne({
            _id: mongoose.Types.ObjectId(req.params.chat_room),
            user1: mongoose.Types.ObjectId(req.params.user_1),
            user2: mongoose.Types.ObjectId(req.params.user_2)
        })



        if (findData == null) {
            const findData = await chatRoomModel.findOne({
                _id: mongoose.Types.ObjectId(req.params.chat_room),
                user1: req.params.user_2,
                user2: req.params.user_1
            })

            if (findData == null) {
                res.status(status.NOT_FOUND).json(
                    new APIResponse("not found user", "false", 404, "0")
                );
            } else {
                const data = await chatModels.aggregate([
                    {
                        $match: {
                            chatRoomId: mongoose.Types.ObjectId(req.params.chat_room)
                        }
                    },
                    {
                        $lookup: {
                            from: 'chatrooms',
                            let: {
                                chatRoom: mongoose.Types.ObjectId(req.params.chat_room)
                            },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: [
                                                "$_id",
                                                "$$chatRoom"
                                            ]
                                        }
                                    }
                                }
                            ],
                            as: "result"
                        }
                    },
                ])



                const getAllChat = data[0].chat;
                var defaltReadforUser1 = 0;
                var defaltReadforUser2 = 0;
                const unreadMessageByUser1 = [];
                const unreadMessageByuser2 = [];



                for (const getChat of getAllChat) {

                    if (getChat.sender == req.params.user_1) {
                        
                        var defaltReadforUser1 = defaltReadforUser1 + getChat.read;
                        const response = [{
                            unreadMessage: defaltReadforUser1,
                            unreadMessageUserId: req.params.user_2
                        }]

                        unreadMessageByUser1.push(response)

                    } else if (getChat.sender == req.params.user_2) {

                       
                        var defaltReadforUser2 = defaltReadforUser2 + getChat.read;
                        const response = [{
                            unreadMessage: defaltReadforUser2,
                            unreadMessageUserId: req.params.user_1
                        }]


                        unreadMessageByuser2.push(response)
                    }
                }

                const finalArray1 = unreadMessageByUser1[unreadMessageByUser1.length - 1];
                const finalArray2 = unreadMessageByuser2[unreadMessageByuser2.length - 1];

                if (finalArray1 && finalArray2) {
                    meargeAllUserUnreadMessage = [...finalArray1, ...finalArray2];
                    res.status(status.OK).json(
                        new APIResponse("show all unread 1 chat", true, 200, 1, meargeAllUserUnreadMessage)
                    )
                } else if (finalArray1) {

                    meargeAllUserUnreadMessage = [...finalArray1];
                    res.status(status.OK).json(
                        new APIResponse("show all unread 2 chat", true, 200, 1, meargeAllUserUnreadMessage)
                    )


                } else if (finalArray2) {

                    meargeAllUserUnreadMessage = [...finalArray2];
                    res.status(status.OK).json(
                        new APIResponse("show all unread 3 chat", true, 200, 1, meargeAllUserUnreadMessage)
                    )


                } else {

                    res.status(status.OK).json(
                        new APIResponse("somthing went Wrong", "false", 500, "1")
                    )

                }


            }
        } else {
            const data = await chatModels.aggregate([
                {
                    $match: {
                        chatRoomId: mongoose.Types.ObjectId(req.params.chat_room)
                    }
                },
                {
                    $lookup: {
                        from: 'chatrooms',
                        let: {
                            chatRoom: mongoose.Types.ObjectId(req.params.chat_room)
                        },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $eq: [
                                            "$_id",
                                            "$$chatRoom"
                                        ]
                                    }
                                }
                            }
                        ],
                        as: "result"
                    }
                },
            ])





            const getAllChat = data[0].chat;
            var defaltReadforUser1 = 0;
            var defaltReadforUser2 = 0;
            const unreadMessageByUser1 = [];
            const unreadMessageByuser2 = [];


            for (const getChat of getAllChat) {

                if (getChat.sender == req.params.user_1) {

                    var defaltReadforUser1 = defaltReadforUser1 + getChat.read;
                    const response = [{
                        unreadMessage: defaltReadforUser1,
                        unreadMessageUserId: req.params.user_2
                    }]

                    unreadMessageByUser1.push(response)

                } else if (getChat.sender == req.params.user_2) {


                    var defaltReadforUser2 = defaltReadforUser2 + getChat.read;
                    const response = [{
                        unreadMessage: defaltReadforUser2,
                        unreadMessageUserId: req.params.user_1
                    }]

                    unreadMessageByuser2.push(response)
                }
            }

            const finalArray1 = unreadMessageByUser1[unreadMessageByUser1.length - 1];
            const finalArray2 = unreadMessageByuser2[unreadMessageByuser2.length - 1];

            if (finalArray1 && finalArray2) {
                meargeAllUserUnreadMessage = [...finalArray1, ...finalArray2];
                res.status(status.OK).json(
                    new APIResponse("show all unread chat", true, 200, 1, meargeAllUserUnreadMessage)
                )


            } else if (finalArray1) {

                meargeAllUserUnreadMessage = [...finalArray1];
                res.status(status.OK).json(
                    new APIResponse("show all unread chat", true, 200, 1, meargeAllUserUnreadMessage)
                )


            } else if (finalArray2) {

                meargeAllUserUnreadMessage = [...finalArray2];
                res.status(status.OK).json(
                    new APIResponse("show all unread chat", true, 200, 1, meargeAllUserUnreadMessage)
                )


            } else {

                res.status(status.OK).json(
                    new APIResponse("somthing went Wrong", "false", 500, "1")
                )

            }



        }



    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}
