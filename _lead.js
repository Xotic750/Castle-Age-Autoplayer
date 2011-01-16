
/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, maxlen: 512 */
/*global window,unsafeWindow,$,jQuery,GM_log,console,GM_getValue,GM_setValue,GM_xmlhttpRequest,GM_openInTab,GM_registerMenuCommand,XPathResult,GM_deleteValue,GM_listValues,GM_addStyle,localStorage,sessionStorage,rison */
/*jslint maxlen: 250 */

//////////////////////////////////
//       Globals
//////////////////////////////////

var caapVersion   = "!version!",
    devVersion    = "!dev!",
    hiddenVar     = true,
    caap_timeout  = 0,
    image64       = {},
    utility       = {},
    config        = {},
    state         = {},
    css           = {},
    gm            = {},
    ss            = {},
    sort          = {},
    schedule      = {},
    general       = {},
    monster       = {},
    guild_monster = {},
    arena         = {},
    battle        = {},
    town          = {},
    spreadsheet   = {},
    gifting       = {},
    army          = {},
    caap          = {},
    $j            = {};

///////////////////////////
//       Prototypes
///////////////////////////

if (!document.head) {
    document.head = document.getElementsByTagName('head')[0];
}

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
    return this.match(/user=(\d+)/);
};

String.prototype.matchNum = function () {
    return this.match(/(\d+)/);
};

String.prototype.parseFloat = function (x) {
    return x >= 0 ? parseFloat(parseFloat(this).toFixed(x)) : parseFloat(this);
};

String.prototype.parseInt = function (x) {
    return parseInt(this, (x >= 2 && x <= 36) ? x : 10);
};

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
};

String.prototype.numberOnly = function () {
    return parseFloat(this.replace(new RegExp("[^\\d\\.]", "g"), ''));
};


String.prototype.parseTimer = function () {
    var a = [],
        b = 0,
        i = 0,
        l = 0;

    a = this.split(':');
    for (i = 0, l = a.length; i < l; i += 1) {
        b = b * 60 + parseInt(a[i], 10);
    }

    if (isNaN(b)) {
        b = -1;
    }

    return b;
};

String.prototype.removeHtmlJunk = function () {
    return this.replace(new RegExp("\\&[^;]+;", "g"), '');
};

//pads left
String.prototype.lpad = function (s, l) {
    var t = this;
    while (t.length < l) {
        t = s + t;
    }

    return t;
};

//pads right
String.prototype.rpad = function (s, l) {
    var t = this;
    while (t.length < l) {
        t = t + s;
    }

    return t;
};

String.prototype.filepart = function () {
    var x = this.lastIndexOf('/');
    if (x >= 0) {
        return this.substr(x + 1);
    }

    return this;
};

String.prototype.regex = function (r) {
	var a = this.match(r),
        i = 0,
        l = 0;

	if (a) {
		a.shift();
        l = a.length;
		for (i = 0 ; i < l; i += 1) {
			if (a[i] && a[i].search(/^[\-+]?[0-9]*\.?[0-9]*$/) >= 0) {
				a[i] = parseFloat(a[i].replace('+', ''));
			}
		}

		if (l === 1) {
			return a[0];
		}
	}

	return a;
};

Array.prototype.deepCopy = function () {
    var i = 0,
        l = 0,
        n = [],
        t = null;

    for (i = 0, l = this.length; i < l; i += 1) {
        switch ($j.type(this[i])) {
        case "object":
            t = $j.extend(true, {}, this[i]);
            break;
        case "array":
            t = this[i].deepCopy();
            break;
        default:
            t = this[i];
        }

        n.push(t);
    }

    return n;
};

Number.prototype.dp = function (x) {
    return parseFloat(this.toFixed(x >= 0 ? x : 0));
};
