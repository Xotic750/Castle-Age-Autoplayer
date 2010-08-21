
///////////////////////////
// Define our global object
///////////////////////////

global = {
    gameName            : 'castle_age',
    discussionURL       : 'http://senses.ws/caap/index.php',
    newVersionAvailable : false,
    documentTitle       : document.title,
    is_chrome           : navigator.userAgent.toLowerCase().indexOf('chrome') !== -1 ? true : false,
    is_firefox          : navigator.userAgent.toLowerCase().indexOf('firefox') !== -1  ? true : false,
    // Object separator - used to separate objects
    os                  : '\n',
    // Value separator - used to separate name/values within the objects
    vs                  : '\t',
    // Label separator - used to separate the name from the value
    ls                  : '\f',

    alert_id: 0,

    alert: function (message) {
        try {
            global.alert_id += 1;
            var id = global.alert_id;
            $('<div id="alert_' + id + '" title="Alert!"><p>' + message + '</p></div>').appendTo(document.body);
            $("#alert_" + id).dialog({
                buttons: {
                    "Ok": function () {
                        $(this).dialog("close");
                    }
                }
            });

            return true;
        } catch (err) {
            this.error("ERROR in alert: " + err);
            return false;
        }
    },

    logLevel: 1,

    log: function (level, text) {
        if (console.log !== undefined) {
            if (this.logLevel && !isNaN(level) && this.logLevel >= level) {
                var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text;
                if (arguments.length > 2) {
                    console.log(message, Array.prototype.slice.call(arguments, 2));
                } else {
                    console.log(message);
                }
            }
        }
    },

    warn: function (text) {
        if (console.warn !== undefined) {
            var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text;
            if (arguments.length > 1) {
                console.warn(message, Array.prototype.slice.call(arguments, 1));
            } else {
                console.warn(message);
            }
        } else {
            if (arguments.length > 1) {
                this.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                this.log(1, text);
            }
        }
    },

    error: function (text) {
        if (console.error !== undefined) {
            var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text;
            if (arguments.length > 1) {
                console.error(message, Array.prototype.slice.call(arguments, 1));
            } else {
                console.error(message);
            }
        } else {
            if (arguments.length > 1) {
                this.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                this.log(1, text);
            }
        }
    },

    ReloadCastleAge: function () {
        // better than reload... no prompt on forms!
        if (window.location.href.indexOf('castle_age') >= 0 && !gm.getValue('Disabled') && (gm.getValue('caapPause') === 'none')) {
            if (global.is_chrome) {
                CE_message("paused", null, gm.getValue('caapPause', 'none'));
            }

            window.location.href = "http://apps.facebook.com/castle_age/index.php?bm=1";
        }
    },

    ReloadOccasionally: function () {
        var reloadMin = gm.getNumber('ReloadFrequency', 8);
        if (!reloadMin || reloadMin < 8) {
            reloadMin = 8;
        }

        nHtml.setTimeout(function () {
            if (caap.WhileSinceDidIt('clickedOnSomething', 5 * 60)) {
                global.log(1, 'Reloading if not paused after inactivity');
                if ((window.location.href.indexOf('castle_age') >= 0 || window.location.href.indexOf('reqs.php#confirm_46755028429_0') >= 0) &&
                        !gm.getValue('Disabled') && (gm.getValue('caapPause') === 'none')) {
                    if (global.is_chrome) {
                        CE_message("paused", null, gm.getValue('caapPause', 'none'));
                    }

                    window.location.href = "http://apps.facebook.com/castle_age/index.php?bm=1";
                }
            }

            global.ReloadOccasionally();
        }, 1000 * 60 * reloadMin + (reloadMin * 60 * 1000 * Math.random()));
    },

    releaseUpdate: function () {
        try {
            if (gm.getValue('SUC_remote_version', 0) > caapVersion) {
                global.newVersionAvailable = true;
            }

            // update script from: http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js

            function updateCheck(forced) {
                if ((forced) || (parseInt(gm.getValue('SUC_last_update', '0'), 10) + (86400000 * 1) <= (new Date().getTime()))) {
                    try {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: 'http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js',
                            headers: {'Cache-Control': 'no-cache'},
                            onload: function (resp) {
                                var rt             = resp.responseText,
                                    remote_version = (new RegExp("@version\\s*(.*?)\\s*$", "m").exec(rt))[1],
                                    script_name    = (new RegExp("@name\\s*(.*?)\\s*$", "m").exec(rt))[1];

                                gm.setValue('SUC_last_update', new Date().getTime() + '');
                                gm.setValue('SUC_target_script_name', script_name);
                                gm.setValue('SUC_remote_version', remote_version);
                                global.log(1, 'remote version ', remote_version);
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
            global.error("ERROR in release updater: " + err);
        }
    },

    devUpdate: function () {
        try {
            if (gm.getValue('SUC_remote_version', 0) > caapVersion || (gm.getValue('SUC_remote_version', 0) >= caapVersion && gm.getValue('DEV_remote_version', 0) > devVersion)) {
                global.newVersionAvailable = true;
            }

            // update script from: http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js

            function updateCheck(forced) {
                if ((forced) || (parseInt(gm.getValue('SUC_last_update', '0'), 10) + (86400000 * 1) <= (new Date().getTime()))) {
                    try {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: 'http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js',
                            headers: {'Cache-Control': 'no-cache'},
                            onload: function (resp) {
                                var rt             = resp.responseText,
                                    remote_version = (new RegExp("@version\\s*(.*?)\\s*$", "m").exec(rt))[1],
                                    dev_version    = (new RegExp("@dev\\s*(.*?)\\s*$", "m").exec(rt))[1],
                                    script_name    = (new RegExp("@name\\s*(.*?)\\s*$", "m").exec(rt))[1];

                                gm.setValue('SUC_last_update', new Date().getTime() + '');
                                gm.setValue('SUC_target_script_name', script_name);
                                gm.setValue('SUC_remote_version', remote_version);
                                gm.setValue('DEV_remote_version', dev_version);
                                global.log(1, 'remote version ', remote_version, dev_version);
                                if (remote_version > caapVersion || (remote_version >= caapVersion && dev_version > devVersion)) {
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
            global.error("ERROR in development updater: " + err);
        }
    },

    hashStr: [
        '41030325072',
        '4200014995461306',
        '2800013751923752',
        '55577219620',
        '65520919503',
        '2900007233824090',
        '2900007233824090',
        '3100017834928060',
        '3500032575830770',
        '32686632448',
        '2700017666913321'
    ]
};
