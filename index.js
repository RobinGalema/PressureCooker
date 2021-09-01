const express = require('express');
const app = express();
var http = require('http').createServer(app);
const io = require("socket.io")(http);
var publicDir = require('path').join(__dirname,'/public');

// Johnny Five
var five = require("johnny-five"),
  board, button;

//  --- Page Loading ---
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.use(express.static(publicDir));

io.on('connection', (socket) => {
  console.log('a user connected');

  io.emit('pageLoaded');
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});

let buttonReleased = false;

// Arduino event listeners
board = new five.Board();
board.on('ready', () => {
  // create a default instance of the button
  let button = new five.Button(2);

  board.repl.inject({
    button: button
  });

  // "hold" the button is pressed for specified time.
  button.on("hold", function() {
    // Send info to the web client
    io.emit("buttonHold");
  });

  button.on("release", function() {
    io.emit("buttonRelease");
  })
});