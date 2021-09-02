// Socket IO
const socket = io();

// Variables
const maxBpm = 220;
let bpm = 0;
let isActive = false;
let isHavingSeizure = false;
let circle;
let bpmMoon;
let bpmContainer;
let bpmText;
let bpmHeart;
let appTitle;
let button;
let seizureAudio = new Audio('/audio/counter.mp3');
let timeOut = setTimeout

// On document ready function.
window.onload = () => {
    createProgressCircle('#F72585');
    bpmMoon = document.getElementById('bpm-moon');
    bpmContainer = document.getElementById('bpm-text');
    bpmText = document.getElementById('bpm-value');
    appTitle = document.getElementById('app-title');
    bpmHeart = document.getElementById('bpm-heart');
    button = document.getElementById('startSleepButton');
};

// Test to see if socket is working as intended
socket.on('pageLoaded', function() {
    console.log('Hello Socket.io');
});

// Event listener for the received BPM.
socket.on('bpm', (data) => {
    console.log('bpm', data);
    bpm = data;
    if (isActive) {
        updateBpm(data);
    }
});

// Event listener for if a seizure is detected.
socket.on("onSeizure", () => {
    onSeizureDetected();
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

const toggleAppState = () => {

    if (isHavingSeizure) {
        clearTimeout(timeOut);
        setDefaultValues();
    }
    else if (!isActive) {
        bpmMoon.setAttribute('data-active', 'false');
        bpmContainer.setAttribute('data-active', 'true');
        button.innerHTML = 'Wake up';
        appTitle.style.visibility = 'hidden';
    } else if (isActive) {
        bpmMoon.setAttribute('data-active', 'true');
        bpmContainer.setAttribute('data-active', 'false');
        button.innerHTML = 'Start sleep';
        appTitle.style.visibility = 'visible';
    }

    isActive = !isActive;
};

const updateBpm = () => {
    if (!isHavingSeizure) {
        circle.animate(bpm / maxBpm);
    }

    bpmText.innerHTML = Math.floor(bpm);
};

const onSeizureDetected = () => {
    if (!isHavingSeizure) {
        seizureAudio.play()
        bpmHeart.style.color = '#EF233C';
        circle.destroy();
        createProgressCircle('#EF233C');
        circle.animate(1, { duration: 1000 });
        isHavingSeizure = true;

        timeOut = setTimeout(() => {
            setDefaultValues();
        }, 10500);
    }

    button.classList.add('seizure');
    button.innerHTML = 'Stop countdown';

};

document.addEventListener('keydown', (key) => {
    if (key.keyCode == 83 || key.code == 'KeyS') {
        onSeizureDetected();
    }
});

const createProgressCircle = (color) => {
    circle = new ProgressBar.Circle('#progress', {
        color: color,
        trailColor: '#2B4478',
        trailWidth: 2,
        strokeWidth: 2,
        duration: 1000,
        easing: 'easeInOut',
        svgStyle: {
            width: '288px'
        }
    });
};

const setDefaultValues = () => {
    isHavingSeizure = false;
    bpmHeart.style.color = '';
    circle.destroy();
    createProgressCircle('#F72585');
    circle.animate(bpm / maxBpm);
    seizureAudio.pause();
    seizureAudio.currentTime = 0;

    button.classList.remove('seizure');
    button.innerHTML = 'Wake up';
}