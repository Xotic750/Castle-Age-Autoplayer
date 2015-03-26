/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,
schedule,gifting,state,army,general,session,monster,worker,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          general OBJECT
// this is the main object for dealing with Generals
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

	worker.add({ name: 'general', recordIndex: 'name'});

    general.record = function () {
        this.data = {
            name : '',
            img : '',
            lvl : 0,
            lvlmax : 0,
            pct : 0,
            last : 0,
            special : '',
            atk : 0,
            def : 0,
            api : 0,
            dpi : 0,
            mpi : 0,
            eatk : 0,
            edef : 0,
            eapi : 0,
            edpi : 0,
            empi : 0,
            energy : 0,
            stamina : 0,
            attackItemBonus : 0,
            defenseItemBonus : 0,
            health : 0,
            item : 0,
            itype : 0,
            coolDown : false,
            charge : 0,
            general : 'Use Current',
            value :0,
			loadoutReview : 0,
			powers : ''
        };
    };

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
        'Guild Monster',
        'Invade',
        'Duel',
        'War',
        //'Arena',
        'Buy',
        'Income',
        'Banking',
        'Collect',
        'SubQuest',
        'Classic Class',
        '10v10 Class',
        '100v100 Class',
        'GB Idle',
        'Level Up'];

    general.init = function() {
		try {
			var result = ['gb100', 'gb10', 'gbClassic'].some( function(label) {
				return config.getItem(label + 'whenTokens') != 'Never';
			});
			
			if (!result) {
				return;
			}
			
			var loadoutVals = general.records.flatten('value').filter( function(v) {
				return v;
			});
			
			loadoutVals.forEach( function(v) {
				worker.addPageCheck({page : 'ajax:player_loadouts.php?loadout=' + v, hours : 5});
			});
			
			['SubQuest', 'Monster', 'Buy', 'Idle', 'Collect'].forEach( function(g) {
				config.deleteItem(g + 'LevelUpGeneral');
			});
				
			return true;
		} catch (err) {
			con.error("ERROR in general.init: " + err.stack);
			return false;
		}
	};
	
    general.checkResults = function (page) {
        try {
			// Shrink the general box
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

			// Get Loadouts
            var name = '',
				loadoutsDiv = $j('#hot_swap_loadouts_div select[name="choose_loadout"] option'),
                loadoutsList = loadoutsDiv.map(function() {
                    return this.text;
                }).get();

            // Record current loadouts
            loadoutsList.forEach( function(l, i) {
				name = 'Loadout ' + l;
				if (general.records.length < i + 1) {
					general.records.push(new general.record().data);
				}
				if (name !== general.records[i].name) {
					general.records[i] == new general.record().data;
					con.log(1, "Adding new 'Loadout'", name, general.records);
					general.records[i].name = name;
					general.records[i].value = i + 1;
					general.doSave = true;
				}
			});
			stats.records.total = general.records.length;
			
			// Add code to check for a general level up pop-up here? -- Artifice
			
			//Get current general and loadout
			general.worker('force', generalBox, loadoutsDiv);
			
			// Called after a page load, this records the specific information for each general that cannot be seen if the
			// general isn't equipped, such as item bonuses to general or max sta/energy and the max stamina/energy/health.
            general.quickSwitch = false;
            var loadoutRecord = general.getRecord(general.loadout),
                generalRecord = general.getRecord(general.current),
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
					if (general.loadout == general.records[general.clickedLoadout].name && general.records[general.clickedLoadout].general !== general.current) {
						con.log(2,"Updated general for " + general.records[general.clickedLoadout].name + " is " + general.current, general.records);
						general.records[general.clickedLoadout].general = general.current;
					}
				}
			}
			general.clickedLoadout = false;

            if (general.current === 'Use Current' || !generalRecord) {
                con.warn("Get Equipped Stats: Unable to find 'General' record", general.current);
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
                    if (general.loadout === defaultLoadout || defaultLoadout == 'Use Current') {
                        general.assignStats(generalRecord, eatk, edef);
                    }
                    if (loadoutRecord.general === general.current) {
                        general.assignStats(loadoutRecord, eatk, edef);
                    }

                } else {
                    con.warn("Unable to get 'General' stats");
                }
            } else {
                con.warn("Unable to get equipped 'General' div");
            }

            if ($u.hasContent(general.List) && general.List.length <= 2) {
                schedule.setItem("generals", 0);
                schedule.setItem("allGenerals", 0);
                caap.checkGenerals();
            }
			
			switch (page) {

			// On generals page, this records the basic information of all generals
			case 'generals' :
				var generalsDiv = $j("#app_body div.generalSmallContainer2"),
					update = false;

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

						tempObj = $j("div[style*='graphics/gen_chargebarsmall.gif']", container);
						coolDown = $u.setContent(special.regex(/(\d+) Hour Cooldown:/), false);
						if (coolDown && $u.hasContent(tempObj) || container.text().indexOf('Charged!') !== -1) {
							charge = $u.setContent(tempObj.getPercent("width"), 0);
							charge = Date.now() + (1 - charge / 100) * coolDown * 3600000;
							con.log(3, name + ' charged after ' + $u.makeTime(charge, caap.timeStr(true)));
						} else {
							con.log(4, "Not a cool down general", index);
						}

						tempObj = $j(".general_pic_div3", container);
						if ($u.hasContent(tempObj)) {
							atk = $u.setContent(tempObj.next('div:first').children('div:eq(0)').text(), '0').parseInt();
							def = $u.setContent(tempObj.next('div:first').children('div:eq(1)').text(), '0').parseInt();
						} else {
							con.warn("Unable to find 'attack and defence' containers", index);
						}

						if ($u.hasContent(name) && $u.hasContent(img) && $u.hasContent(level) && $u.hasContent(percent) && !$u.isNaN(atk) && !$u.isNaN(def) && $u.hasContent(special)) {
							generalData = general.getRecord(name);
							if (generalData.newRecord) {
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

							general.setRecord(generalData);
							container = null;
							tempObj = null;
						} else {
							con.warn("Missing required 'General' attribute", index);
						}
					});

					if (general.doSave) {
						statsFunc.setRecord(stats);
						if (update) {
							caap.updateDashboard(true);
							general.UpdateDropDowns();
						}
					}
				}

				generalsDiv = null;
				break;
			case 'player_loadouts' :
				var lNum = $j('#loadout_selection_section select[name="choose_loadout"] option:selected').attr('value');
				
				if (!lNum) {
					return false;
				}
				
				session.setItem('clickUrl', 'player_loadouts.php?loadout=' + lNum);
				chores.checkResults(); // A bit kludgey to call here, but it works
				
				var gO = general.getRecordByField('value', lNum.numberOnly());
				gO.powers = $j.makeArray($j('#loadout_powers').find('img').map(function(e) {
					return $j(this).attr('src').regex(/(\w+\.\w+)$/); 
				})).join(' ') + ' attack swap';
				general.setRecord(gO);
				
				stats.guild.powers = [];
				general.records.flatten('powers').forEach( function(p) {
					p.split(' ').forEach( function(e) {
						stats.guild.powers = stats.guild.powers.addToList(e);
					});
				});
				stats.guild.powers = stats.guild.powers.join(' ');
				con.log(2, 'GB powers available: ' + stats.guild.powers);

				break;
			default :
				break;
			}
        } catch (err) {
            con.error("ERROR in general.checkResults: " + err.stack);
            return false;
        }
    };

	worker.addAction({worker : 'general', priority : 100000, description : 'Checking current general'});
	general.worker = function(newpage, generalBox, loadoutsDiv) {
		try {
			if (!newpage && !general.quickSwitch) {
				return false;
			}
			general.quickSwitch = false;
			generalBox = $u.setContent(generalBox, $j('div[style*="hot_general_container.gif"]'));
			loadoutsDiv = $u.setContent(loadoutsDiv, $j('#hot_swap_loadouts_div select[name="choose_loadout"] option'));
			
			// Get the current general
            var generalName = $j('div:first > div:nth-child(2), #equippedGeneralContainer div.general_name_div3', generalBox).text().trim();

            if (!generalName) {
                con.warn("Couldn't get current 'General'. Using 'Use Current'");
                general.current = 'Use Current';
            } else {
				general.current = generalName;
			}

			// Get the current loadout
            var loadoutName = loadoutsDiv.filter(':selected').text().trim();

            if (!loadoutName) {
				if (stats.level >= 101) {
					con.warn("Couldn't get current 'loadout'. Using 'Use Current'");
				}
                general.loadout = 'Use Current';
            }

            general.loadout = "Loadout " + loadoutName;
			return false;
        } catch (err) {
            con.error("ERROR in general.worker: " + err.stack);
            return false;
        }
    };

    general.filters = {
        Buy : [
            'Darius',
            'Lucius',
            'Garlan',
            'Penelope'],
        Income : [
            'Scarlett',
            'Mercedes',
            'Cid'],
        Banking : [
            'Aeris'],
        Collect : [
            'Angelica',
            'Morrigan',
            'Valiant'],
        SubQuest : [
            'Under Level',
            'Sano',
            'Titania']
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
            if (stats.priorityGeneral != 'Use Current') {
                timeStrings = now.toLocaleTimeString().replace(/:\d+ /,' ') + '@' + stats.priorityGeneral;
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
                    con.log(2, 'Timed general set:', targetGeneral);
                    return targetGeneral;
                }
            }
            return false;
        } catch (err) {
            con.error("ERROR in general.timedLoadout: " + err.stack);
            return false;
        }
    };

	general.resetCharge = function() {
        try {
			var genObj = general.getRecord(general.current);
			if (genObj.coolDown > 0 && schedule.since(genObj.charge, 0)) {
				genObj.charge = Date.now() + genObj.coolDown * 3600000;
				con.log(2, 'Reset general charge for ' + genObj.name + ' to be ready ' + $u.makeTime(genObj.charge, caap.timeStr(true)), genObj);
				general.setRecord(genObj);
			}
        } catch (err) {
            con.error("ERROR in general.resetCharge: " + err.stack);
            return false;
        }
    };
	
    general.getLevelUpNames = function () {
        try {
            var names = [],
				generalName = '';

            general.records.forEach( function(r) {
				generalName = general.getLoadoutGeneral(r.name);
			    if (generalName != 'Use Current' && general.getRecordVal(generalName, 'pct', 0) < 100) {
                    names.push(r.name);
                }
            });

            return names;
        } catch (err) {
            con.error("ERROR in general.getLevelUpNames: " + err.stack);
            return false;
        }
    };

    general.isLoadout = function (name) {
		if (!$u.isString(name) || name.indexOf('Loadout ') < 0) {
			return false;
		}
		return name.replace('Loadout ','');
    }

    general.BuildLists = function () {
        try {
            var it = 0,
                len = 0,
                fullList = [],
                generalList = [],
				CoolDownNames = general.records.filter( function(r) {
					return r.coolDown;
				}).flatten('name').sort(),
				defaultLoadout = config.getItem('Default Loadout', 'Use Current'),
                usedGen = '',
				uGR = {},
				generalNames = [],
                crossList = function (checkItem) {
                    return generalList.hasIndexOf(checkItem) >= 0;
                };

            con.log(2, 'Building Generals Lists');
			
			['energy', 'stamina', 'health'].forEach(function(stat) {
				stats[stat].min = 0;
			});
			
			generalNames = general.records.flatten('name');

			generalNames.forEach( function(n) {
			    if (!general.isLoadout(n)) {
                    general.GeneralsList.addToList(n);
                } else {
                    general.LoadoutsList.addToList(n);
                }
            });
            general.GeneralsList = general.GeneralsList.sort();
            fullList = general.LoadoutsList.concat(general.GeneralsList);
            generalList = ['Under Level'].concat(fullList);

            general.menuList.forEach(function(item) {
                usedGen = config.getItem(item + 'General', 'Use Current');
                if (['Use Current', 'Under Level', ''].indexOf(usedGen) == -1 && general.usedGenerals.indexOf(usedGen) == -1) {
                    general.usedGenerals.addToList(usedGen);
					uGR = general.getRecord(usedGen);
					['energy', 'stamina', 'health'].forEach(function(stat) {
						if (general.isLoadout(usedGen)) {
							stats[stat].min = Math.min(stats[stat].min, $u.setContent(uGR[stat], 0));
						} else if (defaultLoadout == 'Use Current') {
							stats[stat].min = Math.min(stats[stat].min, $u.setContent(uGR[stat], 0));
						} else {
							stats[stat].min = Math.min(stats[stat].min, $u.setContent(uGR[stat] + general.getRecord(defaultLoadout)[stat], 0));
						}
						//con.log(2, 'Min loadout/general en/sta adjustment calc', uGR, stats[stat].min, stats[stat]);
					});
                }
                general.lists[item] = ($u.isArray(general.filters[item]) && config.getItem("filterGeneral", true)) ? general.filters[item].filter(crossList) : generalList;
            });

            general.coolDownList = [''].concat(CoolDownNames);

            con.log(2, 'Built lists', general.LoadoutsList, general.lists, general.usedGenerals);

            return true;
        } catch (err) {
            con.error("ERROR in general.BuildLists: " + err.stack);
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
				if (stats[stat].norm && stats[stat].max) {
					generalRecord[stat] = stats[stat].max - stats[stat].norm;
					//con.log(2, 'Updated ' + stat + ' adjustement for ' + generalRecord.name + ' to ' + generalRecord[stat], generalRecord, stats[stat]);
					if (general.usedGenerals.indexOf(generalRecord.name) > 0) {
						stats[stat].min = Math.min(stats[stat].min, generalRecord[stat]);
					}
				}
			});
            generalRecord.last = Date.now();
            caap.updateDashboard(true);
            general.setRecord(generalRecord);
            //con.log(2, "Got general stats for " + generalRecord.name, generalRecord);
            return true;
        } catch (err) {
            con.error("ERROR in general.assignStats: " + err.stack);
            return false;
        }
    }

    general.UpdateDropDowns = function () {
        try {
            if (!caap.oneMinuteUpdate('generalUpdateDropDowns')) {
                return false;
            }
			
            var len = 0,
                coolDown = '';

            general.BuildLists();
            con.log(3, "Updating 'General' Drop Down Lists");
            caap.changeDropDownList('DefaultLoadout', ['Use Current'].concat(general.LoadoutsList), config.getItem('DefaultLoadout', 'Use Current'));
            general.menuList.forEach( function(g) {
                caap.changeDropDownList(g.replace(/ /g,'_') + 'General', ['Use Current'].concat(general.lists[g]), config.getItem(g + 'General', 'Use Current'));
                coolDown = general.getCoolDownType(g);
                if (coolDown) {
					caap.changeDropDownList(coolDown, general.coolDownList, config.getItem(coolDown, ''));
				}
            });

            if (coolDown && general.coolDownList.length > 1) {
                $j("div[id*='_cool_row']", caap.caapDivObject).css("display", "block");
                if (general.hasRecord("Zin")) {
                    $j("div[id*='_zin_row']", caap.caapDivObject).css("display", "block");
                }
                if (general.hasRecord("Misa")) {
                    $j("div[id*='_misa_row']", caap.caapDivObject).css("display", "block");
                }
            }
            return true;
        } catch (err) {
            con.error("ERROR in general.UpdateDropDowns: " + err.stack, err);
            return false;
        }
    };

    general.LevelUpCheck = function (whichGeneral) {
        try {
            var generalType = '',
                use = false,
                keepGeneral = false;

            generalType = whichGeneral ? whichGeneral.replace(/General/i, '').trim() : '';
            if ((stats.stamina.num > stats.stamina.max || stats.energy.num > stats.energy.max) && state.getItem('KeepLevelUpGeneral', false)) {
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

            if (config.getItem('Level_UpGeneral', 'Use Current') !== 'Use Current' && (general.menuList.hasIndexOf(generalType) || generalType === 'Quest')) {
                if (keepGeneral || (config.getItem(generalType + 'LevelUpGeneral', false) && stats.exp.dif && stats.exp.dif <= config.getItem('LevelUpGeneralExp', 0))) {
                    use = true;
                }
            }

            return use;
        } catch (err) {
            con.error("ERROR in general.LevelUpCheck: " + err.stack);
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
            con.error("ERROR in general.getCoolDownType: " + err.stack);
            return undefined;
        }
    };

	// Provides lookup of a general equipped to a loadout. If general submitted, returns that general. If "Use Current," returns current general
    general.getLoadoutGeneral = function (name) {
		name = general.isLoadout(name) ? general.getRecordVal(name, 'general') : name;
		return name == 'Use Current' ? general.current : name;
    };

	// Provides lookup of a general equipped to a menu general setting. If general submitted, returns that general. If "Use Current," returns current general
    general.getConfigMenuGeneral = function (configLabel) {
		var name = general.getLoadoutGeneral(general.Select(configLabel , 'name only'));
		return general.getLoadoutGeneral(name);
    };

	general.charged = function(name) {
		var go = general.getRecord($u.isString(name) ? name : general.current);
		return  !go.newRecord && go.coolDown ? schedule.since(go.charge, 0) : false;
	};

	// Checks to see if Zin/Misa will be equipped and if fully charged
    general.ZinMisaCheck = function (configLabel) {
		var name = general.getConfigMenuGeneral(configLabel);
		return ['Zin','Misa'].hasIndexOf(name) && general.charged(name);
    };
	
    // Convert from a role like "IdleGeneral" to a specific general required, and then calls a function to select that general
	// If returnNametf is true, it returns the name of the general it would select, but doesn't actually change
    general.Select = function (whichGeneral, returnNametf) {
        try {
            var targetGeneral = '',
                levelUp = general.LevelUpCheck(whichGeneral),
				useStaminaAction = !['arena.doArenaBattle', 'caap.conquestBattle'].hasIndexOf(session.getItem('ThisAction', 'none'))
					&& !caap.inLevelUpMode() && ['InvadeGeneral', 'DuelGeneral'].hasIndexOf(whichGeneral)
					&& config.getItem("useZinMisaFirst", false),
                useZin =  useStaminaAction && general.charged("Zin") && stats.stamina.num <= (stats.stamina.max - 15),
                useMisa =  useStaminaAction && general.charged("Misa") && stats.energy.num <= (stats.energy.max - 30),
                coolType = general.getCoolDownType(whichGeneral),
                coolName = useZin ? 'Zin' : useMisa ? 'Misa' : coolType ? config.getItem(coolType, '') : '';

            if (general.records.length <= (stats.level >= 100 ? 20 : 1)) {
                con.log(1, "Generals count of " + general.records.length + " <= " + (stats.level >= 100 ? 20 : 2) + ', checking Generals page');
                return caap.navigateTo('generals');
            }
			
			if (whichGeneral.match(/Set\d+/)) {
				if (caap.oneMinuteUpdate('loadoutsReset')) {
					con.warn('Loadouts may have been reset. Freezing until reset ' + whichGeneral);
				}
				return returnNametf ? 'Use Current' : true;
			}
			

            con.log(3, 'Cool', coolType, coolName);
            if (levelUp) {
                whichGeneral = 'Level_UpGeneral';
                con.log(2, 'Using level up general');
            }

            //Check what target general should be
            targetGeneral = general.charged(coolName) && session.getItem('ThisAction', 'none') != 'feed.worker' ? coolName : whichGeneral.indexOf('General') > 0 ? config.getItem(whichGeneral, whichGeneral) : whichGeneral;
            //con.log(2, 'Select General ', whichGeneral, targetGeneral, coolName, config.getItem(whichGeneral, whichGeneral));

            if (targetGeneral == 'Use Current') {
                return returnNametf ? 'Use Current' : false;
            }
			
            if (!levelUp && /under level/i.test(targetGeneral)) {
                if (!general.getLevelUpNames().length) {
                    return returnNametf ? 'Use Current' : false;
                }
				

                targetGeneral = config.getItem('ReverseLevelUpGenerals') ? general.getLevelUpNames().reverse().pop() : general.getLevelUpNames().pop();
				con.log(2, "Level up general", targetGeneral, general.getLevelUpNames());
            }

            if (general.getRecord(targetGeneral).newRecord) {
				if (caap.oneMinuteUpdate('loadoutsReset')) {
					con.warn('Unable to find ' + targetGeneral + ' record for ' + whichGeneral 
						+ '. Loadouts may have been reset. Freezing until reset');
				}
				return returnNametf ? 'Use Current' : true;
					
            }
			
            return general.selectSpecific(targetGeneral, returnNametf);
        } catch (err) {
            con.error("ERROR in general.Select: " + err.stack);
            return false;
        }
    };
	
	// If not ok to switch general due to stat loss, returns true
	general.changeStatCheck = function(g) { //target general, current general
		return ['stamina', 'energy'].reduce( function(p, s) {
			var nextGenS = general.getRecordVal(g, s),
				curGenS = general.getRecordVal(general.current, s);
			if (nextGenS < curGenS && stats[s].num > stats[s].norm + nextGenS) {
				con.warn('Overrode general change to ' + g + ' because ' + stats[s].num + ' ' + s + ' greater than max ' + stats[s].norm + ' plus general mod of  ' + nextGenS);
				return true;
			}
			return p;
		}, false);
	};
		
	// Log player set general, to return to that general after doing work in passive general
	general.logGeneral = function(isLoadout) { //general or Loadout
		if (config.getItem('IdleGeneral', 'Use Current') != 'Use Current') {
			if (isLoadout && state.getItem('lastLoadout', 'Use Current') == 'Use Current') {
				state.setItem('lastLoadout', general.current);
			}
			if (state.getItem('lastGeneral', 'Use Current') == 'Use Current') {
				state.setItem('lastGeneral', general.loadout);
			}
		}
	};
		
    // Load a specific general or loadout by name.  'Use Current' is used for no preference.
	// If returnNametf is true, then returns the name of general to be equipped instead of doing so
    general.selectSpecific = function(targetGeneral, returnNametf) {
        try {
            var	targetLoadout = '',
                generalImage = '',
                timedGeneral = general.timedLoadout(),
				resultTrue = returnNametf ? targetGeneral : true,
				resultFalse = returnNametf ? targetGeneral : false,
				freezeTf = resultFalse,
                lRecord = {},
				cgR = {}, // current general record
                defaultLoadout = config.getItem("DefaultLoadout", 'Use Current');
			
			targetGeneral = $u.setContent(targetGeneral, 'Use Current');
			if (!general.hasRecord(general.current) && !returnNametf) {
				con.warn('Current general unknown. Going to generals page to get general records.');
				if (caap.navigateTo('generals')) {
					return true;
				}
				return caap.navigateTo('keep');
			}

            if (timedGeneral && timedGeneral != targetGeneral && (targetGeneral != 'Use Current' || general.current != timedGeneral)) {
				freezeTf = config.getItem('timedFreeze', true);
                con.log(2,'General change to ' + targetGeneral + (freezeTf ? '. Script paused' : ' ignored') + ' while equipping timed general ' + timedGeneral);
                targetGeneral = timedGeneral;
				resultTrue = returnNametf ? targetGeneral : true;
				resultFalse = returnNametf ? targetGeneral : freezeTf;
            }

			if (defaultLoadout != 'Use Current' && !general.hasRecord(defaultLoadout)) {
				// Unable to equip, but remember setting in case it was a loadouts reset
				defaultLoadout = 'Use Current';
            }

            if (targetGeneral == 'Use Current') {
                return resultFalse;
            }

            // Confirm loadout is ok
			if (stats.level > 100) {
				targetLoadout = general.isLoadout(targetGeneral) ? targetGeneral : defaultLoadout;
				targetLoadout = (targetLoadout === "Use Current") ? general.loadout : targetLoadout;
				lRecord = general.getRecord(targetLoadout);
				if (lRecord.newRecord) {
					con.warn('Unable to find ' + targetLoadout + ' record. Loadouts reset? Ignoring setting.');
					return resultFalse;
				} else {
					targetGeneral = general.isLoadout(targetGeneral) ? lRecord.general : targetGeneral;
					if (general.changeStatCheck(targetLoadout)) {
						con.log(1, 'Overriding loadout change to ' + targetLoadout + ' since it would cause stat loss');
					} else if (general.clickedLoadout !== false) {
						general.records[general.clickedLoadout].general = general.current;
						general.clickedLoadout = false;
					} else if (targetLoadout !== general.loadout || (targetLoadout == general.loadout && lRecord.general == targetGeneral
						&& general.current !== targetGeneral && targetGeneral !== 'Use Current')) {
						if (returnNametf) {
							return targetLoadout;
						}
						con.log(2,'Loading ' + targetLoadout + ' loadout #' + lRecord.value, lRecord);
						
						general.logGeneral(true);
						general.quickSwitch = true;
						general.clickedLoadout = lRecord.value - 1;
						caap.click($j('div[id*="hot_swap_loadouts_content_div"] > div:nth-child(' + lRecord.value + ') > div:first'));
						return resultTrue;
					}
				}
			}
			
            // Confirm if necessary to load a different general
            if (targetGeneral === general.current || targetGeneral === 'Use Current') {
                return resultFalse;
            }

			if (general.changeStatCheck(targetGeneral)) {
				con.log(1, 'Overriding general change to ' + targetGeneral + ' since it would cause stat loss');
				return returnNametf ? general.current : freezeTf;
			}
			if (returnNametf) {
				return targetGeneral;
			}
			
            con.log(2, 'Changing from ' + general.current + ' to ' + targetGeneral);
            if (caap.navigateTo('generals')) {
                return resultTrue;
            }

            generalImage = general.getRecordVal(targetGeneral, 'img');
            if (generalImage && caap.hasImage(generalImage, $j('#generalContainerBox2'))) {
                general.clickedLoadout = false;
				general.logGeneral();
				caap.click(caap.checkForImage(generalImage, $j('#generalContainerBox2')));
                return resultTrue;
            }

            con.warn('Could not find', targetGeneral, generalImage);

            return resultFalse;
        } catch (err) {
            con.error("ERROR in general.selectSpecific: " + err.stack);
            return false;
        }
    };

    general.menu = function () {
        try {
			general.BuildLists();
            // Add General Comboboxes
            var reverseGenInstructions = "This will make the script level Generals under max level from Top-down instead of Bottom-up",
				saveLoadouts = "This will prevent the script from changing your loadouts to 'Use Current' if the loadouts " +
                    "have been reset. Until loadouts are found again, the script will use the current loadout",
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
                htmlCode = '',
				gen = '';

            htmlCode += caap.startToggle('Generals', 'GENERALS');
            htmlCode += caap.makeCheckTR("Filter Generals", 'filterGeneral', true, "Filter General lists for most useable in category.");
            htmlCode += caap.makeDropDownTR("Default Loadout", 'DefaultLoadout', ['Use Current'].concat(general.LoadoutsList), '', '', 'Use Current', false, false, 62);
            general.menuList.forEach( function(g) {
				gen = g.replace(/ /g,'_') + 'General';
                htmlCode += caap.makeDropDownTR(g, gen, ['Use Current'].concat(general.lists[g]), '', '', config.getItem(gen, 'Use Current'), false, false, 62);
                coolDown = general.getCoolDownType(g);
                htmlCode += coolDown ? caap.makeDropDownTR("Cool", coolDown, general.coolDownList, '', '', '', true, false, 62, '', '_cool_row', general.coolDownList.length > 1 ? "display: block;" : "display: none;") : '';
            });
            htmlCode += caap.display.start('Level_UpGeneral', 'isnot', 'Use Current');
            htmlCode += caap.makeNumberFormTR("Exp To Use Gen", 'LevelUpGeneralExp', LevelUpGenExpInstructions, 55, '', '', true, false);
            htmlCode += caap.makeCheckTR("Gen For Guild Monsters", 'GuildMonsterLevelUpGeneral', true, LevelUpGenInstructions12, true, false);
            htmlCode += caap.makeCheckTR("Gen For Fortify", 'FortifyLevelUpGeneral', true, LevelUpGenInstructions3, true, false);
            htmlCode += caap.makeCheckTR("Gen For Invades", 'InvadeLevelUpGeneral', true, LevelUpGenInstructions4, true, false);
            htmlCode += caap.makeCheckTR("Gen For Duels", 'DuelLevelUpGeneral', true, LevelUpGenInstructions5, true, false);
            htmlCode += caap.makeCheckTR("Gen For Wars", 'WarLevelUpGeneral', true, LevelUpGenInstructions6, true, false);
            htmlCode += caap.makeCheckTR("Do not Bank After", 'NoBankAfterLvl', true, LevelUpGenInstructions9, true, false);
            htmlCode += caap.makeCheckTR("Do not Income After", 'NoIncomeAfterLvl', true, LevelUpGenInstructions10, true, false);
            htmlCode += caap.makeCheckTR("Prioritise Monster After", 'PrioritiseMonsterAfterLvl', false, LevelUpGenInstructions11, true, false);
            htmlCode += caap.display.end('Level_UpGeneral', 'isnot', 'Use Current');
            htmlCode += caap.makeCheckTR("Reverse Under Level Order", 'ReverseLevelUpGenerals', false, reverseGenInstructions);
            htmlCode += caap.makeTD("Use timed Loadouts at these times <a href='http://caaplayer.freeforums.org/viewtopic.php?f=9&t=828' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('timed_loadouts', timedLoadoutsList, '', '');
            htmlCode += caap.makeCheckTR("Freeze for timed Loadouts or Guild Battles", 'timedFreeze', true, timedFreezeInstructions);
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in general.menu: " + err.stack);
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
                            calc = general.getRecordVal(general.records[it].name,[values[pp]]) || '';
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
                            changeLink.mname = e.target.attributes[i].value;
                        } else if (e.target.attributes[i].nodeName === 'rlink') {
                            changeLink.rlink = e.target.attributes[i].value;
                        } else if (e.target.attributes[i].nodeName === 'itype') {
                            gen.itype = changeLink.itype = e.target.attributes[i].value.parseInt();
                        } else if (e.target.attributes[i].nodeName === 'item') {
                            gen.item = changeLink.item = e.target.attributes[i].value.parseInt();
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
            con.error("ERROR in general.dashboard: " + err.stack);
            return false;
        }
    };

}());
