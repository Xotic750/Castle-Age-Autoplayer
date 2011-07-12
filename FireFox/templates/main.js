/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global window,postMessage,simpleStorage,exports,widgets,data,pageMod,panels,require */
/*jslint maxlen: 512 */

if (Components.classes["@mozilla.org/xpcom/version-comparator;1"].getService(Components.interfaces.nsIVersionComparator).compare(Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULAppInfo).version, "4.0b7") >= 0) {
    // Comment out the following 'const' lines when using JSLint
    const widgets = require('widget');
    const data = require('self').data;
    const pageMod = require('page-mod');
    const simpleStorage = require('simple-storage').storage;
    const xhr = require('xhr');

    var workers = [],
        files = {
            'caap'       : "Castle-Age-Autoplayer.js",
            'utility'    : "utility-!utility!.min.js",
            'jquery'     : "jquery-!jquery!.min.js",
            'jqueryui'   : "jquery-ui-!jqueryui!.min.js",
            'farbtastic' : "farbtastic.min.js",
            'datatables' : "jquery.dataTables-!datatables!.min.js"
        };

    if (typeof simpleStorage.caapAutorun !== 'boolean') {
        simpleStorage.caapAutorun = true;
        console.log("Set initial autorun state: " + simpleStorage.caapAutorun);
    }

    function detachWorker(worker, workerArray) {
        var index = workerArray.indexOf(worker);
        if (index !== -1) {
            workerArray.splice(index, 1);
        }
    }

    function autorunNotify() {
        workers.forEach(function (worker) {
            worker.postMessage({action: 'autorun', status: "", value: simpleStorage.caapAutorun});
        });
    }

    function toggleAutorun() {
        simpleStorage.caapAutorun = !simpleStorage.caapAutorun;
        autorunNotify();
        return simpleStorage.caapAutorun;
    }

    function getWidgetIcon() {
        return simpleStorage.caapAutorun ? data.url('widget/enabled.png') : data.url('widget/disabled.png');
    }

    function getPage(worker, message) {
        try {
            console.log("getPage: " + message.value);
            var req = new xhr.XMLHttpRequest();
            req.onreadystatechange = function () {
                if (req.readyState !== 4) {
                    return;
                }

                worker.postMessage({
                    action : "data",
                    status : true,
                    value  : {
                        status       : req.status,
                        statusText   : req.statusText,
                        responseText : req.responseText,
                        errorThrown  : ""
                    }
                });
            };

            req.open('GET', message.value, false);
            req.send(null);
        } catch (err) {
            console.error("getPage: " + err);
            worker.postMessage({
                action : "data",
                status : false,
                value  : {
                    status       : -1,
                    statusText   : "",
                    responseText : "",
                    errorThrown  : "getPage: " + err.toString()
                }
            });
        }
    }

    exports.main = function () {
        var widget,
            selector;

        widget = widgets.Widget({
            id: 'caap_status_bar_icon',
            label: 'CAAP',
            status: data.status,
            contentURL: getWidgetIcon(),
            contentScriptWhen: 'ready',
            contentScriptFile: data.url('widget/widget.js'),
            onMessage: function (message) {
                if (message === 'left-click') {
                    console.log('activate/deactivate');
                    toggleAutorun();
                    widget.contentURL = getWidgetIcon();
                } else if (message === 'right-click') {
                    console.log(message);
                }
            }
        });

        selector = pageMod.PageMod({
            include: [
                'http://apps.facebook.com/castle_age/*',
                'https://apps.facebook.com/castle_age/*',
                'http://web3.castleagegame.com/castle_ws/*',
                'https://web3.castleagegame.com/castle_ws/*',
                'http://apps.facebook.com/common/error.html*',
                'https://apps.facebook.com/common/error.html*',
                'http://www.facebook.com/common/error.html*',
                'https://www.facebook.com/common/error.html*',
                'http://apps.facebook.com/sorry.php*',
                'https://apps.facebook.com/sorry.php*',
                'http://apps.facebook.com/reqs.php#confirm_46755028429_0*',
                'https://apps.facebook.com/reqs.php#confirm_46755028429_0*',
                'http://web.castleagegame.com/castle/*',
                'https://web.castleagegame.com/castle/*',
                'http://www.facebook.com/dialog/apprequests?access_token=46755028429*',
                'https://www.facebook.com/dialog/apprequests?access_token=46755028429*'
            ],
            contentScriptWhen: 'ready',
            contentScriptFile: [data.url('caap_comms.js')],
            onAttach: function (worker) {
                console.log('attach');
                worker.postMessage({action : "begin", status: 'connected', value: true});
                workers.push(worker);
                worker.on('message', function (message) {
                    switch (message.action) {
                    case 'injected':
                        if (simpleStorage.caapAutorun && message.status === false) {
                            console.log(message.action + ' ' + message.status + ' ' + message.value);
                            this.postMessage({action: "script", status: files[message.value], value: data.load(files[message.value])});
                        }

                        break;
                    case 'script':
                        if (simpleStorage.caapAutorun) {
                            console.log(message.action + ' ' + message.status + ' ' + message.value);
                            this.postMessage({action: "script", status: files[message.value], value: data.load(files[message.value])});
                        }

                        break;
                    case 'getPage':
                        console.log(message.action + ' ' + message.status + ' ' + message.value);
                        getPage(this, message);
                        break;
                    case 'detach':
                        console.log(message.action + ' ' + message.status + ' ' + message.value);
                        detachWorker(this, workers);
                        break;
                    default:
                    }
                });
            }
        });
    };
}
