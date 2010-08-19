// ==UserScript==
// @name           Castle Age Autoplayer
// @namespace      caap
// @description    Auto player for Castle Age
// @version        140.23.51
// @require        http://cloutman.com/jquery-latest.min.js
// @require        http://ajax.googleapis.com/ajax/libs/jqueryui/1.8.4/jquery-ui.min.js
// @require        http://castle-age-auto-player.googlecode.com/files/farbtastic.min.js
// @require        http://castle-age-auto-player.googlecode.com/files/json2.js
// @include        http*://apps.*facebook.com/castle_age/*
// @include        http://www.facebook.com/common/error.html
// @include        http://www.facebook.com/reqs.php#confirm_46755028429_0
// @include        http://www.facebook.com/home.php
// @include        http://www.facebook.com/*filter=app_46755028429*
// @exclude        *#iframe*
// @license        GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
// @compatability  Firefox 3.0+, Chrome 4+, Flock 2.0+
// ==/UserScript==

/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true */
/*global window,unsafeWindow,$,GM_log,console,GM_getValue,GM_setValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,XPathResult,GM_deleteValue,GM_listValues,GM_addStyle,CM_Listener,CE_message,ConvertGMtoJSON,localStorage */

var caapVersion = "140.23.51";

///////////////////////////
//       Prototypes
///////////////////////////

String.prototype.ucFirst = function () {
    var firstLetter = this.substr(0, 1);
    return firstLetter.toUpperCase() + this.substr(1);
};

String.prototype.stripHTML = function (html) {
    return this.replace(new RegExp('<[^>]+>', 'g'), '').replace(/&nbsp;/g, '');
};

String.prototype.regex = function (r) {
	var a = this.match(r),
        i;

	if (a) {
		a.shift();
		for (i = 0; i < a.length; i += 1) {
			if (a[i] && a[i].search(/^[\-+]?[0-9]*\.?[0-9]*$/) >= 0) {
				a[i] = parseFloat(a[i]);
			}
		}
		if (a.length === 1) {
			return a[0];
		}
	}

	return a;
};

// Adds commas into a string, ignore any number formatting
var addCommas = function (s) {
	var a = s ? s.toString() : '0',
        r = new RegExp('(-?[0-9]+)([0-9]{3})');

	while (r.test(a)) {
		a = a.replace(r, '$1,$2');
	}

	return a;
};

var sortObject = function (obj, sortfunc, deep) {
	var list   = [],
        output = {},
        i      = 0;

	if (typeof deep === 'undefined') {
		deep = false;
	}

	for (i in obj) {
        if (obj.hasOwnProperty(i)) {
            list.push(i);
        }
	}

	list.sort(sortfunc);
	for (i = 0; i < list.length; i += 1) {
		if (deep && typeof obj[list[i]] === 'object') {
			output[list[i]] = sortObject(obj[list[i]], sortfunc, deep);
		} else {
			output[list[i]] = obj[list[i]];
		}
	}

	return output;
};

///////////////////////////
//       Objects
///////////////////////////

var image64 = {},
    css     = {},
    global  = {},
    gm      = {},
    nHtml   = {},
    general = {},
    caap    = {};
