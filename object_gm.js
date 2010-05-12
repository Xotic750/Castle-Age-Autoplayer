/////////////////////////////////////////////////////////////////////
//                          gm OBJECT
// this object is used for setting/getting GM specific functions.
/////////////////////////////////////////////////////////////////////

gm = {
    // use to log stuff
    log: function (mess) {
        var now = new Date();
        var t_hour = now.getHours();
        var t_min = now.getMinutes();
        var t_sec = now.getSeconds();

        t_hour = t_hour + "";
        if (t_hour.length === 1) {
            t_hour = "0" + t_hour;
        }

        t_min = t_min + "";
        if (t_min.length === 1) {
            t_min = "0" + t_min;
        }

        t_sec = t_sec + "";
        if (t_sec.length === 1) {
            t_sec = "0" + t_sec;
        }

        var time = t_hour + ':' + t_min + ':' + t_sec;
        GM_log('v' + caapVersion + ' (' + time + ') : ' + mess);
    },

    debug: function (mess) {
        if (global.debug) {
            this.log(mess);
        }
    },

    isInt: function (value) {
        var vstr = value.toString();
        if (/[\n\t\f,]/.test(vstr) || (vstr.length > 1 && vstr.substring(0, 1) === '0')) {
            return false;
        }

        var pInt = parseInt(value, 10);
        if ((parseFloat(value) == pInt) && !isNaN(pInt)) {
            return true;
        } else {
            return false;
        }
    },

    // use these to set/get values in a way that prepends the game's name
    setValue: function (n, v) {
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

    IsArray: function (testObject) {
        return testObject && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
    },

    setList: function (n, v) {
        if (!this.IsArray(v)) {
            this.log('Attempted to SetList ' + n + ' to ' + v.toString() + ' which is not an array.');
            return undefined;
        }

        GM_setValue(global.gameName + "__" + n, v.join(global.os));
        return v;
    },

    getList: function (n) {
        var getTheList = GM_getValue(global.gameName + "__" + n, '');
        this.debug('GetList ' + n + ' value ' + getTheList);
        var ret = [];
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
        var popList = this.getList(listName);
        if (!popList.length) {
            return null;
        }

        var popItem = popList.pop();
        this.setList(listName, popList);
        return popItem;
    },

    listPush: function (listName, pushItem, max) {
        var list = this.getList(listName);

        // Only add if it isn't already there.
        if (list.indexOf(pushItem) != -1) {
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
        var objStr = this.getValue(objName);
        if (!objStr) {
            this.setValue(objName, label + global.ls + value);
            return;
        }

        var itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            this.setValue(objName, label + global.ls + value + global.vs + objStr);
            return;
        }

        var objList = objStr.split(global.vs);
        objList.splice(objList.indexOf(itemStr), 1, label + global.ls + value);
        this.setValue(objName, objList.join(global.vs));
    },

    getObjVal: function (objName, label, defaultValue) {
        var objStr = null;
        if (objName.indexOf(global.ls) < 0) {
            objStr = this.getValue(objName);
        } else {
            objStr = objName;
        }

        if (!objStr) {
            return defaultValue;
        }

        var itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            return defaultValue;
        }

        return itemStr.split(global.ls)[1];
    },

    getListObjVal: function (listName, objName, label, defaultValue) {
        var gLOVlist = this.getList(listName);
        if (!(gLOVlist.length)) {
            return defaultValue;
        }

        this.debug('have list ' + gLOVlist);
        var objStr = this.listFindItemByPrefix(gLOVlist, objName + global.vs);
        if (!objStr) {
            return defaultValue;
        }

        this.debug('have obj ' + objStr);
        var itemStr = this.listFindItemByPrefix(objStr.split(global.vs), label + global.ls);
        if (!itemStr) {
            return defaultValue;
        }

        this.debug('have val ' + itemStr);
        return itemStr.split(global.ls)[1];
    },

    setListObjVal: function (listName, objName, label, value, max) {
        var objList = this.getList(listName);
        if (!(objList.length)) {
            this.setValue(listName, objName + global.vs + label + global.ls + value);
            return;
        }

        var objStr = this.listFindItemByPrefix(objList, objName + global.vs);
        if (!objStr) {
            this.listPush(listName, objName + global.vs + label + global.ls + value, max);
            return;
        }

        var valList = objStr.split(global.vs);
        var valStr = this.listFindItemByPrefix(valList, label + global.ls);
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
        var objList = this.getList(listName);
        if (!(objList.length)) {
            return;
        }

        var objStr = this.listFindItemByPrefix(objList, objName);
        if (objStr) {
            objList.splice(objList.indexOf(objStr), 1);
            this.setList(listName, objList);
        }
    },

    getNumber: function (name, defaultValue) {
        try {
            var value = this.getValue(name);
            var number = null;
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
            this.log("ERROR in GetNumber: " + err);
            return '';
        }
    }
};
