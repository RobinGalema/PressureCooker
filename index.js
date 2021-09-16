// Used libraries.
const process = require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require("socket.io")(http);
const Readline = require('@serialport/parser-readline');
const SerialPort = require('serialport');

// Environment variables.
const comPort = '\\\\.\\COM5';
const useLogging = false;

// Variables
let amountOfMeasurements = 200;
let measurementValues = [];
let calculatingAverage = false;

// Server variables.
var publicDir = require('path').join(__dirname, '/public');
const port = new SerialPort(comPort, { baudRate: 9600 }, (err) => {
    if (err) {
        console.error('Error: ', err);
    }
});
const parser = port.pipe(new Readline({ delimeter: '\n' }));

// Event listener for connection error's on the comport.
port.on('error', (err) => {
    console.error('Error: ', err);
});

// Event listener for receiving (parsed) data from the comport.
parser.on('data', (data) => {
    if (data) {
        if (!calculatingAverage && measurementValues.length < amountOfMeasurements) {
            measurementValues.push(Number.parseInt(data));
        } else {
            calculateAverageBPM();
        }

        if (useLogging) {
            console.log("Debug: ", data);
        }
    }
});


//  --- Page Loading ---
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static(publicDir));

io.on('connection', (socket) => {
    if (useLogging) {
        console.log('A user connected');
    }

    io.emit('pageLoaded');
});

http.listen(3000, () => {
    console.log('listening on *:3000');
});

// Calculates the average BPM within a certain measerument interval.
function calculateAverageBPM() {
    calculatingAverage = true;
    var total = 0;
    measurementValues.forEach(value => {
        total += value;
    });
    var average = total / amountOfMeasurements;

    if (average >= 150) {
        io.emit('onSeizure');
    }
    io.emit('bpm', average);

    measurementValues = [];
    calculatingAverage = false;
}