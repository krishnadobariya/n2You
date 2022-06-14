const http = require("http");
require('dotenv').config();

const app = require('./app');

const port = process.env.PORT || 3000;

const server = http.createServer(app);

server.listen(3000, () => {
    console.log(`app is running port ${port}`);
})
