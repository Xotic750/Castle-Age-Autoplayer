/*
        GM Function support for Chrome for the use with
        the Castle Age Autoplayer script.

        Version 1.0.3.0
*/

if ((typeof GM_getValue == 'undefined') || !GM_getValue('a', true)) {
        GM_addStyle = function(css) {
                var style = document.createElement('style');
                style.textContent = css;
                document.getElementsByTagName('head')[0].appendChild(style);
        };

        GM_deleteValue = function(name) {
                localStorage.removeItem(name);
        };

        GM_getValue = function(name, defaultValue) {
                var value = localStorage.getItem(name);
                if (!value)
                        return defaultValue;
                var type = value[0];
                value = value.substring(1);
                switch (type) {
                        case 'b':
                                return value == 'true';
                        case 'n':
                                return Number(value);
                        default:
                                return value;
                }
        };

        GM_log = function(message) {
                console.log(message);
        };

        GM_registerMenuCommand = function(name, funk) {
        };

        GM_setValue = function(name, value) {
                value = (typeof value)[0] + value;
                localStorage.setItem(name, value);
        };

        GM_listValues = function() {
                var names = [];
                for (var i =0; i < localStorage.length; i++) {
                        names.push(localStorage.key(i));
                }
                return names;
        };

        if(typeof(unsafeWindow)=='undefined') { unsafeWindow=window; }

}