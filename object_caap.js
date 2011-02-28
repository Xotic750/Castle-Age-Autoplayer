
    ////////////////////////////////////////////////////////////////////
    //                          caap OBJECT
    // this is the main object for the game, containing all methods, globals, etc.
    /////////////////////////////////////////////////////////////////////

    caap = {
        lastReload          : new Date().getTime(),
        pageLoadCounter     : 0,
        flagReload          : false,
        waitingForDomLoad   : false,
        delayMain           : false,
        pageLoadOK          : false,
        caapDivObject       : {},
        caapTopObject       : {},
        documentTitle       : '',
        newVersionAvailable : false,
        ajaxLoadIcon        : {},
        globalContainer     : {},
        appBodyDiv          : {},
        resultsWrapperDiv   : {},
        resultsText         : '',
        domain              : {
            which    : -1,
            protocol : ["http://", "https://"],
            ptype    : 0,
            url      : ["apps.facebook.com/castle_age", "apps.facebook.com/reqs.php#confirm_46755028429_0", "web3.castleagegame.com/castle_ws"],
            id       : ["app46755028429_", "", ""],
            ajax     : ["a46755028429_", "", ""],
            link     : "http://apps.facebook.com/castle_age"
        },

        start: function () {
            var FBID      = 0,
                idOk      = false,
                accountEl = $j(),
                delay     = 1000;

            $u.set_log_version(caapVersion + (devVersion ? 'd' + devVersion : ''));
            $u.log(1, 'DOM load completed');
            window.clearTimeout(caap_timeout);
            if (window.location.href.hasIndexOf('apps.facebook.com/castle_age/')) {
                caap.domain.which = 0;
            } else if (window.location.href.hasIndexOf('apps.facebook.com/reqs.php#confirm_46755028429_0')) {
                caap.domain.which = 1;
            } else if (window.location.href.hasIndexOf('web3.castleagegame.com/castle_ws/')) {
                caap.domain.which = 2;
                delay = 5000;
            } else {
                $u.error('Unknown domain!', window.location.href);
                $u.reload();
                return;
            }

            if (window.location.href.hasIndexOf('http://')) {
                caap.domain.ptype = 0;
            } else if (window.location.href.hasIndexOf('https://')) {
                caap.domain.ptype = 1;
            } else {
                $u.error('Unknown protocol!', window.location.href);
                $u.reload();
                return;
            }

            caap.domain.link = caap.domain.protocol[caap.domain.ptype] + caap.domain.url[caap.domain.which];
            $u.log(1, 'Domain', caap.domain.which, caap.domain.protocol[caap.domain.ptype], caap.domain.url[caap.domain.which]);
            caap.documentTitle = document.title;
            caap.jQueryExtend();
            gm = new $u.storage({'namespace': 'caap'});
            ss = new $u.storage({'namespace': 'caap', 'storage_type': 'sessionStorage'});

            function mainCaapLoop() {
                caap.makeActionsList();
                caap.waitMilliSecs = 8000;
                caap.waitMainLoop();
                caap.reloadOccasionally();
            }

            gm.clear('0');
            if (caap.errorCheck()) {
                mainCaapLoop();
                return;
            }

            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            if (caap.domain.which >= 0 && caap.domain.which < 2) {
                accountEl = $j('#navAccountName');
                if ($u.hasContent(accountEl)) {
                    FBID = $u.setContent(accountEl.attr('href'), 'id=0').regex(/id=(\d+)/i);
                    if ($u.isNumber(FBID) && FBID > 0) {
                        caap.stats['FBID'] = FBID;
                        idOk = true;
                    }
                }

                if (!idOk) {
                    FBID = $u.setContent($j('script').text(), 'user:0,').regex(new RegExp('[\\s"]*?user[\\s"]*?:(\\d+),', 'i'));
                    if ($u.isNumber(FBID) && FBID > 0) {
                        caap.stats['FBID'] = FBID;
                        idOk = true;
                    }

                    if (!idOk) {
                        FBID = $u.setContent(window.presence.user, '0').parseInt();
                        if ($u.isNumber(FBID) && FBID > 0) {
                            caap.stats['FBID'] = FBID;
                            idOk = true;
                        }
                    }
                }
            } else {
                accountEl = $j("img[src*='graph.facebook.com']");
                FBID = $u.setContent(accountEl.attr("src"), "facebook.com/0/").regex(new RegExp("facebook.com\\/(\\d+)\\/"));
                if ($u.isNumber(FBID) && FBID > 0) {
                    caap.stats['FBID'] = FBID;
                    idOk = true;
                }
            }
            /*jslint sub: false */

            if (!idOk) {
                // Force reload without retrying
                $u.error('No Facebook UserID!!! Reloading ...', FBID, window.location.href);
                window.setTimeout(function () {
                    var newdiv = document.createElement('div');
                    newdiv.innerHTML = "<p>CAAP will retry shortly!</p>";
                    document.body.appendChild(newdiv);
                    window.setTimeout(function () {
                        $u.reload();
                    }, 60000 + (Math.floor(Math.random() * 60) * 1000));
                }, delay);

                return;
            }

            gm.set_storage_id(FBID.toString());
            ss.set_storage_id(FBID.toString());
            config.load();
            $u.set_log_level(config.getItem('DebugLevel', $u.get_log_level()));
            css.addCSS();
            caap.lsUsed();
            schedule.load();
            state.load();
            caap.loadStats(FBID, $u.setContent(accountEl.text(), ''));
            gifting.init();
            gifting.loadCurrent();
            state.setItem('clickUrl', window.location.href);
            schedule.setItem('clickedOnSomething', 0);

            /////////////////////////////////////////////////////////////////////
            //                          http://code.google.com/ updater
            // Used by browsers other than Chrome (namely Firefox and Flock)
            // to get updates from http://code.google.com/
            /////////////////////////////////////////////////////////////////////

            if ($u.is_firefox) {
                if (devVersion === 0) {
                    caap.releaseUpdate();
                } else {
                    caap.devUpdate();
                }
            }

            /////////////////////////////////////////////////////////////////////
            // Put code to be run once to upgrade an old version's variables to
            // new format or such here.
            /////////////////////////////////////////////////////////////////////

            if (devVersion > 0) {
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

            if (caap.domain.which === 0 || caap.domain.which === 2) {
                state.setItem('caapPause', 'none');
                state.setItem('ReleaseControl', true);
                window.setTimeout(caap.init, 200);
            }

            mainCaapLoop();
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        lsUsed: function () {
            try {
                var used = {
                        'ffmode' : false,
                        'match'  : 0,
                        'total'  : 0
                    },
                    perc = {
                        caap  : 0,
                        total : 0
                    },
                    msg = '';

                used = gm.used();
                if (!used['ffmode']) {
                    perc.caap = ((used['match'] * 2.048 / 5242880) * 100).dp();
                    $u.log(1, "CAAP localStorage used: " + perc.caap + "%");
                    perc.total = ((used['total'] * 2.048 / 5242880) * 100).dp();
                    if (perc.total >= 90) {
                        $u.warn("Total localStorage used: " + perc.total + "%");
                        msg = "<div style='text-align: center;'>";
                        msg += "<span style='color: red; font-size: 14px; font-weight: bold;'>WARNING!</span><br />";
                        msg += "localStorage usage for domain: " + perc.total + "%<br />";
                        msg += "CAAP is using: " + perc.total + "%";
                        msg += "</div>";
                        window.setTimeout(function () {
                            $j().alert(msg);
                        }, 5000);
                    } else {
                        $u.log(1, "Total localStorage used: " + perc.total + "%");
                    }
                } else {
                    $u.log(1, "CAAP GM storage used (chars): " + used['match']);
                    $u.log(1, "GM storage used (chars): " + used['total']);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in release lsUsed: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        incrementPageLoadCounter: function () {
            try {
                caap.pageLoadCounter += 1;
                $u.log(4, "pageLoadCounter", caap.pageLoadCounter);
                return caap.pageLoadCounter;
            } catch (err) {
                $u.error("ERROR in incrementPageLoadCounter: " + err);
                return undefined;
            }
        },

        releaseUpdate: function () {
            try {
                caap.newVersionAvailable = state.getItem('SUC_remote_version', 0) > caapVersion ? true : false;
                // update script from: http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js
                function updateCheck(forced) {
                    if (forced || schedule.check('SUC_last_update')) {
                        try {
                            /*jslint newcap: false */
                            GM_xmlhttpRequest({
                            /*jslint newcap: true */
                                method: 'GET',
                                url: 'http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js',
                                headers: {'Cache-Control': 'no-cache'},
                                onload: function (resp) {
                                    var remote_version = resp.responseText.match(new RegExp("@version\\s*(.*?)\\s*$", "m"))[1],
                                        script_name    = resp.responseText.match(new RegExp("@name\\s*(.*?)\\s*$", "m"))[1];

                                    schedule.setItem('SUC_last_update', 86400000);
                                    state.setItem('SUC_target_script_name', script_name);
                                    state.setItem('SUC_remote_version', remote_version);
                                    $u.log(1, 'Remote version ', remote_version);
                                    if (remote_version > caapVersion) {
                                        caap.newVersionAvailable = true;
                                        if (forced && confirm('There is an update available for the Greasemonkey script "' + script_name + '."\nWould you like to go to the install page now?')) {
                                            /*jslint newcap: false */
                                            GM_openInTab('http://senses.ws/caap/index.php?topic=771.msg3582#msg3582');
                                            /*jslint newcap: true */
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

                /*jslint newcap: false */
                GM_registerMenuCommand(state.getItem('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
                /*jslint newcap: true */
                    updateCheck(true);
                });

                updateCheck(false);
            } catch (err) {
                $u.error("ERROR in release updater: " + err);
            }
        },

        devUpdate: function () {
            try {
                caap.newVersionAvailable = state.getItem('SUC_remote_version', 0) > caapVersion || (state.getItem('SUC_remote_version', 0) >= caapVersion && state.getItem('DEV_remote_version', 0) > devVersion) ? true : false;
                // update script from: http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js
                function updateCheck(forced) {
                    if (forced || schedule.check('SUC_last_update')) {
                        try {
                            /*jslint newcap: false */
                            GM_xmlhttpRequest({
                            /*jslint newcap: true */
                                method: 'GET',
                                url: 'http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js',
                                headers: {'Cache-Control': 'no-cache'},
                                onload: function (resp) {
                                    var remote_version = resp.responseText.match(new RegExp("@version\\s*(.*?)\\s*$", "m"))[1],
                                        dev_version    = resp.responseText.match(new RegExp("@dev\\s*(.*?)\\s*$", "m"))[1],
                                        script_name    = resp.responseText.match(new RegExp("@name\\s*(.*?)\\s*$", "m"))[1];

                                    schedule.setItem('SUC_last_update', 86400000);
                                    state.setItem('SUC_target_script_name', script_name);
                                    state.setItem('SUC_remote_version', remote_version);
                                    state.setItem('DEV_remote_version', dev_version);
                                    $u.log(1, 'Remote version ', remote_version, dev_version);
                                    if (remote_version > caapVersion || (remote_version >= caapVersion && dev_version > devVersion)) {
                                        caap.newVersionAvailable = true;
                                        if (forced && confirm('There is an update available for the Greasemonkey script "' + script_name + '."\nWould you like to go to the install page now?')) {
                                            /*jslint newcap: false */
                                            GM_openInTab('http://code.google.com/p/castle-age-auto-player/updates/list');
                                            /*jslint newcap: true */
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

                /*jslint newcap: false */
                GM_registerMenuCommand(state.getItem('SUC_target_script_name', '???') + ' - Manual Update Check', function () {
                /*jslint newcap: true */
                    updateCheck(true);
                });

                updateCheck(false);
            } catch (err) {
                $u.error("ERROR in development updater: " + err);
            }
        },

        injectCATools: function () {
            $u.injectScript("http://cage.northcornwall.com/hoots/catbox.asp");
        },

        init: function () {
            try {
                caap.ajaxLoadIcon = $j('#' + caap.domain.id[caap.domain.which] + 'AjaxLoadIcon');
                if (caap.domain.which === 0 && config.getItem('backgroundCA', false)) {
                    $j("body").css({
                        'background-image'    : "url('http://image4.castleagegame.com/graphics/guild_webpage_bg.jpg')",
                        'background-position' : 'center top',
                        'background-repeat'   : 'no-repeat',
                        'background-color'    : 'black',
                        'margin'              : '0px'
                    });

                    $j(".UIStandardFrame_Container").css({
                        'margin'              : '0px auto 0px'
                    });

                    $j(".UIStandardFrame_Content").css({
                        'background-image'    : "url('http://image4.castleagegame.com/graphics/ws_middle.jpg')",
                        'padding'             : '0px 10px'
                    });

                    $j("#pagelet_canvas_footer_content").css({
                        'display'    : 'none'
                    });
                }

                caap.controlXY.selector = caap.domain.which === 0 ? ".UIStandardFrame_Content" : "#globalcss";
                caap.dashboardXY.selector = "#" + caap.domain.id[caap.domain.which] + "app_body_container";
                state.setItem(caap.friendListType.gifta.name + 'Requested', false);
                state.setItem(caap.friendListType.giftc.name + 'Requested', false);
                state.setItem(caap.friendListType.facebook.name + 'Requested', false);
                if (caap.domain.which === 0) {
                    // Get rid of those ads now! :P
                    if (config.getItem('HideAds', false)) {
                        $j('.UIStandardFrame_SidebarAds').css('display', 'none');
                    }

                    if (config.getItem('HideAdsIframe', false)) {
                        $j("iframe[name*='fb_iframe']").eq(0).parent().css('display', 'none');
                        //$j("img[src*='apple_banner_']").parent().parent().css('display', 'none');
                        $j("div[style*='tool_top.jpg']").css('display', 'none');
                    }

                    if (config.getItem('HideFBChat', false)) {
                        window.setTimeout(function () {
                            $j("div[class*='fbDockWrapper fbDockWrapperBottom fbDockWrapperRight']").css('display', 'none');
                        }, 100);
                    }
                }

                // Can create a blank space above the game to host the dashboard if wanted.
                // Dashboard currently uses '185px'
                var shiftDown = gm.getItem('ShiftDown', '', hiddenVar);
                if ($u.hasContent(shiftDown)) {
                    $j(caap.controlXY.selector).css('padding-top', shiftDown);
                }

                general.load();
                monster.load();
                guild_monster.load();
                //arena.load();
                battle.load();
                caap.loadDemi();
                caap.loadRecon();
                town.load('soldiers');
                town.load('item');
                town.load('magic');
                army.init();
                spreadsheet.load();
                caap.addControl();
                caap.addDashboard();
                caap.addListeners();
                caap.addDBListener();
                caap.checkResults();
                caap.autoStatCheck();
                caap.bestLand = new caap.landRecord().data;
                caap.sellLand = {};
                if (caap.domain.which === 0 && config.getItem('injectCATools', false)) {
                    caap.injectCATools();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in init: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          NAVIGATION FUNCTIONS
        /////////////////////////////////////////////////////////////////////

        waitTime: 5000,

        visitUrl: function (url, loadWaitTime) {
            try {
                if (!$u.hasContent(url)) {
                    throw 'No url passed to visitUrl';
                }

                caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
                if (!state.getItem('clickUrl', '').hasIndexOf(url)) {
                    state.setItem('clickUrl', url);
                }

                if (caap.waitingForDomLoad === false) {
                    schedule.setItem('clickedOnSomething', 0);
                    caap.waitingForDomLoad = true;
                }

                if (!config.getItem('bookmarkMode', false)) {
                    window.location.href = url;
                }

                return true;
            } catch (err) {
                $u.error("ERROR in caap.visitUrl: " + err);
                return false;
            }
        },

        click: function (obj, loadWaitTime) {
            try {
                if (!$u.hasContent(obj)) {
                    throw 'Null object passed to Click';
                }

                caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
                if (caap.waitingForDomLoad === false) {
                    schedule.setItem('clickedOnSomething', 0);
                    caap.waitingForDomLoad = true;
                }

                var evt = document.createEvent("MouseEvents");
                evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
                /*
                Return Value: boolean
                The return value of dispatchEvent indicates whether any of the listeners
                which handled the event called preventDefault. If preventDefault was called
                the value is false, else the value is true.
                */
                return !(obj.jquery ? obj.get(0) : obj).dispatchEvent(evt);
            } catch (err) {
                $u.error("ERROR in caap.click: " + err);
                return undefined;
            }
        },

        clickAjaxLinkSend: function (link, loadWaitTime) {
            try {
                if (!$u.hasContent(link)) {
                    throw 'No link passed to clickAjaxLinkSend';
                }

                caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
                if (!state.getItem('clickUrl', '').hasIndexOf(link)) {
                    state.setItem('clickUrl', caap.domain.link + '/' + link);
                }

                if (caap.waitingForDomLoad === false) {
                    schedule.setItem('clickedOnSomething', 0);
                    caap.waitingForDomLoad = true;
                }

                var jss = "javascript";
                window.location.href = jss + ":void(" + caap.domain.ajax[caap.domain.which] + "ajaxLinkSend('globalContainer', '" + link + "'))";
                return true;
            } catch (err) {
                $u.error("ERROR in caap.clickAjaxLinkSend: " + err);
                return false;
            }
        },

        clickGetCachedAjax: function (link, loadWaitTime) {
            try {
                if (!$u.hasContent(link)) {
                    throw 'No link passed to clickGetCachedAjax';
                }

                caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
                if (!state.getItem('clickUrl', '').hasIndexOf(link)) {
                    state.setItem('clickUrl', caap.domain.link + '/' + link);
                }

                if (caap.waitingForDomLoad === false) {
                    schedule.setItem('clickedOnSomething', 0);
                    caap.waitingForDomLoad = true;
                }

                var jss = "javascript";
                window.location.href = jss + ":void(" + caap.domain.ajax[caap.domain.which] + "get_cached_ajax('" + link + "', 'get_body'))";
                return true;
            } catch (err) {
                $u.error("ERROR in caap.clickGetCachedAjax: " + err);
                return false;
            }
        },

        navigateTo: function (pathToPage, imageOnPage, webSlice) {
            try {
                webSlice = $u.setContent(webSlice, caap.globalContainer);
                if (!$u.hasContent(webSlice)) {
                    $u.warn('No content to Navigate to', imageOnPage, pathToPage);
                    return false;
                }

                if ($u.hasContent(imageOnPage) && caap.hasImage(imageOnPage, webSlice)) {
                    $u.log(3, 'Image found on page', imageOnPage);
                    return false;
                }

                var pathList = $u.hasContent(pathToPage) ? pathToPage.split(",") : [],
                    s        = 0,
                    jq       = $j(),
                    path     = '';

                for (s = pathList.length - 1; s >= 0; s -= 1) {
                    path = $u.setContent(pathList[s], '');
                    if (!$u.hasContent(path)) {
                        $u.warn('pathList had no content!', pathList[s]);
                        continue;
                    }

                    jq = $j("a[href*='" + path + ".php']", webSlice).not("a[href*='" + path + ".php?']", webSlice);
                    if ($u.hasContent(jq)) {
                        $u.log(2, 'Go to', path);
                    } else {
                        jq = caap.checkForImage(path.hasIndexOf(".") ? path : path + '.', webSlice);
                        if ($u.hasContent(jq)) {
                            $u.log(2, 'Click on image', jq.attr("src").basename());
                        }
                    }

                    if ($u.hasContent(jq)) {
                        caap.click(jq);
                        return true;
                    } else {
                        $u.log(3, 'No anchor or image found', path);
                    }
                }

                $u.warn('Unable to Navigate to', imageOnPage, pathToPage);
                return false;
            } catch (err) {
                $u.error("ERROR in caap.navigateTo: " + err, imageOnPage, pathToPage);
                return undefined;
            }
        },

        checkForImage: function (image, webSlice, subDocument, nodeNum) {
            try {
                webSlice = $u.setContent(webSlice, $u.setContent(subDocument, window.document).body);
                //webSlice = webSlice.jquery ? webSlice : $j(webSlice);
                return $j("input[src*='" + image + "'],img[src*='" + image + "'],div[style*='" + image + "']", webSlice).eq($u.setContent(nodeNum, 0));
            } catch (err) {
                $u.error("ERROR in caap.checkForImage: " + err);
                return undefined;
            }
        },

        hasImage: function (image, webSlice, subDocument, nodeNum) {
            try {
                return $u.hasContent(caap.checkForImage(image, webSlice, subDocument, nodeNum));
            } catch (err) {
                $u.error("ERROR in caap.hasImage: " + err);
                return undefined;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          DISPLAY FUNCTIONS
        // these functions set up the control applet and allow it to be changed
        /////////////////////////////////////////////////////////////////////

        chatLink: function (slice, query) {
            try {
                var hr = new RegExp('.*(http:.*)'),
                    qr = /"/g;

                $j(query, slice).each(function () {
                    var e = $j(this),
                        h = '',
                        t = '',
                        a = [];

                    h = e.html();
                    a = $u.hasContent(h) ? h.trim().split("<br>") : [];
                    t = $u.hasContent(a[1]) ? a[1].replace(qr, '').regex(hr) : '';
                    a = $u.hasContent(t) ? t.split(" ") : [];
                    t = $u.hasContent(a) ? h.replace(a[0], "<a href='" + a[0] + "'>" + a[0] + "</a>") : '';
                    if ($u.hasContent(t)) {
                        e.html(t);
                    }
                });

                return true;
            } catch (err) {
                $u.error("ERROR in caap.chatLink: " + err);
                return false;
            }
        },

        makeDropDown: function (idName, dropDownList, instructions, formatParms, defaultValue, css) {
            try {
                var selectedItem = config.getItem(idName, 'defaultValue'),
                    id           = idName ? " id='caap_" + idName + "'" : '',
                    title        = '',
                    htmlCode     = '',
                    item         = 0,
                    len          = 0;

                selectedItem = selectedItem !== 'defaultValue' ? selectedItem : (config.setItem(idName, $u.setContent(defaultValue, dropDownList[0])));
                len = dropDownList.length;
                for (item = 0; item < len; item += 1) {
                    if (selectedItem === dropDownList[item]) {
                        break;
                    }
                }

                title = instructions[item] ? " title='" + instructions[item].escapeHTML() + "'" : '';
                css = css ? " style='" + css + "'" : '';
                formatParms = formatParms ? ' ' + formatParms : '';
                htmlCode = "<select class='caap_ff caap_fs caap_ww'" + id + css + title + formatParms + ">";
                htmlCode += "<option disabled='disabled' value='not selected'>Choose one</option>";
                for (item = 0; item < len; item += 1) {
                    title = instructions[item] ? " title='" + instructions[item].escapeHTML() + "'" : '';
                    htmlCode += "<option value='" + dropDownList[item] + "'" + (selectedItem === dropDownList[item] ? " selected='selected'" : '') + title + ">" + dropDownList[item] + "</option>";
                }

                htmlCode += "</select>";
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in makeDropDown: " + err);
                return '';
            }
        },

        startTR: function (id, css) {
            try {
                id = id ? " id='" + id  + "'" : '';
                css = css ? " style='" + css + "'" : '';
                return "<div class='caap_ff caap_fn caap_ww'" + id + css + ">";
            } catch (err) {
                $u.error("ERROR in startTR: " + err);
                return '';
            }
        },

        endTR: "</div>",

        makeTD: function (text, indent, right, css) {
            try {
                css = css ? " style='" + css + "'" : '';
                var cls = " class='caap_ff caap_fn" + (indent ? " caap_in" : '') + (right ? " caap_tr" : '') + "'";
                return "<div" + cls + css + ">" + text + "</div>";
            } catch (err) {
                $u.error("ERROR in makeTD: " + err);
                return '';
            }
        },

        makeSlider: function (text, id, inst, defaultValue, indent) {
            try {
                var value = config.getItem(id, 'defaultValue'),
                    html  = "<div class='caap_ff caap_fn caap_ww' id='caap_" + id + "'>";

                value = value !== 'defaultValue' ? value : config.setItem(id, $u.setContent(defaultValue, 1));
                html += '<div style="width: ' + (indent ? "42%;padding-left: 5%;" : "47%") + ';display: inline-block;">' + text + '</div>';
                html += "<div style='width: 45%;padding-right: 5%;display: inline-block;' id='caap_" + id + "_slider' title='" + inst.escapeHTML() + "'></div>";
                html += "</div>";

                return html;
            } catch (err) {
                $u.error("ERROR in makeTD: " + err);
                return '';
            }
        },

        makeSliderListener: function (id, min, max, step, defaultValue, opacity) {
            try {
                $j("#caap_" + id + "_slider", caap.caapDivObject).slider({
                    orientation : "horizontal",
                    range       : "min",
                    min         : min,
                    max         : max,
                    step        : step,
                    value       : config.getItem(id, defaultValue),
                    slide       : function (event, ui) {
                        if (opacity) {
                            state.setItem(id.replace("Cust", ''), config.setItem(id, ui.value));
                            caap.colorUpdate();
                        } else {
                            config.setItem(id, ui.value);
                        }
                    }
                });

                return true;
            } catch (err) {
                $u.error("ERROR in makeTD: " + err);
                return false;
            }
        },

        makeCheckBox: function (idName, defaultValue, instructions, css) {
            try {
                var id    = idName ? " id='caap_" + idName  + "'" : '',
                    title = instructions ? " title='" + instructions.escapeHTML() + "'" : '',
                    check = config.getItem(idName, 'defaultValue');

                check = check !== 'defaultValue' ? check : config.setItem(idName, $u.setContent(defaultValue, false));
                check = check ? " checked" : '';
                css = css ? " style='" + css + "'" : '';
                return "<input class='caap_ff caap_fn' type='checkbox'" + id + css + title + check + ' />';
            } catch (err) {
                $u.error("ERROR in makeCheckBox: " + err);
                return '';
            }
        },

        makeNumberForm: function (idName, instructions, initDefault, formatParms, subtype, css) {
            try {
                subtype = $u.setContent(subtype, 'number');
                css = $u.setContent(css, '');
                var value = config.getItem(idName, 'defaultValue'),
                    stNum = subtype === 'number',
                    id    = idName ? " id='caap_" + idName + "'" : '',
                    title = instructions ? " title='" + instructions.escapeHTML() + "'" : '',
                    type  = stNum ? " type='text' min='0' step='1'" : " type='text'";

                css += subtype === 'color' ? 'background-color:' + value + '; color:' + $u.bestTextColor(value) + ';' : '';
                css = css ? " style='" + css + "'" : '';
                subtype = subtype ? " data-subtype='" + subtype + "'" : '';
                initDefault = stNum && $u.isNumber(initDefault) ? initDefault : (stNum && $u.hasContent(initDefault) && $u.isString(initDefault) && !$u.isNaN(initDefault) ? initDefault.parseFloat() : (!stNum && $u.isString(initDefault) ? initDefault : ''));
                if (stNum && $u.hasContent(initDefault) && $u.isNaN(initDefault)) {
                    $u.warn("makeNumberForm - default value is not a number!", idName, initDefault);
                }

                value = value !== 'defaultValue' ? value : config.setItem(idName, initDefault);
                formatParms = $u.setContent(formatParms, '');
                return "<input class='caap_ff caap_fs caap_tr caap_ww'" + type + subtype + id + css + formatParms + title + " value='" + value + "' />";
            } catch (err) {
                $u.error("ERROR in makeNumberForm: " + err);
                return '';
            }
        },

        makeCheckTR: function (text, idName, defaultValue, instructions, indent, right, css) {
            try {
                var htmlCode = '';
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD(text, indent, right, "width: " + (indent ? 85 : 90) + "%; display: inline-block;");
                htmlCode += caap.makeTD(caap.makeCheckBox(idName, defaultValue, instructions, css), false, true, "width: 10%; display: inline-block;");
                htmlCode += caap.endTR;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in makeCheckTR: " + err);
                return '';
            }
        },

        startCheckHide: function (idName, not) {
            try {
                var id  = idName ? " id='caap_" + idName + (not ? "_not" : '') + "_hide'" : '',
                    css = " style='display: " + (config.getItem(idName, false) ? (not ? 'none' : 'block') : (not ? 'block' : 'none')) + ";'";

                return "<div class='caap_ff caap_fn caap_ww'" + id + css + ">";
            } catch (err) {
                $u.error("ERROR in startCheckHide: " + err);
                return '';
            }
        },

        endCheckHide: function () {
            try {
                return "</div>";
            } catch (err) {
                $u.error("ERROR in endCheckHide: " + err);
                return '';
            }
        },

        makeNumberFormTR: function (text, idName, instructions, initDefault, formatParms, subtype, indent, right, width) {
            try {
                indent = $u.setContent(indent, false);
                right = $u.setContent(right, false);
                width = $u.setContent(width, 30);
                var htmlCode = '';
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD(text, indent, right, "width: " + (indent ? 92 - width : 97 - width) + "%; display: inline-block;");
                htmlCode += caap.makeTD(caap.makeNumberForm(idName, instructions, initDefault, formatParms, subtype, ''), false, true, "width: " + width + "%; display: inline-block;");
                htmlCode += caap.endTR;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in makeNumberFormTR: " + err);
                return '';
            }
        },

        makeDropDownTR: function (text, idName, dropDownList, instructions, formatParms, defaultValue, indent, right, width, css) {
            try {
                var htmlCode = '';
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD(text, indent, right, "width: " + (indent ? 95 - width : 100 - width) + "%; display: inline-block;");
                htmlCode += caap.makeTD(caap.makeDropDown(idName, dropDownList, instructions, formatParms, defaultValue, css), false, true, "width: " + width + "%; display: inline-block;");
                htmlCode += caap.endTR;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in makeDropDownTR: " + err);
                return '';
            }
        },

        startDropHide: function (idName, idPlus, test, not) {
            try {
                var value  = config.getItem(idName, 'Never'),
                    result = not ? value !== test : value === test,
                    id     = " id='caap_" + idName + idPlus + "_hide'",
                    css    = " style='display: " + (result ? 'block' : 'none') + ";'";

                return "<div class='caap_ff caap_fn caap_ww'" + id + css + ">";
            } catch (err) {
                $u.error("ERROR in startDropHide: " + err);
                return '';
            }
        },

        endDropHide: function () {
            try {
                return "</div>";
            } catch (err) {
                $u.error("ERROR in endDropHide: " + err);
                return '';
            }
        },

        startToggle: function (controlId, staticText) {
            try {
                var currentDisplay = state.getItem('Control_' + controlId, "none"),
                    displayChar    = currentDisplay === "none" ? "+" : "-",
                    style = "font-family: 'lucida grande', tahoma, verdana, arial, sans-serif; font-size: 11px;",
                    toggleCode     = '';

                toggleCode += '<a style=\"font-weight: bold;' + style + '\" id="caap_Switch_' + controlId + '" href="javascript:;" style="text-decoration: none;"> ';
                toggleCode += displayChar + ' ' + staticText + '</a><br />' + "<div id='caap_" + controlId + "' style='display: " + currentDisplay + ";'>";
                return toggleCode;
            } catch (err) {
                $u.error("ERROR in startToggle: " + err);
                return '';
            }
        },

        endToggle: "<hr /></div>",

        makeTextBox: function (idName, instructions, initDefault) {
            try {
                initDefault = $u.setContent(initDefault, '');
                var style = "font-family: 'lucida grande', tahoma, verdana, arial, sans-serif; font-size: 11px;",
                    value = config.getItem(idName, 'defaultValue');

                value = value === 'defaultValue' ? config.setItem(idName, initDefault) : value;
                return "<textarea style=\"" + style + "\" title=" + '"' + instructions.escapeHTML() + '"' + " type='text' id='caap_" + idName + "' " + ($u.is_chrome ? " rows='3' cols='25'" : " rows='3' cols='21'") + ">" + value + "</textarea>";
            } catch (err) {
                $u.error("ERROR in makeTextBox: " + err);
                return '';
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        setDivContent: function (idName, mess) {
            try {
                if (config.getItem('SetTitle', false) && idName === "activity_mess") {
                    var DocumentTitle = config.getItem('SetTitleAction', false) ? mess.replace("Activity: ", '') + " - " : '';
                    DocumentTitle += config.getItem('SetTitleName', false) ? caap.stats['PlayerName'] + " - " : '';
                    document.title = DocumentTitle + caap.documentTitle;
                }

                $j('#caap_' + idName, caap.caapDivObject).html(mess);
            } catch (err) {
                $u.error("ERROR in setDivContent: " + err);
            }
        },
        /*jslint sub: false */

        landQuestList: [
            'Land of Fire',
            'Land of Earth',
            'Land of Mist',
            'Land of Water',
            'Demon Realm',
            'Undead Realm',
            'Underworld',
            'Kingdom of Heaven',
            'Ivory City',
            'Earth II',
            'Water II',
            'Mist II'
        ],

        demiQuestList: [
            'Ambrosia',
            'Malekus',
            'Corvintheus',
            'Aurora',
            'Azeron'
        ],

        atlantisQuestList: [
            'Atlantis'
        ],

        selectDropOption: function (idName, value) {
            try {
                $j("#caap_" + idName + " option", caap.caapDivObject).removeAttr('selected');
                $j("#caap_" + idName + " option[value='" + value + "']", caap.caapDivObject).attr('selected', 'selected');
                return true;
            } catch (err) {
                $u.error("ERROR in selectDropOption: " + err);
                return false;
            }
        },

        autoQuest: function () {
            this.data = {
                'name'     : '',
                'energy'   : 0,
                'general'  : 'none',
                'expRatio' : 0
            };
        },

        newAutoQuest: function () {
            return new caap.autoQuest().data;
        },

        updateAutoQuest: function (id, value) {
            try {
                if (!$u.isString(id) || !$u.hasContent(id)) {
                    throw "No valid id supplied!";
                }

                if (!$u.hasContent(value)) {
                    throw "No value supplied!";
                }

                var temp = state.getItem('AutoQuest', caap.newAutoQuest());
                temp[id] = value;
                state.setItem('AutoQuest', temp);
                return true;
            } catch (err) {
                $u.error("ERROR in updateAutoQuest: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        showAutoQuest: function () {
            try {
                $j("#stopAutoQuest", caap.caapDivObject).text("Stop auto quest: " + state.getItem('AutoQuest', caap.newAutoQuest())['name'] + " (energy: " + state.getItem('AutoQuest', caap.newAutoQuest())['energy'] + ")").css('display', 'block');
                return true;
            } catch (err) {
                $u.error("ERROR in showAutoQuest: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        clearAutoQuest: function () {
            try {
                $j("#stopAutoQuest", caap.caapDivObject).text("").css('display', 'none');
                return true;
            } catch (err) {
                $u.error("ERROR in clearAutoQuest: " + err);
                return false;
            }
        },

        manualAutoQuest: function (AutoQuest) {
            try {
                state.setItem('AutoQuest', $u.setContent(AutoQuest, caap.newAutoQuest()));
                caap.selectDropOption('WhyQuest', config.setItem('WhyQuest', 'Manual'));
                caap.clearAutoQuest();
                return true;
            } catch (err) {
                $u.error("ERROR in manualAutoQuest: " + err);
                return false;
            }
        },

        changeDropDownList: function (idName, dropList, option) {
            try {
                $j("#caap_" + idName + " option", caap.caapDivObject).remove();
                $j("#caap_" + idName, caap.caapDivObject).append("<option disabled='disabled' value='not selected'>Choose one</option>");
                for (var item = 0, len = dropList.length; item < len; item += 1) {
                    if (item === 0 && !option) {
                        config.setItem(idName, dropList[item]);
                        $u.log(1, "Saved: " + idName + "  Value: " + dropList[item]);
                    }

                    $j("#caap_" + idName, caap.caapDivObject).append("<option value='" + dropList[item] + "'>" + dropList[item] + "</option>");
                }

                if (option) {
                    $j("#caap_" + idName + " option[value='" + option + "']", caap.caapDivObject).attr('selected', 'selected');
                } else {
                    $j("#caap_" + idName + " option:eq(1)", caap.caapDivObject).attr('selected', 'selected');
                }

                return true;
            } catch (err) {
                $u.error("ERROR in changeDropDownList: " + err);
                return false;
            }
        },

        controlXY: {
            selector : '',
            x        : 0,
            y        : 0
        },

        getControlXY: function (reset, tools) {
            try {
                var selector  = $j(caap.controlXY.selector),
                        outer = selector.outerWidth(true),
                        xoff  = !tools && (caap.domain.which === 2 || (caap.domain.which === 0 && !config.getItem('backgroundCA', false))) ? outer + 10 : outer;

                return {
                    y: reset ? selector.offset().top : caap.controlXY.y,
                    x: caap.controlXY.x === '' || reset ? selector.offset().left + xoff : selector.offset().left + caap.controlXY.x
                };
            } catch (err) {
                $u.error("ERROR in getControlXY: " + err);
                return {x: 0, y: 0};
            }
        },

        saveControlXY: function () {
            try {
                state.setItem('caap_div_menuTop', caap.caapDivObject.offset().top);
                state.setItem('caap_div_menuLeft', caap.caapDivObject.offset().left - $j(caap.controlXY.selector).offset().left);
                state.setItem('caap_top_zIndex', '1');
                state.setItem('caap_div_zIndex', '2');
            } catch (err) {
                $u.error("ERROR in saveControlXY: " + err);
            }
        },

        dashboardXY: {
            selector : '',
            x        : 0,
            y        : 0
        },

        getDashboardXY: function (reset) {
            try {
                var selector = $j(caap.dashboardXY.selector);

                return {
                    y: reset ? selector.offset().top - 10 : caap.dashboardXY.y,
                    x: caap.dashboardXY.x === '' || reset ? selector.offset().left : selector.offset().left + caap.dashboardXY.x
                };
            } catch (err) {
                $u.error("ERROR in getDashboardXY: " + err);
                return {x: 0, y: 0};
            }
        },

        saveDashboardXY: function () {
            try {
                state.setItem('caap_top_menuTop', caap.caapTopObject.offset().top);
                state.setItem('caap_top_menuLeft', caap.caapTopObject.offset().left - $j(caap.dashboardXY.selector).offset().left);
                state.setItem('caap_div_zIndex', '1');
                state.setItem('caap_top_zIndex', '2');
            } catch (err) {
                $u.error("ERROR in saveDashboardXY: " + err);
            }
        },

        addControl: function () {
            try {
                var caapDiv  = "<div id='caap_div'>",
                    divID    = 0,
                    len      = 0,
                    styleXY  = {
                        x: 0,
                        y: 0
                    },
                    bgc = state.getItem('StyleBackgroundLight', '#E0C691'),
                    htmlCode = '',
                    banner   = '',
                    divList  = [
                        'banner',
                        'activity_mess',
                        'idle_mess',
                        'quest_mess',
                        'battle_mess',
                        'monster_mess',
                        'guild_monster_mess',
                        //'arena_mess',
                        'fortify_mess',
                        'heal_mess',
                        'demipoint_mess',
                        'gifting_mess',
                        'feats_mess',
                        'demibless_mess',
                        'level_mess',
                        'exp_mess',
                        'debug1_mess',
                        'debug2_mess',
                        'control'
                    ];

                for (divID = 0, len = divList.length; divID < len; divID += 1) {
                    caapDiv += "<div class='caap_ww' id='caap_" + divList[divID] + "'></div>";
                }

                caapDiv += "</div>";
                caap.controlXY.x = state.getItem('caap_div_menuLeft', '');
                caap.controlXY.y = state.getItem('caap_div_menuTop', $j(caap.controlXY.selector).offset().top);
                styleXY = caap.getControlXY();
                $j(caapDiv).css({
                    'font-family'           : "'lucida grande', tahoma, verdana, arial, sans-serif",
                    'font-size'             : '11px',
                    width                   : '180px',
                    background              : bgc,
                    opacity                 : state.getItem('StyleOpacityLight', 1),
                    color                   : $u.bestTextColor(bgc),
                    padding                 : "4px",
                    border                  : "2px solid #444",
                    top                     : styleXY.y + 'px',
                    left                    : styleXY.x + 'px',
                    zIndex                  : state.getItem('caap_div_zIndex', '2'),
                    position                : 'absolute',
                    '-moz-border-radius'    : '5px',
                    '-webkit-border-radius' : '5px',
                    'border-radius'         : '5px'
                }).appendTo(document.body);

                caap.caapDivObject = $j("#caap_div");

                banner += "<div id='caap_BannerDisplay_hide' style='display: " + (config.getItem('BannerDisplay', true) ? 'block' : 'none') + "'>";
                banner += "<img src='data:image/png;base64," + image64.header + "' alt='Castle Age Auto Player' /><br /><hr /></div>";
                caap.setDivContent('banner', banner);

                htmlCode += caap.addPauseMenu();
                htmlCode += caap.addDisableMenu();
                htmlCode += caap.addCashHealthMenu();
                htmlCode += caap.addQuestMenu();
                htmlCode += battle.menu();
                htmlCode += monster.menu();
                htmlCode += guild_monster.menu();
                //htmlCode += arena.menu();
                htmlCode += caap.addReconMenu();
                htmlCode += general.menu();
                htmlCode += caap.addSkillPointsMenu();
                htmlCode += caap.addEliteGuardOptionsMenu();
                htmlCode += army.menu();
                if (caap.domain.which === 0) {
                    htmlCode += gifting.menu();
                } else {
                    config.setItem("AutoGift", false);
                }

                htmlCode += caap.addAutoOptionsMenu();
                htmlCode += caap.addFestivalOptionsMenu();
                htmlCode += caap.addOtherOptionsMenu();
                htmlCode += caap.addFooterMenu();

                caap.setDivContent('control', htmlCode);

                caap.checkLastAction(state.getItem('LastAction', 'idle'));
                $j("input[type='button']", caap.caapDivObject).button();
                caap.makeSliderListener("CustStyleOpacityLight", 0.5, 1, 0.01, 1, true);
                caap.makeSliderListener("CustStyleOpacityDark", 0.5, 1, 0.01, 1, true);
                return true;
            } catch (err) {
                $u.error("ERROR in addControl: " + err);
                return false;
            }
        },

        addPauseMenu: function () {
            try {
                return "<div id='caapPaused' style='font-weight: bold; display: " + state.getItem('caapPause', 'block') + "'>Paused on mouse click.<br /><a href='javascript:;' id='caapRestart' >Click here to restart</a></div><hr />";
            } catch (err) {
                $u.error("ERROR in addPauseMenu: " + err);
                return '';
            }
        },

        addDisableMenu: function () {
            try {
                var autoRunInstructions = "Disable auto running of CAAP. Stays persistent even on page reload and the autoplayer will not autoplay.",
                    htmlCode = '';

                htmlCode += caap.makeCheckTR("Disable Autoplayer", 'Disabled', false, autoRunInstructions);
                htmlCode += '<hr />';
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addDisableMenu: " + err);
                return '';
            }
        },

        addCashHealthMenu: function () {
            try {
                var bankInstructions0 = "Minimum cash to keep in the bank. Press tab to save",
                    bankInstructions1 = "Minimum cash to have on hand, press tab to save",
                    bankInstructions2 = "Maximum cash to have on hand, bank anything above this, press tab to save (leave blank to disable).",
                    healthInstructions = "Minimum health to have before healing, press tab to save (leave blank to disable).",
                    healthStamInstructions = "Minimum Stamina to have before healing, press tab to save (leave blank to disable).",
                    bankImmedInstructions = "Bank as soon as possible. May interrupt player and monster battles.",
                    autobuyInstructions = "Automatically buy lands in groups of 10 based on best Return On Investment value.",
                    autosellInstructions = "Automatically sell off any excess lands above your level allowance.",
                    htmlCode = '';

                htmlCode = caap.startToggle('CashandHealth', 'CASH and HEALTH');
                htmlCode += caap.makeCheckTR("Bank Immediately", 'BankImmed', false, bankImmedInstructions);
                htmlCode += caap.makeCheckTR("Auto Buy Lands", 'autoBuyLand', false, autobuyInstructions);
                htmlCode += caap.makeCheckTR("Auto Sell Excess Lands", 'SellLands', false, autosellInstructions);
                htmlCode += caap.makeNumberFormTR("Keep In Bank", 'minInStore', bankInstructions0, 100000, '', '', false, false, 62);
                htmlCode += caap.makeNumberFormTR("Bank Above", 'MaxInCash', bankInstructions2, '', '', '', false, false, 40);
                htmlCode += caap.makeNumberFormTR("But Keep On Hand", 'MinInCash', bankInstructions1, '', '', '', true, false, 40);
                htmlCode += caap.makeNumberFormTR("Heal If Health Below", 'MinToHeal', healthInstructions, '', '', '');
                htmlCode += caap.makeNumberFormTR("Not If Stamina Below", 'MinStamToHeal', healthStamInstructions, '', '', '', true, false);
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addCashHealthMenu: " + err);
                return '';
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        addQuestMenu: function () {
            try {
                var forceSubGen = "Always do a quest with the Subquest General you selected under the Generals section. NOTE: This will keep the script from automatically switching to the required general for experience of primary quests.",
                    XQuestInstructions = "Start questing when energy is at or above this value.",
                    XMinQuestInstructions = "Stop quest when energy is at or below this value.",
                    questForList = [
                        'Advancement',
                        'Max Influence',
                        'Max Gold',
                        'Max Experience',
                        'Manual'
                    ],
                    questForListInstructions = [
                        'Advancement performs all the main quests in a sub quest area but not the secondary quests.',
                        'Max Influence performs all the main and secondary quests in a sub quest area.',
                        'Max Gold performs the quest in the specific area that yields the highest gold.',
                        'Max Experience performs the quest in the specific area that yields the highest experience.',
                        'Manual performs the specific quest that you have chosen.'
                    ],
                    questAreaList = [
                        'Quest',
                        'Demi Quests',
                        'Atlantis'
                    ],
                    questWhenList = [
                        'Energy Available',
                        'At Max Energy',
                        'At X Energy',
                        'Not Fortifying',
                        'Never'
                    ],
                    questWhenInst = [
                        'Energy Available - will quest whenever you have enough energy.',
                        'At Max Energy - will quest when energy is at max and will burn down all energy when able to level up.',
                        'At X Energy - allows you to set maximum and minimum energy values to start and stop questing. Will burn down all energy when able to level up.',
                        'Not Fortifying - will quest only when your fortify settings are matched.',
                        'Never - disables questing.'
                    ],
                    stopInstructions = "This will stop and remove the chosen quest and set questing to manual.",
                    autoQuestName = state.getItem('AutoQuest', caap.newAutoQuest())['name'],
                    htmlCode = '';

                htmlCode = caap.startToggle('Quests', 'QUEST');
                htmlCode += caap.makeDropDownTR("Quest When", 'WhenQuest', questWhenList, questWhenInst, '', 'Never', false, false, 62);
                htmlCode += caap.startDropHide('WhenQuest', '', 'Never', true);
                htmlCode += caap.startDropHide('WhenQuest', 'XEnergy', 'At X Energy', false);
                htmlCode += caap.makeNumberFormTR("Start At Or Above", 'XQuestEnergy', XQuestInstructions, 1, '', '', true, false);
                htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'XMinQuestEnergy', XMinQuestInstructions, 0, '', '', true, false);
                htmlCode += caap.endDropHide('WhenQuest', 'XEnergy');
                htmlCode += caap.makeDropDownTR("Quest Area", 'QuestArea', questAreaList, '', '', '', false, false, 62);
                switch (config.getItem('QuestArea', questAreaList[0])) {
                case 'Quest':
                    htmlCode += caap.makeDropDownTR("Sub Area", 'QuestSubArea', caap.landQuestList, '', '', '', false, false, 62);
                    break;
                case 'Demi Quests':
                    htmlCode += caap.makeDropDownTR("Sub Area", 'QuestSubArea', caap.demiQuestList, '', '', '', false, false, 62);
                    break;
                default:
                    htmlCode += caap.makeDropDownTR("Sub Area", 'QuestSubArea', caap.atlantisQuestList, '', '', '', false, false, 62);
                    break;
                }

                htmlCode += caap.makeDropDownTR("Quest For", 'WhyQuest', questForList, questForListInstructions, '', '', false, false, 62);
                htmlCode += caap.makeCheckTR("Switch Quest Area", 'switchQuestArea', true, 'Allows switching quest area after Advancement or Max Influence');
                htmlCode += caap.makeCheckTR("Use Only Subquest General", 'ForceSubGeneral', false, forceSubGen);
                htmlCode += caap.makeCheckTR("Quest For Orbs", 'GetOrbs', false, 'Perform the Boss quest in the selected land for orbs you do not have.');
                htmlCode += "<a id='stopAutoQuest' style='display: " + (autoQuestName ? "block" : "none") + "' href='javascript:;' title='" + stopInstructions + "'>";
                htmlCode += (autoQuestName ? "Stop auto quest: " + autoQuestName + " (energy: " + state.getItem('AutoQuest', caap.newAutoQuest())['energy'] + ")" : '');
                htmlCode += "</a>";
                htmlCode += caap.endDropHide('WhenQuest');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addQuestMenu: " + err);
                return '';
            }
        },
        /*jslint sub: false */

        addReconMenu: function () {
            try {
                // Recon Controls
                var PReconInstructions = "Enable player battle reconnaissance to run " +
                        "as an idle background task. Battle targets will be collected and" +
                        " can be displayed using the 'Target List' selection on the " +
                        "dashboard.",
                    PRRankInstructions = "Provide the number of ranks below you which" +
                        " recon will use to filter targets. This value will be subtracted" +
                        " from your rank to establish the minimum rank that recon will " +
                        "consider as a viable target. Default 3.",
                    PRLevelInstructions = "Provide the number of levels above you " +
                        "which recon will use to filter targets. This value will be added" +
                        " to your level to establish the maximum level that recon will " +
                        "consider as a viable target. Default 10.",
                    PRARBaseInstructions = "This value sets the base for your army " +
                        "ratio calculation. It is basically a multiplier for the army " +
                        "size of a player at your equal level. For example, a value of " +
                        ".5 means you will battle an opponent the same level as you with " +
                        "an army half the size of your army or less. Default 1.",
                    htmlCode = '';

                htmlCode += caap.startToggle('Recon', 'RECON');
                htmlCode += caap.makeCheckTR("Enable Player Recon", 'DoPlayerRecon', false, PReconInstructions);
                htmlCode += caap.startCheckHide('DoPlayerRecon');
                htmlCode += caap.makeNumberFormTR("Limit Target Records", 'LimitTargets', "Maximum number of records to hold.", 100, '', '');
                htmlCode += caap.makeTD('Find battle targets that are:');
                htmlCode += caap.makeNumberFormTR("Not Lower Than Rank Minus", 'ReconPlayerRank', PRRankInstructions, 3, '', '', true, false);
                htmlCode += caap.makeNumberFormTR("Not Higher Than Level Plus", 'ReconPlayerLevel', PRLevelInstructions, 10, '', '', true, false);
                htmlCode += caap.makeNumberFormTR("Not Higher Than X*Army", 'ReconPlayerARBase', PRARBaseInstructions, 1, '', '', true, false);
                htmlCode += caap.endCheckHide('DoPlayerRecon');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addReconMenu: " + err);
                return '';
            }
        },

        addSkillPointsMenu: function () {
            try {
                var statusInstructions = "Automatically increase attributes when " +
                        "upgrade skill points are available.",
                    statusAdvInstructions = "USE WITH CAUTION: You can use numbers or " +
                        "formulas(ie. level * 2 + 10). Variable keywords include energy, " +
                        "health, stamina, attack, defense, and level. JS functions can be " +
                        "used (Math.min, Math['max'], etc) !!!Remember your math class: " +
                        "'level + 20' not equals 'level * 2 + 10'!!!",
                    statImmedInstructions = "Update Stats Immediately",
                    statSpendAllInstructions = "If selected then spend all possible points and don't save for stamina upgrade.",
                    attrList = [
                        '',
                        'Energy',
                        'Attack',
                        'Defense',
                        'Stamina',
                        'Health'
                    ],
                    it = 0,
                    htmlCode = '';

                htmlCode += caap.startToggle('Status', 'UPGRADE SKILL POINTS');
                htmlCode += caap.makeCheckTR("Auto Add Upgrade Points", 'AutoStat', false, statusInstructions);
                htmlCode += caap.startCheckHide('AutoStat');
                htmlCode += caap.makeCheckTR("Spend All Possible", 'StatSpendAll', false, statSpendAllInstructions);
                htmlCode += caap.makeCheckTR("Upgrade Immediately", 'StatImmed', false, statImmedInstructions);
                htmlCode += caap.makeCheckTR("Advanced Settings <a href='http://userscripts.org/posts/207279' target='_blank' style='color: blue'>(INFO)</a>", 'AutoStatAdv', false, statusAdvInstructions);
                htmlCode += caap.startCheckHide('AutoStatAdv', true);
                for (it = 0; it < 5; it += 1) {
                    htmlCode += caap.startTR();
                    htmlCode += caap.makeTD("Increase", false, false, "width: 27%; display: inline-block;");
                    htmlCode += caap.makeTD(caap.makeDropDown('Attribute' + it, attrList, '', ''), false, false, "width: 40%; display: inline-block;");
                    htmlCode += caap.makeTD("to", false, false, "text-align: center; width: 10%; display: inline-block;");
                    htmlCode += caap.makeTD(caap.makeNumberForm('AttrValue' + it, statusInstructions, 0), false, true, "width: 20%; display: inline-block;");
                    htmlCode += caap.endTR;
                }

                htmlCode += caap.endCheckHide('AutoStatAdv', true);
                htmlCode += caap.startCheckHide('AutoStatAdv');
                for (it = 5; it < 10; it += 1) {
                    htmlCode += caap.startTR();
                    htmlCode += it === 5 ? caap.makeTD("Increase", false, false, "width: 25%; display: inline-block;") : caap.makeTD("Then", false, false, "width: 25%; display: inline-block;");
                    htmlCode += caap.makeTD(caap.makeDropDown('Attribute' + it, attrList, '', '', ''), false, false, "width: 45%; display: inline-block;");
                    htmlCode += caap.makeTD("using", true, false, "width: 25%; display: inline-block;");
                    htmlCode += caap.endTR;
                    htmlCode += caap.makeTD(caap.makeNumberForm('AttrValue' + it, statusInstructions, '', '', 'text', 'width: 97%;'));
                }

                htmlCode += caap.endCheckHide('AutoStatAdv');
                htmlCode += caap.endCheckHide('AutoStat');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addSkillPointsMenu: " + err);
                return '';
            }
        },

        addEliteGuardOptionsMenu: function () {
            try {
                // Other controls
                var autoEliteInstructions = "Enable or disable Auto Elite function. If running on web3 url then you must enable Army Functions also.",
                    autoEliteIgnoreInstructions = "Use this option if you have a small " +
                        "army and are unable to fill all 10 Elite positions. This prevents " +
                        "the script from checking for any empty places and will cause " +
                        "Auto Elite to run on its timer only.",
                    htmlCode = '';

                htmlCode += caap.startToggle('Elite', 'ELITE GUARD OPTIONS');
                htmlCode += caap.makeCheckTR('Auto Elite Army', 'AutoElite', false, autoEliteInstructions);
                htmlCode += caap.startCheckHide('AutoElite');
                htmlCode += caap.makeCheckTR('Timed Only', 'AutoEliteIgnore', false, autoEliteIgnoreInstructions);
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD("<input type='button' id='caap_resetElite' value='Do Now' style='padding: 0; font-size: 10px; height: 18px' />");
                htmlCode += caap.endTR;
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD(caap.makeTextBox('EliteArmyList', "Try these UserIDs first. Use ',' between each UserID", '', ''));
                htmlCode += caap.endTR;
                htmlCode += caap.endCheckHide('AutoElite');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addEliteGuardOptionsMenu: " + err);
                return '';
            }
        },

        addAutoOptionsMenu: function () {
            try {
                // Other controls
                var autoAlchemyInstructions1 = "AutoAlchemy will combine all recipes " +
                        "that do not have missing ingredients. By default, it will not " +
                        "combine Battle Hearts recipes.",
                    autoAlchemyInstructions2 = "If for some reason you do not want " +
                        "to skip Battle Hearts",
                    autoPotionsInstructions0 = "Enable or disable the auto consumption " +
                        "of energy and stamina potions.",
                    autoPotionsInstructions1 = "Number of stamina potions at which to " +
                        "begin consuming.",
                    autoPotionsInstructions2 = "Number of stamina potions to keep.",
                    autoPotionsInstructions3 = "Number of energy potions at which to " +
                        "begin consuming.",
                    autoPotionsInstructions4 = "Number of energy potions to keep.",
                    autoPotionsInstructions5 = "Do not consume potions if the " +
                        "experience points to the next level are within this value.",
                    autoBlessList = [
                        'None',
                        'Energy',
                        'Attack',
                        'Defense',
                        'Health',
                        'Stamina'
                    ],
                    autoBlessListInstructions = [
                        'None disables the auto bless feature.',
                        'Energy performs an automatic daily blessing with Ambrosia.',
                        'Attack performs an automatic daily blessing with Malekus.',
                        'Defense performs an automatic daily blessing with Corvintheus.',
                        'Health performs an automatic daily blessing with Aurora.',
                        'Stamina performs an automatic daily blessing with Azeron.'
                    ],
                    htmlCode = '';

                htmlCode += caap.startToggle('Auto', 'AUTO OPTIONS');
                htmlCode += caap.makeDropDownTR("Auto Bless", 'AutoBless', autoBlessList, autoBlessListInstructions, '', '', false, false, 62);
                htmlCode += caap.makeCheckTR('Auto Potions', 'AutoPotions', false, autoPotionsInstructions0);
                htmlCode += caap.startCheckHide('AutoPotions');
                htmlCode += caap.makeNumberFormTR("Spend Stamina At", 'staminaPotionsSpendOver', autoPotionsInstructions1, 39, '', '', true, false);
                htmlCode += caap.makeNumberFormTR("Keep Stamina", 'staminaPotionsKeepUnder', autoPotionsInstructions2, 35, '', '', true, false);
                htmlCode += caap.makeNumberFormTR("Spend Energy At", 'energyPotionsSpendOver', autoPotionsInstructions3, 39, '', '', true, false);
                htmlCode += caap.makeNumberFormTR("Keep Energy", 'energyPotionsKeepUnder', autoPotionsInstructions4, 35, '', '', true, false);
                htmlCode += caap.makeNumberFormTR("Wait If Exp. To Level", 'potionsExperience', autoPotionsInstructions5, 20, '', '', true, false);
                htmlCode += caap.endCheckHide('AutoPotions');
                htmlCode += caap.makeCheckTR('Auto Alchemy', 'AutoAlchemy', false, autoAlchemyInstructions1);
                htmlCode += caap.startCheckHide('AutoAlchemy');
                htmlCode += caap.makeCheckTR('Do Battle Hearts', 'AutoAlchemyHearts', false, autoAlchemyInstructions2, true);
                htmlCode += caap.endCheckHide('AutoAlchemy');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addAutoOptionsMenu: " + err);
                return '';
            }
        },

        addFestivalOptionsMenu: function () {
            try {
                // Other controls
                var festivalBlessList = [
                        'None',
                        'Energy',
                        'Attack',
                        'Defense',
                        'Health',
                        'Stamina',
                        'Army'
                    ],
                    htmlCode = '';

                htmlCode += caap.startToggle('Festival', 'FESTIVAL OPTIONS');
                htmlCode += caap.makeDropDownTR("Feats", 'festivalBless', festivalBlessList, '', '', '', false, false, 62);
                htmlCode += caap.makeCheckTR('Enable Tower', 'festivalTower', false, '');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addFestivalOptionsMenu: " + err);
                return '';
            }
        },

        addOtherOptionsMenu: function () {
            try {
                // Other controls
                var timeInstructions = "Use 24 hour format for displayed times.",
                    titleInstructions0 = "Set the title bar.",
                    titleInstructions1 = "Add the current action.",
                    titleInstructions2 = "Add the player name.",
                    hideAdsInstructions = "Hides the sidebar adverts.",
                    hideAdsIframeInstructions = "Hide the FaceBook Iframe adverts",
                    hideFBChatInstructions = "Hide the FaceBook Chat",
                    newsSummaryInstructions = "Enable or disable the news summary on the index page.",
                    bannerInstructions = "Uncheck if you wish to hide the CAAP banner.",
                    itemTitlesInstructions = "Replaces the CA item titles with more useful tooltips.",
                    goblinHintingInstructions = "When in the Goblin Emporium, CAAP will try to hide items that you require and fade those that may be required.",
                    ingredientsHideInstructions = "Hide the ingredients list on the Alchemy pages.",
                    alchemyShrinkInstructions = "Reduces the size of the item images and shrinks the recipe layout on the Alchemy pages.",
                    recipeCleanInstructions = "CAAP will try to hide recipes that are no longer required on the Alchemy page and therefore shrink the list further.",
                    recipeCleanCountInstructions = "The number of items to be owned before cleaning the recipe item from the Alchemy page.",
                    bookmarkModeInstructions = "Enable this if you are running CAAP from a bookmark. Disables refreshes and gifting. Note: not recommended for long term operation.",
                    levelupModeInstructions = "Calculates approx. how many XP points you will get from your current stamina and energy and when you have enough of each to level up it will start using them down to 0.",
                    serializeInstructions = "Setting this value allows you to define your Raids and Monsters all within either the Monster Attack Order or Raid Attack Order list boxes. Selection is serialized so that you only have a single selection from the list active at one time.  This is in contrast to the default mode, where you can have an active Raid and an active Monster, both processing independently.",
                    styleList = [
                        'CA Skin',
                        'Original',
                        'Custom',
                        'None'
                    ],
                    htmlCode = '';

                htmlCode += caap.startToggle('Other', 'OTHER OPTIONS');
                htmlCode += caap.makeCheckTR('Display Item Titles', 'enableTitles', true, itemTitlesInstructions);
                htmlCode += caap.makeCheckTR('Do Goblin Hinting', 'goblinHinting', true, goblinHintingInstructions);
                htmlCode += caap.makeCheckTR('Hide Recipe Ingredients', 'enableIngredientsHide', false, ingredientsHideInstructions);
                htmlCode += caap.makeCheckTR('Alchemy Shrink', 'enableAlchemyShrink', true, alchemyShrinkInstructions);
                htmlCode += caap.makeCheckTR('Recipe Clean-Up', 'enableRecipeClean', 1, recipeCleanInstructions);
                htmlCode += caap.startCheckHide('enableRecipeClean');
                htmlCode += caap.makeNumberFormTR("Recipe Count", 'recipeCleanCount', recipeCleanCountInstructions, 1, '', '', true);
                htmlCode += caap.endCheckHide('enableRecipeClean');
                htmlCode += caap.makeCheckTR('Display CAAP Banner', 'BannerDisplay', true, bannerInstructions);
                htmlCode += caap.makeCheckTR('Use 24 Hour Format', 'use24hr', true, timeInstructions);
                htmlCode += caap.makeCheckTR('Set Title', 'SetTitle', false, titleInstructions0);
                htmlCode += caap.startCheckHide('SetTitle');
                htmlCode += caap.makeCheckTR('Display Action', 'SetTitleAction', false, titleInstructions1, true);
                htmlCode += caap.makeCheckTR('Display Name', 'SetTitleName', false, titleInstructions2, true);
                htmlCode += caap.endCheckHide('SetTitle');
                htmlCode += caap.makeCheckTR('Auto Comma Text Areas', 'TextAreaCommas', false, "When enabled, text input areas will be automatically converted to comma seperation");
                if (caap.domain.which === 0) {
                    htmlCode += caap.makeCheckTR('Use CA Background', 'backgroundCA', false, '');
                    htmlCode += caap.makeCheckTR('Inject CA-Tools', 'injectCATools', false, 'EXPERIMENTAL: Injects the CA-Tools bookmarklet.');
                    htmlCode += caap.makeCheckTR('Hide Sidebar Adverts', 'HideAds', false, hideAdsInstructions);
                    htmlCode += caap.makeCheckTR('Hide FB Iframe Adverts', 'HideAdsIframe', false, hideAdsIframeInstructions);
                    htmlCode += caap.makeCheckTR('Hide FB Chat', 'HideFBChat', false, hideFBChatInstructions);
                }

                htmlCode += caap.makeCheckTR('Enable News Summary', 'NewsSummary', true, newsSummaryInstructions);
                htmlCode += caap.makeDropDownTR("Style", 'DisplayStyle', styleList, '', '', 'CA Skin', false, false, 62);
                htmlCode += caap.startDropHide('DisplayStyle', '', 'Custom');
                htmlCode += caap.makeTD("Running:");
                htmlCode += caap.makeNumberFormTR("Color", 'CustStyleBackgroundLight', '#FFFFFF', '#E0C691', '', 'color', true, false, 40);
                htmlCode += caap.makeSlider('Transparency', "CustStyleOpacityLight", '', 1, true);
                htmlCode += caap.makeTD("Paused:");
                htmlCode += caap.makeNumberFormTR("Color", 'CustStyleBackgroundDark', '#FFFFFF', '#B09060', '', 'color', true, false, 40);
                htmlCode += caap.makeSlider('Transparency', "CustStyleOpacityDark", '', 1, true);
                htmlCode += caap.endDropHide('DisplayStyle');
                if (caap.domain.which === 0) {
                    htmlCode += caap.startTR();
                    htmlCode += caap.makeTD("<input type='button' id='caap_FillArmy' value='Fill Army' style='padding: 0; font-size: 10px; height: 18px' />");
                    htmlCode += caap.endTR;
                }

                htmlCode += caap.makeCheckTR('Advanced', 'AdvancedOptions', false);
                htmlCode += caap.startCheckHide('AdvancedOptions');
                htmlCode += caap.makeCheckTR('Enable Level Up Mode', 'EnableLevelUpMode', true, levelupModeInstructions, true);
                htmlCode += caap.makeCheckTR('Serialize Raid and Monster', 'SerializeRaidsAndMonsters', false, serializeInstructions, true);
                htmlCode += caap.makeCheckTR('Bookmark Mode', 'bookmarkMode', false, bookmarkModeInstructions, true);
                htmlCode += caap.makeNumberFormTR("Reload Frequency", 'ReloadFrequency', 'Changing this will cause longer/shorter refresh rates. Minimum is 8 minutes.', 8, '', '', true, false);
                htmlCode += caap.makeNumberFormTR("Log Level", 'DebugLevel', '', 1, '', '', true, false);
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD("<input type='button' id='caap_ActionList' value='Modify Action Order' style='padding: 0; font-size: 10px; height: 18px' />");
                htmlCode += caap.endTR;
                htmlCode += "<form><fieldset><legend>Database</legend>";
                htmlCode += caap.makeDropDownTR("Which Data", 'DataSelect', caap.exportList(), '', '', 'Config', true, false, 50);
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD("<input type='button' id='caap_ExportData' value='Export' style='padding: 0; font-size: 10px; height: 18px' />", true, false, "display: inline-block;");
                htmlCode += caap.makeTD("<input type='button' id='caap_ImportData' value='Import' style='padding: 0; font-size: 10px; height: 18px' />", true, false, "display: inline-block;");
                htmlCode += caap.makeTD("<input type='button' id='caap_DeleteData' value='Delete' style='padding: 0; font-size: 10px; height: 18px' />", true, false, "display: inline-block;");
                htmlCode += caap.endTR;
                htmlCode += "</fieldset></form>";
                htmlCode += caap.endCheckHide('AdvancedOptions');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addOtherOptionsMenu: " + err);
                return '';
            }
        },

        addFooterMenu: function () {
            try {
                var htmlCode = '';
                htmlCode += caap.startTR();
                htmlCode += caap.makeTD("Unlock Menu <input type='button' id='caap_ResetMenuLocation' value='Reset' style='padding: 0; font-size: 10px; height: 18px' />", false, false, "width: 90%; display: inline-block;");
                htmlCode += caap.makeTD("<input type='checkbox' id='unlockMenu' />", false, true, "width: 10%; display: inline-block;");
                htmlCode += caap.endTR;

                if (!devVersion) {
                    htmlCode += caap.makeTD("Version: " + caapVersion + " - <a href='http://senses.ws/caap/index.php' target='_blank'>CAAP Forum</a>");
                    if (caap.newVersionAvailable) {
                        htmlCode += caap.makeTD("<a href='http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + state.getItem('SUC_remote_version') + "!</a>");
                    }
                } else {
                    htmlCode += caap.makeTD("Version: " + caapVersion + " d" + devVersion + " - <a href='http://senses.ws/caap/index.php' target='_blank'>CAAP Forum</a>");
                    if (caap.newVersionAvailable) {
                        htmlCode += caap.makeTD("<a href='http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + state.getItem('SUC_remote_version') + " d" + state.getItem('DEV_remote_version')  + "!</a>");
                    }
                }

                return htmlCode;
            } catch (err) {
                $u.error("ERROR in addFooterMenu: " + err);
                return '';
            }
        },

        /*-------------------------------------------------------------------------------------\
        dashDBDropDown is used to make our drop down boxes for dash board controls.  These require
        slightly different HTML from the side controls.
        \-------------------------------------------------------------------------------------*/
        dashDBDropDown: function (idName, dropDownList, instructions, formatParms) {
            try {
                var selectedItem = config.getItem(idName, 'defaultValue'),
                    htmlCode     = '',
                    item         = 0,
                    len          = 0;

                selectedItem = selectedItem !== 'defaultValue' ? selectedItem : config.setItem(idName, dropDownList[0]);
                htmlCode = " <select id='caap_" + idName + "' " + formatParms + "'><option>" + selectedItem;
                for (item = 0, len = dropDownList.length; item < len; item += 1) {
                    htmlCode += selectedItem !== dropDownList[item] ? "<option value='" + dropDownList[item] + "' " + ($u.hasContent(instructions[item]) ? " title='" + instructions[item] + "'" : '') + ">" + dropDownList[item] : '';
                }

                return htmlCode + '</select>';
            } catch (err) {
                $u.error("ERROR in dashDBDropDown: " + err);
                return '';
            }
        },

        addDashboard: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                 Here is where we construct the HTML for our dashboard. We start by building the outer
                 container and position it within the main container.
                \-------------------------------------------------------------------------------------*/
                var layout      = "<div id='caap_top'>",
                    displayList = ['Monster', 'Guild Monster', 'Target List', 'Battle Stats', 'User Stats', 'Generals Stats', 'Soldiers Stats', 'Item Stats', 'Magic Stats', 'Gifting Stats', 'Gift Queue', /*'Arena',*/ 'Army'],
                    styleXY = {
                        x: 0,
                        y: 0
                    },
                    bgc = state.getItem("StyleBackgroundLight", "#E0C961");

                /*-------------------------------------------------------------------------------------\
                 Next we put in our Refresh Monster List button which will only show when we have
                 selected the Monster display.
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonMonster' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Monster' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_refreshMonsters' value='Refresh Monster List' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 Next we put in our Refresh Guild Monster List button which will only show when we have
                 selected the Guild Monster display.
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonGuildMonster' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Guild Monster' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_refreshGuildMonsters' value='Refresh Guild Monster List' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 Next we put in the Clear Target List button which will only show when we have
                 selected the Target List display
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonTargets' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Target List' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_clearTargets' value='Clear Targets List' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 Next we put in the Clear Battle Stats button which will only show when we have
                 selected the Target List display
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonBattle' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Battle Stats' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_clearBattle' value='Clear Battle Stats' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 Next we put in the Clear Gifting Stats button which will only show when we have
                 selected the Target List display
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonGifting' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Gifting Stats' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_clearGifting' value='Clear Gifting Stats' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 Next we put in the Clear Gift Queue button which will only show when we have
                 selected the Target List display
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonGiftQueue' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Gift Queue' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_clearGiftQueue' value='Clear Gift Queue' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 Next we put in the Clear Gifting Stats button which will only show when we have
                 selected the Target List display
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonArmy' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Army' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_getArmy' value='Get Army' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 Next we put in the Advanced Sort Buttons which will only show when we have
                 selected the appropriate display
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonSortGenerals' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Generals Stats' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_sortGenerals' value='Advanced Sort' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                layout += "<div id='caap_buttonSortSoldiers' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Soldiers Stats' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_sortSoldiers' value='Advanced Sort' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                layout += "<div id='caap_buttonSortItem' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Item Stats' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_sortItem' value='Advanced Sort' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                layout += "<div id='caap_buttonSortMagic' style='position:absolute;top:0px;left:250px;display:" + (config.getItem('DBDisplay', 'Monster') === 'Magic Stats' ? 'block' : 'none') + "'>";
                layout += "<input type='button' id='caap_sortMagic' value='Advanced Sort' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 Then we put in the Live Feed link since we overlay the Castle Age link.
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonFeed' style='position:absolute;top:0px;left:10px;'><input id='caap_liveFeed' type='button' value='Live Feed' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 Then we put in the Live Feed link since we overlay the Castle Age link.
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_buttonCrusaders' style='position:absolute;top:0px;left:80px;'><input id='caap_crusaders' type='button' value='Crusaders' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 We install the display selection box that allows the user to toggle through the
                 available displays.
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_DBDisplay' style='font-size: 9px;position:absolute;top:0px;right:5px;'>Display: ";
                layout += caap.dashDBDropDown('DBDisplay', displayList, '', "style='font-size: 9px; min-width: 120px; max-width: 120px; width : 120px;'") + "</div>";
                /*-------------------------------------------------------------------------------------\
                And here we build our empty content divs.  We display the appropriate div
                depending on which display was selected using the control above
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_infoMonster' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Monster' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_guildMonster' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Guild Monster' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_infoTargets1' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Target List' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_infoBattle' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Battle Stats' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_userStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'User Stats' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_generalsStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Generals Stats' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_soldiersStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Soldiers Stats' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_itemStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Item Stats' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_magicStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Magic Stats' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_giftStats' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Gifting Stats' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_giftQueue' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Gift Queue' ? 'block' : 'none') + "'></div>";
                layout += "<div id='caap_army' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Army' ? 'block' : 'none') + "'></div>";
                //layout += "<div id='caap_arena' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Arena' ? 'block' : 'none') + "'></div>";
                layout += "</div>";
                /*-------------------------------------------------------------------------------------\
                 No we apply our CSS to our container
                \-------------------------------------------------------------------------------------*/
                caap.dashboardXY.x = state.getItem('caap_top_menuLeft', '');
                caap.dashboardXY.y = state.getItem('caap_top_menuTop', $j(caap.dashboardXY.selector).offset().top - 10);
                styleXY = caap.getDashboardXY();
                $j(layout).css({
                    'font-family'           : "'lucida grande', tahoma, verdana, arial, sans-serif",
                    'font-size'             : '11px',
                    background              : bgc,
                    color                   : $u.bestTextColor(bgc),
                    padding                 : "5px",
                    height                  : "185px",
                    width                   : "610px",
                    margin                  : "0 auto",
                    opacity                 : state.getItem('StyleOpacityLight', 1),
                    top                     : styleXY.y + 'px',
                    left                    : styleXY.x + 'px',
                    zIndex                  : state.getItem('caap_top_zIndex', 1),
                    position                : 'absolute',
                    '-moz-border-radius'    : '5px',
                    '-webkit-border-radius' : '5px',
                    'border-radius'         : '5px'
                }).appendTo(document.body);

                caap.caapTopObject = $j('#caap_top');
                $j("input[type='button']", caap.caapTopObject).button();
                return true;
            } catch (err) {
                $u.error("ERROR in addDashboard: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                      MONSTERS DASHBOARD
        // Display the current monsters and stats
        /////////////////////////////////////////////////////////////////////

        makeTh: function (obj) {
            var header = {text: '', color: '', bgcolor: '', id: '', title: '', width: ''},
                type   = " data-type='bestcolor'",
                html   = '<th';

            header = obj;
            type = $u.hasContent(header.color) ? '' : type;
            header.color = $u.setContent(header.color, $u.bestTextColor(state.getItem("StyleBackgroundLight", "#E0C961")));
            html += $u.hasContent(header.id) ? " id='" + header.id + "'" : '';
            html += $u.hasContent(header.title) ? " title='" + header.title + "'" : '';
            html += type + " style='color:" + header.color + ";font-size:10px;font-weight:bold;text-align:left;" + ($u.hasContent(header.bgcolor) ? "background-color:" + header.bgcolor + ";" : '') + ($u.hasContent(header.width) ? "width:" + header.width + ";" : '') + "'>" + header.text + "</th>";
            return html;
        },

        makeTd: function (obj) {
            var data = {text: '', color: '', bgcolor: '', id: '',  title: ''},
                type = " data-type='bestcolor'",
                html = '<td';

            data = obj;
            type = $u.hasContent(data.color) ? '' : type;
            data.color = $u.setContent(data.color, $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961")));
            html += $u.hasContent(data.id) ? " id='" + data.id + "'" : '';
            html += $u.hasContent(data.title) ? " title='" + data.title + "'" : '';
            html += type + " style='color:" + data.color + ";font-size:10px;text-align:left;" + ($u.hasContent(data.bgcolor) ? "background-color:" + data.bgcolor + ";" : '') + "'>" + data.text + "</td>";
            return html;
        },

        updateDashboardWaitLog: true,

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        updateDashboard: function (force) {
            try {
                if (caap.caapTopObject.length === 0) {
                    throw "We are missing the Dashboard div!";
                }

                if (!force && !schedule.oneMinuteUpdate('dashboard') && $j('#caap_infoMonster').html()) {
                    if (caap.updateDashboardWaitLog) {
                        $u.log(4, "Dashboard update is waiting on oneMinuteUpdate");
                        caap.updateDashboardWaitLog = false;
                    }

                    return false;
                }

                caap.updateDashboardWaitLog = true;
                $u.log(3, "Updating Dashboard");
                var html                     = '',
                    color                    = '',
                    value                    = 0,
                    headers                  = [],
                    values                   = [],
                    generalValues            = [],
                    townValues               = [],
                    pp                       = 0,
                    i                        = 0,
                    count                    = 0,
                    monsterObjLink           = '',
                    visitMonsterLink         = '',
                    visitMonsterInstructions = '',
                    removeLink               = '',
                    removeLinkInstructions   = '',
                    userIdLink               = '',
                    userIdLinkInstructions   = '',
                    id                       = '',
                    title                    = '',
                    monsterConditions        = '',
                    achLevel                 = 0,
                    maxDamage                = 0,
                    valueCol                 = 'red',
                    it                       = 0,
                    len                      = 0,
                    len1                     = 0,
                    len2                     = 0,
                    duration                 = 0,
                    str                      = '',
                    header                   = {text: '', color: '', bgcolor: '', id: '', title: '', width: ''},
                    data                     = {text: '', color: '', bgcolor: '', id: '', title: ''},
                    linkRegExp               = new RegExp("'(http.+)'"),
                    statsRegExp              = new RegExp("caap_.*Stats_"),
                    handler                  = null;

                if (config.getItem('DBDisplay', '') === 'Monster' && state.getItem("MonsterDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['Name', 'Damage', 'Damage%', 'Fort%', 'Stre%', 'TimeLeft', 'T2K', 'Phase', 'Link', '&nbsp;', '&nbsp;'];
                    values  = ['name', 'damage', 'life', 'fortify', 'strength', 'time', 't2k', 'phase', 'link'];
                    for (pp = 0, len = headers.length; pp < len; pp += 1) {
                        html += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: headers[pp] === 'Name' ? '30%' : ''});
                    }

                    html += '</tr>';
                    values.shift();
                    monster.records.forEach(function (monsterObj) {
                        html += "<tr>";
                        color = monsterObj['color'];
                        if (monsterObj['name'] === state.getItem('targetFromfortify', new monster.energyTarget().data)['name']) {
                            color = 'blue';
                        } else if (monsterObj['name'] === state.getItem('targetFrombattle_monster', '') || monsterObj['name'] === state.getItem('targetFromraid', '')) {
                            color = 'green';
                        }

                        monsterConditions = monsterObj['conditions'];
                        achLevel = monster.parseCondition('ach', monsterConditions);
                        maxDamage = monster.parseCondition('max', monsterConditions);
                        monsterObjLink = monsterObj['link'];
                        if (monsterObjLink) {
                            visitMonsterLink = monsterObjLink.replace("&action=doObjective", "").match(linkRegExp);
                            visitMonsterInstructions = "Clicking this link will take you to " + monsterObj['name'];
                            data = {
                                text  : '<span id="caap_monster_' + count + '" title="' + visitMonsterInstructions + '" mname="' + monsterObj['name'] + '" rlink="' + visitMonsterLink[1] +
                                        '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + monsterObj['name'] + '</span>',
                                color : 'blue',
                                id    : '',
                                title : ''
                            };

                            html += caap.makeTd(data);
                        } else {
                            html += caap.makeTd({text: monsterObj['name'], color: color, id: '', title: ''});
                        }

                        values.forEach(function (displayItem) {
                            id = "caap_" + displayItem + "_" + count;
                            title = '';
                            if (displayItem === 'phase' && color === 'grey') {
                                html += caap.makeTd({text: monsterObj['status'], color: color, id: '', title: ''});
                            } else {
                                value = monsterObj[displayItem];
                                if (value !== '' && (value >= 0 || value.length)) {
                                    if (!$u.isNaN(value) && value > 999) {
                                        value = value.addCommas();
                                    }

                                    switch (displayItem) {
                                    case 'damage' :
                                        if (achLevel) {
                                            title = "User Set Monster Achievement: " + achLevel.addCommas();
                                        } else if (config.getItem('AchievementMode', false)) {
                                            title = $u.hasContent(monster.info[monsterObj['type']]) && $u.isNumber(monster.info[monsterObj['type']].ach) ? "Default Monster Achievement: " + monster.info[monsterObj['type']].ach.addCommas() : '';
                                        } else {
                                            title = "Achievement Mode Disabled";
                                        }

                                        title += $u.hasContent(maxDamage) && $u.isNumber(maxDamage) ? " - User Set Max Damage: " + maxDamage.addCommas() : '';
                                        break;
                                    case 'time' :
                                        if ($u.hasContent(value) && value.length === 3) {
                                            value = value[0] + ":" + (value[1] < 10 ? '0' + value[1] : value[1]);
                                            duration = (monsterObj['page'] === 'festival_tower' ? (caap.festivalMonsterImgTable[monsterObj['fImg']] ? caap.festivalMonsterImgTable[monsterObj['fImg']].duration : 192) : (monster.info[monsterObj['type']] ? monster.info[monsterObj['type']].duration : 192));
                                            title = $u.hasContent(duration) ? "Total Monster Duration: " + duration + " hours" : '';
                                        } else {
                                            value = '';
                                        }

                                        break;
                                    case 't2k' :
                                        value = $u.minutes2hours(value);
                                        title = "Estimated Time To Kill: " + value + " hours:mins";
                                        break;
                                    case 'life' :
                                        title = "Percentage of monster life remaining: " + value + "%";
                                        break;
                                    case 'phase' :
                                        value = value + "/" + monster.info[monsterObj['type']].siege + " need " + monsterObj['miss'];
                                        title = "Siege Phase: " + value + " more clicks";
                                        break;
                                    case 'fortify' :
                                        title = "Percentage of party health/monster defense: " + value + "%";
                                        break;
                                    case 'strength' :
                                        title = "Percentage of party strength: " + value + "%";
                                        break;
                                    default :
                                    }

                                    html += caap.makeTd({text: value, color: color, id: id, title: title});
                                } else {
                                    html += caap.makeTd({text: '', color: color, id: '', title: ''});
                                }
                            }
                        });

                        if (monsterConditions && monsterConditions !== 'none') {
                            data = {
                                text  : '<span title="User Set Conditions: ' + monsterConditions + '" class="ui-icon ui-icon-info">i</span>',
                                color : 'blue',
                                id    : '',
                                title : ''
                            };

                            html += caap.makeTd(data);
                        } else {
                            html += caap.makeTd({text: '', color: color, id: '', title: ''});
                        }

                        if (monsterObjLink) {
                            removeLink = monsterObjLink.replace("casuser", "remove_list").replace("&action=doObjective", "").regex(linkRegExp) + (monsterObj['page'] === 'festival_tower' ? '&remove_monsterKey=' + monsterObj['mid'].replace("&mid=", "") : '');
                            removeLinkInstructions = "Clicking this link will remove " + monsterObj['name'] + " from both CA and CAAP!";
                            data = {
                                text  : '<span id="caap_remove_' + count + '" title="' + removeLinkInstructions + '" mname="' + monsterObj['name'] + '" rlink="' + removeLink +
                                        '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
                                color : 'blue',
                                id    : '',
                                title : ''
                            };

                            html += caap.makeTd(data);
                        } else {
                            html += caap.makeTd({text: '', color: color, id: '', title: ''});
                        }

                        html += '</tr>';
                        count += 1;
                    });

                    html += '</table>';
                    $j("#caap_infoMonster", caap.caapTopObject).html(html);

                    handler = function (e) {
                        var visitMonsterLink = {
                                mname     : '',
                                rlink     : '',
                                arlink    : ''
                            },
                            i   = 0,
                            len = 0;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'mname') {
                                visitMonsterLink.mname = e.target.attributes[i].nodeValue;
                            } else if (e.target.attributes[i].nodeName === 'rlink') {
                                visitMonsterLink.rlink = e.target.attributes[i].nodeValue;
                                visitMonsterLink.arlink = visitMonsterLink.rlink.replace(caap.domain.link + "/", "");
                            }
                        }

                        caap.clickAjaxLinkSend(visitMonsterLink.arlink);
                    };

                    $j("span[id*='caap_monster_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    handler = function (e) {
                        var monsterRemove = {
                                mname     : '',
                                rlink     : '',
                                arlink    : ''
                            },
                            i    = 0,
                            len  = 0,
                            resp = false;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'mname') {
                                monsterRemove.mname = e.target.attributes[i].nodeValue;
                            } else if (e.target.attributes[i].nodeName === 'rlink') {
                                monsterRemove.rlink = e.target.attributes[i].nodeValue;
                                monsterRemove.arlink = monsterRemove.rlink.replace(caap.domain.link + "/", "");
                            }
                        }

                        resp = confirm("Are you sure you want to remove " + monsterRemove.mname + "?");
                        if (resp === true) {
                            monster.deleteItem(monsterRemove.mname);
                            caap.updateDashboard(true);
                            caap.clickGetCachedAjax(monsterRemove.arlink);
                        }
                    };

                    $j("span[id*='caap_remove_']", caap.caapTopObject).unbind('click', handler).click(handler);
                    state.setItem("MonsterDashUpdate", false);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_guildMonster' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'Guild Monster' && state.getItem("GuildMonsterDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['Slot', 'Name', 'Damage', 'Damage%',     'My Status', 'TimeLeft', 'Status', 'Link', '&nbsp;'];
                    values  = ['slot', 'name', 'damage', 'enemyHealth', 'myStatus',  'ticker',   'state'];
                    for (pp = 0; pp < headers.length; pp += 1) {
                        html += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    html += '</tr>';
                    for (i = 0, len = guild_monster.records.length; i < len; i += 1) {
                        html += "<tr>";
                        for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                            switch (values[pp]) {
                            case 'name' :
                                data = {
                                    text  : '<span id="caap_guildmonster_' + pp + '" title="Clicking this link will take you to (' + guild_monster.records[i]['slot'] + ') ' + guild_monster.records[i]['name'] +
                                            '" mname="' + guild_monster.records[i]['slot'] + '" rlink="guild_battle_monster.php?twt2=' + guild_monster.info[guild_monster.records[i]['name']].twt2 + '&guild_id=' + guild_monster.records[i]['guildId'] +
                                            '&slot=' + guild_monster.records[i]['slot'] + '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + guild_monster.records[i]['name'] + '</span>',
                                    color : guild_monster.records[i]['color'],
                                    id    : '',
                                    title : ''
                                };

                                html += caap.makeTd(data);
                                break;
                            case 'ticker' :
                                html += caap.makeTd({text: $u.hasContent(guild_monster.records[i][values[pp]]) ? guild_monster.records[i][values[pp]].regex(/(\d+:\d+):\d+/) : '', color: guild_monster.records[i]['color'], id: '', title: ''});
                                break;
                            default :
                                html += caap.makeTd({text: $u.hasContent(guild_monster.records[i][values[pp]]) ? guild_monster.records[i][values[pp]] : '', color: guild_monster.records[i]['color'], id: '', title: ''});
                            }
                        }

                        data = {
                            text  : '<a href="' + caap.domain.link + '/guild_battle_monster.php?twt2=' + guild_monster.info[guild_monster.records[i]['name']].twt2 +
                                    '&guild_id=' + guild_monster.records[i]['guildId'] + '&action=doObjective&slot=' + guild_monster.records[i]['slot'] + '&ref=nf">Link</a>',
                            color : 'blue',
                            id    : '',
                            title : 'This is a siege link.'
                        };

                        html += caap.makeTd(data);

                        if ($u.hasContent(guild_monster.records[i]['conditions']) && guild_monster.records[i]['conditions'] !== 'none') {
                            data = {
                                text  : '<span title="User Set Conditions: ' + guild_monster.records[i]['conditions'] + '" class="ui-icon ui-icon-info">i</span>',
                                color : guild_monster.records[i]['color'],
                                id    : '',
                                title : ''
                            };

                            html += caap.makeTd(data);
                        } else {
                            html += caap.makeTd({text: '', color: color, id: '', title: ''});
                        }

                        html += '</tr>';
                    }

                    html += '</table>';
                    $j("#caap_guildMonster", caap.caapTopObject).html(html);

                    handler = function (e) {
                        var visitMonsterLink = {
                                mname     : '',
                                arlink    : ''
                            },
                            i   = 0,
                            len = 0;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'mname') {
                                visitMonsterLink.mname = e.target.attributes[i].nodeValue;
                            } else if (e.target.attributes[i].nodeName === 'rlink') {
                                visitMonsterLink.arlink = e.target.attributes[i].nodeValue;
                            }
                        }

                        caap.clickAjaxLinkSend(visitMonsterLink.arlink);
                    };

                    $j("span[id*='caap_guildmonster_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    state.setItem("GuildMonsterDashUpdate", false);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_arena' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                //arena.AddArenaDashboard();

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_army' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'Army' && state.getItem("ArmyDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['UserId', 'User', 'Name', 'Level', 'Change', 'Elite', 'Delete'];
                    values  = ['userId', 'user', 'name', 'lvl',   'change'];
                    for (pp = 0; pp < headers.length; pp += 1) {
                        header = {
                            text  : '<span id="caap_army_' + values[pp] + '" title="Click to sort" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + headers[pp] + '</span>',
                            color : 'blue',
                            bgcolor : '',
                            id    : '',
                            title : '',
                            width : ''
                        };

                        switch (headers[pp]) {
                        case 'UserId':
                            header.width = '18%';
                            break;
                        case 'User':
                            header.width = '25%';
                            break;
                        case 'Name':
                            header.width = '30%';
                            break;
                        case 'Level':
                            header.width = '7%';
                            break;
                        case 'Change':
                            header.width = '10%';
                            break;
                        case 'Elite':
                            header.text = '<span id="caap_army_elite" title="Click to sort" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + headers[pp] + '</span>';
                            header.width = '5%';
                            break;
                        default:
                            header.text = headers[pp];
                            header.width = '5%';
                            header.color = '';
                        }

                        html += caap.makeTh(header);
                    }

                    html += '</tr>';
                    for (i = 0, len = army.recordsSortable.length; i < len; i += 1) {
                        if (army.recordsSortable[i]["userId"] <= 0) {
                            continue;
                        }

                        html += "<tr>";
                        if (schedule.since(army.recordsSortable[i]['change'], config.getItem("ArmyAgeDays4", 28) * 86400)) {
                            color = config.getItem("ArmyAgeDaysColor4", 'red');
                        } else if (schedule.since(army.recordsSortable[i]['change'], config.getItem("ArmyAgeDays3", 21) * 86400)) {
                            color = config.getItem("ArmyAgeDaysColor3", 'darkorange');
                        } else if (schedule.since(army.recordsSortable[i]['change'], config.getItem("ArmyAgeDays2", 14) * 86400)) {
                            color = config.getItem("ArmyAgeDaysColor2", 'gold');
                        } else if (schedule.since(army.recordsSortable[i]['change'], config.getItem("ArmyAgeDays1", 7) * 86400)) {
                            color = config.getItem("ArmyAgeDaysColor1", 'greenyellow');
                        } else {
                            color = config.getItem("ArmyAgeDaysColor0", 'green');
                        }

                        for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                            if (values[pp] === "change") {
                                html += caap.makeTd({
                                    text  : $u.hasContent(army.recordsSortable[i][values[pp]]) && ($u.isString(army.recordsSortable[i][values[pp]]) || army.recordsSortable[i][values[pp]] > 0) ? $u.makeTime(army.recordsSortable[i][values[pp]], "d-m-Y") : '',
                                    bgcolor : color,
                                    color : $u.bestTextColor(color),
                                    id    : '',
                                    title : ''
                                });
                            } else if (values[pp] === "userId") {
                                str = $u.setContent(army.recordsSortable[i][values[pp]], '');
                                userIdLinkInstructions = "Clicking this link will take you to the user keep of " + str;
                                userIdLink = caap.domain.link + "/keep.php?casuser=" + str;
                                data = {
                                    text  : '<span id="caap_targetarmy_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                            '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + str + '</span>',
                                    color : 'blue',
                                    id    : '',
                                    title : ''
                                };

                                html += caap.makeTd(data);
                            } else {
                                html += caap.makeTd({
                                    text  : $u.hasContent(army.recordsSortable[i][values[pp]]) && ($u.isString(army.recordsSortable[i][values[pp]]) || army.recordsSortable[i][values[pp]] > 0) ? army.recordsSortable[i][values[pp]] : '',
                                    color : '',
                                    id    : '',
                                    title : ''
                                });
                            }
                        }

                        data = {
                            text  : '<input id="caap_elitearmy_' + i + '" type="checkbox" title="Use to fill elite guard first" userid="' + army.recordsSortable[i]['userId'] + '" cstate="' + (army.recordsSortable[i]['elite'] ? 'true' : 'false') + '" ' + (army.recordsSortable[i]['elite'] ? ' checked' : '') + ' />',
                            color : 'blue',
                            id    : '',
                            title : ''
                        };

                        html += caap.makeTd(data);

                        removeLinkInstructions = "Clicking this link will remove " + army.recordsSortable[i]['user'].escapeHTML() + " from your army!";
                        data = {
                            text  : '<span id="caap_removearmy_' + i + '" title="' + removeLinkInstructions + '" userid="' + army.recordsSortable[i]['userId'] + '" mname="' + army.recordsSortable[i]['user'].escapeHTML() +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
                            color : 'blue',
                            id    : '',
                            title : ''
                        };

                        html += caap.makeTd(data);

                        html += '</tr>';
                    }

                    html += '</table>';
                    $j("#caap_army", caap.caapTopObject).html(html);

                    handler = function (e) {
                        var visitUserIdLink = {
                                rlink     : '',
                                arlink    : ''
                            },
                            i   = 0,
                            len = 0;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'rlink') {
                                visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                                visitUserIdLink.arlink = visitUserIdLink.rlink.replace(caap.domain.link + "/", "");
                            }
                        }

                        caap.clickAjaxLinkSend(visitUserIdLink.arlink);
                    };

                    $j("span[id*='caap_targetarmy_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    handler = function (e) {
                        var userid = 0,
                            cstate = false,
                            i      = 0,
                            len    = 0,
                            record = {};

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'userid') {
                                userid = e.target.attributes[i].nodeValue.parseInt();
                            } else if (e.target.attributes[i].nodeName === 'cstate') {
                                cstate = e.target.attributes[i].nodeValue === 'true' ? true : false;
                            }
                        }

                        if ($u.hasContent(userid) && userid > 0) {
                            record = army.getItem(userid);
                            record['elite'] = !cstate;
                            army.setItem(record);
                            state.setItem("ArmyDashUpdate", true);
                            caap.updateDashboard(true);
                        }
                    };

                    $j("input[id*='caap_elitearmy_']", caap.caapTopObject).unbind('change', handler).change(handler);

                    handler = function (e) {
                        var mname  = '',
                            userid = '',
                            i      = 0,
                            len    = 0,
                            resp   = false;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'userid') {
                                userid = e.target.attributes[i].nodeValue.parseInt();
                            } else if (e.target.attributes[i].nodeName === 'mname') {
                                mname = e.target.attributes[i].nodeValue;
                            }
                        }

                        resp = confirm("Are you sure you want to remove " + mname + " from your army?");
                        if (resp === true) {
                            caap.clickAjaxLinkSend("army_member.php?action=delete&player_id=" + userid);
                            army.deleteItem(userid);
                            state.setItem("ArmyDashUpdate", true);
                            caap.updateDashboard(true);
                        }
                    };

                    $j("span[id*='caap_removearmy_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    handler = function (e) {
                        var clicked  = '',
                            order    = new sort.order(),
                            oldOrder = state.getItem("ArmySort", order.data);

                        clicked = $u.hasContent(e.target.id) ? e.target.id.replace("caap_army_", '') : null;
                        if ($u.hasContent(clicked)) {
                            order.data['value']['a'] = clicked;
                            order.data['reverse']['a'] = oldOrder['value']['a'] === clicked ? !oldOrder['reverse']['a'] : (clicked !== 'user' && clicked !== 'name ' ? true : false);
                            order.data['value']['b'] = clicked !== 'user' ? "user" : '';
                            army.recordsSortable.sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'])));
                            state.setItem("ArmySort", order.data);
                            state.setItem("ArmyDashUpdate", true);
                            caap.updateDashboard(true);
                            sort.updateForm("Army");
                        }
                    };

                    $j("span[id*='caap_army_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    state.setItem("ArmyDashUpdate", false);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_infoTargets1' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'Target List' && state.getItem("ReconDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['UserId', 'Name',    'Deity#',   'Rank',    'Rank#',   'Level',    'Army',    'Last Alive'];
                    values  = ['userID', 'nameStr', 'deityNum', 'rankStr', 'rankNum', 'levelNum', 'armyNum', 'aliveTime'];
                    for (pp = 0; pp < headers.length; pp += 1) {
                        html += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    html += '</tr>';
                    for (i = 0, len = caap.reconRecords.length; i < len; i += 1) {
                        html += "<tr>";
                        for (pp = 0; pp < values.length; pp += 1) {
                            if (/userID/.test(values[pp])) {
                                userIdLinkInstructions = "Clicking this link will take you to the user keep of " + caap.reconRecords[i][values[pp]];
                                userIdLink = caap.domain.link + "/keep.php?casuser=" + caap.reconRecords[i][values[pp]];
                                data = {
                                    text  : '<span id="caap_targetrecon_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                            '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + caap.reconRecords[i][values[pp]] + '</span>',
                                    color : 'blue',
                                    id    : '',
                                    title : ''
                                };

                                html += caap.makeTd(data);
                            } else if (/\S+Num/.test(values[pp])) {
                                html += caap.makeTd({text: caap.reconRecords[i][values[pp]], color: '', id: '', title: ''});
                            } else if (/\S+Time/.test(values[pp])) {
                                data = {
                                    text  : $u.makeTime(caap.reconRecords[i][values[pp]], "d M H:i"),
                                    color : '',
                                    id    : '',
                                    title : ''
                                };

                                html += caap.makeTd(data);
                            } else {
                                html += caap.makeTd({text: caap.reconRecords[i][values[pp]], color: '', id: '', title: ''});
                            }
                        }

                        html += '</tr>';
                    }

                    html += '</table>';
                    $j("#caap_infoTargets1", caap.caapTopObject).html(html);

                    handler = function (e) {
                        var visitUserIdLink = {
                                rlink     : '',
                                arlink    : ''
                            },
                            i   = 0,
                            len = 0;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'rlink') {
                                visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                                visitUserIdLink.arlink = visitUserIdLink.rlink.replace(caap.domain.link + "/", "");
                            }
                        }

                        caap.clickAjaxLinkSend(visitUserIdLink.arlink);
                    };

                    $j("span[id*='caap_targetrecon_']", caap.caapTopObject).unbind('click', handler).click(handler);
                    state.setItem("ReconDashUpdate", false);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_infoBattle' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'Battle Stats' && state.getItem("BattleDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['UserId', 'Name',    'BR#',     'WR#',        'Level',    'Army',    'I Win',         'I Lose',          'D Win',       'D Lose',        'W Win',      'W Lose'];
                    values  = ['userId', 'nameStr', 'rankNum', 'warRankNum', 'levelNum', 'armyNum', 'invadewinsNum', 'invadelossesNum', 'duelwinsNum', 'duellossesNum', 'warwinsNum', 'warlossesNum'];
                    for (pp = 0; pp < headers.length; pp += 1) {
                        html += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    html += '</tr>';
                    for (i = 0, len = battle.records.length; i < len; i += 1) {
                        html += "<tr>";
                        for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                            if (/userId/.test(values[pp])) {
                                userIdLinkInstructions = "Clicking this link will take you to the user keep of " + battle.records[i][values[pp]];
                                userIdLink = caap.domain.link + "/keep.php?casuser=" + battle.records[i][values[pp]];
                                data = {
                                    text  : '<span id="caap_battle_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                            '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + battle.records[i][values[pp]] + '</span>',
                                    color : 'blue',
                                    id    : '',
                                    title : ''
                                };

                                html += caap.makeTd(data);
                            } else if (/rankNum/.test(values[pp])) {
                                html += caap.makeTd({text: battle.records[i][values[pp]], color: '', id: '', title: battle.records[i]['rankStr']});
                            } else if (/warRankNum/.test(values[pp])) {
                                html += caap.makeTd({text: battle.records[i][values[pp]], color: '', id: '', title: battle.records[i]['warRankStr']});
                            } else {
                                html += caap.makeTd({text: battle.records[i][values[pp]], color: '', id: '', title: ''});
                            }
                        }

                        html += '</tr>';
                    }

                    html += '</table>';
                    $j("#caap_infoBattle", caap.caapTopObject).html(html);

                    $j("span[id*='caap_battle_']", caap.caapTopObject).click(function (e) {
                        var visitUserIdLink = {
                                rlink     : '',
                                arlink    : ''
                            },
                            i   = 0,
                            len = 0;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'rlink') {
                                visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                                visitUserIdLink.arlink = visitUserIdLink.rlink.replace(caap.domain.link + "/", "");
                            }
                        }

                        caap.clickAjaxLinkSend(visitUserIdLink.arlink);
                    });

                    state.setItem("BattleDashUpdate", false);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_userStats' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'User Stats' && state.getItem("UserDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['Name', 'Value', 'Name', 'Value'];
                    for (pp = 0, len = headers.length; pp < len; pp += 1) {
                        html += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Facebook ID', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['FBID'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Account Name', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['account'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Character Name', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['PlayerName'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Energy', color: '', id: '', title: 'Current/Max'});
                    html += caap.makeTd({text: caap.stats['energy']['num'] + '/' + caap.stats['energy']['max'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Level', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['level'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Stamina', color: '', id: '', title: 'Current/Max'});
                    html += caap.makeTd({text: caap.stats['stamina']['num'] + '/' + caap.stats['stamina']['max'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Battle Rank', color: '', id: '', title: ''});
                    html += caap.makeTd({text: battle.battleRankTable[caap.stats['rank']['battle']] + ' (' + caap.stats['rank']['battle'] + ')', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Attack', color: '', id: '', title: 'Current/Max'});
                    html += caap.makeTd({text: caap.stats['attack'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Battle Rank Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['rank']['battlePoints'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Defense', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['defense'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'War Rank', color: '', id: '', title: ''});
                    html += caap.makeTd({text: battle.warRankTable[caap.stats['rank']['war']] + ' (' + caap.stats['rank']['war'] + ')', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Health', color: '', id: '', title: 'Current/Max'});
                    html += caap.makeTd({text: caap.stats['health']['num'] + '/' + caap.stats['health']['max'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'War Rank Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['rank']['warPoints'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Army', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['army']['actual'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Generals', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['generals']['total'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Generals When Invade', color: '', id: '', title: 'For every 5 army members you have, one of your generals will also join the fight.'});
                    html += caap.makeTd({text: caap.stats['generals']['invade'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Gold In Bank', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '$' + caap.stats['gold']['bank'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Total Income Per Hour', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '$' + caap.stats['gold']['income'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Gold In Cash', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '$' + caap.stats['gold']['cash'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Upkeep', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '$' + caap.stats['gold']['upkeep'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Total Gold', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '$' + caap.stats['gold']['total'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Cash Flow Per Hour', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '$' + caap.stats['gold']['flow'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Skill Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['points']['skill'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Energy Potions', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['potions']['energy'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Favor Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['points']['favor'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Stamina Potions', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['potions']['stamina'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Experience To Next Level (ETNL)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['exp']['dif'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Battle Strength Index (BSI)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['indicators']['bsi'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Hours To Level (HTL)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: $u.minutes2hours(caap.stats['indicators']['htl']), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Levelling Speed Index (LSI)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['indicators']['lsi'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Hours Remaining To Level (HRTL)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: $u.minutes2hours(caap.stats['indicators']['hrtl']), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Skill Points Per Level (SPPL)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['indicators']['sppl'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Expected Next Level (ENL)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: $u.makeTime(caap.stats['indicators']['enl'], schedule.timeStr()), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Attack Power Index (API)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['indicators']['api'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Defense Power Index (DPI)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['indicators']['dpi'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Mean Power Index (MPI)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['indicators']['mpi'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Battles/Wars Won', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['other']['bww'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Times eliminated', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['other']['te'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Battles/Wars Lost', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['other']['bwl'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Times you eliminated an enemy', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['other']['tee'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Battles/Wars Win/Loss Ratio (WLR)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['other']['wlr'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Enemy Eliminated/Eliminated Ratio (EER)', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['other']['eer'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Invasions Won', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['battle']['invasions']['won'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Duels Won', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['battle']['duels']['won'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Invasions Lost', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['battle']['invasions']['lost'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Duels Lost', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['battle']['duels']['lost'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Invasions Streak', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['battle']['invasions']['streak'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Duels Streak', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['battle']['duels']['streak'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Invasions Win/loss Ratio (IWLR)', color: '', id: '', title: ''});
                    if (caap.stats['achievements']['battle']['invasions']['ratio']) {
                        html += caap.makeTd({text: caap.stats['achievements']['battle']['invasions']['ratio'], color: valueCol, id: '', title: ''});
                    } else {
                        html += caap.makeTd({text: caap.stats['achievements']['battle']['invasions']['ratio'], color: valueCol, id: '', title: ''});
                    }

                    html += caap.makeTd({text: 'Duels Win/loss Ratio (DWLR)', color: '', id: '', title: ''});
                    if (caap.stats['achievements']['battle']['duels']['ratio']) {
                        html += caap.makeTd({text: caap.stats['achievements']['battle']['duels']['ratio'], color: valueCol, id: '', title: ''});
                    } else {
                        html += caap.makeTd({text: caap.stats['achievements']['battle']['duels']['ratio'], color: valueCol, id: '', title: ''});
                    }

                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Quests Completed', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['other']['qc'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Alchemy Performed', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['other']['alchemy'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Gildamesh, The Orc King Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['gildamesh'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Lotus Ravenmoore Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['lotus'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'The Colossus of Terra Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['colossus'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Dragons Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['dragons'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Sylvanas the Sorceress Queen Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['sylvanas'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Cronus, The World Hydra Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['cronus'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Keira the Dread Knight Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['keira'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'The Battle of the Dark Legion Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['legion'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Genesis, The Earth Elemental Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['genesis'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Skaar Deathrune Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['skaar'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Gehenna, The Fire Elemental Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['gehenna'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Sieges Assisted With', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['sieges'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: "Aurelius, Lion's Rebellion", color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['aurelius'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Corvintheus Slain', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['corvintheus'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: "Valhalla, The Air Elemental Slain", color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['valhalla'].addCommas(), color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: "Jahanna, Priestess of Aurora", color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.stats['achievements']['monster']['jahanna'].addCommas(), color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Ambrosia Daily Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['ambrosia']['daily']['num'] + '/' + caap.demi['ambrosia']['daily']['max'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Malekus Daily Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['malekus']['daily']['num'] + '/' + caap.demi['malekus']['daily']['max'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Ambrosia Total Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['ambrosia']['power']['total'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Malekus Total Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['malekus']['power']['total'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Corvintheus Daily Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['corvintheus']['daily']['num'] + '/' + caap.demi['corvintheus']['daily']['max'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Aurora Daily Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['aurora']['daily']['num'] + '/' + caap.demi['aurora']['daily']['max'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Corvintheus Total Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['corvintheus']['power']['total'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: 'Aurora Total Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['aurora']['power']['total'], color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Azeron Daily Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['azeron']['daily']['num'] + '/' + caap.demi['azeron']['daily']['max'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: 'Azeron Total Points', color: '', id: '', title: ''});
                    html += caap.makeTd({text: caap.demi['azeron']['power']['total'], color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    html += "<tr>";
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
                    html += '</tr>';

                    count = 0;
                    for (pp in caap.stats['character']) {
                        if (caap.stats['character'].hasOwnProperty(pp)) {
                            html += count % 2 === 0 ? "<tr>" : '';
                            html += caap.makeTd({text: [pp], color: '', id: '', title: ''});
                            html += caap.makeTd({text: "Level " + caap.stats['character'][pp]['level'] + " (" + caap.stats['character'][pp]['percent'] + "%)", color: valueCol, id: '', title: ''});
                            html += count % 2 === 1 ? '</tr>' : '';
                            count += 1;
                        }
                    }

                    html += '</table>';
                    $j("#caap_userStats", caap.caapTopObject).html(html);
                    state.setItem("UserDashUpdate", false);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_generalsStats' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'Generals Stats' && state.getItem("GeneralsDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['General', 'Lvl', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'EAtk', 'EDef', 'EAPI', 'EDPI', 'EMPI', 'Special'];
                    values  = ['name', 'lvl', 'atk', 'def', 'api', 'dpi', 'mpi', 'eatk', 'edef', 'eapi', 'edpi', 'empi', 'special'];
                    $j.merge(generalValues, values);
                    for (pp = 0, len = headers.length; pp < len; pp += 1) {
                        header = {
                            text  : '<span id="caap_generalsStats_' + values[pp] + '" title="Click to sort" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + headers[pp] + '</span>',
                            color : 'blue',
                            id    : '',
                            title : '',
                            width : ''
                        };

                        header = headers[pp] === 'Special' ? {text  : headers[pp], color : '', id    : '', title : '', width : '25%'} : header;
                        html += caap.makeTh(header);
                    }

                    html += '</tr>';
                    for (it = 0, len = general.recordsSortable.length; it < len; it += 1) {
                        html += "<tr>";
                        for (pp = 0, len1 = values.length; pp < len; pp += 1) {
                            html += caap.makeTd({text: $u.setContent(general.recordsSortable[it][values[pp]], ''), color: pp === 0 ? '' : valueCol, id: '', title: ''});
                        }

                        html += '</tr>';
                    }

                    html += '</table>';
                    $j("#caap_generalsStats", caap.caapTopObject).html(html);

                    handler = function (e) {
                        var clicked = '',
                            order = new sort.order();

                        if (e.target.id) {
                            clicked = e.target.id.replace(statsRegExp, '');
                        }

                        if (generalValues.hasIndexOf(clicked)) {
                            order.data['value']['a'] = clicked;
                            if (clicked !== 'name') {
                                order.data['reverse']['a'] = true;
                                order.data['value']['b'] = "name";
                            }

                            general.recordsSortable.sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'])));
                            state.setItem("GeneralsSort", order.data);
                            state.setItem("GeneralsDashUpdate", true);
                            sort.updateForm("Generals");
                            caap.updateDashboard(true);
                        }
                    };

                    $j("span[id*='caap_generalsStats_']", caap.caapTopObject).unbind('click', handler).click(handler);
                    state.setItem("GeneralsDashUpdate", false);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'soldiers', 'item' and 'magic' div.
                We set our table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if ((config.getItem('DBDisplay', '') === 'Soldiers Stats' && state.getItem("SoldiersDashUpdate", true)) || (config.getItem('DBDisplay', '') === 'Item Stats' && state.getItem("ItemDashUpdate", true)) || (config.getItem('DBDisplay', '') === 'Magic Stats' && state.getItem("MagicDashUpdate", true))) {
                    headers = ['Name', 'Type', 'Owned', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'Cost', 'Upkeep', 'Hourly'];
                    values  = ['name', 'type', 'owned', 'atk', 'def', 'api', 'dpi', 'mpi', 'cost', 'upkeep', 'hourly'];
                    $j.merge(townValues, values);
                    for (i = 0, len = town.types.length; i < len; i += 1) {
                        if (config.getItem('DBDisplay', '') !== (town.types[i].ucFirst() + ' Stats')) {
                            continue;
                        }

                        html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                        for (pp = 0, len1 = headers.length; pp < len1; pp += 1) {
                            if (town.types[i] !== 'item' && headers[pp] === 'Type') {
                                continue;
                            }

                            header = {
                                text  : '<span id="caap_' + town.types[i] + 'Stats_' + values[pp] + '" title="Click to sort" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + headers[pp] + '</span>',
                                color : 'blue',
                                id    : '',
                                title : '',
                                width : ''
                            };

                            html += caap.makeTh(header);
                        }

                        html += '</tr>';
                        for (it = 0, len1 = town[town.types[i] + "Sortable"].length; it < len1; it += 1) {
                            html += "<tr>";
                            for (pp = 0, len2 = values.length; pp < len2; pp += 1) {
                                if (town.types[i] !== 'item' && values[pp] === 'type') {
                                    continue;
                                }

                                if ($u.isNaN(town[town.types[i] + "Sortable"][it][values[pp]]) || !$u.hasContent(town[town.types[i] + "Sortable"][it][values[pp]])) {
                                    str = $u.setContent(town[town.types[i] + "Sortable"][it][values[pp]], '');
                                } else {
                                    str = town[town.types[i] + "Sortable"][it][values[pp]].addCommas();
                                    str = $u.hasContent(str) && (values[pp] === 'cost' || values[pp] === 'upkeep' || values[pp] === 'hourly') ? "$" + str : str;
                                }

                                html += caap.makeTd({text: str, color: pp === 0 ? '' : valueCol, id: '', title: ''});
                            }

                            html += '</tr>';
                        }

                        html += '</table>';
                        $j("#caap_" + town.types[i] + "Stats", caap.caapTopObject).html(html);
                        state.setItem(town.types[i] + "DashUpdate", false);
                    }

                    handler = function (e) {
                        var clicked = '',
                            order = new sort.order();

                        if (e.target.id) {
                            clicked = e.target.id.replace(statsRegExp, '');
                        }

                        if (townValues.hasIndexOf(clicked)) {
                            order.data['value']['a'] = clicked;
                            if (clicked !== 'name') {
                                order.data['reverse']['a'] = true;
                                order.data['value']['b'] = "name";
                            }

                            town['soldiersSortable'].sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'])));
                            state.setItem("SoldiersSort", order.data);
                            state.setItem("SoldiersDashUpdate", true);
                            caap.updateDashboard(true);
                            sort.updateForm("Soldiers");
                        }
                    };

                    $j("span[id*='caap_soldiersStats_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    handler = function (e) {
                        var clicked = '',
                            order = new sort.order();

                        if (e.target.id) {
                            clicked = e.target.id.replace(statsRegExp, '');
                        }

                        if (townValues.hasIndexOf(clicked)) {
                            order.data['value']['a'] = clicked;
                            if (clicked !== 'name') {
                                order.data['reverse']['a'] = true;
                                order.data['value']['b'] = "name";
                            }

                            town['itemSortable'].sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'])));
                            state.setItem("ItemSort", order.data);
                            state.setItem("ItemDashUpdate", true);
                            caap.updateDashboard(true);
                            sort.updateForm("Item");
                        }
                    };

                    $j("span[id*='caap_itemStats_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    handler = function (e) {
                        var clicked = '',
                            order = new sort.order();

                        if (e.target.id) {
                            clicked = e.target.id.replace(statsRegExp, '');
                        }

                        if (townValues.hasIndexOf(clicked)) {
                            order.data['value']['a'] = clicked;
                            if (clicked !== 'name') {
                                order.data['reverse']['a'] = true;
                                order.data['value']['b'] = "name";
                            }

                            town['magicSortable'].sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'])));
                            state.setItem("MagicSort", order.data);
                            state.setItem("MagicDashUpdate", true);
                            caap.updateDashboard(true);
                            sort.updateForm("Magic");
                        }
                    };

                    $j("span[id*='caap_magicStats_']", caap.caapTopObject).unbind('click', handler).click(handler);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_giftStats' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'Gifting Stats' && state.getItem("GiftHistoryDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['UserId', 'Name', 'Received', 'Sent'];
                    values  = ['userId', 'name', 'received', 'sent'];
                    for (pp = 0, len = headers.length; pp < len; pp += 1) {
                        html += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    html += '</tr>';
                    for (i = 0, len = gifting.history.records.length; i < len; i += 1) {
                        html += "<tr>";
                        for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                            str = $u.setContent(gifting.history.records[i][values[pp]], '');
                            if (/userId/.test(values[pp])) {
                                userIdLinkInstructions = "Clicking this link will take you to the user keep of " + str;
                                userIdLink = caap.domain.link + "/keep.php?casuser=" + str;
                                data = {
                                    text  : '<span id="caap_targetgift_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                            '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + str + '</span>',
                                    color : 'blue',
                                    id    : '',
                                    title : ''
                                };

                                html += caap.makeTd(data);
                            } else {
                                html += caap.makeTd({text: str, color: '', id: '', title: ''});
                            }
                        }

                        html += '</tr>';
                    }

                    html += '</table>';
                    $j("#caap_giftStats", caap.caapTopObject).html(html);

                    handler = function (e) {
                        var visitUserIdLink = {
                                rlink     : '',
                                arlink    : ''
                            },
                            i   = 0,
                            len = 0;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'rlink') {
                                visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                                visitUserIdLink.arlink = visitUserIdLink.rlink.replace(caap.domain.link + "/", "");
                            }
                        }

                        caap.clickAjaxLinkSend(visitUserIdLink.arlink);
                    };

                    $j("span[id*='caap_targetgift_']", caap.caapTopObject).unbind('click', handler).click(handler);
                    state.setItem("GiftHistoryDashUpdate", false);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_giftQueue' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'Gift Queue' && state.getItem("GiftQueueDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['UserId', 'Name', 'Gift', 'FB Cleared', 'Delete'];
                    values  = ['userId', 'name', 'gift', 'found'];
                    for (pp = 0, len = headers.length; pp < len; pp += 1) {
                        html += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    html += '</tr>';
                    for (i = 0, len = gifting.queue.records.length; i < len; i += 1) {
                        html += "<tr>";
                        for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                            str = $u.setContent(gifting.queue.records[i][values[pp]], '');
                            if (/userId/.test(values[pp])) {
                                userIdLinkInstructions = "Clicking this link will take you to the user keep of " + str;
                                userIdLink = caap.domain.link + "/keep.php?casuser=" + str;

                                data = {
                                    text  : '<span id="caap_targetgiftq_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                            '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + str + '</span>',
                                    color : 'blue',
                                    id    : '',
                                    title : ''
                                };

                                html += caap.makeTd(data);
                            } else {
                                html += caap.makeTd({text: str, color: '', id: '', title: ''});
                            }
                        }

                        removeLinkInstructions = "Clicking this link will remove " + gifting.queue.records[i]['name'] + "'s entry from the gift queue!";
                        data = {
                            text  : '<span id="caap_removeq_' + i + '" title="' + removeLinkInstructions + '" mname="' +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
                            color : 'blue',
                            id    : '',
                            title : ''
                        };

                        html += caap.makeTd(data);

                        html += '</tr>';
                    }

                    html += '</table>';
                    $j("#caap_giftQueue", caap.caapTopObject).html(html);

                    handler = function (e) {
                        var visitUserIdLink = {
                                rlink     : '',
                                arlink    : ''
                            },
                            i   = 0,
                            len = 0;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'rlink') {
                                visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                                visitUserIdLink.arlink = visitUserIdLink.rlink.replace(caap.domain.link + "/", "");
                            }
                        }

                        caap.clickAjaxLinkSend(visitUserIdLink.arlink);
                    };

                    $j("span[id*='caap_targetgiftq_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    handler = function (e) {
                        var index = -1,
                            i     = 0,
                            len   = 0,
                            resp  = false;

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'id') {
                                index = e.target.attributes[i].nodeValue.replace("caap_removeq_", "").parseInt();
                            }
                        }

                        resp = confirm("Are you sure you want to remove this queue entry?");
                        if (resp === true) {
                            gifting.queue.deleteIndex(index);
                            caap.updateDashboard(true);
                        }
                    };

                    $j("span[id*='caap_removeq_']", caap.caapTopObject).unbind('click', handler).click(handler);
                    state.setItem("GiftQueueDashUpdate", false);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in updateDashboard: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /*-------------------------------------------------------------------------------------\
        addDBListener creates the listener for our dashboard controls.
        \-------------------------------------------------------------------------------------*/
        dbDisplayListener: function (e) {
            var value = e.target.options[e.target.selectedIndex].value;
            config.setItem('DBDisplay', value);
            caap.setDisplay("caapTopObject", 'infoMonster', false);
            caap.setDisplay("caapTopObject", 'guildMonster', false);
            //caap.setDisplay("caapTopObject", 'arena', false);
            caap.setDisplay("caapTopObject", 'army', false);
            caap.setDisplay("caapTopObject", 'infoTargets1', false);
            caap.setDisplay("caapTopObject", 'infoBattle', false);
            caap.setDisplay("caapTopObject", 'userStats', false);
            caap.setDisplay("caapTopObject", 'generalsStats', false);
            caap.setDisplay("caapTopObject", 'soldiersStats', false);
            caap.setDisplay("caapTopObject", 'itemStats', false);
            caap.setDisplay("caapTopObject", 'magicStats', false);
            caap.setDisplay("caapTopObject", 'giftStats', false);
            caap.setDisplay("caapTopObject", 'giftQueue', false);
            caap.setDisplay("caapTopObject", 'buttonMonster', false);
            caap.setDisplay("caapTopObject", 'buttonGuildMonster', false);
            caap.setDisplay("caapTopObject", 'buttonTargets', false);
            caap.setDisplay("caapTopObject", 'buttonBattle', false);
            caap.setDisplay("caapTopObject", 'buttonGifting', false);
            caap.setDisplay("caapTopObject", 'buttonGiftQueue', false);
            caap.setDisplay("caapTopObject", 'buttonSortGenerals', false);
            caap.setDisplay("caapTopObject", 'buttonSortSoldiers', false);
            caap.setDisplay("caapTopObject", 'buttonSortItem', false);
            caap.setDisplay("caapTopObject", 'buttonSortMagic', false);
            caap.setDisplay("caapTopObject", 'buttonArmy', false);
            switch (value) {
            case "Target List" :
                caap.setDisplay("caapTopObject", 'infoTargets1', true);
                caap.setDisplay("caapTopObject", 'buttonTargets', true);
                break;
            case "Battle Stats" :
                caap.setDisplay("caapTopObject", 'infoBattle', true);
                caap.setDisplay("caapTopObject", 'buttonBattle', true);
                break;
            case "User Stats" :
                caap.setDisplay("caapTopObject", 'userStats', true);
                break;
            case "Generals Stats" :
                caap.setDisplay("caapTopObject", 'generalsStats', true);
                caap.setDisplay("caapTopObject", 'buttonSortGenerals', true);
                break;
            case "Soldiers Stats" :
                caap.setDisplay("caapTopObject", 'soldiersStats', true);
                caap.setDisplay("caapTopObject", 'buttonSortSoldiers', true);
                break;
            case "Item Stats" :
                caap.setDisplay("caapTopObject", 'itemStats', true);
                caap.setDisplay("caapTopObject", 'buttonSortItem', true);
                break;
            case "Magic Stats" :
                caap.setDisplay("caapTopObject", 'magicStats', true);
                caap.setDisplay("caapTopObject", 'buttonSortMagic', true);
                break;
            case "Gifting Stats" :
                caap.setDisplay("caapTopObject", 'giftStats', true);
                caap.setDisplay("caapTopObject", 'buttonGifting', true);
                break;
            case "Gift Queue" :
                caap.setDisplay("caapTopObject", 'giftQueue', true);
                caap.setDisplay("caapTopObject", 'buttonGiftQueue', true);
                break;
            case "Guild Monster" :
                caap.setDisplay("caapTopObject", 'guildMonster', true);
                caap.setDisplay("caapTopObject", 'buttonGuildMonster', true);
                break;
            case "Monster" :
                caap.setDisplay("caapTopObject", 'infoMonster', true);
                caap.setDisplay("caapTopObject", 'buttonMonster', true);
                break;
            /*case "Arena" :
                caap.setDisplay("caapTopObject", 'arena', true);
                break;*/
            case "Army" :
                caap.setDisplay("caapTopObject", 'army', true);
                caap.setDisplay("caapTopObject", 'buttonArmy', true);
                break;
            default :
            }

            caap.updateDashboard(true);
        },

        refreshMonstersListener: function (e) {
            monster.flagFullReview();
        },

        refreshGuildMonstersListener: function (e) {
            $u.log(1, "refreshGuildMonstersListener");
            state.setItem('ReleaseControl', true);
            guild_monster.clear();
            caap.updateDashboard(true);
            schedule.setItem("guildMonsterReview", 0);
        },

        liveFeedButtonListener: function (e) {
            caap.clickAjaxLinkSend('army_news_feed.php');
        },

        crusadersButtonListener: function (e) {
            caap.clickAjaxLinkSend('specialmembership.php');
        },

        clearTargetsButtonListener: function (e) {
            caap.reconRecords = [];
            caap.saveRecon();
            caap.updateDashboard(true);
        },

        clearBattleButtonListener: function (e) {
            battle.clear();
            caap.updateDashboard(true);
        },

        clearGiftingButtonListener: function (e) {
            gifting.clear("history");
            caap.updateDashboard(true);
        },

        clearGiftQueueButtonListener: function (e) {
            gifting.clear("queue");
            caap.updateDashboard(true);
        },

        sortGeneralsButtonListener: function (e) {
            var values = ['name', 'lvl', 'atk', 'def', 'api', 'dpi', 'mpi', 'eatk', 'edef', 'eapi', 'edpi', 'empi', 'special'];
            sort.form("Generals", values, general.recordsSortable);
        },

        sortSoldiersButtonListener: function (e) {
            var values  = ['name', 'owned', 'atk', 'def', 'api', 'dpi', 'mpi', 'cost', 'upkeep', 'hourly'];
            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            sort.form("Soldiers", values, town['soldiersSortable']);
            /*jslint sub: false */
        },

        sortItemButtonListener: function (e) {
            var values  = ['name', 'type', 'owned', 'atk', 'def', 'api', 'dpi', 'mpi', 'cost', 'upkeep', 'hourly'];
            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            sort.form("Item", values, town['itemSortable']);
            /*jslint sub: false */
        },

        sortMagicButtonListener: function (e) {
            var values  = ['name', 'owned', 'atk', 'def', 'api', 'dpi', 'mpi', 'cost', 'upkeep', 'hourly'];
            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            sort.form("Magic", values, town['magicSortable']);
            /*jslint sub: false */
        },

        getArmyButtonListener: function (e) {
            schedule.deleteItem("army_member");
            army.deleteTemp();
        },

        addDBListener: function () {
            try {
                $u.log(4, "Adding listeners for caap_top");
                if (!$u.hasContent($j('#caap_DBDisplay', caap.caapTopObject))) {
                    caap.reloadCastleAge();
                }

                $j('#caap_DBDisplay', caap.caapTopObject).bind('change', caap.dbDisplayListener);
                $j('#caap_refreshMonsters', caap.caapTopObject).bind('click', caap.refreshMonstersListener);
                $j('#caap_refreshGuildMonsters', caap.caapTopObject).bind('click', caap.refreshGuildMonstersListener);
                $j('#caap_liveFeed', caap.caapTopObject).bind('click', caap.liveFeedButtonListener);
                $j('#caap_crusaders', caap.caapTopObject).bind('click', caap.crusadersButtonListener);
                $j('#caap_clearTargets', caap.caapTopObject).bind('click', caap.clearTargetsButtonListener);
                $j('#caap_clearBattle', caap.caapTopObject).bind('click', caap.clearBattleButtonListener);
                $j('#caap_clearGifting', caap.caapTopObject).bind('click', caap.clearGiftingButtonListener);
                $j('#caap_clearGiftQueue', caap.caapTopObject).bind('click', caap.clearGiftQueueButtonListener);
                $j('#caap_sortGenerals', caap.caapTopObject).bind('click', caap.sortGeneralsButtonListener);
                $j('#caap_sortSoldiers', caap.caapTopObject).bind('click', caap.sortSoldiersButtonListener);
                $j('#caap_sortItem', caap.caapTopObject).bind('click', caap.sortItemButtonListener);
                $j('#caap_sortMagic', caap.caapTopObject).bind('click', caap.sortMagicButtonListener);
                $j('#caap_getArmy', caap.caapTopObject).bind('click', caap.getArmyButtonListener);
                $u.log(4, "Listeners added for caap_top");
                return true;
            } catch (err) {
                $u.error("ERROR in addDBListener: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          EVENT LISTENERS
        // Watch for changes and update the controls
        /////////////////////////////////////////////////////////////////////

        setDisplay: function (area, idName, display, quiet) {
            try {
                if (!$u.hasContent(idName) || (!$u.isString(idName) && !$u.isNumber(idName))) {
                    $u.warn("idName", idName);
                    throw "Bad idName!";
                }

                var areaDiv = caap[area];
                if (!$u.hasContent(areaDiv)) {
                    areaDiv = $j(document.body);
                    $u.warn("Unknown area. Using document.body", area);
                }

                areaDiv = $j('#caap_' + idName, areaDiv).css('display', display === true ? 'block' : 'none');
                if (!$u.hasContent(areaDiv) && !quiet) {
                    $u.warn("Unable to find idName in area!", idName, area);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in setDisplay: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkBoxListener: function (e) {
            try {
                var idName        = e.target.id.stripCaap(),
                    DocumentTitle = '',
                    d             = '',
                    styleXY       = {};

                $u.log(1, "Change: setting '" + idName + "' to ", e.target.checked);
                config.setItem(idName, e.target.checked);
                caap.setDisplay("caapDivObject", idName + '_hide', e.target.checked, true);
                caap.setDisplay("caapDivObject", idName + '_not_hide', !e.target.checked, true);
                switch (idName) {
                case "AutoStatAdv" :
                    $u.log(9, "AutoStatAdv");
                    state.setItem("statsMatch", true);
                    break;
                case "backgroundCA" :
                    if (e.target.checked) {
                        $j("body").css({
                            'background-image'    : "url('http://image4.castleagegame.com/graphics/guild_webpage_bg.jpg')",
                            'background-position' : 'center top',
                            'background-repeat'   : 'no-repeat',
                            'background-color'    : 'black',
                            'margin'              : '0px'
                        });

                        $j(".UIStandardFrame_Container").css({
                            'margin'              : '0px auto 0px'
                        });

                        $j(".UIStandardFrame_Content").css({
                            'background-image'    : "url('http://image4.castleagegame.com/graphics/ws_middle.jpg')",
                            'padding'             : '0px 10px'
                        });

                        $j("#pagelet_canvas_footer_content").css({
                            'display'    : 'none'
                        });
                    } else {
                        $j("body").css({
                            'background-image'    : '',
                            'background-position' : '',
                            'background-repeat'   : '',
                            'background-color'    : '',
                            'margin'              : ''
                        });

                        $j(".UIStandardFrame_Container").css({
                            'margin'              : '20px auto 0px'
                        });

                        $j(".UIStandardFrame_Content").css({
                            'background-image'    : '',
                            'padding'             : ''
                        });

                        $j("#pagelet_canvas_footer_content").css({
                            'display'    : 'block'
                        });
                    }

                    styleXY = caap.getControlXY(true);
                    caap.caapDivObject.css({
                        top  : styleXY.y + 'px',
                        left : styleXY.x + 'px'
                    });

                    styleXY = caap.getDashboardXY(true);
                    caap.caapTopObject.css({
                        top  : styleXY.y + 'px',
                        left : styleXY.x + 'px'
                    });

                    break;
                case "injectCATools" :
                    if (e.target.checked) {
                        if (caap.domain.which === 0) {
                            caap.injectCATools();
                        }
                    } else {
                        if (caap.domain.which === 0) {
                            caap.reloadCastleAge(true);
                        }
                    }

                    break;
                case "HideAds" :
                    $u.log(9, "HideAds");
                    $j('.UIStandardFrame_SidebarAds').css('display', e.target.checked ? 'none' : 'block');
                    break;
                case "HideAdsIframe" :
                    $u.log(9, "HideAdsIframe");
                    $j("iframe[name*='fb_iframe']").eq(0).parent().css('display', e.target.checked ? 'none' : 'block');
                    caap.dashboardXY.x = state.getItem('caap_top_menuLeft', '');
                    caap.dashboardXY.y = state.getItem('caap_top_menuTop', $j(caap.dashboardXY.selector).offset().top - 10);
                    styleXY = caap.getDashboardXY();
                    caap.caapTopObject.css({
                        top  : styleXY.y + 'px',
                        left : styleXY.x + 'px'
                    });

                    break;
                case "HideFBChat" :
                    $u.log(9, "HideFBChat");
                    $j("div[class*='fbDockWrapper fbDockWrapperBottom fbDockWrapperRight']").css('display', e.target.checked ? 'none' : 'block');
                    break;
                case "IgnoreBattleLoss" :
                    $u.log(9, "IgnoreBattleLoss");
                    if (e.target.checked) {
                        $u.log(1, "Ignore Battle Losses has been enabled.");
                    }

                    break;
                case "SetTitle" :
                case "SetTitleAction" :
                case "SetTitleName" :
                    $u.log(9, idName);
                    if (e.target.checked) {
                        if (config.getItem('SetTitleAction', false)) {
                            d = $j('#caap_activity_mess', caap.caapDivObject).html();
                            if (d) {
                                DocumentTitle += d.replace("Activity: ", '') + " - ";
                            }
                        }

                        if (config.getItem('SetTitleName', false)) {
                            DocumentTitle += caap.stats['PlayerName'] + " - ";
                        }

                        document.title = DocumentTitle + caap.documentTitle;
                    } else {
                        document.title = caap.documentTitle;
                    }

                    break;
                case "unlockMenu" :
                    $u.log(9, "unlockMenu");
                    if (e.target.checked) {
                        $j(":input[id^='caap_']", caap.caapDivObject).attr({disabled: true});
                        $j(":input[id^='caap_']", caap.caapTopObject).attr({disabled: true});
                        caap.caapDivObject.css('cursor', 'move').draggable({
                            stop: function () {
                                caap.saveControlXY();
                            }
                        });

                        caap.caapTopObject.css('cursor', 'move').draggable({
                            stop: function () {
                                caap.saveDashboardXY();
                            }
                        });
                    } else {
                        caap.caapDivObject.css('cursor', '').draggable("destroy");
                        caap.caapTopObject.css('cursor', '').draggable("destroy");
                        $j(":input[id^='caap_']", caap.caapDivObject).attr({disabled: false});
                        $j(":input[id^='caap_']", caap.caapTopObject).attr({disabled: false});
                    }

                    break;
                case "AutoElite" :
                    $u.log(9, "AutoElite");
                    schedule.setItem('AutoEliteGetList', 0);
                    schedule.setItem('AutoEliteReqNext', 0);
                    state.setItem('AutoEliteEnd', '');
                    state.setItem("MyEliteTodo", []);
                    if (!state.getItem('FillArmy', false)) {
                        state.setItem(caap.friendListType.giftc.name + 'Requested', false);
                        state.setItem(caap.friendListType.giftc.name + 'Responded', []);
                    }

                    if (caap.domain.which === 2 && e.target.checked) {
                        $j("#caap_EnableArmy", caap.caapDivObject).attr("checked", config.setItem("EnableArmy", true));
                        caap.setDisplay("caapDivObject", "EnableArmy" + '_hide', true, true);
                    }

                    break;
                case "AchievementMode" :
                    $u.log(9, "AchievementMode");
                    monster.flagReview();
                    break;
                case "StatSpendAll" :
                    $u.log(9, "StatSpendAll");
                    state.setItem("statsMatch", true);
                    state.setItem("autoStatRuleLog", true);
                    break;
                case "enableTitles" :
                case "goblinHinting" :
                    if (e.target.checked) {
                        spreadsheet.clear();
                        spreadsheet.load();
                    }

                    break;
                case "ignoreClerics" :
                case "chooseIgnoredMinions" :
                    state.setItem('targetGuildMonster', {});
                    state.setItem('staminaGuildMonster', 0);
                    schedule.setItem("guildMonsterReview", 0);
                    break;
                case "festivalTower" :
                    monster.flagFullReview();
                    break;
                default :
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkBoxListener: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        colorDiv: {},

        colorUpdate: function () {
            try {
                var color = state.getItem('caapPause', 'none') === 'none' ? state.getItem('StyleBackgroundLight', 1) : state.getItem('StyleBackgroundDark', 1),
                    bgo   = state.getItem('caapPause', 'none') === 'none' ? state.getItem('StyleOpacityLight', 1) : state.getItem('StyleOpacityDark', 1),
                    btc   = $u.bestTextColor(color),
                    chk1  = caap.caapDivObject.css('background-color'),
                    chk2  = caap.caapDivObject.css('color');

                if ($u.hex2rgb(color).color !== chk1) {
                    $u.log(4, "Update background color", color, chk1);
                    caap.caapDivObject.css({
                        'background' : color,
                        'opacity'    : bgo,
                        'color'      : btc
                    });

                    caap.caapTopObject.css({
                        'background' : color,
                        'opacity'    : bgo,
                        'color'      : btc
                    });

                    if ($u.hex2rgb(btc).color !== chk2) {
                        $u.log(4, "Update text color", btc, chk2);
                        $j("th[data-type='bestcolor'],td[data-type='bestcolor']", caap.caapTopObject).css({'color': btc});
                    }
                }

                return true;
            } catch (err) {
                $u.error("ERROR in colorUpdate: " + err);
                return false;
            }
        },

        colorBoxClickListener: function (e) {
            try {
                var id = e.target.id.stripCaap(),
                    t  = $j(e.target);

                function fb1call(color) {
                    state.setItem("StyleBackgroundLight", color);
                    caap.colorUpdate();
                }

                function fb2call(color) {
                    state.setItem("StyleBackgroundDark", color);
                    caap.colorUpdate();
                }

                function d1call(el_id, color) {
                    var s = el_id.stripCaap(),
                        v = $u.addSharp(color).toUpperCase(),
                        c = '';

                    if (color !== 'close') {
                        $u.log(1, 'Change: setting "' + s + '" to ', v);
                        config.setItem(s, v);
                    } else {
                        c = config.getItem(s, v);
                        switch (s) {
                        case "CustStyleBackgroundLight" :
                            state.setItem("StyleBackgroundLight", c);
                            caap.colorUpdate();
                            break;
                        case "CustStyleBackgroundDark" :
                            state.setItem("StyleBackgroundDark", c);
                            caap.colorUpdate();
                            break;
                        default :
                        }

                        caap.colorDiv[e.target.id][3].val(c);
                        caap.colorDiv[e.target.id][3].css({
                            background : e.target.value,
                            color      : $u.bestTextColor(e.target.value)
                        });
                    }

                    delete caap.colorDiv[el_id];
                }

                if (!$u.hasContent(caap.colorDiv[e.target.id])) {
                    switch (id) {
                    case "CustStyleBackgroundLight" :
                        caap.colorDiv[e.target.id] = t.colorInput(fb1call, d1call).concat(t);
                        break;
                    case "CustStyleBackgroundDark" :
                        caap.colorDiv[e.target.id] = t.colorInput(fb2call, d1call).concat(t);
                        break;
                    default :
                        caap.colorDiv[e.target.id] = t.colorInput(function () {}, d1call).concat(t);
                    }

                    caap.colorDiv[e.target.id][1].css({
                        background : e.target.value,
                        color      : $u.bestTextColor(e.target.value),
                        padding    : "5px",
                        border     : "2px solid #000000"
                    });
                }

                return true;
            } catch (err) {
                $u.error("ERROR in colorBoxClickListener: " + err);
                return false;
            }
        },

        colorBoxChangeListener: function (e) {
            try {
                e.target.value = $u.addSharp(e.target.value).toUpperCase();
                caap.colorBoxListener(e);
                return true;
            } catch (err) {
                $u.error("ERROR in colorBoxChangeListener: " + err);
                return false;
            }
        },

        colorBoxListener: function (e) {
            try {
                var id  = e.target.id.stripCaap(),
                    val = $u.addSharp(e.target.value).toUpperCase(),
                    c   = new $u.ColorConv();

                e.target.style.backgroundColor = val;
                c.setRgb(e.target.style.backgroundColor);
                e.target.style.color = $u.bestTextColor(c.getHex());
                $u.log(1, 'Change: setting "' + id + '" to ', val);
                config.setItem(id, val);
                if ($u.hasContent(caap.colorDiv[e.target.id])) {
                    caap.colorDiv[e.target.id][2].setColor(val);
                }

                switch (id) {
                case "CustStyleBackgroundLight" :
                    state.setItem("StyleBackgroundLight", val);
                    caap.colorUpdate();
                    break;
                case "CustStyleBackgroundDark" :
                    state.setItem("StyleBackgroundDark", val);
                    caap.colorUpdate();
                    break;
                default :
                }

                return true;
            } catch (err) {
                $u.error("ERROR in colorBoxListener: " + err);
                return false;
            }
        },

        textBoxListener: function (e) {
            try {
                var idName = e.target.id.stripCaap();
                $u.log(1, 'Change: setting "' + idName + '" to ', String(e.target.value));
                if (/AttrValue+/.test(idName)) {
                    state.setItem("statsMatch", true);
                }

                config.setItem(idName, String(e.target.value));
                return true;
            } catch (err) {
                $u.error("ERROR in textBoxListener: " + err);
                return false;
            }
        },

        numberBoxListener: function (e) {
            try {
                var idName  = e.target.id.stripCaap(),
                    number  = null,
                    message = '';

                if ($u.isNaN(e.target.value) && e.target.value !== '') {
                    message = "<div style='text-align: center;'>";
                    message += "You entered:<br /><br />";
                    message += "'" + e.target.value + "'<br /><br />";
                    message += "Please enter a number or leave blank.";
                    message += "</div>";
                    $j().alert(message);
                    number = '';
                } else {
                    number = $u.isNaN(e.target.value) && e.target.value === '' ? '' : e.target.value.parseFloat();
                }

                $u.log(1, 'Change: setting "' + idName + '" to ', number);
                if (/AttrValue+/.test(idName)) {
                    state.setItem("statsMatch", true);
                } else if (/MaxToFortify/.test(idName)) {
                    monster.flagFullReview();
                } else if (/Chain/.test(idName)) {
                    state.getItem('BattleChainId', 0);
                } else if (idName === 'DebugLevel') {
                    $u.set_log_level(e.target.value.parseInt());
                } else if (idName === "IgnoreMinionsBelow") {
                    state.setItem('targetGuildMonster', {});
                    state.setItem('staminaGuildMonster', 0);
                    schedule.setItem("guildMonsterReview", 0);
                }

                e.target.value = config.setItem(idName, number);
                return true;
            } catch (err) {
                $u.error("ERROR in numberBoxListener: " + err);
                return false;
            }
        },

        dropBoxListener: function (e) {
            try {
                if (e.target.selectedIndex > 0) {
                    var idName = e.target.id.stripCaap(),
                        value  = e.target.options[e.target.selectedIndex].value,
                        title  = e.target.options[e.target.selectedIndex].title;

                    $u.log(1, 'Change: setting "' + idName + '" to "' + value + '" with title "' + title + '"');
                    config.setItem(idName, value);
                    e.target.title = title;
                    if (idName.hasIndexOf('When')) {
                        caap.setDisplay("caapDivObject", idName + '_hide', value !== 'Never');
                        if (!idName.hasIndexOf('Quest')) {
                            //if (!idName.hasIndexOf('Arena')) {
                            caap.setDisplay("caapDivObject", idName + 'XStamina_hide', value === 'At X Stamina');
                            //}

                            caap.setDisplay("caapDivObject", 'WhenBattleStayHidden_hide', ((config.getItem('WhenBattle', 'Never') === 'Stay Hidden' && config.getItem('WhenMonster', 'Never') !== 'Stay Hidden')));
                            caap.setDisplay("caapDivObject", 'WhenMonsterStayHidden_hide', ((config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && config.getItem('WhenBattle', 'Never') !== 'Stay Hidden')));
                            caap.setDisplay("caapDivObject", 'DemiPointsFirst_hide', (config.getItem('WhenBattle', 'Never') === 'Demi Points Only'));
                            switch (idName) {
                            case 'WhenBattle':
                                if (value === 'Never') {
                                    caap.setDivContent('battle_mess', 'Battle off');
                                } else {
                                    caap.setDivContent('battle_mess', '');
                                }

                                break;
                            case 'WhenMonster':
                                if (value === 'Never') {
                                    caap.setDivContent('monster_mess', 'Monster off');
                                } else {
                                    caap.setDivContent('monster_mess', '');
                                }

                                break;
                            case 'WhenGuildMonster':
                                if (value === 'Never') {
                                    caap.setDivContent('guild_monster_mess', 'Guild Monster off');
                                } else {
                                    caap.setDivContent('guild_monster_mess', '');
                                }

                                break;
                            /*case 'WhenArena':
                                if (value === 'Never') {
                                    caap.setDivContent('arena_mess', 'Arena off');
                                } else {
                                    caap.setDivContent('arena_mess', '');
                                }

                                break;*/
                            default:
                            }
                        } else {
                            caap.setDisplay("caapDivObject", idName + 'XEnergy_hide', value === 'At X Energy');
                        }
                    } else if (idName === 'QuestArea' || idName === 'QuestSubArea' || idName === 'WhyQuest') {
                        state.setItem('AutoQuest', caap.newAutoQuest());
                        caap.clearAutoQuest();
                        if (idName === 'QuestArea') {
                            switch (value) {
                            case "Quest" :
                                caap.changeDropDownList('QuestSubArea', caap.landQuestList);
                                break;
                            case "Demi Quests" :
                                caap.changeDropDownList('QuestSubArea', caap.demiQuestList);
                                break;
                            case "Atlantis" :
                                caap.changeDropDownList('QuestSubArea', caap.atlantisQuestList);
                                break;
                            default :
                            }
                        }
                    } else if (idName === 'BattleType') {
                        state.getItem('BattleChainId', 0);
                    } else if (idName === 'AutoBless' && value === 'None') {
                        schedule.setItem('BlessingTimer', 0);
                    } else if (idName === 'festivalBless' && value === 'None') {
                        schedule.setItem('festivalBlessTimer', 0);
                    } else if (idName === 'TargetType') {
                        state.getItem('BattleChainId', 0);
                        caap.setDisplay("caapDivObject", 'TargetTypeFreshmeat_hide', value === "Freshmeat");
                        caap.setDisplay("caapDivObject", 'TargetTypeUserId_hide', value === "Userid List");
                        caap.setDisplay("caapDivObject", 'TargetTypeRaid_hide', value === "Raid");
                    } else if (idName === 'LevelUpGeneral') {
                        caap.setDisplay("caapDivObject", idName + '_hide', value !== 'Use Current');
                    } else if (/Attribute?/.test(idName)) {
                        state.setItem("statsMatch", true);
                    /*} else if (idName === 'chainArena') {
                        caap.setDisplay("caapDivObject", idName + '_hide', value !== '0');*/
                    } else if (idName === 'DisplayStyle') {
                        caap.setDisplay("caapDivObject", idName + '_hide', value === 'Custom');
                        switch (value) {
                        case "Original" :
                            state.setItem("StyleBackgroundLight", "#EFEFFF");
                            state.setItem("StyleBackgroundDark", "#FEEFFF");
                            state.setItem("StyleOpacityLight", 1);
                            state.setItem("StyleOpacityDark", 1);
                            break;
                        case "None" :
                            state.setItem("StyleBackgroundLight", "#FFFFFF");
                            state.setItem("StyleBackgroundDark", "#FFFFFF");
                            state.setItem("StyleOpacityLight", 1);
                            state.setItem("StyleOpacityDark", 1);
                            break;
                        case "Custom" :
                            state.setItem("StyleBackgroundLight", config.getItem("CustStyleBackgroundLight", "#E0C691"));
                            state.setItem("StyleBackgroundDark", config.getItem("CustStyleBackgroundDark", "#B09060"));
                            state.setItem("StyleOpacityLight", config.getItem("CustStyleOpacityLight", 1));
                            state.setItem("StyleOpacityDark", config.getItem("CustStyleOpacityDark", 1));
                            break;
                        default :
                            state.setItem("StyleBackgroundLight", "#E0C691");
                            state.setItem("StyleBackgroundDark", "#B09060");
                            state.setItem("StyleOpacityLight", 1);
                            state.setItem("StyleOpacityDark", 1);
                        }

                        caap.colorUpdate();
                    }
                }

                return true;
            } catch (err) {
                $u.error("ERROR in dropBoxListener: " + err);
                return false;
            }
        },

        textAreaListener: function (e) {
            try {
                var idName = e.target.id.stripCaap(),
                    value  = e.target.value;

                function commas() {
                    // Change the boolean from false to true to enable BoJangles patch or
                    // set the hidden variable in localStorage
                    if (config.getItem("TextAreaCommas", false)) {
                        // This first removes leading and trailing white space and/or commas before
                        // both removing and inserting commas where appropriate.
                        // Handles adding a single user id as well as replacing the entire list.
                        e.target.value = value.replace(/(^[,\s]+)|([,\s]+$)/g, "").replace(/[,\s]+/g, ",");
                    }
                }

                $u.log(1, 'Change: setting "' + idName + '" to ', e.target.value);
                config.setItem(idName, e.target.value);
                switch (idName) {
                case "orderGuildMinion":
                case "orderGuildMonster":
                    state.setItem('targetGuildMonster', {});
                    state.setItem('staminaGuildMonster', 0);
                    schedule.setItem("guildMonsterReview", 0);
                    break;
                case "orderbattle_monster":
                case "orderraid":
                    monster.flagFullReview();
                    break;
                case "BattleTargets":
                    state.setItem('BattleChainId', 0);
                    commas();
                    break;
                case "EliteArmyList":
                    commas();
                    break;
                default:
                }

                return true;
            } catch (err) {
                $u.error("ERROR in textAreaListener: " + err);
                return false;
            }
        },

        pauseListener: function (e) {
            var bgc = state.getItem('StyleBackgroundDark', '#B09060'),
                bgo = state.getItem('StyleOpacityDark', 1),
                btc = $u.bestTextColor(bgc),
                chk = $u.bestTextColor(state.getItem('StyleBackgroundLight', '#E0C691'));

            caap.caapDivObject.css({
                'background' : bgc,
                'color'      : btc,
                'opacity'    : bgo,
                'z-index'    : '3'
            });

            caap.caapTopObject.css({
                'background' : bgc,
                'color'      : btc,
                'opacity'    : bgo
            });

            if (btc !== chk) {
                $j("th[data-type='bestcolor'],td[data-type='bestcolor']", caap.caapTopObject).css({'color': btc});
            }

            $j('#caapPaused', caap.caapDivObject).css('display', 'block');
            state.setItem('caapPause', 'block');
        },

        restartListener: function (e) {
            var bgc = state.getItem('StyleBackgroundLight', '#E0C691'),
                bgo = state.getItem('StyleOpacityLight', 1),
                btc = $u.bestTextColor(bgc),
                chk = $u.bestTextColor(state.getItem('StyleBackgroundDark', '#B09060'));

            $j('#caapPaused', caap.caapDivObject).css('display', 'none');
            caap.caapDivObject.css({
                'background' : bgc,
                'color'      : btc,
                'opacity'    : bgo,
                'z-index'    : state.getItem('caap_div_zIndex', '2'),
                'cursor'     : ''
            });

            caap.caapTopObject.css({
                'background' : bgc,
                'color'      : btc,
                'opacity'    : bgo,
                'z-index'    : state.getItem('caap_top_zIndex', '1'),
                'cursor'     : ''
            });

            if (btc !== chk) {
                $j("th[data-type='bestcolor'],td[data-type='bestcolor']", caap.caapTopObject).css({'color': btc});
            }

            $j('#unlockMenu', caap.caapDivObject).attr('checked', false);
            state.setItem('caapPause', 'none');
            state.setItem('ReleaseControl', true);
            state.setItem('resetselectMonster', true);
            caap.waitingForDomLoad = false;
        },

        resetMenuLocationListener: function (e) {
            var caap_divXY = {},
                caap_topXY = {};

            state.deleteItem('caap_div_menuLeft');
            state.deleteItem('caap_div_menuTop');
            state.deleteItem('caap_div_zIndex');
            caap.controlXY.x = '';
            caap.controlXY.y = $j(caap.controlXY.selector).offset().top;
            caap_divXY = caap.getControlXY(true);
            caap.caapDivObject.css({
                'cursor'  : '',
                'z-index' : '2',
                'top'     : caap_divXY.y + 'px',
                'left'    : caap_divXY.x + 'px'
            });

            state.deleteItem('caap_top_menuLeft');
            state.deleteItem('caap_top_menuTop');
            state.deleteItem('caap_top_zIndex');
            caap.dashboardXY.x = '';
            caap.dashboardXY.y = $j(caap.dashboardXY.selector).offset().top - 10;
            caap_topXY = caap.getDashboardXY(true);
            caap.caapTopObject.css({
                'cursor' : '',
                'z-index' : '1',
                'top' : caap_topXY.y + 'px',
                'left' : caap_topXY.x + 'px'
            });

            $j(":input[id^='caap_']", caap.caapDivObject).attr({disabled: false});
            $j(":input[id^='caap_']", caap.caapTopObject).attr({disabled: false});
        },

        foldingBlockListener: function (e) {
            try {
                var subId  = e.target.id.replace(/_Switch/i, ''),
                    subDiv = document.getElementById(subId);

                if (subDiv.style.display === "block") {
                    $u.log(2, 'Folding: ', subId);
                    subDiv.style.display = "none";
                    e.target.innerHTML = e.target.innerHTML.replace(/-/, '+');
                    state.setItem('Control_' + subId.stripCaap(), "none");
                } else {
                    $u.log(2, 'Unfolding: ', subId);
                    subDiv.style.display = "block";
                    e.target.innerHTML = e.target.innerHTML.replace(/\+/, '-');
                    state.setItem('Control_' + subId.stripCaap(), "block");
                }

                return true;
            } catch (err) {
                $u.error("ERROR in foldingBlockListener: " + err);
                return false;
            }
        },

        whatClickedURLListener: function (event) {
            try {
                var obj = event.target;
                while (obj && !obj.href) {
                    obj = obj.parentNode;
                }

                if (obj && obj.href) {
                    state.setItem('clickUrl', obj.href);
                    schedule.setItem('clickedOnSomething', 0);
                    caap.waitingForDomLoad = true;
                    //$u.log(9, 'globalContainer', obj.href);
                } else {
                    if (obj && !obj.href) {
                        $u.warn('whatClickedURLListener globalContainer no href', obj);
                    }
                }
            } catch (err) {
                $u.error("ERROR in whatClickedURLListener: " + err, event);
            }
        },

        whatFriendBox: function (event) {
            try {
                var obj    = event.target,
                    userID = 0;

                while (obj && !obj.id) {
                    obj = obj.parentNode;
                }

                if (obj && obj.id && obj.onclick) {
                    userID = obj.onclick.toString().regex(/friendKeepBrowse\('(\d+)'/);
                    state.setItem('clickUrl', caap.domain.link + '/keep.php' + ($u.isNumber(userID) && userID > 0 ? "?casuser=" + userID : ''));
                    schedule.setItem('clickedOnSomething', 0);
                    caap.waitingForDomLoad = true;
                }
            } catch (err) {
                $u.error("ERROR in whatFriendBox: " + err, event);
            }
        },

        guildMonsterEngageListener: function (event) {
            $u.log(4, "engage guild_battle_monster.php");
            state.setItem('clickUrl', caap.domain.link + '/guild_battle_monster.php');
            schedule.setItem('clickedOnSomething', 0);
            caap.waitingForDomLoad = true;
        },

        windowResizeListener: function (e) {
            if (caap.domain.which >= 0) {
                var caap_divXY = caap.getControlXY(),
                    caap_topXY = caap.getDashboardXY();

                caap.caapDivObject.css('left', caap_divXY.x + 'px');
                caap.caapTopObject.css('left', caap_topXY.x + 'px');
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        goldTimeListener: function (e) {
            var tArr = $u.setContent($u.setContent($j(e.target).text(), '').regex(/(\d+):(\d+)/), []);
            if (!$u.hasContent(tArr) || tArr.length !== 2) {
                return;
            }

            caap.stats['gold']['ticker'] = tArr;
            if (tArr[1] === 0 || $u.get_log_level() >= 4) {
                $u.log(3, "goldTimeListenerr", tArr[0] + ":" + (tArr[1] < 10 ? '0' + tArr[1] : tArr[1]));
            }
        },

        energyListener: function (e) {
            var num = $u.setContent($u.setContent($j(e.target).text(), '').parseInt(), -1);
            if (num < 0 || $u.isNaN(num)) {
                return;
            }

            caap.stats['energy'] = $u.setContent(caap.getStatusNumbers(num + "/" + caap.stats['energy']['max']), caap.stats['energy']);
            caap.stats['energyT'] = $u.setContent(caap.getStatusNumbers(num + "/" + caap.stats['energyT']['max']), caap.stats['energy']);
            $u.log(3, "energyListener", num);
        },

        healthListener: function (e) {
            var num = $u.setContent($u.setContent($j(e.target).text(), '').parseInt(), -1);
            if (num < 0 || $u.isNaN(num)) {
                return;
            }

            caap.stats['health'] = $u.setContent(caap.getStatusNumbers(num + "/" + caap.stats['health']['max']), caap.stats['health']);
            caap.stats['healthT'] = $u.setContent(caap.getStatusNumbers(num + "/" + caap.stats['healthT']['max']), caap.stats['healthT']);
            $u.log(3, "healthListener", num);
        },

        staminaListener: function (e) {
            var num = $u.setContent($u.setContent($j(e.target).text(), '').parseInt(), -1);
            if (num < 0 || $u.isNaN(num)) {
                return;
            }

            caap.stats['stamina'] = $u.setContent(caap.getStatusNumbers(num + "/" + caap.stats['stamina']['max']), caap.stats['stamina']);
            caap.stats['staminaT'] = $u.setContent(caap.getStatusNumbers(num + "/" + caap.stats['staminaT']['max']), caap.stats['staminaT']);
            $u.log(3, "staminaListener", num);
        },
        /*jslint sub: false */

        caTools: false,

        reBind: function () {
            try {
                $j('a', caap.globalContainer).unbind('click', caap.whatClickedURLListener).bind('click', caap.whatClickedURLListener);
                $j("div[id*='friend_box_']", caap.globalContainer).unbind('click', caap.whatFriendBox).bind('click', caap.whatFriendBox);
                $j("span[id*='gold_time_value']", caap.globalContainer).unbind('DOMSubtreeModified', caap.goldTimeListener).bind('DOMSubtreeModified', caap.goldTimeListener);
                $j("span[id*='energy_current_value']", caap.globalContainer).unbind('DOMSubtreeModified', caap.energyListener).bind('DOMSubtreeModified', caap.energyListener);
                $j("span[id*='stamina_current_value']", caap.globalContainer).unbind('DOMSubtreeModified', caap.staminaListener).bind('DOMSubtreeModified', caap.staminaListener);
                $j("span[id*='health_current_value']", caap.globalContainer).unbind('DOMSubtreeModified', caap.healthListener).bind('DOMSubtreeModified', caap.healthListener);
                return true;
            } catch (err) {
                $u.error("ERROR in whatFriendBox: " + err, event);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        addListeners: function () {
            try {
                if (!$u.hasContent(caap.caapDivObject)) {
                    throw "Unable to find div for caap_div";
                }

                $j(window).bind('resize', caap.windowResizeListener);
                $j('input:checkbox[id^="caap_"]', caap.caapDivObject).change(caap.checkBoxListener);
                $j('input[data-subtype="text"]', caap.caapDivObject).change(caap.textBoxListener);
                $j('input[data-subtype="color"]', caap.caapDivObject).keyup(caap.colorBoxListener).change(caap.colorBoxChangeListener).click(caap.colorBoxClickListener);
                $j('input[data-subtype="number"]', caap.caapDivObject).change(caap.numberBoxListener);
                $j('#unlockMenu', caap.caapDivObject).change(caap.checkBoxListener);
                $j('select[id^="caap_"]', caap.caapDivObject).change(caap.dropBoxListener);
                $j('textarea[id^="caap_"]', caap.caapDivObject).change(caap.textAreaListener);
                $j('a[id^="caap_Switch"]', caap.caapDivObject).click(caap.foldingBlockListener);
                $j('#caap_ImportData', caap.caapDivObject).click(function () {
                    var val = $u.setContent($j('#caap_DataSelect', caap.caapDivObject).val(), 'Config');
                    caap.importDialog(val);
                });

                $j('#caap_ExportData', caap.caapDivObject).click(function () {
                    var val = $u.setContent($j('#caap_DataSelect', caap.caapDivObject).val(), 'Config');
                    caap.exportDialog(caap.exportTable[val]['export'](), val);
                });

                $j('#caap_DeleteData', caap.caapDivObject).click(function () {
                    var val = $u.setContent($j('#caap_DataSelect', caap.caapDivObject).val(), 'Config');
                    caap.deleteDialog(val);
                });

                $j('#caap_ActionList', caap.caapDivObject).click(caap.actionDialog);
                $j('#caap_FillArmy', caap.caapDivObject).click(function (e) {
                    state.setItem("FillArmy", true);
                    state.setItem("ArmyCount", 0);
                    state.setItem('FillArmyList', []);
                    state.setItem(caap.friendListType.giftc.name + 'Responded', []);
                    state.setItem(caap.friendListType.facebook.name + 'Responded', false);

                });

                $j('#caap_ResetMenuLocation', caap.caapDivObject).click(caap.resetMenuLocationListener);
                $j('#caap_resetElite', caap.caapDivObject).click(function (e) {
                    schedule.setItem('AutoEliteGetList', 0);
                    schedule.setItem('AutoEliteReqNext', 0);
                    state.setItem('AutoEliteEnd', '');
                    if (!state.getItem('FillArmy', false)) {
                        state.setItem(caap.friendListType.giftc.name + 'Requested', false);
                        state.setItem(caap.friendListType.giftc.name + 'Responded', []);
                    }
                });

                $j('#caapRestart', caap.caapDivObject).click(caap.restartListener);
                $j('#caap_control', caap.caapDivObject).mousedown(caap.pauseListener);
                $j('#stopAutoQuest', caap.caapDivObject).click(function (e) {
                    $u.log(1, 'Change: setting stopAutoQuest and go to Manual');
                    caap.manualAutoQuest();
                });

                $j(".UIStandardFrame_Content").bind('DOMNodeInserted', function (event) {
                    if (event.target.id !== 'CA-Tools') {
                        return;
                    }

                    $u.log(1, "CA-Tools detected! Changing layout.");
                    caap.caTools = true;
                    $j('#CA-Tools a').bind('click', caap.whatClickedURLListener);
                    window.setTimeout(function () {
                        var styleXY = caap.getControlXY(true, true);
                        caap.caapDivObject.css({
                            top  : styleXY.y + 'px',
                            left : styleXY.x + 'px'
                        });

                        styleXY = caap.getDashboardXY(true);
                        caap.caapTopObject.css({
                            top  : styleXY.y + 'px',
                            left : styleXY.x + 'px'
                        });
                    }, 2000);
                });

                caap.globalContainer = $j('#' + caap.domain.id[caap.domain.which] + 'globalContainer');
                if (!$u.hasContent(caap.globalContainer)) {
                    throw 'Global Container not found';
                }

                // Fires once when page loads
                $j('a', caap.globalContainer).bind('click', caap.whatClickedURLListener);
                $j("div[id*='friend_box_']", caap.globalContainer).bind('click', caap.whatFriendBox);
                $j("span[id*='gold_time_value']", caap.globalContainer).bind('DOMSubtreeModified', caap.goldTimeListener);
                $j("span[id*='energy_current_value']", caap.globalContainer).bind('DOMSubtreeModified', caap.energyListener);
                $j("span[id*='stamina_current_value']", caap.globalContainer).bind('DOMSubtreeModified', caap.staminaListener);
                $j("span[id*='health_current_value']", caap.globalContainer).bind('DOMSubtreeModified', caap.healthListener);
                //arena.addListeners();

                caap.globalContainer.bind('DOMNodeInserted', function (event) {
                    var tId        = $u.hasContent(event.target.id) ? event.target.id.replace('app46755028429_', '') : event.target.id,
                        targetList = [
                            "app_body",
                            "index",
                            "keep",
                            "generals",
                            "battle_monster",
                            "battle",
                            "battlerank",
                            "battle_train",
                            "quests",
                            "raid",
                            "party",
                            "symbolquests",
                            "alchemy",
                            "goblin_emp",
                            "soldiers",
                            "item",
                            "land",
                            "magic",
                            "oracle",
                            "symbols",
                            "treasure_chest",
                            "gift",
                            "war_council",
                            "apprentice",
                            "news",
                            "friend_page",
                            "party",
                            "comments",
                            "army",
                            "army_member",
                            "army_news_feed",
                            "army_reqs",
                            "guild",
                            "guild_panel",
                            "guild_shop",
                            "guild_class",
                            "guild_formation",
                            "guild_monster_summon",
                            "guild_current_battles",
                            "guild_current_monster_battles",
                            "guild_battle_monster",
                            "guild_monster_summon_list",
                            "arena",
                            "arena_battle",
                            "specialmembership",
                            "festival_home",
                            "festival_feat_nav",
                            "festival_challenge",
                            "festival_achievements",
                            "festival_battle_home",
                            "festival_battle_rank",
                            "festival_tower",
                            "festival_battle_monster"
                        ];

                    // Uncomment this to see the id of domNodes that are inserted
                    /*
                    if (event.target.id && !event.target.id.match(/globalContainer/) && !event.target.id.match(/time/i) && !event.target.id.match(/ticker/i) && !event.target.id.match(/caap/i)) {
                        caap.setDivContent('debug2_mess', tId);
                        alert(event.target.id);
                    }
                    */

                    if (targetList.hasIndexOf(tId)) {
                        $u.log(4, "DOM load target matched", tId);
                        caap.waitingForDomLoad = false;
                        caap.incrementPageLoadCounter();
                        caap.reBind();
                        if (caap.domain.which === 0 && config.getItem('HideAdsIframe', false)) {
                            $j("iframe[name*='fb_iframe']").eq(0).parent().css('display', 'none');
                        }

                        caap.delayMain = true;
                        window.setTimeout(function () {
                            caap.checkResults();
                            caap.delayMain = false;
                        }, 600);
                    }

                    // Reposition the dashboard
                    if (event.target.id === caap.dashboardXY.selector.replace("#", '')) {
                        caap.caapTopObject.css('left', caap.getDashboardXY().x + 'px');
                    }
                });

                return true;
            } catch (err) {
                $u.error("ERROR in addListeners: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          CHECK RESULTS
        // Called each iteration of main loop, this does passive checks for
        // results to update other functions.
        /////////////////////////////////////////////////////////////////////

        pageList: {
            'castle_age': {
                signaturePic: 'gif',
                CheckResultsFunction: 'checkResults_index'
            },
            'index': {
                signaturePic: 'gif',
                CheckResultsFunction: 'checkResults_index'
            },
            'battle_monster': {
                signaturePic: 'tab_monster_list_on.gif',
                CheckResultsFunction: 'checkResults_fightList',
                subpages: ['onMonster']
            },
            'onMonster': {
                signaturePic: 'tab_monster_active.gif',
                CheckResultsFunction: 'checkResults_viewFight'
            },
            'raid': {
                signaturePic: 'tab_raid_on.gif',
                CheckResultsFunction: 'checkResults_fightList',
                subpages: ['onRaid']
            },
            'onRaid': {
                signaturePic: 'raid_map',
                CheckResultsFunction : 'checkResults_viewFight'
            },
            'land': {
                signaturePic: 'tab_land_on.gif',
                CheckResultsFunction: 'checkResults_land'
            },
            'generals': {
                signaturePic: 'tab_generals_on.gif',
                CheckResultsFunction: 'checkResults_generals'
            },
            'quests': {
                signaturePic: 'tab_quest_on.gif',
                CheckResultsFunction: 'checkResults_quests',
                subpages: ['earlyQuest']
            },
            'earlyQuest': {
                signaturePic: 'quest_back_1.jpg',
                CheckResultsFunction: 'checkResults_quests'
            },
            'symbolquests': {
                signaturePic: 'demi_quest_on.gif',
                CheckResultsFunction: 'checkResults_quests'
            },
            'monster_quests': {
                signaturePic: 'tab_atlantis_on.gif',
                CheckResultsFunction: 'checkResults_quests'
            },
            'gift_accept': {
                signaturePic: 'gif',
                CheckResultsFunction: 'checkResults_gift_accept'
            },
            'army': {
                signaturePic: 'invite_on.gif',
                CheckResultsFunction: 'checkResults_army'
            },
            'keep': {
                signaturePic: 'tab_stats_on.gif',
                CheckResultsFunction: 'checkResults_keep'
            },
            'oracle': {
                signaturePic: 'oracle_on.gif',
                CheckResultsFunction: 'checkResults_oracle'
            },
            'alchemy': {
                signaturePic: 'tab_alchemy_on.gif',
                CheckResultsFunction: 'checkResults_alchemy'
            },
            'battlerank': {
                signaturePic: 'tab_battle_rank_on.gif',
                CheckResultsFunction: 'checkResults_battlerank'
            },
            'war_rank': {
                signaturePic: 'tab_war_on.gif',
                CheckResultsFunction: 'checkResults_war_rank'
            },
            'achievements': {
                signaturePic: 'tab_achievements_on.gif',
                CheckResultsFunction: 'checkResults_achievements'
            },
            'battle': {
                signaturePic: 'battle_on.gif',
                CheckResultsFunction: 'checkResults_battle'
            },
            'soldiers': {
                signaturePic: 'tab_soldiers_on.gif',
                CheckResultsFunction: 'checkResults_soldiers'
            },
            'item': {
                signaturePic: 'tab_black_smith_on.gif',
                CheckResultsFunction: 'checkResults_item'
            },
            'magic': {
                signaturePic: 'tab_magic_on.gif',
                CheckResultsFunction: 'checkResults_magic'
            },
            'gift': {
                signaturePic: 'tab_gifts_on.gif',
                CheckResultsFunction: 'checkResults_gift'
            },
            'goblin_emp': {
                signaturePic: 'emporium_cancel.gif',
                CheckResultsFunction: 'checkResults_goblin_emp'
            },
            'view_class_progress': {
                signaturePic: 'nm_class_whole_progress_bar.jpg',
                CheckResultsFunction: 'checkResults_view_class_progress'
            },
            'guild': {
                signaturePic: 'tab_guild_main_on.gif',
                CheckResultsFunction: 'checkResults_guild'
            },
            'guild_current_battles': {
                signaturePic: 'tab_guild_current_battles_on.gif',
                CheckResultsFunction: 'checkResults_guild_current_battles'
            },
            'guild_current_monster_battles': {
                signaturePic: 'guild_monster_tab_on.jpg',
                CheckResultsFunction: 'checkResults_guild_current_monster_battles'
            },
            'guild_battle_monster': {
                signatureId: 'guild_battle_banner_section',
                CheckResultsFunction: 'checkResults_guild_battle_monster'
            },
            /*'arena': {
                signaturePic: 'tab_arena_on.gif',
                CheckResultsFunction: 'checkResults_arena'
            },
            'arena_battle': {
                signatureId: 'arena_battle_banner_section',
                CheckResultsFunction: 'checkResults_arena_battle'
            },*/
            'army_member': {
                signaturePic: 'view_army_on.gif',
                CheckResultsFunction: 'checkResults_army_member'
            },
            'festival_challenge': {
                signaturePic: 'festival_rankbarslider.gif',
                CheckResultsFunction: 'festivalBlessResults'
            },
            'festival_tower': {
                signaturePic: 'festival_monster_towerlist_button.jpg',
                CheckResultsFunction: 'checkResults_fightList'
            },
            'festival_battle_monster': {
                signaturePic: 'festival_achievement_monster_',
                CheckResultsFunction: 'checkResults_viewFight'
            }
        },

        addExpDisplay: function () {
            try {
                var catSTS = caap.caTools ? $j("#CA-Tools #alt_sts") : null,
                    catOK  = caap.caTools && catSTS && catSTS.css("display") !== 'none',
                    enlDiv = $j("#caap_enl", catOK ? catSTS : caap.globalContainer);

                enlDiv = $u.hasContent(enlDiv) ? enlDiv.html(caap.stats['exp']['dif']) : $j("#" + caap.domain.id[caap.domain.which] + "st_2_5 strong", catOK ? catSTS : caap.globalContainer).prepend("(<span id='caap_enl' style='color:red'>" + caap.stats['exp']['dif'] + "</span>) ");
                if (!$u.hasContent(enlDiv)) {
                    $u.warn("Unable to get experience array");
                }

                caap.setDivContent('exp_mess', "Experience to next level: " + caap.stats['exp']['dif']);
                return true;
            } catch (err) {
                $u.error("ERROR in addExpDisplay: " + err);
                return false;
            }
        },

        checkResults: function () {
            try {
                // Check page to see if we should go to a page specific check function
                // todo find a way to verify if a function exists, and replace the array with a check_functionName exists check
                if (!schedule.check('CheckResultsTimer')) {
                    return false;
                }

                schedule.setItem('CheckResultsTimer', 1);
                caap.appBodyDiv = $j("#" + caap.domain.id[caap.domain.which] + "app_body", caap.globalContainer);
                caap.resultsWrapperDiv = $j("#" + caap.domain.id[caap.domain.which] + "results_main_wrapper", caap.appBodyDiv);
                caap.resultsText = $u.setContent(caap.resultsWrapperDiv.text(), '').trim().innerTrim();
                caap.battlePage = caap.stats['level'] < 10 ? 'battle_train,battle_off' : 'battle';
                caap.pageLoadOK = caap.getStats();
                if (!caap.pageLoadOK) {
                    return true;
                }

                var pageUrl         = state.getItem('clickUrl', ''),
                    page            = $u.setContent(pageUrl, 'none').basename(".php"),
                    demiPointsFirst = config.getItem('DemiPointsFirst', false),
                    whenMonster     = config.getItem('WhenMonster', 'Never'),
                    it              = 0,
                    len             = 0;

                state.setItem('pageUserCheck', page === 'keep' ? $u.setContent(pageUrl.regex(/user=(\d+)/), 0) : 0);
                if ($u.hasContent(page) && $u.hasContent(caap.pageList[page]) && $u.hasContent(caap.pageList[page].subpages)) {
                    for (it = 0, len = caap.pageList[page].subpages.length; it < len; it += 1) {
                        if ($u.hasContent($j("img[src*='" + caap.pageList[caap.pageList[page].subpages[it]].signaturePic + "']", caap.appBodyDiv))) {
                            page = caap.pageList[page].subpages[it];
                            break;
                        }
                    }
                }

                state.setItem('page', page);
                if ($u.hasContent(caap.pageList[page])) {
                    $u.log(2, 'Checking results for', page);
                    if ($u.isFunction(caap[caap.pageList[page].CheckResultsFunction])) {
                        $u.log(3, 'Calling function', caap.pageList[page].CheckResultsFunction, caap.resultsText);
                        caap[caap.pageList[page].CheckResultsFunction]();
                    } else {
                        $u.warn('Check Results function not found', caap.pageList[page]);
                    }
                } else {
                    $u.log(2, 'No results check defined for', page);
                }

                // Check for Elite Guard Add image
                if (!config.getItem('AutoEliteIgnore', false) && state.getItem('AutoEliteEnd', 'NoArmy') !== 'NoArmy' && caap.hasImage('elite_guard_add')) {
                    schedule.setItem('AutoEliteGetList', 0);
                }

                // Information updates
                caap.updateDashboard();
                caap.addExpDisplay();
                caap.setDivContent('level_mess', 'Expected next level: ' + $u.makeTime(caap.stats['indicators']['enl'], schedule.timeStr(true)));
                caap.setDivContent('demipoint_mess', (demiPointsFirst && whenMonster !== 'Never') || config.getItem('WhenBattle', 'Never') === 'Demi Points Only' ? (state.getItem('DemiPointsDone', true) ? 'Daily Demi Points: Done' : (demiPointsFirst && whenMonster !== 'Never' ? 'Daily Demi Points: First' : 'Daily Demi Points: Only')) : '');
                caap.setDivContent('demibless_mess', schedule.check('BlessingTimer') ? 'Demi Blessing = none' : 'Next Demi Blessing: ' + $u.setContent(schedule.display('BlessingTimer'), "Unknown"));
                caap.setDivContent('feats_mess', schedule.check('festivalBlessTimer') ? 'Feat = none' : 'Next Feat: ' + $u.setContent(schedule.display('festivalBlessTimer'), "Unknown"));
                if ($u.hasContent(general.List) && general.List.length <= 2) {
                    schedule.setItem("generals", 0);
                    schedule.setItem("allGenerals", 0);
                    caap.checkGenerals();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults: " + err);
                return false;
            }
        },

        checkResults_generals: function () {
            try {
                var currentGeneral = '',
                    html           = '';

                general.GetGenerals();
                currentGeneral = general.GetEquippedStats();
                if (currentGeneral) {
                    html = "<span title='Equipped Attack Power Index' style='font-size: 12px; font-weight: normal;'>EAPI:" + currentGeneral['eapi'] +
                           "</span> <span title='Equipped Defense Power Index' style='font-size: 12px; font-weight: normal;'>EDPI:" + currentGeneral['edpi'] +
                           "</span> <span title='Equipped Mean Power Index' style='font-size: 12px; font-weight: normal;'>EMPI:" + currentGeneral['empi'] + "</span>";
                    $j("#" + caap.domain.id[caap.domain.which] + "general_name_div_int", caap.appBodyDiv).append(html);
                }

                schedule.setItem("generals", gm.getItem("checkGenerals", 24, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_generals: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          GET STATS
        // Functions that records all of base game stats, energy, stamina, etc.
        /////////////////////////////////////////////////////////////////////

        // text in the format '123/234'
        getStatusNumbers: function (text) {
            try {
                text = $u.isString(text) ? text.trim() : '';
                if (text === '' || !$u.isString(text) || !/^\d+\/\d+$/.test(text)) {
                    throw "Invalid text supplied:" + text;
                }

                var num = $u.setContent(text.regex(/^(\d+)\//), 0),
                    max = $u.setContent(text.regex(/\/(\d+)$/), 0),
                    dif = $u.setContent(max - num, 0);

                return {
                    'num': num,
                    'max': max,
                    'dif': dif
                };
            } catch (err) {
                $u.error("ERROR in getStatusNumbers: " + err);
                return undefined;
            }
        },

        stats: {
            'FBID'       : 0,
            'account'    : '',
            'PlayerName' : '',
            'level'      : 0,
            'army'       : {
                'actual' : 0,
                'capped' : 0
            },
            'generals'   : {
                'total'  : 0,
                'invade' : 0
            },
            'attack'     : 0,
            'defense'    : 0,
            'points'     : {
                'skill' : 0,
                'favor' : 0
            },
            'indicators' : {
                'bsi'  : 0,
                'lsi'  : 0,
                'sppl' : 0,
                'api'  : 0,
                'dpi'  : 0,
                'mpi'  : 0,
                'htl'  : 0,
                'hrtl' : 0,
                'enl'  : 0
            },
            'gold' : {
                'cash'    : 0,
                'bank'    : 0,
                'total'   : 0,
                'income'  : 0,
                'upkeep'  : 0,
                'flow'    : 0,
                'ticker'  : []
            },
            'rank' : {
                'battle'       : 0,
                'battlePoints' : 0,
                'war'          : 0,
                'warPoints'    : 0
            },
            'potions' : {
                'energy'  : 0,
                'stamina' : 0
            },
            'energy' : {
                'num' : 0,
                'max' : 0,
                'dif' : 0
            },
            'energyT' : {
                'num' : 0,
                'max' : 0,
                'dif' : 0
            },
            'health' : {
                'num' : 0,
                'max' : 0,
                'dif' : 0
            },
            'healthT' : {
                'num' : 0,
                'max' : 0,
                'dif' : 0
            },
            'stamina' : {
                'num' : 0,
                'max' : 0,
                'dif' : 0
            },
            'staminaT' : {
                'num' : 0,
                'max' : 0,
                'dif' : 0
            },
            'exp' : {
                'num' : 0,
                'max' : 0,
                'dif' : 0
            },
            'other' : {
                'qc'       : 0,
                'bww'      : 0,
                'bwl'      : 0,
                'te'       : 0,
                'tee'      : 0,
                'wlr'      : 0,
                'eer'      : 0,
                'atlantis' : false
            },
            'achievements' : {
                'battle' : {
                    'invasions' : {
                        'won'    : 0,
                        'lost'   : 0,
                        'streak' : 0,
                        'ratio'  : 0
                    },
                    'duels' : {
                        'won'    : 0,
                        'lost'   : 0,
                        'streak' : 0,
                        'ratio'  : 0
                    }
                },
                'monster' : {
                    'gildamesh'   : 0,
                    'colossus'    : 0,
                    'sylvanas'    : 0,
                    'keira'       : 0,
                    'legion'      : 0,
                    'skaar'       : 0,
                    'lotus'       : 0,
                    'dragons'     : 0,
                    'cronus'      : 0,
                    'sieges'      : 0,
                    'genesis'     : 0,
                    'gehenna'     : 0,
                    'aurelius'    : 0,
                    'corvintheus' : 0,
                    'valhalla'    : 0,
                    'jahanna'     : 0
                },
                'other' : {
                    'alchemy' : 0
                }
            },
            'character' : {
                'warrior' : {
                    'name'    : 'Warrior',
                    'level'   : 0,
                    'percent' : 0
                },
                'rogue' : {
                    'name'    : 'Rogue',
                    'level'   : 0,
                    'percent' : 0
                },
                'mage' : {
                    'name'    : 'Mage',
                    'level'   : 0,
                    'percent' : 0
                },
                'cleric' : {
                    'name'    : 'Cleric',
                    'level'   : 0,
                    'percent' : 0
                },
                'warlock' : {
                    'name'    : 'Warlock',
                    'level'   : 0,
                    'percent' : 0
                },
                'ranger' : {
                    'name'    : 'Ranger',
                    'level'   : 0,
                    'percent' : 0
                }

            },
            'guild' : {
                'name'    : '',
                'id'      : '',
                'mPoints' : 0,
                'mRank'   : '',
                'bPoints' : 0,
                'bRank'   : '',
                'members' : []
            }
        },


        loadStats: function (FBID, AccName) {
            var Stats = gm.getItem('stats.record', 'default');
            if (Stats === 'default' || !$j.isPlainObject(Stats)) {
                Stats = gm.setItem('stats.record', caap.stats);
            }

            $j.extend(true, caap.stats, Stats);
            caap.stats['FBID'] = FBID;
            caap.stats['account'] = AccName;
            $u.log(4, "Stats", caap.stats);
            state.setItem("UserDashUpdate", true);
        },
        /*jslint sub: false */

        saveStats: function () {
            gm.setItem('stats.record', caap.stats);
            $u.log(4, "Stats", caap.stats);
            state.setItem("UserDashUpdate", true);
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        getStats: function () {
            try {
                var passed      = true,
                    tNum        = 0,
                    xS          = 0,
                    xE          = 0,
                    ststbDiv    = $j("#" + caap.domain.id[caap.domain.which] + "main_ststb", caap.globalContainer),
                    bntpDiv     = $j("#" + caap.domain.id[caap.domain.which] + "main_bntp", caap.globalContainer),
                    tempDiv     = $j("#" + caap.domain.id[caap.domain.which] + "gold_current_value", ststbDiv);

                // gold
                if ($u.hasContent(tempDiv)) {
                    caap.stats['gold']['cash'] = $u.setContent($u.setContent(tempDiv.text(), '').numberOnly(), 0);
                    caap.stats['gold']['total'] = caap.stats['gold']['bank'] + caap.stats['gold']['cash'];
                } else {
                    $u.warn("Unable to get cashDiv");
                    passed = false;
                }

                // energy
                tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "st_2_2", ststbDiv);
                if ($u.hasContent(tempDiv)) {
                    caap.stats['energyT'] = caap.getStatusNumbers($u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+\/\d+)/), "0/0"));
                    caap.stats['energy'] = caap.getStatusNumbers(caap.stats['energyT']['num'] + "/" + caap.stats['energy']['max']);
                } else {
                    $u.warn("Unable to get energyDiv");
                    passed = false;
                }

                // health
                tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "st_2_3", ststbDiv);
                if ($u.hasContent(tempDiv)) {
                    caap.stats['healthT'] = caap.getStatusNumbers($u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+\/\d+)/), "0/0"));
                    caap.stats['health'] = caap.getStatusNumbers(caap.stats['healthT']['num'] + "/" + caap.stats['health']['max']);
                } else {
                    $u.warn("Unable to get healthDiv");
                    passed = false;
                }

                // stamina
                tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "st_2_4", ststbDiv);
                if ($u.hasContent(tempDiv)) {
                    caap.stats['staminaT'] = caap.getStatusNumbers($u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+\/\d+)/), "0/0"));
                    caap.stats['stamina'] = caap.getStatusNumbers(caap.stats['staminaT']['num'] + "/" + caap.stats['stamina']['max']);
                } else {
                    $u.warn("Unable to get staminaDiv");
                    passed = false;
                }

                // experience
                tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "st_2_5", ststbDiv);
                if ($u.hasContent(tempDiv)) {
                    caap.stats['exp'] = caap.getStatusNumbers($u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+\/\d+)/), "0/0"));
                } else {
                    $u.warn("Unable to get expDiv");
                    passed = false;
                }

                // level
                tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "st_5", ststbDiv);
                if ($u.hasContent(tempDiv)) {
                    tNum = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                    if (tNum > caap.stats['level']) {
                        $u.log(2, 'New level. Resetting Best Land Cost.');
                        caap.bestLand = state.setItem('BestLandCost', new caap.landRecord().data);
                        state.setItem('KeepLevelUpGeneral', true);
                    }

                    caap.stats['level'] = tNum;
                } else {
                    $u.warn("Unable to get levelDiv");
                    passed = false;
                }

                // army
                tempDiv = $j("a[href*='army.php']", bntpDiv);
                if ($u.hasContent(tempDiv)) {
                    caap.stats['army']['actual'] = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                    tNum = Math.min(caap.stats['army']['actual'], 501);
                    if (tNum >= 1 && tNum <= 501) {
                        caap.stats['army']['capped'] = tNum;
                    } else {
                        $u.warn("Army count not in limits");
                        passed = false;
                    }
                } else {
                    $u.warn("Unable to get armyDiv");
                    passed = false;
                }

                // upgrade points
                tempDiv = $j("a[href*='keep.php']", bntpDiv);
                if ($u.hasContent(tempDiv)) {
                    tNum = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                    if (tNum > caap.stats['points']['skill']) {
                        $u.log(2, 'New points. Resetting AutoStat.');
                        state.setItem("statsMatch", true);
                    }

                    caap.stats['points']['skill'] = tNum;
                } else {
                    $u.warn("Unable to get pointsDiv");
                    passed = false;
                }

                // Indicators: Hours To Level, Time Remaining To Level and Expected Next Level
                if (caap.stats['exp']) {
                    xS = gm.getItem("expStaminaRatio", 2.4, hiddenVar);
                    xE = state.getItem('AutoQuest', caap.newAutoQuest())['expRatio'] || gm.getItem("expEnergyRatio", 1.4, hiddenVar);
                    caap.stats['indicators']['htl'] = ((caap.stats['level'] * 12.5) - (caap.stats['stamina']['max'] * xS) - (caap.stats['energy']['max'] * xE)) / (12 * (xS + xE));
                    caap.stats['indicators']['hrtl'] = (caap.stats['exp']['dif'] - (caap.stats['stamina']['num'] * xS) - (caap.stats['energy']['num'] * xE)) / (12 * (xS + xE));
                    caap.stats['indicators']['enl'] = new Date().getTime() + Math.ceil(caap.stats['indicators']['hrtl'] * 3600000);
                } else {
                    $u.warn('Could not calculate time to next level. Missing experience stats!');
                    passed = false;
                }

                if (!passed)  {
                    caap.saveStats();
                }

                if (!passed && caap.stats['energy']['max'] === 0 && caap.stats['health']['max'] === 0 && caap.stats['stamina']['max'] === 0) {
                    $j().alert("<div style='text-align: center;'>" + $u.warn("Paused as this account may have been disabled!", caap.stats) + "</div>");
                    caap.pauseListener();
                }

                return passed;
            } catch (err) {
                $u.error("ERROR getStats: " + err);
                return false;
            }
        },

        checkResults_keep: function () {
            try {
                var attrDiv    = $j(".keep_attribute_section", caap.globalContainer),
                    statsTB    = $j(".statsTB", caap.globalContainer),
                    keepTable1 = $j(".keepTable1 tr", statsTB),
                    statCont   = $j(".attribute_stat_container", attrDiv),
                    tempDiv    = $j();

                if ($u.hasContent(attrDiv)) {
                    $u.log(8, "Getting new values from player keep");
                    // rank
                    tempDiv = $j("img[src*='gif/rank']", caap.globalContainer);
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['rank']['battle'] = $u.setContent($u.setContent(tempDiv.attr("src"), '').basename().regex(/(\d+)/), 0);
                    } else {
                        $u.warn('Using stored rank.');
                    }

                    // PlayerName
                    tempDiv = $j(".keep_stat_title_inc", attrDiv);
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['PlayerName'] = $u.setContent($u.setContent(tempDiv.text(), '').regex(new RegExp("\"(.+)\",")), '');
                    } else {
                        $u.warn('Using stored PlayerName.');
                    }

                    // war rank
                    if (caap.stats['level'] >= 100) {
                        tempDiv = $j("img[src*='war_rank_']", caap.globalContainer);
                        if ($u.hasContent(tempDiv)) {
                            caap.stats['rank']['war'] = $u.setContent($u.setContent(tempDiv.attr("src"), '').basename().regex(/(\d+)/), 0);
                        } else {
                            $u.warn('Using stored warRank.');
                        }
                    }

                    if ($u.hasContent(statCont) && statCont.length === 6) {
                        // Energy
                        tempDiv = statCont.eq(0);
                        if ($u.hasContent(tempDiv)) {
                            caap.stats['energy'] = caap.getStatusNumbers(caap.stats['energyT']['num'] + '/' + $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0));
                        } else {
                            $u.warn('Using stored energy value.');
                        }

                        // Stamina
                        tempDiv = statCont.eq(1);
                        if ($u.hasContent(tempDiv)) {
                            caap.stats['stamina'] = caap.getStatusNumbers(caap.stats['staminaT']['num'] + '/' + $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0));
                        } else {
                            $u.warn('Using stored stamina value.');
                        }

                        if (caap.stats['level'] >= 10) {
                            // Attack
                            tempDiv = statCont.eq(2);
                            if ($u.hasContent(tempDiv)) {
                                caap.stats['attack'] = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                            } else {
                                $u.warn('Using stored attack value.');
                            }

                            // Defense
                            tempDiv = statCont.eq(3);
                            if ($u.hasContent(tempDiv)) {
                                caap.stats['defense'] = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                            } else {
                                $u.warn('Using stored defense value.');
                            }
                        }

                        // Health
                        tempDiv = statCont.eq(4);
                        if ($u.hasContent(tempDiv)) {
                            caap.stats['health'] = caap.getStatusNumbers(caap.stats['healthT']['num'] + '/' + $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0));
                        } else {
                            $u.warn('Using stored health value.');
                        }
                    } else {
                        $u.warn("Can't find stats containers! Using stored stats values.");
                    }

                    // Check for Gold Stored
                    tempDiv = $j(".money", statsTB);
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['gold']['bank'] = $u.setContent($u.setContent(tempDiv.text(), '').numberOnly(), 0);
                        caap.stats['gold']['total'] = caap.stats['gold']['bank'] + caap.stats['gold']['cash'];
                        tempDiv.attr({
                            title : "Click to copy value to retrieve",
                            style : "color: blue;"
                        }).hover(
                            function () {
                                caap.style.cursor = 'pointer';
                            },
                            function () {
                                caap.style.cursor = 'default';
                            }
                        ).click(function () {
                            $j("input[name='get_gold']", caap.globalContainer).val(caap.stats['gold']['bank']);
                        });
                    } else {
                        $u.warn('Using stored inStore.');
                    }

                    // Check for income
                    tempDiv = $j(".positive", statsTB).eq(0);
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['gold']['income'] = $u.setContent($u.setContent(tempDiv.text(), '').numberOnly(), 0);
                    } else {
                        $u.warn('Using stored income.');
                    }

                    // Check for upkeep
                    tempDiv = $j(".negative", statsTB);
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['gold']['upkeep'] = $u.setContent($u.setContent(tempDiv.text(), '').numberOnly(), 0);
                    } else {
                        $u.warn('Using stored upkeep.');
                    }

                    // Cash Flow
                    caap.stats['gold']['flow'] = caap.stats['gold']['income'] - caap.stats['gold']['upkeep'];

                    // Energy potions
                    tempDiv = $j("img[title='Energy Potion']", caap.globalContainer).parent().next();
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['potions']['energy'] = $u.setContent($u.setContent(tempDiv.text(), '').numberOnly(), 0);
                    } else {
                        caap.stats['potions']['energy'] = 0;
                    }

                    // Stamina potions
                    tempDiv = $j("img[title='Stamina Potion']", caap.globalContainer).parent().next();
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['potions']['stamina'] = $u.setContent($u.setContent(tempDiv.text(), '').numberOnly(), 0);
                    } else {
                        caap.stats['potions']['stamina'] = 0;
                    }

                    // Other stats
                    // Atlantis Open
                    caap.stats['other'].atlantis = $u.hasContent(caap.checkForImage("seamonster_map_finished.jpg")) ? true : false;

                    // quests Completed
                    tempDiv = $j("td:last", keepTable1.eq(0));
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['other']['qc'] = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                    } else {
                        $u.warn('Using stored other.');
                    }

                    // Battles/Wars Won
                    tempDiv = $j("td:last", keepTable1.eq(1));
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['other']['bww'] = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                    } else {
                        $u.warn('Using stored other.');
                    }

                    // Battles/Wars Lost
                    tempDiv = $j("td:last", keepTable1.eq(2));
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['other']['bwl'] = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                    } else {
                        $u.warn('Using stored other.');
                    }

                    // Times eliminated
                    tempDiv = $j("td:last", keepTable1.eq(3));
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['other']['te'] = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                    } else {
                        $u.warn('Using stored other.');
                    }

                    // Times you eliminated an enemy
                    tempDiv = $j("td:last", keepTable1.eq(4));
                    if ($u.hasContent(tempDiv)) {
                        caap.stats['other']['tee'] = $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0);
                    } else {
                        $u.warn('Using stored other.');
                    }

                    // Win/Loss Ratio (WLR)
                    caap.stats['other']['wlr'] = caap.stats['other']['bwl'] !== 0 ? (caap.stats['other']['bww'] / caap.stats['other']['bwl']).dp(2) : Infinity;
                    // Enemy Eliminated Ratio/Eliminated (EER)
                    caap.stats['other']['eer'] = caap.stats['other']['tee'] !== 0 ? (caap.stats['other']['tee'] / caap.stats['other']['te']).dp(2) : Infinity;
                    // Indicators
                    if (caap.stats['level'] >= 10) {
                        caap.stats['indicators']['bsi'] = ((caap.stats['attack'] + caap.stats['defense']) / caap.stats['level']).dp(2);
                        caap.stats['indicators']['lsi'] = ((caap.stats['energy']['max'] + (2 * caap.stats['stamina']['max'])) / caap.stats['level']).dp(2);
                        caap.stats['indicators']['sppl'] = ((caap.stats['energy']['max'] + (2 * caap.stats['stamina']['max']) + caap.stats['attack'] + caap.stats['defense'] + caap.stats['health']['max'] - 122) / caap.stats['level']).dp(2);
                        caap.stats['indicators']['api'] = ((caap.stats['attack'] + (caap.stats['defense'] * 0.7))).dp(2);
                        caap.stats['indicators']['dpi'] = ((caap.stats['defense'] + (caap.stats['attack'] * 0.7))).dp(2);
                        caap.stats['indicators']['mpi'] = (((caap.stats['indicators']['api'] + caap.stats['indicators']['dpi']) / 2)).dp(2);
                    }

                    schedule.setItem("keep", gm.getItem("checkKeep", 1, hiddenVar) * 3600, 300);
                    caap.saveStats();
                    tempDiv = $j(".keep_stat_title_inc", attrDiv);
                    tempDiv = $u.hasContent(tempDiv) ? tempDiv.html($u.setContent(tempDiv.html(), '').trim() + ", <span style='white-space: nowrap;'>BSI: " + caap.stats['indicators']['bsi'] + " LSI: " + caap.stats['indicators']['lsi'] + "</span>") : tempDiv;
                } else {
                    tempDiv = $j("a[href*='keep.php?user=']", caap.globalContainer);
                    if ($u.hasContent(tempDiv)) {
                        $u.log(2, "On another player's keep", $u.setContent($u.setContent(tempDiv.attr("href"), '').basename().regex(/(\d+)/), 0));
                    } else {
                        $u.warn("Attribute section not found and not identified as another player's keep!");
                    }
                }

                if (config.getItem("enableTitles", true)) {
                    spreadsheet.doTitles();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_keep: " + err);
                return false;
            }
        },

        checkResults_oracle: function () {
            try {
                var favorDiv = $j(".title_action"),
                    text     = '',
                    tNum     = 0,
                    save     = false;

                if ($u.setContent(favorDiv)) {
                    text = favorDiv.text();
                    if (/You have zero favor points!/.test(text)) {
                        caap.stats['points']['favor'] = 0;
                        save = true;
                    } else if (/You have a favor point!/.test(text)) {
                        caap.stats['points']['favor'] = 1;
                        save = true;
                    } else {
                        tNum = text.regex(/You have (\d+) favor points!/);
                        if ($u.hasContent(tNum)) {
                            caap.stats['points']['favor'] = tNum;
                            save = true;
                        }
                    }
                } else {
                    $u.warn('Favor Points div not found.');
                }

                if (save) {
                    $u.log(2, 'Got number of Favor Points', caap.stats['points']['favor']);
                    caap.saveStats();
                } else {
                    $u.warn('Favor Points not matched.');
                }

                schedule.setItem("oracle", gm.getItem("checkOracle", 24, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_oracle: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        checkResults_alchemy: function () {
            try {
                if (config.getItem("enableTitles", true)) {
                    spreadsheet.doTitles();
                }

                if (config.getItem("enableRecipeClean", true)) {
                    var recipeDiv   = $j(".alchemyRecipeBack .recipeTitle", caap.globalContainer),
                        titleTxt    = '',
                        titleRegExp = new RegExp("RECIPES: Create (.+)", "i"),
                        image       = '',
                        hideCount   = config.getItem("recipeCleanCount", 1),
                        special     = [
                            "Volcanic Knight",
                            "Holy Plate",
                            "Atlantean Forcefield",
                            "Spartan Phalanx",
                            "Cronus, The World Hydra",
                            "Helm of Dragon Power",
                            "Avenger",
                            "Judgement",
                            "Tempered Steel",
                            "Bahamut, the Volcanic Dragon",
                            "Blood Zealot",
                            "Transcendence",
                            "Soul Crusher",
                            "Soulforge",
                            "Crown of Flames"
                        ];

                    if (hideCount < 1) {
                        hideCount = 1;
                    }

                    if ($u.hasContent(recipeDiv)) {
                        recipeDiv.each(function () {
                            var row = $j(this);
                            titleTxt = row.text().trim().innerTrim().regex(titleRegExp);
                            if ($u.hasContent(titleTxt)) {
                                if (special.hasIndexOf(titleTxt)) {
                                    return true;
                                }

                                if (titleTxt === "Elven Crown") {
                                    image = "gift_aeris_complete.jpg";
                                }

                                if (town.getCount(titleTxt, image) >= hideCount && !spreadsheet.isSummon(titleTxt, image)) {
                                    row.parent().parent().css("display", "none").next().css("display", "none");
                                }
                            }

                            return true;
                        });
                    }
                }

                if (config.getItem("enableIngredientsHide", false)) {
                    $j("div[class='statsTTitle'],div[class='statsTMain']", caap.globalContainer).css("display", "none");
                }

                if (config.getItem("enableAlchemyShrink", true)) {
                    $j("div[class*='alchemyRecipeBack'],div[class*='alchemyQuestBack']", caap.globalContainer).css("height", "100px");
                    $j("div[class*='alchemySpace']", caap.globalContainer).css("height", "4px");
                    $j(".statsT2 img").not("img[src*='emporium_go.gif']", caap.globalContainer).attr("style", "height: 45px; width: 45px;").parent().attr("style", "height: 45px; width: 45px;").parent().css("width", "50px");
                    $j("input[name='Alchemy Submit']", caap.globalContainer).css("width", "80px");
                    $j(".recipeTitle", caap.globalContainer).css("margin", "0px");
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_alchemy: " + err);
                return false;
            }
        },

        commonTown: function () {
            try {
                $j("div[class='eq_buy_costs_int'] form[id*='itemBuy'] select[name='amount'] option[value='5']", caap.globalContainer).attr('selected', 'selected');
                if (config.getItem("enableTitles", true)) {
                    spreadsheet.doTitles();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in commonTown: " + err);
                return false;
            }
        },

        checkResults_soldiers: function () {
            try {
                caap.commonTown();
                town.GetItems("soldiers");
                schedule.setItem("soldiers", gm.getItem("checkSoldiers", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_soldiers: " + err);
                return false;
            }
        },

        checkResults_item: function () {
            try {
                caap.commonTown();
                town.GetItems("item");
                schedule.setItem("item", gm.getItem("checkItem", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_item: " + err);
                return false;
            }
        },

        checkResults_magic: function () {
            try {
                caap.commonTown();
                town.GetItems("magic");
                schedule.setItem("magic", gm.getItem("checkMagic", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_magic: " + err);
                return false;
            }
        },

        checkResults_goblin_emp: function () {
            try {
                if (config.getItem("goblinHinting", true)) {
                    spreadsheet.doTitles(true);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_goblin_emp: " + err);
                return false;
            }
        },

        checkResults_gift: function () {
            try {
                gifting.gifts.populate();
                schedule.setItem("gift", gm.getItem("checkGift", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_gift: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkResults_battlerank: function () {
            try {
                var rankDiv = $j("div[style*='battle_rank_banner.jpg']", caap.globalContainer),
                    tNum    = 0;

                if ($u.hasContent(rankDiv)) {
                    tNum = $u.setContent($u.setContent(rankDiv.text(), '').replace(',', '').regex(/with (\d+) Battle Points/i), 0);
                    if ($u.hasContent(tNum)) {
                        $u.log(2, 'Got Battle Rank Points', tNum);
                        caap.stats['rank']['battlePoints'] = tNum;
                        caap.saveStats();
                    } else {
                        $u.warn('Battle Rank Points RegExp not matched.');
                    }
                } else {
                    $u.warn('Battle Rank Points div not found.');
                }

                schedule.setItem("battlerank", gm.getItem("checkBattleRank", 48, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_battlerank: " + err);
                return false;
            }
        },

        checkResults_war_rank: function () {
            try {
                var rankDiv = $j("div[style*='war_rank_banner.jpg']", caap.globalContainer),
                    tNum    = 0;

                if ($u.hasContent(rankDiv)) {
                    tNum = $u.setContent($u.setContent(rankDiv.text(), '').replace(',', '').regex(/with (\d+) War Points/i), 0);
                    if ($u.hasContent(tNum)) {
                        $u.log(2, 'Got War Rank Points', tNum);
                        caap.stats['rank']['warPoints'] = tNum;
                        caap.saveStats();
                    } else {
                        $u.warn('War Rank Points RegExp not matched.');
                    }
                } else {
                    $u.warn('War Rank Points div not found.');
                }

                schedule.setItem("warrank", gm.getItem("checkWarRank", 48, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_war_rank: " + err);
                return false;
            }
        },

        checkResults_achievements: function () {
            try {
                var achDiv = $j("#" + caap.domain.id[caap.domain.which] + "achievements_2", caap.globalContainer),
                    tdDiv  = $j("td div", achDiv);

                if ($u.hasContent(achDiv)) {
                    if ($u.hasContent(tdDiv) && tdDiv.length === 6) {
                        caap.stats['achievements']['battle']['invasions']['won'] = $u.setContent(tdDiv.eq(0).text().numberOnly(), 0);
                        caap.stats['achievements']['battle']['duels']['won'] = $u.setContent(tdDiv.eq(1).text().numberOnly(), 0);
                        caap.stats['achievements']['battle']['invasions']['lost'] = $u.setContent(tdDiv.eq(2).text().numberOnly(), 0);
                        caap.stats['achievements']['battle']['duels']['lost'] = $u.setContent(tdDiv.eq(3).text().numberOnly(), 0);
                        caap.stats['achievements']['battle']['invasions']['streak'] = $u.setContent(tdDiv.eq(4).text().numberOnly(), 0);
                        caap.stats['achievements']['battle']['duels']['streak'] = $u.setContent(tdDiv.eq(5).text().numberOnly(), 0);
                        caap.stats['achievements']['battle']['invasions']['ratio'] = caap.stats['achievements']['battle']['invasions']['lost'] > 0 ? (caap.stats['achievements']['battle']['invasions']['won'] / caap.stats['achievements']['battle']['invasions']['lost']).dp(2) : Infinity;
                        caap.stats['achievements']['battle']['duels']['ratio'] = caap.stats['achievements']['battle']['invasions']['lost'] > 0 ? (caap.stats['achievements']['battle']['duels']['won'] / caap.stats['achievements']['battle']['duels']['lost']).dp(2) : Infinity;
                        caap.saveStats();
                    } else {
                        $u.warn('Battle Achievements problem.');
                    }
                } else {
                    $u.warn('Battle Achievements not found.');
                }

                achDiv = $j("#" + caap.domain.id[caap.domain.which] + "achievements_3", caap.globalContainer);
                if ($u.hasContent(achDiv)) {
                    tdDiv = $j("td div", achDiv);
                    if ($u.hasContent(tdDiv) && tdDiv.length === 16) {
                        caap.stats['achievements']['monster']['gildamesh'] = $u.setContent(tdDiv.eq(0).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['lotus'] = $u.setContent(tdDiv.eq(1).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['colossus'] = $u.setContent(tdDiv.eq(2).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['dragons'] = $u.setContent(tdDiv.eq(3).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['sylvanas'] = $u.setContent(tdDiv.eq(4).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['cronus'] = $u.setContent(tdDiv.eq(5).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['keira'] = $u.setContent(tdDiv.eq(6).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['sieges'] = $u.setContent(tdDiv.eq(7).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['legion'] = $u.setContent(tdDiv.eq(8).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['genesis'] = $u.setContent(tdDiv.eq(9).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['skaar'] = $u.setContent(tdDiv.eq(10).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['gehenna'] = $u.setContent(tdDiv.eq(11).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['aurelius'] = $u.setContent(tdDiv.eq(12).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['corvintheus'] = $u.setContent(tdDiv.eq(13).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['valhalla'] = $u.setContent(tdDiv.eq(14).text().numberOnly(), 0);
                        caap.stats['achievements']['monster']['jahanna'] = $u.setContent(tdDiv.eq(15).text().numberOnly(), 0);
                        caap.saveStats();
                    } else {
                        $u.warn('Monster Achievements problem.');
                    }
                } else {
                    $u.warn('Monster Achievements not found.');
                }

                achDiv = $j("#" + caap.domain.id[caap.domain.which] + "achievements_4", caap.globalContainer);
                if ($u.hasContent(achDiv)) {
                    tdDiv = $j("td div", achDiv);
                    if ($u.hasContent(tdDiv) && tdDiv.length === 1) {
                        caap.stats['achievements']['other']['alchemy'] = $u.setContent(tdDiv.eq(0).text().numberOnly(), 0);
                        caap.saveStats();
                    } else {
                        $u.warn('Other Achievements problem.');
                    }
                } else {
                    $u.warn('Other Achievements not found.');
                }

                schedule.setItem("achievements", gm.getItem("checkAchievements", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_achievements: " + err);
                return false;
            }
        },

        checkResults_view_class_progress: function () {
            try {
                var classDiv = $j("#" + caap.domain.id[caap.domain.which] + "choose_class_screen div[class*='banner_']", caap.globalContainer);
                if ($u.hasContent(classDiv) && classDiv.length === 6) {
                    classDiv.each(function (index) {
                        var monsterClass = $j(this),
                            name         = '';

                        name = $u.setContent(monsterClass.attr("class"), '').replace("banner_", '');
                        if (name && $j.isPlainObject(caap.stats['character'][name])) {
                            caap.stats['character'][name]['percent'] = $u.setContent($j("img[src*='progress']", monsterClass).eq(0).getPercent('width').dp(2), 0);
                            caap.stats['character'][name]['level'] = $u.setContent(monsterClass.children().eq(2).text().numberOnly(), 0);
                            $u.log(2, "Got character class record", name, caap.stats['character'][name]);
                            caap.saveStats();
                        } else {
                            $u.warn("Problem character class name", name);
                        }
                    });
                } else {
                    $u.warn("Problem with character class records", classDiv);
                }

                schedule.setItem("view_class_progress", gm.getItem("CheckClassProgress", 48, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_view_class_progress: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          QUESTING
        // Quest function does action, DrawQuest sets up the page and gathers info
        /////////////////////////////////////////////////////////////////////

        maxEnergyQuest: function () {
            try {
                var maxIdleEnergy = 0,
                    theGeneral    = config.getItem('IdleGeneral', 'Use Current');

                if (theGeneral !== 'Use Current') {
                    maxIdleEnergy = $u.setContent(general.GetEnergyMax(theGeneral), 0);
                    if (maxIdleEnergy <= 0 || $u.isNaN(maxIdleEnergy)) {
                        $u.log(1, "Changing to idle general to get Max energy");
                        if (general.Select('IdleGeneral')) {
                            return true;
                        }
                    }
                }

                return caap.stats['energy']['num'] >= maxIdleEnergy ? caap.quests() : false;
            } catch (err) {
                $u.error("ERROR in maxEnergyQuest: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        questAreaInfo: {
            'Land of Fire' : {
                clas : 'quests_stage_1',
                base : 'land_fire',
                next : 'Land of Earth',
                area : '',
                list : '',
                boss : 'Heart of Fire',
                orb  : 'Orb of Gildamesh'
            },
            'Land of Earth' : {
                clas : 'quests_stage_2',
                base : 'land_earth',
                next : 'Land of Mist',
                area : '',
                list : '',
                boss : 'Gift of Earth',
                orb  : 'Colossal Orb'
            },
            'Land of Mist' : {
                clas : 'quests_stage_3',
                base : 'land_mist',
                next : 'Land of Water',
                area : '',
                list : '',
                boss : 'Eye of the Storm',
                orb  : 'Sylvanas Orb'
            },
            'Land of Water' : {
                clas : 'quests_stage_4',
                base : 'land_water',
                next : 'Demon Realm',
                area : '',
                list : '',
                boss : 'A Look into the Darkness',
                orb  : 'Orb of Mephistopheles'
            },
            'Demon Realm' : {
                clas : 'quests_stage_5',
                base : 'land_demon_realm',
                next : 'Undead Realm',
                area : '',
                list : '',
                boss : 'The Rift',
                orb  : 'Orb of Keira'
            },
            'Undead Realm' : {
                clas : 'quests_stage_6',
                base : 'land_undead_realm',
                next : 'Underworld',
                area : '',
                list : '',
                boss : 'Undead Embrace',
                orb  : 'Lotus Orb'
            },
            'Underworld' : {
                clas : 'quests_stage_7',
                base : 'tab_underworld',
                next : 'Kingdom of Heaven',
                area : '',
                list : '',
                boss : 'Confrontation',
                orb  : 'Orb of Skaar Deathrune'
            },
            'Kingdom of Heaven' : {
                clas : 'quests_stage_8',
                base : 'tab_heaven',
                next : 'Ivory City',
                area : '',
                list : '',
                boss : 'Archangels Wrath',
                orb  : 'Orb of Azriel'
            },
            'Ivory City' : {
                clas : 'quests_stage_9',
                base : 'tab_ivory',
                next : 'Earth II',
                area : '',
                list : '',
                boss : 'Entrance to the Throne',
                orb  : 'Orb of Alpha Mephistopheles'
            },
            'Earth II' : {
                clas : 'quests_stage_10',
                base : 'tab_earth2',
                next : 'Water II',
                area : '',
                list : '',
                boss : "Lion's Rebellion",
                orb  : 'Orb of Aurelius'
            },
            'Water II' : {
                clas : 'quests_stage_11',
                base : 'tab_water2',
                next : 'Ambrosia',
                area : '',
                list : '',
                boss : "Corvintheus",
                orb  : 'Orb of Corvintheus'
            },
            'Mist II' : {
                clas : 'quests_stage_12',
                base : 'tab_mist2',
                next : 'Ambrosia',
                area : 'Demi Quests',
                list : 'demiQuestList',
                boss : "Jahanna",
                orb  : 'Orb of Jahanna'
            },
            'Ambrosia' : {
                clas : 'symbolquests_stage_1',
                next : 'Malekus',
                area : '',
                list : ''
            },
            'Malekus' : {
                clas : 'symbolquests_stage_2',
                next : 'Corvintheus',
                area : '',
                list : ''
            },
            'Corvintheus' : {
                clas : 'symbolquests_stage_3',
                next : 'Aurora',
                area : '',
                list : ''
            },
            'Aurora' : {
                clas : 'symbolquests_stage_4',
                next : 'Azeron',
                area : '',
                list : ''
            },
            'Azeron' : {
                clas : 'symbolquests_stage_5',
                next : 'Atlantis',
                area : 'Atlantis',
                list : 'atlantisQuestList'
            },
            'Atlantis' : {
                clas : 'monster_quests_stage_1',
                next : '',
                area : '',
                list : ''
            }
        },

        demiQuestTable : {
            'Ambrosia'    : 'energy',
            'Malekus'     : 'attack',
            'Corvintheus' : 'defense',
            'Aurora'      : 'health',
            'Azeron'      : 'stamina'
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        quests: function () {
            try {
                var storeRetrieve = state.getItem('storeRetrieve', '');
                if (storeRetrieve) {
                    if (storeRetrieve === 'general') {
                        $u.log(1, "storeRetrieve", storeRetrieve);
                        if (general.Select('BuyGeneral')) {
                            return true;
                        }

                        state.setItem('storeRetrieve', '');
                        return true;
                    } else {
                        return caap.retrieveFromBank(storeRetrieve);
                    }
                }

                caap.setDivContent('quest_mess', '');
                var whenQuest = config.getItem('WhenQuest', 'Never');
                if (whenQuest === 'Never') {
                    caap.setDivContent('quest_mess', 'Questing off');
                    return false;
                }

                if (whenQuest === 'Not Fortifying' || (config.getItem('PrioritiseMonsterAfterLvl', false) && state.getItem('KeepLevelUpGeneral', false))) {
                    var fortMon = state.getItem('targetFromfortify', new monster.energyTarget().data);
                    if ($j.isPlainObject(fortMon) && fortMon['name'] && fortMon['type']) {
                        switch (fortMon['type']) {
                        case "Fortify":
                            var maxHealthtoQuest = config.getItem('MaxHealthtoQuest', 0);
                            if (!maxHealthtoQuest) {
                                caap.setDivContent('quest_mess', '<span style="font-weight: bold;">No valid over fortify %</span>');
                                return false;
                            }

                            caap.setDivContent('quest_mess', 'No questing until attack target ' + fortMon['name'] + " health exceeds " + config.getItem('MaxToFortify', 0) + '%');
                            var targetFrombattle_monster = state.getItem('targetFrombattle_monster', '');
                            if (!targetFrombattle_monster) {
                                var currentMonster = monster.getItem(targetFrombattle_monster);
                                if (!currentMonster['fortify']) {
                                    if (currentMonster['fortify'] < maxHealthtoQuest) {
                                        caap.setDivContent('quest_mess', 'No questing until fortify target ' + targetFrombattle_monster + ' health exceeds ' + maxHealthtoQuest + '%');
                                        return false;
                                    }
                                }
                            }

                            break;
                        case "Strengthen":
                            caap.setDivContent('quest_mess', 'No questing until attack target ' + fortMon['name'] + " at full strength.");
                            break;
                        case "Stun":
                            caap.setDivContent('quest_mess', 'No questing until attack target ' + fortMon['name'] + " stunned.");
                            break;
                        default:
                        }

                        return false;
                    }
                }

                var autoQuestName = state.getItem('AutoQuest', caap.newAutoQuest())['name'];
                if (!autoQuestName) {
                    if (config.getItem('WhyQuest', 'Manual') === 'Manual') {
                        caap.setDivContent('quest_mess', 'Pick quest manually.');
                        return false;
                    }

                    caap.setDivContent('quest_mess', 'Searching for quest.');
                    $u.log(1, "Searching for quest");
                } else {
                    var energyCheck = caap.checkEnergy(state.getItem('AutoQuest', caap.newAutoQuest())['energy'], whenQuest, 'quest_mess');
                    if (!energyCheck) {
                        return false;
                    }
                }

                if (state.getItem('AutoQuest', caap.newAutoQuest())['general'] === 'none' || config.getItem('ForceSubGeneral', false)) {
                    if (general.Select('SubQuestGeneral')) {
                        return true;
                    }
                } else if (general.LevelUpCheck('QuestGeneral')) {
                    if (general.Select('LevelUpGeneral')) {
                        return true;
                    }

                    $u.log(2, 'Using level up general');
                }

                switch (config.getItem('QuestArea', 'Quest')) {
                case 'Quest' :
                    var imgExist = false;
                    if (caap.stats['level'] > 7) {
                        var subQArea = config.getItem('QuestSubArea', 'Land of Fire');
                        var landPic = caap.questAreaInfo[subQArea].base;
                        if (landPic === 'tab_heaven' || config.getItem('GetOrbs', false) && config.getItem('WhyQuest', 'Manual') !== 'Manual') {
                            if (caap.checkMagic()) {
                                return true;
                            }
                        }

                        if (landPic === 'tab_underworld' || landPic === 'tab_ivory' || landPic === 'tab_earth2' || landPic === 'tab_water2' || landPic === 'tab_mist2') {
                            imgExist = caap.navigateTo('quests,jobs_tab_more.gif,' + landPic + '_small.gif', landPic + '_big');
                        } else if (landPic === 'tab_heaven') {
                            imgExist = caap.navigateTo('quests,jobs_tab_more.gif,' + landPic + '_small2.gif', landPic + '_big2.gif');
                        } else if ((landPic === 'land_demon_realm') || (landPic === 'land_undead_realm')) {
                            imgExist = caap.navigateTo('quests,jobs_tab_more.gif,' + landPic + '.gif', landPic + '_sel');
                        } else {
                            imgExist = caap.navigateTo('quests,jobs_tab_back.gif,' + landPic + '.gif', landPic + '_sel');
                        }
                    } else {
                        imgExist = caap.navigateTo('quests', 'quest_back_1.jpg');
                    }

                    if (imgExist) {
                        return true;
                    }

                    break;
                case 'Demi Quests' :
                    if (caap.navigateTo('quests,symbolquests', 'demi_quest_on.gif')) {
                        return true;
                    }

                    var subDQArea = config.getItem('QuestSubArea', 'Ambrosia');
                    var deityN = caap.deityTable[caap.demiQuestTable[subDQArea]];
                    var picSlice = $j("#" + caap.domain.id[caap.domain.which] + "symbol_image_symbolquests" + deityN, caap.appBodyDiv);
                    if (!$u.hasContent(picSlice)) {
                        $u.warn('No diety image for', subDQArea);
                        return false;
                    }

                    var descSlice = $j("#" + caap.domain.id[caap.domain.which] + "symbol_desc_symbolquests" + deityN, caap.appBodyDiv);
                    if (!$u.hasContent(descSlice)) {
                        $u.warn('No diety description for', subDQArea);
                        return false;
                    }

                    if (descSlice.css('display') === 'none') {
                        return caap.navigateTo(picSlice.attr("src").basename());
                    }

                    break;
                case 'Atlantis' :
                    if (!caap.hasImage('tab_atlantis_on.gif')) {
                        return caap.navigateTo('quests,monster_quests');
                    }

                    break;
                default :
                }

                var bDiv = $j("#" + caap.domain.id[caap.domain.which] + "single_popup", caap.globalContainer);
                var bDisp = $u.setContent(bDiv.css("display"), 'none');
                var button = $j();
                if (bDisp !== 'none') {
                    button = $j("input[src*='quick_switch_button.gif']", bDiv);
                    if ($u.hasContent(button) && !config.getItem('ForceSubGeneral', false)) {
                        $u.log(2, 'Clicking on quick switch general button.');
                        caap.click(button);
                        general.quickSwitch = true;
                        return true;
                    }
                }

                if (general.quickSwitch) {
                    general.GetEquippedStats();
                }

                var costToBuy = 0;
                //Buy quest requires popup
                var itemBuyPopUp = $j("form[id*='itemBuy']", caap.globalContainer);
                if (bDisp !== 'none' && $u.hasContent(itemBuyPopUp)) {
                    $u.log(2, 'itemBuy');
                    state.setItem('storeRetrieve', 'general');
                    if (general.Select('BuyGeneral')) {
                        return true;
                    }

                    state.setItem('storeRetrieve', '');
                    costToBuy = itemBuyPopUp.text().replace(new RegExp(".*\\$"), '').replace(new RegExp("[^\\d]{3,}.*"), '').parseInt();
                    $u.log(2, "costToBuy", costToBuy);
                    if (caap.stats['gold']['cash'] < costToBuy) {
                        //Retrieving from Bank
                        if (caap.stats['gold']['cash'] + (caap.stats['gold']['bank'] - config.getItem('minInStore', 0)) >= costToBuy) {
                            $u.log(1, "Trying to retrieve", costToBuy - caap.stats['gold']['cash']);
                            state.setItem("storeRetrieve", costToBuy - caap.stats['gold']['cash']);
                            return caap.retrieveFromBank(costToBuy - caap.stats['gold']['cash']);
                        } else {
                            $u.log(1, "Cant buy requires, stopping quest");
                            caap.manualAutoQuest();
                            return false;
                        }
                    }


                    button = caap.checkForImage('quick_buy_button.jpg');
                    if ($u.hasContent(button)) {
                        $u.log(1, 'Clicking on quick buy button.');
                        caap.click(button);
                        return true;
                    }

                    $u.warn("Cant find buy button");
                    return false;
                }

                button = caap.checkForImage('quick_buy_button.jpg');
                if (bDisp !== 'none' && $u.hasContent(button)) {
                    $u.log(2, 'quick_buy_button');
                    state.setItem('storeRetrieve', 'general');
                    if (general.Select('BuyGeneral')) {
                        return true;
                    }

                    state.setItem('storeRetrieve', '');
                    costToBuy = button.previousElementSibling.previousElementSibling.previousElementSibling
                        .previousElementSibling.previousElementSibling.previousElementSibling.previousElementSibling
                        .firstChild.data.replace(new RegExp("[^0-9]", "g"), '');
                    $u.log(2, "costToBuy", costToBuy);
                    if (caap.stats['gold']['cash'] < costToBuy) {
                        //Retrieving from Bank
                        if (caap.stats['gold']['cash'] + (caap.stats['gold']['bank'] - config.getItem('minInStore', 0)) >= costToBuy) {
                            $u.log(1, "Trying to retrieve: ", costToBuy - caap.stats['gold']['cash']);
                            state.setItem("storeRetrieve", costToBuy - caap.stats['gold']['cash']);
                            return caap.retrieveFromBank(costToBuy - caap.stats['gold']['cash']);
                        } else {
                            $u.log(1, "Cant buy General, stopping quest");
                            caap.manualAutoQuest();
                            return false;
                        }
                    }

                    $u.log(2, 'Clicking on quick buy general button.');
                    caap.click(button);
                    return true;
                }

                var autoQuestDivs = {
                        name     : '',
                        click    : $j(),
                        tr       : $j(),
                        genDiv   : $j(),
                        orbCheck : false
                    };

                autoQuestDivs = caap.checkResults_quests(true);
                //$u.log(1, 'autoQuestDivs/autoQuestName', autoQuestDivs, autoQuestName);
                if (!autoQuestDivs.name) {
                    $u.log(1, 'Could not find AutoQuest.');
                    caap.setDivContent('quest_mess', 'Could not find AutoQuest.');
                    return false;
                }

                if (autoQuestDivs.name !== autoQuestName) {
                    $u.log(1, 'New AutoQuest found.');
                    caap.setDivContent('quest_mess', 'New AutoQuest found.');
                    return true;
                }

                // if found missing requires, click to buy
                if ($u.hasContent(autoQuestDivs.tr)) {
                    var background = $j("div[style*='background-color']", autoQuestDivs.tr);
                    if ($u.hasContent(background) && background.css("background-color") === 'rgb(158, 11, 15)') {
                        $u.log(1, "Missing item");
                        if (config.getItem('QuestSubArea', 'Atlantis') === 'Atlantis') {
                            $u.log(1, "Cant buy Atlantis items, stopping quest");
                            caap.manualAutoQuest();
                            return false;
                        }

                        $u.log(2, "background.style.backgroundColor", background.css("background-color"));
                        state.setItem('storeRetrieve', 'general');
                        if (general.Select('BuyGeneral')) {
                            return true;
                        }

                        state.setItem('storeRetrieve', '');
                        $u.log(2, "background.children().eq(0).children().eq(0).attr('title')", background.children().eq(0).children().eq(0).attr("title"));
                        if (background.children().eq(0).children().eq(0).attr("title")) {
                            $u.log(2, "Clicking to buy", background.children().eq(0).children().eq(0).attr("title"));
                            caap.click(background.children().eq(0).children().eq(0));
                            return true;
                        }
                    }
                } else {
                    $u.warn('Can not buy quest item');
                    return false;
                }

                var questGeneral = state.getItem('AutoQuest', caap.newAutoQuest())['general'];
                if (questGeneral === 'none' || config.getItem('ForceSubGeneral', false)) {
                    if (general.Select('SubQuestGeneral')) {
                        return true;
                    }
                } else if (questGeneral && questGeneral !== general.GetCurrent()) {
                    if (general.LevelUpCheck("QuestGeneral")) {
                        if (general.Select('LevelUpGeneral')) {
                            return true;
                        }

                        $u.log(2, 'Using level up general');
                    } else {
                        if ($u.hasContent(autoQuestDivs.genDiv)) {
                            $u.log(2, 'Clicking on general', questGeneral);
                            caap.click(autoQuestDivs.genDiv);
                            return true;
                        } else {
                            $u.warn('Can not click on general', questGeneral);
                            return false;
                        }
                    }
                }

                if ($u.hasContent(autoQuestDivs.click)) {
                    $u.log(2, 'Clicking auto quest', autoQuestName);
                    state.setItem('ReleaseControl', true);
                    caap.click(autoQuestDivs.click);
                    caap.showAutoQuest();
                    if (autoQuestDivs.orbCheck) {
                        schedule.setItem("magic", 0);
                    }

                    return true;
                } else {
                    $u.warn('Can not click auto quest', autoQuestName);
                    return false;
                }
            } catch (err) {
                $u.error("ERROR in quests: " + err);
                return false;
            }
        },

        questName: null,

        checkResults_symbolquests: function () {
            try {
                $j("div[id*='symbol_tab_symbolquests']", caap.appBodyDiv).unbind('click', caap.symbolquestsListener).bind('click', caap.symbolquestsListener);
                $j("form[id*='symbols_form_']", caap.appBodyDiv).unbind('click', caap.symbolquestsClickListener).bind('click', caap.symbolquestsClickListener);
                var demiDiv = $j("div[id*='symbol_desc_symbolquests']", caap.appBodyDiv),
                    points  = [],
                    success = true;

                caap.blessingResults();
                if ($u.hasContent(demiDiv) && demiDiv.length === 5) {
                    demiDiv.each(function () {
                        var num = $u.setContent($j(this).children().next().eq(1).children().children().next().text(), '').trim().innerTrim().regex(/(\d+)/);
                        if ($u.hasContent(num) && !$u.isNaN(num)) {
                            points.push(num);
                        } else {
                            success = false;
                            $u.warn('Demi-Power text problem');
                        }
                    });

                    if (success) {
                        $u.log(3, 'Demi-Power Points', points);
                        caap.demi['ambrosia']['power']['total'] = $u.setContent(points[0], 0);
                        caap.demi['malekus']['power']['total'] = $u.setContent(points[1], 0);
                        caap.demi['corvintheus']['power']['total'] = $u.setContent(points[2], 0);
                        caap.demi['aurora']['power']['total'] = $u.setContent(points[3], 0);
                        caap.demi['azeron']['power']['total'] = $u.setContent(points[4], 0);
                        schedule.setItem("symbolquests", gm.getItem("checkSymbolQuests", 24, hiddenVar) * 3600, 300);
                        caap.SaveDemi();
                    }
                } else {
                    $u.warn("Demi demiDiv problem", demiDiv);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_symbolquests: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        isBossQuest: function (name) {
            try {
                var qn    = '',
                    found = false;

                for (qn in caap.questAreaInfo) {
                    if (caap.questAreaInfo.hasOwnProperty(qn)) {
                        if (caap.questAreaInfo[qn].boss && caap.questAreaInfo[qn].boss === name) {
                            found = true;
                            break;
                        }
                    }
                }

                return found;
            } catch (err) {
                $u.error("ERROR in isBossQuest: " + err);
                return false;
            }
        },

        symbolquestsListener: function (event) {
            $u.log(3, "Clicked Demi Power image", event.target.parentNode.parentNode.parentNode.parentNode.id);
            state.setItem('clickUrl', caap.domain.link + '/symbolquests.php');
            caap.checkResults();
        },

        symbolquestsClickListener: function (event) {
            $u.log(3, "Clicked Demi Power blessing", event.target.parentNode.id);
            state.setItem('clickUrl', caap.domain.link + '/symbolquests.php');
            caap.blessingPerformed = true;
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkResults_quests: function (pickQuestTF) {
            try {
                //$u.log(1, "checkResults_quests pickQuestTF", pickQuestTF);
                pickQuestTF = pickQuestTF ? pickQuestTF : false;
                if ($u.hasContent($j("#" + caap.domain.id[caap.domain.which] + "quest_map_container", caap.appBodyDiv))) {
                    $j("div[id*='meta_quest_']", caap.globalContainer).each(function (index) {
                        var row = $j(this);
                        if (!($u.hasContent($j("img[src*='_completed']", row)) || $u.hasContent($j("img[src*='_locked']", row)))) {
                            $j("div[id*='quest_wrapper_" + row.attr("id").replace(caap.domain.id[caap.domain.which] + "meta_quest_", '') + "']", caap.appBodyDiv).css("display", "block");
                        }
                    });
                }

                if (config.getItem("enableTitles", true)) {
                    spreadsheet.doTitles();
                }

                var whyQuest = config.getItem('WhyQuest', 'Manual');
                if (pickQuestTF === true && whyQuest !== 'Manual') {
                    state.setItem('AutoQuest', caap.newAutoQuest());
                }

                var bestReward  = 0,
                    rewardRatio = 0,
                    div         = $j(),
                    ss          = $j();

                if (caap.hasImage('demi_quest_on.gif')) {
                    caap.checkResults_symbolquests($u.isString(pickQuestTF) ? pickQuestTF : undefined);
                    ss = $j("div[id*='symbol_displaysymbolquest']", caap.appBodyDiv);
                    if (!$u.hasContent(ss)) {
                        $u.warn("Failed to find symbol_displaysymbolquest");
                    }

                    ss.each(function () {
                        div = $j(this);
                        if (div.css("display") !== 'none') {
                            return false;
                        }

                        return true;
                    });
                } else {
                    div = caap.globalContainer;
                }

                ss = $j(".quests_background,.quests_background_sub", div);
                if (!$u.hasContent(ss)) {
                    $u.warn("Failed to find quests_background");
                    return false;
                }

                var haveOrb      = false,
                    isTheArea    = false,
                    questSubArea = '';

                questSubArea = config.getItem('QuestSubArea', 'Land of Fire');
                isTheArea = caap.checkCurrentQuestArea(questSubArea);
                $u.log(2, "Is quest area", questSubArea, isTheArea);
                if (isTheArea && whyQuest !== 'Manual' && config.getItem('GetOrbs', false)) {
                    if ($u.hasContent($j("input[alt='Perform Alchemy']"))) {
                        haveOrb = true;
                    } else {
                        if (questSubArea && caap.questAreaInfo[questSubArea].orb) {
                            haveOrb = town.haveOrb(caap.questAreaInfo[questSubArea].orb);
                        }
                    }

                    $u.log(2, "Have Orb for", questSubArea, haveOrb);
                    if (haveOrb && caap.isBossQuest(state.getItem('AutoQuest', caap.newAutoQuest())['name'])) {
                        state.setItem('AutoQuest', caap.newAutoQuest());
                    }
                }

                var autoQuestDivs = {
                    name     : '',
                    click    : $j(),
                    tr       : $j(),
                    genDiv   : $j(),
                    orbCheck : false
                };

                $j(".autoquest", caap.globalContainer).remove();
                var expRegExp       = new RegExp("\\+(\\d+)"),
                    energyRegExp    = new RegExp("(\\d+)\\s+energy", "i"),
                    moneyRegExp     = new RegExp("\\$([0-9,]+)\\s*-\\s*\\$([0-9,]+)", "i"),
                    money2RegExp    = new RegExp("\\$([0-9,]+)mil\\s*-\\s*\\$([0-9,]+)mil", "i"),
                    influenceRegExp = new RegExp("(\\d+)%");

                ss.each(function () {
                    div = $j(this);
                    caap.questName = caap.getQuestName(div);
                    if (!caap.questName) {
                        return true;
                    }

                    var reward     = null,
                        energy     = null,
                        experience = null,
                        divTxt     = '',
                        expM       = [],
                        tStr       = '';

                    divTxt = div.text().trim().innerTrim();
                    expM = divTxt ? divTxt.match(expRegExp) : [];
                    if (expM && expM.length === 2) {
                        experience = expM[1] ? expM[1].numberOnly() : 0;
                    } else {
                        var expObj = $j(".quest_experience", div);
                        if ($u.hasContent(expObj)) {
                            tStr = expObj.text();
                            experience = tStr ? tStr.numberOnly() : 0;
                        } else {
                            $u.warn("Can't find experience for", caap.questName);
                        }
                    }

                    var idx = caap.questName.indexOf('<br>');
                    if (idx >= 0) {
                        caap.questName = caap.questName.substring(0, idx);
                    }

                    var energyM = divTxt.match(energyRegExp);
                    if (energyM && energyM.length === 2) {
                        energy = energyM[1] ? energyM[1].numberOnly() : 0;
                    } else {
                        var eObj = $j(".quest_req", div);
                        if ($u.hasContent(eObj)) {
                            energy = $j('b', eObj).eq(0).text().numberOnly();
                        }
                    }

                    if (!energy) {
                        $u.warn("Can't find energy for", caap.questName);
                        return true;
                    }

                    var moneyM     = [],
                        rewardLow  = 0,
                        rewardHigh = 0;

                    moneyM = divTxt ? divTxt.stripHtmlJunk().match(moneyRegExp) : [];
                    if (moneyM && moneyM.length === 3) {
                        rewardLow  = moneyM[1] ? moneyM[1].numberOnly() : 0;
                        rewardHigh = moneyM[2] ? moneyM[2].numberOnly() : 0;
                        reward = (rewardLow + rewardHigh) / 2;
                    } else {
                        moneyM = divTxt ? divTxt.stripHtmlJunk().match(money2RegExp) : [];
                        if (moneyM && moneyM.length === 3) {
                            rewardLow  = moneyM[1] ? moneyM[1].numberOnly() * 1000000 : 0;
                            rewardHigh = moneyM[2] ? moneyM[2].numberOnly() * 1000000 : 0;
                            reward = (rewardLow + rewardHigh) / 2;
                        } else {
                            $u.warn('No money found for', caap.questName, divTxt);
                        }
                    }

                    var click = $j("input[name='Do Quest']", div);
                    if (!$u.hasContent(click)) {
                        $u.warn('No button found for', caap.questName);
                        return true;
                    }

                    var influence = -1;
                    if (caap.isBossQuest(caap.questName)) {
                        if ($u.hasContent($j(".quests_background_sub", div))) {
                            //if boss and found sub quests
                            influence = 100;
                        } else {
                            influence = 0;
                        }
                    } else {
                        var influenceList = divTxt.match(influenceRegExp);
                        if (influenceList && influenceList.length === 2) {
                            influence = influenceList[1] ? influenceList[1].parseInt() : 0;
                        } else {
                            $u.warn("Influence div not found.", influenceList);
                        }
                    }

                    if (influence < 0) {
                        $u.warn('No influence found for', caap.questName, divTxt);
                    }

                    var general = 'none',
                        genDiv  = $j();

                    if (influence >= 0 && influence < 100) {
                        genDiv = $j(".quest_act_gen", div);
                        if ($u.hasContent(genDiv)) {
                            genDiv = $j("img[src*='jpg']", genDiv);
                            if ($u.hasContent(genDiv)) {
                                general = genDiv.attr("title");
                            }
                        }
                    }

                    var questType = 'subquest';
                    if (div.attr("class") === 'quests_background') {
                        questType = 'primary';
                    } else if (div.attr("class") === 'quests_background_special') {
                        questType = 'boss';
                    }

                    caap.labelQuests(div, energy, reward, experience, click);
                    $u.log(9, "QuestSubArea", questSubArea);
                    if (isTheArea) {
                        if (config.getItem('GetOrbs', false) && questType === 'boss' && whyQuest !== 'Manual' && !haveOrb) {
                            caap.updateAutoQuest('name', caap.questName);
                            pickQuestTF = true;
                            autoQuestDivs.orbCheck = true;
                        }

                        switch (whyQuest) {
                        case 'Advancement' :
                            if (influence >= 0) {
                                if (!state.getItem('AutoQuest', caap.newAutoQuest())['name'] && questType === 'primary' && influence < 100) {
                                    caap.updateAutoQuest('name', caap.questName);
                                    pickQuestTF = true;
                                }
                            } else {
                                $u.warn("Can't find influence for", caap.questName, influence);
                            }

                            break;
                        case 'Max Influence' :
                            if (influence >= 0) {
                                if (!state.getItem('AutoQuest', caap.newAutoQuest())['name'] && influence < 100) {
                                    caap.updateAutoQuest('name', caap.questName);
                                    pickQuestTF = true;
                                }
                            } else {
                                $u.warn("Can't find influence for", caap.questName, influence);
                            }

                            break;
                        case 'Max Experience' :
                            rewardRatio = (Math.floor(experience / energy * 100) / 100);
                            if (bestReward < rewardRatio) {
                                caap.updateAutoQuest('name', caap.questName);
                                pickQuestTF = true;
                            }

                            break;
                        case 'Max Gold' :
                            rewardRatio = (Math.floor(reward / energy * 10) / 10);
                            if (bestReward < rewardRatio) {
                                caap.updateAutoQuest('name', caap.questName);
                                pickQuestTF = true;
                            }

                            break;
                        default :
                        }

                        if (isTheArea && state.getItem('AutoQuest', caap.newAutoQuest())['name'] === caap.questName) {
                            bestReward = rewardRatio;
                            var expRatio = experience / (energy ? energy : 1);
                            $u.log(2, "Setting AutoQuest", caap.questName);
                            var tempAutoQuest = caap.newAutoQuest();
                            tempAutoQuest['name'] = caap.questName;
                            tempAutoQuest['energy'] = energy;
                            tempAutoQuest['general'] = general;
                            tempAutoQuest['expRatio'] = expRatio;
                            state.setItem('AutoQuest', tempAutoQuest);
                            $u.log(4, "checkResults_quests", state.getItem('AutoQuest', caap.newAutoQuest()));
                            caap.showAutoQuest();
                            autoQuestDivs.name = caap.questName;
                            autoQuestDivs.click = click;
                            autoQuestDivs.tr = div;
                            autoQuestDivs.genDiv = genDiv;
                        }
                    }

                    //$u.log(1, "End of run");
                    return true;
                });

                //$u.log(1, "pickQuestTF", pickQuestTF);
                if (pickQuestTF) {
                    if (state.getItem('AutoQuest', caap.newAutoQuest())['name']) {
                        //$u.log(2, "return autoQuestDivs", autoQuestDivs);
                        caap.showAutoQuest();
                        return autoQuestDivs;
                    }

                    //if not find quest, probably you already maxed the subarea, try another area
                    if ((whyQuest === 'Max Influence' || whyQuest === 'Advancement') && config.getItem('switchQuestArea', true)) {
                        $u.log(9, "QuestSubArea", questSubArea);
                        if (questSubArea && caap.questAreaInfo[questSubArea] && caap.questAreaInfo[questSubArea].next) {
                            questSubArea = config.setItem('QuestSubArea', caap.questAreaInfo[questSubArea].next);
                            if (caap.questAreaInfo[questSubArea].area && caap.questAreaInfo[questSubArea].list) {
                                config.setItem('QuestArea', caap.questAreaInfo[questSubArea].area);
                                caap.changeDropDownList('QuestSubArea', caap[caap.questAreaInfo[questSubArea].list]);
                            }
                        } else {
                            $u.log(1, "Setting questing to manual");
                            caap.manualAutoQuest();
                        }

                        $u.log(2, "UpdateQuestGUI: Setting drop down menus");
                        caap.selectDropOption('QuestArea', config.getItem('QuestArea', 'Quest'));
                        caap.selectDropOption('QuestSubArea', questSubArea);
                        return false;
                    }

                    $u.log(1, "Finished QuestArea.");
                    caap.manualAutoQuest();
                }

                return false;
            } catch (err) {
                $u.error("ERROR in checkResults_quests: " + err);
                caap.manualAutoQuest();
                return false;
            }
        },

        classToQuestArea: {
            'quests_stage_1'         : 'Land of Fire',
            'quests_stage_2'         : 'Land of Earth',
            'quests_stage_3'         : 'Land of Mist',
            'quests_stage_4'         : 'Land of Water',
            'quests_stage_5'         : 'Demon Realm',
            'quests_stage_6'         : 'Undead Realm',
            'quests_stage_7'         : 'Underworld',
            'quests_stage_8'         : 'Kingdom of Heaven',
            'quests_stage_9'         : 'Ivory City',
            'quests_stage_10'        : 'Earth II',
            'quests_stage_11'        : 'Water II',
            'quests_stage_12'        : 'Mist II',
            'symbolquests_stage_1'   : 'Ambrosia',
            'symbolquests_stage_2'   : 'Malekus',
            'symbolquests_stage_3'   : 'Corvintheus',
            'symbolquests_stage_4'   : 'Aurora',
            'symbolquests_stage_5'   : 'Azeron',
            'monster_quests_stage_1' : 'Atlantis'
        },

        checkCurrentQuestArea: function (QuestSubArea) {
            try {
                var found = false;

                if (caap.stats['level'] < 8) {
                    if (caap.hasImage('quest_back_1.jpg')) {
                        found = true;
                    }
                } else if (QuestSubArea && caap.questAreaInfo[QuestSubArea]) {
                    if ($u.hasContent($j("div[class='" + caap.questAreaInfo[QuestSubArea].clas + "']", caap.globalContainer))) {
                        found = true;
                    }
                }

                return found;
            } catch (err) {
                $u.error("ERROR in checkCurrentQuestArea: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        getQuestName: function (questDiv) {
            try {
                var item_title = $j(".quest_desc,.quest_sub_title", questDiv),
                    firstb     = $j("b", item_title).eq(0),
                    text       = '';

                if (!$u.hasContent(item_title)) {
                    $u.log(2, "Can't find quest description or sub-title");
                    return false;
                }

                text = item_title.html().trim().innerTrim();
                if (/LOCK/.test(text) || /boss_locked/.test(text)) {
                    $u.log(2, "Quest locked", text);
                    return false;
                }

                if (!$u.hasContent(firstb)) {
                    $u.warn("Can't get bolded member out of", text);
                    return false;
                }

                caap.questName = firstb.text().trim().innerTrim();
                if (!$u.hasContent(caap.questName)) {
                    $u.warn('No quest name for this row');
                    return false;
                }

                return caap.questName;
            } catch (err) {
                $u.error("ERROR in getQuestName: " + err);
                return false;
            }
        },

        /*------------------------------------------------------------------------------------\
        checkEnergy gets passed the default energy requirement plus the condition text from
        the 'Whenxxxxx' setting and the message div name.
        \------------------------------------------------------------------------------------*/
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkEnergy: function (energy, condition, msgdiv) {
            try {
                if (!caap.stats['energy'] || !energy) {
                    return false;
                }

                if (condition === 'Energy Available' || condition === 'Not Fortifying') {
                    if (caap.stats['energy']['num'] >= energy) {
                        return true;
                    }

                    if (msgdiv) {
                        caap.setDivContent(msgdiv, 'Waiting for more energy: ' + caap.stats['energy']['num'] + "/" + (energy ? energy : ""));
                    }
                } else if (condition === 'At X Energy') {
                    if (caap.inLevelUpMode() && caap.stats['energy']['num'] >= energy) {
                        if (msgdiv) {
                            caap.setDivContent(msgdiv, 'Burning all energy to level up');
                        }

                        return true;
                    }

                    var whichEnergy = config.getItem('XQuestEnergy', 1);
                    if (caap.stats['energy']['num'] >= whichEnergy) {
                        state.setItem('AtXQuestEnergy', true);
                    }

                    if (caap.stats['energy']['num'] >= energy) {
                        if (state.getItem('AtXQuestEnergy', false) && caap.stats['energy']['num'] >= config.getItem('XMinQuestEnergy', 0)) {
                            caap.setDivContent(msgdiv, 'At X energy. Burning to ' + config.getItem('XMinQuestEnergy', 0));
                            return true;
                        } else {
                            state.setItem('AtXQuestEnergy', false);
                        }
                    }

                    if (energy > whichEnergy) {
                        whichEnergy = energy;
                    }

                    if (msgdiv) {
                        caap.setDivContent(msgdiv, 'Waiting for X energy: ' + caap.stats['energy']['num'] + "/" + whichEnergy);
                    }
                } else if (condition === 'At Max Energy') {
                    var maxIdleEnergy = caap.stats['energy']['max'],
                        theGeneral = config.getItem('IdleGeneral', 'Use Current');

                    if (theGeneral !== 'Use Current') {
                        maxIdleEnergy = general.GetEnergyMax(theGeneral);
                    }

                    if (theGeneral !== 'Use Current' && !maxIdleEnergy) {
                        $u.log(2, "Changing to idle general to get Max energy");
                        if (general.Select('IdleGeneral')) {
                            return true;
                        }
                    }

                    if (caap.stats['energy']['num'] >= maxIdleEnergy) {
                        return true;
                    }

                    if (caap.inLevelUpMode() && caap.stats['energy']['num'] >= energy) {
                        if (msgdiv) {
                            $u.log(1, "Burning all energy to level up");
                            caap.setDivContent(msgdiv, 'Burning all energy to level up');
                        }

                        return true;
                    }

                    if (msgdiv) {
                        caap.setDivContent(msgdiv, 'Waiting for max energy: ' + caap.stats['energy']['num'] + "/" + maxIdleEnergy);
                    }
                }

                return false;
            } catch (err) {
                $u.error("ERROR in checkEnergy: " + err);
                return false;
            }
        },

        labelListener: function (e) {
            try {
                var sps           = e.target.getElementsByTagName('span'),
                    mainDiv       = $j("#" + caap.domain.id[caap.domain.which] + "main_bn", caap.globalContainer),
                    className     = '',
                    tempAutoQuest = {};

                if (sps.length <= 0) {
                    throw 'what did we click on?';
                }

                tempAutoQuest = caap.newAutoQuest();
                tempAutoQuest['name'] = sps[0].innerHTML;
                tempAutoQuest['energy'] = sps[1].innerHTML.parseInt();
                //tempAutoQuest['general'] = general;
                //tempAutoQuest['expRatio'] = expRatio;

                caap.manualAutoQuest(tempAutoQuest);
                $u.log(5, 'labelListener', sps, state.getItem('AutoQuest'));
                if (caap.stats['level'] < 8 && caap.hasImage('quest_back_1.jpg')) {
                    config.setItem('QuestArea', 'Quest');
                    config.setItem('QuestSubArea', 'Land of Fire');
                } else {
                    if (caap.hasImage('tab_quest_on.gif')) {
                        config.setItem('QuestArea', 'Quest');
                        caap.selectDropOption('QuestArea', 'Quest');
                        caap.changeDropDownList('QuestSubArea', caap.landQuestList);
                    } else if (caap.hasImage('demi_quest_on.gif')) {
                        config.setItem('QuestArea', 'Demi Quests');
                        caap.selectDropOption('QuestArea', 'Demi Quests');
                        caap.changeDropDownList('QuestSubArea', caap.demiQuestList);
                    } else if (caap.hasImage('tab_atlantis_on.gif')) {
                        config.setItem('QuestArea', 'Atlantis');
                        caap.selectDropOption('QuestArea', 'Atlantis');
                        caap.changeDropDownList('QuestSubArea', caap.atlantisQuestList);
                    }

                    if ($u.hasContent(mainDiv)) {
                        className = mainDiv.attr("class");
                        if ($u.hasContent(className) && caap.classToQuestArea[className]) {
                            config.setItem('QuestSubArea', caap.classToQuestArea[className]);
                        }
                    }
                }

                $u.log(1, 'Setting QuestSubArea to', config.getItem('QuestSubArea', 'Land Of Fire'));
                caap.selectDropOption('QuestSubArea', config.getItem('QuestSubArea', 'Land Of Fire'));
                caap.showAutoQuest();
                caap.checkResults_quests();
                return true;
            } catch (err) {
                $u.error("ERROR in labelListener: " + err);
                return false;
            }
        },

        labelQuests: function (div, energy, reward, experience, click) {
            try {
                if ($u.hasContent($j("div[class='autoquest']", div))) {
                    return;
                }

                var newdiv = {};
                newdiv = document.createElement('div');
                newdiv.className = 'autoquest';
                newdiv.style.fontSize = '10px';
                newdiv.innerHTML = "$ per energy: " + (Math.floor(reward / energy * 10) / 10) +
                    "<br />Exp per energy: " + (Math.floor(experience / energy * 100) / 100) + "<br />";

                if (state.getItem('AutoQuest', caap.newAutoQuest())['name'] === caap.questName) {
                    var b = document.createElement('b');
                    b.innerHTML = "Current auto quest";
                    newdiv.appendChild(b);
                } else {
                    var setAutoQuest = document.createElement('a');
                    setAutoQuest.innerHTML = 'Auto run this quest.';
                    setAutoQuest.quest_name = caap.questName;

                    var quest_nameObj = document.createElement('span');
                    quest_nameObj.innerHTML = caap.questName;
                    quest_nameObj.style.display = 'none';
                    setAutoQuest.appendChild(quest_nameObj);

                    var quest_energyObj = document.createElement('span');
                    quest_energyObj.innerHTML = energy;
                    quest_energyObj.style.display = 'none';
                    setAutoQuest.appendChild(quest_energyObj);
                    setAutoQuest.addEventListener("click", caap.labelListener, false);

                    newdiv.appendChild(setAutoQuest);
                }

                newdiv.style.position = 'absolute';
                newdiv.style.background = '#B09060';
                newdiv.style.right = "144px";
                click.parent().before(newdiv);
            } catch (err) {
                $u.error("ERROR in labelQuests: " + err);
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          AUTO BLESSING
        /////////////////////////////////////////////////////////////////////

        deityTable: {
            'energy'  : 1,
            'attack'  : 2,
            'defense' : 3,
            'health'  : 4,
            'stamina' : 5
        },
        /*jslint sub: false */

        blessingPerformed: false,

        blessingResults: function () {
            try {
                var hours   = 0,
                    minutes = 0,
                    done    = false;

                if (caap.blessingPerformed) {
                    if (/Please come back in:/i.test(caap.resultsText)) {
                        // Check time until next Oracle Blessing
                        hours = $u.setContent(caap.resultsText.regex(/(\d+) hour/i), 3);
                        minutes = $u.setContent(caap.resultsText.regex(/(\d+) minute/i), 0);
                        done = true;
                    } else if (/You have paid tribute to/i.test(caap.resultsText)) {
                        // Recieved Demi Blessing.  Wait X hours to try again.
                        hours = /Azeron/i.test(caap.resultsText) ? 48 : 24;
                        done = true;
                    } else {
                        if ($u.hasContent(caap.resultsText)) {
                            $u.warn("Unknown blessing result text", caap.resultsText);
                        }
                    }

                    if (done) {
                        $u.log(2, 'Recorded Blessing Time. Scheduling next click! ' + hours + ':' + (minutes < 10 ? '0' + minutes : minutes));
                        schedule.setItem('BlessingTimer', (hours * 60 + minutes + 5) * 60, 300);
                    }

                    caap.blessingPerformed = false;
                }
            } catch (err) {
                $u.error("ERROR in blessingResults: " + err);
            }
        },

        autoBless: function () {
            try {
                if (caap.blessingPerformed) {
                    return true;
                }

                var autoBless  = config.getItem('AutoBless', 'none'),
                    autoBlessN = caap.deityTable[autoBless.toLowerCase()],
                    picSlice   = $j(),
                    descSlice  = $j();

                if (!$u.hasContent(autoBlessN) || !schedule.check('BlessingTimer')) {
                    return false;
                }

                if (caap.navigateTo('quests,demi_quest_off', 'demi_quest_bless')) {
                    return true;
                }

                picSlice = $j("#" + caap.domain.id[caap.domain.which] + "symbol_image_symbolquests" + autoBlessN, caap.appBodyDiv);
                if (!$u.hasContent(picSlice)) {
                    $u.warn('No diety image for', autoBless);
                    return false;
                }

                descSlice = $j("#" + caap.domain.id[caap.domain.which] + "symbol_desc_symbolquests" + autoBlessN, caap.appBodyDiv);
                if (!$u.hasContent(descSlice)) {
                    $u.warn('No diety description for', autoBless);
                    return false;
                }

                if (descSlice.css('display') === 'none') {
                    return caap.navigateTo(picSlice.attr("src").basename());
                }

                picSlice = $j("#" + caap.domain.id[caap.domain.which] + "symbols_form_" + autoBlessN + " input[name='symbolsubmit']", descSlice);
                if (!$u.hasContent(picSlice)) {
                    $u.warn('No image for deity blessing', autoBless);
                    return false;
                }

                $u.log(1, 'Click deity blessing for', autoBless, autoBlessN);
                schedule.setItem('BlessingTimer', 300, 300);
                caap.blessingPerformed = true;
                caap.click(picSlice);
                return true;
            } catch (err) {
                $u.error("ERROR in autoBless: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          FESTIVAL BLESSING
        /////////////////////////////////////////////////////////////////////

        checkResults_festival_tower:  function () {
            try {
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_festival_tower: " + err);
                return false;
            }
        },

        festivalBlessTable: {
            'attack'  : 'defense',
            'defense' : 'energy',
            'energy'  : 'stamina',
            'stamina' : 'health',
            'health'  : 'army',
            'army'    : 'attack'
        },

        festivalBlessGeneral: {
            'attack'  : 'DuelGeneral',
            'defense' : 'FortifyGeneral',
            'energy'  : 'IdleGeneral',
            'stamina' : 'IdleGeneral',
            'health'  : 'IdleGeneral',
            'army'    : 'InvadeGeneral'
        },
        /*jslint sub: false */

        festivalBlessResults: function () {
            try {
                var hours     = 0,
                    minutes   = 0,
                    tDiv      = $j(),
                    txt       = '',
                    autoBless = config.getItem('festivalBless', 'None');

                if (autoBless !== 'None') {
                    tDiv = $j("div[style*='festival_feats_bottom.jpg']", caap.globalContainer);
                    txt = $u.setContent(tDiv.text(), '').trim().innerTrim().regex(/(\d+:\d+)/);
                    if ($u.hasContent(txt)) {
                        // Check time until next Festival Blessing
                        hours = $u.setContent(txt.regex(/(\d+):/), 0);
                        minutes = $u.setContent(txt.regex(/:(\d+)/), 30);
                        $u.log(2, 'Recorded Festival Blessing Time. Scheduling next click! ' + hours + ':' + (minutes < 10 ? '0' + minutes : minutes));
                        schedule.setItem('festivalBlessTimer', (hours * 60 + minutes + 5) * 60, 300);
                    }

                    tDiv = $j("div[style*='festival_victory_popup.jpg']", caap.globalContainer);
                    if ($u.hasContent(tDiv)) {
                        $u.log(1, "Festival Feat Victory!");
                    } else {
                        tDiv = $j("div[style*='festival_defeat_popup.jpg']", caap.globalContainer);
                        if ($u.hasContent(tDiv)) {
                            $u.log(1, "Festival Feat Defeat!");
                            $j("#caap_festivalBless", caap.caapDivObject).val(config.setItem('festivalBless', caap.festivalBlessTable[autoBless.toLowerCase()].ucFirst()));
                        }
                    }
                }
            } catch (err) {
                $u.error("ERROR in festivalBlessResults: " + err);
            }
        },

        festivalBless: function () {
            try {
                var autoBless  = config.getItem('festivalBless', 'None'),
                    capPic     = 'festival_capsule_' + autoBless.toLowerCase() + '.gif',
                    tgeneral   = caap.festivalBlessGeneral[autoBless.toLowerCase()],
                    luGeneral  = config.getItem('LevelUpGeneral', 'Use Current'),
                    picSlice   = $j(),
                    txt        = '';

                if (autoBless === 'None' || !schedule.check('festivalBlessTimer')) {
                    return false;
                }

                tgeneral = tgeneral === 'IdleGeneral' ? (luGeneral !== 'Use Current' ? 'LevelUpGeneral' : tgeneral) : tgeneral;
                if (general.Select(tgeneral)) {
                    return true;
                }

                if (caap.navigateTo('soldiers,tab_festival_off.jpg,festival_feat_nav,' + capPic, 'festival_feats_bottom.jpg')) {
                    return true;
                }

                txt = $u.setContent($j("div[style*='festival_feats_middle.jpg'] strong", caap.appBodyDiv).text(), '').trim().innerTrim();
                if (/Mastered/i.test(txt)) {
                    $u.log(1, 'Area Completed!', autoBless);
                    $j("#caap_festivalBless", caap.caapDivObject).val(config.setItem('festivalBless', caap.festivalBlessTable[autoBless.toLowerCase()].ucFirst()));
                    caap.navigateTo('soldiers,tab_festival_off.jpg,festival_feat_nav');
                    return false;
                }

                if (!new RegExp(autoBless).test(txt)) {
                    $u.warn('No match for text', autoBless);
                    caap.navigateTo('soldiers,tab_festival_off.jpg,festival_feat_nav');
                    return false;
                }

                picSlice = $j("img[src*='festival_feat_completedbutton.jpg']", caap.appBodyDiv);
                if ($u.hasContent(picSlice)) {
                    $u.log(1, 'Area Completed!', autoBless);
                    $j("#caap_festivalBless", caap.caapDivObject).val(config.setItem('festivalBless', caap.festivalBlessTable[autoBless.toLowerCase()].ucFirst()));
                    caap.navigateTo('soldiers,tab_festival_off.jpg,festival_feat_nav');
                    return false;
                }

                picSlice = $j("input[src*='festival_feat_testbutton.jpg']", caap.appBodyDiv);
                if (!$u.hasContent(picSlice)) {
                    $u.warn('No blessing button', autoBless);
                    caap.navigateTo('soldiers,tab_festival_off.jpg,festival_feat_nav');
                    return false;
                }

                $u.log(1, 'Click blessing button for', autoBless);
                schedule.setItem('festivalBlessTimer', 300, 300);
                caap.click(picSlice);
                return true;
            } catch (err) {
                $u.error("ERROR in festivalBless: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          LAND
        // Displays return on lands and perfom auto purchasing
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        landRecord: function () {
            this.data = {
                'row'         : $j(),
                'name'        : '',
                'income'      : 0,
                'cost'        : 0,
                'totalCost'   : 0,
                'owned'       : 0,
                'maxAllowed'  : 0,
                'buy'         : 0,
                'roi'         : 0,
                'set'         : 0,
                'last'        : 0
            };
        },
        /*jslint sub: false */

        bestLand: {},

        sellLand: {},

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkResults_land: function () {
            try {
                var bestLandCost = {},
                    ss           = $j(),
                    row          = $j(),
                    name         = '',
                    moneyss      = $j(),
                    incomeEl     = $j(),
                    income       = 0,
                    nums         = [],
                    tStr         = '',
                    cost         = 0,
                    land         = {},
                    s            = 0,
                    div          = $j(),
                    infoDiv      = $j(),
                    strongs      = $j(),
                    maxAllowed   = 0,
                    owned        = 0,
                    roi          = 0,
                    selection    = [1, 5, 10];

                function selectLands(div, val, type) {
                    try {
                        type = type ? type : 'Buy';
                        var selects = $j("select", div);
                        if (!$u.hasContent(selects)) {
                            $u.warn(type + " select not found!");
                            return false;
                        }

                        if (type === "Buy") {
                            if (selects.length === 2) {
                                selects.eq(0).val(val);
                            }
                        } else {
                            selects.eq(0).val(val);
                        }

                        return true;
                    } catch (err) {
                        $u.error("ERROR in selectLands: " + err);
                        return false;
                    }
                }

                caap.bestLand = state.setItem('BestLandCost', new caap.landRecord().data);
                caap.sellLand = {};
                ss = $j("tr[class*='land_buy_row']", caap.globalContainer);
                if (!$u.hasContent(ss)) {
                    $u.warn("Can't find land_buy_row");
                    return false;
                }

                ss.each(function () {
                    row = $j(this);
                    if (!$u.hasContent(row)) {
                        return true;
                    }

                    selectLands(row, 10);
                    infoDiv = $j("div[class*='land_buy_info']", row);
                    if (!$u.hasContent(infoDiv)) {
                        $u.warn("Can't find land_buy_info");
                        return true;
                    }

                    strongs = $j("strong", infoDiv);
                    if (!$u.hasContent(strongs)) {
                        $u.warn("Can't find strong");
                        return true;
                    }

                    name = strongs.eq(0).text().trim();
                    if (!$u.hasContent(name)) {
                        $u.warn("Can't find land name");
                        return true;
                    }

                    moneyss = $j("strong[class*='gold']", row);
                    if (!$u.hasContent(moneyss) || moneyss.length < 2) {
                        $u.warn("Can't find 2 gold instances");
                        return true;
                    }

                    nums = [];
                    moneyss.each(function () {
                        incomeEl = $j(this);
                        if (incomeEl.attr("class").hasIndexOf('label')) {
                            incomeEl = income.parent();
                            tStr = incomeEl.text();
                            tStr = tStr ? tStr.regex(/([\d,]+)/) : '';
                            if (!tStr) {
                                $u.warn('Cannot find income for ', name, tStr);
                                return true;
                            }
                        } else {
                            tStr = incomeEl.text();
                        }

                        income = tStr ? tStr.numberOnly() : 0;
                        nums.push(income);
                        return true;
                    });

                    income = nums[0] ? nums[0] : 0;
                    cost = nums[1] ? nums[1] : 0;
                    if (!income || !cost) {
                        $u.warn("Can't find income or cost for", name);
                        return true;
                    }

                    if (income > cost) {
                        // income is always less than the cost of land.
                        income = nums[1] ? nums[1] : 0;
                        cost = nums[0] ? nums[0] : 0;
                    }

                    // Lets get our max allowed from the land_buy_info div
                    tStr = infoDiv.text();
                    tStr = tStr ? tStr.match(/:\s+\d+/i).toString().trim().replace(/:\s+/, '') : '';
                    maxAllowed = tStr ? tStr.parseInt() : 0;
                    // Lets get our owned total from the land_buy_costs div
                    div = $j("div[class*='land_buy_costs']", row);
                    tStr = div.text();
                    tStr = tStr ? tStr.match(/:\s+\d+/i).toString().trim().replace(/:\s+/, '') : '';
                    owned = tStr ? tStr.parseInt() : 0;
                    land = new caap.landRecord();
                    land.data['row'] = row;
                    land.data['name'] = name;
                    land.data['income'] = income;
                    land.data['cost'] = cost;
                    land.data['maxAllowed'] = maxAllowed;
                    land.data['owned'] = owned;
                    land.data['buy'] = (maxAllowed - owned) > 10 ? 10 : maxAllowed - owned;
                    land.data['totalCost'] = land.data['buy'] * cost;
                    roi = (((income / cost) * 240000) / 100).dp(2);
                    if (!$u.hasContent($j("input[name='Buy']", row))) {
                        roi = 0;
                        // If we own more than allowed we will set land and selection
                        for (s = 2; s >= 0; s -= 1) {
                            if (land.data['owned'] - land.data['maxAllowed'] >= selection[s]) {
                                caap.sellLand = land.data;
                                selectLands(row, selection[s], 'Sell');
                                break;
                            }
                        }
                    }

                    land.data['roi'] = roi ? roi : 0;
                    div = $j("strong", infoDiv);
                    tStr = div.eq(0).text();
                    div.eq(0).text(tStr + " | " + land.data['roi'] + "% per day.");
                    $u.log(4, "Land:", land.data['name']);
                    if (land.data['roi'] > 0 && land.data['roi'] > caap.bestLand['roi']) {
                        $u.log(4, "Set Land:", land.data['name'], land.data);
                        caap.bestLand = $j.extend(true, {}, land.data);
                    }

                    return true;
                });

                $j.extend(true, bestLandCost, caap.bestLand);
                delete bestLandCost['row'];
                bestLandCost['set'] = true;
                bestLandCost['last'] = new Date().getTime();
                state.setItem('BestLandCost', bestLandCost);
                $u.log(2, "Best Land Cost: ", bestLandCost['name'], bestLandCost['cost'], bestLandCost);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_land: " + err);
                return false;
            }
        },

        noLandsLog: true,

        lands: function () {
            try {
                if (!config.getItem('autoBuyLand', false)) {
                    return false;
                }

                var bestLandCost = {},
                    cashTotAvail = 0,
                    cashNeed     = 0,
                    theGeneral   = '';

                function buySellLand(land, type) {
                    try {
                        type = type ? type : 'Buy';
                        var button = $j("input[name='" + type + "']", land['row']);
                        if ($u.hasContent(button)) {
                            if (type === 'Buy') {
                                caap.bestLand = state.setItem('BestLandCost', new caap.landRecord().data);
                            } else {
                                caap.sellLand = {};
                            }

                            caap.click(button, 15000);
                            return true;
                        } else {
                            $u.warn(type + " button not found!");
                            return false;
                        }
                    } catch (err) {
                        $u.error("ERROR in buySellLand: " + err);
                        return false;
                    }
                }

                // Do we have lands above our max to sell?
                if (!$j.isEmptyObject(caap.sellLand) && config.getItem('SellLands', false)) {
                    $u.log(2, "Selling land", caap.sellLand['name']);
                    buySellLand(caap.sellLand, 'Sell');
                    return true;
                }

                bestLandCost = state.getItem('BestLandCost', new caap.landRecord().data);
                if (!bestLandCost['set']) {
                    $u.log(2, "Going to land to get Best Land Cost");
                    if (caap.navigateTo('soldiers,land', caap.hasImage('tab_land_on.gif') ? '' : 'tab_land_on.gif')) {
                        return true;
                    }
                }

                if (bestLandCost['cost'] === 0) {
                    if (caap.noLandsLog) {
                        $u.log(2, "No lands to purchase");
                        caap.noLandsLog = false;
                    }

                    return false;
                }

                if (!caap.stats['gold']['bank'] && caap.stats['gold']['bank'] !== 0) {
                    $u.log(2, "Going to keep to get Stored Value");
                    if (caap.navigateTo('keep')) {
                        return true;
                    }
                }

                // Retrieving from Bank
                cashTotAvail = caap.stats['gold']['cash'] + (caap.stats['gold']['bank'] - config.getItem('minInStore', 0));
                cashNeed = bestLandCost['buy'] * bestLandCost['cost'];
                theGeneral = config.getItem('IdleGeneral', 'Use Current');
                if ((cashTotAvail >= cashNeed) && (caap.stats['gold']['cash'] < cashNeed)) {
                    if (theGeneral !== 'Use Current') {
                        $u.log(2, "Changing to idle general");
                        if (general.Select('IdleGeneral')) {
                            return true;
                        }
                    }

                    $u.log(2, "Trying to retrieve", cashNeed - caap.stats['gold']['cash']);
                    return caap.retrieveFromBank(cashNeed - caap.stats['gold']['cash']);
                }

                // Need to check for enough moneys + do we have enough of the builton type that we already own.
                if (bestLandCost['cost'] && caap.stats['gold']['cash'] >= cashNeed) {
                    if (theGeneral !== 'Use Current') {
                        $u.log(2, "Changing to idle general");
                        if (general.Select('IdleGeneral')) {
                            return true;
                        }
                    }

                    caap.navigateTo('soldiers,land');
                    if (caap.hasImage('tab_land_on.gif')) {
                        if (bestLandCost['buy']) {
                            $u.log(2, "Buying land", caap.bestLand['name']);
                            if (buySellLand(caap.bestLand)) {
                                return true;
                            }
                        }
                    } else {
                        return caap.navigateTo('soldiers,land');
                    }
                }

                return false;
            } catch (err) {
                $u.error("ERROR in lands: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          CHECKS
        /////////////////////////////////////////////////////////////////////

        checkKeep: function () {
            try {
                if (!schedule.check("keep")) {
                    return false;
                }

                $u.log(2, 'Visiting keep to get stats');
                return caap.navigateTo('keep', 'tab_stats_on.gif');
            } catch (err) {
                $u.error("ERROR in checkKeep: " + err);
                return false;
            }
        },

        checkOracle: function () {
            try {
                if (!schedule.check("oracle")) {
                    return false;
                }

                $u.log(2, "Checking Oracle for Favor Points");
                return caap.navigateTo('oracle', 'oracle_on.gif');
            } catch (err) {
                $u.error("ERROR in checkOracle: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkBattleRank: function () {
            try {
                if (!schedule.check("battlerank") || caap.stats['level'] < 8) {
                    return false;
                }

                $u.log(2, 'Visiting Battle Rank to get stats');
                return caap.navigateTo('battle,battlerank', 'tab_battle_rank_on.gif');
            } catch (err) {
                $u.error("ERROR in checkBattleRank: " + err);
                return false;
            }
        },

        checkWarRank: function () {
            try {
                if (!schedule.check("warrank") || caap.stats['level'] < 100) {
                    return false;
                }

                $u.log(2, 'Visiting War Rank to get stats');
                return caap.navigateTo('battle,war_rank', 'tab_war_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckWar: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        checkGenerals: function () {
            try {
                if (!schedule.check("generals")) {
                    return false;
                }

                $u.log(2, "Visiting generals to get 'General' list");
                return caap.navigateTo('mercenary,generals', 'tab_generals_on.gif');
            } catch (err) {
                $u.error("ERROR in checkGenerals: " + err);
                return false;
            }
        },

        checkAllGenerals: function () {
            try {
                if (!schedule.check("allGenerals")) {
                    return false;
                }

                return general.GetAllStats();
            } catch (err) {
                $u.error("ERROR in checkAllGenerals: " + err);
                return false;
            }
        },

        checkSoldiers: function () {
            try {
                if (!schedule.check("soldiers")) {
                    return false;
                }

                $u.log(2, "Checking Soldiers");
                return caap.navigateTo('soldiers', 'tab_soldiers_on.gif');
            } catch (err) {
                $u.error("ERROR in checkSoldiers: " + err);
                return false;
            }
        },


        checkItem: function () {
            try {
                if (!schedule.check("item")) {
                    return false;
                }

                $u.log(2, "Checking Item");
                return caap.navigateTo('soldiers,item', 'tab_black_smith_on.gif');
            } catch (err) {
                $u.error("ERROR in checkItem: " + err);
                return false;
            }
        },

        checkMagic: function () {
            try {
                if (!schedule.check("magic")) {
                    return false;
                }

                $u.log(2, "Checking Magic");
                return caap.navigateTo('soldiers,magic', 'tab_magic_on.gif');
            } catch (err) {
                $u.error("ERROR in checkMagic: " + err);
                return false;
            }
        },

        checkAchievements: function () {
            try {
                if (!schedule.check("achievements")) {
                    return false;
                }

                $u.log(2, 'Visiting achievements to get stats');
                return caap.navigateTo('keep,achievements', 'tab_achievements_on.gif');
            } catch (err) {
                $u.error("ERROR in checkAchievements: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkSymbolQuests: function () {
            try {
                if (!schedule.check("symbolquests") || caap.stats['level'] < 8) {
                    return false;
                }

                $u.log(2, "Visiting symbolquests to get 'Demi-Power' points");
                return caap.navigateTo('quests,symbolquests', 'demi_quest_on.gif');
            } catch (err) {
                $u.error("ERROR in checkSymbolQuests: " + err);
                return false;
            }
        },

        checkCharacterClasses: function () {
            try {
                if (!schedule.check("view_class_progress") || caap.stats['level'] < 100) {
                    return false;
                }

                $u.log(2, "Checking Monster Class to get Character Class Stats");
                return caap.navigateTo('battle_monster,view_class_progress', 'nm_class_whole_progress_bar.jpg');
            } catch (err) {
                $u.error("ERROR in checkCharacterClasses: " + err);
                return false;
            }
        },

        checkArmy: function () {
            try {
                if (!config.getItem("EnableArmy", true) || !schedule.check("army_member")) {
                    return false;
                }

                return army.run();
            } catch (err) {
                $u.error("ERROR in checkArmy: " + err);
                return false;
            }
        },

        /*jslint sub: false */

        checkGift: function () {
            try {
                if (!schedule.check("gift")) {
                    return false;
                }

                $u.log(2, "Checking Gift");
                return caap.navigateTo('army,gift', 'tab_gifts_on.gif');
            } catch (err) {
                $u.error("ERROR in checkGift: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          BATTLING PLAYERS
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        battleUserId: function (userid) {
            try {
                if (battle.hashCheck(userid)) {
                    return true;
                }

                var battleButton = null,
                    form         = $j(),
                    inp          = $j();

                battleButton = caap.checkForImage(battle.battles['Freshmeat'][config.getItem('BattleType', 'Invade')]);
                if ($u.hasContent(battleButton)) {
                    form = battleButton.parent().parent();
                    if ($u.hasContent(form)) {
                        inp = $j("input[name='target_id']", form);
                        if ($u.hasContent(inp)) {
                            inp.attr("value", userid);
                            state.setItem("lastBattleID", userid);
                            battle.click(battleButton);
                            state.setItem("notSafeCount", 0);
                            return true;
                        } else {
                            $u.warn("target_id not found in battleForm");
                        }
                    } else {
                        $u.warn("form not found in battleButton");
                    }
                } else {
                    $u.warn("battleButton not found");
                }

                return false;
            } catch (err) {
                $u.error("ERROR in battleUserId: " + err);
                return false;
            }
        },

        battleWarnLevel: true,

        battle: function (mode) {
            try {
                var whenBattle    = '',
                    target        = '',
                    battletype    = '',
                    useGeneral    = '',
                    staminaReq    = 0,
                    chainImg      = '',
                    button        = null,
                    raidName      = '',
                    battleChainId = 0,
                    targetMonster = '',
                    targetRaid    = '',
                    whenMonster   = '',
                    targetType    = '',
                    rejoinSecs    = '',
                    battleRecord  = {},
                    tempTime      = 0;

                if (caap.stats['level'] < 8) {
                    if (caap.battleWarnLevel) {
                        $u.log(1, "Battle: Unlock at level 8");
                        caap.battleWarnLevel = false;
                    }

                    return false;
                }

                whenBattle = config.getItem('WhenBattle', 'Never');
                whenMonster = config.getItem('WhenMonster', 'Never');
                targetMonster = state.getItem('targetFrombattle_monster', '');
                targetRaid = state.getItem('targetFromraid', '');
                switch (whenBattle) {
                case 'Never' :
                    caap.setDivContent('battle_mess', 'Battle off');
                    return false;
                case 'Stay Hidden' :
                    if (!caap.needToHide()) {
                        caap.setDivContent('battle_mess', 'We Dont Need To Hide Yet');
                        $u.log(1, 'We Dont Need To Hide Yet');
                        return false;
                    }

                    break;
                case 'No Monster' :
                    if (mode !== 'DemiPoints') {
                        if (whenMonster !== 'Never' && targetMonster && !/the deathrune siege/i.test(targetMonster)) {
                            return false;
                        }
                    }

                    break;
                case 'Demi Points Only' :
                    if (mode === 'DemiPoints' && whenMonster === 'Never') {
                        return false;
                    }

                    if (mode !== 'DemiPoints' && whenMonster !== 'Never' && targetMonster && !/the deathrune siege/i.test(targetMonster)) {
                        return false;
                    }

                    if (battle.selectedDemisDone(true) || (config.getItem("DemiPointsFirst", false) && whenMonster !== 'Never' && config.getItem("observeDemiFirst", false) && state.getItem('DemiPointsDone', false))) {
                        return false;
                    }

                    break;
                default :
                }

                if (caap.checkKeep()) {
                    return true;
                }

                if (caap.stats['health']['num'] < 10) {
                    $u.log(5, 'Health is less than 10: ', caap.stats['health']['num']);
                    return false;
                }

                if (config.getItem("waitSafeHealth", false) && caap.stats['health']['num'] < 13) {
                    $u.log(5, 'Unsafe. Health is less than 13: ', caap.stats['health']['num']);
                    return false;
                }

                target = battle.getTarget(mode);
                $u.log(5, 'Mode/Target', mode, target);
                if (!target) {
                    $u.log(1, 'No valid battle target');
                    return false;
                } else if (!$u.isNumber(target)) {
                    target = target.toLowerCase();
                }

                if (target === 'noraid') {
                    $u.log(5, 'No Raid To Attack');
                    return false;
                }

                battletype = config.getItem('BattleType', 'Invade');
                switch (battletype) {
                case 'Invade' :
                    useGeneral = 'InvadeGeneral';
                    staminaReq = target === 'raid' ? state.getItem('RaidStaminaReq', 1) : 1;
                    chainImg = 'battle_invade_again.gif';
                    if (general.LevelUpCheck(useGeneral)) {
                        useGeneral = 'LevelUpGeneral';
                        $u.log(3, 'Using level up general');
                    }

                    break;
                case 'Duel' :
                    useGeneral = 'DuelGeneral';
                    staminaReq = target === 'raid' ? state.getItem('RaidStaminaReq', 1) : 1;
                    chainImg = 'battle_duel_again.gif';
                    if (general.LevelUpCheck(useGeneral)) {
                        useGeneral = 'LevelUpGeneral';
                        $u.log(3, 'Using level up general');
                    }

                    break;
                case 'War' :
                    useGeneral = 'WarGeneral';
                    staminaReq = 10;
                    chainImg = 'battle_duel_again.gif';
                    if (general.LevelUpCheck(useGeneral)) {
                        useGeneral = 'LevelUpGeneral';
                        $u.log(3, 'Using level up general');
                    }

                    break;
                default :
                    $u.warn('Unknown battle type ', battletype);
                    return false;
                }

                if (!caap.checkStamina('Battle', staminaReq)) {
                    $u.log(3, 'Not enough stamina for ', battletype, staminaReq);
                    return false;
                }

                // Check if we should chain attack
                if ($u.hasContent($j("img[src*='battle_victory.gif']", caap.resultsWrapperDiv))) {
                    button = caap.checkForImage(chainImg);
                    battleChainId = state.getItem("BattleChainId", 0);
                    if ($u.hasContent(button) && battleChainId) {
                        caap.setDivContent('battle_mess', 'Chain Attack In Progress');
                        $u.log(2, 'Chaining Target', battleChainId);
                        battle.click(button);
                        state.setItem("BattleChainId", 0);
                        return true;
                    }

                    state.setItem("BattleChainId", 0);
                }

                if (!state.getItem("notSafeCount", 0)) {
                    state.setItem("notSafeCount", 0);
                }

                $u.log(2, 'Battle Target', target);
                targetType = config.getItem('TargetType', 'Invade');
                switch (target) {
                case 'raid' :
                    if (!schedule.check("RaidNoTargetDelay")) {
                        rejoinSecs = ((schedule.getItem("RaidNoTargetDelay").next - new Date().getTime()) / 1000).dp() + ' secs';
                        $u.log(2, 'Rejoining the raid in', rejoinSecs);
                        caap.setDivContent('battle_mess', 'Joining the Raid in ' + rejoinSecs);
                        return false;
                    }

                    if (general.Select(useGeneral)) {
                        return true;
                    }

                    caap.setDivContent('battle_mess', 'Joining the Raid');
                    // This is a temporary fix for the web3 url until CA fix their HTML
                    if (caap.domain.which === 2 && !$u.hasContent($j("img[src*='tab_raid_']", caap.appBodyDiv))) {
                        if (caap.navigateTo(caap.battlePage + ',arena', 'tab_arena_on.gif')) {
                            return true;
                        }
                    }

                    if (caap.navigateTo(caap.battlePage + ',raid', 'tab_raid_on.gif')) {
                        return true;
                    }

                    if (config.getItem('clearCompleteRaids', false) && $u.hasContent(monster.completeButton['raid']['button']) && $u.hasContent(monster.completeButton['raid']['name'])) {
                        caap.click(monster.completeButton['raid']['button']);
                        monster.deleteItem(monster.completeButton['raid']['name']);
                        monster.completeButton['raid'] = {'name': undefined, 'button': undefined};
                        caap.updateDashboard(true);
                        $u.log(1, 'Cleared a completed raid');
                        return true;
                    }

                    raidName = state.getItem('targetFromraid', '');
                    if (!$u.hasContent($j("div[style*='dragon_title_owner']", caap.globalContainer))) {
                        button = monster.engageButtons[raidName];
                        if ($u.hasContent(button)) {
                            caap.click(button);
                            return true;
                        }

                        $u.warn('Unable to engage raid', raidName);
                        return false;
                    }

                    if (monster.ConfirmRightPage(raidName)) {
                        return true;
                    }

                    // The user can specify 'raid' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                    if (targetType === "Userid List") {
                        if (battle.freshmeat('Raid')) {
                            if ($u.hasContent($j("span[class*='result_body']", caap.globalContainer))) {
                                battle.nextTarget();
                            }

                            if (state.getItem("notSafeCount", 0) > 10) {
                                state.setItem("notSafeCount", 0);
                                battle.nextTarget();
                            }

                            return true;
                        }

                        $u.warn('Doing Raid UserID list, but no target');
                        return false;
                    }

                    return battle.freshmeat('Raid');
                case 'freshmeat' :
                    if (general.Select(useGeneral)) {
                        return true;
                    }

                    if (caap.navigateTo(caap.battlePage, 'battle_on.gif')) {
                        return true;
                    }

                    caap.setDivContent('battle_mess', 'Battling ' + target);
                    // The user can specify 'freshmeat' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                    if (targetType === "Userid List") {
                        if (battle.freshmeat('Freshmeat')) {
                            if ($u.hasContent($j("span[class*='result_body']", caap.globalContainer))) {
                                battle.nextTarget();
                            }

                            if (state.getItem("notSafeCount", 0) > 10) {
                                state.setItem("notSafeCount", 0);
                                battle.nextTarget();
                            }

                            return true;
                        }

                        $u.warn('Doing Freshmeat UserID list, but no target');
                        return false;
                    }

                    return battle.freshmeat('Freshmeat');
                default:
                    if (!config.getItem("IgnoreBattleLoss", false)) {
                        battleRecord = battle.getItem(target);
                        switch (config.getItem("BattleType", 'Invade')) {
                        case 'Invade' :
                            tempTime = battleRecord.invadeLostTime ? battleRecord.invadeLostTime : tempTime;
                            break;
                        case 'Duel' :
                            tempTime = battleRecord.duelLostTime ? battleRecord.duelLostTime : tempTime;
                            break;
                        case 'War' :
                            tempTime = battleRecord.warlostTime ? battleRecord.warlostTime : tempTime;
                            break;
                        default :
                            $u.warn("Battle type unknown!", config.getItem("BattleType", 'Invade'));
                        }

                        if (battleRecord && battleRecord.nameStr !== '' && !schedule.since(tempTime, 604800)) {
                            $u.log(1, 'Avoiding Losing Target', target);
                            battle.nextTarget();
                            return true;
                        }
                    }

                    if (general.Select(useGeneral)) {
                        return true;
                    }

                    if (caap.navigateTo(caap.battlePage, 'battle_on.gif')) {
                        return true;
                    }

                    //state.setItem('BattleChainId', 0);
                    if (caap.battleUserId(target)) {
                        battle.nextTarget();
                        return true;
                    }

                    $u.warn('Doing default UserID list, but no target');
                    return false;
                }
            } catch (err) {
                $u.error("ERROR in battle: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          GUILD
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkResults_guild: function () {
            try {
                // Guild
                var guildTxt   = '',
                    guildDiv   = $j(),
                    tStr       = '',
                    members    = [],
                    save       = false;

                guildTxt = $j("#" + caap.domain.id[caap.domain.which] + "guild_achievement", caap.globalContainer).text().trim().innerTrim();
                if ($u.hasContent(guildTxt)) {
                    tStr = guildTxt.regex(/Monster ([\d,]+)/);
                    caap.stats['guild']['mPoints'] = $u.hasContent(tStr) ? ($u.isString(tStr) ? tStr.numberOnly() : tStr) : 0;
                    tStr = guildTxt.regex(/Battle ([\d,]+)/);
                    caap.stats['guild']['bPoints'] = $u.hasContent(tStr) ? ($u.isString(tStr) ? tStr.numberOnly() : tStr) : 0;
                    tStr = guildTxt.regex(/Monster [\d,]+ points \(Top (\d+\-\d+%)\)/);
                    caap.stats['guild']['mRank'] = $u.hasContent(tStr) ? tStr : '';
                    tStr = guildTxt.regex(/Battle [\d,]+ points \(Top (\d+\-\d+%)\)/);
                    caap.stats['guild']['bRank'] = $u.hasContent(tStr) ? tStr : '';
                    save = true;
                } else {
                    $u.warn('Using stored guild Monster and Battle points.');
                }

                guildTxt = $j("#" + caap.domain.id[caap.domain.which] + "guild_blast input[name='guild_id']", caap.globalContainer).attr("value");
                if ($u.hasContent(guildTxt)) {
                    caap.stats['guild']['id'] = guildTxt;
                    save = true;
                } else {
                    $u.warn('Using stored guild_id.');
                }

                guildTxt = $j("#" + caap.domain.id[caap.domain.which] + "guild_banner_section", caap.globalContainer).text().trim();
                if ($u.hasContent(guildTxt)) {
                    caap.stats['guild']['name'] = guildTxt;
                    save = true;
                } else {
                    $u.warn('Using stored guild name.');
                }

                guildDiv = $j("#" + caap.domain.id[caap.domain.which] + "cta_log div[style*='guild_main_score_middle'] a[href*='keep.php?casuser']", caap.globalContainer);
                if ($u.hasContent(guildDiv)) {
                    guildDiv.each(function () {
                        var t = $j(this),
                            uid = t.attr("href").regex(/casuser=(\d+)/),
                            name = t.text().trim();

                        if (uid !== caap.stats['FBID']) {
                            members.push({'userId': uid, 'name': name});
                        }
                    });

                    caap.stats['guild']['members'] = members.slice();
                    save = true;
                } else {
                    $u.warn('Using stored guild member count.');
                }

                $u.log(2, "checkResults_guild", caap.stats['guild']);
                if (save) {
                    caap.saveStats();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_guild: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          GUILD BATTLES
        /////////////////////////////////////////////////////////////////////

        checkResults_guild_current_battles: function () {
            try {
                var tempDiv = $j();
                tempDiv = $j("img[src*='guild_symbol']");
                if (tempDiv && tempDiv.length) {
                    tempDiv.each(function () {
                        $u.log(5, "name", $j(this).parent().parent().next().text().trim());
                        $u.log(5, "button", $j(this).parent().parent().parent().next().find("input[src*='dragon_list_btn_']"));
                    });
                } else {
                    return false;
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_guild_current_battles: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          GUILD MONSTERS
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        /*-------------------------------------------------------------------------------------\
        GuildMonsterReview is a primary action subroutine to mange the guild monster on the dashboard
        \-------------------------------------------------------------------------------------*/
        guildMonsterReview: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                We do guild monster review once an hour.  Some routines may reset this timer to drive
                GuildMonsterReview immediately.
                \-------------------------------------------------------------------------------------*/
                if (!schedule.check("guildMonsterReview") || config.getItem('WhenGuildMonster', 'Never') === 'Never') {
                    return false;
                }

                if (!caap.stats['guild']['id']) {
                    $u.log(2, "Going to guild to get Guild Id");
                    if (caap.navigateTo('guild')) {
                        return true;
                    }
                }

                var record = {},
                    url    = '',
                    objective = '';

                if (state.getItem('guildMonsterBattlesRefresh', true)) {
                    if (guild_monster.navigate_to_battles_refresh()) {
                        return true;
                    }
                }

                if (!state.getItem('guildMonsterBattlesReview', false)) {
                    if (guild_monster.navigate_to_battles()) {
                        return true;
                    }

                    state.setItem('guildMonsterBattlesReview', true);
                }

                record = guild_monster.getReview();
                if (record && $j.isPlainObject(record) && !$j.isEmptyObject(record)) {
                    $u.log(1, "Reviewing Slot (" + record['slot'] + ") Name: " + record['name']);
                    if (caap.stats['staminaT']['num'] > 0 && config.getItem("doGuildMonsterSiege", true)) {
                        objective = "&action=doObjective";
                    }

                    url = "guild_battle_monster.php?twt2=" + guild_monster.info[record['name']].twt2 + "&guild_id=" + record['guildId'] + objective + "&slot=" + record['slot'] + "&ref=nf";
                    state.setItem('guildMonsterReviewSlot', record['slot']);
                    caap.clickAjaxLinkSend(url);
                    return true;
                }

                schedule.setItem("guildMonsterReview", gm.getItem('guildMonsterReviewMins', 60, hiddenVar) * 60, 300);
                state.setItem('guildMonsterBattlesRefresh', true);
                state.setItem('guildMonsterBattlesReview', false);
                state.setItem('guildMonsterReviewSlot', 0);
                guild_monster.select(true);
                $u.log(1, 'Done with guild monster review.');
                return false;
            } catch (err) {
                $u.error("ERROR in guildMonsterReview: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        checkResults_guild_current_monster_battles: function () {
            try {
                caap.globalContainer.find("input[src*='dragon_list_btn_']").unbind('click', caap.guildMonsterEngageListener).bind('click', caap.guildMonsterEngageListener);
                guild_monster.populate();

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_guild_current_monster_battles: " + err);
                return false;
            }
        },

        checkResults_guild_battle_monster: function () {
            try {
                caap.globalContainer.find("input[src*='guild_duel_button']").unbind('click', caap.guildMonsterEngageListener).bind('click', caap.guildMonsterEngageListener);
                guild_monster.onMonster();
                if (config.getItem("enableTitles", true)) {
                    spreadsheet.doTitles();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_guild_battle_monster: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        guildMonster: function () {
            try {
                var when    = '',
                    record  = {},
                    minion  = {},
                    form    = $j(),
                    key     = $j(),
                    url     = '',
                    attack  = 0,
                    stamina = 0;

                when = config.getItem("WhenGuildMonster", 'Never');
                if (when === 'Never') {
                    return false;
                }

                if (!caap.stats['guild']['id']) {
                    $u.log(2, "Going to guild to get Guild Id");
                    if (caap.navigateTo('guild')) {
                        return true;
                    }
                }

                /*
                if (!caap.stats['guild']['id']) {
                    $u.log(2, "Going to keep to get Guild Id");
                    if (caap.navigateTo('keep')) {
                        return true;
                    }
                }
                */

                if (config.getItem('doClassicMonstersFirst', false) && config.getItem("WhenMonster", 'Never') !== 'Never') {
                    if (config.getItem("DemiPointsFirst", false) && !battle.selectedDemisDone()) {
                        return false;
                    }

                    if ((state.getItem('targetFrombattle_monster', '') || state.getItem('targetFromraid', ''))) {
                        return false;
                    }
                }

                if (caap.inLevelUpMode()) {
                    if (caap.stats['staminaT']['num'] < 5) {
                        caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + 5);
                        return false;
                    }
                } else if (when === 'Stamina Available') {
                    stamina = state.getItem('staminaGuildMonster', 0);
                    if (caap.stats['staminaT']['num'] < stamina) {
                        caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + stamina);
                        return false;
                    }

                    state.setItem('staminaGuildMonster', 0);
                    record = state.getItem('targetGuildMonster', {});
                    if (record && $j.isPlainObject(record) && !$j.isEmptyObject(record)) {
                        minion = guild_monster.getTargetMinion(record);
                        if (minion && $j.isPlainObject(minion) && !$j.isEmptyObject(minion)) {
                            stamina = guild_monster.getStaminaValue(record, minion);
                            state.setItem('staminaGuildMonster', stamina);
                            if (caap.stats['staminaT']['num'] < stamina) {
                                caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + stamina);
                                return false;
                            }
                        } else {
                            return false;
                        }
                    } else {
                        return false;
                    }
                } else if (when === 'At X Stamina') {
                    if (caap.stats['staminaT']['num'] >= config.getItem("MaxStaminaToGMonster", 20)) {
                        state.setItem('guildMonsterBattlesBurn', true);
                    }

                    if (caap.stats['staminaT']['num'] <= config.getItem("MinStaminaToGMonster", 0) || caap.stats['staminaT']['num'] < 1) {
                        state.setItem('guildMonsterBattlesBurn', false);
                    }

                    if (!state.getItem('guildMonsterBattlesBurn', false)) {
                        caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + config.getItem("MaxStaminaToGMonster", 20));
                        return false;
                    }
                } else if (when === 'At Max Stamina') {
                    if (caap.stats['staminaT']['num'] < caap.stats['stamina']['max'] || caap.stats['staminaT']['num'] < 1) {
                        caap.setDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + caap.stats['stamina']['max']);
                        return false;
                    }
                }

                caap.setDivContent('guild_monster_mess', '');
                record = guild_monster.select(true);
                if (record && $j.isPlainObject(record) && !$j.isEmptyObject(record)) {
                    if (general.Select('GuildMonsterGeneral')) {
                        return true;
                    }

                    if (!guild_monster.checkPage(record)) {
                        $u.log(2, "Fighting Slot (" + record['slot'] + ") Name: " + record['name']);
                        caap.setDivContent('guild_monster_mess', "Fighting ("  + record['slot'] + ") " + record['name']);
                        url = "guild_battle_monster.php?twt2=" + guild_monster.info[record['name']].twt2 + "&guild_id=" + record['guildId'] + "&slot=" + record['slot'];
                        caap.clickAjaxLinkSend(url);
                        return true;
                    }

                    minion = guild_monster.getTargetMinion(record);
                    if (minion && $j.isPlainObject(minion) && !$j.isEmptyObject(minion)) {
                        $u.log(2, "Fighting target_id (" + minion['target_id'] + ") Name: " + minion['name']);
                        caap.setDivContent('guild_monster_mess', "Fighting (" + minion['target_id'] + ") " + minion['name']);
                        key = $j("#" + caap.domain.id[caap.domain.which] + "attack_key_" + minion['target_id']);
                        if (key && key.length) {
                            attack = guild_monster.getAttackValue(record, minion);
                            if (!attack) {
                                return false;
                            }

                            key.attr("value", attack);
                            form = key.parents("form").eq(0);
                            if (form && form.length) {
                                caap.click(form.find("input[src*='guild_duel_button2.gif'],input[src*='monster_duel_button.gif']"));
                                return true;
                            }
                        }
                    }
                }

                return false;
            } catch (err) {
                $u.error("ERROR in guildMonster: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          ARENA
        /////////////////////////////////////////////////////////////////////

        /*checkResults_arena: function () {
            try {
                return arena.checkResults_arena();
            } catch (err) {
                $u.error("ERROR in checkResults_arena: " + err);
                return false;
            }
        },

        checkResults_arena_battle: function () {
            try {
                return arena.checkResults_arena_battle();
            } catch (err) {
                $u.error("ERROR in checkResults_arena_battle: " + err);
                return false;
            }
        },*/

        /*-------------------------------------------------------------------------------------\
        ArenaReview is a primary action subroutine to mange the Arena on the dashboard
        \-------------------------------------------------------------------------------------*/
        /*arenaReview: function () {
            try {
                return arena.review();
            } catch (err) {
                $u.error("ERROR in arenaReview: " + err);
                return false;
            }
        },

        arena: function () {
            try {
                return arena.arena();
            } catch (err) {
                $u.error("ERROR in arena: " + err);
                return false;
            }
        },*/

        /////////////////////////////////////////////////////////////////////
        //                          MONSTERS AND BATTLES
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkResults_fightList: function () {
            try {
                var buttonsDiv            = $j("img[src*='dragon_list_btn_']" + (config.getItem("festivalTower", false) ? ",img[src*='festival_monster_']" : ""), caap.appBodyDiv),
                    page                  = '',
                    monsterReviewed       = {},
                    it                    = 0,
                    len                   = 0,
                    url                   = '',
                    delList               = [],
                    siege                 = '',
                    engageButtonName      = '',
                    monsterName           = '',
                    monsterRow            = $j(),
                    monsterFull           = '',
                    summonDiv             = $j("img[src*='mp_button_summon_']" + (config.getItem("festivalTower", false) ? ",img[src*='festival_monster_summonbtn.gif']" : ""), caap.appBodyDiv),
                    tempText              = '',
                    pageUserCheck         = 0;

                // get all buttons to check monsterObjectList
                if (!$u.hasContent(summonDiv) && !$u.hasContent(buttonsDiv)) {
                    $u.log(2, "No buttons found");
                    return false;
                }

                page = state.getItem('page', 'battle_monster');
                if ((page === 'battle_monster' || page === 'festival_tower') && !$u.hasContent(buttonsDiv)) {
                    $u.log(2, "No monsters to review");
                    state.setItem('reviewDone', true);
                    return true;
                }

                tempText = buttonsDiv.eq(0).parent().attr("href");
                pageUserCheck = state.getItem('pageUserCheck', 0);
                if (pageUserCheck && tempText && !(new RegExp('user=' + caap.stats['FBID']).test(tempText) || /alchemy\.php/.test(tempText))) {
                    $u.log(2, "On another player's keep.", pageUserCheck);
                    return false;
                }

                // Review monsters and find attack and fortify button
                for (it = 0, len = buttonsDiv.length; it < len; it += 1) {
                    // Make links for easy clickin'
                    url = buttonsDiv.eq(it).parent().attr("href");
                    if (!(url && /user=/.test(url) && (/mpool=/.test(url) || /raid\.php/.test(url)))) {
                        continue;
                    }

                    monsterRow = buttonsDiv.eq(it).parents().eq(3);
                    monsterFull = $u.setContent(monsterRow.text(), '').trim().innerTrim();
                    monsterName = monsterFull.replace(/Completed!/i, '').replace(/Fled!/i, '').trim().innerTrim();
                    monsterReviewed = monster.getItem(monsterName);
                    monsterReviewed['type'] = $u.setContent(monsterReviewed['type'], monster.type(monsterName));
                    monsterReviewed['page'] = page;
                    engageButtonName = page === 'festival_tower' ? $u.setContent(buttonsDiv.eq(it).attr("src"), '').regex(/festival_monster_(\S+)\.gif/i) : $u.setContent(buttonsDiv.eq(it).attr("src"), '').regex(/(dragon_list_btn_\d)/i);
                    switch (engageButtonName) {
                    case 'collectbtn' :
                    case 'dragon_list_btn_2' :
                        monsterReviewed['status'] = 'Collect Reward';
                        monsterReviewed['color'] = 'grey';
                        break;
                    case 'engagebtn' :
                    case 'dragon_list_btn_3' :
                        monster.engageButtons[monsterName] = $j(buttonsDiv.eq(it));
                        break;
                    case 'viewbtn' :
                    case 'dragon_list_btn_4' :
                        if (page === 'raid' && !(/!/.test(monsterFull))) {
                            monster.engageButtons[monsterName] = $j(buttonsDiv.eq(it));
                            break;
                        }

                        if (!$u.hasContent(monster.completeButton['raid']['button']) || !$u.hasContent(monster.completeButton['raid']['name'])) {
                            monster.completeButton[page.replace("festival_tower", "battle_monster")]['name'] = $u.setContent(monsterName, '');
                            monster.completeButton[page.replace("festival_tower", "battle_monster")]['button'] = $u.setContent($j("img[src*='cancelButton.gif']", monsterRow), null);
                        }

                        monsterReviewed['status'] = 'Complete';
                        monsterReviewed['color'] = 'grey';
                        break;
                    default :
                    }

                    monsterReviewed['userId'] = $u.setContent(url.regex(/user=(\d+)/), 0);
                    monsterReviewed['mpool'] = /mpool=\d+/.test(url) ? '&mpool=' + url.regex(/mpool=(\d+)/) : '';
                    monsterReviewed['mid'] = page === 'festival_tower' ? '&mid=' + url.regex(/mid=(\S+)/) : '';
                    siege = monster.info[monsterReviewed['type']] && monster.info[monsterReviewed['type']].siege ? "&action=doObjective" : '';
                    monsterReviewed['link'] = "<a href='" + caap.domain.link + "/" + (page === 'festival_tower' ? 'festival_battle_monster' : page) + ".php?casuser=" + monsterReviewed['userId'] + monsterReviewed['mpool'] + $u.setContent(monsterReviewed['mid'], '') + siege + "'>Link</a>";
                    monster.setItem(monsterReviewed);
                }

                for (it = 0; it < monster.records.length; it += 1) {
                    if (monster.records[it]['page'] === '') {
                        delList.push(monster.records[it]['name']);
                    }
                }

                for (it = 0; it < delList.length; it += 1) {
                    monster.deleteItem(delList[it]);
                }

                state.setItem('reviewDone', true);
                caap.updateDashboard(true);
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_fightList: " + err);
                return false;
            }
        },

        festivalMonsterImgTable: {
            'festival_monsters_top_seamonster_green.jpg'  : {
                name     : 'Emerald Sea Serpent',
                duration : 96
            },
            'festival_monsters_top_seamonster_red.jpg'    : {
                name     : 'Ancient Red Sea Serpent',
                duration : 89
            },
            'festival_monsters_top_seamonster_blue.jpg'   : {
                name     : 'Sapphire Sea Serpent',
                duration : 96
            },
            'festival_monsters_top_seamonster_purple.jpg' : {
                name     : 'Amethyst Sea Serpent',
                duration : 96
            },
            'festival_monsters_top_orcking.jpg'           : {
                name     : 'Gildamesh, The Orc King',
                duration : 96
            },
            'festival_monsters_top_dragon_blue.jpg'       : {
                name     : 'Frost Dragon',
                duration : 96
            },
            'festival_monsters_top_dragon_red.jpg'        : {
                name     : 'Ancient Red Dragon',
                duration : 96
            },
            'festival_monsters_top_dragon_yellow.jpg'     : {
                name     : 'Gold Dragon',
                duration : 96
            },
            'festival_monsters_top_stonegiant.jpg'        : {
                name     : 'Colossus of Terra',
                duration : 96
            },
            'festival_monsters_top_sylvanus.jpg'          : {
                name     : 'Sylvanas the Sorceress Queen',
                duration : 72
            },
            'festival_monsters_top_agamemnon.jpg'         : {
                name     : 'Agamemnon the Overseer',
                duration : 192
            },
            'festival_monsters_top_skaar_boss.jpg'        : {
                name     : 'Skaar Deathrune',
                duration : 120
            },
            'festival_monsters_top_fire_element.jpg'      : {
                name     : 'Gehenna, The Fire Elemental',
                duration : 96
            },
            'festival_monsters_top_hydra.jpg'             : {
                name     : 'Cronus, The World Hydra',
                duration : 144
            },
            'festival_monsters_top_water_element.jpg'     : {
                name     : 'Ragnarok, The Ice Elemental',
                duration : 144
            },
            'festival_monsters_top_earth_element.jpg'     : {
                name     : 'Genesis, The Earth Elemental',
                duration : 144
            },
            'festival_monsters_top_mephistopheles.jpg'    : {
                name     : 'Mephistopheles',
                duration : 89
            },
            'festival_monsters_top_boss_azriel.jpg'       : {
                name     : 'Azriel, the Angel of Wrath',
                duration : 192
            },
            'festival_monsters_top_volcanic_new.jpg'      : {
                name     : 'Bahamut, the Volcanic Dragon',
                duration : 192
            }
        },

        checkResults_viewFight: function () {
            try {
                var currentMonster    = {},
                    time              = [],
                    tempDiv           = $j(),
                    tempText          = '',
                    tempArr           = [],
                    counter           = 0,
                    monstHealthImg    = '',
                    totalCount        = 0,
                    ind               = 0,
                    len               = 0,
                    searchStr         = '',
                    searchRes         = $j(),
                    achLevel          = 0,
                    maxDamage         = 0,
                    maxToFortify      = 0,
                    isTarget          = false,
                    KOBenable         = false,
                    KOBbiasHours      = 0,
                    KOBach            = false,
                    KOBmax            = false,
                    KOBminFort        = false,
                    KOBtmp            = 0,
                    KOBtimeLeft       = 0,
                    KOBbiasedTF       = 0,
                    KOBPercentTimeRemaining = 0,
                    KOBtotalMonsterTime = 0,
                    monsterDiv        = $j("div[style*='dragon_title_owner']" + (config.getItem("festivalTower", false) ? ",div[style*='festival_monsters_top_']" : ""), caap.appBodyDiv),
                    actionDiv         = $j(),
                    damageDiv         = $j(),
                    monsterInfo       = {},
                    targetFromfortify = {},
                    tStr              = '',
                    tBool             = false,
                    fMonstStyle       = '';

                battle.checkResults();
                if (config.getItem("enableTitles", true)) {
                    spreadsheet.doTitles();
                }

                caap.chatLink(caap.appBodyDiv, "#" + caap.domain.id[caap.domain.which] + "chat_log div[style*='hidden'] div[style*='320px']");
                if ($u.hasContent(monsterDiv)) {
                    fMonstStyle = monsterDiv.attr("style").regex(/(festival_monsters_top_\S+\.jpg)/);
                    if ($u.hasContent(fMonstStyle)) {
                        tempText = $u.setContent(monsterDiv.children(":eq(3)").text(), '').trim().replace("summoned", '') + (caap.festivalMonsterImgTable[fMonstStyle] ? caap.festivalMonsterImgTable[fMonstStyle].name : fMonstStyle);
                    } else {
                        tempText = $u.setContent(monsterDiv.children(":eq(2)").text(), '').trim();
                    }
                } else {
                    monsterDiv = $j("div[style*='nm_top']", caap.appBodyDiv);
                    if ($u.hasContent(monsterDiv)) {
                        tempText = $u.setContent(monsterDiv.children(":eq(0)").children(":eq(0)").text(), '').trim();
                        tempDiv = $j("div[style*='nm_bars']", caap.appBodyDiv);
                        if ($u.hasContent(tempDiv)) {
                            tempText += ' ' + $u.setContent(tempDiv.children(":eq(0)").children(":eq(0)").children(":eq(0)").siblings(":last").children(":eq(0)").text(), '').trim().replace("'s Life", "");
                        } else {
                            $u.warn("Problem finding nm_bars");
                            return;
                        }
                    } else {
                        if ($u.hasContent(fMonstStyle)) {
                            $j().alert(fMonstStyle + "<br />I don't know this monster!<br />Please inform me.");
                        }

                        $u.warn("Problem finding dragon_title_owner and nm_top");
                        return;
                    }
                }

                if ($u.hasContent(monsterDiv) && $u.hasContent($j("img[uid='" + caap.stats['FBID'] + "'],.fb_link[href*='" + caap.stats['FBID'] + "'],img[src*='" + caap.stats['FBID'] + "']", monsterDiv))) {
                    $u.log(2, "Your monster found", tempText);
                    tempText = tempText.replace(new RegExp(".+?'s "), 'Your ');
                }

                $u.log(2, "Monster name", tempText);
                currentMonster = monster.getItem(tempText);
                currentMonster['fImg'] = $u.setContent(fMonstStyle, '');
                if (currentMonster['type'] === '') {
                    currentMonster['type'] = monster.type(currentMonster['name']);
                }

                if (currentMonster['type'] === 'Siege' || currentMonster['type'].hasIndexOf('Raid')) {
                    tempDiv = $j("div[style*='raid_back']", caap.appBodyDiv);
                    if ($u.hasContent(tempDiv)) {
                        if ($u.hasContent($j("img[src*='raid_1_large.jpg']", tempDiv))) {
                            currentMonster['type'] = 'Raid I';
                        } else if ($u.hasContent($j("img[src*='raid_b1_large.jpg']", tempDiv))) {
                            currentMonster['type'] = 'Raid II';
                        } else if ($u.hasContent($j("img[src*='raid_1_large_victory.jpg']", tempDiv))) {
                            $u.log(2, "Siege Victory!");
                        } else {
                            $u.log(2, "Problem finding raid image! Probably finished.");
                        }
                    } else {
                        $u.warn("Problem finding raid_back");
                        return;
                    }
                }

                monsterInfo = monster.info[currentMonster['type']];
                currentMonster['review'] = new Date().getTime();
                state.setItem('monsterRepeatCount', 0);
                // Extract info
                tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "monsterTicker", caap.appBodyDiv);
                if ($u.hasContent(tempDiv)) {
                    $u.log(4, "Monster ticker found");
                    time = $u.setContent(tempDiv.text(), '').regex(/(\d+):(\d+):(\d+)/);
                } else {
                    if (!caap.hasImage("dead.jpg")) {
                        $u.warn("Could not locate Monster ticker.");
                    }
                }

                if ($u.hasContent(time) && time.length === 3 && monsterInfo && monsterInfo.fort) {
                    if (currentMonster['type'] === "Deathrune" || currentMonster['type'] === 'Ice Elemental') {
                        currentMonster['fortify'] = 100;
                    } else {
                        currentMonster['fortify'] = 0;
                    }

                    switch (monsterInfo.defense_img) {
                    case 'bar_dispel.gif' :
                        tempDiv = $j("img[src*='" + monsterInfo.defense_img + "']", caap.appBodyDiv).parent();
                        if ($u.hasContent(tempDiv)) {
                            currentMonster['fortify'] = (100 - tempDiv.getPercent('width')).dp(2);
                        } else {
                            $u.warn("Unable to find defense bar", monsterInfo.defense_img);
                        }

                        break;
                    case 'seamonster_ship_health.jpg' :
                        tempDiv = $j("img[src*='" + monsterInfo.defense_img + "']", caap.appBodyDiv).parent();
                        if ($u.hasContent(tempDiv)) {
                            currentMonster['fortify'] = tempDiv.getPercent('width').dp(2);
                            if (monsterInfo.repair_img) {
                                tempDiv = $j("img[src*='" + monsterInfo.repair_img + "']", caap.appBodyDiv).parent();
                                if ($u.hasContent(tempDiv)) {
                                    currentMonster['fortify'] = (currentMonster['fortify'] * (100 / (100 - tempDiv.getPercent('width')))).dp(2);
                                } else {
                                    $u.warn("Unable to find repair bar", monsterInfo.repair_img);
                                }
                            }
                        } else {
                            $u.warn("Unable to find defense bar", monsterInfo.defense_img);
                        }

                        break;
                    case 'nm_green.jpg' :
                        tempDiv = $j("img[src*='" + monsterInfo.defense_img + "']", caap.appBodyDiv);
                        if ($u.hasContent(tempDiv)) {
                            tempDiv = tempDiv.parent();
                            if ($u.hasContent(tempDiv)) {
                                currentMonster['fortify'] = tempDiv.getPercent('width').dp(2);
                                tempDiv = tempDiv.parent();
                                if ($u.hasContent(tempDiv)) {
                                    currentMonster['strength'] = tempDiv.getPercent('width').dp(2);
                                } else {
                                    $u.warn("Unable to find defense bar strength");
                                }
                            } else {
                                $u.warn("Unable to find defense bar fortify");
                            }
                        } else {
                            $u.warn("Unable to find defense bar", monsterInfo.defense_img);
                        }

                        break;
                    default:
                        $u.warn("No match for defense_img", monsterInfo.defense_img);
                    }
                }

                // Get damage done to monster
                actionDiv = $j("#" + caap.domain.id[caap.domain.which] + "action_logs", caap.appBodyDiv);
                damageDiv = $j("td[class='dragonContainer']:first td[valign='top']:first a[href*='user=" + caap.stats['FBID'] + "']:first", actionDiv);
                if ($u.hasContent(damageDiv)) {
                    if (monsterInfo && monsterInfo.defense) {
                        tempArr = $u.setContent(damageDiv.parent().parent().siblings(":last").text(), '').trim().innerTrim().regex(/([\d,]+ dmg) \/ ([\d,]+ def)/);
                        if ($u.hasContent(tempArr) && tempArr.length === 2) {
                            currentMonster['attacked'] = $u.setContent(tempArr[0], '0').numberOnly();
                            currentMonster['defended'] = $u.setContent(tempArr[1], '0').numberOnly();
                            currentMonster['damage'] = currentMonster['attacked'] + currentMonster['defended'];
                        } else {
                            $u.warn("Unable to get attacked and defended damage");
                        }
                    } else if (currentMonster['type'] === 'Siege' || (monsterInfo && monsterInfo.raid)) {
                        currentMonster['attacked'] = $u.setContent(damageDiv.parent().siblings(":last").text(), '0').numberOnly();
                        currentMonster['damage'] = currentMonster['attacked'];
                    } else {
                        currentMonster['attacked'] = $u.setContent(damageDiv.parent().parent().siblings(":last").text(), '0').numberOnly();
                        currentMonster['damage'] = currentMonster['attacked'];
                    }

                    damageDiv.parents("tr").eq(0).css('background-color', gm.getItem("HighlightColor", '#C6A56F', hiddenVar));
                } else {
                    $u.log(2, "Player hasn't done damage yet");
                }

                tBool = /Raid/i.test(currentMonster['type']);
                if (/:ac\b/.test(currentMonster['conditions']) || (tBool && config.getItem('raidCollectReward', false)) || (!tBool && config.getItem('monsterCollectReward', false))) {
                    counter = state.getItem('monsterReviewCounter', config.getItem("festivalTower", false) ? -4 : -3);
                    if (counter >= 0 && monster.records[counter] && monster.records[counter]['name'] === currentMonster['name'] && ($u.hasContent($j("a[href*='&action=collectReward']", caap.globalContainer)) || $u.hasContent($j("input[alt*='Collect Reward']", caap.globalContainer)))) {
                        $u.log(2, 'Collecting Reward');
                        currentMonster['review'] = -1;
                        state.setItem('monsterReviewCounter', counter -= 1);
                        currentMonster['status'] = 'Collect Reward';
                        if (currentMonster['name'].hasIndexOf('Siege')) {
                            currentMonster['rix'] = $u.hasContent($j("a[href*='&rix=1']", caap.globalContainer)) ? 1 : 0;
                        }
                    }
                }

                monstHealthImg = monsterInfo && monsterInfo.alpha ? 'nm_red.jpg' :  'monster_health_background.jpg';
                monsterDiv = $j("img[src*='" + monstHealthImg + "']", caap.appBodyDiv).parent();
                if ($u.hasContent(time) && time.length === 3 && $u.hasContent(monsterDiv)) {
                    currentMonster['time'] = time;
                    if ($u.hasContent(monsterDiv)) {
                        $u.log(4, "Found monster health div");
                        currentMonster['life'] = monsterDiv.getPercent('width').dp(2);
                    } else {
                        $u.warn("Could not find monster health div.");
                    }

                    if (currentMonster['life'] && !monsterInfo) {
                        monster.setItem(currentMonster);
                        $u.warn('Unknown monster');
                        return;
                    }

                    if ($u.hasContent(damageDiv) && monsterInfo && monsterInfo.alpha) {
                        // Character type stuff
                        monsterDiv = $j("div[style*='nm_bottom']", caap.appBodyDiv);
                        if ($u.hasContent(monsterDiv)) {
                            tempText = $u.setContent(monsterDiv.children().eq(0).children().text(), '').trim().innerTrim();
                            if (tempText) {
                                $u.log(4, "Character class text", tempText);
                                tStr = tempText.regex(/Class: (\w+) /);
                                if ($u.hasContent(tStr)) {
                                    currentMonster['charClass'] = tStr;
                                    $u.log(4, "character", currentMonster['charClass']);
                                } else {
                                    $u.warn("Can't get character", tempText);
                                }

                                tStr = tempText.regex(/Tip: ([\w ]+) Status/);
                                if ($u.hasContent(tStr)) {
                                    currentMonster['tip'] = tStr;
                                    $u.log(4, "tip", currentMonster['tip']);
                                } else {
                                    $u.warn("Can't get tip", tempText);
                                }

                                tempArr = tempText.regex(/Status Time Remaining: (\d+):(\d+):(\d+)\s*/);
                                if ($u.hasContent(tempArr) && tempArr.length === 3) {
                                    currentMonster['stunTime'] = new Date().getTime() + (tempArr[0] * 60 * 60 * 1000) + (tempArr[1] * 60 * 1000) + (tempArr[2] * 1000);
                                    $u.log(4, "statusTime", currentMonster['stunTime']);
                                } else {
                                    $u.warn("Can't get statusTime", tempText);
                                }

                                tempDiv = $j("img[src*='nm_stun_bar']", monsterDiv);
                                if ($u.hasContent(tempDiv)) {
                                    tempText = tempDiv.getPercent('width').dp(2);
                                    $u.log(4, "Stun bar percent text", tempText);
                                    if (tempText >= 0) {
                                        currentMonster['stun'] = tempText;
                                        $u.log(4, "stun", currentMonster['stun']);
                                    } else {
                                        $u.warn("Can't get stun bar width");
                                    }
                                } else {
                                    tempArr = currentMonster['tip'].split(" ");
                                    if ($u.hasContent(tempArr)) {
                                        tempText = tempArr[tempArr.length - 1].toLowerCase();
                                        tempArr = ["strengthen", "heal"];
                                        if (tempText && tempArr.hasIndexOf(tempText)) {
                                            if (tempText === tempArr[0]) {
                                                currentMonster['stun'] = currentMonster['strength'];
                                            } else if (tempText === tempArr[1]) {
                                                currentMonster['stun'] = currentMonster['health'];
                                            } else {
                                                $u.warn("Expected strengthen or heal to match!", tempText);
                                            }
                                        } else {
                                            $u.warn("Expected strengthen or heal from tip!", tempText);
                                        }
                                    } else {
                                        $u.warn("Can't get stun bar and unexpected tip!", currentMonster['tip']);
                                    }
                                }

                                if (currentMonster['charClass'] && currentMonster['tip'] && currentMonster['stun'] !== -1) {
                                    currentMonster['stunDo'] = new RegExp(currentMonster['charClass']).test(currentMonster['tip']) && currentMonster['stun'] < 100;
                                    currentMonster['stunType'] = '';
                                    if (currentMonster['stunDo']) {
                                        $u.log(2, "Do character specific attack", currentMonster['stunDo']);
                                        tempArr = currentMonster['tip'].split(" ");
                                        if ($u.hasContent(tempArr)) {
                                            tempText = tempArr[tempArr.length - 1].toLowerCase();
                                            tempArr = ["strengthen", "cripple", "heal", "deflection"];
                                            if (tempText && tempArr.hasIndexOf(tempText)) {
                                                currentMonster['stunType'] = tempText.replace("ion", '');
                                                $u.log(2, "Character specific attack type", currentMonster['stunType']);
                                            } else {
                                                $u.warn("Type does match list!", tempText);
                                            }
                                        } else {
                                            $u.warn("Unable to get type from tip!", currentMonster);
                                        }
                                    } else {
                                        $u.log(3, "Tip does not match class or stun maxed", currentMonster);
                                    }
                                } else {
                                    $u.warn("Missing 'class', 'tip' or 'stun'", currentMonster);
                                }
                            } else {
                                $u.warn("Missing tempText");
                            }
                        } else {
                            $u.warn("Missing nm_bottom");
                        }
                    }

                    if (monsterInfo) {
                        if (monsterInfo.siege) {
                            currentMonster['miss'] = $u.setContent($u.setContent($j("div[style*='monster_layout'],div[style*='nm_bottom'],div[style*='raid_back']").text(), '').trim().innerTrim().regex(/Need (\d+) more/i), 0);
                            for (ind = 0, len = monsterInfo.siege_img.length; ind < len; ind += 1) {
                                searchStr += "img[src*='" + monsterInfo.siege_img[ind] + "']";
                                if (ind < len - 1) {
                                    searchStr += ",";
                                }
                            }

                            searchRes = $j(searchStr, caap.appBodyDiv);
                            if ($u.hasContent(searchRes)) {
                                totalCount = currentMonster['type'].hasIndexOf('Raid') ? $u.setContent(searchRes.attr("src"), '').basename().replace(new RegExp(".*(\\d+).*", "gi"), "$1").parseInt() : searchRes.size() + 1;
                            }

                            currentMonster['phase'] = Math.min(totalCount, monsterInfo.siege);
                            if ($u.isNaN(currentMonster['phase']) || currentMonster['phase'] < 1) {
                                currentMonster['phase'] = 1;
                            }
                        }

                        currentMonster['t2k'] = monster.t2kCalc(currentMonster);
                    }
                } else {
                    $u.log(2, 'Monster is dead or fled');
                    currentMonster['color'] = 'grey';
                    if (currentMonster['status'] !== 'Complete' && currentMonster['status'] !== 'Collect Reward') {
                        currentMonster['status'] = "Dead or Fled";
                    }

                    state.setItem('resetselectMonster', true);
                    monster.setItem(currentMonster);
                    return;
                }

                if ($u.hasContent(damageDiv)) {
                    achLevel = monster.parseCondition('ach', currentMonster['conditions']);
                    if (monsterInfo && achLevel === false) {
                        achLevel = monsterInfo.ach;
                    }

                    maxDamage = monster.parseCondition('max', currentMonster['conditions']);
                    maxToFortify = monster.parseCondition('f%', currentMonster['conditions']);
                    maxToFortify = maxToFortify !== false ? maxToFortify : config.getItem('MaxToFortify', 0);
                    targetFromfortify = state.getItem('targetFromfortify', new monster.energyTarget().data);
                    if (currentMonster['name'] === targetFromfortify['name']) {
                        if (targetFromfortify['type'] === 'Fortify' && currentMonster['fortify'] > maxToFortify) {
                            state.setItem('resetselectMonster', true);
                        }

                        if (targetFromfortify['type'] === 'Strengthen' && currentMonster['strength'] >= 100) {
                            state.setItem('resetselectMonster', true);
                        }

                        if (targetFromfortify['type'] === 'Stun' && !currentMonster['stunDo']) {
                            state.setItem('resetselectMonster', true);
                        }
                    }

                    // Start of Keep On Budget (KOB) code Part 1 -- required variables
                    $u.log(2, 'Start of Keep On Budget (KOB) Code');

                    //default is disabled for everything
                    KOBenable = false;

                    //default is zero bias hours for everything
                    KOBbiasHours = 0;

                    //KOB needs to follow achievment mode for this monster so that KOB can be skipped.
                    KOBach = false;

                    //KOB needs to follow max mode for this monster so that KOB can be skipped.
                    KOBmax = false;

                    //KOB needs to follow minimum fortification state for this monster so that KOB can be skipped.
                    KOBminFort = false;

                    //create a temp variable so we don't need to call parseCondition more than once for each if statement
                    KOBtmp = monster.parseCondition('kob', currentMonster['conditions']);
                    if (KOBtmp !== false && $u.isNaN(KOBtmp)) {
                        $u.log(2, 'KOB NaN branch');
                        KOBenable = true;
                        KOBbiasHours = 0;
                    } else if (KOBtmp === false) {
                        $u.log(2, 'KOB false branch');
                        KOBenable = false;
                        KOBbiasHours = 0;
                    } else {
                        $u.log(2, 'KOB passed value branch');
                        KOBenable = true;
                        KOBbiasHours = KOBtmp;
                    }

                    //test if user wants kob active globally
                    if (!KOBenable && gm.getItem('KOBAllMonters', false, hiddenVar)) {
                        KOBenable = true;
                    }

                    //disable kob if in level up mode or if we are within 5 stamina of max potential stamina
                    if (caap.inLevelUpMode() || caap.stats['stamina']['num'] >= caap.stats['stamina']['max'] - 5) {
                        KOBenable = false;
                    }

                    if (KOBenable) {
                        $u.log(2, 'Level Up Mode: ', caap.inLevelUpMode());
                        $u.log(2, 'Stamina Avail: ', caap.stats['stamina']['num']);
                        $u.log(2, 'Stamina Max: ', caap.stats['stamina']['max']);

                        //log results of previous two tests
                        $u.log(2, 'KOBenable: ', KOBenable);
                        $u.log(2, 'KOB Bias Hours: ', KOBbiasHours);
                    }

                    //Total Time alotted for monster
                    KOBtotalMonsterTime = monsterInfo.duration;
                    if (KOBenable) {
                        $u.log(2, 'Total Time for Monster: ', KOBtotalMonsterTime);

                        //Total Damage remaining
                        $u.log(2, 'HP left: ', currentMonster['life']);
                    }

                    //Time Left Remaining
                    KOBtimeLeft = time[0] + (time[1] * 0.0166);
                    if (KOBenable) {
                        $u.log(2, 'TimeLeft: ', KOBtimeLeft);
                    }

                    //calculate the bias offset for time remaining
                    KOBbiasedTF = KOBtimeLeft - KOBbiasHours;

                    //for 7 day monsters we want kob to not permit attacks (beyond achievement level) for the first 24 to 48 hours
                    // -- i.e. reach achievement and then wait for more players and siege assist clicks to catch up
                    if (KOBtotalMonsterTime >= 168) {
                        KOBtotalMonsterTime = KOBtotalMonsterTime - gm.getItem('KOBDelayStart', 48, hiddenVar);
                    }

                    //Percentage of time remaining for the currently selected monster
                    KOBPercentTimeRemaining = Math.round(KOBbiasedTF / KOBtotalMonsterTime * 1000) / 10;
                    if (KOBenable) {
                        $u.log(2, 'Percent Time Remaining: ', KOBPercentTimeRemaining);
                    }

                    // End of Keep On Budget (KOB) code Part 1 -- required variables

                    isTarget = (currentMonster['name'] === state.getItem('targetFromraid', '') ||
                                currentMonster['name'] === state.getItem('targetFrombattle_monster', '') ||
                                currentMonster['name'] === targetFromfortify['name']);

                    if (maxDamage && currentMonster['damage'] >= maxDamage) {
                        currentMonster['color'] = 'red';
                        currentMonster['over'] = 'max';
                        //used with KOB code
                        KOBmax = true;
                        //used with kob debugging
                        if (KOBenable) {
                            $u.log(2, 'KOB - max activated');
                        }

                        if (isTarget) {
                            state.setItem('resetselectMonster', true);
                        }
                    } else if (currentMonster['fortify'] !== -1 && currentMonster['fortify'] < config.getItem('MinFortToAttack', 1)) {
                        currentMonster['color'] = 'purple';
                        //used with KOB code
                        KOBminFort = true;
                        //used with kob debugging
                        if (KOBenable) {
                            $u.log(2, 'KOB - MinFort activated');
                        }

                        if (isTarget) {
                            state.setItem('resetselectMonster', true);
                        }
                    } else if (currentMonster['damage'] >= achLevel && (config.getItem('AchievementMode', false) || monster.parseCondition('ach', currentMonster['conditions']) !== false)) {
                        currentMonster['color'] = 'darkorange';
                        currentMonster['over'] = 'ach';
                        //used with KOB code
                        KOBach = true;
                        //used with kob debugging
                        if (KOBenable) {
                            $u.log(2, 'KOB - achievement reached');
                        }

                        if (isTarget && currentMonster['damage'] < achLevel) {
                            state.setItem('resetselectMonster', true);
                        }
                    }

                    //Start of KOB code Part 2 begins here
                    if (KOBenable && !KOBmax && !KOBminFort && KOBach && currentMonster['life'] < KOBPercentTimeRemaining) {
                        //kob color
                        currentMonster['color'] = 'magenta';
                        // this line is required or we attack anyway.
                        currentMonster['over'] = 'max';
                        //used with kob debugging
                        if (KOBenable) {
                            $u.log(2, 'KOB - budget reached');
                        }

                        if (isTarget) {
                            state.setItem('resetselectMonster', true);
                            $u.log(1, 'This monster no longer a target due to kob');
                        }
                    } else {
                        if (!KOBmax && !KOBminFort && !KOBach) {
                            //the way that the if statements got stacked, if it wasn't kob it was painted black anyway
                            //had to jump out the black paint if max, ach or fort needed to paint the entry.
                            currentMonster['color'] = $u.bestTextColor(state.getItem("StyleBackgroundLight", "#E0C961"));
                        }
                    }
                    //End of KOB code Part 2 stops here.
                } else {
                    currentMonster['color'] = $u.bestTextColor(state.getItem("StyleBackgroundLight", "#E0C961"));
                }

                monster.setItem(currentMonster);
                monster.select(true);
                caap.updateDashboard(true);
                if (schedule.check('battleTimer')) {
                    window.setTimeout(function () {
                        caap.setDivContent('monster_mess', '');
                    }, 2000);
                }
            } catch (err) {
                $u.error("ERROR in checkResults_viewFight: " + err);
            }
        },

        /*-------------------------------------------------------------------------------------\
        MonsterReview is a primary action subroutine to mange the monster and raid list
        on the dashboard
        \-------------------------------------------------------------------------------------*/
        monsterReview: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                We do monster review once an hour.  Some routines may reset this timer to drive
                MonsterReview immediately.
                \-------------------------------------------------------------------------------------*/
                if (!schedule.check("monsterReview") || (config.getItem('WhenMonster', 'Never') === 'Never' && config.getItem('WhenBattle', 'Never') === 'Never')) {
                    return false;
                }

                /*-------------------------------------------------------------------------------------\
                We get the monsterReviewCounter.  This will be set to -3 if we are supposed to refresh
                the monsterOl completely. Otherwise it will be our index into how far we are into
                reviewing monsterOl.
                \-------------------------------------------------------------------------------------*/
                var fCounter = config.getItem("festivalTower", false) ? -4 : -3,
                    counter = state.getItem('monsterReviewCounter', fCounter),
                    link     = '',
                    tempTime = 0,
                    isSiege  = false,
                    listDiv  = $j(),
                    button   = $j();

                if (counter === fCounter) {
                    state.setItem('monsterReviewCounter', counter += 1);
                    return true;
                }

                // festival tower
                if (config.getItem("festivalTower", false) && counter === -3) {
                    if (caap.stats['level'] > 6) {
                        if (caap.navigateTo('soldiers,festival_home,festival_tower', 'festival_monster_towerlist_button.jpg')) {
                            state.setItem('reviewDone', false);
                            return true;
                        }
                    } else {
                        $u.log(1, "Monsters: Unlock at level 7");
                        state.setItem('reviewDone', true);
                    }

                    if (config.getItem('clearCompleteMonsters', false) && $u.hasContent(monster.completeButton['battle_monster']['button']) && $u.hasContent(monster.completeButton['battle_monster']['name'])) {
                        caap.click(monster.completeButton['battle_monster']['button']);
                        monster.deleteItem(monster.completeButton['battle_monster']['name']);
                        monster.completeButton['battle_monster'] = {'name': undefined, 'button': undefined};
                        caap.updateDashboard(true);
                        $u.log(1, 'Cleared a completed monster');
                        return true;
                    }

                    if (state.getItem('reviewDone', true)) {
                        state.setItem('monsterReviewCounter', counter += 1);
                    } else {
                        return true;
                    }
                }

                if (counter === -2) {
                    if (caap.stats['level'] > 6) {
                        if (caap.navigateTo('keep,battle_monster', 'tab_monster_list_on.gif')) {
                            state.setItem('reviewDone', false);
                            return true;
                        }
                    } else {
                        $u.log(1, "Monsters: Unlock at level 7");
                        state.setItem('reviewDone', true);
                    }

                    if (config.getItem('clearCompleteMonsters', false) && $u.hasContent(monster.completeButton['battle_monster']['button']) && $u.hasContent(monster.completeButton['battle_monster']['name'])) {
                        caap.click(monster.completeButton['battle_monster']['button']);
                        monster.deleteItem(monster.completeButton['battle_monster']['name']);
                        monster.completeButton['battle_monster'] = {'name': undefined, 'button': undefined};
                        caap.updateDashboard(true);
                        $u.log(1, 'Cleared a completed monster');
                        return true;
                    }

                    if (state.getItem('reviewDone', true)) {
                        state.setItem('monsterReviewCounter', counter += 1);
                    } else {
                        return true;
                    }
                }

                if (counter === -1) {
                    if (caap.stats['level'] > 7) {
                        // This is a temporary fix for the web3 url until CA fix their HTML
                        if (caap.domain.which === 2 && !$u.hasContent($j("img[src*='tab_raid_']", caap.appBodyDiv))) {
                            if (caap.navigateTo(caap.battlePage + ',arena', 'tab_arena_on.gif')) {
                                return true;
                            }
                        }

                        if (caap.navigateTo(caap.battlePage + ',raid', 'tab_raid_on.gif')) {
                            state.setItem('reviewDone', false);
                            return true;
                        }
                    } else {
                        $u.log(1, "Raids: Unlock at level 8");
                        state.setItem('reviewDone', true);
                    }

                    if (config.getItem('clearCompleteRaids', false) && $u.hasContent(monster.completeButton['raid']['button']) && $u.hasContent(monster.completeButton['raid']['name'])) {
                        caap.click(monster.completeButton['raid']['button']);
                        monster.deleteItem(monster.completeButton['raid']['name']);
                        monster.completeButton['raid'] = {'name': undefined, 'button': undefined};
                        caap.updateDashboard(true);
                        $u.log(1, 'Cleared a completed raid');
                        return true;
                    }

                    if (state.getItem('reviewDone', true)) {
                        state.setItem('monsterReviewCounter', counter += 1);
                    } else {
                        return true;
                    }
                }

                if (monster.records && monster.records.length === 0) {
                    return false;
                }

                /*-------------------------------------------------------------------------------------\
                Now we step through the monsterOl objects. We set monsterReviewCounter to the next
                index for the next reiteration since we will be doing a click and return in here.
                \-------------------------------------------------------------------------------------*/
                while (counter < monster.records.length) {
                    if (!monster.records[counter]) {
                        state.setItem('monsterReviewCounter', counter += 1);
                        continue;
                    }
                    /*-------------------------------------------------------------------------------------\
                    If we looked at this monster more recently than an hour ago, skip it
                    \-------------------------------------------------------------------------------------*/
                    if (monster.records[counter]['color'] === 'grey' && monster.records[counter]['life'] !== -1) {
                        monster.records[counter]['life'] = -1;
                        monster.records[counter]['fortify'] = -1;
                        monster.records[counter]['strength'] = -1;
                        monster.records[counter]['time'] = [];
                        monster.records[counter]['t2k'] = -1;
                        monster.records[counter]['phase'] = '';
                        monster.save();
                    }

                    tempTime = monster.records[counter]['review'] ? monster.records[counter]['review'] : -1;
                    $u.log(4, "Review", monster.records[counter], !schedule.since(tempTime, gm.getItem("MonsterLastReviewed", 15, hiddenVar) * 60));
                    if (monster.records[counter]['status'] === 'Complete' || !schedule.since(tempTime, gm.getItem("MonsterLastReviewed", 15, hiddenVar) * 60) || state.getItem('monsterRepeatCount', 0) > 2) {
                        state.setItem('monsterReviewCounter', counter += 1);
                        state.setItem('monsterRepeatCount', 0);
                        continue;
                    }
                    /*-------------------------------------------------------------------------------------\
                    We get our monster link
                    \-------------------------------------------------------------------------------------*/
                    caap.setDivContent('monster_mess', 'Reviewing/sieging ' + (counter + 1) + '/' + monster.records.length + ' ' + monster.records[counter]['name']);
                    link = monster.records[counter]['link'];
                    /*-------------------------------------------------------------------------------------\
                    If the link is good then we get the url and any conditions for monster
                    \-------------------------------------------------------------------------------------*/
                    if (/href/.test(link)) {
                        link = link.split("'")[1];
                        /*-------------------------------------------------------------------------------------\
                        If the autocollect token was specified then we set the link to do auto collect. If
                        the conditions indicate we should not do sieges then we fix the link.
                        \-------------------------------------------------------------------------------------*/
                        isSiege = /Raid/.test(monster.records[counter]['type']) || monster.records[counter]['type'] === 'Siege';
                        $u.log(4, "monster.records[counter]", monster.records[counter]);
                        if (((monster.records[counter]['conditions'] && /:ac\b/.test(monster.records[counter]['conditions'])) ||
                                (isSiege && config.getItem('raidCollectReward', false)) ||
                                (!isSiege && config.getItem('monsterCollectReward', false))) && monster.records[counter]['status'] === 'Collect Reward') {

                            if (general.Select('CollectGeneral')) {
                                return true;
                            }

                            link += '&action=collectReward';
                            if (monster.records[counter]['name'].hasIndexOf('Siege')) {
                                if (monster.records[counter]['rix'] !== -1)  {
                                    link += '&rix=' + monster.records[counter]['rix'];
                                } else {
                                    link += '&rix=2';
                                }
                            }

                            link = link.replace('&action=doObjective', '');
                            state.setItem('CollectedRewards', true);
                        } else if ((monster.records[counter]['conditions'] && monster.records[counter]['conditions'].match(':!s')) ||
                                   (!config.getItem('raidDoSiege', true) && isSiege) ||
                                   (!config.getItem('monsterDoSiege', true) && !isSiege && monster.info[monster.records[counter]['type']].siege) ||
                                   caap.stats['stamina']['num'] === 0) {
                            $u.log(2, "Do not siege");
                            link = link.replace('&action=doObjective', '');
                        }
                        /*-------------------------------------------------------------------------------------\
                        Now we use ajaxSendLink to display the monsters page.
                        \-------------------------------------------------------------------------------------*/
                        $u.log(1, 'Reviewing ' + (counter + 1) + '/' + monster.records.length + ' ' + monster.records[counter]['name']);
                        state.setItem('ReleaseControl', true);
                        link = link.replace(caap.domain.link + '/', '').replace('?', '?twt2&');

                        $u.log(2, "Link", link);
                        caap.clickAjaxLinkSend(link);
                        state.setItem('monsterRepeatCount', state.getItem('monsterRepeatCount', 0) + 1);
                        state.setItem('resetselectMonster', true);
                        return true;
                    }
                }
                /*-------------------------------------------------------------------------------------\
                All done.  Set timer and tell monster.select and dashboard they need to do thier thing.
                We set the monsterReviewCounter to do a full refresh next time through.
                \-------------------------------------------------------------------------------------*/
                schedule.setItem("monsterReview", gm.getItem('monsterReviewMins', 60, hiddenVar) * 60, 300);
                state.setItem('resetselectMonster', true);
                state.setItem('monsterReviewCounter', config.getItem("festivalTower", false) ? -4 : -3);
                $u.log(1, 'Done with monster/raid review.');
                caap.setDivContent('monster_mess', '');
                caap.updateDashboard(true);
                if (state.getItem('CollectedRewards', false)) {
                    state.setItem('CollectedRewards', false);
                    monster.flagReview();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in monsterReview: " + err);
                return false;
            }
        },

        monsters: function () {
            try {
                if (config.getItem('WhenMonster', 'Never') === 'Never') {
                    caap.setDivContent('monster_mess', 'Monster off');
                    return false;
                }

                ///////////////// Reivew/Siege all monsters/raids \\\\\\\\\\\\\\\\\\\\\\

                if (config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && caap.needToHide() && caap.checkStamina('Monster', 1)) {
                    $u.log(1, "Stay Hidden Mode: We're not safe. Go battle.");
                    caap.setDivContent('monster_mess', 'Not Safe For Monster. Battle!');
                    return false;
                }

                if (!schedule.check('NotargetFrombattle_monster')) {
                    return false;
                }

                ///////////////// Individual Monster Page \\\\\\\\\\\\\\\\\\\\\\

                // Establish a delay timer when we are 1 stamina below attack level.
                // Timer includes 5 min for stamina tick plus user defined random interval
                if (!caap.inLevelUpMode() && caap.stats['stamina']['num'] === (state.getItem('MonsterStaminaReq', 1) - 1) && schedule.check('battleTimer') && config.getItem('seedTime', 0) > 0) {
                    schedule.setItem('battleTimer', 300, config.getItem('seedTime', 0));
                    caap.setDivContent('monster_mess', 'Monster Delay Until ' + schedule.display('battleTimer'));
                    return false;
                }

                if (!schedule.check('battleTimer')) {
                    if (caap.stats['stamina']['num'] < general.GetStaminaMax(config.getItem('IdleGeneral', 'Use Current'))) {
                        caap.setDivContent('monster_mess', 'Monster Delay Until ' + schedule.display('battleTimer'));
                        return false;
                    }
                }

                var fightMode        = '',
                    monsterName      = state.getItem('targetFromfortify', new monster.energyTarget().data)['name'],
                    monstType        = monster.type(monsterName),
                    nodeNum          = 0,
                    energyRequire    = 10,
                    currentMonster   = monster.getItem(monsterName),
                    imageTest        = '',
                    attackButton     = null,
                    singleButtonList = [],
                    buttonList       = [],
                    tacticsValue     = 0,
                    useTactics       = false,
                    attackMess       = '',
                    pageUserCheck    = 0,
                    it               = 0,
                    len              = 0,
                    buttonHref       = '';

                if (monstType) {
                    if (!caap.inLevelUpMode() && config.getItem('PowerFortifyMax', false) && monster.info[monstType].staLvl) {
                        for (nodeNum = monster.info[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                            if (caap.stats['stamina']['max'] >= monster.info[monstType].staLvl[nodeNum]) {
                                break;
                            }
                        }
                    }

                    energyRequire = $u.isDefined(nodeNum) && nodeNum >= 0 && config.getItem('PowerAttackMax', false) && monster.info[monstType].nrgMax ? monster.info[monstType].nrgMax[nodeNum] : energyRequire;
                }

                $u.log(4, "Energy Required/Node", energyRequire, nodeNum);
                switch (config.getItem('FortifyGeneral', 'Use Current')) {
                case 'Orc King':
                    energyRequire = energyRequire * (general.GetLevel('Orc King') + 1);
                    $u.log(3, 'Monsters Fortify:Orc King', energyRequire);
                    break;
                case 'Barbarus':
                    energyRequire = energyRequire * (general.GetLevel('Barbarus') === 4 ? 3 : 2);
                    $u.log(3, 'Monsters Fortify:Barbarus', energyRequire);
                    break;
                case 'Maalvus':
                    energyRequire = energyRequire * (general.GetLevel('Maalvus') >= 3 ? 3 : 2);
                    $u.log(3, 'Monsters Fortify:Maalvus', energyRequire);
                    break;
                default:
                }

                // Check to see if we should fortify or attack monster
                if (monsterName && caap.checkEnergy(energyRequire, gm.getItem('WhenFortify', 'Energy Available', hiddenVar), 'fortify_mess')) {
                    fightMode = 'Fortify';
                } else {
                    monsterName = state.getItem('targetFrombattle_monster', '');
                    monstType = monster.type(monsterName);
                    currentMonster = monster.getItem(monsterName);
                    if (monsterName && caap.checkStamina('Monster', state.getItem('MonsterStaminaReq', 1)) && currentMonster['page'].replace('festival_tower', 'battle_monster') === 'battle_monster') {
                        fightMode = 'Monster';
                    } else {
                        schedule.setItem('NotargetFrombattle_monster', 60);
                        return false;
                    }
                }

                // Set right general
                if (general.Select(fightMode + 'General')) {
                    return true;
                }

                // Check if on engage monster page
                imageTest = monstType && monster.info[monstType].alpha ? 'nm_top' : (config.getItem('festivalTower', false) && currentMonster['page'] === 'festival_tower' ? 'festival_monsters_top_' :'dragon_title_owner');

                if ($u.hasContent($j("div[style*='" + imageTest + "']", caap.appBodyDiv))) {
                    if (monster.ConfirmRightPage(monsterName)) {
                        return true;
                    }

                    singleButtonList = [
                        'button_nm_p_attack.gif',
                        'attack_monster_button.jpg',
                        'event_attack1.gif',
                        'seamonster_attack.gif',
                        'event_attack2.gif',
                        'attack_monster_button2.jpg'
                    ];

                    // Find the attack or fortify button
                    if (fightMode === 'Fortify') {
                        buttonList = [
                            'seamonster_fortify.gif',
                            'button_dispel.gif',
                            'attack_monster_button3.jpg'
                        ];

                        if (monster.info[monstType] && monster.info[monstType].fortify_img) {
                            buttonList.unshift(monster.info[monstType].fortify_img[0]);
                        }

                        if (currentMonster && currentMonster['stunDo'] && currentMonster['stunType'] !== '') {
                            buttonList.unshift("button_nm_s_" + currentMonster['stunType']);
                        } else {
                            buttonList.unshift("button_nm_s_");
                        }
                    } else if (state.getItem('MonsterStaminaReq', 1) === 1) {
                        // not power attack only normal attacks
                        buttonList = singleButtonList;
                    } else {
                        if (currentMonster['conditions'] && currentMonster['conditions'].match(/:tac/i) && caap.stats['level'] >= 50) {
                            useTactics = true;
                            tacticsValue = monster.parseCondition("tac%", currentMonster['conditions']);
                        } else if (config.getItem('UseTactics', false) && caap.stats['level'] >= 50) {
                            useTactics = true;
                            tacticsValue = config.getItem('TacticsThreshold', false);
                        }

                        if (tacticsValue !== false && currentMonster['fortify'] && currentMonster['fortify'] < tacticsValue) {
                            $u.log(2, "Party health is below threshold value", currentMonster['fortify'], tacticsValue);
                            useTactics = false;
                        }

                        if (useTactics && caap.hasImage('nm_button_tactics.gif')) {
                            $u.log(2, "Attacking monster using tactics buttons");
                            buttonList = ['nm_button_tactics.gif'].concat(singleButtonList);
                        } else {
                            $u.log(2, "Attacking monster using regular buttons");
                            useTactics = false;
                            // power attack or if not seamonster power attack or if not regular attack -
                            // need case for seamonster regular attack?
                            buttonList = [
                                'button_nm_p_power',
                                'button_nm_p_',
                                'power_button_',
                                'attack_monster_button2.jpg',
                                'event_attack2.gif',
                                'seamonster_power.gif',
                                'event_attack1.gif',
                                'attack_monster_button.jpg'
                            ].concat(singleButtonList);

                            if (monster.info[monstType] && monster.info[monstType].attack_img) {
                                if (!caap.inLevelUpMode() && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false)) {
                                    buttonList.unshift(monster.info[monstType].attack_img[1]);
                                } else {
                                    buttonList.unshift(monster.info[monstType].attack_img[0]);
                                }
                            }
                        }
                    }

                    $u.log(4, "monster/button list", currentMonster, buttonList);
                    nodeNum = 0;
                    if (!caap.inLevelUpMode()) {
                        if (((fightMode === 'Fortify' && config.getItem('PowerFortifyMax', false)) || (fightMode !== 'Fortify' && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false))) && monster.info[monstType].staLvl) {
                            for (nodeNum = monster.info[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                                if (caap.stats['stamina']['max'] >= monster.info[monstType].staLvl[nodeNum]) {
                                    break;
                                }
                            }
                        }
                    }

                    for (it = 0, len = buttonList.length; it < len; it += 1) {
                        attackButton = caap.checkForImage(buttonList[it], null, null, nodeNum);
                        if ($u.hasContent(attackButton)) {
                            break;
                        }
                    }

                    if (attackButton) {
                        if (fightMode === 'Fortify') {
                            attackMess = 'Fortifying ' + monsterName;
                        } else if (useTactics) {
                            attackMess = 'Tactic Attacking ' + monsterName;
                        } else {
                            attackMess = (state.getItem('MonsterStaminaReq', 1) >= 5 ? 'Power' : 'Single') + ' Attacking ' + monsterName;
                        }

                        $u.log(1, attackMess);
                        caap.setDivContent('monster_mess', attackMess);
                        state.setItem('ReleaseControl', true);
                        caap.click(attackButton);
                        return true;
                    } else {
                        $u.warn('No button to attack/fortify with.');
                        schedule.setItem('NotargetFrombattle_monster', 60);
                        return false;
                    }
                }

                ///////////////// Check For Monster Page \\\\\\\\\\\\\\\\\\\\\\
                if (currentMonster['page'] === 'battle_monster') {
                    if (caap.navigateTo('keep,battle_monster', 'tab_monster_list_on.gif')) {
                        return true;
                    }
                } else if (currentMonster['page'] === 'festival_tower') {
                    if (caap.navigateTo('soldiers,festival_home,festival_tower', 'festival_monster_towerlist_button.jpg')) {
                        return true;
                    }
                } else {
                    $u.warn('What kind of monster?', currentMonster);
                    return false;
                }

                buttonHref = $u.setContent($j("img[src*='dragon_list_btn_']", caap.appBodyDiv).eq(0).parent().attr("href"), '');
                pageUserCheck = state.getItem('pageUserCheck', 0);
                if (pageUserCheck && (!buttonHref || !new RegExp('user=' + caap.stats['FBID']).test(buttonHref) || !/alchemy\.php/.test(buttonHref))) {
                    $u.log(2, "On another player's keep.", pageUserCheck);
                    if (currentMonster['page'] === 'battle_monster') {
                        return caap.navigateTo('keep,battle_monster', 'tab_monster_list_on.gif');
                    } else if (currentMonster['page'] === 'festival_tower') {
                        return caap.navigateTo('soldiers,festival_home,festival_tower', 'festival_monster_towerlist_button.jpg');
                    } else {
                        $u.warn('What kind of monster?', currentMonster);
                        return false;
                    }
                }

                if (config.getItem('clearCompleteMonsters', false) && $u.hasContent(monster.completeButton['battle_monster']['button']) && $u.hasContent(monster.completeButton['battle_monster']['name'])) {
                    caap.click(monster.completeButton['battle_monster']['button']);
                    monster.deleteItem(monster.completeButton['battle_monster']['name']);
                    monster.completeButton['battle_monster'] = {'name': undefined, 'button': undefined};
                    caap.updateDashboard(true);
                    $u.log(1, 'Cleared a completed monster');
                    return true;
                }

                if ($u.hasContent(monster.engageButtons[monsterName])) {
                    caap.setDivContent('monster_mess', 'Opening ' + monsterName);
                    caap.click(monster.engageButtons[monsterName]);
                    return true;
                } else {
                    schedule.setItem('NotargetFrombattle_monster', 60);
                    $u.warn('No "Engage" button for ', monsterName);
                    return false;
                }
            } catch (err) {
                $u.error("ERROR in monsters: " + err);
                return false;
            }
        },

        demi: {
            'ambrosia' : {
                'power' : {
                    'total' : 0,
                    'max'   : 0,
                    'next'  : 0
                },
                'daily' : {
                    'num' : 0,
                    'max' : 0,
                    'dif' : 0
                }
            },
            'malekus' : {
                'power' : {
                    'total' : 0,
                    'max'   : 0,
                    'next'  : 0
                },
                'daily' : {
                    'num' : 0,
                    'max' : 0,
                    'dif' : 0
                }
            },
            'corvintheus' : {
                'power' : {
                    'total' : 0,
                    'max'   : 0,
                    'next'  : 0
                },
                'daily' : {
                    'num' : 0,
                    'max' : 0,
                    'dif' : 0
                }
            },
            'aurora' : {
                'power' : {
                    'total' : 0,
                    'max'   : 0,
                    'next'  : 0
                },
                'daily' : {
                    'num' : 0,
                    'max' : 0,
                    'dif' : 0
                }
            },
            'azeron' : {
                'power' : {
                    'total' : 0,
                    'max'   : 0,
                    'next'  : 0
                },
                'daily' : {
                    'num' : 0,
                    'max' : 0,
                    'dif' : 0
                }
            }
        },
        /*jslint sub: false */

        loadDemi: function () {
            var demis = gm.getItem('demipoint.records', 'default');
            if (demis === 'default' || !$j.isPlainObject(demis)) {
                demis = gm.setItem('demipoint.records', caap.demi);
            }

            $j.extend(true, caap.demi, demis);
            $u.log(4, 'Demi', caap.demi);
            state.setItem("UserDashUpdate", true);
        },

        SaveDemi: function () {
            gm.setItem('demipoint.records', caap.demi);
            $u.log(4, 'Demi', caap.demi);
            state.setItem("UserDashUpdate", true);
        },

        demiTable: {
            0 : 'ambrosia',
            1 : 'malekus',
            2 : 'corvintheus',
            3 : 'aurora',
            4 : 'azeron'
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkResults_battle: function () {
            try {
                var symDiv  = $j(),
                    points  = [],
                    success = true;

                battle.checkResults();
                symDiv = caap.appBodyDiv.find("img[src*='symbol_tiny_']").not("img[src*='rewards.jpg']");
                if ($u.hasContent(symDiv) && symDiv.length === 5) {
                    symDiv.each(function (index) {
                        var txt = '';
                        txt = $j(this).parent().parent().next().text();
                        txt = txt ? txt.replace(/\s/g, '') : '';
                        if (txt) {
                            points.push(txt);
                        } else {
                            success = false;
                            $u.warn('Demi temp text problem', txt);
                        }
                    });

                    if (success) {
                        caap.demi['ambrosia']['daily'] = caap.getStatusNumbers(points[0]);
                        caap.demi['malekus']['daily'] = caap.getStatusNumbers(points[1]);
                        caap.demi['corvintheus']['daily'] = caap.getStatusNumbers(points[2]);
                        caap.demi['aurora']['daily'] = caap.getStatusNumbers(points[3]);
                        caap.demi['azeron']['daily'] = caap.getStatusNumbers(points[4]);
                        schedule.setItem("battle", gm.getItem('CheckDemi', 6, hiddenVar) * 3600, 300);
                        caap.SaveDemi();
                    }
                } else {
                    $u.warn('Demi symDiv problem');
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_battle: " + err);
                return false;
            }
        },

        demiPoints: function () {
            try {
                if (caap.stats['level'] < 9) {
                    return false;
                }

                if (!config.getItem('DemiPointsFirst', false) || config.getItem('WhenMonster', 'Never') === 'Never') {
                    return false;
                }

                if (schedule.check("battle")) {
                    if (caap.navigateTo(caap.battlePage, 'battle_on.gif')) {
                        return true;
                    }
                }

                var demiPointsDone = false;
                demiPointsDone = battle.selectedDemisDone();
                state.setItem("DemiPointsDone", demiPointsDone);
                if (!demiPointsDone) {
                    return caap.battle('DemiPoints');
                } else {
                    return false;
                }
            } catch (err) {
                $u.error("ERROR in demiPoints: " + err);
                return false;
            }
        },

        inLevelUpMode: function () {
            try {
                if (!config.getItem('EnableLevelUpMode', true)) {
                    //if levelup mode is false then new level up mode is also false (kob)
                    state.setItem("newLevelUpMode", false);
                    return false;
                }

                if (!caap.stats['indicators']['enl']) {
                    //if levelup mode is false then new level up mode is also false (kob)
                    state.setItem("newLevelUpMode", false);
                    return false;
                }

                // minutesBeforeLevelToUseUpStaEnergy : 5, = 30000
                if (((caap.stats['indicators']['enl'] - new Date().getTime()) < 30000) || (caap.stats['exp']['dif'] <= config.getItem('LevelUpGeneralExp', 20))) {
                    //detect if we are entering level up mode for the very first time (kob)
                    if (!state.getItem("newLevelUpMode", false)) {
                        //set the current level up mode flag so that we don't call refresh monster routine more than once (kob)
                        state.setItem("newLevelUpMode", true);
                        caap.refreshMonstersListener();
                    }

                    return true;
                }

                //if levelup mode is false then new level up mode is also false (kob)
                state.setItem("newLevelUpMode", false);
                return false;
            } catch (err) {
                $u.error("ERROR in inLevelUpMode: " + err);
                return false;
            }
        },

        checkStamina: function (battleOrMonster, attackMinStamina) {
            try {
                $u.log(4, "checkStamina", battleOrMonster, attackMinStamina);
                if (!attackMinStamina) {
                    attackMinStamina = 1;
                }

                var when           = config.getItem('When' + battleOrMonster, 'Never'),
                    maxIdleStamina = 0,
                    theGeneral     = '',
                    staminaMF      = '',
                    messDiv        = battleOrMonster.toLowerCase() + "_mess";

                if (when === 'Never') {
                    return false;
                }

                if (!caap.stats['stamina'] || !caap.stats['health']) {
                    caap.setDivContent(messDiv, 'Health or stamina not known yet.');
                    return false;
                }

                if (caap.stats['health']['num'] < 10) {
                    caap.setDivContent(messDiv, "Need health to fight: " + caap.stats['health']['num'] + "/10");
                    return false;
                }

                if (battleOrMonster === "Battle" && config.getItem("waitSafeHealth", false) && caap.stats['health']['num'] < 13) {
                    caap.setDivContent(messDiv, "Unsafe. Need spare health to fight: " + caap.stats['health']['num'] + "/13");
                    return false;
                }

                if (when === 'At X Stamina') {
                    if (caap.inLevelUpMode() && caap.stats['stamina']['num'] >= attackMinStamina) {
                        caap.setDivContent(messDiv, 'Burning stamina to level up');
                        return true;
                    }

                    staminaMF = battleOrMonster + 'Stamina';
                    if (state.getItem('BurnMode_' + staminaMF, false) || caap.stats['stamina']['num'] >= config.getItem('X' + staminaMF, 1)) {
                        if (caap.stats['stamina']['num'] < attackMinStamina || caap.stats['stamina']['num'] <= config.getItem('XMin' + staminaMF, 0)) {
                            state.setItem('BurnMode_' + staminaMF, false);
                            return false;
                        }

                        state.setItem('BurnMode_' + staminaMF, true);
                        return true;
                    } else {
                        state.setItem('BurnMode_' + staminaMF, false);
                    }

                    caap.setDivContent(messDiv, 'Waiting for stamina: ' + caap.stats['stamina']['num'] + "/" + config.getItem('X' + staminaMF, 1));
                    return false;
                }

                if (when === 'At Max Stamina') {
                    maxIdleStamina = caap.stats['stamina']['max'];
                    theGeneral = config.getItem('IdleGeneral', 'Use Current');
                    if (theGeneral !== 'Use Current') {
                        maxIdleStamina = general.GetStaminaMax(theGeneral);
                    }

                    if (theGeneral !== 'Use Current' && !maxIdleStamina) {
                        $u.log(2, "Changing to idle general to get Max Stamina");
                        if (general.Select('IdleGeneral')) {
                            return true;
                        }
                    }

                    if (caap.stats['stamina']['num'] >= maxIdleStamina) {
                        caap.setDivContent(messDiv, 'Using max stamina');
                        return true;
                    }

                    if (caap.inLevelUpMode() && caap.stats['stamina']['num'] >= attackMinStamina) {
                        caap.setDivContent(messDiv, 'Burning all stamina to level up');
                        return true;
                    }

                    caap.setDivContent(messDiv, 'Waiting for max stamina: ' + caap.stats['stamina']['num'] + "/" + maxIdleStamina);
                    return false;
                }

                if (caap.stats['stamina']['num'] >= attackMinStamina) {
                    return true;
                }

                caap.setDivContent(messDiv, "Waiting for more stamina: " + caap.stats['stamina']['num'] + "/" + attackMinStamina);
                return false;
            } catch (err) {
                $u.error("ERROR in checkStamina: " + err);
                return false;
            }
        },

        /*-------------------------------------------------------------------------------------\
        needToHide will return true if the current stamina and health indicate we need to bring
        our health down through battles (hiding).  It also returns true if there is no other outlet
        for our stamina (currently this just means Monsters, but will eventually incorporate
        other stamina uses).
        \-------------------------------------------------------------------------------------*/
        needToHide: function () {
            try {
                if (config.getItem('WhenMonster', 'Never') === 'Never') {
                    $u.log(1, 'Stay Hidden Mode: Monster battle not enabled');
                    return true;
                }

                if (!state.getItem('targetFrombattle_monster', '')) {
                    $u.log(1, 'Stay Hidden Mode: No monster to battle');
                    return true;
                }
            /*-------------------------------------------------------------------------------------\
            The riskConstant helps us determine how much we stay in hiding and how much we are willing
            to risk coming out of hiding.  The lower the riskConstant, the more we spend stamina to
            stay in hiding. The higher the risk constant, the more we attempt to use our stamina for
            non-hiding activities.  The below matrix shows the default riskConstant of 1.7

                        S   T   A   M   I   N   A
                        1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
                H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
                E   11  -   -   +   +   +   +   +   +   +
                A   12  -   -   +   +   +   +   +   +   +
                L   13  -   -   +   +   +   +   +   +   +
                T   14  -   -   -   +   +   +   +   +   +
                H   15  -   -   -   +   +   +   +   +   +
                    16  -   -   -   -   +   +   +   +   +
                    17  -   -   -   -   -   +   +   +   +
                    18  -   -   -   -   -   +   +   +   +

            Setting our riskConstant down to 1 will result in us spending out stamina to hide much
            more often:

                        S   T   A   M   I   N   A
                        1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
                H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
                E   11  -   -   +   +   +   +   +   +   +
                A   12  -   -   -   +   +   +   +   +   +
                L   13  -   -   -   -   +   +   +   +   +
                T   14  -   -   -   -   -   +   +   +   +
                H   15  -   -   -   -   -   -   +   +   +
                    16  -   -   -   -   -   -   -   +   +
                    17  -   -   -   -   -   -   -   -   +
                    18  -   -   -   -   -   -   -   -   -

            \-------------------------------------------------------------------------------------*/
                var riskConstant = gm.getItem('HidingRiskConstant', 1.7, hiddenVar);
            /*-------------------------------------------------------------------------------------\
            The formula for determining if we should hide goes something like this:

                If  (health - (estimated dmg from next attacks) puts us below 10)  AND
                    (current stamina will be at least 5 using staminatime/healthtime ratio)
                Then stamina can be used/saved for normal process
                Else stamina is used for us to hide

            \-------------------------------------------------------------------------------------*/
                //if ((caap.stats['health']['num'] - ((caap.stats['stamina']['num'] - 1) * riskConstant) < 10) && (caap.stats['stamina']['num'] * (5 / 3) >= 5)) {
                if ((caap.stats['health']['num'] - ((caap.stats['stamina']['num'] - 1) * riskConstant) < 10) && ((caap.stats['stamina']['num'] + gm.getItem('HideStaminaRisk', 1, hiddenVar)) >= state.getItem('MonsterStaminaReq', 1))) {
                    return false;
                } else {
                    return true;
                }
            } catch (err) {
                $u.error("ERROR in needToHide: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          POTIONS
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        autoPotions: function () {
            try {
                if (!config.getItem('AutoPotions', true) || !schedule.check('AutoPotionTimerDelay')) {
                    return false;
                }

                if (caap.stats['exp']['dif'] <= config.getItem("potionsExperience", 20)) {
                    $u.log(2, "AutoPotions, ENL condition. Delaying 10 minutes");
                    schedule.setItem('AutoPotionTimerDelay', 600);
                    return false;
                }

                function consumePotion(potion) {
                    try {
                        if (!$j(".statsTTitle").length) {
                            $u.log(2, "Going to keep for potions");
                            if (caap.navigateTo('keep')) {
                                return true;
                            }
                        }

                        var formId    =  caap.domain.id[caap.domain.which] + "consume_1",
                            potionDiv = $j(),
                            button    = null;

                        if (potion === 'stamina') {
                            formId = caap.domain.id[caap.domain.which] + "consume_2";
                        }

                        $u.log(1, "Consuming potion", potion);
                        potionDiv = $j("form[id='" + formId + "'] input[src*='potion_consume.gif']");
                        if (potionDiv && potionDiv.length) {
                            button = potionDiv;
                            if (button) {
                                caap.click(button);
                            } else {
                                $u.warn("Could not find consume button for", potion);
                                return false;
                            }
                        } else {
                            $u.warn("Could not find consume form for", potion);
                            return false;
                        }

                        return true;
                    } catch (err) {
                        $u.error("ERROR in consumePotion: " + err, potion);
                        return false;
                    }
                }

                if (caap.stats['energy']['num'] < caap.stats['energy']['max'] - 10 &&
                    caap.stats['potions']['energy'] >= config.getItem("energyPotionsSpendOver", 39) &&
                    caap.stats['potions']['energy'] > config.getItem("energyPotionsKeepUnder", 35)) {
                    return consumePotion('energy');
                }

                if (caap.stats['stamina']['num'] < caap.stats['stamina']['max'] - 10 &&
                    caap.stats['potions']['stamina'] >= config.getItem("staminaPotionsSpendOver", 39) &&
                    caap.stats['potions']['stamina'] > config.getItem("staminaPotionsKeepUnder", 35)) {
                    return consumePotion('stamina');
                }

                return false;
            } catch (err) {
                $u.error("ERROR in autoPotions: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          ALCHEMY
        /////////////////////////////////////////////////////////////////////

        /*-------------------------------------------------------------------------------------\
        AutoAlchemy perform aclchemy combines for all recipes that do not have missing
        ingredients.  By default, it also will not combine Battle Hearts.
        First we make sure the option is set and that we haven't been here for a while.
        \-------------------------------------------------------------------------------------*/
        autoAlchemy: function () {
            try {
                if (!config.getItem('AutoAlchemy', false)) {
                    return false;
                }

                if (!schedule.check('AlchemyTimer')) {
                    return false;
                }
        /*-------------------------------------------------------------------------------------\
        Now we navigate to the Alchemy Recipe page.
        \-------------------------------------------------------------------------------------*/
                if (!caap.navigateTo('keep,alchemy', 'tab_alchemy_on.gif')) {
                    var button    = {},
                        recipeDiv = $j(),
                        ss        = $j(),
                        clicked   = false;

                    recipeDiv = $j("#" + caap.domain.id[caap.domain.which] + "recipe_list");
                    if (recipeDiv && recipeDiv.length) {
                        if (recipeDiv.attr("class") !== 'show_items') {
                            button = recipeDiv.find("div[id*='alchemy_item_tab']");
                            if (button && button.length) {
                                caap.click(button);
                                return true;
                            } else {
                                $u.warn('Cant find item tab', recipeDiv);
                                return false;
                            }
                        }
                    } else {
                        $u.warn('Cant find recipe list');
                        return false;
                    }
        /*-------------------------------------------------------------------------------------\
        We close the results of our combines so they don't hog up our screen
        \-------------------------------------------------------------------------------------*/
                    button = caap.checkForImage('help_close_x.gif');
                    if ($u.hasContent(button)) {
                        caap.click(button);
                        return true;
                    }
        /*-------------------------------------------------------------------------------------\
        Now we get all of the recipes and step through them one by one
        \-------------------------------------------------------------------------------------*/
                    ss = $j("div[class='alchemyRecipeBack']");
                    if (!ss || !ss.length) {
                        $u.log(2, 'No recipes found');
                    }

                    ss.each(function () {
                        recipeDiv = $j(this);
        /*-------------------------------------------------------------------------------------\
        If we are missing an ingredient then skip it
        \-------------------------------------------------------------------------------------*/
                        if (recipeDiv.find("div[class*='missing']").length) {
                            $u.log(2, 'Skipping Recipe');
                            return true;
                        }
        /*-------------------------------------------------------------------------------------\
        If we are skipping battle hearts then skip it
        \-------------------------------------------------------------------------------------*/
                        if (caap.hasImage('raid_hearts', recipeDiv) && !config.getItem('AutoAlchemyHearts', false)) {
                            $u.log(2, 'Skipping Hearts');
                            return true;
                        }
        /*-------------------------------------------------------------------------------------\
        Find our button and click it
        \-------------------------------------------------------------------------------------*/
                        button = recipeDiv.find("input[type='image']");
                        if (button && button.length) {
                            clicked = true;
                            caap.click(button);
                            $u.log(2, 'Clicked A Recipe', recipeDiv.find("img").attr("title"));
                            return false;
                        } else {
                            $u.warn('Cant Find Item Image Button');
                        }

                        return true;
                    });

                    if (clicked) {
                        return true;
                    }
        /*-------------------------------------------------------------------------------------\
        All done. Set the timer to check back in 3 hours.
        \-------------------------------------------------------------------------------------*/
                    schedule.setItem('AlchemyTimer', 10800, 300);
                    return false;
                }

                return true;
            } catch (err) {
                $u.error("ERROR in autoAlchemy: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          BANKING
        // Keep it safe!
        /////////////////////////////////////////////////////////////////////

        immediateBanking: function () {
            if (!config.getItem("BankImmed", false)) {
                return false;
            }

            return caap.bank();
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        bank: function () {
            try {
                if (config.getItem("NoBankAfterLvl", true) && state.getItem('KeepLevelUpGeneral', false)) {
                    return false;
                }

                var maxInCash     = -1,
                    minInCash     = 0,
                    depositButton = null,
                    numberInput   = null,
                    deposit       = 0;

                maxInCash = config.getItem('MaxInCash', -1);
                minInCash = config.getItem('MinInCash', 0);
                if (!maxInCash || maxInCash < 0 || caap.stats['gold']['cash'] <= minInCash || caap.stats['gold']['cash'] < maxInCash || caap.stats['gold']['cash'] < 10) {
                    return false;
                }

                if (general.Select('BankingGeneral')) {
                    return true;
                }

                depositButton = $j("input[src*='btn_stash.gif']");
                if (!depositButton || !depositButton.length) {
                    // Cannot find the link
                    return caap.navigateTo('keep');
                }

                numberInput = $j("input[name='stash_gold']");
                if (!numberInput || !numberInput.length) {
                    $u.warn('Cannot find box to put in number for bank deposit.');
                    return false;
                }

                deposit = numberInput.attr("value").parseInt() - minInCash;
                numberInput.attr("value", deposit);
                $u.log(1, 'Depositing into bank:', deposit);
                caap.click(depositButton);
                return true;
            } catch (err) {
                $u.error("ERROR in Bank: " + err);
                return false;
            }
        },

        retrieveFromBank: function (num) {
            try {
                if (num <= 0) {
                    return false;
                }

                var retrieveButton = null,
                    numberInput    = null,
                    minInStore     = 0;

                retrieveButton = $j("input[src*='btn_retrieve.gif']");
                if (!retrieveButton || !retrieveButton.length) {
                    // Cannot find the link
                    return caap.navigateTo('keep');
                }

                minInStore = config.getItem('minInStore', 0);
                if (!(minInStore || minInStore <= caap.stats['gold']['bank'] - num)) {
                    return false;
                }

                numberInput = $j("input[name='get_gold']");
                if (!numberInput || !numberInput.length) {
                    $u.warn('Cannot find box to put in number for bank retrieve.');
                    return false;
                }

                numberInput.attr("value", num);
                $u.log(1, 'Retrieving from bank:', num);
                state.setItem('storeRetrieve', '');
                caap.click(retrieveButton);
                return true;
            } catch (err) {
                $u.error("ERROR in retrieveFromBank: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          HEAL
        /////////////////////////////////////////////////////////////////////

        heal: function () {
            try {
                var minToHeal     = 0,
                    minStamToHeal = 0;

                caap.setDivContent('heal_mess', '');
                minToHeal = config.getItem('MinToHeal', 0);
                if (minToHeal === "" || minToHeal < 0 || !$u.isNumber(minToHeal)) {
                    return false;
                }

                minStamToHeal = config.getItem('MinStamToHeal', 0);
                if (minStamToHeal === "" || minStamToHeal < 0 || !$u.isNumber(minStamToHeal)) {
                    minStamToHeal = 0;
                }

                if (!caap.stats['health'] || $j.isEmptyObject(caap.stats['health']) || $j.isEmptyObject(caap.stats['healthT'])) {
                    return false;
                }

                if (!caap.stats['stamina'] || $j.isEmptyObject(caap.stats['stamina']) || $j.isEmptyObject(caap.stats['staminaT'])) {
                    return false;
                }

                if ((config.getItem('WhenBattle', 'Never') !== 'Never') || (config.getItem('WhenMonster', 'Never') !== 'Never')) {
                    if ((caap.inLevelUpMode() || caap.stats['stamina']['num'] >= caap.stats['staminaT']['max']) && caap.stats['health']['num'] < 10) {
                        $u.log(1, 'Heal');
                        return caap.navigateTo('keep,heal_button.gif');
                    }
                }

                if (caap.stats['health']['num'] >= caap.stats['healthT']['max'] || caap.stats['health']['num'] >= minToHeal) {
                    return false;
                }

                if (caap.stats['stamina']['num'] < minStamToHeal) {
                    caap.setDivContent('heal_mess', 'Waiting for stamina to heal: ' + caap.stats['stamina']['num'] + '/' + minStamToHeal);
                    return false;
                }

                $u.log(1, 'Heal');
                return caap.navigateTo('keep,heal_button.gif');
            } catch (err) {
                $u.error("ERROR in heal: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          ELITE GUARD
        /////////////////////////////////////////////////////////////////////

        autoElite: function () {
            try {
                if (!config.getItem('AutoElite', false)) {
                    return false;
                }

                if (!schedule.check('AutoEliteGetList')) {
                    if (!state.getItem('FillArmy', false) && state.getItem(caap.friendListType.giftc.name + 'Requested', false)) {
                        state.setItem(caap.friendListType.giftc.name + 'Requested', false);
                    }

                    return false;
                }

                $u.log(2, 'Elite Guard cycle');
                var mergeMyEliteTodo = function (list) {
                    $u.log(3, 'Elite Guard mergeMyEliteTodo list');
                    var eliteArmyList = [];
                    eliteArmyList = config.getList('EliteArmyList', '');
                    $j.merge(eliteArmyList, army.getEliteList());
                    if ($u.hasContent(eliteArmyList)) {
                        $u.log(3, 'Merge and save Elite Guard MyEliteTodo list');
                        var diffList = list.filter(function (todoID) {
                            return !eliteArmyList.hasIndexOf(todoID);
                        });

                        $j.merge(eliteArmyList, diffList);
                        state.setItem('MyEliteTodo', eliteArmyList);
                    } else {
                        $u.log(3, 'Save Elite Guard MyEliteTodo list');
                        state.setItem('MyEliteTodo', list);
                    }
                };

                var eliteList = state.getItem('MyEliteTodo', []);
                if (!$j.isArray(eliteList)) {
                    $u.warn('MyEliteTodo list is not expected format, deleting', eliteList);
                    eliteList = state.setItem('MyEliteTodo', []);
                }

                $u.log(1, 'page', state.getItem('page', 'none'));
                if (state.getItem('page', 'none') === 'party') {
                    $u.log(1, 'Checking Elite Guard status');
                    var autoEliteFew = state.getItem('AutoEliteFew', false);
                    var autoEliteFull = /YOUR Elite Guard is FULL/i.test($j('.result_body', caap.globalContainer).text());
                    if (autoEliteFull || (autoEliteFew && state.getItem('AutoEliteEnd', '') === 'NoArmy')) {
                        if (autoEliteFull) {
                            $u.log(1, 'Elite Guard is FULL');
                            if ($u.hasContent(eliteList)) {
                                mergeMyEliteTodo(eliteList);
                            }
                        } else if (autoEliteFew && state.getItem('AutoEliteEnd', '') === 'NoArmy') {
                            $u.log(1, 'Not enough friends to fill Elite Guard');
                            state.setItem('AutoEliteFew', false);
                        }

                        $u.log(3, 'Set Elite Guard AutoEliteGetList timer');
                        schedule.setItem('AutoEliteGetList', 21600, 300);
                        state.setItem('AutoEliteEnd', 'Full');
                        $u.log(1, 'Elite Guard done');
                        return false;
                    }
                }

                if (!eliteList.length) {
                    $u.log(2, 'Elite Guard no MyEliteTodo cycle');
                    var allowPass = false;
                    if (state.getItem(caap.friendListType.giftc.name + 'Requested', false) && state.getItem(caap.friendListType.giftc.name + 'Responded', false) === true) {
                        $u.log(2, 'Elite Guard received 0 friend ids');
                        if (config.getList('EliteArmyList', '').length) {
                            $u.log(2, 'Elite Guard has some defined friend ids');
                            allowPass = true;
                        } else {
                            schedule.setItem('AutoEliteGetList', 21600, 300);
                            $u.log(2, 'Elite Guard has 0 defined friend ids');
                            state.setItem('AutoEliteEnd', 'Full');
                            $u.log(1, 'Elite Guard done');
                            return false;
                        }
                    }

                    caap.getFriendList(caap.friendListType.giftc);
                    var castleageList = [];
                    if (state.getItem(caap.friendListType.giftc.name + 'Responded', false) !== true) {
                        castleageList = state.getItem(caap.friendListType.giftc.name + 'Responded', []);
                    }

                    if ($u.hasContent(castleageList) || caap.stats['army']['capped'] <= 1 || allowPass) {
                        $u.log(2, 'Elite Guard received a new friend list');
                        mergeMyEliteTodo(castleageList);
                        state.setItem(caap.friendListType.giftc.name + 'Responded', []);
                        state.setItem(caap.friendListType.giftc.name + 'Requested', false);
                        eliteList = state.getItem('MyEliteTodo', []);
                        if ($u.hasContent(eliteList)) {
                            $u.log(1, 'WARNING! Elite Guard friend list is 0');
                            state.setItem('AutoEliteFew', true);
                            schedule.setItem('AutoEliteGetList', 21600, 300);
                        } else if (eliteList.length < 50) {
                            $u.log(1, 'WARNING! Elite Guard friend list is fewer than 50: ', eliteList.length);
                            state.setItem('AutoEliteFew', true);
                        }
                    }
                } else if (schedule.check('AutoEliteReqNext')) {
                    $u.log(2, 'Elite Guard has a MyEliteTodo list, shifting User ID');
                    var user = eliteList.shift();
                    $u.log(1, 'Add Elite Guard ID: ', user);
                    caap.clickAjaxLinkSend('party.php?twt=jneg&jneg=true&user=' + user);
                    $u.log(2, 'Elite Guard sent request, saving shifted MyEliteTodo');
                    state.setItem('MyEliteTodo', eliteList);
                    schedule.setItem('AutoEliteReqNext', 7);
                    if (!$u.hasContent(eliteList)) {
                        $u.log(2, 'Army list exhausted');
                        state.setItem('AutoEliteEnd', 'NoArmy');
                    }
                }

                $u.log(1, 'Release Elite Guard cycle');
                return true;
            } catch (err) {
                $u.error("ERROR in autoElite: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          PASSIVE GENERALS
        /////////////////////////////////////////////////////////////////////

        passiveGeneral: function () {
            if (config.getItem('IdleGeneral', 'Use Current') !== 'Use Current') {
                if (general.Select('IdleGeneral')) {
                    return true;
                }
            }

            return false;
        },

        /////////////////////////////////////////////////////////////////////
        //                          AUTOINCOME
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        autoIncome: function () {
            if (config.getItem("NoIncomeAfterLvl", true) && state.getItem('KeepLevelUpGeneral', false)) {
                return false;
            }

            if ($u.hasContent(caap.stats['gold']['ticker']) && caap.stats['gold']['ticker'][0] < 1  && config.getItem('IncomeGeneral', 'Use Current') !== 'Use Current') {
                general.Select('IncomeGeneral');
                return true;
            }

            return false;
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                              ARMY
        /////////////////////////////////////////////////////////////////////

        checkResults_army: function () {
            var listHref = $j(),
                link     = $j(),
                autoGift = false;

            autoGift = config.getItem('AutoGift', false);
            listHref = caap.appBodyDiv.find("div[class='messages'] a[href*='army.php?act=ignore']");
            if (listHref && listHref.length) {
                if (autoGift) {
                    $u.log(1, 'We have a gift waiting!');
                    state.setItem('HaveGift', true);
                }

                listHref.each(function () {
                    var row = $j(this);
                    link = $j("<br /><a title='This link can be used to collect the " +
                        "gift when it has been lost on Facebook. !!If you accept a gift " +
                        "in this manner then it will leave an orphan request on Facebook!!' " +
                        "href='" + row.attr("href").replace('ignore', 'acpt') + "'>Lost Accept</a>");
                    link.insertAfter(row);
                });
            } else {
                if (autoGift) {
                    $u.log(2, 'No gifts waiting.');
                    state.setItem('HaveGift', false);
                }
            }

            if (autoGift) {
                schedule.setItem("ajaxGiftCheck", gm.getItem('CheckGiftMins', 15, hiddenVar) * 60, 300);
            }
        },

        checkResults_army_member: function () {
            army.page();
        },

        /////////////////////////////////////////////////////////////////////
        //                              INDEX
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        checkResults_index: function () {
            try {
                function news() {
                    try {
                        var xp     = 0,
                            bp     = 0,
                            wp     = 0,
                            win    = 0,
                            lose   = 0,
                            deaths = 0,
                            cash   = 0,
                            i      = '',
                            list   = [],
                            user   = {},
                            tStr   = '',
                            $b     = null,
                            $c     = null;

                        $b = $j('#' + caap.domain.id[caap.domain.which] + 'battleUpdateBox');
                        if ($b && $b.length) {
                            $c = $j('.alertsContainer', $b);
                            $j('.alert_content', $c).each(function (i, el) {
                                var uid     = 0,
                                    txt     = '',
                                    my_xp   = 0,
                                    my_bp   = 0,
                                    my_wp   = 0,
                                    my_cash = 0,
                                    $a      = $j('a', el).eq(0);

                                txt = $j(el).text().replace(/,/g, '');
                                if (txt.regex(/You were killed/i)) {
                                    deaths += 1;
                                } else {
                                    tStr = $a.attr('href');
                                    uid = tStr.regex(/user=(\d+)/);
                                    user[uid] = user[uid] || {name: $a.text(), win: 0, lose: 0};
                                    my_xp = txt.regex(/(\d+) experience/i);
                                    my_bp = txt.regex(/(\d+) Battle Points!/i);
                                    my_wp = txt.regex(/(\d+) War Points!/i);
                                    my_cash = txt.regex(/\$(\d+)/i);
                                    if (txt.regex(/Victory!/i)) {
                                        win += 1;
                                        user[uid].lose += 1;
                                        xp += my_xp;
                                        bp += my_bp;
                                        wp += my_wp;
                                        cash += my_cash;
                                    } else {
                                        lose += 1;
                                        user[uid].win += 1;
                                        xp -= my_xp;
                                        bp -= my_bp;
                                        wp -= my_wp;
                                        cash -= my_cash;
                                    }
                                }
                            });

                            if (win || lose) {
                                list.push('You were challenged <strong>' + (win + lose) + '</strong> times,<br>winning <strong>' + win + '</strong> and losing <strong>' + lose + '</strong>.');
                                list.push('You ' + (xp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(xp).addCommas() + '</span> experience points.');
                                list.push('You ' + (cash >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + '<b class="gold">$' + Math.abs(cash).addCommas() + '</b></span>.');
                                list.push('You ' + (bp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(bp).addCommas() + '</span> Battle Points.');
                                list.push('You ' + (wp >= 0 ? 'gained <span class="positive">' : 'lost <span class="negative">') + Math.abs(wp).addCommas() + '</span> War Points.');
                                list.push('');
                                user = $u.sortObjectBy(user, function (a, b) {
                                        return (user[b].win + (user[b].lose / 100)) - (user[a].win + (user[a].lose / 100));
                                    });

                                for (i in user) {
                                    if (user.hasOwnProperty(i)) {
                                        list.push('<strong title="' + i + '">' + user[i].name + '</strong> ' +
                                            (user[i].win ? 'beat you <span class="negative">' + user[i].win +
                                            '</span> time' + (user[i].win > 1 ? 's' : '') : '') +
                                            (user[i].lose ? (user[i].win ? ' and ' : '') +
                                            'was beaten <span class="positive">' + user[i].lose +
                                            '</span> time' + (user[i].lose > 1 ? 's' : '') : '') + '.');
                                    }
                                }

                                if (deaths) {
                                    list.push('You died ' + (deaths > 1 ? deaths + ' times' : 'once') + '!');
                                }

                                $c.prepend('<div style="padding: 0pt 0pt 10px;"><div class="alert_title">Summary:</div><div class="alert_content">' + list.join('<br>') + '</div></div>');
                            }
                        }

                        return true;
                    } catch (err) {
                        $u.error("ERROR in news: " + err);
                        return false;
                    }
                }

                if (config.getItem('NewsSummary', true)) {
                    news();
                }

                // Check for new gifts
                // A warrior wants to join your Army!
                // Send Gifts to Friends
                if (config.getItem('AutoGift', false)) {
                    if ($u.hasContent(caap.resultsText) && /Send Gifts to Friends/.test(caap.resultsText)) {
                        $u.log(1, 'We have a gift waiting!');
                        state.setItem('HaveGift', true);
                    } else {
                        $u.log(2, 'No gifts waiting.');
                        state.setItem('HaveGift', false);
                    }

                    schedule.setItem("ajaxGiftCheck", gm.getItem('CheckGiftMins', 15, hiddenVar) * 60, 300);
                }

                //arena.index();
                return true;
            } catch (err) {
                $u.error("ERROR in checkResults_index: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                              AUTOGIFT
        /////////////////////////////////////////////////////////////////////

        ajaxGiftCheck: function () {
            try {
                if (config.getItem('bookmarkMode', false) || !config.getItem('AutoGift', false) || !schedule.check("ajaxGiftCheck")) {
                    return false;
                }

                $u.log(3, "Performing AjaxGiftCheck");
                var theUrl = caap.domain.link + '/army.php';

                $j.ajax({
                    url: theUrl,
                    error:
                        function (XMLHttpRequest, textStatus, errorThrown) {
                            $u.error("AjaxGiftCheck.ajax", textStatus);
                        },
                    success:
                        function (data, textStatus, XMLHttpRequest) {
                            try {
                                $u.log(4, "AjaxGiftCheck.ajax: Checking data.");
                                if ($j(data).find("a[href*='reqs.php#confirm_46755028429_0']").length) {
                                    $u.log(1, 'AjaxGiftCheck.ajax: We have a gift waiting!');
                                    state.setItem('HaveGift', true);
                                } else {
                                    $u.log(2, 'AjaxGiftCheck.ajax: No gifts waiting.');
                                    state.setItem('HaveGift', false);
                                }

                                $u.log(4, "AjaxGiftCheck.ajax: Done.");
                            } catch (err) {
                                $u.error("ERROR in AjaxGiftCheck.ajax: " + err);
                            }
                        }
                });

                schedule.setItem("ajaxGiftCheck", gm.getItem('CheckGiftMins', 15, hiddenVar) * 60, 300);
                $u.log(4, "Completed AjaxGiftCheck");
                return true;
            } catch (err) {
                $u.error("ERROR in AjaxGiftCheck: " + err);
                return false;
            }
        },

        checkResults_gift_accept: function () {
            // Confirm gifts actually sent
            gifting.queue.sent();
            gifting.collected();
        },

        GiftExceedLog: true,

        autoGift: function () {
            try {
                var tempDiv    = $j(),
                    tempText   = '',
                    giftImg    = '',
                    giftChoice = '',
                    popCheck,
                    collecting;
                    /*whenArena  = '',
                    arenaInfo  = {};

                whenArena = config.getItem("WhenArena", 'Never');
                if (whenArena !== 'Never') {
                    arenaInfo = arena.getItem();
                }*/

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                if (config.getItem('bookmarkMode', false) || !config.getItem('AutoGift', false) /*|| (!$j.isEmptyObject(arenaInfo) && arenaInfo['state'] !== 'Ready')*/) {
                    return false;
                }
                /*jslint sub: false */

                popCheck = gifting.popCheck();
                if ($u.isBoolean(popCheck)) {
                    return popCheck;
                }

                // Go to gifts page if gift list is empty
                if (gifting.gifts.length() <= 2) {
                    if (caap.navigateTo('army,gift', 'tab_gifts_on.gif')) {
                        return true;
                    }
                }

                collecting = gifting.collecting();
                if ($u.isBoolean(collecting)) {
                    return collecting;
                }

                if (config.getItem("CollectOnly", false)) {
                    return false;
                }

                if (!schedule.check("NoGiftDelay")) {
                    return false;
                }

                if (!schedule.check("MaxGiftsExceeded")) {
                    if (caap.GiftExceedLog) {
                        $u.log(1, 'Gifting limit exceeded, will try later');
                        caap.GiftExceedLog = false;
                        caap.setDivContent('gifting_mess', "Max gift limit");
                    }

                    return false;
                }

                giftChoice = gifting.queue.chooseGift();
                if (gifting.queue.length() && giftChoice) {
                    //if (caap.navigateTo('army,gift,gift_invite_castle_off.gif', 'gift_invite_castle_on.gif')) {
                    if (caap.navigateTo('army,gift', 'tab_gifts_on.gif')) {
                        return true;
                    }

                    giftImg = gifting.gifts.getImg(giftChoice);
                    if (giftImg) {
                        caap.navigateTo('gift_more_gifts.gif');
                        tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "giftContainer img[class='imgButton']", caap.globalContainer).eq(0);
                        if ($u.hasContent(tempDiv)) {
                            tempText = $u.setContent(tempDiv.attr("src"), '').basename();
                            if (tempText !== giftImg) {
                                $u.log(4, "images", tempText, giftImg);
                                return caap.navigateTo(giftImg);
                            }

                            $u.log(1, "Gift selected", giftChoice);
                        }
                    } else {
                        $u.log(1, "Unknown gift, using first", giftChoice);
                    }

                    if (gifting.queue.chooseFriend(gm.getItem("NumberOfGifts", 5, hiddenVar))) {
                        tempDiv = $j("form[id*='req_form_'] input[name='send']", caap.globalContainer);
                        if ($u.hasContent(tempDiv)) {
                            caap.click(tempDiv);
                            return true;
                        } else {
                            $u.warn("Send button not found!");
                            return false;
                        }
                    } else {
                        $u.log(1, "No friends chosen");
                        return false;
                    }
                }

                if ($j.isEmptyObject(gifting.getCurrent())) {
                    return false;
                }

                return true;
            } catch (err) {
                $u.error("ERROR in autoGift: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                              IMMEDIATEAUTOSTAT
        /////////////////////////////////////////////////////////////////////

        immediateAutoStat: function () {
            if (!config.getItem("StatImmed", false) || !config.getItem('AutoStat', false)) {
                return false;
            }

            return caap.autoStat();
        },

        ////////////////////////////////////////////////////////////////////
        //                      Auto Stat
        ////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        increaseStat: function (attribute, attrAdjust, atributeSlice) {
            try {
                attribute = attribute.toLowerCase();
                var button        = $j(),
                    level         = 0,
                    attrCurrent   = 0,
                    energy        = 0,
                    stamina       = 0,
                    attack        = 0,
                    defense       = 0,
                    health        = 0,
                    attrAdjustNew = 0,
                    energyDiv     = $j("a[href*='energy_max']", atributeSlice),
                    staminaDiv    = $j("a[href*='stamina_max']", atributeSlice),
                    attackDiv     = $j("a[href*='attack']", atributeSlice),
                    defenseDiv    = $j("a[href*='defense']", atributeSlice),
                    healthDiv     = $j("a[href*='health_max']", atributeSlice),
                    logTxt        = "";

                /*
                if (caap.waitingAjaxLoad()) {
                    $u.warn("Unable to find AjaxLoadIcon or page not loaded: Fail");
                    return "Fail";
                }
                */

                switch (attribute) {
                case "energy" :
                    button = energyDiv;
                    break;
                case "stamina" :
                    button = staminaDiv;
                    break;
                case "attack" :
                    button = attackDiv;
                    break;
                case "defense" :
                    button = defenseDiv;
                    break;
                case "health" :
                    button = healthDiv;
                    break;
                default :
                    throw "Unable to match attribute: " + attribute;
                }

                if (!$u.hasContent(button)) {
                    $u.warn("Unable to locate upgrade button: Fail ", attribute);
                    return "Fail";
                }

                attrAdjustNew = attrAdjust;
                logTxt = attrAdjust;
                level = caap.stats['level'];
                function getValue(div) {
                    return $u.setContent($j("div[class='attribute_stat_container']", div.parent().parent()).text(), '').regex(/(\d+)/);
                }

                attrCurrent = getValue(button);
                energy = getValue(energyDiv);
                stamina = getValue(staminaDiv);
                if (level >= 10) {
                    attack = getValue(attackDiv);
                    defense = getValue(defenseDiv);
                    health = getValue(healthDiv);
                }

                if (config.getItem('AutoStatAdv', false)) {
                    //Using eval, so user can define formulas on menu, like energy = level + 50
                    /*jslint evil: true */
                    attrAdjustNew = eval(attrAdjust);
                    /*jslint evil: false */
                    logTxt = "(" + attrAdjust + ")=" + attrAdjustNew;
                }

                if ((attribute === 'stamina') && (caap.stats['points']['skill'] < 2)) {
                    if (attrAdjustNew <= attrCurrent) {
                        $u.log(2, "Stamina at requirement: Next");
                        return "Next";
                    } else if (config.getItem("StatSpendAll", false)) {
                        $u.log(2, "Stamina requires 2 upgrade points: Next");
                        return "Next";
                    } else {
                        $u.log(2, "Stamina requires 2 upgrade points: Save");
                        state.setItem("statsMatch", false);
                        return "Save";
                    }
                }

                if (attrAdjustNew > attrCurrent) {
                    $u.log(2, "Status Before [" + attribute + "=" + attrCurrent + "]  Adjusting To [" + logTxt + "]");
                    caap.click(button);
                    return "Click";
                }

                return "Next";
            } catch (err) {
                $u.error("ERROR in increaseStat: " + err);
                return "Error";
            }
        },

        autoStatCheck: function () {
            try {
                var startAtt   = 0,
                    stopAtt    = 4,
                    attribute  = '',
                    attrValue  = 0,
                    n          = 0,
                    level      = 0,
                    energy     = 0,
                    stamina    = 0,
                    attack     = 0,
                    defense    = 0,
                    health     = 0,
                    attrAdjust = 0,
                    value      = 0,
                    passed     = false;

                if (!config.getItem('AutoStat', false) || !caap.stats['points']['skill']) {
                    return false;
                }

                if (config.getItem("AutoStatAdv", false)) {
                    startAtt = 5;
                    stopAtt = 9;
                }

                for (n = startAtt; n <= stopAtt; n += 1) {
                    attribute = config.getItem('Attribute' + n, '').toLowerCase();
                    if (attribute === '') {
                        continue;
                    }

                    if (caap.stats['level'] < 10) {
                        if (attribute === 'attack' || attribute === 'defense' || attribute === 'health') {
                            continue;
                        }
                    }

                    attrValue = config.getItem('AttrValue' + n, 0);
                    attrAdjust = attrValue;
                    level = caap.stats['level'];
                    energy = caap.stats['energy']['num'];
                    stamina = caap.stats['stamina']['num'];
                    if (level >= 10) {
                        attack = caap.stats['attack'];
                        defense = caap.stats['defense'];
                        health = caap.stats['health']['num'];
                    }

                    if (config.getItem('AutoStatAdv', false)) {
                        //Using eval, so user can define formulas on menu, like energy = level + 50
                        /*jslint evil: true */
                        attrAdjust = eval(attrValue);
                        /*jslint evil: false */
                    }

                    if (attribute === "attack" || attribute === "defense") {
                        value = caap.stats[attribute];
                    } else {
                        value = caap.stats[attribute]['num'];
                    }

                    if (attribute === 'stamina' && caap.stats['points']['skill'] < 2) {
                        if (config.getItem("StatSpendAll", false) && attrAdjust > value) {
                            continue;
                        } else {
                            passed = false;
                            break;
                        }
                    }

                    if (attrAdjust > value) {
                        passed = true;
                        break;
                    }
                }

                state.setItem("statsMatch", passed);
                return true;
            } catch (err) {
                $u.error("ERROR in autoStatCheck: " + err);
                return false;
            }
        },

        autoStat: function () {
            try {
                if (!config.getItem('AutoStat', false) || !caap.stats['points']['skill']) {
                    return false;
                }

                if (!state.getItem("statsMatch", true)) {
                    if (state.getItem("autoStatRuleLog", true)) {
                        $u.log(2, "User should possibly change their stats rules");
                        state.setItem("autoStatRuleLog", false);
                    }

                    return false;
                }

                var atributeSlice      = $j("div[class*='keep_attribute_section']", caap.globalContainer),
                    startAtt           = 0,
                    stopAtt            = 4,
                    attrName           = '',
                    attribute          = '',
                    attrValue          = 0,
                    n                  = 0,
                    returnIncreaseStat = '';

                if (!$u.hasContent(atributeSlice)) {
                    caap.navigateTo('keep');
                    return true;
                }

                if (config.getItem("AutoStatAdv", false)) {
                    startAtt = 5;
                    stopAtt = 9;
                }

                for (n = startAtt; n <= stopAtt; n += 1) {
                    attrName = 'Attribute' + n;
                    attribute = config.getItem(attrName, '');
                    if (attribute === '') {
                        $u.log(4, attrName + " is blank: continue");
                        continue;
                    }

                    if (caap.stats['level'] < 10) {
                        if (attribute === 'Attack' || attribute === 'Defense' || attribute === 'Health') {
                            $u.log(1, "Characters below level 10 can not increase Attack, Defense or Health: continue");
                            continue;
                        }
                    }

                    attrValue = config.getItem('AttrValue' + n, 0);
                    returnIncreaseStat = caap.increaseStat(attribute, attrValue, atributeSlice);
                    switch (returnIncreaseStat) {
                    case "Next" :
                        $u.log(4, attrName + " : next");
                        continue;
                    case "Click" :
                        $u.log(4, attrName + " : click");
                        return true;
                    default :
                        $u.log(4, attrName + " return value: " + returnIncreaseStat);
                        return false;
                    }
                }

                $u.log(1, "No rules match to increase stats");
                state.setItem("statsMatch", false);
                return false;
            } catch (err) {
                $u.error("ERROR in autoStat: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                              CTA
        /////////////////////////////////////////////////////////////////////

        waitAjaxCTA: false,

        recordCTA: [],

        loadedCTA: false,

        waitLoadCTA: true,

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        doCTAs: function () {
            try {
                if (gm.getItem("ajaxCTA", false, hiddenVar) || caap.waitAjaxCTA || caap.stats['stamina']['num'] < 1 || !schedule.check('ajaxCTATimer')) {
                    return false;
                }

                if (caap.waitLoadCTA) {
                    $j.ajax({
                        url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fkey%3D0At1LY6Vd3Bp9dFhvYkltNVdVNlRfSzZWV0xCQXQtR3c%26hl%3Den%26output%3Dcsv'&format=json",
                        dataType: "json",
                        error: function () {
                            caap.loadedCTA = true;
                        },
                        success: function (msg) {
                            var rows       = msg['query']['results']['row'],
                                row        = 0,
                                rowsLen    = 0,
                                column     = 0,
                                newRecord  = {},
                                headers    = rows[0],
                                headersLen = 0,
                                headersArr = [],
                                key        = '';

                            for (key in headers) {
                                if (headers.hasOwnProperty(key)) {
                                    headersLen = headersArr.push((headers[key]).toLowerCase());
                                }
                            }

                            for (row = 1, rowsLen = rows.length; row < rowsLen; row += 1) {
                                newRecord = {};
                                for (column = 0; column < headersLen; column += 1) {
                                    if (!$u.hasContent(headersArr[column])) {
                                        continue;
                                    }

                                    newRecord[headersArr[column]] = $u.setContent(rows[row]["col" + column], null);
                                }

                                caap.recordCTA.push(newRecord);
                            }

                            caap.loadedCTA = true;
                        }
                    });

                    caap.waitLoadCTA = false;
                    return true;
                }

                if (!$u.hasContent(caap.recordCTA) || !caap.loadedCTA) {
                    return false;
                }

                var count = state.getItem('ajaxCTACount', 0),
                    aes   = null;

                if (count < caap.recordCTA.length) {
                    caap.waitAjaxCTA = true;
                    aes = new $u.Aes(gm.get_namespace());
                    $j.ajax({
                        url: caap.domain.link + aes.decrypt(caap.recordCTA[count]['code']),
                        error: function () {
                            caap.waitAjaxCTA = false;
                        },
                        success: function () {
                            caap.waitAjaxCTA = false;
                        }
                    });

                    count = state.setItem('ajaxCTACount', count + 1);
                    $u.log(10, "doCTAs", count, caap.recordCTA.length);
                } else {
                    caap.waitAjaxCTA = false;
                    state.setItem('ajaxCTACount', 0);
                    schedule.setItem('ajaxCTATimer', 10800, 300);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in doCTAs: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                              FRIEND LISTS
        /////////////////////////////////////////////////////////////////////

        friendListType: {
            facebook: {
                name: "facebook",
                url: '/army.php?app_friends=false&giftSelection=1'
            },
            gifta: {
                name: "gifta",
                url: '/gift.php?app_friends=a&giftSelection=1'
            },
            giftb: {
                name: "giftb",
                url: '/gift.php?app_friends=b&giftSelection=1'
            },
            giftc: {
                name: "giftc",
                url: '/gift.php?app_friends=c&giftSelection=1'
            }
        },

        getFriendList: function (listType, force) {
            try {
                $u.log(4, "Entered getFriendList and request is for: ", listType.name);
                if (force === true) {
                    state.setItem(listType.name + 'Requested', false);
                    state.setItem(listType.name + 'Responded', []);
                }

                if (!state.getItem(listType.name + 'Requested', false)) {
                    $u.log(3, "Getting Friend List: ", listType.name);
                    state.setItem(listType.name + 'Requested', true);
                    if (caap.domain.which > 1) {
                        if (listType.name === "giftc") {
                            var armyList = army.getIdList();
                            $u.log(4, "armyList", armyList);
                            if ($u.hasContent(armyList)) {
                                state.setItem(listType.name + 'Responded', army.getIdList());
                            } else {
                                state.setItem(listType.name + 'Responded', true);
                            }
                        } else {
                            state.setItem(listType.name + 'Responded', true);
                        }
                    } else {
                        $j.ajax({
                            url: caap.domain.link + listType.url,
                            error:
                                function (XMLHttpRequest, textStatus, errorThrown) {
                                    state.setItem(listType.name + 'Requested', false);
                                    $u.log(4, "getFriendList(" + listType.name + "): ", textStatus);
                                },
                            success:
                                function (data, textStatus, XMLHttpRequest) {
                                    try {
                                        $u.log(4, "getFriendList.ajax splitting data");
                                        data = data.split('<div class="unselected_list">');
                                        if (data.length < 2) {
                                            throw "Could not locate 'unselected_list'";
                                        }

                                        data = data[1].split('</div><div class="selected_list">');
                                        if (data.length < 2) {
                                            throw "Could not locate 'selected_list'";
                                        }

                                        $u.log(4, "getFriendList.ajax data split ok");
                                        var friendList = [];
                                        $j('<div></div>').html(data[0]).find('input').each(function (index) {
                                            friendList.push($j(this).val().parseInt());
                                        });

                                        $u.log(4, "getFriendList.ajax saving friend list of: ", friendList.length);
                                        if (friendList.length) {
                                            state.setItem(listType.name + 'Responded', friendList);
                                        } else {
                                            state.setItem(listType.name + 'Responded', true);
                                        }

                                        $u.log(4, "getFriendList(" + listType.name + "): ", textStatus);
                                    } catch (err) {
                                        state.setItem(listType.name + 'Requested', false);
                                        $u.error("ERROR in getFriendList.ajax: " + err);
                                    }
                                }
                        });
                    }
                } else {
                    $u.log(4, "Already requested getFriendList for: ", listType.name);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in getFriendList(" + listType.name + "): " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                              FILL ARMY
        /////////////////////////////////////////////////////////////////////

        addFriendSpamCheck: 0,

        autoFillArmy: function (caListType, fbListType) {
            try {
                if (!state.getItem('FillArmy', false) || caap.domain.which > 1) {
                    return false;
                }

                function addFriend(id) {
                    try {
                        var theUrl = '',
                            responseCallback = function (XMLHttpRequest, textStatus, errorThrown) {
                            if (caap.addFriendSpamCheck > 0) {
                                caap.addFriendSpamCheck -= 1;
                            }

                            $u.log(1, "AddFriend(" + id + "): ", textStatus);
                        };

                        theUrl = caap.domain.link + '/party.php?twt=jneg&jneg=true&user=' + id + '&lka=' + id + '&etw=9&ref=nf';

                        $j.ajax({
                            url: theUrl,
                            error: responseCallback,
                            success: responseCallback
                        });

                        return true;
                    } catch (err) {
                        $u.error("ERROR in addFriend(" + id + "): " + err);
                        return false;
                    }
                }

                var armyCount = state.getItem("ArmyCount", 0);
                if (armyCount === 0) {
                    caap.setDivContent('idle_mess', 'Filling Army');
                    $u.log(1, "Filling army");
                }

                if (state.getItem(caListType.name + 'Responded', false) === true || state.getItem(fbListType.name + 'Responded', false) === true) {
                    caap.setDivContent('idle_mess', '<span style="font-weight: bold;">Fill Army Completed</span>');
                    $u.log(1, "Fill Army Completed: no friends found");
                    window.setTimeout(function () {
                        caap.setDivContent('idle_mess', '');
                    }, 5000);

                    state.setItem('FillArmy', false);
                    state.setItem("ArmyCount", 0);
                    state.setItem('FillArmyList', []);
                    state.setItem(caListType.name + 'Responded', false);
                    state.setItem(fbListType.name + 'Responded', false);
                    state.setItem(caListType.name + 'Requested', []);
                    state.setItem(fbListType.name + 'Requested', []);
                    return true;
                }

                var fillArmyList = state.getItem('FillArmyList', []);
                if (!fillArmyList.length) {
                    caap.getFriendList(caListType);
                    caap.getFriendList(fbListType);
                }

                var castleageList = state.getItem(caListType.name + 'Responded', []);
                $u.log(4, "gifList: ", castleageList);
                var facebookList = state.getItem(fbListType.name + 'Responded', []);
                $u.log(4, "facebookList: ", facebookList);
                if ((castleageList.length && facebookList.length) || fillArmyList.length) {
                    if (!fillArmyList.length) {
                        var diffList = facebookList.filter(function (facebookID) {
                            return castleageList.hasIndexOf(facebookID);
                        });

                        $u.log(4, "diffList: ", diffList);
                        fillArmyList = state.setItem('FillArmyList', diffList);
                        state.setItem(caListType.name + 'Responded', false);
                        state.setItem(fbListType.name + 'Responded', false);
                        state.setItem(caListType.name + 'Requested', []);
                        state.setItem(fbListType.name + 'Requested', []);
                    }

                    // Add army members //
                    var batchCount = 5;
                    if (fillArmyList.length < 5) {
                        batchCount = fillArmyList.length;
                    } else if (fillArmyList.length - armyCount < 5) {
                        batchCount = fillArmyList.length - armyCount;
                    }

                    batchCount = batchCount - caap.addFriendSpamCheck;
                    for (var i = 0; i < batchCount; i += 1) {
                        addFriend(fillArmyList[armyCount]);
                        armyCount += 1;
                        caap.addFriendSpamCheck += 1;
                    }

                    caap.setDivContent('idle_mess', 'Filling Army, Please wait...' + armyCount + "/" + fillArmyList.length);
                    $u.log(1, 'Filling Army, Please wait...' + armyCount + "/" + fillArmyList.length);
                    state.setItem("ArmyCount", armyCount);
                    if (armyCount >= fillArmyList.length) {
                        caap.setDivContent('idle_mess', '<span style="font-weight: bold;">Fill Army Completed</span>');
                        window.setTimeout(function () {
                            caap.setDivContent('idle_mess', '');
                        }, 5000);

                        $u.log(1, "Fill Army Completed");
                        state.setItem('FillArmy', false);
                        state.setItem("ArmyCount", 0);
                        state.setItem('FillArmyList', []);
                    }
                }

                return true;
            } catch (err) {
                $u.error("ERROR in autoFillArmy: " + err);
                caap.setDivContent('idle_mess', '<span style="font-weight: bold;">Fill Army Failed</span>');
                window.setTimeout(function () {
                    caap.setDivContent('idle_mess', '');
                }, 5000);

                state.setItem('FillArmy', false);
                state.setItem("ArmyCount", 0);
                state.setItem('FillArmyList', []);
                state.setItem(caListType.name + 'Responded', false);
                state.setItem(fbListType.name + 'Responded', false);
                state.setItem(caListType.name + 'Requested', []);
                state.setItem(fbListType.name + 'Requested', []);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                              IDLE
        /////////////////////////////////////////////////////////////////////

        idle: function () {
            if (state.getItem('resetselectMonster', false)) {
                $u.log(4, "resetselectMonster");
                monster.select(true);
                state.setItem('resetselectMonster', false);
            }

            if (caap.doCTAs()) {
                return true;
            }

            caap.autoFillArmy(caap.friendListType.giftc, caap.friendListType.facebook);
            caap.updateDashboard();
            state.setItem('ReleaseControl', true);
            return true;
        },

        /////////////////////////////////////////////////////////////////////
        //                              PLAYER RECON
        /////////////////////////////////////////////////////////////////////

        /*-------------------------------------------------------------------------------------\
                                          RECON PLAYERS
        reconPlayers is an idle background process that scans the battle page for viable
        targets that can later be attacked.
        \-------------------------------------------------------------------------------------*/

        reconRecords : [],

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        reconRecord: function () {
            this.data = {
                'userID'          : 0,
                'nameStr'         : '',
                'rankStr'         : '',
                'rankNum'         : 0,
                'warRankStr'      : '',
                'warRankNum'      : 0,
                'levelNum'        : 0,
                'armyNum'         : 0,
                'deityNum'        : 0,
                'invadewinsNum'   : 0,
                'invadelossesNum' : 0,
                'duelwinsNum'     : 0,
                'duellossesNum'   : 0,
                'defendwinsNum'   : 0,
                'defendlossesNum' : 0,
                'statswinsNum'    : 0,
                'statslossesNum'  : 0,
                'goldNum'         : 0,
                'aliveTime'       : 0,
                'attackTime'      : 0,
                'selectTime'      : 0
            };
        },
        /*jslint sub: false */

        reconhbest: 2,

        loadRecon: function () {
            caap.reconRecords = gm.getItem('recon.records', 'default');
            if (caap.reconRecords === 'default' || !$j.isArray(caap.reconRecords)) {
                caap.reconRecords = gm.setItem('recon.records', []);
            }

            caap.reconhbest = caap.reconhbest === false ? JSON.hbest(caap.reconRecords) : caap.reconhbest;
            $u.log(3, "recon.records Hbest", caap.reconhbest);
            state.setItem("ReconDashUpdate", true);
            $u.log(3, "recon.records", caap.reconRecords);
        },

        saveRecon: function () {
            var compress = false;
            gm.setItem('recon.records', caap.reconRecords, caap.reconhbest, compress);
            state.setItem("ReconDashUpdate", true);
            $u.log(3, "recon.records", caap.reconRecords);
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        reconPlayers: function () {
            try {
                if (!config.getItem('DoPlayerRecon', false) || !schedule.check('PlayerReconTimer') || caap.stats['stamina']['num'] <= 0) {
                    return false;
                }

                var theUrl = '';
                caap.setDivContent('idle_mess', 'Player Recon: In Progress');
                $u.log(1, "Player Recon: In Progress");
                theUrl = caap.domain.link + '/battle.php';

                $j.ajax({
                    url: theUrl,
                    error:
                        function (XMLHttpRequest, textStatus, errorThrown) {
                            $u.error("ReconPlayers2.ajax", textStatus);
                        },
                    success:
                        function (data, textStatus, XMLHttpRequest) {
                            try {
                                var found       = 0,
                                    regex       = new RegExp('(.+)\\s*\\(Level (\\d+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank (\\d+)\\)\\s*War: ([A-Za-z ]+) \\(Rank (\\d+)\\)\\s*(\\d+)', 'i'),
                                    regex2      = new RegExp('(.+)\\s*\\(Level (\\d+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank (\\d+)\\)\\s*(\\d+)', 'i'),
                                    entryLimit  = config.getItem('LimitTargets', 100),
                                    reconRank   = config.getItem('ReconPlayerRank', 99),
                                    reconLevel  = config.getItem('ReconPlayerLevel', 999),
                                    reconARBase = config.getItem('ReconPlayerARBase', 999);

                                $u.log(3, "reconPlayers.ajax: Checking data.");

                                $j(data).find("img[src*='symbol_']").not("[src*='symbol_tiny_']").each(function (index) {
                                    var UserRecord      = new caap.reconRecord(),
                                        row             = $j(this),
                                        $tempObj        = row.parent().parent().parent().parent().parent(),
                                        tempArray       = [],
                                        txt             = '',
                                        i               = 0,
                                        OldRecord       = {},
                                        levelMultiplier = 0,
                                        armyRatio       = 0,
                                        goodTarget      = true,
                                        len             = 0,
                                        tStr            = '';

                                    if ($tempObj.length) {
                                        tStr = $j("a", $tempObj).eq(0).attr("href");
                                        i = tStr ? tStr.regex(/user=(\d+)/) : null;
                                        if (!$u.hasContent(i) || i <= 0) {
                                            $u.log(2, "reconPlayers: No userId, skipping");
                                            return true;
                                        }

                                        UserRecord.data['userID'] = i;
                                        for (i = 0, len = caap.reconRecords.length; i < len; i += 1) {
                                            if (caap.reconRecords[i]['userID'] === UserRecord.data['userID']) {
                                                UserRecord.data = caap.reconRecords[i];
                                                caap.reconRecords.splice(i, 1);
                                                $u.log(3, "UserRecord exists. Loaded and removed.", UserRecord);
                                                break;
                                            }
                                        }

                                        tempArray = row.attr("src").match(/symbol_(\d)\.jpg/);
                                        if (tempArray && tempArray.length === 2) {
                                            UserRecord.data['deityNum'] = tempArray[1] ? tempArray[1].parseInt() : 0;
                                        }

                                        txt = $tempObj.text();
                                        txt = txt ? txt.trim() : '';
                                        if (txt.length) {
                                            if (battle.battles['Freshmeat']['warLevel']) {
                                                tempArray = regex.exec(txt);
                                                if (!tempArray) {
                                                    tempArray = regex2.exec(txt);
                                                    battle.battles['Freshmeat']['warLevel'] = false;
                                                }
                                            } else {
                                                tempArray = regex2.exec(txt);
                                                if (!tempArray) {
                                                    tempArray = regex.exec(txt);
                                                    battle.battles['Freshmeat']['warLevel'] = true;
                                                }
                                            }

                                            if (tempArray) {
                                                UserRecord.data['aliveTime']      = new Date().getTime();
                                                UserRecord.data['nameStr']        = tempArray[1] ? tempArray[1].trim() : '';
                                                UserRecord.data['levelNum']       = tempArray[2] ? tempArray[2].parseInt() : 0;
                                                UserRecord.data['rankStr']        = tempArray[3] ? tempArray[3].trim() : '';
                                                UserRecord.data['rankNum']        = tempArray[4] ? tempArray[4].parseInt() : 0;
                                                if (battle.battles['Freshmeat']['warLevel']) {
                                                    UserRecord.data['warRankStr'] = tempArray[5] ? tempArray[5].trim() : '';
                                                    UserRecord.data['warRankNum'] = tempArray[6] ? tempArray[6].parseInt() : 0;
                                                    UserRecord.data['armyNum']    = tempArray[7] ? tempArray[7].parseInt() : 0;
                                                } else {
                                                    UserRecord.data['armyNum']    = tempArray[5] ? tempArray[5].parseInt() : 0;
                                                }

                                                if (UserRecord.data['levelNum'] - caap.stats['level'] > reconLevel) {
                                                    $u.log(3, 'Level above reconLevel max', reconLevel, UserRecord);
                                                    goodTarget = false;
                                                } else if (caap.stats['rank']['battle'] - UserRecord.data['rankNum'] > reconRank) {
                                                    $u.log(3, 'Rank below reconRank min', reconRank, UserRecord);
                                                    goodTarget = false;
                                                } else {
                                                    levelMultiplier = caap.stats['level'] / UserRecord.data['levelNum'];
                                                    armyRatio = reconARBase * levelMultiplier;
                                                    if (armyRatio <= 0) {
                                                        $u.log(3, 'Recon unable to calculate army ratio', reconARBase, levelMultiplier);
                                                        goodTarget = false;
                                                    } else if (UserRecord.data['armyNum']  > (caap.stats['army']['capped'] * armyRatio)) {
                                                        $u.log(3, 'Army above armyRatio adjustment', armyRatio, UserRecord);
                                                        goodTarget = false;
                                                    }
                                                }

                                                if (goodTarget) {
                                                    while (caap.reconRecords.length >= entryLimit) {
                                                        OldRecord = caap.reconRecords.shift();
                                                        $u.log(3, "Entry limit matched. Deleted an old record", OldRecord);
                                                    }

                                                    $u.log(3, "UserRecord", UserRecord);
                                                    caap.reconRecords.push(UserRecord.data);
                                                    found += 1;
                                                }
                                            } else {
                                                $u.warn('Recon can not parse target text string', txt);
                                            }
                                        } else {
                                            $u.warn("Can't find txt in $tempObj", $tempObj);
                                        }
                                    } else {
                                        $u.warn("$tempObj is empty");
                                    }

                                    return true;
                                });

                                caap.saveRecon();
                                caap.setDivContent('idle_mess', 'Player Recon: Found:' + found + ' Total:' + caap.reconRecords.length);
                                $u.log(1, 'Player Recon: Found:' + found + ' Total:' + caap.reconRecords.length);
                                window.setTimeout(function () {
                                    caap.setDivContent('idle_mess', '');
                                }, 5000);

                                $u.log(4, "reconPlayers.ajax: Done.", caap.reconRecords);
                            } catch (err) {
                                $u.error("ERROR in reconPlayers.ajax: " + err);
                            }
                        }
                });

                schedule.setItem('PlayerReconTimer', gm.getItem('PlayerReconRetry', 60, hiddenVar), 60);
                return true;
            } catch (err) {
                $u.error("ERROR in reconPlayers:" + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          MAIN LOOP
        // This function repeats continously.  In principle, functions should only make one
        // click before returning back here.
        /////////////////////////////////////////////////////////////////////

        actionDescTable: {
            'autoIncome'            : 'Awaiting Income',
            'autoStat'              : 'Upgrade Skill Points',
            'maxEnergyQuest'        : 'At Max Energy Quest',
            'passiveGeneral'        : 'Setting Idle General',
            'idle'                  : 'Idle Tasks',
            'immediateBanking'      : 'Immediate Banking',
            'battle'                : 'Battling Players',
            'monsterReview'         : 'Review Monsters/Raids',
            'guildMonsterReview'    : 'Review Guild Monsters',
            'immediateAutoStat'     : 'Immediate Auto Stats',
            'autoElite'             : 'Fill Elite Guard',
            'autoPotions'           : 'Auto Potions',
            'autoAlchemy'           : 'Auto Alchemy',
            'autoBless'             : 'Auto Bless',
            'autoGift'              : 'Auto Gifting',
            'demiPoints'            : 'Demi Points First',
            'monsters'              : 'Fighting Monsters',
            'guildMonster'          : 'Fight Guild Monster',
            'heal'                  : 'Auto Healing',
            'bank'                  : 'Auto Banking',
            'lands'                 : 'Land Operations',
            'quests'                : 'Questing',
            'checkGenerals'         : 'Checking Generals',
            'checkAllGenerals'      : 'Getting Generals Stats',
            'checkArmy'             : 'Checking Army',
            'checkKeep'             : 'Checking Keep',
            'ajaxGiftCheck'         : 'Ajax Gift Check',
            'checkAchievements'     : 'Achievements',
            'reconPlayers'          : 'Player Recon',
            'checkOracle'           : 'Checking Oracle',
            'checkBattleRank'       : 'Battle Rank',
            'checkWarRank'          : 'War Rank',
            'checkSymbolQuests'     : 'Demi Blessing Stats',
            'checkSoldiers'         : 'Getting Soldiers',
            'checkItem'             : 'Getting Items',
            'checkMagic'            : 'Getting Magic',
            'checkCharacterClasses' : 'Character Classes',
            'festivalBless'         : 'Festival Feats'
        },
        /*jslint sub: false */

        checkLastAction: function (thisAction) {
            try {
                var lastAction = state.getItem('LastAction', 'idle');
                caap.setDivContent('activity_mess', 'Activity: ' + $u.setContent(caap.actionDescTable[thisAction], thisAction));

                if (lastAction !== thisAction) {
                    $u.log(1, 'Changed from doing ' + lastAction + ' to ' + thisAction);
                    state.setItem('LastAction', thisAction);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in checkLastAction:" + err);
                return false;
            }
        },

        masterActionList: {
            0x00: 'autoElite',
            0x01: 'heal',
            0x02: 'immediateBanking',
            0x03: 'immediateAutoStat',
            0x04: 'maxEnergyQuest',
            //0x05: 'arenaReview',
            0x06: 'guildMonsterReview',
            0x07: 'monsterReview',
            //0x08: 'arena',
            0x09: 'guildMonster',
            0x0A: 'demiPoints',
            0x0B: 'monsters',
            0x0C: 'battle',
            0x0D: 'quests',
            0x0E: 'bank',
            0x0F: 'passiveGeneral',
            0x10: 'checkGenerals',
            0x11: 'checkAllGenerals',
            0x12: 'checkArmy',
            0x13: 'lands',
            0x14: 'autoBless',
            0x15: 'autoStat',
            0x16: 'autoGift',
            0x17: 'checkKeep',
            0x18: 'autoPotions',
            0x19: 'autoAlchemy',
            0x1A: 'checkAchievements',
            0x1B: 'ajaxGiftCheck',
            0x1C: 'reconPlayers',
            0x1D: 'checkOracle',
            0x1E: 'checkBattleRank',
            0x1F: 'checkWarRank',
            0x20: 'checkSymbolQuests',
            0x21: 'checkSoldiers',
            0x22: 'checkItem',
            0x23: 'checkMagic',
            0x24: 'checkCharacterClasses',
            0x25: 'festivalBless',
            0x26: 'idle'
        },

        actionsList: [],

        makeActionsList: function () {
            try {
                if (!$u.hasContent(caap.actionsList)) {
                    $u.log(2, "Loading a fresh Action List");
                    // actionOrder is a comma seperated string of action numbers as
                    // hex pairs and can be referenced in the Master Action List
                    // Example: "00,01,02,03,04,05,06,07,08,09,0A,0B,0C,0D,0E,0F,10,11,12"
                    var action                = '',
                        actionOrderArray      = [],
                        masterActionListCount = 0,
                        actionOrderUser       = config.getItem("actionOrder", ''),
                        actionOrderArrayCount = 0,
                        itemCount             = 0,
                        actionItem            = '';

                    if ($u.hasContent(actionOrderUser)) {
                        // We are using the user defined actionOrder set in the
                        // Advanced Hidden Options
                        $u.log(2, "Trying user defined Action Order");
                        // We take the User Action Order and convert it from a comma
                        // separated list into an array
                        actionOrderArray = actionOrderUser.split(",");
                        // We count the number of actions contained in the
                        // Master Action list
                        for (action in caap.masterActionList) {
                            if (caap.masterActionList.hasOwnProperty(action)) {
                                masterActionListCount += 1;
                                $u.log(4, "Counting Action List", masterActionListCount);
                            } else {
                                $u.warn("Error Getting Master Action List length!");
                                $u.warn("Skipping 'action' from masterActionList: ", action);
                            }
                        }
                    } else {
                        // We are building the Action Order Array from the
                        // Master Action List
                        $u.log(2, "Building the default Action Order");
                        for (action in caap.masterActionList) {
                            if (caap.masterActionList.hasOwnProperty(action)) {
                                masterActionListCount = actionOrderArray.push(action);
                                $u.log(4, "Action Added", action);
                            } else {
                                $u.warn("Error Building Default Action Order!");
                                $u.warn("Skipping 'action' from masterActionList: ", action);
                            }
                        }
                    }

                    // We notify if the number of actions are not sensible or the
                    // same as in the Master Action List
                    actionOrderArrayCount = actionOrderArray.length;
                    if (actionOrderArrayCount === 0) {
                        throw "Action Order Array is empty! " + (actionOrderUser === "" ? "(Default)" : "(User)");
                    } else if (actionOrderArrayCount < masterActionListCount) {
                        $u.warn("Warning! Action Order Array has fewer orders than default!");
                    } else if (actionOrderArrayCount > masterActionListCount) {
                        $u.warn("Warning! Action Order Array has more orders than default!");
                    }

                    // We build the Action List
                    $u.log(8, "Building Action List ...");
                    for (itemCount = 0; itemCount !== actionOrderArrayCount; itemCount += 1) {
                        actionItem = '';
                        if ($u.hasContent(actionOrderUser)) {
                            // We are using the user defined comma separated list of hex pairs
                            actionItem = caap.masterActionList[actionOrderArray[itemCount].parseInt(16)];
                            $u.log(4, "(" + itemCount + ") Converted user defined hex pair to action", actionItem);
                        } else {
                            // We are using the Master Action List
                            actionItem = caap.masterActionList[actionOrderArray[itemCount]];
                            $u.log(4, "(" + itemCount + ") Converted Master Action List entry to an action", actionItem);
                        }

                        // Check the Action Item
                        if ($u.hasContent(actionItem)) {
                            // We add the Action Item to the Action List
                            caap.actionsList.push(actionItem);
                            $u.log(4, "Added action to the list", actionItem);
                        } else {
                            $u.warn("Error! Skipping actionItem");
                            $u.warn("Action Item(" + itemCount + "): ", actionItem);
                        }
                    }

                    if ($u.hasContent(actionOrderUser)) {
                        $u.log(1, "Get Action List: ", caap.actionsList);
                    }
                }

                return true;
            } catch (err) {
                // Something went wrong, log it and use the emergency Action List.
                $u.error("ERROR in makeActionsList: " + err);
                for (var jt in caap.masterActionList) {
                    if (caap.masterActionList.hasOwnProperty(jt)) {
                        caap.actionsList.push(caap.masterActionList[jt]);
                    }
                }

                return false;
            }
        },

        errorCheckWait: false,

        errorCheck: function () {
            // assorted errors...
            if (caap.errorCheckWait) {
                return true;
            }

            if (window.location.href.hasIndexOf('/error.html') || window.location.href.hasIndexOf('/sorry.php')) {
                $u.warn('Detected "error" or "sorry" page, waiting to go back to previous page.');
                window.setTimeout(function () {
                    if ($u.isFunction(window.history.back)) {
                        window.history.back();
                    } else if ($u.isFunction(window.history.go)) {
                        window.history.go(-1);
                    } else {
                        window.location.href = 'http://apps.facebook.com/castle_age/index.php?bm=1&ref=bookmarks&count=0';
                    }
                }, 60000);

                caap.errorCheckWait = true;
                return true;
            }

            // Try again button
            var button = $j("#try_again_button, input[name='try_again_button']");
            if ($u.hasContent(button)) {
                $u.warn('Detected "Try Again" message, clicking button else refresh.');
                $j(".phl").append("<p>CAAP will retry shortly!</p>");
                window.setTimeout(function () {
                    caap.click(button);
                    window.setTimeout(function () {
                        $u.reload();
                    }, 180000);
                }, 60000 + (Math.floor(Math.random() * 60) * 1000));

                caap.errorCheckWait = true;
                return true;
            }

            return false;
        },

        waitingAjaxLoad: function () {
            try {
                return $u.hasContent(caap.ajaxLoadIcon) && caap.ajaxLoadIcon.css("display") !== "none";
            } catch (err) {
                $u.error("ERROR in waitingAjaxLoad: " + err);
                return false;
            }
        },

        mainLoop: function () {
            try {
                var button          = null,
                    noWindowLoad    = 0,
                    actionsListCopy = [],
                    action          = 0,
                    len             = 0;

                // assorted errors...
                if (caap.errorCheck()) {
                    return true;
                }

                if (caap.domain.which === 1) {
                    gifting.collect();
                    caap.waitMainLoop();
                    return true;
                }

                //We don't need to send out any notifications
                button = $j("a[class*='undo_link']");
                if ($u.hasContent(button)) {
                    $u.log(1, 'Undoing notification');
                    caap.click(button);
                }

                if (config.getItem('Disabled', false)) {
                    caap.waitMainLoop();
                    return true;
                }

                if (!caap.pageLoadOK) {
                    noWindowLoad = state.getItem('NoWindowLoad', 0);
                    if (noWindowLoad === 0) {
                        schedule.setItem('NoWindowLoadTimer', Math.min(Math.pow(2, noWindowLoad - 1) * 15, 3600));
                        state.setItem('NoWindowLoad', 1);
                    } else if (schedule.check('NoWindowLoadTimer')) {
                        schedule.setItem('NoWindowLoadTimer', Math.min(Math.pow(2, noWindowLoad - 1) * 15, 3600));
                        state.setItem('NoWindowLoad', noWindowLoad + 1);
                        caap.reloadCastleAge();
                    }

                    $u.log(1, 'Page no-load count: ', noWindowLoad);
                    caap.pageLoadOK = caap.getStats();
                    caap.waitMainLoop();
                    return true;
                } else {
                    state.setItem('NoWindowLoad', 0);
                }

                if (state.getItem('caapPause', 'none') !== 'none') {
                    caap.waitMainLoop();
                    return true;
                }

                if (caap.waitingForDomLoad) {
                    if (schedule.since('clickedOnSomething', 45)) {
                        $u.log(1, 'Clicked on something, but nothing new loaded.  Reloading page.');
                        caap.reloadCastleAge();
                        return true;
                    }

                    if (caap.waitingAjaxLoad()) {
                        $u.log(1, 'Waiting for page load ...');
                        caap.waitMainLoop();
                        return true;
                    }
                }

                if (caap.delayMain) {
                    $u.log(2, 'Delay main ...');
                    caap.waitMainLoop();
                    return true;
                }

                if (!config.setItem("disAutoIncome", false) && caap.autoIncome()) {
                    caap.checkLastAction('autoIncome');
                    caap.waitMainLoop();
                    return true;
                }

                actionsListCopy = caap.actionsList.slice();
                len = state.getItem('ReleaseControl', false) ? state.setItem('ReleaseControl', false) : actionsListCopy.unshift(state.getItem('LastAction', 'idle'));
                monster.select();
                for (action = 0, len = actionsListCopy.indexOf('idle') + 1; action < len; action += 1) {
                    if (caap[actionsListCopy[action]]()) {
                        caap.checkLastAction(actionsListCopy[action]);
                        break;
                    }
                }

                caap.waitMainLoop();
                return true;
            } catch (err) {
                $u.error("ERROR in mainLoop: " + err);
                return false;
            }
        },

        waitMilliSecs: 5000,

        waitMainLoop: function () {
            try {
                window.setTimeout(function () {
                    caap.waitMilliSecs = 5000;
                    if (caap.flagReload) {
                        caap.reloadCastleAge();
                    }

                    caap.mainLoop();
                }, caap.waitMilliSecs * (1 + Math.random() * 0.2));

                return true;
            } catch (err) {
                $u.error("ERROR in waitMainLoop: " + err);
                return false;
            }
        },

        reloadCastleAge: function (force) {
            try {
                // better than reload... no prompt on forms!
                if (force || !config.getItem('Disabled') && (state.getItem('caapPause') === 'none')) {
                    caap.visitUrl(caap.domain.link + "/index.php?bm=1&ref=bookmarks&count=0");
                }

                return true;
            } catch (err) {
                $u.error("ERROR in reloadCastleAge: " + err);
                return false;
            }
        },

        reloadOccasionally: function () {
            try {
                var reloadMin = config.getItem('ReloadFrequency', 8);
                reloadMin = !$u.isNumber(reloadMin) || reloadMin < 8 ? 8 : reloadMin;
                window.setTimeout(function () {
                    if (schedule.since('clickedOnSomething', 300) || caap.pageLoadCounter > 40) {
                        $u.log(1, 'Reloading if not paused after inactivity');
                        caap.flagReload = true;
                    }

                    caap.reloadOccasionally();
                }, 60000 * reloadMin + (reloadMin * 60000 * Math.random()));

                return true;
            } catch (err) {
                $u.error("ERROR in reloadOccasionally: " + err);
                return false;
            }
        },

        exportTable: {
            'Config' : {
                'export' : function () {
                    return config.options;
                },
                'import' : function (d) {
                    config.options = d;
                    config.save();
                },
                'delete' : function () {
                    config.options = {};
                    gm.deleteItem("config.options");
                }
            },
            'State' : {
                'export' : function () {
                    return state.flags;
                },
                'import' : function (d) {
                    state.flags = d;
                    state.save();
                },
                'delete' : function () {
                    state.flags = {};
                    gm.deleteItem("state.flags");
                }
            },
            'Schedule' : {
                'export' : function () {
                    return schedule.timers;
                },
                'import' : function (d) {
                    schedule.timers = d;
                    schedule.save();
                },
                'delete' : function () {
                    schedule.timers = {};
                    gm.deleteItem("schedule.timers");
                }
            },
            'Monster' : {
                'export' : function () {
                    return monster.records;
                },
                'import' : function (d) {
                    monster.records = d;
                    monster.save();
                },
                'delete' : function () {
                    monster.records = [];
                    gm.deleteItem("monster.records");
                }
            },
            'Battle' : {
                'export' : function () {
                    return battle.records;
                },
                'import' : function (d) {
                    battle.records = d;
                    battle.save();
                },
                'delete' : function () {
                    battle.records = [];
                    gm.deleteItem("battle.records");
                }
            },
            'Guild Monster' : {
                'export' : function () {
                    return guild_monster.records;
                },
                'import' : function (d) {
                    guild_monster.records = d;
                    guild_monster.save();
                },
                'delete' : function () {
                    guild_monster.records = [];
                    gm.deleteItem("guild_monster.records");
                }
            },
            'Target' : {
                'export' : function () {
                    return caap.reconRecords;
                },
                'import' : function (d) {
                    caap.reconRecords = d;
                    caap.saveRecon();
                },
                'delete' : function () {
                    caap.reconRecords = [];
                    gm.deleteItem("recon.records");
                }
            },
            'User' : {
                'export' : function () {
                    return caap.stats;
                },
                'import' : function (d) {
                    caap.stats = d;
                    caap.saveStats();
                },
                'delete' : function () {
                    caap.stats = {};
                    gm.deleteItem("stats.record");
                }
            },
            'Generals' : {
                'export' : function () {
                    return general.records;
                },
                'import' : function (d) {
                    general.records = d;
                    general.save();
                },
                'delete' : function () {
                    general.records = [];
                    gm.deleteItem("general.records");
                }
            },
            'Soldiers' : {
                'export' : function () {
                    return town.soldiers;
                },
                'import' : function (d) {
                    town.soldiers = d;
                    town.save('soldiers');
                },
                'delete' : function () {
                    town.soldiers = [];
                    gm.deleteItem("soldiers.records");
                }
            },
            'Item' : {
                'export' : function () {
                    return town.item;
                },
                'import' : function (d) {
                    town.item = d;
                    town.save('item');
                },
                'delete' : function () {
                    town.item = [];
                    gm.deleteItem("item.records");
                }
            },
            'Magic' : {
                'export' : function () {
                    return town.magic;
                },
                'import' : function (d) {
                    town.magic = d;
                    town.save('magic');
                },
                'delete' : function () {
                    town.magic = [];
                    gm.deleteItem("magic.records");
                }
            },
            'Gift Stats' : {
                'export' : function () {
                    return gifting.history.records;
                },
                'import' : function (d) {
                    gifting.history.records = d;
                    gifting.save('history');
                },
                'delete' : function () {
                    gifting.history.records = [];
                    gm.deleteItem("gifting.history");
                }
            },
            'Gift Queue' : {
                'export' : function () {
                    return gifting.queue.records;
                },
                'import' : function (d) {
                    gifting.queue.records = d;
                    gifting.save('queue');
                },
                'delete' : function () {
                    gifting.queue.records = [];
                    gm.deleteItem("gifting.queue");
                }
            },
            'Gifts' : {
                'export' : function () {
                    return gifting.gifts.records;
                },
                'import' : function (d) {
                    gifting.queue.records = d;
                    gifting.save('gifts');
                },
                'delete' : function () {
                    gifting.queue.records = [];
                    gm.deleteItem("gifting.gifts");
                }
            },
            /*'Arena' : {
                'export' : function () {
                    return arena.records;
                },
                'import' : function (d) {
                    arena.records = d;
                    arena.save();
                },
                'delete' : function () {
                arena.records = [];
                    gm.deleteItem("arena.records");
                }
            },*/
            'Army' : {
                'export' : function () {
                    return army.records;
                },
                'import' : function (d) {
                    army.records = d;
                    army.save();
                },
                'delete' : function () {
                    army.records = [];
                    gm.deleteItem("army.records");
                }
            },
            'Demi Points' : {
                'export' : function () {
                    return caap.demi;
                },
                'import' : function (d) {
                    caap.demi = d;
                    caap.SaveDemi();
                },
                'delete' : function () {
                    caap.demi = {};
                    gm.deleteItem("demipoint.records");
                }
            }
        },

        exportList: function () {
            try {
                var it,
                    list = [];

                for (it in caap.exportTable) {
                    if (caap.exportTable.hasOwnProperty(it)) {
                        list.push(it);
                    }
                }

                return list;
            } catch (err) {
                $u.error("ERROR in caap.exportList: " + err);
                return undefined;
            }
        },

        exportDialog: function (data, title) {
            try {
                var h = '',
                    w = $j("#caap_export");

                if (!$u.hasContent(w)) {
                    h = "<textarea style='resize:none;width:400px;height:400px;' readonly='readonly'>" + JSON.stringify(data, null, "\t") + "</textarea>";
                    w = $j('<div id="caap_export" class="caap_ff caap_fs" title="Export ' + title + ' Data">' + h + '</div>').appendTo(document.body);
                    w.dialog({
                        resizable : false,
                        width     : 'auto',
                        height    : 'auto',
                        buttons   : {
                            "Ok": function () {
                                w.dialog("destroy").remove();
                            }
                        },
                        close     : function () {
                            w.dialog("destroy").remove();
                        }
                    });
                }

                return w;
            } catch (err) {
                $u.error("ERROR in caap.exportDialog: " + err);
                return undefined;
            }
        },

        importDialog: function (which) {
            try {
                var h    = '',
                    w    = $j("#caap_import"),
                    l    = {},
                    v    = '',
                    resp = false;

                if (!$u.hasContent(w)) {
                    h = "<textarea id='caap_import_data' style='resize:none;width:400px;height:400px;'></textarea>";
                    w = $j('<div id="caap_import" class="caap_ff caap_fs" title="Import ' + which + ' Data">' + h + '</div>').appendTo(document.body);
                    w.dialog({
                        resizable : false,
                        width     : 'auto',
                        height    : 'auto',
                        buttons   : {
                            "Ok": function () {
                                try {
                                    v = JSON.parse($u.setContent($j("#caap_import_data", w).val(), 'null'));
                                } catch (e) {
                                    v = null;
                                }

                                l = $u.setContent(v, 'default');
                                if (($j.isArray(l) || $j.isPlainObject(l)) && l !== 'default') {
                                    resp = confirm("Are you sure you want to load " + which + "?");
                                    if (resp) {
                                        caap.exportTable[which]['import'](l);
                                        w.dialog("destroy").remove();
                                        caap.reloadCastleAge(true);
                                    }
                                } else {
                                    $u.warn(which + " config was not loaded!", l);
                                }
                            },
                            "Close": function () {
                                w.dialog("destroy").remove();
                            }
                        },
                        close     : function () {
                            w.dialog("destroy").remove();
                        }
                    });
                }

                return w;
            } catch (err) {
                $u.error("ERROR in caap.importDialog: " + err);
                return undefined;
            }
        },

        deleteDialog: function (which) {
            try {
                var resp = confirm("Are you sure you want to delete " + which + "?");
                if (resp) {
                    caap.exportTable[which]['delete']();
                    caap.reloadCastleAge(true);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in caap.deleteDialog: " + err);
                return false;
            }
        },

        actionDialog: function () {
            try {
                var h  = '',
                    w  = $j("#caap_action"),
                    it = 0,
                    jt = '',
                    t  = '';

                if (!$u.hasContent(w)) {
                    for (it = 0; it < caap.actionsList.length; it += 1) {
                        for (jt in caap.masterActionList) {
                            if (caap.masterActionList.hasOwnProperty(jt)) {
                                if (caap.actionsList[it] === caap.masterActionList[jt]) {
                                    h += "<li id='caap_action_" + jt + "' class='" + (caap.masterActionList[jt] === 'idle' ? "ui-state-highlight" : "ui-state-default") + "'>" + caap.actionsList[it] + "</li>";
                                }

                                if (it === 0) {
                                    t += $u.dec2hex(jt.parseInt()) + ',';
                                }
                            }
                        }
                    }

                    t = t.substring(0, t.length - 1);
                    w = $j('<div id="caap_action" class="caap_ff caap_fs" title="Action Order"><div style="margin:20px 0px; width: 150px; height: 480px;">' + caap.makeCheckTR('Disable AutoIncome', 'disAutoIncome', false, '') + '<ul class="caap_ul" id="caap_action_sortable">' + h + '</ul></div></div>').appendTo(document.body);
                    w.dialog({
                        resizable : false,
                        modal     : true,
                        width     : 'auto',
                        height    : 'auto',
                        buttons   : {
                            "Ok": function () {
                                var result = $j("#caap_action_sortable", w).sortable('toArray'),
                                    s      = '';

                                for (it = 0; it < result.length; it += 1) {
                                    s += $u.dec2hex(result[it].regex(/(\d+)/)) + (it < result.length - 1 ? ',' : '');
                                }

                                if (s === t) {
                                    $u.log(1, "Reset actionOrder to default", config.setItem("actionOrder", ''));
                                } else {
                                    $u.log(1, "Saved actionOrder to user preference", config.setItem("actionOrder", s));
                                }

                                $u.log(1, "Change: setting 'disAutoIncome' to ", config.setItem("disAutoIncome", $j("#caap_disAutoIncome", w).attr("checked")));
                                w.dialog("destroy").remove();
                                caap.actionsList = [];
                                caap.makeActionsList();
                            },
                            "Reset": function () {
                                $u.log(1, "Reset actionOrder to default", config.setItem("actionOrder", ''));
                                $u.log(1, "Change: setting 'disAutoIncome' to ", config.setItem("disAutoIncome", false));
                                $j("#caap_disAutoIncome", w).attr("checked", false);
                                caap.actionsList = [];
                                caap.makeActionsList();
                                var ht = '',
                                    xt = '';

                                for (xt in caap.masterActionList) {
                                    if (caap.masterActionList.hasOwnProperty(xt)) {
                                        ht += "<li id='caap_action_" + xt + "' class='" + (caap.masterActionList[xt] === 'idle' ? "ui-state-highlight" : "ui-state-default") + "'>" + caap.masterActionList[xt] + "</li>";
                                    }
                                }

                                $j("#caap_action_sortable", w).html(ht).sortable("refresh");
                            }
                        },
                        close     : function () {
                            w.dialog("destroy").remove();
                        }
                    });

                    $j("#caap_action_sortable", w).sortable({
                        containment: w,
                        placeholder: "ui-state-highlight"
                    }).disableSelection();
                }

                return w;
            } catch (err) {
                $u.error("ERROR in caap.actionDialog: " + err);
                return undefined;
            }
        },

        ///////////////////////////
        //       Extend jQuery
        ///////////////////////////
        jQueryExtend: function () {
            (function ($) {
                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                jQuery.fn['getPercent'] = jQuery.fn.getPercent = function (type) {
                    var t = [];
                    if (!type || type === 'width') {
                        t = this.attr("style").match(/width:\s*([\d\.]+)%/i);
                    } else if (!type || type === 'height') {
                        t = this.attr("style").match(/height:\s*([\d\.]+)%/i);
                    }

                    return (t && t.length >= 2 && t[1]) ? parseFloat(t[1]) : 0;
                };

                jQuery.fn['colorInput'] = jQuery.fn.colorInput = function (farb_callback, diag_callback) {
                    var t = this,
                        v = jQuery("<div id='" + t.attr("id") + "_diag'></div>").appendTo(document.body),
                        w,
                        x;

                    v.dialog({
                        title     : t.attr("id"),
                        resizable : false,
                        top       : t.offset().top + 'px',
                        left      : (window.innerWidth / 2) + 'px',
                        width     : 'auto',
                        height    : 'auto',
                        buttons   : {
                            "Ok": function () {
                                v.dialog("destroy").remove();
                                if (utility.isFunction(diag_callback)) {
                                    diag_callback(t.attr("id"), t.val());
                                }
                            }
                        },
                        close     : function () {
                            v.dialog("destroy").remove();
                            if (utility.isFunction(diag_callback)) {
                                diag_callback(t.attr("id"), 'close');
                            }
                        }
                    });

                    w = jQuery("<div id='" + t.attr("id") + "_farb'></div>").appendTo(v);
                    x = jQuery.farbtastic(w, function (c) {
                        c = c.toUpperCase();
                        w.css({
                            background : c,
                            color      : utility.bestTextColor(c)
                        });

                        t.css({
                            background: c,
                            color      : utility.bestTextColor(c)
                        });

                        t.val(c);
                        if (utility.isFunction(farb_callback)) {
                            farb_callback(c);
                        }
                    }).setColor(t.val());

                    return [v, w, x];
                };

                jQuery.fn['alert'] = jQuery.fn.alert = function (html) {
                    var w = jQuery('<div id="alert_' + new Date().getTime() + '" title="Alert!">' + (html ? html : '') + '</div>').appendTo(document.body);

                    w.dialog({
                        buttons: {
                            "Ok": function () {
                                w.dialog("destroy").remove();
                            }
                        }
                    });

                    return w;
                };
                /*jslint sub: false */
            }(jQuery));
        }
    };

    /* This section is added to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    window['caap'] = caap;
    caap['checkResults_index'] = caap.checkResults_index;
    caap['checkResults_fightList'] = caap.checkResults_fightList;
    caap['checkResults_viewFight'] = caap.checkResults_viewFight;
    caap['checkResults_fightList'] = caap.checkResults_fightList;
    caap['checkResults_viewFight'] = caap.checkResults_viewFight;
    caap['checkResults_land'] = caap.checkResults_land;
    caap['checkResults_generals'] = caap.checkResults_generals;
    caap['checkResults_quests'] = caap.checkResults_quests;
    caap['checkResults_gift_accept'] = caap.checkResults_gift_accept;
    caap['checkResults_army'] = caap.checkResults_army;
    caap['checkResults_keep'] = caap.checkResults_keep;
    caap['checkResults_oracle'] = caap.checkResults_oracle;
    caap['checkResults_alchemy'] = caap.checkResults_alchemy;
    caap['checkResults_battlerank'] = caap.checkResults_battlerank;
    caap['checkResults_war_rank'] = caap.checkResults_war_rank;
    caap['checkResults_achievements'] = caap.checkResults_achievements;
    caap['checkResults_battle'] = caap.checkResults_battle;
    caap['checkResults_soldiers'] = caap.checkResults_soldiers;
    caap['checkResults_item'] = caap.checkResults_item;
    caap['checkResults_magic'] = caap.checkResults_magic;
    caap['checkResults_gift'] = caap.checkResults_gift;
    caap['checkResults_goblin_emp'] = caap.checkResults_goblin_emp;
    caap['checkResults_view_class_progress'] = caap.checkResults_view_class_progress;
    caap['checkResults_guild'] = caap.checkResults_guild;
    caap['checkResults_guild_current_battles'] = caap.checkResults_guild_current_battles;
    caap['checkResults_guild_current_monster_battles'] = caap.checkResults_guild_current_monster_battles;
    caap['checkResults_guild_battle_monster'] = caap.checkResults_guild_battle_monster;
    //caap['checkResults_arena'] = caap.checkResults_arena;
    //caap['checkResults_arena_battle'] = caap.checkResults_arena_battle;
    caap['autoElite'] = caap.autoElite;
    caap['heal'] = caap.heal;
    caap['immediateBanking'] = caap.immediateBanking;
    caap['immediateAutoStat'] = caap.immediateAutoStat;
    caap['maxEnergyQuest'] = caap.maxEnergyQuest;
    caap['monsterReview'] = caap.monsterReview;
    caap['guildMonsterReview'] = caap.guildMonsterReview;
    caap['guildMonster'] = caap.guildMonster;
    caap['demiPoints'] = caap.demiPoints;
    caap['monsters'] = caap.monsters;
    caap['battle'] = caap.battle;
    caap['quests'] = caap.quests;
    caap['bank'] = caap.bank;
    caap['passiveGeneral'] = caap.passiveGeneral;
    caap['lands'] = caap.lands;
    caap['autoBless'] = caap.autoBless;
    caap['autoStat'] = caap.autoStat;
    caap['autoGift'] = caap.autoGift;
    caap['autoPotions'] = caap.autoPotions;
    caap['autoAlchemy'] = caap.autoAlchemy;
    caap['idle'] = caap.idle;
    caap['autoIncome'] = caap.autoIncome;
    //caap['arena'] = caap.arena;
    //caap['arenaReview'] = caap.arenaReview;
    /*jslint sub: false */
