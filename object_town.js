
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

    /*jslint maxlen: 512 */
    itemRegex: {
        Weapon: /axe|blade|bow|cleaver|cudgel|dagger|edge|grinder|halberd|lance|mace|morningstar|rod|saber|scepter|spear|staff|stave|sword |sword$|talon|trident|wand|^Avenger$|Celestas Devotion|Crystal Rod|Daedalus|Deliverance|Dragonbane|Excalibur|Holy Avenger|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught|Punisher|Soulforge|Bonecrusher|Lion Fang|Exsanguinator|Lifebane|Deathbellow|Moonclaw/i,
        Shield: /aegis|buckler|shield|tome|Defender|Dragon Scale|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought|Purgatory|Zenarean Crest|Serenes Arrow|Hour Glass/i,
        Helmet: /cowl|crown|helm|horns|mask|veil|Tiara|Virtue of Fortitude/i,
        Glove: /gauntlet|glove|hand|bracer|fist|Slayer's Embrace|Soul Crusher|Soul Eater|Virtue of Temperance/i,
        Armor:  /armor|belt|chainmail|cloak|epaulets|gear|garb|pauldrons|plate|raiments|robe|tunic|vestment|Faerie Wings|Castle Rampart/i,
        Amulet: /amulet|bauble|charm|crystal|eye|flask|insignia|jewel|lantern|memento|necklace|orb|pendant|shard|signet|soul|talisman|trinket|Heart of Elos|Mark of the Empire|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Terra's Heart|Thawing Star|Transcendence|Tooth of Gehenna|Caldonian Band|Blue Lotus Petal| Bar|Magic Mushrooms|Dragon Ashes/i
    },
    /*jslint maxlen: 250 */

    record: function () {
        this.data = {
            name    : '',
            image   : '',
            type    : '',
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

    copy2sortable: function (type) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            var order = {
                    reverse: {
                        a: false,
                        b: false,
                        c: false
                    },
                    value: {
                        a: '',
                        b: '',
                        c: ''
                    }
                };

            $.extend(true, order, state.getItem(type.ucFirst() + "Sort", order));
            this[type + 'Sortable'] = [];
            $.merge(this[type + 'Sortable'], this[type]);
            this[type + 'Sortable'].sort(sort.by(order.reverse.a, order.value.a, sort.by(order.reverse.b, order.value.b, sort.by(order.reverse.c, order.value.c))));
            return true;
        } catch (err) {
            utility.error("ERROR in town.copy2sortable: " + err);
            return false;
        }
    },

    load: function (type) {
        try {
            if (typeof type !== 'string' || type === '' || this.types.indexOf(type) < 0)  {
                utility.warn("Type passed to load: ", type);
                throw "Invalid type value!";
            }

            this[type] = gm.getItem(type + '.records', 'default');
            if (this[type] === 'default' || !$.isArray(this[type])) {
                this[type] = gm.setItem(type + '.records', []);
            }

            this.copy2sortable(type);
            state.setItem(type.ucFirst() + "DashUpdate", true);
            utility.log(type, 5, "town.load", type, this[type]);
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

            var hbest    = JSON.hbest(this[type]),
                compress = false;

            utility.log(2, "Hbest", hbest);
            gm.setItem(type + '.records', this[type], hbest, compress);
            state.setItem(type.ucFirst() + "DashUpdate", true);
            utility.log(type, 5, "town.save", type, this[type]);
            return true;
        } catch (err) {
            utility.error("ERROR in town.save: " + err);
            return false;
        }
    },

    getItemType: function (name) {
        try {
            var i       = '',
                j       = 0,
                len     = 0,
                mlen    = 0,
                maxlen  = 0,
                match   = [],
                theType = '';

            for (i in town.itemRegex) {
                if (town.itemRegex.hasOwnProperty(i)) {
                    match = name.match(town.itemRegex[i]);
                    if (match) {
                        for (j = 0, len = match.length; j < len; j += 1) {
                            mlen = match[j].length;
                            if (mlen > maxlen) {
                                theType = i;
                                maxlen = mlen;
                            }
                        }
                    }
                }
            }

            return theType;
        } catch (err) {
            utility.error("ERROR in town.getItemType: " + err);
            return undefined;
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
            rowDiv = $("#app46755028429_app_body td[class*='eq_buy_row']");
            if (rowDiv && rowDiv.length) {
                rowDiv.each(function (index) {
                    current = new town.record();
                    tempDiv = $(this).find("div[class='eq_buy_txt_int'] strong");
                    if (tempDiv && tempDiv.length === 1) {
                        current.data.name = $.trim(tempDiv.text());
                        current.data.type = town.getItemType(current.data.name);
                    } else {
                        utility.warn("Unable to get item name in", type);
                        passed = false;
                    }

                    if (passed) {
                        tempDiv = $(this).find("img");
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.image = utility.getHTMLPredicate(tempDiv.attr("src"));
                        } else {
                            utility.log(4, "No image found for", type, current.data.name);
                        }

                        tempDiv = $(this).find("div[class='eq_buy_txt_int'] span[class='negative']");
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.upkeep = utility.NumberOnly(tempDiv.text());
                        } else {
                            utility.log(4, "No upkeep found for", type, current.data.name);
                        }

                        tempDiv = $(this).find("div[class='eq_buy_stats_int'] div");
                        if (tempDiv && tempDiv.length === 2) {
                            current.data.atk = utility.NumberOnly(tempDiv.eq(0).text());
                            current.data.def = utility.NumberOnly(tempDiv.eq(1).text());
                            current.data.api = (current.data.atk + (current.data.def * 0.7));
                            current.data.dpi = (current.data.def + (current.data.atk * 0.7));
                            current.data.mpi = ((current.data.api + current.data.dpi) / 2);
                        } else {
                            utility.warn("No atk/def found for", type, current.data.name);
                        }

                        tempDiv = $(this).find("div[class='eq_buy_costs_int'] strong[class='gold']");
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.cost = utility.NumberOnly(tempDiv.text());
                        } else {
                            utility.log(4, "No cost found for", type, current.data.name);
                        }

                        tempDiv = $(this).find("div[class='eq_buy_costs_int'] tr:last td").eq(0);
                        if (tempDiv && tempDiv.length === 1) {
                            current.data.owned = utility.NumberOnly(tempDiv.text());
                            current.data.hourly = current.data.owned * current.data.upkeep;
                        } else {
                            utility.warn("No number owned found for", type, current.data.name);
                        }

                        town[type].push(current.data);
                        save = true;
                    }
                });
            }

            if (save) {
                this.save(type);
                this.copy2sortable(type);
                utility.log(2, "Got town details for", type);
            } else {
                utility.log(1, "Nothing to save for", type);
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
                    utility.log(3, "town.haveOrb", this.magic[it]);
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
    },

    getCount: function (name, image) {
        try {
            var it1     = 0,
                it2     = 0,
                tempIt1 = -1,
                tempIt2 = -1,
                owned   = 0,
                found   = false;

            for (it1 = this.types.length - 1; it1 >= 0; it1 -= 1) {
                if (found) {
                    break;
                }

                for (it2 = this[this.types[it1]].length - 1; it2 >= 0; it2 -= 1) {
                    if (this[this.types[it1]][it2].name && this[this.types[it1]][it2].name === name) {
                        tempIt1 = it1;
                        tempIt2 = it2;
                        if (image && this[this.types[it1]][it2].image && this[this.types[it1]][it2].image === image) {
                            found = true;
                            break;
                        }
                    }
                }
            }

            if (tempIt1 > -1 && tempIt2 > -1) {
                owned = this[this.types[tempIt1]][tempIt2].owned;
            }

            return owned;
        } catch (err) {
            utility.error("ERROR in town.getCount: " + err);
            return undefined;
        }
    }
};
