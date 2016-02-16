var submitButton = document.querySelector('button.submit');
var list = ['gsheet', 'salt', 'email', 'password'];
list.forEach( function(e) {
	window[e] = document.querySelector('#caweb3' + e);
});

loadChanges();

submitButton.addEventListener('click', saveChanges);

function saveChanges() {
	list.forEach( function(e) {
		chrome.runtime.sendMessage({method: "setLocalStorage", key: "caweb3" + e, value: window[e].value}, function(response) {
			console.log(response.data);
			message('Settings saved');
		});
	});
}

function loadChanges() {
	list.forEach( function(e) {
		chrome.runtime.sendMessage({method: "getLocalStorage", key: "caweb3" + e}, function(response) {
			if (response.data && response.data!='error') {
				window[e].value = response.data;
				message('Loaded saved settings.');
			}
		});
	});
}

function message(msg) {
  var message = document.querySelector('.message');
  message.innerText = msg;
  setTimeout(function() {
    message.innerText = '';
  }, 3000);
}

