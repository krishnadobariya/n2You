const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const chatModels = require("../webSocket/models/chat.models");
const { default: mongoose, get } = require("mongoose");
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


        const allChat = [];
        const chatRoom = [];

        const findRoom = await chatModels.findOne({
            chatRoomId: req.params.user_id
        });
        chatRoom.push(findRoom)

        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const chat = findRoom.chat;
        for (const finalchat of chat) {
            const response = {
                _id: finalchat.sender,
                text: finalchat.text,
                time: finalchat.createdAt,
                photo: finalchat.photo
            }

            allChat.push(response)
        }
        res.status(status.OK).json(
            new APIResponse("show all record with chat", "true", 201, "1", startIndex ? allChat.slice(startIndex, endIndex) : allChat)
        )

    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}


exports.allUserListWithUnreadCount = async (req, res, next) => {
    try {

        // const findData = await chatRoomModel.findOne({
        //     _id: mongoose.Types.ObjectId(req.params.chat_room),
        //     user1: mongoose.Types.ObjectId(req.params.user_1),
        //     user2: mongoose.Types.ObjectId(req.params.user_2)
        // })

        const findAllUserWithIchat = await chatRoomModel.find({
            $or: [{
                user1: req.params.user_id
            }, {
                user2: req.params.user_id
            }]
        })

        const unReadMessage = [];

        for (const roomId of findAllUserWithIchat) {

            const findRoom = await chatModels.findOne({
                chatRoomId: roomId._id
            })

            if (findRoom) {

                const userDetail = [];
                if (roomId.user1 == req.params.user_id) {
                    const userProfile = await userModel.findOne({
                        _id: roomId.user2
                    })
                    userDetail.push(userProfile)
                } else {
                    const userProfile = await userModel.findOne({
                        _id: roomId.user1
                    })

                    userDetail.push(userProfile)
                }


                var count = 0;
                const lastMessage = [];

                for (const getChat of findRoom.chat) {

                    var s_id = (getChat.sender).toString();
                    var u_id = (req.params.user_id).toString();

                    if (s_id == u_id) {
                        count = count + getChat.read;
                    } else {

                    }

                    const lastUnreadMessage = {
                        text: getChat.text,
                        createdAt: getChat.createdAt,
                        dateAndTime: getChat.dateAndTime
                    }

                    // console.log("lastUnreadMessage", lastUnreadMessage);
                    lastMessage.push(lastUnreadMessage);
                    const lastValue = lastMessage[lastMessage.length - 1];
                    // console.log("lastValue", lastValue);
                    const response = {
                        chatRoomId: findRoom.chatRoomId,
                        _id: userDetail[0]._id,
                        countUnreadMessage: count,
                        lastMessage: lastValue.text,
                        createdAt: lastValue.createdAt,
                        name: userDetail[0].firstName,
                        dateAndTime: lastValue.dateAndTime,
                        profile: userDetail[0].photo[0] == undefined ? "" : userDetail[0].photo[0].res,

                    }

                    unReadMessage.push(response);

                }
            }
        }


        let uniqueObjArray = [...new Map(unReadMessage.map((item) => [item["_id"], item])).values()];
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;


        // console.log("uniqueObjArray", uniqueObjArray);

        const data = uniqueObjArray[0].dateAndTime
        // console.log(data);
        // console.log("date is", new Date(data));
        res.status(status.OK).json(
            new APIResponse("all group", true, 200, 1, uniqueObjArray.slice(startIndex, endIndex).sort((a, b) => new Date(b.dateAndTime) - new Date(a.dateAndTime)))
        );
        // getAllChrRoomForPericularUser =


        // if (findData == null) {
        //     const findData = await chatRoomModel.findOne({
        //         _id: mongoose.Types.ObjectId(req.params.chat_room),
        //         user1: req.params.user_2,
        //         user2: req.params.user_1
        //     })

        //     if (findData == null) {
        //         res.status(status.NOT_FOUND).json(
        //             new APIResponse("not found user", "false", 404, "0")
        //         );
        //     } else {
        //         const data = await chatModels.aggregate([
        //             {
        //                 $match: {
        //                     chatRoomId: mongoose.Types.ObjectId(req.params.chat_room)
        //                 }
        //             },
        //             {
        //                 $lookup: {
        //                     from: 'chatrooms',
        //                     let: {
        //                         chatRoom: mongoose.Types.ObjectId(req.params.chat_room)
        //                     },
        //                     pipeline: [
        //                         {
        //                             $match: {
        //                                 $expr: {
        //                                     $eq: [
        //                                         "$_id",
        //                                         "$$chatRoom"
        //                                     ]
        //                                 }
        //                             }
        //                         }
        //                     ],
        //                     as: "result"
        //                 }
        //             },
        //         ])



        //         const getAllChat = data[0].chat;
        //         var defaltReadforUser1 = 0;
        //         var defaltReadforUser2 = 0;
        //         const unreadMessageByUser1 = [];
        //         const unreadMessageByuser2 = [];



        //         for (const getChat of getAllChat) {

        //             if (getChat.sender == req.params.user_1) {

        //                 var defaltReadforUser1 = defaltReadforUser1 + getChat.read;
        //                 const response = [{
        //                     unreadMessage: defaltReadforUser1,
        //                     unreadMessageUserId: req.params.user_2
        //                 }]

        //                 unreadMessageByUser1.push(response)

        //             } else if (getChat.sender == req.params.user_2) {


        //                 var defaltReadforUser2 = defaltReadforUser2 + getChat.read;
        //                 const response = [{
        //                     unreadMessage: defaltReadforUser2,
        //                     unreadMessageUserId: req.params.user_1
        //                 }]


        //                 unreadMessageByuser2.push(response)
        //             }
        //         }

        //         const finalArray1 = unreadMessageByUser1[unreadMessageByUser1.length - 1];
        //         const finalArray2 = unreadMessageByuser2[unreadMessageByuser2.length - 1];

        //         if (finalArray1 && finalArray2) {
        //             meargeAllUserUnreadMessage = [...finalArray1, ...finalArray2];
        //             res.status(status.OK).json(
        //                 new APIResponse("show all unread 1 chat", true, 200, 1, meargeAllUserUnreadMessage)
        //             )
        //         } else if (finalArray1) {

        //             meargeAllUserUnreadMessage = [...finalArray1];
        //             res.status(status.OK).json(
        //                 new APIResponse("show all unread 2 chat", true, 200, 1, meargeAllUserUnreadMessage)
        //             )


        //         } else if (finalArray2) {

        //             meargeAllUserUnreadMessage = [...finalArray2];
        //             res.status(status.OK).json(
        //                 new APIResponse("show all unread 3 chat", true, 200, 1, meargeAllUserUnreadMessage)
        //             )


        //         } else {

        //             res.status(status.OK).json(
        //                 new APIResponse("somthing went Wrong", "false", 500, "1")
        //             )

        //         }


        //     }
        // } else {
        //     const data = await chatModels.aggregate([
        //         {
        //             $match: {
        //                 chatRoomId: mongoose.Types.ObjectId(req.params.chat_room)
        //             }
        //         },
        //         {
        //             $lookup: {
        //                 from: 'chatrooms',
        //                 let: {
        //                     chatRoom: mongoose.Types.ObjectId(req.params.chat_room)
        //                 },
        //                 pipeline: [
        //                     {
        //                         $match: {
        //                             $expr: {
        //                                 $eq: [
        //                                     "$_id",
        //                                     "$$chatRoom"
        //                                 ]
        //                             }
        //                         }
        //                     }
        //                 ],
        //                 as: "result"
        //             }
        //         },
        //     ])





        //     const getAllChat = data[0].chat;
        //     var defaltReadforUser1 = 0;
        //     var defaltReadforUser2 = 0;
        //     const unreadMessageByUser1 = [];
        //     const unreadMessageByuser2 = [];


        //     for (const getChat of getAllChat) {

        //         if (getChat.sender == req.params.user_1) {

        //             var defaltReadforUser1 = defaltReadforUser1 + getChat.read;
        //             const response = [{
        //                 unreadMessage: defaltReadforUser1,
        //                 unreadMessageUserId: req.params.user_2
        //             }]

        //             unreadMessageByUser1.push(response)

        //         } else if (getChat.sender == req.params.user_2) {


        //             var defaltReadforUser2 = defaltReadforUser2 + getChat.read;
        //             const response = [{
        //                 unreadMessage: defaltReadforUser2,
        //                 unreadMessageUserId: req.params.user_1
        //             }]

        //             unreadMessageByuser2.push(response)
        //         }
        //     }

        //     const finalArray1 = unreadMessageByUser1[unreadMessageByUser1.length - 1];
        //     const finalArray2 = unreadMessageByuser2[unreadMessageByuser2.length - 1];

        //     if (finalArray1 && finalArray2) {
        //         meargeAllUserUnreadMessage = [...finalArray1, ...finalArray2];
        //         res.status(status.OK).json(
        //             new APIResponse("show all unread chat", true, 200, 1, meargeAllUserUnreadMessage)
        //         )


        //     } else if (finalArray1) {

        //         meargeAllUserUnreadMessage = [...finalArray1];
        //         res.status(status.OK).json(
        //             new APIResponse("show all unread chat", true, 200, 1, meargeAllUserUnreadMessage)
        //         )


        //     } else if (finalArray2) {

        //         meargeAllUserUnreadMessage = [...finalArray2];
        //         res.status(status.OK).json(
        //             new APIResponse("show all unread chat", true, 200, 1, meargeAllUserUnreadMessage)
        //         )


        //     } else {

        //         res.status(status.OK).json(
        //             new APIResponse("somthing went Wrong", "false", 500, "1")
        //         )

        //     }



        // }



    } catch (error) {
        console.log("Error:", error);
        res.status(status.INTERNAL_SERVER_ERROR).json(
            new APIResponse("Something Went Wrong", "false", 500, "0", error.message)
        );
    }
}
