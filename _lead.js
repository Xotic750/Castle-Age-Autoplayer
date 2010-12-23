
/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, maxlen: 512 */
/*global window,unsafeWindow,$,GM_log,console,GM_getValue,GM_setValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,XPathResult,GM_deleteValue,GM_listValues,GM_addStyle,CM_Listener,CE_message,ConvertGMtoJSON,localStorage,sessionStorage,rison */
/*jslint maxlen: 250 */

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
    return this.charAt(0).toUpperCase() + this.substr(1);
};

String.prototype.stripHTML = function () {
    return this.replace(new RegExp("<[^>]+>", "g"), '').replace(/&nbsp;/g, '');
};

String.prototype.stripCaap = function () {
    return this.replace(/caap_/i, '');
};

String.prototype.stripTRN = function () {
    return this.replace(/[\t\r\n]/g, '');
};

String.prototype.stripStar = function () {
    return this.replace(/\*/g, '');
};

String.prototype.innerTrim = function () {
    return this.replace(/\s+/g, ' ');
};

String.prototype.matchUser = function () {
    return this.match(/user=([0-9]+)/);
};

String.prototype.toNumber = function () {
    return parseFloat(this);
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
};

String.prototype.filepart = function () {
    var x = this.lastIndexOf('/');
    if (x >= 0) {
        return this.substr(x + 1);
    }

    return this;
};

String.prototype.regex = function (r) {
	var a   = this.match(r),
        i   = 0,
        len = 0;

	if (a) {
		a.shift();
        len = a.length;
		for (i = 0 ; i < len; i += 1) {
			if (a[i] && a[i].search(/^[\-+]?[0-9]*\.?[0-9]*$/) >= 0) {
				a[i] = a[i].replace('+', '').toNumber();
			}
		}

		if (len === 1) {
			return a[0];
		}
	}

	return a;
};
