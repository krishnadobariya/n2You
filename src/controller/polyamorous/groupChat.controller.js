const APIResponse = require("../../helper/APIResponse");
const status = require("http-status");
const groupChatModel = require("../../webSocket/models/groupChat.model");
const userModel = require("../../model/user.model");
const { default: mongoose } = require("mongoose");
const groupChatRoomModels = require("../../webSocket/models/groupChatRoom.models");

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

            const chat = findRoom.chat;
            unReadMessage = [];
            const allChat = [];
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

exports.groupList = async (req, res, next) => {
    try {

        const findRoom = await groupChatRoomModels.find({})
        unReadMessage = [];
        const finalData = [];
        for (const allRoom of findRoom) {

            const findRoom = await groupChatModel.findOne({
                chatRoomId: allRoom._id
            })

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
                            countUnreadMessage: count,
                            lastMessage: lastValue.text,
                            createdAt: lastValue.createdAt,
                            groupName: allRoom.groupName,
                            profile: {
                                user1: userProfile1.photo[0] == undefined ? null : userProfile1.photo[0].res,
                                user2: userProfile2.photo[0] == undefined ? null : userProfile2.photo[0].res
                            }
                        }

                        unReadMessage.push(response);

                    }
                }
            }
        }

        let uniqueObjArray = [...new Map(unReadMessage.map((item) => [item["groupName"], item])).values()];
        finalData.push(uniqueObjArray)

        res.status(status.OK).json(
            new APIResponse("all group", true, 200, 1, finalData)
        );

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", false, 500, error.message)
        );
    }
}

