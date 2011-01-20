
//////////////////////////////////
//       Functions
//////////////////////////////////

function caap_log(msg) {
    if (typeof console.log !== undefined) {
        console.log(caapVersion + (devVersion ? 'd' + devVersion : '') + ' |' + (new Date()).toLocaleTimeString() + '| ' + msg);
    }
}

function injectScript(url) {
    var inject = document.createElement('script');
    inject.setAttribute('type', 'text/javascript');
    inject.setAttribute('src', url);
    document.head.appendChild(inject);
}

function caap_DomTimeOut() {
    caap_log("DOM onload timeout!!! Reloading ...");
    if (typeof window.location.reload === 'function') {
        window.location.reload();
    } else if (typeof history.go === 'function') {
        history.go(0);
    } else {
        window.location.href = window.location.href;
    }
}

function caap_WaitForutility() {
    if (typeof utility !== 'undefined') {
        caap_log("utility ready ...");
        caap_log(typeof utility);
        utility.set_log_version(caapVersion + (devVersion ? 'd' + devVersion : ''));
        utility.jQueryExtend();
        gm = new utility.storage({'namespace': 'caap'});
        ss = new utility.storage({'namespace': 'caap', 'storage_type': 'sessionStorage'});
        jQuery(caap.start());
    } else {
        caap_log("Waiting for utility ...");
        caap_log(typeof utility);
        window.setTimeout(caap_WaitForutility, 100);
    }
}

function caap_WaitForrison() {
    if (typeof rison !== 'undefined') {
        caap_log("rison ready ...");
        if (typeof rison === 'undefined') {
            caap_log("Inject utility.");
            injectScript('http://castle-age-auto-player.googlecode.com/files/utility.min.js');
        }

        caap_WaitForutility();
    } else {
        caap_log("Waiting for rison ...");
        window.setTimeout(caap_WaitForrison, 100);
    }
}

function caap_WaitForjsonhpack() {
    if (typeof JSON.hpack === 'function') {
        caap_log("json.hpack ready ...");
        if (typeof rison === 'undefined') {
            caap_log("Inject rison.");
            injectScript('http://castle-age-auto-player.googlecode.com/files/rison.js');
        }

        caap_WaitForrison();
    } else {
        caap_log("Waiting for json.hpack ...");
        window.setTimeout(caap_WaitForjsonhpack, 100);
    }
}

function caap_WaitForjson2() {
    if (typeof JSON.stringify === 'function') {
        caap_log("json2 ready ...");
        if (typeof JSON.hpack !== 'function') {
            caap_log("Inject json.hpack.");
            injectScript('http://castle-age-auto-player.googlecode.com/files/json.hpack.min.js');
        }

        caap_WaitForjsonhpack();
    } else {
        caap_log("Waiting for json2 ...");
        window.setTimeout(caap_WaitForjson2, 100);
    }
}

function caap_WaitForFarbtastic() {
    if (typeof jQuery.farbtastic === 'function') {
        caap_log("farbtastic ready ...");
        if (typeof JSON.stringify !== 'function') {
            caap_log("Inject json2.");
            injectScript('http://castle-age-auto-player.googlecode.com/files/json2.js');
        }

        caap_WaitForjson2();
    } else {
        caap_log("Waiting for farbtastic ...");
        window.setTimeout(caap_WaitForFarbtastic, 100);
    }
}

function caap_WaitForjQueryUI() {
    if (typeof jQuery.ui === 'object') {
        caap_log("jQueryUI ready ...");
        if (typeof jQuery.farbtastic !== 'function') {
            caap_log("Inject farbtastic.");
            injectScript('http://castle-age-auto-player.googlecode.com/files/farbtastic.min.js');
        }

        caap_WaitForFarbtastic();
    } else {
        caap_log("Waiting for jQueryUI ...");
        window.setTimeout(caap_WaitForjQueryUI, 100);
    }
}

function caap_WaitForjQuery() {
    if (typeof window.jQuery === 'function') {
        caap_log("jQuery ready ...");
        $j = jQuery.noConflict();
        if (typeof $j.ui !== 'object') {
            caap_log("Inject jQueryUI.");
            injectScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.6/jquery-ui.min.js');
        }

        caap_WaitForjQueryUI();
    } else {
        caap_log("Waiting for jQuery ...");
        window.setTimeout(caap_WaitForjQuery, 100);
    }
}

/////////////////////////////////////////////////////////////////////
//                         Begin
/////////////////////////////////////////////////////////////////////

caap_log("Starting ... waiting page load");
caap_timeout = window.setTimeout(caap_DomTimeOut, 180000);
if (typeof window.jQuery !== 'function') {
    caap_log("Inject jQuery");
    injectScript('http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js');
}

caap_WaitForjQuery();

// ENDOFSCRIPT
