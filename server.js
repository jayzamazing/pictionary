//get required modules
var http = require('http');
var express = require('express');
var socket_io = require('socket.io');
var fs = require('fs');
//get instance of express
var app = express();
//add static files for express to use
app.use(express.static('public'));
//create http server, allows express to run at same time as socket.io
var server = http.Server(app);
//create sockets
var io = socket_io(server);
//keep track of connections
var users = {}, usersConnected = 0, currentTurn, rightAnswer = '', data = [];
//get the data from the json file
data = JSON.parse(fs.readFileSync('data.json'));
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
  });
  //attach listener for userturn to deal with telling who can draw and who can guess
  socket.on('userTurn', function() {
      //always ensure there are at least 2 players
      if (usersConnected >= 2) {
        //send message to specific user
        io.to(currentTurn).emit('userTurn', true);
        rightAnswer = data.words[Math.floor(Math.random() * (data.words.length - 1))];
        io.to(currentTurn).emit('message', rightAnswer);
        //tell everyone else that it is not their turn
        socket.emit('userTurn', false);
        //clear out any previous message
        socket.emit('message', '');
      } else {
        //emit message that they are waiting on additional user
        socket.emit('message', 'Waiting for more users to connect.');
        //store the first user as having the current turn
        currentTurn = Object.keys(users)[0];
      }
  });
  socket.on('draw', function(position) {
    //share the drawing with all other Clients
    socket.broadcast.emit('draw', position);
  });
  //attach listener to the guess emit event
  socket.on('guess', function(guess) {
    if (rightAnswer.localeCompare(guess) === 0) {
      //tell everyone pictionary guess
      socket.broadcast.emit('guess', users[socket.id] + ' wins: ' + guess);
      socket.broadcast.emit('correct', false);
      currentTurn = socket.id;
      socket.emit('correct', true);
    } else {
      //tell everyone pictionary guess
      socket.broadcast.emit('guess', users[socket.id] + ': ' + guess);
    }
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
