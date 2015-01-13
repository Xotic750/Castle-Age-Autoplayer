/////////////////////////////7///////////////////////////////////////
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
        arenaBlackListInstructions = "List of ID to not figth.",
		revengeInstructions = "Put a number here to attack targets that you have beaten from your Battle Feed. This will take priority over searching for targets on the Arena Page, and will only attack targets that give at least this number. For instance, if you only wanted to attack opponents that give 100 points, put 100 here.",

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
        htmlCode += caap.makeNumberFormTR("Revenge point limit", 'arenaRevengePoints', revengeInstructions, '', '', '', true, false);
        htmlCode += caap.makeCheckTR('Use FP to burn Health', 'burnHealthArena', false, '');
        htmlCode += caap.makeTD("List of ID to not figth:");
        htmlCode += caap.makeTextBox('arena_blacklist', arenaBlackListInstructions, '', '');
        htmlCode += caap.makeTD("<input type='button' id='caap_ArenaNow' value='Fight!' style='padding: 0; font-size: 10px; height: 18px' />");
        htmlCode += caap.endToggle;
        return htmlCode;
    },
	
    target: false,
	
	checkBurnHealth: function () {
		try {
			if (config.getItem("burnHealthArena",false)) {
				var arenaHealth = $j("div img[src*='graphics/orange_healthbar.jpg']"), arenaHealthWidth = "";
				arenaHealthWidth=/width:\d+/i.exec(arenaHealth[0].outerHTML)[0];
				if (!arenaHealthWidth.match("width:0")) {
					var arenaTokens = $j("span[id*='guild_token_current_value']")[0].innerHTML;
					con.log (1, "Have Arena Health");
					arena.flagBurnHealth=true;
					if (arenaTokens < 1 ) {
						try {
							var button = $j("input[src*='arenablood_btn_refill.jpg']");
							con.log (1, "Refill to burn Arena Health");						
							session.setItem('ReleaseControl', true);
							arena.flagResult = false;
							caap.setDomWaiting("arena.php");
							caap.click(button);
							return true;
						} catch (err) {
							con.error("ERROR in arena.click: " + err);
							return false;
						}
					}
				} else {
					con.log (1, "Have no more Arena Health");
					arena.flagBurnHealth=false;
				}					
			} else {
				arena.flagBurnHealth=false;
			}
			return true;
		} catch (err) {
			con.error("ERROR in arena.checkBurnHealth: " + err);
			return false;
		}
	},
	
    checkResults: function () {
        try {
            var bR = false, //battle record
                tempTime     = 0,
                arenaTokens = $j("span[id*='guild_token_current_value']")[0].innerHTML,
				resultText 	= $j('#results_main_wrapper').text().trim().innerTrim(),
				resultsDiv = $j("#app_body div[style*='arena_arena_bg.jpg']");
				tempDiv = $j("#app_body img[src*='orange_healthbar.jpg']"),
                tempText      = '',
                tNum          = 0,
                result        = {
                    battleType : '',
                    points     : 0,
                    gold       : 0,
                    win        : false,
                    unknown    : false
                };
                
            state.setItem("arenaTokens", arenaTokens);
			
            if (arenaTokens >= config.getItem("arenaTokenStart", 10)) {
                con.log (2, "Arena Timer resetting");
                schedule.setItem('arenaTimer', 0);
            }
            
			session.setItem('arenaHealth', tempDiv.length ? tempDiv.parent().text().trim().regex(/(\d+)\/\d+/) : 0);

            if (arena.target) {
				con.log(2, "Checking Battle Results");
				bR = arena.target;
				arena.target = false;

				if (resultText.length) {
					tempText = resultText.regex(/Your opponent is too (high|low) level for you to engage in an arena battle with!/);
					if (tempText) {
						tempText = 'arenaLevel' + (tempText == 'low' ? 'Min' : 'Max');
						tNum = Math.abs(bR.levelNum - caap.stats.level);
						$j('#caap_' + tempText).val(tNum);
						config.setItem(tempText, tNum);
						con.log(1, 'Arena: reset ' + (tempText == 'low' ? 'min' : 'max') + ' level to ' + tNum + ', so avoiding targets ' + (tempText == 'low' ? 'under' : 'over') + ' '+ (caap.stats.level + tNum), tempText, tNum);
						bR.arenaInvalid = true;
						battle.setItem(bR);
						return false;
					} else if (resultText.regex(/Out Of Health/)) {
						con.log(1, 'Arena target ' + bR.nameStr + ' is hiding', bR);
						bR.arenaDeadTime = Date.now();
						battle.setItem(bR);
						return false;
					} else if (resultText.regex(/Out Of Tokens/)) {
						con.log(1, 'Unable to hit ' + bR.nameStr + ' because out of tokens', bR);
						return false;
					} else {
						con.warn('Arena unknown message: ' + resultText);
					}
				}
            } 
			
			tempDiv = $j("form[onsubmit*='arena.php']", resultsDiv).has("input[src*='battle_duel_again.gif']")
			bR = tempDiv.length ? battle.getItem($j(tempDiv).find("input[name='target_id']").attr('value')) : bR;
			if (!bR) {
				con.log(2, 'No duel again button and no previous target, so not processing for win/loss', bR);
				if (arena.checkBurnHealth()) { 
					con.log (1, "arenaTokens",arenaTokens);
				}
				return;
			}
			con.log(2, 'Attacked ' + bR.nameStr, bR);

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
				result.points = caap.regexDiv(resultsDiv, /You have .* \+?(\d+) Arena Points/);
				if (!$u.hasContent(result.points)) {
					con.warn("Unable to match arena points", tempText);
				}
				result.gold = result.win == true ? 100000 : - 100000;   
                    
            } else {
                con.warn("Unable to determine battle type");
                throw "Unable to determine battle type!";
            }
            bR.attackTime = Date.now();
			bR.arenaTotal += result.points;

            if (result.unknown === true) {
				bR.arenaDeadTime = Date.now();
            } else {
				bR[result.win ? 'statswinsNum' : 'statslossesNum'] += 1;
				bR[result.win ? 'duelwinsNum' : 'duellossesNum'] += 1;
				bR.arenaTotal += (result.win ? 1 : -1) * result.points
				if (result.win) {
					con.log(1, "We Defeated " + bR.nameStr + " Battle Points: " + result.points, result, bR);
					arena.target = bR;
					bR.arenaPoints = result.points;
					session.setItem('ReleaseControl', false);
				} else {
					con.log(1, "We Were Defeated By " + bR.nameStr, result, bR);
                    bR.duelLostTime = Date.now();
					bR.chainCount = 0;
					bR.chainTime = 0;
				}
			}
            battle.setItem(bR);

			if (arena.checkBurnHealth()) { 
				con.log (1, "arenaTokens",arenaTokens);
			}
            return true;
        } catch (err) {
            con.error("ERROR in arena.checkResults: " + err.stack);
            return false;
        }
    },

    battle: function () {
		try {
			var useGeneral = 'DuelGeneral',
				tempDiv = $j(),
				revengeThreshold = config.getItem('arenaRevengePoints', ''),
				arenaPageTf = session.getItem('page', '') == 'arena',
				arenaTokens = arenaPageTf ? $j("span[id*='guild_token_current_value']")[0].innerHTML : state.getItem("arenaTokens", arenaTokens),
				inputDiv = arenaPageTf ? $j("div[style*='arena_infobar']") : $j(),
				bR      = {},
				safeTargets       = [],
				winner = false,
				v = {
					arenaLevelMax : 99999,
					arenaLevelMin : 99999,
					arenaRankMax : 8,
					arenaRankMin : 0,
					arenaArmyMax : 999999
				};
			
			if (!config.getItem('enableArena', false) || !schedule.check('arenaTimer')) {
				return false;
			}

			session.setItem('ReleaseControl', true);
			state.setItem("arenaTokens", arenaTokens);
			
			// If 0 health, stop
			if (arenaPageTf && session.getItem('arenaHealth', 0) === 0 && arenaTokens < 9) {
				schedule.setItem('arenaTimer', 5 * 60);
				return false;
			}
			
			// If can chain, chain!
			tempDiv = arenaPageTf ? $j("input[src*='battle_duel_again.gif']:first") : [];
			if (arena.target && tempDiv.length && arenaTokens > 0 && caap.ifClick(tempDiv)) {
				caap.setDivContent('battle_mess', 'Arena: Chain Attacked ' + arena.target.nameStr + ' level ' +  arena.target.levelNum, '', false,1);
				return true;
			}

			// Next try revenge hits
			if ($u.isNumber(revengeThreshold)) { // Add in index visit here?
				tR = battle.records.reduce( function(prev, bR) {
					return bR.arenaRevenge && !bR.duellossesNum && bR.arenaPoints > prev.arenaPoints && schedule.since(bR.arenaDeadTime, 5 * 60)
						? bR : prev;
				}, new battle.record().data);
				if (tR.arenaPoints >= revengeThreshold) {
					if (arenaTokens > 0) { 
						if (caap.navigate2('@' + useGeneral + ",index")) {
							return true;
						}
						tempDiv = $j("#app_body #newsFeedSection form[onsubmit*='arena.php']").has("input[value='" + tR.userId + "']").find("input[src*='news_btn_revenge.gif']");
						if (caap.ifClick(tempDiv)) {
							arena.target = tR;
							caap.setDivContent('battle_mess', 'Arena: Revenge attacked ' + tR.nameStr + ' level ' +  tR.levelNum, '', false, 1);
							return true;
						} else {
							con.warn('Arena: unable to click on revenge button in news feed', tR);
						}
					} else {
						state.setItem("arenaTokens", 1)
						schedule.setItem('arenaTimer', 5 * 60);
						return false;
					}
				}
			}

			// Ok, try the normal feed
			if (caap.navigate2('@' +  useGeneral + ',arena')) {
				return true;
			}

			if (arenaTokens <= config.getItem("arenaTokenStop", 1) ) {
				schedule.setItem('arenaTimer', Math.max (config.getItem("arenaTokenStart", 1) - arenaTokens, 1) * 5 * 60);
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
					tR = {}; // temp record
				
				// regexDiv broken into two parts because double-byte char names can cause regex match to fail
				caap.regexDiv(thisDiv, /(.*) level: \d+ .+ \(Rank \d\) \d+/, tR, 'nameStr');
				caap.regexDiv(thisDiv, /level: (\d+) (.+) \(Rank (\d)\) (\d+)/, tR,
					['levelNum', 'rankStr', 'arenaRankNum', 'armyNum']);
				tR.userId = $j("input[name*='target_id']", inputDiv[index].children[4].children[0].children[0])[0].value;
				try {
					con.log(2, tR.nameStr + " (" + tR.userId + ") is looking in black listed !");
					for (p = 0, len = blackList.length; p < len; p += 1) {
						if (tR.userId.trim().toLowerCase().match(new RegExp((" "+blackList[p]+" ").trim().toLowerCase()))) { 
							con.log(2, tR.nameStr + " (" + tR.userId + ") is black listed !");
							return true;
						}
						if (tR.nameStr.trim().toLowerCase().match(new RegExp((" "+blackList[p]+" ").trim().toLowerCase()))) { 
							con.log(2, tR.nameStr + " (" + tR.userId + ") is black listed !");
							return true;
						}
					}
				} catch (e) {
					con.log(2, "Error in arena black listed search : ",e);
				}

				tR.button = $j("input[src*='arena_invade_btn']", thisDiv);
				bR = battle.getItem(tR.userId);
	//          switch (config.getItem("ArenaBattleType", 'Invade')) {
				switch ('Duel') {
				case 'Invade' :
					tempTime = $u.setContent(bR.invadeLostTime, 0);
					tR.button = $j("input[src*='arena_invade_btn']", thisDiv);
					break;
				case 'Duel' :
					tempTime = $u.setContent(bR.duelLostTime, 0);
					tR.button = $j("input[src*='arena_duel_btn']", thisDiv);
					break;
				default :
					con.warn("Battle type unknown!", config.getItem("ArenaBattleType", 'Invade'));
				}
				
				if (!$u.isDefined(tR.button)) {
					con.warn("No target button", tR);
					return true;
				}
				
				if (bR.arenaInvalid) {
					con.log(1, "Level of this cannot be hit", tR);
					return true;
				}

				if (!schedule.since(bR.arenaDeadTime, 5 * 60)) {
					con.log(1, tR.nameStr + " is hiding ", tR);
					return true;
				}

				if (bR && !bR.newRecord && tempTime && !schedule.since(tempTime, 3 * 7 * 24 * 3600)) {
					con.log(1, "We lost " +'Duel' + " to this id within three weeks: ", tR.userId);
					return true;
				}

				winner = bR.duelwinsNum > 0 && bR.duellossesNum == 0;
				
				if (!winner) {
					if (tR.levelNum > caap.stats.level + v.arenaLevelMax) {
						con.log(2, "Target level " + tR.levelNum + " exceeds max level of " + (caap.stats.level + v.arenaLevelMax), tR);
						return true;
					}

					if (tR.arenaRankNum > v.arenaRankMax) {
						con.log(2, "Rank of " + tR.arenaRankNum + " over max rank " + v.arenaRankMax, tR);
						return true;
					}

					if (v.arenaArmyMax < tR.armyNum) {
						con.log(2, "Army of " + tR.armyNum + " is over max of " + v.arenaArmyMax, tR);
						return true;
					}
				}

				if (tR.levelNum < caap.stats.level - v.arenaLevelMin) {
					con.log(2, "Target level " + tR.levelNum + " below min level of " + (caap.stats.level - v.arenaLevelMin), tR);
					return true;
				}

				if (tR.arenaRankNum < v.arenaRankMin) {
					con.log(2, "Rank of " + tR.arenaRankNum + " under min rank " + v.arenaRankMin, tR);
					return true;
				}
				
				switch ('Duel') {
				case 'Invade' :
					tR.score = tR.arenaRankNum - (tR.armyNum / caap.stats.army.capped);
					break;
				case 'Duel' :
					tR.score = winner ? 100 : Math.min((caap.stats.bonus.api / tR.levelNum / 10 * 100).dp(1), 100);
					tR.score = tR.arenaRankNum * tR.score - tR.armyNum / 5000;
					break;
				default :
					tR.score = tR.arenaRankNum - (tR.armyNum / caap.stats.army.capped);
				}

				tR.targetNumber = index + 1;
				safeTargets.push(tR);
				tempRecord = null;
				con.log(2, 'Arena ' + (winner ? ' Winner! ' : '' )+ (tR.nameStr || 'unknown') + ' level ' +  tR.levelNum + ' rank ' + tR.rankStr + ' ' + tR.arenaRankNum + ' ' + tR.userId + ' army ' + tR.armyNum + ' score ' + tR.score.dp(2), tR);
			});

			if (safeTargets.length == 0) {
				con.log (1, "No valid targets right now, try again in two minutes");
				schedule.setItem('arenaTimer', 2 * 60);
				return false;
			}
			
			safeTargets.sort($u.sortBy(true, "score"));
			tR = safeTargets[0];

			caap.click(tR.button);
			con.log(2, 'Found Target #' + tR.targetNumber + ' ' + (tR.nameStr || 'unknown') + ' level ' +  tR.levelNum + ' Rank ' + tR.arenaRankNum + ' army ' + tR.armyNum + ' Score: ' + tR.score.dp(2), tR, safeTargets);

			delete tR.score;
			delete tR.targetNumber;
			delete tR.button;
			bR = battle.getItem(tR.userId);
			$j.extend(true, bR, tR);
			bR.newRecord = false;
			bR.aliveTime = Date.now();
			battle.setItem(bR);

			caap.setDivContent('battle_mess', 'Arena: Attacked ' + (tR.nameStr || 'unknown') + ' level ' +  tR.levelNum);
			state.setItem("notSafeCount", 0);
			arena.target = bR;
			return true;
        } catch (err) {
            con.error("ERROR in arena.battle: " + err.stack);
            return false;
        }
    },
	
    revengeCheck: function () {
		try {
			var infoDiv = $j("#app_body #newsFeedSection div[style*='news_innercontainer_top.gif']:contains('Victory')").has("img[src$='arena_battlepoints.gif']"),
			tempDiv = $j();
			
			con.log(1, 'Index arena revenges ' + infoDiv.length);
			
			battle.records.forEach( function(tR) {
				tR.arenaRevenge = false;
			});
			
			infoDiv.each(function (index) {
				tR = battle.getItem($j(this).find("input[name='target_id']").attr('value'));
				if (!tR) {
					con.warn('Arena: unable to find userID or battle record',tR, index);
					return;
				}
				tempDiv = $j("#app_body #newsFeedSection div[id^='battle_messages_" + tR.userId + "']:contains('Arena Battle Points')");
				tR.arenaPoints = tR.arenaPoints ? tR.arenaPoints : caap.regexDiv(tempDiv, /You have won (\d+) Arena Battle Points!/);
				tR.arenaRevenge = true;
				tR.duelwinsNum = tR.duelwinsNum ? tR.duelwinsNum : caap.regexDiv($j(infoDiv[index]).next(), /You won (\d+) times/) || 1;
				battle.setItem(tR);
				con.log(2, 'Arena victory in feed against ' + tR.nameStr + '. Last points: ' + tR.arenaPoints, tR);
			});
			return;
        } catch (err) {
            con.error("ERROR in arenaRevengeCheck: " + err.stack);
            return false;
        }
    }
	
};
