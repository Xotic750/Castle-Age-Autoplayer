/*
        Chrome support for the use with
        the Castle Age Autoplayer script.

        Version 1.0.0.0
*/
var logging = false;

S_log = function(txt) {
    if(logging) {
        console.log(txt);
    }
}

CM_Listener = function() {
    chrome.extension.onRequest.addListener(
        function(request, sender, sendResponse) {
            S_log(sender.tab ? "chrome_support.js: from a content script: " + sender.tab.url : "chrome_support.js: from the extension");
            S_log("chrome_support.js: request: " + request.action + "(" + request.name + ", " + request.value + ")");
            switch (request.action) {
                case "setItem" :
                    GM_setValue(request.name, request.value);
                    break;
                case "getItem" :
                    chrome.tabs.getSelected(null, function(tab) {
                        chrome.tabs.sendRequest(tab.id, {   action: "setItem",
                                                            name: request.name,
                                                            value: GM_getValue(request.name)
                                                        }, function(response) {
                        });
                    });
                    break;
                case "removeItem" :
                    GM_deleteValue(request.name);
                    break;
                case "clear" :
                    localStorage.clear();
                    break;
                case "paused" :
                    switch (request.value) {
                        case "block" :
                            chrome.browserAction.setIcon({path:"paused.png"});
                            GM_setValue("ce_paused", true);
                            S_log("chrome_support.js: script paused.");
                            break;
                        case "none" :
                            chrome.browserAction.setIcon({path:"icon.png"});
                            GM_setValue("ce_paused", false);
                            S_log("chrome_support.js: script unpaused.");
                            break;
                        default :
                            chrome.browserAction.setIcon({path:"unknown.png"});
                            S_log("chrome_support.js: unkown pause state: " + request.value);
                            break;
                    }
                    break;
                case "disabled" :
                    switch (request.value) {
                        case true :
                            chrome.browserAction.setIcon({path:"disabled.png"});
                            S_log("chrome_support.js: script disabled");
                            break;
                        case false :
                            chrome.browserAction.setIcon({path:"icon.png"});
                            S_log("chrome_support.js: script enabled");
                            break;
                        default :
                            chrome.browserAction.setIcon({path:"unknown.png"});
                            S_log("chrome_support.js: unkown disable state: " + request.value);
                            break;
                    }
                    GM_setValue("ce_paused", request.value);
                    break;
                case "clickcaapRestart" :
                    var a = document.getElementById('caapRestart');
                    if (a) {
                            caap.Click(a);
                    }
                    break;
                case "clickcontrolDiv" :
                    var a = document.getElementById('caapPauseA');
                    if (a) {
                            caap.Click(a);
                    }
                    break;
                case "DoPoll" :
                    S_log("chrome_support.js: DoPoll received.");
                    break;
                default :
                    sendResponse({});
                    S_log("chrome_support.js: unknown request action " + request.action);
                    break;
            }
            sendResponse({ack: "ok"});
        }
    );
};

CE_message = function(action, name, value) {
    chrome.extension.sendRequest({action: action, name: name, value: value}, function(response) {
        S_log("chrome_support.js: CE_message: " + action + "(" + name + ", " + value + ")");
    });
};

CS_message = function(action, name, value) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendRequest(tab.id, {action: action, name: name, value: value}, function(response) {
            S_log("chrome_support.js: CS_message:" + action + "(" + name + ", " + value + ")");
        });
    });
};
