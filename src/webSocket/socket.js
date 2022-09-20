
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
const notificationModel = require("../model/polyamorous/notification.model");
const requestModel = require("../model/requests.model");
const videoCallModel = require("./models/videoCall.model");
const { deleteOne, updateOne, findOne } = require("../model/user.model");
const sessionModel = require("../model/session.model");
const sessionCommentModel = require("../model/sessionComment");
function socket(io) {

    console.log("socket connected...");

    io.on('connection', (socket) => {

        socket.on("joinUser", function (data) {
            const userRoom = `User${data.user_id}`;
            socket.join(userRoom);
        });

        socket.on("chat", async (arg) => {

            if (arg.user_1 == arg.sender_id) {

                console.log("first Id");
                const findUserInNotification = await notificationModel.findOne({
                    userId: arg.user_2
                })

                const findUser = await userModel.findOne({
                    _id: arg.user_1
                })

                if (findUserInNotification) {

                    await notificationModel.updateOne({
                        userId: arg.user_2
                    }, {
                        $push: {
                            notifications: {
                                notifications: `${findUser.firstName} message you`,
                                userId: findUser._id,
                                status: 7
                            }
                        }
                    })
                } else {

                    const saveNotification = notificationModel({
                        userId: arg.user_2,
                        notifications: {
                            notifications: `${findUser.firstName} message you`,
                            userId: findUser._id,
                            status: 7
                        }
                    })

                    await saveNotification.save()
                }

            } else if (arg.user_2 == arg.sender_id) {

                console.log("second Id");

                const findUserInNotification = await notificationModel.findOne({
                    userId: arg.user_1
                })

                const findUser = await userModel.findOne({
                    _id: arg.user_2
                })

                if (findUserInNotification) {
                    await notificationModel.updateOne({
                        userId: arg.user_1
                    }, {
                        $push: {
                            notifications: {
                                notifications: `${findUser.firstName} message you`,
                                userId: findUser._id,
                                status: 7
                            }
                        }
                    })
                } else {
                    const saveNotification = notificationModel({
                        userId: arg.user_1,
                        notifications: {
                            notifications: `${findUser.firstName} message you`,
                            userId: findUser._id,
                            status: 7
                        }
                    })

                    await saveNotification.save()
                }
            }

            const date = new Date()
            let dates = date.getDate();
            let month = date.toLocaleString('en-us', { month: 'long' });
            let year = date.getFullYear();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let second = date.getSeconds();
            let mon = date.getMonth() + 1;
            let ampm = hours >= 12 ? 'pm' : 'am';
            hours = hours % 12;
            hours = hours ? hours : 12;
            minutes = minutes.toString().padStart(2, '0');

            let time = 'At' + ' ' + hours + ':' + minutes + ' ' + ampm + ' ' + 'on' + ' ' + month + ' ' + dates + ',' + year;

            const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 });

            const senderName = await userModel.findOne({ _id: arg.user_1, polyDating: 0 });

            console.log("name is", userFind.firstName);
            const fcm_token = userFind.fcm_token;

            console.log("fcm_token==>", fcm_token);
            // if (arg.sender_id == arg.user_1) {
            //     const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 }).select('name, photo,fcm_token');
            //     fcm_token.push(userFind.fcm_token)
            // } else {
            //     const userFind = await userModel.findOne({ _id: arg.user_1, polyDating: 0 }).select('name, photo, fcm_token')
            //     fcm_token.push(userFind.fcm_token)
            // }

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
                });
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

                            const findUser = await userModel.findOne({
                                _id: arg.sender_id
                            })

                            const data = chatModels({
                                chatRoomId: getChatRoom._id,
                                chat: {
                                    sender: arg.sender_id,
                                    text: arg.text,
                                    dateAndTime: `${year}-${mon}-${dates} ${hours}:${minutes}:${second}`,
                                    name: findUser.name,
                                    photo: findUser.photo[0] ? findUser.photo[0].res : "",
                                    createdAt: time
                                }
                            });

                            await data.save();
                            const receiver_id = [];
                            if (arg.sender_id == arg.user_1) {
                                const userFind = await userModel.findOne({ _id: arg.user_2, polyDating: 0 })
                                receiver_id.push(userFind._id)

                            } else {
                                const userFind = await userModel.findOne({ _id: arg.user_1, polyDating: 0 })
                                receiver_id.push(userFind._id)
                            }

                            const chat = {
                                text: arg.text,
                                sender: arg.sender_id,
                                receiver: receiver_id[0]
                            }

                            const userRoom = `User${arg.user_2}`
                            io.to(userRoom).emit("chatReceive", chat);
                            if (fcm_token) {
                                console.log("chat", chat);
                                const title = senderName.firstName;
                                const body = arg.text;
                                const text = arg.text;
                                const sendBy = arg.user_1;
                                const registrationToken = fcm_token

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
                            io.emit("chatReceive", "sender not found");
                        }



                    } else {


                        if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {

                            const findUser = await userModel.findOne({
                                _id: arg.sender_id
                            })

                            const data = chatModels({
                                chatRoomId: alterNateChatRoom._id,
                                chat: {
                                    sender: arg.sender_id,
                                    text: arg.text,
                                    name: findUser.name,
                                    dateAndTime: `${year}-${mon}-${dates} ${hours}:${minutes}:${second}`,
                                    photo: findUser.photo[0] ? findUser.photo[0].res : "",
                                    createdAt: time
                                }
                            })


                            await data.save();

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

                            const userRoom = `User${arg.user_2}`
                            io.to(userRoom).emit("chatReceive", chat);
                            if (fcm_token) {
                                const title = senderName.firstName;
                                const body = arg.text;

                                const text = arg.text;
                                const sendBy = arg.user_1;
                                const registrationToken = fcm_token
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
                            io.emit("chatReceive", "sender not found");
                        }
                    }

                }
            } else {

                console.log("gfergertferfegtf");
                const getChatRoom = await chatRoomModel.findOne({
                    user1: arg.user_1,
                    user2: arg.user_2
                }).select('user1, user2').lean();

                const alterNateChatRoom = await chatRoomModel.findOne({
                    user1: arg.user_2,
                    user2: arg.user_1
                }).select('user1, user2').lean();


                console.log("getChatRoom", getChatRoom);
                console.log("alterNateChatRoom", alterNateChatRoom);

                if (getChatRoom == null && alterNateChatRoom == null) {
                    console.log("if blok");
                    io.emit("chatReceive", "chat room not found");

                } else {

                    console.log("else blok");

                    if (getChatRoom) {
                        const find1 = await chatModels.findOne({
                            chatRoomId: getChatRoom._id
                        }).select('chatRoomId').lean();

                        console.log("find1:::", find1);
                        if (find1 == null) {
                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {
                                const findUser = await userModel.findOne({
                                    _id: arg.sender_id
                                })

                                console.log("findUser", findUser);
                                const data = chatModels({
                                    chatRoomId: getChatRoom._id,
                                    chat: {
                                        sender: arg.sender_id,
                                        text: arg.text,
                                        dateAndTime: `${year}-${mon}-${dates} ${hours}:${minutes}:${second}`,
                                        name: userFind.firstName,
                                        photo: userFind.photo[0] ? userFind.photo[0].res : "",
                                        createdAt: time

                                    }
                                })


                                await data.save();

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

                                console.log("chat::", chat);

                                const userRoom = `User${arg.user_2}`
                                io.to(userRoom).emit("chatReceive", chat);
                                if (fcm_token) {
                                    const title = senderName.firstName;
                                    const body = arg.text;
                                    const text = arg.text;
                                    const sendBy = arg.user_1;
                                    const registrationToken = fcm_token
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
                                console.log("else 3333");
                                io.emit("chatReceive", "sender not found");
                            }
                        } else {

                            console.log("else block 2");
                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {

                                const findUser = await userModel.findOne({
                                    _id: arg.sender_id
                                })

                                const finalData = {
                                    sender: arg.sender_id,
                                    text: arg.text,
                                    name: findUser.name,
                                    dateAndTime: `${year}-${mon}-${dates} ${hours}:${minutes}:${second}`,
                                    photo: findUser.photo[0] ? findUser.photo[0].res : "",
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

                                console.log("chat::::", chat);
                                const userRoom = `User${arg.user_2}`
                                io.to(userRoom).emit("chatReceive", chat);
                                if (fcm_token) {
                                    const title = senderName.firstName;
                                    const body = arg.text;
                                    const text = arg.text;
                                    const sendBy = arg.user_1;
                                    const registrationToken = fcm_token
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
                                io.emit("chatReceive", "sender not found");
                            }
                        }


                    } else {
                        const find2 = await chatModels.findOne({
                            chatRoomId: alterNateChatRoom._id
                        }).select("chatRoomId").lean();

                        if (find2 == null) {
                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {
                                const findUser = await userModel.findOne({
                                    _id: arg.sender_id
                                })

                                const data = chatModels({
                                    chatRoomId: alterNateChatRoom._id,
                                    chat: {
                                        sender: arg.sender_id,
                                        text: arg.text,
                                        name: findUser.name,
                                        dateAndTime: `${year}-${mon}-${dates} ${hours}:${minutes}:${second}`,
                                        photo: findUser.photo[0] ? findUser.photo[0].res : "",
                                        createdAt: time
                                    }
                                })

                                await data.save();
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
                                const userRoom = `User${arg.user_2}`
                                io.to(userRoom).emit("chatReceive", chat);
                                if (fcm_token) {
                                    const title = senderName.firstName;
                                    const body = arg.text;
                                    const text = arg.text;
                                    const sendBy = arg.user_1;

                                    const registrationToken = fcm_token
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
                                io.emit("chatReceive", "sender not found");
                            }
                        } else {

                            if (arg.sender_id == arg.user_1 || arg.sender_id == arg.user_2) {
                                const findUser = await userModel.findOne({
                                    _id: arg.sender_id
                                })

                                const finalData = {
                                    sender: arg.sender_id,
                                    text: arg.text,
                                    name: findUser.name,
                                    dateAndTime: `${year}-${mon}-${dates} ${hours}:${minutes}:${second}`,
                                    photo: findUser.photo[0] ? findUser.photo[0].res : "",
                                    createdAt: time
                                }

                                await chatModels.updateOne({
                                    chatRoomId: alterNateChatRoom._id,
                                }, {
                                    $push: {
                                        chat: finalData
                                    }
                                }).lean()

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
                                const userRoom = `User${arg.user_2}`
                                io.to(userRoom).emit("chatReceive", chat);
                                if (fcm_token) {
                                    const title = senderName.firstName;
                                    const body = arg.text;
                                    const text = arg.text;
                                    const sendBy = arg.user_1;

                                    const registrationToken = fcm_token

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
                                io.emit("chatReceive", "sender not found");
                            }
                        }
                    }
                }
            }
        })

        socket.on("joinSession", async (arg) => {
            const findIdInSession = await sessionModel.findOne({
                _id: arg.session_id
            })

            const p1 = findIdInSession.participants[0].participants_1 == null ? "" : findIdInSession.participants[0].participants_1
            const p2 = findIdInSession.participants[0].participants_2 == null ? "" : findIdInSession.participants[0].participants_2
            const p3 = findIdInSession.participants[0].participants_3 == null ? "" : findIdInSession.participants[0].participants_3

            if (findIdInSession) {

                if ((findIdInSession.cretedSessionUser).toString() == (arg.create_session_user).toString()) {

                    const commentSession = await sessionCommentModel.findOne({
                        sessionId: arg.session_id
                    })

                    console.log(commentSession);
                    if (commentSession) { } else {

                        const saveData = sessionCommentModel({
                            sessionId: arg.session_id,
                            cretedSessionUser: arg.create_session_user
                        })

                        await saveData.save();
                    }
                    if (findIdInSession.roomType == "Public") {

                        const allRequestedEmails = [];
                        const findAllFriend = await requestModel.findOne({
                            userId: findIdInSession.cretedSessionUser
                        })

                        const p1 = findIdInSession.participants[0].participants_1 == null ? "" : findIdInSession.participants[0].participants_1
                        const p2 = findIdInSession.participants[0].participants_2 == null ? "" : findIdInSession.participants[0].participants_2
                        const p3 = findIdInSession.participants[0].participants_3 == null ? "" : findIdInSession.participants[0].participants_3


                        for (const allRequestedEmail of findAllFriend.RequestedEmails) {

                            if (allRequestedEmail.accepted == 1) {
                                if (((allRequestedEmail.userId).toString() != (p1).toString()) && ((allRequestedEmail.userId).toString() != (p2).toString()) && ((allRequestedEmail.userId).toString() != (p3).toString())) {
                                    allRequestedEmails.push(allRequestedEmail.userId)
                                }
                            }
                        }

                        const invitedUsers = [];
                        if (p1 != null) {
                            invitedUsers.push(findIdInSession.participants[0].participants_1)
                        }
                        if (p2 != null) {
                            invitedUsers.push(findIdInSession.participants[0].participants_2)
                        }
                        if (p3 != null) {
                            invitedUsers.push(findIdInSession.participants[0].participants_3)
                        }

                        for (const notification of allRequestedEmails) {


                            const findUser = await userModel.findOne({
                                _id: notification
                            })

                            const findCreateSessionUser = await userModel.findOne({
                                _id: findIdInSession.cretedSessionUser
                            })

                            if (findUser.fcm_token) {
                                const title = findCreateSessionUser.firstName;
                                const body = `session started which one is created by ${findCreateSessionUser.firstName}`;

                                const text = "join session";
                                const sendBy = (findCreateSessionUser._id).toString();
                                const registrationToken = findUser.fcm_token
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );
                            }



                            const findInNotification = await notificationModel.findOne({
                                userId: notification
                            })
                            if (findInNotification) {

                                await notificationModel.updateOne({
                                    userId: notification
                                }, {
                                    $push: {
                                        notifications: {
                                            notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                            userId: findCreateSessionUser._id,
                                            status: 9
                                        }
                                    }
                                })
                            } else {
                                const savedata = notificationModel({
                                    userId: notification,
                                    notifications: {
                                        notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                        userId: findCreateSessionUser._id,
                                        status: 9
                                    }
                                })
                                await savedata.save();
                            }
                        }

                        for (const invitedUser of invitedUsers) {

                            await sessionModel.updateOne({
                                _id: arg.session_id
                            },
                                {
                                    $set: {
                                        started: true
                                    }
                                })
                            const findUser = await userModel.findOne({
                                _id: invitedUser
                            })

                            const findCreateSessionUser = await userModel.findOne({
                                _id: findIdInSession.cretedSessionUser
                            })
                            if (findUser.fcm_token) {
                                const title = findCreateSessionUser.firstName;
                                const body = `session started which one is created by ${findCreateSessionUser.firstName}`;

                                const text = "join session";
                                const sendBy = (findCreateSessionUser._id).toString();
                                const registrationToken = findUser.fcm_token
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );
                            }


                            const findInNotification = await notificationModel.findOne({
                                userId: invitedUser
                            })

                            if (findInNotification) {
                                await notificationModel.updateOne({
                                    userId: invitedUser
                                }, {
                                    $push: {
                                        notifications: {
                                            notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                            userId: findCreateSessionUser._id,
                                            status: 9
                                        }
                                    }
                                })
                            } else {
                                const savedata = notificationModel({
                                    userId: invitedUser,
                                    notifications: {
                                        notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                        userId: findCreateSessionUser._id,
                                        status: 9
                                    }
                                })
                                await savedata.save();
                            }
                        }

                        io.emit("sessionJoinSuccess", "session started");
                    } else {
                        const allRequestedEmails = [];

                        const p1 = findIdInSession.participants[0].participants_1 == null ? "" : findIdInSession.participants[0].participants_1
                        const p2 = findIdInSession.participants[0].participants_2 == null ? "" : findIdInSession.participants[0].participants_2
                        const p3 = findIdInSession.participants[0].participants_3 == null ? "" : findIdInSession.participants[0].participants_3

                        if (p1) {
                            allRequestedEmails.push(findIdInSession.participants[0].participants_1)
                        }
                        if (p2) {
                            allRequestedEmails.push(findIdInSession.participants[0].participants_2)
                        }
                        if (p3) {
                            allRequestedEmails.push(findIdInSession.participants[0].participants_3)
                        }


                        for (const notification of allRequestedEmails) {

                            await sessionModel.updateOne({
                                _id: arg.session_id
                            },
                                {
                                    $set: {
                                        started: true
                                    }
                                })



                            const findUser = await userModel.findOne({
                                _id: notification
                            })

                            const findCreateSessionUser = await userModel.findOne({
                                _id: findIdInSession.cretedSessionUser
                            })

                            if (findUser.fcm_token) {
                                const title = findCreateSessionUser.firstName;
                                const body = `session started which one is created by ${findCreateSessionUser.firstName}`;

                                const text = "join session";
                                const sendBy = (findCreateSessionUser._id).toString();
                                const registrationToken = findUser.fcm_token
                                Notification.sendPushNotificationFCM(
                                    registrationToken,
                                    title,
                                    body,
                                    text,
                                    sendBy,
                                    true
                                );

                            }

                            const findInNotification = await notificationModel.findOne({
                                userId: notification
                            })

                            if (findInNotification) {

                                await notificationModel.updateOne({
                                    userId: notification
                                }, {
                                    $push: {
                                        notifications: {
                                            notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                            userId: findCreateSessionUser._id,
                                            status: 9
                                        }
                                    }
                                })

                            } else {
                                const savedata = notificationModel({
                                    userId: notification,
                                    notifications: {
                                        notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                        userId: findCreateSessionUser._id,
                                        status: 9
                                    }
                                })
                                await savedata.save();

                            }
                        }

                        io.emit("sessionJoinSuccess", "session started");

                    }
                } else if ((p1).toString() == (arg.create_session_user).toString()) {

                    const commentSession = await sessionCommentModel.findOne({
                        sessionId: arg.session_id,
                        "joinUser.userId": mongoose.Types.ObjectId(p1)
                    })

                    if (commentSession) { } else {
                        await sessionCommentModel.updateOne({
                            sessionId: arg.session_id,
                        }, {
                            $push: {
                                joinUser: {
                                    userId: mongoose.Types.ObjectId(p1),
                                    status: 2
                                }
                            }
                        })
                    }

                    await sessionModel.updateOne(
                        {
                            _id: arg.session_id,
                        },
                        { $inc: { countJoinUser: 1 } }
                    )

                    const allRequestedEmails = [];

                    const sessionUser = findIdInSession.cretedSessionUser == null ? "" : findIdInSession.cretedSessionUser
                    const p2 = findIdInSession.participants[0].participants_2 == null ? "" : findIdInSession.participants[0].participants_2
                    const p3 = findIdInSession.participants[0].participants_3 == null ? "" : findIdInSession.participants[0].participants_3

                    if (sessionUser) {
                        allRequestedEmails.push(findIdInSession.cretedSessionUser)
                    }
                    if (p2) {
                        allRequestedEmails.push(findIdInSession.participants[0].participants_2)
                    }
                    if (p3) {
                        allRequestedEmails.push(findIdInSession.participants[0].participants_3)
                    }


                    for (const notification of allRequestedEmails) {

                        const findUser = await userModel.findOne({
                            _id: notification
                        })

                        const findCreateSessionUser = await userModel.findOne({
                            _id: findIdInSession.participants[0].participants_1
                        })
                        if (findUser.fcm_token) {
                            const title = findCreateSessionUser.firstName;
                            const body = `session is joing by ${findCreateSessionUser.firstName}`;

                            const text = "join session";
                            const sendBy = (findCreateSessionUser._id).toString();
                            const registrationToken = findUser.fcm_token
                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );
                        }


                        const findInNotification = await notificationModel.findOne({
                            userId: notification
                        })

                        if (findInNotification) {

                            await notificationModel.updateOne({
                                userId: notification
                            }, {
                                $push: {
                                    notifications: {
                                        notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                        userId: findCreateSessionUser._id,
                                        status: 9
                                    }
                                }
                            })

                        } else {
                            const savedata = notificationModel({
                                userId: notification,
                                notifications: {
                                    notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                    userId: findCreateSessionUser._id,
                                    status: 9
                                }
                            })
                            await savedata.save();

                        }
                    }


                } else if ((p2).toString() == (arg.create_session_user).toString()) {

                    const commentSession = await sessionCommentModel.findOne({
                        sessionId: arg.session_id,
                        "joinUser.userId": mongoose.Types.ObjectId(p2)
                    })

                    if (commentSession) { } else {
                        await sessionCommentModel.updateOne({
                            sessionId: arg.session_id,
                        }, {
                            $push: {
                                joinUser: {
                                    userId: mongoose.Types.ObjectId(p2),
                                    status: 2
                                }
                            }
                        })
                    }

                    await sessionModel.updateOne(
                        {
                            _id: arg.session_id,
                        },
                        { $inc: { countJoinUser: 1 } }
                    )
                    const allRequestedEmails = [];

                    const sessionUser = findIdInSession.cretedSessionUser == null ? "" : findIdInSession.cretedSessionUser
                    const p1 = findIdInSession.participants[0].participants_1 == null ? "" : findIdInSession.participants[0].participants_1
                    const p3 = findIdInSession.participants[0].participants_3 == null ? "" : findIdInSession.participants[0].participants_3

                    if (sessionUser) {
                        allRequestedEmails.push(findIdInSession.cretedSessionUser)
                    }
                    if (p1) {
                        allRequestedEmails.push(findIdInSession.participants[0].participants_1)
                    }
                    if (p3) {
                        allRequestedEmails.push(findIdInSession.participants[0].participants_3)
                    }


                    for (const notification of allRequestedEmails) {

                        const findUser = await userModel.findOne({
                            _id: notification
                        })

                        const findCreateSessionUser = await userModel.findOne({
                            _id: findIdInSession.participants[0].participants_2
                        })

                        if (findUser.fcm_token) {
                            const title = findCreateSessionUser.firstName;
                            const body = `session is joing by ${findCreateSessionUser.firstName}`;

                            const text = "join session";
                            const sendBy = (findCreateSessionUser._id).toString();
                            const registrationToken = findUser.fcm_token
                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );
                        }


                        const findInNotification = await notificationModel.findOne({
                            userId: notification
                        })

                        if (findInNotification) {

                            await notificationModel.updateOne({
                                userId: notification
                            }, {
                                $push: {
                                    notifications: {
                                        notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                        userId: findCreateSessionUser._id,
                                        status: 9
                                    }
                                }
                            })

                        } else {
                            const savedata = notificationModel({
                                userId: notification,
                                notifications: {
                                    notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                    userId: findCreateSessionUser._id,
                                    status: 9
                                }
                            })
                            await savedata.save();

                        }
                    }
                } else if ((p3).toString() == (arg.create_session_user).toString()) {

                    const commentSession = await sessionCommentModel.findOne({
                        sessionId: arg.session_id,
                        "joinUser.userId": mongoose.Types.ObjectId(p3)
                    })

                    if (commentSession) { } else {
                        await sessionCommentModel.updateOne({
                            sessionId: arg.session_id,
                        }, {
                            $push: {
                                joinUser: {
                                    userId: mongoose.Types.ObjectId(p3),
                                    status: 2
                                }
                            }
                        })
                    }

                    await sessionModel.updateOne(
                        {
                            _id: arg.session_id,
                        },
                        { $inc: { countJoinUser: 1 } }
                    )


                    const allRequestedEmails = [];

                    const sessionUser = findIdInSession.cretedSessionUser == null ? "" : findIdInSession.cretedSessionUser
                    const p2 = findIdInSession.participants[0].participants_2 == null ? "" : findIdInSession.participants[0].participants_2
                    const p1 = findIdInSession.participants[0].participants_1 == null ? "" : findIdInSession.participants[0].participants_1

                    if (sessionUser) {
                        allRequestedEmails.push(findIdInSession.cretedSessionUser)
                    }
                    if (p2) {
                        allRequestedEmails.push(findIdInSession.participants[0].participants_2)
                    }
                    if (p1) {
                        allRequestedEmails.push(findIdInSession.participants[0].participants_1)
                    }


                    for (const notification of allRequestedEmails) {

                        const findUser = await userModel.findOne({
                            _id: notification
                        })

                        const findCreateSessionUser = await userModel.findOne({
                            _id: findIdInSession.participants[0].participants_3
                        })
                        if (findUser.fcm_token) {
                            const title = findCreateSessionUser.firstName;
                            const body = `session is joing by ${findCreateSessionUser.firstName}`;

                            const text = "join session";
                            const sendBy = (findCreateSessionUser._id).toString();
                            const registrationToken = findUser.fcm_token
                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );
                        }


                        const findInNotification = await notificationModel.findOne({
                            userId: notification
                        })

                        if (findInNotification) {

                            await notificationModel.updateOne({
                                userId: notification
                            }, {
                                $push: {
                                    notifications: {
                                        notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                        userId: findCreateSessionUser._id,
                                        status: 9
                                    }
                                }
                            })

                        } else {
                            const savedata = notificationModel({
                                userId: notification,
                                notifications: {
                                    notifications: `session started which one is created by ${findCreateSessionUser.firstName}`,
                                    userId: findCreateSessionUser._id,
                                    status: 9
                                }
                            })
                            await savedata.save();

                        }
                    }
                } else {
                    const commentSession = await sessionCommentModel.findOne({
                        sessionId: arg.session_id,
                        "joinUser.userId": mongoose.Types.ObjectId(arg.create_session_user)
                    })

                    if (commentSession) { } else {
                        await sessionCommentModel.updateOne({
                            sessionId: arg.session_id,
                        }, {
                            $push: {
                                joinUser: {
                                    userId: mongoose.Types.ObjectId(arg.create_session_user),
                                    status: 3
                                }
                            }
                        })
                    }
                }
            } else {
                io.emit("sessionJoinSuccess", "seesion not found");
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

                if (fcm_token) {
                    const title = "n2you Notification";
                    const body = 'room Created';

                    const text = 'room Created';
                    const sendBy = arg.user_1;
                    const registrationToken = fcm_token.fcm_token

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
                            if (fcm_token) {
                                const title = "n2you Notification";
                                const body = `${arg.sender_id} send request to `;

                                const text = arg.text;
                                const sendBy = arg.sender_id;
                                const registrationToken = fcm_token.fcm_token

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
                            if (fcm_token) {
                                const title = "n2you Notification";
                                const body = `${arg.sender_id} send request to `;

                                const text = arg.text;
                                const sendBy = arg.sender_id;
                                const registrationToken = fcm_token.fcm_token

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
                chatRoomId: arg.chat_room,
                "chat.sender": arg.user_id
            })

            console.log("findRoom.chat", findRoom);

            if (findRoom == null) {

            } else {
                for (const [key, getSenderChat] of findRoom.chat.entries()) {

                    if ((getSenderChat.sender).toString() == (arg.user_id).toString()) {

                        // await chatModels.updateOne({
                        //     sender: mongoose.Types.ObjectId(arg.user_id)
                        // }, {
                        //     $set: {
                        //         read: 0
                        //     }
                        // }).then(() => {
                        //     console.log("success");
                        // }).catch((err) => {
                        //     console.log(err);
                        // })

                        const updatePosts = await chatModels.updateOne(
                            {
                                chatRoomId: arg.chat_room, chat: {
                                    $elemMatch: {
                                        sender: mongoose.Types.ObjectId(arg.user_id)
                                    }
                                }
                            },
                            {
                                $set: {
                                    "chat.$[chat].read": 0
                                }
                            },
                            { arrayFilters: [{ 'chat.sender': mongoose.Types.ObjectId(arg.user_id) }] })
                    } else {

                    }
                }
            }



            if (findRoom == null) {
                io.emit("readChat", "chat room not found");
            } else {
                // await chatModels.updateMany({ chatRoomId: arg.chat_room }, { $set: { "chat.$[].read": 0 } });
                io.emit("readChat", "read All chat");
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

        socket.on("sendFriendRequest", async (arg) => {

            const checkUserExist = await userModel.findOne({ _id: arg.user_id, polyDating: 0 });
            const checkRequestedEmail = await userModel.findOne({ _id: arg.requested_id, polyDating: 0 })

            if (checkUserExist && checkRequestedEmail) {

                if (checkRequestedEmail) {
                    const emailExitInRequestedModel = await requestModel.findOne({ userId: arg.user_id })

                    const emailExitInRequestedModel1 = await requestModel.findOne({ userId: arg.requested_id })


                    if (!emailExitInRequestedModel) {
                        const request = requestModel({
                            userId: checkUserExist._id,
                            userEmail: checkUserExist.email,
                            RequestedEmails: [{
                                requestedEmail: checkRequestedEmail.email,
                                accepted: 2,
                                userId: checkRequestedEmail._id
                            }],

                        })

                        const saveData = await request.save();

                        const findUserInNotification = await notificationModel.findOne({
                            userId: checkRequestedEmail._id
                        })

                        if (findUserInNotification) {
                            await notificationModel.updateOne({
                                userId: checkRequestedEmail._id
                            }, {
                                $push: {
                                    notifications: {
                                        notifications: `${checkUserExist.firstName} sent you a friend request.`,
                                        userId: checkUserExist._id,
                                        status: 1
                                    }
                                }
                            })
                        } else {

                            const data = notificationModel({
                                userId: checkRequestedEmail._id,
                                notifications: {
                                    notifications: `${checkUserExist.firstName} sent you a friend request.`,
                                    userId: checkUserExist._id,
                                    status: 1
                                }
                            })

                            await data.save();
                        }



                        if (!emailExitInRequestedModel1) {



                            const request = requestModel({
                                userId: checkRequestedEmail._id,
                                userEmail: checkRequestedEmail.email,
                                RequestedEmails: [{
                                    requestedEmail: checkUserExist.email,
                                    accepted: 4,
                                    userId: checkUserExist._id
                                }],

                            })

                            const saveData = await request.save();

                        } else {


                            const inRequested = [];
                            const allRequestedEmail = emailExitInRequestedModel1.RequestedEmails
                            allRequestedEmail.map((result, index) => {

                                if (result.requestedEmail == checkUserExist.email) {
                                    inRequested.push(true)
                                }
                            })
                            if (inRequested[0] == true) {

                            } else {
                                const updatePosts = await requestModel.updateOne({ userId: emailExitInRequestedModel1.userId },
                                    {
                                        $push: {
                                            RequestedEmails: [{
                                                requestedEmail: checkUserExist.email,
                                                accepted: 4,
                                                userId: checkUserExist._id
                                            }]
                                        }
                                    })
                            }

                        }

                        const userRoom = `User${arg.requested_id}`
                        io.to(userRoom).emit("getRequest", `Request Send successfully!`);
                        if (checkRequestedEmail.fcm_token) {
                            const fcm_token = checkRequestedEmail.fcm_token
                            const title = "Friend Request";
                            const body = `${checkUserExist.firstName} sent you a friend request.`;
                            const text = `${checkUserExist.firstName} sent you a friend request.`;
                            const sendBy = arg.user_id;
                            const registrationToken = fcm_token

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
                        const inRequested = [];
                        const allRequestedEmail = emailExitInRequestedModel.RequestedEmails
                        allRequestedEmail.map((result, index) => {

                            if (result.requestedEmail == checkRequestedEmail.email) {
                                inRequested.push(true)
                            }
                        })

                        if (!emailExitInRequestedModel1) {

                            const request = requestModel({
                                userId: checkRequestedEmail._id,
                                userEmail: checkRequestedEmail.email,
                                RequestedEmails: [{
                                    requestedEmail: checkUserExist.email,
                                    accepted: 4,
                                    userId: checkUserExist._id
                                }],
                            })

                            const saveData = await request.save();

                        } else {
                            const inRequested = [];

                            const allRequestedEmail = emailExitInRequestedModel1.RequestedEmails
                            allRequestedEmail.map((result, index) => {

                                if (result.requestedEmail == checkUserExist.email) {
                                    inRequested.push(true)
                                }
                            })
                            if (inRequested[0] == true) {

                            } else {
                                const updatePosts = await requestModel.updateOne({ userId: emailExitInRequestedModel1.userId },
                                    {
                                        $push: {
                                            RequestedEmails: [{
                                                requestedEmail: checkUserExist.email,
                                                accepted: 4,
                                                userId: checkUserExist._id
                                            }]
                                        }
                                    })
                            }

                        }
                        if (inRequested[0] == true) {
                            const userRoom = `User${arg.requested_id}`
                            io.to(userRoom).emit("getRequest", `Already Requested!`);
                        } else {
                            const updatePosts = await requestModel.updateOne({ userId: arg.user_id },
                                {
                                    $push: {
                                        RequestedEmails: [{
                                            requestedEmail: checkRequestedEmail.email,
                                            accepted: 2,
                                            userId: checkRequestedEmail._id
                                        }]
                                    }
                                })
                            const findUserInNotification = await notificationModel.findOne({
                                userId: checkRequestedEmail._id
                            })
                            if (findUserInNotification) {
                                await notificationModel.updateOne({
                                    userId: checkRequestedEmail._id
                                }, {
                                    $push: {
                                        notifications: {
                                            notifications: `${checkUserExist.firstName} sent you a friend request.`,
                                            userId: checkUserExist._id,
                                            status: 1
                                        }
                                    }
                                })
                            } else {
                                const data = notificationModel({
                                    userId: checkRequestedEmail._id,
                                    notifications: {
                                        notifications: `${checkUserExist.firstName} sent you a friend request.`,
                                        userId: checkUserExist._id,
                                        status: 1
                                    }
                                })

                                await data.save();
                            }

                            const userRoom = `User${arg.requested_id}`
                            io.to(userRoom).emit("getRequest", `Request Send successfully!`);


                            if (checkRequestedEmail.fcm_token) {
                                const fcm_token = checkRequestedEmail.fcm_token
                                const title = "Friend Request";
                                const body = `${checkUserExist.firstName} sent you a friend request.`;
                                const text = `${checkUserExist.firstName} sent you a friend request.`;
                                const sendBy = arg.user_id;
                                const registrationToken = fcm_token

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
                    }
                } else {

                }
            } else {
                const userRoom = `User${arg.requested_id}`
                io.to(userRoom).emit("getRequest", `not found!`);

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
                        profileConflictUser: findUser.photo[0] ? findUser.photo[0].res : "",
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

        socket.on('videoCall', async (arg) => {

            const findChatRoom = await chatRoomModel.findOne({
                _id: arg.chat_room_id
            })

            const findReciverIdInAllVideoCall = await videoCallModel.findOne({
                $or: [
                    {
                        senderId: arg.receiver_id
                    },
                    {
                        receiverId: arg.receiver_id
                    }
                ]
            })

            if (findReciverIdInAllVideoCall) {
                const userRoom = `User${arg.sender_id}`
                io.to(userRoom).emit("videoCallEngaged", "User is already on a call! Please try again after sometime.");
            } else {
                if (findChatRoom) {

                    const findData = await videoCallModel.findOne({
                        chatRoomId: arg.chat_room_id
                    })


                    if (findData) {
                        io.emit("videoCallReceive", "already ceated video call!")
                    } else {
                        const saveData = videoCallModel({
                            chatRoomId: arg.chat_room_id,
                            senderId: arg.sender_id,
                            receiverId: arg.receiver_id
                        })

                        await saveData.save();

                        const sender = await userModel.findOne({
                            _id: arg.sender_id
                        })

                        const videoCallData = {
                            chatRoomId: arg.chat_room_id,
                            senderId: arg.sender_id,
                            receiverId: arg.receiver_id,
                            userName: sender.firstName,
                            image: sender.photo ? sender.photo[0].res : ''
                        }

                        const userRoom = `User${arg.receiver_id}`
                        io.to(userRoom).emit("videoCallReceive", videoCallData);

                        const receiver = await userModel.findOne({
                            _id: arg.receiver_id
                        })

                        if (receiver.fcm_token) {
                            const fcm_token = receiver.fcm_token
                            const title = "video call Request";
                            const body = `${sender.firstName} join video call.`;
                            const text = `${sender.firstName} join video call.`;
                            const sendBy = arg.sender_id;
                            const registrationToken = fcm_token

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
                    io.emit("videoCallReceive", "Room not Found!")
                }
            }



        })

        socket.on('videoCallEnd', async (arg) => {

            const findChatRoom = await chatRoomModel.findOne({
                _id: arg.chat_room_id
            })

            if (findChatRoom) {
                const findData = await videoCallModel.findOne({
                    chatRoomId: arg.chat_room_id
                })

                if (findData) {

                    await videoCallModel.deleteOne({
                        chatRoomId: arg.chat_room_id
                    })

                    const sender = await userModel.findOne({
                        _id: arg.sender_id
                    })

                    const videoCallData = {
                        chatRoomId: arg.chat_room_id,
                        senderId: arg.sender_id,
                        receiverId: arg.receiver_id,
                        userName: sender.firstName,
                        image: sender.photo ? sender.photo[0].res : ''
                    }

                    const userRoom = `User${arg.receiver_id}`
                    io.to(userRoom).emit("videoCallEndReceive", videoCallData);

                    const receiver = await userModel.findOne({
                        _id: arg.receiver_id
                    })
                    if (receiver.fcm_token) {
                        const fcm_token = receiver.fcm_token
                        const title = "video call End Request";
                        const body = `${sender.firstName} End video call.`;
                        const text = `${sender.firstName} End video call.`;
                        const sendBy = arg.sender_id;
                        const registrationToken = fcm_token

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

                    io.emit("videoCallEndReceive", "not Create Any Video Call!")

                }

            } else {
                io.emit("videoCallEndReceive", "Room not Found!")
            }

        })

        socket.on('acceptVideoCall', async (arg) => {

            const findChatRoom = await chatRoomModel.findOne({
                _id: arg.chat_room_id
            })
            if (findChatRoom) {

                const findData = await videoCallModel.findOne({
                    chatRoomId: arg.chat_room_id
                })

                if (findData) {

                    await videoCallModel.updateOne({
                        chatRoomId: arg.chat_room_id
                    }, {
                        $set: {
                            accepted: 1
                        }
                    })

                    io.emit("acceptVideoCallReceive", "accepted request!")
                } else {

                    io.emit("acceptVideoCallReceive", "not Create Any Video Call!")

                }

            } else {
                io.emit("acceptVideoCallReceive", "Room not Found!")
            }

        })

        socket.on('endSession', async (arg) => {

            const findSession = await sessionModel.findOne({
                _id: arg.session_id
            })

            if (findSession) {
                if ((findSession.cretedSessionUser).toString() == (arg.create_session_user).toString()) {

                    await sessionCommentModel.deleteOne({
                        sessionId: arg.session_id
                    })

                    await sessionModel.updateOne(
                        {
                            _id: arg.session_id,
                        },
                        { countJoinUser: 0 }
                    )

                    await sessionModel.updateOne({
                        _id: arg.session_id
                    }, {
                        $set: {
                            sessionEndOrNot: true,
                            started: false
                        }
                    })

                    const allRequestedEmails = [];

                    const p1 = findSession.participants[0].participants_1 == null ? "" : findSession.participants[0].participants_1
                    const p2 = findSession.participants[0].participants_2 == null ? "" : findSession.participants[0].participants_2
                    const p3 = findSession.participants[0].participants_3 == null ? "" : findSession.participants[0].participants_3

                    if (p1) {
                        allRequestedEmails.push(findSession.participants[0].participants_1)
                    }
                    if (p2) {
                        allRequestedEmails.push(findSession.participants[0].participants_2)
                    }
                    if (p3) {
                        allRequestedEmails.push(findSession.participants[0].participants_3)
                    }


                    for (const notification of allRequestedEmails) {

                        const findUser = await userModel.findOne({
                            _id: notification
                        })

                        const findCreateSessionUser = await userModel.findOne({
                            _id: findSession.cretedSessionUser
                        })

                        if (findUser.fcm_token) {
                            const title = findCreateSessionUser.firstName;
                            const body = `session end by ${findCreateSessionUser.firstName}`;

                            const text = "join session";
                            const sendBy = (findCreateSessionUser._id).toString();
                            const registrationToken = findUser.fcm_token
                            Notification.sendPushNotificationFCM(
                                registrationToken,
                                title,
                                body,
                                text,
                                sendBy,
                                true
                            );
                        }


                        const findInNotification = await notificationModel.findOne({
                            userId: notification
                        })

                        if (findInNotification) {

                            await notificationModel.updateOne({
                                userId: notification
                            }, {
                                $push: {
                                    notifications: {
                                        notifications: `session end by ${findCreateSessionUser.firstName}`,
                                        userId: findCreateSessionUser._id,
                                        status: 10
                                    }
                                }
                            })

                        } else {
                            const savedata = notificationModel({
                                userId: notification,
                                notifications: {
                                    notifications: `session end by ${findCreateSessionUser.firstName}`,
                                    userId: findCreateSessionUser._id,
                                    status: 10
                                }
                            })
                            await savedata.save();

                        }
                    }


                    const res = {
                        message: "Session end Successfully",
                        status: 0
                    }

                    io.emit("endSessionSuccess", res)

                } else {

                    await sessionCommentModel.updateOne({
                        sessionId: arg.session_id
                    }, {
                        $pull: {
                            joinUser: {
                                userId: arg.create_session_user
                            }
                        }
                    })

                    await sessionModel.updateOne(
                        {
                            _id: arg.session_id,
                        },
                        { $inc: { countJoinUser: -1 } }
                    )


                    const res = {
                        message: "Session end Successfully",
                        status: 1
                    }

                    io.emit("endSessionSuccess", res)
                }
            } else {
                io.emit("endSessionSuccess", "Session not Found!")
            }

        })

        socket.on('callForJoin', async (arg) => {

            const findSession = await sessionModel.findOne({
                _id: arg.session_id
            })

            if (findSession.roomType == "Pblic") {

                const findUser = await userModel.find({
                    _id: {
                        $ne: arg.create_session_user
                    }
                }).select("_id")


                for (const getNot of findUser) {
                    const userRoom = `User${getNot._id}`
                    io.to(userRoom).emit("nowEnd", "successfully start now");
                }

            } else {

                const allId = [];
                const findSession = await sessionModel.findOne({
                    _id: arg.session_id
                })

                const p1 = findSession.participants[0].participants_1 == null ? "" : findSession.participants[0].participants_1
                const p2 = findSession.participants[0].participants_2 == null ? "" : findSession.participants[0].participants_2
                const p3 = findSession.participants[0].participants_3 == null ? "" : findSession.participants[0].participants_3

                if (p1) {
                    allId.push(findSession.participants[0].participants_1)
                } else if (p2) {
                    allId.push(findSession.participants[0].participants_1)
                } else if (p3) {
                    allId.push(findSession.participants[0].participants_1)
                }

                for (const getNot of allId) {
                    const userRoom = `User${getNot}`
                    io.to(userRoom).emit("nowEnd", "successfully start now");
                }

            }
        })

        socket.on("commentOnLiveSession", async (arg) => {
            const findSession = await sessionModel.findOne({
                _id: arg.session_id
            })
            if (findSession) {

                const findInCommentSessionModel = await sessionCommentModel.findOne({
                    sessionId: arg.session_id
                })
                if (findInCommentSessionModel) {

                    const AllJoinUser = [];
                    const statusWithId = {
                        userId: findInCommentSessionModel.cretedSessionUser,
                        status: 1
                    }
                    AllJoinUser.push(statusWithId)
                    for (const joinUser of findInCommentSessionModel.joinUser) {
                        const statusWithId = {
                            userId: joinUser.userId,
                            status: joinUser.status
                        }
                        AllJoinUser.push(statusWithId)
                    }

                    console.log(AllJoinUser);

                    const findUser = await userModel.findOne({
                        _id: arg.user_id
                    })

                    await sessionCommentModel.updateOne({
                        sessionId: arg.session_id
                    }, {
                        $push: {
                            commentWithUser: {
                                userId: arg.user_id,
                                comment: arg.comment,
                                userName: findUser.firstName,
                                profile: findUser.photo[0] ? findUser.photo[0].res : ""
                            }
                        }
                    })


                    for (const sendComment of AllJoinUser) {
                        if ((sendComment.userId).toString() == (arg.user_id).toString()) {
                            const commentData = {
                                userId: arg.userId,
                                comment: arg.comment,
                                userName: findUser.firstName,
                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                status: sendComment.status
                            }
                        } else {
                        }

                        const userRoom = `User${sendComment.userId}`
                        io.to(userRoom).emit("commentResponse", commentData);

                    }

                } else {
                    io.emit("commentResponse", "Not Found Session!");
                }

            } else {

                io.emit("commentResponse", "Not Found Session!");
            }
        })

        socket.on("raiseHand", async (arg) => {

            const findUser = await sessionModel.findOne({
                _id: arg.session_id
            })

            if (findUser) {

                const findUser1 = await sessionCommentModel.findOne({
                    sessionId: arg.session_id,
                    "raisHand.userId": arg.user_id
                })

                if (findUser1) {

                    io.emit("raiseHandSuccess", "already raise hand list!");

                } else {
                    await sessionCommentModel.updateOne({
                        session_id: arg.session_id
                    }, {
                        $push: {
                            raisHand: {
                                userId: arg.user_id
                            }
                        }
                    })

                    const userRoom = `User${findUser.cretedSessionUser}`
                    io.to(userRoom).emit("raiseHandSuccess", "raise hand success!");


                }
            } else {
                io.emit("raiseHandSuccess", "Not Found Session!");
            }

        })

        socket.on("raiseHandAccepted", async (arg) => {

            const findUser = await sessionModel.findOne({
                _id: arg.session_id
            })

            if (findUser) {

                const findUser1 = await sessionCommentModel.findOne({
                    sessionId: arg.session_id,
                    "raisHand.userId": arg.user_id
                })


                if (findUser1) {
                    await sessionCommentModel.updateOne({
                        session_id: arg.session_id,
                        "raisHand.userId": arg.user_id
                    }, {
                        $set: {
                            raisHand: {
                                mute: 1,
                                userId: arg.user_id
                            }
                        }
                    })

                    const userRoom = `User${findUser.cretedSessionUser}`
                    io.to(userRoom).emit("raiseHandAcceptedSuccess", "raise hand success!");

                } else {
                    io.emit("raiseHandAcceptedSuccess", "already raise hand list!");
                }
            } else {
                io.emit("raiseHandAcceptedSuccess", "Not Found Session!");
            }

        })

        socket.on("liveSession", async (arg) => {

            const data = await sessionModel.find({
                started: true, cretedSessionUser: {
                    $ne: arg.user_id
                },
            })
            const publicData = [];
            const privateData = [];

            for (const res of data) {
                console.log(res);
                if (res.RoomType == "Public") {

                    const findUser = await userModel.findOne({
                        _id: mongoose.Types.ObjectId(res.cretedSessionUser)
                    })
                    const response = {
                        session_id: res._id,
                        profile: findUser.photo[0] ? findUser.photo[0].res : "",
                        rommType: res.RoomType,
                        cereatedUserId: findUser._id,
                        cereatedUserName: findUser.firstName,
                        role: 1
                    }

                    publicData.push(response)

                } else {

                    for (const participant of res.participants) {

                        if ((participant.participants_1).toString() == (arg.user_id).toString()) {

                            const findUser = await userModel.findOne({
                                _id: mongoose.Types.ObjectId(res.cretedSessionUser)
                            })
                            const response = {
                                session_id: res._id,
                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                rommType: res.RoomType,
                                cereatedUserId: findUser._id,
                                cereatedUserName: findUser.firstName,
                                role: 2
                            }

                            privateData.push(response)



                        } else if ((participant.participants_2).toString() == (arg.user_id).toString()) {

                            const findUser = await userModel.findOne({
                                _id: mongoose.Types.ObjectId(res.cretedSessionUser)
                            })
                            const response = {
                                session_id: res._id,
                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                rommType: res.RoomType,
                                cereatedUserId: findUser._id,
                                cereatedUserName: findUser.firstName,
                                role: 2
                            }

                            privateData.push(response)


                        } else if ((participant.participants_3).toString() == (arg.user_id).toString()) {

                            const findUser = await userModel.findOne({
                                _id: mongoose.Types.ObjectId(res.cretedSessionUser)
                            })
                            const response = {
                                session_id: res._id,
                                profile: findUser.photo[0] ? findUser.photo[0].res : "",
                                rommType: res.RoomType,
                                cereatedUserId: findUser._id,
                                cereatedUserName: findUser.firstName,
                                role: 2
                            }

                            privateData.push(response)

                        }
                    }

                }
            }

            const final_data = [...privateData, ...publicData];

            const userRoom = `User${arg.user_id}`
            io.to(userRoom).emit("liveSessionSuccess", final_data);


        })
    })
}

module.exports = socket
