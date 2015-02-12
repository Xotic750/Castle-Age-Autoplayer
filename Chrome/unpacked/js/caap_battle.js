/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
festival,feed,battle,town,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          BATTLING PLAYERS
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

    battle.checkResults = function() {
        try {
            var battleRecord = {},
                tempTime = 0,
                chainBP = 0,
                chainGold = 0,
                maxChains = 0,
                result = {};

            if (!battle.flagResult) {
                return true;
            }

            con.log(2, "Checking Battle Results");
            battle.flagResult = false;
            state.setItem("BattleChainId", 0);
            if (battle.deadCheck() !== false) {
                return true;
            }

            result = battle.getResult();
            if (!result || result.hiding === true) {
                return true;
            }

            if (result.unknown === true) {
                if (state.getItem("lastBattleID", 0)) {
                    battleRecord = battle.getItem(state.getItem("lastBattleID", 0));
                    battleRecord.unknownTime = Date.now();
                    battle.setItem(battleRecord);
                }

                return true;
            }

            battleRecord = battle.getItem(result.userId);
            if (result.win) {
                con.log(1, "We Defeated ", result.userName, ((result.battleType === "War") ? "War Points: " : "Battle Points: ") + result.points + ", Gold: " + result.gold);
                //Test if we should chain this guy
                tempTime = $u.setContent(battleRecord.chainTime, 0);
                chainBP = config.getItem('ChainBP', '');
                chainGold = config.getItem('ChainGold', '');
                if (schedule.since(tempTime, 86400) && ((chainBP !== '' && !$u.isNaN(chainBP) && chainBP >= 0) || (chainGold !== '' && !$u.isNaN(chainGold) && chainGold >= 0))) {
                    if (chainBP !== '' && !$u.isNaN(chainBP) && chainBP >= 0) {
                        if (result.points >= chainBP) {
                            state.setItem("BattleChainId", result.userId);
                            con.log(1, "Chain Attack:", result.userId, ((result.battleType === "War") ? "War Points: " : "Battle Points: ") + result.points);
                        } else {
                            battleRecord.ignoreTime = Date.now();
                        }
                    }

                    if (chainGold !== '' && !$u.isNaN(chainGold) && chainGold >= 0) {
                        if (result.gold >= chainGold) {
                            state.setItem("BattleChainId", result.userId);
                            con.log(1, "Chain Attack:", result.userId, "Gold: " + result.goldnum);
                        } else {
                            battleRecord.ignoreTime = Date.now();
                        }
                    }
                }

                battleRecord.chainCount = battleRecord.chainCount ? battleRecord.chainCount += 1 : 1;
                maxChains = config.getItem('MaxChains', 4);
                if (maxChains === '' || $u.isNaN(maxChains) || maxChains < 0) {
                    maxChains = 4;
                }

                if (battleRecord.chainCount >= maxChains) {
                    con.log(1, "Lets give this guy a break. Chained", battleRecord.chainCount);
                    battleRecord.chainTime = Date.now();
                    battleRecord.chainCount = 0;
                }

            } else {
                con.log(1, "We Were Defeated By ", result.userName);
                battleRecord.chainCount = 0;
                battleRecord.chainTime = 0;
            }

            battle.setItem(battleRecord);
            return true;
        } catch (err) {
            con.error("ERROR in battle.checkResults: " + err.stack);
            return false;
        }
    };

	caap.checkResults_battle = function () {
        try {
            var symDiv = $j(),
                points = [],
                success = true;

            battle.checkResults();
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

            //config.getItem('DoPlayerRecon', false)
            if (battle.reconInProgress) {
                battle.freshmeat("recon");
            }

            symDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_battle: " + err.stack);
            return false;
        }
    };

    caap.battleUserId = function(userid) {
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

    caap.battleWarnLevel = true;

    caap.battle = function(mode) {
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
                battleRecord = {},
                tempTime = 0,
                monsterObject = $u.hasContent(targetMonster) ? monster.getItem(targetMonster) : {},
                noSafeCountSet = 0,
				battleOrOverride = 'Battle';

            if (caap.stats.level < 8) {
                if (caap.battleWarnLevel) {
                    con.log(1, "Battle: Unlock at level 8");
                    caap.battleWarnLevel = false;
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

            if (caap.checkKeep()) {
                return true;
            }

            /*
            if (caap.stats.health.num < 10) {
                con.log(5, 'Health is less than 10: ', caap.stats.health.num);
                return false;
            }

            if (config.getItem("waitSafeHealth", false) && caap.stats.health.num < 13) {
                con.log(5, 'Unsafe. Health is less than 13: ', caap.stats.health.num);
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
                    if (caap.navigateTo(caap.battlePage, 'battle_tab_battle_on.jpg')) {
                        button = null;
                        return true;
                    }

                    caap.clickAjaxLinkSend("raid.php");
                    button = null;
                    return true;
                }

                if (caap.navigateTo(caap.battlePage + ',raid', 'battle_tab_raid_on.jpg')) {
                    button = null;
                    return true;
                }

                if (config.getItem('clearCompleteRaids', false) && $u.hasContent(monster.completeButton.raid.button) && $u.hasContent(monster.completeButton.raid.md5)) {
                    caap.click(monster.completeButton.raid.button);
                    monster.deleteItem(monster.completeButton.raid.md5);
                    monster.completeButton.raid = {
                        'md5': undefined,
                        'name': undefined,
                        'button': undefined
                    };

                    caap.updateDashboard(true);
                    con.log(1, 'Cleared a completed raid');
                    button = null;
                    return true;
                }

                raidName = state.getItem('targetFromraid', '');
                if ($u.hasContent(raidName)) {
                    monsterObject = monster.getItem(raidName);
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

                if (caap.navigateTo(caap.battlePage, 'battle_tab_battle_on.jpg')) {
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
                    battleRecord = battle.getItem(target);
                    tempTime = battleRecord[battletype + 'LostTime'] || tempTime;

                    if (battleRecord && battleRecord.nameStr !== '' && !schedule.since(tempTime, 604800)) {
                        con.log(1, 'Avoiding Losing Target', target);
                        battle.nextTarget();
                        return true;
                    }
                }

                if (caap.navigate2('@' + battletype + 'General,battle')) {
                    return true;
                }

                //state.setItem('BattleChainId', 0);
                if (caap.battleUserId(target)) {
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

}());
