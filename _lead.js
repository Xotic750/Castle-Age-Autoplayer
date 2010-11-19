
/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true */
/*global window,unsafeWindow,$,GM_log,console,GM_getValue,GM_setValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,XPathResult,GM_deleteValue,GM_listValues,GM_addStyle,CM_Listener,CE_message,ConvertGMtoJSON,localStorage,sessionStorage */

//////////////////////////////////
//       Global and Object vars
//////////////////////////////////

if (console.log !== undefined) {
    console.log("CAAP Initiated");
}

var caapVersion   = "!version!",
    devVersion    = "!dev!",
    hiddenVar     = true,
    image64       = {},
    utility       = {},
    config        = {},
    state         = {},
    css           = {},
    gm            = {},
    nHtml         = {},
    sort          = {},
    schedule      = {},
    general       = {},
    monster       = {},
    guild_monster = {},
    battle        = {},
    town          = {},
    spreadsheet   = {},
    gifting       = {},
    caap          = {};

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
