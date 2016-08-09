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
//keep track of connections
var users = {}, usersConnected = 0, currentTurn = 0;
//attach listener to connection event
io.on('connection', function(socket) {
  console.log('Client connected');
  //attach listener that will allow user to be assigned a name
  socket.on('join', function(name) {
      //increment usersconnected count
      usersConnected++;
      //show how many users are connected in the console
      console.log('Clients connected: ' + usersConnected);
      //add user
      users[socket.id] = name;
      //let the user know they connected
      socket.emit('message', 'You are connected to the server.');
      //tell everyone who is connected that the user just joined
      socket.broadcast.emit('message', name + ' has joined the server. There are ' + usersConnected + ' online.')
          //send out list of currently connected users
      io.emit('users', users);
  });
  //TODO
  socket.on('userTurn', function() {
      console.log('inside user turn');
      //always ensure there are at least 2 players
      if (usersConnected >= 2) {
        currentTurn++;
        //loop back to the first user
        if (currentTurn > usersConnected) {
          currentTurn = 1;
        }
        var temp = Object.keys(users).forEach(function(key, index) {
          if (index === currentTurn) {
            return key;
          }
        });
        //send message to specific user
        socket.to(temp).emit('userTurn', true);
        //tell everyone else that it is not their turn
        socket.broadcast.emit('userTurn', false);
      } else {
        socket.emit('message', 'Waiting for more users to connect.');
      }
  });
  socket.on('draw', function(position) {
    //share the drawing with all other Clients
    socket.broadcast.emit('draw', position);
  });
  //attach listener to the guess emit event
  socket.on('guess', function(guess) {
    //tell everyone pictionary guess
    socket.broadcast.emit('guess', guess[socket.id] + ': ' + guess);
  });
  //send message to users when a user disconnects
  socket.on('disconnect', function() {
      //only perform if there are users attached
      if (usersConnected > 0) {
          //decrement users connected
          usersConnected--;
          //log users connected
          console.log('Clients connected: ' + usersConnected);
          //as long as user disconnecting is valid
          if (users[socket.id] !== undefined) {
              //tell everyone that user is disconnecting
              socket.broadcast.emit('message', users[socket.id] + ' has disconnected. There are ' + usersConnected + ' online.');
              //remove user from list
              delete users[socket.id];
          }
          //send out list of current users connected
          io.emit('users', users);
      }
  });
});
//start server listening on port
server.listen(8080);
