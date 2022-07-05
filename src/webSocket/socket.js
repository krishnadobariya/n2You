
const chatModels = require("./models/chat.models");
const chatRoomModel = require("./models/chatRoom.model");
const Notification = require("../helper/firebaseHelper");
const userModel = require("../model/user.model");
const datingLikeDislikeUserModel = require("../model/polyamorous/datingLikeDislikeUser.model");
const groupChatRoomModels = require("./models/groupChatRoom.models");
const groupChatModel = require("./models/groupChat.model");
const { default: mongoose } = require("mongoose");
function socket(io) {

    console.log("socket connected...");

    io.on('connection', (socket) => {

        socket.on("joinUser", function (data) {
            const userRoom = `User${data.user_1}`
            socket.join(userRoom)
        })

        socket.on("chat", async (arg) => {

            if (arg.sender_id == user_1) {
                const userRoom = `${arg.user_2}`
                socket.join(userRoom)
            } else {
                const userRoom = `${arg.user_1}`
                socket.join(userRoom)
            }

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

                            io.to(userRoom).emit("chatReceive", arg.text);

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
                            io.to(userRoom).emit("chatReceive", arg.text);
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

                                io.to(userRoom).emit("chatReceive", arg.text);
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

                                io.to(userRoom).emit("chatReceive", finalData.text);
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
                                io.to(userRoom).emit("chatReceive", arg.text);
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

                                io.to(userRoom).emit("chatReceive", finalData.text);
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

        socket.on("createGroupRoom", async (arg) => {

            const userRoom = arg.user1 || arg.user2 || arg.user3 || arg.user4 || arg.user5 || arg.user6 || arg.user7 || arg.user8

            socket.join(userRoom);

            const createGroupRoom = groupChatRoomModels({
                user1: arg.user1,
                user2: arg.user2,
                user3: arg.user3,
                user4: arg.user4,
                user5: arg.user5,
                user6: arg.user6,
                user7: arg.user7,
                user8: arg.user8
            })

            await createGroupRoom.save()
            io.to(userRoom).emit("RoomCreated", "Chat Room Created....");


            const title = "n2you Notification";
            const body = 'room Created';

            const text = 'room Created';
            const sendBy = arg.user_1;
            const registrationToken = fcm_token[0]

            Notification.sendPushNotificationFCM(
                registrationToken,
                title,
                body,
                text,
                sendBy,
                true
            );
        })

        socket.on("chatByGroup", async (arg) => {
            const userRoom = arg.chat_room_id
            socket.join(userRoom);

            const validGroupInGroupRoom = await groupChatRoomModels.findOne({
                _id: arg.chat_room_id
            })

            if (validGroupInGroupRoom == null) {
                io.emit("chatReceive", "chatRoom Not Found...");
            } else {

                const fcm_token = [];


                const validGroup = await groupChatModel.findOne({
                    chatRoomId: arg.chat_room_id
                })

                const allGroupUser = [];

                const user1 = (validGroupInGroupRoom.user2).toString()

                console.log(user1);
                allGroupUser.push(validGroupInGroupRoom.user1 == undefined ? null : (validGroupInGroupRoom.user1).toString())
                allGroupUser.push(validGroupInGroupRoom.user2 == undefined ? null : (validGroupInGroupRoom.user2).toString())
                allGroupUser.push(validGroupInGroupRoom.user3 == undefined ? null : (validGroupInGroupRoom.user3).toString())
                allGroupUser.push(validGroupInGroupRoom.user4 == undefined ? null : (validGroupInGroupRoom.user4).toString())
                allGroupUser.push(validGroupInGroupRoom.user5 == undefined ? null : (validGroupInGroupRoom.user5).toString())
                allGroupUser.push(validGroupInGroupRoom.user6 == undefined ? null : (validGroupInGroupRoom.user6).toString())
                allGroupUser.push(validGroupInGroupRoom.user7 == undefined ? null : (validGroupInGroupRoom.user7).toString())
                allGroupUser.push(validGroupInGroupRoom.user8 == undefined ? null : (validGroupInGroupRoom.user8).toString())

                const exiestUser = allGroupUser.includes((arg.sender_id).toString())

                console.log(allGroupUser);

                if (exiestUser) {
                    if (validGroup == null) {

                        var newArray = allGroupUser.filter(function (f) { return f !== (arg.sender_id).toString() })
                        console.log(newArray);

                        const findAllUser = await userModel.find({
                            _id: {
                                $in: newArray
                            }
                        })

                        const read = [];
                        for (const user of newArray) {
                            console.log(user);

                            const response = {
                                userId: mongoose.Types.ObjectId(user),
                                read: 1
                            }

                            read.push(response)
                        }


                        const data = groupChatModel({
                            chatRoomId: arg.chat_room_id,
                            chat: {
                                sender: arg.sender_id,
                                text: arg.text,
                                read: read
                            }
                        })

                        await data.save()

                        io.to(userRoom).emit("chatReceive", arg.text);




                        for (const fcm_token of findAllUser) {
                            const title = "n2you Notification";
                            const body = `${arg.sender_id} send request to `;

                            const text = arg.text;
                            const sendBy = arg.sender_id;
                            const registrationToken = fcm_token.fcm_token[0]

                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );
                        }


                    } else {

                        var newArray = allGroupUser.filter(function (f) { return f !== (arg.sender_id).toString() })
                        console.log(newArray);

                        const read = [];
                        for (const user of newArray) {
                            console.log(user);

                            const response = {
                                userId: mongoose.Types.ObjectId(user),
                                read: 1
                            }

                            read.push(response)
                        }

                        const finalData = {
                            sender: arg.sender_id,
                            text: arg.text,
                            read: read
                        }

                        await groupChatModel.updateOne({
                            chatRoomId: arg.chat_room_id,
                        }, {
                            $push: {
                                chat: finalData,
                            }
                        })

                        io.to(userRoom).emit("chatReceive", arg.text);

                        var newArray = allGroupUser.filter(function (f) { return f !== (arg.sender_id).toString() })
                        console.log(newArray);

                        const findAllUser = await userModel.find({
                            _id: {
                                $in: newArray
                            }
                        })

                        for (const fcm_token of findAllUser) {
                            const title = "n2you Notification";
                            const body = `${arg.sender_id} send request to `;

                            const text = arg.text;
                            const sendBy = arg.sender_id;
                            const registrationToken = fcm_token.fcm_token[0]

                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );
                        }
                    }
                } else {
                    io.to(userRoom).emit("chatReceive", "sender Not Found....");
                }

            }

        })

        socket.on("readUnreadInGroup", async (arg) => {
            const findRoom = await groupChatModel.findOne({
                chatRoomId: arg.group_chat_room
            })

            if (findRoom == null) {
                io.emit("chatRecive", "room not found")
            } else {
                const updateChatRead = await groupChatModel.updateMany(
                    {
                        chatRoomId: arg.group_chat_room,
                        "chat.read.userId": mongoose.Types.ObjectId(arg.user_id)
                    },
                    {
                        $set: {
                            "chat.$[].read.$[read].read": 0
                        }
                    },
                    { arrayFilters: [{ "read.userId": mongoose.Types.ObjectId(arg.user_id) }] }
                )
            }

            console.log();
            io.emit("chatReceive", "read All chat");

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

        socket.on("LikeOrDislikeUserForDating", async (arg) => {
            console.log("arg", arg);
            const findUser = await userModel.findOne({
                _id: arg.user_id
            })

            if (findUser == null) {
                io.emit("likeDislikeUser", "User Not Found!");
            } else {

                if (arg.like == 1) {

                    const existUserInLike = await datingLikeDislikeUserModel.findOne({
                        userId: arg.user_id,
                        "LikeUser.LikeduserId": arg.like_user_id
                    })

                    const exisrUserIndisLike = await datingLikeDislikeUserModel.findOne({
                        userId: arg.user_id,
                        "disLikeUser.disLikeduserId": arg.like_user_id
                    })

                    if (existUserInLike == null && exisrUserIndisLike == null) {
                        const findInUserModel = await userModel.findOne({
                            _id: arg.like_user_id,
                            polyDating: "polyamorous"
                        });

                        if (findInUserModel == null) {
                            io.emit("likeDislikeUser", "User Not polyDating");
                        } else {

                            const findUserInDating = await datingLikeDislikeUserModel.findOne({
                                userId: arg.user_id
                            })

                            if (findUserInDating == null) {
                                const insertuserInDatingModel = datingLikeDislikeUserModel({
                                    userId: arg.user_id,
                                    LikeUser: {
                                        LikeduserId: arg.like_user_id
                                    }
                                })

                                await insertuserInDatingModel.save();
                                io.emit("likeDislikeUser", "User Like Dating");
                            } else {

                                await datingLikeDislikeUserModel.updateOne({
                                    userId: arg.user_id
                                }, {
                                    $push: {
                                        LikeUser: {
                                            LikeduserId: arg.like_user_id
                                        }
                                    }
                                })
                                io.emit("likeDislikeUser", "User Like Dating");
                            }

                        }
                    } else {
                        io.emit("likeDislikeUser", "Already Liked or Dislike For Dating");
                    }

                } else if (arg.like == 0) {
                    const existUserInLike = await datingLikeDislikeUserModel.findOne({
                        userId: arg.user_id,
                        "LikeUser.LikeduserId": arg.like_user_id
                    })

                    const exisrUserIndisLike = await datingLikeDislikeUserModel.findOne({
                        userId: arg.user_id,
                        "disLikeUser.disLikeduserId": arg.like_user_id
                    })

                    if (existUserInLike == null && exisrUserIndisLike == null) {
                        const findInUserModel = await userModel.findOne({
                            _id: arg.like_user_id,
                            polyDating: "polyamorous"
                        });

                        if (findInUserModel == null) {
                            io.emit("likeDislikeUser", "User Not polyDating");
                        } else {

                            const findUserInDating = await datingLikeDislikeUserModel.findOne({
                                userId: arg.user_id
                            })

                            if (findUserInDating == null) {
                                const insertuserInDatingModel = datingLikeDislikeUserModel({
                                    userId: arg.user_id,
                                    disLikeUser: {
                                        disLikeduserId: arg.like_user_id
                                    }
                                })

                                await insertuserInDatingModel.save();
                                io.emit("likeDislikeUser", "User DisLike Dating");
                            } else {

                                await datingLikeDislikeUserModel.updateOne({
                                    userId: arg.user_id
                                }, {
                                    $push: {
                                        disLikeUser: {
                                            disLikeduserId: arg.like_user_id
                                        }
                                    }
                                })
                                io.emit("likeDislikeUser", "User DisLike Dating");
                            }
                        }
                    } else {
                        io.emit("likeDislikeUser", "Already Liked or Dislike For Dating");
                    }
                }

            }
        })



        socket.on('sendRequest', async (arg) => {

            const findUser = await userModel.findOne({
                _id: arg.user_id,
                polyDating: "polyamorous"
            })

            if (findUser == null) {
                io.emit("sendRequestUser", "User Not Found or user Not polyamorous...!");
            } else {

                const getAllUserWhichLoginAsPolyamorous = await userModel.find({ "polyDating": "polyamorous" });
                if (getAllUserWhichLoginAsPolyamorous) {
                    const findAllUser = await userModel.find({
                        _id: {
                            $ne: arg.user_id
                        },
                        "polyDating": "polyamorous"
                    })

                    const response = [];

                    if (findAllUser) {
                        for (const allUser of findAllUser) {
                            const checkUserInLike = await datingLikeDislikeUserModel.findOne({
                                userId: arg.user_id,
                                "LikeUser.LikeduserId": allUser._id
                            })


                            const checkUserInDisLike = await datingLikeDislikeUserModel.findOne({
                                userId: arg.user_id,
                                "disLikeUser.disLikeduserId": allUser._id
                            })

                            if (checkUserInLike || checkUserInDisLike) {

                            } else {

                                let brithDate = new Date(allUser.birthDate);
                                brithDate = brithDate.getFullYear();
                                let currentDate = new Date(Date.now());
                                currentDate = currentDate.getFullYear();

                                const age = currentDate - brithDate

                                const userDetail = {
                                    _id: allUser._id,
                                    name: allUser.firstName,
                                    gender: allUser.identity,
                                    age: age,
                                    photo: allUser.photo[0]

                                }
                                response.push(userDetail)
                            }
                        }

                        var findRequest = response.filter(obj => obj._id == arg.request_id);

                        if (findRequest[0] == undefined) {
                            io.emit("sendRequestUser", "aleardy tack desicion");
                        } else {

                            const findValidUser = await userModel.findOne({
                                _id: findRequest[0]._id
                            })

                            if (findValidUser == null) {
                                io.emit("sendRequestUser", "User Not Found!");
                            } else {
                                console.log(findValidUser.linkProfile);
                                await userModel.updateOne({
                                    _id: findRequest[0]._id
                                }, {
                                    $push: {
                                        linkProfile: {
                                            userId: arg.user_id
                                        }
                                    }
                                })

                                io.emit("sendRequestUser", "successfully send link profile");
                            }
                        }

                    } else {
                        io.emit("sendRequestUser", "This User Not polyamorous!");
                    }

                }
            }

        })
    })

}

module.exports = socket
