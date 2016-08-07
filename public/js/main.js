$(document).ready(function() {
  //function to deal with drawing on the canvas
  var pictionary = function() {
    var canvas, context, drawing = false;
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
      if (drawing) {
      //get the offset of the canvas
      var offset = canvas.offset();
      //substract offset of canvas from x y, relative position to top left of canvas
      var position = {x: event.pageX - offset.left,
                      y: event.pageY - offset.top};
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
  };
  //calls pictionary function
  pictionary();
});
