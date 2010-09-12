
////////////////////////////////////////////////////////////////////
//                          general OBJECT
// this is the main object for dealing with Generals
/////////////////////////////////////////////////////////////////////

general = {
    Record : function () {
        this.data = {
            name    : '',
            img     : '',
            lvl     : 0,
            last    : new Date(2009, 1, 1).getTime(),
            special : '',
            atk     : 0,
            def     : 0,
            api     : 0,
            dpi     : 0,
            mpi     : 0,
            eatk    : 0,
            edef    : 0,
            eapi    : 0,
            edpi    : 0,
            empi    : 0
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

    RecordArray : [],

    RecordArraySortable : [],

    GetNames : function () {
        var it    = 0,
            names = [];

        for (it = 0; it < this.RecordArray.length; it += 1) {
            names.push(this.RecordArray[it].name);
        }

        return names.sort();
    },

    GetImage : function (general) {
        var it    = 0;

        for (it = 0; it < this.RecordArray.length; it += 1) {
            if (this.RecordArray[it].name === general) {
                break;
            }
        }

        return this.RecordArray[it].img;
    },

    GetLevelUpNames : function () {
        var it    = 0,
            names = [];

        for (it = 0; it < this.RecordArray.length; it += 1) {
            if (this.RecordArray[it].lvl < 4) {
                names.push(this.RecordArray[it].name);
            }
        }

        return names;
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
        'Battle',
        'Duel',
        'War',
        'SubQuest'
    ],

    Load: function () {
        this.RecordArray = gm.getJValue('AllGeneralsJSON', []);
        this.RecordArraySortable = [];
        $.merge(this.RecordArraySortable, this.RecordArray);
    },

    Save: function () {
        gm.setJValue('AllGeneralsJSON', this.RecordArray);
    },

    MakeSort: function () {
        this.RecordArraySortable = [];
        $.merge(this.RecordArraySortable, this.RecordArray);
    },

    BuildlLists: function () {
        try {
            global.log(1, 'Building Generals Lists');
            this.Load();
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
            global.error("ERROR in BuildlLists: " + err);
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
                global.log(1, "Couldn't get current 'General'. Will use current 'General'", generalName);
                return 'Use Current';
            }

            global.log(8, "Current General", generalName);
            return generalName;
        } catch (err) {
            global.error("ERROR in GetCurrent: " + err);
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
                    var newGeneral   = new general.Record(),
                        name      = '',
                        img       = '',
                        level     = 0,
                        atk       = 0,
                        def       = 0,
                        special   = '',
                        container = $(this),
                        it        = 0;

                    tempObj = container.find(".general_name_div3");
                    if (tempObj && tempObj.length) {
                        name = tempObj.text().replace(/[\t\r\n]/g, '').replace('**', '');
                    } else {
                        global.log(1, "Unable to find 'name' container", index);
                    }

                    tempObj = container.find(".imgButton");
                    if (tempObj && tempObj.length) {
                        img = nHtml.getHTMLPredicate(tempObj.attr("src"));
                    } else {
                        global.log(1, "Unable to find 'image' container", index);
                    }

                    tempObj = container.children().eq(3);
                    if (tempObj && tempObj.length) {
                        level = parseInt(tempObj.text().replace(/Level /gi, '').replace(/[\t\r\n]/g, ''), 10);
                    } else {
                        global.log(1, "Unable to find 'level' container", index);
                    }

                    tempObj = container.children().eq(4);
                    if (tempObj && tempObj.length) {
                        special = $.trim($(tempObj.html().replace(/<br>/g, ' ')).text());
                    } else {
                        global.log(1, "Unable to find 'special' container", index);
                    }

                    tempObj = container.find(".generals_indv_stats_padding div");
                    if (tempObj && tempObj.length === 2) {
                        atk = parseInt(tempObj.eq(0).text(), 10);
                        def = parseInt(tempObj.eq(1).text(), 10);
                    } else {
                        global.log(1, "Unable to find 'attack and defence' containers", index);
                    }

                    if (name && img && level && typeof atk === "number" && typeof def === "number" && special) {
                        for (it = 0; it < general.RecordArray.length; it += 1) {
                            if (general.RecordArray[it].name === name) {
                                newGeneral.data = general.RecordArray[it];
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
                        if (it < general.RecordArray.length) {
                            general.RecordArray[it] = newGeneral.data;
                        } else {
                            global.log(1, "Adding new 'General'", newGeneral.data.name);
                            general.RecordArray.push(newGeneral.data);
                            update = true;
                        }

                        save = true;
                    } else {
                        global.log(1, "Missing required 'General' attribute", index);
                    }
                });

                if (save) {
                    caap.stats.generals.total = this.RecordArray.length;
                    caap.stats.generals.invade = Math.min((caap.stats.army.actual / 5).toFixed(0), this.RecordArray.length);
                    this.Save();
                    caap.SaveStats();
                    this.MakeSort();
                    if (update) {
                        this.UpdateDropDowns();
                    }
                }

                global.log(2, "All Generals", this.RecordArray);
            }

            return true;
        } catch (err) {
            global.error("ERROR in GetGenerals: " + err);
            return false;
        }
    },

    UpdateDropDowns: function () {
        try {
            this.BuildlLists();
            global.log(1, "Updating 'General' Drop Down Lists");
            for (var generalType in this.StandardList) {
                if (this.StandardList.hasOwnProperty(generalType)) {
                    caap.ChangeDropDownList(this.StandardList[generalType] + 'General', this.List, gm.getValue(this.StandardList[generalType] + 'General', 'Use Current'));
                }
            }

            caap.ChangeDropDownList('BuyGeneral', this.BuyList, gm.getValue('BuyGeneral', 'Use Current'));
            caap.ChangeDropDownList('IncomeGeneral', this.IncomeList, gm.getValue('IncomeGeneral', 'Use Current'));
            caap.ChangeDropDownList('BankingGeneral', this.BankingList, gm.getValue('BankingGeneral', 'Use Current'));
            caap.ChangeDropDownList('CollectGeneral', this.CollectList, gm.getValue('CollectGeneral', 'Use Current'));
            caap.ChangeDropDownList('LevelUpGeneral', this.List, gm.getValue('LevelUpGeneral', 'Use Current'));
            return true;
        } catch (err) {
            global.error("ERROR in UpdateDropDowns: " + err);
            return false;
        }
    },

    Clear: function (whichGeneral) {
        try {
            global.log(1, 'Setting ' + whichGeneral + ' to "Use Current"');
            gm.setValue(whichGeneral, 'Use Current');
            this.UpdateDropDowns();
            return true;
        } catch (err) {
            global.error("ERROR in Clear: " + err);
            return false;
        }
    },

    Select: function (whichGeneral) {
        try {
            var generalType       = '',
                generalName       = '',
                getCurrentGeneral = '',
                currentGeneral    = '',
                generalImage      = '';

            if (gm.getValue('LevelUpGeneral', 'Use Current') !== 'Use Current') {
                generalType = $.trim(whichGeneral.replace(/General/i, ''));
                if (gm.getValue(generalType + 'LevelUpGeneral', false) &&
                        caap.stats.exp.dif && caap.stats.exp.dif <= gm.getValue('LevelUpGeneralExp', 0)) {
                    whichGeneral = 'LevelUpGeneral';
                    global.log(1, 'Using level up general');
                }
            }

            generalName = gm.getValue(whichGeneral, '');
            if (!generalName || /use current/i.test(generalName)) {
                return false;
            }

            if (/under level 4/i.test(generalName)) {
                if (!this.GetLevelUpNames().length) {
                    return this.Clear(whichGeneral);
                }

                if (gm.getValue('ReverseLevelUpGenerals')) {
                    generalName = this.GetLevelUpNames().reverse().pop();
                } else {
                    generalName = this.GetLevelUpNames().pop();
                }
            }

            getCurrentGeneral = this.GetCurrent();
            if (!getCurrentGeneral) {
                global.ReloadCastleAge();
            }

            currentGeneral = getCurrentGeneral;
            if (generalName.indexOf(currentGeneral) >= 0) {
                return false;
            }

            global.log(1, 'Changing from ' + currentGeneral + ' to ' + generalName);
            if (caap.NavigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                return true;
            }

            generalImage = this.GetImage(generalName);
            if (caap.CheckForImage(generalImage)) {
                return caap.NavigateTo(generalImage);
            }

            caap.SetDivContent('Could not find ' + generalName);
            global.log(1, 'Could not find', generalName, generalImage);
            if (gm.getValue('ignoreGeneralImage', true)) {
                return false;
            } else {
                return this.Clear(whichGeneral);
            }
        } catch (err) {
            global.error("ERROR in Select: " + err);
            return false;
        }
    },

    quickSwitch: false,

    GetEquippedStats: function () {
        try {
            var generalName  = '',
                it           = 0,
                generalDiv   = null,
                tempObj      = null,
                success      = false;

            generalName = this.GetCurrent();
            if (generalName === 'Use Current') {
                return false;
            }

            global.log(1, "Equipped 'General'", generalName);
            for (it = 0; it < this.RecordArray.length; it += 1) {
                if (this.RecordArray[it].name === generalName) {
                    break;
                }
            }

            if (it >= this.RecordArray.length) {
                global.log(1, "Unable to find 'General' record");
                return false;
            }

            generalDiv = $("#app46755028429_equippedGeneralContainer .generals_indv_stats div");
            if (generalDiv && generalDiv.length === 2) {
                tempObj = generalDiv.eq(0);
                if (tempObj && tempObj.length) {
                    this.RecordArray[it].eatk = parseInt(tempObj.text(), 10);
                    tempObj = generalDiv.eq(1);
                    if (tempObj && tempObj.length) {
                        this.RecordArray[it].edef = parseInt(tempObj.text(), 10);
                        success = true;
                    } else {
                        global.log(1, "Unable to get 'General' defense object");
                    }
                } else {
                    global.log(1, "Unable to get 'General' attack object");
                }

                if (success) {
                    this.RecordArray[it].eapi = (this.RecordArray[it].eatk + (this.RecordArray[it].edef * 0.7));
                    this.RecordArray[it].edpi = (this.RecordArray[it].edef + (this.RecordArray[it].eatk * 0.7));
                    this.RecordArray[it].empi = ((this.RecordArray[it].eapi + this.RecordArray[it].edpi) / 2);
                    this.RecordArray[it].last = new Date().getTime();
                    this.Save();
                    this.MakeSort();
                    global.log(9, "Got 'General' stats", this.RecordArray[it]);
                } else {
                    global.log(1, "Unable to get 'General' stats");
                }
            } else {
                global.log(1, "Unable to get equipped 'General' divs", generalDiv);
            }

            return this.RecordArray[it];
        } catch (err) {
            global.error("ERROR in GetAllStats: " + err);
            return false;
        }
    },

    GetAllStats: function () {
        try {
            if (!schedule.Check("allGenerals")) {
                return false;
            }

            var generalImage = '',
                it           = 0;

            for (it = 0; it < this.RecordArray.length; it += 1) {
                if (caap.WhileSinceDidIt(this.RecordArray[it].last, 10800)) {
                    break;
                }
            }

            if (it === this.RecordArray.length) {
                schedule.Set("allGenerals", gm.getNumber("GetAllGenerals", 24) * 3600, 300);
                global.log(9, "Finished visiting all Generals for their stats");
                return false;
            }

            if (caap.NavigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                global.log(1, "Visiting generals to get 'General' stats");
                return true;
            }

            generalImage = this.GetImage(this.RecordArray[it].name);
            if (caap.CheckForImage(generalImage)) {
                if (this.GetCurrent() !== this.RecordArray[it].name) {
                    global.log(1, "Visiting 'General'", this.RecordArray[it].name);
                    return caap.NavigateTo(generalImage);
                }
            }

            return true;
        } catch (err) {
            global.error("ERROR in GetAllStats: " + err);
            return false;
        }
    }
};
