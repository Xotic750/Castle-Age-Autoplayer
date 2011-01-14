
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

            utility.log(5, "state.load", state.flags);
            return true;
        } catch (err) {
            utility.error("ERROR in state.load: " + err);
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
            utility.log(5, "state.save", state.flags);
            schedule.setItem('StateSave', 1);
            return true;
        } catch (err) {
            utility.error("ERROR in state.save: " + err);
            return false;
        }
    },

    setItem: function (name, value) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            if (value === undefined || value === null) {
                throw "Value supplied is 'undefined' or 'null'!";
            }

            state.flags[name] = value;
            state.save();
            return value;
        } catch (err) {
            utility.error("ERROR in state.setItem: " + err);
            return undefined;
        }
    },

    getItem: function (name, value) {
        try {
            var item;
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            item = state.flags[name];
            if ((item === undefined || item === null) && value !== undefined && value !== null) {
                item = value;
            }

            if (item === undefined || item === null) {
                utility.warn("state.getItem returned 'undefined' or 'null' for", name);
            }

            return item;
        } catch (err) {
            utility.error("ERROR in state.getItem: " + err);
            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            if (state.flags[name] === undefined || state.flags[name] === null) {
                utility.warn("state.deleteItem - Invalid or non-existant flag: ", name);
            }

            delete state.flags[name];
            return true;
        } catch (err) {
            utility.error("ERROR in state.deleteItem: " + err);
            return false;
        }
    }
};
