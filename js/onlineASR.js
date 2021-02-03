const online_asr_connection_data = {
	'x-api-key': apikey,
	action: 'start',
	model: 'en-SG-conversation',
	'sampling-rate': 16000,
};

// Initialize webSocket global variable
let webSocket;

startNewWebsocket = function startNewWebsocket() {
	// Create new webSocket
	webSocket = new WebSocket('wss://onlineasr.sentient.io');

	webSocket.onopen = function () {
		// Connection data must be send as String instead of Object
		webSocket.send(JSON.stringify(online_asr_connection_data));
	};

	webSocket.onmessage = function (evt) {
		// evt.data will be returned as a string, convert it to JSON object
		let data = JSON.parse(evt.data);
		// console.log(data);

		// If websocket connect established
		if (data.status === 'listening') {
			// Hide loader
			pageLoader.hide();
		}

		// If stream ended (after send 0 byte message)
		if (data.spkSeq) {
			// Close web socket connection
			// webSocket.close();
		}

		if (data.error) {
			// console.log('error');
			pageLoader.hide();
			pagePopup.open({
				title: 'Error',
				content: JSON.parse(data.error).message,
			});

			// Show [Start] button and hide [Stop Transcribe] button
			document.getElementById('btnRestart').style = 'display:flex';
			document.getElementById('btnStart').style = 'display:none';
		}

		updateTranscribeResult(data);
	};
};

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
	scrollToEnd('resultContainer');
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
