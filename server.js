const http = require("http");
require('dotenv').config();

const app = require('./app');

const port = process.env.PORT || 43760;

const server = http.createServer(app);

server.listen(port, function(){
  console.log("Express server listening on port %d in %s mode");
});
