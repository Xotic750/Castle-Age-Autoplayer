/////////////////////////////////////////////////////////////////////
//                          ARENA OBJECT
// this is the main object for dealing with Arena IX
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    arena.menu = function () {
        var typeList = [
            'Invade',
            'Duel'
        ],
        typeInst = [
            'Battle using Invade button',
            'Battle using Duel button'
        ],
        MaxLevelInstructions = "This sets the highest relative level, above yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent above level 120, you would code 20.",
        MinLevelInstructions = "This sets the lowest relative level, below yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent below level 60, you would code 40.",
        arenaBlackListInstructions = "List of ID to not figth.",
		revengeInstructions = "Put a number here to attack targets that you have beaten from your Battle Feed. This will take priority over searching for targets on the Arena Page, and will only attack targets that give at least this number. For instance, if you only wanted to attack opponents that give 100 points, put 100 here.",

        htmlCode = caap.startToggle('Arena', 'ARENA');
        htmlCode += caap.makeCheckTR('Enable Arena Battles', 'enableArena', false, '');
		htmlCode += caap.display.start('enableArena');
//        htmlCode += caap.makeDropDownTR("Battle Type", 'ArenaBattleType', typeList, typeInst, '', '', false, false, 62);
        htmlCode += caap.makeNumberFormTR("Start At Or Above", 'arenaTokenStart', '', 10, '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'arenaTokenStop', '', 0, '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Army Max", 'arenaArmyMax', '', 501, '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Rank Min", 'arenaRankMin', '', '', '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Rank Max", 'arenaRankMax', '', '', '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Level Min", 'arenaLevelMin', MinLevelInstructions, '', '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Opponent's Level Max", 'arenaLevelMax', MaxLevelInstructions, '', '', '', true, false);
        htmlCode += caap.makeNumberFormTR("Revenge point limit", 'arenaRevengePoints', revengeInstructions, '', '', '', true, false);
        htmlCode += caap.makeTD("List of ID to not fight:");
        htmlCode += caap.makeTextBox('arena_blacklist', arenaBlackListInstructions, '', '');
        htmlCode += caap.makeCheckTR('Use FP to burn Health', 'burnHealthArena', false, '');
//      htmlCode += caap.makeCheckTR('Arena Recon', 'arenaRecon', false, '');
//		htmlCode += caap.makeTD("Hit List");
//		htmlCode += caap.makeTextBox('arenaHitList', 'List of targets to hit','', '');
        htmlCode += caap.makeTD("<input type='button' id='caap_ArenaNow' value='Fight!' style='padding: 0; font-size: 10px; height: 18px' />");
		htmlCode += caap.display.end('enableArena');
        htmlCode += caap.endToggle;
        return htmlCode;
    };
	
    arena.fT = false; // Feed target. Pass from results to battle.
	arena.cT = false; // Chain target. Pass from results to battle.
	arena.tR = false; // Target record. Used to pass from battle to results
	
	arena.importRecords = function(JSONList) {
		var total = 0,
			list = JSON.parse(JSONList);
			
		con.log(1, 'Import LIST', JSONList, list);
		list.forEach( function(item) {
			con.log(2, 'Item', battle.getItem(item.userId));
			if (battle.getItem(item.userId).newRecord) {
				item.duelwinsNum = 1;
				item.duellossesNum = 0;
				item.arenaTotal = 0;
				battle.setItem(item);
				total += 1;
			}
		});
		con.log(1, 'Import total: ' + total + ' out of ' + list.length);
	};
	
	arena.exportRecords = function(min) {
		var exportR = battle.records.filter( function(bR) {
			return !bR.arenaInvalid && (bR.duelwinsNum ? bR.duelwinsNum / (bR.duelwinsNum + bR.duellossesNum) * bR.arenaPoints : -1) > $u.setContent(min, 90);
		});
		con.log(1, 'EXPORT list', exportR, JSON.stringify(exportR));
		return exportR;
	};
	
	arena.checkBurnHealth = function () {
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
	};
	
    arena.checkResults = function () {
        try {
            var bR = false, //battle record
                tempTime     = 0,
                arenaTokens = $j("span[id*='guild_token_current_value']")[0].innerHTML,
				resultText 	= $j('#results_main_wrapper').text().trim().innerTrim(),
				resultsDiv = $j("#app_body div[style*='arena_arena_bg.jpg']"),
				inputDiv = $j("div[style*='arena_infobar']"),
				tempDiv = $j("#app_body img[src*='orange_healthbar.jpg']"),
                tempText      = '',
				safeTargets       = [],
				winner = false,
                tNum          = 0,
				score = 0,
                result        = {
                    battleType : '',
                    points     : 0,
                    gold       : 0,
                    win        : false,
                    unknown    : false
                },
				v = {
					arenaLevelMax : 99999,
					arenaLevelMin : 99999,
					arenaRankMax : 8,
					arenaRankMin : 0,
					arenaArmyMax : 999999
				};
                
			if (!config.getItem('enableArena', false)) {
				return false;
			}

            state.setItem("arenaTokens", arenaTokens);
			arena.cT = false;
			arena.fT = false;

            if (arenaTokens >= config.getItem("arenaTokenStart", 10)) {
                con.log (2, "Arena Timer resetting");
                schedule.setItem('arenaTimer', 0);
            }
            
			session.setItem('arenaHealth', tempDiv.length ? tempDiv.parent().text().trim().regex(/(\d+)\/\d+/) : 0);

            if (arena.tR) {
				con.log(2, "Checking Battle Results");
				bR = arena.tR;

				if (resultText.length) {
					tempText = resultText.regex(/Your opponent is too (high|low) level for you to engage in an arena battle with!/);
					if (tempText) {
						tempText = 'arenaLevel' + (tempText == 'low' ? 'Min' : 'Max');
						tNum = Math.abs(bR.levelNum - stats.level);
						$j('#caap_' + tempText).val(tNum);
						config.setItem(tempText, tNum);
						con.log(1, 'Arena: reset ' + (tempText == 'low' ? 'min' : 'max') + ' level to ' + tNum + ', so avoiding targets ' + (tempText == 'low' ? 'under' : 'over') + ' '+ (stats.level + tNum), tempText, tNum);
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
			if (tempDiv.length) {
				bR = battle.getItem($j(tempDiv).find("input[name='target_id']").attr('value'));
				con.log(2, 'Attacked ' + bR.nameStr, bR);
				bR.nameStr = bR.nameStr || $j("div:contains(' fought with:')", resultsDiv).last().text().trim().innerTrim().replace(' fought with:','');

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
					result.points = caap.bulkRegex(resultsDiv, /You have .* \+?(\d+) Arena Points/);
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
						session.setItem('arenaChainId', bR.userId);
						session.setItem('ReleaseControl', false);
						bR.arenaPoints = result.points;
						arena.cT = session.getItem('arenaWait', false) ? false : bR;
					} else {
						con.log(1, "We Were Defeated By " + bR.nameStr, result, bR);
						bR.duelLostTime = Date.now();
						bR.chainCount = 0;
						bR.chainTime = 0;
					}
				}
				battle.setItem(bR);
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
					fR = {}; // feed record
				
				// bulkRegex broken into two parts because double-byte char names can cause regex match to fail
				caap.bulkRegex(thisDiv, /(.*) level: \d+ .+ \(Rank \d\) \d+/, fR, 'nameStr');
				caap.bulkRegex(thisDiv, /level: (\d+) (.+) \(Rank (\d)\) (\d+)/, fR,
					['levelNum', 'rankStr', 'arenaRankNum', 'armyNum']);

				fR.userId = $j("input[name*='target_id']", inputDiv[index].children[4].children[0].children[0])[0].value;
				try {
					var blackList = config.getList('arena_blacklist', '');
					con.log(2, fR.nameStr + " (" + fR.userId + ") is looking in black listed !");
					for (p = 0, len = blackList.length; p < len; p += 1) {
						if (fR.userId.trim().toLowerCase().match(new RegExp((" "+blackList[p]+" ").trim().toLowerCase()))) { 
							con.log(2, fR.nameStr + " (" + fR.userId + ") is black listed !");
							return true;
						}
						if (fR.nameStr.trim().toLowerCase().match(new RegExp((" "+blackList[p]+" ").trim().toLowerCase()))) { 
							con.log(2, fR.nameStr + " (" + fR.userId + ") is black listed !");
							return true;
						}
					}
				} catch (e) {
					con.log(2, "Error in arena black listed search : ",e);
				}

				bR = battle.getItem(fR.userId);
				if (config.getItem('arenaRecon', false) && !bR.duellossesNum && !bR.duelwinsNum
					&& fR.levelNum <= config.getItem('arenaReconLevelMax',1400)
					&& fR.arenaRankNum >= config.getItem('arenaReconRankMin',1)
					&& fR.arenaRankNum <= config.getItem('arenaReconRankMax',7) ) {
					battle.setItem(fR, 'recon'); 
				}
				
				if (bR.arenaInvalid) {
					con.log(1, "Level of this cannot be hit", fR);
					return true;
				}

				if (!schedule.since(bR.arenaDeadTime, 5 * 60)) {
					con.log(1, fR.nameStr + " is hiding ", fR);
					return true;
				}

				if (bR && !bR.newRecord && !schedule.since(bR.duelLostTime, 3 * 7 * 24 * 3600)) {
					con.log(1, "We lost " +'Duel' + " to this id within three weeks: ", fR.userId);
					return true;
				}

				winner = bR.duelwinsNum && !bR.duellossesNum;
				
				if (!winner) {
					if (fR.levelNum > stats.level + v.arenaLevelMax) {
						con.log(2, "Target level " + fR.levelNum + " exceeds max level of " + (stats.level + v.arenaLevelMax), fR);
						return true;
					}

					if (fR.arenaRankNum > v.arenaRankMax) {
						con.log(2, "Rank of " + fR.arenaRankNum + " over max rank " + v.arenaRankMax, fR);
						return true;
					}

					if (v.arenaArmyMax < fR.armyNum) {
						con.log(2, "Army of " + fR.armyNum + " is over max of " + v.arenaArmyMax, fR);
						return true;
					}
				}

				if (fR.levelNum < stats.level - v.arenaLevelMin) {
					con.log(2, "Target level " + fR.levelNum + " below min level of " + (stats.level - v.arenaLevelMin), fR);
					return true;
				}

				if (fR.arenaRankNum < v.arenaRankMin) {
					con.log(2, "Rank of " + fR.arenaRankNum + " under min rank " + v.arenaRankMin, fR);
					return true;
				}
				
				switch ('Duel') {
				case 'Invade' :
					tNum = fR.arenaRankNum - (fR.armyNum / stats.army.capped);
					break;
				case 'Duel' :
					tNum = winner ? 100 : Math.min((stats.bonus.api / fR.levelNum / 10 * 100).dp(1), 100);
					tNum = fR.arenaRankNum * tNum - fR.armyNum / 5000;
					break;
				default :
					tNum = fR.arenaRankNum - (fR.armyNum / stats.army.capped);
				}
				if (tNum > score) {
					score = tNum;
					arena.fT = fR;
				}
				con.log(2, 'Arena ' + (winner ? ' Winner! ' : '' )+ (fR.nameStr || 'unknown') + ' level ' +  fR.levelNum + ' rank ' + fR.rankStr + ' ' + fR.arenaRankNum + ' ' + fR.userId + ' army ' + fR.armyNum + ' score ' + tNum.dp(2), fR);

			});

            return true;
        } catch (err) {
            con.error("ERROR in arena.checkResults: " + err.stack);
            return false;
        }
    };

	arena.exportTf = false;
	
    arena.battle = function () {
		try {
			var useGeneral = 'DuelGeneral',
				tempDiv = $j(),
				tempTxt = '',
				hitList = '',
				tR = false,
				revengeThreshold = config.getItem('arenaRevengePoints', ''),
				arenaPageTf = session.getItem('page', '') == 'arena',
				arenaTokens = arenaPageTf ? $j("span[id*='guild_token_current_value']")[0].innerHTML : state.getItem("arenaTokens", 10),
				inputDiv = arenaPageTf ? $j("div[style*='arena_infobar']") : $j(),
				timer = arenaPageTf ? caap.bulkRegex($j("#arena_health_bar_hover"), /(\d+)m until recharge/) : 0,
				pastWins = true,
				recon = config.getItem('arenaRecon', false) ? 1 * 60 : 24 * 3600,
				randomNum = Math.random() * 100,
				valid = function(iR) {
					return !iR.arenaInvalid && schedule.since(iR.arenaDeadTime, 3 * 60);
				},
				points = function (pR) {
					return pR.duelwinsNum ? pR.duelwinsNum / (pR.duelwinsNum + pR.duellossesNum) * pR.arenaPoints : -1;
				};

			if (arena.exportTf) {
				arena.exportRecords(80);
				arena.exportTf = false;
			}
			
			session.setItem('arenaWait', false);
			session.setItem('ReleaseControl', true);
			arena.tR = false;
			if (!config.getItem('enableArena', false) || !schedule.check('arenaTimer')) {
				return false;
			}

			if (schedule.check("pageIndex")) {
				con.log(1, 'Guild Battle: navigating to Index to check on battles');
				if (caap.navigateTo('index')) {
					return true;
				}
				return caap.navigateTo('keep');
			}
			
			session.setItem('ReleaseControl', true);
			state.setItem("arenaTokens", arenaTokens);

			if (arenaPageTf && arena.checkBurnHealth()) { 
				con.log (1, "arenaTokens",arenaTokens);
				return true;
			} else if (arenaPageTf && session.getItem('arenaHealth', 0) === 0 && arenaTokens < 10 - timer / 5) {
				// If 0 health, stop
				schedule.setItem('arenaTimer', Math.min(Math.min((10 - arenaTokens) * 5, timer + 0.5) * 60, recon));
				session.setItem('arenaHit', '');
				return false;
			}
			
			// #1 If can chain, chain!
			tempDiv = arenaPageTf ? $j("input[src*='battle_duel_again.gif']:first") : [];
			if (arena.cT && tempDiv.length && arenaTokens > 0 && caap.ifClick(tempDiv)) {
				caap.setDivContent('battle_mess', 'Arena: Chain Attacked ' + arena.cT.nameStr + ' level ' +  arena.cT.levelNum, '', false, 1);
				arena.tR = arena.cT;
				return true;
			}
/*
			// #2 Assigned targets to hit!
			hitList = config.getList('arenaHitList', []);
			if (hitList.length && session.getItem('arenaHit', '') !== 'none') {
				hitList.some( function(hs) { // hitString
					hs = (session.getItem('arenaHit', '') || hs).trim();
					var randomNg =  session.getItem('arenaHit', '') ? false : randomNum > (hs.regex(/:(\d+)%/) || 100);
					tR = battle.getItem(hs.regex(/^(\d+)/));
					tempTxt = hs.regex(/@([\w ]+)/);
					if (!tR || !valid(tR) || randomNg || (tempTxt && !general.getStat(tempTxt, 'name'))) {
						if (tR && !schedule.since(tR.arenaDeadTime, 3 * 60) && hs.regex(/(:stalk)/)) {
							con.log(1, "Full spend target " + tR.name + " not dead, just sleeping", hs, tR);
							session.setItem('arenaWait', true);
						} else {
							con.warn('Passing on hitting ' + hs, !valid(tR), randomNg, tempTxt);
						}
						randomNum -= hs.regex(/:(\d+)%/) || 100;
						session.setItem('arenaHit', '');
						tR = false;
						return false;
					}
					session.setItem('arenaHit', hs);
					useGeneral = tempTxt || useGeneral;
					return true;
				});
				if (tR) {
					con.log(1, 'Using hitList target', useGeneral);
					if (arenaPageTf) {
						$j("input[name*='target_id']", inputDiv[0])[0].value = tR.userId;
						session.setItem('ReleaseControl', false);
					}
				} else if (session.getItem('arenaWait', false)) {
					if (arenaTokens < 9) {
						schedule.setItem('arenaTimer', 3 * 60);
						return false;
					}
				} else {
					session.setItem('arenaHit', 'none');
				}
			}
*/
			// #3 Next try revenge hits
			if (!tR && $u.isNumber(revengeThreshold)) { // Add in index visit here?
				tR = battle.records.reduce( function(prev, cR) {
					return cR.arenaRevenge && !cR.duellossesNum && cR.arenaPoints > prev.arenaPoints && valid(cR) ? cR : prev;
				}, new battle.record().data);
				if (tR.arenaPoints > revengeThreshold) {
					if (arenaTokens > 0) { 
						if (caap.navigate2('@' + useGeneral + ",index")) {
							return true;
						}
						tempDiv = $j("#app_body #newsFeedSection form[onsubmit*='arena.php']").has("input[value='" + tR.userId + "']").find("input[src*='news_btn_revenge.gif']");
						if (caap.ifClick(tempDiv)) {
							caap.setDivContent('battle_mess', 'Arena: Revenge attacked ' + tR.nameStr + ' level ' +  tR.levelNum, '', false, 1);
							arena.tR = tR;
							return true;
						} else {
							con.warn('Arena: unable to click on revenge button in news feed', tR);
						}
					} else {
						state.setItem("arenaTokens", 1)
						schedule.setItem('arenaTimer', Math.min(5 * 60, recon));
						return false;
					}
				} else {
					tR = false;
				}
			} //$u.makeTime(fR.nextTopReview + 5 * 60 * 1000, caap.timeStr(true))

			if (caap.navigate2('@' +  useGeneral + ',arena')) {
				return true;
			}

			if (arenaTokens <= config.getItem("arenaTokenStop", 1) ) {
				schedule.setItem('arenaTimer', Math.min(Math.max (config.getItem("arenaTokenStart", 1) - arenaTokens, 1) * 5 * 60, recon));
				session.setItem('arenaHit', '');
				return false;
			}
/*			
			// #4 Next try past wins
			if (!tR && true) { 
				tR = battle.records.reduce( function(prev, cR) {
					
					if (cR.arenaPoints > 100 && cR.arenaRankNum == 1) {
						cR.arenaPoints = 80;
						battle.setItem(cR);
					} else if (cR.duelwinsNum && !cR.duellossesNum && cR.arenaRankNum > config.getItem('arenaRankMin',0) && !cR.arenaPoints) {
						cR.arenaPoints = 100 + cR.arenaRankNum.numberOnly();
						battle.setItem(cR);
					} else if ((cR.duellossesNum || !cR.duelwinsNum) && cR.arenaPoints > 100) {
						cR.arenaPoints = 0;
						battle.setItem(cR);
					}
					return valid(cR) && (points(cR) > points(prev) || (points(cR) ==  points(prev) && cR.attackTime < prev.attackTime))
						&& schedule.since(cR.attackTime, 6 * 3600)? cR : prev;
				}, new battle.record().data);

				if (tR.arenaPoints) {
					con.log(1, 'Using previous target');
					$j("input[name*='target_id']", inputDiv[0])[0].value = tR.userId;
				} else {
					tR = false;
				}
			}
*/			
			// #5 Ok, try the normal feed
			tR = tR || arena.fT;

			if (!tR) {
				con.log (1, "No valid targets right now, try again in two minutes");
				schedule.setItem('arenaTimer', Math.min(2 * 60, recon));
				return false;
			}
			
			caap.click($j("#app_body form[onsubmit*='arena.php']").has("input[value='" + tR.userId + "']").find("input[src*='arena_duel_btn']"));
			con.log(2, 'Found Target ' + (tR.nameStr || 'unknown') + ' level ' +  tR.levelNum + ' Rank ' + tR.arenaRankNum + ' army ' + tR.armyNum, tR);

			tR = $j.extend(true, battle.getItem(tR.userId), tR);
			tR.newRecord = false;
			tR.aliveTime = Date.now();
			battle.setItem(tR);
			arena.tR = tR;

			caap.setDivContent('battle_mess', 'Arena: Attacked ' + (tR.nameStr || 'unknown') + ' level ' +  tR.levelNum);
			return true;
        } catch (err) {
            con.error("ERROR in arena.battle: " + err.stack);
            return false;
        }
    };
	
    arena.revengeCheck = function () {
		try {
			var infoDiv = $j("#app_body #newsFeedSection div[style*='news_innercontainer_top.gif']:contains('Victory')").has("img[src$='arena_battlepoints.gif']"),
			tempDiv = $j(),
			tempTxt = '';
			
			if (!config.getItem('enableArena', false)) {
				return false;
			}
			
			con.log(1, 'Index arena revenges ' + infoDiv.length);
			
			session.setItem('arenaRevengeLoss', $u.setContent($j("#app_body #newsFeedSection div[id^='battle_messages_']:contains('Arena Battle Points')").text().trim().innerTrim().regex(/lost (\d+) Arena/g), []).reduce(function(p, c) {
				return p + c;
			})); 
			
			session.setItem('arenaRevengeTime',$j("#app_body #newsFeedSection div[style*='news_innercontainer_top.gif']:contains('Defeat')").has("img[src$='arena_battlepoints.gif']").last().text().trim().innerTrim().regex(/Defeat! (.+) ago:/));  

			
			battle.records.forEach( function(tR) {
				tR.arenaRevenge = false;
			});
			
			infoDiv.each(function (index) {
				var tR = battle.getItem($j(this).find("input[name='target_id']").attr('value'));
				if (!tR) {
					con.warn('Arena: unable to find userID or battle record',tR, index);
					return;
				}
				tempDiv = $j("#app_body #newsFeedSection div[id^='battle_messages_" + tR.userId + "']:contains('Arena Battle Points')");
				tR.arenaPoints = tR.arenaPoints ? tR.arenaPoints : caap.bulkRegex(tempDiv, /You have won (\d+) Arena Battle Points!/);
				tR.arenaRevenge = true;
				tR.duelwinsNum = tR.duelwinsNum ? tR.duelwinsNum : caap.bulkRegex($j(infoDiv[index]).next(), /You won (\d+) times/) || 1;
				battle.setItem(tR);
				con.log(2, 'Arena victory in feed against ' + tR.nameStr + '. Last points: ' + tR.arenaPoints, tR);
			});
			return;
        } catch (err) {
            con.error("ERROR in arenaRevengeCheck: " + err.stack);
            return false;
        }
    };
	
	arena.dashboard = function() {
		battle.dashboard('Arena');
	};

}());