
////////////////////////////////////////////////////////////////////
//                          config OBJECT
// this is the main object for dealing with user options
/////////////////////////////////////////////////////////////////////

config = {
    options: {},

    load: function () {
        try {
            config.options = gm.getItem('config.options', 'default');
            if (config.options === 'default' || !$.isPlainObject(config.options)) {
                config.options = gm.setItem('config.options', {});
            }

            utility.log(5, "config.load", config.options);
            return true;
        } catch (err) {
            utility.error("ERROR in config.load: " + err);
            return false;
        }
    },

    save: function (force) {
        try {
            gm.setItem('config.options', config.options);
            utility.log(5, "config.save", config.options);
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

            config.options[name] = value;
            config.save();
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

            item = config.options[name];
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

            if (config.options[name] === undefined || config.options[name] === null) {
                utility.warn("config.deleteItem - Invalid or non-existant flag: ", name);
            }

            delete config.options[name];
            return true;
        } catch (err) {
            utility.error("ERROR in config.deleteItem: " + err);
            return false;
        }
    }
};
