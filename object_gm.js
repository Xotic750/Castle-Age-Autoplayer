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
        if (caapGlob.debug) {
            this.log(mess);
        }
    },

    // use these to set/get values in a way that prepends the game's name
    setValue: function (n, v) {
        this.debug('Set ' + n + ' to ' + v);
        GM_setValue(caapGlob.gameName + "__" + n, v);
        return v;
    },

    getValue: function (n, v) {
        var ret = GM_getValue(caapGlob.gameName + "__" + n, v);
        this.debug('Get ' + n + ' value ' + ret);
        return ret;
    },

    deleteValue: function (n) {
        this.debug('Delete ' + n + ' value ');
        GM_deleteValue(caapGlob.gameName + "__" + n);
    },

    IsArray: function (testObject) {
        return testObject && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
    },

    setList: function (n, v) {
        if (!this.IsArray(v)) {
            this.log('Attempted to SetList ' + n + ' to ' + v.toString() + ' which is not an array.');
            return undefined;
        }

        GM_setValue(caapGlob.gameName + "__" + n, v.join(caapGlob.os));
        return v;
    },

    getList: function (n) {
        var getTheList = GM_getValue(caapGlob.gameName + "__" + n, '');
        this.debug('GetList ' + n + ' value ' + getTheList);
        var ret = [];
        if (getTheList !== '') {
            ret = getTheList.split(caapGlob.os);
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
            this.setValue(objName, label + caapGlob.ls + value);
            return;
        }

        var itemStr = this.listFindItemByPrefix(objStr.split(caapGlob.vs), label + caapGlob.ls);
        if (!itemStr) {
            this.setValue(objName, label + caapGlob.ls + value + caapGlob.vs + objStr);
            return;
        }

        var objList = objStr.split(caapGlob.vs);
        objList.splice(objList.indexOf(itemStr), 1, label + caapGlob.ls + value);
        this.setValue(objName, objList.join(caapGlob.vs));
    },

    getObjVal: function (objName, label, defaultValue) {
        var objStr = null;
        if (objName.indexOf(caapGlob.ls) < 0) {
            objStr = this.getValue(objName);
        } else {
            objStr = objName;
        }

        if (!objStr) {
            return defaultValue;
        }

        var itemStr = this.listFindItemByPrefix(objStr.split(caapGlob.vs), label + caapGlob.ls);
        if (!itemStr) {
            return defaultValue;
        }

        return itemStr.split(caapGlob.ls)[1];
    },

    getListObjVal: function (listName, objName, label, defaultValue) {
        var gLOVlist = this.getList(listName);
        if (!(gLOVlist.length)) {
            return defaultValue;
        }

        this.debug('have list ' + gLOVlist);
        var objStr = this.listFindItemByPrefix(gLOVlist, objName + caapGlob.vs);
        if (!objStr) {
            return defaultValue;
        }

        this.debug('have obj ' + objStr);
        var itemStr = this.listFindItemByPrefix(objStr.split(caapGlob.vs), label + caapGlob.ls);
        if (!itemStr) {
            return defaultValue;
        }

        this.debug('have val ' + itemStr);
        return itemStr.split(caapGlob.ls)[1];
    },

    setListObjVal: function (listName, objName, label, value, max) {
        var objList = this.getList(listName);
        if (!(objList.length)) {
            this.setValue(listName, objName + caapGlob.vs + label + caapGlob.ls + value);
            return;
        }

        var objStr = this.listFindItemByPrefix(objList, objName + caapGlob.vs);
        if (!objStr) {
            this.listPush(listName, objName + caapGlob.vs + label + caapGlob.ls + value, max);
            return;
        }

        var valList = objStr.split(caapGlob.vs);
        var valStr = this.listFindItemByPrefix(valList, label + caapGlob.ls);
        if (!valStr) {
            valList.push(label + caapGlob.ls + value);
            objList.splice(objList.indexOf(objStr), 1, objStr + caapGlob.vs + label + caapGlob.ls + value);
            this.setList(listName, objList);
            return;
        }

        valList.splice(valList.indexOf(valStr), 1, label + caapGlob.ls + value);
        objList.splice(objList.indexOf(objStr), 1, valList.join(caapGlob.vs));
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
            var errStr = "ERROR in GetNumber: " + err;
            this.log(errStr);
            alert(errStr);
            return '';
        }
    }
};
