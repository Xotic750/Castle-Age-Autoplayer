
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
    return x >= 0 ? parseFloat(parseFloat(this).toFixed(x >= 0 && x <= 20 ? x : 20)) : parseFloat(this);
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
			if (a[i] && a[i].search(/^[\-+]?[\d]*\.?[\d]*$/) >= 0) {
				a[i] = parseFloat(a[i].replace('+', ''));
			}
		}

		if (l === 1) {
			return a[0];
		}
	}

	return a;
};

// Turns text delimeted with new lines and commas into an array.
// Primarily for use with user input text boxes.
String.prototype.toArray = function () {
    var s = this,
        a = [],
        t = [],
        i = 0,
        l = 0;

    if (typeof s === 'string' && s !== '') {
        s = s.replace(/,/g, '\n');
        t = s.split('\n');
        if (t && t.length) {
            for (i = 0, l = t.length; i < l; i += 1) {
                if (t[i] !== '') {
                    a.push(isNaN(t[i]) ? t[i].trim() : parseFloat(t[i]));
                }
            }
        }
    }

    return a;
};

/*jslint bitwise: false */
String.prototype.Utf8encode = function () {
    var strUtf = '';
    strUtf = this.replace(/[\u0080-\u07ff]/g, function (c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f);
    });

    strUtf = strUtf.replace(/[\u0800-\uffff]/g, function (c) {
        var cc = c.charCodeAt(0);
        return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f);
    });

    return strUtf;
};

String.prototype.Utf8decode = function () {
    var strUni = '';
    strUni = this.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function (c) {
        return String.fromCharCode(((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | (c.charCodeAt(2)&0x3f));
    });

    strUni = strUni.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function (c) {
        return String.fromCharCode((c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f);
    });

    return strUni;
};

String.prototype.Base64encode = function (utf8encode) {
    var o1, o2, o3, bits, h1, h2, h3, h4,
        c     = 0,
        coded = '',
        plain = '',
        e     = [],
        pad   = '',
        b64   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        nChar = String.fromCharCode(0);

    utf8encode = (typeof utf8encode === 'undefined') ? false : utf8encode;
    plain = utf8encode ? this.Utf8encode() : this;
    c = plain.length % 3;
    if (c > 0) {
        while (c < 3) {
            pad += '=';
            plain += nChar;
            c += 1;
        }
    }

    for (c = 0; c < plain.length; c += 3) {
        o1 = plain.charCodeAt(c);
        o2 = plain.charCodeAt(c + 1);
        o3 = plain.charCodeAt(c + 2);
        bits = o1<<16 | o2<<8 | o3;
        h1 = bits>>18 & 0x3f;
        h2 = bits>>12 & 0x3f;
        h3 = bits>>6 & 0x3f;
        h4 = bits & 0x3f;
        e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
    }

    coded = e.join('');
    coded = coded.slice(0, coded.length - pad.length) + pad;
    return coded;
};

String.prototype.Base64decode = function (utf8decode) {
    var o1, o2, o3, h1, h2, h3, h4, bits,
        d     = [],
        plain = '',
        coded = '',
        b64   = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        c     = 0;

    utf8decode = (typeof utf8decode === 'undefined') ? false : utf8decode;
    coded = utf8decode ? this.Utf8decode() : this;
    for (c = 0; c < coded.length; c += 4) {
        h1 = b64.indexOf(coded.charAt(c));
        h2 = b64.indexOf(coded.charAt(c + 1));
        h3 = b64.indexOf(coded.charAt(c + 2));
        h4 = b64.indexOf(coded.charAt(c + 3));
        bits = h1<<18 | h2<<12 | h3<<6 | h4;
        o1 = bits>>>16 & 0xff;
        o2 = bits>>>8 & 0xff;
        o3 = bits & 0xff;
        d[c / 4] = String.fromCharCode(o1, o2, o3);
        if (h4 === 0x40) {
            d[c / 4] = String.fromCharCode(o1, o2);
        }

        if (h3 === 0x40) {
            d[c / 4] = String.fromCharCode(o1);
        }
    }

    plain = d.join('');
    return utf8decode ? plain.Utf8decode() : plain;
};

String.prototype.MD5 = function () {
    function AddUnsigned(lX, lY) {
        var lX4     = (lX & 0x40000000),
            lY4     = (lY & 0x40000000),
            lX8     = (lX & 0x80000000),
            lY8     = (lY & 0x80000000),
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);

        if (lX4 & lY4) {
            return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
        }

        if (lX4 | lY4) {
            if (lResult & 0x40000000) {
                return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
            } else {
                return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
            }
        } else {
            return (lResult ^ lX8 ^ lY8);
        }
    }

    function F(x, y, z) {
        return (x & y) | ((~x) & z);
    }

    function G(x, y, z) {
        return (x & z) | (y & (~z));
    }

    function H(x, y, z) {
        return (x ^ y ^ z);
    }

    function I(x, y, z) {
        return (y ^ (x | (~z)));
    }

    function FF(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
        return AddUnsigned(a.ROTL(s), b);
    }

    function GG(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
        return AddUnsigned(a.ROTL(s), b);
    }

    function HH(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
        return AddUnsigned(a.ROTL(s), b);
    }

    function II(a, b, c, d, x, s, ac) {
        a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
        return AddUnsigned(a.ROTL(s), b);
    }

    function ConvertToWordArray(textMsg) {
        var lWordCount           = 0,
            lMessageLength       = textMsg.length,
            lNumberOfWords_temp1 = lMessageLength + 8,
            lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
            lNumberOfWords       = (lNumberOfWords_temp2 + 1) * 16,
            lWordArray           = Array(lNumberOfWords - 1),
            lBytePosition        = 0,
            lByteCount           = 0;

        while (lByteCount < lMessageLength) {
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = (lWordArray[lWordCount] | (textMsg.charCodeAt(lByteCount)<<lBytePosition));
            lByteCount += 1;
        }

        lWordCount = (lByteCount - (lByteCount % 4)) / 4;
        lBytePosition = (lByteCount % 4) * 8;
        lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80<<lBytePosition);
        lWordArray[lNumberOfWords - 2] = lMessageLength<<3;
        lWordArray[lNumberOfWords - 1] = lMessageLength>>>29;
        return lWordArray;
    }

    function WordToHex(lValue) {
        var WordToHexValue      = "",
            WordToHexValue_temp = "",
            lByte               = 0,
            lCount              = 0;

        for (lCount = 0; lCount <= 3; lCount += 1) {
            lByte = (lValue>>>(lCount * 8)) & 255;
            WordToHexValue_temp = "0" + lByte.toString(16);
            WordToHexValue += WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
        }

        return WordToHexValue;
    }

    var x   = ConvertToWordArray(this.Utf8encode()),
        a   = 0x67452301,
        b   = 0xEFCDAB89,
        c   = 0x98BADCFE,
        d   = 0x10325476,
        S11 = 7,
        S12 = 12,
        S13 = 17,
        S14 = 22,
        S21 = 5,
        S22 = 9,
        S23 = 14,
        S24 = 20,
        S31 = 4,
        S32 = 11,
        S33 = 16,
        S34 = 23,
        S41 = 6,
        S42 = 10,
        S43 = 15,
        S44 = 21,
        k   = 0,
        l   = 0,
        AA  = 0x00000000,
        BB  = 0x00000000,
        CC  = 0x00000000,
        DD  = 0x00000000;

    for (k = 0, l = x.length; k < l; k += 16) {
        AA = a;
        BB = b;
        CC = c;
        DD = d;
        a = FF(a, b, c, d, x[k + 0],  S11, 0xD76AA478);
        d = FF(d, a, b, c, x[k + 1],  S12, 0xE8C7B756);
        c = FF(c, d, a, b, x[k + 2],  S13, 0x242070DB);
        b = FF(b, c, d, a, x[k + 3],  S14, 0xC1BDCEEE);
        a = FF(a, b, c, d, x[k + 4],  S11, 0xF57C0FAF);
        d = FF(d, a, b, c, x[k + 5],  S12, 0x4787C62A);
        c = FF(c, d, a, b, x[k + 6],  S13, 0xA8304613);
        b = FF(b, c, d, a, x[k + 7],  S14, 0xFD469501);
        a = FF(a, b, c, d, x[k + 8],  S11, 0x698098D8);
        d = FF(d, a, b, c, x[k + 9],  S12, 0x8B44F7AF);
        c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
        b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
        a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
        d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
        c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
        b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
        a = GG(a, b, c, d, x[k + 1],  S21, 0xF61E2562);
        d = GG(d, a, b, c, x[k + 6],  S22, 0xC040B340);
        c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
        b = GG(b, c, d, a, x[k + 0],  S24, 0xE9B6C7AA);
        a = GG(a, b, c, d, x[k + 5],  S21, 0xD62F105D);
        d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
        c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
        b = GG(b, c, d, a, x[k + 4],  S24, 0xE7D3FBC8);
        a = GG(a, b, c, d, x[k + 9],  S21, 0x21E1CDE6);
        d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
        c = GG(c, d, a, b, x[k + 3],  S23, 0xF4D50D87);
        b = GG(b, c, d, a, x[k + 8],  S24, 0x455A14ED);
        a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
        d = GG(d, a, b, c, x[k + 2],  S22, 0xFCEFA3F8);
        c = GG(c, d, a, b, x[k + 7],  S23, 0x676F02D9);
        b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
        a = HH(a, b, c, d, x[k + 5],  S31, 0xFFFA3942);
        d = HH(d, a, b, c, x[k + 8],  S32, 0x8771F681);
        c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
        b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
        a = HH(a, b, c, d, x[k + 1],  S31, 0xA4BEEA44);
        d = HH(d, a, b, c, x[k + 4],  S32, 0x4BDECFA9);
        c = HH(c, d, a, b, x[k + 7],  S33, 0xF6BB4B60);
        b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
        a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
        d = HH(d, a, b, c, x[k + 0],  S32, 0xEAA127FA);
        c = HH(c, d, a, b, x[k + 3],  S33, 0xD4EF3085);
        b = HH(b, c, d, a, x[k + 6],  S34, 0x4881D05);
        a = HH(a, b, c, d, x[k + 9],  S31, 0xD9D4D039);
        d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
        c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
        b = HH(b, c, d, a, x[k + 2],  S34, 0xC4AC5665);
        a = II(a, b, c, d, x[k + 0],  S41, 0xF4292244);
        d = II(d, a, b, c, x[k + 7],  S42, 0x432AFF97);
        c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
        b = II(b, c, d, a, x[k + 5],  S44, 0xFC93A039);
        a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
        d = II(d, a, b, c, x[k + 3],  S42, 0x8F0CCC92);
        c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
        b = II(b, c, d, a, x[k + 1],  S44, 0x85845DD1);
        a = II(a, b, c, d, x[k + 8],  S41, 0x6FA87E4F);
        d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
        c = II(c, d, a, b, x[k + 6],  S43, 0xA3014314);
        b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
        a = II(a, b, c, d, x[k + 4],  S41, 0xF7537E82);
        d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
        c = II(c, d, a, b, x[k + 2],  S43, 0x2AD7D2BB);
        b = II(b, c, d, a, x[k + 9],  S44, 0xEB86D391);
        a = AddUnsigned(a, AA);
        b = AddUnsigned(b, BB);
        c = AddUnsigned(c, CC);
        d = AddUnsigned(d, DD);
    }

    return WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
};

String.prototype.SHA1 = function () {
    var blockstart = 0,
        i          = 0,
        j          = 0,
        W          = [80],
        H0         = 0x67452301,
        H1         = 0xEFCDAB89,
        H2         = 0x98BADCFE,
        H3         = 0x10325476,
        H4         = 0xC3D2E1F0,
        A          = null,
        B          = null,
        C          = null,
        D          = null,
        E          = null,
        temp       = null,
        msg        = '',
        msg_len    = 0,
        len        = 0,
        word_array = [];

    msg = this.Utf8encode();
    msg_len = msg.length;
    for (i = 0; i < msg_len - 3; i += 4) {
        j = msg.charCodeAt(i) << 24 | msg.charCodeAt(i + 1) << 16 | msg.charCodeAt(i + 2) << 8 | msg.charCodeAt(i + 3);
        word_array.push(j);
    }

    switch (msg_len % 4) {
    case 0:
        i = 0x080000000;
        break;
    case 1:
        i = msg.charCodeAt(msg_len - 1) << 24 | 0x0800000;
        break;
    case 2:
        i = msg.charCodeAt(msg_len - 2) << 24 | msg.charCodeAt(msg_len - 1) << 16 | 0x08000;
        break;
    case 3:
        i = msg.charCodeAt(msg_len - 3) << 24 | msg.charCodeAt(msg_len - 2) << 16 | msg.charCodeAt(msg_len - 1) << 8 | 0x80;
        break;
    default:
    }

    word_array.push(i);
    while ((word_array.length % 16) !== 14) {
        word_array.push(0);
    }

    word_array.push(msg_len >>> 29);
    word_array.push((msg_len << 3) & 0x0ffffffff);
    for (blockstart = 0, len = word_array.length; blockstart < len; blockstart += 16) {
        for (i = 0; i < 16; i += 1) {
            W[i] = word_array[blockstart + i];
        }

        for (i = 16; i <= 79; i += 1) {
            W[i] = (W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]).ROTL(1);
        }

        A = H0;
        B = H1;
        C = H2;
        D = H3;
        E = H4;
        for (i = 0; i <= 19; i += 1) {
            temp = (A.ROTL(5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
            E = D;
            D = C;
            C = B.ROTL(30);
            B = A;
            A = temp;
        }

        for (i = 20; i <= 39; i += 1) {
            temp = (A.ROTL(5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
            E = D;
            D = C;
            C = B.ROTL(30);
            B = A;
            A = temp;
        }

        for (i = 40; i <= 59; i += 1) {
            temp = (A.ROTL(5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
            E = D;
            D = C;
            C = B.ROTL(30);
            B = A;
            A = temp;
        }

        for (i = 60; i <= 79; i += 1) {
            temp = (A.ROTL(5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
            E = D;
            D = C;
            C = B.ROTL(30);
            B = A;
            A = temp;
        }

        H0 = (H0 + A) & 0x0ffffffff;
        H1 = (H1 + B) & 0x0ffffffff;
        H2 = (H2 + C) & 0x0ffffffff;
        H3 = (H3 + D) & 0x0ffffffff;
        H4 = (H4 + E) & 0x0ffffffff;
    }

    temp = H0.toHexStr() + H1.toHexStr() + H2.toHexStr() + H3.toHexStr() + H4.toHexStr();
    return temp.toLowerCase();
};

String.prototype.SHA256 = function (utf8encode) {
    function Sigma0(x) {
        return Number(2).ROTR(x) ^ Number(13).ROTR(x) ^ Number(22).ROTR(x);
    }

    function Sigma1(x) {
        return Number(6).ROTR(x) ^ Number(11).ROTR(x) ^ Number(25).ROTR(x);
    }

    function sigma0(x) {
        return Number(7).ROTR(x) ^ Number(18).ROTR(x) ^ (x>>>3);
    }

    function sigma1(x) {
        return Number(17).ROTR(x) ^ Number(19).ROTR(x) ^ (x>>>10);
    }

    function Ch(x, y, z)  {
        return (x & y) ^ (~x & z);
    }

    function Maj(x, y, z) {
        return (x & y) ^ (x & z) ^ (y & z);
    }

    var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
             0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
             0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
             0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
             0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
             0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
             0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
             0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2],
        H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19],
        msg = '',
        l = 0,
        N = 0,
        M = [],
        i = 0,
        j = 0,
        W = [],
        t = 0,
        a, b, c, d, e, f, g, h, T1, T2;

    utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;
    msg = utf8encode ? this.Utf8encode() : this;
    msg += String.fromCharCode(0x80);
    l = msg.length / 4 + 2;
    N = Math.ceil(l / 16);
    M = new Array(N);

    for (i = 0; i < N; i += 1) {
        M[i] = new Array(16);
        for (j = 0; j < 16; j += 1) {
            M[i][j] = (msg.charCodeAt(i * 64 + j * 4)<<24) | (msg.charCodeAt(i * 64 + j * 4 + 1)<<16) | (msg.charCodeAt(i * 64 + j * 4 + 2)<<8) | (msg.charCodeAt(i * 64 + j * 4 + 3));
        }
    }

    M[N - 1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
    M[N - 1][14] = Math.floor(M[N - 1][14]);
    M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;
    W = new Array(64);
    for (i = 0; i < N; i += 1) {
        for (t = 0; t < 16; t += 1) {
            W[t] = M[i][t];
        }

        for (t = 16; t < 64; t += 1) {
            W[t] = (sigma1(W[t - 2]) + W[t - 7] + sigma0(W[t - 15]) + W[t - 16]) & 0xffffffff;
        }

        a = H[0];
        b = H[1];
        c = H[2];
        d = H[3];
        e = H[4];
        f = H[5];
        g = H[6];
        h = H[7];
        for (t = 0; t < 64; t += 1) {
            T1 = h + Sigma1(e) + Ch(e, f, g) + K[t] + W[t];
            T2 = Sigma0(a) + Maj(a, b, c);
            h = g;
            g = f;
            f = e;
            e = (d + T1) & 0xffffffff;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) & 0xffffffff;
        }

        H[0] = (H[0] + a) & 0xffffffff;
        H[1] = (H[1] + b) & 0xffffffff;
        H[2] = (H[2] + c) & 0xffffffff;
        H[3] = (H[3] + d) & 0xffffffff;
        H[4] = (H[4] + e) & 0xffffffff;
        H[5] = (H[5] + f) & 0xffffffff;
        H[6] = (H[6] + g) & 0xffffffff;
        H[7] = (H[7] + h) & 0xffffffff;
    }

    return H[0].toHexStr() + H[1].toHexStr() + H[2].toHexStr() + H[3].toHexStr() +
           H[4].toHexStr() + H[5].toHexStr() + H[6].toHexStr() + H[7].toHexStr();
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
    return parseFloat(this.toFixed(x >= 0 && x <= 20 ? x : 0));
};

/*jslint bitwise: false */
// For use with SHA1 and SHA256
Number.prototype.toHexStr = function () {
    var s = "",
        v = 0,
        i = 0;

    for (i = 7; i >= 0; i -= 1) {
        v = (this >>> (i * 4)) & 0xf;
        s += v.toString(16);
    }

    return s;
};

// For use with SHA1 and MD5
Number.prototype.ROTL = function (x) {
    return (this << x) | (this >>> (32 - x));
};

// For use with SHA256
Number.prototype.ROTR = function (x) {
    return (x >>> this) | (x << (32 - this));
};

/*jslint bitwise: true */

jQuery.prototype.getElementWidth = function (x) {
    var t = [],
        w = 0;

    if (this && this.length === 1) {
        t = this.attr("style").match(/width:\s*([\d\.]+)%/i);
        if (t && t.length === 2) {
            w = t[1] ? parseFloat(t[1]).toFixed(x >= 0 && x <= 20 ? x : 20) : 0;
        }
    }

    return w;
};

jQuery.prototype.getElementHeight = function (x) {
    var t = [],
        w = 0;

    if (this && this.length === 1) {
        t = this.attr("style").match(/height:\s*([\d\.]+)%/i);
        if (t && t.length === 2) {
            w = t[1] ? parseFloat(t[1]).toFixed(x >= 0 && x <= 20 ? x : 20) : 0;
        }
    }

    return w;
};
