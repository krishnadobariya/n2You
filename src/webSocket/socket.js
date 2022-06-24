
const chatModels = require("./models/chat.models");
const chatRoomModel = require("./models/chatRoom.model");

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


            const addInChatRoom = await chatRoomModel.findOne({
                user1: arg.user_1,
                user2: arg.user_2,
            })

            const checkUsers = await chatRoomModel.findOne({
                user1: arg.user_2,
                user2: arg.user_1,
            })


            console.log("addInChatRoom", addInChatRoom);

            console.log("checkUsers", checkUsers);
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

                            io.emit("chatReceive", arg.text)

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

                            } else {
                                io.emit("chatReceive", "sender not found");
                            }
                        }


                    } else {
                        const find2 = await chatModels.findOne({
                            chatRoomId: alterNateChatRoom._id
                        })

                        console.log(find2);
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

            if (findRoom == null) {
                io.emit("chatReceive", "chat room not found");
            } else {
                await chatModels.updateMany({ chatRoomId: arg.chat_room }, { $set: { "chat.$[].read": 0 } });
                io.emit("chatReceive", "read All chat");
            }
        })

    })

}

module.exports = socket