const state = {
	seqNum: 1,
	partial: '',
};

// Full page loader
const pageLoader = {
	loader: document.getElementById('pageLoader'),
	show: function show() {
		this.loader.style = 'display:block';
	},
	hide: function hide() {
		this.loader.style = 'display:none';
	},
};

// Helper function change selected elemnt's style="display:" value
elementDisplay = function elementDisplay(ID) {
	return {
		idArr: ID.replace(/\#/g, '').split(' '),
		block: function block() {
			this.idArr.forEach((id) => {
				elem = document.getElementById(id);
				elem.style.display = 'block';
			});
		},
		flex: function flex() {
			this.idArr.forEach((id) => {
				elem = document.getElementById(id);
				elem.style.display = 'flex';
			});
		},
		hide: function none() {
			this.idArr.forEach((id) => {
				elem = document.getElementById(id);
				elem.style.display = 'none';
			});
		},
	};
};

// Full page popup
const pagePopup = {
	popup: document.getElementById('pagePopup'),
	title: document.getElementById('pagePopupTitle'),
	content: document.getElementById('pagePopupContent'),
	open: function open(config) {
		this.title.innerHTML = config.title;
		this.content.innerHTML = config.content;
		this.popup.style = 'display:flex';
	},
	close: function close() {
		this.title.innerHTML = '';
		this.content.innerHTML = '';
		this.popup.style = 'display:none';
	},
};

// pagePopup.open({ title: 'test title', content: 'test content' });

// Show loader
pageLoader.show();
// Calling new websocket when page loaded
startNewWebsocket();

// Interval timer, sending audio blob to web socket
let send_interval = null;

startRecording = function startRecording() {
	// Get user's permission of mic usage and start record aduio
	Recorder.get(function (rec) {
		recorder = rec;
		// console.log('Start recording');
		// Start recording
		recorder.start();

		// Hide [Start Transcribe] button and display [Stop Transcribe] button
		// document.getElementById('btnStart').style = 'display:none';
		elementDisplay('#btnStart #btnContinue #resultContainerNotes').hide();
		elementDisplay('#btnPause #btnStop').flex();

		// Start the interval timer, send audio blob to websocket every 1 second
		send_interval = setInterval(() => {
			// Send audio blob to websocket
			webSocket.send(recorder.getBlob());
			// When start called, old audio data will be cleared
			recorder.start();
		}, 1000);
	});

	// This function will NOT clean the existing transcribe result
};

stopRecording = function stopRecording() {
	// console.log('Stop recording');

	// Stop interval for sending audio blob to websocket
	clearInterval(send_interval);
	// Send empty element to indicate end of stream
	webSocket.send('');

	// Show [Restart] button and hide [Stop Transcribe] button
	elementDisplay('#btnRestart').flex();
	elementDisplay('#btnContinue #btnPause #btnStop').hide();
};

pauseRecording = function pauseRecording() {
	// Pause recording, but maintain websocket connection
	// console.log('Stop recording');
	// Stop interval for sending audio blob to websocket
	clearInterval(send_interval);

	// Show [Continue Transcription] button, hide [Pause] button
	elementDisplay('#btnContinue').flex();
	elementDisplay('#btnPause').hide();
};

restart = function restart() {
	// Show loader
	pageLoader.show();
	// Create new webSocket
	startNewWebsocket();

	// Clean up transcribe result
	clearTranscribe();

	// Hide [Restart Button] and show [Start Transcribe] button
	elementDisplay('#btnStart').flex();
	elementDisplay('#resultContainerNotes').block();
	elementDisplay('#btnRestart').hide();

	// Initialize state
	state.seqNum = 1;
	state.partial = '';
};

clearTranscribe = function clearTranscribe() {
	document.getElementById('transcribeResults').innerText = '';
};
