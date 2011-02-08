
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
        appBodyDiv          : {},
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
            $u.set_log_version(caapVersion + (devVersion ? 'd' + devVersion : ''));
            $u.log(1, 'DOM load completed');
            window.clearTimeout(caap_timeout);
            if (window.location.href.hasIndexOf('apps.facebook.com/castle_age/')) {
                caap.domain.which = 0;
            } else if (window.location.href.hasIndexOf('apps.facebook.com/reqs.php#confirm_46755028429_0')) {
                caap.domain.which = 1;
            } else if (window.location.href.hasIndexOf('web3.castleagegame.com/castle_ws/')) {
                caap.domain.which = 2;
            } else {
                caap.ErrorCheck();
                $u.error('Unknown domain!');
                return;
            }

            if (window.location.href.hasIndexOf('http://')) {
                caap.domain.ptype = 0;
            } else if (window.location.href.hasIndexOf('https://')) {
                caap.domain.ptype = 1;
            } else {
                $u.warn('Unknown protocol! Using default.', caap.domain.protocol[caap.domain.ptype]);
            }

            caap.domain.link = caap.domain.protocol[caap.domain.ptype] + caap.domain.url[caap.domain.which];
            $u.log(1, 'Domain', caap.domain.which, caap.domain.protocol[caap.domain.ptype], caap.domain.url[caap.domain.which]);
            caap.documentTitle = document.title;
            caap.jQueryExtend();
            gm = new $u.storage({'namespace': 'caap'});
            ss = new $u.storage({'namespace': 'caap', 'storage_type': 'sessionStorage'});

            var FBID      = 0,
                idOk      = false,
                tempText  = '',
                accountEl = $j();

            function mainCaapLoop() {
                caap.waitMilliSecs = 8000;
                caap.WaitMainLoop();
                caap.ReloadOccasionally();
            }

            gm.clear('0');
            if (caap.ErrorCheck()) {
                mainCaapLoop();
                return;
            }

            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            if (caap.domain.which >= 0 && caap.domain.which < 2) {
                accountEl = $j('#navAccountName');
                if (accountEl && accountEl.length) {
                    tempText = accountEl.attr('href');
                    FBID = tempText ? tempText.regex(/id=(\d+)/i) : 0;
                    if ($u.isNumber(FBID) && FBID > 0) {
                        caap.stats['FBID'] = FBID;
                        idOk = true;
                    }
                }

                if (!idOk) {
                    tempText = $j('script').text();
                    if (tempText) {
                        FBID = tempText.regex(new RegExp('user:(\\d+),', 'i'));
                        if ($u.isNumber(FBID) && FBID > 0) {
                            caap.stats['FBID'] = FBID;
                            idOk = true;
                        } else {
                            FBID = tempText.regex(new RegExp('."user.":(\\d+),', 'i'));
                            if ($u.isNumber(FBID) && FBID > 0) {
                                caap.stats['FBID'] = FBID;
                                idOk = true;
                            }
                        }
                    }

                    if (!idOk) {
                        FBID = window.presence.user ? window.presence.user.parseInt() : 0;
                        if ($u.isNumber(FBID) && FBID > 0) {
                            caap.stats['FBID'] = FBID;
                            idOk = true;
                        }
                    }
                }
            } else {
                accountEl = $j("img[src*='graph.facebook.com']");
                tempText = accountEl.attr("src");
                FBID = $u.hasContent(tempText) ? tempText.regex(new RegExp("facebook.com\\/(\\d+)\\/")) : 0;
                if ($u.isNumber(FBID) && FBID > 0) {
                    caap.stats['FBID'] = FBID;
                    idOk = true;
                }
            }
            /*jslint sub: false */

            if (!idOk) {
                // Force reload without retrying
                $u.error('No Facebook UserID!!! Reloading ...', FBID, window.location.href);
                $u.reload();
                return;
            }

            gm.set_storage_id(FBID.toString());
            ss.set_storage_id(FBID.toString());
            config.load();
            $u.set_log_level(config.getItem('DebugLevel', $u.get_log_level()));
            css.AddCSS();
            caap.lsUsed();
            schedule.load();
            state.load();
            caap.LoadStats(FBID, $u.setContent(accountEl.text(), ''));
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

        IncrementPageLoadCounter: function () {
            try {
                caap.pageLoadCounter += 1;
                $u.log(4, "pageLoadCounter", caap.pageLoadCounter);
                return caap.pageLoadCounter;
            } catch (err) {
                $u.error("ERROR in IncrementPageLoadCounter: " + err);
                return undefined;
            }
        },

        releaseUpdate: function () {
            try {
                if (state.getItem('SUC_remote_version', 0) > caapVersion) {
                    caap.newVersionAvailable = true;
                }

                // update script from: http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js
                function updateCheck(forced) {
                    if (forced || schedule.check('SUC_last_update')) {
                        try {
                            GM_xmlhttpRequest({
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
                $u.error("ERROR in release updater: " + err);
            }
        },

        devUpdate: function () {
            try {
                if (state.getItem('SUC_remote_version', 0) > caapVersion || (state.getItem('SUC_remote_version', 0) >= caapVersion && state.getItem('DEV_remote_version', 0) > devVersion)) {
                    caap.newVersionAvailable = true;
                }

                // update script from: http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js
                function updateCheck(forced) {
                    if (forced || schedule.check('SUC_last_update')) {
                        try {
                            GM_xmlhttpRequest({
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
                $u.error("ERROR in development updater: " + err);
            }
        },

        init: function () {
            try {
                if (caap.domain.which === 2) {
                    caap.controlXY.selector = "#globalcss";
                    caap.dashboardXY.selector = "#app_body_container";
                }

                state.setItem(caap.friendListType.gifta.name + 'Requested', false);
                state.setItem(caap.friendListType.giftc.name + 'Requested', false);
                state.setItem(caap.friendListType.facebook.name + 'Requested', false);
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

                // Can create a blank space above the game to host the dashboard if wanted.
                // Dashboard currently uses '185px'
                var shiftDown = gm.getItem('ShiftDown', '', hiddenVar);
                if ($u.hasContent(shiftDown)) {
                    $j(caap.controlXY.selector).css('padding-top', shiftDown);
                }

                general.load();
                monster.load();
                guild_monster.load();
                arena.load();
                battle.load();
                caap.LoadDemi();
                caap.LoadRecon();
                town.load('soldiers');
                town.load('item');
                town.load('magic');
                army.init();
                spreadsheet.load();
                caap.AddControl();
                caap.AddDashboard();
                caap.AddListeners();
                caap.AddDBListener();
                caap.CheckResults();
                caap.AutoStatCheck();
                caap.bestLand = new caap.landRecord().data;
                caap.sellLand = {};
                //schedule.deleteItem("army_member");
                //schedule.deleteItem("ArenaReview")

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

        VisitUrl: function (url, loadWaitTime) {
            try {
                if (!$u.hasContent(url)) {
                    throw 'No url passed to VisitUrl';
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
                $u.error("ERROR in caap.VisitUrl: " + err);
                return false;
            }
        },

        Click: function (obj, loadWaitTime) {
            try {
                if (!$u.hasContent(obj)) {
                    throw 'Null object passed to Click';
                }

                if (caap.waitingForDomLoad === false) {
                    schedule.setItem('clickedOnSomething', 0);
                    caap.waitingForDomLoad = true;
                }

                caap.waitMilliSecs = $u.setContent(loadWaitTime, caap.waitTime);
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
                $u.error("ERROR in caap.Click: " + err);
                return undefined;
            }
        },

        ClickAjaxLinkSend: function (link, loadWaitTime) {
            try {
                if (!$u.hasContent(link)) {
                    throw 'No link passed to ClickAjaxLinkSend';
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
                $u.error("ERROR in caap.ClickAjaxLinkSend: " + err);
                return false;
            }
        },

        ClickGetCachedAjax: function (link, loadWaitTime) {
            try {
                if (!$u.hasContent(link)) {
                    throw 'No link passed to ClickGetCachedAjax';
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
                $u.error("ERROR in caap.ClickGetCachedAjax: " + err);
                return false;
            }
        },

        NavigateTo: function (pathToPage, imageOnPage) {
            try {
                var pathList  = [],
                    s         = 0,
                    a         = $j(),
                    imageTest = '',
                    img       = $j();

                if (!$u.hasContent(caap.globalContainer)) {
                    $u.warn('No content to Navigate to', imageOnPage, pathToPage);
                    return false;
                }

                if ($u.hasContent(imageOnPage) && caap.HasImage(imageOnPage)) {
                    return false;
                }

                pathList = $u.hasContent(pathToPage) ? pathToPage.split(",") : [];
                for (s = pathList.length - 1; s >= 0; s -= 1) {
                    a = $j("a[href*='" + pathList[s] + ".php']").not("a[href*='" + pathList[s] + ".php?']", caap.globalContainer);
                    if ($u.hasContent(a)) {
                        $u.log(2, 'Go to', pathList[s]);
                        caap.Click(a);
                        return true;
                    }

                    imageTest = $u.setContent(pathList[s], '');
                    imageTest = imageTest.hasIndexOf(".") ? imageTest : imageTest + '.';
                    img = $u.hasContent(imageTest) ? caap.CheckForImage(imageTest) : img;
                    if ($u.hasContent(img)) {
                        $u.log(2, 'Click on image', img.attr("src").regex(/([\w.]+$)/));
                        caap.Click(img);
                        return true;
                    }
                }

                $u.warn('Unable to Navigate to', imageOnPage, pathToPage);
                return false;
            } catch (err) {
                $u.error("ERROR in caap.NavigateTo: " + err, imageOnPage, pathToPage);
                return undefined;
            }
        },

        CheckForImage: function (image, webSlice, subDocument, nodeNum) {
            try {
                nodeNum = $u.isNumber(nodeNum) ? nodeNum : ($u.isNaN(nodeNum) ? 0 : nodeNum.parseInt());
                webSlice = $u.setContent(webSlice, ($u.isDefined(subDocument) && $u.isDefined(subDocument.body) ? subDocument.body : window.document.body));
                webSlice = webSlice.jquery ? webSlice : $j(webSlice);
                return $j("input[src*='" + image + "'],img[src*='" + image + "'],div[style*='" + image + "']", webSlice).eq(nodeNum);
            } catch (err) {
                $u.error("ERROR in caap.CheckForImage: " + err);
                return undefined;
            }
        },

        HasImage: function (image, webSlice, subDocument, nodeNum) {
            try {
                return $u.hasContent(caap.CheckForImage(image, webSlice, subDocument, nodeNum));
            } catch (err) {
                $u.error("ERROR in caap.HasImage: " + err);
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

        MakeDropDown: function (idName, dropDownList, instructions, formatParms, defaultValue, css) {
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

                title = instructions[item] ? " title='" + instructions[item] + "'" : '';
                css = css ? " style='" + css + "'" : '';
                formatParms = formatParms ? ' ' + formatParms : '';
                htmlCode = "<select class='caap_ff caap_fs caap_ww'" + id + css + title + formatParms + ">";
                htmlCode += "<option disabled='disabled' value='not selected'>Choose one</option>";
                for (item = 0; item < len; item += 1) {
                    htmlCode += "<option value='" + dropDownList[item] + "'" + (selectedItem === dropDownList[item] ? " selected='selected'" : '') + title + ">" + dropDownList[item] + "</option>";
                }

                htmlCode += "</select>";
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in MakeDropDown: " + err);
                return '';
            }
        },

        startTR: function (id, css) {
            try {
                id = id ? " id='" + id  + "'" : '';
                css = css ? " style='" + css + "'" : '';
                var cls = " class='caap_ff caap_fn caap_ww'";
                return "<div" + cls + id + css + ">";
            } catch (err) {
                $u.error("ERROR in startTR: " + err);
                return '';
            }
        },

        endTR: "</div>",

        MakeTD: function (text, indent, right, css) {
            try {
                css = css ? " style='" + css + "'" : '';
                var cls = " class='caap_ff caap_fn" + (indent ? " caap_in" : '') + (right ? " caap_tr" : '') + "'";
                return "<div" + cls + css + ">" + text + "</div>";
            } catch (err) {
                $u.error("ERROR in MakeTD: " + err);
                return '';
            }
        },

        MakeSlider: function (text, id, inst, defaultValue, indent) {
            try {
                var value = config.getItem(id, 'defaultValue'),
                    html = "<div class='caap_ff caap_fn caap_ww' id='caap_" + id + "'>";

                value = value !== 'defaultValue' ? value : config.setItem(id, $u.setContent(defaultValue, 1));
                html += '<div style="width: ' + (indent ? "42%;padding-left: 5%;" : "47%") + ';display: inline-block;">' + text + '</div>';
                html += "<div style='width: 45%;padding-right: 5%;display: inline-block;' id='caap_" + id + "_slider' title='" + inst + "'></div>";
                html += "</div>";

                return html;
            } catch (err) {
                $u.error("ERROR in MakeTD: " + err);
                return '';
            }
        },

        MakeSliderListener: function (id, min, max, step, defaultValue, opacity) {
            try {
                $j("#caap_" + id + "_slider", caap.caapDivObject).slider({
                    orientation: "horizontal",
                    range: "min",
                    min: min,
                    max: max,
                    step: step,
                    value: config.getItem(id, defaultValue),
                    slide: function (event, ui) {
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
                $u.error("ERROR in MakeTD: " + err);
                return false;
            }
        },

        MakeCheckBox: function (idName, defaultValue, instructions, css) {
            try {
                var id    = idName ? " id='caap_" + idName  + "'" : '',
                    title = instructions ? " title='" + instructions + "'" : '',
                    check = config.getItem(idName, 'defaultValue');

                check = check !== 'defaultValue' ? check : config.setItem(idName, $u.setContent(defaultValue, false));
                check = check ? " checked" : '';
                css = css ? " style='" + css + "'" : '';
                return "<input class='caap_ff caap_fn' type='checkbox'" + id + css + title + check + ' />';
            } catch (err) {
                $u.error("ERROR in MakeCheckBox: " + err);
                return '';
            }
        },

        MakeNumberForm: function (idName, instructions, initDefault, formatParms, subtype, css) {
            try {
                subtype = $u.setContent(subtype, 'number');
                var value = config.getItem(idName, 'defaultValue'),
                    stNum = subtype === 'number',
                    id    = idName ? " id='caap_" + idName + "'" : '',
                    title = instructions ? " title='" + instructions + "'" : '',
                    type  = stNum ? " type='text' min='0' step='1'" : " type='text'";

                css += subtype === 'color' ? 'background-color:' + value + '; color:' + $u.bestTextColor(value) + ';' : '';
                css = css ? " style='" + css + "'" : '';
                subtype = subtype ? " data-subtype='" + subtype + "'" : '';
                initDefault = stNum && $u.isNumber(initDefault) ? initDefault : (stNum && $u.hasContent(initDefault) && $u.isString(initDefault) && !$u.isNaN(initDefault) ? initDefault.parseFloat() : (!stNum && $u.isString(initDefault) ? initDefault : ''));
                if (stNum && $u.hasContent(initDefault) && $u.isNaN(initDefault)) {
                    $u.warn("MakeNumberForm - default value is not a number!", idName, initDefault);
                }

                value = value !== 'defaultValue' ? value : config.setItem(idName, initDefault);
                formatParms = $u.setContent(formatParms, '');
                return "<input class='caap_ff caap_fs caap_tr caap_ww'" + type + subtype + id + css + formatParms + title + " value='" + value + "' />";
            } catch (err) {
                $u.error("ERROR in MakeNumberForm: " + err);
                return '';
            }
        },

        MakeCheckTR: function (text, idName, defaultValue, instructions, indent, right, css) {
            try {
                var htmlCode = '';
                htmlCode = caap.startTR();
                htmlCode += caap.MakeTD(text, indent, right, "width: " + (indent ? 85 : 90) + "%; display: inline-block;");
                htmlCode += caap.MakeTD(caap.MakeCheckBox(idName, defaultValue, instructions, css), false, true, "width: 10%; display: inline-block;");
                htmlCode += caap.endTR;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in MakeCheckTR: " + err);
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

        MakeNumberFormTR: function (text, idName, instructions, initDefault, formatParms, subtype, indent, right, width) {
            try {
                indent = $u.setContent(indent, false);
                right = $u.setContent(right, false);
                width = $u.setContent(width, 30);
                var htmlCode = '';
                htmlCode = caap.startTR();
                htmlCode += caap.MakeTD(text, indent, right, "width: " + (indent ? 92 - width : 97 - width) + "%; display: inline-block;");
                htmlCode += caap.MakeTD(caap.MakeNumberForm(idName, instructions, initDefault, formatParms, subtype, ''), false, true, "width: " + width + "%; display: inline-block;");
                htmlCode += caap.endTR;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in MakeNumberFormTR: " + err);
                return '';
            }
        },

        MakeDropDownTR: function (text, idName, dropDownList, instructions, formatParms, defaultValue, indent, right, width, css) {
            try {
                var htmlCode = '';
                htmlCode = caap.startTR();
                htmlCode += caap.MakeTD(text, indent, right, "width: " + (indent ? 95 - width : 100 - width) + "%; display: inline-block;");
                htmlCode += caap.MakeTD(caap.MakeDropDown(idName, dropDownList, instructions, formatParms, defaultValue, css), false, true, "width: " + width + "%; display: inline-block;");
                htmlCode += caap.endTR;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in MakeDropDownTR: " + err);
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

                toggleCode = '<a style=\"font-weight: bold;' + style + '\" id="caap_Switch_' + controlId + '" href="javascript:;" style="text-decoration: none;"> ';
                toggleCode += displayChar + ' ' + staticText + '</a><br />' + "<div id='caap_" + controlId + "' style='display: " + currentDisplay + ";'>";
                return toggleCode;
            } catch (err) {
                $u.error("ERROR in startToggle: " + err);
                return '';
            }
        },

        endToggle: "<hr /></div>",

        MakeTextBox: function (idName, instructions, initDefault) {
            try {
                initDefault = $u.setContent(initDefault, '');
                var style = "font-family: 'lucida grande', tahoma, verdana, arial, sans-serif; font-size: 11px;",
                    value = config.getItem(idName, 'defaultValue');

                value = value === 'defaultValue' ? config.setItem(idName, initDefault) : value;
                return "<textarea style=\"" + style + "\" title=" + '"' + instructions + '"' + " type='text' id='caap_" + idName + "' " + ($u.is_chrome ? " rows='3' cols='25'" : " rows='3' cols='21'") + ">" + value + "</textarea>";
            } catch (err) {
                $u.error("ERROR in MakeTextBox: " + err);
                return '';
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        SetDivContent: function (idName, mess) {
            try {
                if (config.getItem('SetTitle', false) && idName === "activity_mess") {
                    var DocumentTitle = config.getItem('SetTitleAction', false) ? mess.replace("Activity: ", '') + " - " : '';
                    DocumentTitle += config.getItem('SetTitleName', false) ? caap.stats['PlayerName'] + " - " : '';
                    document.title = DocumentTitle + caap.documentTitle;
                }

                $j('#caap_' + idName, caap.caapDivObject).html(mess);
            } catch (err) {
                $u.error("ERROR in SetDivContent: " + err);
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
            'Water II'
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

        SelectDropOption: function (idName, value) {
            try {
                $j("#caap_" + idName + " option", caap.caapDivObject).removeAttr('selected');
                $j("#caap_" + idName + " option[value='" + value + "']", caap.caapDivObject).attr('selected', 'selected');
                return true;
            } catch (err) {
                $u.error("ERROR in SelectDropOption: " + err);
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
                if (!$u.isString(id) || !$u.hasContent(value)) {
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
        ShowAutoQuest: function () {
            try {
                $j("#stopAutoQuest", caap.caapDivObject).text("Stop auto quest: " + state.getItem('AutoQuest', caap.newAutoQuest())['name'] + " (energy: " + state.getItem('AutoQuest', caap.newAutoQuest())['energy'] + ")").css('display', 'block');
                return true;
            } catch (err) {
                $u.error("ERROR in ShowAutoQuest: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        ClearAutoQuest: function () {
            try {
                $j("#stopAutoQuest", caap.caapDivObject).text("").css('display', 'none');
                return true;
            } catch (err) {
                $u.error("ERROR in ClearAutoQuest: " + err);
                return false;
            }
        },

        ManualAutoQuest: function (AutoQuest) {
            try {
                state.setItem('AutoQuest', $u.setContent(AutoQuest, caap.newAutoQuest()));
                caap.SelectDropOption('WhyQuest', config.setItem('WhyQuest', 'Manual'));
                caap.ClearAutoQuest();
                return true;
            } catch (err) {
                $u.error("ERROR in ManualAutoQuest: " + err);
                return false;
            }
        },

        ChangeDropDownList: function (idName, dropList, option) {
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
                $u.error("ERROR in ChangeDropDownList: " + err);
                return false;
            }
        },

        controlXY: {
            selector : '.UIStandardFrame_Content',
            x        : 0,
            y        : 0
        },

        GetControlXY: function (reset) {
            try {
                return {
                    y: reset ? $j(caap.controlXY.selector).offset().top : caap.controlXY.y,
                    x: caap.controlXY.x === '' || reset ? $j(caap.controlXY.selector).offset().left + $j(caap.controlXY.selector).width() + 10 : $j(caap.controlXY.selector).offset().left + caap.controlXY.x
                };
            } catch (err) {
                $u.error("ERROR in GetControlXY: " + err);
                return {x: 0, y: 0};
            }
        },

        SaveControlXY: function () {
            try {
                state.setItem('caap_div_menuTop', caap.caapDivObject.offset().top);
                state.setItem('caap_div_menuLeft', caap.caapDivObject.offset().left - $j(caap.controlXY.selector).offset().left);
                state.setItem('caap_top_zIndex', '1');
                state.setItem('caap_div_zIndex', '2');
            } catch (err) {
                $u.error("ERROR in SaveControlXY: " + err);
            }
        },

        dashboardXY: {
            selector : '#app46755028429_app_body_container',
            x        : 0,
            y        : 0
        },

        GetDashboardXY: function (reset) {
            try {
                return {
                    y: reset ? $j(caap.dashboardXY.selector).offset().top - 10 : caap.dashboardXY.y,
                    x: caap.dashboardXY.x === '' || reset ? $j(caap.dashboardXY.selector).offset().left : $j(caap.dashboardXY.selector).offset().left + caap.dashboardXY.x
                };
            } catch (err) {
                $u.error("ERROR in GetDashboardXY: " + err);
                return {x: 0, y: 0};
            }
        },

        SaveDashboardXY: function () {
            try {
                state.setItem('caap_top_menuTop', caap.caapTopObject.offset().top);
                state.setItem('caap_top_menuLeft', caap.caapTopObject.offset().left - $j(caap.dashboardXY.selector).offset().left);
                state.setItem('caap_div_zIndex', '1');
                state.setItem('caap_top_zIndex', '2');
            } catch (err) {
                $u.error("ERROR in SaveDashboardXY: " + err);
            }
        },

        AddControl: function () {
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
                        'arena_mess',
                        'fortify_mess',
                        'heal_mess',
                        'demipoint_mess',
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

                //caapDiv += '<applet code="http://castle-age-auto-player.googlecode.com/files/localfile.class" archive="http://castle-age-auto-player.googlecode.com/files/localfile.jar" width="10" height="10"></applet>';

                caapDiv += "</div>";
                caap.controlXY.x = state.getItem('caap_div_menuLeft', '');
                caap.controlXY.y = state.getItem('caap_div_menuTop', $j(caap.controlXY.selector).offset().top);
                styleXY = caap.GetControlXY();
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

                banner += "<div id='caap_BannerHide' style='display: " + (config.getItem('BannerDisplay', true) ? 'block' : 'none') + "'>";
                banner += "<img src='data:image/png;base64," + image64.header + "' alt='Castle Age Auto Player' /><br /><hr /></div>";
                caap.SetDivContent('banner', banner);

                htmlCode += caap.AddPauseMenu();
                htmlCode += caap.AddDisableMenu();
                htmlCode += caap.AddCashHealthMenu();
                htmlCode += caap.AddQuestMenu();
                htmlCode += caap.AddBattleMenu();
                htmlCode += caap.AddMonsterMenu();
                htmlCode += caap.AddGuildMonstersMenu();
                htmlCode += caap.AddArenaMenu();
                htmlCode += caap.AddReconMenu();
                htmlCode += caap.AddGeneralsMenu();
                htmlCode += caap.AddSkillPointsMenu();
                htmlCode += caap.AddEliteGuardOptionsMenu();
                htmlCode += caap.AddArmyOptionsMenu();
                htmlCode += caap.AddGiftingOptionsMenu();
                htmlCode += caap.AddAutoOptionsMenu();
                htmlCode += caap.AddOtherOptionsMenu();
                htmlCode += caap.AddFooterMenu();

                caap.SetDivContent('control', htmlCode);

                caap.CheckLastAction(state.getItem('LastAction', 'Idle'));
                $j("input[type='button']", caap.caapDivObject).button();
                caap.MakeSliderListener("CustStyleOpacityLight", 0.5, 1, 0.01, 1, true);
                caap.MakeSliderListener("CustStyleOpacityDark", 0.5, 1, 0.01, 1, true);
                return true;
            } catch (err) {
                $u.error("ERROR in AddControl: " + err);
                return false;
            }
        },

        AddPauseMenu: function () {
            try {
                return "<div id='caapPaused' style='font-weight: bold; display: " + state.getItem('caapPause', 'block') + "'>Paused on mouse click.<br /><a href='javascript:;' id='caapRestart' >Click here to restart</a></div><hr />";
            } catch (err) {
                $u.error("ERROR in AddPauseMenu: " + err);
                return '';
            }
        },

        AddDisableMenu: function () {
            try {
                var autoRunInstructions = "Disable auto running of CAAP. Stays persistent even on page reload and the autoplayer will not autoplay.",
                    htmlCode = '';

                htmlCode += caap.MakeCheckTR("Disable Autoplayer", 'Disabled', false, autoRunInstructions);
                htmlCode += '<hr />';
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddDisableMenu: " + err);
                return '';
            }
        },

        AddCashHealthMenu: function () {
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
                htmlCode += caap.MakeCheckTR("Bank Immediately", 'BankImmed', false, bankImmedInstructions);
                htmlCode += caap.MakeCheckTR("Auto Buy Lands", 'autoBuyLand', false, autobuyInstructions);
                htmlCode += caap.MakeCheckTR("Auto Sell Excess Lands", 'SellLands', false, autosellInstructions);
                htmlCode += caap.MakeNumberFormTR("Keep In Bank", 'minInStore', bankInstructions0, 100000, '', '', false, false, 62);
                htmlCode += caap.MakeNumberFormTR("Bank Above", 'MaxInCash', bankInstructions2, '', '', '', false, false, 40);
                htmlCode += caap.MakeNumberFormTR("But Keep On Hand", 'MinInCash', bankInstructions1, '', '', '', true, false, 40);
                htmlCode += caap.MakeNumberFormTR("Heal If Health Below", 'MinToHeal', healthInstructions, '', '', '');
                htmlCode += caap.MakeNumberFormTR("Not If Stamina Below", 'MinStamToHeal', healthStamInstructions, '', '', '', true, false);
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddCashHealthMenu: " + err);
                return '';
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        AddQuestMenu: function () {
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
                htmlCode += caap.MakeDropDownTR("Quest When", 'WhenQuest', questWhenList, questWhenInst, '', 'Never', false, false, 62);
                htmlCode += caap.startDropHide('WhenQuest', '', 'Never', true);
                htmlCode += caap.startDropHide('WhenQuest', 'XEnergy', 'At X Energy', false);
                htmlCode += caap.MakeNumberFormTR("Start At Or Above", 'XQuestEnergy', XQuestInstructions, 1, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Stop At Or Below", 'XMinQuestEnergy', XMinQuestInstructions, 0, '', '', true, false);
                htmlCode += caap.endDropHide('WhenQuest', 'XEnergy');
                htmlCode += caap.MakeDropDownTR("Quest Area", 'QuestArea', questAreaList, '', '', '', false, false, 62);
                switch (config.getItem('QuestArea', questAreaList[0])) {
                case 'Quest':
                    htmlCode += caap.MakeDropDownTR("Sub Area", 'QuestSubArea', caap.landQuestList, '', '', '', false, false, 62);
                    break;
                case 'Demi Quests':
                    htmlCode += caap.MakeDropDownTR("Sub Area", 'QuestSubArea', caap.demiQuestList, '', '', '', false, false, 62);
                    break;
                default:
                    htmlCode += caap.MakeDropDownTR("Sub Area", 'QuestSubArea', caap.atlantisQuestList, '', '', '', false, false, 62);
                    break;
                }

                htmlCode += caap.MakeDropDownTR("Quest For", 'WhyQuest', questForList, questForListInstructions, '', '', false, false, 62);
                htmlCode += caap.MakeCheckTR("Switch Quest Area", 'switchQuestArea', true, 'Allows switching quest area after Advancement or Max Influence');
                htmlCode += caap.MakeCheckTR("Use Only Subquest General", 'ForceSubGeneral', false, forceSubGen);
                htmlCode += caap.MakeCheckTR("Quest For Orbs", 'GetOrbs', false, 'Perform the Boss quest in the selected land for orbs you do not have.');
                htmlCode += "<a id='stopAutoQuest' style='display: " + (autoQuestName ? "block" : "none") + "' href='javascript:;' title='" + stopInstructions + "'>";
                htmlCode += (autoQuestName ? "Stop auto quest: " + autoQuestName + " (energy: " + state.getItem('AutoQuest', caap.newAutoQuest())['energy'] + ")" : '');
                htmlCode += "</a>";
                htmlCode += caap.endDropHide('WhenQuest');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddQuestMenu: " + err);
                return '';
            }
        },
        /*jslint sub: false */

        AddBattleMenu: function () {
            try {
                var XBattleInstructions = "Start battling if stamina is above this points",
                    XMinBattleInstructions = "Don't battle if stamina is below this points",
                    safeHealthInstructions = "Wait until health is 13 instead of 10, prevents you killing yourself but leaves you unhidden for upto 15 minutes",
                    userIdInstructions = "User IDs(not user name).  Click with the " +
                        "right mouse button on the link to the users profile & copy link." +
                        "  Then paste it here and remove everything but the last numbers." +
                        " (ie. 123456789)",
                    chainBPInstructions = "Number of battle points won to initiate a chain attack. Specify 0 to always chain attack.",
                    chainGoldInstructions = "Amount of gold won to initiate a chain attack. Specify 0 to always chain attack.",
                    maxChainsInstructions = "Maximum number of chain hits after the initial attack.",
                    FMRankInstructions = "The lowest relative rank below yours that " +
                        "you are willing to spend your stamina on. Leave blank to attack " +
                        "any rank.",
                    FMARBaseInstructions = "This value sets the base for your army " +
                        "ratio calculation. It is basically a multiplier for the army " +
                        "size of a player at your equal level. A value of 1 means you " +
                        "will battle an opponent the same level as you with an army the " +
                        "same size as you or less. Default .5",
                    plusonekillsInstructions = "Force +1 kill scenario if 80% or more" +
                        " of targets are withn freshmeat settings. Note: Since Castle Age" +
                        " choses the target, selecting this option could result in a " +
                        "greater chance of loss.",
                    raidOrderInstructions = "List of search words that decide which " +
                        "raids to participate in first.  Use words in player name or in " +
                        "raid name. To specify max damage follow keyword with :max token " +
                        "and specifiy max damage values. Use 'k' and 'm' suffixes for " +
                        "thousand and million.",
                    ignorebattlelossInstructions = "Ignore battle losses and attack " +
                        "regardless.  This will also delete all battle loss records.",
                    battleList = [
                        'Stamina Available',
                        'At Max Stamina',
                        'At X Stamina',
                        'No Monster',
                        'Stay Hidden',
                        'Demi Points Only',
                        'Never'
                    ],
                    battleInst = [
                        'Stamina Available will battle whenever you have enough stamina',
                        'At Max Stamina will battle when stamina is at max and will burn down all stamina when able to level up',
                        'At X Stamina you can set maximum and minimum stamina to battle',
                        'No Monster will battle only when there are no active monster battles or if Get Demi Points First has been selected.',
                        'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET MONSTER TO "STAY HIDDEN" TO USE THIS FEATURE.',
                        'Demi Points Only will battle only when Daily Demi Points are required, can use in conjunction with Get Demi Points First.',
                        'Never - disables player battles'
                    ],
                    typeList = [
                        'Invade',
                        'Duel',
                        'War'
                    ],
                    typeInst = [
                        'Battle using Invade button',
                        'Battle using Duel button - no guarentee you will win though',
                        'War using Duel button - no guarentee you will win though'
                    ],
                    targetList = [
                        'Freshmeat',
                        'Userid List',
                        'Raid'
                    ],
                    targetInst = [
                        'Use settings to select a target from the Battle Page',
                        'Select target from the supplied list of userids',
                        'Raid Battles'
                    ],
                    dosiegeInstructions = "(EXPERIMENTAL) Turns on or off automatic siege assist for all raids only.",
                    collectRewardInstructions = "(EXPERIMENTAL) Automatically collect raid rewards.",
                    observeDemiFirstInstructions = "If you are setting Get demi Points First and No Attack If % Under in Monster then enabling this option " +
                        "will cause Demi Points Only to observe the Demi Points requested in the case where No Attack If % Under is triggered.",
                    htmlCode = '';

                htmlCode = caap.startToggle('Battling', 'BATTLE');
                htmlCode += caap.MakeDropDownTR("Battle When", 'WhenBattle', battleList, battleInst, '', 'Never', false, false, 62);
                htmlCode += caap.startDropHide('WhenBattle', '', 'Never', true);
                htmlCode += "<div id='caap_WhenBattleStayHidden_hide' style='color: red; font-weight: bold; display: ";
                htmlCode += (config.getItem('WhenBattle', 'Never') === 'Stay Hidden' && config.getItem('WhenMonster', 'Never') !== 'Stay Hidden' ? 'block' : 'none') + "'>";
                htmlCode += "Warning: Monster Not Set To 'Stay Hidden'";
                htmlCode += "</div>";
                htmlCode += caap.startDropHide('WhenBattle', 'XStamina', 'At X Stamina', false);
                htmlCode += caap.MakeNumberFormTR("Start At Or Above", 'XBattleStamina', XBattleInstructions, 1, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Stop At Or Below", 'XMinBattleStamina', XMinBattleInstructions, 0, '', '', true, false);
                htmlCode += caap.endDropHide('WhenBattle', 'XStamina');
                htmlCode += caap.startDropHide('WhenBattle', 'DemiOnly', 'Demi Points Only', false);
                htmlCode += caap.MakeCheckTR("Observe Get Demi Points First", 'observeDemiFirst', false, observeDemiFirstInstructions);
                htmlCode += caap.endDropHide('WhenBattle', 'DemiOnly');
                htmlCode += caap.MakeDropDownTR("Battle Type", 'BattleType', typeList, typeInst, '', '', false, false, 62);
                htmlCode += caap.MakeCheckTR("Wait For Safe Health", 'waitSafeHealth', false, safeHealthInstructions);
                htmlCode += caap.MakeCheckTR("Siege Weapon Assist Raids", 'raidDoSiege', true, dosiegeInstructions);
                htmlCode += caap.MakeCheckTR("Collect Raid Rewards", 'raidCollectReward', false, collectRewardInstructions);
                htmlCode += caap.MakeCheckTR("Clear Complete Raids", 'clearCompleteRaids', false, '');
                htmlCode += caap.MakeCheckTR("Ignore Battle Losses", 'IgnoreBattleLoss', false, ignorebattlelossInstructions);
                htmlCode += caap.MakeNumberFormTR("Chain Battle Points", 'ChainBP', chainBPInstructions, '', '');
                htmlCode += caap.MakeNumberFormTR("Chain Gold", 'ChainGold', chainGoldInstructions, '', '', '', false, false, 30);
                htmlCode += caap.MakeNumberFormTR("Max Chains", 'MaxChains', maxChainsInstructions, 4, '', '');
                htmlCode += caap.MakeDropDownTR("Target Type", 'TargetType', targetList, targetInst, '', '', false, false, 62);
                htmlCode += caap.startDropHide('TargetType', 'Freshmeat', 'Freshmeat', false);
                htmlCode += caap.MakeTD("Attack targets that are not:");
                htmlCode += caap.MakeNumberFormTR("Lower Than Rank Minus", 'FreshMeatMinRank', FMRankInstructions, '', '', '');
                htmlCode += caap.MakeNumberFormTR("Higher Than X*Army", 'FreshMeatARBase', FMARBaseInstructions, 0.5, '', '');
                htmlCode += caap.endDropHide('TargetType', 'Freshmeat');
                htmlCode += caap.startDropHide('TargetType', 'Raid', 'Raid', false);
                htmlCode += caap.MakeCheckTR("Attempt +1 Kills", 'PlusOneKills', false, plusonekillsInstructions);
                htmlCode += caap.MakeTD("Join Raids in this order <a href='http://senses.ws/caap/index.php?topic=1502.0' target='_blank' style='color: blue'>(INFO)</a>");
                htmlCode += caap.MakeTextBox('orderraid', raidOrderInstructions, '');
                htmlCode += caap.endDropHide('TargetType', 'Raid');
                htmlCode += caap.startDropHide('TargetType', 'UserId', 'Userid List', false);
                htmlCode += caap.MakeTextBox('BattleTargets', userIdInstructions, '');
                htmlCode += caap.endDropHide('TargetType', 'UserId');
                htmlCode += caap.endDropHide('WhenBattle');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddBattleMenu: " + err);
                return '';
            }
        },

        AddMonsterMenu: function () {
            try {
                var XMonsterInstructions = "Start attacking if stamina is above this points",
                    XMinMonsterInstructions = "Don't attack if stamina is below this points",
                    attackOrderInstructions = "List of search words that decide which monster to attack first. " +
                        "Use words in player name or in monster name. To specify max damage follow keyword with " +
                        ":max token and specifiy max damage values. Use 'k' and 'm' suffixes for thousand and million. " +
                        "To override achievement use the ach: token and specify damage values.",
                    fortifyInstructions = "Fortify if ship health is below this % (leave blank to disable)",
                    questFortifyInstructions = "Do Quests if ship health is above this % and quest mode is set to Not Fortify (leave blank to disable)",
                    stopAttackInstructions = "Don't attack if ship health is below this % (leave blank to disable)",
                    monsterachieveInstructions = "Check if monsters have reached achievement damage level first. Switch when achievement met.",
                    demiPointsFirstInstructions = "Don't attack monsters until you've gotten all your demi points from battling. Set 'Battle When' to 'No Monster'",
                    powerattackInstructions = "Use power attacks. Only do normal attacks if power attack not possible",
                    powerattackMaxInstructions = "Use maximum power attacks globally on Skaar, Genesis, Ragnarok, and Bahamut types. Only do normal power attacks if maximum power attack not possible",
                    powerfortifyMaxInstructions = "Use maximum power fortify globally. Only do normal fortify attacks if maximum power fortify not possible. " +
                        "Also includes other energy attacks, Strengthen, Deflect and Cripple. NOTE: Setting a high forty% can waste energy and no safety on other types.",
                    dosiegeInstructions = "Turns on or off automatic siege assist for all monsters only.",
                    useTacticsInstructions = "Use the Tactics attack method, on monsters that support it, instead of the normal attack. You must be level 50 or above.",
                    useTacticsThresholdInstructions = "If monster health falls below this percentage then use the regular attack buttons instead of tactics.",
                    collectRewardInstructions = "Automatically collect monster rewards.",
                    strengthenTo100Instructions = "Don't wait until the character class gets a bonus for strengthening but perform strengthening as soon as the energy is available.",
                    mbattleList = [
                        'Stamina Available',
                        'At Max Stamina',
                        'At X Stamina',
                        'Stay Hidden',
                        'Never'
                    ],
                    mbattleInst = [
                        'Stamina Available will attack whenever you have enough stamina',
                        'At Max Stamina will attack when stamina is at max and will burn down all stamina when able to level up',
                        'At X Stamina you can set maximum and minimum stamina to battle',
                        'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET BATTLE WHEN TO "STAY HIDDEN" TO USE THIS FEATURE.',
                        'Never - disables attacking monsters'
                    ],
                    monsterDelayInstructions = "Max random delay (in seconds) to battle monsters",
                    demiPoint = [
                        'Ambrosia',
                        'Malekus',
                        'Corvintheus',
                        'Aurora',
                        'Azeron'
                    ],
                    demiPtItem = 0,
                    subCode = '',
                    htmlCode = '';

                htmlCode += caap.startToggle('Monster', 'MONSTER');
                htmlCode += caap.MakeDropDownTR("Attack When", 'WhenMonster', mbattleList, mbattleInst, '', 'Never', false, false, 62);
                htmlCode += caap.startDropHide('WhenMonster', '', 'Never', true);
                htmlCode += "<div id='caap_WhenMonsterStayHidden_hide' style='color: red; font-weight: bold; display: ";
                htmlCode += (config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && config.getItem('WhenBattle', 'Never') !== 'Stay Hidden' ? 'block' : 'none') + "'>";
                htmlCode += "Warning: Battle Not Set To 'Stay Hidden'";
                htmlCode += "</div>";
                htmlCode += caap.startDropHide('WhenMonster', 'XStamina', 'At X Stamina', false);
                htmlCode += caap.MakeNumberFormTR("Start At Or Above", 'XMonsterStamina', XMonsterInstructions, 1, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Stop At Or Below", 'XMinMonsterStamina', XMinMonsterInstructions, 0, '', '', true, false);
                htmlCode += caap.endDropHide('WhenMonster', 'XStamina', 'At X Stamina', false);
                htmlCode += caap.MakeNumberFormTR("Monster delay secs", 'seedTime', monsterDelayInstructions, 300, '', '');
                htmlCode += caap.MakeCheckTR("Use Tactics", 'UseTactics', false, useTacticsInstructions);
                htmlCode += caap.startCheckHide('UseTactics');
                htmlCode += caap.MakeNumberFormTR("Health threshold", 'TacticsThreshold', useTacticsThresholdInstructions, 75, '', '', true, false);
                htmlCode += caap.endCheckHide('UseTactics');
                htmlCode += caap.MakeCheckTR("Power Attack Only", 'PowerAttack', true, powerattackInstructions);
                htmlCode += caap.startCheckHide('PowerAttack');
                htmlCode += caap.MakeCheckTR("Power Attack Max", 'PowerAttackMax', false, powerattackMaxInstructions, true);
                htmlCode += caap.endCheckHide('PowerAttack');
                htmlCode += caap.MakeCheckTR("Power Fortify Max", 'PowerFortifyMax', false, powerfortifyMaxInstructions);
                htmlCode += caap.MakeCheckTR("Siege Weapon Assist Monsters", 'monsterDoSiege', true, dosiegeInstructions);
                htmlCode += caap.MakeCheckTR("Collect Monster Rewards", 'monsterCollectReward', false, collectRewardInstructions);
                htmlCode += caap.MakeCheckTR("Clear Complete Monsters", 'clearCompleteMonsters', false, '');
                htmlCode += caap.MakeCheckTR("Achievement Mode", 'AchievementMode', true, monsterachieveInstructions);
                htmlCode += caap.MakeCheckTR("Get Demi Points First", 'DemiPointsFirst', false, demiPointsFirstInstructions);
                htmlCode += caap.startCheckHide('DemiPointsFirst');
                for (demiPtItem = 0; demiPtItem < demiPoint.length; demiPtItem += 1) {
                    subCode += "<span title='" + demiPoint[demiPtItem] + "'>";
                    subCode += "<img alt='" + demiPoint[demiPtItem] + "' src='data:image/jpg;base64," + image64[demiPoint[demiPtItem]] + "' height='15px' width='15px'/>";
                    subCode += caap.MakeCheckBox('DemiPoint' + demiPtItem, true);
                    subCode += "</span>";
                }

                htmlCode += caap.MakeTD(subCode, false, false, "white-space: nowrap;");
                htmlCode += caap.endCheckHide('DemiPointsFirst');
                htmlCode += caap.MakeNumberFormTR("Fortify If % Under", 'MaxToFortify', fortifyInstructions, 50, '', '');
                htmlCode += caap.MakeNumberFormTR("Quest If % Over", 'MaxHealthtoQuest', questFortifyInstructions, 60, '', '');
                htmlCode += caap.MakeNumberFormTR("No Attack If % Under", 'MinFortToAttack', stopAttackInstructions, 10, '', '');
                htmlCode += caap.MakeCheckTR("Don't Wait Until Strengthen", 'StrengthenTo100', true, strengthenTo100Instructions);
                htmlCode += caap.MakeTD("Attack Monsters in this order <a href='http://senses.ws/caap/index.php?topic=1502.0' target='_blank' style='color: blue'>(INFO)</a>");
                htmlCode += caap.MakeTextBox('orderbattle_monster', attackOrderInstructions, '', '');
                htmlCode += caap.endDropHide('WhenMonster');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddMonsterMenu: " + err);
                return '';
            }
        },

        AddGuildMonstersMenu: function () {
            try {
                // Guild Monster controls
                var mbattleList = [
                        'Stamina Available',
                        'At Max Stamina',
                        'At X Stamina',
                        'Never'
                    ],
                    mbattleInst = [
                        'Stamina Available will attack whenever you have enough stamina',
                        'At Max Stamina will attack when stamina is at max and will burn down all stamina when able to level up',
                        'At X Stamina you can set maximum and minimum stamina to battle',
                        'Never - disables attacking monsters'
                    ],
                    htmlCode = '';

                htmlCode += caap.startToggle('GuildMonsters', 'GUILD MONSTERS');
                htmlCode += caap.MakeDropDownTR("Attack When", 'WhenGuildMonster', mbattleList, mbattleInst, '', 'Never', false, false, 62);
                htmlCode += caap.startDropHide('WhenGuildMonster', '', 'Never', true);
                htmlCode += caap.startDropHide('WhenGuildMonster', 'XStamina', 'At X Stamina', false);
                htmlCode += caap.MakeNumberFormTR("Start At Or Above", 'MaxStaminaToGMonster', '', 0, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Stop At Or Below", 'MinStaminaToGMonster', '', 0, '', '', true, false);
                htmlCode += caap.endDropHide('WhenGuildMonster', 'XStamina');
                htmlCode += caap.MakeCheckTR('Classic Monsters First', 'doClassicMonstersFirst', false, 'Prioritise the classic monsters and raids before Guild Monsters.');
                htmlCode += caap.MakeCheckTR('Siege Monster', 'doGuildMonsterSiege', true, 'Perform siege assists when visiting your Guild Monster.');
                htmlCode += caap.MakeCheckTR('Collect Rewards', 'guildMonsterCollect', false, 'Collect the rewards of your completed Guild Monsters.');
                htmlCode += caap.MakeCheckTR("Don't Attack Clerics", 'ignoreClerics', false, "Do not attack Guild Monster's Clerics. Does not include the Gate minions e.g. Azriel");
                htmlCode += caap.MakeTD("Attack Gates");
                htmlCode += caap.MakeTD("N" + caap.MakeCheckBox('attackGateNorth', true), false, true, "display: inline-block; width: 25%;");
                htmlCode += caap.MakeTD("W" + caap.MakeCheckBox('attackGateWest', true), false, true, "display: inline-block; width: 25%;");
                htmlCode += caap.MakeTD("E" + caap.MakeCheckBox('attackGateEast', true), false, true, "display: inline-block; width: 25%;");
                htmlCode += caap.MakeTD("S" + caap.MakeCheckBox('attackGateSouth', true), false, true, "display: inline-block; width: 25%;");
                htmlCode += caap.MakeNumberFormTR("Ignore Below Health", 'XMinMonsterStamina', "Don't attack monster minions that have a health below this value.", 0, '', '');
                htmlCode += caap.MakeCheckTR('Choose First Alive', 'chooseIgnoredMinions', false, 'When the only selection left is the monster general then go back and attack any previously ignored monster minions.');
                htmlCode += caap.MakeTD("Attack Monsters in this order");
                htmlCode += caap.MakeTextBox('orderGuildMonster', 'Attack your guild monsters in this order, can use Slot Number and Name. Control is provided by using :ach and :max', '', '');
                htmlCode += caap.MakeTD("Attack Minions in this order");
                htmlCode += caap.MakeTextBox('orderGuildMinion', 'Attack your guild minions in this order. Uses the minion name.', '', '');
                htmlCode += caap.endDropHide('WhenGuildMonster');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddGuildMonstersMenu: " + err);
                return '';
            }
        },

        AddArenaMenu: function () {
            try {
                var mbattleList = [
                        'Tokens Available',
                        'Never'
                    ],
                    mbattleInst = [
                        'Tokens Available will attack whenever you have enough tokens',
                        'Never - disables attacking in Arena'
                    ],
                    chainList = [
                        '0',
                        '160',
                        '200',
                        '240'
                    ],
                    chainListInst = [
                        'Disabled',
                        'Chain 160 and above',
                        'Chain 200 and above',
                        'Chain 240 and above'
                    ],
                    htmlCode = '';

                htmlCode += caap.startToggle('Arena', 'ARENA');
                htmlCode += caap.MakeDropDownTR("Attack When", 'WhenArena', mbattleList, mbattleInst, '', 'Never', false, false, 62);
                htmlCode += caap.startDropHide('WhenArena', '', 'Never', true);
                htmlCode += caap.MakeTD("Attack Classes in this order");
                htmlCode += caap.MakeTextBox('orderArenaClass', 'Attack Arena class in this order. Uses the class name.', 'Cleric,Mage,Rogue,Warrior', '');
                htmlCode += caap.MakeNumberFormTR("Ignore Health &lt;=", 'ignoreArenaHealth', "Ignore enemies with health equal to or below this level.", 200, '', '');
                htmlCode += caap.MakeNumberFormTR("Ignore Level Plus &gt;=", 'maxArenaLevel', "This value is added the the value of your current level and enemies with a level above this value are ignored", 50, '', '');
                htmlCode += caap.MakeCheckTR("Stun All Clerics", 'killClericFirst', false, "Attack Clerics that are not stunned.");
                htmlCode += caap.MakeCheckTR("Do Polymorphed", 'doPoly', true, "Attack polymorphed players.");
                htmlCode += caap.startCheckHide('doPoly');
                htmlCode += caap.MakeCheckTR("Priority Polymorphed", 'attackPoly', false, "Attack polymorphed players first.", true);
                htmlCode += caap.MakeCheckTR("Attack Polymorphed If Rogue", 'roguePoly', true, "Only attack polymorphed players if you are class Rogue.", true);
                htmlCode += caap.MakeCheckTR("Stunned Ignore Polymorphed", 'stunnedPoly', true, "If you are stunned then don't attack polymorphed minions, leave them for someone who can do more damage.", true);
                htmlCode += caap.endCheckHide('doPoly');
                htmlCode += caap.MakeCheckTR("Suicide", 'attackSuicide', false, "When out of targets, attack active Rogues or Warriors to which you lost previously, before any class that's not stunned.");
                htmlCode += caap.MakeDropDownTR("Chain", 'chainArena', chainList, chainListInst, '', '160', false, false, 35);
                htmlCode += caap.startDropHide('chainArena', '', '0', true);
                htmlCode += caap.MakeCheckTR("Chain Observe Health", 'observeHealth', true, "When chaining, observe the 'Ignore Health' and 'Stun All Clerics' options.");
                htmlCode += caap.endDropHide('chainArena');
                htmlCode += caap.endDropHide('WhenArena');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddArenaMenu: " + err);
                return '';
            }
        },

        AddReconMenu: function () {
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
                htmlCode += caap.MakeCheckTR("Enable Player Recon", 'DoPlayerRecon', false, PReconInstructions);
                htmlCode += caap.startCheckHide('DoPlayerRecon');
                htmlCode += caap.MakeNumberFormTR("Limit Target Records", 'LimitTargets', "Maximum number of records to hold.", 100, '', '');
                htmlCode += caap.MakeTD('Find battle targets that are:');
                htmlCode += caap.MakeNumberFormTR("Not Lower Than Rank Minus", 'ReconPlayerRank', PRRankInstructions, 3, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Not Higher Than Level Plus", 'ReconPlayerLevel', PRLevelInstructions, 10, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Not Higher Than X*Army", 'ReconPlayerARBase', PRARBaseInstructions, 1, '', '', true, false);
                htmlCode += caap.endCheckHide('DoPlayerRecon');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddReconMenu: " + err);
                return '';
            }
        },

        AddGeneralsMenu: function () {
            try {
                // Add General Comboboxes
                var reverseGenInstructions = "This will make the script level Generals under level 4 from Top-down instead of Bottom-up",
                    ignoreGeneralImage = "This will prevent the script " +
                        "from changing your selected General to 'Use Current' if the script " +
                        "is unable to find the General's image when changing activities. " +
                        "Instead it will use the current General for the activity and try " +
                        "to select the correct General again next time.",
                    LevelUpGenExpInstructions = "Specify the number of experience " +
                        "points below the next level up to begin using the level up general.",
                    LevelUpGenInstructions1 = "Use the Level Up General for Idle mode.",
                    LevelUpGenInstructions2 = "Use the Level Up General for Monster mode.",
                    LevelUpGenInstructions3 = "Use the Level Up General for Fortify mode.",
                    LevelUpGenInstructions4 = "Use the Level Up General for Invade mode.",
                    LevelUpGenInstructions5 = "Use the Level Up General for Duel mode.",
                    LevelUpGenInstructions6 = "Use the Level Up General for War mode.",
                    LevelUpGenInstructions7 = "Use the Level Up General for doing sub-quests.",
                    LevelUpGenInstructions8 = "Use the Level Up General for doing primary quests " +
                        "(Warning: May cause you not to gain influence if wrong general is equipped.)",
                    LevelUpGenInstructions9 = "Ignore Banking until level up energy and stamina gains have been used.",
                    LevelUpGenInstructions10 = "Ignore Income until level up energy and stamina gains have been used.",
                    LevelUpGenInstructions11 = "EXPERIMENTAL: Enables the Quest 'Not Fortifying' mode after level up.",
                    LevelUpGenInstructions12 = "Use the Level Up General for Guild Monster mode.",
                    LevelUpGenInstructions13 = "Use the Level Up General for Arena mode.",
                    dropDownItem = 0,
                    htmlCode = '';

                htmlCode += caap.startToggle('Generals', 'GENERALS');
                htmlCode += caap.MakeCheckTR("Do not reset General", 'ignoreGeneralImage', true, ignoreGeneralImage);
                for (dropDownItem = 0; dropDownItem < general.StandardList.length; dropDownItem += 1) {
                    htmlCode += caap.MakeDropDownTR(general.StandardList[dropDownItem], general.StandardList[dropDownItem] + 'General', general.List, '', '', 'Use Current', false, false, 62);
                }

                htmlCode += caap.MakeDropDownTR("Buy", 'BuyGeneral', general.BuyList, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.MakeDropDownTR("Collect", 'CollectGeneral', general.CollectList, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.MakeDropDownTR("Income", 'IncomeGeneral', general.IncomeList, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.MakeDropDownTR("Banking", 'BankingGeneral', general.BankingList, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.MakeDropDownTR("Level Up", 'LevelUpGeneral', general.List, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.startDropHide('LevelUpGeneral', '', 'Use Current', true);
                htmlCode += caap.MakeNumberFormTR("Exp To Use Gen", 'LevelUpGeneralExp', LevelUpGenExpInstructions, 20, '', '', true, false);
                htmlCode += caap.MakeCheckTR("Gen For Idle", 'IdleLevelUpGeneral', true, LevelUpGenInstructions1, true, false);
                htmlCode += caap.MakeCheckTR("Gen For Monsters", 'MonsterLevelUpGeneral', true, LevelUpGenInstructions2, true, false);
                htmlCode += caap.MakeCheckTR("Gen For Guild Monsters", 'GuildMonsterLevelUpGeneral', true, LevelUpGenInstructions12, true, false);
                htmlCode += caap.MakeCheckTR("Gen For Fortify", 'FortifyLevelUpGeneral', true, LevelUpGenInstructions3, true, false);
                htmlCode += caap.MakeCheckTR("Gen For Invades", 'InvadeLevelUpGeneral', true, LevelUpGenInstructions4, true, false);
                htmlCode += caap.MakeCheckTR("Gen For Duels", 'DuelLevelUpGeneral', true, LevelUpGenInstructions5, true, false);
                htmlCode += caap.MakeCheckTR("Gen For Wars", 'WarLevelUpGeneral', true, LevelUpGenInstructions6, true, false);
                htmlCode += caap.MakeCheckTR("Gen For Arena", 'ArenaLevelUpGeneral', true, LevelUpGenInstructions13, true, false);
                htmlCode += caap.MakeCheckTR("Gen For SubQuests", 'SubQuestLevelUpGeneral', true, LevelUpGenInstructions7, true, false);
                htmlCode += caap.MakeCheckTR("Gen For MainQuests", 'QuestLevelUpGeneral', false, LevelUpGenInstructions8, true, false);
                htmlCode += caap.MakeCheckTR("Don't Bank After", 'NoBankAfterLvl', true, LevelUpGenInstructions9, true, false);
                htmlCode += caap.MakeCheckTR("Don't Income After", 'NoIncomeAfterLvl', true, LevelUpGenInstructions10, true, false);
                htmlCode += caap.MakeCheckTR("Prioritise Monster After", 'PrioritiseMonsterAfterLvl', false, LevelUpGenInstructions11, true, false);
                htmlCode += caap.endDropHide('LevelUpGeneral');
                htmlCode += caap.MakeCheckTR("Reverse Under Level 4 Order", 'ReverseLevelUpGenerals', false, reverseGenInstructions);
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddGeneralsMenu: " + err);
                return '';
            }
        },

        AddSkillPointsMenu: function () {
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
                htmlCode += caap.MakeCheckTR("Auto Add Upgrade Points", 'AutoStat', false, statusInstructions);
                htmlCode += caap.startCheckHide('AutoStat');
                htmlCode += caap.MakeCheckTR("Spend All Possible", 'StatSpendAll', false, statSpendAllInstructions);
                htmlCode += caap.MakeCheckTR("Upgrade Immediately", 'StatImmed', false, statImmedInstructions);
                htmlCode += caap.MakeCheckTR("Advanced Settings <a href='http://userscripts.org/posts/207279' target='_blank' style='color: blue'>(INFO)</a>", 'AutoStatAdv', false, statusAdvInstructions);
                htmlCode += caap.startCheckHide('AutoStatAdv', true);
                for (it = 0; it < 5; it += 1) {
                    htmlCode += caap.startTR();
                    htmlCode += caap.MakeTD("Increase", false, false, "width: 27%; display: inline-block;");
                    htmlCode += caap.MakeTD(caap.MakeDropDown('Attribute' + it, attrList, '', ''), false, false, "width: 40%; display: inline-block;");
                    htmlCode += caap.MakeTD("to", false, false, "text-align: center; width: 10%; display: inline-block;");
                    htmlCode += caap.MakeTD(caap.MakeNumberForm('AttrValue' + it, statusInstructions, 0, '', 'text'), false, true, "width: 20%; display: inline-block;");
                    htmlCode += caap.endTR;
                }

                htmlCode += caap.endCheckHide('AutoStatAdv', true);
                htmlCode += caap.startCheckHide('AutoStatAdv');
                for (it = 5; it < 10; it += 1) {
                    htmlCode += caap.startTR();
                    htmlCode += it === 5 ? caap.MakeTD("Increase", false, false, "width: 25%; display: inline-block;") : caap.MakeTD("Then", false, false, "width: 25%; display: inline-block;");
                    htmlCode += caap.MakeTD(caap.MakeDropDown('Attribute' + it, attrList, '', '', ''), false, false, "width: 45%; display: inline-block;");
                    htmlCode += caap.MakeTD("using", true, false, "width: 25%; display: inline-block;");
                    htmlCode += caap.endTR;
                    htmlCode += caap.MakeTD(caap.MakeNumberForm('AttrValue' + it, statusInstructions, '', '', 'text', 'width: 97%;'), false, false, '');
                }

                htmlCode += caap.endCheckHide('AutoStatAdv');
                htmlCode += caap.endCheckHide('AutoStat');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddSkillPointsMenu: " + err);
                return '';
            }
        },

        AddGiftingOptionsMenu: function () {
            try {
                // Other controls
                var giftInstructions = "Automatically receive and send return gifts.",
                    giftQueueUniqueInstructions = "When enabled only unique user's gifts will be queued, otherwise all received gifts will be queued.",
                    giftCollectOnlyInstructions = "Only collect gifts, do not queue and do not return.",
                    giftCollectAndQueueInstructions = "When used with Collect Only it will collect and queue gifts but not return.",
                    giftReturnOnlyOneInstructions = "Only return 1 gift to a person in 24 hours even if you received many from that person.",
                    htmlCode = '';

                htmlCode += caap.startToggle('Gifting', 'GIFTING OPTIONS');
                htmlCode += caap.MakeCheckTR('Auto Gifting', 'AutoGift', false, giftInstructions);
                htmlCode += caap.startCheckHide('AutoGift');
                htmlCode += caap.MakeCheckTR('Queue unique users only', 'UniqueGiftQueue', true, giftQueueUniqueInstructions);
                htmlCode += caap.MakeCheckTR('Collect Only', 'CollectOnly', false, giftCollectOnlyInstructions);
                htmlCode += caap.MakeCheckTR('And Queue', 'CollectAndQueue', false, giftCollectAndQueueInstructions);
                htmlCode += caap.MakeDropDownTR("Give", 'GiftChoice', gifting.gifts.list(), '', '', '', false, false, 80);
                htmlCode += caap.MakeCheckTR('1 Gift Per Person Per 24hrs', 'ReturnOnlyOne', false, giftReturnOnlyOneInstructions);
                htmlCode += caap.MakeCheckTR('Filter Return By UserId', 'FilterReturnId', false, "Don't return gifts to a list of UserIDs");
                htmlCode += caap.startCheckHide('FilterReturnId');

                htmlCode += caap.startTR();
                htmlCode += caap.MakeTD(caap.MakeTextBox('FilterReturnIdList', "Don't return gifts to these UserIDs. Use ',' between each UserID", '', ''));
                htmlCode += caap.endTR;

                htmlCode += caap.endCheckHide('FilterReturnId');
                htmlCode += caap.MakeCheckTR('Filter Return By Gift', 'FilterReturnGift', false, "Don't return gifts for a list of certain gifts recieved");
                htmlCode += caap.startCheckHide('FilterReturnGift');

                htmlCode += caap.startTR();
                htmlCode += caap.MakeTD(caap.MakeTextBox('FilterReturnGiftList', "Don't return gifts to these received gifts. Use ',' between each gift", '', ''));
                htmlCode += caap.endTR;

                htmlCode += caap.endCheckHide('FilterReturnGift');
                htmlCode += caap.endCheckHide('AutoGift');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddGiftingOptionsMenu: " + err);
                return '';
            }
        },

        AddEliteGuardOptionsMenu: function () {
            try {
                // Other controls
                var autoEliteInstructions = "Enable or disable Auto Elite function",
                    autoEliteIgnoreInstructions = "Use this option if you have a small " +
                        "army and are unable to fill all 10 Elite positions. This prevents " +
                        "the script from checking for any empty places and will cause " +
                        "Auto Elite to run on its timer only.",
                    htmlCode = '';

                htmlCode += caap.startToggle('Elite', 'ELITE GUARD OPTIONS');
                htmlCode += caap.MakeCheckTR('Auto Elite Army', 'AutoElite', false, autoEliteInstructions);
                htmlCode += caap.startCheckHide('AutoElite');
                htmlCode += caap.MakeCheckTR('Timed Only', 'AutoEliteIgnore', false, autoEliteIgnoreInstructions);

                htmlCode += caap.startTR();
                htmlCode += caap.MakeTD("<input type='button' id='caap_resetElite' value='Do Now' style='padding: 0; font-size: 10px; height: 18px' />");
                htmlCode += caap.endTR;

                htmlCode += caap.startTR();
                htmlCode += caap.MakeTD(caap.MakeTextBox('EliteArmyList', "Try these UserIDs first. Use ',' between each UserID", '', ''));
                htmlCode += caap.endTR;

                htmlCode += caap.endCheckHide('AutoElite');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddEliteGuardOptionsMenu: " + err);
                return '';
            }
        },

        AddArmyOptionsMenu: function () {
            try {
                // Other controls
                var armyInstructions = "Enable or disable the Army functions. Required when using CA's alternative URL.",
                    armyScanInstructions = "Scan the army pages every X days.",
                    htmlCode = '';

                htmlCode += caap.startToggle('Army', 'ARMY OPTIONS');
                htmlCode += caap.MakeCheckTR('Enable Army Functions', 'EnableArmy', true, armyInstructions);
                htmlCode += caap.startCheckHide('EnableArmy');
                htmlCode += caap.MakeNumberFormTR("Scan Every (days)", 'ArmyScanDays', armyScanInstructions, 7, '', '');
                htmlCode += caap.MakeCheckTR('Change Indicators', 'ArmyIndicators', false, '');
                htmlCode += caap.startCheckHide('ArmyIndicators');
                htmlCode += caap.MakeNumberFormTR("Recent", 'ArmyAgeDaysColor0', '', '#008000', '', 'color', false, false, 50);
                htmlCode += caap.MakeNumberFormTR("Warn 1 (days)", 'ArmyAgeDays1', '', 7, '', '');
                htmlCode += caap.MakeNumberFormTR("Warn 2", 'ArmyAgeDaysColor1', '', '#ADFF2F', '', 'color', false, false, 50);
                htmlCode += caap.MakeNumberFormTR("Warn 2 (days)", 'ArmyAgeDays2', '', 14, '', '');
                htmlCode += caap.MakeNumberFormTR("Warn 3", 'ArmyAgeDaysColor2', '', '#FFD700', '', 'color', false, false, 50);
                htmlCode += caap.MakeNumberFormTR("Warn 3 (days)", 'ArmyAgeDays3', '', 21, '', '');
                htmlCode += caap.MakeNumberFormTR("Warn 4", 'ArmyAgeDaysColor3', '', '#FF8C00', '', 'color', false, false, 50);
                htmlCode += caap.MakeNumberFormTR("Warn 4 (days)", 'ArmyAgeDays4', '', 28, '', '');
                htmlCode += caap.MakeNumberFormTR("Warn 4", 'ArmyAgeDaysColor4', '', '#FF0000', '', 'color', false, false, 50);
                htmlCode += caap.endCheckHide('ArmyIndicators');
                htmlCode += caap.endCheckHide('EnableArmy');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddArmyOptionsMenu: " + err);
                return '';
            }
        },

        AddAutoOptionsMenu: function () {
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
                htmlCode += caap.MakeDropDownTR("Auto bless", 'AutoBless', autoBlessList, autoBlessListInstructions, '', '', false, false, 62);
                htmlCode += caap.MakeCheckTR('Auto Potions', 'AutoPotions', false, autoPotionsInstructions0);
                htmlCode += caap.startCheckHide('AutoPotions');
                htmlCode += caap.MakeNumberFormTR("Spend Stamina At", 'staminaPotionsSpendOver', autoPotionsInstructions1, 39, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Keep Stamina", 'staminaPotionsKeepUnder', autoPotionsInstructions2, 35, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Spend Energy At", 'energyPotionsSpendOver', autoPotionsInstructions3, 39, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Keep Energy", 'energyPotionsKeepUnder', autoPotionsInstructions4, 35, '', '', true, false);
                htmlCode += caap.MakeNumberFormTR("Wait If Exp. To Level", 'potionsExperience', autoPotionsInstructions5, 20, '', '', true, false);
                htmlCode += caap.endCheckHide('AutoPotions');
                htmlCode += caap.MakeCheckTR('Auto Alchemy', 'AutoAlchemy', false, autoAlchemyInstructions1);
                htmlCode += caap.startCheckHide('AutoAlchemy');
                htmlCode += caap.MakeCheckTR('Do Battle Hearts', 'AutoAlchemyHearts', false, autoAlchemyInstructions2, true);
                htmlCode += caap.endCheckHide('AutoAlchemy');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddAutoOptionsMenu: " + err);
                return '';
            }
        },

        AddOtherOptionsMenu: function () {
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
                    styleList = [
                        'CA Skin',
                        'Original',
                        'Custom',
                        'None'
                    ],
                    htmlCode = '';

                htmlCode += caap.startToggle('Other', 'OTHER OPTIONS');
                htmlCode += caap.MakeCheckTR('Display Item Titles', 'enableTitles', true, itemTitlesInstructions);
                htmlCode += caap.MakeCheckTR('Do Goblin Hinting', 'goblinHinting', true, goblinHintingInstructions);
                htmlCode += caap.MakeCheckTR('Hide Recipe Ingredients', 'enableIngredientsHide', false, ingredientsHideInstructions);
                htmlCode += caap.MakeCheckTR('Alchemy Shrink', 'enableAlchemyShrink', true, alchemyShrinkInstructions);
                htmlCode += caap.MakeCheckTR('Recipe Clean-Up', 'enableRecipeClean', 1, recipeCleanInstructions);
                htmlCode += caap.startCheckHide('enableRecipeClean');
                htmlCode += caap.MakeNumberFormTR("Recipe Count", 'recipeCleanCount', recipeCleanCountInstructions, 1, '', '', true, false);
                htmlCode += caap.endCheckHide('enableRecipeClean');
                htmlCode += caap.MakeCheckTR('Display CAAP Banner', 'BannerDisplay', true, bannerInstructions);
                htmlCode += caap.MakeCheckTR('Use 24 Hour Format', 'use24hr', true, timeInstructions);
                htmlCode += caap.MakeCheckTR('Set Title', 'SetTitle', false, titleInstructions0);
                htmlCode += caap.startCheckHide('SetTitle');
                htmlCode += caap.MakeCheckTR('Display Action', 'SetTitleAction', false, titleInstructions1, true);
                htmlCode += caap.MakeCheckTR('Display Name', 'SetTitleName', false, titleInstructions2, true);
                htmlCode += caap.endCheckHide('SetTitle');
                htmlCode += caap.MakeCheckTR('Auto Comma Text Areas', 'TextAreaCommas', false, "When enabled, text input areas will be automatically converted to comma seperation");
                htmlCode += caap.MakeCheckTR('Hide Sidebar Adverts', 'HideAds', false, hideAdsInstructions);
                htmlCode += caap.MakeCheckTR('Hide FB Iframe Adverts', 'HideAdsIframe', false, hideAdsIframeInstructions);
                htmlCode += caap.MakeCheckTR('Hide FB Chat', 'HideFBChat', false, hideFBChatInstructions);
                htmlCode += caap.MakeCheckTR('Enable News Summary', 'NewsSummary', true, newsSummaryInstructions);
                htmlCode += caap.MakeDropDownTR("Style", 'DisplayStyle', styleList, '', '', 'CA Skin', false, false, 62);
                htmlCode += caap.startDropHide('DisplayStyle', '', 'Custom');
                htmlCode += caap.MakeTD("Running:");
                htmlCode += caap.MakeNumberFormTR("Color", 'CustStyleBackgroundLight', '#FFFFFF', '#E0C691', '', 'color', true, false, 40);
                htmlCode += caap.MakeSlider('Transparency', "CustStyleOpacityLight", '', 1, true);
                htmlCode += caap.MakeTD("Paused:");
                htmlCode += caap.MakeNumberFormTR("Color", 'CustStyleBackgroundDark', '#FFFFFF', '#B09060', '', 'color', true, false, 40);
                htmlCode += caap.MakeSlider('Transparency', "CustStyleOpacityDark", '', 1, true);
                htmlCode += caap.endDropHide('DisplayStyle');
                //htmlCode += $u.is_chrome && $u.inputtypes.number ? caap.MakeCheckTR('Number Roller', 'numberRoller', true, "Enable or disable the number roller on GUI options.") : '';
                htmlCode += caap.MakeCheckTR('Enable Level Up Mode', 'EnableLevelUpMode', true, levelupModeInstructions);
                htmlCode += caap.MakeCheckTR('Bookmark Mode', 'bookmarkMode', false, bookmarkModeInstructions);
                htmlCode += caap.MakeCheckTR('Change Log Level', 'ChangeLogLevel', false);
                htmlCode += caap.startCheckHide('ChangeLogLevel');
                htmlCode += caap.MakeNumberFormTR("Log Level", 'DebugLevel', '', 1, '', '', true, false);
                htmlCode += caap.endCheckHide('ChangeLogLevel');
                htmlCode += caap.startTR();
                htmlCode += caap.MakeTD("<input" + (caap.domain.which > 1 ? " disabled='disabled' title='Fill Army is not possible on this server.'" : '') + " type='button' id='caap_FillArmy' value='Fill Army' style='padding: 0; font-size: 10px; height: 18px' />");
                htmlCode += caap.endTR;
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddOtherOptionsMenu: " + err);
                return '';
            }
        },

        AddFooterMenu: function () {
            try {
                var htmlCode = '';
                htmlCode += caap.startTR();
                htmlCode += caap.MakeTD("Unlock Menu <input type='button' id='caap_ResetMenuLocation' value='Reset' style='padding: 0; font-size: 10px; height: 18px' />", false, false, "width: 90%; display: inline-block;");
                htmlCode += caap.MakeTD("<input type='checkbox' id='unlockMenu' />", false, true, "width: 10%; display: inline-block;");
                htmlCode += caap.endTR;

                if (!devVersion) {
                    htmlCode += caap.MakeTD("Version: " + caapVersion + " - <a href='http://senses.ws/caap/index.php' target='_blank'>CAAP Forum</a>");
                    if (caap.newVersionAvailable) {
                        htmlCode += caap.MakeTD("<a href='http://castle-age-auto-player.googlecode.com/files/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + state.getItem('SUC_remote_version') + "!</a>");
                    }
                } else {
                    htmlCode += caap.MakeTD("Version: " + caapVersion + " d" + devVersion + " - <a href='http://senses.ws/caap/index.php' target='_blank'>CAAP Forum</a>");
                    if (caap.newVersionAvailable) {
                        htmlCode += caap.MakeTD("<a href='http://castle-age-auto-player.googlecode.com/svn/trunk/Castle-Age-Autoplayer.user.js'>Install new CAAP version: " + state.getItem('SUC_remote_version') + " d" + state.getItem('DEV_remote_version')  + "!</a>");
                    }
                }

                return htmlCode;
            } catch (err) {
                $u.error("ERROR in AddFooterMenu: " + err);
                return '';
            }
        },

        AddDashboard: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                 Here is where we construct the HTML for our dashboard. We start by building the outer
                 container and position it within the main container.
                \-------------------------------------------------------------------------------------*/
                var layout      = "<div id='caap_top'>",
                    displayList = ['Monster', 'Guild Monster', 'Target List', 'Battle Stats', 'User Stats', 'Generals Stats', 'Soldiers Stats', 'Item Stats', 'Magic Stats', 'Gifting Stats', 'Gift Queue', 'Arena', 'Army'],
                    styleXY = {
                        x: 0,
                        y: 0
                    },
                    bgc = state.getItem("StyleBackgroundLight", "#E0C961");

                /*-------------------------------------------------------------------------------------\
                DBDropDown is used to make our drop down boxes for dash board controls.  These require
                slightly different HTML from the side controls.
                \-------------------------------------------------------------------------------------*/
                function DBDropDown(idName, dropDownList, instructions, formatParms) {
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
                        $u.error("ERROR in DBDropDown: " + err);
                        return '';
                    }
                }

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
                layout += "<div id='caap_buttonFeed' style='position:absolute;top:0px;left:60px;'><input id='caap_crusaders' type='button' value='Crusaders' style='padding: 0; font-size: 9px; height: 18px' /></div>";
                /*-------------------------------------------------------------------------------------\
                 We install the display selection box that allows the user to toggle through the
                 available displays.
                \-------------------------------------------------------------------------------------*/
                layout += "<div id='caap_DBDisplay' style='font-size: 9px;position:absolute;top:0px;right:5px;'>Display: ";
                layout += DBDropDown('DBDisplay', displayList, '', "style='font-size: 9px; min-width: 120px; max-width: 120px; width : 120px;'") + "</div>";
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
                layout += "<div id='caap_arena' style='position:relative;top:15px;width:610px;height:165px;overflow:auto;display:" + (config.getItem('DBDisplay', 'Monster') === 'Arena' ? 'block' : 'none') + "'></div>";
                layout += "</div>";
                /*-------------------------------------------------------------------------------------\
                 No we apply our CSS to our container
                \-------------------------------------------------------------------------------------*/
                caap.dashboardXY.x = state.getItem('caap_top_menuLeft', '');
                caap.dashboardXY.y = state.getItem('caap_top_menuTop', $j(caap.dashboardXY.selector).offset().top - 10);
                styleXY = caap.GetDashboardXY();
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
                $u.error("ERROR in AddDashboard: " + err);
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

        UpdateDashboardWaitLog: true,

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        UpdateDashboard: function (force) {
            try {
                if (caap.caapTopObject.length === 0) {
                    throw "We are missing the Dashboard div!";
                }

                if (!force && !schedule.oneMinuteUpdate('dashboard') && $j('#caap_infoMonster').html()) {
                    if (caap.UpdateDashboardWaitLog) {
                        $u.log(4, "Dashboard update is waiting on oneMinuteUpdate");
                        caap.UpdateDashboardWaitLog = false;
                    }

                    return false;
                }

                caap.UpdateDashboardWaitLog = true;
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
                    str                      = '',
                    header                   = {text: '', color: '', bgcolor: '', id: '', title: '', width: ''},
                    data                     = {text: '', color: '', bgcolor: '', id: '', title: ''},
                    linkRegExp               = new RegExp("'(http:.+)'"),
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
                                            value = value[0] + ":" + value[1];
                                            title = $u.hasContent(monster.info[monsterObj['type']]) && $u.isNumber(monster.info[monsterObj['type']].duration) ? "Total Monster Duration: " + monster.info[monsterObj['type']].duration + " hours" : '';
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
                            removeLink = monsterObjLink.replace("casuser", "remove_list").replace("&action=doObjective", "").match(linkRegExp);
                            removeLinkInstructions = "Clicking this link will remove " + monsterObj['name'] + " from both CA and CAAP!";
                            data = {
                                text  : '<span id="caap_remove_' + count + '" title="' + removeLinkInstructions + '" mname="' + monsterObj['name'] + '" rlink="' + removeLink[1] +
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

                        caap.ClickAjaxLinkSend(visitMonsterLink.arlink);
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
                            caap.UpdateDashboard(true);
                            caap.ClickGetCachedAjax(monsterRemove.arlink);
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

                        caap.ClickAjaxLinkSend(visitMonsterLink.arlink);
                    };

                    $j("span[id*='caap_guildmonster_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    state.setItem("GuildMonsterDashUpdate", false);
                }

                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_arena' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'Arena' && state.getItem("ArenaDashUpdate", true)) {
                    html = "<table width='100%' cellpadding='0px' cellspacing='0px'><tr>";
                    headers = ['Arena', 'Damage', 'Team%',      'Enemy%',      'My Status', 'TimeLeft', 'Status'];
                    values  = ['damage', 'teamHealth', 'enemyHealth', 'myStatus',  'ticker',   'state'];
                    for (pp = 0; pp < headers.length; pp += 1) {
                        html += caap.makeTh({text: headers[pp], color: '', id: '', title: '', width: ''});
                    }

                    html += '</tr>';
                    for (i = 0, len = arena.records.length; i < len; i += 1) {
                        html += "<tr>";
                        data = {
                            text  : '<span id="caap_arena_1" title="Clicking this link will take you to the Arena" rlink="arena.php" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">Arena</span>',
                            color : 'blue',
                            id    : '',
                            title : ''
                        };

                        html += caap.makeTd(data);
                        color = arena.records[i]['state'] === 'Alive' ? 'green' : $u.bestTextColor(config.getItem("StyleBackgroundLight", "#E0C961"));
                        color = arena.records[i]['state'] === 'Alive' && arena.records[i]['enemyHealth'] === arena.records[i]['teamHealth'] ? 'purple' : color;
                        color = arena.records[i]['enemyHealth'] > arena.records[i]['teamHealth'] ? 'red' : color;
                        for (pp = 0; pp < values.length; pp += 1) {
                            if (values[pp] === 'ticker') {
                                html += caap.makeTd({text: $u.hasContent(arena.records[i][values[pp]]) ? arena.records[i][values[pp]].regex(/(\d+:\d+):\d+/) : '', color: color, id: '', title: ''});
                            } else {
                                html += caap.makeTd({
                                    text  : $u.hasContent(arena.records[i][values[pp]]) && ($u.isString(arena.records[i][values[pp]]) || arena.records[i][values[pp]] > 0) ? arena.records[i][values[pp]] : '',
                                    color : color,
                                    id    : '',
                                    title : ''
                                });
                            }
                        }

                        html += '</tr>';
                    }

                    html += '</table>';
                    $j("#caap_arena", caap.caapTopObject).html(html);

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

                        caap.ClickAjaxLinkSend(visitMonsterLink.arlink);
                    };

                    $j("span[id='caap_arena_1']", caap.caapTopObject).unbind('click', handler).click(handler);

                    state.setItem("ArenaDashUpdate", false);
                }

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
                        default:
                            header.text = headers[pp];
                            header.width = '5%';
                            header.color = '';
                        }

                        html += caap.makeTh(header);
                    }

                    html += '</tr>';
                    for (i = 0, len = army.recordsSortable.length; i < len; i += 1) {
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
                            text  : '<input id="caap_elitearmy_' + i + '" type="checkbox" title="Use to fill elite guard" userid="' + army.recordsSortable[i]['userId'] + '" cstate="' + (army.recordsSortable[i]['elite'] ? 'true' : 'false') + '" ' + (army.recordsSortable[i]['elite'] ? ' checked' : '') + ' />',
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

                        caap.ClickAjaxLinkSend(visitUserIdLink.arlink);
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
                            record = $j(userid, army);
                            record['elite'] = !cstate;
                            army.setItem(record);
                            $u.log(4, "check", userid, record, e.target.attributes);
                            state.setItem("ArmyDashUpdate", true);
                            caap.UpdateDashboard(true);
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
                            caap.ClickAjaxLinkSend("army_member.php?action=delete&player_id=" + userid);
                            army.deleteItem(userid);
                            state.setItem("ArmyDashUpdate", true);
                            caap.UpdateDashboard(true);
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
                            caap.UpdateDashboard(true);
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
                    for (i = 0, len = caap.ReconRecordArray.length; i < len; i += 1) {
                        html += "<tr>";
                        for (pp = 0; pp < values.length; pp += 1) {
                            if (/userID/.test(values[pp])) {
                                userIdLinkInstructions = "Clicking this link will take you to the user keep of " + caap.ReconRecordArray[i][values[pp]];
                                userIdLink = caap.domain.link + "/keep.php?casuser=" + caap.ReconRecordArray[i][values[pp]];
                                data = {
                                    text  : '<span id="caap_targetrecon_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                            '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + caap.ReconRecordArray[i][values[pp]] + '</span>',
                                    color : 'blue',
                                    id    : '',
                                    title : ''
                                };

                                html += caap.makeTd(data);
                            } else if (/\S+Num/.test(values[pp])) {
                                html += caap.makeTd({text: caap.ReconRecordArray[i][values[pp]], color: '', id: '', title: ''});
                            } else if (/\S+Time/.test(values[pp])) {
                                data = {
                                    text  : $u.makeTime(caap.ReconRecordArray[i][values[pp]], "d M H:i"),
                                    color : '',
                                    id    : '',
                                    title : ''
                                };

                                html += caap.makeTd(data);
                            } else {
                                html += caap.makeTd({text: caap.ReconRecordArray[i][values[pp]], color: '', id: '', title: ''});
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

                        caap.ClickAjaxLinkSend(visitUserIdLink.arlink);
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

                        caap.ClickAjaxLinkSend(visitUserIdLink.arlink);
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
                    html += caap.makeTd({text: '&nbsp;', color: '', id: '', title: ''});
                    html += caap.makeTd({text: '&nbsp;', color: valueCol, id: '', title: ''});
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
                            caap.UpdateDashboard(true);
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
                            caap.UpdateDashboard(true);
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
                            caap.UpdateDashboard(true);
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
                            caap.UpdateDashboard(true);
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

                        caap.ClickAjaxLinkSend(visitUserIdLink.arlink);
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

                        caap.ClickAjaxLinkSend(visitUserIdLink.arlink);
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
                            caap.UpdateDashboard(true);
                        }
                    };

                    $j("span[id*='caap_removeq_']", caap.caapTopObject).unbind('click', handler).click(handler);
                    state.setItem("GiftQueueDashUpdate", false);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in UpdateDashboard: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /*-------------------------------------------------------------------------------------\
        AddDBListener creates the listener for our dashboard controls.
        \-------------------------------------------------------------------------------------*/
        dbDisplayListener: function (e) {
            var value = e.target.options[e.target.selectedIndex].value;
            config.setItem('DBDisplay', value);
            caap.SetDisplay("caapTopObject", 'infoMonster', false);
            caap.SetDisplay("caapTopObject", 'guildMonster', false);
            caap.SetDisplay("caapTopObject", 'arena', false);
            caap.SetDisplay("caapTopObject", 'army', false);
            caap.SetDisplay("caapTopObject", 'infoTargets1', false);
            caap.SetDisplay("caapTopObject", 'infoBattle', false);
            caap.SetDisplay("caapTopObject", 'userStats', false);
            caap.SetDisplay("caapTopObject", 'generalsStats', false);
            caap.SetDisplay("caapTopObject", 'soldiersStats', false);
            caap.SetDisplay("caapTopObject", 'itemStats', false);
            caap.SetDisplay("caapTopObject", 'magicStats', false);
            caap.SetDisplay("caapTopObject", 'giftStats', false);
            caap.SetDisplay("caapTopObject", 'giftQueue', false);
            caap.SetDisplay("caapTopObject", 'buttonMonster', false);
            caap.SetDisplay("caapTopObject", 'buttonGuildMonster', false);
            caap.SetDisplay("caapTopObject", 'buttonTargets', false);
            caap.SetDisplay("caapTopObject", 'buttonBattle', false);
            caap.SetDisplay("caapTopObject", 'buttonGifting', false);
            caap.SetDisplay("caapTopObject", 'buttonGiftQueue', false);
            caap.SetDisplay("caapTopObject", 'buttonSortGenerals', false);
            caap.SetDisplay("caapTopObject", 'buttonSortSoldiers', false);
            caap.SetDisplay("caapTopObject", 'buttonSortItem', false);
            caap.SetDisplay("caapTopObject", 'buttonSortMagic', false);
            caap.SetDisplay("caapTopObject", 'buttonArmy', false);
            switch (value) {
            case "Target List" :
                caap.SetDisplay("caapTopObject", 'infoTargets1', true);
                caap.SetDisplay("caapTopObject", 'buttonTargets', true);
                break;
            case "Battle Stats" :
                caap.SetDisplay("caapTopObject", 'infoBattle', true);
                caap.SetDisplay("caapTopObject", 'buttonBattle', true);
                break;
            case "User Stats" :
                caap.SetDisplay("caapTopObject", 'userStats', true);
                break;
            case "Generals Stats" :
                caap.SetDisplay("caapTopObject", 'generalsStats', true);
                caap.SetDisplay("caapTopObject", 'buttonSortGenerals', true);
                break;
            case "Soldiers Stats" :
                caap.SetDisplay("caapTopObject", 'soldiersStats', true);
                caap.SetDisplay("caapTopObject", 'buttonSortSoldiers', true);
                break;
            case "Item Stats" :
                caap.SetDisplay("caapTopObject", 'itemStats', true);
                caap.SetDisplay("caapTopObject", 'buttonSortItem', true);
                break;
            case "Magic Stats" :
                caap.SetDisplay("caapTopObject", 'magicStats', true);
                caap.SetDisplay("caapTopObject", 'buttonSortMagic', true);
                break;
            case "Gifting Stats" :
                caap.SetDisplay("caapTopObject", 'giftStats', true);
                caap.SetDisplay("caapTopObject", 'buttonGifting', true);
                break;
            case "Gift Queue" :
                caap.SetDisplay("caapTopObject", 'giftQueue', true);
                caap.SetDisplay("caapTopObject", 'buttonGiftQueue', true);
                break;
            case "Guild Monster" :
                caap.SetDisplay("caapTopObject", 'guildMonster', true);
                caap.SetDisplay("caapTopObject", 'buttonGuildMonster', true);
                break;
            case "Monster" :
                caap.SetDisplay("caapTopObject", 'infoMonster', true);
                caap.SetDisplay("caapTopObject", 'buttonMonster', true);
                break;
            case "Arena" :
                caap.SetDisplay("caapTopObject", 'arena', true);
                break;
            case "Army" :
                caap.SetDisplay("caapTopObject", 'army', true);
                caap.SetDisplay("caapTopObject", 'buttonArmy', true);
                break;
            default :
            }

            caap.UpdateDashboard(true);
        },

        refreshMonstersListener: function (e) {
            monster.flagFullReview();
        },

        refreshGuildMonstersListener: function (e) {
            $u.log(1, "refreshGuildMonstersListener");
            state.setItem('ReleaseControl', true);
            guild_monster.clear();
            caap.UpdateDashboard(true);
            schedule.setItem("guildMonsterReview", 0);
        },

        liveFeedButtonListener: function (e) {
            caap.ClickAjaxLinkSend('army_news_feed.php');
        },

        crusadersButtonListener: function (e) {
            caap.ClickAjaxLinkSend('specialmembership.php');
        },

        clearTargetsButtonListener: function (e) {
            caap.ReconRecordArray = [];
            caap.SaveRecon();
            caap.UpdateDashboard(true);
        },

        clearBattleButtonListener: function (e) {
            battle.clear();
            caap.UpdateDashboard(true);
        },

        clearGiftingButtonListener: function (e) {
            gifting.clear("history");
            caap.UpdateDashboard(true);
        },

        clearGiftQueueButtonListener: function (e) {
            gifting.clear("queue");
            caap.UpdateDashboard(true);
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

        AddDBListener: function () {
            try {
                $u.log(4, "Adding listeners for caap_top");
                if (!$u.hasContent($j('#caap_DBDisplay', caap.caapTopObject))) {
                    caap.ReloadCastleAge();
                }

                $j('#caap_DBDisplay', caap.caapTopObject).change(caap.dbDisplayListener);
                $j('#caap_refreshMonsters', caap.caapTopObject).click(caap.refreshMonstersListener);
                $j('#caap_refreshGuildMonsters', caap.caapTopObject).click(caap.refreshGuildMonstersListener);
                $j('#caap_liveFeed', caap.caapTopObject).click(caap.liveFeedButtonListener);
                $j('#caap_crusaders', caap.caapTopObject).click(caap.crusadersButtonListener);
                $j('#caap_clearTargets', caap.caapTopObject).click(caap.clearTargetsButtonListener);
                $j('#caap_clearBattle', caap.caapTopObject).click(caap.clearBattleButtonListener);
                $j('#caap_clearGifting', caap.caapTopObject).click(caap.clearGiftingButtonListener);
                $j('#caap_clearGiftQueue', caap.caapTopObject).click(caap.clearGiftQueueButtonListener);
                $j('#caap_sortGenerals', caap.caapTopObject).click(caap.sortGeneralsButtonListener);
                $j('#caap_sortSoldiers', caap.caapTopObject).click(caap.sortSoldiersButtonListener);
                $j('#caap_sortItem', caap.caapTopObject).click(caap.sortItemButtonListener);
                $j('#caap_sortMagic', caap.caapTopObject).click(caap.sortMagicButtonListener);
                $j('#caap_getArmy', caap.caapTopObject).click(caap.getArmyButtonListener);
                $u.log(4, "Listeners added for caap_top");
                return true;
            } catch (err) {
                $u.error("ERROR in AddDBListener: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          EVENT LISTENERS
        // Watch for changes and update the controls
        /////////////////////////////////////////////////////////////////////

        SetDisplay: function (area, idName, display, quiet) {
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
                $u.error("ERROR in SetDisplay: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        CheckBoxListener: function (e) {
            try {
                var idName        = e.target.id.stripCaap(),
                    DocumentTitle = '',
                    d             = '',
                    styleXY       = {};

                $u.log(1, "Change: setting '" + idName + "' to ", e.target.checked);
                config.setItem(idName, e.target.checked);
                caap.SetDisplay("caapDivObject", idName + '_hide', e.target.checked, true);
                caap.SetDisplay("caapDivObject", idName + '_not_hide', !e.target.checked, true);
                /*
                if (e.target.className) {
                    caap.SetDisplay("caapDivObject", e.target.className, e.target.checked);
                }
                */

                switch (idName) {
                case "AutoStatAdv" :
                    $u.log(9, "AutoStatAdv");
                    state.setItem("statsMatch", true);
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
                    styleXY = caap.GetDashboardXY();
                    caap.caapTopObject.css({
                        top  : styleXY.y + 'px',
                        left : styleXY.x + 'px'
                    });

                    break;
                case "HideFBChat" :
                    $u.log(9, "HideFBChat");
                    $j("div[class*='fbDockWrapper fbDockWrapperBottom fbDockWrapperRight']").css('display', e.target.checked ? 'none' : 'block');
                    break;
                case "BannerDisplay" :
                    $u.log(9, "BannerDisplay");
                    caap.SetDisplay("caapDivObject", idName, e.target.checked);
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
                                caap.SaveControlXY();
                            }
                        });

                        caap.caapTopObject.css('cursor', 'move').draggable({
                            stop: function () {
                                caap.SaveDashboardXY();
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
                default :
                }

                return true;
            } catch (err) {
                $u.error("ERROR in CheckBoxListener: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        colorDiv: {},

        colorUpdate: function () {
            try {
                var color = state.getItem('caapPause', 'none') === 'none' ? state.getItem('StyleBackgroundLight', 1) : state.getItem('StyleBackgroundDark', 1),
                    bgo  = state.getItem('caapPause', 'none') === 'none' ? state.getItem('StyleOpacityLight', 1) : state.getItem('StyleOpacityDark', 1),
                    btc  = $u.bestTextColor(color),
                    chk1 = caap.caapDivObject.css('background-color'),
                    chk2 = caap.caapDivObject.css('color');

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

        ColorBoxClickListener: function (e) {
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
                $u.error("ERROR in ColorBoxClickListener: " + err);
                return false;
            }
        },

        ColorBoxChangeListener: function (e) {
            try {
                e.target.value = $u.addSharp(e.target.value).toUpperCase();
                caap.ColorBoxListener(e);
                return true;
            } catch (err) {
                $u.error("ERROR in ColorBoxChangeListener: " + err);
                return false;
            }
        },

        ColorBoxListener: function (e) {
            try {
                var id  = e.target.id.stripCaap(),
                    val = $u.addSharp(e.target.value).toUpperCase(),
                    c = new $u.ColorConv();

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
                $u.error("ERROR in ColorBoxListener: " + err);
                return false;
            }
        },

        TextBoxListener: function (e) {
            try {
                var idName = e.target.id.stripCaap(),
                    i      = 0,
                    len    = 0;

                $u.log(1, 'Change: setting "' + idName + '" to ', String(e.target.value));
                if (/AttrValue+/.test(idName)) {
                    state.setItem("statsMatch", true);
                }

                config.setItem(idName, String(e.target.value));
                return true;
            } catch (err) {
                $u.error("ERROR in TextBoxListener: " + err);
                return false;
            }
        },

        NumberBoxListener: function (e) {
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
                $u.error("ERROR in NumberBoxListener: " + err);
                return false;
            }
        },

        DropBoxListener: function (e) {
            try {
                if (e.target.selectedIndex > 0) {
                    var idName = e.target.id.stripCaap(),
                        value  = e.target.options[e.target.selectedIndex].value,
                        title  = e.target.options[e.target.selectedIndex].title;

                    $u.log(1, 'Change: setting "' + idName + '" to "' + value + '" with title "' + title + '"');
                    config.setItem(idName, value);
                    e.target.title = title;
                    if (idName.hasIndexOf('When')) {
                        caap.SetDisplay("caapDivObject", idName + '_hide', value !== 'Never');
                        if (!idName.hasIndexOf('Quest')) {
                            if (!idName.hasIndexOf('Arena')) {
                                caap.SetDisplay("caapDivObject", idName + 'XStamina_hide', value === 'At X Stamina');
                            }

                            caap.SetDisplay("caapDivObject", 'WhenBattleStayHidden_hide', ((config.getItem('WhenBattle', 'Never') === 'Stay Hidden' && config.getItem('WhenMonster', 'Never') !== 'Stay Hidden')));
                            caap.SetDisplay("caapDivObject", 'WhenMonsterStayHidden_hide', ((config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && config.getItem('WhenBattle', 'Never') !== 'Stay Hidden')));
                            caap.SetDisplay("caapDivObject", 'DemiPointsFirst_hide', (config.getItem('WhenBattle', 'Never') === 'Demi Points Only'));
                            switch (idName) {
                            case 'WhenBattle':
                                if (value === 'Never') {
                                    caap.SetDivContent('battle_mess', 'Battle off');
                                } else {
                                    caap.SetDivContent('battle_mess', '');
                                }

                                break;
                            case 'WhenMonster':
                                if (value === 'Never') {
                                    caap.SetDivContent('monster_mess', 'Monster off');
                                } else {
                                    caap.SetDivContent('monster_mess', '');
                                }

                                break;
                            case 'WhenGuildMonster':
                                if (value === 'Never') {
                                    caap.SetDivContent('guild_monster_mess', 'Guild Monster off');
                                } else {
                                    caap.SetDivContent('guild_monster_mess', '');
                                }

                                break;
                            case 'WhenArena':
                                if (value === 'Never') {
                                    caap.SetDivContent('arena_mess', 'Arena off');
                                } else {
                                    caap.SetDivContent('arena_mess', '');
                                }

                                break;
                            default:
                            }
                        } else {
                            caap.SetDisplay("caapDivObject", idName + 'XEnergy_hide', value === 'At X Energy');
                        }
                    } else if (idName === 'QuestArea' || idName === 'QuestSubArea' || idName === 'WhyQuest') {
                        state.setItem('AutoQuest', caap.newAutoQuest());
                        caap.ClearAutoQuest();
                        if (idName === 'QuestArea') {
                            switch (value) {
                            case "Quest" :
                                caap.ChangeDropDownList('QuestSubArea', caap.landQuestList);
                                break;
                            case "Demi Quests" :
                                caap.ChangeDropDownList('QuestSubArea', caap.demiQuestList);
                                break;
                            case "Atlantis" :
                                caap.ChangeDropDownList('QuestSubArea', caap.atlantisQuestList);
                                break;
                            default :
                            }
                        }
                    } else if (idName === 'BattleType') {
                        state.getItem('BattleChainId', 0);
                    } else if (idName === 'AutoBless') {
                        schedule.setItem('BlessingTimer', 0);
                    } else if (idName === 'TargetType') {
                        state.getItem('BattleChainId', 0);
                        caap.SetDisplay("caapDivObject", 'TargetTypeFreshmeat_hide', value === "Freshmeat");
                        caap.SetDisplay("caapDivObject", 'TargetTypeUserId_hide', value === "Userid List");
                        caap.SetDisplay("caapDivObject", 'TargetTypeRaid_hide', value === "Raid");
                    } else if (idName === 'LevelUpGeneral') {
                        caap.SetDisplay("caapDivObject", idName + '_hide', value !== 'Use Current');
                    } else if (/Attribute?/.test(idName)) {
                        state.setItem("statsMatch", true);
                    } else if (idName === 'chainArena') {
                        caap.SetDisplay("caapDivObject", idName + '_hide', value !== '0');
                    } else if (idName === 'DisplayStyle') {
                        caap.SetDisplay("caapDivObject", idName + '_hide', value === 'Custom');
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
                $u.error("ERROR in DropBoxListener: " + err);
                return false;
            }
        },

        TextAreaListener: function (e) {
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
                $u.error("ERROR in TextAreaListener: " + err);
                return false;
            }
        },

        PauseListener: function (e) {
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
            /*
            if ($u.is_chrome && config.getItem("numberRoller", true) && $u.inputtypes.number) {
                $j(":input[data-subtype='number']", caap.caapDivObject).each(function() {
                    this.type = 'number';
                });
            }
            */

            state.setItem('caapPause', 'block');
        },

        RestartListener: function (e) {
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

            /*
            $j(":input[data-subtype='number']", caap.caapDivObject).each(function() {
                this.type = 'text';
            });
            */

            $j('#unlockMenu', caap.caapDivObject).attr('checked', false);
            state.setItem('caapPause', 'none');
            state.setItem('ReleaseControl', true);
            state.setItem('resetselectMonster', true);
            caap.waitingForDomLoad = false;
        },

        ResetMenuLocationListener: function (e) {
            var caap_divXY = {},
                caap_topXY = {};

            state.deleteItem('caap_div_menuLeft');
            state.deleteItem('caap_div_menuTop');
            state.deleteItem('caap_div_zIndex');
            caap.controlXY.x = '';
            caap.controlXY.y = $j(caap.controlXY.selector).offset().top;
            caap_divXY = caap.GetControlXY(true);
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
            caap_topXY = caap.GetDashboardXY(true);
            caap.caapTopObject.css({
                'cursor' : '',
                'z-index' : '1',
                'top' : caap_topXY.y + 'px',
                'left' : caap_topXY.x + 'px'
            });

            $j(":input[id^='caap_']", caap.caapDivObject).attr({disabled: false});
            $j(":input[id^='caap_']", caap.caapTopObject).attr({disabled: false});
        },

        FoldingBlockListener: function (e) {
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
                $u.error("ERROR in FoldingBlockListener: " + err);
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

        arenaEngageListener: function (event) {
            $u.log(4, "engage arena_battle.php");
            state.setItem('clickUrl', caap.domain.link + '/arena_battle.php');
            schedule.setItem('clickedOnSomething', 0);
            caap.waitingForDomLoad = true;
        },

        arenaDualListener: function (event) {
            var index  = -1,
                minion = {};

            $u.log(4, "engage arena_battle.php", event.target.id);
            index = event.target.id ? event.target.id.parseInt() : -1;
            minion = arena.getMinion(index);
            minion = !$j.isEmptyObject(minion) ? minion : {};
            state.setItem('ArenaMinionAttacked', minion);
            state.setItem('clickUrl', caap.domain.link + '/arena_battle.php');
            schedule.setItem('clickedOnSomething', 0);
            caap.waitingForDomLoad = true;
        },

        guildMonsterEngageListener: function (event) {
            $u.log(4, "engage guild_battle_monster.php");
            state.setItem('clickUrl', caap.domain.link + '/guild_battle_monster.php');
            schedule.setItem('clickedOnSomething', 0);
            caap.waitingForDomLoad = true;
        },

        windowResizeListener: function (e) {
            if (caap.domain.which >= 0) {
                var caap_divXY = caap.GetControlXY(),
                    caap_topXY = caap.GetDashboardXY();

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
            //$u.log(3, "goldTimeListenerr", tArr[0] + ":" + (tArr[1] < 10 ? '0' + tArr[1] : tArr[1]));
        },

        energyListener: function (e) {
            var num = $u.setContent($u.setContent($j(e.target).text(), '').parseInt(), -1);
            if (num < 0 || $u.isNaN(num)) {
                return;
            }

            caap.stats['energy'] = $u.setContent(caap.GetStatusNumbers(num + "/" + caap.stats['energy']['max']), caap.stats['energy']);
            caap.stats['energyT'] = $u.setContent(caap.GetStatusNumbers(num + "/" + caap.stats['energyT']['max']), caap.stats['energy']);
            //$u.log(3, "energyListener", num);
        },

        healthListener: function (e) {
            var num = $u.setContent($u.setContent($j(e.target).text(), '').parseInt(), -1);
            if (num < 0 || $u.isNaN(num)) {
                return;
            }

            caap.stats['health'] = $u.setContent(caap.GetStatusNumbers(num + "/" + caap.stats['health']['max']), caap.stats['health']);
            caap.stats['healthT'] = $u.setContent(caap.GetStatusNumbers(num + "/" + caap.stats['healthT']['max']), caap.stats['healthT']);
            //$u.log(3, "healthListener", num);
        },

        staminaListener: function (e) {
            var num = $u.setContent($u.setContent($j(e.target).text(), '').parseInt(), -1);
            if (num < 0 || $u.isNaN(num)) {
                return;
            }

            caap.stats['stamina'] = $u.setContent(caap.GetStatusNumbers(num + "/" + caap.stats['stamina']['max']), caap.stats['stamina']);
            caap.stats['staminaT'] = $u.setContent(caap.GetStatusNumbers(num + "/" + caap.stats['staminaT']['max']), caap.stats['staminaT']);
            //$u.log(3, "staminaListener", num);
        },
        /*jslint sub: false */

        targetList: [
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
            "guild_current_battles",
            "guild_current_monster_battles",
            "guild_battle_monster",
            "guild_monster_summon_list",
            "arena",
            "arena_battle",
            "specialmembership"
        ],

        globalContainer: {},

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        AddListeners: function () {
            try {
                if (!$u.hasContent(caap.caapDivObject)) {
                    throw "Unable to find div for caap_div";
                }

                $j(window).bind('resize', caap.windowResizeListener);
                $j('input:checkbox[id^="caap_"]', caap.caapDivObject).change(caap.CheckBoxListener);
                $j('input[data-subtype="text"]', caap.caapDivObject).change(caap.TextBoxListener);
                $j('input[data-subtype="color"]', caap.caapDivObject).keyup(caap.ColorBoxListener).change(caap.ColorBoxChangeListener).click(caap.ColorBoxClickListener);
                $j('input[data-subtype="number"]', caap.caapDivObject).change(caap.NumberBoxListener);
                $j('#unlockMenu', caap.caapDivObject).change(caap.CheckBoxListener);
                $j('select[id^="caap_"]', caap.caapDivObject).change(caap.DropBoxListener);
                $j('textarea[id^="caap_"]', caap.caapDivObject).change(caap.TextAreaListener);
                $j('a[id^="caap_Switch"]', caap.caapDivObject).click(caap.FoldingBlockListener);
                $j('#caap_FillArmy', caap.caapDivObject).click(function (e) {
                    state.setItem("FillArmy", true);
                    state.setItem("ArmyCount", 0);
                    state.setItem('FillArmyList', []);
                    state.setItem(caap.friendListType.giftc.name + 'Responded', []);
                    state.setItem(caap.friendListType.facebook.name + 'Responded', false);

                });

                $j('#caap_ResetMenuLocation', caap.caapDivObject).click(caap.ResetMenuLocationListener);
                $j('#caap_resetElite', caap.caapDivObject).click(function (e) {
                    schedule.setItem('AutoEliteGetList', 0);
                    schedule.setItem('AutoEliteReqNext', 0);
                    state.setItem('AutoEliteEnd', '');
                    if (!state.getItem('FillArmy', false)) {
                        state.setItem(caap.friendListType.giftc.name + 'Requested', false);
                        state.setItem(caap.friendListType.giftc.name + 'Responded', []);
                    }
                });

                $j('#caapRestart', caap.caapDivObject).click(caap.RestartListener);
                $j('#caap_control', caap.caapDivObject).mousedown(caap.PauseListener);
                $j('#stopAutoQuest', caap.caapDivObject).click(function (e) {
                    $u.log(1, 'Change: setting stopAutoQuest and go to Manual');
                    caap.ManualAutoQuest();
                });

                caap.globalContainer = $j('#' + caap.domain.id[caap.domain.which] + 'globalContainer');
                if (!$u.hasContent(caap.globalContainer)) {
                    throw 'Global Container not found';
                }

                // Fires when CAAP navigates to new location
                $j('a', caap.globalContainer).bind('click', caap.whatClickedURLListener);
                $j("div[id*='friend_box_']", caap.globalContainer).bind('click', caap.whatFriendBox);
                $j("input[src*='dragon_list_btn_']", caap.globalContainer).bind('click', caap.guildMonsterEngageListener);
                $j("input[src*='battle_enter_battle']", caap.globalContainer).bind('click', caap.arenaEngageListener);
                $j("div[style*='arena3_newsfeed']", caap.globalContainer).bind('click', caap.arenaEngageListener);
                $j("input[src*='monster_duel_button']", caap.globalContainer).each(function (index) {
                    $j(this).attr("id", index).bind('click', caap.arenaDualListener);
                });

                $j("input[src*='guild_duel_button']", caap.globalContainer).bind('click', caap.guildMonsterEngageListener);
                $j("span[id*='gold_time_value']", caap.globalContainer).bind('DOMSubtreeModified', caap.goldTimeListener);
                $j("span[id*='energy_current_value']", caap.globalContainer).bind('DOMSubtreeModified', caap.energyListener);
                $j("span[id*='stamina_current_value']", caap.globalContainer).bind('DOMSubtreeModified', caap.staminaListener);
                $j("span[id*='health_current_value']", caap.globalContainer).bind('DOMSubtreeModified', caap.healthListener);

                caap.globalContainer.bind('DOMNodeInserted', function (event) {
                    var tId = $u.hasContent(event.target.id) ? event.target.id.replace('app46755028429_', '') : event.target.id;

                    // Uncomment this to see the id of domNodes that are inserted

                    /*
                    if (event.target.id && !event.target.id.match(/globalContainer/) && !event.target.id.match(/time/i) && !event.target.id.match(/ticker/i) && !event.target.id.match(/caap/i)) {
                        caap.SetDivContent('debug2_mess', tId);
                        alert(event.target.id);
                    }
                    */

                    if (caap.targetList.hasIndexOf(tId)) {
                        $u.log(4, "Refreshing DOM Listeners", event.target.id);
                        caap.waitingForDomLoad = false;
                        $j('a', caap.globalContainer).unbind('click', caap.whatClickedURLListener).bind('click', caap.whatClickedURLListener);
                        $j("div[id*='friend_box_']", caap.globalContainer).unbind('click', caap.whatFriendBox).bind('click', caap.whatFriendBox);
                        $j("span[id*='gold_time_value']", caap.globalContainer).unbind('DOMSubtreeModified', caap.goldTimeListener).bind('DOMSubtreeModified', caap.goldTimeListener);
                        $j("span[id*='energy_current_value']", caap.globalContainer).unbind('DOMSubtreeModified', caap.energyListener).bind('DOMSubtreeModified', caap.energyListener);
                        $j("span[id*='stamina_current_value']", caap.globalContainer).unbind('DOMSubtreeModified', caap.staminaListener).bind('DOMSubtreeModified', caap.staminaListener);
                        $j("span[id*='health_current_value']", caap.globalContainer).unbind('DOMSubtreeModified', caap.healthListener).bind('DOMSubtreeModified', caap.healthListener);
                        caap.IncrementPageLoadCounter();
                        if (config.getItem('HideAdsIframe', false)) {
                            $j("iframe[name*='fb_iframe']").eq(0).parent().css('display', 'none');
                        }

                        window.setTimeout(caap.CheckResults, 100);
                    }

                    // Reposition the dashboard
                    if (event.target.id === caap.dashboardXY.selector.replace("#", '')) {
                        caap.caapTopObject.css('left', caap.GetDashboardXY().x + 'px');
                    }
                });

                return true;
            } catch (err) {
                $u.error("ERROR in AddListeners: " + err);
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
                CheckResultsFunction: 'CheckResults_index'
            },
            'index': {
                signaturePic: 'gif',
                CheckResultsFunction: 'CheckResults_index'
            },
            'battle_monster': {
                signaturePic: 'tab_monster_list_on.gif',
                CheckResultsFunction: 'CheckResults_fightList',
                subpages: ['onMonster']
            },
            'onMonster': {
                signaturePic: 'tab_monster_active.gif',
                CheckResultsFunction: 'CheckResults_viewFight'
            },
            'raid': {
                signaturePic: 'tab_raid_on.gif',
                CheckResultsFunction: 'CheckResults_fightList',
                subpages: ['onRaid']
            },
            'onRaid': {
                signaturePic: 'raid_map',
                CheckResultsFunction : 'CheckResults_viewFight'
            },
            'land': {
                signaturePic: 'tab_land_on.gif',
                CheckResultsFunction: 'CheckResults_land'
            },
            'generals': {
                signaturePic: 'tab_generals_on.gif',
                CheckResultsFunction: 'CheckResults_generals'
            },
            'quests': {
                signaturePic: 'tab_quest_on.gif',
                CheckResultsFunction: 'CheckResults_quests',
                subpages: ['earlyQuest']
            },
            'earlyQuest': {
                signaturePic: 'quest_back_1.jpg',
                CheckResultsFunction: 'CheckResults_quests'
            },
            'symbolquests': {
                signaturePic: 'demi_quest_on.gif',
                CheckResultsFunction: 'CheckResults_quests'
            },
            'monster_quests': {
                signaturePic: 'tab_atlantis_on.gif',
                CheckResultsFunction: 'CheckResults_quests'
            },
            'gift_accept': {
                signaturePic: 'gif',
                CheckResultsFunction: 'CheckResults_gift_accept'
            },
            'army': {
                signaturePic: 'invite_on.gif',
                CheckResultsFunction: 'CheckResults_army'
            },
            'keep': {
                signaturePic: 'tab_stats_on.gif',
                CheckResultsFunction: 'CheckResults_keep'
            },
            'oracle': {
                signaturePic: 'oracle_on.gif',
                CheckResultsFunction: 'CheckResults_oracle'
            },
            'alchemy': {
                signaturePic: 'tab_alchemy_on.gif',
                CheckResultsFunction: 'CheckResults_alchemy'
            },
            'battlerank': {
                signaturePic: 'tab_battle_rank_on.gif',
                CheckResultsFunction: 'CheckResults_battlerank'
            },
            'war_rank': {
                signaturePic: 'tab_war_on.gif',
                CheckResultsFunction: 'CheckResults_war_rank'
            },
            'achievements': {
                signaturePic: 'tab_achievements_on.gif',
                CheckResultsFunction: 'CheckResults_achievements'
            },
            'battle': {
                signaturePic: 'battle_on.gif',
                CheckResultsFunction: 'CheckResults_battle'
            },
            'soldiers': {
                signaturePic: 'tab_soldiers_on.gif',
                CheckResultsFunction: 'CheckResults_soldiers'
            },
            'item': {
                signaturePic: 'tab_black_smith_on.gif',
                CheckResultsFunction: 'CheckResults_item'
            },
            'magic': {
                signaturePic: 'tab_magic_on.gif',
                CheckResultsFunction: 'CheckResults_magic'
            },
            'gift': {
                signaturePic: 'tab_gifts_on.gif',
                CheckResultsFunction: 'CheckResults_gift'
            },
            'goblin_emp': {
                signaturePic: 'emporium_cancel.gif',
                CheckResultsFunction: 'CheckResults_goblin_emp'
            },
            'view_class_progress': {
                signaturePic: 'nm_class_whole_progress_bar.jpg',
                CheckResultsFunction: 'CheckResults_view_class_progress'
            },
            'guild': {
                signaturePic: 'tab_guild_main_on.gif',
                CheckResultsFunction: 'CheckResults_guild'
            },
            'guild_current_battles': {
                signaturePic: 'tab_guild_current_battles_on.gif',
                CheckResultsFunction: 'CheckResults_guild_current_battles'
            },
            'guild_current_monster_battles': {
                signaturePic: 'guild_monster_tab_on.jpg',
                CheckResultsFunction: 'CheckResults_guild_current_monster_battles'
            },
            'guild_battle_monster': {
                signatureId: 'guild_battle_banner_section',
                CheckResultsFunction: 'CheckResults_guild_battle_monster'
            },
            'arena': {
                signaturePic: 'tab_arena_on.gif',
                CheckResultsFunction: 'CheckResults_arena'
            },
            'arena_battle': {
                signatureId: 'arena_battle_banner_section',
                CheckResultsFunction: 'CheckResults_arena_battle'
            },
            'army_member': {
                signaturePic: 'view_army_on.gif',
                CheckResultsFunction: 'CheckResults_army_member'
            }
        },

        AddExpDisplay: function () {
            try {
                var enlDiv = $j("#caap_enl", caap.globalContainer);
                enlDiv = $u.hasContent(enlDiv) ? enlDiv.html(caap.stats['exp']['dif']) : $j("#" + caap.domain.id[caap.domain.which] + "st_2_5 strong", caap.globalContainer).prepend("(<span id='caap_enl' style='color:red'>" + caap.stats['exp']['dif'] + "</span>) ");
                if (!$u.hasContent(enlDiv)) {
                    $u.warn("Unable to get experience array");
                }

                caap.SetDivContent('exp_mess', "Experience to next level: " + caap.stats['exp']['dif']);
                return true;
            } catch (err) {
                $u.error("ERROR in AddExpDisplay: " + err);
                return false;
            }
        },

        CheckResults: function () {
            try {
                // Check page to see if we should go to a page specific check function
                // todo find a way to verify if a function exists, and replace the array with a check_functionName exists check
                if (!schedule.check('CheckResultsTimer')) {
                    return false;
                }

                schedule.setItem('CheckResultsTimer', 1);
                caap.appBodyDiv = $j("#" + caap.domain.id[caap.domain.which] + "app_body", caap.globalContainer);
                caap.battlePage = caap.stats['level'] < 10 ? 'battle_train,battle_off' : 'battle';
                caap.pageLoadOK = caap.GetStats();
                if (!caap.pageLoadOK) {
                    return true;
                }

                var pageUrl         = '',
                    page            = 'none',
                    pageTemp        = '',
                    pageUser        = 0,
                    sigImage        = '',
                    resultsText     = '',
                    resultsFunction = '',
                    demiPointsFirst = false,
                    whenMonster     = '',
                    it              = 0,
                    len             = 0;

                pageUrl = state.getItem('clickUrl', '');
                if ($u.hasContent(pageUrl)) {
                    page = pageUrl.basename(".php");
                    if (page === 'keep') {
                        pageUser = pageUrl.regex(/user=(\d+)/);
                        pageUser = $u.setContent(pageUser, 0);
                    }
                }

                state.setItem('pageUserCheck', pageUser);
                if ($u.hasContent(page) && $u.hasContent(caap.pageList[page]) && $u.hasContent(caap.pageList[page].subpages)) {
                    for (it = 0, len = caap.pageList[page].subpages.length; it < len; it += 1) {
                        if ($u.hasContent($j("img[src*='" + caap.pageList[caap.pageList[page].subpages[it]].signaturePic + "']", caap.appBodyDiv))) {
                            page = caap.pageList[page].subpages[it];
                            break;
                        }
                    }
                }

                state.setItem('page', page);
                resultsText = $j("#" + caap.domain.id[caap.domain.which] + "results_main_wrapper span[class*='result_body']", caap.appBodyDiv).text().trim();
                if ($u.hasContent(caap.pageList[page])) {
                    $u.log(2, 'Checking results for', page);
                    if ($u.isFunction(caap[caap.pageList[page].CheckResultsFunction])) {
                        caap[caap.pageList[page].CheckResultsFunction](resultsText);
                    } else {
                        $u.warn('Check Results function not found', caap.pageList[page]);
                    }
                } else {
                    $u.log(2, 'No results check defined for', page);
                }

                // Check for Elite Guard Add image
                if (!config.getItem('AutoEliteIgnore', false) && state.getItem('AutoEliteEnd', 'NoArmy') !== 'NoArmy' && caap.HasImage('elite_guard_add')) {
                    schedule.setItem('AutoEliteGetList', 0);
                }

                // Information updates
                caap.UpdateDashboard();
                caap.AddExpDisplay();
                caap.SetDivContent('level_mess', 'Expected next level: ' + $u.makeTime(caap.stats['indicators']['enl'], schedule.timeStr(true)));
                demiPointsFirst = config.getItem('DemiPointsFirst', false);
                whenMonster = config.getItem('WhenMonster', 'Never');
                if ((demiPointsFirst && whenMonster !== 'Never') || config.getItem('WhenBattle', 'Never') === 'Demi Points Only') {
                    if (state.getItem('DemiPointsDone', true)) {
                        caap.SetDivContent('demipoint_mess', 'Daily Demi Points: Done');
                    } else {
                        if (demiPointsFirst && whenMonster !== 'Never') {
                            caap.SetDivContent('demipoint_mess', 'Daily Demi Points: First');
                        } else {
                            caap.SetDivContent('demipoint_mess', 'Daily Demi Points: Only');
                        }
                    }
                } else {
                    caap.SetDivContent('demipoint_mess', '');
                }

                if (schedule.check('BlessingTimer')) {
                    caap.SetDivContent('demibless_mess', 'Demi Blessing = none');
                } else {
                    caap.SetDivContent('demibless_mess', 'Next Demi Blessing: ' + $u.setContent(schedule.display('BlessingTimer'), "Unknown"));
                }

                if ($u.hasContent(general.List) && general.List.length <= 2) {
                    schedule.setItem("generals", 0);
                    schedule.setItem("allGenerals", 0);
                    caap.CheckGenerals();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults: " + err);
                return false;
            }
        },

        CheckResults_generals: function () {
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

                schedule.setItem("generals", gm.getItem("CheckGenerals", 24, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_generals: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          GET STATS
        // Functions that records all of base game stats, energy, stamina, etc.
        /////////////////////////////////////////////////////////////////////

        // text in the format '123/234'
        GetStatusNumbers: function (text) {
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
                $u.error("ERROR in GetStatusNumbers: " + err);
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
                    'valhalla'    : 0
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


        LoadStats: function (FBID, AccName) {
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

        SaveStats: function () {
            gm.setItem('stats.record', caap.stats);
            $u.log(4, "Stats", caap.stats);
            state.setItem("UserDashUpdate", true);
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        GetStats: function () {
            try {
                var passed      = true,
                    tempT       = {},
                    tStr        = '',
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
                    caap.stats['energyT'] = caap.GetStatusNumbers($u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+\/\d+)/), "0/0"));
                    caap.stats['energy'] = caap.GetStatusNumbers(caap.stats['energyT']['num'] + "/" + caap.stats['energy']['max']);
                } else {
                    $u.warn("Unable to get energyDiv");
                    passed = false;
                }

                // health
                tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "st_2_3", ststbDiv);
                if ($u.hasContent(tempDiv)) {
                    caap.stats['healthT'] = caap.GetStatusNumbers($u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+\/\d+)/), "0/0"));
                    caap.stats['health'] = caap.GetStatusNumbers(caap.stats['healthT']['num'] + "/" + caap.stats['health']['max']);
                } else {
                    $u.warn("Unable to get healthDiv");
                    passed = false;
                }

                // stamina
                tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "st_2_4", ststbDiv);
                if ($u.hasContent(tempDiv)) {
                    caap.stats['staminaT'] = caap.GetStatusNumbers($u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+\/\d+)/), "0/0"));
                    caap.stats['stamina'] = caap.GetStatusNumbers(caap.stats['staminaT']['num'] + "/" + caap.stats['stamina']['max']);
                } else {
                    $u.warn("Unable to get staminaDiv");
                    passed = false;
                }

                // experience
                tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "st_2_5", ststbDiv);
                if ($u.hasContent(tempDiv)) {
                    caap.stats['exp'] = caap.GetStatusNumbers($u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+\/\d+)/), "0/0"));
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
                    caap.SaveStats();
                }

                if (!passed && caap.stats['energy']['max'] === 0 && caap.stats['health']['max'] === 0 && caap.stats['stamina']['max'] === 0) {
                    $j().alert("<div style='text-align: center;'>" + $u.warn("Paused as this account may have been disabled!", caap.stats) + "</div>");
                    caap.PauseListener();
                }

                return passed;
            } catch (err) {
                $u.error("ERROR GetStats: " + err);
                return false;
            }
        },

        CheckResults_keep: function () {
            try {
                var attrDiv    = $j(".keep_attribute_section", caap.globalContainer),
                    statsTB    = $j(".statsTB", caap.globalContainer),
                    keepTable1 = $j(".keepTable1 tr", statsTB),
                    statCont   = $j(".attribute_stat_container", attrDiv),
                    tempDiv    = $j(),
                    tStr       = '',
                    tNum       = 0;

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
                            caap.stats['energy'] = caap.GetStatusNumbers(caap.stats['energyT']['num'] + '/' + $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0));
                        } else {
                            $u.warn('Using stored energy value.');
                        }

                        // Stamina
                        tempDiv = statCont.eq(1);
                        if ($u.hasContent(tempDiv)) {
                            caap.stats['stamina'] = caap.GetStatusNumbers(caap.stats['staminaT']['num'] + '/' + $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0));
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
                            caap.stats['health'] = caap.GetStatusNumbers(caap.stats['healthT']['num'] + '/' + $u.setContent($u.setContent(tempDiv.text(), '').regex(/(\d+)/), 0));
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
                    caap.stats['other'].atlantis = $u.hasContent(caap.CheckForImage("seamonster_map_finished.jpg")) ? true : false;

                    // Quests Completed
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

                    schedule.setItem("keep", gm.getItem("CheckKeep", 1, hiddenVar) * 3600, 300);
                    caap.SaveStats();
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
                $u.error("ERROR in CheckResults_keep: " + err);
                return false;
            }
        },

        CheckResults_oracle: function () {
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
                    caap.SaveStats();
                } else {
                    $u.warn('Favor Points not matched.');
                }

                schedule.setItem("oracle", gm.getItem("CheckOracle", 24, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_oracle: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        CheckResults_alchemy: function () {
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
                $u.error("ERROR in CheckResults_alchemy: " + err);
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

        CheckResults_soldiers: function () {
            try {
                caap.commonTown();
                town.GetItems("soldiers");
                schedule.setItem("soldiers", gm.getItem("CheckSoldiers", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_soldiers: " + err);
                return false;
            }
        },

        CheckResults_item: function () {
            try {
                caap.commonTown();
                town.GetItems("item");
                schedule.setItem("item", gm.getItem("CheckItem", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_item: " + err);
                return false;
            }
        },

        CheckResults_magic: function () {
            try {
                caap.commonTown();
                town.GetItems("magic");
                schedule.setItem("magic", gm.getItem("CheckMagic", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_magic: " + err);
                return false;
            }
        },

        CheckResults_goblin_emp: function () {
            try {
                if (config.getItem("goblinHinting", true)) {
                    spreadsheet.doTitles(true);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_goblin_emp: " + err);
                return false;
            }
        },

        CheckResults_gift: function () {
            try {
                gifting.gifts.populate();
                schedule.setItem("gift", gm.getItem("CheckGift", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_gift: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        CheckResults_battlerank: function () {
            try {
                var rankDiv = $j("div[style*='battle_rank_banner.jpg']", caap.globalContainer),
                    tNum    = 0;

                if ($u.hasContent(rankDiv)) {
                    tNum = rankDiv.text().regex(/with ([\d,]+) Battle Points/i).numberOnly();
                    if ($u.hasContent(tNum)) {
                        $u.log(2, 'Got Battle Rank Points', tNum);
                        caap.stats['rank']['battlePoints'] = tNum;
                        caap.SaveStats();
                    } else {
                        $u.warn('Battle Rank Points RegExp not matched.');
                    }
                } else {
                    $u.warn('Battle Rank Points div not found.');
                }

                schedule.setItem("battlerank", gm.getItem("CheckBattleRank", 48, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_battlerank: " + err);
                return false;
            }
        },

        CheckResults_war_rank: function () {
            try {
                var rankDiv = $j("div[style*='war_rank_banner.jpg']", caap.globalContainer),
                    tNum    = 0;

                if ($u.hasContent(rankDiv)) {
                    tNum = rankDiv.text().regex(/with ([\d,]+) War Points/i).numberOnly();
                    if ($u.hasContent(tNum)) {
                        $u.log(2, 'Got War Rank Points', tNum);
                        caap.stats['rank']['warPoints'] = tNum;
                        caap.SaveStats();
                    } else {
                        $u.warn('War Rank Points RegExp not matched.');
                    }
                } else {
                    $u.warn('War Rank Points div not found.');
                }

                schedule.setItem("warrank", gm.getItem("CheckWarRank", 48, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_war_rank: " + err);
                return false;
            }
        },

        CheckResults_achievements: function () {
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
                        caap.SaveStats();
                    } else {
                        $u.warn('Battle Achievements problem.');
                    }
                } else {
                    $u.warn('Battle Achievements not found.');
                }

                achDiv = $j("#" + caap.domain.id[caap.domain.which] + "achievements_3", caap.globalContainer);
                if ($u.hasContent(achDiv)) {
                    tdDiv = $j("td div", achDiv);
                    if ($u.hasContent(tdDiv) && tdDiv.length === 15) {
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
                        caap.SaveStats();
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
                        caap.SaveStats();
                    } else {
                        $u.warn('Other Achievements problem.');
                    }
                } else {
                    $u.warn('Other Achievements not found.');
                }

                schedule.setItem("achievements", gm.getItem("CheckAchievements", 72, hiddenVar) * 3600, 300);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_achievements: " + err);
                return false;
            }
        },

        CheckResults_view_class_progress: function () {
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
                            caap.SaveStats();
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
                $u.error("ERROR in CheckResults_view_class_progress: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          QUESTING
        // Quest function does action, DrawQuest sets up the page and gathers info
        /////////////////////////////////////////////////////////////////////

        MaxEnergyQuest: function () {
            try {
                var maxIdleEnergy = 0,
                    theGeneral    = config.getItem('IdleGeneral', 'Use Current');

                if (theGeneral !== 'Use Current') {
                    maxIdleEnergy = $u.setContent(general.GetEnergyMax(theGeneral), 0);
                    if (maxIdleEnergy === 0 || $u.isNaN(maxIdleEnergy)) {
                        $u.log(1, "Changing to idle general to get Max energy");
                        if (general.Select('IdleGeneral')) {
                            return true;
                        }
                    }
                }

                return caap.stats['energy']['num'] >= maxIdleEnergy ? caap.Quests() : false;
            } catch (err) {
                $u.error("ERROR in MaxEnergyQuest: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        QuestAreaInfo: {
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
                area : 'Demi Quests',
                list : 'demiQuestList',
                boss : "Corvintheus",
                orb  : 'Orb of Corvintheus'
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
        Quests: function () {
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
                        return caap.RetrieveFromBank(storeRetrieve);
                    }
                }

                caap.SetDivContent('quest_mess', '');
                var whenQuest = config.getItem('WhenQuest', 'Never');
                if (whenQuest === 'Never') {
                    caap.SetDivContent('quest_mess', 'Questing off');
                    return false;
                }

                if (whenQuest === 'Not Fortifying' || (config.getItem('PrioritiseMonsterAfterLvl', false) && state.getItem('KeepLevelUpGeneral', false))) {
                    var fortMon = state.getItem('targetFromfortify', new monster.energyTarget().data);
                    if ($j.isPlainObject(fortMon) && fortMon['name'] && fortMon['type']) {
                        switch (fortMon['type']) {
                        case "Fortify":
                            var maxHealthtoQuest = config.getItem('MaxHealthtoQuest', 0);
                            if (!maxHealthtoQuest) {
                                caap.SetDivContent('quest_mess', '<span style="font-weight: bold;">No valid over fortify %</span>');
                                return false;
                            }

                            caap.SetDivContent('quest_mess', 'No questing until attack target ' + fortMon['name'] + " health exceeds " + config.getItem('MaxToFortify', 0) + '%');
                            var targetFrombattle_monster = state.getItem('targetFrombattle_monster', '');
                            if (!targetFrombattle_monster) {
                                var currentMonster = monster.getItem(targetFrombattle_monster);
                                if (!currentMonster['fortify']) {
                                    if (currentMonster['fortify'] < maxHealthtoQuest) {
                                        caap.SetDivContent('quest_mess', 'No questing until fortify target ' + targetFrombattle_monster + ' health exceeds ' + maxHealthtoQuest + '%');
                                        return false;
                                    }
                                }
                            }

                            break;
                        case "Strengthen":
                            caap.SetDivContent('quest_mess', 'No questing until attack target ' + fortMon['name'] + " at full strength.");
                            break;
                        case "Stun":
                            caap.SetDivContent('quest_mess', 'No questing until attack target ' + fortMon['name'] + " stunned.");
                            break;
                        default:
                        }

                        return false;
                    }
                }

                var autoQuestName = state.getItem('AutoQuest', caap.newAutoQuest())['name'];
                if (!autoQuestName) {
                    if (config.getItem('WhyQuest', 'Manual') === 'Manual') {
                        caap.SetDivContent('quest_mess', 'Pick quest manually.');
                        return false;
                    }

                    caap.SetDivContent('quest_mess', 'Searching for quest.');
                    $u.log(1, "Searching for quest");
                } else {
                    var energyCheck = caap.CheckEnergy(state.getItem('AutoQuest', caap.newAutoQuest())['energy'], whenQuest, 'quest_mess');
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
                        var landPic = caap.QuestAreaInfo[subQArea].base;
                        if (landPic === 'tab_heaven' || config.getItem('GetOrbs', false) && config.getItem('WhyQuest', 'Manual') !== 'Manual') {
                            if (caap.CheckMagic()) {
                                return true;
                            }
                        }

                        if (landPic === 'tab_underworld' || landPic === 'tab_ivory' || landPic === 'tab_earth2' || landPic === 'tab_water2') {
                            imgExist = caap.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '_small.gif', landPic + '_big');
                        } else if (landPic === 'tab_heaven') {
                            imgExist = caap.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '_small2.gif', landPic + '_big2.gif');
                        } else if ((landPic === 'land_demon_realm') || (landPic === 'land_undead_realm')) {
                            imgExist = caap.NavigateTo('quests,jobs_tab_more.gif,' + landPic + '.gif', landPic + '_sel');
                        } else {
                            imgExist = caap.NavigateTo('quests,jobs_tab_back.gif,' + landPic + '.gif', landPic + '_sel');
                        }
                    } else {
                        imgExist = caap.NavigateTo('quests', 'quest_back_1.jpg');
                    }

                    if (imgExist) {
                        return true;
                    }

                    break;
                case 'Demi Quests' :
                    if (caap.NavigateTo('quests,symbolquests', 'demi_quest_on.gif')) {
                        return true;
                    }

                    var subDQArea = config.getItem('QuestSubArea', 'Ambrosia');
                    var picSlice = $j("img[src*='deity_" + caap.demiQuestTable[subDQArea] + "']");
                    if (picSlice.css("height") !== '160px') {
                        if (caap.NavigateTo('deity_' + caap.demiQuestTable[subDQArea])) {
                            return true;
                        }
                    }

                    break;
                case 'Atlantis' :
                    if (!caap.HasImage('tab_atlantis_on.gif')) {
                        return caap.NavigateTo('quests,monster_quests');
                    }

                    break;
                default :
                }

                var button = caap.CheckForImage('quick_switch_button.gif');
                if ($u.hasContent(button) && !config.getItem('ForceSubGeneral', false)) {
                    $u.log(2, 'Clicking on quick switch general button.');
                    caap.Click(button);
                    general.quickSwitch = true;
                    return true;
                }

                if (general.quickSwitch) {
                    general.GetEquippedStats();
                }

                var costToBuy = 0;
                //Buy quest requires popup
                var itemBuyPopUp = $j("form[id*='itemBuy']");
                if (itemBuyPopUp && itemBuyPopUp.length) {
                    $u.log(1, 'itemBuy');
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
                            return caap.RetrieveFromBank(costToBuy - caap.stats['gold']['cash']);
                        } else {
                            $u.log(1, "Cant buy requires, stopping quest");
                            caap.ManualAutoQuest();
                            return false;
                        }
                    }

                    button = caap.CheckForImage('quick_buy_button.jpg');
                    if ($u.hasContent(button)) {
                        $u.log(1, 'Clicking on quick buy button.');
                        caap.Click(button);
                        return true;
                    }

                    $u.warn("Cant find buy button");
                    return false;
                }

                button = caap.CheckForImage('quick_buy_button.jpg');
                if ($u.hasContent(button)) {
                    $u.log(1, 'quick_buy_button');
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
                            return caap.RetrieveFromBank(costToBuy - caap.stats['gold']['cash']);
                        } else {
                            $u.log(1, "Cant buy General, stopping quest");
                            caap.ManualAutoQuest();
                            return false;
                        }
                    }

                    $u.log(2, 'Clicking on quick buy general button.');
                    caap.Click(button);
                    return true;
                }

                var autoQuestDivs = {
                        name     : '',
                        click    : $j(),
                        tr       : $j(),
                        genDiv   : $j(),
                        orbCheck : false
                    };

                autoQuestDivs = caap.CheckResults_quests(true);
                //$u.log(1, 'autoQuestDivs/autoQuestName', autoQuestDivs, autoQuestName);
                if (!autoQuestDivs.name) {
                    $u.log(1, 'Could not find AutoQuest.');
                    caap.SetDivContent('quest_mess', 'Could not find AutoQuest.');
                    return false;
                }

                if (autoQuestDivs.name !== autoQuestName) {
                    $u.log(1, 'New AutoQuest found.');
                    caap.SetDivContent('quest_mess', 'New AutoQuest found.');
                    return true;
                }

                // if found missing requires, click to buy
                if (autoQuestDivs.tr && autoQuestDivs.tr.length) {
                    var background = $j("div[style*='background-color']", autoQuestDivs.tr);
                    if (background && background.length && background.css("background-color") === 'rgb(158, 11, 15)') {
                        $u.log(1, "Missing item", autoQuestDivs.tr);
                        if (config.getItem('QuestSubArea', 'Atlantis') === 'Atlantis') {
                            $u.log(1, "Cant buy Atlantis items, stopping quest");
                            caap.ManualAutoQuest();
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
                            caap.Click(background.children().eq(0).children().eq(0));
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
                        if (autoQuestDivs.genDiv && autoQuestDivs.genDiv.length) {
                            $u.log(2, 'Clicking on general', questGeneral);
                            caap.Click(autoQuestDivs.genDiv);
                            return true;
                        } else {
                            $u.warn('Can not click on general', questGeneral);
                            return false;
                        }
                    }
                }

                if (autoQuestDivs.click && autoQuestDivs.click) {
                    $u.log(2, 'Clicking auto quest', autoQuestName);
                    state.setItem('ReleaseControl', true);
                    caap.Click(autoQuestDivs.click);
                    caap.ShowAutoQuest();
                    if (autoQuestDivs.orbCheck) {
                        schedule.setItem("magic", 0);
                    }

                    return true;
                } else {
                    $u.warn('Can not click auto quest', autoQuestName);
                    return false;
                }
            } catch (err) {
                $u.error("ERROR in Quests: " + err);
                return false;
            }
        },

        questName: null,

        CheckResults_symbolquests: function (resultsText) {
            try {
                var demiDiv = $j(),
                    points  = [],
                    success = true;

                if ($u.hasContent(resultsText)) {
                    caap.BlessingResults(resultsText);
                }

                demiDiv = $j("div[id*='" + caap.domain.id[caap.domain.which] + "symbol_desc_symbolquests']");
                if (demiDiv && demiDiv.length === 5) {
                    demiDiv.each(function () {
                        var text = '',
                            num  = 0;

                        text = $j(this).children().next().eq(1).children().children().next().text();
                        if ($u.hasContent(text)) {
                            num = text.numberOnly();
                            points.push(num);
                        } else {
                            success = false;
                            $u.warn('Demi-Power text problem');
                        }
                    });

                    $u.log(4, 'Points', points);
                    if (success) {
                        caap.demi['ambrosia']['power']['total'] = $u.setContent(points[0], 0);
                        caap.demi['malekus']['power']['total'] = $u.setContent(points[1], 0);
                        caap.demi['corvintheus']['power']['total'] = $u.setContent(points[2], 0);
                        caap.demi['aurora']['power']['total'] = $u.setContent(points[3], 0);
                        caap.demi['azeron']['power']['total'] = $u.setContent(points[4], 0);
                        schedule.setItem("symbolquests", gm.getItem("CheckSymbolQuests", 24, hiddenVar) * 3600, 300);
                        caap.SaveDemi();
                    }
                } else {
                    $u.warn("Demi demiDiv problem", demiDiv);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_symbolquests: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        isBossQuest: function (name) {
            try {
                var qn    = '',
                    found = false;

                for (qn in caap.QuestAreaInfo) {
                    if (caap.QuestAreaInfo.hasOwnProperty(qn)) {
                        if (caap.QuestAreaInfo[qn].boss && caap.QuestAreaInfo[qn].boss === name) {
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
            $u.log(4, "symbolquests");
            state.setItem('clickUrl', caap.domain.link + '/symbolquests.php');
            caap.CheckResults();
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        CheckResults_quests: function (pickQuestTF) {
            try {
                //$u.log(1, "CheckResults_quests pickQuestTF", pickQuestTF);
                pickQuestTF = pickQuestTF ? pickQuestTF : false;
                if ($u.hasContent($j("#" + caap.domain.id[caap.domain.which] + "quest_map_container", caap.globalContainer))) {
                    $j("div[id*='" + caap.domain.id[caap.domain.which] + "meta_quest_']", caap.globalContainer).each(function (index) {
                        var row = $j(this);
                        if (!($u.hasContent($j("img[src*='_completed']", row)) || $u.hasContent($j("img[src*='_locked']", row)))) {
                            $j("div[id='" + caap.domain.id[caap.domain.which] + "quest_wrapper_" + row.attr("id").replace(caap.domain.id[caap.domain.which] + "meta_quest_", '') + "']", caap.globalContainer).css("display", "block");
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

                if (caap.HasImage('demi_quest_on.gif')) {
                    caap.CheckResults_symbolquests($u.isString(pickQuestTF) ? pickQuestTF : undefined);
                    $j("div[id*='" + caap.domain.id[caap.domain.which] + "symbol_tab_symbolquests']", caap.globalContainer).unbind('click', caap.symbolquestsListener).bind('click', caap.symbolquestsListener);
                    ss = $j("div[id*='symbol_displaysymbolquest']", caap.globalContainer);
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
                    div = $j(document.body);
                }

                ss = $j("div[class*='quests_background']", div);
                if (!$u.hasContent(ss)) {
                    $u.warn("Failed to find quests_background");
                    return false;
                }

                var haveOrb      = false,
                    isTheArea    = false,
                    questSubArea = '';

                questSubArea = config.getItem('QuestSubArea', 'Land of Fire');
                isTheArea = caap.CheckCurrentQuestArea(questSubArea);
                $u.log(2, "Is quest area", questSubArea, isTheArea);
                if (isTheArea && whyQuest !== 'Manual' && config.getItem('GetOrbs', false)) {
                    if ($u.hasContent($j("input[alt='Perform Alchemy']"))) {
                        haveOrb = true;
                    } else {
                        if (questSubArea && caap.QuestAreaInfo[questSubArea].orb) {
                            haveOrb = town.haveOrb(caap.QuestAreaInfo[questSubArea].orb);
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

                $j("div[class='autoquest']", caap.globalContainer).remove();
                var expRegExp       = new RegExp("\\+(\\d+)"),
                    energyRegExp    = new RegExp("(\\d+)\\s+energy", "i"),
                    moneyRegExp     = new RegExp("\\$([0-9,]+)\\s*-\\s*\\$([0-9,]+)", "i"),
                    money2RegExp    = new RegExp("\\$([0-9,]+)mil\\s*-\\s*\\$([0-9,]+)mil", "i"),
                    influenceRegExp = new RegExp("(\\d+)%");

                ss.each(function () {
                    div = $j(this);
                    caap.questName = caap.GetQuestName(div);
                    if (!caap.questName) {
                        return true;
                    }

                    var reward     = null,
                        energy     = null,
                        experience = null,
                        divTxt     = '',
                        expM       = [],
                        tStr       = '';

                    divTxt = div.text();
                    expM = divTxt ? divTxt.match(expRegExp) : [];
                    if (expM && expM.length === 2) {
                        experience = expM[1] ? expM[1].numberOnly() : 0;
                    } else {
                        var expObj = $j("div[class='quest_experience']", caap.globalContainer);
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
                        var eObj = $j("div[class*='quest_req']", div);
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

                    var click = $j("input[name*='Do Quest']", div);
                    if (!$u.hasContent(click)) {
                        $u.warn('No button found for', caap.questName);
                        return true;
                    }

                    var influence = -1;
                    if (caap.isBossQuest(caap.questName)) {
                        if ($u.hasContent($j("div[class='quests_background_sub']", caap.globalContainer))) {
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
                        genDiv = $j("div[class*='quest_act_gen']", div);
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

                    caap.LabelQuests(div, energy, reward, experience, click);
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
                            $u.log(4, "CheckResults_quests", state.getItem('AutoQuest', caap.newAutoQuest()));
                            caap.ShowAutoQuest();
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
                        caap.ShowAutoQuest();
                        return autoQuestDivs;
                    }

                    //if not find quest, probably you already maxed the subarea, try another area
                    if ((whyQuest === 'Max Influence' || whyQuest === 'Advancement') && config.getItem('switchQuestArea', true)) {
                        $u.log(9, "QuestSubArea", questSubArea);
                        if (questSubArea && caap.QuestAreaInfo[questSubArea] && caap.QuestAreaInfo[questSubArea].next) {
                            questSubArea = config.setItem('QuestSubArea', caap.QuestAreaInfo[questSubArea].next);
                            if (caap.QuestAreaInfo[questSubArea].area && caap.QuestAreaInfo[questSubArea].list) {
                                config.setItem('QuestArea', caap.QuestAreaInfo[questSubArea].area);
                                caap.ChangeDropDownList('QuestSubArea', caap[caap.QuestAreaInfo[questSubArea].list]);
                            }
                        } else {
                            $u.log(1, "Setting questing to manual");
                            caap.ManualAutoQuest();
                        }

                        $u.log(2, "UpdateQuestGUI: Setting drop down menus");
                        caap.SelectDropOption('QuestArea', config.getItem('QuestArea', 'Quest'));
                        caap.SelectDropOption('QuestSubArea', questSubArea);
                        return false;
                    }

                    $u.log(1, "Finished QuestArea.");
                    caap.ManualAutoQuest();
                }

                return false;
            } catch (err) {
                $u.error("ERROR in CheckResults_quests: " + err);
                caap.ManualAutoQuest();
                return false;
            }
        },

        ClassToQuestArea: {
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
            'symbolquests_stage_1'   : 'Ambrosia',
            'symbolquests_stage_2'   : 'Malekus',
            'symbolquests_stage_3'   : 'Corvintheus',
            'symbolquests_stage_4'   : 'Aurora',
            'symbolquests_stage_5'   : 'Azeron',
            'monster_quests_stage_1' : 'Atlantis'
        },

        CheckCurrentQuestArea: function (QuestSubArea) {
            try {
                var found = false;

                if (caap.stats['level'] < 8) {
                    if (caap.HasImage('quest_back_1.jpg')) {
                        found = true;
                    }
                } else if (QuestSubArea && caap.QuestAreaInfo[QuestSubArea]) {
                    if ($u.hasContent($j("div[class='" + caap.QuestAreaInfo[QuestSubArea].clas + "']", caap.globalContainer))) {
                        found = true;
                    }
                }

                return found;
            } catch (err) {
                $u.error("ERROR in CheckCurrentQuestArea: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        GetQuestName: function (questDiv) {
            try {
                var item_title = $j("div[class*='quest_desc'],div[class*='quest_sub_title']", questDiv),
                    firstb     = $j();

                if (!$u.hasContent(item_title)) {
                    $u.log(2, "Can't find quest description or sub-title");
                    return false;
                }

                if (/LOCK/.test(item_title.html())) {
                    $u.log(2, "Quest locked", item_title);
                    return false;
                }

                firstb = $j("b", item_title).eq(0);
                if (!$u.hasContent(firstb)) {
                    $u.warn("Can't get bolded member out of", item_title.html());
                    return false;
                }

                caap.questName = firstb.text().trim();
                if (!$u.hasContent(caap.questName)) {
                    $u.warn('No quest name for this row');
                    return false;
                }

                return caap.questName;
            } catch (err) {
                $u.error("ERROR in GetQuestName: " + err);
                return false;
            }
        },

        /*------------------------------------------------------------------------------------\
        CheckEnergy gets passed the default energy requirement plus the condition text from
        the 'Whenxxxxx' setting and the message div name.
        \------------------------------------------------------------------------------------*/
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        CheckEnergy: function (energy, condition, msgdiv) {
            try {
                if (!caap.stats['energy'] || !energy) {
                    return false;
                }

                if (condition === 'Energy Available' || condition === 'Not Fortifying') {
                    if (caap.stats['energy']['num'] >= energy) {
                        return true;
                    }

                    if (msgdiv) {
                        caap.SetDivContent(msgdiv, 'Waiting for more energy: ' + caap.stats['energy']['num'] + "/" + (energy ? energy : ""));
                    }
                } else if (condition === 'At X Energy') {
                    if (caap.InLevelUpMode() && caap.stats['energy']['num'] >= energy) {
                        if (msgdiv) {
                            caap.SetDivContent(msgdiv, 'Burning all energy to level up');
                        }

                        return true;
                    }

                    var whichEnergy = config.getItem('XQuestEnergy', 1);
                    if (caap.stats['energy']['num'] >= whichEnergy) {
                        state.setItem('AtXQuestEnergy', true);
                    }

                    if (caap.stats['energy']['num'] >= energy) {
                        if (state.getItem('AtXQuestEnergy', false) && caap.stats['energy']['num'] >= config.getItem('XMinQuestEnergy', 0)) {
                            caap.SetDivContent(msgdiv, 'At X energy. Burning to ' + config.getItem('XMinQuestEnergy', 0));
                            return true;
                        } else {
                            state.setItem('AtXQuestEnergy', false);
                        }
                    }

                    if (energy > whichEnergy) {
                        whichEnergy = energy;
                    }

                    if (msgdiv) {
                        caap.SetDivContent(msgdiv, 'Waiting for X energy: ' + caap.stats['energy']['num'] + "/" + whichEnergy);
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

                    if (caap.InLevelUpMode() && caap.stats['energy']['num'] >= energy) {
                        if (msgdiv) {
                            $u.log(1, "Burning all energy to level up");
                            caap.SetDivContent(msgdiv, 'Burning all energy to level up');
                        }

                        return true;
                    }

                    if (msgdiv) {
                        caap.SetDivContent(msgdiv, 'Waiting for max energy: ' + caap.stats['energy']['num'] + "/" + maxIdleEnergy);
                    }
                }

                return false;
            } catch (err) {
                $u.error("ERROR in CheckEnergy: " + err);
                return false;
            }
        },

        LabelListener: function (e) {
            try {
                var sps           = e.target.getElementsByTagName('span'),
                    mainDiv       = $j(),
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

                caap.ManualAutoQuest(tempAutoQuest);
                $u.log(5, 'LabelListener', sps, state.getItem('AutoQuest'));
                if (caap.stats['level'] < 8 && caap.HasImage('quest_back_1.jpg')) {
                    config.setItem('QuestArea', 'Quest');
                    config.setItem('QuestSubArea', 'Land of Fire');
                } else {
                    if (caap.HasImage('tab_quest_on.gif')) {
                        config.setItem('QuestArea', 'Quest');
                        caap.SelectDropOption('QuestArea', 'Quest');
                        caap.ChangeDropDownList('QuestSubArea', caap.landQuestList);
                    } else if (caap.HasImage('demi_quest_on.gif')) {
                        config.setItem('QuestArea', 'Demi Quests');
                        caap.SelectDropOption('QuestArea', 'Demi Quests');
                        caap.ChangeDropDownList('QuestSubArea', caap.demiQuestList);
                    } else if (caap.HasImage('tab_atlantis_on.gif')) {
                        config.setItem('QuestArea', 'Atlantis');
                        caap.SelectDropOption('QuestArea', 'Atlantis');
                        caap.ChangeDropDownList('QuestSubArea', caap.atlantisQuestList);
                    }

                    mainDiv = $j("#" + caap.domain.id[caap.domain.which] + "main_bn", caap.globalContainer);
                    if ($u.hasContent(mainDiv)) {
                        className = mainDiv.attr("class");
                        if ($u.hasContent(className) && caap.ClassToQuestArea[className]) {
                            config.setItem('QuestSubArea', caap.ClassToQuestArea[className]);
                        }
                    }
                }

                $u.log(1, 'Setting QuestSubArea to', config.getItem('QuestSubArea', 'Land Of Fire'));
                caap.SelectDropOption('QuestSubArea', config.getItem('QuestSubArea', 'Land Of Fire'));
                caap.ShowAutoQuest();
                caap.CheckResults_quests();
                return true;
            } catch (err) {
                $u.error("ERROR in LabelListener: " + err);
                return false;
            }
        },

        LabelQuests: function (div, energy, reward, experience, click) {
            try {
                if ($u.hasContent($j("div[class='autoquest'", div))) {
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
                    setAutoQuest.addEventListener("click", caap.LabelListener, false);

                    newdiv.appendChild(setAutoQuest);
                }

                newdiv.style.position = 'absolute';
                newdiv.style.background = '#B09060';
                newdiv.style.right = "144px";
                click.parent().before(newdiv);
            } catch (err) {
                $u.error("ERROR in LabelQuests: " + err);
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

        BlessingResults: function (resultsText) {
            var hours   = 0,
                minutes = 0,
                done    = false;

            if (/Please come back in:/.test(resultsText)) {
                // Check time until next Oracle Blessing
                hours = resultsText.regex(/(\d+) hour/);
                hours = $u.isNumber(hours) ? hours : 3;
                minutes = resultsText.regex(/(\d+) minute/);
                minutes = $u.isNumber(minutes) ? minutes : 0;
                done = true;
            } else if (/You have paid tribute to/.test(resultsText)) {
                // Recieved Demi Blessing.  Wait X hours to try again.
                hours = /Azeron/i.test(resultsText) ? 48 : 12;
                done = true;
            }

            if (done) {
                $u.log(2, 'Recorded Blessing Time. Scheduling next click! ' + hours + ':' + minutes);
                schedule.setItem('BlessingTimer', (hours * 60 + minutes) * 60, 300);
            }
        },

        AutoBless: function () {
            var picSlice  = $j(),
                autoBless = '';

            autoBless = config.getItem('AutoBless', 'none').toLowerCase();
            if (autoBless === 'none' || !schedule.check('BlessingTimer')) {
                return false;
            }

            if (caap.NavigateTo('quests,demi_quest_off', 'demi_quest_bless')) {
                return true;
            }

            picSlice = $j("img[src*='deity_" + autoBless + "']", caap.globalContainer);
            if (!$u.hasContent(picSlice)) {
                $u.warn('No diety pics for deity', autoBless);
                return false;
            }

            if (picSlice.css('height') !== '160px') {
                return caap.NavigateTo('deity_' + autoBless);
            }

            picSlice = $j("form[id*='" + caap.domain.id[caap.domain.which] + "symbols_form_" + caap.deityTable[autoBless] + "']", caap.globalContainer);
            if (!$u.hasContent(picSlice)) {
                $u.warn('No form for deity blessing.');
                return false;
            }

            picSlice = caap.CheckForImage('demi_quest_bless', picSlice);
            if (!$u.hasContent(picSlice)) {
                $u.warn('No image for deity blessing.');
                return false;
            }

            $u.log(1, 'Click deity blessing for ', autoBless);
            schedule.setItem('BlessingTimer', 3600, 300);
            caap.Click(picSlice);
            return true;
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
        CheckResults_land: function () {
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

                function SelectLands(div, val, type) {
                    try {
                        type = type ? type : 'Buy';
                        var selects = $j();
                        selects = $j("select", div);
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
                        $u.error("ERROR in SelectLands: " + err);
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

                    SelectLands(row, 10);
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
                                SelectLands(row, selection[s], 'Sell');
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
                $u.error("ERROR in CheckResults_land: " + err);
                return false;
            }
        },

        noLandsLog: true,

        Lands: function () {
            try {
                if (!config.getItem('autoBuyLand', false)) {
                    return false;
                }

                var bestLandCost = {},
                    cashTotAvail = 0,
                    cashNeed     = 0,
                    theGeneral   = '';

                function BuySellLand(land, type) {
                    try {
                        type = type ? type : 'Buy';
                        var button = $j("input[name='" + type + "']", land['row']);
                        if ($u.hasContent(button)) {
                            if (type === 'Buy') {
                                caap.bestLand = state.setItem('BestLandCost', new caap.landRecord().data);
                            } else {
                                caap.sellLand = {};
                            }

                            caap.Click(button, 15000);
                            return true;
                        } else {
                            $u.warn(type + " button not found!");
                            return false;
                        }
                    } catch (err) {
                        $u.error("ERROR in BuySellLand: " + err);
                        return false;
                    }
                }

                // Do we have lands above our max to sell?
                if (!$j.isEmptyObject(caap.sellLand) && config.getItem('SellLands', false)) {
                    $u.log(2, "Selling land", caap.sellLand['name']);
                    BuySellLand(caap.sellLand, 'Sell');
                    return true;
                }

                bestLandCost = state.getItem('BestLandCost', new caap.landRecord().data);
                if (!bestLandCost['set']) {
                    $u.log(2, "Going to land to get Best Land Cost");
                    if (caap.NavigateTo('soldiers,land', caap.HasImage('tab_land_on.gif') ? '' : 'tab_land_on.gif')) {
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
                    if (caap.NavigateTo('keep')) {
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
                    return caap.RetrieveFromBank(cashNeed - caap.stats['gold']['cash']);
                }

                // Need to check for enough moneys + do we have enough of the builton type that we already own.
                if (bestLandCost['cost'] && caap.stats['gold']['cash'] >= cashNeed) {
                    if (theGeneral !== 'Use Current') {
                        $u.log(2, "Changing to idle general");
                        if (general.Select('IdleGeneral')) {
                            return true;
                        }
                    }

                    caap.NavigateTo('soldiers,land');
                    if (caap.HasImage('tab_land_on.gif')) {
                        if (bestLandCost['buy']) {
                            $u.log(2, "Buying land", caap.bestLand['name']);
                            if (BuySellLand(caap.bestLand)) {
                                return true;
                            }
                        }
                    } else {
                        return caap.NavigateTo('soldiers,land');
                    }
                }

                return false;
            } catch (err) {
                $u.error("ERROR in Lands: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          CHECKS
        /////////////////////////////////////////////////////////////////////

        CheckKeep: function () {
            try {
                if (!schedule.check("keep")) {
                    return false;
                }

                $u.log(2, 'Visiting keep to get stats');
                return caap.NavigateTo('keep', 'tab_stats_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckKeep: " + err);
                return false;
            }
        },

        CheckOracle: function () {
            try {
                if (!schedule.check("oracle")) {
                    return false;
                }

                $u.log(2, "Checking Oracle for Favor Points");
                return caap.NavigateTo('oracle', 'oracle_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckOracle: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        CheckBattleRank: function () {
            try {
                if (!schedule.check("battlerank") || caap.stats['level'] < 8) {
                    return false;
                }

                $u.log(2, 'Visiting Battle Rank to get stats');
                return caap.NavigateTo('battle,battlerank', 'tab_battle_rank_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckBattleRank: " + err);
                return false;
            }
        },

        CheckWarRank: function () {
            try {
                if (!schedule.check("warrank") || caap.stats['level'] < 100) {
                    return false;
                }

                $u.log(2, 'Visiting War Rank to get stats');
                return caap.NavigateTo('battle,war_rank', 'tab_war_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckWar: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        CheckGenerals: function () {
            try {
                if (!schedule.check("generals")) {
                    return false;
                }

                $u.log(2, "Visiting generals to get 'General' list");
                return caap.NavigateTo('mercenary,generals', 'tab_generals_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckGenerals: " + err);
                return false;
            }
        },

        CheckSoldiers: function () {
            try {
                if (!schedule.check("soldiers")) {
                    return false;
                }

                $u.log(2, "Checking Soldiers");
                return caap.NavigateTo('soldiers', 'tab_soldiers_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckSoldiers: " + err);
                return false;
            }
        },


        CheckItem: function () {
            try {
                if (!schedule.check("item")) {
                    return false;
                }

                $u.log(2, "Checking Item");
                return caap.NavigateTo('soldiers,item', 'tab_black_smith_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckItem: " + err);
                return false;
            }
        },

        CheckMagic: function () {
            try {
                if (!schedule.check("magic")) {
                    return false;
                }

                $u.log(2, "Checking Magic");
                return caap.NavigateTo('soldiers,magic', 'tab_magic_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckMagic: " + err);
                return false;
            }
        },

        CheckAchievements: function () {
            try {
                if (!schedule.check("achievements")) {
                    return false;
                }

                $u.log(2, 'Visiting achievements to get stats');
                return caap.NavigateTo('keep,achievements', 'tab_achievements_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckAchievements: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        CheckSymbolQuests: function () {
            try {
                if (!schedule.check("symbolquests") || caap.stats['level'] < 8) {
                    return false;
                }

                $u.log(2, "Visiting symbolquests to get 'Demi-Power' points");
                return caap.NavigateTo('quests,symbolquests', 'demi_quest_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckSymbolQuests: " + err);
                return false;
            }
        },

        CheckCharacterClasses: function () {
            try {
                if (!schedule.check("view_class_progress") || caap.stats['level'] < 100) {
                    return false;
                }

                $u.log(2, "Checking Monster Class to get Character Class Stats");
                return caap.NavigateTo('battle_monster,view_class_progress', 'nm_class_whole_progress_bar.jpg');
            } catch (err) {
                $u.error("ERROR in CheckCharacterClasses: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        CheckGift: function () {
            try {
                if (!schedule.check("gift")) {
                    return false;
                }

                $u.log(2, "Checking Gift");
                return caap.NavigateTo('army,gift', 'tab_gifts_on.gif');
            } catch (err) {
                $u.error("ERROR in CheckGift: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          BATTLING PLAYERS
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        BattleUserId: function (userid) {
            try {
                if (battle.hashCheck(userid)) {
                    return true;
                }

                var battleButton = null,
                    form         = $j(),
                    inp          = $j();

                battleButton = caap.CheckForImage(battle.battles['Freshmeat'][config.getItem('BattleType', 'Invade')]);
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
                $u.error("ERROR in BattleUserId: " + err);
                return false;
            }
        },

        battleWarnLevel: true,

        Battle: function (mode) {
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
                switch (whenBattle) {
                case 'Never' :
                    caap.SetDivContent('battle_mess', 'Battle off');
                    return false;
                case 'Stay Hidden' :
                    if (!caap.NeedToHide()) {
                        caap.SetDivContent('battle_mess', 'We Dont Need To Hide Yet');
                        $u.log(1, 'We Dont Need To Hide Yet');
                        return false;
                    }

                    break;
                case 'No Monster' :
                    if (mode !== 'DemiPoints') {
                        if (whenMonster !== 'Never' && targetMonster && !targetMonster.match(/the deathrune siege/i)) {
                            return false;
                        }
                    }

                    break;
                case 'Demi Points Only' :
                    if (mode === 'DemiPoints' && whenMonster === 'Never') {
                        return false;
                    }

                    if (mode !== 'DemiPoints' && whenMonster !== 'Never' && targetMonster && !targetMonster.match(/the deathrune siege/i)) {
                        return false;
                    }

                    if (battle.selectedDemisDone(true) || (config.getItem("DemiPointsFirst", false) && whenMonster !== 'Never' && config.getItem("observeDemiFirst", false) && state.getItem('DemiPointsDone', false))) {
                        return false;
                    }

                    break;
                default :
                }

                if (caap.CheckKeep()) {
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
                    staminaReq = 1;
                    chainImg = 'battle_invade_again.gif';
                    if (general.LevelUpCheck(useGeneral)) {
                        useGeneral = 'LevelUpGeneral';
                        $u.log(2, 'Using level up general');
                    }

                    break;
                case 'Duel' :
                    useGeneral = 'DuelGeneral';
                    staminaReq = 1;
                    chainImg = 'battle_duel_again.gif';
                    if (general.LevelUpCheck(useGeneral)) {
                        useGeneral = 'LevelUpGeneral';
                        $u.log(2, 'Using level up general');
                    }

                    break;
                case 'War' :
                    useGeneral = 'WarGeneral';
                    staminaReq = 10;
                    chainImg = 'battle_duel_again.gif';
                    if (general.LevelUpCheck(useGeneral)) {
                        useGeneral = 'LevelUpGeneral';
                        $u.log(2, 'Using level up general');
                    }

                    break;
                default :
                    $u.warn('Unknown battle type ', battletype);
                    return false;
                }

                if (!caap.CheckStamina('Battle', staminaReq)) {
                    $u.log(9, 'Not enough stamina for ', battletype);
                    return false;
                } else if (general.Select(useGeneral)) {
                    return true;
                }

                // Check if we should chain attack
                if ($j("#" + caap.domain.id[caap.domain.which] + "results_main_wrapper img[src*='battle_victory.gif']").length) {
                    button = caap.CheckForImage(chainImg);
                    battleChainId = state.getItem("BattleChainId", 0);
                    if ($u.hasContent(button) && battleChainId) {
                        caap.SetDivContent('battle_mess', 'Chain Attack In Progress');
                        $u.log(2, 'Chaining Target', battleChainId);
                        battle.click(button);
                        state.setItem("BattleChainId", 0);
                        return true;
                    }
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
                        caap.SetDivContent('battle_mess', 'Joining the Raid in ' + rejoinSecs);
                        return true;
                    }

                    caap.SetDivContent('battle_mess', 'Joining the Raid');
                    if (caap.NavigateTo(caap.battlePage + ',raid', 'tab_raid_on.gif')) {
                        return true;
                    }

                    if (config.getItem('clearCompleteRaids', false) && monster.completeButton['raid']['button'] && monster.completeButton['raid']['name']) {
                        caap.Click(monster.completeButton['raid']['button']);
                        monster.deleteItem(monster.completeButton['raid']['name']);
                        monster.completeButton['raid'] = {'name': undefined, 'button': undefined};
                        caap.UpdateDashboard(true);
                        $u.log(1, 'Cleared a completed raid');
                        return true;
                    }

                    raidName = state.getItem('targetFromraid', '');
                    if (!$u.hasContent($j("div[style*='dragon_title_owner']", caap.globalContainer))) {
                        button = monster.engageButtons[raidName];
                        if ($u.hasContent(button)) {
                            caap.Click(button);
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
                    if (caap.NavigateTo(caap.battlePage, 'battle_on.gif')) {
                        return true;
                    }

                    caap.SetDivContent('battle_mess', 'Battling ' + target);
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

                    if (caap.NavigateTo(caap.battlePage, 'battle_on.gif')) {
                        return true;
                    }

                    state.setItem('BattleChainId', 0);
                    if (caap.BattleUserId(target)) {
                        battle.nextTarget();
                        return true;
                    }

                    $u.warn('Doing default UserID list, but no target');
                    return false;
                }
            } catch (err) {
                $u.error("ERROR in Battle: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          GUILD
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        CheckResults_guild: function () {
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

                $u.log(2, "CheckResults_guild", caap.stats['guild']);
                if (save) {
                    caap.SaveStats();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_guild: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          GUILD BATTLES
        /////////////////////////////////////////////////////////////////////

        CheckResults_guild_current_battles: function () {
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
                $u.error("ERROR in CheckResults_guild_current_battles: " + err);
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
        GuildMonsterReview: function () {
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
                    if (caap.NavigateTo('guild')) {
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
                    caap.ClickAjaxLinkSend(url);
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
                $u.error("ERROR in GuildMonsterReview: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        CheckResults_guild_current_monster_battles: function () {
            try {
                caap.globalContainer.find("input[src*='dragon_list_btn_']").bind('click', caap.guildMonsterEngageListener);
                guild_monster.populate();

                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_guild_current_monster_battles: " + err);
                return false;
            }
        },

        CheckResults_guild_battle_monster: function () {
            try {
                caap.globalContainer.find("input[src*='guild_duel_button']").bind('click', caap.guildMonsterEngageListener);
                guild_monster.onMonster();
                if (config.getItem("enableTitles", true)) {
                    spreadsheet.doTitles();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_guild_battle_monster: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        GuildMonster: function () {
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
                    if (caap.NavigateTo('guild')) {
                        return true;
                    }
                }

                /*
                if (!caap.stats['guild']['id']) {
                    $u.log(2, "Going to keep to get Guild Id");
                    if (caap.NavigateTo('keep')) {
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

                if (caap.InLevelUpMode()) {
                    if (caap.stats['staminaT']['num'] < 5) {
                        caap.SetDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + 5);
                        return false;
                    }
                } else if (when === 'Stamina Available') {
                    stamina = state.getItem('staminaGuildMonster', 0);
                    if (caap.stats['staminaT']['num'] < stamina) {
                        caap.SetDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + stamina);
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
                                caap.SetDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + stamina);
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
                        caap.SetDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + config.getItem("MaxStaminaToGMonster", 20));
                        return false;
                    }
                } else if (when === 'At Max Stamina') {
                    if (caap.stats['staminaT']['num'] < caap.stats['stamina']['max'] || caap.stats['staminaT']['num'] < 1) {
                        caap.SetDivContent('guild_monster_mess', 'Guild Monster stamina ' + caap.stats['staminaT']['num'] + '/' + caap.stats['stamina']['max']);
                        return false;
                    }
                }

                caap.SetDivContent('guild_monster_mess', '');
                record = guild_monster.select(true);
                if (record && $j.isPlainObject(record) && !$j.isEmptyObject(record)) {
                    if (general.Select('GuildMonsterGeneral')) {
                        return true;
                    }

                    if (!guild_monster.checkPage(record)) {
                        $u.log(2, "Fighting Slot (" + record['slot'] + ") Name: " + record['name']);
                        caap.SetDivContent('guild_monster_mess', "Fighting ("  + record['slot'] + ") " + record['name']);
                        url = "guild_battle_monster.php?twt2=" + guild_monster.info[record['name']].twt2 + "&guild_id=" + record['guildId'] + "&slot=" + record['slot'];
                        caap.ClickAjaxLinkSend(url);
                        return true;
                    }

                    minion = guild_monster.getTargetMinion(record);
                    if (minion && $j.isPlainObject(minion) && !$j.isEmptyObject(minion)) {
                        $u.log(2, "Fighting target_id (" + minion['target_id'] + ") Name: " + minion['name']);
                        caap.SetDivContent('guild_monster_mess', "Fighting (" + minion['target_id'] + ") " + minion['name']);
                        key = $j("#" + caap.domain.id[caap.domain.which] + "attack_key_" + minion['target_id']);
                        if (key && key.length) {
                            attack = guild_monster.getAttackValue(record, minion);
                            if (!attack) {
                                return false;
                            }

                            key.attr("value", attack);
                            form = key.parents("form").eq(0);
                            if (form && form.length) {
                                caap.Click(form.find("input[src*='guild_duel_button2.gif'],input[src*='monster_duel_button.gif']"));
                                return true;
                            }
                        }
                    }
                }

                return false;
            } catch (err) {
                $u.error("ERROR in GuildMonster: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          ARENA
        /////////////////////////////////////////////////////////////////////

        /*-------------------------------------------------------------------------------------\
        ArenaReview is a primary action subroutine to mange the Arena on the dashboard
        \-------------------------------------------------------------------------------------*/
        ArenaReview: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                We do Arena review once an hour.  Some routines may reset this timer to drive
                ArenaReview immediately.
                \-------------------------------------------------------------------------------------*/
                if (!schedule.check("ArenaReview") || config.getItem('WhenArena', 'Never') === 'Never') {
                    return false;
                }

                if (state.getItem('ArenaRefresh', true)) {
                    if (arena.navigate_to_main_refresh()) {
                        return true;
                    }
                }

                if (!state.getItem('ArenaReview', false)) {
                    if (arena.navigate_to_main()) {
                        return true;
                    }

                    state.setItem('ArenaReview', true);
                }

                state.setItem('ArenaRefresh', true);
                state.setItem('ArenaReview', false);
                $u.log(1, 'Done with Arena review.');
                return false;
            } catch (err) {
                $u.error("ERROR in ArenaReview: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        CheckResults_arena: function () {
            try {
                caap.globalContainer.find("input[src*='battle_enter_battle']").bind('click', caap.arenaEngageListener);
                arena.checkInfo();
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_arena: " + err);
                return false;
            }
        },

        CheckResults_arena_battle: function () {
            try {
                caap.globalContainer.find("input[src*='monster_duel_button']").each(function (index) {
                    $j(this).attr("id", index).bind('click', caap.arenaDualListener);
                });

                arena.onBattle();
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_arena_battle: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        Arena: function () {
            try {
                var when    = '',
                    record  = {},
                    minion  = {},
                    form    = $j(),
                    key     = $j(),
                    enterButton = $j(),
                    nextTime = '',
                    tokenTimer = 0;

                when = config.getItem("WhenArena", 'Never');
                if (when === 'Never') {
                    return false;
                }

                record = arena.getItem();
                nextTime = (record['reviewed'] && record['nextTime']) ? "Next Arena: " + $u.makeTime(record['reviewed'] + (record['nextTime'].parseTimer() * 1000), schedule.timeStr(true)) : '';
                nextTime = record['startTime'] ? "Next Arena: " + record['startTime'] + " seconds" : nextTime;
                tokenTimer = (record['reviewed'] && record['tokenTime'] && record['state'] === 'Alive') ? ((record['reviewed'] + (record['tokenTime'].parseTimer() * 1000)) - new Date().getTime()) / 1000 : -1;
                tokenTimer = tokenTimer >= 0 ? tokenTimer.dp() : 0;
                nextTime = (tokenTimer >= 0 && record['state'] === 'Alive') ? "Next Token in: " + tokenTimer + ' seconds': nextTime;
                caap.SetDivContent('arena_mess', nextTime);
                if (!record || !$j.isPlainObject(record) || $j.isEmptyObject(record) || state.getItem('ArenaJoined', false)) {
                    if (state.getItem('ArenaRefresh', true)) {
                        if (arena.navigate_to_main_refresh()) {
                            return true;
                        }
                    }

                    if (!state.getItem('ArenaReview', false)) {
                        if (arena.navigate_to_main()) {
                            return true;
                        }

                        state.setItem('ArenaReview', true);
                    }

                    state.setItem('ArenaRefresh', true);
                    state.setItem('ArenaReview', false);
                    state.setItem('ArenaJoined', false);
                    return false;
                }

                if (/*!record['days'] || */record['tokens'] <= 0 || (record['ticker'].parseTimer() <= 0 && record['state'] === "Ready") || (caap.stats['stamina']['num'] < 20 && record['state'] === "Ready")) {
                    return false;
                }

                caap.SetDivContent('arena_mess', "Entering Arena");
                if (general.Select('ArenaGeneral')) {
                    return true;
                }

                if (!$j("#" + caap.domain.id[caap.domain.which] + "arena_battle_banner_section").length) {
                    if (state.getItem('ArenaRefresh', true)) {
                        if (arena.navigate_to_main_refresh()) {
                            return true;
                        }
                    }

                    if (!state.getItem('ArenaReview', false)) {
                        if (arena.navigate_to_main()) {
                            return true;
                        }

                        state.setItem('ArenaReview', true);
                    }

                    state.setItem('ArenaRefresh', true);
                    state.setItem('ArenaReview', false);
                    enterButton = $j("input[src*='battle_enter_battle.gif']");
                    $u.log(1, "Enter battle", record, enterButton);
                    if (record['tokens'] > 0 && enterButton && enterButton.length) {
                        arena.clearMinions();
                        caap.Click(enterButton);
                        return true;
                    }
                }

                enterButton = $j("input[src*='guild_enter_battle_button.gif']");
                if (enterButton && enterButton.length) {
                    $u.log(1, "Joining battle", caap.stats['stamina']['num'], record, enterButton);
                    if (caap.stats['stamina']['num'] >= 20 && record['tokens'] > 0) {
                        state.setItem('ArenaJoined', true);
                        caap.Click(enterButton);
                        return true;
                    }

                    return false;
                }

                if (record['state'] !== "Alive") {
                    return false;
                }

                minion = arena.getTargetMinion(record);
                if (minion && $j.isPlainObject(minion) && !$j.isEmptyObject(minion)) {
                    $u.log(2, "Fighting target_id (" + minion['target_id'] + ") Name: " + minion['name']);
                    caap.SetDivContent('arena_mess', "Fighting (" + minion['target_id'] + ") " + minion['name']);
                    key = $j("#" + caap.domain.id[caap.domain.which] + "attack_key_" + minion['target_id']);
                    if (key && key.length) {
                        form = key.parents("form").eq(0);
                        if (form && form.length) {
                            state.setItem('ArenaMinionAttacked', minion);
                            caap.Click(form.find("input[src*='guild_duel_button2.gif'],input[src*='monster_duel_button.gif']"));
                            return true;
                        }
                    }
                }

                return false;
            } catch (err) {
                $u.error("ERROR in Arena: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          MONSTERS AND BATTLES
        /////////////////////////////////////////////////////////////////////

        CheckResults_fightList: function () {
            try {
                var buttonsDiv            = $j("img[src*='dragon_list_btn_']", caap.globalContainer),
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
                    summonDiv             = $j("img[src*='mp_button_summon_']", caap.globalContainer),
                    tempText              = '',
                    pageUserCheck         = 0,
                    tStr                  = '';

                // get all buttons to check monsterObjectList
                if (!$u.hasContent(summonDiv) && !$u.hasContent(buttonsDiv)) {
                    $u.log(2, "No buttons found");
                    return false;
                }

                page = state.getItem('page', 'battle_monster');
                if (page === 'battle_monster' && !$u.hasContent(buttonsDiv)) {
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
                    monsterFull = $u.setContent(monsterRow.text(), '').trim();
                    monsterName = monsterFull.replace(/Completed!/i, '').replace(/Fled!/i, '').trim();
                    monsterReviewed = monster.getItem(monsterName);
                    monsterReviewed['type'] = $u.setContent(monsterReviewed['type'], monster.type(monsterName));
                    monsterReviewed['page'] = page;
                    engageButtonName = $u.setContent(buttonsDiv.eq(it).attr("src"), '').regex(/(dragon_list_btn_\d)/i);
                    switch (engageButtonName) {
                    case 'dragon_list_btn_2' :
                        monsterReviewed['status'] = 'Collect Reward';
                        monsterReviewed['color'] = 'grey';
                        break;
                    case 'dragon_list_btn_3' :
                        monster.engageButtons[monsterName] = buttonsDiv.eq(it);
                        break;
                    case 'dragon_list_btn_4' :
                        if (page === 'raid' && !(/!/.test(monsterFull))) {
                            monster.engageButtons[monsterName] = buttonsDiv.eq(it);
                            break;
                        }

                        if (!monster.completeButton[page]['button'] && !monster.completeButton[page]['name']) {
                            monster.completeButton[page]['name'] = monsterName;
                            monster.completeButton[page]['button'] = caap.CheckForImage('cancelButton.gif', monsterRow);
                        }

                        monsterReviewed['status'] = 'Complete';
                        monsterReviewed['color'] = 'grey';
                        break;
                    default :
                    }

                    monsterReviewed['userId'] = $u.setContent(url.regex(/user=(\d+)/), 0);
                    monsterReviewed['mpool'] = /mpool=\d+/.test(url) ? '&mpool=' + url.regex(/mpool=(\d+)/) : '';
                    siege = monster.info[monsterReviewed['type']] && monster.info[monsterReviewed['type']].siege ? "&action=doObjective" : '';
                    monsterReviewed['link'] = "<a href='" + caap.domain.link + "/" + page + ".php?casuser=" + monsterReviewed['userId'] + monsterReviewed['mpool'] + siege + "'>Link</a>";
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
                caap.UpdateDashboard(true);
                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_fightList: " + err);
                return false;
            }
        },

        CheckResults_viewFight: function () {
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
                    monsterDiv        = $j(),
                    actionDiv         = $j(),
                    damageDiv         = $j(),
                    monsterInfo       = {},
                    targetFromfortify = {},
                    tStr              = '',
                    tBool             = false;

                battle.checkResults();
                if (config.getItem("enableTitles", true)) {
                    spreadsheet.doTitles();
                }

                caap.chatLink(caap.appBodyDiv, "#" + caap.domain.id[caap.domain.which] + "chat_log div[style*='hidden'] div[style*='320px']");
                monsterDiv = $j("div[style*='dragon_title_owner']", caap.appBodyDiv);
                if ($u.hasContent(monsterDiv)) {
                    tempText = $u.setContent(monsterDiv.children(":eq(2)").text(), '').trim();
                } else {
                    monsterDiv = $j("div[style*='nm_top']", caap.appBodyDiv);
                    if ($u.hasContent(monsterDiv)) {
                        tempText = $u.setContent(monsterDiv.children(":eq(0)").children(":eq(0)").text(), '').trim();
                        tempDiv = $j("div[style*='nm_bars']", caap.appBodyDiv);
                        if ($u.hasContent(tempDiv)) {
                            tempText += $u.setContent(tempDiv.children(":eq(0)").children(":eq(0)").children(":eq(0)").siblings(":last").children(":eq(0)").text(), '').trim().replace("'s Life", "");
                        } else {
                            $u.warn("Problem finding nm_bars");
                            return;
                        }
                    } else {
                        $u.warn("Problem finding dragon_title_owner and nm_top");
                        return;
                    }
                }

                if ($u.hasContent(monsterDiv) && $u.hasContent($j("img[uid='" + caap.stats['FBID'] + "']", monsterDiv))) {
                    $u.log(2, "Your monster found", tempText);
                    tempText = tempText.replace(new RegExp(".+?'s "), 'Your ');
                }

                $u.log(2, "Monster name", tempText);
                currentMonster = monster.getItem(tempText);
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
                    if (!caap.HasImage("dead.jpg")) {
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
                        tempArr = $u.setContent(damageDiv.parent().parent().siblings(":last").text(), '').regex(/([\d,]+) dmg \/ ([\d,]+) def/);
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
                    counter = state.getItem('monsterReviewCounter', -3);
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
                    if (caap.InLevelUpMode() || caap.stats['stamina']['num'] >= caap.stats['stamina']['max'] - 5) {
                        KOBenable = false;
                    }

                    if (KOBenable) {
                        $u.log(2, 'Level Up Mode: ', caap.InLevelUpMode());
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
                caap.UpdateDashboard(true);
                if (schedule.check('battleTimer')) {
                    window.setTimeout(function () {
                        caap.SetDivContent('monster_mess', '');
                    }, 2000);
                }
            } catch (err) {
                $u.error("ERROR in CheckResults_viewFight: " + err);
            }
        },

        /*-------------------------------------------------------------------------------------\
        MonsterReview is a primary action subroutine to mange the monster and raid list
        on the dashboard
        \-------------------------------------------------------------------------------------*/
        MonsterReview: function () {
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
                var counter  = state.getItem('monsterReviewCounter', -3),
                    link     = '',
                    tempTime = 0,
                    isSiege  = false;

                if (counter === -3) {
                    state.setItem('monsterReviewCounter', counter += 1);
                    return true;
                }

                if (counter === -2) {
                    if (caap.stats['level'] > 6) {
                        if (caap.NavigateTo('keep,battle_monster', 'tab_monster_list_on.gif')) {
                            state.setItem('reviewDone', false);
                            return true;
                        }
                    } else {
                        $u.log(1, "Monsters: Unlock at level 7");
                        state.setItem('reviewDone', true);
                    }

                    if (state.getItem('reviewDone', true)) {
                        state.setItem('monsterReviewCounter', counter += 1);
                    } else {
                        return true;
                    }
                }

                if (counter === -1) {
                    if (caap.stats['level'] > 7) {
                        if (caap.NavigateTo(caap.battlePage + ',raid', 'tab_raid_on.gif')) {
                            state.setItem('reviewDone', false);
                            return true;
                        }
                    } else {
                        $u.log(1, "Raids: Unlock at level 8");
                        state.setItem('reviewDone', true);
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
                    caap.SetDivContent('monster_mess', 'Reviewing/sieging ' + (counter + 1) + '/' + monster.records.length + ' ' + monster.records[counter]['name']);
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
                        isSiege = monster.records[counter]['type'].match(/Raid/) || monster.records[counter]['type'] === 'Siege';
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

                        $u.log(5, "Link", link);
                        caap.ClickAjaxLinkSend(link);
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
                state.setItem('monsterReviewCounter', -3);
                $u.log(1, 'Done with monster/raid review.');
                caap.SetDivContent('monster_mess', '');
                caap.UpdateDashboard(true);
                if (state.getItem('CollectedRewards', false)) {
                    state.setItem('CollectedRewards', false);
                    monster.flagReview();
                }

                return true;
            } catch (err) {
                $u.error("ERROR in MonsterReview: " + err);
                return false;
            }
        },

        Monsters: function () {
            try {
                if (config.getItem('WhenMonster', 'Never') === 'Never') {
                    caap.SetDivContent('monster_mess', 'Monster off');
                    return false;
                }

                ///////////////// Reivew/Siege all monsters/raids \\\\\\\\\\\\\\\\\\\\\\

                if (config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && caap.NeedToHide() && caap.CheckStamina('Monster', 1)) {
                    $u.log(1, "Stay Hidden Mode: We're not safe. Go battle.");
                    caap.SetDivContent('monster_mess', 'Not Safe For Monster. Battle!');
                    return false;
                }

                if (!schedule.check('NotargetFrombattle_monster')) {
                    return false;
                }

                ///////////////// Individual Monster Page \\\\\\\\\\\\\\\\\\\\\\

                // Establish a delay timer when we are 1 stamina below attack level.
                // Timer includes 5 min for stamina tick plus user defined random interval
                if (!caap.InLevelUpMode() && caap.stats['stamina']['num'] === (state.getItem('MonsterStaminaReq', 1) - 1) && schedule.check('battleTimer') && config.getItem('seedTime', 0) > 0) {
                    schedule.setItem('battleTimer', 300, config.getItem('seedTime', 0));
                    caap.SetDivContent('monster_mess', 'Monster Delay Until ' + schedule.display('battleTimer'));
                    return false;
                }

                if (!schedule.check('battleTimer')) {
                    if (caap.stats['stamina']['num'] < general.GetStaminaMax(config.getItem('IdleGeneral', 'Use Current'))) {
                        caap.SetDivContent('monster_mess', 'Monster Delay Until ' + schedule.display('battleTimer'));
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
                    if (!caap.InLevelUpMode() && config.getItem('PowerFortifyMax', false) && monster.info[monstType].staLvl) {
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
                default:
                }

                // Check to see if we should fortify or attack monster
                if (monsterName && caap.CheckEnergy(energyRequire, gm.getItem('WhenFortify', 'Energy Available', hiddenVar), 'fortify_mess')) {
                    fightMode = 'Fortify';
                } else {
                    monsterName = state.getItem('targetFrombattle_monster', '');
                    monstType = monster.type(monsterName);
                    currentMonster = monster.getItem(monsterName);
                    if (monsterName && caap.CheckStamina('Monster', state.getItem('MonsterStaminaReq', 1)) && currentMonster['page'] === 'battle_monster') {
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
                imageTest = monstType && monster.info[monstType].alpha ? 'nm_top' : 'dragon_title_owner';

                if ($u.hasContent($j("div[style*='" + imageTest + "']", caap.globalContainer))) {
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

                        if (currentMonster && currentMonster['stunDo'] && currentMonster['stunType'] !== '') {
                            buttonList.unshift("button_nm_s_" + currentMonster['stunType']);
                        } else {
                            buttonList.unshift("button_nm_s_");
                        }

                        $u.log(4, "monster/button list", currentMonster, buttonList);
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

                        if (useTactics && caap.HasImage('nm_button_tactics.gif')) {
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
                        }
                    }

                    nodeNum = 0;
                    if (!caap.InLevelUpMode()) {
                        if (((fightMode === 'Fortify' && config.getItem('PowerFortifyMax', false)) || (fightMode !== 'Fortify' && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false))) && monster.info[monstType].staLvl) {
                            for (nodeNum = monster.info[monstType].staLvl.length - 1; nodeNum >= 0; nodeNum -= 1) {
                                if (caap.stats['stamina']['max'] >= monster.info[monstType].staLvl[nodeNum]) {
                                    break;
                                }
                            }
                        }
                    }

                    for (it = 0, len = buttonList.length; it < len; it += 1) {
                        attackButton = caap.CheckForImage(buttonList[it], null, null, nodeNum);
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
                        caap.SetDivContent('monster_mess', attackMess);
                        state.setItem('ReleaseControl', true);
                        caap.Click(attackButton);
                        return true;
                    } else {
                        $u.warn('No button to attack/fortify with.');
                        schedule.setItem('NotargetFrombattle_monster', 60);
                        return false;
                    }
                }

                ///////////////// Check For Monster Page \\\\\\\\\\\\\\\\\\\\\\
                if (caap.NavigateTo('keep,battle_monster', 'tab_monster_list_on.gif')) {
                    return true;
                }

                buttonHref = $u.setContent($j("img[src*='dragon_list_btn_']", caap.globalContainer).eq(0).parent().attr("href"), '');
                pageUserCheck = state.getItem('pageUserCheck', 0);
                if (pageUserCheck && (!buttonHref || !new RegExp('user=' + caap.stats['FBID']).test(buttonHref) || !/alchemy\.php/.test(buttonHref))) {
                    $u.log(2, "On another player's keep.", pageUserCheck);
                    return caap.NavigateTo('keep,battle_monster', 'tab_monster_list_on.gif');
                }

                if (config.getItem('clearCompleteMonsters', false) && monster.completeButton['battle_monster']['button'] && monster.completeButton['battle_monster']['name']) {
                    caap.Click(monster.completeButton['battle_monster']['button']);
                    monster.deleteItem(monster.completeButton['battle_monster']['name']);
                    monster.completeButton['battle_monster'] = {'name': undefined, 'button': undefined};
                    caap.UpdateDashboard(true);
                    $u.log(1, 'Cleared a completed monster');
                    return true;
                }

                if ($u.hasContent(monster.engageButtons[monsterName])) {
                    caap.SetDivContent('monster_mess', 'Opening ' + monsterName);
                    caap.Click(monster.engageButtons[monsterName]);
                    return true;
                } else {
                    schedule.setItem('NotargetFrombattle_monster', 60);
                    $u.warn('No "Engage" button for ', monsterName);
                    return false;
                }
            } catch (err) {
                $u.error("ERROR in Monsters: " + err);
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

        LoadDemi: function () {
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
        CheckResults_battle: function () {
            try {
                var symDiv  = $j(),
                    points  = [],
                    success = true;

                battle.checkResults();
                symDiv = caap.appBodyDiv.find("img[src*='symbol_tiny_']").not("img[src*='rewards.jpg']");
                if (symDiv && symDiv.length === 5) {
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
                        caap.demi['ambrosia']['daily'] = caap.GetStatusNumbers(points[0]);
                        caap.demi['malekus']['daily'] = caap.GetStatusNumbers(points[1]);
                        caap.demi['corvintheus']['daily'] = caap.GetStatusNumbers(points[2]);
                        caap.demi['aurora']['daily'] = caap.GetStatusNumbers(points[3]);
                        caap.demi['azeron']['daily'] = caap.GetStatusNumbers(points[4]);
                        schedule.setItem("battle", gm.getItem('CheckDemi', 6, hiddenVar) * 3600, 300);
                        caap.SaveDemi();
                    }
                } else {
                    $u.warn('Demi symDiv problem', symDiv);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_battle: " + err);
                return false;
            }
        },

        DemiPoints: function () {
            try {
                if (caap.stats['level'] < 9) {
                    return false;
                }

                if (!config.getItem('DemiPointsFirst', false) || config.getItem('WhenMonster', 'Never') === 'Never') {
                    return false;
                }

                if (schedule.check("battle")) {
                    if (caap.NavigateTo(caap.battlePage, 'battle_on.gif')) {
                        return true;
                    }
                }

                var demiPointsDone = false;
                demiPointsDone = battle.selectedDemisDone();
                state.setItem("DemiPointsDone", demiPointsDone);
                if (!demiPointsDone) {
                    return caap.Battle('DemiPoints');
                } else {
                    return false;
                }
            } catch (err) {
                $u.error("ERROR in DemiPoints: " + err);
                return false;
            }
        },

        InLevelUpMode: function () {
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
                $u.error("ERROR in InLevelUpMode: " + err);
                return false;
            }
        },

        CheckStamina: function (battleOrMonster, attackMinStamina) {
            try {
                $u.log(4, "CheckStamina", battleOrMonster, attackMinStamina);
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
                    caap.SetDivContent(messDiv, 'Health or stamina not known yet.');
                    return false;
                }

                if (caap.stats['health']['num'] < 10) {
                    caap.SetDivContent(messDiv, "Need health to fight: " + caap.stats['health']['num'] + "/10");
                    return false;
                }

                if (battleOrMonster === "Battle" && config.getItem("waitSafeHealth", false) && caap.stats['health']['num'] < 13) {
                    caap.SetDivContent(messDiv, "Unsafe. Need spare health to fight: " + caap.stats['health']['num'] + "/13");
                    return false;
                }

                if (when === 'At X Stamina') {
                    if (caap.InLevelUpMode() && caap.stats['stamina']['num'] >= attackMinStamina) {
                        caap.SetDivContent(messDiv, 'Burning stamina to level up');
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

                    caap.SetDivContent(messDiv, 'Waiting for stamina: ' + caap.stats['stamina']['num'] + "/" + config.getItem('X' + staminaMF, 1));
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
                        caap.SetDivContent(messDiv, 'Using max stamina');
                        return true;
                    }

                    if (caap.InLevelUpMode() && caap.stats['stamina']['num'] >= attackMinStamina) {
                        caap.SetDivContent(messDiv, 'Burning all stamina to level up');
                        return true;
                    }

                    caap.SetDivContent(messDiv, 'Waiting for max stamina: ' + caap.stats['stamina']['num'] + "/" + maxIdleStamina);
                    return false;
                }

                if (caap.stats['stamina']['num'] >= attackMinStamina) {
                    return true;
                }

                caap.SetDivContent(messDiv, "Waiting for more stamina: " + caap.stats['stamina']['num'] + "/" + attackMinStamina);
                return false;
            } catch (err) {
                $u.error("ERROR in CheckStamina: " + err);
                return false;
            }
        },

        /*-------------------------------------------------------------------------------------\
        NeedToHide will return true if the current stamina and health indicate we need to bring
        our health down through battles (hiding).  It also returns true if there is no other outlet
        for our stamina (currently this just means Monsters, but will eventually incorporate
        other stamina uses).
        \-------------------------------------------------------------------------------------*/
        NeedToHide: function () {
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
                $u.error("ERROR in NeedToHide: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          POTIONS
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        AutoPotions: function () {
            try {
                if (!config.getItem('AutoPotions', true) || !schedule.check('AutoPotionTimerDelay')) {
                    return false;
                }

                if (caap.stats['exp']['dif'] <= config.getItem("potionsExperience", 20)) {
                    $u.log(2, "AutoPotions, ENL condition. Delaying 10 minutes");
                    schedule.setItem('AutoPotionTimerDelay', 600);
                    return false;
                }

                function ConsumePotion(potion) {
                    try {
                        if (!$j(".statsTTitle").length) {
                            $u.log(2, "Going to keep for potions");
                            if (caap.NavigateTo('keep')) {
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
                                caap.Click(button);
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
                        $u.error("ERROR in ConsumePotion: " + err, potion);
                        return false;
                    }
                }

                if (caap.stats['energy']['num'] < caap.stats['energy']['max'] - 10 &&
                    caap.stats['potions']['energy'] >= config.getItem("energyPotionsSpendOver", 39) &&
                    caap.stats['potions']['energy'] > config.getItem("energyPotionsKeepUnder", 35)) {
                    return ConsumePotion('energy');
                }

                if (caap.stats['stamina']['num'] < caap.stats['stamina']['max'] - 10 &&
                    caap.stats['potions']['stamina'] >= config.getItem("staminaPotionsSpendOver", 39) &&
                    caap.stats['potions']['stamina'] > config.getItem("staminaPotionsKeepUnder", 35)) {
                    return ConsumePotion('stamina');
                }

                return false;
            } catch (err) {
                $u.error("ERROR in AutoPotion: " + err);
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
        AutoAlchemy: function () {
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
                if (!caap.NavigateTo('keep,alchemy', 'tab_alchemy_on.gif')) {
                    var button    = {},
                        recipeDiv = $j(),
                        ss        = $j(),
                        clicked   = false;

                    recipeDiv = $j("#" + caap.domain.id[caap.domain.which] + "recipe_list");
                    if (recipeDiv && recipeDiv.length) {
                        if (recipeDiv.attr("class") !== 'show_items') {
                            button = recipeDiv.find("div[id*='alchemy_item_tab']");
                            if (button && button.length) {
                                caap.Click(button);
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
                    button = caap.CheckForImage('help_close_x.gif');
                    if ($u.hasContent(button)) {
                        caap.Click(button);
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
                        if (caap.HasImage('raid_hearts', recipeDiv) && !config.getItem('AutoAlchemyHearts', false)) {
                            $u.log(2, 'Skipping Hearts');
                            return true;
                        }
        /*-------------------------------------------------------------------------------------\
        Find our button and click it
        \-------------------------------------------------------------------------------------*/
                        button = recipeDiv.find("input[type='image']");
                        if (button && button.length) {
                            clicked = true;
                            caap.Click(button);
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
                $u.error("ERROR in Alchemy: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          BANKING
        // Keep it safe!
        /////////////////////////////////////////////////////////////////////

        ImmediateBanking: function () {
            if (!config.getItem("BankImmed", false)) {
                return false;
            }

            return caap.Bank();
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        Bank: function () {
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
                    return caap.NavigateTo('keep');
                }

                numberInput = $j("input[name='stash_gold']");
                if (!numberInput || !numberInput.length) {
                    $u.warn('Cannot find box to put in number for bank deposit.');
                    return false;
                }

                deposit = numberInput.attr("value").parseInt() - minInCash;
                numberInput.attr("value", deposit);
                $u.log(1, 'Depositing into bank:', deposit);
                caap.Click(depositButton);
                return true;
            } catch (err) {
                $u.error("ERROR in Bank: " + err);
                return false;
            }
        },

        RetrieveFromBank: function (num) {
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
                    return caap.NavigateTo('keep');
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
                caap.Click(retrieveButton);
                return true;
            } catch (err) {
                $u.error("ERROR in RetrieveFromBank: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          HEAL
        /////////////////////////////////////////////////////////////////////

        Heal: function () {
            try {
                var minToHeal     = 0,
                    minStamToHeal = 0;

                caap.SetDivContent('heal_mess', '');
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
                    if ((caap.InLevelUpMode() || caap.stats['stamina']['num'] >= caap.stats['staminaT']['max']) && caap.stats['health']['num'] < 10) {
                        $u.log(1, 'Heal');
                        return caap.NavigateTo('keep,heal_button.gif');
                    }
                }

                if (caap.stats['health']['num'] >= caap.stats['healthT']['max'] || caap.stats['health']['num'] >= minToHeal) {
                    return false;
                }

                if (caap.stats['stamina']['num'] < minStamToHeal) {
                    caap.SetDivContent('heal_mess', 'Waiting for stamina to heal: ' + caap.stats['stamina']['num'] + '/' + minStamToHeal);
                    return false;
                }

                $u.log(1, 'Heal');
                return caap.NavigateTo('keep,heal_button.gif');
            } catch (err) {
                $u.error("ERROR in Heal: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          ELITE GUARD
        /////////////////////////////////////////////////////////////////////

        AutoElite: function () {
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
                var MergeMyEliteTodo = function (list) {
                    $u.log(3, 'Elite Guard MergeMyEliteTodo list');
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
                                MergeMyEliteTodo(eliteList);
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

                    caap.GetFriendList(caap.friendListType.giftc);
                    var castleageList = [];
                    if (state.getItem(caap.friendListType.giftc.name + 'Responded', false) !== true) {
                        castleageList = state.getItem(caap.friendListType.giftc.name + 'Responded', []);
                    }

                    if ($u.hasContent(castleageList) || caap.stats['army']['capped'] <= 1 || allowPass) {
                        $u.log(2, 'Elite Guard received a new friend list');
                        MergeMyEliteTodo(castleageList);
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
                    caap.ClickAjaxLinkSend('party.php?twt=jneg&jneg=true&user=' + user);
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
                $u.error("ERROR in AutoElite: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                          PASSIVE GENERALS
        /////////////////////////////////////////////////////////////////////

        PassiveGeneral: function () {
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
        AutoIncome: function () {
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

        CheckResults_army: function (resultsText) {
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

        CheckResults_army_member: function (resultsText) {
            army.page();
        },

        /////////////////////////////////////////////////////////////////////
        //                              INDEX
        /////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        CheckResults_index: function (resultsText) {
            try {
                function News() {
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
                        $u.error("ERROR in News: " + err);
                        return false;
                    }
                }

                if (config.getItem('NewsSummary', true)) {
                    News();
                }

                // Check for new gifts
                // A warrior wants to join your Army!
                // Send Gifts to Friends
                if (config.getItem('AutoGift', false)) {
                    if (resultsText && /Send Gifts to Friends/.test(resultsText)) {
                        $u.log(1, 'We have a gift waiting!');
                        state.setItem('HaveGift', true);
                    } else {
                        $u.log(2, 'No gifts waiting.');
                        state.setItem('HaveGift', false);
                    }

                    schedule.setItem("ajaxGiftCheck", gm.getItem('CheckGiftMins', 15, hiddenVar) * 60, 300);
                }

                var tokenSpan = $j(),
                    tStr      = '',
                    arenaInfo = {};

                $j("div[style*='arena3_newsfeed']").unbind('click', caap.arenaEngageListener).bind('click', caap.arenaEngageListener);
                tokenSpan = $j("span[id='" + caap.domain.id[caap.domain.which] + "arena_token_current_value']");
                if (tokenSpan && tokenSpan.length) {
                    tStr = tokenSpan.length ? tokenSpan.text().trim() : '';
                    arenaInfo = arena.getItem();
                    arenaInfo['tokens'] = tStr ? tStr.parseInt() : 0;
                    if (arenaInfo['tokens'] === 10) {
                        arenaInfo['tokenTime'] = '';
                    }

                    arena.setItem(arenaInfo);
                    $u.log(4, 'arenaInfo', arenaInfo);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in CheckResults_index: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                              AUTOGIFT
        /////////////////////////////////////////////////////////////////////

        AjaxGiftCheck: function () {
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

        CheckResults_gift_accept: function (resultsText) {
            // Confirm gifts actually sent
            gifting.queue.sent();
            gifting.collected();
        },

        GiftExceedLog: true,

        AutoGift: function () {
            try {
                var tempDiv    = $j(),
                    tempText   = '',
                    giftImg    = '',
                    giftChoice = '',
                    popCheck,
                    collecting,
                    whenArena  = '',
                    arenaInfo  = {};

                whenArena = config.getItem("WhenArena", 'Never');
                if (whenArena !== 'Never') {
                    arenaInfo = arena.getItem();
                }

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                if (config.getItem('bookmarkMode', false) || !config.getItem('AutoGift', false) || (!$j.isEmptyObject(arenaInfo) && arenaInfo['state'] !== 'Ready')) {
                    return false;
                }
                /*jslint sub: false */

                popCheck = gifting.popCheck();
                if ($u.isBoolean(popCheck)) {
                    return popCheck;
                }

                // Go to gifts page if gift list is empty
                if (gifting.gifts.length() <= 2) {
                    if (caap.NavigateTo('army,gift', 'tab_gifts_on.gif')) {
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
                    }

                    return false;
                }

                giftChoice = gifting.queue.chooseGift();
                if (gifting.queue.length() && giftChoice) {
                    //if (caap.NavigateTo('army,gift,gift_invite_castle_off.gif', 'gift_invite_castle_on.gif')) {
                    if (caap.NavigateTo('army,gift', 'tab_gifts_on.gif')) {
                        return true;
                    }

                    giftImg = gifting.gifts.getImg(giftChoice);
                    if (giftImg) {
                        caap.NavigateTo('gift_more_gifts.gif');
                        tempDiv = $j("#" + caap.domain.id[caap.domain.which] + "giftContainer img[class='imgButton']").eq(0);
                        if (tempDiv && tempDiv.length) {
                            tempText = tempDiv.attr("src").basename();
                            if (tempText !== giftImg) {
                                $u.log(4, "images", tempText, giftImg);
                                return caap.NavigateTo(giftImg);
                            }

                            $u.log(1, "Gift selected", giftChoice);
                        }
                    } else {
                        $u.log(1, "Unknown gift, using first", giftChoice);
                    }

                    if (gifting.queue.chooseFriend(gm.getItem("NumberOfGifts", 5, hiddenVar))) {
                        tempDiv = $j("form[id*='req_form_'] input[name='send']");
                        if (tempDiv && tempDiv.length) {
                            caap.Click(tempDiv);
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
                $u.error("ERROR in AutoGift: " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                              IMMEDIATEAUTOSTAT
        /////////////////////////////////////////////////////////////////////

        ImmediateAutoStat: function () {
            if (!config.getItem("StatImmed", false) || !config.getItem('AutoStat', false)) {
                return false;
            }

            return caap.AutoStat();
        },

        ////////////////////////////////////////////////////////////////////
        //                      Auto Stat
        ////////////////////////////////////////////////////////////////////

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        IncreaseStat: function (attribute, attrAdjust, atributeSlice) {
            try {
                attribute = attribute.toLowerCase();
                var button        = $j(),
                    ajaxLoadIcon  = $j(),
                    level         = 0,
                    attrCurrent   = 0,
                    energy        = 0,
                    stamina       = 0,
                    attack        = 0,
                    defense       = 0,
                    health        = 0,
                    attrAdjustNew = 0,
                    energyDiv     = $j(),
                    staminaDiv    = $j(),
                    attackDiv     = $j(),
                    defenseDiv    = $j(),
                    healthDiv     = $j(),
                    logTxt        = "";

                ajaxLoadIcon = $j('#' + caap.domain.id[caap.domain.which] + 'AjaxLoadIcon');
                if (!ajaxLoadIcon.length || ajaxLoadIcon.css("display") !== 'none') {
                    $u.warn("Unable to find AjaxLoadIcon or page not loaded: Fail");
                    return "Fail";
                }

                energyDiv = atributeSlice.find("a[href*='energy_max']");
                staminaDiv = atributeSlice.find("a[href*='stamina_max']");
                attackDiv = atributeSlice.find("a[href*='attack']");
                defenseDiv = atributeSlice.find("a[href*='defense']");
                healthDiv = atributeSlice.find("a[href*='health_max']");
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

                if (!button) {
                    $u.warn("Unable to locate upgrade button: Fail ", attribute);
                    return "Fail";
                }

                attrAdjustNew = attrAdjust;
                logTxt = attrAdjust;
                level = caap.stats['level'];
                function getValue(div) {
                    return div.parent().parent().find("div[class='attribute_stat_container']").text().regex(/(\d+)/);
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
                    caap.Click(button);
                    return "Click";
                }

                return "Next";
            } catch (err) {
                $u.error("ERROR in IncreaseStat: " + err);
                return "Error";
            }
        },

        AutoStatCheck: function () {
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
                $u.error("ERROR in AutoStatCheck: " + err);
                return false;
            }
        },

        AutoStat: function () {
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

                var atributeSlice      = null,
                    startAtt           = 0,
                    stopAtt            = 4,
                    attrName           = '',
                    attribute          = '',
                    attrValue          = 0,
                    n                  = 0,
                    returnIncreaseStat = '';

                atributeSlice = $j("div[class*='keep_attribute_section']");
                if (!atributeSlice || !atributeSlice.length) {
                    caap.NavigateTo('keep');
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
                    returnIncreaseStat = caap.IncreaseStat(attribute, attrValue, atributeSlice);
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
                $u.error("ERROR in AutoStat: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        /////////////////////////////////////////////////////////////////////
        //                              CTA
        /////////////////////////////////////////////////////////////////////

        waitAjaxCTA: false,

        ajaxCTA: function (theUrl, theCount) {
            try {
                $j.ajax({
                    url: theUrl,
                    dataType: "html",
                    error:
                        function (XMLHttpRequest, textStatus, errorThrown) {
                            $u.warn("error ajaxCTA: ", theUrl, textStatus, errorThrown);
                            var ajaxCTABackOff = state.getItem('ajaxCTABackOff' + theCount, 0) + 1;
                            schedule.setItem('ajaxCTATimer' + theCount, Math.min(Math.pow(2, ajaxCTABackOff - 1) * 3600, 86400), 900);
                            state.setItem('ajaxCTABackOff' + theCount, ajaxCTABackOff);
                            caap.waitAjaxCTA = false;
                        },
                    dataFilter:
                        function (data, type) {
                            var fbcRegExp = new RegExp("\"" + caap.domain.id[caap.domain.which] + "guild_bg_top\" fbcontext=\"(.+)\""),
                                fbcontext = '',
                                tempArr   = [],
                                newData   = '';

                            tempArr = data.match(fbcRegExp);
                            $u.log(4, "ajaxCTA fbcontext", tempArr);
                            if (tempArr && tempArr.length !== 2) {
                                $u.warn("ajaxCTA unable to find fbcontext");
                                return data;
                            }

                            fbcontext = tempArr[1];
                            $u.log(4, "ajaxCTA fbcontext", fbcontext, tempArr);
                            tempArr = data.split('<div style="padding: 10px 30px;">');
                            if (tempArr && tempArr.length !== 2) {
                                $u.warn("ajaxCTA unable to do first split");
                                return data;
                            }

                            newData = tempArr[1];
                            tempArr = newData.split('<div id="' + caap.domain.id[caap.domain.which] + 'guild_bg_bottom" fbcontext="' + fbcontext + '">');
                            if (tempArr && tempArr.length !== 2) {
                                $u.warn("ajaxCTA unable to do second split");
                                return data;
                            }

                            newData = tempArr[0];
                            $u.log(4, "ajaxCTA dataFilter", [newData, type]);
                            return newData;
                        },
                    success:
                        function (data, textStatus, XMLHttpRequest) {
                            var tempText = $j('<div></div>').html(data).find("#" + caap.domain.id[caap.domain.which] + "guild_battle_banner_section").text();
                            if (tempText && tempText.match(/You do not have an on going guild monster battle/i)) {
                                schedule.setItem('ajaxCTATimer' + theCount, 86400, 900);
                                $u.log(4, "ajaxCTA not done", theUrl);
                            } else {
                                schedule.setItem('ajaxCTATimer' + theCount, 3600, 900);
                                $u.log(4, "ajaxCTA done", theUrl);
                            }

                            state.setItem('ajaxCTABackOff' + theCount, 0);
                            caap.waitAjaxCTA = false;
                        }
                });

                return true;
            } catch (err) {
                $u.error("ERROR in ajaxCTA: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        doCTAs: function (urls) {
            try {
                urls = [
                    "mOJKTYKCgoKcyiiyNiM3TVSEsjbUWiTYj6xIyB4c5VdoH3G2JHiu/PGHDbv36QKh2z/I2q7BfhbbCxh5BVNIR1RxIuTlH84QWcXQWqjNxdeC4R5giWjQ5b/yo0q9HM4C",
                    "vOJKTbm5ubnij+8pur2Gp5ozow1TmZ1c69jRXqIXS6uradSqhNgFUwa6378IXviqMu/BxzfHE1/+B6spd8mErM42qLhpBFOGam0fTiL498I518OpSJ4s+U0yu868uYP8",
                    "2OJKTYaGhob2k3paXWxtL/DBDmU78HPZKreKeVIaNhan0aK5yjGhuubhHygwv5N/L5afFhoh9gugmGNIoTj0xqo3O5pB8gnLx/I3FO8GxMi4u+kQFRaD4JM1cR3o43uW",
                    "7uJKTVNTU1N69Y31TtcH1acbyRryS5G2vKIdVe75FQSW2janxfLEk7IdV2rK3Vi28V0tXC+6ZQCe9E22UDiHEIHhcqwtNd8ulYglNFVqlYZGo3u+nPNN5rnCH1n7Qyvq",
                    "B+NKTaurq6svfr4+kpJ6Nlnv65AxQ+qw1Wsha3LcUwAgSUpEM/WRzGYeJwRmuGezx4FPt0JL3TGgagwxlXf0F2100x7jWZPUgmrMiv3ctZC9+KRipVmjp3TY7vOnxuq3"
                ];

                if (gm.getItem("ajaxCTA", false, hiddenVar) || caap.waitAjaxCTA || caap.stats['stamina']['num'] < 1 || !schedule.check('ajaxCTATimer')) {
                    return false;
                }

                var count = state.getItem('ajaxCTACount', 0),
                    aes   = new $u.Aes(gm.get_namespace());

                $u.log(4, "doCTAs", count, urls.length);
                if (count < urls.length) {
                    $u.log(4, 'ajaxCTATimer' + count, schedule.getItem('ajaxCTATimer' + count));
                    if (schedule.check('ajaxCTATimer' + count)) {
                        caap.waitAjaxCTA = true;
                        caap.ajaxCTA(caap.domain.link + aes.decrypt(urls[count]), count);
                    }

                    state.setItem('ajaxCTACount', count + 1);
                } else {
                    state.setItem('ajaxCTACount', 0);
                    schedule.setItem('ajaxCTATimer', 1800, 300);
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

        GetFriendList: function (listType, force) {
            try {
                $u.log(4, "Entered GetFriendList and request is for: ", listType.name);
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
                                    $u.log(4, "GetFriendList(" + listType.name + "): ", textStatus);
                                },
                            success:
                                function (data, textStatus, XMLHttpRequest) {
                                    try {
                                        $u.log(4, "GetFriendList.ajax splitting data");
                                        data = data.split('<div class="unselected_list">');
                                        if (data.length < 2) {
                                            throw "Could not locate 'unselected_list'";
                                        }

                                        data = data[1].split('</div><div class="selected_list">');
                                        if (data.length < 2) {
                                            throw "Could not locate 'selected_list'";
                                        }

                                        $u.log(4, "GetFriendList.ajax data split ok");
                                        var friendList = [];
                                        $j('<div></div>').html(data[0]).find('input').each(function (index) {
                                            friendList.push($j(this).val().parseInt());
                                        });

                                        $u.log(4, "GetFriendList.ajax saving friend list of: ", friendList.length);
                                        if (friendList.length) {
                                            state.setItem(listType.name + 'Responded', friendList);
                                        } else {
                                            state.setItem(listType.name + 'Responded', true);
                                        }

                                        $u.log(4, "GetFriendList(" + listType.name + "): ", textStatus);
                                    } catch (err) {
                                        state.setItem(listType.name + 'Requested', false);
                                        $u.error("ERROR in GetFriendList.ajax: " + err);
                                    }
                                }
                        });
                    }
                } else {
                    $u.log(4, "Already requested GetFriendList for: ", listType.name);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in GetFriendList(" + listType.name + "): " + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                              FILL ARMY
        /////////////////////////////////////////////////////////////////////

        addFriendSpamCheck: 0,

        AutoFillArmy: function (caListType, fbListType) {
            try {
                if (!state.getItem('FillArmy', false) || caap.domain.which > 1) {
                    return false;
                }

                function AddFriend(id) {
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
                        $u.error("ERROR in AddFriend(" + id + "): " + err);
                        return false;
                    }
                }

                var armyCount = state.getItem("ArmyCount", 0);
                if (armyCount === 0) {
                    caap.SetDivContent('idle_mess', 'Filling Army');
                    $u.log(1, "Filling army");
                }

                if (state.getItem(caListType.name + 'Responded', false) === true || state.getItem(fbListType.name + 'Responded', false) === true) {
                    caap.SetDivContent('idle_mess', '<span style="font-weight: bold;">Fill Army Completed</span>');
                    $u.log(1, "Fill Army Completed: no friends found");
                    window.setTimeout(function () {
                        caap.SetDivContent('idle_mess', '');
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
                    caap.GetFriendList(caListType);
                    caap.GetFriendList(fbListType);
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
                        AddFriend(fillArmyList[armyCount]);
                        armyCount += 1;
                        caap.addFriendSpamCheck += 1;
                    }

                    caap.SetDivContent('idle_mess', 'Filling Army, Please wait...' + armyCount + "/" + fillArmyList.length);
                    $u.log(1, 'Filling Army, Please wait...' + armyCount + "/" + fillArmyList.length);
                    state.setItem("ArmyCount", armyCount);
                    if (armyCount >= fillArmyList.length) {
                        caap.SetDivContent('idle_mess', '<span style="font-weight: bold;">Fill Army Completed</span>');
                        window.setTimeout(function () {
                            caap.SetDivContent('idle_mess', '');
                        }, 5000);

                        $u.log(1, "Fill Army Completed");
                        state.setItem('FillArmy', false);
                        state.setItem("ArmyCount", 0);
                        state.setItem('FillArmyList', []);
                    }
                }

                return true;
            } catch (err) {
                $u.error("ERROR in AutoFillArmy: " + err);
                caap.SetDivContent('idle_mess', '<span style="font-weight: bold;">Fill Army Failed</span>');
                window.setTimeout(function () {
                    caap.SetDivContent('idle_mess', '');
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

        Idle: function () {
            if (state.getItem('resetselectMonster', false)) {
                $u.log(4, "resetselectMonster");
                monster.select(true);
                state.setItem('resetselectMonster', false);
            }

            if (caap.CheckGenerals()) {
                return true;
            }

            if (general.GetAllStats()) {
                return true;
            }

            if (caap.CheckKeep()) {
                return true;
            }

            if (caap.CheckAchievements()) {
                return true;
            }

            if (caap.AjaxGiftCheck()) {
                return true;
            }

            if (caap.ReconPlayers()) {
                return true;
            }

            if (caap.CheckOracle()) {
                return true;
            }

            if (caap.CheckBattleRank()) {
                return true;
            }

            if (caap.CheckWarRank()) {
                return true;
            }

            if (caap.CheckSymbolQuests()) {
                return true;
            }

            if (caap.CheckSoldiers()) {
                return true;
            }

            if (caap.CheckItem()) {
                return true;
            }

            if (caap.CheckMagic()) {
                return true;
            }

            if (caap.CheckCharacterClasses()) {
                return true;
            }

            if (army.run()) {
                return true;
            }

            if (caap.doCTAs()) {
                return true;
            }

            caap.AutoFillArmy(caap.friendListType.giftc, caap.friendListType.facebook);
            caap.UpdateDashboard();
            state.setItem('ReleaseControl', true);
            return true;
        },

        /////////////////////////////////////////////////////////////////////
        //                              PLAYER RECON
        /////////////////////////////////////////////////////////////////////

        /*-------------------------------------------------------------------------------------\
                                          RECON PLAYERS
        ReconPlayers is an idle background process that scans the battle page for viable
        targets that can later be attacked.
        \-------------------------------------------------------------------------------------*/

        ReconRecordArray : [],

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        ReconRecord: function () {
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

        LoadRecon: function () {
            caap.ReconRecordArray = gm.getItem('recon.records', 'default');
            if (caap.ReconRecordArray === 'default' || !$j.isArray(caap.ReconRecordArray)) {
                caap.ReconRecordArray = gm.setItem('recon.records', []);
            }

            caap.reconhbest = caap.reconhbest === false ? JSON.hbest(caap.ReconRecordArray) : caap.reconhbest;
            $u.log(3, "recon.records Hbest", caap.reconhbest);
            state.setItem("ReconDashUpdate", true);
            $u.log(3, "recon.records", caap.ReconRecordArray);
        },

        SaveRecon: function () {
            var compress = false;
            gm.setItem('recon.records', caap.ReconRecordArray, caap.reconhbest, compress);
            state.setItem("ReconDashUpdate", true);
            $u.log(3, "recon.records", caap.ReconRecordArray);
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        ReconPlayers: function () {
            try {
                if (!config.getItem('DoPlayerRecon', false)) {
                    return false;
                }

                if (caap.stats['stamina']['num'] <= 0) {
                    return false;
                }

                if (!schedule.check('PlayerReconTimer')) {
                    return false;
                }

                var theUrl = '';
                caap.SetDivContent('idle_mess', 'Player Recon: In Progress');
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

                                $u.log(3, "ReconPlayers.ajax: Checking data.");

                                $j(data).find("img[src*='symbol_']").not("[src*='symbol_tiny_']").each(function (index) {
                                    var UserRecord      = new caap.ReconRecord(),
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
                                            $u.log(2, "ReconPlayers: No userId, skipping");
                                            return true;
                                        }

                                        UserRecord.data['userID'] = i;
                                        for (i = 0, len = caap.ReconRecordArray.length; i < len; i += 1) {
                                            if (caap.ReconRecordArray[i]['userID'] === UserRecord.data['userID']) {
                                                UserRecord.data = caap.ReconRecordArray[i];
                                                caap.ReconRecordArray.splice(i, 1);
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
                                                    while (caap.ReconRecordArray.length >= entryLimit) {
                                                        OldRecord = caap.ReconRecordArray.shift();
                                                        $u.log(3, "Entry limit matched. Deleted an old record", OldRecord);
                                                    }

                                                    $u.log(3, "UserRecord", UserRecord);
                                                    caap.ReconRecordArray.push(UserRecord.data);
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

                                caap.SaveRecon();
                                caap.SetDivContent('idle_mess', 'Player Recon: Found:' + found + ' Total:' + caap.ReconRecordArray.length);
                                $u.log(1, 'Player Recon: Found:' + found + ' Total:' + caap.ReconRecordArray.length);
                                window.setTimeout(function () {
                                    caap.SetDivContent('idle_mess', '');
                                }, 5000);

                                $u.log(4, "ReconPlayers.ajax: Done.", caap.ReconRecordArray);
                            } catch (err) {
                                $u.error("ERROR in ReconPlayers.ajax: " + err);
                            }
                        }
                });

                schedule.setItem('PlayerReconTimer', gm.getItem('PlayerReconRetry', 60, hiddenVar), 60);
                return true;
            } catch (err) {
                $u.error("ERROR in ReconPlayers:" + err);
                return false;
            }
        },

        /////////////////////////////////////////////////////////////////////
        //                          MAIN LOOP
        // This function repeats continously.  In principle, functions should only make one
        // click before returning back here.
        /////////////////////////////////////////////////////////////////////

        actionDescTable: {
            'AutoIncome'         : 'Awaiting Income',
            'AutoStat'           : 'Upgrade Skill Points',
            'MaxEnergyQuest'     : 'At Max Energy Quest',
            'PassiveGeneral'     : 'Setting Idle General',
            'Idle'               : 'Idle Tasks',
            'ImmediateBanking'   : 'Immediate Banking',
            'Battle'             : 'Battling Players',
            'MonsterReview'      : 'Review Monsters/Raids',
            'GuildMonsterReview' : 'Review Guild Monsters',
            'ImmediateAutoStat'  : 'Immediate Auto Stats',
            'AutoElite'          : 'Fill Elite Guard',
            'AutoPotions'        : 'Auto Potions',
            'AutoAlchemy'        : 'Auto Alchemy',
            'AutoBless'          : 'Auto Bless',
            'AutoGift'           : 'Auto Gifting',
            'DemiPoints'         : 'Demi Points First',
            'Monsters'           : 'Fighting Monsters',
            'GuildMonster'       : 'Fight Guild Monster',
            'Heal'               : 'Auto Healing',
            'Bank'               : 'Auto Banking',
            'Lands'              : 'Land Operations'
        },
        /*jslint sub: false */

        CheckLastAction: function (thisAction) {
            try {
                var lastAction = state.getItem('LastAction', 'Idle');
                caap.SetDivContent('activity_mess', 'Activity: ' + $u.setContent(caap.actionDescTable[thisAction], thisAction));

                if (lastAction !== thisAction) {
                    $u.log(1, 'Changed from doing ' + lastAction + ' to ' + thisAction);
                    state.setItem('LastAction', thisAction);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in CheckLastAction:" + err);
                return false;
            }
        },

        masterActionList: {
            0x00: 'AutoElite',
            0x01: 'Heal',
            0x02: 'ImmediateBanking',
            0x03: 'ImmediateAutoStat',
            0x04: 'MaxEnergyQuest',
            0x05: 'ArenaReview',
            0x06: 'GuildMonsterReview',
            0x07: 'MonsterReview',
            0x08: 'GuildMonster',
            0x09: 'Arena',
            0x0A: 'DemiPoints',
            0x0B: 'Monsters',
            0x0C: 'Battle',
            0x0D: 'Quests',
            0x0E: 'Bank',
            0x0F: 'PassiveGeneral',
            0x10: 'Lands',
            0x11: 'AutoBless',
            0x12: 'AutoStat',
            0x13: 'AutoGift',
            0x14: 'AutoPotions',
            0x15: 'AutoAlchemy',
            0x16: 'Idle'
        },

        actionsList: [],

        MakeActionsList: function () {
            try {
                if (!$u.hasContent(caap.actionsList)) {
                    $u.log(2, "Loading a fresh Action List");
                    // actionOrder is a comma seperated string of action numbers as
                    // hex pairs and can be referenced in the Master Action List
                    // Example: "00,01,02,03,04,05,06,07,08,09,0A,0B,0C,0D,0E,0F,10,11,12"
                    var action                = '',
                        actionOrderArray      = [],
                        masterActionListCount = 0,
                        actionOrderUser       = gm.getItem("actionOrder", '', hiddenVar),
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
                $u.error("ERROR in MakeActionsList: " + err);
                caap.actionsList = [
                    "AutoElite",
                    "Heal",
                    "ImmediateBanking",
                    "ImmediateAutoStat",
                    "MaxEnergyQuest",
                    'GuildMonsterReview',
                    "ArenaReview",
                    "MonsterReview",
                    'GuildMonster',
                    'Arena',
                    "DemiPoints",
                    "Monsters",
                    "Battle",
                    "Quests",
                    "Bank",
                    'PassiveGeneral',
                    "Lands",
                    "AutoBless",
                    "AutoStat",
                    "AutoGift",
                    'AutoPotions',
                    "AutoAlchemy",
                    "Idle"
                ];

                return false;
            }
        },

        ErrorCheck: function () {
            // assorted errors...
            if (window.location.href.hasIndexOf('/common/error.html') || window.location.href.hasIndexOf('/sorry.php')) {
                $u.warn('Detected "error" or "sorry" page, waiting to go back to previous page.');
                window.setTimeout(function () {
                    if ($u.isFunction(window.history.back)) {
                        window.history.back();
                    } else if ($u.isFunction(window.history.go)) {
                        window.history.go(-1);
                    } else {
                        window.location.href = 'http://apps.facebook.com/castle_age/index.php?bm=1&ref=bookmarks&count=0';
                    }
                }, 30000);

                return true;
            }

            // Try again button
            var button = $j('#try_again_button');
            if ($u.hasContent(button)) {
                $u.warn('Detected "Try Again" message, clicking button else refresh.');
                caap.Click(button);
                window.setTimeout(function () {
                    $u.reload();
                }, 30000);

                return true;
            }

            return false;
        },

        MainLoop: function () {
            try {
                var button          = null,
                    noWindowLoad    = 0,
                    actionsListCopy = [],
                    action          = 0,
                    len             = 0,
                    ajaxLoadIcon    = null;

                // assorted errors...
                if (caap.ErrorCheck()) {
                    return true;
                }

                if (caap.domain.which === 1) {
                    gifting.collect();
                    caap.WaitMainLoop();
                    return true;
                }

                //We don't need to send out any notifications
                button = $j("a[class*='undo_link']");
                if ($u.hasContent(button)) {
                    $u.log(1, 'Undoing notification');
                    caap.Click(button);
                }

                if (config.getItem('Disabled', false)) {
                    caap.WaitMainLoop();
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
                        caap.ReloadCastleAge();
                    }

                    $u.log(1, 'Page no-load count: ', noWindowLoad);
                    caap.pageLoadOK = caap.GetStats();
                    caap.WaitMainLoop();
                    return true;
                } else {
                    state.setItem('NoWindowLoad', 0);
                }

                if (state.getItem('caapPause', 'none') !== 'none') {
                    caap.WaitMainLoop();
                    return true;
                }

                if (caap.waitingForDomLoad) {
                    if (schedule.since('clickedOnSomething', 45)) {
                        $u.log(1, 'Clicked on something, but nothing new loaded.  Reloading page.');
                        caap.ReloadCastleAge();
                        return true;
                    }

                    ajaxLoadIcon = $j('#' + caap.domain.id[caap.domain.which] + 'AjaxLoadIcon');
                    if ($u.hasContent(ajaxLoadIcon) && ajaxLoadIcon.css("display") !== "none") {
                        $u.log(1, 'Waiting for page load ...');
                        caap.WaitMainLoop();
                        return true;
                    }
                }

                if (caap.delayMain) {
                    $u.log(1, 'Delay main ...');
                    caap.WaitMainLoop();
                    return true;
                }

                if (caap.AutoIncome()) {
                    caap.CheckLastAction('AutoIncome');
                    caap.WaitMainLoop();
                    return true;
                }

                caap.MakeActionsList();
                actionsListCopy = caap.actionsList.slice();
                if (state.getItem('ReleaseControl', false)) {
                    state.setItem('ReleaseControl', false);
                } else {
                    actionsListCopy.unshift(state.getItem('LastAction', 'Idle'));
                }

                monster.select();
                for (action = 0, len = actionsListCopy.length; action < len; action += 1) {
                    if (caap[actionsListCopy[action]]()) {
                        caap.CheckLastAction(actionsListCopy[action]);
                        break;
                    }
                }

                caap.WaitMainLoop();
                return true;
            } catch (err) {
                $u.error("ERROR in MainLoop: " + err);
                return false;
            }
        },

        waitMilliSecs: 5000,

        WaitMainLoop: function () {
            try {
                window.setTimeout(function () {
                    caap.waitMilliSecs = 5000;
                    if (caap.flagReload) {
                        caap.ReloadCastleAge();
                    }

                    caap.MainLoop();
                }, caap.waitMilliSecs * (1 + Math.random() * 0.2));

                return true;
            } catch (err) {
                $u.error("ERROR in WaitMainLoop: " + err);
                return false;
            }
        },

        ReloadCastleAge: function () {
            try {
                // better than reload... no prompt on forms!
                if (!config.getItem('Disabled') && (state.getItem('caapPause') === 'none')) {
                    caap.VisitUrl(caap.domain.link + "/index.php?bm=1&ref=bookmarks&count=0");
                }

                return true;
            } catch (err) {
                $u.error("ERROR in ReloadCastleAge: " + err);
                return false;
            }
        },

        ReloadOccasionally: function () {
            try {
                var reloadMin = gm.getItem('ReloadFrequency', 8, hiddenVar);
                reloadMin = !$u.isNumber(reloadMin) || reloadMin < 8 ? 8 : reloadMin;
                window.setTimeout(function () {
                    if (schedule.since('clickedOnSomething', 300) || caap.pageLoadCounter > 40) {
                        $u.log(1, 'Reloading if not paused after inactivity');
                        caap.flagReload = true;
                    }

                    caap.ReloadOccasionally();
                }, 60000 * reloadMin + (reloadMin * 60000 * Math.random()));

                return true;
            } catch (err) {
                $u.error("ERROR in ReloadOccasionally: " + err);
                return false;
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
    caap['CheckResults_index'] = caap.CheckResults_index;
    caap['CheckResults_fightList'] = caap.CheckResults_fightList;
    caap['CheckResults_viewFight'] = caap.CheckResults_viewFight;
    caap['CheckResults_fightList'] = caap.CheckResults_fightList;
    caap['CheckResults_viewFight'] = caap.CheckResults_viewFight;
    caap['CheckResults_land'] = caap.CheckResults_land;
    caap['CheckResults_generals'] = caap.CheckResults_generals;
    caap['CheckResults_quests'] = caap.CheckResults_quests;
    caap['CheckResults_gift_accept'] = caap.CheckResults_gift_accept;
    caap['CheckResults_army'] = caap.CheckResults_army;
    caap['CheckResults_keep'] = caap.CheckResults_keep;
    caap['CheckResults_oracle'] = caap.CheckResults_oracle;
    caap['CheckResults_alchemy'] = caap.CheckResults_alchemy;
    caap['CheckResults_battlerank'] = caap.CheckResults_battlerank;
    caap['CheckResults_war_rank'] = caap.CheckResults_war_rank;
    caap['CheckResults_achievements'] = caap.CheckResults_achievements;
    caap['CheckResults_battle'] = caap.CheckResults_battle;
    caap['CheckResults_soldiers'] = caap.CheckResults_soldiers;
    caap['CheckResults_item'] = caap.CheckResults_item;
    caap['CheckResults_magic'] = caap.CheckResults_magic;
    caap['CheckResults_gift'] = caap.CheckResults_gift;
    caap['CheckResults_goblin_emp'] = caap.CheckResults_goblin_emp;
    caap['CheckResults_view_class_progress'] = caap.CheckResults_view_class_progress;
    caap['CheckResults_guild'] = caap.CheckResults_guild;
    caap['CheckResults_guild_current_battles'] = caap.CheckResults_guild_current_battles;
    caap['CheckResults_guild_current_monster_battles'] = caap.CheckResults_guild_current_monster_battles;
    caap['CheckResults_guild_battle_monster'] = caap.CheckResults_guild_battle_monster;
    caap['CheckResults_arena'] = caap.CheckResults_arena;
    caap['CheckResults_arena_battle'] = caap.CheckResults_arena_battle;
    caap['AutoElite'] = caap.AutoElite;
    caap['Heal'] = caap.Heal;
    caap['ImmediateBanking'] = caap.ImmediateBanking;
    caap['ImmediateAutoStat'] = caap.ImmediateAutoStat;
    caap['MaxEnergyQuest'] = caap.MaxEnergyQuest;
    caap['MonsterReview'] = caap.MonsterReview;
    caap['GuildMonsterReview'] = caap.GuildMonsterReview;
    caap['GuildMonster'] = caap.GuildMonster;
    caap['DemiPoints'] = caap.DemiPoints;
    caap['Monsters'] = caap.Monsters;
    caap['Battle'] = caap.Battle;
    caap['Quests'] = caap.Quests;
    caap['Bank'] = caap.Bank;
    caap['PassiveGeneral'] = caap.PassiveGeneral;
    caap['Lands'] = caap.Lands;
    caap['AutoBless'] = caap.AutoBless;
    caap['AutoStat'] = caap.AutoStat;
    caap['AutoGift'] = caap.AutoGift;
    caap['AutoPotions'] = caap.AutoPotions;
    caap['AutoAlchemy'] = caap.AutoAlchemy;
    caap['Idle'] = caap.Idle;
    caap['AutoIncome'] = caap.AutoIncome;
    caap['Arena'] = caap.Arena;
    caap['ArenaReview'] = caap.ArenaReview;
    /*jslint sub: false */
