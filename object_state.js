
////////////////////////////////////////////////////////////////////
//                          state OBJECT
// this is the main object for dealing with state flags
/////////////////////////////////////////////////////////////////////

state = {
    flags: {},

    load: function () {
        try {
            if (gm.getItem('state.flags', 'default') === 'default' || !$.isPlainObject(gm.getItem('state.flags', 'default'))) {
                gm.setItem('state.flags', this.flags);
            } else {
                $.extend(true, this.flags, gm.getItem('state.flags', this.flags));
            }

            utility.log(5, "state.load", this.flags);
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

            gm.setItem('state.flags', this.flags);
            utility.log(5, "state.save", this.flags);
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

            this.flags[name] = value;
            this.save();
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

            item = this.flags[name];
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

            if (this.flags[name] === undefined || this.flags[name] === null) {
                utility.warn("state.deleteItem - Invalid or non-existant flag: ", name);
            }

            delete this.flags[name];
            return true;
        } catch (err) {
            utility.error("ERROR in state.deleteItem: " + err);
            return false;
        }
    }
};
