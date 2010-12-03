
/////////////////////////////////////////////////////////////////////
//                         MAIN
/////////////////////////////////////////////////////////////////////

utility.log(1, "Starting CAAP ... waiting page load");
gm.clear0();
utility.setTimeout(function () {
        utility.error('DOM onload timeout!!! Reloading ...');
        window.location.reload();
    }, 180000);

function caap_Start() {
    var FBID          = 0,
        idOk          = false,
        tempText      = '',
        tempArr       = [],
        accountEl;

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

    accountEl = $('#navAccountName');
    if (accountEl && accountEl.length) {
        tempText = accountEl.attr('href');
        if (tempText) {
            FBID = tempText.regex(/id=([0-9]+)/i);
            if (utility.isNum(FBID) && FBID > 0) {
                caap.stats.FBID = FBID;
                idOk = true;
            }
        }
    }

    if (!idOk) {
        tempArr = $('script').text().match(new RegExp('."user.":(\\d+),', 'i'));
        if (tempArr && tempArr.length === 2) {
            FBID = parseInt(tempArr[1], 10);
            if (utility.isNum(FBID) && FBID > 0) {
                caap.stats.FBID = FBID;
                idOk = true;
            }
        }
    }

    if (!idOk) {
        tempArr = $('script').text().match(new RegExp('user:(\\d+),', 'i'));
        if (tempArr && tempArr.length === 2) {
            FBID = parseInt(tempArr[1], 10);
            if (utility.isNum(FBID) && FBID > 0) {
                caap.stats.FBID = FBID;
                idOk = true;
            }
        }
    }

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
    gm.used();
    schedule.load();
    state.load();
    caap.LoadStats();
    caap.stats.FBID = FBID;
    caap.stats.account = accountEl.text();
    gifting.init();
    state.setItem('clickUrl', window.location.href);
    schedule.setItem('clickedOnSomething', 0);
    css.AddCSS();

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

function caap_WaitForjson2() {
    if (typeof JSON.stringify === 'function') {
        utility.log(1, 'CAAP: json2 ready...');
        $(caap_Start);
    } else {
        utility.log(1, 'CAAP: Waiting for json2...');
        window.setTimeout(caap_WaitForjson2, 100);
    }
}

function caap_WaitForFarbtastic() {
    if (typeof $.farbtastic === 'function') {
        utility.log(1, 'CAAP: farbtastic ready...');
        if (typeof JSON.stringify !== 'function') {
            utility.log(1, 'CAAP: Inject json2.');
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/json2.js');
        }

        caap_WaitForjson2();
    } else {
        utility.log(1, 'CAAP: Waiting for farbtastic...');
        window.setTimeout(caap_WaitForFarbtastic, 100);
    }
}

function caap_WaitForjQueryUI() {
    if (typeof $.ui === 'object') {
        utility.log(1, 'CAAP: jQueryUI ready...');
        if (typeof $.farbtastic !== 'function') {
            utility.log(1, 'CAAP: Inject farbtastic.');
            utility.injectScript('http://castle-age-auto-player.googlecode.com/files/farbtastic.min.js');
        }

        caap_WaitForFarbtastic();
    } else {
        utility.log(1, 'CAAP: Waiting for jQueryUI...');
        window.setTimeout(caap_WaitForjQueryUI, 100);
    }
}

function caap_WaitForjQuery() {
    if (typeof window.jQuery === 'function') {
        utility.log(1, 'CAAP: jQuery ready...');
        if (typeof $.ui !== 'object') {
            utility.log(1, 'CAAP: Inject jQueryUI.');
            utility.injectScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.6/jquery-ui.min.js');
        }

        caap_WaitForjQueryUI();
    } else {
        utility.log(1, 'CAAP: Waiting for jQuery...');
        window.setTimeout(caap_WaitForjQuery, 100);
    }
}

if (typeof window.jQuery !== 'function') {
    utility.log(1, 'CAAP: Inject jQuery');
    utility.injectScript('http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js');
}

caap_WaitForjQuery();

// ENDOFSCRIPT
