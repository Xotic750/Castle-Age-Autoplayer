
/////////////////////////////////////////////////////////////////////
//                         BEGIN
/////////////////////////////////////////////////////////////////////

if (typeof GM_log !== 'function') {
    alert("Your browser does not appear to support Greasemonkey scripts!");
    throw "Error: Your browser does not appear to support Greasemonkey scripts!";
}

global.logLevel = gm.getValue('DebugLevel', global.logLevel);
global.log(1, "Starting");

/////////////////////////////////////////////////////////////////////
//                         Chrome Startup
/////////////////////////////////////////////////////////////////////

if (global.is_chrome) {
    try {
        var lastVersion      = localStorage.getItem(global.gameName + '__LastVersion', 0),
            shouldTryConvert = false;

        if (lastVersion) {
            if (lastVersion.substr(0, 1) === 's') {
                shouldTryConvert = true;
            }
        }

        if (caapVersion <= '140.21.9' || shouldTryConvert) {
            ConvertGMtoJSON();
        }
    } catch (err) {
        global.error("Error converting DB: " + err);
    }

    try {
        CM_Listener();
    } catch (err) {
        global.error("Error loading CM_Listener" + err);
    }
}

/////////////////////////////////////////////////////////////////////
//                         Set Title
/////////////////////////////////////////////////////////////////////

if (gm.getValue('SetTitle')) {
    var DocumentTitle = '';
    if (gm.getValue('SetTitleAction', false)) {
        DocumentTitle += "Starting - ";
    }

    if (gm.getValue('SetTitleName', false)) {
        caap.stats.PlayerName = gm.getValue('PlayerName', '');
        DocumentTitle += caap.stats.PlayerName + " - ";
    }

    document.title = DocumentTitle + global.documentTitle;
}

/////////////////////////////////////////////////////////////////////
//                          cloutman.com updater
// Used by browsers other than Chrome (namely Firefox and Flock)
// to get updates from cloutman.com
/////////////////////////////////////////////////////////////////////

if (!global.is_chrome) {
    try {
        if (gm.getValue('SUC_remote_version', 0) > caapVersion) {
            global.newVersionAvailable = true;
        }

        // update script from: http://cloutman.com/caap/Castle-Age-Autoplayer.user.js

        function updateCheck(forced) {
            if ((forced) || (parseInt(gm.getValue('SUC_last_update', '0'), 10) + (86400000 * 1) <= (new Date().getTime()))) {
                try {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: 'http://cloutman.com/caap/Castle-Age-Autoplayer.user.js',
                        headers: {'Cache-Control': 'no-cache'},
                        onload: function (resp) {
                            var rt             = resp.responseText,
                                remote_version = (new RegExp("@version\\s*(.*?)\\s*$", "m").exec(rt))[1],
                                script_name    = (new RegExp("@name\\s*(.*?)\\s*$", "m").exec(rt))[1];

                            gm.setValue('SUC_last_update', new Date().getTime() + '');
                            gm.setValue('SUC_target_script_name', script_name);
                            gm.setValue('SUC_remote_version', remote_version);
                            global.log(1, 'remote version ' + remote_version);
                            if (remote_version > caapVersion) {
                                global.newVersionAvailable = true;
                                if (forced) {
                                    if (confirm('There is an update available for the Greasemonkey script "' + script_name + '."\nWould you like to go to the install page now?')) {
                                        GM_openInTab('http://senses.ws/caap/index.php?topic=771.msg3582#msg3582');
                                    }
                                }
                            } else if (forced) {
                                alert('No update is available for "' + script_name + '."');
                            }
                        }
                    });
                } catch (err) {
                    if (forced) {
                        alert('An error occurred while checking for updates:\n' + err);
                    }
                }
            }
        }

        GM_registerMenuCommand(gm.getValue('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
            updateCheck(true);
        });

        updateCheck(false);
    } catch (err) {
        global.error("ERROR in cloutman.com updater: " + err);
    }
}

/////////////////////////////////////////////////////////////////////
// Put code to be run once to upgrade an old version's variables to
// new format or such here.
/////////////////////////////////////////////////////////////////////

if (gm.getValue('LastVersion', 0) !== caapVersion) {
    try {
        if ((gm.getValue('LastVersion', 0) < '140.15.3' || gm.getValue('LastVersion', 0) < '140.21.0' || gm.getValue('LastVersion', 0) < '140.23.51') &&
                gm.getValue("actionOrder", '') !== '') {
            alert("You are using a user defined Action List!\n" +
                  "The Master Action List has changed!\n" +
                  "You must update your Action List!");
        }

        if (gm.getValue('LastVersion', 0) < '140.16.2') {
            for (var a = 1; a <= 5; a += 1) {
                var attribute = gm.getValue("Attribute" + a, '');
                if (attribute !== '') {
                    gm.setValue("Attribute" + a, attribute.ucFirst());
                    global.log(1, "Converted Attribute" + a + ": " + attribute + "   to: " + attribute.ucFirst());
                }
            }
        }

        if (gm.getValue('LastVersion', 0) < '140.23.0') {
            var convertToArray = function (name) {
                var value = gm.getValue(name, '');
                var eList = [];
                if (value.length) {
                    value = value.replace(/\n/gi, ',');
                    eList = value.split(',');
                    var fEmpty = function (e) {
                        return e !== '';
                    };

                    eList = eList.filter(fEmpty);
                    if (!eList.length) {
                        eList = [];
                    }
                }

                gm.setList(name, eList);
            };

            convertToArray('EliteArmyList');
            convertToArray('BattleTargets');
        }

        if (gm.getValue('LastVersion', 0) < '140.23.6') {
            gm.deleteValue('AutoEliteGetList');
            gm.deleteValue('AutoEliteReqNext');
            gm.deleteValue('AutoEliteEnd');
            gm.deleteValue('MyEliteTodo');
        }

        if (gm.getValue('LastVersion', 0) < '140.23.51') {
            gm.deleteValue('userStats');
            gm.deleteValue('AllGenerals');
            gm.deleteValue('GeneralImages');
            gm.deleteValue('LevelUpGenerals');
        }

        gm.setValue('LastVersion', caapVersion);
    } catch (err) {
        global.error("ERROR in Environment updater: " + err);
    }
}

/////////////////////////////////////////////////////////////////////
//                    On Page Load
/////////////////////////////////////////////////////////////////////

$(function () {
    global.log(1, 'Full page load completed');
    // If unable to read in gm.values, then reload the page
    if (gm.getValue('caapPause', 'none') !== 'none' && gm.getValue('caapPause', 'none') !== 'block') {
        global.error('ERROR: Refresh page because unable to load gm.values due to unsafewindow error');
        window.location.href = window.location.href;
    }

    global.AddCSS();
    gm.setValue('clickUrl', window.location.href);
    if (window.location.href.indexOf('facebook.com/castle_age/') >= 0) {
        caap.LoadStats();
        caap.stats.FBID = $('head').html().regex(/user:([0-9]+),/i);
        caap.stats.account = $('#navAccountName').text();
        global.log(9, "FBID", caap.stats.FBID);
        if (!caap.stats.FBID || typeof caap.stats.FBID !== 'number' || caap.stats.FBID === 0) {
            // Force reload without retrying
            global.error('ERROR: No Facebook UserID!!!');
            window.location.href = window.location.href;
        }

        gm.setValue('caapPause', 'none');
        gm.setValue('ReleaseControl', true);
        if (global.is_chrome) {
            CE_message("paused", null, gm.getValue('caapPause', 'none'));
        }

        nHtml.setTimeout(function () {
            caap.init();
        }, 200);
    }

    caap.waitMilliSecs = 8000;
    caap.WaitMainLoop();
});

global.ReloadOccasionally();

// ENDOFSCRIPT
