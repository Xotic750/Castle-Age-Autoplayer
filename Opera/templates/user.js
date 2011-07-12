// ==UserScript==
// @name           Castle Age Autoplayer
// @namespace      caap
// @description    Auto player for Castle Age
// @version        !version!
// @dev            !dev!
// @include        http*://apps.facebook.com/castle_age/*
// @include        http*://web3.castleagegame.com/castle_ws/*
// @include        http*://*.facebook.com/common/error.html*
// @include        http*://apps.facebook.com/sorry.php*
// @include        http*://apps.facebook.com/reqs.php*
// @include        *http://web.castleagegame.com/castle/*
// @include        *https://web.castleagegame.com/castle/*
// @include        http://www.facebook.com/dialog/apprequests?access_token=46755028429*
// @include        https://www.facebook.com/dialog/apprequests?access_token=46755028429*
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @compatability  Opera 11+
// ==/UserScript==

/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global window */
/*jslint maxlen: 512 */

(function () {
    function onLoad() {
        document.removeEventListener("DOMContentLoaded", onLoad, true);
        var called = false,
            pcallback,
            initEvent,
            timeout;

        //////////////////////////////////
        //       Functions
        //////////////////////////////////

        function log(msg) {
            if (window.console && typeof console.log === 'function') {
                console.log("!version!" + ("!dev!" !== '0' ? 'd!dev!'  : '') + ' |' + (new Date()).toLocaleTimeString() + '| ' + msg);
            } else {
                opera.postError("!version!" + ("!dev!" !== '0' ? 'd!dev!'  : '') + ' |' + (new Date()).toLocaleTimeString() + '| ' + msg);
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

        function timeOut() {
            log("Timeout!!! Reloading ...");
            initEvent.source.postMessage({action : "timeout", status: 'reloading', value: true});
            if (typeof window.location.reload === 'function') {
                window.location.reload();
            } else if (typeof history.go === 'function') {
                history.go(0);
            } else {
                window.location.href = window.location.href;
            }
        }

        function waitForCaap() {
            if (window.caap) {
                log("caap ready ...");
                window.clearTimeout(timeout);
                initEvent.source.postMessage({action: 'done', status: true, value: 'caap'});
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
                    initEvent.source.postMessage({action : 'script', status: 'get', value: 'caap'});
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
                    initEvent.source.postMessage({action : 'script', status: 'get', value: 'utility'});
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
                    initEvent.source.postMessage({action : 'script', status: 'get', value: 'datatables'});
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
                    initEvent.source.postMessage({action : 'script', status: 'get', value: 'farbtastic'});
                }

                waitForFarbtastic();
            } else {
                log("Waiting for jQueryUI ...");
                window.setTimeout(waitForjQueryUI, 100);
            }
        }

        function waitForjQuery() {
            if (window.jQuery && window.jQuery().jquery === "!jquery!") {
                log("jQuery ready ...");
                if (!window.$j) {
                    window.$j = window.jQuery.noConflict();
                } else {
                    throw "$j is already in use!";
                }

                if (!window.jQuery.ui) {
                    log("Inject jQueryUI.");
                    initEvent.source.postMessage({action : 'script', status: 'get', value: 'jqueryui'});
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
            if (!window.jQuery || window.jQuery().jquery !== "!jquery!") {
                log("Inject jQuery");
                initEvent.source.postMessage({action : 'script', status: 'get', value: 'jquery'});
            }

            waitForjQuery();
        }

        function sendRequest(message, callback) {
            pcallback = callback;
            initEvent.source.postMessage({action: message.action, status: "", value: message.value});
        }

        /////////////////////////////////////////////////////////////////////
        //                         Begin
        /////////////////////////////////////////////////////////////////////

        opera.extension.onmessage = function (event) {
            opera.postError("background process sent a message");
            // Get content of incoming message.
            var message = event.data,
                status  = false;

            opera.postError(event.origin + " sent a message: " + message.action + ' ' + message.status);
            if (message) {
                if (message.action === "script") {
                    status = injectScript(message.value);
                    event.source.postMessage({action: "injected", status: status, value: message.status});
                } else if (message.action === "begin") {
                    if (!called) {
                        called = true;
                        initEvent = event;
                        init();
                    }
                } else if (message.action === "data") {
                    pcallback(message.value);
                }
            }
        };

        if (!window.caap_comms) {
            window.caap_comms = {};
        }

        window.caap_comms.sendRequest = sendRequest;
    }

    document.addEventListener("DOMContentLoaded", onLoad, true);
}());
