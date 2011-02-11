
    ////////////////////////////////////////////////////////////////////
    //                          config OBJECT
    // this is the main object for dealing with user options
    /////////////////////////////////////////////////////////////////////

    config = {
        options: {},

        load: function () {
            try {
                config.options = gm.getItem('config.options', 'default');
                if (config.options === 'default' || !$j.isPlainObject(config.options)) {
                    config.options = gm.setItem('config.options', {});
                }

                $u.log(5, "config.load", config.options);
                return true;
            } catch (err) {
                $u.error("ERROR in config.load: " + err);
                return false;
            }
        },

        save: function (force) {
            try {
                gm.setItem('config.options', config.options);
                $u.log(5, "config.save", config.options);
                return true;
            } catch (err) {
                $u.error("ERROR in config.save: " + err);
                return false;
            }
        },

        setItem: function (name, value) {
            try {
                if (!$u.isString(name) || name === '') {
                    throw "Invalid identifying name!";
                }

                if (!$u.isDefined(value)) {
                    throw "Value supplied is 'undefined' or 'null'!";
                }

                config.options[name] = value;
                config.save();
                return value;
            } catch (err) {
                $u.error("ERROR in config.setItem: " + err);
                return undefined;
            }
        },

        getItem: function (name, value) {
            try {
                var item;
                if (!$u.isString(name) || name === '') {
                    throw "Invalid identifying name!";
                }

                item = config.options[name];
                if (!$u.isDefined(item) && $u.isDefined(value)) {
                    item = value;
                }

                if (!$u.isDefined(item)) {
                    $u.warn("config.getItem returned 'undefined' or 'null' for", name);
                }

                return item;
            } catch (err) {
                $u.error("ERROR in config.getItem: " + err);
                return undefined;
            }
        },

        getList: function (name, value) {
            try {
                var item = [];
                if (!$u.isString(name) || name === '') {
                    throw "Invalid identifying name!";
                }

                item = config.getItem(name, value).toArray();
                return item;
            } catch (err) {
                $u.error("ERROR in config.getArray: " + err);
                return undefined;
            }
        },

        deleteItem: function (name) {
            try {
                if (!$u.isString(name) || name === '') {
                    throw "Invalid identifying name!";
                }

                if (!$u.isDefined(config.options[name])) {
                    $u.warn("config.deleteItem - Invalid or non-existant flag: ", name);
                }

                delete config.options[name];
                return true;
            } catch (err) {
                $u.error("ERROR in config.deleteItem: " + err);
                return false;
            }
        },

        saveDialog: function () {
            try {
                var h = '',
                    w = $j("#caap_save");;

                if (!$u.hasContent(w)) {
                    h = "<textarea style='resize:none;width:400px;height:400px;' disabled>" + JSON.stringify(config.options, null, "\t") + "</textarea>";
                    w = $j('<div id="caap_save" title="Save Config">' + h + '</div>').appendTo(document.body);
                    w.dialog({
                        resizable : false,
                        width     : 'auto',
                        height    : 'auto',
                        buttons   : {
                            "Ok": function () {
                                w.dialog("destroy").remove();
                            }
                        },
                        close     : function () {
                            w.dialog("destroy").remove();
                        }
                    });
                }

                return w;
            } catch (err) {
                $u.error("ERROR in config.saveDialog: " + err);
                return undefined;
            }
        },

        loadDialog: function () {
            try {
                var h = '',
                    w = $j("#caap_load"),
                    l = {},
                    v = '';

                if (!$u.hasContent(w)) {
                    h = "<textarea id='caap_load_config' style='resize:none;width:400px;height:400px;'></textarea>";
                    w = $j('<div id="caap_load" title="Load Config">' + h + '</div>').appendTo(document.body);
                    w.dialog({
                        resizable : false,
                        width     : 'auto',
                        height    : 'auto',
                        buttons   : {
                            "Ok": function () {
                                try {
                                    v = JSON.parse($u.setContent($j("#caap_load_config", w).val(), 'null'));
                                } catch (e) {
                                    v = null
                                }

                                l = $u.setContent(v, 'default');
                                if ($j.isPlainObject(l) && l !== 'default') {
                                    config.options = l;
                                    config.save();
                                    w.dialog("destroy").remove();
                                    caap.ReloadCastleAge(true);
                                } else {
                                    $u.warn("User config was not loaded!", l);
                                }
                            }
                        },
                        close     : function () {
                            w.dialog("destroy").remove();
                        }
                    });
                }

                return w;
            } catch (err) {
                $u.error("ERROR in config.loadDialog: " + err);
                return undefined;
            }
        }
    };
