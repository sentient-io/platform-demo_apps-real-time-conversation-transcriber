/** List of HTML element been selected by ID for easy access later */
const domElem = {
    /**
     * Each id in html page should be registered here
     * Access the html element by domElem.(html id text) or domElem[html id text]
     * */
    modelSelector: document.getElementById('modelSelector'),
    modelSelectorSection: document.getElementById('modelSelectorSection'),
    modelDescription: document.getElementById('modelDescription'),
    startRecordingSection: document.getElementById('startRecordingSection'),
    transcriptSection: document.getElementById('transcriptSection'),
    transcribeResults: document.getElementById('transcribeResults'),
    pauseButton: document.getElementById('pauseButton'),
    resumeButton: document.getElementById('resumeButton'),
    loader: document.getElementById('loader'),

    hideById: function (elems) {
        elems
            .replace(/\s/g, '')
            .split(',')
            .forEach((elem) => {
                this[elem].style.display = 'none';
            });
    },
    flexById: function (elems) {
        /** Set the display value of dom id as flex */
        elems
            .replace(/\s/g, '')
            .split(',')
            .forEach((elem) => {
                this[elem].style.display = 'flex';
            });
    },
    showById: function (elems) {
        /** Set the display value of dom id as flex */
        elems
            .replace(/\s/g, '')
            .split(',')
            .forEach((elem) => {
                this[elem].style.display = 'block';
            });
    },
};

/** Global object to store state and data */
const state = {
    cliApiKey: '',
    model: 'en-SG',
    sampleRate: 16000,
    seqNum: 1,
    modelDescription: {
        'en-SG':
            'Better suited for transcribing prepared / formal speech (e.g. news or parliamentary speeches) with the Singaporean accent.',
        'en-SG-conversation':
            'Better suited for transcribing casual speech with the Singaporean accent. Tuned to also recognise names of local food and places.',
        'en-SG-telephony':
            'Better suited for transcribing conversations in lower sampling rate (e.g. 8khz for telephony).',
        generic_en_vosk:
            'Better suited for generic / broad usage across different accents.',
    },
};

const userSelections = {
    model: function () {
        const model = domElem.modelSelector.value;
        state.model = model;

        domElem.modelDescription.innerHTML = state.modelDescription[model];
        console.log('Model selected: ', model);
    },
};
/** Listen to dropdown list selection event */
domElem.modelSelector.addEventListener('input', userSelections.model);

/** Timer for sending data to websocket */
let send_interval;

const userActions = {
    startTranscribe: function () {
        Recorder.get(function (rec) {
            recorder = rec;

            recorder.start();
        })
            .then(() => {
                loader.start();
                return startNewWebsocket();
            })

            .then(() => {
                domElem.hideById('modelSelectorSection, startRecordingSection');
                domElem.showById('transcriptSection');
                // Start the interval timer, send audio blob to websocket every 1 second
                send_interval = setInterval(() => {
                    // Send audio blob to websocket
                    webSocket.send(recorder.getBlob());
                    // When start called, old audio data will be cleared
                    recorder.start();
                }, 500);
            })
            .catch((err) => {
                if (JSON.parse(err).message.includes('Unauthorized User')) {
                    state.cliApiKey = prompt(
                        'Unauthorized user, to continue test out, please provide a valid API key and try again.',
                        state.cliApiKey
                    );
                } else {
                    alert(err);
                }
            })
            .finally(() => {
                loader.stop();
            });
    },
    restart: function () {
        location.reload();
    },
    pauseTranscribe: function () {
        // Stop interval for sending audio blob to websocket
        clearInterval(send_interval);
        domElem.hideById('pauseButton');
        domElem.flexById('resumeButton');
    },
    resumeTranscribe: function () {
        domElem.flexById('pauseButton');
        domElem.hideById('resumeButton');
        send_interval = setInterval(() => {
            // Send audio blob to websocket
            webSocket.send(recorder.getBlob());
            // When start called, old audio data will be cleared
            recorder.start();
        }, 500);
    },
    clearText: function () {
        domElem.transcribeResults.innerText = '';
    },
};

const utility = {};

const loader = {
    start: function () {
        domElem.flexById('loader');
    },
    stop: function () {
        domElem.hideById('loader');
    },
};
