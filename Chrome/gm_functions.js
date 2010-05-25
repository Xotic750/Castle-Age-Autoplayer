/*
        GM Function support for Chrome for the use with
        the Castle Age Autoplayer script.

        Version 1.0.4.4
*/

/*jslint white: true, browser: true, devel: true, onevar: true, undef: true, nomen: true, eqeqeq: true, plusplus: true, bitwise: true, regexp: true, immed: true, strict: true */
/*global window,unsafeWindow,$,localStorage,GM_setValue,GM_getValue,GM_addStyle,GM_deleteValue,GM_log,GM_registerMenuCommand,GM_listValues,ConvertGMtoJSON */

"use strict";

if ((typeof GM_getValue === 'undefined') || !GM_getValue('a', true)) {
    /*
    Syntax
        function GM_log( message )

    Arguments
        message
            String (or any object with a .toString() method) The message to
            display in the console.

    Returns
        undefined
    */
    GM_log = function (message) {
        try {
            console.log(message);
        } catch (error) {
            console.log("ERROR in GM_log: " + error);
        }
    };

    /*
    Syntax
        function GM_setValue( name, value )

    Arguments
        name
            String The unique (within this script) name for this value. Should be
            restricted to valid Javascript identifier characters.
        value
            String, Integer or Boolean Any valid value of these types. Any other
            type may cause undefined behavior, including crashes.

    Returns
        undefined
    */
    GM_setValue = function (name, value) {
        try {
            localStorage.setItem(name, JSON.stringify(value));
        } catch (error) {
            console.log("ERROR in GM_setValue: " + error);
        }
    };

    /*
    Syntax
        function GM_deleteValue( name )

    Arguments
        name
            Property name to delete. See GM_setValue for details.

    Returns
        undefined
    */
    GM_deleteValue = function (name) {
        try {
            localStorage.removeItem(name);
        } catch (error) {
            console.log("ERROR in GM_deleteValue: " + error);
        }
    };

    /*
    Syntax
        function GM_getValue( name, default )

    Arguments
        name
            String The property name to get. See GM_setValue for details.
        default
            Optional. Any value to be returned, when no value has previously been set.

    Returns
        When this name has been set
            String, Integer or Boolean as previously set
        When this name has not been set, and default is provided
            The value passed as default
        When this name has not been set, and default is not
            null
    */
    GM_getValue = function (name, defaultValue) {
        try {
            var value = $.parseJSON(localStorage.getItem(name));
            //console.log("GM_getValue(" + name + ", " + defaultValue + "): Value: " + value + " Type: " + typeof value);
            switch (typeof value) {
            case 'boolean':
                return value === true;
            case 'number':
                return Number(value);
            case 'string':
                return value;
            default:
            }

            switch (typeof defaultValue) {
            case 'boolean':
                return defaultValue === true;
            case 'number':
                return Number(defaultValue);
            case 'string':
                return defaultValue;
            default:
            }

            return null;
        } catch (error) {
            console.log("ERROR in GM_getValue: " + error);
            GM_deleteValue(name);
            console.log("Deleted corrupt key: " + name);
            switch (typeof defaultValue) {
            case 'boolean':
                return defaultValue === true;
            case 'number':
                return Number(defaultValue);
            case 'string':
                return defaultValue;
            default:
            }

            return null;
        }
    };

    /*
    Syntax
        function GM_listValues( )

    Arguments
        None.

    Returns
        Array of Strings
    */
    GM_listValues = function () {
        try {
            var names = [],
                i     = 0;

            for (i = 0; i < localStorage.length; i += 1) {
                names.push(localStorage.key(i));
            }

            return names;
        } catch (error) {
            console.log("ERROR in GM_listValues: " + error);
            return [];
        }
    };

    /*
    Syntax
        function GM_addStyle( css )

    Arguments
        css
            String: A string of CSS.
    */
    GM_addStyle = function (css) {
        try {
            var style = document.createElement('style'),
                head  = document.getElementsByTagName('head');

            style.textContent = css;
            if (head) {
                head[0].appendChild(style);
            }
        } catch (error) {
            console.log("ERROR in GM_listValues: " + error);
        }
    };

    GM_registerMenuCommand = function (name, funk) {
    };

    ConvertGMtoJSON = function () {
        if (GM_getValue('caap__convertDB', true)) {
            localStorage.setItem('castle_age__caapPause', 'sblock');
            localStorage.setItem('castle_age__Disabled', 'btrue');
            GM_log("Attempting to convert settings");
            var savedData = [],
                key       = {},
                i         = 0,
                j         = 0,
                value     = null;

            key.name = '';
            key.type = '';
            key.value = '';
            for (i = 0; i < localStorage.length; i += 1) {
                key = {};
                key.name = localStorage.key(i);
                value = localStorage.getItem(key.name);
                if (/castle_agé__*/.test(key.name) || value === null) {
                    GM_log("Continue");
                    continue;
                }

                key.type = value[0];
                key.value = value.substring(1);
                GM_log("Read: Name: " + key.name + " Value: " + key.value + " Type: " + key.type);
                savedData.push(key);
            }

            for (j = 0; j < savedData.length; j += 1) {
                GM_deleteValue(savedData[j].name);
                GM_log("Write: Name: " + savedData[j].name + " Value: " + savedData[j].value + " Type: " + savedData[j].type);
                switch (savedData[j].type) {
                case 'b':
                    GM_setValue(savedData[j].name, (savedData[j].value === 'true'));
                    GM_log("Converted");
                    break;
                case 'n':
                    GM_setValue(savedData[j].name, Number(savedData[j].value));
                    GM_log("Converted");
                    break;
                case 's':
                    GM_setValue(savedData[j].name, savedData[j].value);
                    GM_log("Converted");
                    break;
                default:
                    GM_log("Ignored");
                }
            }

            GM_setValue('caap__convertDB', false);
            GM_log("Convert settings completed");
        }
    };

    if (typeof unsafeWindow === 'undefined') {
        unsafeWindow = window;
    }
}
