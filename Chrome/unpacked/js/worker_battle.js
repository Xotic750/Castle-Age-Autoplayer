/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
festival,feed,battle,town,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          battle OBJECT
// this is the main object for dealing with battles
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add({name: 'battle', recordIndex: 'userId'});

    battle.record = function(userId) {
        this.data = {
            userId: userId,
            name: '',
			minDef : 0,
			maxDef : 1000000,
            rank: 0,
            warRank: 0,
            conqRank: 0,
			conqPoints : 0,
			gbPoints : 0,
            level: 0,
            army: 0,
            deity: 0,
            deityStr: '',
            invadeWon: 0,
            invadeLost: 0,
            invadePoints: 0,
            duelWon: 0,
            duelLost: 0,
            duelPoints: 0,
            warWon: 0,
            warLost: 0,
            warPoints: 0,
            chainCount: 0,
            wonTime: 0,
            lostTime: 0,
            deadTime: 0,
            chainRestTime: 0,
            newRecord: true,
/*            arenaRank: 0,
			arenaLost : 0,
			arenaWon : 0,
			arenaRevenge: false,
			arenaDeadTime: 0,
			arenaPoints: 0,
			arenaTotal: 0,
			arenaInvalid: false
*/        };
    };
	
	battle.types = ['duel', 'invade', 'war', 'conq', 'gb'];

	worker.addAction({worker : 'battle', priority : 700, description : 'Battling Players'});
	
	battle.init = function() {
		battle.page = stats.level < 10 ? 'battle_train;battle_off' : 'battle';
	};
	
    battle.worker = function() {
        try {
            var whenBattle = config.getItem('WhenBattle', 'Never'),
                target = '',
                battletype = config.getItem('BattleType', 'Invade'),
                staminaReq = 0,
                button = $j(),
                raidName = '',
                battleChainId = 0,
                targetMonster = state.getItem('targetFrombattle_monster', ''),
                whenMonster = config.getItem('WhenMonster', 'Never'),
                targetType = config.getItem('TargetType', 'Invade'),
                rejoinSecs = '',
                bR = {}, // Battle Record
                tempTime = 0,
                monsterObject = $u.hasContent(targetMonster) ? monster.getRecord(targetMonster) : {},
                noSafeCountSet = 0,
				battleOrOverride = 'Battle';

            if (stats.level < 8) {
                if (battle.battleWarnLevel) {
                    con.log(1, "Battle: Unlock at level 8");
                    battle.battleWarnLevel = false;
                }
                return false;
            }

			switch (whenBattle) {
			case 'Never':
				caap.setDivContent('battle_mess', 'Battle: off');
				return false;
			case 'Recon Only':
				caap.setDivContent('battle_mess', 'Battle: Battle Recon Only');
				return false;
			case 'Stay Hidden':
				if (!caap.needToHide() && config.getItem('delayStayHidden', true) === true) {
					caap.setDivContent('battle_mess', 'Battle: We Dont Need To Hide Yet');
					con.log(1, 'We Dont Need To Hide Yet');
					return false;
				}

				break;
			case 'No Monster':
				if (whenMonster !== 'Never' && monsterObject && !/the deathrune siege/i.test(monsterObject.name)) {
					return false;
				}
				break;
			case 'Only Demipoints or Zin/Misa':
				if (!battle.demisPointsToDo('left') && !general.ZinMisaCheck(battletype + 'General')) {
					caap.setDivContent('battle_mess', 'Battle: Demipoints and Zin/Misa done');
					return false;
				}
				break;
			default:
			}

			if (battle.demisPointsToDo('left')) {
				if (battletype == 'War') {
					if (caap.oneMinuteUpdate('battleWarDemipoints')) {
						con.warn('Unable to get demi points because battle type is set to "War"');
					}
				} else {
					battleOrOverride = 'battleOverride';
					caap.setDivContent('battle_mess', 'Battle: Doing Demi Points');
				}
			} else if (general.ZinMisaCheck(battletype + 'General')) {
				caap.setDivContent('battle_mess', 'Battle: Doing Zin or Misa');
				battleOrOverride = 'battleOverride';
			}

            /*
            if (stats.health.num < 10) {
                con.log(5, 'Health is less than 10: ', stats.health.num);
                return false;
            }

            if (config.getItem("waitSafeHealth", false) && stats.health.num < 13) {
                con.log(5, 'Unsafe. Health is less than 13: ', stats.health.num);
                return false;
            }
            */

            target = battle.getTarget();
            con.log(5, 'Target', target);
            if (!target) {
                con.log(1, 'No valid battle target');
                return false;
            }

			target = $u.isString(target) ? target.toLowerCase() : target;

            if (target === 'noraid') {
                con.log(5, 'No Raid To Attack');
                return false;
            }

            staminaReq = battletype == 'War' ? 10 : target === 'raid' ? state.getItem('RaidStaminaReq', 1) : 1;

            if (!caap.checkStamina(battleOrOverride, staminaReq)) {
                con.log(3, 'Not enough stamina for ', battletype, staminaReq);
                return false;
            }

            // Check if we should chain attack
            if ($u.hasContent($j("#app_body #results_main_wrapper img[src*='battle_victory.gif']"))) {
                button = caap.checkForImage(battletype == 'Invade' ? 'battle_invade_again.gif' : 'battle_duel_again.gif');
                battleChainId = state.getItem("BattleChainId", 0);
                if ($u.hasContent(button) && battleChainId) {
                    caap.setDivContent('battle_mess', 'Chain Attack In Progress');
                    con.log(2, 'Chaining Target', battleChainId);
                    battle.click(button);
                    state.setItem("BattleChainId", 0);
                    button = null;
                    return true;
                }

                state.setItem("BattleChainId", 0);
            }

            if (!state.getItem("notSafeCount", 0)) {
                state.setItem("notSafeCount", 0);
            }

            //con.log(2, 'Battle Target', target);
            switch (target) {
            case 'raid':
                if (!schedule.check("NoTargetDelay")) {
                    rejoinSecs = ((schedule.getItem("NoTargetDelay").next - Date.now()) / 1000).dp() + ' secs';
                    //con.log(4, 'Rejoining the raid in', rejoinSecs);
                    caap.setDivContent('battle_mess', 'Joining the Raid in ' + rejoinSecs);
                    button = null;
                    return false;
                }

                if (general.Select(battletype + 'General')) {
                    button = null;
                    return true;
                }

                caap.setDivContent('battle_mess', 'Joining the Raid');
                // This is a temporary fix for the web3 url until CA fix their HTML (not so temporary :P)
                if (caap.domain.which === 2 && !$u.hasContent($j("#app_body img[src*='tab_raid_']"))) {
                    if (caap.navigateTo(battle.page, 'battle_tab_battle_on.jpg')) {
                        button = null;
                        return true;
                    }

                    caap.clickAjaxLinkSend("raid.php");
                    button = null;
                    return true;
                }

                if (caap.navigateTo(battle.page + ',raid', 'battle_tab_raid_on.jpg')) {
                    button = null;
                    return true;
                }

                if (config.getItem('clearCompleteRaids', false) && $u.hasContent(monster.completeButton.raid.button) && $u.hasContent(monster.completeButton.raid.md5)) {
                    caap.click(monster.completeButton.raid.button);
                    monster.deleteItem(monster.completeButton.raid.md5);
                    monster.completeButton.raid = {
                        md5: undefined,
                        name: undefined,
                        button: undefined
                    };

                    caap.updateDashboard(true);
                    con.log(1, 'Cleared a completed raid');
                    button = null;
                    return true;
                }

                raidName = state.getItem('targetFromraid', '');
                if ($u.hasContent(raidName)) {
                    monsterObject = monster.getRecord(raidName);
                }

                if (!$u.hasContent($j("#app_body div[style*='dragon_title_owner']"))) {
                    button = monster.engageButtons[monsterObject.md5];
                    if ($u.hasContent(button)) {
                        caap.click(button);
                        button = null;
                        return true;
                    }

                    con.warn('Unable to engage raid', monsterObject.name);
                    button = null;
                    return false;
                }

                if (monster.confirmRightPage(monsterObject.name)) {
                    button = null;
                    return true;
                }

                // The user can specify 'raid' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                if (targetType === "Userid List") {
                    if (battle.freshmeat('Raid')) {
                        if ($u.hasContent($j("#app_body span[class*='result_body']"))) {
                            battle.nextTarget();
                        }

                        noSafeCountSet = config.getItem("notSafeCount", 20);
                        noSafeCountSet = noSafeCountSet < 1 ? 1 : noSafeCountSet;
                        noSafeCountSet = Math.round(noSafeCountSet / 4);
                        if (state.getItem("notSafeCount", 0) > noSafeCountSet) {
                            state.setItem("notSafeCount", 0);
                            battle.nextTarget();
                        }

                        button = null;
                        return true;
                    }

                    con.warn('Doing Raid UserID list, but no target');
                    button = null;
                    return false;
                }

                button = null;
                return battle.freshmeat('Raid');
            case 'freshmeat':
                if (!schedule.check("NoTargetDelay")) {
                    rejoinSecs = ((schedule.getItem("NoTargetDelay").next - Date.now()) / 1000).dp() + ' secs';
                    //con.log(2, 'Rejoining battles in', rejoinSecs);
                    caap.setDivContent('battle_mess', 'Joining battles in ' + rejoinSecs);
                    button = null;
                    return false;
                }

                if (general.Select(battletype + 'General')) {
                    button = null;
                    return true;
                }

                if (caap.navigateTo(battle.page, 'battle_tab_battle_on.jpg')) {
                    button = null;
                    return true;
                }

                caap.setDivContent('battle_mess', 'Battling ' + target);
                // The user can specify 'freshmeat' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
                if (targetType === "Userid List") {
                    if (battle.freshmeat('Freshmeat')) {
                        if ($u.hasContent($j("#app_body span[class*='result_body']"))) {
                            battle.nextTarget();
                        }

                        noSafeCountSet = config.getItem("notSafeCount", 20);
                        noSafeCountSet = noSafeCountSet < 1 ? 1 : noSafeCountSet;
                        noSafeCountSet = Math.round(noSafeCountSet / 4);
                        if (state.getItem("notSafeCount", 0) > noSafeCountSet) {
                            state.setItem("notSafeCount", 0);
                            battle.nextTarget();
                        }

                        button = null;
                        return true;
                    }

                    con.warn('Doing Freshmeat UserID list, but no target');
                    button = null;
                    return false;
                }

                button = null;
                return battle.freshmeat('Freshmeat');

			default:
                if (!config.getItem("IgnoreBattleLoss", false)) {
                    bR = battle.getRecord(target);
                    tempTime = bR[battletype + 'LostTime'] || tempTime;

                    if (bR && bR.name !== '' && !schedule.since(tempTime, 604800)) {
                        con.log(1, 'Avoiding Losing Target', target);
                        battle.nextTarget();
                        return true;
                    }
                }

                if (caap.navigate2('@' + battletype + 'General,battle')) {
                    return true;
                }

                //state.setItem('BattleChainId', 0);
                if (battle.battleUserId(target)) {
                    battle.nextTarget();
                    return true;
                }

                con.warn('Doing default UserID list, but no target');
                return false;
            }
        } catch (err) {
            con.error("ERROR in battle: " + err);
            return false;
        }
    };
	
    battle.checkResults = function(page, resultsText) {
        try {
			switch (page) {
			case 'battle' :
				var bR = {}, // Battle Record
					tempTime = 0,
					chainBP = 0,
					chainGold = 0,
					maxChains = 0,
					result = {},
					symDiv = $j(),
					points = [],
					success = true,
					tempDiv = $j(),
					tempText = '',
					tNum = 0,
					warWinLoseImg = '',
					currentGeneral = general.getCurrentGeneral(),
					result = {};

				// Check demi points
				
				symDiv = $j("#app_body img[src*='symbol_tiny_']").not("#app_body img[src*='rewards.jpg']");
				if ($u.hasContent(symDiv) && symDiv.length === 5) {
					symDiv.each(function () {
						var txt = '';

						txt = $j(this).parent().parent().next().text();
						txt = txt ? txt.replace(/\s/g, '') : '';
						if (txt) {
							points.push(txt);
						} else {
							success = false;
							con.warn('Demi temp text problem', txt);
						}
					});

					if (success) {
						caap.demi.ambrosia.daily = caap.getStatusNumbers(points[0]);
						caap.demi.malekus.daily = caap.getStatusNumbers(points[1]);
						caap.demi.corvintheus.daily = caap.getStatusNumbers(points[2]);
						caap.demi.aurora.daily = caap.getStatusNumbers(points[3]);
						caap.demi.azeron.daily = caap.getStatusNumbers(points[4]);
						schedule.setItem("battle", (gm ? gm.getItem('CheckDemi', 6, hiddenVar) : 6) * 3600, 300);
						caap.SaveDemi();
					}
				} else {
					con.warn('Demi symDiv problem');
				}

				if (recon.inProgress) {
					battle.freshmeat("recon");
				}

				if (!battle.flagResult) {  // Should move this reading the userID from the page, to account for manual actions - Artifice
					return true;
				}

				battle.flagResult = false;
				state.setItem("BattleChainId", 0);
				result = battle.readWinLoss(resultsText, battle.testList);

				if (!result) {
					return true;
				}

				bR = battle.getRecord(result.userId);
				if (result.wl == 'won') {
					//Test if we should chain this guy
					tempTime = $u.setContent(bR.chainRestTime, 0);
					chainBP = config.getItem('ChainBP', '');
					chainGold = config.getItem('ChainGold', '');
					con.log(1, "We Defeated ", result.name, ((result.type === "War") ? "War Points: " : "Battle Points: ") + result.points + ", Gold: " + result.gold, bR);
					if (schedule.since(tempTime, 86400) && ((chainBP !== '' && !$u.isNaN(chainBP) && chainBP >= 0) || (chainGold !== '' && !$u.isNaN(chainGold) && chainGold >= 0))) {
						if (chainBP !== '' && !$u.isNaN(chainBP) && chainBP >= 0) {
							if (result.points >= chainBP) {
								state.setItem("BattleChainId", result.userId);
								con.log(1, "Chain Attack:", result.userId, ((result.type === "War") ? "War Points: " : "Battle Points: ") + result.points);
							} else {
								bR.chainRestTime = Date.now();
							}
						}

						if (chainGold !== '' && !$u.isNaN(chainGold) && chainGold >= 0) {
							if (result.gold >= chainGold) {
								state.setItem("BattleChainId", result.userId);
								con.log(1, "Chain Attack:", result.userId, "Gold: " + result.gold);
							} else {
								bR.chainRestTime = Date.now();
							}
						}
					}

					bR.chainCount = bR.chainCount ? bR.chainCount += 1 : 1;
					maxChains = config.getItem('MaxChains', 4);
					if (maxChains === '' || $u.isNaN(maxChains) || maxChains < 0) {
						maxChains = 4;
					}

					if (bR.chainCount >= maxChains) {
						con.log(1, "Lets give this guy a break. Chained", bR.chainCount);
						bR.chainRestTime = Date.now();
						bR.chainCount = 0;
					}

				} else if (result.wl == 'lost') {
					bR.chainCount = 0;
					bR.chainRestTime = 0;
					con.log(1, "We Were Defeated By " + result.name, bR);
				}

				battle.setRecord(bR);
				result = null;
			default:
				break;
			}
        } catch (err) {
            con.error("ERROR in battle.checkResults: " + err.stack);
            return false;
        }
    };
	
	battle.testList = [
		{ method : 'invade',
			type : 'battle',
			check : /Your Army of (\d+) fought with.* x\d+(.+)'s Army of (\d+) fought with.* You have (lost|won) (\d+) Battle Points.*\$([,\d]+)?/i,
			vars : ['myArmy', 'name', 'theirArmy', 'wl', 'points', 'gold'],
			func : function(r) {
				r.att = stats.bonus.api * r.myArmy / r.theirArmy;
				r.gold = r.gold ? r.gold.numberOnly() : 0;
			}
		},
		{ method : 'duel',
			type : 'battle',
			check : /.*\d+(.*) fought with.*You have (won|lost) (\d+) Battle Points.*\$([,\d]+)?/i,
			vars : ['name', 'wl', 'points', 'gold'],
			func : function(r) {
				r.att = stats.bonus.api;
				r.gold = r.gold ? r.gold.numberOnly() : 0;
			}
		},
		{ method : 'war',
			type : 'battle',
			check : /Gain (\+\d+ Experience)?.* (.* War Points)?.*total points\)(.*)?'s Defense/i,
			vars : ['wl', 'points', 'name'],
			func : function(r) {
				r.wl = r.wl.hasIndexOf('Experience') ? 'won' : 'lost';
				r.gold = caap.resultsText.regex(/\$([,\d]+)/).numberOnly();
			}
		}
	];

	// Check win/loss of battle
    battle.readWinLoss = function(resultsText, testList) {
        try {
            var userId = 0,
				lastBattleID = state.getItem("lastBattleID", ''),
				resultsDiv = lastBattleID ? $j() : $j("#app_body #results_main_wrapper"),
				str = '',
                bR = {}, // Battle Record
                r = {};
				
			
			state.deleteItem('lastBattleID');
			
			if (!$u.hasContent(resultsText)) {
				return false;
			}
			
			userId = $u.setContent(lastBattleID, $u.setContent($u.setContent($j(resultsDiv).find("input[name='target_id']").first().attr('value'), $u.setContent($u.setContent($j(resultsDiv).find("a[href*='keep.php?casuser=']").first().attr('href'), '').regex(/user=(\d+)/i), false))));
			
			if (!userId) {
				return false;
			}
			
			bR = battle.getRecord(userId);
			
			testList.some( function(o) {
				if (caap.bulkRegex(resultsText, o.check, r, o.vars)) {
					r.method = o.method;
					r.type = o.type;
					o.func(r);
					return true;
				}
			});
			
			if (!r.wl) {
				con.log(1, 'Unable to parse win/loss from ' + session.getItem('page', 'unknown') + ', setting wait time for FB ID ' + tNum, resultsText, testList);
				bR.deadTime =  Date.now();
				bR.chainCount = 0;
				bR.chainRestTime = 0;
				battle.setRecord(bR);
				return false;
			}
			
			bR.name = r.name;
			r.userId = userId;
			bR[r.wl + 'Time'] = Date.now();
			bR[r.method + r.wl.ucWords()] += 1;
			bR[r.type + 'Points'] += (r.wl == 'won' ? 1 : -1) * $u.setContent(r.points, 0);
			if ($u.hasContent(r.att)) {
				str = (r.wl == 'won' ? 'max' : 'min') + 'Def';
				bR[str] = Math[r.wl == 'won' ? 'min' : 'max'](r.att, bR[str]).dp(0);
			}
			if (bR.minDef > bR.maxDef) {
				if (str == 'maxDef') {
					bR.minDef = 0;
				} else { 
					bR.maxDef = 1000000;
				}
			}
			
			general.resetCharge();
			
            if (r.wl == 'won') {
				session.setItem('ReleaseControl', false);
			}

            battle.setRecord(bR);
            return r;
        } catch (err) {
            con.error("ERROR in battle.readWinLoss: " + err.stack);
            return false;
        }
    };
	
    battle.winChance = function(bR, att, defBonus) {
		var defMod = $u.setContent(defBonus, 0) + 1,
			lowEst = bR.minDef * 0.95 * defMod,
			highEst = Math.min(Math.max($u.setContent(bR.level, 0) * 10, lowEst * 1.5), bR.maxDef *1.05) * defMod;
			// Math.max lowEst * 1.5 in highEst is used to prevent model breakage when opponents BSI > 10 causes you to think you have a 100% chance to beat someone even though you've never won at an effective Att of 10 * his level.
		if (att > highEst) {
			return 100;
		} else if (att < lowEst) {
			return 0;
		}
		return ((att - lowEst) / (highEst - lowEst) * 100).dp(0);
    };

    battle.battleUserId = function(userid) {
        try {
            var battleButton = $j(),
                form = $j(),
                inp = $j();

            battleButton = caap.checkForImage(battle.battles.Freshmeat[config.getItem('BattleType', 'Invade')]);
            if ($u.hasContent(battleButton)) {
                form = battleButton.parent().parent();
                if ($u.hasContent(form)) {
                    inp = $j("input[name='target_id']", form);
                    if ($u.hasContent(inp)) {
                        inp.attr("value", userid);
                        state.setItem("lastBattleID", userid);
                        battle.click(battleButton);
                        state.setItem("notSafeCount", 0);
                        battleButton = null;
                        form = null;
                        inp = null;
                        return true;
                    }

                    con.warn("target_id not found in battleForm");
                } else {
                    con.warn("form not found in battleButton");
                }
            } else {
                con.warn("battleButton not found");
            }

            battleButton = null;
            form = null;
            inp = null;
            return false;
        } catch (err) {
            con.error("ERROR in battleUserId: " + err);
            return false;
        }
    };

    battle.battleWarnLevel = true;

    battle.ranks = {
		rank: ['Acolyte', 'Scout', 'Soldier', 'Elite Soldier', 'Squire', 'Knight', 'First Knight', 'Legionnaire', 'Centurion', 'Champion', 'Lieutenant Commander', 'Commander', 'High Commander', 'Lieutenant General', 'General', 'High General', 'Baron', 'Earl', 'Duke', 'Prince', 'King', 'High King'],
		warRank: ['No Rank', 'Reserve', 'Footman', 'Corporal', 'Lieutenant', 'Captain', 'First Captain', 'Blackguard', 'Warguard', 'Master Warguard', 'Lieutenant Colonel', 'Colonel', 'First Colonel', 'Lieutenant Warchief', 'Warchief', 'High Warchief'],
		conqRank: ['Scout', 'Soldier', 'Elite Soldier', 'Squire', 'Knight', 'First Knight', 'Legionnaire', 'Centurion', 'Champion', 'Lt Commander', 'Commander', 'High Commander', 'Lieutenant General', 'General', 'High General', 'Baron', 'Earl', 'Duke']
	};

    battle.clear = function() {
        try {
            battle.records = [];
            battle.doSave = true;
            session.setItem("BattleDashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in battle.clear: " + err.stack);
            return false;
        }
    };

    battle.flagResult = false;
	
    battle.nextTarget = function() {
        state.setItem('BattleTargetUpto', state.getItem('BattleTargetUpto', 0) + 1);
    };

    battle.getTarget = function() {
        try {
            var target = '',
                targets = [],
                battleUpto = '',
                targetType = '',
                targetRaid = '';

            targetType = config.getItem('TargetType', 'Freshmeat');
            targetRaid = state.getItem('targetFromraid', '');

            if (targetType === 'Raid') {
                if (targetRaid) {
                    return 'Raid';
                }

                caap.setDivContent('battle_mess', 'No Raid To Attack');
                return 'NoRaid';
            }

            if (targetType === 'Freshmeat') {
                return 'Freshmeat';
            }

            if (targetType === 'Arena') {
				recon.records.some( function(bR) {
					var eR = battle.getRecord(bR.userId);
					if (eR.duelLost || eR.duelWon) {
						state.setItem('arenaReconned', state.getItem('arenaReconned','') + ',' + bR.userId);
						recon.deleteRecord(bR.userId);
						eR = $j.extend(true, eR, bR);
						eR.arenaPoints = !eR.duelLost ? 100 + eR.arenaRank.numberOnly() : 0;
						battle.setRecord(eR);
					} else if (!schedule.since(eR.deadTime, 5 * 60)) {
						return false;
					} else if (bR.arenaRank >= config.getItem('arenaReconRankMin',1)
						&& bR.arenaRank <= config.getItem('arenaReconRankMax',7)
						&& bR.level <= config.getItem('arenaReconLevelMax',1400)
						&& !state.getItem('arenaReconned','').hasIndexOf(',' + bR.userId + ',')) {
						target = bR.userId;
						con.log(2, 'Arena reconning ' + state.getItem('arenaReconned','').split(',').length);
					} else {
						recon.deleteRecord(bR.userId);
					}
						
					return target;
				});
                return target;
            }

            target = state.getItem('BattleChainId', 0);
            if (target) {
                return target;
            }

            targets = config.getList('BattleTargets', '');
            if (!targets.length) {
                return false;
            }

            battleUpto = state.getItem('BattleTargetUpto', 0);
            if (battleUpto > targets.length - 1) {
                battleUpto = 0;
                state.setItem('BattleTargetUpto', 0);
            }

            if (!targets[battleUpto]) {
                battle.nextTarget();
                return false;
            }

            caap.setDivContent('battle_mess', 'Battling User ' + battleUpto + '/' + targets.length + ' ' + targets[battleUpto]);
            if ((targets[battleUpto] === '' || $u.isNaN(targets[battleUpto]) ? targets[battleUpto].toLowerCase() : targets[battleUpto]) === 'raid') {
                if (targetRaid) {
                    return 'Raid';
                }

                caap.setDivContent('battle_mess', 'No Raid To Attack');
                battle.nextTarget();
                return false;
            }

            return targets[battleUpto];
        } catch (err) {
            con.error("ERROR in battle.getTarget: " + err.stack);
            return false;
        }
    };

    battle.click = function(battleButton, type) {
        try {
            session.setItem('ReleaseControl', true);
            battle.flagResult = true;
            caap.setDomWaiting(type === "Raid" ? "raid.php" : "battle.php");
            caap.click(battleButton);
            return true;
        } catch (err) {
            con.error("ERROR in battle.click: " + err.stack);
            return false;
        }
    };

    battle.battles = {
        Raid: {
            Invade1: 'raid_attack_button.gif',
            Invade5: 'raid_attack_button3.gif',
            Duel1: 'raid_attack_button2.gif',
            Duel5: 'raid_attack_button4.gif',
            regex1: new RegExp('[0-9]+\\. (.+)\\s*Rank: ([0-9]+) ([^0-9]+) ([0-9]+) ([^0-9]+) ([0-9]+)', 'i'),
            refresh: 'raid',
            image: 'battle_tab_raid_on.jpg'
        },
        Freshmeat: {
            Invade: 'battle_btn_invade.gif',
            Duel: 'battle_btn_duel.gif',
            War: 'battle_btn_war.gif',
            regex1: new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*War: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            regex2: new RegExp('(.+)\\s*\\(Level ([0-9]+)\\)\\s*Battle: ([A-Za-z ]+) \\(Rank ([0-9]+)\\)\\s*([0-9]+)', 'i'),
            warLevel: true,
            refresh: 'battle_tab_battle_on.jpg',
            image: 'battle_tab_battle_on.jpg'
        }
    };

    battle.freshmeat = function(type, slice) {
        try {
            var buttonType = type === 'Raid' ? config.getItem('BattleType', 'Invade') + state.getItem('RaidStaminaReq', 1) : config.getItem('BattleType', 'Invade'),
                inputDiv = $j("input[src*='" + battle.battles[type === "recon" ? "Freshmeat" : type][buttonType] + "']", (type === "recon" && slice ? $j(slice) : $j("#app_body"))),
                plusOneSafe = false,
                safeTargets = [],
                chainId = '',
                chainAttack = false,
				demisLeft = battle.demisPointsToDo('left'),
                inp = $j(),
                txt = '',
                minRank = 0,
                maxLevel = 0,
                minLevel = 0,
                ARBase = 0,
                ARMax = 0,
                ARMin = 0,
				deityStr = '',
                levelMultiplier = 0,
                armyRatio = 0,
                bR = {}, // Battle Record
                it = 0,
                itx,
                len = 0,
                form = $j(),
                firstId = '',
                lastBattleID = 0,
                engageButton = $j(),
                found = 0,
                entryLimit = 0,
                noSafeCount = 0;

            if (!$u.hasContent(inputDiv)) {
                con.warn('Not on battlepage');
                caap.navigateTo(battle.page);
                inputDiv = null;
                inp = null;
                form = null;
                engageButton = null;
                return false;
            }

            chainId = state.getItem('BattleChainId', 0);
            state.setItem('BattleChainId', '');
            // Lets get our Freshmeat user settings
            minRank = config.getItem("FreshMeatMinRank", 99);
            con.log(3, "FreshMeatMinRank", minRank);
            if (minRank === '' || $u.isNaN(minRank)) {
                if (minRank !== '') {
                    con.warn("FreshMeatMinRank is NaN, using default", 99);
                }

                minRank = 99;
            }

            maxLevel = config.getItem("FreshMeatMaxLevel", 99999);
            con.log(3, "FreshMeatMaxLevel", maxLevel);
            if (maxLevel === '' || $u.isNaN(maxLevel)) {
                if (maxLevel !== '') {
                    con.warn("FreshMeatMaxLevel is NaN, using default", maxLevel);
                }

                maxLevel = 99999;
            }

            minLevel = config.getItem("FreshMeatMinLevel", 99999);
            con.log(3, "FreshMeatMinLevel", minLevel);
            if (minLevel === '' || $u.isNaN(minLevel)) {
                if (minLevel !== '') {
                    con.warn("FreshMeatMinLevel is NaN, using default", minLevel);
                }

                minLevel = 99999;
            }

            ARBase = config.getItem("FreshMeatARBase", 0.5);
            con.log(3, "FreshMeatARBase", ARBase);
            if (ARBase === '' || $u.isNaN(ARBase)) {
                if (ARBase !== '') {
                    con.warn("FreshMeatARBase is NaN, using default", ARBase);
                }

                ARBase = 0.5;
            }

            ARMax = config.getItem("FreshMeatARMax", 99999);
            con.log(3, "FreshMeatARMax", ARMax);
            if (ARMax === '' || $u.isNaN(ARMax)) {
                if (ARMax !== '') {
                    con.warn("FreshMeatARMax is NaN, using default", ARMax);
                }

                ARMax = 99999;
            }

            ARMin = config.getItem("FreshMeatARMin", 0);
            con.log(3, "FreshMeatARMin", ARMin);
            if (ARMin === '' || $u.isNaN(ARMin)) {
                if (ARMin !== '') {
                    con.warn("FreshMeatARMin is NaN, using default", ARMin);
                }

                ARMin = 0;
            }

            inputDiv.each(function(index) {
                var tr = $j(),
                    levelm = [],
                    tempTxt = '',
                    tNum = 0,
                    tempTime = -1,
                    i = 0,
                    len = 0,
                    tempRecord = type === "recon" ? new battle.reconRecord().data : new battle.record().data;

                if (type === 'Raid') {
                    tr = tempRecord.button.parents().eq(4);
                } else {
					tempRecord.button = $j(this);
                    tr = tempRecord.button.closest('div[style*="battle_mid.jpg"]');
                }

                inp = $j("input[name='target_id']", tr);
                if (!$u.hasContent(inp)) {
                    con.warn("Could not find 'target_id' input");
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                tempRecord.userId = $u.setContent(inp.val(), '0').parseInt();
                if (!$u.isNumber(tempRecord.userId) || tempRecord.userId <= 0) {
                    con.warn("Not a valid userId", tempRecord.userId);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

				if (type === "recon" && recon.deleteRecord(tempRecord.userId)) {
					con.log(2, "UserRecord exists. Loaded and removed.", tempRecord);
				}

                if (type === 'Raid') {
                    tempTxt = $u.setContent(tr.children().eq(1).text(), '').trim();
                    levelm = battle.battles.Raid.regex1.exec(tempTxt);
                    if (!$u.hasContent(levelm)) {
                        con.warn("Can't match Raid regex in ", tempTxt);
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }

                    tempRecord.name = $u.setContent(levelm[1], '').trim();
                    tempRecord.rank = $u.setContent(levelm[2], '').parseInt();
                    tempRecord.rankStr = battle.battleRankTable[tempRecord.rank];
                    tempRecord.level = $u.setContent(levelm[4], '').parseInt();
                    tempRecord.army = $u.setContent(levelm[6], '').parseInt();
                } else {
                    if (!$u.hasContent(tr)) {
                        con.warn("Can't find parent tr in tempRecord.button");
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }

                    tempTxt = $u.setContent($j("img[src*='iphone_']", tr).attr("src"), '').regex(/_(\w+)_icon\.gif/i);
                    if ($u.hasContent(tempTxt) && $u.hasContent(caap.deityTable[tempTxt] - 1)) {
                        tempRecord.deity = caap.deityTable[tempTxt] - 1;
						deityStr = caap.demiTable[tempRecord.deity];
                    } else {
                        con.warn("Unable to match demi number in tempTxt", tempTxt);
                    }

                    // If looking for demi points, and already full, continue
                    if (type !== "recon" && demisLeft && !battle.demisPointsToDo(tempRecord.deity)) {
						con.log(3, "Daily Demi Points done for", deityStr);
						inputDiv = null;
						inp = null;
						form = null;
						engageButton = null;
						tr = null;
						return true;
                    }

                    tempTxt = $u.setContent(tr.text(), '').trim();
                    if (!$u.hasContent(tempTxt)) {
                        con.warn("Can't find tempTxt in tr");
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }

                    if (battle.battles.Freshmeat.warLevel) {
                        levelm = battle.battles.Freshmeat.regex1.exec(tempTxt);
                        if (!levelm) {
                            levelm = battle.battles.Freshmeat.regex2.exec(tempTxt);
                            battle.battles.Freshmeat.warLevel = false;
                        }
                    } else {
                        levelm = battle.battles.Freshmeat.regex2.exec(tempTxt);
                        if (!levelm) {
                            levelm = battle.battles.Freshmeat.regex1.exec(tempTxt);
                            battle.battles.Freshmeat.warLevel = true;
                        }
                    }

                    if (!levelm) {
                        con.warn("Can't match Freshmeat regex in ", tempTxt);
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }

                    tempRecord.name = $u.setContent(levelm[1], '').trim();
                    tempRecord.level = $u.setContent(levelm[2], '').parseInt();
                    tempRecord.rankStr = $u.setContent(levelm[3], '').trim();
                    tempRecord.rank = $u.setContent(levelm[4], '').parseInt();
                    if (battle.battles.Freshmeat.warLevel) {
                        tempRecord.warRankStr = $u.setContent(levelm[5], '').trim();
                        tempRecord.warRank = $u.setContent(levelm[6], '').parseInt();
                        tempRecord.army = $u.setContent(levelm[7], '').parseInt();
                    } else {
                        tempRecord.army = $u.setContent(levelm[5], '').parseInt();
                    }
                }
				
				con.log(3, 'Battle target stats:', tempRecord.name, tempRecord.level, tempRecord.rankStr, tempRecord.rank, tempRecord.army);

                levelMultiplier = stats.level / (tempRecord.level > 0 ? tempRecord.level : 1);
                armyRatio = ARBase * levelMultiplier;
                armyRatio = Math.min(armyRatio, ARMax);
                armyRatio = Math.max(armyRatio, ARMin);
                if (armyRatio <= 0) {
                    con.warn("Bad ratio", armyRatio, ARBase, ARMin, ARMax, levelMultiplier);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (tempRecord.level - stats.level > maxLevel) {
                    con.log(3, "Exceeds relative maxLevel", {
                        level: tempRecord.level,
                        levelDif: tempRecord.level - stats.level,
                        maxLevel: maxLevel
                    });

                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (stats.level - tempRecord.level > minLevel) {
                    con.log(3, "Exceeds relative minLevel", {
                        level: tempRecord.level,
                        levelDif: stats.level - tempRecord.level,
                        minLevel: minLevel
                    });

                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (config.getItem("BattleType", 'Invade') === "War" && battle.battles.Freshmeat.warLevel) {
                    if (stats.rank.war && (stats.rank.war - tempRecord.warRank > minRank)) {
                        con.log(3, "Greater than war minRank", {
                            rankDif: stats.rank.war - tempRecord.warRank,
                            minRank: minRank
                        });

                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }
                } else {
                    if (stats.rank.battle && (stats.rank.battle - tempRecord.rank > minRank)) {
                        con.log(3, "Greater than battle minRank", {
                            rankDif: stats.rank.battle - tempRecord.rank,
                            minRank: minRank
                        });

                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }
                }

                // if we know our army size, and this one is larger than armyRatio, don't battle
                if (config.getItem('BattleType', 'Invade') == 'Invade' && stats.army.capped && (tempRecord.army > (stats.army.capped * armyRatio))) {
                    con.log(3, "Greater than armyRatio", {
                        armyRatio: armyRatio.dp(2),
                        army: tempRecord.army,
                        armyMax: (stats.army.capped * armyRatio).dp()
                    });

                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (type === "recon") {
                    entryLimit = config.getItem("LimitTargets", 100);
                    while (recon.records.length >= entryLimit) {
                        con.log(2, "Entry limit matched. Deleted an old record", recon.records.shift());
                    }

                    delete tempRecord.button;
                    con.log(2, "Push UserRecord", tempRecord);
                    recon.setRecord(tempRecord);
                    found += 1;

                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                if (config.getItem("BattleType", 'Invade') === "War" && battle.battles.Freshmeat.warLevel) {
                    con.log(1, "ID: " + tempRecord.userId.toString().rpad(" ", 15) + " Level: " + tempRecord.level.toString().rpad(" ", 4) +
                        " War Rank: " + tempRecord.warRank.toString().rpad(" ", 2) + " Army: " + tempRecord.army);
                } else {
                    con.log(1, "ID: " + tempRecord.userId.toString().rpad(" ", 15) + " Level: " + tempRecord.level.toString().rpad(" ", 4) +
                        " Battle Rank: " + tempRecord.rank.toString().rpad(" ", 2) + " Army: " + tempRecord.army);
                }

                // don't battle people we lost to in the last week
                bR = battle.getRecord(tempRecord.userId);
                if (!config.getItem("IgnoreBattleLoss", false)) {
                    tempTime = $u.setContent(bR.lostTime, 0);

                    if (bR && !bR.newRecord && tempTime && !schedule.since(tempTime, 604800)) {
                        con.log(1, "We lost " + config.getItem("BattleType", 'Invade') + " to this id this week: ", tempRecord.userId);
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        tr = null;
                        return true;
                    }
                }

                // don't battle people that results were unknown in the last hour
                tempTime = $u.setContent(bR.deadTime, 0);
                if (bR && !bR.newRecord && !schedule.since(tempTime, 3600)) {
                    con.log(1, "User was battled but results unknown in the last hour: ", tempRecord.userId);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                // don't battle people that were dead or hiding in the last hour
                tempTime = $u.setContent(bR.deadTime, 0);
                if (bR && !bR.newRecord && !schedule.since(tempTime, 3600)) {
                    con.log(1, "User was dead in the last hour: ", tempRecord.userId);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                // don't battle people we've already chained to max or didn't meet chain gold or chain points in the last 2 days
                tempTime = $u.setContent(bR.chainRestTime, 0);
                if (bR && !bR.newRecord && !schedule.since(tempTime, 86400)) {
                    con.log(1, "We chained user within 2 days: ", tempRecord.userId);
                    inputDiv = null;
                    inp = null;
                    form = null;
                    engageButton = null;
                    tr = null;
                    return true;
                }

                tempRecord.score = (type === 'Raid' ? 0 : tempRecord.rank) - (tempRecord.army / levelMultiplier / stats.army.capped);
                if (tempRecord.userId === chainId) {
                    chainAttack = true;
                }

                tempRecord.targetNumber = index + 1;
                con.log(3, "tempRecord/levelm", tempRecord, levelm);
                safeTargets.push(tempRecord);
                tempRecord = null;
                if (index === 0 && type === 'Raid') {
                    plusOneSafe = true;
                }

                inputDiv = null;
                inp = null;
                form = null;
                engageButton = null;
                tr = null;
                return true;
            });

            if (type === "recon") {
                caap.setDivContent('idle_mess', 'Player Recon: Found:' + found + ' Total:' + recon.records.length);
                con.log(1, 'Player Recon: Found:' + found + ' Total:' + recon.records.length);
                window.setTimeout(function() {
                    caap.setDivContent('idle_mess', '');
                }, 5000);

                schedule.setItem('PlayerReconTimer', (gm ? gm.getItem('PlayerReconRetry', 60, hiddenVar) : 60), 60);
                recon.inProgress = false;
                inputDiv = null;
                inp = null;
                form = null;
                engageButton = null;
                return true;
            }

            safeTargets.sort($u.sortBy(true, "score"));
            if ($u.hasContent(safeTargets)) {
                if (chainAttack) {
                    form = inputDiv.eq(0).parent().parent();
                    inp = $j("input[name='target_id']", form);
                    if ($u.hasContent(inp) && !stats.guild.ids.hasIndexOf(chainId)) {
                        inp.attr("value", chainId);
                        con.log(1, "Chain attacking: ", chainId);
                        battle.click(inputDiv.eq(0), type);
                        state.setItem("lastBattleID", chainId);
                        caap.setDivContent('battle_mess', 'Attacked: ' + state.getItem("lastBattleID", 0));
                        state.setItem("notSafeCount", 0);
                        inputDiv = null;
                        inp = null;
                        form = null;
                        engageButton = null;
                        return true;
                    }

                    con.warn("Could not find 'target_id' input");
                } else if (config.getItem('PlusOneKills', false) && type === 'Raid') {
                    if (plusOneSafe) {
                        form = inputDiv.eq(0).parent().parent();
                        inp = $j("input[name='target_id']", form);
                        if ($u.hasContent(inp) && !stats.guild.ids.hasIndexOf(chainId)) {
                            txt = inp.attr("value");
                            firstId = txt ? txt.parseInt() : 0;
                            inp.attr("value", '200000000000001');
                            con.log(1, "Target ID Overriden For +1 Kill. Expected Defender: ", firstId);
                            battle.click(inputDiv.eq(0), type);
                            state.setItem("lastBattleID", firstId);
                            caap.setDivContent('battle_mess', 'Attacked: ' + state.getItem("lastBattleID", 0));
                            state.setItem("notSafeCount", 0);
                            inputDiv = null;
                            inp = null;
                            form = null;
                            engageButton = null;
                            return true;
                        }

                        con.warn("Could not find 'target_id' input");
                    } else {
                        con.log(1, "Not safe for +1 kill.");
                    }
                } else {
                    lastBattleID = state.getItem("lastBattleID", 0);
                    for (it = 0, len = safeTargets.length; it < len; it += 1) {
                        // current thinking is that continue should not be used as it can cause reader confusion
                        // therefore when linting, it throws a warning
                        /*jslint continue: true */
                        if (!lastBattleID && lastBattleID === safeTargets[it].id) {
                            continue;
                        }
                        /*jslint continue: false */

                        if ($u.isDefined(safeTargets[it].button) && !stats.guild.ids.hasIndexOf(chainId)) {
                            con.log(2, 'Found Target score: ' + safeTargets[it].score.dp(2) + ' id: ' + safeTargets[it].userId + ' Number: ' + safeTargets[it].targetNumber);
                            battle.click(safeTargets[it].button, type);
                            delete safeTargets[it].score;
                            delete safeTargets[it].targetNumber;
                            delete safeTargets[it].button;
                            bR = battle.getRecord(safeTargets[it].userId);
                            if (bR.newRecord) {
                                state.setItem("lastBattleID", safeTargets[it].userId);
                                $j.extend(true, bR, safeTargets[it]);
                                bR.newRecord = false;
                            } else {
                                for (itx in safeTargets[it]) {
                                    if (safeTargets[it].hasOwnProperty(itx)) {
                                        if (!$u.hasContent(bR[itx] && $u.hasContent(safeTargets[it][itx]))) {
                                            bR[itx] = safeTargets[it][itx];
                                        }

                                        if ($u.hasContent(safeTargets[it][itx]) && $u.isString(safeTargets[it][itx]) && bR[itx] !== safeTargets[it][itx]) {
                                            bR[itx] = safeTargets[it][itx];
                                        }

                                        if ($u.hasContent(safeTargets[it][itx]) && $u.isNumber(safeTargets[it][itx]) && bR[itx] < safeTargets[it][itx]) {
                                            bR[itx] = safeTargets[it][itx];
                                        }
                                    }
                                }
                            }

                            battle.setRecord(bR);
                            caap.setDivContent('battle_mess', 'Attacked: ' + lastBattleID);
                            state.setItem("notSafeCount", 0);
                            inputDiv = null;
                            inp = null;
                            form = null;
                            engageButton = null;
                            return true;
                        }

                        con.warn('Attack button is null or undefined');
                    }
                }
            }

            noSafeCount = state.setItem("notSafeCount", state.getItem("notSafeCount", 0) + 1);
            if (noSafeCount >= 2) {
                caap.setDivContent('battle_mess', 'Leaving Battle. Will Return Soon.');
                con.log(1, 'No safe targets limit reached. Releasing control for other processes: ', noSafeCount);
                state.setItem("notSafeCount", 0);
                schedule.setItem("NoTargetDelay", 60);
                inputDiv = null;
                inp = null;
                form = null;
                engageButton = null;
                return false;
            }

            caap.setDivContent('battle_mess', 'No targets matching criteria');
            con.log(1, 'No safe targets: ', noSafeCount);
            if (type === 'Raid') {
                engageButton = monster.engageButtons[state.getItem('targetFromraid', '')];
                if (session.getItem("page", '') === 'raid' && engageButton) {
                    caap.click(engageButton);
                } else {
                    caap.navigateTo(battle.page + ',raid');
                }
            } else {
                caap.navigateTo(battle.page + ',battle_tab_battle_on.jpg');
            }

            inputDiv = null;
            inp = null;
            form = null;
            engageButton = null;
            return true;
        } catch (err) {
            con.error("ERROR in battle.freshmeat: " + err.stack);
            return false;
        }
    };

	// Returns true if selected demi points not done and menu says do them first
	// If passed "set," checks for any demi points that set to work on
	// If passed "left," checks for any demi points that still need points that day
    battle.demisPointsToDo = function(demiPoint) {
        try {
            return (['set','left'].hasIndexOf(demiPoint) ? [0, 1, 2, 3, 4] : [demiPoint]).some( function(it) {
				return config.getItem('DemiPoint' + it, false) && (demiPoint == 'set' || caap.demi[caap.demiTable[it]].daily.dif > 0);
            });

        } catch (err) {
            con.error("ERROR in battle.demisPointsToDo: " + err.stack);
            return undefined;
        }
    };

    battle.menu = function() {
        try {
			var XBattleInstructions = "Start battling if stamina is above this points",
                XMinBattleInstructions = "Do not battle if stamina is below this points",
                safeHealthInstructions = "Wait until health is 13 instead of 10, prevents you killing yourself but leaves you unhidden for upto 15 minutes",
                userIdInstructions = "User IDs(not user name).  Click with the " + "right mouse button on the link to the users profile & copy link." + "  Then paste it here and remove everything but the last numbers." + " (ie. 123456789)",
                chainBPInstructions = "Number of battle points won to initiate a chain attack. Specify 0 to always chain attack.",
                chainGoldInstructions = "Amount of gold won to initiate a chain attack. Specify 0 to always chain attack.",
                maxChainsInstructions = "Maximum number of chain hits after the initial attack.",
                FMRankInstructions = "The lowest relative rank below yours that " + "you are willing to spend your stamina on. Leave blank to attack " + "any rank. (Uses Battle Rank for invade and duel, War Rank for wars.)",
                FMARBaseInstructions = "This value sets the base for your Army " + "Ratio calculation [X * (Your Army Size/ Opponent Army Size)]. It is basically a multiplier for the army " +
                    "size of a player at your equal level. A value of 1 means you " + "will battle an opponent the same level as you with an army the " + "same size as you or less. Default .5",
                FreshMeatARMaxInstructions = "This setting sets the highest value you will use for the Army Ratio [Math.min(Army Ratio, Army Ratio Max)] value. " +
                    "So, if you NEVER want to fight an army bigger than 80% your size, you can set the Max value to .8.",
                FreshMeatARMinInstructions = "This setting sets the lowest value you will use for the Army Ratio [Math.max(Army Ratio, Army Ratio Min)] value. " +
                    "So, if you NEVER want to pass up an army that is less than 10% the size of yours, you can set MIN value to .1.",
                FreshMeatMaxLevelInstructions = "This sets the highest relative level, above yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent above level 120, you would code 20.",
                FreshMeatMinLevelInstructions = "This sets the lowest relative level, below yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent below level 60, you would code 40.",
                plusonekillsInstructions = "Force +1 kill scenario if 80% or more" + " of targets are withn freshmeat settings. Note: Since Castle Age" + " choses the target, selecting this option could result in a " + "greater chance of loss.",
                raidPowerAttackInstructions = "Attack raids using the x5 button. (Not recommended).",
                raidOrderInstructions = "List of search words that decide which " + "raids to participate in first.  Use words in player name or in " +
                    "raid name. To specify max damage follow keyword with :max token " + "and specifiy max damage values. Use 'k' and 'm' suffixes for " + "thousand and million.",
                ignorebattlelossInstructions = "Ignore battle losses and attack " + "regardless.  This will also delete all battle loss records.",
                typeList = ['Invade', 'Duel', 'War'],
                typeInst = ['Battle using Invade button', 'Battle using Duel button - no guarentee you will win though', 'War using Duel button - no guarentee you will win though'],
                targetList = ['Freshmeat', 'Userid List', 'Raid'],
                targetInst = ['Use settings to select a target from the Battle Page', 'Select target from the supplied list of userids', 'Raid Battles'],
                dosiegeInstructions = "(EXPERIMENTAL) Turns on or off automatic siege assist for all raids only.",
                collectRewardInstructions = "(EXPERIMENTAL) Automatically collect raid rewards.",
                PReconInstructions = "Enable player battle reconnaissance to run " + "as an idle background task. Battle targets will be collected and" + " can be displayed using the 'Target List' selection on the " + "dashboard.",
				haveZin = general.hasRecord("Zin"),
				haveMisa = general.hasRecord("Misa"),
				who = (haveZin ? 'Zin' : '') + (haveZin && haveMisa ? ' and ' : '') + (haveMisa ? 'Misa' : ''),
                battleList = ['Stamina Available', 'At Max Stamina', 'At X Stamina', 'No Monster', 'Stay Hidden', 'Recon Only', 'Only Demipoints or Zin/Misa', 'Never'],
                battleInst = [
                    'Stamina Available will battle whenever you have enough stamina',
                    'At Max Stamina will battle when stamina is at max and will burn down all stamina when able to level up',
                    'At X Stamina you can set maximum and minimum stamina to battle',
                    'No Monster will battle only when there are no active monster battles or if Get Demi Points First has been selected.',
                    'Stay Hidden uses stamina to try to keep you under 10 health so you cannot be attacked, while also attempting to maximize your stamina use for Monster attacks. YOU MUST SET MONSTER TO "STAY HIDDEN" TO USE THIS FEATURE.',
                    'Only perform Player Recon, does not actually battle players.',
                    'Only does Demipoints' + (who ? ' or ' + who : ''),
                    'Never - disables player battles'
                ],
				subCode = '',
                htmlCode = caap.startToggle('Battling', 'BATTLE');

            htmlCode += caap.makeDropDownTR("Battle When", 'WhenBattle', battleList, battleInst, '', 'Never', false, false, 62);
            htmlCode += caap.display.start('WhenBattle', 'isnot', 'Never');

            htmlCode += caap.makeCheckTR("Use " + who + " First", 'useZinMisaFirst', false, 'If ' + who + ' charged and not levelling up then use battle first if space in the appropriate stat.', false, false, '', '_zin_row', who ? "display: block;" : "display: none;");

            htmlCode += "<div title='Does not work with War'>Get below Demi points first</div>";
			caap.demiQuestList.forEach( function(item, i) {
                subCode += "<span title='" + item + "'>";
                subCode += "<img alt='" + item + "' src='data:image/gif;base64," + image64[item] + "' height='15px' width='15px'/>";
                subCode += caap.makeCheckBox('DemiPoint' + i, false);
                subCode += "</span>";
            });
            htmlCode += caap.makeTD(subCode, false, false, "white-space: nowrap;");

            htmlCode += "<div id='caap_WhenBattleStayHidden_hide' style='color: red; font-weight: bold; display: ";
            htmlCode += (config.getItem('WhenBattle', 'Never') === 'Stay Hidden' && config.getItem('WhenMonster', 'Never') !== 'Stay Hidden' ? 'block' : 'none') + "'>";
            htmlCode += "Warning: Monster Not Set To 'Stay Hidden'";
            htmlCode += "</div>";

            htmlCode += caap.display.start('WhenBattle', 'is', 'At X Stamina');
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'XBattleStamina', XBattleInstructions, 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'XMinBattleStamina', XMinBattleInstructions, 0, '', '', true, false);
            htmlCode += caap.display.end('WhenBattle', 'is', 'At X Stamina');
            htmlCode += caap.makeDropDownTR("Battle Type", 'BattleType', typeList, typeInst, '', '', false, false, 62);
            htmlCode += caap.makeCheckTR("Wait For Safe Health", 'waitSafeHealth', false, safeHealthInstructions);
			// siege is changed so disable 
			config.setItem('raidDoSiege', false)
			//htmlCode += caap.makeCheckTR("Siege Weapon Assist Raids", 'raidDoSiege', true, dosiegeInstructions);
            htmlCode += caap.makeCheckTR("Collect Raid Rewards", 'raidCollectReward', false, collectRewardInstructions);
            htmlCode += caap.makeCheckTR("Clear Complete Raids", 'clearCompleteRaids', false, '');
            htmlCode += caap.makeCheckTR("Ignore Battle Losses", 'IgnoreBattleLoss', false, ignorebattlelossInstructions);
            htmlCode += caap.makeNumberFormTR("Chain Battle Points", 'ChainBP', chainBPInstructions, '', '');
            htmlCode += caap.makeNumberFormTR("Chain Gold", 'ChainGold', chainGoldInstructions, '', '', '', false, false, 30);
            htmlCode += caap.makeNumberFormTR("Max Chains", 'MaxChains', maxChainsInstructions, 4, '', '');
            htmlCode += caap.makeTD("Attack targets that are not:");
            htmlCode += caap.makeNumberFormTR("Lower Than Rank Minus", 'FreshMeatMinRank', FMRankInstructions, '', '', '');
            htmlCode += caap.makeNumberFormTR("Higher Than X*AR", 'FreshMeatARBase', FMARBaseInstructions, 0.5, '', '');
            htmlCode += caap.makeCheckTR('Advanced', 'AdvancedFreshMeatOptions', false);
            htmlCode += caap.display.start('AdvancedFreshMeatOptions');
            htmlCode += caap.makeNumberFormTR("Max Level", 'FreshMeatMaxLevel', FreshMeatMaxLevelInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("Min Level", 'FreshMeatMinLevel', FreshMeatMinLevelInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("Army Ratio Max", 'FreshMeatARMax', FreshMeatARMaxInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("Army Ratio Min", 'FreshMeatARMin', FreshMeatARMinInstructions, '', '', '', true);
            htmlCode += caap.display.end('AdvancedFreshMeatOptions');
            htmlCode += caap.makeCheckTR("Enable Player Recon", 'DoPlayerRecon', false, PReconInstructions);
            htmlCode += caap.display.start('DoPlayerRecon');
            htmlCode += caap.makeCheckTR("Do In Background", 'bgRecon', true, "Use AJAX for Player Recon.");
            htmlCode += caap.makeNumberFormTR("Limit Target Records", 'LimitTargets', "Maximum number of records to hold.", 100, '', '');
            htmlCode += caap.makeCheckTR("Stop Recon At Limit", 'stopReconLimit', true, "Stop performing Player Recon when target limit is reached rather than replacing oldest targets with new.");
            htmlCode += caap.display.end('DoPlayerRecon');
            htmlCode += caap.makeDropDownTR("Target Type", 'TargetType', targetList, targetInst, '', '', false, false, 62);
            htmlCode += caap.display.start('TargetType', 'is', 'Arena');
	        htmlCode += caap.makeNumberFormTR("Opponent Rank Min", 'arenaReconRankMin', '', '', '', '', true, false);
	        htmlCode += caap.makeNumberFormTR("Opponent Rank Max", 'arenaReconRankMax', '', '', '', '', true, false);
	        htmlCode += caap.makeNumberFormTR("Opponent Level Max", 'arenaReconLevelMax', '', '', '', '', true, false);
            htmlCode += caap.display.end('TargetType', 'is', 'Arena');
            htmlCode += caap.display.start('TargetType', 'is', 'Raid');
            htmlCode += caap.makeCheckTR("Power Attack", 'RaidPowerAttack', false, raidPowerAttackInstructions, true);
            htmlCode += caap.makeCheckTR("Attempt +1 Kills", 'PlusOneKills', false, plusonekillsInstructions, true);
            htmlCode += caap.makeTD("Join Raids in this order <a href='http://caaplayer.freeforums.org/attack-monsters-in-this-order-clarified-t408.html' target='_blank' style='color: blue'>(INFO)</a>");
            htmlCode += caap.makeTextBox('orderraid', raidOrderInstructions, '');
            htmlCode += caap.display.end('TargetType', 'is', 'Raid');
            htmlCode += caap.display.start('TargetType', 'is', 'Userid List');
            htmlCode += caap.makeTextBox('BattleTargets', userIdInstructions, '');
            htmlCode += caap.display.end('TargetType', 'is', 'Userid List');
            htmlCode += caap.display.end('WhenBattle', 'isnot', 'Never');
            htmlCode += caap.endToggle;
			config.setItem('WhenbattleOverride', 'Stamina Available');
            return htmlCode;
        } catch (err) {
            con.error("ERROR in battle.menu: " + err.stack);
            return '';
        }
    };

    battle.dashboard = function(which) {
        try {
            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoBattle' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
			
			which = which == 'Arena' ? which : 'Battle';
            if (config.getItem('DBDisplay', '') === (which + ' Stats') && session.getItem(which + "DashUpdate", true)) {
                var headers = ['UserId', 'Name', 'BR', 'WR', 'CR', 'Level', 'Army', 'Min Def', 'Max Def', 'Duel Win Chance', 'Invade', 'Duel', 'War', 'Points', '&nbsp;'],
                    values = ['userId', 'name', 'rank', 'warRank', 'conqRank', 'level', 'army', 'minDef', 'maxDef', 'wc', 'invadeWon', 'duelWon', 'warWon', 'points'],
                    pp = 0,
                    i = 0,
                    userIdLink = '',
                    userIdLinkInstructions = '',
                    len = 0,
                    len1 = 0,
                    data = {
                        text: '',
                        color: '',
                        bgcolor: '',
                        id: '',
                        title: ''
                    },
                    head = '',
                    body = '',
                    row = '';

				if (which == 'Arena') {
					headers = ['UserId', 'Name', 'Points', 'Total', 'Duel', 'AR', 'Level', 'Army', '&nbsp;'];
                    values = ['userId', 'name', 'arenaPoints', 'arenaTotal', 'duelWon', 'arenaRank', 'level', 'army'];
					var arenaers = battle.records.filter( function(bR) {
							return bR.arenaRank;
						}),
						winnerF = function(bR) {
							return bR.duelWon > 0 && !bR.duelLost;
						},
						winners = arenaers.filter(winnerF),
						report = '';
					[1, 2, 3, 4, 5, 6, 7].forEach( function(rank) {
						report += 'R' + rank + ': ';
						var aRankArr = arenaers.filter( function(bR) {
								return bR.arenaRank == rank;
							}),
							winnerSum = aRankArr.filter(winnerF).length;
						report += winnerSum + '/' + aRankArr.length + ' ' + (winnerSum / aRankArr.length * 100).dp(1) + '% ';
					});
				}
				
                for (pp = 0; pp < headers.length; pp += 1) {
                    switch (headers[pp]) {
                    case 'UserId':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '16%'
                        });
                        break;
                    case 'Name':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '20%'
                        });
                        break;
                    case 'Invade':
                    case 'Duel':
                    case 'War':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '7%'
                        });
                        break;
                    case 'CR':
                    case 'BR':
                    case 'WR':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '5%'
                        });
                        break;
                    case '&nbsp;':
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '1%'
                        });
                        break;
                    default:
                        head += caap.makeTh({
                            text: headers[pp],
                            color: '',
                            id: '',
                            title: '',
                            width: '7%'
                        });
                    }
                }

                head = caap.makeTr(head);
                for (i = 0, len = battle.records.length; i < len; i += 1) {
                    row = "";
                    for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                        switch (values[pp]) {
                        case 'userId':
                            userIdLinkInstructions = "Clicking this link will take you to the user keep of " + battle.records[i][values[pp]];
                            userIdLink = "keep.php?casuser=" + battle.records[i][values[pp]];
                            data = {
                                text: '<span id="caap_battle_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + battle.records[i][values[pp]] + '</span>',
                                color: 'blue',
                                id: '',
                                title: ''
                            };

                            row += caap.makeTd(data);
                            break;
                        case 'rank':
                        case 'warRank':
                        case 'conqRank':
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: battle.ranks[values[pp]][battle.records[i][values[pp]]]
                            });
                            break;
                        case 'wc':
                            row += caap.makeTd({
                                text: battle.winChance(battle.records[i], stats.bonus.api),
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'invadeWon':
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]] + "/" + battle.records[i].invadeLost,
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'duelWon':
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]] + "/" + battle.records[i].duelLost,
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'warWon':
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]] + "/" + battle.records[i].warLost,
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'points':
                            row += caap.makeTd({
                                text:  battle.types.reduce( function(p, c) {
									return p + battle.records[i][c + 'Points'];
								}, 0),
                                color: '',
                                id: '',
                                title: battle.types.map( function(e) {
									return e.ucWords() + ': ' + battle.records[i][e + 'Points'];
								}).join(', ')
                            });
                            break;
                        default:
                            row += caap.makeTd({
                                text: battle.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: ''
                            });
                        }
                    }

					userIdLinkInstructions = "Clicking this link will remove " + battle.records[i].name + "'s data from CAAP.";
					data = {
						text: '<span id="caap_battle_remove_' + battle.records[i].userId + '" title="' + userIdLinkInstructions 
							+ '" userid="' + battle.records[i].userId + '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';" class="ui-icon ui-icon-circle-close">X</span>',
						color: 'blue',
						id: '',
						title: ''
					};

					row += caap.makeTd(data);

                    body += caap.makeTr(row);
                }

                $j("#caap_info" + which, caap.caapTopObject).html(
                $j(caap.makeTable(which.toLowerCase(), head, body)).dataTable({
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
                        "aTargets": [headers.length - 1]
                    }]
					}));
				$j("#caap_info" + which, caap.caapTopObject).prepend(report);
				
                $j("span[id*='caap_battle_']", caap.caapTopObject).click(function(e) {
                    var i = 0,
                        len = 0;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
							caap.clickAjaxLinkSend(e.target.attributes[i].nodeValue);
							return true;
                        }
                    }

                });

                $j("span[id^='caap_battle_remove_']", caap.caapTopObject).click(function(e) {
                    var i = 0,
                        len = 0;
						
                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'userid') {
                            battle.deleteRecord(e.target.attributes[i].value);
                        }
                    }
                });

                session.setItem(which + "DashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in battle.dashboard: " + err.stack, which);
            return false;
        }
    };

}());