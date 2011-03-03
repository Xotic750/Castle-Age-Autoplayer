
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
        if (typeof window.location.reload === 'function') {
            window.location.reload();
        } else if (typeof history.go === 'function') {
            history.go(0);
        } else {
            window.location.href = window.location.href;
        }
    }

    function caap_WaitForutility() {
        if (window.utility) {
            caap_log("utility ready ...");
            $j(caap.start).ready();
        } else {
            caap_log("Waiting for utility ...");
            window.setTimeout(caap_WaitForutility, 100);
        }
    }

    function caap_WaitForFarbtastic() {
        if (window.jQuery.farbtastic) {
            caap_log("farbtastic ready ...");
            if (!window.utility) {
                caap_log("Inject utility.");
                injectScript('http://utility-js.googlecode.com/files/utility-0.1.0.min.js');
            }

            caap_WaitForutility();
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
                injectScript('http://castle-age-auto-player.googlecode.com/files/farbtastic.min.js');
            }

            caap_WaitForFarbtastic();
        } else {
            caap_log("Waiting for jQueryUI ...");
            window.setTimeout(caap_WaitForjQueryUI, 100);
        }
    }

    function caap_WaitForjQuery() {
        if (window.jQuery) {
            caap_log("jQuery ready ...");
            $j = window.jQuery.noConflict();
            if (!window.jQuery.ui) {
                caap_log("Inject jQueryUI.");
                injectScript('http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.10/jquery-ui.min.js');
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
    if (!window.jQuery) {
        caap_log("Inject jQuery");
        injectScript('http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js');
    }

    caap_WaitForjQuery();

}());
// ENDOFSCRIPT
