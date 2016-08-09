$(document).ready(function() {
  //create manager object by calling io function
  var socket = io(), currentTurn = false;
  //deal with emit guess from server
  var addAnswer = function(answer) {
    //add answer to end of guesses
    $('#answer').text(answer);
  };
  var userTurn = function(turn) {
    if (turn) {
      currentTurn = true;
    } else {
      $('#guess').removeClass('hide');
    }
  }
  var onKeyDown = function(event) {
    //if the keycode is not enter
    if (event.keyCode != 13) {
      //exit
      return;
    }
    //show guess in console
    console.log(guessBox.val());
    //sends message to socket.io server
    socket.emit('guess', guessBox.val());
    //empty input
    guessBox.val('');
  };
  var keyDownUser = function(event) {
    //if the keycode is not enter
    if (event.keyCode != 13) {
      //exit
      return;
    }
    //show username in console
    console.log(userName.val());
    //sends username to socket.io server
    socket.emit('join', userName.val());
    //empty input
    $('#namefield').addClass('hide');
    socket.emit('userTurn');
  }
  //function to deal with drawing on the canvas
  var pictionary = function() {
    var canvas, context, drawing = false, guessBox;
    /*
    * Used to draw on the canvas
    * @param position - xy position - offset
    */
    var draw = function(position) {
      //tell the context we are going to start drawing
      context.beginPath();
      //draw on canvas
      context.arc(position.x, position.y, 3, 0, 2 * Math.PI);
      //fill the arc with black
      context.fill();
    }
    //select the canvas element
    canvas = $('canvas');
    //create drawing context for the canvas
    context = canvas[0].getContext('2d');
    //set width and height to equal size of canvas object
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    //listener for when the mouse moves on the canvas
    canvas.on('mousemove', function(event) {
      if (drawing && currentTurn) {
        //get the offset of the canvas
        var offset = canvas.offset();
        //substract offset of canvas from x y, relative position to top left of canvas
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        //send position to the server to share the drawing
        socket.emit('draw', position);
        //pass position to draw function
        draw(position);
    }
    });
    //deals with setting drawing as true on mousedown
    canvas.on('mousedown', function() {
      drawing = true;
    });
    //deals with setting the drawing to false on mouseup
    canvas.on('mouseup', function() {
      drawing = false;
    });
    socket.on('draw', draw);
  };
  //calls pictionary function
  pictionary();
  //get the guess box
  var guessBox = $('#guess input');
  //get the namefield input
  var userName = $('#namefield input');
  //when key is pressed, call onkeydown function
  guessBox.on('keydown', onKeyDown);
  userName.on('keydown', keyDownUser);
  socket.on('guess', addAnswer);
  socket.on('userTurn', userTurn);
});
