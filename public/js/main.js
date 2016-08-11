$(document).ready(function() {
  //create manager object by calling io function
  var socket = io(), currentTurn = false;
  //deal with emit guess from server
  var addAnswer = function(answer) {
    //add answer to end of guesses
    $('#answer').text(answer);
  };
  //function either allows user to draw or make guesses
  var userTurn = function(turn) {
    //set ui to clean slate
    startNewGame();
    //if turn is true
    if (turn) {
      //set to true to allow drawing
      currentTurn = true;
      //otherwise
    } else {
      //unhide and allow guesses
      $('#guess').removeClass('hide');
    }
  }
  //function to deal with emitting guesses
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
  //function to deal with joining game using a name
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
    //emit userturn
    socket.emit('userTurn');
  }
  //function to show messages
  var showMessage = function(message) {
    //show messages in ui
    $('#message').text(message);
  }
  //function to deal with showing who won and waiting for next game
  var showCorrect = function(won) {
    //display next game message
    $('#message').text('Starting new game in 5 seconds');
    //only perform if this user won
    if (won) {
      //show that user has correct answer
      $('#correct').removeClass('hide');
      //perform function and then wait 5 seconds
      setTimeout(function() {
        socket.emit('userTurn');
      }, 5000);
      //otherwise
    } else {
      //wait 5 seconds
      setTimeout(null, 5000);
    }
  }
  //function that deals with reseting ui
  var startNewGame = function() {
    //ensure everything is cleared off
    $('#correct').addClass('hide');
    $('#guess').addClass('hide');
    $('#namefield').addClass('hide');
    $('#message').text('');
    $('#answer').text('');
    currentTurn = false;
    //select the canvas element
    canvas = $('canvas');
    //create drawing context for the canvas
    context = canvas[0].getContext('2d');
    context.clearRect(0, 0, 800, 600);
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
    //passes coordinates to draw on the canvas
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
  //listeners
  socket.on('guess', addAnswer);
  socket.on('userTurn', userTurn);
  socket.on('message', showMessage);
  socket.on('correct', showCorrect);
});
