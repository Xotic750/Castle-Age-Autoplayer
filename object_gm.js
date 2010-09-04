
/////////////////////////////////////////////////////////////////////
//                          gm OBJECT
// this object is used for setting/getting GM specific functions.
/////////////////////////////////////////////////////////////////////

gm = {
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
            global.log(10, 'Set ' + n + ' to ' + v);
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
            global.error("ERROR in gm.setJValue: " + error);
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
            global.error("ERROR in gm.getJValue: " + error);
            return null;
        }
    },

    getValue: function (n, v) {
        var ret = GM_getValue(global.gameName + "__" + n, v);
        global.log(10, 'Get ' + n + ' value ' + ret);
        return ret;
    },

    deleteValue: function (n) {
        global.log(10, 'Delete ' + n + ' value ');
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

        global.log(10, 'GetList ' + n + ' value ' + getTheList);
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
                global.log(10, 'Removing ' + pushItem + ' from ' + listName + '.');
            }
        }

        this.setList(listName, list);
    },

    listFindItemByPrefix: function (list, prefix) {
        var itemList = list.filter(function (item) {
            return item.indexOf(prefix) === 0;
        });

        global.log(10, 'List: ' + list + ' prefix ' + prefix + ' filtered ' + itemList);
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

            global.log(10, "Name: " + name + " Number: " + number + " Default: " + defaultValue);
            return Number(number);
        } catch (err) {
            global.error("ERROR in GetNumber: " + err);
            return '';
        }
    }
};
