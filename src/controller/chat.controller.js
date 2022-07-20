const APIResponse = require("../helper/APIResponse");
const status = require("http-status");
const chatModels = require("../webSocket/models/chat.models");
const { default: mongoose, get } = require("mongoose");
const chatRoomModel = require("../webSocket/models/chatRoom.model");
const userModel = require("../model/user.model");
const { find, aggregate } = require("../model/user.model");


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

        const findAllRecordInChat1 = await chatRoomModel.findOne({ user1: req.params.user_id });
        const findAllRecordInChat2 = await chatRoomModel.findOne({ user2: req.params.user_id });

        if (findAllRecordInChat1 == undefined && findAllRecordInChat2 == undefined) {

            res.status(status.NOT_FOUND).json(
                new APIResponse("user don't chat with any person", "false", 404, "0")
            )

        } else {

            const chatRoom = []
            if (findAllRecordInChat1 == null) {
                const user2 = findAllRecordInChat2._id
                const findRoom = await chatModels.findOne({
                    chatRoomId: user2
                });
                chatRoom.push(findRoom)
            } else {
                const user1 = findAllRecordInChat1._id
                const findRoom = await chatModels.findOne({
                    chatRoomId: user1
                });
                chatRoom.push(findRoom)
            }

            const page = parseInt(req.query.page)
            const limit = parseInt(req.query.limit)
            const startIndex = (page - 1) * limit;
            const endIndex = page * limit;
            const allChat = [];

            const chat = chatRoom[0].chat;

            for (const getChat of chat.slice(startIndex, endIndex)) {
                console.log("getChat", getChat);
                const findUser = await userModel.findOne({
                    _id: getChat.sender
                })

                const date = getChat.createdAt
                let dates = date.getDate();
                let month = date.toLocaleString('en-us', { month: 'long' });
                let year = date.getFullYear();
                let hours = date.getHours() + 5;
                let minutes = date.getMinutes() + 30;
                let ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12;
                minutes = minutes.toString().padStart(2, '0');
                let strTime = 'At' + ' ' + hours + ':' + minutes + ' ' + ampm + ' ' + 'on' + ' ' + month + ' ' + dates + ',' + year;

                const response = {
                    _id: findUser._id,
                    text: getChat.text,
                    photo: findUser.photo[0] ? findUser.photo[0].res : null,
                    name: findUser.firstName,
                    time: strTime
                }

                allChat.push(response)

            }
            res.status(status.OK).json(
                new APIResponse("show all record with chat", "true", 201, "1", allChat)
            )
        }
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

                    const date = getChat.createdAt
                    let hours = date.getHours();
                    let dates = date.getDate();
                    let month = date.toLocaleString('en-us', { month: 'long' });
                    let year = date.getFullYear();
                    let minutes = date.getMinutes();
                    let ampm = hours >= 12 ? 'pm' : 'am';
                    hours = hours % 12;
                    hours = hours ? hours : 12;
                    minutes = minutes.toString().padStart(2, '0');
                    let strTime = 'At' + ' ' + hours + ':' + minutes + ' ' + ampm + ' ' + 'on' + ' ' + month + ' ' + dates + ',' + year;

                    var count = count + getChat.read;
                    const lastUnreadMessage = {
                        text: getChat.text,
                        createdAt: strTime
                    }
                    lastMessage.push(lastUnreadMessage);
                    const lastValue = lastMessage[lastMessage.length - 1];
                    const response = {
                        _id: userDetail[0]._id,
                        countUnreadMessage: count,
                        lastMessage: lastValue.text,
                        createdAt: lastValue.createdAt,
                        name: userDetail[0].firstName,
                        profile: userDetail[0].photo[0] == undefined ? null : userDetail[0].photo[0].res,

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

        res.status(status.OK).json(
            new APIResponse("all group", true, 200, 1, uniqueObjArray.slice(startIndex, endIndex))
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
