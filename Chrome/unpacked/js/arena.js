////////////////////////////////////////////////////////////////////
//                          ARENA OBJECT
// this is the main object for dealing with Arena IX
/////////////////////////////////////////////////////////////////////

 arena = {
    menu: function () {
        var typeList = [
            'Invade',
            'Duel'
        ],
        typeInst = [
            'Battle using Invade button',
            'Battle using Duel button'
        ]
        MaxLevelInstructions = "This sets the highest relative level, above yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent above level 120, you would code 20.",
        MinLevelInstructions = "This sets the lowest relative level, below yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent below level 60, you would code 40.",

        htmlCode = caap.startToggle('Arena', 'ARENA');
        htmlCode += caap.makeCheckTR('Enable Arena Battles', 'enableArena', false, '');
//        htmlCode += caap.makeDropDownTR("Battle Type", 'ArenaBattleType', typeList, typeInst, '', '', false, false, 62);
        htmlCode += caap.makeNumberFormTR("Start At Or Above", 'arenaTokenStart', '', 10, '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'arenaTokenStop', '', 0, '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Army Max", 'arenaArmyMax', '', 501, '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Rank Min", 'arenaRankMin', '', '', '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Rank Max", 'arenaRankMax', '', '', '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Level Min", 'arenaLevelMin', MinLevelInstructions, '', '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Level Max", 'arenaLevelMax', MaxLevelInstructions, '', '', '', true, false);
        htmlCode += caap.makeTD("<input type='button' id='caap_ArenaNow' value='Fight!' style='padding: 0; font-size: 10px; height: 18px' />");
        htmlCode += caap.endToggle;
        return htmlCode;
    },
	
    target: false,
	
    checkResults: function () {
        try {
            var battleRecord = {},
                tempTime     = 0,
                arenaTokens = $j("span[id*='guild_token_current_value']")[0].innerHTML,
				tempDiv       = $j(),
				resultsDiv = $j("#app_body div[style*='arena_arena_bg.jpg']");
                tempText      = '',
                tNum          = 0,
                battleRecord  = {},
                result        = {
                    userId     : 0,
                    nameStr   : '',
                    battleType : '',
                    points     : 0,
                    gold       : 0,
                    win        : false,
                    hiding     : false,
                    unknown    : false
                };
                
            state.setItem("arenaTokens", arenaTokens);

            if (arenaTokens >= config.getItem("arenaTokenStart", 10)) {
                con.log (2, "Arena Timer resetting");
                schedule.setItem('arenaTimer', 0);
            }
            
			tempDiv = $j("#app_body img[src*='orange_healthbar.jpg']");
			session.setItem('arenaHealth', tempDiv.length ? tempDiv.parent().text().trim().regex(/(\d+)\/\d+/) : 0);
			con.log(2, 'Arena Health: ' + session.getItem('arenaHealth', 0));

            state.setItem("arenaBattleChainId", 0);

            if (!arena.target) {
                return true;
            }

            con.log(2, "Checking Battle Results");
            arena.target = false;

			tempText = $j('#results_main_wrapper').text().trim().regex(/Your opponent is too (high|low) level for you to engage in an arena battle with!/);
			if (tempText) {
				tempText = 'arenaLevel' + (tempText == 'low' ? 'Min' : 'Max');
				tNum = Math.abs(arena.target.levelNum - caap.stats.level);
				$j('#caap_' + tempText).val(tNum);
				config.setItem(tempText, tNum);
				con.log(1, 'Arena: reset ' + (tempText == 'low' ? 'min' : 'max') + ' level to ' + tNum + ', so avoiding targets ' + (tempText == 'low' ? 'under' : 'over') + ' '+ (caap.stats.level + tNum), tempText, tNum);
				return false;
			}
			
            if ($u.hasContent($j("img[src*='battle_victory.gif']", resultsDiv))) {
                result.win = true;
            } else if (!$u.hasContent($j("img[src*='battle_defeat.gif']", resultsDiv))) {
                result.unknown = true;
                con.warn("Unable to determine won or lost!");
            }

            if ($u.hasContent($j("input[src*='battle_invade_again.gif']", resultsDiv))) {
                result.battleType = 'Invade';
            } else if ($u.hasContent($j("input[src*='battle_duel_again.gif']", resultsDiv))) {
                result.battleType = 'Duel';
            } else {
                if ($u.hasContent($j("img[src*='icon_weapon.gif']", resultsDiv))) {
                    result.battleType = 'Duel';
                } else if ($u.hasContent($j("div[class='full_invade_results']", resultsDiv))) {
                    result.battleType = 'Invade';
                }
            }

            if ($u.hasContent(result.battleType)) {
				result.points = resultsDiv.text().trim().innerTrim().regex(/You have \w+ (\d+) Arena Points/);
				if ($u.hasContent(tNum)) {
					result.points = tNum;
				} else {
					con.warn("Unable to match arena points", tempText);
				}

				result.gold = result.win == true ? 100000 : - 100000;   
				result.userId = $j('form[id*="fight_opp_"]')[0].children[0].value;
                    
            } else {
                con.warn("Unable to determine battle type");
                throw "Unable to get userId!";
            }
            battleRecord = battle.getItem(result.userId);
            battleRecord.attackTime = Date.now();
            if (result.nameStr && result.nameStr !== battleRecord.nameStr && result.nameStr !== 'unknown') {
                con.log(1, "Updating battle record user name, from/to", battleRecord.nameStr, result.nameStr);
                battleRecord.nameStr = result.nameStr;
            }

            if (result.win) {
                battleRecord.statswinsNum += 1;
            } else {
                battleRecord.statslossesNum += 1;
            }

            switch (result.battleType) {
            case 'Invade' :
                if (result.win) {
                    battleRecord.invadewinsNum += 1;
                    battleRecord.ibp += result.points;
                } else {
                    battleRecord.invadelossesNum += 1;
                    battleRecord.ibp -= result.points;
                    battleRecord.invadeLostTime = Date.now();
                }

                break;
            case 'Duel' :
                if (result.win) {
                    battleRecord.duelwinsNum += 1;
                    battleRecord.dbp += result.points;
                } else {
                    battleRecord.duellossesNum += 1;
                    battleRecord.dbp -= result.points;
                    battleRecord.duelLostTime = Date.now();
                }
                break;
            default :
                con.warn("Battle type unknown!", result.battleType);
            }

            battle.setItem(battleRecord);

            if (!result || result.hiding === true) {
                return true;
            }

            if (result.unknown === true) {
                if (state.getItem("lastArenaBattleID", 0)) {
                    battleRecord = battle.getItem(state.getItem("lastArenaBattleID", 0));
                    battleRecord.unknownTime = Date.now();
                    battle.getItem(battleRecord);
                }

                return true;
            }

            battleRecord = battle.getItem(result.userId);
            if (result.win) {
                con.log(1, "We Defeated " + battleRecord.nameStr + " Battle Points: " + result.points, result, battleRecord);
                state.setItem("arenaBattleChainId", result.userId);
				session.setItem('ReleaseControl', false);
            } else {
                con.log(1, "We Were Defeated By " + battleRecord.nameStr, result, battleRecord);
                battleRecord.chainCount = 0;
                battleRecord.chainTime = 0;
            }

            battle.setItem(battleRecord);
            return true;
        } catch (err) {
            con.error("ERROR in arena.checkResults: " + err);
            return false;
        }
    },

    battle: function () {
		try {
			var useGeneral = 'DuelGeneral',
				tempDiv = $j(),
				chainID = state.getItem("arenaBattleChainId", false),
				v = {
					arenaLevelMax : 99999,
					arenaLevelMin : 99999,
					arenaRankMax : 8,
					arenaRankMin : 0,
					arenaArmyMax : 999999
				};
			
			session.setItem('ReleaseControl', true);

			if (caap.navigate2('@' +  useGeneral + ',arena')) {
				return true;
			}

			var inputDiv = $j("div[style*='arena_infobar']"),
				arenaTokens = $j("span[id*='guild_token_current_value']")[0].innerHTML,
				battleRecord      = {},
				levelMultiplier   = 0,
				safeTargets       = [];

			state.setItem("arenaTokens", arenaTokens);

			if (session.getItem('arenaHealth', 0) === 0 && arenaTokens < 9) {
				schedule.setItem('arenaTimer', 5 * 60);
				return false;
			}
			
			tempDiv = $j("input[src*='battle_duel_again.gif']:first");
			if (chainID && tempDiv.length && arenaTokens > 0) {
                con.log(1, "Chain Attacking " + chainID);
				caap.click(tempDiv);
				return true;
			}

			if (arenaTokens <= config.getItem("arenaTokenStop", 1) ) {
				schedule.setItem('arenaTimer', Math.max (config.getItem("arenaTokenStart", 1) - config.getItem("arenaTokenStop", 1), 0) * 5 * 60);
				return false;
			}
			
			$j.each(v, function(index, value) {
				var temp = config.getItem(index, value);
				if ($u.isNaN(temp) && temp !== '') {
					con.warn(index + " is not a number, using default of " + value, temp);
					v[index] = value;
				}
				v[index] = temp == '' ? value : temp;
			}); 
			
			inputDiv.each(function (index) {
				var thisDiv    = $j(this),
					tempTime   = -1,
					tR = new battle.record().data; // temp record
				
				// regexDivToRecord broken into two parts because double-byte char names can cause regex match to fail
				caap.regexDivToRecord(thisDiv, tR, /(.*) level: \d+ .+ \(Rank \d\) \d+/,
					['nameStr']);
				caap.regexDivToRecord(thisDiv, tR, /level: (\d+) (.+) \(Rank (\d)\) (\d+)/,
					['levelNum', 'rankStr', 'arenaRankNum', 'armyNum']);
				tR.userId = $j("input[name*='target_id']", inputDiv[index].children[4].children[0].children[0])[0].value;
				levelMultiplier = caap.stats.level / (tR.levelNum || 1);

				tR.button = $j("input[src*='arena_invade_btn']", thisDiv);
				battleRecord = battle.getItem(tR.userId);
	//          switch (config.getItem("ArenaBattleType", 'Invade')) {
				switch ('Duel') {
				case 'Invade' :
					tempTime = $u.setContent(battleRecord.invadeLostTime, 0);
					tR.button = $j("input[src*='arena_invade_btn']", thisDiv);
					break;
				case 'Duel' :
					tempTime = $u.setContent(battleRecord.duelLostTime, 0);
					tR.button = $j("input[src*='arena_duel_btn']", thisDiv);
					break;
				default :
					con.warn("Battle type unknown!", config.getItem("ArenaBattleType", 'Invade'));
				}
				
				if (!$u.isDefined(tR.button)) {
					con.warn("No target button", tR);
					return true;
				}
				
				if (battleRecord && !battleRecord.newRecord && tempTime && !schedule.since(tempTime, 604800)) {
					con.log(1, "We lost " +'Duel' + " to this id this week: ", tR.userId);
					return true;
				}

				if (tR.levelNum > caap.stats.level + v.arenaLevelMax) {
					con.log(2, "Target level " + tR.levelNum + " exceeds max level of " + (caap.stats.level + v.arenaLevelMax), tR);
					return true;
				}

				if (tR.levelNum < caap.stats.level - v.arenaLevelMin) {
					con.log(2, "Target level " + tR.levelNum + " below min level of " + (caap.stats.level - v.arenaLevelMin), tR);
					return true;
				}

				if (tR.arenaRankNum > v.arenaRankMax) {
					con.log(2, "Rank of " + tR.arenaRankNum + " over max rank " + v.arenaRankMax, tR);
					return true;
				}

				if (tR.arenaRankNum < v.arenaRankMin) {
					con.log(2, "Rank of " + tR.arenaRankNum + " under min rank " + v.arenaRankMin, tR);
					return true;
				}

				if (v.arenaArmyMax < tR.armyNum) {
					con.log(2, "Army of " + tR.armyNum + " is over max of " + v.arenaArmyMax, tR);
					return true;
				}
				
				if (state.getItem("lastArenaBattleID", 0) === tR.userId && !state.getItem ('arenaBattleChainId', 0) === tR.userId) {
					return true;
				}

				switch ('Duel') {
				case 'Invade' :
					tR.score = tR.arenaRankNum - (tR.armyNum / levelMultiplier / caap.stats.army.capped);
					break;
				case 'Duel' :
					tR.score = tR.arenaRankNum * Math.min((caap.stats.bonus.api / tR.levelNum / 10 * 100).dp(1), 100) - tR.armyNum / 5000;
					break;
				default :
					tR.score = tR.arenaRankNum - (tR.armyNum / levelMultiplier / caap.stats.army.capped);
				}

				tR.targetNumber = index + 1;
				safeTargets.push(tR);
				tempRecord = null;
				con.log(2, 'Arena ' + tR.nameStr + ' level ' +  tR.levelNum + ' rank ' + tR.rankStr + ' ' + tR.arenaRankNum + ' ' + tR.userId + ' army ' + tR.armyNum + ' mult ' + levelMultiplier.dp(2) + ' score ' + tR.score.dp(2), tR);
			});

			if (safeTargets.length == 0) {
				con.log (1, "No valid targets right now, try again in two minutes");
				schedule.setItem('arenaTimer', 2 * 60);
				return false;
			}
			
			safeTargets.sort($u.sortBy(true, "score"));
			tR = safeTargets[0];

			con.log(2, 'Found Target #' + tR.targetNumber + ' ' + tR.nameStr + ' level ' +  tR.levelNum + ' Rank ' + tR.arenaRankNum + ' army ' + tR.armyNum + ' Score: ' + tR.score.dp(2), tR, safeTargets);

			arena.target = tR;
			caap.click(tR.button);

			delete tR.score;
			delete tR.targetNumber;
			delete tR.button;
			battleRecord = battle.getItem(tR.userId);
			if (battleRecord.newRecord) {
				state.setItem("lastArenaBattleID", tR.userId);
				$j.extend(true, battleRecord, tR);
				battleRecord.newRecord = false;
			} else {
				for (itx in tR) {
					if (tR.hasOwnProperty(itx)) {
						if (!$u.hasContent(battleRecord[itx] && $u.hasContent(tR[itx]))) {
							battleRecord[itx] = tR[itx];
						}

						if ($u.hasContent(tR[itx]) && $u.isString(tR[itx]) && battleRecord[itx] !== tR[itx]) {
							battleRecord[itx] = tR[itx];
						}

						if ($u.hasContent(tR[itx]) && $u.isNumber(tR[itx]) && battleRecord[itx] < tR[itx]) {
							battleRecord[itx] = tR[itx];
						}
					}
				}
			}
			battleRecord.aliveTime = Date.now();

			battle.setItem(battleRecord);
			caap.setDivContent('battle_mess', 'Arena: Attacked ' + tR.nameStr + ' level ' +  tR.levelNum);
			state.setItem("notSafeCount", 0);
			return true;
        } catch (err) {
            con.error("ERROR in arena.battle: " + err.stack);
            return false;
        }
    }
};
