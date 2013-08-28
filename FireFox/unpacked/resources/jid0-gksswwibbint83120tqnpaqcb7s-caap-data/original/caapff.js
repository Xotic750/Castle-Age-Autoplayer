/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global Components,gBrowser,Firebug,HTMLDocument */
/*jslint maxlen: 200 */

(function (globalWindow) {
    // Comment out the following 'const' lines when using JSLint
    const prefManager    = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),
          consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);

    var globalDocument = globalWindow.document,
        version        = "141.0.0",
        dev            = "8",
        files          = [
            "chrome://caap/content/original/caap_comms.js",
            "chrome://caap/content/jquery-1.6.2.min.js",
            "chrome://caap/content/jquery-ui-1.8.14.min.js",
            "chrome://caap/content/farbtastic.min.js",
            "chrome://caap/content/jquery.dataTables-1.8.1.min.js",
            "chrome://caap/content/utility-0.2.3.min.js",
            'chrome://caap/content/Castle-Age-Autoplayer.js'
        ],
        filesLen       = files.length,
        pages          = [
            'apps.facebook.com/castle_age/',
            'apps.facebook.com/reqs.php#confirm_46755028429_0',
            'web3.castleagegame.com/castle_ws/',
            '.facebook.com/common/error.html',
            'apps.facebook.com/sorry.php'
        ],
        pagesLen       = pages.length,
        logPreMes      = version + (dev !== '0' ? 'd' + dev : '') + ' |';

    function logNewMes(append) {
        return logPreMes + (new Date()).toLocaleTimeString() + '| ' + (append ? append : '');
    }

    function error(aMessage) {
        var newMes = logNewMes('ERROR: ');
        if (globalWindow.Firebug && Firebug.Console && typeof Firebug.Console.error !== "function") {
            Firebug.Console.log([newMes, aMessage]);
        }

        Components.utils.reportError(newMes + aMessage);
    }

    function log(aMessage) {
        try {
            var newMes = logNewMes();
            if (globalWindow.Firebug && Firebug.Console && typeof Firebug.Console.log === "function") {
                Firebug.Console.log([newMes, aMessage]);
            }

            consoleService.logStringMessage(newMes + aMessage);
        } catch (err) {
            error("log: " + err);
        }
    }

    function isPage(href) {
        try {
            var it     = 0,
                onPage = false;

            for (it = 0; it < pagesLen; it += 1) {
                if (href.search(pages[it]) > -1) {
                    onPage = true;
                    break;
                }
            }

            return onPage;
        } catch (err) {
            error("isPage: " + err);
            return false;
        }
    }

    function onPageUnload(event) {
        try {
            var doc = event.originalTarget;
            if (doc && doc instanceof HTMLDocument) {
                if (doc.defaultView) {
                    doc.defaultView.removeEventListener("unload", onPageUnload, true);
                    log("onPageUnload: " + doc.location.href);
                }
            }
        } catch (err) {
            error("onPageUnload: " + err);
        }
    }

    function onPageLoad(event) {
        try {
            // doc is globalDocument that triggered "onload" event
            var doc = event.originalTarget,
                href,
                nodeName,
                win,
                head,
                it,
                a;

            if (doc && doc instanceof HTMLDocument) {
                href = doc.location.href;
                nodeName = doc.nodeName;
                win = doc.defaultView;
                if (nodeName && nodeName === "#document" && win && !win.frameElement && href && isPage(href)) {
                    log("onPageLoad: " + nodeName + " href: " + href);
                    if (prefManager.getBoolPref("extensions.caap.autorun") && !doc.getElementById("caap_div")) {
                        log("autorun");
                        win.addEventListener("unload", onPageUnload, true);
                        head = doc.getElementsByTagName("head")[0];
                        if (head) {
                            for (it = 0; it < filesLen; it += 1) {
                                log("inject: " + files[it]);
                                a = doc.createElement('script');
                                a.type = 'text/javascript';
                                a.src = files[it];
                                head.appendChild(a);
                                head.removeChild(a);
                            }
                        } else {
                            throw "head not found!";
                        }
                    }
                }
            }
        } catch (err) {
            error("onPageLoad: " + err);
        }
    }

    function updateStatusBar() {
        try {
            var element = globalDocument.getElementById("caap_status_bar_icon");
            element.setAttribute("src", prefManager.getBoolPref("extensions.caap.autorun") ? "chrome://caap/content/widget/enabled.png" : "chrome://caap/content/widget/disabled.png");
        } catch (err) {
            error("updateStatusBar: " + err);
        }
    }

    function init() {
        try {
            globalWindow.setTimeout(function () {
                log("Init");
                globalWindow.removeEventListener("load", init, false);
                updateStatusBar();
                gBrowser.addEventListener("DOMContentLoaded", onPageLoad, true);
            }, 100);
        } catch (err) {
            error("init: " + err);
        }
    }

    function transferComplete(event, message) {
        try {
            var target = event.target;
            log("transferComplete: " + target.statusText);
            target.removeEventListener("load", function (evt) {
                transferComplete(evt, message);
            }, false);

            target.removeEventListener("error", function (evt) {
                transferComplete(evt, message);
            }, false);

            message.source.postMessage(JSON.stringify({
                action : "data",
                status : true,
                value  : {
                    status       : target.status,
                    statusText   : target.statusText,
                    responseText : target.responseText,
                    errorThrown  : ""
                }
            }), message.baseURI);
        } catch (err) {
            error("transferComplete: " + err);
            message.source.postMessage(JSON.stringify({
                action : "data",
                status : false,
                value  : {
                    status       : -1,
                    statusText   : "",
                    responseText : "",
                    errorThrown  : "transferComplete: " + err.toString()
                }
            }), message.baseURI);
        }
    }

    function getPage(message) {
        try {
            log("getPage: " + message.value);
            var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"].createInstance(Components.interfaces.nsIXMLHttpRequest);
            req.addEventListener("load", function (evt) {
                transferComplete(evt, message);
            }, false);

            req.addEventListener("error", function (evt) {
                transferComplete(evt, message);
            }, false);

            req.open('GET', message.value, false);
             /*jslint bitwise: false*/
            req.channel.loadFlags |= Components.interfaces.nsIRequest.LOAD_BYPASS_CACHE;
             /*jslint bitwise: true*/
            req.send(null);
        } catch (err) {
            error("getPage: " + err);
            message.source.postMessage(JSON.stringify({
                action : "data",
                status : false,
                value  : {
                    status       : -1,
                    statusText   : "",
                    responseText : "",
                    errorThrown  : "getPage: " + err.toString()
                }
            }), message.baseURI);
        }
    }

    function receiveMessage(event) {
        try {
            var originalTarget = event.originalTarget,
                target,
                message;

            if (!originalTarget || !isPage(originalTarget.baseURI)) {
                return;
            }

            target = event.target;
            if (!target) {
                return;
            }

            message = {
                source : originalTarget.ownerDocument.defaultView,
                baseURI: originalTarget.baseURI,
                action : target.getAttribute("action"),
                value  : JSON.parse(target.getAttribute("value"))
            };

            if (message.action === 'getPage' && message.value && message.source) {
                log("receiveMessage: " + message.action);
                getPage(message);
            }
        } catch (err) {
            error("receiveMessage: " + err);
        }
    }

    function shutdown(event) {
        try {
            if (event.originalTarget instanceof HTMLDocument) {
                log("shutdown");
                gBrowser.removeEventListener("DOMContentLoaded", onPageLoad, true);
                globalWindow.removeEventListener("load", init, false);
                globalWindow.removeEventListener("unload", shutdown, false);
                globalDocument.removeEventListener("CaapMessageEvent", receiveMessage, false, true);
                delete globalWindow.caapff;
            }
        } catch (err) {
            error("shutdown: " + err);
        }
    }

    function autorunListener(event) {
        try {
            if (event.button === 0 && event.shiftKey === false) {
                var value = !prefManager.getBoolPref("extensions.caap.autorun");
                prefManager.setBoolPref("extensions.caap.autorun", value);
                updateStatusBar();
                log("autorunListener: autorun = " + value);
            }
        } catch (err) {
            error("autorunListener: " + err);
        }
    }

    globalWindow.addEventListener("load", init, false);
    globalWindow.addEventListener("unload", shutdown, false);
    globalDocument.addEventListener("CaapMessageEvent", receiveMessage, false, true);

    if (!globalWindow.caapff) {
        globalWindow.caapff = {};
    }

    globalWindow.caapff.autorunListener = autorunListener;
}(this));
