/////////////////////////////////////////////////////////////////////
//                          gm OBJECT
// this object is used for setting/getting GM specific functions.
/////////////////////////////////////////////////////////////////////

gm = {
    // use to log stuff
    log: function (mess) {
        GM_log('v' + caapVersion + ' (' + (new Date()).toLocaleTimeString() + ') : ' + mess);
    },

    debugGM: false,

    debug: function (mess) {
        if (this.debugGM) {
            this.log(mess);
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
            global.error("ERROR in gm.isInt: " + err);
            return false;
        }
    },

    // use these to set/get values in a way that prepends the game's name
    setValue: function (n, v) {
        try {
            this.debug('Set ' + n + ' to ' + v);
            if (this.isInt(v)) {
                if (v > 999999999 && !global.is_chrome) {
                    v = v + '';
                } else {
                    v = Number(v);
                }
            }

            GM_setValue(global.gameName + "__" + n, v);
            return v;
        } catch (err) {
            global.error("ERROR in gm.setValue: " + err);
            return null;
        }
    },

    setJValue: function (name, value) {
        try {
            var jsonStr = JSON.stringify(value);

            if (global.is_chrome) {
                localStorage.setItem(global.gameName + "__" + name, jsonStr);
            } else {
                GM_setValue(global.gameName + "__" + name, jsonStr);
            }

            return value;
        } catch (error) {
            console.log("ERROR in gm.setJValue: " + error);
            return null;
        }
    },

    getJValue: function (name, value) {
        try {
            var jsonObj = null;

            $.parseJSON(localStorage.getItem(name));
            if (global.is_chrome) {
                jsonObj = $.parseJSON(localStorage.getItem(global.gameName + "__" + name));
            } else {
                jsonObj = $.parseJSON(GM_getValue(global.gameName + "__" + name));
            }

            if (!jsonObj && value) {
                return value;
            }

            return jsonObj;
        } catch (error) {
            console.log("ERROR in gm.getJValue: " + error);
            return null;
        }
    },

    getValue: function (n, v) {
        var ret = GM_getValue(global.gameName + "__" + n, v);
        this.debug('Get ' + n + ' value ' + ret);
        return ret;
    },

    deleteValue: function (n) {
        this.debug('Delete ' + n + ' value ');
        GM_deleteValue(global.gameName + "__" + n);
    },

    setList: function (n, v) {
        if (!$.isArray(v)) {
            global.log(1, 'Attempted to SetList ' + n + ' to ' + v.toString() + ' which is not an array.');
            return undefined;
        }

        GM_setValue(global.gameName + "__" + n, v.join(global.os));
        return v;
    },

    getList: function (n) {
        var getTheList = GM_getValue(global.gameName + "__" + n, ''),
            ret        = [];

        this.debug('GetList ' + n + ' value ' + getTheList);
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

    listPop: function (listName) {
        var popList = this.getList(listName),
            popItem = null;

        if (!popList.length) {
            return null;
        }

        popItem = popList.pop();
        this.setList(listName, popList);
        return popItem;
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
                this.debug('Removing ' + pushItem + ' from ' + listName + '.');
            }
        }

        this.setList(listName, list);
    },

    listFindItemByPrefix: function (list, prefix) {
        var itemList = list.filter(function (item) {
            return item.indexOf(prefix) === 0;
        });

        this.debug('List: ' + list + ' prefix ' + prefix + ' filtered ' + itemList);
        if (itemList.length) {
            return itemList[0];
        }

        return null;
    },

    setObjVal: function (objName, label, value) {
        var objStr  = this.getValue(objName),
            itemStr = '',
            objList = [];

        if (!objStr) {
            this.setValue(objName, label + global.ls + value);
            return;
        }

        itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            this.setValue(objName, label + global.ls + value + global.vs + objStr);
            return;
        }

        objList = objStr.split(global.vs);
        objList.splice(objList.indexOf(itemStr), 1, label + global.ls + value);
        this.setValue(objName, objList.join(global.vs));
    },

    getObjVal: function (objName, label, defaultValue) {
        var objStr  = '',
            itemStr = '';

        if (objName.indexOf(global.ls) < 0) {
            objStr = this.getValue(objName);
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
    },

    getListObjVal: function (listName, objName, label, defaultValue) {
        var gLOVlist = this.getList(listName),
            objStr   = '',
            itemStr  = '';

        if (!(gLOVlist.length)) {
            return defaultValue;
        }

        this.debug('have list ' + gLOVlist);
        objStr = this.listFindItemByPrefix(gLOVlist, objName + global.vs);
        if (!objStr) {
            return defaultValue;
        }

        this.debug('have obj ' + objStr);
        itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            return defaultValue;
        }

        this.debug('have val ' + itemStr);
        return itemStr.split(global.ls)[1];
    },

    setListObjVal: function (listName, objName, label, value, max) {
        var objList = this.getList(listName),
            objStr  = '',
            valList = [],
            valStr  = '';

        if (!(objList.length)) {
            this.setValue(listName, objName + global.vs + label + global.ls + value);
            return;
        }

        objStr = this.listFindItemByPrefix(objList, objName + global.vs);
        if (!objStr) {
            this.listPush(listName, objName + global.vs + label + global.ls + value, max);
            return;
        }

        valList = objStr.split(global.vs);
        valStr = this.listFindItemByPrefix(valList, label + global.ls);
        if (!valStr) {
            valList.push(label + global.ls + value);
            objList.splice(objList.indexOf(objStr), 1, objStr + global.vs + label + global.ls + value);
            this.setList(listName, objList);
            return;
        }

        valList.splice(valList.indexOf(valStr), 1, label + global.ls + value);
        objList.splice(objList.indexOf(objStr), 1, valList.join(global.vs));
        this.setList(listName, objList);
    },

    deleteListObj: function (listName, objName) {
        var objList = this.getList(listName),
            objStr  = '';

        if (!(objList.length)) {
            return;
        }

        objStr = this.listFindItemByPrefix(objList, objName);
        if (objStr) {
            objList.splice(objList.indexOf(objStr), 1);
            this.setList(listName, objList);
        }
    },

    getNumber: function (name, defaultValue) {
        try {
            var value  = this.getValue(name),
                number = null;

            if ((!value && value !== 0) || isNaN(value)) {
                if ((!defaultValue && defaultValue !== 0) || isNaN(defaultValue)) {
                    throw "Value of " + name + " and defaultValue are not numbers: " +
                        "'" + value + "', '" + defaultValue + "'";
                } else {
                    number = defaultValue;
                }
            } else {
                number = value;
            }

            //alert("Name: " + name + " Number: " + number + " Default: " + defaultValue);
            return Number(number);
        } catch (err) {
            global.error("ERROR in GetNumber: " + err);
            return '';
        }
    }
};
