
/////////////////////////////////////////////////////////////////////
//                         MAIN
/////////////////////////////////////////////////////////////////////

utility.log(1, "Starting CAAP ... waiting page load");
//gm.deleteItem("schedule.timers");
gm.clear0();
utility.setTimeout(function () {
        utility.error('DOM onload timeout!!! Reloading ...');
        if (typeof window.location.reload === 'function') {
            window.location.reload();
        } else if (typeof history.go === 'function') {
            history.go(0);
        } else {
            window.location.href = window.location.href;
        }
    }, 180000);

function caap_Start() {
    var FBID          = 0,
        idOk          = false,
        tempText      = '',
        tempArr       = [],
        accountEl     = null;

    function mainCaapLoop() {
        caap.waitMilliSecs = 8000;
        caap.WaitMainLoop();
        caap.ReloadOccasionally();
    }

    utility.log(1, 'Full page load completed');
    utility.clearTimeouts();
    if (caap.ErrorCheck()) {
        mainCaapLoop();
        return;
    }

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    accountEl = $('#navAccountName');
    if (accountEl && accountEl.length) {
        tempText = accountEl.attr('href');
        if (tempText) {
            FBID = tempText.regex(/id=(\d+)/i);
            if (utility.isNum(FBID) && FBID > 0) {
                caap.stats['FBID'] = FBID;
                idOk = true;
            }
        }
    }

    if (!idOk) {
        tempText = $('script').text();
    }

    if (!idOk) {
        tempArr = tempText ? tempText.match(new RegExp('user:(\\d+),', 'i')) : [];
        if (tempArr && tempArr.length === 2) {
            FBID = tempArr[1].parseInt();
            if (utility.isNum(FBID) && FBID > 0) {
                caap.stats['FBID'] = FBID;
                idOk = true;
            }
        }
    }

    if (!idOk) {
        tempArr = tempText ? tempText.match(new RegExp('."user.":(\\d+),', 'i')) : [];
        if (tempArr && tempArr.length === 2) {
            FBID = tempArr[1].parseInt();
            if (utility.isNum(FBID) && FBID > 0) {
                caap.stats['FBID'] = FBID;
                idOk = true;
            }
        }
    }
    /*jslint sub: false */

    if (!idOk) {
        // Force reload without retrying
        utility.error('No Facebook UserID!!! Reloading ...', FBID, window.location.href);
        if (typeof window.location.reload === 'function') {
            window.location.reload();
        } else if (typeof history.go === 'function') {
            history.go(0);
        } else {
            window.location.href = window.location.href;
        }

        return;
    }

    config.load();
    utility.logLevel = config.getItem('DebugLevel', utility.logLevel);
    css.AddCSS();
    gm.used();
    schedule.load();
    state.load();
    caap.LoadStats();
    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    caap.stats['FBID'] = FBID;
    tempText = accountEl.text();
    caap.stats['account'] = tempText ? tempText : '';
    /*jslint sub: false */
    gifting.init();
    gifting.loadCurrent();
    state.setItem('clickUrl', window.location.href);
    schedule.setItem('clickedOnSomething', 0);

    /////////////////////////////////////////////////////////////////////
    //                          http://code.google.com/ updater
    // Used by browsers other than Chrome (namely Firefox and Flock)
    // to get updates from http://code.google.com/
    /////////////////////////////////////////////////////////////////////

    if (utility.is_firefox) {
        if (!devVersion) {
            caap.releaseUpdate();
        } else {
            caap.devUpdate();
        }
    }

    /////////////////////////////////////////////////////////////////////
    // Put code to be run once to upgrade an old version's variables to
    // new format or such here.
    /////////////////////////////////////////////////////////////////////

    if (devVersion) {
        if (state.getItem('LastVersion', 0) !== caapVersion || state.getItem('LastDevVersion', 0) !== devVersion) {
            state.setItem('LastVersion', caapVersion);
            state.setItem('LastDevVersion', devVersion);
        }
    } else {
        if (state.getItem('LastVersion', 0) !== caapVersion) {
            state.setItem('LastVersion', caapVersion);
            state.setItem('LastDevVersion', 0);
        }
    }

    if (window.location.href.indexOf('facebook.com/castle_age/') >= 0) {
        state.setItem('caapPause', 'none');
        state.setItem('ReleaseControl', true);
        utility.setTimeout(function () {
            caap.init();
        }, 200);
    }

    mainCaapLoop();
}

function caap_WaitForrison() {
    if (typeof rison.encode === 'function') {
        utility.log(1, 'CAAP: rison ready ...');
        $(caap_Start);
    } else {
        utility.log(1, 'CAAP: Waiting for rison ...');
        window.setTimeout(caap_WaitForrison, 100);
    }
}

function caap_WaitForjsonhpack() {
    if (typeof JSON.hpack === 'function') {
        utility.log(1, 'CAAP: json.hpack ready ...');
        if (typeof rison.encode !== 'function') {
            utility.log(1, 'CAAP: Inject rison.');
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/rison.js');
        }

        caap_WaitForrison();
    } else {
        utility.log(1, 'CAAP: Waiting for json.hpack ...');
        window.setTimeout(caap_WaitForjsonhpack, 100);
    }
}

function caap_WaitForjson2() {
    if (typeof JSON.stringify === 'function') {
        utility.log(1, 'CAAP: json2 ready ...');
        if (typeof JSON.hpack !== 'function') {
            utility.log(1, 'CAAP: Inject json.hpack.');
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/json.hpack.min.js');
        }

        caap_WaitForjsonhpack();
    } else {
        utility.log(1, 'CAAP: Waiting for json2 ...');
        window.setTimeout(caap_WaitForjson2, 100);
    }
}

function caap_WaitForFarbtastic() {
    if (typeof $.farbtastic === 'function') {
        utility.log(1, 'CAAP: farbtastic ready ...');
        if (typeof JSON.stringify !== 'function') {
            utility.log(1, 'CAAP: Inject json2.');
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/json2.js');
        }

        caap_WaitForjson2();
    } else {
        utility.log(1, 'CAAP: Waiting for farbtastic ...');
        window.setTimeout(caap_WaitForFarbtastic, 100);
    }
}

function caap_WaitForjQueryUI() {
    if (typeof $.ui === 'object') {
        utility.log(1, 'CAAP: jQueryUI ready ...');
        if (typeof $.farbtastic !== 'function') {
            utility.log(1, 'CAAP: Inject farbtastic.');
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/farbtastic.min.js');
        }

        caap_WaitForFarbtastic();
    } else {
        utility.log(1, 'CAAP: Waiting for jQueryUI ...');
        window.setTimeout(caap_WaitForjQueryUI, 100);
    }
}

function caap_WaitForjQuery() {
    if (typeof window.jQuery === 'function') {
        utility.log(1, 'CAAP: jQuery ready ...');
        if (typeof $.ui !== 'object') {
            utility.log(1, 'CAAP: Inject jQueryUI.');
            utility.injectScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.6/jquery-ui.min.js');
        }

        caap_WaitForjQueryUI();
    } else {
        utility.log(1, 'CAAP: Waiting for jQuery ...');
        window.setTimeout(caap_WaitForjQuery, 100);
    }
}

if (typeof window.jQuery !== 'function') {
    utility.log(1, 'CAAP: Inject jQuery');
    utility.injectScript('http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js');
}

caap_WaitForjQuery();

// ENDOFSCRIPT
