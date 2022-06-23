const { default: mongoose } = require('mongoose');
const chatModel = require('../models/chat.models');
const chatRoomModel = require("../models/chatRoom.models");

exports.chaWithUser = async (arg, socket) => {
    try {

        const chatRoomFind = await chatRoomModel.findOne({
            userId: mongoose.Types.ObjectId(arg.user_id),
            requestedUserId: mongoose.Types.ObjectId(arg.requested_user_id)
        })
        console.log("chatRoomFind", chatRoomFind);

        if (chatRoomFind == null) {
            socket.emit("created", "Chat Room Not Created")
        } else {
            const findChatRoom = await chatModel.findOne({ chatRoomId: chatRoomFind._id })
            if (findChatRoom == null) {
                const chatobj = chatModel({
                    chatRoomId: chatRoomFind._id,
                    chat: {
                        sender: arg.sender,
                        text: arg.text
                    }

                })

                const insertData = await chatobj.save();

                socket.emit("created", "send successfully")
            } else {
                const finalData = {
                    sender: arg.sender,
                    text: arg.text
                }

                await chatModel.updateOne({ chatRoomId: chatRoomFind._id, }, { $push: { chat: finalData } });
                socket.emit("created", "send successfully")
            }

        }


    } catch (error) {
        console.log("error::", error);
    }
}