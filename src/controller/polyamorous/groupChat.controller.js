const APIResponse = require("../../helper/APIResponse");
const status = require("http-status");
const groupChatModel = require("../../webSocket/models/groupChat.model");
const userModel = require("../../model/user.model");
const { default: mongoose } = require("mongoose");



exports.getGroupChat = async (req, res, next) => {
    try {

        const findRoom = await groupChatModel.findOne({
            chatRoomId: req.params.chat_room_id
        })

        console.log(findRoom);
        if (findRoom == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("r0oom Not Found!", "false", 404, "0")
            );
        } else {
            const allChat = []
            const chat = findRoom.chat

            for (const getChat of chat) {

                const findUser = await userModel.findOne({
                    _id: getChat.sender
                })


                const response = {
                    text: getChat.text,
                    photo: findUser.photo,
                    name: findUser.firstName
                }
                allChat.push(response)
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

exports.readUnreadMessageUserWise = async (req, res, next) => {
    try {

        const findRoom = await groupChatModel.findOne({
            chatRoomId: req.params.chat_room_id
        })

        if (findRoom == null) {
            res.status(status.NOT_FOUND).json(
                new APIResponse("room Not Found!", "false", 404, "0")
            );
        } else {

            var count = 0
            unReadMessage = [];
            const lastMessage = [];
            for (const chat of findRoom.chat) {
                for (const findReadOrUnread of chat.read) {
                    if ((findReadOrUnread.userId).toString() == (req.params.user_id).toString()) {
                        if (findReadOrUnread.read == 1) {
                            var count = count + findReadOrUnread.read;
                            lastMessage.push(chat.text);
                            const lastValue = lastMessage[lastMessage.length - 1];
                            const response = {
                                countUnreadMessage: count,
                                lastMessage: lastValue
                            }
                            unReadMessage.push(response)
                        } else {
                            var count = count + findReadOrUnread.read;
                        }

                    }
                }
            }



            if (count == 0) {
                res.status(status.OK).json(
                    new APIResponse("Read All Message", "true", 200, "1")
                );
            } else {
                res.status(status.OK).json(
                    new APIResponse("UnRead Message", "true", 200, "1", unReadMessage)
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