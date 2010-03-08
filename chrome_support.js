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
            case "notify" :
                switch (request.change) {
                    case "paused" :
                        if (request.bool) {
                            chrome.browserAction.setIcon({path:"paused.png"});
                            console.log("chrome_support: script paused");
                        } else {
                            chrome.browserAction.setIcon({path:"icon.png"})
                            console.log("chrome_support: script unpaused");
                        }
                        sendResponse({action: request.action, ack: "ok"});
                        break;
                    case "disabled" :
                        if (request.bool) {
                            chrome.browserAction.setIcon({path:"disabled.png"});
                            console.log("chrome_support: script disabled");
                        } else {
                            chrome.browserAction.setIcon({path:"icon.png"})
                            console.log("chrome_support: script enabled");
                        }
                        sendResponse({action: request.action, ack: "ok"});
                        break;
                    default :
                        sendResponse({});
                        console.log("chrome_support: unknown request notify.");
                        break;
                }
                break;
            default :
                sendResponse({});
                console.log("chrome_support: unknown request action.");
                break;
        }
    }
);

CE_notify = function(change, bool) {
    chrome.extension.sendRequest({action: "notify", change: change, bool: bool}, function(response) {
    });
};