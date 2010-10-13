
/////////////////////////////////////////////////////////////////////
//                          gm OBJECT
// this object is used for setting/getting GM specific functions.
/////////////////////////////////////////////////////////////////////

gm = {
    namespace: 'caap',

    fireFoxUseGM: false,

    // use these to set/get values in a way that prepends the game's name
    setItem: function (name, value) {
        try {
            var jsonStr;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (value === undefined || value === null) {
                throw "Value supplied is 'undefined' or 'null'! (" + value + ")";
            }

            jsonStr = JSON.stringify(value);
            if (jsonStr === undefined || jsonStr === null) {
                throw "JSON.stringify returned 'undefined' or 'null'! (" + jsonStr + ")";
            }

            if (utility.is_html5_storage && !this.fireFoxUseGM) {
                localStorage.setItem(this.namespace + "." + caap.stats.FBID + "." + name, jsonStr);
            } else {
                GM_setValue(this.namespace + "." + caap.stats.FBID + "." + name, jsonStr);
            }

            return value;
        } catch (error) {
            utility.error("ERROR in gm.setItem: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    getItem: function (name, value, hidden) {
        try {
            var jsonObj;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (utility.is_html5_storage && !this.fireFoxUseGM) {
                jsonObj = $.parseJSON(localStorage.getItem(this.namespace + "." + caap.stats.FBID + "." + name));
            } else {
                jsonObj = $.parseJSON(GM_getValue(this.namespace + "." + caap.stats.FBID + "." + name));
            }

            if (jsonObj === undefined || jsonObj === null) {
                if (!hidden) {
                    utility.warn("gm.getItem parseJSON returned 'undefined' or 'null' for ", name);
                }

                if (value !== undefined && value !== null) {
                    if (!hidden) {
                        utility.warn("gm.getItem using default value ", value);
                        //this.setItem(name, value);
                    }

                    jsonObj = value;
                } else {
                    throw "No default value supplied! (" + value + ")";
                }
            }

            return jsonObj;
        } catch (error) {
            utility.error("ERROR in gm.getItem: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (utility.is_html5_storage && !this.fireFoxUseGM) {
                localStorage.removeItem(this.namespace + "." + caap.stats.FBID + "." + name);
            } else {
                GM_deleteValue(this.namespace + "." + caap.stats.FBID + "." + name);
            }

            return true;
        } catch (error) {
            utility.error("ERROR in gm.deleteItem: " + error, arguments.callee.caller);
            return false;
        }
    },

    clear: function () {
        try {
            if (utility.is_html5_storage && !this.fireFoxUseGM) {
                localStorage.clear();
            } else {
                var storageKeys = [],
                    key         = 0;

                storageKeys = GM_listValues();
                for (key = 0; key < storageKeys.length; key += 1) {
                    if (storageKeys[key].match(new RegExp(this.namespace + "." + caap.stats.FBID))) {
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

    length: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            return this.getItem(name, []).length;
        } catch (error) {
            utility.error("ERROR in gm.length: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    splice: function (name, index, howmany) {
        try {
            var newArr   = [],
                removed  = null,
                it       = 0;


            if (arguments.length < 3) {
                throw "Must provide name, index & howmany!";
            }

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (!utility.isNum(index) || index < 0) {
                throw "Invalid index! (" + index + ")";
            }

            if (!utility.isNum(howmany) || howmany < 0) {
                throw "Invalid howmany! (" + howmany + ")";
            }

            newArr = this.getItem(name, []);
            if (arguments.length >= 4) {
                removed = newArr.splice(index, howmany);
                for (it = 3; it < arguments.length; it += 1) {
                    newArr.splice(index + it - 2, 0, arguments[it]);
                }
            } else {
                removed = newArr.splice(index, howmany);
            }

            this.setItem(name, newArr);
            return removed;
        } catch (error) {
            utility.error("ERROR in gm.splice: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    unshift: function (name, element) {
        try {
            var newArr = [],
                length = 0,
                it     = 0;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (arguments.length < 2) {
                throw "Must provide element(s)!";
            }

            newArr = this.getItem(name, []);
            for (it = 1; it < arguments.length; it += 1) {
                length = newArr.unshift(arguments[it]);
            }

            this.setItem(name, newArr);
            return length;
        } catch (error) {
            utility.error("ERROR in gm.unshift: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    shift: function (name) {
        try {
            var newArr   = [],
                shiftVal = null;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            newArr = this.getItem(name, []);
            shiftVal = newArr.shift();
            this.setItem(name, newArr);
            return shiftVal;
        } catch (error) {
            utility.error("ERROR in gm.shift: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    push: function (name, element) {
        try {
            var newArr = [],
                length = 0,
                it     = 0;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            if (arguments.length < 2) {
                throw "Must provide element(s)!";
            }

            newArr = this.getItem(name, []);
            for (it = 1; it < arguments.length; it += 1) {
                length = newArr.push(arguments[it]);
            }

            this.setItem(name, newArr);
            return length;
        } catch (error) {
            utility.error("ERROR in gm.push: " + error, arguments.callee.caller);
            return undefined;
        }
    },

    pop: function (name) {
        try {
            var newArr = [],
                popVal = null;

            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name! (" + name + ")";
            }

            newArr = this.getItem(name, []);
            popVal = newArr.pop();
            this.setItem(name, newArr);
            return popVal;
        } catch (error) {
            utility.error("ERROR in gm.pop: " + error, arguments.callee.caller);
            return undefined;
        }
    }
};
