
const chatModels = require("./models/chat.models");



// function socket(io) {


//     io.on('connection', (socket) => {

//         socket.on("created", async (arg) => {

//             const chatRoomFind = await chatRoomModel.findOne({
//                 userId: mongoose.Types.ObjectId(arg.user_id),
//                 requestedUserId: mongoose.Types.ObjectId(arg.requested_user_id)
//             })
//             console.log("chatRoomFind", chatRoomFind);

//             if (chatRoomFind == null) {
//                 socket.emit("created", "Chat Room Not Created")
//             } else {
//                 const findChatRoom = await chatModel.findOne({ chatRoomId: chatRoomFind._id })
//                 if (findChatRoom == null) {
//                     const chatobj = chatModel({
//                         chatRoomId: chatRoomFind._id,
//                         chat: {
//                             sender: arg.sender,
//                             text: arg.text
//                         }

//                     })

//                     const insertData = await chatobj.save();

//                     socket.emit("created", "send successfully")
//                 } else {
//                     const finalData = {
//                         sender: arg.sender,
//                         text: arg.text
//                     }

//                     await chatModel.updateOne({ chatRoomId: chatRoomFind._id, }, { $push: { chat: finalData } });
//                     socket.emit("created", "send successfully")
//                 }

//             }


//             socket.to("getChat", (data) => {
//                 console.log(data);
//                 chat
//             })
//         })

//         socket.on("createRoom", (data) => {
//             console.log("data2", data);
//             createRoom(data, socket);
//         })
//     })


// }

// module.exports = socket;

function socket(io) {

    console.log("socket connected...");

    io.on('connection', (socket) => {

        socket.on("joinUser", function (data) {
            const userRoom = `User${data.requestd_id}`
            socket.join(userRoom)
        })

        socket.on("chat", async (arg) => {
            const userRoom = `${arg.requestd_id}`
            console.log("userRoom:::", userRoom);


            const validUser = await chatModels.findOne({
                userId: arg.user_id,
                requestedId: arg.requestd_id,
            })

            if (validUser == null) {
                const createChat = chatModels({
                    userId: arg.user_id,
                    requestedId: arg.requestd_id,
                    chat: {
                        text: arg.text,
                        sender: arg.sender_id
                    }
                })

                const saveData = await createChat.save();


                io.to(userRoom).emit("chatReceive", "success");

            } else {
                const finalData = {
                    sender: arg.sender_id,
                    text: arg.text
                }

                await chatModels.updateOne(
                    {
                        userId: arg.user_id,
                        requestedId: arg.requestd_id
                    },
                    {
                        $push: { chat: finalData }
                    }
                );

                io.to(userRoom).emit("chatReceive", finalData);
            }

        })

    })

}

module.exports = socket