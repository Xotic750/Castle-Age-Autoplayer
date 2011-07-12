
    //////////////////////////////////
    //       Functions
    //////////////////////////////////

    function caap_log(msg) {
        if (window.console && typeof console.log === 'function') {
            msg = "(" + caap.domain.which + ")" + caapVersion + (devVersion !== '0' ? 'd' + devVersion : '') + ' |' + (new Date()).toLocaleTimeString() + '| ' + msg;
            if (arguments.length > 1) {
                console.log(msg, Array.prototype.slice.call(arguments, 1));
            } else {
                console.log(msg);
            }
        }
    }

    function injectScript(url) {
        var inject = document.createElement('script');
        inject.setAttribute('type', 'text/javascript');
        inject.setAttribute('src', url);
        (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
        caap.removeLibs.push(inject);
    }

    function fbLog() {
        var inject = document.createElement('script');
        inject.setAttribute('type', 'text/javascript');
        inject.textContent = "console.log(window,FB);";
        (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
        (document.head || document.getElementsByTagName('head')[0]).removeChild(inject);
    }

    function getFBEnv() {
        var inject = document.createElement('script');
        inject.setAttribute('type', 'text/javascript');
        inject.textContent = "(function () {sessionStorage.setItem('caap_fbEnv', JSON.stringify(Env));})();";
        (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
        (document.head || document.getElementsByTagName('head')[0]).removeChild(inject);
    }

    function getFBData() {
        var inject = document.createElement('script');
        inject.setAttribute('type', 'text/javascript');
        inject.textContent = "(function () {FB.api('/me', function (r) {sessionStorage.setItem('caap_fbData', JSON.stringify({me: r,session: FB.getSession()}));});})();";
        (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
        (document.head || document.getElementsByTagName('head')[0]).removeChild(inject);
    }

    function getFBFriends() {
        var inject = document.createElement('script');
        inject.setAttribute('type', 'text/javascript');
        inject.textContent = "(function () {FB.api({method: 'fql.query',query: 'SELECT uid, name FROM user WHERE is_app_user = 1 AND uid IN (SELECT uid2 FROM friend WHERE uid1 = me())'}, function (a) {sessionStorage.setItem('caap_fbFriends', JSON.stringify(a));});})();";
        (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
        (document.head || document.getElementsByTagName('head')[0]).removeChild(inject);
    }

    function caap_reload() {
        if ("reload" in window.location) {
            window.location.reload();
        } else if ("history" in window && "go" in window.history) {
            window.history.go(0);
        } else {
            window.location.href = window.location.href;
        }
    }

    function caap_DomTimeOut() {
        caap_log("DOM onload timeout!!! Reloading ...");
        caap_reload();
    }

    function caap_WaitForData() {
        caap.fbData = JSON.parse(sessionStorage.getItem('caap_fbData'));
        caap.fbEnv = JSON.parse(sessionStorage.getItem('caap_fbEnv'));
        caap.fbFriends = JSON.parse(sessionStorage.getItem('caap_fbFriends'));
        if (((caap.domain.which === 2 || caap.domain.which === 3) && caap.fbData && caap.fbFriends) || caap.fbEnv) {
            caap_log("data ready ...", caap.fbFriends);
            sessionStorage.removeItem('caap_fbData');
            sessionStorage.removeItem('caap_fbEnv');
            sessionStorage.removeItem('caap_fbFriends');
            sessionStorage.removeItem('caap_giftSend');
            sessionStorage.removeItem('caap_giftCustom');
            sessionStorage.removeItem('caap_giftGuild');
            sessionStorage.removeItem('caap_giftQueue');
            sessionStorage.removeItem('caap_giftHistory');
            sessionStorage.removeItem('caap_nfollowers');
            caap.start();
        } else {
            caap_log("Waiting for data ...");
            window.setTimeout(caap_WaitForData, 100);
        }
    }

    function caap_WaitForutility() {
        if (window.utility) {
            caap_log("utility ready ...");
            session = new $u.VarsHelper();
            con = new utility.LogHelper();
            con.log_version = "(" + caap.domain.which + ")" + caapVersion + (devVersion !== '0' ? 'd' + devVersion : '');
            con.log_level = 1;
            $j(function () {
                caap_log("Inject data collectors.");
                if (caap.domain.which === 2 || caap.domain.which === 3) {
                    getFBData();
                    getFBFriends();
                } else {
                    getFBEnv();
                }

                caap_WaitForData();
            }).ready();
        } else {
            caap_log("Waiting for utility ...");
            window.setTimeout(caap_WaitForutility, 100);
        }
    }

    function caap_WaitForDataTable() {
        if (window.jQuery().dataTable) {
            caap_log("dataTable ready ...");
            if (!window.utility) {
                caap_log("Inject utility.");
                injectScript(caap.libs.utility);
            }

            caap_WaitForutility();
        } else {
            caap_log("Waiting for dataTable ...");
            window.setTimeout(caap_WaitForDataTable, 100);
        }
    }

    function caap_WaitForFarbtastic() {
        if (window.jQuery.farbtastic) {
            caap_log("farbtastic ready ...");
            if (!window.jQuery().dataTable) {
                caap_log("Inject dataTable.");
                injectScript(caap.libs.dataTables);
            }

            caap_WaitForDataTable();
        } else {
            caap_log("Waiting for farbtastic ...");
            window.setTimeout(caap_WaitForFarbtastic, 100);
        }
    }

    function caap_WaitForjQueryUI() {
        if (window.jQuery.ui) {
            caap_log("jQueryUI ready ...");
            if (!window.jQuery.farbtastic) {
                caap_log("Inject farbtastic.");
                injectScript(caap.libs.farbtastic);
            }

            caap_WaitForFarbtastic();
        } else {
            caap_log("Waiting for jQueryUI ...");
            window.setTimeout(caap_WaitForjQueryUI, 100);
        }
    }

    function caap_WaitForjQuery() {
        if (window.jQuery && window.jQuery().jquery === "!jquery!") {
            caap_log("jQuery ready ...");
            if (!window.$j) {
                window.$j = window.jQuery.noConflict();
            } else {
                if (!window.caap_comms) {
                    throw "$j is already in use!";
                }
            }

            if (!window.jQuery.ui) {
                caap_log("Inject jQueryUI.");
                injectScript(caap.libs.jQueryUI);
            }

            caap_WaitForjQueryUI();
        } else {
            caap_log("Waiting for jQuery ...");
            window.setTimeout(caap_WaitForjQuery, 100);
        }
    }

    /////////////////////////////////////////////////////////////////////
    //                         Begin
    /////////////////////////////////////////////////////////////////////

    sessionStorage.removeItem('caap_fbData');
    sessionStorage.removeItem('caap_fbEnv');
    sessionStorage.removeItem('caap_fbFriends');

    if (window.location.href.indexOf(caap.domain.url[0]) >= 0) {
        caap.domain.which = 0;
    } else if (window.location.href.indexOf(caap.domain.url[1]) >= 0) {
        caap.domain.which = 1;
    } else if (window.location.href.indexOf(caap.domain.url[2]) >= 0) {
        caap.domain.which = 2;
        retryDelay = 5000;
    } else if (window.location.href.indexOf(caap.domain.url[3]) >= 0) {
        caap.domain.which = 3;
    } else if (window.location.href.indexOf(caap.domain.url[4]) >= 0) {
        caap.domain.which = 4;
    } else {
        caap.domain.which = -1;
        caap_log('Unknown domain! ' + window.location.href);
    }

    if (window.location.href.indexOf('http://') >= 0) {
        caap.domain.ptype = 0;
    } else if (window.location.href.indexOf('https://') >= 0) {
        caap.domain.ptype = 1;
    } else {
        caap.domain.ptype = -1;
        caap_log('Unknown protocol! ' + window.location.href);
    }

    if (top === self) {
        caap_log("Started in a window");
    } else {
        caap_log("Started in an iFrame");
        caap.domain.inIframe = true;
    }

    if (caap.domain.which === -1 || caap.domain.ptype === -1) {
        caap_reload();
    }

    caap.domain.link = caap.domain.protocol[caap.domain.ptype] + caap.domain.url[caap.domain.which];
    caap.domain.altered = caap.domain.protocol[caap.domain.ptype] + caap.domain.url[caap.domain.which === 3 ? 0 : caap.domain.which];
    caap_log('Domain', caap.domain.which, caap.domain.protocol[caap.domain.ptype], caap.domain.url[caap.domain.which]);
    caap.documentTitle = document.title;
    caap_log(window.navigator.userAgent);
    if (typeof CAAP_SCOPE_RUN !== 'undefined') {
        caap_log('Remote version: ' + CAAP_SCOPE_RUN[0] + ' ' + CAAP_SCOPE_RUN[1] + ' d' + CAAP_SCOPE_RUN[2]);
    }

    caap_log("Starting ... waiting for libraries and DOM load");
    caap_timeout = window.setTimeout(caap_DomTimeOut, 180000);
    if (!window.jQuery || window.jQuery().jquery !== "!jquery!") {
        caap_log("Inject jQuery");
        injectScript(caap.libs.jQuery);
    }

    caap_WaitForjQuery();
}());

// ENDOFSCRIPT
