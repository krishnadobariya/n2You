const http = require("http");
require('dotenv').config();

const app = require('./app');

const port = process.env.PORT || 80;

const server = http.createServer(app);

server.listen(process.env.PORT || 80, function(){
  console.log("Express server listening on port %d in %s mode");
});
