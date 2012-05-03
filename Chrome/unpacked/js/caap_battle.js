/////////////////////////////////////////////////////////////////////
//                          BATTLING PLAYERS
/////////////////////////////////////////////////////////////////////

/* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
/*jslint sub: true */
caap.battleUserId = function(userid) {
	try {
		if(battle.hashCheck(userid)) {
			return true;
		}

		var battleButton = null, form = $j(), inp = $j();
		battleButton = caap.checkForImage(battle.battles['Freshmeat'][config.getItem('BattleType', 'Invade')]);
		if($u.hasContent(battleButton)) {
			form = battleButton.parent().parent();
			if($u.hasContent(form)) {
				inp = $j("input[name='target_id']", form);
				if($u.hasContent(inp)) {
					inp.attr("value", userid);
					state.setItem("lastBattleID", userid);
					battle.click(battleButton);
					state.setItem("notSafeCount", 0);
					return true;
				} else {
					con.warn("target_id not found in battleForm");
				}
			} else {
				con.warn("form not found in battleButton");
			}
		} else {
			con.warn("battleButton not found");
		}

		return false;
	} catch (err) {
		con.error("ERROR in battleUserId: " + err);
		return false;
	}
};
caap.battleWarnLevel = true;

caap.battle = function(mode) {
	try {
		var whenBattle = '', target = '', battletype = '', useGeneral = '', staminaReq = 0, chainImg = '', button = null, raidName = '', battleChainId = 0, targetMonster = '', whenMonster = '', targetType = '', rejoinSecs = '', battleRecord = {}, tempTime = 0, monsterObject = {}, noSafeCountSet = 0;

		if(caap.stats['level'] < 8) {
			if(caap.battleWarnLevel) {
				con.log(1, "Battle: Unlock at level 8");
				caap.battleWarnLevel = false;
			}

			return false;
		}
		whenBattle = config.getItem('WhenBattle', 'Never');
		whenMonster = config.getItem('WhenMonster', 'Never');
		targetMonster = state.getItem('targetFrombattle_monster', '');
		monsterObject = $u.hasContent(targetMonster) ? monster.getItem(targetMonster) : monsterObject;
		switch (whenBattle) {
			case 'Never' :
				caap.setDivContent('battle_mess', 'Battle off');
				return false;
			case 'Recon Only' :
				caap.setDivContent('battle_mess', 'Battle Recon Only');
				return false;
			case 'Stay Hidden' :
				if(!caap.needToHide() && config.getItem('delayStayHidden', true) === true) {
					caap.setDivContent('battle_mess', 'We Dont Need To Hide Yet');
					con.log(1, 'We Dont Need To Hide Yet');
					return false;
				}

				break;
			case 'No Monster' :
				if(mode !== 'DemiPoints') {
					if(whenMonster !== 'Never' && monsterObject && !/the deathrune siege/i.test(monsterObject['name'])) {
						return false;
					}
				}

				break;
			case 'Demi Points Only' :
				if(mode === 'DemiPoints' && whenMonster === 'Never') {
					return false;
				}

				if(mode !== 'DemiPoints' && whenMonster !== 'Never' && monsterObject && !/the deathrune siege/i.test(monsterObject['name'])) {
					return false;
				}

				if(battle.selectedDemisDone(true) || (config.getItem("DemiPointsFirst", false) && whenMonster !== 'Never' && config.getItem("observeDemiFirst", false) && state.getItem('DemiPointsDone', false))) {
					return false;
				}

				break;
			default :
		}

		if(caap.checkKeep()) {
			return true;
		}

		if(caap.stats['health']['num'] < 10) {
			con.log(5, 'Health is less than 10: ', caap.stats['health']['num']);
			return false;
		}

		if(config.getItem("waitSafeHealth", false) && caap.stats['health']['num'] < 13) {
			con.log(5, 'Unsafe. Health is less than 13: ', caap.stats['health']['num']);
			return false;
		}
		target = battle.getTarget(mode);
		con.log(5, 'Mode/Target', mode, target);
		if(!target) {
			con.log(1, 'No valid battle target');
			return false;
		} else if(!$u.isNumber(target)) {
			target = target.toLowerCase();
		}

		if(target === 'noraid') {
			con.log(5, 'No Raid To Attack');
			return false;
		}
		battletype = config.getItem('BattleType', 'Invade');
		switch (battletype) {
			case 'Invade' :
				useGeneral = 'InvadeGeneral';
				staminaReq = target === 'raid' ? state.getItem('RaidStaminaReq', 1) : 1;
				chainImg = 'battle_invade_again.gif';
				if(general.LevelUpCheck(useGeneral)) {
					useGeneral = 'LevelUpGeneral';
					con.log(3, 'Using level up general');
				}

				break;
			case 'Duel' :
				useGeneral = 'DuelGeneral';
				staminaReq = target === 'raid' ? state.getItem('RaidStaminaReq', 1) : 1;
				chainImg = 'battle_duel_again.gif';
				if(general.LevelUpCheck(useGeneral)) {
					useGeneral = 'LevelUpGeneral';
					con.log(3, 'Using level up general');
				}

				break;
			case 'War' :
				useGeneral = 'WarGeneral';
				staminaReq = 10;
				chainImg = 'battle_duel_again.gif';
				if(general.LevelUpCheck(useGeneral)) {
					useGeneral = 'LevelUpGeneral';
					con.log(3, 'Using level up general');
				}

				break;
			default :
				con.warn('Unknown battle type ', battletype);
				return false;
		}

		if(!caap.checkStamina('Battle', staminaReq)) {
			con.log(3, 'Not enough stamina for ', battletype, staminaReq);
			return false;
		}

		// Check if we should chain attack
		if($u.hasContent($j("img[src*='battle_victory.gif']", caap.resultsWrapperDiv))) {
			button = caap.checkForImage(chainImg);
			battleChainId = state.getItem("BattleChainId", 0);
			if($u.hasContent(button) && battleChainId) {
				caap.setDivContent('battle_mess', 'Chain Attack In Progress');
				con.log(2, 'Chaining Target', battleChainId);
				battle.click(button);
				state.setItem("BattleChainId", 0);
				return true;
			}

			state.setItem("BattleChainId", 0);
		}

		if(!state.getItem("notSafeCount", 0)) {
			state.setItem("notSafeCount", 0);
		}

		con.log(2, 'Battle Target', target);
		targetType = config.getItem('TargetType', 'Invade');
		switch (target) {
			case 'raid' :
				if(!schedule.check("NoTargetDelay")) {
					rejoinSecs = ((schedule.getItem("NoTargetDelay").next - Date.now()) / 1000).dp() + ' secs';
					con.log(2, 'Rejoining the raid in', rejoinSecs);
					caap.setDivContent('battle_mess', 'Joining the Raid in ' + rejoinSecs);
					return false;
				}

				if(general.Select(useGeneral)) {
					return true;
				}

				caap.setDivContent('battle_mess', 'Joining the Raid');
				// This is a temporary fix for the web3 url until CA fix their HTML
				if(caap.domain.which === 2 && !$u.hasContent($j("img[src*='tab_raid_']", caap.appBodyDiv))) {
					if(caap.navigateTo(caap.battlePage, 'battle_on.gif')) {
						return true;
					}

					caap.clickAjaxLinkSend("raid.php");
					return true;
				}

				if(caap.navigateTo(caap.battlePage + ',raid', 'tab_raid_on.gif')) {
					return true;
				}

				if(config.getItem('clearCompleteRaids', false) && $u.hasContent(monster.completeButton['raid']['button']) && $u.hasContent(monster.completeButton['raid']['md5'])) {
					caap.click(monster.completeButton['raid']['button']);
					monster.deleteItem(monster.completeButton['raid']['md5']);
					monster.completeButton['raid'] = {
						'md5' : undefined,
						'name' : undefined,
						'button' : undefined
					};
					caap.updateDashboard(true);
					con.log(1, 'Cleared a completed raid');
					return true;
				}
				raidName = state.getItem('targetFromraid', '');
				if($u.hasContent(raidName)) {
					monsterObject = monster.getItem(raidName);
				}

				if(!$u.hasContent($j("div[style*='dragon_title_owner']", caap.appBodyDiv))) {
					button = monster.engageButtons[monsterObject['md5']];
					if($u.hasContent(button)) {
						caap.click(button);
						return true;
					}

					con.warn('Unable to engage raid', monsterObject['name']);
					return false;
				}

				if(monster.confirmRightPage(monsterObject['name'])) {
					return true;
				}

				// The user can specify 'raid' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
				if(targetType === "Userid List") {
					if(battle.freshmeat('Raid')) {
						if($u.hasContent($j("span[class*='result_body']", caap.appBodyDiv))) {
							battle.nextTarget();
						}
						noSafeCountSet = config.getItem("notSafeCount", 20);
						noSafeCountSet = noSafeCountSet < 1 ? 1 : noSafeCountSet;
						noSafeCountSet = Math.round(noSafeCountSet / 4);
						if(state.getItem("notSafeCount", 0) > noSafeCountSet) {
							state.setItem("notSafeCount", 0);
							battle.nextTarget();
						}

						return true;
					}

					con.warn('Doing Raid UserID list, but no target');
					return false;
				}

				return battle.freshmeat('Raid');
			case 'freshmeat' :
				if(!schedule.check("NoTargetDelay")) {
					rejoinSecs = ((schedule.getItem("NoTargetDelay").next - Date.now()) / 1000).dp() + ' secs';
					con.log(2, 'Rejoining battles in', rejoinSecs);
					caap.setDivContent('battle_mess', 'Joining battles in ' + rejoinSecs);
					return false;
				}

				if(general.Select(useGeneral)) {
					return true;
				}

				if(caap.navigateTo(caap.battlePage, 'battle_on.gif')) {
					return true;
				}

				caap.setDivContent('battle_mess', 'Battling ' + target);
				// The user can specify 'freshmeat' in their Userid List to get us here. In that case we need to adjust NextBattleTarget when we are done
				if(targetType === "Userid List") {
					if(battle.freshmeat('Freshmeat')) {
						if($u.hasContent($j("span[class*='result_body']", caap.appBodyDiv))) {
							battle.nextTarget();
						}
						noSafeCountSet = config.getItem("notSafeCount", 20);
						noSafeCountSet = noSafeCountSet < 1 ? 1 : noSafeCountSet;
						noSafeCountSet = Math.round(noSafeCountSet / 4);
						if(state.getItem("notSafeCount", 0) > noSafeCountSet) {
							state.setItem("notSafeCount", 0);
							battle.nextTarget();
						}

						return true;
					}

					con.warn('Doing Freshmeat UserID list, but no target');
					return false;
				}

				return battle.freshmeat('Freshmeat');
			default:
				if(!config.getItem("IgnoreBattleLoss", false)) {
					battleRecord = battle.getItem(target);
					switch (config.getItem("BattleType", 'Invade')) {
						case 'Invade' :
							tempTime = battleRecord.invadeLostTime ? battleRecord.invadeLostTime : tempTime;
							break;
						case 'Duel' :
							tempTime = battleRecord.duelLostTime ? battleRecord.duelLostTime : tempTime;
							break;
						case 'War' :
							tempTime = battleRecord.warlostTime ? battleRecord.warlostTime : tempTime;
							break;
						default :
							con.warn("Battle type unknown!", config.getItem("BattleType", 'Invade'));
					}

					if(battleRecord && battleRecord.nameStr !== '' && !schedule.since(tempTime, 604800)) {
						con.log(1, 'Avoiding Losing Target', target);
						battle.nextTarget();
						return true;
					}
				}

				if(general.Select(useGeneral)) {
					return true;
				}

				if(caap.navigateTo(caap.battlePage, 'battle_on.gif')) {
					return true;
				}

				//state.setItem('BattleChainId', 0);
				if(caap.battleUserId(target)) {
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
