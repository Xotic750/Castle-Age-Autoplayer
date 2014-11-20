/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global window,postMessage,self */
/*jslint maxlen: 512 */

(function () {
    var called = false,
        prep = {action: "", status: "", value: ""},
        timeout,
        pcallback;

    function log(msg) {
        if (window.console && typeof console.log === 'function') {
            console.log("141.0.0" + ("8" !== '0' ? 'd8'  : '') + ' |' + (new Date()).toLocaleTimeString() + '| ' + msg);
        }
    }

    function injectScript(text) {
        try {
            var a = document.createElement('script');
            a.type = 'text/javascript';
            a.textContent = text;
            document.getElementsByTagName('head')[0].appendChild(a);
            return true;
        } catch (err) {
            return false;
        }
    }

    function reload() {
        if (typeof window.location.reload === 'function') {
            window.location.reload();
        } else if (typeof history.go === 'function') {
            history.go(0);
        } else {
            window.location.href = window.location.href;
        }
    }

    function postMessageMain(message) {
        try {
            postMessage(message);
        } catch (err) {
            log("Reloading due to message failure ...");
            reload();
        }
    }

    function timeOut() {
        log("Timeout!!! Reloading ...");
        postMessageMain({action : "timeout", status: 'reloading', value: true});
        reload();
    }

    function waitForCaap() {
        if (window.caap) {
            log("caap ready ...");
            window.clearTimeout(timeout);
            postMessageMain({action : 'done', status: true, value: 'caap'});
        } else {
            log("Waiting for caap ...");
            window.setTimeout(waitForCaap, 100);
        }
    }

    function waitForutility() {
        if (window.utility) {
            log("utility ready ...");
            if (!window.caap) {
                log("Inject caap.");
                postMessageMain({action : 'script', status: 'get', value: 'caap'});
            }

            waitForCaap();
        } else {
            log("Waiting for utility ...");
            window.setTimeout(waitForutility, 100);
        }
    }

    function waitForDataTable() {
        if (window.jQuery().dataTable) {
            log("dataTable ready ...");
            if (!window.utility) {
                log("Inject utility.");
                postMessageMain({action : 'script', status: 'get', value: 'utility'});
            }

            waitForutility();
        } else {
            log("Waiting for dataTable ...");
            window.setTimeout(waitForDataTable, 100);
        }
    }

    function waitForFarbtastic() {
        if (window.jQuery.farbtastic) {
            log("farbtastic ready ...");
            if (!window.jQuery().dataTable) {
                log("Inject dataTable.");
                postMessageMain({action : 'script', status: 'get', value: 'datatables'});
            }

            waitForDataTable();
        } else {
            log("Waiting for farbtastic ...");
            window.setTimeout(waitForFarbtastic, 100);
        }
    }

    function waitForjQueryUI() {
        if (window.jQuery.ui) {
            log("jQueryUI ready ...");
            if (!window.jQuery.farbtastic) {
                log("Inject farbtastic.");
                postMessageMain({action : 'script', status: 'get', value: 'farbtastic'});
            }

            waitForFarbtastic();
        } else {
            log("Waiting for jQueryUI ...");
            window.setTimeout(waitForjQueryUI, 100);
        }
    }

    function waitForjQuery() {
        if (window.jQuery && window.jQuery().jquery === "1.6.2") {
            log("jQuery ready ...");
            if (!window.$j) {
                window.$j = window.jQuery.noConflict();
            } else {
                throw "$j is already in use!";
            }

            if (!window.jQuery.ui) {
                log("Inject jQueryUI.");
                postMessageMain({action : 'script', status: 'get', value: 'jqueryui'});
            }

            waitForjQueryUI();
        } else {
            log("Waiting for jQuery ...");
            window.setTimeout(waitForjQuery, 100);
        }
    }

    function init() {
        log(window.navigator.userAgent);
        log("Starting ... waiting for scripts to load");
        timeout = window.setTimeout(timeOut, 180000);
        if (!window.jQuery || window.jQuery().jquery !== "1.6.2") {
            log("Inject jQuery.");
            postMessageMain({action : 'script', status: 'get', value: 'jquery'});
        }

        waitForjQuery();
    }

    self.on('message', function onMessage(message) {
        log('message: ' + message.action);
        if (message.action === "script") {
            var status = injectScript(message.value);
            postMessageMain({action : "injected", status: status, value: message.status});
        } else if (message.action === "begin") {
            if (!called) {
                called = true;
                init();
            }
        } else if (message.action === "data") {
            pcallback(message.value);
        }
    });

    function sendRequest(message, callback) {
        pcallback = callback;
        postMessageMain({action: message.action, status: "", value: message.value});
    }

    function detach() {
        window.removeEventListener('unload', detach, false);
        postMessageMain({action: 'detach', status: '', value: ''});
    }

    if (!window.caap_comms) {
        window.caap_comms = {};
    }

    window.caap_comms.sendRequest = sendRequest;
    window.addEventListener('unload', detach, false);
}());
