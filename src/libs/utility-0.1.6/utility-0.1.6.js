/*!
 * Utility v0.1.6
 * http://code.google.com/p/utility-js/
 *
 * Developed by:
 * - Xotic750
 *
 * GPL version 3 or any later version; http://www.gnu.org/copyleft/gpl.html
 */

/*jslint white: true, browser: true, devel: true, undef: true, nomen: true, bitwise: true, plusplus: true, immed: true, regexp: true, eqeqeq: true, newcap: true, onevar: true, maxerr: 50, maxlen: 280, indent: 4 */
/*global window,jQuery,GM_getValue,GM_setValue,GM_deleteValue,GM_listValues,localStorage,sessionStorage,rison */
/*jslint maxlen: 310 */

////////////////////////////////////////////////////////////////////
//                          utility library
// Small functions called a lot to reduce duplicate code
/////////////////////////////////////////////////////////////////////

(function () {
    var log_version = '',
        log_level = 1,
        JSON2 = {},
        RISON = {},
        owl = {},
        utility = {},
        b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;

    ///////////////////////////
    //       Prototypes
    ///////////////////////////

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    String.prototype['ucFirst'] = String.prototype.ucFirst = function () {
        return this.charAt(0).toUpperCase() + this.substr(1);
    };

    String.prototype['ucWords'] = String.prototype.ucWords = function () {
        return this.replace(new RegExp("^(.)|\\s(.)", "g"), function ($1) {
            return $1.toUpperCase();
        });
    };

    String.prototype['stripHTML'] = String.prototype.stripHTML = function () {
        return this.replace(new RegExp("<[^>]+>", "g"), '').replace(/&nbsp;/g, '');
    };

    String.prototype['stripHtmlJunk'] = String.prototype.stripHtmlJunk = function () {
        return this.replace(new RegExp("\\&[^;]+;", "g"), '');
    };

    String.prototype['stripTRN'] = String.prototype.stripTRN = function () {
        return this.replace(/[\t\r\n]/g, '');
    };

    String.prototype['escapeHTML'] = String.prototype.escapeHTML = function (method) {
        method = method === true ? true : false;
        var str = '',
            div;

        if (method) {
            // This method uses standard Javascript replace method
            str = this.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
        } else {
            // This method uses the browsers own HTML rendering engine
            div = document.createElement('div');
            div.textContent = this;
            str = div.innerHTML;
        }

        return str;
    };

    String.prototype['unescapeHTML'] = String.prototype.unescapeHTML = function (method) {
        method = method === true ? true : false;
        var str = '',
            div;

        if (method) {
            // This method uses standard Javascript replace method
            str = this.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'");
        } else {
            // This method uses the browsers own HTML rendering engine
            div = document.createElement('div');
            div.innerHTML = this;
            str = div.textContent;
        }

        return str;
    };

    // outerTrim recognises more Unicode whitespaces than native trim implimentations
    // see ECMA-262 5th edition about BOM as whitespace
    // trim lookup table
    String['whiteSpace'] = String.whiteSpace = {
        0x0009 : 1, // Tab
        0x000a : 1, // Line Feed
        0x000b : 1, // Vertical Tab
        0x000c : 1, // Form Feed
        0x000d : 1, // Carriage Return
        0x0020 : 1, // Space
        0x0085 : 1, // Next line
        0x00a0 : 1, // No-break space
        0x1680 : 1, // Ogham space mark
        0x180e : 1, // Mongolian vowel separator
        0x2000 : 1, // En quad
        0x2001 : 1, // Em quad
        0x2002 : 1, // En space
        0x2003 : 1, // Em space
        0x2004 : 1, // Three-per-em space
        0x2005 : 1, // Four-per-em space
        0x2006 : 1, // Six-per-em space
        0x2007 : 1, // Figure space
        0x2008 : 1, // Punctuation space
        0x2009 : 1, // Thin space
        0x200a : 1, // Hair space
        0x200b : 1, // Zero width space
        0x2028 : 1, // Line separator
        0x2029 : 1, // Paragraph separator
        0x202f : 1, // Narrow no-break space
        0x205f : 1, // Medium mathematical space
        0x3000 : 1, // Ideographic space
        0xfeff : 1  // Byte Order Mark
    };

    String['whiteSpaceRX'] = String.whiteSpaceRX = "\\u0009\\u000a\\u000b\\u000c\\u000d\\u0020\\u0085\\u00a0\\u1680\\u180e\\u2000\\u2001\\u2002\\u2003\\u2004\\u2005\\u2006\\u2007\\u2008\\u2009\\u200a\\u200b\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff";

    // Emulates a native trim plus options.
    // arg.rx is set to true, then a RegExp is used
    // arg.end takes 'both' (default), left', 'right'
    // arg.list takes an array of character code strings to trim otherwise the default is used
    // e.g arg.list = ["0009", "000a", "000b", "000c"]
    String.prototype['outerTrim'] = String.prototype.outerTrim = function (arg) {
        arg = arg ? arg : {};
        var s = '',
            b = 0,
            c = this.length,
            e = c - 1,
            l,
            r,
            w,
            i = 0;

        if (e > -1) {
            if (arg['rx']) {
                if (arg['list']) {
                    w = '';
                    for (i = arg['list'].length - 1; i >= 0; i -= 1) {
                        w += "\\u" + arg['list'][i];
                    }
                } else {
                    w = String.whiteSpaceRX;
                }

                l = new RegExp("^[" + w + "]*");
                r = new RegExp("[" + w + "]*$");
                switch (arg['end']) {
                case 'left':
                    s = this.replace(l, '');
                    break;
                case 'right':
                    s = this.replace(r, '');
                    break;
                default:
                    s = this.replace(l, '').replace(r, '');
                }
            } else {
                if (arg['list']) {
                    w = {};
                    for (i = arg['list'].length - 1; i >= 0; i -= 1) {
                        w[parseInt(arg['list'][i], 16)] = 1;
                    }
                } else {
                    w = String.whiteSpace;
                }

                // trim end
                while (w[this.charCodeAt(e)]) {
                    e -= 1;
                }

                // trim start
                e += 1;
                if (e) {
                    while (w[this.charCodeAt(b)]) {
                        b += 1;
                    }
                }

                switch (arg['end']) {
                case 'left':
                    s = this.substring(b, c);
                    break;
                case 'right':
                    s = this.substring(0, e);
                    break;
                default:
                    s = this.substring(b, e);
                }
            }
        }

        return s;
    };

    String.prototype['hasIndexOf'] = String.prototype.hasIndexOf = function (o) {
        return this.indexOf(o) >= 0 ? true : false;
    };

    // No native trimRight then use outerTrim
    if (!String.prototype['trimLeft']) {
        String.prototype['trimLeft'] = String.prototype.trimLeft = function (arg) {
            arg = arg ? arg : {};
            arg['end'] = 'left';
            return this.outerTrim(arg);
        };
    }

    // No native trimRight then use outerTrim
    if (!String.prototype['trimRight']) {
        String.prototype['trimRight'] = String.prototype.trimRight = function (arg) {
            arg = arg ? arg : {};
            arg['end'] = 'right';
            return this.outerTrim(arg);
        };
    }

    // Trims all inner whitespace to just a single space
    String.prototype['innerTrim'] = String.prototype.innerTrim = function (arg) {
        arg = arg ? arg : {};
        arg['end'] = 'both';
        delete arg['list'];
        var i = this.outerTrim(arg);
        return this.replace(i, i.replace(new RegExp("[" + String.whiteSpaceRX + "]+", "g"), ' '));
    };

    // No native trim then use outerTrim
    if (!String.prototype['trim']) {
        String.prototype['trim'] = String.prototype.outerTrim;
    }

    String.prototype['parseFloat'] = String.prototype.parseFloat = function (x) {
        return x >= 0 ? parseFloat(parseFloat(this).toFixed(x >= 0 && x <= 20 ? x : 20)) : parseFloat(this);
    };

    String.prototype['parseInt'] = String.prototype.parseInt = function (x) {
        return parseInt(this, (x >= 2 && x <= 36) ? x : 10);
    };

    // pads a string left with a char until length reached
    String.prototype['lpad'] = String.prototype.lpad = function (s, l) {
        var t = this.toString();
        while (t.length < l) {
            t = s + t;
        }

        return t;
    };

    // pads a string right with a char until length reached
    String.prototype['rpad'] = String.prototype.rpad = function (s, l) {
        var t = this.toString();
        while (t.length < l) {
            t = t + s;
        }

        return t;
    };

    // Return the URL query of a string
    String.prototype['getUrlQuery'] = String.prototype.getUrlQuery = function () {
        var t = this.toString(),
            q = -1,
            x = -1;

        x = t.indexOf('?');
        q = x >= 0 ? x : q;
        x = t.indexOf('&');
        q = x >= 0 && (q < 0 || (q >= 0 && x < q)) ? x : q;
        x = t.indexOf('#');
        q = x >= 0 && (q < 0 || (q >= 0 && x < q)) ? x : q;
        t = q >= 0 ? t.substr(q) : '';
        return t;
    };

    // Strip the URL query from a string
    String.prototype['stripUrlQuery'] = String.prototype.stripUrlQuery = function () {
        var t = this.toString(),
            x = -1;

        x = t.indexOf('?');
        t = x >= 0 ? t.substr(0, x) : t;
        x = t.indexOf('&');
        t = x >= 0 ? t.substr(0, x) : t;
        x = t.indexOf('#');
        t = x >= 0 ? t.substr(0, x) : t;
        return t;
    };

    // Returns the basename of a string and optionally trim an extension
    String.prototype['basename'] = String.prototype.basename = function (s) {
        var t = this.toString(),
            x = -1;

        t = t[t.length - 1] === '/' ? t.substr(0, t.length - 1) : t;
        x = t.stripUrlQuery().lastIndexOf('/');
        t = x >= 0 ? t.substr(x + 1) : t;
        x = typeof s !== 'undefined' && s !== null && typeof s.toString !== 'undefined' ? t.lastIndexOf(s.toString()) : -1;
        t = x >= 0 ? t.substr(0, x) : t;
        return t;
    };

    // Returns the directory part of a string
    String.prototype['dirname'] = String.prototype.dirname = function () {
        var t = this.toString(),
            x = -1;

        t = t.stripUrlQuery();
        x = t.lastIndexOf('/');
        t = x >= 0 ? t.substr(0, x + 1) : t;
        return t;
    };

    // Returns the file extension part of a string
    String.prototype['fileext'] = String.prototype.fileext = function () {
        var t = this.toString(),
            x = -1;

        t = t.basename();
        t = t.stripUrlQuery();
        x = t.lastIndexOf('.');
        t = x >= 0 ? t.substr(x) : '';
        return t;
    };

    String.prototype['regex'] = String.prototype.regex = function (r) {
        var a  = this.match(r),
            i  = 0,
            l  = 0,
            rx = null;

        if (a) {
            if (r.global) {
                // Try to match '(blah' but not '\(blah' or '(?:blah' - ignore invalid regexp
                if (new RegExp("(^|[^\\\\]|[^\\\\](\\\\\\\\)*)\\([^?]").test(r.source)) {
                    rx = new RegExp(r.source, (r.ignoreCase ? 'i' : '') + (r.multiline ? 'm' : ''));
                }
            } else {
                a.shift();
            }

            l = a.length;
            for (i = l - 1; i >= 0; i -= 1) {
                if (a[i]) {
                    if (rx) {
                        a[i] = String.prototype.regex.call(a[i], rx);
                    } else {
                        if (a[i].search(/^[\-+]?\d*\.?\d+(?:e[\-+]?\d+)?$/i) >= 0) {
                            a[i] = parseFloat(a[i]);
                        }
                    }
                }
            }
        }

        return !rx && l === 1 ? a[0] : a;
    };

    // Turns text delimeted with new lines and commas into an array.
    // Primarily for use with user input text boxes.
    String.prototype['toArray'] = String.prototype.toArray = function () {
        var a = [],
            t = [],
            i = 0,
            l = 0;

        t = this.replace(/,/g, '\n').split('\n');
        if (t && t.length) {
            for (i = 0, l = t.length; i < l; i += 1) {
                if (t[i] !== '') {
                    a.push(isNaN(t[i]) ? t[i].trim() : parseFloat(t[i]));
                }
            }
        }

        return a;
    };

    /*jslint bitwise: false */
    String.prototype['Utf8encode'] = String.prototype.Utf8encode = function () {
        var s = '';
        s = this.replace(/[\u0080-\u07ff]/g, function (c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xc0 | cc >> 6, 0x80 | cc & 0x3f);
        });

        s = s.replace(/[\u0800-\uffff]/g, function (c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xe0 | cc >> 12, 0x80 | cc >> 6 & 0x3F, 0x80 | cc & 0x3f);
        });

        return s;
    };

    String.prototype['Utf8decode'] = String.prototype.Utf8decode = function () {
        var s = '';
        s = this.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function (c) {
            return String.fromCharCode(((c.charCodeAt(0) & 0x0f) << 12) | ((c.charCodeAt(1) & 0x3f) << 6) | (c.charCodeAt(2) & 0x3f));
        });

        s = s.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function (c) {
            return String.fromCharCode((c.charCodeAt(0) & 0x1f) << 6 | c.charCodeAt(1) & 0x3f);
        });

        return s;
    };

    String.prototype['Base64encode'] = String.prototype.Base64encode = function (utf8encode) {
        var o1, o2, o3, bits, h1, h2, h3, h4,
            c     = 0,
            coded = '',
            plain = '',
            e     = [],
            pad   = '',
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
            bits = o1 << 16 | o2 << 8 | o3;
            h1 = bits >> 18 & 0x3f;
            h2 = bits >> 12 & 0x3f;
            h3 = bits >> 6 & 0x3f;
            h4 = bits & 0x3f;
            e[c / 3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
        }

        coded = e.join('');
        coded = coded.slice(0, coded.length - pad.length) + pad;
        return coded;
    };

    String.prototype['Base64decode'] = String.prototype.Base64decode = function (utf8decode) {
        var o1, o2, o3, h1, h2, h3, h4, bits,
            d     = [],
            plain = '',
            coded = '',
            c     = 0;

        utf8decode = (typeof utf8decode === 'undefined') ? false : utf8decode;
        coded = utf8decode ? this.Utf8decode() : this;
        for (c = 0; c < coded.length; c += 4) {
            h1 = b64.indexOf(coded.charAt(c));
            h2 = b64.indexOf(coded.charAt(c + 1));
            h3 = b64.indexOf(coded.charAt(c + 2));
            h4 = b64.indexOf(coded.charAt(c + 3));
            bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;
            o1 = bits >>> 16 & 0xff;
            o2 = bits >>> 8 & 0xff;
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

    String.prototype['MD5'] = String.prototype.MD5 = function (utf8encode) {
        function addUnsigned(lX, lY) {
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

        function fF(x, y, z) {
            return (x & y) | ((~x) & z);
        }

        function fG(x, y, z) {
            return (x & z) | (y & (~z));
        }

        function fH(x, y, z) {
            return (x ^ y ^ z);
        }

        function fI(x, y, z) {
            return (y ^ (x | (~z)));
        }

        function fFF(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(fF(b, c, d), x), ac));
            return addUnsigned(a.ROTL(s), b);
        }

        function fGG(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(fG(b, c, d), x), ac));
            return addUnsigned(a.ROTL(s), b);
        }

        function fHH(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(fH(b, c, d), x), ac));
            return addUnsigned(a.ROTL(s), b);
        }

        function fII(a, b, c, d, x, s, ac) {
            a = addUnsigned(a, addUnsigned(addUnsigned(fI(b, c, d), x), ac));
            return addUnsigned(a.ROTL(s), b);
        }

        function convertToWordArray(textMsg) {
            var lWordCount           = 0,
                lMessageLength       = textMsg.length,
                lNumberOfWords_temp1 = lMessageLength + 8,
                lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64,
                lNumberOfWords       = (lNumberOfWords_temp2 + 1) * 16,
                lWordArray           = [], //Array(lNumberOfWords - 1),
                lBytePosition        = 0,
                lByteCount           = 0;

            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (textMsg.charCodeAt(lByteCount) << lBytePosition));
                lByteCount += 1;
            }

            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        }

        function wordToHex(lValue) {
            var WordToHexValue      = "",
                WordToHexValue_temp = "",
                lByte               = 0,
                lCount              = 0;

            for (lCount = 0; lCount <= 3; lCount += 1) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue += WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
            }

            return WordToHexValue;
        }

        var x   = [],
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
            DD  = 0x00000000,
            msg = '';

        utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;
        msg = utf8encode ? this.Utf8encode() : this;
        x = convertToWordArray(msg);
        for (k = 0, l = x.length; k < l; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = fFF(a, b, c, d, x[k + 0],  S11, 0xD76AA478);
            d = fFF(d, a, b, c, x[k + 1],  S12, 0xE8C7B756);
            c = fFF(c, d, a, b, x[k + 2],  S13, 0x242070DB);
            b = fFF(b, c, d, a, x[k + 3],  S14, 0xC1BDCEEE);
            a = fFF(a, b, c, d, x[k + 4],  S11, 0xF57C0FAF);
            d = fFF(d, a, b, c, x[k + 5],  S12, 0x4787C62A);
            c = fFF(c, d, a, b, x[k + 6],  S13, 0xA8304613);
            b = fFF(b, c, d, a, x[k + 7],  S14, 0xFD469501);
            a = fFF(a, b, c, d, x[k + 8],  S11, 0x698098D8);
            d = fFF(d, a, b, c, x[k + 9],  S12, 0x8B44F7AF);
            c = fFF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = fFF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = fFF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = fFF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = fFF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = fFF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = fGG(a, b, c, d, x[k + 1],  S21, 0xF61E2562);
            d = fGG(d, a, b, c, x[k + 6],  S22, 0xC040B340);
            c = fGG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = fGG(b, c, d, a, x[k + 0],  S24, 0xE9B6C7AA);
            a = fGG(a, b, c, d, x[k + 5],  S21, 0xD62F105D);
            d = fGG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = fGG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = fGG(b, c, d, a, x[k + 4],  S24, 0xE7D3FBC8);
            a = fGG(a, b, c, d, x[k + 9],  S21, 0x21E1CDE6);
            d = fGG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = fGG(c, d, a, b, x[k + 3],  S23, 0xF4D50D87);
            b = fGG(b, c, d, a, x[k + 8],  S24, 0x455A14ED);
            a = fGG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = fGG(d, a, b, c, x[k + 2],  S22, 0xFCEFA3F8);
            c = fGG(c, d, a, b, x[k + 7],  S23, 0x676F02D9);
            b = fGG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = fHH(a, b, c, d, x[k + 5],  S31, 0xFFFA3942);
            d = fHH(d, a, b, c, x[k + 8],  S32, 0x8771F681);
            c = fHH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = fHH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = fHH(a, b, c, d, x[k + 1],  S31, 0xA4BEEA44);
            d = fHH(d, a, b, c, x[k + 4],  S32, 0x4BDECFA9);
            c = fHH(c, d, a, b, x[k + 7],  S33, 0xF6BB4B60);
            b = fHH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = fHH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = fHH(d, a, b, c, x[k + 0],  S32, 0xEAA127FA);
            c = fHH(c, d, a, b, x[k + 3],  S33, 0xD4EF3085);
            b = fHH(b, c, d, a, x[k + 6],  S34, 0x4881D05);
            a = fHH(a, b, c, d, x[k + 9],  S31, 0xD9D4D039);
            d = fHH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = fHH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = fHH(b, c, d, a, x[k + 2],  S34, 0xC4AC5665);
            a = fII(a, b, c, d, x[k + 0],  S41, 0xF4292244);
            d = fII(d, a, b, c, x[k + 7],  S42, 0x432AFF97);
            c = fII(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = fII(b, c, d, a, x[k + 5],  S44, 0xFC93A039);
            a = fII(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = fII(d, a, b, c, x[k + 3],  S42, 0x8F0CCC92);
            c = fII(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = fII(b, c, d, a, x[k + 1],  S44, 0x85845DD1);
            a = fII(a, b, c, d, x[k + 8],  S41, 0x6FA87E4F);
            d = fII(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = fII(c, d, a, b, x[k + 6],  S43, 0xA3014314);
            b = fII(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = fII(a, b, c, d, x[k + 4],  S41, 0xF7537E82);
            d = fII(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = fII(c, d, a, b, x[k + 2],  S43, 0x2AD7D2BB);
            b = fII(b, c, d, a, x[k + 9],  S44, 0xEB86D391);
            a = addUnsigned(a, AA);
            b = addUnsigned(b, BB);
            c = addUnsigned(c, CC);
            d = addUnsigned(d, DD);
        }

        return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
    };

    String.prototype['SHA1'] = String.prototype.SHA1 = function (utf8encode) {
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

        utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;
        msg = utf8encode ? this.Utf8encode() : this;
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

    String.prototype['SHA256'] = String.prototype.SHA256 = function (utf8encode) {
        function fSigma0(x) {
            return Number(2).ROTR(x) ^ Number(13).ROTR(x) ^ Number(22).ROTR(x);
        }

        function fSigma1(x) {
            return Number(6).ROTR(x) ^ Number(11).ROTR(x) ^ Number(25).ROTR(x);
        }

        function sigma0(x) {
            return Number(7).ROTR(x) ^ Number(18).ROTR(x) ^ (x >>> 3);
        }

        function sigma1(x) {
            return Number(17).ROTR(x) ^ Number(19).ROTR(x) ^ (x >>> 10);
        }

        function fCh(x, y, z)  {
            return (x & y) ^ (~x & z);
        }

        function fMaj(x, y, z) {
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
            a = 0,
            b = 0,
            c = 0,
            d = 0,
            e = 0,
            f = 0,
            g = 0,
            h = 0,
            T1 = 0,
            T2 = 0;

        utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;
        msg = utf8encode ? this.Utf8encode() : this;
        msg += String.fromCharCode(0x80);
        l = msg.length / 4 + 2;
        N = Math.ceil(l / 16);
        M = [];

        for (i = 0; i < N; i += 1) {
            M[i] = [];
            for (j = 0; j < 16; j += 1) {
                M[i][j] = (msg.charCodeAt(i * 64 + j * 4) << 24) | (msg.charCodeAt(i * 64 + j * 4 + 1) << 16) | (msg.charCodeAt(i * 64 + j * 4 + 2) << 8) | (msg.charCodeAt(i * 64 + j * 4 + 3));
            }
        }

        M[N - 1][14] = ((msg.length - 1) * 8) / Math.pow(2, 32);
        M[N - 1][14] = Math.floor(M[N - 1][14]);
        M[N - 1][15] = ((msg.length - 1) * 8) & 0xffffffff;
        W = [];
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
                T1 = h + fSigma1(e) + fCh(e, f, g) + K[t] + W[t];
                T2 = fSigma0(a) + fMaj(a, b, c);
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

        return H[0].toHexStr() + H[1].toHexStr() + H[2].toHexStr() + H[3].toHexStr() + H[4].toHexStr() + H[5].toHexStr() + H[6].toHexStr() + H[7].toHexStr();
    };

    // Set x decimal points of a number
    Number.prototype['dp'] = Number.prototype.dp = function (x) {
        return parseFloat(this.toFixed(x >= 0 && x <= 20 ? x : 0));
    };

    /*jslint bitwise: false */
    // For use with SHA1 and SHA256
    Number.prototype['toHexStr'] = Number.prototype.toHexStr = function () {
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
    Number.prototype['ROTL'] = Number.prototype.ROTL = function (x) {
        return (this << x) | (this >>> (32 - x));
    };

    // For use with SHA256
    Number.prototype['ROTR'] = Number.prototype.ROTR = function (x) {
        return (x >>> this) | (x << (32 - this));
    };
    /*jslint bitwise: true */

    // Determin if a number is an integer
    Number.prototype['isInt'] = Number.prototype.isInt = function () {
        var y = parseInt(this, 10);
        if (isNaN(y)) {
            return false;
        }

        return this === y && this.toString() === y.toString();
    };

    // Returns the SI value of a number
    Number.prototype['SI'] = Number.prototype.SI = function (x) {
        x = x >= 0 && x <= 20 ? x : 1;
        var a = Math.abs(this);
        if (a >= 1e12) {
            return (this / 1e12).toFixed(x) + 'T';
        }

        if (a >= 1e9) {
            return (this / 1e9).toFixed(x) + 'B';
        }

        if (a >= 1e6) {
            return (this / 1e6).toFixed(x) + 'M';
        }

        if (a >= 1e3) {
            return (this / 1e3).toFixed(x) + 'k';
        }

        return this;
    };

    // Add commas to a number, optionally converting to a Fixed point number
    Number.prototype['addCommas'] = Number.prototype.addCommas = function (x) {
        var n = typeof x === 'number' ? this.toFixed(x) : this.toString(),
            d = n.indexOf('.'),
            e = '',
            r = /(\d+)(\d{3})/;

        if (d !== -1) {
            e = '.' + n.substring(d + 1, n.length);
            n = n.substring(0, d);
        }

        while (r.test(n)) {
            n = n.replace(r, '$1' + ',' + '$2');
        }

        return n + e;
    };

    // For use with the Date.format prototype
    Date['replaceChars'] = Date.replaceChars = {
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],

        longMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],

        shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

        longDays: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

        // Day
        'd': function () {
            return (this.getDate() < 10 ? '0' : '') + this.getDate();
        },

        'D': function () {
            return Date.replaceChars.shortDays[this.getDay()];
        },

        'j': function () {
            return this.getDate();
        },

        'l': function () {
            return Date.replaceChars.longDays[this.getDay()];
        },

        'N': function () {
            return this.getDay() + 1;
        },

        'S': function () {
            return (this.getDate() % 10 === 1 && this.getDate() !== 11 ? 'st' : (this.getDate() % 10 === 2 && this.getDate() !== 12 ? 'nd' : (this.getDate() % 10 === 3 && this.getDate() !== 13 ? 'rd' : 'th')));
        },

        'w': function () {
            return this.getDay();
        },

        'z': function () {
            return "Not Yet Supported";
        },

        // Week
        'W': function () {
            return "Not Yet Supported";
        },

        // Month
        'F': function () {
            return Date.replaceChars.longMonths[this.getMonth()];
        },

        'm': function () {
            return (this.getMonth() < 9 ? '0' : '') + (this.getMonth() + 1);
        },

        'M': function () {
            return Date.replaceChars.shortMonths[this.getMonth()];
        },

        'n': function () {
            return this.getMonth() + 1;
        },

        't': function () {
            return "Not Yet Supported";
        },

        // Year
        'L': function () {
            return (((this.getFullYear() % 4 === 0) && (this.getFullYear() % 100 !== 0)) || (this.getFullYear() % 400 === 0)) ? '1' : '0';
        },

        'o': function () {
            return "Not Supported";
        },

        'Y': function () {
            return this.getFullYear();
        },

        'y': function () {
            return ('' + this.getFullYear()).substr(2);
        },

        // Time
        'a': function () {
            return this.getHours() < 12 ? 'am' : 'pm';
        },

        'A': function () {
            return this.getHours() < 12 ? 'AM' : 'PM';
        },

        'B': function () {
            return "Not Yet Supported";
        },

        'g': function () {
            return this.getHours() % 12 || 12;
        },

        'G': function () {
            return this.getHours();
        },

        'h': function () {
            return ((this.getHours() % 12 || 12) < 10 ? '0' : '') + (this.getHours() % 12 || 12);
        },

        'H': function () {
            return (this.getHours() < 10 ? '0' : '') + this.getHours();
        },

        'i': function () {
            return (this.getMinutes() < 10 ? '0' : '') + this.getMinutes();
        },

        's': function () {
            return (this.getSeconds() < 10 ? '0' : '') + this.getSeconds();
        },

        // Timezone
        'e': function () {
            return "Not Yet Supported";
        },

        'I': function () {
            return "Not Supported";
        },

        'O': function () {
            return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + '00';
        },

        'P': function () {
            return (-this.getTimezoneOffset() < 0 ? '-' : '+') + (Math.abs(this.getTimezoneOffset() / 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() / 60)) + ':' + (Math.abs(this.getTimezoneOffset() % 60) < 10 ? '0' : '') + (Math.abs(this.getTimezoneOffset() % 60));
        },

        'T': function () {
            var m = this.getMonth(),
                r = '';

            this.setMonth(0);
            r = this.toTimeString().replace(new RegExp("^.+ \\(?([^\\)]+)\\)?$"), '$1');
            this.setMonth(m);
            return r;
        },

        'Z': function () {
            return -this.getTimezoneOffset() * 60;
        },

        // Full Date/Time
        'c': function () {
            return this.format("Y-m-d") + "T" + this.format("H:i:sP");
        },

        'r': function () {
            return this.toString();
        },

        'U': function () {
            return this.getTime() / 1000;
        }
    };

    // Simulates PHP's date function
    Date.prototype['format'] = Date.prototype.format = function (format) {
        var i = 0,
            l = 0,
            c = '',
            s = '',
            r = Date.replaceChars;

        for (i = 0, l = format.length; i < l; i += 1) {
            c = format.charAt(i);
            if (r[c]) {
                s += r[c].call(this);
            } else {
                s += c;
            }
        }

        return s;
    };

    // Returns true if the array contains the search value else false
    Array.prototype['hasIndexOf'] = Array.prototype.hasIndexOf = String.prototype['hasIndexOf'];

    // Sort array by number
    Array.prototype['sortNum'] = Array.prototype.sortNum = function () {
        return this.sort(function (a, b) {
            return a - b;
        });
    };

    // The anti-sort, this shuffle() method will take the contents of the array and randomize them.
    // This method is surprisingly useful and not just for shuffling an array of virtual cards.
    Array.prototype['shuffle'] = Array.prototype.shuffle = function () {
        var rnd = 0,
            i = 0,
            tmp;

        for (i = this.length; i > 0; i -= 1) {
            rnd = parseInt(Math.random() * i, 10);
            i -= 1;
            tmp = this[i];
            this[i] = this[rnd];
            this[rnd] = tmp;
        }
    };

    // If you need to be able to compare Arrays this is the prototype to do it.
    // Pass an Array you want to compare and if they are identical the method will return true.
    // If there's a difference it will return false.
    // The match must be identical so '80' is not the same as 80.
    // Does not handle array of objects
    Array.prototype['compare'] = Array.prototype.compare = function (testArr) {
        var i = 0,
            l = testArr.length;

        if (this.length !== l) {
            return false;
        }

        for (i = 0; i < l; i += 1) {
            if (this[i].compare) {
                if (!this[i].compare(testArr[i])) {
                    return false;
                }
            }

            if (this[i] !== testArr[i]) {
                return false;
            }
        }

        return true;
    };

    // Array.indexOf() is a nice method but this extension is a little more powerful and flexible.
    // First it will return an array of all the indexes it found (it will return false if it doesn't find anything).
    // Second in addition to passing the usual string or number to look for you can actually pass a regular expression,
    // which makes this the ultimate Array prototype in my book.
    Array.prototype['find'] = Array.prototype.find = function (searchStr) {
        var r = false,
            i = 0,
            l = this.length;

        for (i = 0; i < l; i += 1) {
            if (typeof searchStr === 'function') {
                if (searchStr.test(this[i])) {
                    if (!r) {
                        r = [];
                    }

                    r.push(i);
                }
            } else {
                if (this[i] === searchStr) {
                    if (!r) {
                        r = [];
                    }

                    r.push(i);
                }
            }
        }

        return r;
    };

    // Return an array with no duplicates
    Array.prototype['unique'] = Array.prototype.unique = function () {
        var o = {},
            i = 0,
            l = this.length,
            r = [];

        for (i = 0; i < l; i += 1) {
            o[this[i]] = this[i];
        }

        for (i in o) {
            if (o.hasOwnProperty(i)) {
                r.push(o[i]);
            }
        }

        return r;
    };

    // Array support for older browsers
    if (!Array.prototype['indexOf']) {
        Array.prototype['indexOf'] = Array.prototype.indexOf = function (sEl) {
            if (this === undefined || this === null) {
                throw new TypeError();
            }

            /*jslint newcap: false, bitwise: false */
            var t = Object(this),
                l = t.length >>> 0,
            /*jslint newcap: true, bitwise: true */
                n = 0,
                k = 0;

            if (l === 0) {
                return -1;
            }

            if (arguments.length > 0) {
                n = Number(arguments[1]);
                if (n !== n) { // shortcut for verifying if it's NaN
                    n = 0;
                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }

            if (n >= l) {
                return -1;
            }

            for (k = n >= 0 ? n : Math.max(l - Math.abs(n), 0); k < l; k += 1) {
                if (k in t && t[k] === sEl) {
                    return k;
                }
            }

            return -1;
        };
    }

    if (!Array.prototype.lastIndexOf) {
        Array.prototype['lastIndexOf'] = Array.prototype.lastIndexOf = function (sEl) {
            if (this === undefined || this === null) {
                throw new TypeError();
            }

            /*jslint newcap: false, bitwise: false */
            var t = Object(this),
                l = t.length >>> 0,
            /*jslint newcap: true, bitwise: true */
                n = 0,
                k = 0;

            if (l === 0) {
                return -1;
            }

            n = l;
            if (arguments.length > 0) {
                n = Number(arguments[1]);
                if (n !== n) {
                    n = 0;
                } else if (n !== 0 && n !== Infinity && n !== -Infinity) {
                    n = (n > 0 || -1) * Math.floor(Math.abs(n));
                }
            }

            k = n >= 0 ? Math.min(n, l - 1) : l - Math.abs(n);
            while (k >= 0) {
                if (k in t && t[k] === sEl) {
                    return k;
                }
            }

            return -1;
        };
    }

    if (!Array.prototype['shift']) {
        Array.prototype['shift'] = Array.prototype.shift = function () {
            var f = this[0];
            this.reverse();
            this.length = Math.max(this.length - 1, 0);
            this.reverse();
            return f;
        };
    }

    if (!Array.prototype['unshift']) {
        Array.prototype['unshift'] = Array.prototype.unshift = function () {
            var i = 0;
            this.reverse();
            for (i = arguments.length - 1; i >= 0; i -= 1) {
                this[this.length] = arguments[i];
            }

            this.reverse();
            return this.length;
        };
    }

    if (!Array.prototype.filter) {
        Array.prototype['filter'] = Array.prototype.filter = function (fun) {
            if (typeof fun !== "function") {
                throw new TypeError();
            }

            var l = this.length,
                r = [],
                t = arguments[1],
                i = 0,
                v;

            for (i = 0; i < l; i += 1) {
                if (i in this) {
                    v = this[i]; // in case fun mutates this
                    if (fun.call(t, v, i, this)) {
                        r.push(v);
                    }
                }
            }

            return r;
        };
    }

    if (!Array.prototype.forEach) {
        Array.prototype['forEach'] = Array.prototype.forEach = function (fun) {
            if (typeof fun !== "function") {
                throw new TypeError();
            }

            var l = this.length,
                t = arguments[1],
                i = 0;

            for (i = 0; i < l; i += 1) {
                if (i in this) {
                    fun.call(t, this[i], i, this);
                }
            }
        };
    }

    if (!Array.prototype.map) {
        Array.prototype['map'] = Array.prototype.map = function (fun) {
            if (typeof fun !== "function") {
                throw new TypeError();
            }

            var l = this.length,
                r = [],
                t = arguments[1],
                i = 0;

            for (i = 0; i < l; i += 1) {
                if (i in this) {
                    r[i] = fun.call(t, this[i], i, this);
                }
            }

            return r;
        };
    }

    if (!Array.prototype.some) {
        Array.prototype['some'] = Array.prototype.some = function (fun) {
            if (typeof fun !== "function") {
                throw new TypeError();
            }

            var l = this.length,
                t = arguments[1],
                i = 0;

            for (i = 0; i < l; i += 1) {
                if (i in this && fun.call(t, this[i], i, this)) {
                    return true;
                }
            }

            return false;
        };
    }

    ///////////////////////////
    //       JSON2
    ///////////////////////////

    /*
    Modification is based on
    http://www.JSON.org/json2.js
    2010-03-20
    Public Domain.

    Creates a global JSON2 object containing two methods: stringify and parse.
    Copied to JSON object if it does not exist natively in the browser.

        JSON2.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a JSON text from a JavaScript value.

            When an object value is found, if the object contains a toJSON
            method, its toJSON method will be called and the result will be
            stringified. A toJSON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toJSON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toJSON2 = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    function g(n) {
                        // Format integers to have at least three digits.
                        return n < 100 ? '0' + n : n;
                    }

                    return isFinite(this.valueOf()) ?
                        this.getUTCFullYear()        + '-' +
                        f(this.getUTCMonth() + 1)    + '-' +
                        f(this.getUTCDate())         + 'T' +
                        f(this.getUTCHours())        + ':' +
                        f(this.getUTCMinutes())      + ':' +
                        f(this.getUTCSeconds())      + '.' +
                        g(this.getUTCMilliseconds()) + 'Z' : null;
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have JSON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with JSON values.
            JSON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = JSON2.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = JSON2.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = JSON2.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        JSON2.parse(text, reviver)
            This method parses a JSON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = JSON2.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = JSON2.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' && value.slice(0, 5) === 'Date(' && value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });
    */

    Date.prototype['toJSON2'] = Date.prototype.toJSON2 = function (key) {
        function f(n) {
            // Format integers to have at least two digits.
            return n < 10 ? '0' + n : n;
        }

        function g(n) {
            // Format integers to have at least three digits.
            return n < 100 ? '0' + n : n;
        }

        return isFinite(this.valueOf()) ?
            this.getUTCFullYear()        + '-' +
            f(this.getUTCMonth() + 1)    + '-' +
            f(this.getUTCDate())         + 'T' +
            f(this.getUTCHours())        + ':' +
            f(this.getUTCMinutes())      + ':' +
            f(this.getUTCSeconds())      + '.' +
            g(this.getUTCMilliseconds()) + 'Z' : null;
    };

    String.prototype['toJSON2'] = String.prototype.toJSON2 = Number.prototype['toJSON2'] = Number.prototype.toJSON2 = Boolean.prototype['toJSON2'] = Boolean.prototype.toJSON2 = function (key) {
        return this.valueOf();
    };

    if (typeof Date.prototype['toJSON'] !== 'function') {
        Date.prototype['toJSON'] = Date.prototype.toJSON = Date.prototype['toJSON2'];
        String.prototype['toJSON'] = String.prototype.toJSON = String.prototype['toJSON2'];
        Number.prototype['toJSON'] = Number.prototype.toJSON = Number.prototype['toJSON2'];
        Boolean.prototype['toJSON'] = Boolean.prototype.toJSON = Boolean.prototype['toJSON2'];
    }
    /*jslint sub: false */

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    function quote(string) {
        escapable.lastIndex = 0;
        return escapable.test(string) ?
            '"' + string.replace(escapable, function (a) {
                var c = meta[a];
                return typeof c === 'string' ? c : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
            }) + '"' :
            '"' + string + '"';
    }

    // Produce a string from holder[key].
    function str(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.
        if (value && typeof value === 'object' && typeof value.toJSON2 === 'function') {
            value = value.toJSON2(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.
        switch (typeof value) {
        case 'string':
            return quote(value);
        case 'number':
            // JSON numbers must be finite. Encode non-finite numbers as null.
            return isFinite(value) ? String(value) : 'null';
        case 'boolean':
        case 'null':
            // If the value is a boolean or null, convert it to a string. Note:
            // typeof null does not produce 'null'. The case is included here in
            // the remote chance that this gets fixed someday.
            return String(value);
        case 'object':
            // If the type is 'object', we might be dealing with an object or an array or null.
            // Due to a specification blunder in ECMAScript, typeof null is 'object',
            // so watch out for that case.
            if (!value) {
                return 'null';
            }

            // Make an array to hold the partial results of stringifying this object value.
            gap += indent;
            partial = [];
            // Is the value an array?
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                // The value is an array. Stringify every element. Use null as a placeholder
                // for non-JSON values.
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }

                // Join all of the elements together, separated with commas, and wrap them in brackets.
                v = partial.length === 0 ? '[]' : gap ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']' : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }

            // If the replacer is an array, use it to select the members to be stringified.
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            // Otherwise, iterate through all of the keys in the object.
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }

            // Join all of the member texts together, separated with commas, and wrap them in braces.
            v = partial.length === 0 ? '{}' : gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}' : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }

        return undefined;
    }

    JSON2 = {
        // The stringify method takes a value and an optional replacer, and an optional
        // space parameter, and returns a JSON text. The replacer can be a function
        // that can replace values, or an array of strings that will select the keys.
        // A default replacer method can be provided. Use of the space parameter can
        // produce text that is more easily readable.
        stringify: function (value, replacer, space) {
            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that many spaces.
            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }
            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array. Otherwise, throw an error.
            rep = replacer;
            if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('JSON2.stringify');
            }

            // Make a fake root object containing our value under the key of ''. Return the result of stringifying the value.
            return str('', {'': value});
        },

        // The parse method takes a text and an optional reviver function, and returns
        // a JavaScript value if the text is a valid JSON text.
        parse: function (text, reviver) {
            var j,
                rx1 = new RegExp("^[\\],:{}\\s]*$"),
                rx2 = new RegExp("\\\\(?:[\"\\\\\\/bfnrt]|u[0-9a-fA-F]{4})", "g"),
                rx3 = new RegExp("\"[^\"\\\\\\n\\r]*\"|true|false|null|-?\\d+(?:\\.\\d*)?(?:[eE][+\\-]?\\d+)?", "g"),
                rx4 = new RegExp("(?:^|:|,)(?:\\s*\\[)+", "g");

            // The walk method is used to recursively walk the resulting structure so
            // that modifications can be made.
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }

            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.
            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '", "\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.
            if (rx1.test(text.replace(rx2, '@').replace(rx3, ']').replace(rx4, ''))) {
                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.
                /*jslint evil: true */
                j = eval('(' + text + ')');
                /*jslint evil: false */
                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.
                return typeof reviver === 'function' ? walk({'': j}, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.
            throw new SyntaxError('JSON2.parse');
        }
    };

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    JSON2['stringify'] = JSON2.stringify;
    JSON2['parse'] = JSON2.parse;

    // Create a JSON2 object only if one does not already exist.
    if (!window['JSON2']) {
        window['JSON2'] = window.JSON2 = JSON2;
    }

    // Create a JSON object only if one does not already exist.
    if (!window['JSON']) {
        window['JSON'] = window.JSON = JSON2;
    }
    /*jslint sub: false */

    ///////////////////////////
    //       JSON.hpack
    ///////////////////////////

    /** json.hpack
     * description JSON Homogeneous Collection Packer
     * version     1.0.1
     * author      Andrea Giammarchi
     * license     Mit Style License
     * project     http://github.com/WebReflection/json.hpack/tree/master
     * blog        http://webreflection.blogspot.com/
     */

    // @author  Andrea Giammarchi
    (function (cache) {
        /** JSON.hpack(homogeneousCollection:Array[, compression:Number]):Array
         * @param   Array       mono dimensional homogeneous collection of objects to pack
         * @param   [Number]    optional compression level from 0 to 4 - default 0
         * @return  Array       optimized collection
         */
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        JSON['hpack'] = JSON.hpack = function (collection, compression) {
        /*jslint sub: false */
            var i       = 0,
                indexOf = Array.prototype.indexOf,
                header  = [],
                index   = 0,
                k       = 0,
                length  = 0,
                len     = 0,
                row     = [],
                j       = 0,
                l       = 0,
                value,
                item,
                key,
                first,
                result;

            if (3 < compression) {    // try evey compression level and returns the best option
                i = JSON.hbest(collection);
                result = cache[i];
                cache = [];
            } else {                // compress via specified level (default 0)
                result = [header];
                first = collection[0];
                // create list of property names
                for (key in first) {
                    if (first.hasOwnProperty(key)) {
                        header[index] = key;
                        index += 1;
                    }
                }

                len = index;
                index = 0;
                // replace objects using arrays respecting header indexes order
                for (i = 0, length = collection.length; i < length; i += 1) {
                    item = collection[i];
                    row = [];
                    for (j = 0; j < len; j += 1) {
                        row[j] = item[header[j]];
                    }

                    index += 1;
                    result[index] = row;
                }

                index += 1;
                // compression 1, 2 or 3
                if (0 < compression) {
                    // create a fixed enum type for each property (except numbers)
                    row = result[1];
                    for (j = 0; j < len; j += 1) {
                        if (typeof row[j] !== "number") {
                            first = [];
                            header[j] = [header[j], first];
                            first.indexOf = indexOf;
                            // replace property values with enum index (create entry in enum list if not present)
                            for (i = 1; i < index; i += 1) {
                                value = result[i][j];
                                l = first.indexOf(value);
                                result[i][j] = l < 0 ? first.push(value) - 1 : l;
                            }
                        }
                    }
                }

                // compression 3 only
                if (2 < compression) {
                    // Second Attemp:
                    // This compression is quite expensive.
                    // It calculates the length of all indexes plus the lenght
                    // of the enum against the length of values rather than indexes and without enum for each column
                    // In this way the manipulation will be hibryd but hopefully worthy in certain situation.
                    // not truly suitable for old client CPUs cause it could cost too much
                    for (j = 0; j < len; j += 1) {
                        if (header[j] instanceof Array) {
                            row = header[j][1];
                            value = [];
                            first = [];
                            k = 0;
                            for (i = 1; i < index; i += 1) {
                                first[k] = result[i][j];
                                value[k] = row[first[k]];
                                k += 1;
                            }

                            if (JSON.stringify(value).length < JSON.stringify(first.concat(row)).length) {
                                k = 0;
                                for (i = 1; i < index; i += 1) {
                                    result[i][j] = value[k];
                                    k += 1;
                                }

                                header[j] = header[j][0];
                            }
                        }
                    }
                } else if (1 < compression) { // compression 2 only
                    // compare the lenght of the entire collection with the length of the enum, if present
                    length -= Math.floor(length / 2);
                    for (j = 0; j < len; j += 1) {
                        if (header[j] instanceof Array) {
                            // if the collection length - (collection lenght / 2) is lower than enum length
                            // maybe it does not make sense to create extra characters in the string for each
                            // index representation
                            first = header[j][1];
                            if (length < first.length) {
                                for (i = 1; i < index; i += 1) {
                                    value = result[i][j];
                                    result[i][j] = first[value];
                                }

                                header[j] = header[j][0];
                            }
                        }
                    }
                }

                // if compression is at least greater than 0
                if (0 < compression) {
                    // flat the header Array to remove useless brackets
                    for (j = 0; j < len; j += 1) {
                        if (header[j] instanceof Array) {
                            header.splice(j, 1, header[j][0], header[j][1]);
                            len += 1;
                            j += 1;
                        }
                    }
                }
            }

            return result;
        };

        /** JSON.hunpack(packedCollection:Array):Array
         * @param   Array       optimized collection to unpack
         * @return  Array       original  mono dimensional homogeneous collection of objects
         */
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        JSON['hunpack'] = JSON.hunpack = function (collection) {
        /*jslint sub: false */
            var result = [],
                keys   = [],
                header = collection[0],
                len    = header.length,
                length = collection.length,
                index  = -1,
                k      = -1,
                i      = 0,
                l      = 0,
                j,
                row,
                anonymous;

            // compatible with every hpack compressed array
            // simply swaps arrays with key/values objects
            for (i = 0; i < len; i += 1) {
                // list of keys
                k += 1;
                keys[k] = header[i];
                // if adjacent value is an array (enum)
                if (typeof header[i + 1] === "object") {
                    i += 1;
                    // replace indexes in the column
                    // using enum as collection
                    for (j = 1; j < length; j += 1) {
                        row = collection[j];
                        row[l] = header[i][row[l]];
                    }
                }

                l += 1;
            }

            for (i = 0, len = keys.length; i < len; i += 1) {
                // replace keys with assignment operation ( test becomes o["test"]=a[index]; )
                // make properties safe replacing " char
                keys[i] = 'o["'.concat(keys[i].replace('"', "\\x22"), '"]=a[', i, '];');
            }

            // one shot anonymous function with "precompiled replacements"
            /*jslint evil: true */
            anonymous = new Function("o,a", keys.join("") + "return o;");
            /*jslint evil: false */
            for (j = 1; j < length; j += 1) {
                // replace each item with runtime key/value pairs object
                index += 1;
                result[index] = anonymous({}, collection[j]);
            }

            return result;
        };

        /** JSON.hclone(packedCollection:Array):Array
         * @param   Array       optimized collection to clone
         * @return  Array       a clone of the original collection
         */
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        JSON['hclone'] = JSON.hclone = function (collection) {
        /*jslint sub: false */
            var clone  = [],
                i      = 0,
                length = collection.length;

            // avoid array modifications
            // it could be useful but not that frequent in "real life cases"
            for (i = 0; i < length; i += 1) {
                clone[i] = collection[i].slice(0);
            }

            return clone;
        };

        /** JSON.hbest(packedCollection:Array):Number
         * @param   Array       optimized collection to clone
         * @return  Number      best compression option
         */
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        JSON['hbest'] = JSON.hbest = function (collection) {
        /*jslint sub: false */
            var i      = 0,
                j      = 0,
                len    = 0,
                length = 0;

            // for each compression level [0-4] ...
            for (i = 0; i < 4; i += 1) {
                // cache result
                cache[i] = JSON.hpack(collection, i);
                // retrieve the JSON length
                len = JSON.stringify(cache[i]).length;
                if (length === 0) {
                    length = len;
                } else if (len < length) { // choose which one is more convenient
                    length = len;
                    j = i;
                }
            }

            // return most convenient convertion
            // please note that with small amount of data
            // native JSON convertion could be smaller
            // [{"k":0}] ==> [["k"],[0]] (9 chars against 11)
            // above example is not real life example and as soon
            // as the list will have more than an object
            // hpack will start to make the difference:
            // [{"k":0},{"k":0}] ==> [["k"],[0],[0]] (17 chars against 15)
            return j;
        };

    }([]));

    ///////////////////////////
    //       RISON
    ///////////////////////////

    /*
    Modification is based on
    http://www.RISON.org/RISON.js
    2010-03-20
    Public Domain.

    Creates a global RISON object containing two methods: stringify and parse.
    Copied to RISON object if it does not exist natively in the browser.

        RISON.stringify(value, replacer, space)
            value       any JavaScript value, usually an object or array.

            replacer    an optional parameter that determines how object
                        values are stringified for objects. It can be a
                        function or an array of strings.

            space       an optional parameter that specifies the indentation
                        of nested structures. If it is omitted, the text will
                        be packed without extra whitespace. If it is a number,
                        it will specify the number of spaces to indent at each
                        level. If it is a string (such as '\t' or '&nbsp;'),
                        it contains the characters used to indent at each level.

            This method produces a RISON text from a JavaScript value.

            When an object value is found, if the object contains a toRISON
            method, its toRISON method will be called and the result will be
            stringified. A toRISON method does not serialize: it returns the
            value represented by the name/value pair that should be serialized,
            or undefined if nothing should be serialized. The toRISON method
            will be passed the key associated with the value, and this will be
            bound to the value

            For example, this would serialize Dates as ISO strings.

                Date.prototype.toRISON = function (key) {
                    function f(n) {
                        // Format integers to have at least two digits.
                        return n < 10 ? '0' + n : n;
                    }

                    function g(n) {
                        // Format integers to have at least three digits.
                        return n < 100 ? '0' + n : n;
                    }

                    return isFinite(this.valueOf()) ?
                        this.getUTCFullYear()        + '-' +
                        f(this.getUTCMonth() + 1)    + '-' +
                        f(this.getUTCDate())         + 'T' +
                        f(this.getUTCHours())        + ':' +
                        f(this.getUTCMinutes())      + ':' +
                        f(this.getUTCSeconds())      + '.' +
                        g(this.getUTCMilliseconds()) + 'Z' : null;
                };

            You can provide an optional replacer method. It will be passed the
            key and value of each member, with this bound to the containing
            object. The value that is returned from your method will be
            serialized. If your method returns undefined, then the member will
            be excluded from the serialization.

            If the replacer parameter is an array of strings, then it will be
            used to select the members to be serialized. It filters the results
            such that only members with keys listed in the replacer array are
            stringified.

            Values that do not have RISON representations, such as undefined or
            functions, will not be serialized. Such values in objects will be
            dropped; in arrays they will be replaced with null. You can use
            a replacer function to replace those with RISON values.
            RISON.stringify(undefined) returns undefined.

            The optional space parameter produces a stringification of the
            value that is filled with line breaks and indentation to make it
            easier to read.

            If the space parameter is a non-empty string, then that string will
            be used for indentation. If the space parameter is a number, then
            the indentation will be that many spaces.

            Example:

            text = RISON.stringify(['e', {pluribus: 'unum'}]);
            // text is '["e",{"pluribus":"unum"}]'


            text = RISON.stringify(['e', {pluribus: 'unum'}], null, '\t');
            // text is '[\n\t"e",\n\t{\n\t\t"pluribus": "unum"\n\t}\n]'

            text = RISON.stringify([new Date()], function (key, value) {
                return this[key] instanceof Date ?
                    'Date(' + this[key] + ')' : value;
            });
            // text is '["Date(---current time---)"]'


        RISON.parse(text, reviver)
            This method parses a RISON text to produce an object or array.
            It can throw a SyntaxError exception.

            The optional reviver parameter is a function that can filter and
            transform the results. It receives each of the keys and values,
            and its return value is used instead of the original value.
            If it returns what it received, then the structure is not modified.
            If it returns undefined then the member is deleted.

            Example:

            // Parse the text. Values that look like ISO date strings will
            // be converted to Date objects.

            myData = RISON.parse(text, function (key, value) {
                var a;
                if (typeof value === 'string') {
                    a = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)Z$/.exec(value);
                    if (a) {
                        return new Date(Date.UTC(+a[1], +a[2] - 1, +a[3], +a[4], +a[5], +a[6]));
                    }
                }
                return value;
            });

            myData = RISON.parse('["Date(09/09/2001)"]', function (key, value) {
                var d;
                if (typeof value === 'string' && value.slice(0, 5) === 'Date(' && value.slice(-1) === ')') {
                    d = new Date(value.slice(5, -1));
                    if (d) {
                        return d;
                    }
                }
                return value;
            });
    */

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    Date.prototype['toRISON'] = Date.prototype.toRISON = Date.prototype['toJSON'];
    String.prototype['toRISON'] = String.prototype.toRISON = Number.prototype['toRISON'] = Number.prototype.toRISON = Boolean.prototype['toRISON'] = Boolean.prototype.toRISON = String.prototype['toJSON'];
    /*jslint sub: false */

    // If the string contains no control characters, no quote characters, and no
    // backslash characters, then we can safely slap some quotes around it.
    // Otherwise we must also replace the offending characters with safe escape
    // sequences.
    function quoteRison(string) {
        if (string.length === 0) {
            return "''";
        }

        // Check if it's a valid ident
        if (RISON.id_ok.test(string)) {
            return string;
        }

        // Escape special chars
        string = string.replace(/(['!])/mg, '!$1');
        return "'" + string + "'";
    }

    // Produce a string from holder[key].
    function encodeRison(key, holder) {
        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toRISON method, call it to obtain a replacement value.
        if (value && typeof value === 'object' && typeof value.toRISON === 'function') {
            value = value.toRISON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.
        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.
        switch (typeof value) {
        case 'string':
            return quoteRison(value);
        case 'number':
            // RISON numbers must be finite. Encode non-finite numbers as null.
            // strip '+' out of exponent, '-' is ok though
            return isFinite(value) ? String(value).replace('+', '') : '!n';
        case 'boolean':
            return value ? '!t' : '!f';
        case 'null':
            return '!n';
        case 'object':
            // If the type is 'object', we might be dealing with an object or an array or null.
            // Due to a specification blunder in ECMAScript, typeof null is 'object',
            // so watch out for that case.
            if (!value) {
                return '!n';
            }

            // Make an array to hold the partial results of stringifying this object value.
            //gap += indent;
            partial = [];
            // Is the value an array?
            if (Object.prototype.toString.apply(value) === '[object Array]') {
                // The value is an array. Stringify every element. Use null as a placeholder
                // for non-RISON values.
                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = encodeRison(i, value) || '!n';
                }

                // Join all of the elements together, separated with commas, and wrap them in brackets.
                v = partial.length === 0 ? '!()' : '!(' + partial.join(',') + ')';
                //gap = mind;
                return v;
            }

            // If the replacer is an array, use it to select the members to be stringified.
            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    k = rep[i];
                    if (typeof k === 'string') {
                        v = encodeRison(k, value);
                        if (v) {
                            partial.push(quoteRison(k) + ':' + v);
                        }
                    }
                }
            // Otherwise, iterate through all of the keys in the object.
            } else {
                for (k in value) {
                    if (Object.hasOwnProperty.call(value, k)) {
                        v = encodeRison(k, value);
                        if (v) {
                            partial.push(quoteRison(k) + ':' + v);
                        }
                    }
                }
            }

            // The RISON spec recommends to sort the dictionaries by its keys to improve caching
            partial.sort(function (a, b) {
                a = a.split(':')[0];
                b = b.split(':')[0];
                return (a > b) - (a < b);
            });

            // Join all of the member texts together, separated with commas, and wrap them in braces.
            v = partial.length === 0 ? '()' : '(' + partial.join(',') + ')';
            //gap = mind;
            return v;
        }

        return undefined;
    }

    RISON = {
        // The stringify method takes a value and an optional replacer, and returns a RISON text.
        // The replacer can be a function that can replace values, or an array of strings that will select the keys.
        // A default replacer method can be provided.
        stringify: function (value, replacer) {
            // If there is a replacer, it must be a function or an array. Otherwise, throw an error.
            rep = replacer;
            if (replacer && typeof replacer !== 'function' && (typeof replacer !== 'object' || typeof replacer.length !== 'number')) {
                throw new Error('RISON.stringify');
            }

            // Make a fake root object containing our value under the key of ''. Return the result of stringifying the value.
            return encodeRison('', {'': value});
        },

        // The parse method takes a text and an optional reviver function, and returns
        // a JavaScript value if the text is a valid JSON text.
        parse: function (text, reviver) {
            var j;
            // The walk method is used to recursively walk the resulting structure so
            // that modifications can be made.
            function walk(holder, key) {
                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }

                return reviver.call(holder, key, value);
            }

            j = RISON.decode(text);
            if (typeof j !== 'undefined') {
                return typeof reviver === 'function' ? walk({'': j}, '') : j;
            }

            throw new SyntaxError('RISON.parse');
        },

        /*
         * we divide the uri-safe glyphs into three sets
         *   <rison> - used by rison                         ' ! : ( ) ,
         *   <reserved> - not common in strings, reserved    * @ $ & ; =
         *
         * we define <identifier> as anything that's not forbidden
         */

        /**
         * characters that are illegal as the start of an id
         * this is so ids can't look like numbers.
         */
        not_idstart: "-0123456789",

        /*
        not_idchar: risonList,

        id_ok: new RegExp('^[^\\-\\d' + risonList + '][^' + risonList + ']*$'),

        next_id: new RegExp('[^\\-\\d' + risonList + '][^' + risonList + ']*', 'g'),
        */

        /**
         *  rules for an uri encoder that is more tolerant than encodeURIComponent
         *
         *  encodeURIComponent passes  ~!*()-_.'
         *
         *  we also allow              ,:@$/
         *
         */
        uri_ok: {  // ok in url paths and in form query args
            '~': true,
            '!': true,
            '*': true,
            '(': true,
            ')': true,
            '-': true,
            '_': true,
            '.': true,
            ',': true,
            ':': true,
            '@': true,
            '$': true,
            "'": true,
            '/': true
        },

        /**
         * this is like encodeURIComponent() but quotes fewer characters.
         *
         * @see RISON.uri_ok
         *
         * encodeURIComponent passes   ~!*()-_.'
         * RISON.quote also passes   ,:@$/
         *   and quotes " " as "+" instead of "%20"
         */
        quote: function (x) {
            if (/^[\-A-Za-z0-9~!*()_.',:@$\/]*$/.test(x)) {
                return x;
            }

            return encodeURIComponent(x)
                .replace('%2C', ',', 'g')
                .replace('%3A', ':', 'g')
                .replace('%40', '@', 'g')
                .replace('%24', '$', 'g')
                .replace('%2F', '/', 'g')
                .replace('%20', '+', 'g');
        },

        /**
         * RISON-encode a javascript object without surrounding parens
         *
         */
        encode_object: function (v) {
            if (typeof v !== 'object' || v === null || v instanceof Array) {
                throw new Error("RISON.encode_object expects an object argument");
            }

            var r = encodeRison('', {'': v});
            return r.substring(1, r.length - 1);
        },

        /**
         * RISON-encode a javascript array without surrounding parens
         *
         */
        encode_array: function (v) {
            if (!(v instanceof Array)) {
                throw new Error("RISON.encode_array expects an array argument");
            }

            var r = encodeRison('', {'': v});
            return r.substring(2, r.length - 1);
        },

        /**
         * RISON-encode and uri-encode a javascript structure
         *
         */
        encode_uri: function (v) {
            return RISON.quote(encodeRison('', {'': v}));
        },

        /**
         * parse a RISON string into a javascript structure.
         *
         * this is the simplest decoder entry point.
         *
         *  based on Oliver Steele's OpenLaszlo-JSON
         *     http://osteele.com/sources/openlaszlo/json
         */
        decode: function (r) {
            var errcb = function (e) {
                    throw new Error('RISON decoder error: ' + e);
                },
                p = new RISON.parser(errcb);

            return p.parse(r);
        },

        /**
         * parse an o-RISON string into a javascript structure.
         *
         * this simply adds parentheses around the string before parsing.
         */
        decode_object: function (r) {
            return RISON.decode('(' + r + ')');
        },

        /**
         * parse an a-RISON string into a javascript structure.
         *
         * this simply adds array markup around the string before parsing.
         */
        decode_array: function (r) {
            return RISON.decode('!(' + r + ')');
        }
    };

    (function () {
        var l  = [],
            hi = 0,
            lo = 0,
            c  = '';

        for (hi = 0; hi < 16; hi += 1) {
            for (lo = 0; lo < 16; lo += 1) {
                if (hi + lo === 0) {
                    continue;
                }

                c = String.fromCharCode(hi * 16 + lo);
                if (! /\w|[\-_.\/~]/.test(c)) {
                    l.push('\\u00' + hi.toString(16) + lo.toString(16));
                }
            }
        }
        /**
         * characters that are illegal inside ids.
         * <rison> and <reserved> classes are illegal in ids.
         *
         */
        RISON.not_idchar = l.join('');
    }());

    RISON.not_idchar = " '!:(),*@$";

    (function () {
        var idrx = '[^' + RISON.not_idstart.replace("-", "\\-") + RISON.not_idchar + '][^' + RISON.not_idchar + ']*';
        RISON.id_ok = new RegExp('^' + idrx + '$');
        // regexp to find the end of an id when parsing
        // g flag on the regexp is necessary for iterative regexp.exec()
        RISON.next_id = new RegExp(idrx, 'g');
    }());

    /**
     * construct a new parser object for reuse.
     *
     * @constructor
     * @class A Rison parser class.  You should probably
     *        use RISON.decode instead.
     * @see RISON.decode
     */
    RISON.parser = function (errcb) {
        this.errorHandler = errcb;
    };

    /**
     * a string containing acceptable whitespace characters.
     * by default the RISON decoder tolerates no whitespace.
     * to accept whitespace set RISON.parser.WHITESPACE = " \t\n\r\f";
     */
    RISON.parser.WHITESPACE = "";

    // expose this as-is?
    RISON.parser.prototype.setOptions = function (options) {
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        if (options['errorHandler']) {
            this.errorHandler = options['errorHandler'];
        }
        /*jslint sub: true */
    };

    /**
     * parse a RISON string into a javascript structure.
     */
    RISON.parser.prototype.parse = function (str) {
        this.string = str;
        this.index = 0;
        this.message = null;
        var value = this.readValue();
        if (!this.message && this.next()) {
            value = this.error("unable to parse string as RISON: '" + RISON.encode(str) + "'");
        }

        if (this.message && this.errorHandler) {
            this.errorHandler(this.message, this.index);
        }

        return value;
    };

    RISON.parser.prototype.error = function (message) {
        if (window.console && typeof console.log === 'function') {
            console.log('RISON parser error: ', message);
        }

        this.message = message;
        return undefined;
    };

    RISON.parser.prototype.readValue = function () {
        var c = this.next(),
            fn = c && this.table[c],
            s,
            i,
            m,
            id;

        if (fn) {
            return fn.apply(this);
        }

        // fell through table, parse as an id

        s = this.string;
        i = this.index - 1;

        // Regexp.lastIndex may not work right in IE before 5.5?
        // g flag on the regexp is also necessary
        RISON.next_id.lastIndex = i;
        m = RISON.next_id.exec(s);

        // console.log('matched id', i, r.lastIndex);

        if (m.length > 0) {
            id = m[0];
            this.index = i + id.length;
            return id;  // a string
        }

        if (c) {
            return this.error("invalid character: '" + c + "'");
        }

        return this.error("empty expression");
    };

    RISON.parser.parse_array = function (parser) {
        var ar = [],
            c,
            n;

        while ((c = parser.next()) !== ')') {
            if (!c) {
                return parser.error("unmatched '!('");
            }

            if (ar.length) {
                if (c !== ',') {
                    parser.error("missing ','");
                }
            } else if (c === ',') {
                return parser.error("extra ','");
            } else {
                parser.index -= 1;
            }

            n = parser.readValue();
            if (typeof n === "undefined") {
                return undefined;
            }

            ar.push(n);
        }

        return ar;
    };

    RISON.parser.bangs = {
        't': true,
        'f': false,
        'n': null,
        '(': RISON.parser.parse_array
    };

    RISON.parser.prototype.table = {
        '!': function () {
            var s = this.string,
                c = s.charAt(this.index),
                x;

            this.index += 1;
            if (!c) {
                return this.error('"!" at end of input');
            }

            x = RISON.parser.bangs[c];
            if (typeof x === 'function') {
                return x.call(null, this);
            } else if (typeof x === 'undefined') {
                return this.error('unknown literal: "!' + c + '"');
            }

            return x;
        },
        '(': function () {
            var o = {},
                c,
                count = 0,
                k,
                v;

            while ((c = this.next()) !== ')') {
                if (count) {
                    if (c !== ',') {
                        this.error("missing ','");
                    }
                } else if (c === ',') {
                    return this.error("extra ','");
                } else {
                    this.index -= 1;
                }

                k = this.readValue();
                if (typeof k === "undefined") {
                    return undefined;
                }

                if (this.next() !== ':') {
                    return this.error("missing ':'");
                }

                v = this.readValue();
                if (typeof v === "undefined") {
                    return undefined;
                }

                o[k] = v;
                count += 1;
            }

            return o;
        },
        "'": function () {
            var s = this.string,
                i = this.index,
                start = i,
                segments = [],
                c = s.charAt(i);

            i += 1;
            while (c !== "'") {
                //if (i == s.length) return this.error('unmatched "\'"');
                if (!c) {
                    return this.error('unmatched "\'"');
                }

                if (c === '!') {
                    if (start < i - 1) {
                        segments.push(s.slice(start, i - 1));
                    }

                    c = s.charAt(i);
                    i += 1;
                    if ("!'".indexOf(c) >= 0) {
                        segments.push(c);
                    } else {
                        return this.error('invalid string escape: "!' + c + '"');
                    }

                    start = i;
                }

                c = s.charAt(i);
                i += 1;
            }

            if (start < i - 1) {
                segments.push(s.slice(start, i - 1));
            }

            this.index = i;
            return segments.length === 1 ? segments[0] : segments.join('');
        },
        // Also any digit.  The statement that follows this table
        // definition fills in the digits.
        '-': function () {
            var s = this.string,
                i = this.index,
                start = i - 1,
                state = 'int',
                permittedSigns = '-',
                transitions = {
                    'int+.' : 'frac',
                    'int+e' : 'exp',
                    'frac+e': 'exp'
                },
                c;

            do {
                c = s.charAt(i);
                i += 1;
                if (!c) {
                    break;
                }

                if ('0' <= c && c <= '9') {
                    continue;
                }

                if (permittedSigns.indexOf(c) >= 0) {
                    permittedSigns = '';
                    continue;
                }

                state = transitions[state + '+' + c.toLowerCase()];
                if (state === 'exp') {
                    permittedSigns = '-';
                }
            } while (state);

            i -= 1;
            this.index = i;
            s = s.slice(start, i);
            if (s === '-') {
                return this.error("invalid number");
            }

            return Number(s);
        }
    };

    // copy table['-'] to each of table[i] | i <- '0'..'9':
    (function (table) {
        var i = 0;
        for (i = 0; i <= 9; i += 1) {
            table[String(i)] = table['-'];
        }
    }(RISON.parser.prototype.table));

    // return the next non-whitespace character, or undefined
    RISON.parser.prototype.next = function () {
        var s = this.string,
            i = this.index,
            c;

        do {
            if (i === s.length) {
                return undefined;
            }

            c = s.charAt(i);
            i += 1;
        } while (RISON.parser.WHITESPACE.indexOf(c) >= 0);
        this.index = i;
        return c;
    };

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    RISON['stringify'] = RISON.stringify;
    RISON['parse'] = RISON.parse;
    RISON['uri_ok'] = RISON.uri_ok;
    RISON['not_idchar'] = RISON.not_idchar;
    RISON['not_idstart'] = RISON.not_idstart;
    RISON['next_id'] = RISON.next_id;
    RISON['quote'] = RISON.quote;
    RISON['encode'] = RISON.encode = RISON['stringify'];
    RISON['encode_object'] = RISON.encode_object;
    RISON['encode_array'] = RISON.encode_array;
    RISON['encode_uri'] = RISON.encode_uri;
    RISON['decode'] = RISON.decode;
    RISON['decode_object'] = RISON.decode_object;
    RISON['decode_array'] = RISON.decode_array;
    RISON['parser'] = RISON.parser;
    RISON['parser']['WHITESPACE'] = RISON.parser.WHITESPACE;
    RISON['parser']['prototype'] = RISON.parser.prototype;
    RISON['parser']['prototype']['setOptions'] = RISON.parser.prototype.setOptions;
    RISON['parser']['prototype']['parse'] = RISON.parser.prototype.parse;
    RISON['parser']['prototype']['error'] = RISON.parser.prototype.error;
    RISON['parser']['prototype']['readValue'] = RISON.parser.prototype.readValue;
    RISON['parser']['parse_array'] = RISON.parser.parse_array;
    RISON['parser']['bangs'] = RISON.parser.bangs;
    RISON['parser']['prototype']['table'] = RISON.parser.prototype.table;
    RISON['parser']['prototype']['next'] = RISON.parser.prototype.next;

    // Create a RISON object only if one does not already exist.
    if (!window['RISON']) {
        window['RISON'] = window.RISON = RISON;
    }

    if (!window['rison']) {
        window['rison'] = window.rison = RISON;
    }
    /*jslint sub: false */

    ///////////////////////////
    //       utility
    ///////////////////////////

    utility = {
        version: "0.1.6",

        is_chrome: window.navigator.userAgent.toLowerCase().hasIndexOf('chrome'),

        is_firefox: window.navigator.userAgent.toLowerCase().hasIndexOf('firefox'),

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        is_opera: window['opera'] ? true : false,
        /*jslint sub: false */

        localStorage: false,

        sessionStorage: false,

        inputtypes: {},

        plural: function (i) {
            try {
                return i === 1 ? '' : 's';
            } catch (err) {
                utility.error("ERROR in utility.plural: " + err);
                return undefined;
            }
        },

        injectScript: function (url, body) {
            try {
                var inject = document.createElement('script');
                inject.setAttribute('type', 'text/javascript');
                inject.setAttribute('src', url);
                if (body) {
                    document.body.appendChild(inject);
                } else {
                    (document.head || document.getElementsByTagName('head')[0] || document.documentElement).appendChild(inject);
                }

                return true;
            } catch (err) {
                utility.error("ERROR in utility.injectScript: " + err);
                return false;
            }
        },

        class2type: {
            "[object Boolean]"  : 'boolean',
            "[object Number]"   : 'number',
            "[object String]"   : 'string',
            "[object Function]" : 'function',
            "[object Array]"    : 'array',
            "[object Date]"     : 'date',
            "[object RegExp]"   : 'regexp',
            "[object Object]"   : 'object'
        },

        type: function (o) {
            try {
                return o === null || o === undefined ? String(o) : utility.class2type[Object.prototype.toString.call(o)] || "object";
            } catch (err) {
                utility.error("ERROR in utility.type: " + err);
                return undefined;
            }
        },

        // A crude way of determining if an object is a window
        isWindow: function (o) {
            try {
                return o && typeof o === "object" && "setInterval" in o;
            } catch (err) {
                utility.error("ERROR in utility.isWindow: " + err);
                return undefined;
            }
        },

        isNaN: function (o) {
            try {
                return o === null || !/\d/.test(o) || isNaN(o);
            } catch (err) {
                utility.error("ERROR in utility.isNaN: " + err);
                return undefined;
            }
        },

        isArray: Array.isArray || function (o) {
            try {
                return utility.type(o) === 'array';
            } catch (err) {
                utility.error("ERROR in utility.isArray: " + err);
                return undefined;
            }
        },

        isObject: function (o) {
            try {
                return utility.type(o) === 'object';
            } catch (err) {
                utility.error("ERROR in utility.isObject: " + err);
                return undefined;
            }
        },

        isBoolean: function (o) {
            try {
                return utility.type(o) === 'boolean';
            } catch (err) {
                utility.error("ERROR in utility.isBoolean: " + err);
                return undefined;
            }
        },

        isFunction: function (o) {
            try {
                return utility.type(o) === 'function';
            } catch (err) {
                utility.error("ERROR in utility.isFunction: " + err);
                return undefined;
            }
        },

        isDate: function (o) {
            try {
                return utility.type(o) === 'date';
            } catch (err) {
                utility.error("ERROR in utility.isDate: " + err);
                return undefined;
            }
        },

        isRegExp: function (o) {
            try {
                return utility.type(o) === 'regexp';
            } catch (err) {
                utility.error("ERROR in utility.isRegExp: " + err);
                return undefined;
            }
        },

        isNumber: function (o) {
            try {
                return utility.type(o) === 'number';
            } catch (err) {
                utility.error("ERROR in utility.isNumber: " + err);
                return undefined;
            }
        },

        isString: function (o) {
            try {
                return utility.type(o) === 'string';
            } catch (err) {
                utility.error("ERROR in utility.isString: " + err);
                return undefined;
            }
        },

        isUndefined: function (o) {
            try {
                return utility.type(o) === 'undefined';
            } catch (err) {
                utility.error("ERROR in utility.isUndefined: " + err);
                return undefined;
            }
        },

        isNull: function (o) {
            try {
                return utility.type(o) === 'null';
            } catch (err) {
                utility.error("ERROR in utility.isNull: " + err);
                return undefined;
            }
        },

        isDefined: function (o) {
            try {
                return !utility.isUndefined(o) && !utility.isNull(o);
            } catch (err) {
                utility.error("ERROR in utility.isDefined: " + err);
                return undefined;
            }
        },

        isPlainObject: function (o) {
            try {
                // Must be an Object.
                // Because of IE, we also have to check the presence of the constructor property.
                // Make sure that DOM nodes and window objects don't pass through, as well
                if (!o || utility.type(o) !== "object" || o.nodeType || utility.isWindow(o)) {
                    return false;
                }

                // Not own constructor property must be Object
                if (o.constructor && !Object.prototype.hasOwnProperty.call(o, "constructor") && !Object.prototype.hasOwnProperty.call(o.constructor.prototype, "isPrototypeOf")) {
                    return false;
                }

                // Own properties are enumerated firstly, so to speed up,
                // if last one is own, then all properties are own.
                var key;
                for (key in o) {
                    if (o.hasOwnProperty(key)) {
                        continue;
                    }
                }

                return key === undefined || Object.prototype.hasOwnProperty.call(o, key);
            } catch (err) {
                utility.error("ERROR in utility.isPlainObject: " + err);
                return undefined;
            }
        },

        isEmptyObject: function (o) {
            try {
                var n;
                for (n in o) {
                    if (o.hasOwnProperty(n)) {
                        return false;
                    }
                }

                return true;
            } catch (err) {
                utility.error("ERROR in utility.isEmptyObject: " + err);
                return undefined;
            }
        },

        hasContent: function (o) {
            try {
                var h = false;
                switch (utility.type(o)) {
                case "string":
                    h = o.length ? true : false;
                    break;
                case "number":
                    h = true;
                    break;
                case "object":
                    if (utility.isDefined(o.length)) {
                        h = o.length ? true : false;
                    } else {
                        h = !utility.isEmptyObject(o);
                    }

                    break;
                case "array":
                    h = o.length ? true : false;
                    break;
                case "boolean":
                    h = true;
                    break;
                case "function":
                    h = true;
                    break;
                case "regexp":
                    h = true;
                    break;
                case "date":
                    h = true;
                    break;
                default:
                }

                return h;
            } catch (err) {
                utility.error("ERROR in utility.hasContent: " + err);
                return false;
            }
        },

        setContent: function (o, v) {
            try {
                return utility.hasContent(o) ? o : v;
            } catch (err) {
                utility.error("ERROR in utility.setContent: " + err);
                return false;
            }
        },

        // Removes matching elements from an array
        deleteElement: function (a, v) {
            try {
                if (utility.isArray(a)) {
                    while (v in a) {
                        a.splice(a.indexOf(v), 1);
                    }
                }

                return true;
            } catch (err) {
                utility.error("ERROR in utility.deleteElement: " + err);
                return false;
            }
        },

        extend: function () {
            try {
                var options, name, src, copy, copyIsArray, clone,
                    target = arguments[0] || {},
                    i = 1,
                    length = arguments.length,
                    deep = false;

                // Handle a deep copy situation
                if (utility.isBoolean(target)) {
                    deep = target;
                    target = arguments[1] || {};
                    // skip the boolean and the target
                    i = 2;
                }

                // Handle case when target is a string or something (possible in deep copy)
                if (!utility.isObject(target) && !utility.isFunction(target)) {
                    target = {};
                }

                // extend jQuery itself if only one argument is passed
                if (length === i) {
                    target = this;
                    i -= 1;
                }

                for (; i < length; i += 1) {
                    // Only deal with non-null/undefined values
                    options = arguments[i];
                    if (utility.isDefined(options)) {
                        // Extend the base object
                        for (name in options) {
                            if (options.hasOwnProperty(name)) {
                                src = target[name];
                                copy = options[name];

                                // Prevent never-ending loop
                                if (target === copy) {
                                    continue;
                                }

                                // Recurse if we're merging plain objects or arrays
                                copyIsArray = utility.isArray(copy);
                                if (deep && copy && (utility.isPlainObject(copy) || copyIsArray)) {
                                    if (copyIsArray) {
                                        copyIsArray = false;
                                        clone = src && utility.isArray(src) ? src : [];
                                    } else {
                                        clone = src && utility.isPlainObject(src) ? src : {};
                                    }

                                    // Never move original objects, clone them
                                    target[name] = utility.extend(deep, clone, copy);

                                // Don't bring in undefined values
                                } else if (!utility.isUndefined(copy)) {
                                    target[name] = copy;
                                }
                            }
                        }
                    }
                }

                // Return the modified object
                return target;
            } catch (err) {
                utility.error("ERROR in utility.extend: " + err);
                return undefined;
            }
        },

        set_log_version: function (text) {
            log_version = utility.isString(text) ? text : (utility.isNumber(text) ? text.toString() : '');
        },

        get_log_version: function () {
            return log_version;
        },

        set_log_level: function (level) {
            log_level = utility.isNumber(level) ? level : (!isNaN(level) ? parseInt(level, 10) : 1);
        },

        get_log_level: function () {
            return log_level;
        },

        log_common: function (type, level, text) {
            if (log_level && !isNaN(level) && log_level >= level) {
                var m = log_version + ' |' + (new Date()).toLocaleTimeString() + '| ' + text,
                    t = [],
                    i = 0,
                    l = 0;

                type = type ? type : "log";
                type = window.console && typeof console[type] === 'function' ? type : (window.console && typeof console.log === 'function' ? "log" : '');
                if (type) {
                    if (arguments.length === 4) {
                        for (i = 0, l = arguments[3].length; i < l; i += 1) {
                            t.push(utility.owl.deepCopy(arguments[3][i]));
                        }

                        console[type](m, t);
                    } else {
                        console[type](m);
                    }
                }
            }
        },

        log: function (level, text) {
            if (arguments.length > 2) {
                utility.log_common("log", level, text, Array.prototype.slice.call(arguments, 2));
            } else {
                utility.log_common("log", level, text);
            }

            return text;
        },

        warn: function (text) {
            if (arguments.length > 1) {
                utility.log_common("warn", 1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                utility.log_common("warn", 1, text);
            }

            return text;
        },

        error: function (text) {
            if (arguments.length > 1) {
                utility.log_common("error", 1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                utility.log_common("error", 1, text);
            }

            return text;
        },

        sortBy: function (reverse, name, minor) {
            try {
                return function (o, p) {
                    try {
                        if (utility.isObject(o) && utility.isObject(p) && o && p) {
                            var a = o[name],
                                b = p[name];

                            if (a === b) {
                                return utility.isFunction(minor) ? minor(o, p) : o;
                            }

                            if (utility.type(a) === utility.type(b)) {
                                if (reverse) {
                                    return a < b ? 1 : -1;
                                } else {
                                    return a < b ? -1 : 1;
                                }
                            }

                            if (reverse) {
                                return utility.type(a) < utility.type(b) ? 1 : -1;
                            } else {
                                return utility.type(a) < utility.type(b) ? -1 : 1;
                            }
                        } else {
                            throw {
                                name: 'Error',
                                message: 'Expected an object when sorting by ' + name
                            };
                        }
                    } catch (err) {
                        utility.error("ERROR in inner function utility.sortBy: " + err);
                        return undefined;
                    }
                };
            } catch (err) {
                utility.error("ERROR in utility.sortBy: " + err);
                return undefined;
            }
        },

        sortObjectBy: function (obj, sortfunc, deep) {
            try {
                var list   = [],
                    output = {},
                    i      = 0,
                    j      = '',
                    len    = 0;

                deep = deep ? deep : false;
                for (j in obj) {
                    if (obj.hasOwnProperty(j)) {
                        list.push(j);
                    }
                }

                list.sort(sortfunc);
                for (i = 0, len = list.length; i < len; i += 1) {
                    if (deep && utility.isPlainObject(obj[list[i]])) {
                        output[list[i]] = utility.sortObjectBy(obj[list[i]], sortfunc, deep);
                    } else {
                        output[list[i]] = obj[list[i]];
                    }
                }

                return output;
            } catch (err) {
                utility.error("ERROR in utility.sortObjectBy: " + err);
                return undefined;
            }
        },

        makeTime: function (time, format) {
            try {
                var d = new Date(time);
                return d.format(format !== undefined && format ? format : 'l g:i a');
            } catch (err) {
                utility.error("ERROR in utility.makeTime: " + err);
                return undefined;
            }
        },

        minutes2hours : function (num) {
            try {
                num = utility.isNaN(num) ? 0 : num;
                num = utility.isString(num) ? num.parseFloat() : num;
                var h = Math.floor(num),
                    m = Math.floor((num - h) * 60),
                    s = h + ':' + (m < 10 ? '0' + m : m);

                return s;
            } catch (err) {
                utility.error("ERROR in utility.minutes2hours: " + err);
                return undefined;
            }
        },

        reload: function () {
            try {
                if (utility.isFunction(window.location.reload)) {
                    window.location.reload();
                } else if (utility.isFunction(history.go)) {
                    history.go(0);
                } else {
                    window.location.href = window.location.href;
                }

                return true;
            } catch (err) {
                utility.error("ERROR in utility.reload: " + err);
                return false;
            }
        },

        /*jslint bitwise: false */
        Aes: function (password, nBits, utf8encode) {
            try {
                utf8encode = (typeof utf8encode === 'undefined') ? true : utf8encode;
                password = utf8encode ? password.Utf8encode() : password;
                nBits = (nBits === 128 || nBits === 192 || nBits === 256) ? nBits : 256;
                var sBox = [
                        0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
                        0xca, 0x82, 0xc9, 0x7d, 0xfa, 0x59, 0x47, 0xf0, 0xad, 0xd4, 0xa2, 0xaf, 0x9c, 0xa4, 0x72, 0xc0,
                        0xb7, 0xfd, 0x93, 0x26, 0x36, 0x3f, 0xf7, 0xcc, 0x34, 0xa5, 0xe5, 0xf1, 0x71, 0xd8, 0x31, 0x15,
                        0x04, 0xc7, 0x23, 0xc3, 0x18, 0x96, 0x05, 0x9a, 0x07, 0x12, 0x80, 0xe2, 0xeb, 0x27, 0xb2, 0x75,
                        0x09, 0x83, 0x2c, 0x1a, 0x1b, 0x6e, 0x5a, 0xa0, 0x52, 0x3b, 0xd6, 0xb3, 0x29, 0xe3, 0x2f, 0x84,
                        0x53, 0xd1, 0x00, 0xed, 0x20, 0xfc, 0xb1, 0x5b, 0x6a, 0xcb, 0xbe, 0x39, 0x4a, 0x4c, 0x58, 0xcf,
                        0xd0, 0xef, 0xaa, 0xfb, 0x43, 0x4d, 0x33, 0x85, 0x45, 0xf9, 0x02, 0x7f, 0x50, 0x3c, 0x9f, 0xa8,
                        0x51, 0xa3, 0x40, 0x8f, 0x92, 0x9d, 0x38, 0xf5, 0xbc, 0xb6, 0xda, 0x21, 0x10, 0xff, 0xf3, 0xd2,
                        0xcd, 0x0c, 0x13, 0xec, 0x5f, 0x97, 0x44, 0x17, 0xc4, 0xa7, 0x7e, 0x3d, 0x64, 0x5d, 0x19, 0x73,
                        0x60, 0x81, 0x4f, 0xdc, 0x22, 0x2a, 0x90, 0x88, 0x46, 0xee, 0xb8, 0x14, 0xde, 0x5e, 0x0b, 0xdb,
                        0xe0, 0x32, 0x3a, 0x0a, 0x49, 0x06, 0x24, 0x5c, 0xc2, 0xd3, 0xac, 0x62, 0x91, 0x95, 0xe4, 0x79,
                        0xe7, 0xc8, 0x37, 0x6d, 0x8d, 0xd5, 0x4e, 0xa9, 0x6c, 0x56, 0xf4, 0xea, 0x65, 0x7a, 0xae, 0x08,
                        0xba, 0x78, 0x25, 0x2e, 0x1c, 0xa6, 0xb4, 0xc6, 0xe8, 0xdd, 0x74, 0x1f, 0x4b, 0xbd, 0x8b, 0x8a,
                        0x70, 0x3e, 0xb5, 0x66, 0x48, 0x03, 0xf6, 0x0e, 0x61, 0x35, 0x57, 0xb9, 0x86, 0xc1, 0x1d, 0x9e,
                        0xe1, 0xf8, 0x98, 0x11, 0x69, 0xd9, 0x8e, 0x94, 0x9b, 0x1e, 0x87, 0xe9, 0xce, 0x55, 0x28, 0xdf,
                        0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16
                    ],
                    rCon = [
                        [0x00, 0x00, 0x00, 0x00],
                        [0x01, 0x00, 0x00, 0x00],
                        [0x02, 0x00, 0x00, 0x00],
                        [0x04, 0x00, 0x00, 0x00],
                        [0x08, 0x00, 0x00, 0x00],
                        [0x10, 0x00, 0x00, 0x00],
                        [0x20, 0x00, 0x00, 0x00],
                        [0x40, 0x00, 0x00, 0x00],
                        [0x80, 0x00, 0x00, 0x00],
                        [0x1b, 0x00, 0x00, 0x00],
                        [0x36, 0x00, 0x00, 0x00]
                    ];

                function subBytes(s, Nb) {
                    var r = 0,
                        c = 0;

                    for (r = 0; r < 4; r += 1) {
                        for (c = 0; c < Nb; c += 1) {
                            s[r][c] = sBox[s[r][c]];
                        }
                    }

                    return s;
                }

                function shiftRows(s, Nb) {
                    var t = [],
                        r = 1,
                        c = 0;

                    for (r = 1; r < 4; r += 1) {
                        for (c = 0; c < 4; c += 1) {
                            t[c] = s[r][(c + r) % Nb];
                        }

                        for (c = 0; c < 4; c += 1) {
                            s[r][c] = t[c];
                        }
                    }

                    return s;
                }

                function mixColumns(s, Nb) {
                    var c = 0,
                        a = [],
                        b = [],
                        i = 0;

                    for (c = 0; c < 4; c += 1) {
                        a = [];
                        b = [];
                        for (i = 0; i < 4; i += 1) {
                            a[i] = s[i][c];
                            b[i] = s[i][c] & 0x80 ? s[i][c] << 1 ^ 0x011b : s[i][c] << 1;
                        }

                        s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
                        s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
                        s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
                        s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
                    }

                    return s;
                }

                function addRoundKey(state, w, rnd, Nb) {
                    var r = 0,
                        c = 0;

                    for (r = 0; r < 4; r += 1) {
                        for (c = 0; c < Nb; c += 1) {
                            state[r][c] ^= w[rnd * 4 + c][r];
                        }
                    }

                    return state;
                }

                function cipher(input, w) {
                    var Nb     = 4,
                        Nr     = w.length / Nb - 1,
                        state  = [[], [], [], []],
                        i      = 0,
                        round  = 1,
                        output = [];

                    for (i = 0; i < 4 * Nb; i += 1) {
                        state[i % 4][Math.floor(i / 4)] = input[i];
                    }

                    state = addRoundKey(state, w, 0, Nb);
                    for (round = 1; round < Nr; round += 1) {
                        state = subBytes(state, Nb);
                        state = shiftRows(state, Nb);
                        state = mixColumns(state, Nb);
                        state = addRoundKey(state, w, round, Nb);
                    }

                    state = subBytes(state, Nb);
                    state = shiftRows(state, Nb);
                    state = addRoundKey(state, w, Nr, Nb);
                    output = [];
                    for (i = 0; i < 4 * Nb; i += 1) {
                        output[i] = state[i % 4][Math.floor(i / 4)];
                    }

                    return output;
                }

                function subWord(w) {
                    var i = 0;
                    for (i = 0; i < 4; i += 1) {
                        w[i] = sBox[w[i]];
                    }

                    return w;
                }

                function rotWord(w) {
                    var tmp = w[0],
                        i   = 0;

                    for (i = 0; i < 3; i += 1) {
                        w[i] = w[i + 1];
                    }

                    w[3] = tmp;
                    return w;
                }

                function keyExpansion(key) {
                    var Nb   = 4,
                        Nk   = key.length / 4,
                        Nr   = Nk + 6,
                        w    = [],
                        temp = [],
                        i    = 0,
                        t    = 0;

                    for (i = 0; i < Nk; i += 1) {
                        w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
                    }

                    for (i = Nk; i < (Nb * (Nr + 1)); i += 1) {
                        w[i] = [];
                        for (t = 0; t < 4; t += 1) {
                            temp[t] = w[i - 1][t];
                        }

                        if (i % Nk === 0) {
                            temp = subWord(rotWord(temp));
                            for (t = 0; t < 4; t += 1) {
                                temp[t] ^= rCon[i / Nk][t];
                            }

                        } else if (Nk > 6 && i % Nk === 4) {
                            temp = subWord(temp);
                        }

                        for (t = 0; t < 4; t += 1) {
                            w[i][t] = w[i - Nk][t] ^ temp[t];
                        }
                    }

                    return w;
                }

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                this['encrypt'] = this.encrypt = function (plaintext) {
                /*jslint sub: false */
                    try {
                        plaintext = utf8encode ? plaintext.Utf8encode() : plaintext;
                        var blockSize    = 16,
                            nBytes       = nBits / 8,
                            pwBytes      = [],
                            i            = 0,
                            counterBlock = [],
                            nonce        = [],
                            nonceSec     = Math.floor(nonce / 1000),
                            nonceMs      = nonce % 1000,
                            key          = [],
                            ctrTxt       = '',
                            keySchedule  = [],
                            blockCount   = 0,
                            ciphertxt    = [],
                            b            = 0,
                            c            = 0,
                            cipherCntr   = [],
                            blockLength  = 0,
                            cipherChar   = [],
                            ciphertext   = '';

                        for (i = 0; i < nBytes; i += 1) {
                            pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
                        }

                        key = cipher(pwBytes, keyExpansion(pwBytes));
                        key = key.concat(key.slice(0, nBytes - 16));
                        for (i = 0; i < 4; i += 1) {
                            counterBlock[i] = (nonceSec >>> i * 8) & 0xff;
                        }

                        for (i = 0; i < 4; i += 1) {
                            counterBlock[i + 4] = nonceMs & 0xff;
                        }

                        for (i = 0; i < 8; i += 1) {
                            ctrTxt += String.fromCharCode(counterBlock[i]);
                        }

                        keySchedule = keyExpansion(key);
                        blockCount = Math.ceil(plaintext.length / blockSize);
                        ciphertxt = [];
                        for (b = 0; b < blockCount; b += 1) {
                            for (c = 0; c < 4; c += 1) {
                                counterBlock[15 - c] = (b >>> c * 8) & 0xff;
                            }

                            for (c = 0; c < 4; c += 1) {
                                counterBlock[15 - c - 4] = (b / 0x100000000 >>> c * 8);
                            }

                            cipherCntr = cipher(counterBlock, keySchedule);
                            blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
                            cipherChar = [];
                            for (i = 0; i < blockLength; i += 1) {
                                cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
                                cipherChar[i] = String.fromCharCode(cipherChar[i]);
                            }

                            ciphertxt[b] = cipherChar.join('');
                        }

                        ciphertext = ctrTxt + ciphertxt.join('');
                        ciphertext = ciphertext.Base64encode();
                        return ciphertext;
                    } catch (err) {
                        utility.error("ERROR in utility.Aes.encrypt: " + err);
                        return undefined;
                    }
                };

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                this['decrypt'] = this.decrypt = function (ciphertext) {
                /*jslint sub: false */
                    try {
                        ciphertext = ciphertext.Base64decode();
                        var blockSize    = 16,
                            nBytes       = nBits / 8,
                            pwBytes      = [],
                            i            = 0,
                            key          = [],
                            counterBlock = [],
                            ctrTxt       = [],
                            keySchedule  = [],
                            nBlocks      = 0,
                            ct           = [],
                            b            = 0,
                            plaintxt     = [],
                            c            = 0,
                            cipherCntr   = [],
                            plaintxtByte = [],
                            plaintext    = '';

                        for (i = 0; i < nBytes; i += 1) {
                            pwBytes[i] = isNaN(password.charCodeAt(i)) ? 0 : password.charCodeAt(i);
                        }

                        key = cipher(pwBytes, keyExpansion(pwBytes));
                        key = key.concat(key.slice(0, nBytes - 16));
                        counterBlock = [];
                        ctrTxt = ciphertext.slice(0, 8);
                        for (i = 0; i < 8; i += 1) {
                            counterBlock[i] = ctrTxt.charCodeAt(i);
                        }

                        keySchedule = keyExpansion(key);
                        nBlocks = Math.ceil((ciphertext.length - 8) / blockSize);
                        ct = [];
                        for (b = 0; b < nBlocks; b += 1) {
                            ct[b] = ciphertext.slice(8 + b * blockSize, 8 + b * blockSize + blockSize);
                        }

                        ciphertext = ct;
                        plaintxt = [];

                        for (b = 0; b < nBlocks; b += 1) {
                            for (c = 0; c < 4; c += 1) {
                                counterBlock[15 - c] = ((b) >>> c * 8) & 0xff;
                            }

                            for (c = 0; c < 4; c += 1) {
                                counterBlock[15 - c - 4] = (((b + 1) / 0x100000000 - 1) >>> c * 8) & 0xff;
                            }

                            cipherCntr = cipher(counterBlock, keySchedule);
                            plaintxtByte = []; // new Array(ciphertext[b].length);
                            for (i = 0; i < ciphertext[b].length; i += 1) {
                                plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
                                plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
                            }

                            plaintxt[b] = plaintxtByte.join('');
                        }

                        plaintext = plaintxt.join('');
                        plaintext = utf8encode ? plaintext.Utf8decode() : plaintext;
                        return plaintext;
                    } catch (err) {
                        utility.error("ERROR in utility.Aes.decrypt: " + err);
                        return undefined;
                    }
                };

                return true;
            } catch (err) {
                utility.error("ERROR in utility.Aes: " + err);
                return false;
            }
        },
        /*jslint bitwise: true */

        LZ77: function (settings) {
            try {
                settings = settings || {};
                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                var referencePrefix       = "`",
                    referenceIntBase      = settings['referenceIntBase'] || 96,
                    referenceIntFloorCode = " ".charCodeAt(0),
                    referenceIntCeilCode  = referenceIntFloorCode + referenceIntBase - 1,
                    maxStringDistance     = Math.pow(referenceIntBase, 2) - 1,
                    minStringLength       = settings['minStringLength'] || 5,
                    maxStringLength       = Math.pow(referenceIntBase, 1) - 1 + minStringLength,
                    defaultWindowLength   = settings['defaultWindowLength'] || 144,
                    maxWindowLength       = maxStringDistance + minStringLength;
                /*jslint sub: false */

                function encodeReferenceInt(value, width) {
                    if ((value >= 0) && (value < (Math.pow(referenceIntBase, width) - 1))) {
                        var encoded       = "",
                            i             = 0,
                            missingLength = 0,
                            mf            = Math.floor,
                            sc            = String.fromCharCode;

                        while (value > 0) {
                            encoded = sc((value % referenceIntBase) + referenceIntFloorCode) + encoded;
                            value = mf(value / referenceIntBase);
                        }

                        missingLength = width - encoded.length;
                        for (i = 0; i < missingLength; i += 1) {
                            encoded = sc(referenceIntFloorCode) + encoded;
                        }

                        return encoded;
                    } else {
                        throw "Reference int out of range: " + value + " (width = " + width + ")";
                    }
                }

                function encodeReferenceLength(length) {
                    return encodeReferenceInt(length - minStringLength, 1);
                }

                function decodeReferenceInt(data, width) {
                    var value    = 0,
                        i        = 0,
                        charCode = 0;

                    for (i = 0; i < width; i += 1) {
                        value *= referenceIntBase;
                        charCode = data.charCodeAt(i);
                        if ((charCode >= referenceIntFloorCode) && (charCode <= referenceIntCeilCode)) {
                            value += charCode - referenceIntFloorCode;
                        } else {
                            throw "Invalid char code in reference int: " + charCode;
                        }
                    }

                    return value;
                }

                function decodeReferenceLength(data) {
                    return decodeReferenceInt(data, 1) + minStringLength;
                }

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                this['compress'] = this.compress = function (data, windowLength) {
                /*jslint sub: false */
                    try {
                        windowLength = windowLength || defaultWindowLength;
                        if (windowLength > maxWindowLength) {
                            throw "Window length too large";
                        }

                        var compressed      = "",
                            pos             = 0,
                            lastPos         = data.length - minStringLength,
                            searchStart     = 0,
                            matchLength     = 0,
                            foundMatch      = false,
                            bestMatch       = {},
                            newCompressed   = null,
                            realMatchLength = 0,
                            mm              = Math.max,
                            dataCharAt      = 0;

                        while (pos < lastPos) {
                            searchStart = mm(pos - windowLength, 0);
                            matchLength = minStringLength;
                            foundMatch = false;
                            bestMatch = {
                                distance : maxStringDistance,
                                length   : 0
                            };

                            newCompressed = null;
                            while ((searchStart + matchLength) < pos) {
                                if ((matchLength < maxStringLength) && (data.substr(searchStart, matchLength) === data.substr(pos, matchLength))) {
                                    matchLength += 1;
                                    foundMatch = true;
                                } else {
                                    realMatchLength = matchLength - 1;
                                    if (foundMatch && (realMatchLength > bestMatch.length)) {
                                        bestMatch.distance = pos - searchStart - realMatchLength;
                                        bestMatch.length = realMatchLength;
                                    }

                                    matchLength = minStringLength;
                                    searchStart += 1;
                                    foundMatch = false;
                                }
                            }

                            if (bestMatch.length) {
                                newCompressed = referencePrefix + encodeReferenceInt(bestMatch.distance, 2) + encodeReferenceLength(bestMatch.length);
                                pos += bestMatch.length;
                            } else {
                                dataCharAt = data.charAt(pos);
                                if (dataCharAt !== referencePrefix) {
                                    newCompressed = dataCharAt;
                                } else {
                                    newCompressed = referencePrefix + referencePrefix;
                                }

                                pos += 1;
                            }

                            compressed += newCompressed;
                        }

                        return compressed + data.slice(pos).replace(/`/g, "``");
                    } catch (err) {
                        utility.error("ERROR in utility.LZ77.compress: " + err);
                        return undefined;
                    }
                };

                /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
                /*jslint sub: true */
                this['decompress'] = this.decompress = function (data) {
                /*jslint sub: false */
                    try {
                        var decompressed = "",
                            pos          = 0,
                            currentChar  = '',
                            nextChar     = '',
                            distance     = 0,
                            length       = 0,
                            minStrLength = minStringLength - 1,
                            dataLength   = data.length,
                            posPlusOne   = 0;

                        while (pos < dataLength) {
                            currentChar = data.charAt(pos);
                            if (currentChar !== referencePrefix) {
                                decompressed += currentChar;
                                pos += 1;
                            } else {
                                posPlusOne = pos + 1;
                                nextChar = data.charAt(posPlusOne);
                                if (nextChar !== referencePrefix) {
                                    distance = decodeReferenceInt(data.substr(posPlusOne, 2), 2);
                                    length = decodeReferenceLength(data.charAt(pos + 3));
                                    decompressed += decompressed.substr(decompressed.length - distance - length, length);
                                    pos += minStrLength;
                                } else {
                                    decompressed += referencePrefix;
                                    pos += 2;
                                }
                            }
                        }

                        return decompressed;
                    } catch (err) {
                        utility.error("ERROR in utility.LZ77.decompress: " + err);
                        return undefined;
                    }
                };

                return true;
            } catch (err) {
                utility.error("ERROR in utility.LZ77: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        storage: function (settings) {
            try {
                settings = settings || {};
                var namespace = settings['namespace'] ? settings['namespace'] : '',
                    fireFoxUseGM = settings['fireFoxUseGM'] ? settings['fireFoxUseGM'] : (!utility.localStorage && utility.is_firefox ? true : false),
                    useRison = settings['useRison'] ? settings['useRison'] : (utility.isUndefined(rison) ? false : true),
                    storage_id = settings['storage_id'] ? settings['storage_id'] : '',
                    storage_type = settings['storage_type'] ? settings['storage_type'] : 'localStorage';

                this['set_namespace'] = this.set_namespace = function (text) {
                    namespace = utility.isString(text) ? text : (utility.isNumber(text) ? text.toString() : '');
                };

                this['get_namespace'] = this.get_namespace = function () {
                    return namespace;
                };

                this['set_storage_id'] = this.set_storage_id = function (text) {
                    storage_id = utility.isString(text) ? text : (utility.isNumber(text) ? text.toString() : '');
                };

                this['get_storage_id'] = this.get_storage_id = function () {
                    return storage_id;
                };

                this['set_fireFoxUseGM'] = this.set_fireFoxUseGM = function (enable) {
                    fireFoxUseGM = utility.isBoolean(enable) ? enable : false;
                };

                this['get_fireFoxUseGM'] = this.get_fireFoxUseGM = function () {
                    return fireFoxUseGM;
                };

                this['set_useRison'] = this.set_useRison = function (enable) {
                    useRison = utility.isBoolean(enable) ? enable : true;
                };

                this['get_useRison'] = this.get_useRison = function () {
                    return useRison;
                };

                // use these to set/get values in a way that prepends the game's name
                this['setItem'] = this.setItem = function (name, value, hpack, compress) {
                    try {
                        name = utility.isString(name) ? name : (utility.isNumber(name) ? name.toString() : '');
                        if (!utility.hasContent(name)) {
                            throw "Invalid identifying name! (" + name + ")";
                        }

                        if (!utility.isDefined(value)) {
                            throw "Value supplied is 'undefined' or 'null'! (" + value + ")";
                        }

                        var stringified = '',
                            compressor  = null,
                            storageStr  = '',
                            hpackArr    = [],
                            reportEnc   = 'JSON.stringify',
                            storage_ref = (namespace ? namespace + "." : '') + (storage_id ? storage_id + "." : '');

                        if (useRison) {
                            reportEnc = "rison.encode";
                        }

                        hpack = utility.isNumber(hpack) ? hpack : false;
                        if (hpack !== false && hpack >= 0 && hpack <= 3) {
                            hpackArr = JSON.hpack(value, hpack);
                            hpackArr = utility.isArray(hpackArr) ? hpackArr : [];
                            if (useRison) {
                                stringified = rison.encode(hpackArr);
                            } else {
                                stringified = JSON.stringify(hpackArr);
                            }

                            if (!utility.isDefined(stringified)) {
                                throw reportEnc + " returned 'undefined' or 'null'! (" + stringified + ")";
                            }

                            if (useRison) {
                                stringified = "R-HPACK " + stringified;
                            } else {
                                stringified = "HPACK " + stringified;
                            }
                        } else {
                            if (useRison) {
                                stringified = rison.encode(value);
                            } else {
                                stringified = JSON.stringify(value);
                            }

                            if (!utility.isDefined(stringified)) {
                                throw reportEnc + " returned 'undefined' or 'null'! (" + stringified + ")";
                            }

                            if (useRison) {
                                stringified = "RISON " + stringified;
                            }
                        }

                        compress = utility.isBoolean(compress) ? compress : false;
                        if (compress) {
                            compressor = new utility.LZ77();
                            storageStr = "LZ77 " + compressor.compress(stringified);
                            utility.log(2, "Compressed storage", name, ((storageStr.length / stringified.length) * 100).dp(2));
                        } else {
                            storageStr = stringified;
                        }

                        if (utility[storage_type] && !fireFoxUseGM) {
                            window[storage_type].setItem(storage_ref + name, storageStr);
                        } else {
                            /*jslint newcap: false */
                            GM_setValue(storage_ref + name, storageStr);
                            /*jslint newcap: true */
                        }

                        return value;
                    } catch (error) {
                        utility.error("ERROR in utility.storage.setItem: " + error, {'name': name, 'value': value});
                        return undefined;
                    }
                };

                this['getItem'] = this.getItem = function (name, value, hidden) {
                    try {
                        name = utility.isString(name) ? name : (utility.isNumber(name) ? name.toString() : '');
                        if (!utility.hasContent(name)) {
                            throw "Invalid identifying name! (" + name + ")";
                        }

                        var jsObj       = null,
                            compressor  = null,
                            storageStr  = '',
                            storage_ref = (namespace ? namespace + "." : '') + (storage_id ? storage_id + "." : '');

                        if (utility[storage_type] && !fireFoxUseGM) {
                            storageStr = window[storage_type].getItem(storage_ref + name);
                        } else {
                            /*jslint newcap: false */
                            storageStr = GM_getValue(storage_ref + name);
                            /*jslint newcap: true */
                        }

                        if (utility.isString(storageStr)) {
                            if (storageStr.match(/^LZ77 /)) {
                                compressor = new utility.LZ77();
                                storageStr = compressor.decompress(storageStr.slice(5));
                                utility.log(2, "Decompressed storage", name);
                            }

                            if (utility.isString(storageStr)) {
                                if (storageStr.match(/^R-HPACK /)) {
                                    jsObj = JSON.hunpack(rison.decode(storageStr.slice(8)));
                                } else if (storageStr.match(/^RISON /)) {
                                    jsObj = rison.decode(storageStr.slice(6));
                                } else if (storageStr.match(/^HPACK /)) {
                                    jsObj = JSON.hunpack(JSON.parse(storageStr.slice(6)));
                                } else {
                                    jsObj = JSON.parse(storageStr);
                                }
                            }
                        }

                        if (!utility.isDefined(jsObj)) {
                            if (!hidden) {
                                utility.warn("utility.storage.getItem parsed string returned 'undefined' or 'null' for ", name);
                            }

                            if (utility.isDefined(value)) {
                                hidden = utility.isBoolean(hidden) ? hidden : false;
                                if (!hidden) {
                                    utility.warn("utility.storage.getItem using default value ", value);
                                }

                                jsObj = value;
                            } else {
                                throw "No default value supplied! (" + value + ")";
                            }
                        }

                        return jsObj;
                    } catch (error) {
                        utility.error("ERROR in utility.storage.getItem: " + error);
                        if (error.match(/Invalid JSON/)) {
                            if (utility.isString(name) && utility.hasContent(name) && utility.isDefined(value)) {
                                utility.storage.setItem(name, value);
                                return value;
                            } else if (utility.isString(name) && utility.hasContent(name)) {
                                utility.storage.deleteItem(name);
                            }
                        }

                        return undefined;
                    }
                };

                this['deleteItem'] = this.deleteItem = function (name) {
                    try {
                        name = utility.isString(name) ? name : (utility.isNumber(name) ? name.toString() : '');
                        if (!utility.hasContent(name)) {
                            throw "Invalid identifying name! (" + name + ")";
                        }

                        var storage_ref = (namespace ? namespace + "." : '') + (storage_id ? storage_id + "." : '');
                        if (utility[storage_type] && !fireFoxUseGM) {
                            window[storage_type].removeItem(storage_ref + name);
                        } else {
                            /*jslint newcap: false */
                            GM_deleteValue(storage_ref + name);
                            /*jslint newcap: true */
                        }

                        return true;
                    } catch (error) {
                        utility.error("ERROR in utility.storage.deleteItem: " + error);
                        return false;
                    }
                };

                this['clear'] = this.clear = function (id) {
                    try {
                        id = utility.isString(id) ? id : (utility.isNumber(id) ? id.toString() : '');
                        var storageKeys = [],
                            key         = 0,
                            len         = 0,
                            done        = false,
                            storage_ref = (namespace ? namespace + "." : '') + (id ? id : (storage_id ? storage_id + "." : '')),
                            nameRegExp  = new RegExp(storage_ref);

                        if (utility[storage_type] && !fireFoxUseGM) {
                            if (utility.is_firefox) {
                                while (!done) {
                                    try {
                                        if (window[storage_type].key(key) && window[storage_type].key(key).match(nameRegExp)) {
                                            window[storage_type].removeItem(window[storage_type].key(key));
                                        }

                                        key += 1;
                                    } catch (e) {
                                        done = true;
                                    }
                                }
                            } else {
                                for (key = 0, len = window[storage_type].length; key < len; key += 1) {
                                    if (window[storage_type].key(key) && window[storage_type].key(key).match(nameRegExp)) {
                                        window[storage_type].removeItem(window[storage_type].key(key));
                                    }
                                }
                            }
                        } else {
                            /*jslint newcap: false */
                            storageKeys = GM_listValues();
                            /*jslint newcap: true */
                            for (key = 0, len = storageKeys.length; key < len; key += 1) {
                                if (storageKeys[key] && storageKeys[key].match(nameRegExp)) {
                                    /*jslint newcap: false */
                                    GM_deleteValue(storageKeys[key]);
                                    /*jslint newcap: true */
                                }
                            }
                        }

                        return true;
                    } catch (error) {
                        utility.error("ERROR in utility.storage.clear: " + error);
                        return false;
                    }
                };

                this['used'] = this.used = function (id) {
                    try {
                        id = utility.isString(id) ? id : (utility.isNumber(id) ? id.toString() : '');
                        var storageKeys = [],
                            key         = 0,
                            len         = 0,
                            charCnt     = 0,
                            chars       = 0,
                            ffmode      = false,
                            done        = false,
                            storage_ref = (namespace ? namespace + "." : '') + (id ? id : (storage_id ? storage_id + "." : '')),
                            nameRegExp  = new RegExp(storage_ref);

                        if (utility[storage_type] && !fireFoxUseGM) {
                            if (utility.is_firefox) {
                                while (!done) {
                                    try {
                                        chars += window[storage_type].getItem(window[storage_type].key(key)).length;
                                        if (window[storage_type].key(key).match(nameRegExp)) {
                                            charCnt += window[storage_type].getItem(window[storage_type].key(key)).length;
                                        }

                                        key += 1;
                                    } catch (e) {
                                        done = true;
                                    }
                                }

                            } else {
                                for (key = 0, len = window[storage_type].length; key < len; key += 1) {
                                    chars += window[storage_type].getItem(window[storage_type].key(key)).length;
                                    if (window[storage_type].key(key).match(nameRegExp)) {
                                        charCnt += window[storage_type].getItem(window[storage_type].key(key)).length;
                                    }
                                }
                            }
                        } else {
                            ffmode = true;
                            /*jslint newcap: false */
                            storageKeys = GM_listValues();
                            /*jslint newcap: true */
                            for (key = 0, len = storageKeys.length; key < len; key += 1) {
                                /*jslint newcap: false */
                                chars += GM_getValue(storageKeys[key]).length;
                                /*jslint newcap: true */
                                if (storageKeys[key] && storageKeys[key].match(nameRegExp)) {
                                    /*jslint newcap: false */
                                    charCnt += GM_getValue(storageKeys[key]).length;
                                    /*jslint newcap: true */
                                }
                            }
                        }

                        return {'ffmode': ffmode, 'match': charCnt, 'total': chars};
                    } catch (error) {
                        utility.error("ERROR in utility.storage.used: " + error);
                        return undefined;
                    }
                };

                return true;
            } catch (err) {
                utility.error("ERROR in utility.storage: " + err);
                return false;
            }
        },

        cutSharp: function (h) {
            try {
                h = utility.hasContent(h) ? (h.charAt(0) === "#" ? h.slice(1) : h) : '';
                return h;
            } catch (err) {
                utility.error("ERROR in utility.cutSharp: " + err);
                return undefined;
            }
        },

        addSharp: function (h) {
            try {
                h = h.charAt(0) === "#" ? h : "#" + h;
                return h;
            } catch (err) {
                utility.error("ERROR in utility.addSharp: " + err);
                return undefined;
            }
        },

        hex2rgb: function (h) {
            try {
                h = utility.cutSharp(h);
                h = h.length === 3 ? h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2) : h.rpad('0', 6);
                var r = h.slice(0, 2).parseInt(16),
                    g = h.slice(2, 4).parseInt(16),
                    b = h.slice(4, 6).parseInt(16);

                return {'r': r, 'g': g, 'b': b};
            } catch (err) {
                utility.error("ERROR in utility.hex2rgb: " + err);
                return undefined;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        brightness: function (h) {
            try {
                var rgb = utility.hex2rgb(h);
                return (rgb['r'] * 299 + rgb['g'] * 587 + rgb['b'] * 114) / 1000;
            } catch (err) {
                utility.error("ERROR in utility.brightness: " + err);
                return undefined;
            }
        },
        /*jslint sub: false */

        dec2hex: function (n) {
            try {
                if (n < 0) {
                    n = 0xFFFFFFFF + n + 1;
                }

                return n.toString(16).toUpperCase();
            } catch (err) {
                utility.error("ERROR in utility.dec2hex: " + err);
                return undefined;
            }
        },

        hex2dec: function (h) {
            try {
                return utility.cutSharp(h).parseInt(16);
            } catch (err) {
                utility.error("ERROR in utility.hex2dec: " + err);
                return undefined;
            }
        },

        bestTextColor: function (h, d, l) {
            try {
                var r = '';
                if (utility.brightness(h) <= 125) {
                    r = l ? l : '#FFFFFF';
                } else {
                    r = d ? d : '#000000';
                }

                return r;
            } catch (err) {
                utility.error("ERROR in utility.bestTextColor: " + err);
                return undefined;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        ColorConv: function (options) {
            try {
                var h = '#000000',
                    d = 0,
                    r = {'r': 0, 'g': 0, 'b': 0},
                    o = utility.isObject(options) ? options : {};

                this['setOpt'] = this.setOpt = function (opt) {
                    o = utility.isObject(opt) ? opt : {};
                };

                this['getOpt'] = this.getOpt = function () {
                    return o;
                };

                this['setHex'] = this.setHex = function (hex) {
                    h = utility.addSharp(hex);
                    d = utility.hex2dec(hex);
                    r = utility.hex2rgb(hex);
                };

                this['getHex'] = this.getHex = function () {
                    return h;
                };

                this['setDec'] = this.setDec = function (dec) {
                    h = utility.addSharp(utility.dec2hex(dec));
                    d = dec;
                    r = utility.hex2rgb(h);
                };

                this['getDec'] = this.getDec = function () {
                    return d;
                };

                this['setRgb'] = this.setRgb = function (rgb) {
                    var t;
                    if (utility.isObject(rgb)) {
                        r = rgb;
                    } else if (utility.isString(rgb)) {
                        t = rgb.regex(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
                        r = utility.hasContent(t) && t.length === 3 ? {'r': t[0], 'g': t[1], 'b': t[2]} : {'r': 0, 'g': 0, 'b': 0};
                    }

                    function padHex(p) {
                        return p.length === 1 ? '0' + p : p;
                    }

                    h = utility.addSharp(padHex(utility.dec2hex(r['r'])) + padHex(utility.dec2hex(r['g'])) + padHex(utility.dec2hex(r['b'])));
                    d = utility.hex2dec(h);
                };

                this['getRgb'] = this.getRgb = function () {
                    if (o['rgb'] === 'string') {
                        return "rgb(" + r['r'] + "," + r['g'] + "," + r['b'] + ")";
                    } else {
                        return h;
                    }
                };
            } catch (err) {
                utility.error("ERROR in utility.ColorConv: " + err);
            }
        },
        /*jslint sub: false */

        ///////////////////////////
        //       owl
        ///////////////////////////

        /* This file is part of OWL JavaScript Utilities.

        OWL JavaScript Utilities is free software: you can redistribute it and/or
        modify it under the terms of the GNU Lesser General Public License
        as published by the Free Software Foundation, either version 3 of
        the License, or (at your option) any later version.

        OWL JavaScript Utilities is distributed in the hope that it will be useful,
        but WITHOUT ANY WARRANTY; without even the implied warranty of
        MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
        GNU Lesser General Public License for more details.

        You should have received a copy of the GNU Lesser General Public
        License along with OWL JavaScript Utilities.  If not, see
        <http://www.gnu.org/licenses/>.
        */

        owl: (function () {
            // the re-usable constructor function used by clone().
            function Clone() {}

            // clone objects, skip other types.
            function clone(target) {
                if (typeof target === 'object') {
                    Clone.prototype = target;
                    return new Clone();
                } else {
                    return target;
                }
            }

            // Shallow Copy
            function copy(target) {
                var value,
                    c,
                    property;

                if (typeof target !== 'object') {
                    return target;  // non-object have value sematics, so target is already a copy.
                } else {
                    value = target.valueOf();
                    if (target !== value) {
                        // the object is a standard object wrapper for a native type, say String.
                        // we can make a copy by instantiating a new object around the value.
                        return new target.constructor(value);
                    } else {
                        // ok, we have a normal object. If possible, we'll clone the original's prototype
                        // (not the original) to get an empty object with the same prototype chain as
                        // the original.  If just copy the instance properties.  Otherwise, we have to
                        // copy the whole thing, property-by-property.
                        if (target instanceof target.constructor && target.constructor !== Object) {
                            c = clone(target.constructor.prototype);

                            // give the copy all the instance properties of target.  It has the same
                            // prototype as target, so inherited properties are already there.
                            for (property in target) {
                                if (target.hasOwnProperty(property)) {
                                    c[property] = target[property];
                                }
                            }
                        } else {
                            c = {};
                            for (property in target) {
                                if (target.hasOwnProperty(property)) {
                                    c[property] = target[property];
                                }
                            }
                        }

                        return c;
                    }
                }
            }

            // Deep Copy
            var deepCopiers = [];

            function DeepCopier(config) {
                var key;
                for (key in config ) {
                    if (config.hasOwnProperty(key)) {
                        this[key] = config[key];
                    }
                }
            }

            DeepCopier.prototype = {
                constructor: DeepCopier,

                // determines if this DeepCopier can handle the given object.
                canCopy: function (source) {
                    return false;
                },

                // starts the deep copying process by creating the copy object.  You
                // can initialize any properties you want, but you can't call recursively
                // into the DeeopCopyAlgorithm.
                create: function (source) {},

                // Completes the deep copy of the source object by populating any properties
                // that need to be recursively deep copied.  You can do this by using the
                // provided deepCopyAlgorithm instance's deepCopy() method.  This will handle
                // cyclic references for objects already deepCopied, including the source object
                // itself.  The "result" passed in is the object returned from create().
                populate: function (deepCopyAlgorithm, source, result) {}
            };

            function DeepCopyAlgorithm() {
                // copiedObjects keeps track of objects already copied by this
                // deepCopy operation, so we can correctly handle cyclic references.
                this.copiedObjects = [];
                var thisPass = this;
                this.recursiveDeepCopy = function (source) {
                    return thisPass.deepCopy(source);
                };

                this.depth = 0;
            }

            DeepCopyAlgorithm.prototype = {
                constructor: DeepCopyAlgorithm,

                maxDepth: 256,

                // add an object to the cache.  No attempt is made to filter duplicates;
                // we always check getCachedResult() before calling it.
                cacheResult: function (source, result) {
                    this.copiedObjects.push([source, result]);
                },

                // Returns the cached copy of a given object, or undefined if it's an
                // object we haven't seen before.
                getCachedResult: function (source) {
                    var copiedObjects = this.copiedObjects,
                        length = copiedObjects.length,
                        i = 0;

                    for (i = 0; i < length; i += 1) {
                        if (copiedObjects[i][0] === source) {
                            return copiedObjects[i][1];
                        }
                    }

                    return undefined;
                },

                // deepCopy handles the simple cases itself: non-objects and object's we've seen before.
                // For complex cases, it first identifies an appropriate DeepCopier, then calls
                // applyDeepCopier() to delegate the details of copying the object to that DeepCopier.
                deepCopy: function (source) {
                    // null is a special case: it's the only value of type 'object' without properties.
                    if (source === null) {
                        return null;
                    }

                    // All non-objects use value semantics and don't need explict copying.
                    if (typeof source !== 'object') {
                        return source;
                    }

                    var cachedResult = this.getCachedResult(source),
                        i = 0,
                        deepCopier;

                    // we've already seen this object during this deep copy operation
                    // so can immediately return the result.  This preserves the cyclic
                    // reference structure and protects us from infinite recursion.
                    if (cachedResult) {
                        return cachedResult;
                    }

                    // objects may need special handling depending on their class.  There is
                    // a class of handlers call "DeepCopiers"  that know how to copy certain
                    // objects.  There is also a final, generic deep copier that can handle any object.
                    for (i = 0; i < deepCopiers.length; i += 1) {
                        deepCopier = deepCopiers[i];
                        if (deepCopier.canCopy(source)) {
                            return this.applyDeepCopier(deepCopier, source);
                        }
                    }

                    // the generic copier can handle anything, so we should never reach this line.
                    throw new Error("no DeepCopier is able to copy " + source);
                },

                // once we've identified which DeepCopier to use, we need to call it in a very
                // particular order: create, cache, populate.  This is the key to detecting cycles.
                // We also keep track of recursion depth when calling the potentially recursive
                // populate(): this is a fail-fast to prevent an infinite loop from consuming all
                // available memory and crashing or slowing down the browser.
                applyDeepCopier: function (deepCopier, source) {
                    // Start by creating a stub object that represents the copy.
                    var result = deepCopier.create(source);

                    // we now know the deep copy of source should always be result, so if we encounter
                    // source again during this deep copy we can immediately use result instead of
                    // descending into it recursively.
                    this.cacheResult(source, result);

                    // only DeepCopier::populate() can recursively deep copy.  So, to keep track
                    // of recursion depth, we increment this shared counter before calling it,
                    // and decrement it afterwards.
                    this.depth += 1;
                    if (this.depth > this.maxDepth) {
                        throw new Error("Exceeded max recursion depth in deep copy.");
                    }

                    // It's now safe to let the deepCopier recursively deep copy its properties.
                    deepCopier.populate(this.recursiveDeepCopy, source, result);

                    this.depth -= 1;

                    return result;
                }
            };

            // entry point for deep copy.
            //   source is the object to be deep copied.
            //   maxDepth is an optional recursion limit. Defaults to 256.
            function deepCopy(source, maxDepth) {
                var deepCopyAlgorithm = new DeepCopyAlgorithm();
                if (maxDepth) {
                    deepCopyAlgorithm.maxDepth = maxDepth;
                }

                return deepCopyAlgorithm.deepCopy(source);
            }

            // publicly expose the DeepCopier class.
            deepCopy.DeepCopier = DeepCopier;

            // publicly expose the list of deepCopiers.
            deepCopy.deepCopiers = deepCopiers;

            // make deepCopy() extensible by allowing others to
            // register their own custom DeepCopiers.
            deepCopy.register = function (deepCopier) {
                if (!(deepCopier instanceof DeepCopier)) {
                    deepCopier = new DeepCopier(deepCopier);
                }

                deepCopiers.unshift(deepCopier);
            };

            // Generic Object copier
            // the ultimate fallback DeepCopier, which tries to handle the generic case.  This
            // should work for base Objects and many user-defined classes.
            deepCopy.register({
                canCopy: function (source) {
                    return true;
                },

                create: function (source) {
                    if (source instanceof source.constructor) {
                        return clone(source.constructor.prototype);
                    } else {
                        return {};
                    }
                },

                populate: function (deepCopy, source, result) {
                    for (var key in source) {
                        if (source.hasOwnProperty(key)) {
                            result[key] = deepCopy(source[key]);
                        }
                    }

                    return result;
                }
            });

            // Array copier
            deepCopy.register({
                canCopy: function (source) {
                    return (source instanceof Array);
                },

                create: function (source) {
                    return new source.constructor();
                },

                populate: function (deepCopy, source, result) {
                    for (var i = 0; i < source.length; i += 1) {
                        result.push(deepCopy(source[i]));
                    }

                    return result;
                }
            });

            // Date copier
            deepCopy.register({
                canCopy: function (source) {
                    return (source instanceof Date);
                },

                create: function (source) {
                    return new Date(source);
                }
            });

            // HTML DOM Node

            // utility function to detect Nodes.  In particular, we're looking
            // for the cloneNode method.  The global document is also defined to
            // be a Node, but is a special case in many ways.
            function isNode(source) {
                if (window.Node) {
                    return source instanceof window.Node;
                } else {
                    // the document is a special Node and doesn't have many of
                    // the common properties so we use an identity check instead.
                    if (source === document) {
                        return true;
                    }

                    return typeof source.nodeType === 'number' && source.attributes && source.childNodes && source.cloneNode;
                }
            }

            // Node copier
            deepCopy.register({
                canCopy: function (source) {
                    return isNode(source);
                },

                create: function (source) {
                    // there can only be one (document).
                    if (source === document) {
                        return document;
                    }

                    // start with a shallow copy.  We'll handle the deep copy of
                    // its children ourselves.
                    return source.cloneNode(false);
                },

                populate: function (deepCopy, source, result) {
                    // we're not copying the global document, so don't have to populate it either.
                    if (source === document) {
                        return document;
                    }

                    var i = 0,
                        childCopy;

                    // if this Node has children, deep copy them one-by-one.
                    if (source.childNodes && source.childNodes.length) {
                        for (i = 0; i < source.childNodes.length; i += 1) {
                            childCopy = deepCopy(source.childNodes[i]);
                            result.appendChild(childCopy);
                        }
                    }

                    return undefined;
                }
            });

            // jQuery copier
            deepCopy.register({
                canCopy: function (source) {
                    return (source instanceof jQuery);
                },

                create: function (source) {
                    return new source.constructor();
                },

                populate: function (deepCopy, source, result) {
                    utility.extend(true, result, source);

                    return result;
                }
            });

            return {
                DeepCopyAlgorithm: DeepCopyAlgorithm,
                copy: copy,
                clone: clone,
                deepCopy: deepCopy
            };
        }())
    };

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    (function (props) {
        var i      = 0,
            bool   = false,
            len    = props.length,
            f      = document.createElement("input"),
            defaultView;

        for (i = 0; i < len ; i += 1) {
            f.setAttribute('type', props[i]);
            bool = f.type !== 'text';
            // Chrome likes to falsely purport support, so we feed it a textual value;
            // if that doesnt succeed then we know there's a custom UI
            if (bool) {
                f.value = ":)";
                if (/^range$/.test(f.type) && f.style.WebkitAppearance !== undefined) {
                    document.documentElement.appendChild(f);
                    defaultView = document.defaultView;
                    // Safari 2-4 allows the smiley as a value, despite making a slider
                    // Mobile android web browser has false positive, so must
                    // check the height to see if the widget is actually there.
                    bool = defaultView.getComputedStyle && defaultView.getComputedStyle(f, null).WebkitAppearance !== 'textfield' && (f.offsetHeight !== 0);
                    document.documentElement.removeChild(f);
                /*
                } else if (/^(search|tel)$/.test(f.type)) {
                    // Spec doesnt define any special parsing or detectable UI
                    //   behaviors so we pass these through as true
                    // Interestingly, opera fails the earlier test, so it doesn't
                    //  even make it here.
                */
                } else if (/^(url|email)$/.test(f.type)) {
                    // Real url and email support comes with prebaked validation.
                    bool = f.checkValidity && f.checkValidity() === false;
                } else {
                    // If the upgraded input compontent rejects the :) text, we got a winner
                    bool = f.value !== ":)";
                }
            }

            utility.inputtypes[props[i]] = !!bool;
        }
    }('search tel url email datetime date month week time datetime-local number range color'.split(' ')));

    utility.localStorage = ('localStorage' in window) && utility.type(window['localStorage']) === 'object';
    utility.sessionStorage = ('sessionStorage' in window) && utility.type(window['sessionStorage']) === 'object';
    utility['version'] = utility.version;
    utility['is_chrome'] = utility.is_chrome;
    utility['is_firefox'] = utility.is_firefox;
    utility['is_opera'] = utility.is_opera;
    utility['is_safari'] = utility.is_safari;
    utility['localStorage'] = utility.localStorage;
    utility['sessionStorage'] = utility.sessionStorage;
    utility['inputtypes'] = utility.inputtypes;
    utility['injectScript'] = utility.injectScript;
    utility['plural'] = utility.plural;
    utility['deleteElement'] = utility.deleteElement;
    utility['set_log_version'] = utility.set_log_version;
    utility['get_log_version'] = utility.get_log_version;
    utility['set_log_level'] = utility.set_log_level;
    utility['get_log_level'] = utility.get_log_level;
    utility['extend'] = utility.extend;
    utility['log_common'] = utility.log_common;
    utility['log'] = utility.log;
    utility['warn'] = utility.warn;
    utility['error'] = utility.error;
    utility['sortBy'] = utility.sortBy;
    utility['sortObjectBy'] = utility.sortObjectBy;
    utility['Aes'] = utility.Aes;
    utility['LZ77'] = utility.LZ77;
    utility['storage'] = utility.storage;
    utility['class2type'] = utility.class2type;
    utility['type'] = utility.type;
    utility['isNaN'] = utility.isNaN;
    utility['isPlainObject'] = utility.isPlainObject;
    utility['isEmptyObject'] = utility.isEmptyObject;
    utility['isWindow'] = utility.isWindow;
    utility['isArray'] = utility.isArray;
    utility['isObject'] = utility.isObject;
    utility['isBoolean'] = utility.isBoolean;
    utility['isFunction'] = utility.isFunction;
    utility['isDate'] = utility.isDate;
    utility['isRegExp'] = utility.isRegExp;
    utility['isNumber'] = utility.isNumber;
    utility['isString'] = utility.isString;
    utility['isUndefined'] = utility.isUndefined;
    utility['isNull'] = utility.isNull;
    utility['isDefined'] = utility.isDefined;
    utility['hasContent'] = utility.hasContent;
    utility['setContent'] = utility.setContent;
    utility['makeTime'] = utility.makeTime;
    utility['minutes2hours'] = utility.minutes2hours;
    utility['reload'] = utility.reload;
    utility['hex2rgb'] = utility.hex2rgb;
    utility['dec2hex'] = utility.dec2hex;
    utility['hex2dec'] = utility.hex2dec;
    utility['cutSharp'] = utility.cutSharp;
    utility['addSharp'] = utility.addSharp;
    utility['brightness'] = utility.brightness;
    utility['bestTextColor'] = utility.bestTextColor;
    utility['ColorConv'] = utility.ColorConv;
    utility['owl'] = utility.owl;
    utility['owl']['DeepCopyAlgorithm'] = utility.owl.DeepCopyAlgorithm;
    utility['owl']['copy'] = utility.owl.copy;
    utility['owl']['clone'] = utility.owl.clone;
    utility['owl']['deepCopy'] = utility.owl.deepCopy;

    if (!window['utility']) {
        window['utility'] = window.utility = window['$u'] = window.$u = utility;
    }
    /*jslint sub: false */
}());
