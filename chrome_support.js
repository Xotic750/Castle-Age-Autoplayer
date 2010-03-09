/*
        Chrome support for the use with
        the Castle Age Autoplayer script.

        Version 1.0.0.0
*/

chrome.extension.onRequest.addListener(
    function(request, sender, sendResponse) {
        console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
        switch (request.action) {
            case "setItem" :
                GM_setValue(request.name, request.value);
                sendResponse({action: request.action, ack: "ok"});
                console.log("chrome_support: setItem(" + request.name + ", " + request.value + ")");
                break;
            case "getItem" :
                chrome.tabs.getSelected(null, function(tab) {
                    chrome.tabs.sendRequest(tab.id, {   action: "setItem",
                                                        name: request.name,
                                                        value: GM_getValue(request.name)
                                                    }, function(response) {
                    });
                });
                sendResponse({action: request.action, ack: "ok"});
                console.log("chrome_support: getItem(" + request.name + ", " + GM_getValue(request.name) + ")");
                break;
            case "removeItem" :
                GM_deleteValue(request.name);
                sendResponse({action: request.action, ack: "ok"});
                console.log("chrome_support: removeItem(" + request.name + ")");
                break;
            case "clear" :
                localStorage.clear();
                sendResponse({action: request.action, ack: "ok"});
                console.log("chrome_support: clear(" + request.name + ")");
                break;
            case "paused" :
                switch (request.value) {
                    case "block" :
                        chrome.browserAction.setIcon({path:"paused.png"});
                        GM_setValue("ce_paused", true);
                        console.log("chrome_support: script paused.");
                        break;
                    case "none" :
                        chrome.browserAction.setIcon({path:"icon.png"});
                        GM_setValue("ce_paused", false);
                        console.log("chrome_support: script unpaused.");
                        break;
                    default :
                        chrome.browserAction.setIcon({path:"unknown.png"});
                        GM_setValue("ce_paused", request.value);
                        console.log("chrome_support: unkown pause state.");
                        break;
                }
                sendResponse({action: request.action, ack: "ok"});
                break;
            case "disabled" :
                switch (request.value) {
                    case true :
                        chrome.browserAction.setIcon({path:"disabled.png"});
                        console.log("chrome_support: script disabled");
                        break;
                    case false :
                        chrome.browserAction.setIcon({path:"icon.png"});
                        console.log("chrome_support: script enabled");
                        break;
                    default :
                        chrome.browserAction.setIcon({path:"unknown.png"});
                        console.log("chrome_support: unkown disable state.");
                        break;
                }
                GM_setValue("ce_paused", request.value);
                sendResponse({action: request.action, ack: "ok"});
                break;
            case "clickcaapRestart" :
		var a = document.getElementById('caapRestart');
		if (a) {
			caap.Click(a);
		}
                sendResponse({action: request.action, ack: "ok"});
                console.log("chrome_support: clickcaapRestart");
                break;
            case "clickcontrolDiv" :
		var a = document.getElementById('caapPauseA');
		if (a) {
			caap.Click(a);
		}
                sendResponse({action: request.action, ack: "ok"});
                console.log("chrome_support: clickcontrolDiv");
                break;
            default :
                sendResponse({});
                console.log("chrome_support: unknown request action.");
                break;
        }
    }
);


CE_message = function(action, name, value) {
    chrome.extension.sendRequest({action: action, name: name, value: value}, function(response) {
    });
};

CS_message = function(action, name, value) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {action: action, name: name, value: value}, function(response) {
        });
});
}