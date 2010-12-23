
////////////////////////////////////////////////////////////////////
//                          utility OBJECT
// Small functions called a lot to reduce duplicate code
/////////////////////////////////////////////////////////////////////

utility = {
    is_chrome               : navigator.userAgent.toLowerCase().indexOf('chrome') !== -1 ? true : false,

    is_firefox              : navigator.userAgent.toLowerCase().indexOf('firefox') !== -1  ? true : false,

    is_html5_localStorage   : ('localStorage' in window) && window.localStorage !== null,

    is_html5_sessionStorage : ('sessionStorage' in window) && window.sessionStorage !== null,

    waitTime: 5000,

    VisitUrl: function (url, loadWaitTime) {
        try {
            if (!url) {
                throw 'No url passed to VisitUrl';
            }

            caap.waitMilliSecs = loadWaitTime ? loadWaitTime : utility.waitTime;
            if (state.getItem('clickUrl', '').indexOf(url) < 0) {
                state.setItem('clickUrl', url);
            }

            if (caap.waitingForDomLoad === false) {
                schedule.setItem('clickedOnSomething', 0);
                caap.waitingForDomLoad = true;
            }

            window.location.href = url;
            return true;
        } catch (err) {
            utility.error("ERROR in utility.VisitUrl: " + err);
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

            caap.waitMilliSecs = loadWaitTime ? loadWaitTime : utility.waitTime;
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
            utility.error("ERROR in utility.Click: " + err);
            return undefined;
        }
    },

    ClickAjaxLinkSend: function (link, loadWaitTime) {
        try {
            if (!link) {
                throw 'No link passed to ClickAjaxLinkSend';
            }

            caap.waitMilliSecs = loadWaitTime ? loadWaitTime : utility.waitTime;
            if (state.getItem('clickUrl', '').indexOf(link) < 0) {
                state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/' + link);
            }

            if (caap.waitingForDomLoad === false) {
                schedule.setItem('clickedOnSomething', 0);
                caap.waitingForDomLoad = true;
            }

            var jss = "javascript";
            window.location.href = jss + ":void(a46755028429_ajaxLinkSend('globalContainer', '" + link + "'))";
            return true;
        } catch (err) {
            utility.error("ERROR in utility.ClickAjaxLinkSend: " + err);
            return false;
        }
    },

    ClickGetCachedAjax: function (link, loadWaitTime) {
        try {
            if (!link) {
                throw 'No link passed to ClickGetCachedAjax';
            }

            caap.waitMilliSecs = loadWaitTime ? loadWaitTime : utility.waitTime;
            if (state.getItem('clickUrl', '').indexOf(link) < 0) {
                state.setItem('clickUrl', 'http://apps.facebook.com/castle_age/' + link);
            }

            if (caap.waitingForDomLoad === false) {
                schedule.setItem('clickedOnSomething', 0);
                caap.waitingForDomLoad = true;
            }

            var jss = "javascript";
            window.location.href = jss + ":void(a46755028429_get_cached_ajax('" + link + "', 'get_body'))";
            return true;
        } catch (err) {
            utility.error("ERROR in utility.ClickGetCachedAjax: " + err);
            return false;
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
                utility.warn('No content to Navigate to', imageOnPage, pathToPage);
                return false;
            }

            if (imageOnPage) {
                if (utility.CheckForImage(imageOnPage)) {
                    return false;
                }
            }

            pathList = pathToPage.split(",");
            for (s = pathList.length - 1; s >= 0; s -= 1) {
                a = content.find("a[href*='/" + pathList[s] + ".php']").not("a[href*='" + pathList[s] + ".php?']");
                if (a && a.length) {
                    utility.log(2, 'Go to', pathList[s]);
                    utility.Click(a.get(0));
                    return true;
                }

                imageTest = pathList[s];
                if (imageTest.indexOf(".") === -1) {
                    imageTest = imageTest + '.';
                }

                img = utility.CheckForImage(imageTest);
                if (img) {
                    utility.log(3, 'Click on image', img.src.match(/[\w.]+$/));
                    utility.Click(img);
                    return true;
                }
            }

            utility.warn('Unable to Navigate to', imageOnPage, pathToPage);
            return false;
        } catch (err) {
            utility.error("ERROR in utility.NavigateTo: " + err, imageOnPage, pathToPage);
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
            utility.error("ERROR in utility.CheckForImage: " + err);
            return undefined;
        }
    },

    NumberOnly: function (num) {
        try {
            return parseFloat(num.toString().replace(new RegExp("[^0-9\\.]", "g"), ''));
        } catch (err) {
            utility.error("ERROR in utility.NumberOnly: " + err, arguments.callee.caller);
            return undefined;
        }
    },

    RemoveHtmlJunk: function (html) {
        try {
            return html.replace(new RegExp("\\&[^;]+;", "g"), '');
        } catch (err) {
            utility.error("ERROR in utility.RemoveHtmlJunk: " + err);
            return undefined;
        }
    },

    injectScript: function (url) {
        try {
            var inject = document.createElement('script');
            inject.setAttribute('type', 'application/javascript');
            inject.src = url;
            document.body.appendChild(inject);
            inject = null;
            return true;
        } catch (err) {
            utility.error("ERROR in utility.injectScript: " + err);
            return false;
        }
    },

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
            utility.error("ERROR in utility.typeOf: " + err);
            return undefined;
        }
    },

    isEmpty: function (obj) {
        try {
            var i, v,
                empty = true;

            if (utility.typeOf(obj) === 'object') {
                for (i in obj) {
                    if (obj.hasOwnProperty(i)) {
                        v = obj[i];
                        if (v !== undefined && utility.typeOf(v) !== 'function') {
                            empty = false;
                            break;
                        }
                    }
                }
            }

            return empty;
        } catch (err) {
            utility.error("ERROR in utility.isEmpty: " + err);
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
            utility.error("ERROR in utility.isInt: " + err);
            return undefined;
        }
    },

    isNum: function (value) {
        try {
            return $.type(value) === 'number';
        } catch (err) {
            utility.error("ERROR in utility.isNum: " + err);
            return undefined;
        }
    },

    alertDialog: {},

    alert_id: 0,

    alert: function (message, id) {
        try {
            if (!id) {
                utility.alert_id += 1;
                id = utility.alert_id;
            }

            if (!utility.alertDialog[id] || !utility.alertDialog[id].length) {
                utility.alertDialog[id] = $('<div id="alert_' + id + '" title="Alert!">' + message + '</div>').appendTo(window.document.body);
                utility.alertDialog[id].dialog({
                    buttons: {
                        "Ok": function () {
                            $(this).dialog("close");
                        }
                    }
                });
            } else {
                utility.alertDialog[id].html(message);
                utility.alertDialog[id].dialog("open");
            }

            return true;
        } catch (err) {
            utility.error("ERROR in utility.alert: " + err);
            return false;
        }
    },

    getElementWidth: function (jObject) {
        try {
            var widthRegExp = new RegExp("width:\\s*([\\d\\.]+)%", "i"),
                tempArr     = [],
                width       = 0;

            if (jObject && jObject.length === 1) {
                if ($().jquery >= "1.4.3") {
                    tempArr = jObject.attr("style").match(widthRegExp);
                    if (tempArr && tempArr.length === 2) {
                        width = parseFloat(tempArr[1]);
                    } else {
                        utility.warn("getElementWidth did not match a width", jObject);
                    }
                } else {
                    width = parseFloat(jObject.css("width"));
                }
            } else {
                utility.warn("getElementWidth problem with jObject", jObject);
            }

            return width;
        } catch (err) {
            utility.error("ERROR in utility.getElementWidth: " + err);
            return undefined;
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
                    tempValue = utility.arrayDeepCopy(theArray[it]);
                    break;
                default:
                    tempValue = theArray[it];
                }

                newArray.push(tempValue);
            }

            return newArray;
        } catch (err) {
            utility.error("ERROR in utility.arrayDeepCopy: " + err);
            return undefined;
        }
    },

    getElementHeight: function (jObject) {
        try {
            var heightRegExp = new RegExp("height:\\s*([\\d\\.]+)%", "i"),
                tempArr     = [],
                width       = 0;

            if (jObject && jObject.length === 1) {
                if ($().jquery >= "1.4.3") {
                    tempArr = jObject.attr("style").match(heightRegExp);
                    if (tempArr && tempArr.length === 2) {
                        width = parseFloat(tempArr[1]);
                    } else {
                        utility.warn("getElementHeight did not match a width", jObject);
                    }
                } else {
                    width = parseFloat(jObject.css("height"));
                }
            } else {
                utility.warn("getElementHeight problem with jObject", jObject);
            }

            return width;
        } catch (err) {
            utility.error("ERROR in utility.getElementHeight: " + err);
            return undefined;
        }
    },

    logLevel: 1,

    log: function (level, text) {
        if (console.log !== undefined) {
            if (utility.logLevel && !isNaN(level) && utility.logLevel >= level) {
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
                            newArg = utility.arrayDeepCopy(arguments[it]);
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
                        newArg = utility.arrayDeepCopy(arguments[it]);
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
                utility.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                utility.log(1, text);
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
                        newArg = utility.arrayDeepCopy(arguments[it]);
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
                utility.log(1, text, Array.prototype.slice.call(arguments, 1));
            } else {
                utility.log(1, text);
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

            utility.timeouts[t] = 1;
            return true;
        } catch (err) {
            utility.error("ERROR in utility.setTimeout: " + err);
            return false;
        }
    },

    clearTimeouts: function () {
        try {
            for (var t in utility.timeouts) {
                if (utility.timeouts.hasOwnProperty(t)) {
                    window.clearTimeout(t);
                }
            }

            utility.timeouts = {};
            return true;
        } catch (err) {
            utility.error("ERROR in utility.clearTimeouts: " + err);
            return false;
        }
    },

    chatLink: function (slice, query) {
        try {
            var httpRegExp  = new RegExp('.*(http:.*)'),
                quoteRegExp = /"/g,
                chatDiv     = slice.find(query);

            if (chatDiv && chatDiv.length) {
                chatDiv.each(function () {
                    var e     = $(this),
                        eHtml = $.trim(e.html()),
                        Arr   = [];

                    if (eHtml) {
                        Arr = eHtml.split("<br>");
                        if (Arr && Arr.length === 2) {
                            Arr = Arr[1].replace(quoteRegExp, '').match(httpRegExp);
                            if (Arr && Arr.length === 2 && Arr[1]) {
                                Arr = Arr[1].split(" ");
                                if (Arr && Arr.length) {
                                    e.html(eHtml.replace(Arr[0], "<a href='" + Arr[0] + "'>" + Arr[0] + "</a>"));
                                }
                            }
                        }
                    }
                });
            }

            return true;
        } catch (err) {
            utility.error("ERROR in utility.chatLink: " + err);
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
            utility.error("ERROR in utility.getHTMLPredicate: " + err);
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
                text = text.replace(/,/g, '\n');
                tempArray = text.split('\n');
                if (tempArray && tempArray.length) {
                    for (it = 0, len = tempArray.length; it < len; it += 1) {
                        if (tempArray[it] !== '') {
                            theArray.push(isNaN(tempArray[it]) ? $.trim(tempArray[it]) : parseFloat(tempArray[it]));
                        }
                    }
                }
            }

            utility.log(4, "utility.TextToArray", theArray);
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
    toHexStr: function (n) {
        var s = "",
            v = 0,
            i = 0;

        for (i = 7; i >= 0; i -= 1) {
            v = (n >>> (i * 4)) & 0xf;
            s += v.toString(16);
        }

        return s;
    },

    ROTL: function (n, s) {
        return (n << s) | (n >>> (32 - s));
    },

    ROTR: function (n, x) {
        return (x >>> n) | (x << (32 - n));
    },

    MD5: function (msg) {
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
            return AddUnsigned(utility.ROTL(a, s), b);
        }

        function GG(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
            return AddUnsigned(utility.ROTL(a, s), b);
        }

        function HH(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
            return AddUnsigned(utility.ROTL(a, s), b);
        }

        function II(a, b, c, d, x, s, ac) {
            a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
            return AddUnsigned(utility.ROTL(a, s), b);
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

        var x   = ConvertToWordArray(utility.Utf8.encode(msg)),
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
    },

    SHA1: function (msg) {
        try {
            if (!msg || typeof msg !== 'string') {
                utility.warn("msg", msg);
                throw "Invalid msg!";
            }

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
                msg_len    = 0,
                len        = 0,
                word_array = [];

            msg = utility.Utf8.encode(msg);
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
                    W[i] = utility.ROTL(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);
                }

                A = H0;
                B = H1;
                C = H2;
                D = H3;
                E = H4;
                for (i = 0; i <= 19; i += 1) {
                    temp = (utility.ROTL(A, 5) + ((B & C) | (~B & D)) + E + W[i] + 0x5A827999) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = utility.ROTL(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 20; i <= 39; i += 1) {
                    temp = (utility.ROTL(A, 5) + (B ^ C ^ D) + E + W[i] + 0x6ED9EBA1) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = utility.ROTL(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 40; i <= 59; i += 1) {
                    temp = (utility.ROTL(A, 5) + ((B & C) | (B & D) | (C & D)) + E + W[i] + 0x8F1BBCDC) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = utility.ROTL(B, 30);
                    B = A;
                    A = temp;
                }

                for (i = 60; i <= 79; i += 1) {
                    temp = (utility.ROTL(A, 5) + (B ^ C ^ D) + E + W[i] + 0xCA62C1D6) & 0x0ffffffff;
                    E = D;
                    D = C;
                    C = utility.ROTL(B, 30);
                    B = A;
                    A = temp;
                }

                H0 = (H0 + A) & 0x0ffffffff;
                H1 = (H1 + B) & 0x0ffffffff;
                H2 = (H2 + C) & 0x0ffffffff;
                H3 = (H3 + D) & 0x0ffffffff;
                H4 = (H4 + E) & 0x0ffffffff;
            }

            temp = utility.toHexStr(H0) + utility.toHexStr(H1) + utility.toHexStr(H2) + utility.toHexStr(H3) + utility.toHexStr(H4);
            return temp.toLowerCase();
        } catch (err) {
            utility.error("ERROR in utility.SHA1: " + err);
            return undefined;
        }
    },

    SHA256: {
        hash: function (msg, utf8encode) {
            utf8encode =  (typeof utf8encode === 'undefined') ? true : utf8encode;
            if (utf8encode) {
                msg = utility.Utf8.encode(msg);
            }

            msg += String.fromCharCode(0x80);

            var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
                     0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
                     0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
                     0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
                     0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
                     0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
                     0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
                     0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2],
                H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19],
                l = msg.length / 4 + 2,
                N = Math.ceil(l / 16),
                M = new Array(N),
                i = 0,
                j = 0,
                W = [],
                t = 0,
                a, b, c, d, e, f, g, h, T1, T2;

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
                    W[t] = (utility.SHA256.sigma1(W[t - 2]) + W[t - 7] + utility.SHA256.sigma0(W[t - 15]) + W[t - 16]) & 0xffffffff;
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
                    T1 = h + utility.SHA256.Sigma1(e) + utility.SHA256.Ch(e, f, g) + K[t] + W[t];
                    T2 = utility.SHA256.Sigma0(a) + utility.SHA256.Maj(a, b, c);
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

            return utility.toHexStr(H[0]) + utility.toHexStr(H[1]) + utility.toHexStr(H[2]) + utility.toHexStr(H[3]) +
                   utility.toHexStr(H[4]) + utility.toHexStr(H[5]) + utility.toHexStr(H[6]) + utility.toHexStr(H[7]);
        },

        Sigma0: function (x) {
            return utility.ROTR(2, x) ^ utility.ROTR(13, x) ^ utility.ROTR(22, x);
        },

        Sigma1: function (x) {
            return utility.ROTR(6,  x) ^ utility.ROTR(11, x) ^ utility.ROTR(25, x);
        },

        sigma0: function (x) {
            return utility.ROTR(7,  x) ^ utility.ROTR(18, x) ^ (x>>>3);
        },

        sigma1: function (x) {
            return utility.ROTR(17, x) ^ utility.ROTR(19, x) ^ (x>>>10);
        },

        Ch: function (x, y, z)  {
            return (x & y) ^ (~x & z);
        },

        Maj: function (x, y, z) {
            return (x & y) ^ (x & z) ^ (y & z);
        }
    },
    /*jslint bitwise: true */

    Aes: {
        cipher: function (input, w) {
            var Nb     = 4,
                Nr     = w.length / Nb - 1,
                state  = [[], [], [], []],
                i      = 0,
                round  = 1,
                output = [];

            for (i = 0; i < 4 * Nb; i += 1) {
                state[i % 4][Math.floor(i / 4)] = input[i];
            }

            state = utility.Aes.addRoundKey(state, w, 0, Nb);
            for (round = 1; round < Nr; round += 1) {
                state = utility.Aes.subBytes(state, Nb);
                state = utility.Aes.shiftRows(state, Nb);
                state = utility.Aes.mixColumns(state, Nb);
                state = utility.Aes.addRoundKey(state, w, round, Nb);
            }

            state = utility.Aes.subBytes(state, Nb);
            state = utility.Aes.shiftRows(state, Nb);
            state = utility.Aes.addRoundKey(state, w, Nr, Nb);
            output = new Array(4 * Nb);
            for (i = 0; i < 4 * Nb; i += 1) {
                output[i] = state[i % 4][Math.floor(i / 4)];
            }

            return output;
        },

        keyExpansion: function (key) {
            var Nb   = 4,
                Nk   = key.length / 4,
                Nr   = Nk + 6,
                w    = new Array(Nb * (Nr + 1)),
                temp = new Array(4),
                i    = 0,
                t    = 0;

            for (i = 0; i < Nk; i += 1) {
                w[i] = [key[4 * i], key[4 * i + 1], key[4 * i + 2], key[4 * i + 3]];
            }

            for (i = Nk; i < (Nb * (Nr + 1)); i += 1) {
                w[i] = new Array(4);
                for (t = 0; t < 4; t += 1) {
                    temp[t] = w[i - 1][t];
                }

                if (i % Nk === 0) {
                    temp = utility.Aes.subWord(utility.Aes.rotWord(temp));
                    /*jslint bitwise: false */
                    for (t = 0; t < 4; t += 1) {
                        temp[t] ^= utility.Aes.rCon[i / Nk][t];
                    }
                    /*jslint bitwise: true */

                } else if (Nk > 6 && i % Nk === 4) {
                    temp = utility.Aes.subWord(temp);
                }

                /*jslint bitwise: false */
                for (t = 0; t < 4; t += 1) {
                    w[i][t] = w[i - Nk][t] ^ temp[t];
                }
                /*jslint bitwise: true */
            }

            return w;
        },

        subBytes: function (s, Nb) {
            var r = 0,
                c = 0;

            for (r = 0; r < 4; r += 1) {
                for (c = 0; c < Nb; c += 1) {
                    s[r][c] = utility.Aes.sBox[s[r][c]];
                }
            }

            return s;
        },

        shiftRows: function (s, Nb) {
            var t = new Array(4),
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
        },

        mixColumns: function (s, Nb) {
            var c = 0,
                a = [],
                b = [],
                i = 0;

            /*jslint bitwise: false */
            for (c = 0; c < 4; c += 1) {
                a = new Array(4);
                b = new Array(4);
                for (i = 0; i < 4; i += 1) {
                    a[i] = s[i][c];
                    b[i] = s[i][c]&0x80 ? s[i][c]<<1 ^ 0x011b : s[i][c]<<1;
                }

                s[0][c] = b[0] ^ a[1] ^ b[1] ^ a[2] ^ a[3];
                s[1][c] = a[0] ^ b[1] ^ a[2] ^ b[2] ^ a[3];
                s[2][c] = a[0] ^ a[1] ^ b[2] ^ a[3] ^ b[3];
                s[3][c] = a[0] ^ b[0] ^ a[1] ^ a[2] ^ b[3];
            }
            /*jslint bitwise: true */

            return s;
        },

        addRoundKey: function (state, w, rnd, Nb) {
            var r = 0,
                c = 0;

            /*jslint bitwise: false */
            for (r = 0; r < 4; r += 1) {
                for (c = 0; c < Nb; c += 1) {
                    state[r][c] ^= w[rnd * 4 + c][r];
                }
            }
            /*jslint bitwise: true */

            return state;
        },

        subWord: function (w) {
            for (var i = 0; i < 4; i += 1) {
                w[i] = utility.Aes.sBox[w[i]];
            }

            return w;
        },

        rotWord: function (w) {
            var tmp = w[0],
                i   = 0;

            for (i = 0; i < 3; i += 1) {
                w[i] = w[i + 1];
            }

            w[3] = tmp;
            return w;
        },

        sBox: [ 0x63, 0x7c, 0x77, 0x7b, 0xf2, 0x6b, 0x6f, 0xc5, 0x30, 0x01, 0x67, 0x2b, 0xfe, 0xd7, 0xab, 0x76,
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
                0x8c, 0xa1, 0x89, 0x0d, 0xbf, 0xe6, 0x42, 0x68, 0x41, 0x99, 0x2d, 0x0f, 0xb0, 0x54, 0xbb, 0x16 ],

        rCon: [ [0x00, 0x00, 0x00, 0x00],
                [0x01, 0x00, 0x00, 0x00],
                [0x02, 0x00, 0x00, 0x00],
                [0x04, 0x00, 0x00, 0x00],
                [0x08, 0x00, 0x00, 0x00],
                [0x10, 0x00, 0x00, 0x00],
                [0x20, 0x00, 0x00, 0x00],
                [0x40, 0x00, 0x00, 0x00],
                [0x80, 0x00, 0x00, 0x00],
                [0x1b, 0x00, 0x00, 0x00],
                [0x36, 0x00, 0x00, 0x00] ],

        Ctr: {
            encrypt: function (plaintext, password, nBits) {
                if (!(nBits === 128 || nBits === 192 || nBits === 256)) {
                    return '';
                }

                plaintext = utility.Utf8.encode(plaintext);
                password = utility.Utf8.encode(password);
                var blockSize    = 16,
                    nBytes       = nBits / 8,
                    pwBytes      = new Array(nBytes),
                    i            = 0,
                    counterBlock = new Array(blockSize),
                    nonce        = new Date().getTime(),
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

                key = utility.Aes.cipher(pwBytes, utility.Aes.keyExpansion(pwBytes));
                key = key.concat(key.slice(0, nBytes - 16));
                /*jslint bitwise: false */
                for (i = 0; i < 4; i += 1) {
                    counterBlock[i] = (nonceSec >>> i * 8) & 0xff;
                }

                for (i = 0; i < 4; i += 1) {
                    counterBlock[i + 4] = nonceMs & 0xff;
                }
                /*jslint bitwise: true */

                for (i = 0; i < 8; i += 1) {
                    ctrTxt += String.fromCharCode(counterBlock[i]);
                }

                keySchedule = utility.Aes.keyExpansion(key);
                blockCount = Math.ceil(plaintext.length / blockSize);
                ciphertxt = new Array(blockCount);
                /*jslint bitwise: false */
                for (b = 0; b < blockCount; b += 1) {
                    for (c = 0; c < 4; c += 1) {
                        counterBlock[15 - c] = (b >>> c * 8) & 0xff;
                    }

                    for (c = 0; c < 4; c += 1) {
                        counterBlock[15 - c - 4] = (b / 0x100000000 >>> c * 8);
                    }

                    cipherCntr = utility.Aes.cipher(counterBlock, keySchedule);
                    blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
                    cipherChar = new Array(blockLength);
                    for (i = 0; i < blockLength; i += 1) {
                        cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
                        cipherChar[i] = String.fromCharCode(cipherChar[i]);
                    }

                    ciphertxt[b] = cipherChar.join('');
                }
                /*jslint bitwise: true */

                ciphertext = ctrTxt + ciphertxt.join('');
                ciphertext = utility.Base64.encode(ciphertext);
                return ciphertext;
            },

            decrypt: function (ciphertext, password, nBits) {
                if (!(nBits === 128 || nBits === 192 || nBits === 256)) {
                    return '';
                }

                ciphertext = utility.Base64.decode(ciphertext);
                password = utility.Utf8.encode(password);
                var blockSize    = 16,
                    nBytes       = nBits / 8,
                    pwBytes      = new Array(nBytes),
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

                key = utility.Aes.cipher(pwBytes, utility.Aes.keyExpansion(pwBytes));
                key = key.concat(key.slice(0, nBytes - 16));
                counterBlock = new Array(8);
                ctrTxt = ciphertext.slice(0, 8);
                for (i = 0; i < 8; i += 1) {
                    counterBlock[i] = ctrTxt.charCodeAt(i);
                }

                keySchedule = utility.Aes.keyExpansion(key);
                nBlocks = Math.ceil((ciphertext.length - 8) / blockSize);
                ct = new Array(nBlocks);
                for (b = 0; b < nBlocks; b += 1) {
                    ct[b] = ciphertext.slice(8 + b * blockSize, 8 + b * blockSize + blockSize);
                }

                ciphertext = ct;
                plaintxt = new Array(ciphertext.length);

                /*jslint bitwise: false */
                for (b = 0; b < nBlocks; b += 1) {
                    for (c = 0; c < 4; c += 1) {
                        counterBlock[15 - c] = ((b) >>> c * 8) & 0xff;
                    }

                    for (c = 0; c < 4; c += 1) {
                        counterBlock[15 - c - 4] = (((b + 1) / 0x100000000 - 1) >>> c * 8) & 0xff;
                    }

                    cipherCntr = utility.Aes.cipher(counterBlock, keySchedule);
                    plaintxtByte = new Array(ciphertext[b].length);
                    for (i = 0; i < ciphertext[b].length; i += 1) {
                        plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
                        plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
                    }

                    plaintxt[b] = plaintxtByte.join('');
                }
                /*jslint bitwise: true */

                plaintext = plaintxt.join('');
                plaintext = utility.Utf8.decode(plaintext);
                return plaintext;
            }
        }
    },

    Base64: {
        code: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

        encode: function (str, utf8encode) {
            var o1, o2, o3, bits, h1, h2, h3, h4,
                c     = 0,
                coded = '',
                plain = '',
                e     = [],
                pad   = '',
                b64   = utility.Base64.code,
                nChar = String.fromCharCode(0);

            utf8encode = (typeof utf8encode === 'undefined') ? false : utf8encode;
            plain = utf8encode ? utility.Utf8.encode(str) : str;
            c = plain.length % 3;
            if (c > 0) {
                while (c < 3) {
                    pad += '=';
                    plain += nChar;
                    c += 1;
                }
            }

            /*jslint bitwise: false */
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
            /*jslint bitwise: true */

            coded = e.join('');
            coded = coded.slice(0, coded.length - pad.length) + pad;
            return coded;
        },

        decode: function (str, utf8decode) {
            var o1, o2, o3, h1, h2, h3, h4, bits,
                d     = [],
                plain = '',
                coded = '',
                b64   = utility.Base64.code,
                c     = 0;

            utf8decode = (typeof utf8decode === 'undefined') ? false : utf8decode;
            coded = utf8decode ? utility.Utf8.decode(str) : str;
            /*jslint bitwise: false */
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
            /*jslint bitwise: true */

            plain = d.join('');
            return utf8decode ? plain.decodeUTF8() : plain;
        }
    },

    Utf8: {
        encode: function (strUni) {
            var strUtf = '';

            strUtf = strUni.replace(/[\u0080-\u07ff]/g, function (c) {
                var cc  = c.charCodeAt(0),
                    /*jslint bitwise: false */
                    str = String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f);
                    /*jslint bitwise: true */

                return str;
            });

            strUtf = strUtf.replace(/[\u0800-\uffff]/g, function (c) {
                var cc  = c.charCodeAt(0),
                    /*jslint bitwise: false */
                    str = String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f);
                    /*jslint bitwise: true */

                return str;
            });

            return strUtf;
        },

        decode: function (strUtf) {
            var strUni = '';

            strUni = strUtf.replace(/[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g, function (c) {
                /*jslint bitwise: false */
                var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | (c.charCodeAt(2)&0x3f);
                /*jslint bitwise: true */

                return String.fromCharCode(cc);
            });

            strUni = strUni.replace(/[\u00c0-\u00df][\u0080-\u00bf]/g, function (c) {
                /*jslint bitwise: false */
                var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
                /*jslint bitwise: true */

                return String.fromCharCode(cc);
            });

            return strUni;
        }
    },

    LZ77: function (settings) {
        settings = settings || {};
        var referencePrefix       = "`",
            referenceIntBase      = settings.referenceIntBase || 96,
            referenceIntFloorCode = " ".charCodeAt(0),
            referenceIntCeilCode  = referenceIntFloorCode + referenceIntBase - 1,
            maxStringDistance     = Math.pow(referenceIntBase, 2) - 1,
            minStringLength       = settings.minStringLength || 5,
            maxStringLength       = Math.pow(referenceIntBase, 1) - 1 + minStringLength,
            defaultWindowLength   = settings.defaultWindowLength || 144,
            maxWindowLength       = maxStringDistance + minStringLength,
            encodeReferenceInt    = null,
            encodeReferenceLength = null,
            decodeReferenceInt    = null,
            decodeReferenceLength = null;


        encodeReferenceInt = function (value, width) {
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
        };

        encodeReferenceLength = function (length) {
            return encodeReferenceInt(length - minStringLength, 1);
        };

        decodeReferenceInt = function (data, width) {
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
        };

        decodeReferenceLength = function (data) {
            return decodeReferenceInt(data, 1) + minStringLength;
        };

        this.compress = function (data, windowLength) {
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
        };

        this.decompress = function (data) {
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
        };
    }
};
