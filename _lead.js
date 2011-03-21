
/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true */
/*global window,escape,jQuery,GM_log,GM_setValue,GM_getValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,GM_getResourceText,unsafeWindow,rison,utility,$u,CAAP_SCOPE_RUN */
/*jslint maxlen: 512 */

// If we are running Greasemonkey (FireFox) then we inject CAAP directly into the page and check for updates.
// This resolves the issues of jQuery not running correctly due to the Greasemonkey sandbox
/*jslint newcap: false */
if (navigator.userAgent.toLowerCase().indexOf('firefox') !== -1 && typeof GM_getResourceText === 'function' && typeof CAAP_SCOPE_RUN === 'undefined') {
    (function page_scope_runner() {
        try {
            var caapVersion = "!version!",
                devVersion = "!dev!",
                CAAP_SCOPE_RUN = [GM_getValue('SUC_target_script_name', ''), GM_getValue('SUC_remote_version', ''), GM_getValue('DEV_remote_version', '')],
                // If we're _not_ already running in the page, grab the full source of this script.
                my_src = "(" + page_scope_runner.caller.toString() + "());",
                // Create a script node holding this script, plus a marker that lets us
                // know we are running in the page scope (not the Greasemonkey sandbox).
                // Note that we are intentionally *not* scope-wrapping here.
                script = document.createElement('script');

            function scriptUpdate(forced) {
                try {
                    // update script from: http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js
                    if (forced || (parseInt(GM_getValue('SUC_last_update', 0), 10) + 86400000) < new Date().getTime()) {
                        GM_xmlhttpRequest({
                            method: 'GET',
                            url: devVersion !== '0' ? 'http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js' : 'http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js',
                            headers: {'Cache-Control': 'no-cache'},
                            onerror: function (resp) {
                                GM_log('scriptUpdate:' + resp.status);
                            },
                            onload: function (resp) {
                                try {
                                    var remote_version = resp.responseText.match(new RegExp("@version\\s*(.*?)\\s*$", "m"))[1],
                                        dev_version    = resp.responseText.match(new RegExp("@dev\\s*(.*?)\\s*$", "m"))[1],
                                        script_name    = resp.responseText.match(new RegExp("@name\\s*(.*?)\\s*$", "m"))[1];

                                    GM_log('Remote: ' + script_name + ' ' + remote_version + ' d' + dev_version);
                                    GM_setValue('SUC_last_update', '' + new Date().getTime());
                                    GM_setValue('SUC_target_script_name', script_name);
                                    GM_setValue('SUC_remote_version', remote_version);
                                    GM_setValue('DEV_remote_version', dev_version);
                                    CAAP_SCOPE_RUN[0] = script_name;
                                    CAAP_SCOPE_RUN[1] = remote_version;
                                    CAAP_SCOPE_RUN[2] = dev_version;
                                    if (devVersion !== '0' ? (remote_version > caapVersion || (remote_version >= caapVersion && dev_version > devVersion)) : (remote_version > caapVersion)) {
                                        if (forced && confirm('There is an update available for the Greasemonkey script "' + script_name + '."\nWould you like to go to the install page now?')) {
                                            GM_openInTab(devVersion !== '0' ? 'http://code.google.com/p/castle-age-auto-player/updates/list' : 'http://senses.ws/caap/index.php?topic=771.msg3582#msg3582');
                                        }
                                    } else if (forced) {
                                        alert('No update is available for "' + script_name + '"');
                                    }
                                } catch (e) {
                                    if (forced) {
                                        alert('An error occurred while checking for updates:\n' + e);
                                    }

                                    GM_log('An error occurred while checking for updates:\n' + e);
                                }
                            }
                        });
                    }
                } catch (err) {
                    GM_log("ERROR in scriptUpdate: " + err);
                }
            }

            scriptUpdate();
            GM_registerMenuCommand('CAAP - Manual Update Check', function () {
                scriptUpdate(true);
            });

            script.setAttribute("type", "text/javascript");
            // We use the text version of the script rather than a data version because FireBug hangs otherwise
            script.textContent = "var CAAP_SCOPE_RUN = ['" + CAAP_SCOPE_RUN[0] + "', '" + CAAP_SCOPE_RUN[1] + "', '" + CAAP_SCOPE_RUN[2] + "'];\n" + my_src;

            // Insert the script node into the page, so it will run, and immediately
            // remove it to clean up.  Use setTimeout to force execution "outside" of
            // the user script scope completely.
            window.setTimeout(function () {
                (document.head || document.getElementsByTagName('head')[0]).appendChild(script);
                (document.head || document.getElementsByTagName('head')[0]).removeChild(script);
            }, 0);
        } catch (err) {
            GM_log("ERROR in page_scope_runner: " + err);
        }
    }());

    // Stop running, because we know Greasemonkey actually runs us in an anonymous wrapper.
    // The return has to be eval'd otherwise Opera throws an error and will not run the script.
    /*jslint evil: true */
    eval("return;");
    /*jslint evil: false */
}
/*jslint newcap: true */

//////////////////////////////////
//       Globals
//////////////////////////////////
(function () {
    var caapVersion   = "!version!",
        devVersion    = "!dev!",
        hiddenVar     = true,
        caap_timeout  = 0,
        image64       = {},
        offline       = {},
        config        = {},
        state         = {},
        css           = {},
        gm            = null,
        ss            = null,
        sort          = {},
        schedule      = {},
        general       = {},
        monster       = {},
        guild_monster = {},
        //arena         = {},
        festival      = {},
        feed          = {},
        battle        = {},
        town          = {},
        spreadsheet   = {},
        gifting       = {},
        army          = {},
        caap          = {},
        $j            = {};

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    String.prototype['stripCaap'] = String.prototype.stripCaap = function () {
        return this.replace(/caap_/i, '');
    };

    String.prototype['numberOnly'] = String.prototype.numberOnly = function () {
        return parseFloat(this.replace(new RegExp("[^\\d\\.]", "g"), ''));
    };

    String.prototype['parseTimer'] = String.prototype.parseTimer = function () {
        var a = [],
            b = 0,
            i = 0,
            l = 0;

        a = this.split(':');
        for (i = 0, l = a.length; i < l; i += 1) {
            b = b * 60 + parseInt(a[i], 10);
        }

        if (isNaN(b)) {
            b = -1;
        }

        return b;
    };
    /*jslint sub: false */
