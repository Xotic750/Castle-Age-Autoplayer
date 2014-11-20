/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          general OBJECT
// this is the main object for dealing with Generals
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    general.records = [];

    general.lists = {};
    general.usedGenerals = [];
    general.GeneralsList = [];
    general.LoadoutsList = [];

    general.coolList = [
        'Monster',
        'Fortify',
        'GuildMonster',
        'Invade',
        'Duel',
        'War'];

    general.menuList = [
        'Idle',
        'Monster',
        'Fortify',
        'GuildMonster',
        'Invade',
        'Duel',
        'War',
        //'Arena',
        'Buy',
        'Income',
        'Banking',
        'Collect',
        'SubQuest',
        'GB Class',
        'Fest Class',
        '10v10 Class',
        'GB Fest Idle',
        'Level Up'];

    general.filters = {
        'Buy' : [
            'Darius',
            'Lucius',
            'Garlan',
            'Penelope'],
        'Income' : [
            'Scarlett',
            'Mercedes',
            'Cid'],
        'Banking' : [
            'Aeris'],
        'Collect' : [
            'Angelica',
            'Morrigan',
            'Valiant'],
        'SubQuest' : [
            'Under Level',
            'Sano',
            'Titania']
    };

    general.record = function () {
        this.data = {
            'name': '',
            'img': '',
            'lvl': 0,
            'lvlmax': 0,
            'pct': 0,
            'last': 0,
            'special': '',
            'atk': 0,
            'def': 0,
            'api': 0,
            'dpi': 0,
            'mpi': 0,
            'eatk': 0,
            'edef': 0,
            'eapi': 0,
            'edpi': 0,
            'empi': 0,
            'energy': 0,
            'stamina': 0,
            'attackItemBonus': 0,
            'defenseItemBonus': 0,
            'health': 0,
            'item': 0,
            'itype': 0,
            'coolDown': false,
            'charge': 0,
            'general': 'Use Current',
            'value':0
        };
    };

    general.hbest = 0;

    general.load = function () {
        try {
            general.records = gm.getItem('general.records', 'default');
            con.log(2, "pre general.load", general.records, $u.hasContent(general.records));
            if (general.records === 'default' || !$j.isArray(general.records) || (general.records.length && $u.isUndefined(general.records[0].attackItemBonus))) {
                general.records = gm.setItem('general.records', []);
            }

            general.BuildLists();
            general.hbest = general.hbest === false ? JSON.hbest(general.records) : general.hbest;
            con.log(5, "general.load Hbest", general.hbest);
            session.setItem("GeneralsDashUpdate", true);
            con.log(5, "general.load", general.records);
            return true;
        } catch (err) {
            con.error("ERROR in general.load: " + err);
            return false;
        }
    };

    general.save = function (src) {
        try {
            var compress = false;

            con.log(5, 'general save',general.records);

            if (caap.domain.which === 3) {
                caap.messaging.setItem('general.records', general.records);
            } else {
                gm.setItem('general.records', general.records, general.hbest, compress);
                con.log(3, "general.save", general.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    con.log(5, "general.save send");
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
    };

    general.parseTime = function (timeString) {
        if (timeString == '') return null;

        var time = timeString.match(/(\d+)(:(\d\d))?\s*(p?)/i);
        if (time == null) return null;

        var hours = parseInt(time[1],10);
        if (hours == 12 && !time[4]) {
              hours = 0;
        }
        else {
            hours += (hours < 12 && time[4])? 12 : 0;
        }
        var d = new Date();
        d.setHours(hours);
        d.setMinutes(parseInt(time[3],10) || 0);
        d.setSeconds(0, 0);
        return d;
    };

    // Parse the menu item too see if a loadout override should be equipped.  If time is during a general override time,
    // the according general will be equipped, and a value of True will be returned continually to the main loop, so no
    // other action will be taken until the time is up.
    // Returns false if not timed set, "change" if a timed loadout was changed, and "set" if done setting a timed loadout
    general.timedLoadout = function () {
        try {
            var timedLoadoutsList = config.getList('timed_loadouts', ''),
                begin = 0,
                end = 0,
                match = false,
                change = false,
                returnValue = 'change',
                targetGeneral = '',
                timeStrings = '',
                now = new Date();
            // Priority generals, such as Guild Battle class generals, outrank timed generals.
            if (!caap.stats.priorityGeneral || caap.stats.priorityGeneral == 'false' || caap.stats.priorityGeneral == false) {
                con.log(2,'Priority gen reset to "Use Current"');
		caap.stats.priorityGeneral = 'Use Current';
            }
            if (caap.stats.priorityGeneral != 'Use Current') {
                timeStrings = now.toLocaleTimeString().replace(/:\d+ /,' ') + '@' + caap.stats.priorityGeneral;
                timedLoadoutsList.unshift(timeStrings);
                con.log(2,'Priority gen set', timeStrings, timedLoadoutsList);
            }
            con.log(5, 'timedLoadoutsList', timedLoadoutsList);
            // Next we step through the users list getting the name and conditions
            for (var p = 0, len = timedLoadoutsList.length; p < len; p++) {
                if (!timedLoadoutsList[p].toString().trim()) {
                    continue;
                }
                timeStrings = timedLoadoutsList[p].toString().split('-');
                con.log(4,'timeStrings',timeStrings);
                if (timeStrings.length === 1) {
                    begin = general.parseTime(timeStrings[0]) - 2 * 60 * 1000;
                    end = begin + 4 * 60 * 1000;
                } else {
                    begin = general.parseTime(timeStrings[0]);
                    end = general.parseTime(timeStrings[1]);
                    end = end > begin ? end : end.setHours(end.getHours() +  24);
                    // Need to add a check here in case going over midnight hour
                }
                con.log(4,'begin ' + $u.makeTime(begin, caap.timeStr(true)) + ' end ' + $u.makeTime(end, caap.timeStr(true)) + ' time ' + $u.makeTime(now, caap.timeStr(true)), begin, end, now);

                if (begin < now && now < end) {
                    match = true;
                    con.log(4, 'valid time of ',timeStrings);
                }
                // Now we check the other elements to look for a general name to load, prefixed with '@'
                if (match && timedLoadoutsList[p].toString().split('@').length > 1) {
                    targetGeneral = timedLoadoutsList[p].toString().split('@')[1].trim();
                    con.log(2, 'Selecting Timed General:', targetGeneral);
                    return general.selectSpecific(targetGeneral) ? 'change' : 'set';
                }
            }
            return false;
        } catch (err) {
            con.error("ERROR in general.timedLoadout: " + err);
            return false;
        }
    };

    general.getRecord = function (generalName, quiet) {
        try {
            if (!$u.hasContent(generalName) || !$u.isString(generalName)) {
                con.warn("generalName", generalName);
                throw "Invalid identifying generalName!";
            }

            for (var it = 0; it < general.records.length; it++) {
                if (general.records[it].name === generalName) {
                    return general.records[it];
                }
            }

            if (!quiet) {
                con.warn("GetRecord: Unable to find 'General' record", generalName);
            }

            return false;

        } catch (err) {
            con.error("ERROR in general.getRecord: " + err);
            return false;
        }
    };

    // Look up a stat for a general.
    general.GetStat = function (generalName, stat) {
        try {
           var generalRecord = general.getRecord(generalName,false);

            if (generalRecord === false) {
                con.warn("Unable to find 'General' " + generalName + " stat " + stat);
                return false;
            }
            if (general.isLoadout(generalRecord.name) && typeof generalRecord[stat] == 'undefined') {
                return generalRecord.general ? general.GetStat(generalRecord.general, stat) : false;
            }
            return generalRecord[stat];
        } catch (err) {
            con.error("ERROR in general.GetStat: " + err);
            return false;
        }
    };

    general.GetLevelUpNames = function () {
        try {
            var it = 0,
                len = 0,
                names = [];

            for (it = 0, len = general.records.length; it < len; it += 1) {
                if (general.records[it].pct < 100) {
                    names.push(general.records[it].name);
                }
            }

            return names;
        } catch (err) {
            con.error("ERROR in general.GetLevelUpNames: " + err);
            return false;
        }
    };

    general.getCoolDownNames = function () {
        try {
            var it = 0,
                len = 0,
                names = [];

            for (it = 0, len = general.records.length; it < len; it += 1) {
                if (general.records[it].coolDown) {
                    names.push(general.records[it].name);
                }
            }

            return names.sort();
        } catch (err) {
            con.error("ERROR in general.getCoolDownNames: " + err);
            return false;
        }
    };

    general.isLoadout = function (name) {
        try {
            if (name.indexOf('Loadout ') < 0) {
                return false;
            }
            return name.replace('Loadout ','');
        } catch (err) {
            con.error("ERROR in general.isLoadout: " + err);
            return false;
        }
    }

    general.BuildLists = function () {
        try {
            var it = 0,
                len = 0,
                fullList = [],
                generalList = [],
				defaultLoadout = config.getItem('Default Loadout', 'Use Current'),
                usedGen = '',
				uGR = {},
                crossList = function (checkItem) {
                    return generalList.hasIndexOf(checkItem) >= 0;
                };

            con.log(2, 'Building Generals Lists');

            general.LoadoutsList = [];
            general.usedGenerals = [];
			['energy', 'stamina', 'health'].forEach(function(stat) {
				caap.stats[stat].min = 0;
			});

            for (it = 0, len = general.records.length; it < len; it += 1) {
                if (!general.isLoadout(general.records[it].name)) {
                    general.GeneralsList.push(general.records[it].name);
                } else {
                    general.LoadoutsList.push(general.records[it].name);
                }
            }
            general.GeneralsList = general.GeneralsList.sort();
            fullList = general.LoadoutsList.concat(general.GeneralsList);
            generalList = ['Under Level'].concat(fullList);

            general.menuList.forEach(function(item) {
                usedGen = config.getItem(item + 'General');
                if (['Use Current', 'Under Level', ''].indexOf(usedGen) == -1 && general.usedGenerals.indexOf(usedGen) == -1) {
                    general.usedGenerals.push(usedGen);
					uGR = general.getRecord(usedGen);
					['energy', 'stamina', 'health'].forEach(function(stat) {
						if (general.isLoadout(usedGen)) {
							caap.stats[stat].min = Math.min(caap.stats[stat].min, uGR[stat]);
						} else if (defaultLoadout == 'Use Current') {
							caap.stats[stat].min = Math.min(caap.stats[stat].min, uGR[stat]);
						} else {
							caap.stats[stat].min = Math.min(caap.stats[stat].min, uGR[stat] + general.getRecord(defaultLoadout)[stat]);
						}
						//con.log(2, 'Min loadout/general en/sta adjustment calc', uGR, caap.stats[stat].min, caap.stats[stat]);
					});
                }
                general.lists[item] = ($u.isArray(general.filters[item]) && config.getItem("filterGeneral", true)) ? general.filters[item].filter(crossList) : generalList;
            });

            general.coolDownList = [''].concat(general.getCoolDownNames());

            con.log(2, 'Built lists',general.LoadoutsList, general.lists, general.usedGenerals, caap.stats);

            return true;
        } catch (err) {
            con.error("ERROR in general.BuildLists: " + err);
            return false;
        }
    };

    general.quickSwitch = false;
    general.clickedLoadout = false;

    general.assignStats = function (generalRecord, eatk, edef) {
        try {
            generalRecord.eatk = eatk;
            generalRecord.edef = edef;
            generalRecord.eapi = (generalRecord.eatk + (generalRecord.edef * 0.7)).dp(2);
            generalRecord.edpi = (generalRecord.edef + (generalRecord.eatk * 0.7)).dp(2);
            generalRecord.empi = ((generalRecord.eapi + generalRecord.edpi) / 2).dp(2);
			['energy', 'stamina', 'health'].forEach(function(stat) {
				if (caap.stats[stat].norm && caap.stats[stat].max) {
					generalRecord[stat] = caap.stats[stat].max - caap.stats[stat].norm;
					//con.log(2, 'Updated ' + stat + ' adjustement for ' + generalRecord.name + ' to ' + generalRecord[stat], generalRecord, caap.stats[stat]);
					if (general.usedGenerals.indexOf(generalRecord.name) > 0) {
						caap.stats[stat].min = Math.min(caap.stats[stat].min, generalRecord[stat]);
					}
				}
			});
            generalRecord.last = Date.now();
            caap.updateDashboard(true);
            general.save();
            //con.log(2, "Got general stats for " + generalRecord.name, generalRecord);
            return true;
        } catch (err) {
            con.error("ERROR in general.assignStats: " + err);
            return false;
        }
    }

    // Called after a page load, this records the specific information for each general that cannot be seen if the
    // general isn't equipped, such as item bonuses to general or max sta/energy and the max stamina/energy/health.
    general.GetEquippedStats = function () {
        try {
            general.quickSwitch = false;
            var generalName = general.GetCurrentGeneral(),
                loadoutName = general.GetCurrentLoadout(),
                loadoutRecord = general.getRecord(loadoutName,false),
                generalRecord = general.getRecord(generalName,false),
                defaultLoadout = config.getItem("DefaultLoadout", 'Use Current'),
                generalDiv = $j(),
                tempObj = $j(),
                success = false,
                save = false,
                eatk, edef,
                temptext = '';

			// Record the general information if a loadout has been clicked or none if loadout is not defined
			if (general.clickedLoadout !== false) {
				if (session.getItem('page','None') === 'player_loadouts') {
					general.records[general.clickedLoadout].last = Date.now();
					con.log(2, general.records[general.clickedLoadout].name + " is not configured.");
				} else if (general.clickedLoadout == loadoutRecord.value - 1) {
					general.records[general.clickedLoadout].last = Date.now();
					if (loadoutName == general.records[general.clickedLoadout].name && general.records[general.clickedLoadout].general !== generalName) {
						con.log(2,"Updated general for " + general.records[general.clickedLoadout].name + " is " + generalName, general.records);
						general.records[general.clickedLoadout].general = generalName;
					}
				}
			}
			general.clickedLoadout = false;

            if (generalName === 'Use Current' || !generalRecord) {
                con.warn("Get Equipped Stats: Unable to find 'General' record", generalName);
                return false;
            }

            generalDiv = $j("#globalContainer div[style*='hot_general_container.gif'] div[style*='width:25px;']");
            if ($u.hasContent(generalDiv) && generalDiv.length === 2) {
                temptext = $u.setContent(generalDiv.text(), '');
                if ($u.hasContent(temptext)) {
                    eatk = $u.setContent(temptext.regex(/\s+(\d+)\s+\d+/i), 0);
                    edef = $u.setContent(temptext.regex(/\s+\d+\s+(\d+)/i), 0);
                    if ($u.isNumber(eatk) && $u.isNumber(edef)) {
                        //con.log(2, "General equipped atk/def", eatk, edef);
                        success = true;
                    } else {
                        con.warn("Unable to get 'General' attack or defense", temptext);
                    }
                } else {
                    con.warn("Unable to get 'General' equipped status");
                }

                if (success) {
                    if (loadoutName === defaultLoadout || defaultLoadout == 'Use Current') {
                        general.assignStats(generalRecord, eatk, edef);
                    }
                    if (loadoutRecord.general === generalName) {
                        general.assignStats(loadoutRecord, eatk, edef);
                    }

                } else {
                    con.warn("Unable to get 'General' stats");
                }
            } else {
                con.warn("Unable to get equipped 'General' div");
            }

            return generalRecord;
        } catch (err) {
            con.error("ERROR in general.GetEquippedStats: " + err);
            return false;
        }
    };

    // Called every page load.  Records all loadouts
    general.GetLoadouts = function() {
        try {
            var update = false,
                name = '',
                loadoutsList = $j('#hot_swap_loadouts_div select[name="choose_loadout"] option').map(function() {
                    return this.text;
                }).get();

            // Record current loadouts
            if ($u.hasContent(loadoutsList)) {
                for (var it = 0, len = loadoutsList.length; it < len; it += 1) {
                    name = 'Loadout ' + loadoutsList[it];
                    if (general.records.length < it + 1) {
                        general.records.push(new general.record().data);
                    }
                    if (name !== general.records[it].name) {
                        general.records[it] == new general.record().data;
                        con.log(1, "Adding new 'Loadout'", name, general.records);
                        general.records[it].name = name;
                        general.records[it].value = it + 1;
                        update = true;
                    }
                }
                caap.stats.records.total = general.records.length;
                if (update) {
                    general.save();
                    caap.saveStats();
                    caap.updateDashboard(true);
                    general.UpdateDropDowns();
                }

                con.log(5, "loadoutslist done", general.records);
                return true;
            } else {
                con.warn("Couldn't get 'loadouts'.");
                return false;
            }
        } catch (err) {
            con.error("ERROR in general.GetLoadouts: " + err);
            return false;
        }
    };

    general.Shrink = function () {
       try {
            var generalBox = $j('div[style*="hot_general_container.gif"]');

            if (generalBox[0]) {
                generalBox[0].style.zIndex = 1;
                generalBox.mouseover(function () {
                    this.style.zIndex = 100;
                });

                generalBox.mouseout(function () {
                    this.style.zIndex = 1;
                });
            }

            generalBox = null;
        } catch (err) {
            con.error("ERROR in general.shrink: " + err);
        }
    };

    general.owned = function (name) {
        try {
            var it = 0,
                owned = false;

            for (it = general.records.length - 1; it >= 0; it -= 1) {
                if (general.records[it].name && general.records[it].name === name) {
                    owned = true;
                    break;
                }
            }

            return owned;
        } catch (err) {
            con.error("ERROR in general.owned: " + err);
            return undefined;
        }
    };

    // If on the Loadouts page after clicking loadout, then the player hasn't configured that loadout.
    general.checkResults_loadouts = function () {
        // May add something here to reset a bad loadout to 'Use Current'
    };

    // Called when visiting the generals page, this records the basic information of all generals
    general.checkResults_onGenerals = function () {
        try {
            var generalsDiv = $j("#app_body div.generalSmallContainer2"),
                update = false,
                save = false;

           if ($u.hasContent(generalsDiv)) {
                generalsDiv.each(function (index) {
                    var generalData = {},
                        name = '',
                        img = '',
                        item = 0,
                        itype = 0,
                        level = 0,
                        levelmax = 0,
                        percent = 0,
                        atk = 0,
                        def = 0,
                        special = '',
                        coolDown = false,
                        charge = 0,
                        container = $j(this),
                        it = 0,
                        len = 0,
                        tempObj = $j("div.general_name_div3_padding", container);

                    if ($u.hasContent(tempObj)) {
                        name = tempObj.text().trim(); // save all generals with complete name (eg Corvintheus**) // 2011-09-27 d11
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

                    tempObj = $j("div[style*='graphics/gen_chargebarsmall.gif']", container);
                    if ($u.hasContent(tempObj) || container.text().indexOf('Charged!') !== -1) {
                        coolDown = true;
                        charge = $u.setContent(tempObj.getPercent("width"), 0);
                    } else {
                        con.log(4, "Not a cool down general", index);
                    }

                    tempObj = container.find('div:contains("Level"):last');
                    if ($u.hasContent(tempObj)) {
                        level = $u.setContent(tempObj.text(), '0').regex(/Level (\d+)\/\d+/i, '');
                        levelmax = $u.setContent(tempObj.text(), '0').regex(/Level \d+\/(\d+)/i, '');
                    } else {
                        con.warn("Unable to find 'level' container", index);
                    }

                    tempObj = $j("div[style*='graphics/bar_img.jpg']", container);
                    if ($u.hasContent(tempObj)) {
                        percent = tempObj.getPercent('width');
                    } else {
                        con.warn("Unable to find 'level percent' container", index);
                    }

                    tempObj = container.children('div:last').children('div');
                    if ($u.hasContent(tempObj)) {
                        special = $u.setContent(tempObj.html(tempObj.html().replace(/<br>/g, ' ')).text().trim());
                    } else {
                        con.warn("Unable to find 'special' container", index);
                    }

                    tempObj = $j(".general_pic_div3", container);
                    if ($u.hasContent(tempObj)) {
                        atk = $u.setContent(tempObj.next('div:first').children('div:eq(0)').text(), '0').parseInt();
                        def = $u.setContent(tempObj.next('div:first').children('div:eq(1)').text(), '0').parseInt();
                    } else {
                        con.warn("Unable to find 'attack and defence' containers", index);
                    }

                    if ($u.hasContent(name) && $u.hasContent(img) && $u.hasContent(level) && $u.hasContent(percent) && !$u.isNaN(atk) && !$u.isNaN(def) && $u.hasContent(special)) {
                        generalData = general.getRecord(name, true);
                        if (!generalData) {
                            con.log(1, "Adding new 'General'", name);
                            generalData = general.records[general.records.push(new general.record().data) - 1];
                            update = true;
                        }

                        // If we've reviewed before and general level hasn't changed, assume we don't need to review
                        if (generalData.lvl == level && generalData.eatk !== 0) {
                            generalData.last = Date.now();
                        }

                        generalData.name = name;
                        generalData.img = img;
                        generalData.item = item;
                        generalData.itype = itype;
                        generalData.coolDown = coolDown;
                        generalData.charge = charge;
                        generalData.lvl = level;
                        generalData.lvlmax = levelmax;
                        generalData.pct = percent;
                        generalData.atk = atk;
                        generalData.def = def;
                        generalData.api = (atk + (def * 0.7)).dp(2);
                        generalData.dpi = (def + (atk * 0.7)).dp(2);
                        generalData.mpi = ((generalData.api + generalData.dpi) / 2).dp(2);
                        generalData.special = special;

                        save = true;
                        container = null;
                        tempObj = null;
                    } else {
                        con.warn("Missing required 'General' attribute", index);
                    }
                });

                if (save) {
                    caap.stats.generals = caap.stats.generals || {};
                    caap.stats.generals.total = general.records.length;
                    caap.stats.generals.invade = Math.min((caap.stats.army.actual / 5).dp(), general.records.length);
                    general.save();
                    caap.saveStats();
                    if (update) {
                        caap.updateDashboard(true);
                        general.UpdateDropDowns();
                    }
                }

                con.log(5, "general.checkResults_onGenerals", general.records);
            }

            generalsDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in general.checkResults_onGenerals: " + err);
            return false;
        }
    };

    general.UpdateDropDowns = function () {
        try {
            var len = 0,
                coolDown = '';

            general.BuildLists();
            con.log(3, "Updating 'General' Drop Down Lists");
            caap.changeDropDownList('DefaultLoadout', ['Use Current'].concat(general.LoadoutsList), config.getItem('DefaultLoadout', 'Use Current'));
            for (var i = 0, len = general.menuList.length; i < len; i += 1) {
                caap.changeDropDownList(general.menuList[i] + 'General', ['Use Current'].concat(general.lists[general.menuList[i]]), config.getItem(general.menuList[i] + 'General', 'Use Current'));
                coolDown = general.getCoolDownType(general.menuList[i]);
                if (coolDown) {
                    caap.changeDropDownList(coolDown, general.coolDownList, config.getItem(coolDown, ''));
                }
            }

            if (coolDown && general.coolDownList.length > 1) {
                $j("div[id*='_cool_row']", caap.caapDivObject).css("display", "block");
                if (general.getRecord("Zin", true) === false ? false : true) {
                    $j("div[id*='_zin_row']", caap.caapDivObject).css("display", "block");
                }
            }
            return true;
        } catch (err) {
            con.error("ERROR in general.UpdateDropDowns: " + err);
            return false;
        }
    };

    general.Clear = function (whichGeneral) {
        try {
            con.log(1, 'Setting ' + whichGeneral + ' to "Use Current"');
            config.setItem(whichGeneral, 'Use Current');
            general.UpdateDropDowns();
            return true;
        } catch (err) {
            con.error("ERROR in general.Clear: " + err);
            return false;
        }
    };

    general.LevelUpCheck = function (whichGeneral) {
        try {
            var generalType = '',
                use = false,
                keepGeneral = false;

            generalType = whichGeneral ? whichGeneral.replace(/General/i, '').trim() : '';
            if ((caap.stats.stamina.num > caap.stats.stamina.max || caap.stats.energy.num > caap.stats.energy.max) && state.getItem('KeepLevelUpGeneral', false)) {
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

            if (config.getItem('LevelUpGeneral', 'Use Current') !== 'Use Current' && (general.menuList.hasIndexOf(generalType) || generalType === 'Quest')) {
                if (keepGeneral || (config.getItem(generalType + 'LevelUpGeneral', false) && caap.stats.exp.dif && caap.stats.exp.dif <= config.getItem('LevelUpGeneralExp', 0))) {
                    use = true;
                }
            }

            return use;
        } catch (err) {
            con.error("ERROR in general.LevelUpCheck: " + err);
            return undefined;
        }
    };

    general.getCoolDownType = function (whichGeneral) {
        try {
            var generalType = whichGeneral ? whichGeneral.replace(/General/i, '').trim() : '';

           if (general.coolList.indexOf(generalType) >= 0) {
                con.log(5,'Cool General',generalType, whichGeneral);
                return generalType + "CoolGeneral";
            }
            con.log(5,'NO Cool General',generalType, whichGeneral);

            return '';
        } catch (err) {
            con.error("ERROR in general.getCoolDownType: " + err);
            return undefined;
        }
    };

    general.GetCurrentGeneral = function () {
        try {
            var generalName = $j('div[style*="hot_general_container.gif"] > div:first > div:nth-child(2), #equippedGeneralContainer div.general_name_div3').text().trim();
            con.log(4, "Current General:", generalName);

            if (!generalName) {
                con.warn("Couldn't get current 'General'. Using 'Use Current'");
                return 'Use Current';
            }

            return generalName;
        } catch (err) {
            con.error("ERROR in general.GetCurrentGeneral: " + err);
            return 'Use Current';
        }
    };

    general.GetCurrentLoadout = function () {
        try {
            var loadoutName = $j('#hot_swap_loadouts_div select[name="choose_loadout"] option:selected').text().trim();

            if (!loadoutName) {
                con.warn("Couldn't get current 'loadout'. Using 'Use Current'");
                return 'Use Current';
            }

            //con.log(2, "Current Loadout:", loadoutName);
            return "Loadout " + loadoutName;
        } catch (err) {
            con.error("ERROR in general.GetCurrentLoadout: " + err);
            return 'Use Current';
        }
    };

    // Convert from a role like "IdleGeneral" to a specific general required, and then calls a function to select that general
    general.Select = function (whichGeneral) {
        try {
            var targetGeneral = '',
                timedResult = general.timedLoadout(),
                levelUp = general.LevelUpCheck(whichGeneral),
                coolType = general.getCoolDownType(whichGeneral),
                coolName = coolType ? config.getItem(coolType, '') : '',
                coolRecord = coolName ? general.getRecord(coolName) : {},
                zinRecord = general.getRecord("Zin", true),
                zinReady = zinRecord && !$j.isEmptyObject(zinRecord) ? caap.stats.stamina.num <= (caap.stats.stamina.max - 15) && zinRecord.charge === 100 : false,
                coolZin = coolName === "Zin" ? caap.stats.stamina.num > (caap.stats.stamina.max - 15) : false,
                useCool = coolName && !coolZin && !$j.isEmptyObject(coolRecord) && coolRecord.charge === 100,
                zinFirst = config.getItem("useZinFirst", true),
                thisAction = state.getItem('ThisAction', 'idle'),
                zinAction = ["battle"];

            if (timedResult) {
                con.log(2,'General change to ' + whichGeneral + ' paused while equipping timed general');
                return (timedResult == 'change') || config.getItem('timedFreeze', true);
            }

            if (general.records.length <= (caap.stats.level >= 100 ? 20 : 2)) {
                con.log(1, "Generals count of " + general.records.length + " <= " + (caap.stats.level >= 100 ? 20 : 2) + ', checking Generals page');
                return caap.navigateTo('generals');
            }

            con.log(3, 'Cool', useCool, coolZin, coolType, coolName, coolRecord);
            con.log(3, 'Zin', zinReady, zinFirst, zinRecord);
            if (levelUp) {
                whichGeneral = 'LevelUpGeneral';
                con.log(2, 'Using level up general');
            }

            //Check what target general should be
            targetGeneral = zinReady && zinFirst && zinAction.hasIndexOf(thisAction) ? "Zin" : useCool ? coolName : whichGeneral.indexOf('General') > 0 ? config.getItem(whichGeneral, whichGeneral) : whichGeneral;
            //con.log(2, 'Select General ', whichGeneral, targetGeneral, coolName, config.getItem(whichGeneral, whichGeneral));

            if (targetGeneral == 'Use Current') {
                return false;
            }

            if (!levelUp && /under level/i.test(targetGeneral)) {
                if (!general.GetLevelUpNames().length) {
                    return general.Clear(whichGeneral);
                }

                targetGeneral = config.getItem('ReverseLevelUpGenerals') ? general.GetLevelUpNames().reverse().pop() : general.GetLevelUpNames().pop();
            }

            if (!general.getRecord(targetGeneral,false)) {
                con.warn('Unable to find ' + targetGeneral + ' record for ' + whichGeneral + '.  Changing setting to "Use Current"');
                general.Clear(whichGeneral);
                return false;
            }

            return general.selectSpecific(targetGeneral);
        } catch (err) {
            con.error("ERROR in general.Select: " + err);
            return false;
        }
    };

    // Load a specific general or loadout by name.  'Use Current' is used for no preference.
    general.selectSpecific = function(targetGeneral) {
        try {
            var	targetLoadout = '',
                generalImage = '',
                lRecord = {},
                currentGeneral = general.GetCurrentGeneral(),
                currentLoadout = general.GetCurrentLoadout(),
                defaultLoadout = config.getItem("DefaultLoadout", 'Use Current');

			//con.log(2, "Select Specific " + targetGeneral);
            if (defaultLoadout != 'Use Current' && !general.getRecord(defaultLoadout,false)) {
                con.warn('Unable to find ' + defaultLoadout + ' record for the default Loadout.  Changing setting to "Use Current"');
                general.Clear('DefaultLoadout');
            }

            if (!targetGeneral || targetGeneral == 'Use Current') {
                return false;
            }

            // Confirm loadout is ok
            targetLoadout = general.isLoadout(targetGeneral) ? targetGeneral : defaultLoadout;
            targetLoadout = (targetLoadout === "Use Current") ? currentLoadout : targetLoadout;
            lRecord = general.getRecord(targetLoadout,false);
            targetGeneral = general.isLoadout(targetGeneral) ? general.GetStat(targetGeneral,'general') : targetGeneral;
            if (targetLoadout !== currentLoadout || !general.GetStat(targetLoadout,'general')) {
//				|| (targetGeneral !== currentGeneral && targetGeneral == lRecord.general)) {
                if (lRecord === false) {
                    con.log(2,'Unable to find ' + targetLoadout + ' record. general.records.length:' + general.records.length + ' targetGeneral ',targetGeneral, currentLoadout, currentGeneral);
                    return false;
                }
                con.log(2,'Loading ' +targetLoadout + ' value ' + lRecord.value, lRecord);

                general.clickedLoadout = lRecord.value-1;
                caap.click($j('div[id*="hot_swap_loadouts_content_div"] > div:nth-child(' + lRecord.value + ') > div:first'));
                return true;
            }

            // Confirm if necessary to load a different general
            if (!targetGeneral || targetGeneral === currentGeneral || targetGeneral === 'Use Current') {
                return false;
            }

            con.log(2, 'Changing from ' + currentGeneral + ' to ' + targetGeneral);
            if (caap.navigateTo('mercenary,generals', 'tab_generals_on.gif')) {
                return true;
            }

            generalImage = general.GetStat(targetGeneral, 'img');
            if (generalImage && caap.hasImage(generalImage, $j('#generalContainerBox2'))) {
                general.clickedLoadout = false;
                caap.click(caap.checkForImage(generalImage, $j('#generalContainerBox2')));
                return true;
            }

            caap.setDivContent('Could not find ' + targetGeneral);
            con.warn('Could not find', targetGeneral, generalImage);
            if (!config.getItem('ignoreGeneralImage', true)) {
                return general.Clear(whichGeneral);
            }

            return false;
        } catch (err) {
            con.error("ERROR in general.selectSpecific: " + err);
            return false;
        }
    };

    //Read the equipped stats from all generals by loading them one-by-one
    general.GetAllStats = function () {
        try {
            var generalImage = '',
                generalName = '',
                time = 0,
                len = general.records.length;

            session.setItem('ReleaseControl', true);
            if (!config.getItem('enableCheckAllGenerals', false) || !schedule.check("allGenerals")) {
                return false;
            }
            if (general.timedLoadout()) {
                con.log(2,'Pausing general review while equipping timed general');
                return false;
            }

            if (((caap.stats.energy.max || 0) > 0 && caap.stats.energy.num > caap.stats.energy.max *.7) ||
                ((caap.stats.stamina.max || 0) > 0 && caap.stats.stamina.num > caap.stats.stamina.max *.7)) {
                con.log(3, "Delaying general stats review while high sta/ene ", caap.stats.energy.max, caap.stats.energy.num, caap.stats.stamina.max, caap.stats.stamina.num);
            } else {
                for (var i = 0; i < len; i += 1) {
                    // Review in one day if a general/loadout set in the menu or a general that has gone up a level. Otherwise, a week.
                    time = (general.usedGenerals.indexOf(general.records[i].name) >= 0 || !general.isLoadout(general.records[i].name) ? 1 : 7) * 24 * 3600;
                    if (schedule.since(general.records[i].last, time)) {
                        break;
                    }
                }
                if (i < len) {
                    if (caap.stats.lastGeneral == false || caap.stats.lastLoadout == false) {
                        con.log(2, 'Logging current loadout/general before reviewing generals');
                        caap.stats.lastGeneral = general.GetCurrentGeneral();
                        caap.stats.lastLoadout = general.GetCurrentLoadout();
                        con.log(2, 'Logging current loadout/general before reviewing generals', caap.stats.lastLoadout, caap.stats.lastGeneral);
                    }
                    if (session.getItem("page", "") != 'generals') {
                        return caap.navigateTo('generals');
                    }
                    if (general.selectSpecific(general.records[i].name)) {
                        con.log(2, "Loading general #" + (i + 1) + ' of ' + (len + 1), general.records[i].name);
                        return true;
                    }
                    // Go to the keep to force a page refresh to display actual max energy/stamina
                    con.log(2, "Checking keep stats for Loadout #" + (i + 1) + ' of ' +  (len + 1), general.records[i].name);
                    return caap.navigateTo('keep');
                }
            }
            if (caap.stats.lastLoadout !== false && general.selectSpecific(caap.stats.lastLoadout)) {
                con.log(2, 'Resetting last loadout before generals reviewed', caap.stats.lastLoadout);
                return true;
            }
            caap.stats.lastLoadout = false;
            if (caap.stats.lastGeneral !== false && general.selectSpecific(caap.stats.lastGeneral)) {
                con.log(2, 'Resetting last general before generals reviewed', caap.stats.lastGeneral);
                return true;
            }
            caap.stats.lastGeneral = false;

        } catch (err) {
            con.error("ERROR in general.GetAllStats: " + err);
            return false;
        }
    };

    general.menu = function () {
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
                LevelUpGenInstructions14 = "Use the Level Up General for Buy mode.",
                LevelUpGenInstructions15 = "Use the Level Up General for Collect mode.",
                timedLoadoutsList = "List of specific loadouts and time that loadout should loaded, such as '1 PM@Loadout Guild, 7 PM@Loadout Guild, 3@Loadout LoM, 14:30 - 18:30@Use Current",
                timedFreezeInstructions = "If CAAP tries to equip a different general during a timed loadout or Guild Battle, freeze CAAP until time is up.  If not checked, CAAP will continue but without changing the general.",
                i = 0,
                coolDown = '',
                haveZin = general.getRecord("Zin", true) === false ? false : true,
                htmlCode = '';

            htmlCode += caap.startToggle('Generals', 'GENERALS');
            htmlCode += caap.makeCheckTR("Use Zin First", 'useZinFirst', true, 'If Zin is charged then use her first as long as you are 15 or less points from maximum stamina.', false, false, '', '_zin_row', haveZin ? "display: block;" : "display: none;");
            htmlCode += caap.makeCheckTR("Do not reset General", 'ignoreGeneralImage', true, ignoreGeneralImage);
            htmlCode += caap.makeCheckTR("Filter Generals", 'filterGeneral', true, "Filter General lists for most useable in category.");
            htmlCode += caap.makeDropDownTR("Default Loadout", 'DefaultLoadout', ['Use Current'].concat(general.LoadoutsList), '', '', 'Use Current', false, false, 62);
            for (i = 0; i < general.menuList.length; i += 1) {
                htmlCode += caap.makeDropDownTR(general.menuList[i], general.menuList[i] + 'General', ['Use Current'].concat(general.lists[general.menuList[i]]), '', '', 'Use Current', false, false, 62);
                coolDown = general.getCoolDownType(general.menuList[i]);
                htmlCode += coolDown ? caap.makeDropDownTR("Cool", coolDown, general.coolDownList, '', '', '', true, false, 62, '', '_cool_row', general.coolDownList.length > 1 ? "display: block;" : "display: none;") : '';
            }
            htmlCode += caap.startDropHide('LevelUpGeneral', '', 'Use Current', true);
            htmlCode += caap.makeNumberFormTR("Exp To Use Gen", 'LevelUpGeneralExp', LevelUpGenExpInstructions, 20, '', '', true, false);
            htmlCode += caap.makeCheckTR("Gen For Idle", 'IdleLevelUpGeneral', true, LevelUpGenInstructions1, true, false);
            htmlCode += caap.makeCheckTR("Gen For Monsters", 'MonsterLevelUpGeneral', true, LevelUpGenInstructions2, true, false);
            htmlCode += caap.makeCheckTR("Gen For Guild Monsters", 'GuildMonsterLevelUpGeneral', true, LevelUpGenInstructions12, true, false);
            htmlCode += caap.makeCheckTR("Gen For Fortify", 'FortifyLevelUpGeneral', true, LevelUpGenInstructions3, true, false);
            htmlCode += caap.makeCheckTR("Gen For Invades", 'InvadeLevelUpGeneral', true, LevelUpGenInstructions4, true, false);
            htmlCode += caap.makeCheckTR("Gen For Duels", 'DuelLevelUpGeneral', true, LevelUpGenInstructions5, true, false);
            htmlCode += caap.makeCheckTR("Gen For Wars", 'WarLevelUpGeneral', true, LevelUpGenInstructions6, true, false);
            htmlCode += caap.makeCheckTR("Gen For SubQuests", 'SubQuestLevelUpGeneral', true, LevelUpGenInstructions7, true, false);
            htmlCode += caap.makeCheckTR("Gen For Buy", 'BuyLevelUpGeneral', true, LevelUpGenInstructions14, true, false);
            htmlCode += caap.makeCheckTR("Gen For Collect", 'CollectLevelUpGeneral', true, LevelUpGenInstructions15, true, false);
            htmlCode += caap.makeCheckTR("Gen For MainQuests", 'QuestLevelUpGeneral', false, LevelUpGenInstructions8, true, false);
            htmlCode += caap.makeCheckTR("Do not Bank After", 'NoBankAfterLvl', true, LevelUpGenInstructions9, true, false);
            htmlCode += caap.makeCheckTR("Do not Income After", 'NoIncomeAfterLvl', true, LevelUpGenInstructions10, true, false);
            htmlCode += caap.makeCheckTR("Prioritise Monster After", 'PrioritiseMonsterAfterLvl', false, LevelUpGenInstructions11, true, false);
            htmlCode += caap.endDropHide('LevelUpGeneral');
            htmlCode += caap.makeCheckTR("Reverse Under Level Order", 'ReverseLevelUpGenerals', false, reverseGenInstructions);
            htmlCode += caap.makeTD("Use timed Loadouts at these times <a href='http://caaplayer.freeforums.org/viewtopic.php?f=9&t=828' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('timed_loadouts', timedLoadoutsList, '', '');
            htmlCode += caap.makeCheckTR('Enable Equipped scan', 'enableCheckAllGenerals', 1, "Enable the Generals equipped scan.");
            htmlCode += caap.makeCheckTR("Freeze for timed Loadouts or Guild Battles", 'timedFreeze', true, timedFreezeInstructions);
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in general.menu: " + err);
            return '';
        }
    };

    general.dashboard = function () {
        try {
            /*-------------------------------------------------------------------------------------\
                Next we build the HTML to be included into the 'caap_generalsStats' div. We set our
                table and then build the header row.
                \-------------------------------------------------------------------------------------*/
            if (config.getItem('DBDisplay', '') === 'Generals Stats' && session.getItem("GeneralsDashUpdate", true)) {
                var headers = ['General', 'Lvl', 'Atk', 'Def', 'API', 'DPI', 'MPI', 'EAtk', 'EDef', 'EAPI', 'EDPI', 'EMPI', 'Special'],
                    values = ['name', 'lvl', 'atk', 'def', 'api', 'dpi', 'mpi', 'eatk', 'edef', 'eapi', 'edpi', 'empi', 'special'],
                    calc = 0,
                    pp = 0,
                    link = '',
                    instructions = '',
                    it = 0,
                    len = 0,
                    len1 = 0,
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    header = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: '',
                        width: ''
                    },
                    handler = null,
                    head = '',
                    body = '',
                    row = '';

                for (pp = 0, len = headers.length; pp < len; pp += 1) {
                    header = {
                        text: headers[pp],
                        color: '',
                        id: '',
                        title: '',
                        width: '7%'
                    };

                    switch (headers[pp]) {
                        case 'General':
                            header.width = '13%';
                            break;
                        case 'Lvl':
                        case 'Atk':
                        case 'Def':
                        case 'API':
                        case 'DPI':
                        case 'MPI':
                            header.width = '5.5%';
                            break;
                        case 'Special':
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
                            link = "generals.php";
                            instructions = "Clicking this link will change General to " + general.records[it].name;
                            data = {
                                text: '<span id="caap_general_' + it + '" title="' + instructions + '" mname="' + general.records[it].name + '" rlink="' + link + '" itype="' + general.records[it].itype + '" item="' + general.records[it].item +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + general.records[it].name + '</span>',
                                color: 'blue',
                                id: '',
                                title: ''
                            };

                            row += caap.makeTd(data);
                        } else {
                            calc = general.GetStat(general.records[it].name,[values[pp]]) || '';
                            row += caap.makeTd({
                                text: $u.setContent(calc, ''),
                                color: '',
                                title: ''
                            });
                        }
                    }

                    body += caap.makeTr(row);
                }

                $j("#caap_generalsStats", caap.caapTopObject).html(
                $j(caap.makeTable("general", head, body)).dataTable({
                    "bAutoWidth": false,
                    "bFilter": false,
                    "bJQueryUI": false,
                    "bInfo": false,
                    "bLengthChange": false,
                    "bPaginate": false,
                    "bProcessing": false,
                    "bStateSave": true,
                    "bSortClasses": false,
                    "aoColumnDefs": [{
                        "bSortable": false,
                        "aTargets": [12]
                    }]
                }));

                handler = function (e) {
                    var changeLink = {
                        mname: '',
                        rlink: '',
                        itype: '',
                        item: ''
                    },
                    i = 0,
                        len = 0,
                        gen = {},
                        page = session.getItem("page", "");

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
                            caap.ajaxLoad(changeLink.rlink, gen, "#equippedGeneralContainer", "#equippedGeneralContainer", page);
                        }
                    }
                };

                $j("span[id*='caap_general_']", caap.caapTopObject).off('click', handler).click(handler);

                session.setItem("GeneralsDashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in general.dashboard: " + err);
            return false;
        }
    };

}());
