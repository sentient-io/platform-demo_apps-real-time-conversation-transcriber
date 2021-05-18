// Initialize webSocket global variable
let webSocket;

function startNewWebsocket() {
    return new Promise((resolve, reject) => {
        const online_asr_connection_data = {
            'x-api-key': state.cliApiKey || apikey,
            action: 'start',
            model: state.model,
            'sampling-rate': state.sampleRate,
        };

        console.log('Start new Websocket');
        // console.log(online_asr_connection_data);

        // Create new webSocket
        webSocket = new WebSocket('wss://onlineasr.sentient.io');

        webSocket.onopen = function () {
            // Connection data must be send as String instead of Object
            webSocket.send(JSON.stringify(online_asr_connection_data));
        };

        webSocket.onmessage = function (evt) {
            // evt.data will be returned as a string, convert it to JSON object
            let data = JSON.parse(evt.data);
            console.log(data);

            // If websocket connect established
            if (data.status === 'listening') {
                // Hide loader
                resolve();
            }

            // If stream ended (after send 0 byte message)
            if (data.spkSeq) {
                // Close web socket connection
                // webSocket.close();
            }

            if (data.error) {
                // console.log('error');
                reject(data.error);
            }

            updateTranscribeResult(data);
        };
    });
}

updateTranscribeResult = function updateTranscribeResult(result) {
    // Get the div container to store all the transcribe results
    const mainResultContainer = document.getElementById('transcribeResults');

    // Get current seqNum from state, start from 1
    seqNum = state.seqNum;

    // Check if containers with current seqNum is already exist
    let transResultContainer = document.getElementById(`seqNum-${seqNum}`);

    if (result.partial) {
        // If the utterance is partial

        if (transResultContainer) {
            // If the text container is already exist
            // result.partial contains the transcribed text
            transResultContainer.getElementsByClassName(
                's-transcribe__sentence'
            )[0].innerText = formatSentence(result.partial);
        } else {
            // Create new text container to store partial text and append to dom
            transResultContainer = document.createElement('div');
            transResultContainer.id = `seqNum-${seqNum}`;
            transResultContainer.classList.add('s-transcribe__result');

            // Template for transcribe speech bubble
            // Span element below for triangle tip of speech bubble
            transResultContainer.innerHTML = `
				<span class="speech-buble-triangle--left">
				</span>
				<div class="s-transcribe__bubble">
					<p class="s-transcribe__sentence">
					${formatSentence(result.partial)}
					</p>
				</div>
				`;

            mainResultContainer.appendChild(transResultContainer);
        }

        // - END - If the utterance is partial
    } else if (result.text && !result.spkSeq) {
        // If utterance is complete
        // Update text result, also add placeholder element for speaker
        transResultContainer.getElementsByClassName(
            's-transcribe__sentence'
        )[0].innerText = formatSentence(result.text) + '.';

        // seqNum + 1, moving to next seq
        state.seqNum++;

        // - END - If utterance is complete
    } else if (result.spkSeq) {
        // If conversation complete, server return final result
        if (result.text) {
            // If there is text in the last result
            transResultContainer.getElementsByClassName(
                's-transcribe__sentence'
            )[0].innerText = formatSentence(result.text) + '.';
        }
        // - END - If conversation complete, server return final result
    }

    // Scroll to end of the result container when there is more converstation stacked
    scrollToEnd('transcribeResults');
};

formatSentence = function formatSentence(sentence) {
    // Extract the fist letter of a sentence (by default capital)
    // And turn all the rest of characters to lowercase
    let formattedSentence = sentence[0] + sentence.substring(1).toLowerCase();
    // Return a naturalized sentence with only first letter capital
    return formattedSentence;
};

scrollToEnd = function scrollToEnd(elementID) {
    const element = document.getElementById(elementID);
    element.scrollTop = element.scrollHeight;
};

// startNewWebsocket(); // For testing
