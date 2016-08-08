//get required modules
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
//get instance of express
var app = express();
//add static files for express to use
app.use(express.static('public'));
//create http server, allows express to run at same time as socket.io
var server = http.Server(app);
//create sockets
var io = socket_io(server);
//attach listener to connection event
io.on('connection', function(socket) {
  console.log('Client connected');
  socket.on('draw', function(position) {
    //share the drawing with all other Clients
    socket.broadcast.emit('draw', position);
  });
  //attach listener to the guess emit event
  socket.on('guess', function(guess) {
    //tell everyone pictionary guess
    socket.broadcast.emit('guess', guess);
  });
});
//start server listening on port
server.listen(8080);
