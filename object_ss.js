
/////////////////////////////////////////////////////////////////////
//                          ss OBJECT
// this object is used for setting/getting session storage specific functions.
/////////////////////////////////////////////////////////////////////

ss = {
    namespace: 'caap',

    fireFoxUseGM: false,

    useRison: true,

    // use these to set/get values in a way that prepends the game's name
    setItem: function (name, value, hpack, compress) {
        try {
            var stringified = '',
                compressor  = null,
                storageStr  = '',
                hpackArr    = [],
                reportEnc   = 'JSON.stringify';

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (value === undefined || value === null) {
                throw "Value supplied is 'undefined' or 'null'! (" + value + ")";
            }

            if (ss.useRison) {
                reportEnc = "rison.encode";
            }

            hpack = (typeof hpack !== 'number') ? false : hpack;
            if (hpack !== false && hpack >= 0 && hpack <= 3) {
                hpackArr = JSON.hpack(value, hpack);
                if (ss.useRison) {
                    stringified = rison.encode(hpackArr);
                } else {
                    stringified = JSON.stringify(hpackArr);
                }

                if (stringified === undefined || stringified === null) {
                    throw reportEnc + " returned 'undefined' or 'null'! (" + stringified + ")";
                }

                if (ss.useRison) {
                    stringified = "R-HPACK " + stringified;
                } else {
                    stringified = "HPACK " + stringified;
                }
            } else {
                if (ss.useRison) {
                    stringified = rison.encode(value);
                } else {
                    stringified = JSON.stringify(value);
                }

                if (stringified === undefined || stringified === null) {
                    throw reportEnc + " returned 'undefined' or 'null'! (" + stringified + ")";
                }

                if (ss.useRison) {
                    stringified = "RISON " + stringified;
                }
            }

            compress = (typeof compress !== 'boolean') ? false : compress;
            if (compress) {
                compressor = new utility.LZ77();
                storageStr = "LZ77 " + compressor.compress(stringified);
                utility.log(2, "Compressed storage", name, ((storageStr.length / stringified.length) * 100).dp(2));
            } else {
                storageStr = stringified;
            }

            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            if (utility.is_html5_sessionStorage && !ss.fireFoxUseGM) {
                sessionStorage.setItem(ss.namespace + "." + caap.stats['FBID'] + "." + name, storageStr);
            } else {
                GM_setValue(ss.namespace + "." + caap.stats['FBID'] + "." + name, storageStr);
            }
            /*jslint sub: false */

            return value;
        } catch (error) {
            utility.error("ERROR in ss.setItem: " + error, {'name': name, 'value': value}, arguments.callee.caller);
            return undefined;
        }
    },

    getItem: function (name, value, hidden) {
        try {
            var jsObj      = null,
                compressor = null,
                storageStr = '';

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            if (utility.is_html5_sessionStorage && !ss.fireFoxUseGM) {
                storageStr = sessionStorage.getItem(ss.namespace + "." + caap.stats['FBID'] + "." + name);
            } else {
                storageStr = GM_getValue(ss.namespace + "." + caap.stats['FBID'] + "." + name);
            }
            /*jslint sub: false */

            if (storageStr) {
                if (storageStr.match(/^LZ77 /)) {
                    compressor = new utility.LZ77();
                    storageStr = compressor.decompress(storageStr.slice(5));
                    utility.log(2, "Decompressed storage", name);
                }

                if (storageStr) {
                    if (storageStr.match(/^R-HPACK /)) {
                        jsObj = JSON.hunpack(rison.decode(storageStr.slice(8)));
                    } else if (storageStr.match(/^RISON /)) {
                        jsObj = rison.decode(storageStr.slice(6));
                    } else if (storageStr.match(/^HPACK /)) {
                        jsObj = JSON.hunpack($.parseJSON(storageStr.slice(6)));
                    } else {
                        jsObj = $.parseJSON(storageStr);
                    }
                }
            }

            if (jsObj === undefined || jsObj === null) {
                if (!hidden) {
                    utility.warn("ss.getItem parsed string returned 'undefined' or 'null' for ", name);
                }

                if (value !== undefined && value !== null) {
                    hidden = (typeof hidden !== 'boolean') ? false : hidden;
                    if (!hidden) {
                        utility.warn("ss.getItem using default value ", value);
                    }

                    jsObj = value;
                } else {
                    throw "No default value supplied! (" + value + ")";
                }
            }

            return jsObj;
        } catch (error) {
            utility.error("ERROR in ss.getItem: " + error, arguments.callee.caller);
            if (error.match(/Invalid JSON/)) {
                if (value !== undefined && value !== null) {
                    ss.setItem(name, value);
                    return value;
                } else {
                    ss.deleteItem(name);
                }
            }

            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
            /*jslint sub: true */
            if (utility.is_html5_sessionStorage && !ss.fireFoxUseGM) {
                sessionStorage.removeItem(ss.namespace + "." + caap.stats['FBID'] + "." + name);
            } else {
                GM_deleteValue(ss.namespace + "." + caap.stats['FBID'] + "." + name);
            }
            /*jslint sub: false */

            return true;
        } catch (error) {
            utility.error("ERROR in ss.deleteItem: " + error, arguments.callee.caller);
            return false;
        }
    },

    clear: function () {
        try {
            var storageKeys = [],
                key         = 0,
                len         = 0,
                done        = false,
                nameRegExp  = new RegExp(ss.namespace);

            if (utility.is_html5_sessionStorage && !ss.fireFoxUseGM) {
                if (utility.is_firefox) {
                    while (!done) {
                        try {
                            if (sessionStorage.key(key) && sessionStorage.key(key).match(nameRegExp)) {
                                sessionStorage.removeItem(sessionStorage.key(key));
                            }

                            key += 1;
                        } catch (e) {
                            done = true;
                        }
                    }
                } else {
                    for (key = 0, len = sessionStorage.length; key < len; key += 1) {
                        if (sessionStorage.key(key) && sessionStorage.key(key).match(nameRegExp)) {
                            sessionStorage.removeItem(sessionStorage.key(key));
                        }
                    }
                }
            } else {
                storageKeys = GM_listValues();
                for (key = 0, len = storageKeys.length; key < len; key += 1) {
                    if (storageKeys[key] && storageKeys[key].match(nameRegExp)) {
                        GM_deleteValue(storageKeys[key]);
                    }
                }
            }

            return true;
        } catch (error) {
            utility.error("ERROR in ss.clear: " + error, arguments.callee.caller);
            return false;
        }
    },

    clear0: function () {
        try {
            var storageKeys = [],
                key         = 0,
                len         = 0,
                done        = false,
                nameRegExp  = new RegExp(ss.namespace + "\\.0\\.");

            if (utility.is_html5_sessionStorage && !ss.fireFoxUseGM) {
                if (utility.is_firefox) {
                    while (!done) {
                        try {
                            if (sessionStorage.key(key) && sessionStorage.key(key).match(nameRegExp)) {
                                sessionStorage.removeItem(sessionStorage.key(key));
                            }

                            key += 1;
                        } catch (e) {
                            done = true;
                        }
                    }
                } else {
                    for (key = 0, len = sessionStorage.length; key < len; key += 1) {
                        if (sessionStorage.key(key) && sessionStorage.key(key).match(nameRegExp)) {
                            sessionStorage.removeItem(sessionStorage.key(key));
                        }
                    }
                }
            } else {
                storageKeys = GM_listValues();
                for (key = 0, len = storageKeys.length; key < len; key += 1) {
                    if (storageKeys[key] && storageKeys[key].match(nameRegExp)) {
                        GM_deleteValue(storageKeys[key]);
                    }
                }
            }

            return true;
        } catch (error) {
            utility.error("ERROR in ss.clear0: " + error, arguments.callee.caller);
            return false;
        }
    },

    used: function () {
        try {
            if (utility.is_html5_sessionStorage && !ss.fireFoxUseGM) {
                var key         = 0,
                    len         = 0,
                    charsCaap   = 0,
                    chars       = 0,
                    caapPerc    = 0,
                    totalPerc   = 0,
                    message     = '',
                    done        = false,
                    nameRegExp  = new RegExp(ss.namespace + "\\.");

                if (utility.is_firefox) {
                    while (!done) {
                        try {
                            chars += sessionStorage.getItem(sessionStorage.key(key)).length;
                            if (sessionStorage.key(key).match(nameRegExp)) {
                                charsCaap += sessionStorage.getItem(sessionStorage.key(key)).length;
                            }

                            key += 1;
                        } catch (e) {
                            done = true;
                        }
                    }

                } else {
                    for (key = 0, len = sessionStorage.length; key < len; key += 1) {
                        chars += sessionStorage.getItem(sessionStorage.key(key)).length;
                        if (sessionStorage.key(key).match(nameRegExp)) {
                            charsCaap += sessionStorage.getItem(sessionStorage.key(key)).length;
                        }
                    }
                }

                caapPerc = ((charsCaap * 2.048 / 5242880) * 100).dp();
                utility.log(1, "CAAP sessionStorage used: " + caapPerc + "%");
                totalPerc = ((chars * 2.048 / 5242880) * 100).dp();
                if (totalPerc >= 90) {
                    utility.warn("Total sessionStorage used: " + totalPerc + "%");
                    message = "<div style='text-align: center;'>";
                    message += "<span style='color: red; font-size: 14px; font-weight: bold;'>WARNING!</span><br />";
                    message += "sessionStorage usage for domain: " + totalPerc + "%<br />";
                    message += "CAAP is using: " + totalPerc + "%";
                    message += "</div>";
                    window.setTimeout(function () {
                        utility.alert(message, "sessionStorage");
                    }, 5000);
                } else {
                    utility.log(1, "Total sessionStorage used: " + totalPerc + "%");
                }
            }

            return true;
        } catch (error) {
            utility.error("ERROR in ss.used: " + error, arguments.callee.caller);
            return false;
        }
    }
};
