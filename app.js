var apikey = 'ENTER YOUR API KEY';

var apiendpointurl = 'https://api.sentient.io/demo-apps/prod/auth';
var apicontentType = 'application/json';

// Show loader
pageLoader.show();

fetchAPIKey = function fetchAPIKey() {
	return new Promise((resolve, reject) => {
		var xhr = new XMLHttpRequest(),
			method = 'GET',
			url = 'https://api.sentient.io/demo-apps/prod/auth';

		xhr.open(method, url, true);
		xhr.onerror = function () {
			console.log('** An error occurred during the transaction');
		};

		xhr.onreadystatechange = function () {
			// In local files, status is 0 upon success in Mozilla Firefox
			if (xhr.readyState === XMLHttpRequest.DONE) {
				var status = xhr.status;
				if (status === 0 || (status >= 200 && status < 400)) {
					// The request has been completed successfully
					apikey = JSON.parse(xhr.response).apikey;
					resolve();
				} else {
					reject();
				}
			}
		};
		xhr.send();
	});
};

fetchAPIKey()
	.then(() => {
		// Calling new websocket when page loaded
		startNewWebsocket();
	})
	.catch(() => {
		alert('Error');
	});
