const chatModel = require('../models/chat.models');


exports.chaWithUser = async (arg, socket) => {
    try {
        
        const chatobj = chatModel({
            text: arg.text
        })

        const insertData = await chatobj.save();

        socket.emit("created", { arg: insertData })

    } catch (error) {
        console.log("error::", error);
    }
}