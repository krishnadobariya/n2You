const express = require("express");
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require("body-parser");
require('./src/db/conn');


app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/images', express.static('images'));
const userRoutes = require("./src/routes/user.routes");
const postRoutes = require("./src/routes/post.routes");
const requestRoutes = require("./src/routes/request.routes");
const likeRoutes = require("./src/routes/like.routes");
const commentRoutes = require("./src/routes/comment.routes");
const blockUnblockUserRoutes = require("./src/routes/blockuser.routes");
const chatRoutes = require("./src/routes/chat.routes");
const sessionRoutes = require('./src/routes/session.routes');
const thumbManageRoutes = require("./src/routes/thumbManage.routes");
const basketRoutes = require("./src/routes/basket.routes");




// polyamorous
const datingRoutes = require("./src/routes/polyamorous/dating.routes");
const blockUnblockRoutes = require('./src/routes/polyamorous/blockUnblock.routes');
const groupChatRoutes = require("./src/routes/polyamorous/groupChat.routes");
const notificationRoutes = require('./src/routes/polyamorous/notification.routes');
const conflictRoutes = require('./src/routes/polyamorous/conflict.routes');


app.use('/user', userRoutes);
app.use('/posts', postRoutes);
app.use('/request', requestRoutes);
app.use('/like', likeRoutes);
app.use('/comment', commentRoutes);
app.use('/blockUnblockUser', blockUnblockUserRoutes);
app.use('/chat', chatRoutes);
app.use('/session', sessionRoutes);
app.use('/thumb', thumbManageRoutes);
app.use('/basket', basketRoutes);

// polyamorous
app.use('/dating', datingRoutes);
app.use('/blockUnblockUsers', blockUnblockRoutes);
app.use('/groupChat', groupChatRoutes);
app.use('/notification', notificationRoutes);
app.use('/conflict', conflictRoutes);

module.exports = app;