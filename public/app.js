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
let ctx;
let bpmChartElement;
let bpmChart;
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
    bpmChartElement = document.getElementById('bpm-chart');
    ctx = bpmChartElement.getContext('2d');

    var gradientFill = ctx.createLinearGradient(500, 0, 100, 0);
    gradientFill.addColorStop(0, "rgba(128, 182, 244, 0.6)");
    gradientFill.addColorStop(1, "rgba(244, 144, 128, 0.6)");


    bpmChart = new Chart(ctx, {
        type: 'line',
        data: {
            fill: true,
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                data: [59, 60, 61, 61, 61, 62, 59],
                borderColor: [
                    '#F72585',
                    '#F72585',
                    '#F72585',
                ],
                tension: 0.33,
                borderWidth: 1,
                pointRadius: 0,
                fill: true,
                backgroundColor: function(context) {
                    const chart = context.chart;
                    const { ctx, chartArea } = chart;

                    if (!chartArea) {
                        // This case happens on initial chart load
                        return null;
                    }
                    return getGradient(ctx, chartArea);
                },
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    display: false
                },
                x: {
                    display: false,
                }

            },
        },

    });
};

let width, height, gradient;

function getGradient(ctx, chartArea) {
    const chartWidth = chartArea.right - chartArea.left;
    const chartHeight = chartArea.bottom - chartArea.top;
    if (gradient === null || width !== chartWidth || height !== chartHeight) {
        // Create the gradient because this is either the first render
        // or the size of the chart has changed
        width = chartWidth;
        height = chartHeight;
        gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, '#F72585');
    }

    return gradient;
}

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
    if (isActive) {
        onSeizureDetected();
    }
});

const toggleAppState = () => {

    if (isHavingSeizure && isActive) {
        clearTimeout(timeOut);
        setDefaultValues();
    } else if (!isActive) {
        bpmMoon.setAttribute('data-active', 'false');
        bpmContainer.setAttribute('data-active', 'true');
        button.innerHTML = 'Wake up';
        toggleChart(true);
        appTitle.style.visibility = 'hidden';
    } else {
        bpmMoon.setAttribute('data-active', 'true');
        bpmContainer.setAttribute('data-active', 'false');
        button.innerHTML = 'Start sleep';
        toggleChart(false);
        appTitle.style.visibility = 'visible';
    }

    isActive = !isActive;
};

const toggleChart = (display) => {
    if (display) {
        bpmChartElement.style.visibility = 'visible';
    } else {
        bpmChartElement.style.visibility = 'hidden';
    }
}

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
        toggleChart(false);
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
    toggleChart(true);
    button.classList.remove('seizure');
    button.innerHTML = 'Wake up';
}