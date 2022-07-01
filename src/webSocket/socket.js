
const chatModels = require("./models/chat.models");
const chatRoomModel = require("./models/chatRoom.model");
const Notification = require("../helper/firebaseHelper");
const userModel = require("../model/user.model");
const datingLikeDislikeUserModel = require("../model/polyamorous/datingLikeDislikeUser.model");
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

        socket.on("getUserWhichNotChoiceForLikeOrDislike", async (arg) => {
            const findUser = await userModel.findOne({
                _id: arg.user_id
            })

            if (findUser == null) {
                io.emit("getUser", "User Not Found!");
            } else {

                const getAllUserWhichLoginAsPolyamorous = await userModel.find({
                    "polyDating": "polyamorous"
                })

                if (getAllUserWhichLoginAsPolyamorous) {

                    const findAllUser = await userModel.find({
                        _id:
                        {
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


                            if(checkUserInLike || checkUserInDisLike){

                            }else{
                                const userDetail = {
                                    name : allUser.firstName,
                                    Bio: allUser.Bio,
                                    hopingToFind: allUser.hopingToFind,
                                    jobTitle: allUser.jobTitle,
                                    wantChildren: allUser.wantChildren
                                }
                                response.push(userDetail)
                            }
                        }
                        io.emit("getUser", response.slice(arg.skip,arg.limit));
                        
                    } else {
                        io.emit("getUser", "This User Not polyamorous!");
                    }
                } else {
                    io.emit("getUser", "This User Not polyamorous!");
                }

            }
        })

        socket.on("LikeOrDislikeUserForDating", async (arg) => {
            console.log("arg" , arg);
            const findUser = await userModel.findOne({
                _id: arg.user_id
            })

            if(findUser == null){
                io.emit("likeDislikeUser", "User Not Found!");
            }else{

                if(arg.like == 1){
                    
                    const existUserInLike = await datingLikeDislikeUserModel.findOne({
                        userId: arg.user_id,
                        "LikeUser.LikeduserId" : arg.like_user_id
                    }) 

                    const exisrUserIndisLike = await datingLikeDislikeUserModel.findOne({
                        userId: arg.user_id,
                        "disLikeUser.disLikeduserId" : arg.like_user_id
                    }) 

                    if(existUserInLike == null && exisrUserIndisLike == null){
                        const findInUserModel = await userModel.findOne({
                            _id: arg.like_user_id,
                            polyDating : "polyamorous"
                        });

                        if(findInUserModel == null){
                            io.emit("likeDislikeUser", "User Not polyDating");
                        }else{

                            const findUserInDating = await datingLikeDislikeUserModel.findOne({
                                userId: arg.user_id
                            })

                            if(findUserInDating == null){
                                const insertuserInDatingModel = datingLikeDislikeUserModel({
                                    userId : arg.user_id,
                                    LikeUser:{
                                        LikeduserId: arg.like_user_id
                                    }
                                })

                                await insertuserInDatingModel.save();
                                io.emit("likeDislikeUser", "User Like Dating");
                            }else{

                                await datingLikeDislikeUserModel.updateOne({
                                    userId: arg.user_id
                                }, {
                                    $push:{
                                        LikeUser:{
                                            LikeduserId: arg.like_user_id
                                        }
                                    }
                                })
                                io.emit("likeDislikeUser", "User Like Dating");
                            }
                            
                        }
                    }else{
                        io.emit("likeDislikeUser", "Already Liked or Dislike For Dating");
                    }

                }else if(arg.like == 0){
                    const existUserInLike = await datingLikeDislikeUserModel.findOne({
                        userId: arg.user_id,
                        "LikeUser.LikeduserId" : arg.like_user_id
                    }) 

                    const exisrUserIndisLike = await datingLikeDislikeUserModel.findOne({
                        userId: arg.user_id,
                        "disLikeUser.disLikeduserId" : arg.like_user_id
                    }) 

                    if(existUserInLike == null && exisrUserIndisLike == null){
                        const findInUserModel = await userModel.findOne({
                            _id: arg.like_user_id,
                            polyDating : "polyamorous"
                        });

                        if(findInUserModel == null){
                            io.emit("likeDislikeUser", "User Not polyDating");
                        }else{

                            const findUserInDating = await datingLikeDislikeUserModel.findOne({
                                userId: arg.user_id
                            })

                            if(findUserInDating == null){
                                const insertuserInDatingModel = datingLikeDislikeUserModel({
                                    userId : arg.user_id,
                                    disLikeUser:{
                                        disLikeduserId: arg.like_user_id
                                    }
                                })

                                await insertuserInDatingModel.save();
                                io.emit("likeDislikeUser", "User DisLike Dating");
                            }else{

                                await datingLikeDislikeUserModel.updateOne({
                                    userId: arg.user_id
                                }, {
                                    $push:{
                                        disLikeUser:{
                                            disLikeduserId: arg.like_user_id
                                        }
                                    }
                                })
                                io.emit("likeDislikeUser", "User DisLike Dating");
                            }
                        }
                    }else{
                        io.emit("likeDislikeUser", "Already Liked or Dislike For Dating");
                    }

                }

            }
        })
    })

}




module.exports = socket

// if (arg.like == 1) {

                                

//     for (const allUser of findAllUser) {
//         const findUserInDislikeOrLike = await datingLikeDislikeUserModel.findOne({
//             userId: arg.user_id,
//             "LikeUser.LikeduserId": allUser._id
//         })

//         if (findUserInDislikeOrLike == null) {
//             const findUserId = await datingLikeDislikeUserModel.findOne({
//                 userId: arg.user_id,
//             })
//             if (findUserId == null) {
                // const insertInDatingLikeDislikeUserModel = datingLikeDislikeUserModel({
                //     userId: arg.user_id,
                //     LikeUser: {
                //         LikeduserId: allUser._id
                //     }
                // })

//                 await insertInDatingLikeDislikeUserModel.save();
//             } else {

                // const insertInDatingLikeDislikeUserModel = await datingLikeDislikeUserModel.updateOne({
                //     userId: arg.user_id,
                // }, {
                //     $push: {
                //         LikeUser: {
                //             LikeduserId: allUser._id
                //         }
                //     }
                // })
//             }
//         }
//     }

//     io.emit("getUser", "this is  polyamorous user");

// } else if (arg.like == 0) {



// }