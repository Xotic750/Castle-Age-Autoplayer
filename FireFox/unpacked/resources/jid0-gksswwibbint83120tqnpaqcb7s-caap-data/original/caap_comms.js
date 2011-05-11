/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global window */
/*jslint maxlen: 512 */

(function () {
    // Called sometime after postMessage is called
    var element = document.createElement("CaapMessageElement"),
        pcallback;

    function receiveMessage(event) {
        console.log(event.origin);
        if (event.origin !== "chrome://browser") {
            return;
        }

        if (event && event.data) {
            var response = JSON.parse(event.data);
            if (response.action === "data") {
                pcallback(response.value);
            }
        }
    }

    function sendRequest(message, callback) {
        var event = document.createEvent("Events");
        event.initEvent("CaapMessageEvent", true, false);
        pcallback = callback;
        element.setAttribute("action", message.action);
        element.setAttribute("value", JSON.stringify(message.value));
        element.dispatchEvent(event);
    }

    function init() {
        window.addEventListener("message", receiveMessage, false);
        document.documentElement.appendChild(element);
    }

    function shutdown() {
        window.removeEventListener("message", receiveMessage, false);
        window.removeEventListener('unload', shutdown, false);
        document.documentElement.removeChild(element);
        pcallback = null;
    }

    if (!window.caap_comms) {
        window.caap_comms = {};
    }

    window.caap_comms.sendRequest = sendRequest;
    window.addEventListener('unload', shutdown, false);
    init();
}());
