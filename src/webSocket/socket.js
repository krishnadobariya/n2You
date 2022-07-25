
const chatModels = require("./models/chat.models");
const chatRoomModel = require("./models/chatRoom.model");
const Notification = require("../helper/firebaseHelper");
const userModel = require("../model/user.model");
const datingLikeDislikeUserModel = require("../model/polyamorous/datingLikeDislikeUser.model");
const groupChatRoomModels = require("./models/groupChatRoom.models");
const groupChatModel = require("./models/groupChat.model");
const { default: mongoose } = require("mongoose");
const linkProfileModel = require("../model/polyamorous/linkProfile.model");
const conflictModel = require("../model/polyamorous/conflict.model");
function socket(io) {

    console.log("socket connected...");

    io.on('connection', (socket) => {

        // socket.on("joinUser", function (data) {
        //     const userRoom = `User${data.user_1}`
        //     socket.join(userRoom)
        // })

        socket.on("joinUser", function (data) {
            const userRoom = `User${data.user_id}`;

            socket.join(userRoom);
            // io.to(data.user_id).emit('join', {msg: 'hello world.'});
        });

        socket.on("chat", async (arg) => {

            const userRoom = [];
            if (arg.sender_id = arg.user_2) {
                userRoom.push(arg.user_2)
                socket.join(arg.user_2);
            } else {
                userRoom.push(arg.user_1)
                socket.join(arg.user_1);
            }

            const date = new Date()
            let dates = date.getDate();
            let month = date.toLocaleString('en-us', { month: 'long' });
            let year = date.getFullYear();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes.toString().padStart(2, '0');

            let time = 'At' + ' ' + hours + ':' + minutes + ' ' + ampm + ' ' + 'on' + ' ' + month + ' ' + dates + ',' + year;
            console.log("time::", time);

            const fcm_token = [];
            if (arg.sender_id == arg.user_1) {

                const userFind1 = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('name, photo,fcm_token');
                console.time("default_time")

                const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('name, photo,fcm_token').lean();
                console.time("lean_query");
                console.timeEnd("lean_query");
                fcm_token.push(userFind.fcm_token)

            } else {
                const userFind1 = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('name, photo,fcm_token');
                console.time("default_time")
                console.timeEnd("default_time")
                const userFind = await userModel.findOne({ _id: arg.user_1, polyDating: 0 }).select('name, photo, fcm_token').lean();
                console.time("lean_query");
                console.timeEnd("lean_query")
                console.log("userFind::else:", userFind);
                fcm_token.push(userFind.fcm_token)

            }

            const addInChatRoom = await chatRoomModel.findOne({
                user1: arg.user_1,
                user2: arg.user_2,
            }).select('user1, user2').lean();
            console.log("addInChatRoom::", addInChatRoom);

            const checkUsers = await chatRoomModel.findOne({
                user1: arg.user_2,
                user2: arg.user_1,
            }).select('user1, user2').lean();
            console.log("checkUsers::;", checkUsers);


            if (addInChatRoom == null && checkUsers == null) {
                const insertChatRoom = chatRoomModel({
                    user1: arg.user_1,
                    user2: arg.user_2
                });

                await insertChatRoom.save().lean();

                const getChatRoom = await chatRoomModel.findOne({
                    user1: arg.user_1,
                    user2: arg.user_2
                }).select('user1, user2').lean();

                const alterNateChatRoom = await chatRoomModel.findOne({
                    user1: arg.user_2,
                    user2: arg.user_1
                }).select('user1, user2').lean();

                if (getChatRoom == null && alterNateChatRoom == null) {
                    io.emit("chatReceive", "chat room not found");
                } else {

                    if (getChatRoom) {

                        if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {

                            const findUser = await userModel.findOne({
                                _id: arg.sender_id
                            }).select('name, photo').lean();

                            const data = chatModels({
                                chatRoomId: getChatRoom._id,
                                chat: {
                                    sender: arg.sender_id,
                                    text: arg.text,
                                    name: findUser.name,
                                    photo: findUser.photo[0] ? findUser.photo[0].res : null,
                                    createdAt: time
                                }
                            });

                            await data.save().lean();
                            const receiver_id = [];
                            if (arg.sender_id == arg.user_1) {
                                const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('name, photo').lean()
                                receiver_id.push(userFind._id)

                            } else {
                                const userFind = await userModel.findOne({ _id: arg.user_1, polyDating: 0 }).select('name, photo').lean()
                                receiver_id.push(userFind._id)
                            }

                            const chat = {
                                text: arg.text,
                                sender: arg.sender_id,
                                receiver: receiver_id[0]
                            }

                            io.to(userRoom[0]).emit("chatReceive", chat);

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

                            const findUser = await userModel.findOne({
                                _id: arg.sender_id
                            }).select('name, photo').lean();

                            const data = chatModels({
                                chatRoomId: alterNateChatRoom._id,
                                chat: {
                                    sender: arg.sender_id,
                                    text: arg.text,
                                    name: findUser.name,
                                    photo: findUser.photo[0] ? findUser.photo[0].res : null,
                                    createdAt: time
                                }
                            })


                            await data.save().lean();

                            const receiver_id = [];
                            if (arg.sender_id == arg.user_1) {
                                const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('name, photo').lean();
                                receiver_id.push(userFind._id)

                            } else {
                                const userFind = await userModel.findOne({ _id: arg.user_1, polyDating: 0 }).select('name, photo').lean();
                                receiver_id.push(userFind._id)

                            }

                            const chat = {
                                text: arg.text,
                                sender: arg.sender_id,
                                receiver: receiver_id[0]
                            }

                            io.to(userRoom[0]).emit("chatReceive", chat);
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
                }).select('user1, user2').lean();

                const alterNateChatRoom = await chatRoomModel.findOne({
                    user1: arg.user_2,
                    user2: arg.user_1
                }).select('user1, user2').lean();


                if (getChatRoom == null && alterNateChatRoom == null) {
                    io.emit("chatReceive", "chat room not found");

                } else {

                    if (getChatRoom) {
                        const find1 = await chatModels.findOne({
                            chatRoomId: getChatRoom._id
                        }).select('chatRoomId').lean();

                        if (find1 == null) {
                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {
                                const findUser = await userModel.findOne({
                                    _id: arg.sender_id
                                }).select('name, photo').lean();

                                const data = chatModels({
                                    chatRoomId: getChatRoom._id,
                                    chat: {
                                        sender: arg.sender_id,
                                        text: arg.text,
                                        name: findUser.name,
                                        photo: findUser.photo[0] ? findUser.photo[0].res : null,
                                        createdAt: time

                                    }
                                })


                                await data.save().lean();

                                const receiver_id = [];
                                if (arg.sender_id == arg.user_1) {
                                    const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('_id').lean();
                                    receiver_id.push(userFind._id)

                                } else {
                                    const userFind = await userModel.findOne({ _id: arg.user_1, polyDating: 0 }).select('_id').lean();
                                    receiver_id.push(userFind._id)

                                }
                                const chat = {
                                    text: arg.text,
                                    sender: arg.sender_id,
                                    receiver: receiver_id[0]
                                }

                                io.to(userRoom[0]).emit("chatReceive", chat);
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

                                const findUser = await userModel.findOne({
                                    _id: arg.sender_id
                                }).select('name, photo').lean();

                                const finalData = {
                                    sender: arg.sender_id,
                                    text: arg.text,
                                    name: findUser.name,
                                    photo: findUser.photo[0] ? findUser.photo[0].res : null,
                                    createdAt: time
                                }

                                await chatModels.updateOne({
                                    chatRoomId: getChatRoom._id,
                                }, {
                                    $push: {
                                        chat: finalData
                                    }
                                })

                                const receiver_id = [];
                                if (arg.sender_id == arg.user_1) {
                                    const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('_id').lean();
                                    receiver_id.push(userFind._id)

                                } else {
                                    const userFind = await userModel.findOne({ _id: arg.user_1, polyDating: 0 }).select('_id').lean();
                                    receiver_id.push(userFind._id)

                                }
                                const chat = {
                                    text: finalData.text,
                                    sender: arg.sender_id,
                                    receiver: receiver_id[0]
                                }
                                io.to(userRoom[0]).emit("chatReceive", chat);

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
                        }).lean();

                        if (find2 == null) {
                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {


                                const findUser = await userModel.findOne({
                                    _id: arg.sender_id
                                }).select('name, photo').lean()

                                const data = chatModels({
                                    chatRoomId: alterNateChatRoom._id,
                                    chat: {
                                        sender: arg.sender_id,
                                        text: arg.text,
                                        name: findUser.name,
                                        photo: findUser.photo[0] ? findUser.photo[0].res : null,
                                        createdAt: time

                                    }
                                })

                                await data.save().lean();
                                const receiver_id = [];
                                if (arg.sender_id == arg.user_1) {
                                    const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('_id').lean();
                                    receiver_id.push(userFind._id)

                                } else {
                                    const userFind = await userModel.findOne({ _id: arg.user_1, polyDating: 0 }).select('_id').lean();
                                    receiver_id.push(userFind._id)

                                }
                                const chat = {
                                    text: arg.text,
                                    sender: arg.sender_id,
                                    receiver: receiver_id[0]
                                }
                                io.to(userRoom[0]).emit("chatReceive", chat);

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

                                const findUser = await userModel.findOne({
                                    _id: arg.sender_id
                                }).select('name, photo').lean();

                                const finalData = {
                                    sender: arg.sender_id,
                                    text: arg.text,
                                    name: findUser.name,
                                    photo: findUser.photo[0] ? findUser.photo[0].res : null,
                                    createdAt: time
                                }


                                await chatModels.updateOne({
                                    chatRoomId: alterNateChatRoom._id,
                                }, {
                                    $push: {
                                        chat: finalData
                                    }
                                })
                                const receiver_id = [];
                                if (arg.sender_id == arg.user_1) {
                                    const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('_id').lean();
                                    receiver_id.push(userFind._id)

                                } else {
                                    const userFind = await userModel.findOne({ _id: arg.user_1, polyDating: 0 }).select('_id').lean();
                                    receiver_id.push(userFind._id)

                                }
                                const chat = {
                                    text: finalData.text,
                                    sender: arg.sender_id,
                                    receiver: receiver_id[0]
                                }
                                io.to(userRoom[0]).emit("chatReceive", chat);

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



            const user1 = await userModel.findOne({ _id: arg.user1, polyDating: 1 });
            const user2 = await userModel.findOne({ _id: arg.user2, polyDating: 1 });
            const user3 = await userModel.findOne({ _id: arg.user3, polyDating: 1 });
            const user4 = await userModel.findOne({ _id: arg.user4, polyDating: 1 });
            const user5 = await userModel.findOne({ _id: arg.user5, polyDating: 1 });
            const user6 = await userModel.findOne({ _id: arg.user6, polyDating: 1 });
            const user7 = await userModel.findOne({ _id: arg.user7, polyDating: 1 });
            const user8 = await userModel.findOne({ _id: arg.user8, polyDating: 1 });

            const userRoom = user1 ? user1._id : null || user2 ? user2._id : null || user3 ? user3._id : null || user4 ? user4._id : null || user5 ? user5._id : null || user6 ? user6._id : null || user7 ? user7._id : null || user8 ? user8._id : null

            socket.join(userRoom);
            const createGroupRoom = groupChatRoomModels({
                groupName: arg.group_name,
                user1: user1 ? user1._id : null,
                user2: user2 ? user2._id : null,
                user3: user3 ? user3._id : null,
                user4: user4 ? user4._id : null,
                user5: user5 ? user5._id : null,
                user6: user6 ? user6._id : null,
                user7: user7 ? user7._id : null,
                user8: user8 ? user8._id : null
            })

            await createGroupRoom.save()
            const findRoom = await userModel.find({
                $or: [
                    {
                        _id: user2 ? user2._id : null
                    },
                    {
                        _id: user3 ? user3._id : null
                    },
                    {
                        _id: user3 ? user3._id : null
                    },
                    {
                        _id: user5 ? user5._id : null
                    },
                    {
                        _id: user6 ? user6._id : null
                    },
                    {
                        _id: user7 ? user7._id : null
                    },
                    {
                        _id: user8 ? user8._id : null
                    }
                ]
            })

            io.to(userRoom).emit("RoomCreated", "Chat Room Created....");
            for (const fcm_token of findRoom) {

                const title = "n2you Notification";
                const body = 'room Created';

                const text = 'room Created';
                const sendBy = arg.user_1;
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

                allGroupUser.push(validGroupInGroupRoom.user1 == undefined ? null : (validGroupInGroupRoom.user1).toString())
                allGroupUser.push(validGroupInGroupRoom.user2 == undefined ? null : (validGroupInGroupRoom.user2).toString())
                allGroupUser.push(validGroupInGroupRoom.user3 == undefined ? null : (validGroupInGroupRoom.user3).toString())
                allGroupUser.push(validGroupInGroupRoom.user4 == undefined ? null : (validGroupInGroupRoom.user4).toString())
                allGroupUser.push(validGroupInGroupRoom.user5 == undefined ? null : (validGroupInGroupRoom.user5).toString())
                allGroupUser.push(validGroupInGroupRoom.user6 == undefined ? null : (validGroupInGroupRoom.user6).toString())
                allGroupUser.push(validGroupInGroupRoom.user7 == undefined ? null : (validGroupInGroupRoom.user7).toString())
                allGroupUser.push(validGroupInGroupRoom.user8 == undefined ? null : (validGroupInGroupRoom.user8).toString())

                const exiestUser = allGroupUser.includes((arg.sender_id).toString())



                if (exiestUser) {
                    if (validGroup == null) {

                        var newArray = allGroupUser.filter(function (f) { return f !== (arg.sender_id).toString() })

                        const findAllUser = await userModel.find({
                            _id: {
                                $in: newArray
                            }
                        })


                        const read = [];
                        for (const user of newArray) {

                            if (user == null) {

                            } else {
                                const response = {
                                    userId: mongoose.Types.ObjectId(user),
                                    read: 1
                                }
                                read.push(response)
                            }
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

                        const read = [];
                        for (const user of newArray) {

                            if (user == null) {

                            } else {
                                const response = {
                                    userId: mongoose.Types.ObjectId(user),
                                    read: 1
                                }
                                read.push(response)
                            }
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

            io.emit("chatReceive", "read All chat");
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

            const findUser = await userModel.findOne({
                _id: arg.user_id,
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
                            polyDating: 1
                        });

                        const findInLinkProfileModel = await linkProfileModel.findOne({
                            _id: arg.like_user_id
                        })


                        if (findInUserModel) {
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
                        } else if (findInLinkProfileModel) {


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




                                const allUser = [];

                                if (findInLinkProfileModel.user1 && findInLinkProfileModel.user2 && findInLinkProfileModel.user3 && findInLinkProfileModel.user4) {
                                    allUser.push(findInLinkProfileModel.user1, findInLinkProfileModel.user2, findInLinkProfileModel.user3, findInLinkProfileModel.user4)
                                } else if (findInLinkProfileModel.user1 && findInLinkProfileModel.user2 && findInLinkProfileModel.user3) {
                                    allUser.push(findInLinkProfileModel.user1, findInLinkProfileModel.user2, findInLinkProfileModel.user3)
                                } else if (findInLinkProfileModel.user1 && findInLinkProfileModel.user2) {
                                    allUser.push(findInLinkProfileModel.user1, findInLinkProfileModel.user2)
                                }



                                for (const userInLinkProfile of allUser) {

                                    const findInDatingLikeModel = await datingLikeDislikeUserModel.findOne({
                                        userId: userInLinkProfile
                                    })

                                    if (findInDatingLikeModel == null) {

                                        const insertuserInDatingModel = datingLikeDislikeUserModel({
                                            userId: userInLinkProfile,
                                            LikeUser: {
                                                LikeduserId: arg.user_id
                                            }
                                        })

                                        await insertuserInDatingModel.save();

                                    } else {
                                        const findInDatingLikeModel = await datingLikeDislikeUserModel.findOne({
                                            userId: userInLinkProfile,
                                            "LikeUser.LikeduserId": arg.user_id
                                        })

                                        if (findInDatingLikeModel) {

                                        } else {
                                            await datingLikeDislikeUserModel.updateOne({
                                                userId: userInLinkProfile,

                                            }, {
                                                $pull: {
                                                    disLikeUser: {
                                                        disLikeduserId: arg.user_id
                                                    }
                                                }
                                            })

                                            await datingLikeDislikeUserModel.updateOne({
                                                userId: userInLinkProfile,

                                            }, {
                                                $push: {
                                                    LikeUser: {
                                                        LikeduserId: arg.user_id
                                                    }
                                                }
                                            })
                                        }

                                    }
                                }


                                io.emit("likeDislikeUser", "User Like Dating");
                            }

                        } else {
                            io.emit("likeDislikeUser", "User Not polyDating...");
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
                            polyDating: 1
                        });



                        const findInLinkProfileModel = await linkProfileModel.findOne({
                            _id: arg.like_user_id
                        })

                        if (findInUserModel) {
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
                        } else if (findInLinkProfileModel) {

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

                                io.emit("likeDislikeUser", "User Like Dating");
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

                                const allUser = [];

                                if (findInLinkProfileModel.user1 && findInLinkProfileModel.user2 && findInLinkProfileModel.user3 && findInLinkProfileModel.user4) {
                                    allUser.push(findInLinkProfileModel.user1, findInLinkProfileModel.user2, findInLinkProfileModel.user3, findInLinkProfileModel.user4)
                                } else if (findInLinkProfileModel.user1 && findInLinkProfileModel.user2 && findInLinkProfileModel.user3) {
                                    allUser.push(findInLinkProfileModel.user1, findInLinkProfileModel.user2, findInLinkProfileModel.user3)
                                } else if (findInLinkProfileModel.user1 && findInLinkProfileModel.user2) {
                                    allUser.push(findInLinkProfileModel.user1, findInLinkProfileModel.user2)
                                }


                                for (const userInLinkProfile of allUser) {
                                    const findInDatingLikeModel = await datingLikeDislikeUserModel.findOne({
                                        userId: userInLinkProfile
                                    })

                                    if (findInDatingLikeModel == null) {

                                        const insertuserInDatingModel = datingLikeDislikeUserModel({
                                            userId: userInLinkProfile,
                                            disLikeUser: {
                                                disLikeduserId: arg.user_id
                                            }
                                        })

                                        await insertuserInDatingModel.save();

                                    } else {
                                        await datingLikeDislikeUserModel.updateOne({
                                            userId: userInLinkProfile,

                                        }, {
                                            $pull: {
                                                LikeUser: {
                                                    LikeduserId: arg.user_id
                                                }
                                            }
                                        })

                                        await datingLikeDislikeUserModel.updateOne({
                                            userId: userInLinkProfile,

                                        }, {
                                            $push: {
                                                disLikeUser: {
                                                    disLikeduserId: arg.user_id
                                                }
                                            }
                                        })
                                    }

                                }

                                io.emit("likeDislikeUser", "User Like Dating");
                            }


                        } else {
                            io.emit("likeDislikeUser", "User Not polyDating...");
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
                polyDating: 1
            })

            if (findUser == null) {
                io.emit("sendRequestUser", "User Not Found or user Not Polyamorous...!");
            } else {

                const getAllUserWhichLoginAsPolyamorous = await userModel.find({ polyDating: 1 });
                if (getAllUserWhichLoginAsPolyamorous) {
                    const findAllUser = await userModel.find({
                        _id: {
                            $ne: arg.user_id
                        },
                        polyDating: 1
                    })

                    if (findAllUser) {

                        const findValidUser = await userModel.findOne({
                            _id: arg.request_id
                        })


                        if (findValidUser == null) {
                            io.emit("sendRequestUser", "User Not Found!");
                        } else {

                            const combineUser = await linkProfileModel.findOne({
                                _id: arg.combine_id,
                            })

                            if (combineUser) {

                                if (combineUser.user1 && combineUser.user2 && combineUser.user3 == undefined && combineUser.user4 == undefined) {

                                    const findValidUser1 = await linkProfileModel.findOne({
                                        _id: arg.combine_id
                                    })

                                    if ((findValidUser1.user1).toString() == (arg.user_id).toString() || (findValidUser1.user2).toString() == (arg.user_id).toString()) {
                                        io.emit("sendRequestUser", "already In link profile...");
                                    } else {


                                        const findAlrearyRerquestedUser1 = await userModel.findOne({
                                            _id: combineUser.user1,
                                        })
                                        const findAlrearyRerquestedUser2 = await userModel.findOne({
                                            _id: combineUser.user1,
                                        })


                                        const data = [];
                                        for (const linkUser of findAlrearyRerquestedUser1.linkProfile) {

                                            if (linkUser.userId == arg.user_id && linkUser.status == 0 && linkUser.combineId == arg.combine_id) {
                                                data.push(1)
                                            }
                                        }
                                        for (const linkUser of findAlrearyRerquestedUser2.linkProfile) {
                                            if (linkUser.userId == arg.user_id && linkUser.status == 0 && linkUser.combineId == arg.combine_id) {
                                                data.push(1)
                                            }
                                        }



                                        if (data[0] == 1 && data[1] == 1) {

                                            const data = {
                                                message: "already requested link Profile....",
                                                status: 1
                                            }

                                            io.emit("sendRequestUser", data);

                                        } else {

                                            await userModel.updateOne({
                                                _id: combineUser.user1
                                            }, {
                                                $push: {
                                                    linkProfile: {
                                                        userId: arg.user_id,
                                                        combineId: arg.combine_id
                                                    }
                                                }
                                            })

                                            await userModel.updateOne({
                                                _id: combineUser.user2
                                            }, {
                                                $push: {
                                                    linkProfile: {
                                                        userId: arg.user_id,
                                                        combineId: arg.combine_id
                                                    }
                                                }
                                            })


                                            const data = {
                                                message: "successfully send link profile...",
                                                status: 0
                                            }
                                            io.emit("sendRequestUser", data);
                                        }

                                    }


                                } else if (combineUser.user1 && combineUser.user2 && combineUser.user3 && combineUser.user4 == undefined) {

                                    const findValidUser = await linkProfileModel.findOne({
                                        _id: arg.combine_id
                                    })


                                    if ((findValidUser.user1).toString() == (arg.user_id).toString() || (findValidUser.user2).toString() == (arg.user_id).toString() || (findValidUser.user3).toString() == (arg.user_id).toString()) {

                                        io.emit("sendRequestUser", "already In link profile...");

                                    } else {



                                        const findAlrearyRerquestedUser1 = await userModel.findOne({
                                            _id: combineUser.user1,
                                        })
                                        const findAlrearyRerquestedUser2 = await userModel.findOne({
                                            _id: combineUser.user1,
                                        })
                                        const findAlrearyRerquestedUser3 = await userModel.findOne({
                                            _id: combineUser.user1,
                                        })

                                        const data = [];
                                        for (const linkUser of findAlrearyRerquestedUser1.linkProfile) {

                                            if (linkUser.userId == arg.user_id && linkUser.status == 0 && linkUser.combineId == arg.combine_id) {
                                                data.push(1)
                                            }
                                        }
                                        for (const linkUser of findAlrearyRerquestedUser2.linkProfile) {
                                            if (linkUser.userId == arg.user_id && linkUser.status == 0 && linkUser.combineId == arg.combine_id) {
                                                data.push(1)
                                            }
                                        }
                                        for (const linkUser of findAlrearyRerquestedUser3.linkProfile) {
                                            if (linkUser.userId == arg.user_id && linkUser.status == 0 && linkUser.combineId == arg.combine_id) {
                                                data.push(1)
                                            }
                                        }

                                        if (data[0] == 1 && data[1] == 1 && data[2] == 1) {

                                            const data = {
                                                message: "already requested link Profile....",
                                                status: 1
                                            }

                                            io.emit("sendRequestUser", data);

                                        } else {
                                            await userModel.updateOne({
                                                _id: combineUser.user1
                                            }, {
                                                $push: {
                                                    linkProfile: {
                                                        userId: arg.user_id,
                                                        combineId: arg.combine_id
                                                    }
                                                }
                                            })

                                            await userModel.updateOne({
                                                _id: combineUser.user2
                                            }, {
                                                $push: {
                                                    linkProfile: {
                                                        userId: arg.user_id,
                                                        combineId: arg.combine_id
                                                    }
                                                }
                                            })

                                            await userModel.updateOne({
                                                _id: combineUser.user3
                                            }, {
                                                $push: {
                                                    linkProfile: {
                                                        userId: arg.user_id,
                                                        combineId: arg.combine_id
                                                    }
                                                }
                                            })

                                            const data = {
                                                message: "successfully send link profile...",
                                                status: 0
                                            }
                                            io.emit("sendRequestUser", data);

                                        }

                                    }
                                } else {
                                    io.emit("sendRequestUser", "already have 4 users...");
                                }


                            } else {
                                const findValidUser = await userModel.findOne({
                                    _id: arg.request_id,
                                    "linkProfile.userId": arg.user_id
                                })
                                if (findValidUser == null) {
                                    await userModel.updateOne({
                                        _id: arg.request_id
                                    }, {
                                        $push: {
                                            linkProfile: {
                                                userId: arg.user_id
                                            }
                                        }
                                    })

                                    io.emit("sendRequestUser", "successfully send link profile..");
                                } else {
                                    const data = {
                                        message: "already requested link Profile....",
                                        status: 1
                                    }
                                    io.emit("sendRequestUser", data);


                                }
                            }
                        }

                    } else {
                        io.emit("sendRequestUser", "This User Not Polyamorous!");
                    }

                }
            }

        })

        socket.on('conflictOfIntrest', async (arg) => {
            const userRoom = arg.group_room_id;
            socket.join(userRoom);

            const findRoom = groupChatRoomModels.findOne({
                _id: arg.group_room_id
            })

            if (findRoom == null) {
                io.emit("showConflictOfIntrest", "this group is not Found");
            } else {
                const conflictOfIntrest = [];
                const findGroupInConflictModel = await conflictModel.find({
                    groupId: arg.group_room_id
                })

                for (const getGroup of findGroupInConflictModel) {

                    const findUser = await userModel.findOne({
                        _id: getGroup.conflictUserId
                    })
                    const findFinalDisionUser = await userModel.findOne({
                        _id: arg.user_id
                    })
                    const response = {
                        userIdWhichConflictUser: getGroup.conflictUserId,
                        profileConflictUser: findUser.photo[0] ? findUser.photo[0].res : null,
                        nameOfConflictUser: findUser.firstName,
                        finalDesionForMySide: findFinalDisionUser.firstName,
                        countAgree: getGroup.aggreeCount,
                        countDisAgree: getGroup.disAggreeCount
                    }
                    conflictOfIntrest.push(response)

                }

                io.to(userRoom).emit("showConflictOfIntrest", conflictOfIntrest);
            }

        })
    })
}

module.exports = socket
