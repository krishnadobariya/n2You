const chatRoomModel = require("../models/chatRoom.models");

exports.createRoom = async (arg, socket) => {
    try {

        const findChatRoom = await chatRoomModel.findOne({
            userId: arg.user_id,
            requestedUserId: arg.requested_user_id
        })

        if (findChatRoom == null) {
            const chatRoom = chatRoomModel({
                userId: arg.user_id,
                requestedUserId: arg.requested_user_id
            })

            const saveData = await chatRoom.save();
            socket.emit("createRoom", "charRoom Created")
        } else {
            socket.emit("createRoom", "allready Exist")
        }




    } catch (error) {

    }
}