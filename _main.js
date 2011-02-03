
    //////////////////////////////////
    //       Functions
    //////////////////////////////////

    function caap_log(msg) {
        if (typeof console.log !== 'undefined') {
            console.log(caapVersion + (devVersion ? 'd' + devVersion : '') + ' |' + (new Date()).toLocaleTimeString() + '| ' + msg);
        }
    }

    function injectScript(url) {
        var inject = document.createElement('script');
        inject.setAttribute('type', 'text/javascript');
        inject.setAttribute('src', url);
        (document.head || document.getElementsByTagName('head')[0]).appendChild(inject);
    }

    function caap_DomTimeOut() {
        caap_log("DOM onload timeout!!! Reloading ...");
        $u.refreshPage();
    }

    function caap_WaitForutility() {
        if (typeof utility !== 'undefined') {
            caap_log("utility ready ...");
            jQuery(caap.start);
        } else {
            caap_log("Waiting for utility ...");
            window.setTimeout(caap_WaitForutility, 100);
        }
    }

    function caap_WaitForrison() {
        if (typeof rison !== 'undefined') {
            caap_log("rison ready ...");
            if (typeof utility === 'undefined') {
                caap_log("Inject utility.");
                injectScript('http://castle-age-auto-player.googlecode.com/files/utility.min.js?' + new Date().getTime());
            }

            caap_WaitForutility();
        } else {
            caap_log("Waiting for rison ...");
            window.setTimeout(caap_WaitForrison, 100);
        }
    }

    function caap_WaitForFarbtastic() {
        if (typeof jQuery.farbtastic === 'function') {
            caap_log("farbtastic ready ...");
            if (typeof rison === 'undefined') {
                caap_log("Inject rison.");
                injectScript('http://castle-age-auto-player.googlecode.com/files/rison.js');
            }

            caap_WaitForrison();
        } else {
            caap_log("Waiting for farbtastic ...");
            window.setTimeout(caap_WaitForFarbtastic, 100);
        }
    }

    function caap_WaitForjQueryUI() {
        if (typeof jQuery.ui === 'object') {
            caap_log("jQueryUI ready ...");
            if (typeof jQuery.farbtastic !== 'function') {
                caap_log("Inject farbtastic.");
                injectScript('http://castle-age-auto-player.googlecode.com/files/farbtastic.min.js');
            }

            caap_WaitForFarbtastic();
        } else {
            caap_log("Waiting for jQueryUI ...");
            window.setTimeout(caap_WaitForjQueryUI, 100);
        }
    }

    function caap_WaitForjQuery() {
        if (typeof window.jQuery === 'function') {
            caap_log("jQuery ready ...");
            $j = jQuery.noConflict();
            if (typeof $j.ui !== 'object') {
                caap_log("Inject jQueryUI.");
                injectScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.8/jquery-ui.min.js');
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

    caap_log("Starting ... waiting for libraries and DOM load");
    caap_timeout = window.setTimeout(caap_DomTimeOut, 180000);
    if (typeof window.jQuery !== 'function') {
        caap_log("Inject jQuery");
        injectScript('http://ajax.googleapis.com/ajax/libs/jquery/1.4.4/jquery.min.js');
    }

    caap_WaitForjQuery();

}());
// ENDOFSCRIPT
