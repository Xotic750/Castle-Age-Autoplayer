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
            S_log(sender.tab ? "chrome_support.js: from a content script(tab:" + sender.tab.id + "): " + sender.tab.url : "chrome_support.js: from the extension");
            S_log("chrome_support.js: request: " + request.action + "(" + request.name + ", " + request.value + ")");
            switch (request.action) {
                case "clickcaapRestart" :
                    var a = document.getElementById('caapRestart');
                    if (a) {
                            caap.Click(a);
                    }
                    sendResponse({ack: "ok"});
                    break;
                case "clickcontrolDiv" :
                    var a = document.getElementById('caapPauseA');
                    if (a) {
                            caap.Click(a);
                    }
                    sendResponse({ack: "ok"});
                    break;
                case "clickcaap_Disabled" :
                    var a = document.getElementById('caap_Disabled');
                    if (a) {
                            caap.Click(a);
                    }
                    sendResponse({ack: "ok"});
                    break;
                default :
                    sendResponse({});
                    S_log("chrome_support.js: unknown request action");
                    break;
            }
        }
    );
};

CE_message = function(action, name, value) {
    chrome.extension.sendRequest({action: action, name: name, value: value}, function(response) {
        S_log("chrome_support.js: CE_message: " + action + "(" + name + ", " + value + ")");
    });
};
