const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const chatModels = require("../webSocket/models/chat.models");
const { default: mongoose } = require("mongoose");
const chatRoomModel = require("../webSocket/models/chatRoom.model");
const userModel = require("../model/user.model");


exports.readChat = async (req, res, next) => {
    try {

        console.log(req.params.user_id);
        const findChatId = await chatModels.findOne({ chatRoomId: mongoose.Types.ObjectId(req.params.chat_room_id) })
        console.log(findChatId);
        if (findChatId == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("User Not Found in Chat", "true", 404, "0")
            )

        } else {
            await chatModels.updateMany({ chatRoomId: req.params.chat_room_id }, { $set: { "chat.$[].read": 1 } });

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

        console.log(findAllRecordInChat1);
        console.log(findAllRecordInChat2);
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
                    getAllChat.push(getChat.chat);
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
                new APIResponse("show all record with chat", true, 201, 1, response)
            )
        }


    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}

