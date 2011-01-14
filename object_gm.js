
/////////////////////////////////////////////////////////////////////
//                          gm OBJECT
// this object is used for setting/getting GM specific functions.
/////////////////////////////////////////////////////////////////////

gm = {
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

            if (gm.useRison) {
                reportEnc = "rison.encode";
            }

            hpack = (typeof hpack !== 'number') ? false : hpack;
            if (hpack !== false && hpack >= 0 && hpack <= 3) {
                hpackArr = JSON.hpack(value, hpack);
                if (gm.useRison) {
                    stringified = rison.encode(hpackArr);
                } else {
                    stringified = JSON.stringify(hpackArr);
                }

                if (stringified === undefined || stringified === null) {
                    throw reportEnc + " returned 'undefined' or 'null'! (" + stringified + ")";
                }

                if (gm.useRison) {
                    stringified = "R-HPACK " + stringified;
                } else {
                    stringified = "HPACK " + stringified;
                }
            } else {
                if (gm.useRison) {
                    stringified = rison.encode(value);
                } else {
                    stringified = JSON.stringify(value);
                }

                if (stringified === undefined || stringified === null) {
                    throw reportEnc + " returned 'undefined' or 'null'! (" + stringified + ")";
                }

                if (gm.useRison) {
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
            if (utility.is_html5_localStorage && !gm.fireFoxUseGM) {
                localStorage.setItem(gm.namespace + "." + caap.stats['FBID'] + "." + name, storageStr);
            } else {
                GM_setValue(gm.namespace + "." + caap.stats['FBID'] + "." + name, storageStr);
            }
            /*jslint sub: false */

            return value;
        } catch (error) {
            utility.error("ERROR in gm.setItem: " + error, {'name': name, 'value': value}, arguments.callee.caller);
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
            if (utility.is_html5_localStorage && !gm.fireFoxUseGM) {
                storageStr = localStorage.getItem(gm.namespace + "." + caap.stats['FBID'] + "." + name);
            } else {
                storageStr = GM_getValue(gm.namespace + "." + caap.stats['FBID'] + "." + name);
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
                        jsObj = JSON.hunpack($j.parseJSON(storageStr.slice(6)));
                    } else {
                        jsObj = $j.parseJSON(storageStr);
                    }
                }
            }

            if (jsObj === undefined || jsObj === null) {
                if (!hidden) {
                    utility.warn("gm.getItem parsed string returned 'undefined' or 'null' for ", name);
                }

                if (value !== undefined && value !== null) {
                    hidden = (typeof hidden !== 'boolean') ? false : hidden;
                    if (!hidden) {
                        utility.warn("gm.getItem using default value ", value);
                    }

                    jsObj = value;
                } else {
                    throw "No default value supplied! (" + value + ")";
                }
            }

            return jsObj;
        } catch (error) {
            utility.error("ERROR in gm.getItem: " + error, arguments.callee.caller);
            if (error.match(/Invalid JSON/)) {
                if (value !== undefined && value !== null) {
                    gm.setItem(name, value);
                    return value;
                } else {
                    gm.deleteItem(name);
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
            if (utility.is_html5_localStorage && !gm.fireFoxUseGM) {
                localStorage.removeItem(gm.namespace + "." + caap.stats['FBID'] + "." + name);
            } else {
                GM_deleteValue(gm.namespace + "." + caap.stats['FBID'] + "." + name);
            }
            /*jslint sub: false */

            return true;
        } catch (error) {
            utility.error("ERROR in gm.deleteItem: " + error, arguments.callee.caller);
            return false;
        }
    },

    clear: function () {
        try {
            var storageKeys = [],
                key         = 0,
                len         = 0,
                done        = false,
                nameRegExp  = new RegExp(gm.namespace);

            if (utility.is_html5_localStorage && !gm.fireFoxUseGM) {
                if (utility.is_firefox) {
                    while (!done) {
                        try {
                            if (localStorage.key(key) && localStorage.key(key).match(nameRegExp)) {
                                localStorage.removeItem(localStorage.key(key));
                            }

                            key += 1;
                        } catch (e) {
                            done = true;
                        }
                    }
                } else {
                    for (key = 0, len = localStorage.length; key < len; key += 1) {
                        if (localStorage.key(key) && localStorage.key(key).match(nameRegExp)) {
                            localStorage.removeItem(localStorage.key(key));
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
            utility.error("ERROR in gm.clear: " + error, arguments.callee.caller);
            return false;
        }
    },

    clear0: function () {
        try {
            var storageKeys = [],
                key         = 0,
                len         = 0,
                done        = false,
                nameRegExp  = new RegExp(gm.namespace + "\\.0\\.");

            if (utility.is_html5_localStorage && !gm.fireFoxUseGM) {
                if (utility.is_firefox) {
                    while (!done) {
                        try {
                            if (localStorage.key(key) && localStorage.key(key).match(nameRegExp)) {
                                localStorage.removeItem(localStorage.key(key));
                            }

                            key += 1;
                        } catch (e) {
                            done = true;
                        }
                    }
                } else {
                    for (key = 0, len = localStorage.length; key < len; key += 1) {
                        if (localStorage.key(key) && localStorage.key(key).match(nameRegExp)) {
                            localStorage.removeItem(localStorage.key(key));
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
            utility.error("ERROR in gm.clear0: " + error, arguments.callee.caller);
            return false;
        }
    },

    used: function () {
        try {
            if (utility.is_html5_localStorage && !gm.fireFoxUseGM) {
                var key         = 0,
                    len         = 0,
                    charsCaap   = 0,
                    chars       = 0,
                    caapPerc    = 0,
                    totalPerc   = 0,
                    message     = '',
                    done        = false,
                    nameRegExp  = new RegExp(gm.namespace + "\\.");

                if (utility.is_firefox) {
                    while (!done) {
                        try {
                            chars += localStorage.getItem(localStorage.key(key)).length;
                            if (localStorage.key(key).match(nameRegExp)) {
                                charsCaap += localStorage.getItem(localStorage.key(key)).length;
                            }

                            key += 1;
                        } catch (e) {
                            done = true;
                        }
                    }

                } else {
                    for (key = 0, len = localStorage.length; key < len; key += 1) {
                        chars += localStorage.getItem(localStorage.key(key)).length;
                        if (localStorage.key(key).match(nameRegExp)) {
                            charsCaap += localStorage.getItem(localStorage.key(key)).length;
                        }
                    }
                }

                caapPerc = ((charsCaap * 2.048 / 5242880) * 100).dp();
                utility.log(1, "CAAP localStorage used: " + caapPerc + "%");
                totalPerc = ((chars * 2.048 / 5242880) * 100).dp();
                if (totalPerc >= 90) {
                    utility.warn("Total localStorage used: " + totalPerc + "%");
                    message = "<div style='text-align: center;'>";
                    message += "<span style='color: red; font-size: 14px; font-weight: bold;'>WARNING!</span><br />";
                    message += "localStorage usage for domain: " + totalPerc + "%<br />";
                    message += "CAAP is using: " + totalPerc + "%";
                    message += "</div>";
                    window.setTimeout(function () {
                        utility.alert(message, "LocalStorage");
                    }, 5000);
                } else {
                    utility.log(1, "Total localStorage used: " + totalPerc + "%");
                }
            }

            return true;
        } catch (error) {
            utility.error("ERROR in gm.used: " + error, arguments.callee.caller);
            return false;
        }
    }
};
