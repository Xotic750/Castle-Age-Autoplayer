/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global window,content,Components,gBrowser,Firebug */
/*jslint maxlen: 512 */

var caapff = {
    version: "140.25.0",

    dev: "10",

    files: [
        "chrome://caap/content/caap_comms.js",
        "chrome://caap/content/jquery-1.5.2.min.js",
        "chrome://caap/content/jquery-ui-1.8.11.min.js",
        "chrome://caap/content/farbtastic.min.js",
        "chrome://caap/content/jquery.dataTables-1.7.6.min.js",
        "chrome://caap/content/utility-0.1.6.min.js",
        'chrome://caap/content/Castle-Age-Autoplayer.js'
    ],

    pages: [
        'apps.facebook.com/castle_age/',
        'apps.facebook.com/reqs.php#confirm_46755028429_0',
        'web3.castleagegame.com/castle_ws/',
        '.facebook.com/common/error.html',
        'apps.facebook.com/sorry.php'
    ],

    prefManager: Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefBranch),

    consoleService: Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService),

    appcontent: null,

    init: function (event) {
        try {
            caapff.log("Init");
            caapff.appcontent = document.getElementById("appcontent");   // browser
            if (caapff.appcontent) {
                caapff.initPrefListener();
                caapff.prefListener.register();
                caapff.appcontent.addEventListener("DOMContentLoaded", caapff.onPageLoad, true);
            } else {
                caapff.log("Init retry");
                window.setTimeout(caapff.init, 5000);
            }
        } catch (err) {
            caapff.error("init: " + err);
        }
    },

    shutdown: function (event) {
        try {
            caapff.log("shutdown");
            caapff.appcontent.removeEventListener("DOMContentLoaded", caapff.onPageLoad, true);
            caapff.prefListener.unregister();
            window.removeEventListener("load", caapff.init, false);
            window.removeEventListener("unload", caapff.shutdown, false);
            document.removeEventListener("CaapMessageEvent", caapff.receiveMessage, false, true);
        } catch (err) {
            caapff.error("shutdown: " + err);
        }
    },

    unloadListener: function (event) {
        caapff.onPageUnload(event);
    },

    onPageLoad: function (event) {
        try {
            // doc is document that triggered "onload" event
            var doc         = event.originalTarget,
                href        = doc.location.href,
                head        = null,
                nodeName    = event.originalTarget.nodeName,
                defaultView = event.originalTarget.defaultView,
                autorun     = false;

            if (nodeName && nodeName === "#document" && href && caapff.isPage(href) && defaultView && defaultView.location.href === gBrowser.currentURI.spec && gBrowser.currentURI.spec !== "about:blank") {
                caapff.log("onPageLoad: " + nodeName + " href: " + href);
                caapff.log(event);
                defaultView.addEventListener("unload", caapff.unloadListener, true);
                autorun = caapff.prefManager.getBoolPref("extensions.caap.autorun");
                if (autorun && doc && !caapff.isRunning(doc)) {
                    caapff.log("autorun");
                    head = doc.getElementsByTagName("head")[0];
                    if (head) {
                        caapff.injectAll(doc, head);
                        caapff.running = true;
                    }
                }
            }
        } catch (err) {
            caapff.error(["onPageLoad: ", err]);
        }
    },

    onPageUnload: function (event) {
        try {
            caapff.running = false;
            var defaultView = event.originalTarget.defaultView;
            if (defaultView) {
                defaultView.removeEventListener("unload", caapff.unloadListener, true);
            }

            caapff.log("onPageUnload");
        } catch (err) {
            caapff.error("onPageUnload: " + err);
        }
    },

    isPage: function (href) {
        try {
            var it     = 0,
                len    = caapff.pages.length,
                onPage = false;

            for (it = 0; it < len; it += 1) {
                if (href.search(caapff.pages[it]) > -1) {
                    onPage = true;
                    break;
                }
            }

            return onPage;
        } catch (err) {
            caapff.error("isPage: " + err);
            return false;
        }
    },

    injectAll: function (doc, head) {
        try {
            var it  = 0,
                len = caapff.files.length;

            for (it = 0; it < len; it += 1) {
                caapff.log("injectAll: " + caapff.files[it]);
                caapff.injectScript(doc, head, caapff.files[it]);
            }
        } catch (err) {
            caapff.error("injectAll: " + err);
        }
    },

    injectScript: function (doc, head, url) {
        try {
            var a = doc.createElement('script');
            a.type = 'text/javascript';
            a.src = url;
            head.appendChild(a);
            head.removeChild(a);
        } catch (err) {
            caapff.error("injectScript: " + err);
        }
    },

    isRunning: function (doc) {
        try {
            var exist = doc.getElementById("caap_div") ? true : false;
            caapff.log("isRunning: " + exist);
            return exist;
        } catch (err) {
            caapff.error("isRunning: " + err);
            return true;
        }
    },

    checkBoxListener: function (event) {
        try {
            var name  = event.target.id.replace(/(status_menu_|tools_menu_|tool_bar_)/, ""),
                value = !caapff.prefManager.getBoolPref("extensions.caap." + name);

            caapff.log("checkBoxListener: " + name + " = " + value);
            caapff.prefManager.setBoolPref("extensions.caap." + name, value);
        } catch (err) {
            caapff.error("checkBoxListener: " + err);
        }
    },

    keysetListener: function (event) {
        try {
            var name  = event.target.id.replace(/keyset_/, ""),
                value = !caapff.prefManager.getBoolPref("extensions.caap." + name);

            caapff.log("checkBoxListener: " + name + " = " + value);
            caapff.prefManager.setBoolPref("extensions.caap." + name, value);
        } catch (err) {
            caapff.error("checkBoxListener: " + err);
        }
    },

    updateStatusBar: function (name, value) {
        try {
            caapff.log("updateStatusBar: " + name + " = " + value);
            var element;
            if (name === "autorun") {
                element = document.getElementById("status_menu_autorun");
                if (element) {
                    element.setAttribute("checked", value);
                }

                element = document.getElementById("tools_menu_autorun");
                if (element) {
                    element.setAttribute("checked", value);
                }

                element = document.getElementById("tool_bar_menu_autorun");
                if (element) {
                    element.setAttribute("checked", value);
                }

                element = document.getElementById("status_bar_icon");
                if (element) {
                    element.setAttribute("src", value ? "chrome://caap/skin/status-bar.png" : "chrome://caap/skin/disabled.png");
                }

                element = document.getElementById("toolbar_button");
                if (element) {
                    element.setAttribute("class", value ? "toolbar_button_enabled" : "toolbar_button_disabled");
                }
            }
        } catch (err) {
            caapff.error("updateStatusBar: " + err);
        }
    },

    getPage: function (message) {
        var respObj = {"status": -1, "statusText": "", "responseText": "", "errorThrown": ""};
        try {
            caapff.log("getPage");
            caapff.log(message);
            var req = new XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState !== 4) {
                    return;
                }

                respObj.status = req.status;
                respObj.statusText = req.statusText;
                respObj.responseText = req.responseText;
                caapff.log(respObj);
                message.source.postMessage(JSON.stringify({"action": "data", "value": respObj}), message.baseURI);
            };

            req.open('GET', message.value, false);
            req.send(null);
        } catch (err) {
            caapff.error("getPage: " + err);
            respObj.errorThrown = err.toString();
            message.source.postMessage({"action": "data", "value": respObj}, message.baseURI);
        }
    },

    receiveMessage: function (event) {
        try {
            if (!caapff.isPage(event.originalTarget.baseURI)) {
                return;
            }

            caapff.log(event);
            var message = {
                    source : event.originalTarget.ownerDocument.defaultView,
                    baseURI: event.originalTarget.baseURI,
                    action : event.target.getAttribute("action"),
                    value  : JSON.parse(event.target.getAttribute("value"))
                };

            if (message.action === 'getPage') {
                caapff.getPage(message);
            }
        } catch (err) {
            caapff.error("receiveMessage: " + err);
        }
    },

    PrefListener: function (branchName, func) {
        try {
            var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService),
                branch      = prefService.getBranch(branchName);

            branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
            this.register = function () {
                branch.addObserver("", this, false);
                branch.getChildList("", { }).forEach(function (name) {
                    func(branch, name);
                });
            };

            this.unregister = function unregister() {
                if (branch) {
                    branch.removeObserver("", this);
                }
            };

            this.observe = function (subject, topic, data) {
                if (topic === "nsPref:changed") {
                    func(branch, data);
                }
            };
        } catch (err) {
            caapff.error("PrefListener: " + err);
        }
    },

    prefListener: null,

    initPrefListener: function () {
        try {
            caapff.prefListener = new caapff.PrefListener("extensions.caap.", function (branch, name) {
                var value = caapff.prefManager.getBoolPref("extensions.caap." + name),
                    element;

                caapff.log("initPrefListener: " + name + " = " + value);
                if (name === "autorun") {
                    caapff.updateStatusBar(name, value);
                }
            });
        } catch (err) {
            caapff.error("initPrefListener: " + err);
        }
    },

    log: function (aMessage) {
        try {
            if (window.Firebug && Firebug.Console && typeof Firebug.Console.log === "function") {
                Firebug.Console.log([caapff.version + (caapff.dev !== '0' ? 'd' + caapff.dev : '') + ' |' + (new Date()).toLocaleTimeString() + '| ', aMessage]);
            } else {
                caapff.consoleService.logStringMessage(caapff.version + (caapff.dev !== '0' ? 'd' + caapff.dev : '') + ' |' + (new Date()).toLocaleTimeString() + '| ' + aMessage);
            }
        } catch (err) {
            caapff.error("log: " + err);
        }
    },

    error: function (aMessage) {
        if (window.Firebug && Firebug.Console && typeof Firebug.Console.error !== "function") {
            Firebug.Console.log([caapff.version + (caapff.dev !== '0' ? 'd' + caapff.dev : '') + ' |' + (new Date()).toLocaleTimeString() + '| ERROR: ', aMessage]);
        } else {
            Components.utils.reportError(caapff.version + (caapff.dev !== '0' ? 'd' + caapff.dev : '') + ' |' + (new Date()).toLocaleTimeString() + '| ' + aMessage);
        }
    }
};

window.addEventListener("load", caapff.init, false);
window.addEventListener("unload", caapff.shutdown, false);
document.addEventListener("CaapMessageEvent", caapff.receiveMessage, false, true);
