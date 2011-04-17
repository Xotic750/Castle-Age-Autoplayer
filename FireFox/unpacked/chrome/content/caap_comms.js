/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global window */
/*jslint maxlen: 512 */

// Called sometime after postMessage is called
var caap_comms = {
    element: document.createElement("CaapMessageElement"),

    init:  function () {
        window.addEventListener("message", caap_comms.receiveMessage, false);
        caap_comms.prepMessage("", "");
        document.documentElement.appendChild(caap_comms.element);
    },

    shutdown: function () {
        window.removeEventListener("message", caap_comms.receiveMessage, false);
        caap_comms.prepMessage("", "");
        document.documentElement.removeChild(caap_comms.element);
        caap_comms.callback = null;
    },

    receiveMessage: function (event) {
        if (event.origin !== "chrome://browser") {
            return;
        }

        if (event && event.data) {
            var response = JSON.parse(event.data);
            if (response.action === "data") {
                caap_comms.callback(response.value);
            }
        }
    },

    callback: function (data) {},

    prepMessage: function (action, value, callback) {
        caap_comms.element.setAttribute("action", action);
        caap_comms.element.setAttribute("value", JSON.stringify(value));
        caap_comms.callback = callback;
    },

    sendMessage: function () {
        var event = document.createEvent("Events");
        event.initEvent("CaapMessageEvent", true, false);
        caap_comms.element.dispatchEvent(event);
    }
};

caap_comms.init();
