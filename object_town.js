
////////////////////////////////////////////////////////////////////
//                          town OBJECT
// this is the main object for dealing with town items
/////////////////////////////////////////////////////////////////////

town = {
    soldiers: [],

    soldiersSortable: [],

    item: [],

    itemSortable: [],

    magic: [],

    magicSortable: [],

    record: function () {
        this.data = {
            name    : '',
            upkeep  : 0,
            hourly  : 0,
            atk     : 0,
            def     : 0,
            owned   : 0,
            cost    : 0,
            api     : 0,
            dpi     : 0,
            mpi     : 0
        };
    },

    types: ['soldiers', 'item', 'magic'],

    log: function (type, level, text) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            var snapshot = {};
            if (utility.logLevel >= level) {
                $.extend(snapshot, this[type]);
                utility.log(level, text, type, snapshot);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in town.log: " + err);
            return false;
        }
    },

    load: function (type) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            if (gm.getItem(type + '.records', 'default') === 'default' || !$.isArray(gm.getItem(type + '.records', 'default'))) {
                gm.setItem(type + '.records', this[type]);
            } else {
                this[type] = gm.getItem(type + '.records', this[type]);
            }

            this[type + 'Sortable'] = [];
            $.merge(this[type + 'Sortable'], this[type]);
            state.setItem(type.ucFirst() + "DashUpdate", true);
            this.log(type, 2, "town.load");
            return true;
        } catch (err) {
            utility.error("ERROR in town.load: " + err);
            return false;
        }
    },

    save: function (type) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            gm.setItem(type + '.records', this[type]);
            state.setItem(type.ucFirst() + "DashUpdate", true);
            this.log(type, 2, "town.save");
            return true;
        } catch (err) {
            utility.error("ERROR in town.save: " + err);
            return false;
        }
    },

    GetItems: function (type) {
        try {
            var rowDiv  = null,
                tempDiv = null,
                current = {},
                passed  = true,
                save    = false;

            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            this[type] = [];
            this[type + 'Sortable'] = [];
            rowDiv = $("#app46755028429_app_body td[class*='eq_buy_row']");
            if (rowDiv && rowDiv.length) {
                rowDiv.each(function (index) {
                    current = new town.record();
                    tempDiv = $(this).find("div[class='eq_buy_txt_int'] strong");
                    if (tempDiv && tempDiv.length === 1) {
                        current.data.name = $.trim(tempDiv.text());
                    } else {
                        utility.warn("Unable to get '" + type + "' name!");
                        passed = false;
                    }

                    if (passed) {
                        tempDiv = $(this).find("div[class='eq_buy_txt_int'] span[class='negative']");
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.upkeep = utility.NumberOnly(tempDiv.text());
                        } else {
                            utility.log(2, "No upkeep found for '" + type + "' '" + current.data.name + "'");
                        }

                        tempDiv = $(this).find("div[class='eq_buy_stats_int'] div");
                        if (tempDiv && tempDiv.length === 2) {
                            current.data.atk = utility.NumberOnly(tempDiv.eq(0).text());
                            current.data.def = utility.NumberOnly(tempDiv.eq(1).text());
                            current.data.api = (current.data.atk + (current.data.def * 0.7));
                            current.data.dpi = (current.data.def + (current.data.atk * 0.7));
                            current.data.mpi = ((current.data.api + current.data.dpi) / 2);
                        } else {
                            utility.warn("No atk/def found for '" + type + "' '" + current.data.name + "'");
                        }

                        tempDiv = $(this).find("div[class='eq_buy_costs_int'] strong[class='gold']");
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.cost = utility.NumberOnly(tempDiv.text());
                        } else {
                            utility.log(2, "No cost found for '" + type + "' '" + current.data.name + "'");
                        }

                        tempDiv = $(this).find("div[class='eq_buy_costs_int'] tr:last td:first");
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.owned = utility.NumberOnly(tempDiv.text());
                            current.data.hourly = current.data.owned * current.data.upkeep;
                        } else {
                            utility.warn("No number owned found for '" + type + "' '" + current.data.name + "'");
                        }

                        town[type].push(current.data);
                        save = true;
                    }
                });
            }

            if (save) {
                $.merge(this[type + 'Sortable'], this[type]);
                this.save(type);
            } else {
                utility.log(1, "Nothing to save for '" + type + "'");
            }

            return true;
        } catch (err) {
            utility.error("ERROR in town.GetItems: " + err);
            return false;
        }
    },

    haveOrb: function (name) {
        try {
            if (typeof name !== 'string' || name === '') {
                throw "Invalid identifying name!";
            }

            var it     = 0,
                len    = 0,
                haveIt = false;

            for (it = 0, len = this.magic.length; it < len; it += 1) {
                if (this.magic[it].name === name) {
                    if (this.magic[it].owned) {
                        haveIt = true;
                    }

                    break;
                }
            }

            return haveIt;
        } catch (err) {
            utility.error("ERROR in town.haveOrb: " + err);
            return undefined;
        }
    }
};
