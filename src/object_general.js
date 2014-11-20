
    ////////////////////////////////////////////////////////////////////
    //                          general OBJECT
    // this is the main object for dealing with Generals
    /////////////////////////////////////////////////////////////////////

    general = {
        records: [],

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        record: function () {
            this.data = {
                'name'       : '',
                'img'        : '',
                'lvl'        : 0,
                'pct'        : 0,
                'last'       : Date.now() - (24 * 3600000),
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
                'healthMax'  : 0,
                'item'       : 0,
                'itype'      : 0,
                'coolDown'   : false,
                'charge'     : 0
            };
        },
        /*jslint sub: false */

        hbest: 0,

        load: function () {
            try {
                general.records = gm.getItem('general.records', 'default');
                if (general.records === 'default' || !$j.isArray(general.records)) {
                    general.records = gm.setItem('general.records', []);
                }

                general.BuildlLists();
                general.hbest = general.hbest === false ? JSON.hbest(general.records) : general.hbest;
                con.log(3, "general.load Hbest", general.hbest);
                session.setItem("GeneralsDashUpdate", true);
                con.log(3, "general.load", general.records);
                return true;
            } catch (err) {
                con.error("ERROR in general.load: " + err);
                return false;
            }
        },

        save: function (src) {
            try {
                var compress = false;
                if (caap.domain.which === 3) {
                    caap.messaging.setItem('general.records', general.records);
                } else {
                    gm.setItem('general.records', general.records, general.hbest, compress);
                    con.log(3, "general.save", general.records);
                    if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                        con.log(2, "general.save send");
                        caap.messaging.setItem('general.records', general.records);
                    }
                }

                if (caap.domain.which !== 0) {
                    session.setItem("GeneralsDashUpdate", true);
                }

                return true;
            } catch (err) {
                con.error("ERROR in general.save: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        getItem: function (generalName, quiet) {
            try {
                if (!$u.hasContent(generalName) || !$u.isString(generalName)) {
                    con.warn("generalName", generalName);
                    throw "Invalid identifying generalName!";
                }

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
                    if (!quiet) {
                        con.warn("Unable to find 'General' record", generalName);
                    }

                    return false;
                }

                return general.records[it];
            } catch (err) {
                con.error("ERROR in general.getItem: " + err);
                return false;
            }
        },

        setItem: function (record) {
            try {
                if (!record || !$j.isPlainObject(record)) {
                    throw "Not passed a record";
                }

                if (!$u.hasContent(record['name']) || !$u.isString(record['name'])) {
                    con.warn("name", record['name']);
                    throw "Invalid identifying name!";
                }

                var it      = 0,
                    len     = 0,
                    success = false;

                for (it = 0, len = general.records.length; it < len; it += 1) {
                    if (general.records[it]['name'] === record['name']) {
                        success = true;
                        break;
                    }
                }

                if (success) {
                    general.records[it] = record;
                    con.log(3, "Updated general record", record, general.records);
                } else {
                    general.records.push(record);
                    con.log(3, "Added general record", record, general.records);
                }

                general.save();
                return true;
            } catch (err) {
                con.error("ERROR in general.setItem: " + err);
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
                con.error("ERROR in general.GetNames: " + err);
                return false;
            }
        },

        GetImage: function (generalName) {
            try {
                var genImg = general.getItem(generalName);

                if (genImg === false) {
                    con.warn("Unable to find 'General' image");
                    genImg = '';
                } else {
                    genImg = genImg['img'];
                }

                return genImg;
            } catch (err) {
                con.error("ERROR in general.GetImage: " + err);
                return false;
            }
        },

        GetStaminaMax: function (generalName) {
            try {
                var genStamina = general.getItem(generalName);

                if (genStamina === false) {
                    con.warn("Unable to find 'General' stamina");
                    genStamina = 0;
                } else {
                    genStamina = genStamina['staminaMax'];
                }

                return genStamina;
            } catch (err) {
                con.error("ERROR in general.GetStaminaMax: " + err);
                return false;
            }
        },

        GetEnergyMax: function (generalName) {
            try {
                var genEnergy = general.getItem(generalName);

                if (genEnergy === false) {
                    con.warn("Unable to find 'General' energy");
                    genEnergy = 0;
                } else {
                    genEnergy = genEnergy['energyMax'];
                }

                return genEnergy;
            } catch (err) {
                con.error("ERROR in general.GetEnergyMax: " + err);
                return false;
            }
        },

        GetHealthMax: function (generalName) {
            try {
                var genHealth = general.getItem(generalName);

                if (genHealth === false) {
                    con.warn("Unable to find 'General' health");
                    genHealth = 0;
                } else {
                    genHealth = genHealth['healthMax'];
                }

                return genHealth;
            } catch (err) {
                con.error("ERROR in general.GetHealthMax: " + err);
                return false;
            }
        },

        GetLevel: function (generalName) {
            try {
                var genLevel = general.getItem(generalName);

                if (genLevel === false) {
                    con.warn("Unable to find 'General' level");
                    genLevel = 1;
                } else {
                    genLevel = genLevel['lvl'];
                }

                return genLevel;
            } catch (err) {
                con.error("ERROR in general.GetLevel: " + err);
                return false;
            }
        },

        GetPercent: function (generalName) {
            try {
                var genPct = general.getItem(generalName);

                if (genPct === false) {
                    con.warn("Unable to find 'General' level percent");
                    genPct = 0;
                } else {
                    genPct = genPct['pct'];
                }

                return genPct;
            } catch (err) {
                con.error("ERROR in general.GetPercent: " + err);
                return false;
            }
        },

        GetLevelUpNames: function () {
            try {
                var it    = 0,
                    len   = 0,
                    names = [];

                for (it = 0, len = general.records.length; it < len; it += 1) {
                    if (general.records[it]['pct'] < 100) {
                        names.push(general.records[it]['name']);
                    }
                }

                return names;
            } catch (err) {
                con.error("ERROR in general.GetLevelUpNames: " + err);
                return false;
            }
        },

        getCoolDownNames: function () {
            try {
                var it    = 0,
                    len   = 0,
                    names = [];

                for (it = 0, len = general.records.length; it < len; it += 1) {
                    if (general.records[it]['coolDown']) {
                        names.push(general.records[it]['name']);
                    }
                }

                return names.sort();
            } catch (err) {
                con.error("ERROR in general.getCoolDownNames: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        List: [],

        AltList: [],

        BuyList: [],

        IncomeList: [],

        BankingList: [],

        CollectList: [],

        SubQuestList: [],

        coolDownList: [],

        StandardList: [
            'Idle',
            'Monster',
            'Fortify',
            'GuildMonster',
            'Invade',
            'Duel',
            'War'
            //'Arena'
            //'Festival'
        ],

        coolStandardList: [
            'Monster',
            'Fortify',
            'GuildMonster',
            'Invade',
            'Duel',
            'War'
        ],

        BuildlLists: function () {
            try {
                con.log(3, 'Building Generals Lists');
                general.List = [
                    'Use Current',
                    'Under Level'
                ].concat(general.GetNames());

                general.AltList = [
                    'Use Current'
                ].concat(general.GetNames());

                var filterList = config.getItem("filterGeneral", true),
                    crossList = function (checkItem) {
                        return general.List.hasIndexOf(checkItem);
                    };

                general.BuyList = filterList ? [
                    'Use Current',
                    'Darius',
                    'Lucius',
                    'Garlan',
                    'Penelope'
                ].filter(crossList) : general.AltList;

                general.IncomeList = filterList ? [
                    'Use Current',
                    'Scarlett',
                    'Mercedes',
                    'Cid'
                ].filter(crossList) : general.AltList;

                general.BankingList = filterList ? [
                    'Use Current',
                    'Aeris'
                ].filter(crossList) : general.AltList;

                general.CollectList = filterList ? [
                    'Use Current',
                    'Angelica',
                    'Morrigan',
                    'Valiant'
                ].filter(crossList) : general.AltList;

                general.SubQuestList = filterList ? [
                    'Use Current',
                    'Under Level',
                    'Sano',
                    'Titania'
                ].filter(crossList) : general.List;

                general.coolDownList = [
                    ''
                ].concat(general.getCoolDownNames());

                return true;
            } catch (err) {
                con.error("ERROR in general.BuildlLists: " + err);
                return false;
            }
        },

        /* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
        /*jslint sub: true */
        GetCurrent: function () {
            try {
                var equipDiv    = $j("#" + caap.domain.id[caap.domain.which] + "equippedGeneralContainer", caap.globalContainer),
                    generalName = $j('div[style*="general_plate.gif"] > div:first, #equippedGeneralContainer div.general_name_div3').text().trim(),
                    record      = {};

                if (!generalName) {
                    con.warn("Couldn't get current 'General'. Using 'Use Current'");
                    return 'Use Current';
                }

                record = general.getItem(generalName);
                if (record['coolDown'] && !$u.hasContent($j(".activeCooldownGeneralSmallContainer", equipDiv))) {
                    record['charge'] = 0;
                    general.setItem(record);
                }

                con.log(4, "Current General", generalName);
                return generalName;
            } catch (err) {
                con.error("ERROR in general.GetCurrent: " + err);
                return 'Use Current';
            }
        },

        GetGenerals: function () {
            try {
                var generalsDiv = $j("div.generalSmallContainer2", caap.appBodyDiv),
                    update      = false,
                    save        = false;

                if ($u.hasContent(generalsDiv)) {
                    generalsDiv.each(function (index) {
                        var newGeneral = new general.record(),
                            name       = '',
                            img        = '',
                            item       = 0,
                            itype      = 0,
                            level      = 0,
                            percent    = 0,
                            atk        = 0,
                            def        = 0,
                            special    = '',
                            coolDown   = false,
                            charge     = 0,
                            container  = $j(this),
                            it         = 0,
                            len        = 0,
                            tempObj    = $j("div.general_name_div3", container);

                        if ($u.hasContent(tempObj)) {
                            name = tempObj.text().trim();
                        } else {
                            con.warn("Unable to find 'name' container", index);
                        }

                        tempObj = $j(".imgButton", container);
                        if ($u.hasContent(tempObj)) {
                            img = $u.setContent(tempObj.attr("src"), '').basename();
                        } else {
                            con.warn("Unable to find 'image' container", index);
                        }

                        tempObj = $j("input[name='item']", container);
                        if ($u.hasContent(tempObj)) {
                            item = $u.setContent(tempObj.attr("value"), '').parseInt();
                        } else {
                            con.warn("Unable to find 'item' container", index);
                        }

                        tempObj = $j("input[name='itype']", container);
                        if ($u.hasContent(tempObj)) {
                            itype = $u.setContent(tempObj.attr("value"), '').parseInt();
                        } else {
                            con.warn("Unable to find 'itype' container", index);
                        }

                        tempObj = $j("div[style*='train_progress.jpg']", container);
                        if ($u.hasContent(tempObj)) {
                            coolDown = true;
                            charge = $u.setContent(tempObj.getPercent("width"), 0);
                        } else {
                            con.log(4, "Not a cool down general", index);
                        }

                        tempObj = container.children().eq(3);
                        if ($u.hasContent(tempObj)) {
                            level = $u.setContent(tempObj.text(), '0').replace(/Level /gi, '').stripTRN().parseInt();
                        } else {
                            con.warn("Unable to find 'level' container", index);
                        }

                        tempObj = $j("div[style*='#3b5561'],div[style*='rgb(59, 85, 97)']", container);
                        if ($u.hasContent(tempObj)) {
                            percent = tempObj.getPercent('width');
                        } else {
                            con.warn("Unable to find 'level percent' container", index);
                        }

                        tempObj = container.children().eq(4);
                        if ($u.hasContent(tempObj)) {
                            special = $u.setContent($j($u.setContent(tempObj.html(), '').replace(/<br>/g, ' ')).text(), '').trim().innerTrim();
                        } else {
                            con.warn("Unable to find 'special' container", index);
                        }

                        tempObj = $j(".generals_indv_stats_padding div", container);
                        if ($u.hasContent(tempObj) && tempObj.length === 2) {
                            atk = $u.setContent(tempObj.eq(0).text(), '0').parseInt();
                            def = $u.setContent(tempObj.eq(1).text(), '0').parseInt();
                        } else {
                            con.warn("Unable to find 'attack and defence' containers", index);
                        }

                        if ($u.hasContent(name) && $u.hasContent(img) && $u.hasContent(level) && $u.hasContent(percent) && !$u.isNaN(atk) && !$u.isNaN(def) && $u.hasContent(special)) {
                            for (it = 0, len = general.records.length; it < len; it += 1) {
                                if (general.records[it]['name'] === name) {
                                    newGeneral.data = general.records[it];
                                    break;
                                }
                            }

                            newGeneral.data['name'] = name;
                            newGeneral.data['img'] = img;
                            newGeneral.data['item'] = item;
                            newGeneral.data['itype'] = itype;
                            newGeneral.data['coolDown'] = coolDown;
                            newGeneral.data['charge'] = charge;
                            newGeneral.data['lvl'] = level;
                            newGeneral.data['pct'] = percent;
                            newGeneral.data['atk'] = atk;
                            newGeneral.data['def'] = def;
                            newGeneral.data['api'] = (atk + (def * 0.7)).dp(2);
                            newGeneral.data['dpi'] = (def + (atk * 0.7)).dp(2);
                            newGeneral.data['mpi'] = ((newGeneral.data['api'] + newGeneral.data['dpi']) / 2).dp(2);
                            newGeneral.data['special'] = special;
                            if (it < len) {
                                general.records[it] = newGeneral.data;
                            } else {
                                con.log(1, "Adding new 'General'", newGeneral.data['name']);
                                general.records.push(newGeneral.data);
                                update = true;
                            }

                            save = true;
                        } else {
                            con.warn("Missing required 'General' attribute", index);
                        }
                    });

                    if (save) {
                        caap.stats['generals']['total'] = general.records.length;
                        caap.stats['generals']['invade'] = Math.min((caap.stats['army']['actual'] / 5).dp(), general.records.length);
                        general.save();
                        caap.saveStats();
                        if (update) {
                            general.UpdateDropDowns();
                        }
                    }

                    con.log(3, "general.GetGenerals", general.records);
                }

                return true;
            } catch (err) {
                con.error("ERROR in general.GetGenerals: " + err);
                return false;
            }
        },
        /*jslint sub: false */

        UpdateDropDowns: function () {
            try {
                var it       = 0,
                    len      = 0,
                    coolDown = '';

                general.BuildlLists();
                con.log(3, "Updating 'General' Drop Down Lists");
                for (it = 0, len = general.StandardList.length; it < len; it += 1) {
                    caap.changeDropDownList(general.StandardList[it] + 'General', general.List, config.getItem(general.StandardList[it] + 'General', 'Use Current'));
                    coolDown = general.getCoolDownType(general.StandardList[it]);
                    if (coolDown) {
                        caap.changeDropDownList(coolDown, general.coolDownList, config.getItem(coolDown, ''));
                    }
                }

                if (coolDown && general.coolDownList.length > 1) {
                    $j("div[id*='_cool_row']", caap.caapDivObject).css("display", "block");
                    if (general.getItem("Zin", true) === false ? false : true) {
                        $j("div[id*='_zin_row']", caap.caapDivObject).css("display", "block");
                    }
                }

                caap.changeDropDownList('SubQuestGeneral', general.SubQuestList, config.getItem('SubQuestGeneral', 'Use Current'));
                caap.changeDropDownList('BuyGeneral', general.BuyList, config.getItem('BuyGeneral', 'Use Current'));
                caap.changeDropDownList('IncomeGeneral', general.IncomeList, config.getItem('IncomeGeneral', 'Use Current'));
                caap.changeDropDownList('BankingGeneral', general.BankingList, config.getItem('BankingGeneral', 'Use Current'));
                caap.changeDropDownList('CollectGeneral', general.CollectList, config.getItem('CollectGeneral', 'Use Current'));
                caap.changeDropDownList('LevelUpGeneral', general.List, config.getItem('LevelUpGeneral', 'Use Current'));
                return true;
            } catch (err) {
                con.error("ERROR in general.UpdateDropDowns: " + err);
                return false;
            }
        },

        Clear: function (whichGeneral) {
            try {
                con.log(1, 'Setting ' + whichGeneral + ' to "Use Current"');
                config.setItem(whichGeneral, 'Use Current');
                general.UpdateDropDowns();
                return true;
            } catch (err) {
                con.error("ERROR in general.Clear: " + err);
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
                        con.log(2, "Keep Level Up General");
                        keepGeneral = true;
                    } else {
                        con.warn("User opted out of keep level up general for", generalType);
                    }
                } else if (state.getItem('KeepLevelUpGeneral', false)) {
                    con.log(1, "Clearing Keep Level Up General flag");
                    state.setItem('KeepLevelUpGeneral', false);
                }

                if (config.getItem('LevelUpGeneral', 'Use Current') !== 'Use Current' && (general.StandardList.hasIndexOf(generalType) || generalType === 'Quest')) {
                    if (keepGeneral || (config.getItem(generalType + 'LevelUpGeneral', false) && caap.stats['exp']['dif'] && caap.stats['exp']['dif'] <= config.getItem('LevelUpGeneralExp', 0))) {
                        use = true;
                    }
                }

                return use;
            } catch (err) {
                con.error("ERROR in general.LevelUpCheck: " + err);
                return undefined;
            }
        },

        getCoolDownType: function (whichGeneral) {
            try {
                var generalType = whichGeneral ? whichGeneral.replace(/General/i, '').trim() : '',
                    it          = 0,
                    ok          = false;

                for (it = 0; it < general.coolStandardList.length; it += 1) {
                    if (general.coolStandardList[it] === generalType) {
                        ok = true;
                        break;
                    }
                }

                generalType = ok ? (generalType ? generalType + "CoolGeneral" : '') : '';
                return generalType;
            } catch (err) {
                con.error("ERROR in general.getCoolDownType: " + err);
                return undefined;
            }
        },

        Select: function (whichGeneral) {
            try {
                var generalName       = '',
                    getCurrentGeneral = '',
                    currentGeneral    = '',
                    generalImage      = '',
                    levelUp           = general.LevelUpCheck(whichGeneral),
                    coolType          = general.getCoolDownType(whichGeneral),
                    coolName          = coolType ? config.getItem(coolType, '') : '',
                    coolRecord        = coolName ? general.getItem(coolName) : {},
                    zinRecord         = general.getItem("Zin", true),
                    zinReady          = zinRecord && !$j.isEmptyObject(zinRecord) ? caap.stats['stamina']['num'] <= (caap.stats['stamina']['max'] - 15) && zinRecord['charge'] === 100 : false,
                    coolZin           = coolName === "Zin" ? caap.stats['stamina']['num'] > (caap.stats['stamina']['max'] - 15) : false,
                    useCool           = coolName && !coolZin && !$j.isEmptyObject(coolRecord) && coolRecord['charge'] === 100,
                    zinFirst          = config.getItem("useZinFirst", true);

                con.log(3, 'Cool', useCool, coolZin, coolType, coolName, coolRecord);
                con.log(3, 'Zin', zinReady, zinFirst, zinRecord);
                if (levelUp) {
                    whichGeneral = 'LevelUpGeneral';
                    con.log(2, 'Using level up general');
                }

                generalName = zinReady && zinFirst && coolType && whichGeneral !== "GuildMonster" ? "Zin" : (useCool ? coolName : config.getItem(whichGeneral, 'Use Current'));
                if (!generalName || /use current/i.test(generalName)) {
                    return false;
                }

                if (!levelUp && /under level/i.test(generalName)) {
                    if (!general.GetLevelUpNames().length) {
                        return general.Clear(whichGeneral);
                    }

                    generalName = config.getItem('ReverseLevelUpGenerals') ? general.GetLevelUpNames().reverse().pop() : generalName = general.GetLevelUpNames().pop();
                }

                getCurrentGeneral = general.GetCurrent();
                if (!getCurrentGeneral) {
                    caap.reloadCastleAge(true);
                }

                currentGeneral = getCurrentGeneral;
                if (generalName.hasIndexOf(currentGeneral)) {
                    return false;
                }

                con.log(1, 'Changing from ' + currentGeneral + ' to ' + generalName);
                if (caap.navigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                    return true;
                }

                generalImage = general.GetImage(generalName);
                if (caap.hasImage(generalImage)) {
                    return caap.navigateTo(generalImage);
                }

                caap.setDivContent('Could not find ' + generalName);
                con.warn('Could not find', generalName, generalImage);
                if (config.getItem('ignoreGeneralImage', true)) {
                    return false;
                } else {
                    return general.Clear(whichGeneral);
                }
            } catch (err) {
                con.error("ERROR in general.Select: " + err);
                return false;
            }
        },

        quickSwitch: false,

        GetEquippedStats: function () {
            try {
                general.quickSwitch = false;
                var generalName  = general.GetCurrent(),
                    it           = 0,
                    len          = 0,
                    generalDiv   = $j("#" + caap.domain.id[caap.domain.which] + "equippedGeneralContainer .generals_indv_stats div", caap.globalContainer),
                    tempObj      = $j(),
                    success      = false;

                if (generalName === 'Use Current') {
                    return false;
                }

                con.log(2, "Equipped 'General'", generalName);
                for (it = 0, len = general.records.length; it < len; it += 1) {
                    if (general.records[it]['name'] === generalName) {
                        break;
                    }
                }

                if (it >= len) {
                    con.warn("Unable to find 'General' record");
                    return false;
                }

                if ($u.hasContent(generalDiv) && generalDiv.length === 2) {
                    tempObj = generalDiv.eq(0);
                    if ($u.hasContent(tempObj)) {
                        general.records[it]['eatk'] = $u.setContent(tempObj.text(), '0').parseInt();
                        tempObj = generalDiv.eq(1);
                        if ($u.hasContent(tempObj)) {
                            general.records[it]['edef'] = $u.setContent(tempObj.text(), '0').parseInt();
                            success = true;
                        } else {
                            con.warn("Unable to get 'General' defense object");
                        }
                    } else {
                        con.warn("Unable to get 'General' attack object");
                    }

                    if (success) {
                        general.records[it]['eapi'] = (general.records[it]['eatk'] + (general.records[it]['edef'] * 0.7)).dp(2);
                        general.records[it]['edpi'] = (general.records[it]['edef'] + (general.records[it]['eatk'] * 0.7)).dp(2);
                        general.records[it]['empi'] = ((general.records[it]['eapi'] + general.records[it]['edpi']) / 2).dp(2);
                        general.records[it]['energyMax'] = caap.stats['energyT']['max'];
                        general.records[it]['staminaMax'] = caap.stats['staminaT']['max'];
                        general.records[it]['healthMax'] = caap.stats['healthT']['max'];
                        general.records[it]['last'] = Date.now();
                        general.save();
                        con.log(3, "Got 'General' stats", general.records[it]);
                    } else {
                        con.warn("Unable to get 'General' stats");
                    }
                } else {
                    con.warn("Unable to get equipped 'General' divs");
                }

                return general.records[it];
            } catch (err) {
                con.error("ERROR in general.GetEquippedStats: " + err);
                return false;
            }
        },

        GetAllStats: function () {
            try {
                var generalImage = '',
                    it           = 0,
                    len          = 0,
                    theGeneral   = '',
                    time         = config.getItem("GeneralLastReviewed", 24);

                time = (time < 24 ? 24 : time) * 3600;
                for (it = 0, len = general.records.length; it < len; it += 1) {
                    if (schedule.since(general.records[it]['last'], time)) {
                        break;
                    }
                }

                if (it >= len) {
                    time = config.getItem("GetAllGenerals", 7);
                    time = (time < 7 ? 7 : time) * 86400;
                    schedule.setItem("allGenerals", time, 300);
                    con.log(2, "Finished visiting all Generals for their stats");
                    theGeneral = config.getItem('IdleGeneral', 'Use Current');
                    if (theGeneral !== 'Use Current') {
                        con.log(2, "Changing to idle general");
                        return general.Select('IdleGeneral');
                    }

                    return false;
                }

                if (caap.navigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                    con.log(2, "Visiting generals to get 'General' stats");
                    return true;
                }

                generalImage = general.GetImage(general.records[it]['name']);
                if (caap.hasImage(generalImage)) {
                    if (general.GetCurrent() !== general.records[it]['name']) {
                        con.log(2, "Visiting 'General'", general.records[it]['name']);
                        return caap.navigateTo(generalImage);
                    }
                }

                return true;
            } catch (err) {
                con.error("ERROR in general.GetAllStats: " + err);
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
                con.error("ERROR in general.owned: " + err);
                return undefined;
            }
        },

        menu: function () {
            try {
                // Add General Comboboxes
                var reverseGenInstructions = "This will make the script level Generals under max level from Top-down instead of Bottom-up",
                    ignoreGeneralImage = "This will prevent the script " +
                        "from changing your selected General to 'Use Current' if the script " +
                        "is unable to find the General's image when changing activities. " +
                        "Instead it will use the current General for the activity and try " +
                        "to select the correct General again next time.",
                    LevelUpGenExpInstructions = "Specify the number of experience " +
                        "points below the next level up to begin using the level up general.",
                    LevelUpGenInstructions1 = "Use the Level Up General for Idle mode.",
                    LevelUpGenInstructions2 = "Use the Level Up General for Monster mode.",
                    LevelUpGenInstructions3 = "Use the Level Up General for Fortify mode.",
                    LevelUpGenInstructions4 = "Use the Level Up General for Invade mode.",
                    LevelUpGenInstructions5 = "Use the Level Up General for Duel mode.",
                    LevelUpGenInstructions6 = "Use the Level Up General for War mode.",
                    LevelUpGenInstructions7 = "Use the Level Up General for doing sub-quests.",
                    LevelUpGenInstructions8 = "Use the Level Up General for doing primary quests " +
                        "(Warning: May cause you not to gain influence if wrong general is equipped.)",
                    LevelUpGenInstructions9 = "Ignore Banking until level up energy and stamina gains have been used.",
                    LevelUpGenInstructions10 = "Ignore Income until level up energy and stamina gains have been used.",
                    LevelUpGenInstructions11 = "EXPERIMENTAL: Enables the Quest 'Not Fortifying' mode after level up.",
                    LevelUpGenInstructions12 = "Use the Level Up General for Guild Monster mode.",
                    //LevelUpGenInstructions13 = "Use the Level Up General for Arena mode.",
                    LevelUpGenInstructions14 = "Use the Level Up General for Buy mode.",
                    LevelUpGenInstructions15 = "Use the Level Up General for Collect mode.",
                    //LevelUpGenInstructions16 = "Use the Level Up General for Festival Guild Battles mode.",
                    dropDownItem = 0,
                    coolDown = '',
                    haveZin = general.getItem("Zin", true) === false ? false : true,
                    htmlCode = '';

                htmlCode += caap.startToggle('Generals', 'GENERALS');
                htmlCode += caap.makeCheckTR("Use Zin First", 'useZinFirst', true, 'If Zin is charged then use her first as long as you are 15 or less points from maximum stamina.', false, false, '', '_zin_row', haveZin ? "display: block;" : "display: none;");
                htmlCode += caap.makeCheckTR("Do not reset General", 'ignoreGeneralImage', true, ignoreGeneralImage);
                htmlCode += caap.makeCheckTR("Filter Generals", 'filterGeneral', true, "Filter General lists for most useable in category.");
                for (dropDownItem = 0; dropDownItem < general.StandardList.length; dropDownItem += 1) {
                    htmlCode += caap.makeDropDownTR(general.StandardList[dropDownItem], general.StandardList[dropDownItem] + 'General', general.List, '', '', 'Use Current', false, false, 62);
                    coolDown = general.getCoolDownType(general.StandardList[dropDownItem]);
                    htmlCode += coolDown ? caap.makeDropDownTR("Cool", coolDown, general.coolDownList, '', '', '', true, false, 62, '', '_cool_row', general.coolDownList.length > 1 ? "display: block;" : "display: none;") : '';
                }

                htmlCode += caap.makeDropDownTR("SubQuest", 'SubQuestGeneral', general.SubQuestList, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.makeDropDownTR("Buy", 'BuyGeneral', general.BuyList, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.makeDropDownTR("Collect", 'CollectGeneral', general.CollectList, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.makeDropDownTR("Income", 'IncomeGeneral', general.IncomeList, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.makeDropDownTR("Banking", 'BankingGeneral', general.BankingList, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.makeDropDownTR("Level Up", 'LevelUpGeneral', general.List, '', '', 'Use Current', false, false, 62);
                htmlCode += caap.startDropHide('LevelUpGeneral', '', 'Use Current', true);
                htmlCode += caap.makeNumberFormTR("Exp To Use Gen", 'LevelUpGeneralExp', LevelUpGenExpInstructions, 20, '', '', true, false);
                htmlCode += caap.makeCheckTR("Gen For Idle", 'IdleLevelUpGeneral', true, LevelUpGenInstructions1, true, false);
                htmlCode += caap.makeCheckTR("Gen For Monsters", 'MonsterLevelUpGeneral', true, LevelUpGenInstructions2, true, false);
                htmlCode += caap.makeCheckTR("Gen For Guild Monsters", 'GuildMonsterLevelUpGeneral', true, LevelUpGenInstructions12, true, false);
                htmlCode += caap.makeCheckTR("Gen For Fortify", 'FortifyLevelUpGeneral', true, LevelUpGenInstructions3, true, false);
                htmlCode += caap.makeCheckTR("Gen For Invades", 'InvadeLevelUpGeneral', true, LevelUpGenInstructions4, true, false);
                htmlCode += caap.makeCheckTR("Gen For Duels", 'DuelLevelUpGeneral', true, LevelUpGenInstructions5, true, false);
                htmlCode += caap.makeCheckTR("Gen For Wars", 'WarLevelUpGeneral', true, LevelUpGenInstructions6, true, false);
                //htmlCode += caap.makeCheckTR("Gen For Arena", 'ArenaLevelUpGeneral', true, LevelUpGenInstructions13, true, false);
                //htmlCode += caap.makeCheckTR("Gen For Festival", 'FestivalLevelUpGeneral', true, LevelUpGenInstructions16, true, false);
                htmlCode += caap.makeCheckTR("Gen For SubQuests", 'SubQuestLevelUpGeneral', true, LevelUpGenInstructions7, true, false);
                htmlCode += caap.makeCheckTR("Gen For Buy", 'BuyLevelUpGeneral', true, LevelUpGenInstructions14, true, false);
                htmlCode += caap.makeCheckTR("Gen For Collect", 'CollectLevelUpGeneral', true, LevelUpGenInstructions15, true, false);
                htmlCode += caap.makeCheckTR("Gen For MainQuests", 'QuestLevelUpGeneral', false, LevelUpGenInstructions8, true, false);
                htmlCode += caap.makeCheckTR("Do not Bank After", 'NoBankAfterLvl', true, LevelUpGenInstructions9, true, false);
                htmlCode += caap.makeCheckTR("Do not Income After", 'NoIncomeAfterLvl', true, LevelUpGenInstructions10, true, false);
                htmlCode += caap.makeCheckTR("Prioritise Monster After", 'PrioritiseMonsterAfterLvl', false, LevelUpGenInstructions11, true, false);
                htmlCode += caap.endDropHide('LevelUpGeneral');
                htmlCode += caap.makeCheckTR("Reverse Under Level Order", 'ReverseLevelUpGenerals', false, reverseGenInstructions);
                htmlCode += caap.makeCheckTR("Modify Timers", 'generalModifyTimers', false, "Advanced timers for how often General checks are performed.");
                htmlCode += caap.startCheckHide('generalModifyTimers');
                htmlCode += caap.makeNumberFormTR("List Hours", 'checkGenerals', "Check the Generals list every X hours. Minimum 24.", 24, '', '', true);
                htmlCode += caap.makeNumberFormTR("Scan Days", 'GetAllGenerals', "Scan the Generals every X days. Minimum 7.", 7, '', '', true);
                htmlCode += caap.makeNumberFormTR("Checked Hours", 'GeneralLastReviewed', "Check the General during the scan if not visited in the last X hours. Minimum 24.", 24, '', '', true);
                htmlCode += caap.endCheckHide('generalModifyTimers');
                htmlCode += caap.endToggle;
                return htmlCode;
            } catch (err) {
                con.error("ERROR in general.menu: " + err);
                return '';
            }
        },

        dashboard: function () {
            try {
                /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_generalsStats' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
                if (config.getItem('DBDisplay', '') === 'Generals Stats' && session.getItem("GeneralsDashUpdate", true)) {
                    var headers       = ['General', 'Lvl', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'EAtk', 'EDef', 'EAPI', 'EDPI', 'EMPI', 'Special'],
                        values        = ['name', 'lvl', 'atk', 'def', 'api', 'dpi', 'mpi', 'eatk', 'edef', 'eapi', 'edpi', 'empi', 'special'],
                        pp            = 0,
                        link          = '',
                        instructions  = '',
                        it            = 0,
                        len           = 0,
                        len1          = 0,
                        data          = {text: '', color: '', bgcolor: '', id: '',  title: ''},
                        header        = {text: '', color: '', bgcolor: '', id: '', title: '', width: ''},
                        handler       = null,
                        head          = '',
                        body          = '',
                        row           = '';

                    for (pp = 0, len = headers.length; pp < len; pp += 1) {
                        header = {
                            text  : headers[pp],
                            color : '',
                            id    : '',
                            title : '',
                            width : '7%'
                        };

                        switch (headers[pp]) {
                        case 'General' :
                            header.width = '13%';
                            break;
                        case 'Lvl' :
                        case 'Atk' :
                        case 'Def' :
                        case 'API' :
                        case 'DPI' :
                        case 'MPI' :
                            header.width = '5.5%';
                            break;
                        case 'Special' :
                            header.width = '19%';
                            break;
                        default:
                        }

                        head += caap.makeTh(header);
                    }

                    head = caap.makeTr(head);
                    for (it = 0, len = general.records.length; it < len; it += 1) {
                        row = "";
                        for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                            if (values[pp] === 'name') {
                                //link = "generals.php?itype=" + general.records[it]['itype'] + "&item=" + general.records[it]['item'];
                                link = "generals.php";
                                instructions = "Clicking this link will change General to " + general.records[it]['name'];
                                data = {
                                    text  : '<span id="caap_general_' + it + '" title="' + instructions + '" mname="' + general.records[it]['name'] + '" rlink="' + link + '" itype="' + general.records[it]['itype'] + '" item="' + general.records[it]['item'] +
                                            '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + general.records[it]['name'] + '</span>',
                                    color : 'blue',
                                    id    : '',
                                    title : ''
                                };

                                row += caap.makeTd(data);
                            } else {
                                row += caap.makeTd({text: $u.setContent(general.records[it][values[pp]], ''), color: '', title: ''});
                            }
                        }

                        body += caap.makeTr(row);
                    }

                    $j("#caap_generalsStats", caap.caapTopObject).html(
                        $j(caap.makeTable("general", head, body)).dataTable({
                            "bAutoWidth"    : false,
                            "bFilter"       : false,
                            "bJQueryUI"     : false,
                            "bInfo"         : false,
                            "bLengthChange" : false,
                            "bPaginate"     : false,
                            "bProcessing"   : false,
                            "bStateSave"    : true,
                            "bSortClasses"  : false,
                            "aoColumnDefs"  : [{
                                "bSortable" : false,
                                "aTargets"  : [12]
                            }]
                        })
                    );

                    handler = function (e) {
                        var changeLink = {
                                mname     : '',
                                rlink     : '',
                                itype     : '',
                                item      : ''
                            },
                            i          = 0,
                            len        = 0,
                            gen        = {},
                            page       = session.getItem("page", "");

                        for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                            if (e.target.attributes[i].nodeName === 'mname') {
                                changeLink.mname = e.target.attributes[i].nodeValue;
                            } else if (e.target.attributes[i].nodeName === 'rlink') {
                                changeLink.rlink = e.target.attributes[i].nodeValue;
                            } else if (e.target.attributes[i].nodeName === 'itype') {
                                gen.itype = changeLink.itype = e.target.attributes[i].nodeValue.parseInt();
                            } else if (e.target.attributes[i].nodeName === 'item') {
                                gen.item = changeLink.item = e.target.attributes[i].nodeValue.parseInt();
                            }
                        }

                        if ($u.hasContent(changeLink.rlink)) {
                            caap.ajaxLoadIcon.css("display", "block");
                            if (page === "generals") {
                                caap.clickAjaxLinkSend(changeLink.rlink + "?itype=" + gen.itype + "&item=" + gen.item);
                            } else {
                                general.quickSwitch = true;
                                caap.ajaxLoad(changeLink.rlink, gen, "#" + caap.domain.id[caap.domain.which] + "equippedGeneralContainer", "#" + caap.domain.id[caap.domain.which] + "equippedGeneralContainer", page);
                            }
                        }
                    };

                    $j("span[id*='caap_general_']", caap.caapTopObject).unbind('click', handler).click(handler);

                    session.setItem("GeneralsDashUpdate", false);
                }

                return true;
            } catch (err) {
                con.error("ERROR in general.dashboard: " + err);
                return false;
            }
        }
        /*jslint sub: false */
    };
