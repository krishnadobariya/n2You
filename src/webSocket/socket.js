
const chatModels = require("./models/chat.models");
const chatRoomModel = require("./models/chatRoom.model");
const Notification = require("../helper/firebaseHelper");
const userModel = require("../model/user.model");
function socket(io) {

    console.log("socket connected...");

    io.on('connection', (socket) => {

        socket.on("joinUser", function (data) {
            const userRoom = `User${data.user_1}`
            socket.join(userRoom)
        })

        socket.on("chat", async (arg) => {
            const userRoom = `${arg.user_1}`
            console.log("userRoom:::", userRoom);

            const fcm_token = [];
            if (arg.sender_id == arg.user_1) {
                const userFind = await userModel.findOne({ _id: arg.user_2 })
                fcm_token.push(userFind.fcm_token)

            } else {
                const userFind = await userModel.findOne({ _id: arg.user_1 })
                fcm_token.push(userFind.fcm_token)

            }

            const addInChatRoom = await chatRoomModel.findOne({
                user1: arg.user_1,
                user2: arg.user_2,
            })

            const checkUsers = await chatRoomModel.findOne({
                user1: arg.user_2,
                user2: arg.user_1,
            })


            if (addInChatRoom == null && checkUsers == null) {
                const insertChatRoom = chatRoomModel({
                    user1: arg.user_1,
                    user2: arg.user_2
                })

                await insertChatRoom.save();

                const getChatRoom = await chatRoomModel.findOne({
                    user1: arg.user_1,
                    user2: arg.user_2
                })

                const alterNateChatRoom = await chatRoomModel.findOne({
                    user1: arg.user_2,
                    user2: arg.user_1
                })

                if (getChatRoom == null && alterNateChatRoom == null) {
                    io.emit("chatReceive", "chat room not found");
                } else {

                    if (getChatRoom) {

                        if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {
                            const data = chatModels({
                                chatRoomId: getChatRoom._id,
                                chat: {
                                    sender: arg.sender_id,
                                    text: arg.text
                                }
                            })

                            await data.save();

                            io.emit("chatReceive", arg.text);

                            const title = "n2you Notification";
                            const body = `${arg.sender_id} send request to `;

                            const text = arg.text;
                            const sendBy = arg.sender_id;
                            const registrationToken = fcm_token[0]

                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );

                        } else {
                            io.emit("chatReceive", "sender not found");
                        }



                    } else {
                        if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {
                            const data = chatModels({
                                chatRoomId: alterNateChatRoom._id,
                                chat: {
                                    sender: arg.sender_id,
                                    text: arg.text
                                }
                            })

                            await data.save();
                            io.emit("chatReceive", arg.text)
                            const title = "n2you Notification";
                            const body = `${arg.sender_id} send request to `;

                            const text = arg.text;
                            const sendBy = arg.sender_id;
                            const registrationToken = fcm_token[0]
                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );

                        } else {
                            io.emit("chatReceive", "sender not found");
                        }
                    }

                }
            } else {
                const getChatRoom = await chatRoomModel.findOne({
                    user1: arg.user_1,
                    user2: arg.user_2
                })

                const alterNateChatRoom = await chatRoomModel.findOne({
                    user1: arg.user_2,
                    user2: arg.user_1
                })


                if (getChatRoom == null && alterNateChatRoom == null) {
                    io.emit("chatReceive", "chat room not found");

                } else {

                    if (getChatRoom) {
                        const find1 = await chatModels.findOne({
                            chatRoomId: getChatRoom._id
                        })

                        if (find1 == null) {
                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {
                                const data = chatModels({
                                    chatRoomId: getChatRoom._id,
                                    chat: {
                                        sender: arg.sender_id,
                                        text: arg.text
                                    }
                                })

                                await data.save();

                                io.emit("chatReceive", arg.text)
                                const title = "n2you Notification";
                                const body = `${arg.sender_id} send request to `;

                                const text = arg.text;
                                const sendBy = arg.sender_id;
                                const registrationToken = fcm_token[0]
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );

                            } else {
                                io.emit("chatReceive", "sender not found");
                            }
                        } else {

                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {

                                const finalData = {
                                    sender: arg.sender_id,
                                    text: arg.text
                                }


                                await chatModels.updateOne({
                                    chatRoomId: getChatRoom._id,
                                }, {
                                    $push: {
                                        chat: finalData
                                    }
                                })

                                io.emit("chatReceive", finalData.text)
                                const title = "n2you Notification";
                                const body = `${arg.sender_id} send request to `;

                                const text = arg.text;
                                const sendBy = arg.sender_id;
                                const registrationToken = fcm_token[0]
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );

                            } else {
                                io.emit("chatReceive", "sender not found");
                            }
                        }


                    } else {
                        const find2 = await chatModels.findOne({
                            chatRoomId: alterNateChatRoom._id
                        })

                        if (find2 == null) {
                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {
                                const data = chatModels({
                                    chatRoomId: alterNateChatRoom._id,
                                    chat: {
                                        sender: arg.sender_id,
                                        text: arg.text
                                    }
                                })

                                await data.save();
                                io.emit("chatReceive", arg.text)
                                const title = "n2you Notification";
                                const body = `${arg.sender_id} send request to `;

                                const text = arg.text;
                                const sendBy = arg.sender_id;
                                const registrationToken = fcm_token[0]
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );

                            } else {
                                io.emit("chatReceive", "sender not found");
                            }
                        } else {
                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {

                                const finalData = {
                                    sender: arg.sender_id,
                                    text: arg.text
                                }


                                await chatModels.updateOne({
                                    chatRoomId: alterNateChatRoom._id,
                                }, {
                                    $push: {
                                        chat: finalData
                                    }
                                })

                                io.emit("chatReceive", finalData.text)
                                const title = "n2you Notification";
                                const body = `${arg.sender_id} send request to `;

                                const text = arg.text;
                                const sendBy = arg.sender_id;

                                const registrationToken = fcm_token[0]

                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );

                            } else {
                                io.emit("chatReceive", "sender not found");
                            }
                        }


                    }
                }

            }
        })

        socket.on("readUnread", async (arg) => {
            const findRoom = await chatModels.findOne({
                chatRoomId: arg.chat_room
            })
            console.log();
            if (findRoom == null) {
                io.emit("chatReceive", "chat room not found");
            } else {
                await chatModels.updateMany({ chatRoomId: arg.chat_room }, { $set: { "chat.$[].read": 0 } });
                io.emit("chatReceive", "read All chat");
            }
        })

        socket.on("updateLatLong", async (arg) => {
            const findUser = await userModel.findOne({
                _id: arg.user_id
            })

            if (findUser == null) {
                io.emit("checkUpdate", "User Not Found!");
            } else {
                const updateLatLong = await userModel.updateOne({
                    _id: arg.user_id
                }, {
                    $set: {
                        location: {
                            type: "Point",
                            coordinates: [
                                parseFloat(arg.longitude),
                                parseFloat(arg.latitude),
                            ],
                        },
                    }
                }).then(() => {
                    io.emit("checkUpdate", "User Location Updated!");
                }).catch((error) => {
                    io.emit("checkUpdate", error);
                })
            }
        })

    })

}

module.exports = socket