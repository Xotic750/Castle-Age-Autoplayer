
////////////////////////////////////////////////////////////////////
//                          config OBJECT
// this is the main object for dealing with user options
/////////////////////////////////////////////////////////////////////

config = {
    options: {},

    log: function (level, text) {
        try {
            var snapshot = {};
            if (utility.logLevel >= level) {
                $.extend(snapshot, this.options);
                utility.log(level, text, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in config.log: " + err);
            return false;
        }
    },

    load: function () {
        try {
            if (gm.getItem('config.options', 'default') === 'default') {
                gm.setItem('config.options', this.options);
            } else {
                this.options = gm.getItem('config.options', this.options);
            }

            if (utility.typeOf(this.options) !== 'object') {
                utility.warn("Invalid options object! Resetting!");
                gm.deleteItem('config.options');
                this.options = {};
            }

            this.log(2, "config.load");
            return true;
        } catch (err) {
            utility.error("ERROR in config.load: " + err);
            return false;
        }
    },

    save: function (force) {
        try {
            gm.setItem('config.options', this.options);
            this.log(2, "config.save");
            return true;
        } catch (err) {
            utility.error("ERROR in config.save: " + err);
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

            this.options[name] = value;
            this.save();
            return value;
        } catch (err) {
            utility.error("ERROR in config.setItem: " + err);
            return undefined;
        }
    },

    getItem: function (name, value) {
        try {
            var item;
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            item = this.options[name];
            if ((item === undefined || item === null) && value !== undefined && value !== null) {
                item = value;
            }

            if (item === undefined || item === null) {
                utility.warn("config.getItem returned 'undefined' or 'null' for", name);
            }

            return item;
        } catch (err) {
            utility.error("ERROR in config.getItem: " + err);
            return undefined;
        }
    },

    deleteItem: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            if (this.options[name] === undefined || this.options[name] === null) {
                utility.warn("config.deleteItem - Invalid or non-existant flag: ", name);
            }

            delete this.options[name];
            return true;
        } catch (err) {
            utility.error("ERROR in config.deleteItem: " + err);
            return false;
        }
    }
};
