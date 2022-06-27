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

app.use('/user', userRoutes);
app.use('/posts', postRoutes);
app.use('/request', requestRoutes);
app.use('/like', likeRoutes);
app.use('/comment', commentRoutes);
app.use('/blockUnblockUser', blockUnblockUserRoutes);
app.use('/chat', chatRoutes);
app.use('/session', sessionRoutes);


module.exports = app;