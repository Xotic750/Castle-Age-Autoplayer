
///////////////////////////
// Define our global object
///////////////////////////

global = {
    namespace           : 'caap',
    discussionURL       : 'http://senses.ws/caap/index.php',
    newVersionAvailable : false,
    documentTitle       : document.title,
    // Object separator - used to separate objects
    os                  : '\n',
    // Value separator - used to separate name/values within the objects
    vs                  : '\t',
    // Label separator - used to separate the name from the value
    ls                  : '\f',

    releaseUpdate: function () {
        try {
            if (state.getItem('SUC_remote_version', 0) > caapVersion) {
                global.newVersionAvailable = true;
            }

            // update script from: http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js

            function updateCheck(forced) {
                if (forced || (state.getItem('SUC_last_update', 0) + 86400000) <= new Date().getTime()) {
                    try {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: 'http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js',
                            headers: {'Cache-Control': 'no-cache'},
                            onload: function (resp) {
                                var remote_version = resp.responseText.match(new RegExp("@version\\s*(.*?)\\s*$", "m"))[1],
                                    script_name    = resp.responseText.match(new RegExp("@name\\s*(.*?)\\s*$", "m"))[1];

                                state.setItem('SUC_last_update', new Date().getTime());
                                state.setItem('SUC_target_script_name', script_name);
                                state.setItem('SUC_remote_version', remote_version);
                                utility.log(1, 'remote version ', remote_version);
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

            GM_registerMenuCommand(state.getItem('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
                updateCheck(true);
            });

            updateCheck(false);
        } catch (err) {
            utility.error("ERROR in release updater: " + err);
        }
    },

    devUpdate: function () {
        try {
            if (state.getItem('SUC_remote_version', 0) > caapVersion || (state.getItem('SUC_remote_version', 0) >= caapVersion && state.getItem('DEV_remote_version', 0) > devVersion)) {
                global.newVersionAvailable = true;
            }

            // update script from: http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js

            function updateCheck(forced) {
                if (forced || (gm.getItem('SUC_last_update', 0) + 86400000) <= (new Date().getTime())) {
                    try {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: 'http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js',
                            headers: {'Cache-Control': 'no-cache'},
                            onload: function (resp) {
                                var remote_version = resp.responseText.match(new RegExp("@version\\s*(.*?)\\s*$", "m"))[1],
                                    dev_version    = resp.responseText.match(new RegExp("@dev\\s*(.*?)\\s*$", "m"))[1],
                                    script_name    = resp.responseText.match(new RegExp("@name\\s*(.*?)\\s*$", "m"))[1];

                                state.setItem('SUC_last_update', new Date().getTime());
                                state.setItem('SUC_target_script_name', script_name);
                                state.setItem('SUC_remote_version', remote_version);
                                state.setItem('DEV_remote_version', dev_version);
                                utility.log(1, 'remote version ', remote_version, dev_version);
                                if (remote_version > caapVersion || (remote_version >= caapVersion && dev_version > devVersion)) {
                                    global.newVersionAvailable = true;
                                    if (forced) {
                                        if (confirm('There is an update available for the Greasemonkey script "' + script_name + '."\nWould you like to go to the install page now?')) {
                                            GM_openInTab('http://code.google.com/p/castle-age-auto-player/updates/list');
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

            GM_registerMenuCommand(state.getItem('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
                updateCheck(true);
            });

            updateCheck(false);
        } catch (err) {
            utility.error("ERROR in development updater: " + err);
        }
    }
};
