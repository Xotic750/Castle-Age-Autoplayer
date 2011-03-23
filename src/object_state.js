
    ////////////////////////////////////////////////////////////////////
    //                          state OBJECT
    // this is the main object for dealing with state flags
    /////////////////////////////////////////////////////////////////////

    state = {
        flags: {},

        load: function () {
            try {
                state.flags = gm.getItem('state.flags', 'default');
                if (state.flags === 'default' || !$j.isPlainObject(state.flags)) {
                    state.flags = gm.setItem('state.flags', {});
                }

                $u.log(5, "state.load", state.flags);
                return true;
            } catch (err) {
                $u.error("ERROR in state.load: " + err);
                return false;
            }
        },

        save: function (force) {
            try {
                if (!force) {
                    if (!schedule.check('StateSave')) {
                        return false;
                    }
                }

                gm.setItem('state.flags', state.flags);
                $u.log(5, "state.save", state.flags);
                schedule.setItem('StateSave', 1);
                return true;
            } catch (err) {
                $u.error("ERROR in state.save: " + err);
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

                state.flags[name] = value;
                state.save();
                return value;
            } catch (err) {
                $u.error("ERROR in state.setItem: " + err);
                return undefined;
            }
        },

        getItem: function (name, value) {
            try {
                var item;
                if (!$u.isString(name) || name === '') {
                    throw "Invalid identifying name!";
                }

                item = state.flags[name];
                if (!$u.isDefined(item) && $u.isDefined(value)) {
                    item = value;
                }

                if (!$u.isDefined(item)) {
                    $u.warn("state.getItem returned 'undefined' or 'null' for", name);
                }

                return item;
            } catch (err) {
                $u.error("ERROR in state.getItem: " + err);
                return undefined;
            }
        },

        deleteItem: function (name) {
            try {
                if (!$u.isString(name) || name === '') {
                    throw "Invalid identifying name!";
                }

                if (!$u.isDefined(state.flags[name])) {
                    $u.warn("state.deleteItem - Invalid or non-existant flag: ", name);
                }

                delete state.flags[name];
                return true;
            } catch (err) {
                $u.error("ERROR in state.deleteItem: " + err);
                return false;
            }
        }
    };
