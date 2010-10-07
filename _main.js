
/////////////////////////////////////////////////////////////////////
//                         BEGIN
/////////////////////////////////////////////////////////////////////

utility.log(1, "Starting CAAP ... waiting page load");
utility.setTimeout(function () {
        utility.error('DOM onload timeout!!! Releading ...', window.location.href);
        window.location.href = window.location.href;
    }, 180000);

/////////////////////////////////////////////////////////////////////
//                    On Page Load
/////////////////////////////////////////////////////////////////////

$(function () {
    var FBID          = 0,
        idOk          = false,
        DocumentTitle = '',
        tempText      = '',
        tempArr       = [],
        accountEl;

    utility.log(1, 'Full page load completed');
    utility.clearTimeouts();
    if (caap.ErrorCheck()) {
        return;
    }

    accountEl = $('#navAccountName');
    if (accountEl && accountEl.length) {
        tempText = accountEl.attr('href');
        if (tempText) {
            //FBID = tempText.regex(/id=([0-9]+)/i);
            if (utility.isNum(FBID) && FBID > 0) {
                caap.stats.FBID = FBID;
                idOk = true;
            } else {
                tempArr = $('script').text().match(new RegExp('."user.":(\\d+),', ''));
                if (tempArr && tempArr.length === 2) {
                    FBID = parseInt(tempArr[1], 10);
                    if (utility.isNum(FBID) && FBID > 0) {
                        caap.stats.FBID = FBID;
                        idOk = true;
                    }
                }
            }
        }
    }

    if (!idOk) {
        // Force reload without retrying
        utility.error('No Facebook UserID!!! Reloading ...', FBID, window.location.href);
        window.location.href = window.location.href;
    }

    config.load();
    schedule.load();
    state.load();
    caap.LoadStats();
    caap.stats.FBID = FBID;
    caap.stats.account = accountEl.text();
    utility.logLevel = gm.getItem('DebugLevel', utility.logLevel, hiddenVar);
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
            global.releaseUpdate();
        } else {
            global.devUpdate();
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

    caap.waitMilliSecs = 8000;
    caap.WaitMainLoop();
    caap.ReloadOccasionally();
});

// ENDOFSCRIPT
