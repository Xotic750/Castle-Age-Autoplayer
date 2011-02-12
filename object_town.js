
    ////////////////////////////////////////////////////////////////////
    //                          town OBJECT
    // this is the main object for dealing with town items
    /////////////////////////////////////////////////////////////////////

    town = {
        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        soldiers: [],

        'soldiersSortable': [],

        item: [],

        'itemSortable': [],

        magic: [],

        'magicSortable': [],

        itemRegex: {
            'Weapon' : /axe|blade|bow|cleaver|cudgel|dagger|edge|grinder|halberd|lance|mace|morningstar|rod|saber|scepter|spear|staff|stave|sword |sword$|talon|trident|wand|^Avenger$|Celestas Devotion|Crystal Rod|Daedalus|Deliverance|Dragonbane|Excalibur|Holy Avenger|Incarnation|Ironhart's Might|Judgement|Justice|Lightbringer|Oathkeeper|Onslaught|Punisher|Soulforge|Bonecrusher|Lion Fang|Exsanguinator|Lifebane|Deathbellow|Moonclaw/i,
            'Shield' : /aegis|buckler|shield|tome|Defender|Dragon Scale|Frost Tear Dagger|Harmony|Sword of Redemption|Terra's Guard|The Dreadnought|Purgatory|Zenarean Crest|Serenes Arrow|Hour Glass|Protector/i,
            'Helmet' : /cowl|crown|helm|horns|mask|veil|Tiara|Virtue of Fortitude/i,
            'Glove'  : /gauntlet|glove|hand|bracer|fist|Slayer's Embrace|Soul Crusher|Soul Eater|Virtue of Temperance/i,
            'Armor'  :  /armor|belt|chainmail|cloak|epaulets|gear|garb|pauldrons|plate|raiments|robe|tunic|vestment|Faerie Wings|Castle Rampart/i,
            'Amulet' : /amulet|bauble|charm|crystal|eye|flask|insignia|jewel|lantern|memento|necklace|orb|pendant|shard|signet|soul|talisman|trinket|Heart of Elos|Mark of the Empire|Paladin's Oath|Poseidons Horn| Ring|Ring of|Ruby Ore|Terra's Heart|Thawing Star|Transcendence|Tooth of Gehenna|Caldonian Band|Blue Lotus Petal| Bar|Magic Mushrooms|Dragon Ashes|Heirloom/i
        },

        record: function () {
            this.data = {
                'name'   : '',
                'image'  : '',
                'type'   : '',
                'upkeep' : 0,
                'hourly' : 0,
                'atk'    : 0,
                'def'    : 0,
                'owned'  : 0,
                'cost'   : 0,
                'api'    : 0,
                'dpi'    : 0,
                'mpi'    : 0
            };
        },

        types: ['soldiers', 'item', 'magic'],

        copy2sortable: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    $u.warn("Type passed to copy2sortable: ", type);
                    throw "Invalid type value!";
                }

                var order = new sort.order();
                $j.extend(true, order.data, state.getItem(type.ucFirst() + "Sort", order.data));
                town[type + 'Sortable'] = [];
                $j.merge(town[type + 'Sortable'], town[type]);
                town[type + 'Sortable'].sort($u.sortBy(order.data['reverse']['a'], order.data['value']['a'], $u.sortBy(order.data['reverse']['b'], order.data['value']['b'], $u.sortBy(order.data['reverse']['c'], order.data['value']['c']))));
                return true;
            } catch (err) {
                $u.error("ERROR in town.copy2sortable: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        soldiershbest: 3,

        itemhbest: 2,

        magichbest: 2,

        load: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    $u.warn("Type passed to load: ", type);
                    throw "Invalid type value!";
                }

                town[type] = gm.getItem(type + '.records', 'default');
                if (town[type] === 'default' || !$j.isArray(town[type])) {
                    town[type] = gm.setItem(type + '.records', []);
                }

                town[type + "hbest"] = town[type + "hbest"] === false ? JSON.hbest(town[type]) : town[type + "hbest"];
                $u.log(3, "town.load " + type + " Hbest", town[type + "hbest"]);
                town.copy2sortable(type);
                state.setItem(type.ucFirst() + "DashUpdate", true);
                $u.log(3, "town.load", type, town[type]);
                return true;
            } catch (err) {
                $u.error("ERROR in town.load: " + err);
                return false;
            }
        },

        save: function (type) {
            try {
                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    $u.warn("Type passed to save: ", type);
                    throw "Invalid type value!";
                }

                var compress = false;
                gm.setItem(type + '.records', town[type], town[type + "hbest"], compress);
                state.setItem(type.ucFirst() + "DashUpdate", true);
                $u.log(3, "town.save", type, town[type]);
                return true;
            } catch (err) {
                $u.error("ERROR in town.save: " + err);
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
                $u.error("ERROR in town.getItemType: " + err);
                return undefined;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        GetItems: function (type) {
            try {
                var rowDiv  = $j(),
                    tempDiv = $j(),
                    tStr    = '',
                    current = {},
                    passed  = true,
                    save    = false;

                if (!$u.isString(type) || type === '' || !town.types.hasIndexOf(type))  {
                    $u.warn("Type passed to load: ", type);
                    throw "Invalid type value!";
                }

                town[type] = [];
                rowDiv = caap.appBodyDiv.find("td[class*='eq_buy_row']");
                if (rowDiv && rowDiv.length) {
                    rowDiv.each(function (index) {
                        var row = $j(this);
                        current = new town.record();
                        tempDiv = row.find("div[class='eq_buy_txt_int'] strong");
                        if (tempDiv && tempDiv.length === 1) {
                            tStr = tempDiv.text();
                            current.data['name'] = tStr ? tStr.trim() : '';
                            current.data['type'] = town.getItemType(current.data['name']);
                        } else {
                            $u.warn("Unable to get item name in", type);
                            passed = false;
                        }

                        if (passed) {
                            tempDiv = row.find("img");
                            if (tempDiv && tempDiv.length === 1) {
                                tStr = tempDiv.attr("src");
                                current.data['image'] = tStr ? tStr.basename() : '';
                            } else {
                                $u.log(4, "No image found for", type, current.data['name']);
                            }

                            tempDiv = row.find("div[class='eq_buy_txt_int'] span[class='negative']");
                            if (tempDiv && tempDiv.length === 1) {
                                tStr = tempDiv.text();
                                current.data['upkeep'] = tStr ? tStr.numberOnly() : 0;
                            } else {
                                $u.log(4, "No upkeep found for", type, current.data.name);
                            }

                            tempDiv = row.find("div[class='eq_buy_stats_int'] div");
                            if (tempDiv && tempDiv.length === 2) {
                                tStr = tempDiv.eq(0).text();
                                current.data['atk'] = tStr ? tStr.numberOnly() : 0;
                                tStr = tempDiv.eq(1).text();
                                current.data['def'] = tStr ? tStr.numberOnly() : 0;
                                current.data['api'] = (current.data['atk'] + (current.data['def'] * 0.7)).dp(2);
                                current.data['dpi'] = (current.data['def'] + (current.data['atk'] * 0.7)).dp(2);
                                current.data['mpi'] = ((current.data['api'] + current.data['dpi']) / 2).dp(2);
                            } else {
                                $u.warn("No atk/def found for", type, current.data['name']);
                            }

                            tempDiv = row.find("div[class='eq_buy_costs_int'] strong[class='gold']");
                            if (tempDiv && tempDiv.length === 1) {
                                tStr = tempDiv.text();
                                current.data['cost'] = tStr ? tStr.numberOnly() : 0;
                            } else {
                                $u.log(4, "No cost found for", type, current.data['name']);
                            }

                            tempDiv = row.find("div[class='eq_buy_costs_int'] tr:last td").eq(0);
                            if (tempDiv && tempDiv.length === 1) {
                                tStr = tempDiv.text();
                                current.data['owned'] = tStr ? tStr.numberOnly() : 0;
                                current.data['hourly'] = current.data['owned'] * current.data['upkeep'];
                            } else {
                                $u.warn("No number owned found for", type, current.data['name']);
                            }

                            town[type].push(current.data);
                            save = true;
                        }
                    });
                }

                if (save) {
                    town.save(type);
                    town.copy2sortable(type);
                    $u.log(2, "Got town details for", type);
                } else {
                    $u.log(1, "Nothing to save for", type);
                }

                return true;
            } catch (err) {
                $u.error("ERROR in town.GetItems: " + err);
                return false;
            }
        },

        haveOrb: function (name) {
            try {
                if (!$u.isString(name) || name === '') {
                    throw "Invalid identifying name!";
                }

                var it     = 0,
                    len    = 0,
                    haveIt = false;

                for (it = 0, len = town.magic.length; it < len; it += 1) {
                    if (town.magic[it]['name'] === name) {
                        $u.log(3, "town.haveOrb", town.magic[it]);
                        if (town.magic[it]['owned']) {
                            haveIt = true;
                        }

                        break;
                    }
                }

                return haveIt;
            } catch (err) {
                $u.error("ERROR in town.haveOrb: " + err);
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

                for (it1 = town.types.length - 1; it1 >= 0; it1 -= 1) {
                    if (found) {
                        break;
                    }

                    for (it2 = town[town.types[it1]].length - 1; it2 >= 0; it2 -= 1) {
                        if (town[town.types[it1]][it2]['name'] && town[town.types[it1]][it2]['name'] === name) {
                            tempIt1 = it1;
                            tempIt2 = it2;
                            if (image && town[town.types[it1]][it2]['image'] && town[town.types[it1]][it2]['image'] === image) {
                                found = true;
                                break;
                            }
                        }
                    }
                }

                if (tempIt1 > -1 && tempIt2 > -1) {
                    owned = town[town.types[tempIt1]][tempIt2]['owned'];
                }

                return owned;
            } catch (err) {
                $u.error("ERROR in town.getCount: " + err);
                return undefined;
            }
        }
        /*jslint sub: false */
    };
