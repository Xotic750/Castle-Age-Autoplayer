
////////////////////////////////////////////////////////////////////
//                          general OBJECT
// this is the main object for dealing with Generals
/////////////////////////////////////////////////////////////////////

general = {
    records: [],

    recordsSortable: [],

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    record: function () {
        this.data = {
            'name'       : '',
            'img'        : '',
            'lvl'        : 0,
            'last'       : new Date().getTime() - (24 * 3600000),
            'special'    : '',
            'atk'        : 0,
            'def'        : 0,
            'api'        : 0,
            'dpi'        : 0,
            'mpi'        : 0,
            'eatk'       : 0,
            'edef'       : 0,
            'eapi'       : 0,
            'edpi'       : 0,
            'empi'       : 0,
            'energyMax'  : 0,
            'staminaMax' : 0,
            'healthMax'  : 0
        };
    },
    /*jslint sub: true */

    copy2sortable: function () {
        try {
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

            $.extend(true, order, state.getItem("GeneralsSort", order));
            general.recordsSortable = [];
            $.merge(general.recordsSortable, general.records);
            general.recordsSortable.sort(sort.by(order.reverse.a, order.value.a, sort.by(order.reverse.b, order.value.b, sort.by(order.reverse.c, order.value.c))));
            return true;
        } catch (err) {
            utility.error("ERROR in general.copy2sortable: " + err);
            return false;
        }
    },

    hbest: false,

    load: function () {
        try {
            general.records = gm.getItem('general.records', 'default');
            if (general.records === 'default' || !$.isArray(general.records)) {
                general.records = gm.setItem('general.records', []);
            }

            general.copy2sortable();
            general.BuildlLists();
            general.hbest = JSON.hbest(general.records);
            utility.log(2, "general.load Hbest", general.hbest);
            state.setItem("GeneralsDashUpdate", true);
            utility.log(5, "general.load", general.records);
            return true;
        } catch (err) {
            utility.error("ERROR in general.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            var compress = false;
            gm.setItem('general.records', general.records, general.hbest, compress);
            state.setItem("GeneralsDashUpdate", true);
            utility.log(5, "general.save", general.records);
            return true;
        } catch (err) {
            utility.error("ERROR in general.save: " + err);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    find: function (generalName) {
        try {
            var it    = 0,
                len   = 0,
                found = false;

            for (it = 0, len = general.records.length; it < len; it += 1) {
                if (general.records[it]['name'] === generalName) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                utility.warn("Unable to find 'General' record");
                return false;
            }

            return general.records[it];
        } catch (err) {
            utility.error("ERROR in general.find: " + err);
            return false;
        }
    },

    GetNames: function () {
        try {
            var it    = 0,
                len   = 0,
                names = [];

            for (it = 0, len = general.records.length; it < len; it += 1) {
                names.push(general.records[it]['name']);
            }

            return names.sort();
        } catch (err) {
            utility.error("ERROR in general.GetNames: " + err);
            return false;
        }
    },

    GetImage: function (generalName) {
        try {
            var genImg = general.find(generalName);

            if (genImg === false) {
                utility.warn("Unable to find 'General' image");
                genImg = '';
            } else {
                genImg = genImg['img'];
            }

            return genImg;
        } catch (err) {
            utility.error("ERROR in general.GetImage: " + err);
            return false;
        }
    },

    GetStaminaMax: function (generalName) {
        try {
            var genStamina = general.find(generalName);

            if (genStamina === false) {
                utility.warn("Unable to find 'General' stamina");
                genStamina = 0;
            } else {
                genStamina = genStamina['staminaMax'];
            }

            return genStamina;
        } catch (err) {
            utility.error("ERROR in general.GetStaminaMax: " + err);
            return false;
        }
    },

    GetEnergyMax: function (generalName) {
        try {
            var genEnergy = general.find(generalName);

            if (genEnergy === false) {
                utility.warn("Unable to find 'General' energy");
                genEnergy = 0;
            } else {
                genEnergy = genEnergy['energyMax'];
            }

            return genEnergy;
        } catch (err) {
            utility.error("ERROR in general.GetEnergyMax: " + err);
            return false;
        }
    },

    GetHealthMax: function (generalName) {
        try {
            var genHealth = general.find(generalName);

            if (genHealth === false) {
                utility.warn("Unable to find 'General' health");
                genHealth = 0;
            } else {
                genHealth = genHealth['healthMax'];
            }

            return genHealth;
        } catch (err) {
            utility.error("ERROR in general.GetHealthMax: " + err);
            return false;
        }
    },

    GetLevel: function (generalName) {
        try {
            var genLevel = general.find(generalName);

            if (genLevel === false) {
                utility.warn("Unable to find 'General' level");
                genLevel = 1;
            } else {
                genLevel = genLevel['lvl'];
            }

            return genLevel;
        } catch (err) {
            utility.error("ERROR in general.GetLevel: " + err);
            return false;
        }
    },

    GetLevelUpNames: function () {
        try {
            var it    = 0,
                len   = 0,
                names = [];

            for (it = 0, len = general.records.length; it < len; it += 1) {
                if (general.records[it]['lvl'] < 4) {
                    names.push(general.records[it]['name']);
                }
            }

            return names;
        } catch (err) {
            utility.error("ERROR in general.GetLevelUpNames: " + err);
            return false;
        }
    },
    /*jslint sub: false */

    List: [],

    BuyList: [],

    IncomeList: [],

    BankingList: [],

    CollectList: [],

    StandardList: [
        'Idle',
        'Monster',
        'Fortify',
        'GuildMonster',
        'Invade',
        'Duel',
        'War',
        'SubQuest',
        'Arena'
    ],

    BuildlLists: function () {
        try {
            utility.log(3, 'Building Generals Lists');
            general.List = [
                'Use Current',
                'Under Level 4'
            ].concat(general.GetNames());

            var crossList = function (checkItem) {
                return (general.List.indexOf(checkItem) >= 0);
            };

            general.BuyList = [
                'Use Current',
                'Darius',
                'Lucius',
                'Garlan',
                'Penelope'
            ].filter(crossList);

            general.IncomeList = [
                'Use Current',
                'Scarlett',
                'Mercedes',
                'Cid'
            ].filter(crossList);

            general.BankingList = [
                'Use Current',
                'Aeris'
            ].filter(crossList);

            general.CollectList = [
                'Use Current',
                'Angelica',
                'Morrigan'
            ].filter(crossList);

            return true;
        } catch (err) {
            utility.error("ERROR in general.BuildlLists: " + err);
            return false;
        }
    },

    GetCurrent: function () {
        try {
            var generalName = '',
                tStr        = '',
                nameObj     = $();

            nameObj = $("#app46755028429_equippedGeneralContainer .general_name_div3");
            if (nameObj) {
                tStr = nameObj.text();
                generalName = tStr ? tStr.trim().stripTRN().stripStar() : '';
            }

            if (!generalName) {
                utility.warn("Couldn't get current 'General'. Will use current 'General'", generalName);
                return 'Use Current';
            }

            utility.log(4, "Current General", generalName);
            return generalName;
        } catch (err) {
            utility.error("ERROR in general.GetCurrent: " + err);
            return 'Use Current';
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    GetGenerals: function () {
        try {
            var generalsDiv = $(".generalSmallContainer2"),
                update      = false,
                save        = false,
                tempObj     = $();

            if (generalsDiv.length) {
                generalsDiv.each(function (index) {
                    var newGeneral = new general.record(),
                        tStr       = '',
                        name       = '',
                        img        = '',
                        level      = 0,
                        atk        = 0,
                        def        = 0,
                        special    = '',
                        container  = $(this),
                        it         = 0,
                        len        = 0;

                    tempObj = container.find(".general_name_div3");
                    if (tempObj && tempObj.length) {
                        tStr = tempObj.text();
                        name = tStr ? tStr.stripTRN().stripStar() : '';
                    } else {
                        utility.warn("Unable to find 'name' container", index);
                    }

                    tempObj = container.find(".imgButton");
                    if (tempObj && tempObj.length) {
                        tStr = tempObj.attr("src");
                        img = tStr ? tStr.filepart() : '';
                    } else {
                        utility.warn("Unable to find 'image' container", index);
                    }

                    tempObj = container.children().eq(3);
                    if (tempObj && tempObj.length) {
                        tStr = tempObj.text();
                        level = tStr ? tStr.replace(/Level /gi, '').stripTRN().parseInt() : 0;
                    } else {
                        utility.warn("Unable to find 'level' container", index);
                    }

                    tempObj = container.children().eq(4);
                    if (tempObj && tempObj.length) {
                        tStr = tempObj.html();
                        tStr = tStr ? tStr.replace(/<br>/g, ' ') : '';
                        tStr = $(tStr).text();
                        special = tStr ? tStr.trim() : '';
                    } else {
                        utility.warn("Unable to find 'special' container", index);
                    }

                    tempObj = container.find(".generals_indv_stats_padding div");
                    if (tempObj && tempObj.length === 2) {
                        tStr = tempObj.eq(0).text();
                        atk = tStr ? tStr.parseInt() : 0;
                        tStr = tempObj.eq(1).text();
                        def = tStr ? tStr.parseInt() : 0;
                    } else {
                        utility.warn("Unable to find 'attack and defence' containers", index);
                    }

                    if (name && img && level && !isNaN(atk) && !isNaN(def) && special) {
                        for (it = 0, len = general.records.length; it < len; it += 1) {
                            if (general.records[it]['name'] === name) {
                                newGeneral.data = general.records[it];
                                break;
                            }
                        }

                        newGeneral.data['name'] = name;
                        newGeneral.data['img'] = img;
                        newGeneral.data['lvl'] = level;
                        newGeneral.data['atk'] = atk;
                        newGeneral.data['def'] = def;
                        newGeneral.data['api'] = (atk + (def * 0.7)).dp(2);
                        newGeneral.data['dpi'] = (def + (atk * 0.7)).dp(2);
                        newGeneral.data['mpi'] = ((newGeneral.data['api'] + newGeneral.data['dpi']) / 2).dp(2);
                        newGeneral.data['special'] = special;
                        if (it < len) {
                            general.records[it] = newGeneral.data;
                        } else {
                            utility.log(1, "Adding new 'General'", newGeneral.data['name']);
                            general.records.push(newGeneral.data);
                            update = true;
                        }

                        save = true;
                    } else {
                        utility.warn("Missing required 'General' attribute", index);
                    }
                });

                if (save) {
                    caap.stats['generals']['total'] = general.records.length;
                    caap.stats['generals']['invade'] = Math.min((caap.stats['army']['actual'] / 5).dp(), general.records.length);
                    general.save();
                    caap.SaveStats();
                    general.copy2sortable();
                    if (update) {
                        general.UpdateDropDowns();
                    }
                }

                utility.log(3, "general.GetGenerals", general.records);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in general.GetGenerals: " + err);
            return false;
        }
    },
    /*jslint sub: false */

    UpdateDropDowns: function () {
        try {
            var it  = 0,
                len = 0;

            general.BuildlLists();
            utility.log(2, "Updating 'General' Drop Down Lists");
            for (it = 0, len = general.StandardList.length; it < len; it += 1) {
                caap.ChangeDropDownList(general.StandardList[it] + 'General', general.List, config.getItem(general.StandardList[it] + 'General', 'Use Current'));
            }

            caap.ChangeDropDownList('BuyGeneral', general.BuyList, config.getItem('BuyGeneral', 'Use Current'));
            caap.ChangeDropDownList('IncomeGeneral', general.IncomeList, config.getItem('IncomeGeneral', 'Use Current'));
            caap.ChangeDropDownList('BankingGeneral', general.BankingList, config.getItem('BankingGeneral', 'Use Current'));
            caap.ChangeDropDownList('CollectGeneral', general.CollectList, config.getItem('CollectGeneral', 'Use Current'));
            caap.ChangeDropDownList('LevelUpGeneral', general.List, config.getItem('LevelUpGeneral', 'Use Current'));
            return true;
        } catch (err) {
            utility.error("ERROR in general.UpdateDropDowns: " + err);
            return false;
        }
    },

    Clear: function (whichGeneral) {
        try {
            utility.log(1, 'Setting ' + whichGeneral + ' to "Use Current"');
            config.setItem(whichGeneral, 'Use Current');
            general.UpdateDropDowns();
            return true;
        } catch (err) {
            utility.error("ERROR in general.Clear: " + err);
            return false;
        }
    },

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    LevelUpCheck: function (whichGeneral) {
        try {
            var generalType = '',
                use         = false,
                keepGeneral = false;

            generalType = whichGeneral ? whichGeneral.replace(/General/i, '').trim() : '';
            if ((caap.stats['staminaT']['num'] > caap.stats['stamina']['max'] || caap.stats['energyT']['num'] > caap.stats['energy']['max']) && state.getItem('KeepLevelUpGeneral', false)) {
                if (config.getItem(generalType + 'LevelUpGeneral', false)) {
                    utility.log(2, "Keep Level Up General");
                    keepGeneral = true;
                } else {
                    utility.warn("User opted out of keep level up general for", generalType);
                }
            } else if (state.getItem('KeepLevelUpGeneral', false)) {
                utility.log(1, "Clearing Keep Level Up General flag");
                state.setItem('KeepLevelUpGeneral', false);
            }

            if (config.getItem('LevelUpGeneral', 'Use Current') !== 'Use Current' && (general.StandardList.indexOf(generalType) >= 0 || generalType === 'Quest')) {
                if (keepGeneral || (config.getItem(generalType + 'LevelUpGeneral', false) && caap.stats['exp']['dif'] && caap.stats['exp']['dif'] <= config.getItem('LevelUpGeneralExp', 0))) {
                    use = true;
                }
            }

            return use;
        } catch (err) {
            utility.error("ERROR in general.LevelUpCheck: " + err);
            return undefined;
        }
    },
    /*jslint sub: false */

    Select: function (whichGeneral) {
        try {
            var generalName       = '',
                getCurrentGeneral = '',
                currentGeneral    = '',
                generalImage      = '',
                levelUp           = general.LevelUpCheck(whichGeneral);

            if (levelUp) {
                whichGeneral = 'LevelUpGeneral';
                utility.log(2, 'Using level up general');
            }

            generalName = config.getItem(whichGeneral, 'Use Current');
            if (!generalName || /use current/i.test(generalName)) {
                return false;
            }

            if (!levelUp && /under level 4/i.test(generalName)) {
                if (!general.GetLevelUpNames().length) {
                    return general.Clear(whichGeneral);
                }

                if (config.getItem('ReverseLevelUpGenerals')) {
                    generalName = general.GetLevelUpNames().reverse().pop();
                } else {
                    generalName = general.GetLevelUpNames().pop();
                }
            }

            getCurrentGeneral = general.GetCurrent();
            if (!getCurrentGeneral) {
                caap.ReloadCastleAge();
            }

            currentGeneral = getCurrentGeneral;
            if (generalName.indexOf(currentGeneral) >= 0) {
                return false;
            }

            utility.log(1, 'Changing from ' + currentGeneral + ' to ' + generalName);
            if (utility.NavigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                return true;
            }

            generalImage = general.GetImage(generalName);
            if (utility.CheckForImage(generalImage)) {
                return utility.NavigateTo(generalImage);
            }

            caap.SetDivContent('Could not find ' + generalName);
            utility.warn('Could not find', generalName, generalImage);
            if (config.getItem('ignoreGeneralImage', true)) {
                return false;
            } else {
                return general.Clear(whichGeneral);
            }
        } catch (err) {
            utility.error("ERROR in general.Select: " + err);
            return false;
        }
    },

    quickSwitch: false,

    /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
    /*jslint sub: true */
    GetEquippedStats: function () {
        try {
            var generalName  = general.GetCurrent(),
                tStr         = '',
                it           = 0,
                len          = 0,
                generalDiv   = $(),
                tempObj      = $(),
                success      = false;

            if (generalName === 'Use Current') {
                return false;
            }

            utility.log(2, "Equipped 'General'", generalName);
            for (it = 0, len = general.records.length; it < len; it += 1) {
                if (general.records[it]['name'] === generalName) {
                    break;
                }
            }

            if (it >= len) {
                utility.warn("Unable to find 'General' record");
                return false;
            }

            generalDiv = $("#app46755028429_equippedGeneralContainer .generals_indv_stats div");
            if (generalDiv && generalDiv.length === 2) {
                tempObj = generalDiv.eq(0);
                if (tempObj && tempObj.length) {
                    tStr = tempObj.text();
                    general.records[it]['eatk'] = tStr ? tStr.parseInt() : 0;
                    tempObj = generalDiv.eq(1);
                    if (tempObj && tempObj.length) {
                        tStr = tempObj.text();
                        general.records[it]['edef'] = tStr ? tStr.parseInt() : 0;
                        success = true;
                    } else {
                        utility.warn("Unable to get 'General' defense object");
                    }
                } else {
                    utility.warn("Unable to get 'General' attack object");
                }

                if (success) {
                    general.records[it]['eapi'] = (general.records[it]['eatk'] + (general.records[it]['edef'] * 0.7)).dp(2);
                    general.records[it]['edpi'] = (general.records[it]['edef'] + (general.records[it]['eatk'] * 0.7)).dp(2);
                    general.records[it]['empi'] = ((general.records[it]['eapi'] + general.records[it]['edpi']) / 2).dp(2);
                    general.records[it]['energyMax'] = caap.stats['energyT']['max'];
                    general.records[it]['staminaMax'] = caap.stats['staminaT']['max'];
                    general.records[it]['healthMax'] = caap.stats['healthT']['max'];
                    general.records[it]['last'] = new Date().getTime();
                    general.save();
                    general.copy2sortable();
                    utility.log(3, "Got 'General' stats", general.records[it]);
                } else {
                    utility.warn("Unable to get 'General' stats");
                }
            } else {
                utility.warn("Unable to get equipped 'General' divs", generalDiv);
            }

            return general.records[it];
        } catch (err) {
            utility.error("ERROR in general.GetEquippedStats: " + err);
            return false;
        }
    },

    GetAllStats: function () {
        try {
            if (!schedule.check("allGenerals")) {
                return false;
            }

            var generalImage = '',
                it           = 0,
                len          = 0,
                theGeneral   = '';

            for (it = 0, len = general.records.length; it < len; it += 1) {
                if (schedule.since(general.records[it]['last'], gm.getItem("GeneralLastReviewed", 24, hiddenVar) * 3600)) {
                    break;
                }
            }

            if (it >= len) {
                schedule.setItem("allGenerals", gm.getItem("GetAllGenerals", 168, hiddenVar) * 3600, 300);
                utility.log(2, "Finished visiting all Generals for their stats");
                theGeneral = config.getItem('IdleGeneral', 'Use Current');
                if (theGeneral !== 'Use Current') {
                    utility.log(2, "Changing to idle general");
                    return general.Select('IdleGeneral');
                }

                return false;
            }

            if (utility.NavigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                utility.log(2, "Visiting generals to get 'General' stats");
                return true;
            }

            generalImage = general.GetImage(general.records[it]['name']);
            if (utility.CheckForImage(generalImage)) {
                if (general.GetCurrent() !== general.records[it]['name']) {
                    utility.log(2, "Visiting 'General'", general.records[it]['name']);
                    return utility.NavigateTo(generalImage);
                }
            }

            return true;
        } catch (err) {
            utility.error("ERROR in general.GetAllStats: " + err);
            return false;
        }
    },

    owned: function (name) {
        try {
            var it    = 0,
                owned = false;

            for (it = general.records.length - 1; it >= 0; it -= 1) {
                if (general.records[it]['name'] && general.records[it]['name'] === name) {
                    owned = true;
                    break;
                }
            }

            return owned;
        } catch (err) {
            utility.error("ERROR in general.owned: " + err);
            return undefined;
        }
    }
    /*jslint sub: false */
};
