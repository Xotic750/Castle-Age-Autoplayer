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
                sendResponse({ack: "ok"});
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
                sendResponse({ack: "ok"});
                console.log("chrome_support: getItem(" + request.name + ", " + GM_getValue(request.name) + ")");
                break;
            case "removeItem" :
                GM_deleteValue(request.name);
                sendResponse({ack: "ok"});
                console.log("chrome_support: removeItem(" + request.name + ")");
                break;
            case "clear" :
                localStorage.clear();
                sendResponse({ack: "ok"});
                console.log("chrome_support: clear(" + request.name + ")");
                break;
            case "paused" :
                if (request.state) {
                    chrome.browserAction.setIcon({path:"paused.png"});
                } else {
                    chrome.browserAction.setIcon({path:"icon.png"})
                }
                break;
            default :
                sendResponse({});
                console.log("chrome_support: unknown request.");
                break;
        }
    }
);

CE_paused = function(bState) {
    chrome.extension.sendRequest({action: "paused", state: bState}, function(response) {
    });
};