
/////////////////////////////////////////////////////////////////////
//                          gm OBJECT
// this object is used for setting/getting GM specific functions.
/////////////////////////////////////////////////////////////////////

gm = {
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

            if (global.is_html5_storage && !this.fireFoxUseGM) {
                localStorage.setItem(global.namespace + "." + caap.stats.FBID + "." + name, jsonStr);
            } else {
                GM_setValue(global.namespace + "." + caap.stats.FBID + "." + name, jsonStr);
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

            if (global.is_html5_storage && !this.fireFoxUseGM) {
                jsonObj = $.parseJSON(localStorage.getItem(global.namespace + "." + caap.stats.FBID + "." + name));
            } else {
                jsonObj = $.parseJSON(GM_getValue(global.namespace + "." + caap.stats.FBID + "." + name));
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

            if (global.is_html5_storage && !this.fireFoxUseGM) {
                localStorage.removeItem(global.namespace + "." + caap.stats.FBID + "." + name);
            } else {
                GM_deleteValue(global.namespace + "." + caap.stats.FBID + "." + name);
            }

            return true;
        } catch (error) {
            utility.error("ERROR in gm.deleteItem: " + error, arguments.callee.caller);
            return false;
        }
    },

    clear: function () {
        try {
            if (global.is_html5_storage && !this.fireFoxUseGM) {
                localStorage.clear();
            } else {
                var storageKeys = [],
                    key         = 0;

                storageKeys = GM_listValues();
                for (key = 0; key < storageKeys.length; key += 1) {
                    if (storageKeys[key].match(new RegExp(global.namespace + "." + caap.stats.FBID))) {
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

    setList: function (n, v) {
        if (!$.isArray(v)) {
            utility.warn('Attempted to SetList ' + n + ' to ' + v.toString() + ' which is not an array.');
            return undefined;
        }

        this.setItem(n, v.join(global.os));
        return v;
    },

    getList: function (n) {
        var getTheList = this.getItem(n, 'default'),
            ret        = [];

        if (getTheList === 'default') {
            getTheList = this.setItem(n, '');
        }

        if (getTheList !== '') {
            ret = getTheList.split(global.os);
        }

        return ret;
    },

    listAddBefore: function (listName, addList) {
        var newList = addList.concat(this.getList(listName));
        this.setList(listName, newList);
        return newList;
    },

    listPush: function (listName, pushItem, max) {
        var list = this.getList(listName);

        // Only add if it isn't already there.
        if (list.indexOf(pushItem) !== -1) {
            return;
        }

        list.push(pushItem);
        if (max > 0) {
            while (max < list.length) {
                pushItem = list.shift();
            }
        }

        this.setList(listName, list);
    },

    listFindItemByPrefix: function (list, prefix) {
        var itemList = list.filter(function (item) {
            return item.indexOf(prefix) === 0;
        });

        if (itemList.length) {
            return itemList[0];
        }

        return null;
    },

    setObjVal: function (objName, label, value) {
        var objStr  = this.getItem(objName),
            itemStr = '',
            objList = [];

        if (!objStr) {
            this.setItem(objName, label + global.ls + value);
            return;
        }

        itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            this.setItem(objName, label + global.ls + value + global.vs + objStr);
            return;
        }

        objList = objStr.split(global.vs);
        objList.splice(objList.indexOf(itemStr), 1, label + global.ls + value);
        this.setItem(objName, objList.join(global.vs));
    },

    getObjVal: function (objName, label, defaultValue) {
        var objStr  = '',
            itemStr = '';

        if (objName.indexOf(global.ls) < 0) {
            objStr = this.getItem(objName, '', hiddenVar);
        } else {
            objStr = objName;
        }

        if (!objStr) {
            return defaultValue;
        }

        itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            return defaultValue;
        }

        return itemStr.split(global.ls)[1];
    }
};
