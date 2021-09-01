// Socket IO
const socket = io();

// Variables
let buttonDown = false;

// Test to see if socket is working as intended
socket.on('pageLoaded', function(){
    console.log('Hello Socket.io');
})

// Event listener for holding the button
socket.on('buttonHold', () => {
    console.log('Holding button');
    updateButtonState(true);
})

// Event listener for releasing the button
socket.on('buttonRelease', () => {
    console.log('Released button');
    updateButtonState(false);
})

// Event listener for the received BPM.
socket.on('bpm', (data) => {
    console.log('bpm', data);

    const bpmText = document.getElementById('bpmState');

    bpmText.innerHTML = data;
});

// Event listener for if a seizure is detected.
socket.on("onSeizure", () => {
    new Audio('/audio/bruh.mp3').play()
});

/**
 * Function for updating the text on the webpage if the button state has changed
 * @param {boolean} buttonPressed is the button currently being pressed, should be input value from Arduino
 * @returns {boolean} has the state been updated?
 */
const updateButtonState = (buttonPressed) => {
    if (buttonPressed == buttonDown) return;
    const statusText = document.getElementById('buttonState');

    if (buttonPressed){
        statusText.innerHTML = "held down.";
    }
    else if (!buttonPressed){
        statusText.innerHTML = "released.";
    }

    buttonDown = buttonPressed;
    return true;
}