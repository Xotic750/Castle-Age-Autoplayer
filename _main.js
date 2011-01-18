
//////////////////////////////////
//       Functions
//////////////////////////////////

function caap_DomTimeOut() {
    utility.log(1, "DOM onload timeout!!! Reloading ...");
    if (typeof window.location.reload === 'function') {
        window.location.reload();
    } else if (typeof history.go === 'function') {
        history.go(0);
    } else {
        window.location.href = window.location.href;
    }
}

function caap_WaitForrison() {
    if (typeof rison !== 'undefined') {
        utility.log(1, "rison ready ...");
        jQuery(caap.start());
    } else {
        utility.log(1, "Waiting for rison ...");
        window.setTimeout(caap_WaitForrison, 100);
    }
}

function caap_WaitForjsonhpack() {
    if (typeof JSON.hpack === 'function') {
        utility.log(1, "json.hpack ready ...");
        if (typeof rison === 'undefined') {
            utility.log(1, "Inject rison.");
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/rison.js');
        }

        caap_WaitForrison();
    } else {
        utility.log(1, "Waiting for json.hpack ...");
        window.setTimeout(caap_WaitForjsonhpack, 100);
    }
}

function caap_WaitForjson2() {
    if (typeof JSON.stringify === 'function') {
        utility.log(1, "json2 ready ...");
        if (typeof JSON.hpack !== 'function') {
            utility.log(1, "Inject json.hpack.");
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/json.hpack.min.js');
        }

        caap_WaitForjsonhpack();
    } else {
        utility.log(1, "Waiting for json2 ...");
        window.setTimeout(caap_WaitForjson2, 100);
    }
}

function caap_WaitForFarbtastic() {
    if (typeof jQuery.farbtastic === 'function') {
        utility.log(1, "farbtastic ready ...");
        if (typeof JSON.stringify !== 'function') {
            utility.log(1, "Inject json2.");
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/json2.js');
        }

        caap_WaitForjson2();
    } else {
        utility.log(1, "Waiting for farbtastic ...");
        window.setTimeout(caap_WaitForFarbtastic, 100);
    }
}

function caap_WaitForjQueryUI() {
    if (typeof jQuery.ui === 'object') {
        utility.log(1, "jQueryUI ready ...");
        if (typeof jQuery.farbtastic !== 'function') {
            utility.log(1, "Inject farbtastic.");
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/farbtastic.min.js');
        }

        caap_WaitForFarbtastic();
    } else {
        utility.log(1, "Waiting for jQueryUI ...");
        window.setTimeout(caap_WaitForjQueryUI, 100);
    }
}

function caap_WaitForjQuery() {
    if (typeof window.jQuery === 'function') {
        utility.log(1, "jQuery ready ...");
        utility.jQueryExtend();
        $j = jQuery.noConflict();
        if (typeof $j.ui !== 'object') {
            utility.log(1, "Inject jQueryUI.");
            utility.injectScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.6/jquery-ui.min.js');
        }

        caap_WaitForjQueryUI();
    } else {
        utility.log(1, "Waiting for jQuery ...");
        window.setTimeout(caap_WaitForjQuery, 100);
    }
}

/////////////////////////////////////////////////////////////////////
//                         Begin
/////////////////////////////////////////////////////////////////////
utility.log_version = caapVersion;
utility.log(1, "Starting ... waiting page load");
caap_timeout = window.setTimeout(caap_DomTimeOut, 180000);
if (typeof window.jQuery !== 'function') {
    utility.log(1, "Inject jQuery");
    utility.injectScript('http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js');
}

caap_WaitForjQuery();

// ENDOFSCRIPT
