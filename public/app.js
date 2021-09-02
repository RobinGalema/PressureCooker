// Socket IO
const socket = io();
let circle;

// Variables
const maxBpm = 150;
let isActive = false;
let bpmMoon;
let bpmContainer;
let bpmText;

// On window load function goes here
window.onload = (event) => {
    circle = new ProgressBar.Circle('#progress', {
        color: '#F72585',
        trailColor: '#2B4478',
        trailWidth: 2,
        strokeWidth: 2,
        duration: 1000,
        easing: 'easeInOut',
        svgStyle: {
            width: '288px'
        }
    });

    bpmMoon = document.getElementById('bpm-moon');
    bpmContainer = document.getElementById('bpm-text');
    bpmText = document.getElementById('bpm');
};

// Test to see if socket is working as intended
socket.on('pageLoaded', function() {
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
    if (isActive) updateBpm(data);
});

// Event listener for if a seizure is detected.
socket.on("onSeizure", () => {
    new Audio('/audio/counter.mp3').play()
});

/**
 * Function for updating the text on the webpage if the button state has changed
 * @param {boolean} buttonPressed is the button currently being pressed, should be input value from Arduino
 * @returns {boolean} has the state been updated?
 */
const updateButtonState = (buttonPressed) => {
    if (buttonPressed == buttonDown) return;
    const statusText = document.getElementById('buttonState');

    if (buttonPressed) {
        statusText.innerHTML = "held down.";
    } else if (!buttonPressed) {
        statusText.innerHTML = "released.";
    }

    buttonDown = buttonPressed;
    return true;
}

const toggleAppState = (button) => {
    
    if (!isActive){
        bpmMoon.setAttribute('data-active', 'false');
        bpmContainer.setAttribute('data-active', 'true');
        button.innerHTML = 'Wake up';
    }
    else if (isActive){
        bpmMoon.setAttribute('data-active', 'true');
        bpmContainer.setAttribute('data-active', 'false');
        button.innerHTML = 'Start sleep';
    }

    isActive = !isActive;
}

const updateBpm = (bpm) => {
    circle.animate(bpm / maxBpm);
    bpm.innerHTML = bpm;
}