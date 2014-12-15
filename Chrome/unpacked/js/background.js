
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
	if (request.method == "getLocalStorage")
		sendResponse({data: localStorage[request.key]});
	if (request.method == "setLocalStorage")
	{
		localStorage[request.key]=request.value;
		sendResponse({data: "done"});
	}
	sendResponse({data: "error"});
});
