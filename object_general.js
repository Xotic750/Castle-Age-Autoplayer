
////////////////////////////////////////////////////////////////////
//                          general OBJECT
// this is the main object for dealing with Generals
/////////////////////////////////////////////////////////////////////

general = {
    records: [],

    recordsSortable: [],

    record: function () {
        this.data = {
            name       : '',
            img        : '',
            lvl        : 0,
            last       : new Date().getTime() - (24 * 3600000),
            special    : '',
            atk        : 0,
            def        : 0,
            api        : 0,
            dpi        : 0,
            mpi        : 0,
            eatk       : 0,
            edef       : 0,
            eapi       : 0,
            edpi       : 0,
            empi       : 0,
            energyMax  : 0,
            staminaMax : 0,
            healthMax  : 0
            /*
            battle  : {
                win   : 0,
                loss  : 0,
                total : 0,
                ratio : 0
            },
            duel    : {
                win   : 0,
                loss  : 0,
                total : 0,
                ratio : 0
            },
            war    : {
                win   : 0,
                loss  : 0,
                total : 0,
                ratio : 0
            },
            monster : {
                attack : {
                    used : 0,
                    points : {
                        total : 0,
                        max   : 0,
                        tsp   : 0,
                        dpsp  : 0
                    }
                },
                fortify : {
                    used : 0,
                    points : {
                        total : 0,
                        max   : 0,
                        tep   : 0,
                        fpep  : 0
                    }
                }
            },
            quests  : 0
            */
        };
    },

    copy2sortable: function () {
        try {
            this.recordsSortable = [];
            $.merge(this.recordsSortable, this.records);
            return true;
        } catch (err) {
            utility.error("ERROR in general.copy2sortable: " + err);
            return false;
        }
    },

    load: function () {
        try {
            if (gm.getItem('general.records', 'default') === 'default' || !$.isArray(gm.getItem('general.records', 'default'))) {
                gm.setItem('general.records', this.records);
            } else {
                this.records = gm.getItem('general.records', this.records);
            }

            this.copy2sortable();
            this.BuildlLists();
            state.setItem("GeneralsDashUpdate", true);
            utility.log(5, "general.load", this.records);
            return true;
        } catch (err) {
            utility.error("ERROR in general.load: " + err);
            return false;
        }
    },

    save: function () {
        try {
            gm.setItem('general.records', this.records);
            state.setItem("GeneralsDashUpdate", true);
            utility.log(5, "general.save", this.records);
            return true;
        } catch (err) {
            utility.error("ERROR in general.save: " + err);
            return false;
        }
    },

    find: function (general) {
        try {
            var it    = 0,
                len   = 0,
                found = false;

            for (it = 0, len = this.records.length; it < len; it += 1) {
                if (this.records[it].name === general) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                utility.warn("Unable to find 'General' record");
                return false;
            }

            return this.records[it];
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

            for (it = 0, len = this.records.length; it < len; it += 1) {
                names.push(this.records[it].name);
            }

            return names.sort();
        } catch (err) {
            utility.error("ERROR in general.GetNames: " + err);
            return false;
        }
    },

    GetImage: function (general) {
        try {
            var genImg = this.find(general);

            if (genImg === false) {
                utility.warn("Unable to find 'General' image");
                genImg = '';
            } else {
                genImg = genImg.img;
            }

            return genImg;
        } catch (err) {
            utility.error("ERROR in general.GetImage: " + err);
            return false;
        }
    },

    GetStaminaMax: function (general) {
        try {
            var genStamina = this.find(general);

            if (genStamina === false) {
                utility.warn("Unable to find 'General' stamina");
                genStamina = 0;
            } else {
                genStamina = genStamina.staminaMax;
            }

            return genStamina;
        } catch (err) {
            utility.error("ERROR in general.GetStaminaMax: " + err);
            return false;
        }
    },

    GetEnergyMax: function (general) {
        try {
            var genEnergy = this.find(general);

            if (genEnergy === false) {
                utility.warn("Unable to find 'General' energy");
                genEnergy = 0;
            } else {
                genEnergy = genEnergy.energyMax;
            }

            return genEnergy;
        } catch (err) {
            utility.error("ERROR in general.GetEnergyMax: " + err);
            return false;
        }
    },

    GetHealthMax: function (general) {
        try {
            var genHealth = this.find(general);

            if (genHealth === false) {
                utility.warn("Unable to find 'General' health");
                genHealth = 0;
            } else {
                genHealth = genHealth.healthMax;
            }

            return genHealth;
        } catch (err) {
            utility.error("ERROR in general.GetHealthMax: " + err);
            return false;
        }
    },

    GetLevel: function (general) {
        try {
            var genLevel = this.find(general);

            if (genLevel === false) {
                utility.warn("Unable to find 'General' level");
                genLevel = 1;
            } else {
                genLevel = genLevel.lvl;
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

            for (it = 0, len = this.records.length; it < len; it += 1) {
                if (this.records[it].lvl < 4) {
                    names.push(this.records[it].name);
                }
            }

            return names;
        } catch (err) {
            utility.error("ERROR in general.GetLevelUpNames: " + err);
            return false;
        }
    },

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
        'SubQuest'
    ],

    BuildlLists: function () {
        try {
            utility.log(3, 'Building Generals Lists');
            this.List = [
                'Use Current',
                'Under Level 4'
            ].concat(this.GetNames());

            var crossList = function (checkItem) {
                return (general.List.indexOf(checkItem) >= 0);
            };

            this.BuyList = [
                'Use Current',
                'Darius',
                'Lucius',
                'Garlan',
                'Penelope'
            ].filter(crossList);

            this.IncomeList = [
                'Use Current',
                'Scarlett',
                'Mercedes',
                'Cid'
            ].filter(crossList);

            this.BankingList = [
                'Use Current',
                'Aeris'
            ].filter(crossList);

            this.CollectList = [
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
                nameObj     = null;

            nameObj = $("#app46755028429_equippedGeneralContainer .general_name_div3");
            if (nameObj) {
                generalName = $.trim(nameObj.text()).replace(/[\t\r\n]/g, '').replace('**', '');
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

    GetGenerals: function () {
        try {
            var generalsDiv = null,
                update      = false,
                save        = false,
                tempObj     = null;

            generalsDiv = $(".generalSmallContainer2");
            if (generalsDiv.length) {
                generalsDiv.each(function (index) {
                    var newGeneral   = new general.record(),
                        name      = '',
                        img       = '',
                        level     = 0,
                        atk       = 0,
                        def       = 0,
                        special   = '',
                        container = $(this),
                        it        = 0,
                        len       = 0;

                    tempObj = container.find(".general_name_div3");
                    if (tempObj && tempObj.length) {
                        name = tempObj.text().replace(/[\t\r\n]/g, '').replace('**', '');
                    } else {
                        utility.warn("Unable to find 'name' container", index);
                    }

                    tempObj = container.find(".imgButton");
                    if (tempObj && tempObj.length) {
                        img = utility.getHTMLPredicate(tempObj.attr("src"));
                    } else {
                        utility.warn("Unable to find 'image' container", index);
                    }

                    tempObj = container.children().eq(3);
                    if (tempObj && tempObj.length) {
                        level = parseInt(tempObj.text().replace(/Level /gi, '').replace(/[\t\r\n]/g, ''), 10);
                    } else {
                        utility.warn("Unable to find 'level' container", index);
                    }

                    tempObj = container.children().eq(4);
                    if (tempObj && tempObj.length) {
                        special = $.trim($(tempObj.html().replace(/<br>/g, ' ')).text());
                    } else {
                        utility.warn("Unable to find 'special' container", index);
                    }

                    tempObj = container.find(".generals_indv_stats_padding div");
                    if (tempObj && tempObj.length === 2) {
                        atk = parseInt(tempObj.eq(0).text(), 10);
                        def = parseInt(tempObj.eq(1).text(), 10);
                    } else {
                        utility.warn("Unable to find 'attack and defence' containers", index);
                    }

                    if (name && img && level && utility.isNum(atk) && utility.isNum(def) && special) {
                        for (it = 0, len = general.records.length; it < len; it += 1) {
                            if (general.records[it].name === name) {
                                newGeneral.data = general.records[it];
                                break;
                            }
                        }

                        newGeneral.data.name = name;
                        newGeneral.data.img = img;
                        newGeneral.data.lvl = level;
                        newGeneral.data.atk = atk;
                        newGeneral.data.def = def;
                        newGeneral.data.api = atk + (def * 0.7);
                        newGeneral.data.dpi = def + (atk * 0.7);
                        newGeneral.data.mpi = (newGeneral.data.api + newGeneral.data.dpi) / 2;
                        newGeneral.data.special = special;
                        if (it < len) {
                            general.records[it] = newGeneral.data;
                        } else {
                            utility.log(1, "Adding new 'General'", newGeneral.data.name);
                            general.records.push(newGeneral.data);
                            update = true;
                        }

                        save = true;
                    } else {
                        utility.warn("Missing required 'General' attribute", index);
                    }
                });

                if (save) {
                    caap.stats.generals.total = this.records.length;
                    caap.stats.generals.invade = Math.min((caap.stats.army.actual / 5).toFixed(0), this.records.length);
                    this.save();
                    caap.SaveStats();
                    this.copy2sortable();
                    if (update) {
                        this.UpdateDropDowns();
                    }
                }

                utility.log(3, "general.GetGenerals", this.records);
            }

            return true;
        } catch (err) {
            utility.error("ERROR in general.GetGenerals: " + err);
            return false;
        }
    },

    UpdateDropDowns: function () {
        try {
            var it  = 0,
                len = 0;

            this.BuildlLists();
            utility.log(2, "Updating 'General' Drop Down Lists");
            for (it = 0, len = this.StandardList.length; it < len; it += 1) {
                caap.ChangeDropDownList(this.StandardList[it] + 'General', this.List, config.getItem(this.StandardList[it] + 'General', 'Use Current'));
            }

            caap.ChangeDropDownList('BuyGeneral', this.BuyList, config.getItem('BuyGeneral', 'Use Current'));
            caap.ChangeDropDownList('IncomeGeneral', this.IncomeList, config.getItem('IncomeGeneral', 'Use Current'));
            caap.ChangeDropDownList('BankingGeneral', this.BankingList, config.getItem('BankingGeneral', 'Use Current'));
            caap.ChangeDropDownList('CollectGeneral', this.CollectList, config.getItem('CollectGeneral', 'Use Current'));
            caap.ChangeDropDownList('LevelUpGeneral', this.List, config.getItem('LevelUpGeneral', 'Use Current'));
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
            this.UpdateDropDowns();
            return true;
        } catch (err) {
            utility.error("ERROR in general.Clear: " + err);
            return false;
        }
    },

    LevelUpCheck: function (whichGeneral) {
        try {
            var generalType = '',
                use         = false,
                keepGeneral = false;

            generalType = $.trim(whichGeneral.replace(/General/i, ''));
            if ((caap.stats.staminaT.num > caap.stats.stamina.max || caap.stats.energyT.num > caap.stats.energy.max) && state.getItem('KeepLevelUpGeneral', false)) {
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

            if (config.getItem('LevelUpGeneral', 'Use Current') !== 'Use Current' && (this.StandardList.indexOf(generalType) >= 0 || generalType === 'Quest')) {
                if (keepGeneral || (config.getItem(generalType + 'LevelUpGeneral', false) && caap.stats.exp.dif && caap.stats.exp.dif <= config.getItem('LevelUpGeneralExp', 0))) {
                    use = true;
                }
            }

            return use;
        } catch (err) {
            utility.error("ERROR in general.LevelUpCheck: " + err);
            return undefined;
        }
    },

    Select: function (whichGeneral) {
        try {
            var generalName       = '',
                getCurrentGeneral = '',
                currentGeneral    = '',
                generalImage      = '';

            if (this.LevelUpCheck(whichGeneral)) {
                whichGeneral = 'LevelUpGeneral';
                utility.log(2, 'Using level up general');
            }

            generalName = config.getItem(whichGeneral, 'Use Current');
            if (!generalName || /use current/i.test(generalName)) {
                return false;
            }

            if (/under level 4/i.test(generalName)) {
                if (!this.GetLevelUpNames().length) {
                    return this.Clear(whichGeneral);
                }

                if (config.getItem('ReverseLevelUpGenerals')) {
                    generalName = this.GetLevelUpNames().reverse().pop();
                } else {
                    generalName = this.GetLevelUpNames().pop();
                }
            }

            getCurrentGeneral = this.GetCurrent();
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

            generalImage = this.GetImage(generalName);
            if (utility.CheckForImage(generalImage)) {
                return utility.NavigateTo(generalImage);
            }

            caap.SetDivContent('Could not find ' + generalName);
            utility.warn('Could not find', generalName, generalImage);
            if (config.getItem('ignoreGeneralImage', true)) {
                return false;
            } else {
                return this.Clear(whichGeneral);
            }
        } catch (err) {
            utility.error("ERROR in general.Select: " + err);
            return false;
        }
    },

    quickSwitch: false,

    GetEquippedStats: function () {
        try {
            var generalName  = '',
                it           = 0,
                len          = 0,
                generalDiv   = null,
                tempObj      = null,
                success      = false;

            generalName = this.GetCurrent();
            if (generalName === 'Use Current') {
                return false;
            }

            utility.log(2, "Equipped 'General'", generalName);
            for (it = 0, len = this.records.length; it < len; it += 1) {
                if (this.records[it].name === generalName) {
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
                    this.records[it].eatk = parseInt(tempObj.text(), 10);
                    tempObj = generalDiv.eq(1);
                    if (tempObj && tempObj.length) {
                        this.records[it].edef = parseInt(tempObj.text(), 10);
                        success = true;
                    } else {
                        utility.warn("Unable to get 'General' defense object");
                    }
                } else {
                    utility.warn("Unable to get 'General' attack object");
                }

                if (success) {
                    this.records[it].eapi = (this.records[it].eatk + (this.records[it].edef * 0.7));
                    this.records[it].edpi = (this.records[it].edef + (this.records[it].eatk * 0.7));
                    this.records[it].empi = ((this.records[it].eapi + this.records[it].edpi) / 2);
                    this.records[it].energyMax = caap.stats.energyT.max;
                    this.records[it].staminaMax = caap.stats.staminaT.max;
                    this.records[it].healthMax = caap.stats.healthT.max;
                    this.records[it].last = new Date().getTime();
                    this.save();
                    this.copy2sortable();
                    utility.log(3, "Got 'General' stats", this.records[it]);
                } else {
                    utility.warn("Unable to get 'General' stats");
                }
            } else {
                utility.warn("Unable to get equipped 'General' divs", generalDiv);
            }

            return this.records[it];
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

            for (it = 0, len = this.records.length; it < len; it += 1) {
                if (schedule.since(this.records[it].last, gm.getItem("GeneralLastReviewed", 24, hiddenVar) * 3600)) {
                    break;
                }
            }

            if (it >= len) {
                schedule.setItem("allGenerals", gm.getItem("GetAllGenerals", 168, hiddenVar) * 3600, 300);
                utility.log(2, "Finished visiting all Generals for their stats");
                theGeneral = config.getItem('IdleGeneral', 'Use Current');
                if (theGeneral !== 'Use Current') {
                    utility.log(2, "Changing to idle general");
                    return this.Select('IdleGeneral');
                }

                return false;
            }

            if (utility.NavigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                utility.log(2, "Visiting generals to get 'General' stats");
                return true;
            }

            generalImage = this.GetImage(this.records[it].name);
            if (utility.CheckForImage(generalImage)) {
                if (this.GetCurrent() !== this.records[it].name) {
                    utility.log(2, "Visiting 'General'", this.records[it].name);
                    return utility.NavigateTo(generalImage);
                }
            }

            return true;
        } catch (err) {
            utility.error("ERROR in general.GetAllStats: " + err);
            return false;
        }
    }
};
