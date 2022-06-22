const {
    chaWithUser
} = require("./controller/chat.controller");

function socket(io) {


    io.on('connection', (socket) => {

        socket.on("created", (data) => {
            console.log("data", data);
            chaWithUser(data, socket);

        })
    })
}

module.exports = socket;