var submitButton = document.querySelector('button.submit');
var email = document.querySelector('#caWeb3Email');
var password = document.querySelector('#caWeb3Password');

loadChanges();

submitButton.addEventListener('click', saveChanges);

function saveChanges() {
	var caweb3email = email.value;
	var caweb3password = password.value;
  
	chrome.runtime.sendMessage({method: "setLocalStorage", key: "caweb3email", value: caweb3email}, function(response) {
		console.log(response.data);
		message('Settings saved');
	});
	chrome.runtime.sendMessage({method: "setLocalStorage", key: "caweb3password", value: caweb3password}, function(response) {
		console.log(response.data);
		message('Settings saved');
	});
}

function loadChanges() {
	chrome.runtime.sendMessage({method: "getLocalStorage", key: "caweb3email"}, function(response) {
		if (response.data && response.data!='error') {
			email.value=response.data;
			message('Loaded saved settings.');
		}
	});
	chrome.runtime.sendMessage({method: "getLocalStorage", key: "caweb3password"}, function(response) {
		if (response.data && response.data!='error') {
			password.value=response.data;
			message('Loaded saved settings.');
		}
	});
}

function message(msg) {
  var message = document.querySelector('.message');
  message.innerText = msg;
  setTimeout(function() {
    message.innerText = '';
  }, 3000);
}

