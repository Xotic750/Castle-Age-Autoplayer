
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
            var content   = $j(),
                pathList  = [],
                s         = 0,
                a         = $j(),
                imageTest = '',
                img       = null;

            content = $j("#content");
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
            var imageSlice = $j(),
                jSlice     = $j();

            if (!webSlice) {
                webSlice = subDocument ? subDocument.body : window.document.body;
            }

            if (!nodeNum || typeof nodeNum !== 'number') {
                nodeNum = 0;
            }

            jSlice = webSlice.jquery ? webSlice : $j(webSlice);
            imageSlice = jSlice.find("input[src*='" + image + "'],img[src*='" + image + "'],div[style*='" + image + "']").eq(nodeNum);
            return (imageSlice.length ? imageSlice.get(0) : null);
        } catch (err) {
            utility.error("ERROR in utility.CheckForImage: " + err);
            return undefined;
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
            return $j.type(value) === 'number';
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
                utility.alertDialog[id] = $j('<div id="alert_' + id + '" title="Alert!">' + message + '</div>').appendTo(window.document.body);
                utility.alertDialog[id].dialog({
                    buttons: {
                        "Ok": function () {
                            $j(this).dialog("close");
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
                        switch ($j.type(arguments[it])) {
                        case "object":
                            newArg = $j.extend(true, {}, arguments[it]);
                            break;
                        case "array":
                            newArg = arguments[it].deepCopy();
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
                    switch ($j.type(arguments[it])) {
                    case "object":
                        newArg = $j.extend(true, {}, arguments[it]);
                        break;
                    case "array":
                        newArg = arguments[it].deepCopy();
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
                    switch ($j.type(arguments[it])) {
                    case "object":
                        newArg = $j.extend(true, {}, arguments[it]);
                        break;
                    case "array":
                        newArg = arguments[it].deepCopy();
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

    chatLink: function (slice, query) {
        try {
            var hr = new RegExp('.*(http:.*)'),
                qr = /"/g,
                c  = $j();

            c = slice.find(query);
            if (c && c.length) {
                c.each(function () {
                    var e = $j(this),
                        h = '',
                        a = [];

                    h = e.html();
                    h = h ? h.trim() : '';
                    if (h) {
                        a = h.split("<br>");
                        if (a && a.length === 2) {
                            a = a[1].replace(qr, '').match(hr);
                            if (a && a.length === 2 && a[1]) {
                                a = a[1].split(" ");
                                if (a && a.length) {
                                    e.html(h.replace(a[0], "<a href='" + a[0] + "'>" + a[0] + "</a>"));
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

    /*jslint bitwise: false */
    Aes: function (password, nBits) {
        password = password.Utf8encode();
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
            ],
            subBytes     = null,
            shiftRows    = null,
            mixColumns   = null,
            addRoundKey  = null,
            cipher       = null,
            subWord      = null,
            rotWord      = null,
            keyExpansion = null;

        subBytes = function (s, Nb) {
            var r = 0,
                c = 0;

            for (r = 0; r < 4; r += 1) {
                for (c = 0; c < Nb; c += 1) {
                    s[r][c] = sBox[s[r][c]];
                }
            }

            return s;
        };

        shiftRows = function (s, Nb) {
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
        };

        mixColumns = function (s, Nb) {
            var c = 0,
                a = [],
                b = [],
                i = 0;

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

            return s;
        };

        addRoundKey = function (state, w, rnd, Nb) {
            var r = 0,
                c = 0;

            for (r = 0; r < 4; r += 1) {
                for (c = 0; c < Nb; c += 1) {
                    state[r][c] ^= w[rnd * 4 + c][r];
                }
            }

            return state;
        };

        cipher = function (input, w) {
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
            output = new Array(4 * Nb);
            for (i = 0; i < 4 * Nb; i += 1) {
                output[i] = state[i % 4][Math.floor(i / 4)];
            }

            return output;
        };

        subWord = function (w) {
            for (var i = 0; i < 4; i += 1) {
                w[i] = sBox[w[i]];
            }

            return w;
        };

        rotWord = function (w) {
            var tmp = w[0],
                i   = 0;

            for (i = 0; i < 3; i += 1) {
                w[i] = w[i + 1];
            }

            w[3] = tmp;
            return w;
        };

        keyExpansion = function (key) {
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
        };

        this.encrypt = function (plaintext) {
            plaintext = plaintext.Utf8encode();
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
            ciphertxt = new Array(blockCount);
            for (b = 0; b < blockCount; b += 1) {
                for (c = 0; c < 4; c += 1) {
                    counterBlock[15 - c] = (b >>> c * 8) & 0xff;
                }

                for (c = 0; c < 4; c += 1) {
                    counterBlock[15 - c - 4] = (b / 0x100000000 >>> c * 8);
                }

                cipherCntr = cipher(counterBlock, keySchedule);
                blockLength = b < blockCount - 1 ? blockSize : (plaintext.length - 1) % blockSize + 1;
                cipherChar = new Array(blockLength);
                for (i = 0; i < blockLength; i += 1) {
                    cipherChar[i] = cipherCntr[i] ^ plaintext.charCodeAt(b * blockSize + i);
                    cipherChar[i] = String.fromCharCode(cipherChar[i]);
                }

                ciphertxt[b] = cipherChar.join('');
            }

            ciphertext = ctrTxt + ciphertxt.join('');
            ciphertext = ciphertext.Base64encode();
            return ciphertext;
        };

        this.decrypt = function (ciphertext) {
            ciphertext = ciphertext.Base64decode();
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

            key = cipher(pwBytes, keyExpansion(pwBytes));
            key = key.concat(key.slice(0, nBytes - 16));
            counterBlock = new Array(8);
            ctrTxt = ciphertext.slice(0, 8);
            for (i = 0; i < 8; i += 1) {
                counterBlock[i] = ctrTxt.charCodeAt(i);
            }

            keySchedule = keyExpansion(key);
            nBlocks = Math.ceil((ciphertext.length - 8) / blockSize);
            ct = new Array(nBlocks);
            for (b = 0; b < nBlocks; b += 1) {
                ct[b] = ciphertext.slice(8 + b * blockSize, 8 + b * blockSize + blockSize);
            }

            ciphertext = ct;
            plaintxt = new Array(ciphertext.length);

            for (b = 0; b < nBlocks; b += 1) {
                for (c = 0; c < 4; c += 1) {
                    counterBlock[15 - c] = ((b) >>> c * 8) & 0xff;
                }

                for (c = 0; c < 4; c += 1) {
                    counterBlock[15 - c - 4] = (((b + 1) / 0x100000000 - 1) >>> c * 8) & 0xff;
                }

                cipherCntr = cipher(counterBlock, keySchedule);
                plaintxtByte = new Array(ciphertext[b].length);
                for (i = 0; i < ciphertext[b].length; i += 1) {
                    plaintxtByte[i] = cipherCntr[i] ^ ciphertext[b].charCodeAt(i);
                    plaintxtByte[i] = String.fromCharCode(plaintxtByte[i]);
                }

                plaintxt[b] = plaintxtByte.join('');
            }

            plaintext = plaintxt.join('');
            plaintext = plaintext.Utf8decode();
            return plaintext;
        };
    },
    /*jslint bitwise: true */

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
