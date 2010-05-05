/*
        Chrome support for the use with
        the Castle Age Autoplayer script.

        Version 1.0.0.2
*/

/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true eqeqeq: true */
/*global window,chrome,S_log,S_Click,CM_Listener,CE_message */

var logging = false;

S_log = function (txt) {
    if (logging) {
        console.log(txt);
    }
};

S_Click = function (obj, loadWaitTime) {
    if (!obj) {
        S_log('chrome_support.js: Null object passed to S_Click');
        return null;
    }

    var evt = document.createEvent("MouseEvents");
    evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    return !obj.dispatchEvent(evt);
};

CM_Listener = function () {
    chrome.extension.onRequest.addListener(
        function (request, sender, sendResponse) {
            S_log(sender.tab ? "chrome_support.js: from a content script(tab:" + sender.tab.id + "): " + sender.tab.url : "chrome_support.js: from the extension");
            S_log("chrome_support.js: request: " + request.action + "(" + request.name + ", " + request.value + ")");
            var a = null;
            switch (request.action) {
            case "clickcaapRestart" :
                a = document.getElementById('caapRestart');
                if (a) {
                    S_Click(a);
                }
                sendResponse({ack: "ok"});
                break;
            case "clickcontrolDiv" :
                a = document.getElementById('caapPauseA');
                if (a) {
                    S_Click(a);
                }
                sendResponse({ack: "ok"});
                break;
            case "clickcaap_Disabled" :
                a = document.getElementById('caap_Disabled');
                if (a) {
                    S_Click(a);
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

CE_message = function (action, name, value) {
    chrome.extension.sendRequest({action: action, name: name, value: value}, function (response) {
        S_log("chrome_support.js: CE_message: " + action + "(" + name + ", " + value + ")");
    });
};
