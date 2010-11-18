
////////////////////////////////////////////////////////////////////
//                          utility OBJECT
// Small functions called a lot to reduce duplicate code
/////////////////////////////////////////////////////////////////////

utility = {
    is_chrome               : navigator.userAgent.toLowerCase().indexOf('chrome') !== -1 ? true : false,

    is_firefox              : navigator.userAgent.toLowerCase().indexOf('firefox') !== -1  ? true : false,

    is_html5_localStorage   : ('localStorage' in window) && window.localStorage !== null,

    is_html5_sessionStorage : ('sessionStorage' in window) && window.sessionStorage !== null,

    waitMilliSecs: 10000,

    VisitUrl: function (url, loadWaitTime) {
        try {
            caap.waitMilliSecs = (loadWaitTime) ? loadWaitTime : 10000;
            window.location.href = url;
            return true;
        } catch (err) {
            this.error("ERROR in utility.VisitUrl: " + err);
            return false;
        }
    },

    Click: function (obj, loadWaitTime) {
        try {
            if (!obj) {
                throw 'Null object passed to Click';
            }

            if (caap.waitingForDomLoad === false) {
                schedule.setItem('clickedOnSomething', 0);
                caap.waitingForDomLoad = true;
            }

            caap.waitMilliSecs = loadWaitTime ? loadWaitTime : 10000;
            var evt = document.createEvent("MouseEvents");
            evt.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            /*
            Return Value: boolean
            The return value of dispatchEvent indicates whether any of the listeners
            which handled the event called preventDefault. If preventDefault was called
            the value is false, else the value is true.
            */
            return !obj.dispatchEvent(evt);
        } catch (err) {
            this.error("ERROR in utility.Click: " + err);
            return undefined;
        }
    },

    ClickAjax: function (link, loadWaitTime) {
        try {
            if (!link) {
                throw 'No link passed to Click Ajax';
            }

            if (state.getItem('clickUrl', '').indexOf(link) < 0) {
                state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/' + link);
                caap.waitingForDomLoad = false;
            }

            caap.waitMilliSecs = loadWaitTime ? loadWaitTime : 10000;
            return this.VisitUrl("javascript:void(a46755028429_ajaxLinkSend('globalContainer', '" + link + "'))", loadWaitTime);
        } catch (err) {
            this.error("ERROR in utility.ClickAjax: " + err);
            return undefined;
        }
    },

    oneMinuteUpdate: function (funcName) {
        try {
            if (!state.getItem('reset' + funcName) && !schedule.check(funcName + 'Timer')) {
                return false;
            }

            schedule.setItem(funcName + 'Timer', 60);
            state.setItem('reset' + funcName, false);
            return true;
        } catch (err) {
            this.error("ERROR in utility.oneMinuteUpdate: " + err);
            return undefined;
        }
    },

    NavigateTo: function (pathToPage, imageOnPage) {
        try {
            var content   = null,
                pathList  = [],
                s         = 0,
                a         = null,
                imageTest = '',
                img       = null;

            content = $("#content");
            if (!content || !content.length) {
                this.warn('No content to Navigate to', imageOnPage, pathToPage);
                return false;
            }

            if (imageOnPage) {
                if (this.CheckForImage(imageOnPage)) {
                    return false;
                }
            }

            pathList = pathToPage.split(",");
            for (s = pathList.length - 1; s >= 0; s -= 1) {
                a = content.find("a[href*='/" + pathList[s] + ".php']").not("a[href*='" + pathList[s] + ".php?']");
                if (a && a.length) {
                    this.log(2, 'Go to', pathList[s]);
                    //state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/' + pathList[s] + '.php');
                    this.Click(a.get(0));
                    return true;
                }

                imageTest = pathList[s];
                if (imageTest.indexOf(".") === -1) {
                    imageTest = imageTest + '.';
                }

                img = this.CheckForImage(imageTest);
                if (img) {
                    this.log(3, 'Click on image', img.src.match(/[\w.]+$/));
                    this.Click(img);
                    return true;
                }
            }

            this.warn('Unable to Navigate to', imageOnPage, pathToPage);
            return false;
        } catch (err) {
            this.error("ERROR in utility.NavigateTo: " + err, imageOnPage, pathToPage);
            return undefined;
        }
    },

    CheckForImage: function (image, webSlice, subDocument, nodeNum) {
        try {
            var imageSlice = null;
            if (!webSlice) {
                webSlice = subDocument ? subDocument.body : window.document.body;
            }

            if (!nodeNum || typeof nodeNum !== 'number') {
                nodeNum = 0;
            }

            imageSlice = $(webSlice).find("input[src*='" + image + "'],img[src*='" + image + "'],div[style*='" + image + "']").eq(nodeNum);
            return (imageSlice.length ? imageSlice.get(0) : null);
        } catch (err) {
            this.error("ERROR in utility.CheckForImage: " + err);
            return undefined;
        }
    },

    NumberOnly: function (num) {
        try {
            return parseFloat(num.toString().replace(new RegExp("[^0-9\\.]", "g"), ''));
        } catch (err) {
            this.error("ERROR in utility.NumberOnly: " + err, arguments.callee.caller);
            return undefined;
        }
    },

    RemoveHtmlJunk: function (html) {
        try {
            return html.replace(new RegExp("\\&[^;]+;", "g"), '');
        } catch (err) {
            this.error("ERROR in utility.RemoveHtmlJunk: " + err);
            return undefined;
        }
    },

    /*
    typeOf: function (obj) {
        try {
            var s = typeof obj;

            if (s === 'object') {
                if (obj) {
                    if (obj instanceof Array) {
                        s = 'array';
                    }
                } else {
                    s = 'null';
                }
            }

            return s;
        } catch (err) {
            this.error("ERROR in utility.typeOf: " + err);
            return undefined;
        }
    },

    isEmpty: function (obj) {
        try {
            var i, v,
                empty = true;

            if (this.typeOf(obj) === 'object') {
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        v = obj[i];
                        if (v !== undefined && this.typeOf(v) !== 'function') {
                            empty = false;
                            break;
                        }
                    }
                }
            }

            return empty;
        } catch (err) {
            this.error("ERROR in utility.isEmpty: " + err);
            return undefined;
        }
    },

    isInt: function (value) {
        try {
            var y = parseInt(value, 10);
            if (isNaN(y)) {
                return false;
            }

            return value === y && value.toString() === y.toString();
        } catch (err) {
            this.error("ERROR in utility.isInt: " + err);
            return undefined;
        }
    },
    */

    isNum: function (value) {
        try {
            return $.type(value) === 'number';
        } catch (err) {
            this.error("ERROR in utility.isNum: " + err);
            return undefined;
        }
    },

    alert_id: 0,

    alert: function (message) {
        try {
            this.alert_id += 1;
            var id = this.alert_id;
            $('<div id="alert_' + id + '" title="Alert!"><p>' + message + '</p></div>').appendTo(window.document.body);
            $("#alert_" + id).dialog({
                buttons: {
                    "Ok": function () {
                        $(this).dialog("close");
                    }
                }
            });

            return true;
        } catch (err) {
            this.error("ERROR in utility.alert: " + err);
            return false;
        }
    },

    arrayDeepCopy: function (theArray) {
        try {
            var it = 0,
                len = 0,
                newArray = [],
                tempValue = null;

            for (it = 0, len = theArray.length; it < len; it += 1) {
                switch ($.type(theArray[it])) {
                case "object":
                    tempValue = $.extend(true, {}, theArray[it]);
                    break;
                case "array":
                    tempValue = this.arrayDeepCopy(theArray[it]);
                    break;
                default:
                    tempValue = theArray[it];
                }

                newArray.push(tempValue);
            }

            return newArray;
        } catch (err) {
            this.error("ERROR in utility.arrayDeepCopy: " + err);
            return undefined;
        }
    },

    logLevel: 1,

    log: function (level, text) {
        if (console.log !== undefined) {
            if (this.logLevel && !isNaN(level) && this.logLevel >= level) {
                var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text,
                    tempArr = [],
                    it      = 0,
                    len     = 0,
                    newArg;

                if (arguments.length > 2) {
                    for (it = 2, len = arguments.length; it < len; it += 1) {
                        switch ($.type(arguments[it])) {
                        case "object":
                            newArg = $.extend(true, {}, arguments[it]);
                            break;
                        case "array":
                            newArg = this.arrayDeepCopy(arguments[it]);
                            break;
                        default:
                            newArg = arguments[it];
                        }

                        tempArr.push(newArg);
                    }

                    console.log(message, tempArr);
                } else {
                    console.log(message);
                }
            }
        }
    },

    warn: function (text) {
        if (console.warn !== undefined) {
            var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text,
                    tempArr = [],
                    it      = 0,
                    len     = 0,
                    newArg;

            if (arguments.length > 1) {
                for (it = 1, len = arguments.length; it < len; it += 1) {
                    switch ($.type(arguments[it])) {
                    case "object":
                        newArg = $.extend(true, {}, arguments[it]);
                        break;
                    case "array":
                        newArg = this.arrayDeepCopy(arguments[it]);
                        break;
                    default:
                        newArg = arguments[it];
                    }

                    tempArr.push(newArg);
                }

                console.warn(message, tempArr);
            } else {
                console.warn(message);
            }
        } else {
            if (arguments.length > 1) {
                this.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                this.log(1, text);
            }
        }
    },

    error: function (text) {
        if (console.error !== undefined) {
            var message = 'v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + text,
                    tempArr = [],
                    it      = 0,
                    len     = 0,
                    newArg;

            if (arguments.length > 1) {
                for (it = 1, len = arguments.length; it < len; it += 1) {
                    switch ($.type(arguments[it])) {
                    case "object":
                        newArg = $.extend(true, {}, arguments[it]);
                        break;
                    case "array":
                        newArg = this.arrayDeepCopy(arguments[it]);
                        break;
                    default:
                        newArg = arguments[it];
                    }

                    tempArr.push(newArg);
                }

                console.error(message, tempArr);
            } else {
                console.error(message);
            }
        } else {
            if (arguments.length > 1) {
                this.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                this.log(1, text);
            }
        }
    },

    timeouts: {},

    setTimeout: function (func, millis) {
        try {
            var t = window.setTimeout(function () {
                func();
                utility.timeouts[t] = undefined;
            }, millis);

            this.timeouts[t] = 1;
            return true;
        } catch (err) {
            this.error("ERROR in utility.setTimeout: " + err);
            return false;
        }
    },

    clearTimeouts: function () {
        try {
            for (var t in this.timeouts) {
                if (this.timeouts.hasOwnProperty(t)) {
                    window.clearTimeout(t);
                }
            }

            this.timeouts = {};
            return true;
        } catch (err) {
            this.error("ERROR in utility.clearTimeouts: " + err);
            return false;
        }
    },

    getHTMLPredicate: function (HTML) {
        try {
            for (var x = HTML.length; x > 1; x -= 1) {
                if (HTML.substr(x, 1) === '/') {
                    return HTML.substr(x + 1);
                }
            }

            return HTML;
        } catch (err) {
            this.error("ERROR in utility.getHTMLPredicate: " + err);
            return undefined;
        }
    },

    // Turns text delimeted with new lines and commas into an array.
    // Primarily for use with user input text boxes.
    TextToArray: function (text) {
        try {
            var theArray  = [],
                tempArray = [],
                it        = 0,
                len       = 0;

            if (typeof text === 'string' && text !== '') {
                text = text.replace(/,/g, '\n').replace(/ /g, '');
                tempArray = text.split('\n');
                if (tempArray && tempArray.length) {
                    for (it = 0, len = tempArray.length; it < len; it += 1) {
                        if (tempArray[it] !== '') {
                            theArray.push(isNaN(tempArray[it]) ? tempArray[it] : parseFloat(tempArray[it]));
                        }
                    }
                }
            }

            this.log(4, "utility.TextToArray", theArray);
            return theArray;
        } catch (err) {
            utility.error("ERROR in utility.TextToArray: " + err);
            return undefined;
        }
    },

    //pads left
    lpad: function (text, padString, length) {
        try {
            while (text.length < length) {
                text = padString + text;
            }

            return text;
        } catch (err) {
            utility.error("ERROR in utility.lpad: " + err);
            return undefined;
        }
    },

    //pads right
    rpad: function (text, padString, length) {
        try {
            while (text.length < length) {
                text = text + padString;
            }

            return text;
        } catch (err) {
            utility.error("ERROR in utility.rpad: " + err);
            return undefined;
        }
    },

    /*jslint bitwise: false */
    SHA1: function (msg) {
        try {
            if (!msg || typeof msg !== 'string') {
                utility.warn("msg", msg);
                throw "Invalid msg!";
            }

            function rotate_left(n, s) {
                return (n << s) | (n >>> (32 - s));
            }

            function cvt_hex(val) {
                var str = "", i, v;

                for (i = 7; i >= 0; i -= 1) {
                    v = (val >>> (i * 4)) & 0x0f;
                    str += v.toString(16);
                }

                return str;
            }

            function Utf8Encode(string) {
                string = string.replace(/\r\n/g, "\n");
                var utftext = "",
                    n = 0,
                    l = 0,
                    c = '';

                for (n = 0, l = string.length; n < l; n += 1) {
                    c = string.charCodeAt(n);
                    if (c < 128) {
                        utftext += String.fromCharCode(c);
                    } else if ((c > 127) && (c < 2048)) {
                        utftext += String.fromCharCode((c >> 6) | 192);
                        utftext += String.fromCharCode((c & 63) | 128);
                    } else {
                        utftext += String.fromCharCode((c >> 12) | 224);
                        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                        utftext += String.fromCharCode((c & 63) | 128);
                    }
                }

                return utftext;
            }

            var blockstart, i, j,
                W = [80],
                H0 = 0x67452301,
                H1 = 0xEFCDAB89,
                H2 = 0x98BADCFE,
                H3 = 0x10325476,
                H4 = 0xC3D2E1F0,
                A = null,
                B = null,
                C = null,
                D = null,
                E = null,
                temp = null,
                msg_len = 0,
                len = 0,
                word_array = [];

            msg = Utf8Encode(msg);
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
                    W[i] = rotate_left(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
                }

                A = H0;
                B = H1;
                C = H2;
                D = H3;
                E = H4;
                for (i = 0; i <= 19; i += 1) {
                    temp = (rotate_left(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 20; i <= 39; i += 1) {
                    temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 40; i <= 59; i += 1) {
                    temp = (rotate_left(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 60; i <= 79; i += 1) {
                    temp = (rotate_left(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = rotate_left(B, 30);
                    B = A;
                    A = temp;
                }

                H0 = (H0 + A) & 0x0ffffffff;
                H1 = (H1 + B) & 0x0ffffffff;
                H2 = (H2 + C) & 0x0ffffffff;
                H3 = (H3 + D) & 0x0ffffffff;
                H4 = (H4 + E) & 0x0ffffffff;
            }

            temp = cvt_hex(H0) + cvt_hex(H1) + cvt_hex(H2) + cvt_hex(H3) + cvt_hex(H4);
            return temp.toLowerCase();
        } catch (err) {
            utility.error("ERROR in utility.SHA1: " + err);
            return undefined;
        }
    }
    /*jslint bitwise: true */
};
