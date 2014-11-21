/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,feed,spreadsheet,ss,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,battle,profiles,town,
hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          MONSTERS AND BATTLES
/////////////////////////////////////////////////////////////////////

(function () {
    "use strict";

    caap.checkResults_army_news_feed = function () {
        try {
            if (!config.getItem('enableMonsterFinder', false)) {
                return true;
            }

            feed.items("feed");
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_army_news_feed: " + err);
            return false;
        }
    };
/*
    caap.checkResults_public_monster_list = function () {
        try {
            if (config.getItem('enableMonsterFinder', false)) {
                feed.publicItems();
            }

            $j("input[name='Attack Dragon']").on('click', function () {
                var form = $j(this).parents("form").eq(0),
                    userId = $j("input[name='casuser']", form).val().parseInt(),
                    mpool = $j("input[name='mpool']", form).val().parseInt();

                caap.setDomWaiting("/battle_monster.php?casuser=" + userId + "&mpool=" + mpool);

                form = null;
            });

            return true;
        } catch (err) {
            con.error("ERROR in checkResults_public_monster_list: " + err);
            return false;
        }
    };
*/
    caap.checkResults_monsterList = function (slice) {
        try {
			slice = $u.setContent(slice, $j("#app_body"));
            var buttonsDiv = $j("img[src*='dragon_list_btn_'],input[src*='list_btn_atk'],input[src*='monster_button_'],img[src*='festival_monster_'],img[src*='festival_monster2_'],img[src*='conq2_monster_'],img[src*='list_conq_']", slice),
                page = session.getItem('page', ''),
				pageURL = session.getItem('clickUrl', ''),
				lastmd5 = monster.lastClick,
                mR = {},
                it = 0,
                url = '',
                siege = '',
                engageButtonName = '',
                monsterName = '',
                monsterRow = $j("div[style*='monsterlist_container2.gif'], div[style*='pubmonster_middlef.gif']", slice),
				conditions = false,
                monsterFull = '',
                monsterInfo = {},
                tempText = '',
                monsterText = '',
                userId = 0,
                userName = '',
                mName = '',
				now = Date.now(),
				link = '',
				lpage = '', // page where monster list is
                md5 = '',
                pageUserCheck = 0,
                newInputsDiv = $j(),
				publicList = page === 'public_monster_list';

				monster.lastClick = null;

            //con.log(2, "Checking monster list page results", page, pageURL, monsterRow);
			if (!publicList) {
				if (page === 'guildv2_monster_list') {
					lpage = 'ajax:' + session.getItem('clickUrl', '').replace(/http.*\//,'');
				} else if (page === 'raid') {
					lpage = 'ajax:raid.php';
				} else if (page === 'player_monster_list') {
					if (pageURL.indexOf('monster_filter=2') >=0) {
						lpage = 'ajax:player_monster_list.php?monster_filter=2'
					} else if (pageURL.indexOf('monster_filter=3') >=0) {
						lpage = 'ajax:player_monster_list.php?monster_filter=3';
					} else {
						lpage = 'player_monster_list';
					}
				} else {
					con.log(2,'caap.checkResults_monsterList Unexpected page ' + page);
					return false;
				}
				monster.setrPage(lpage,'review',now);
			}
			
            // get all buttons to check monsterObjectList
            if (!$u.hasContent(buttonsDiv) && !$u.hasContent(monsterRow)) {
                con.log(2, "No buttons found");
                return false;
            }

            if (page === 'player_monster_list' || publicList) {
                // Review monsters and find attack and fortify button
                for (it = 0; it < monsterRow.length; it += 1) {
                    // Make links for easy clickin'
                    /*jslint continue: true */
                    if (!$u.hasContent($j("input[id^='share_link_']", monsterRow.eq(it)))) {
                        con.log(2, "No URL found", it, monsterRow.eq(it));
                        continue;
                    }
                    /*jslint continue: false */
					monsterName =  $j("div[style*='bold']", monsterRow.eq(it)).text().trim();
					conditions = '';
					if (publicList) {
						conditions = feed.addConditions(monsterName);
						if (conditions === false) {
							continue;
						}
					}

					link = $j("input[id^='share_link_']", monsterRow.eq(it)).attr("value").replace(/http.*\//,'');
					link = monster.cleanLink(link);
					md5 = link.MD5();
                    mR = monster.getItem(md5);
					mR.link = link;
					mR.lpage = lpage;
					if (publicList) {
						mR.conditions = conditions;
					}

                    mR.name = mR.name || $j("div[style*='20px']", monsterRow.eq(it)).text().trim() + ' ' + monsterName;
                    mR.md5 = md5;
					mR.listReviewed = now;
					if (publicList) {
						mR.status = mR.status || 'Join';
					} else {
						newInputsDiv = $j("img[src*='list_btn_']", monsterRow.eq(it));
						engageButtonName = $u.setContent(newInputsDiv.attr("src"), '').regex(/list_btn_(\w*)/);
						switch (engageButtonName) {
							case 'collect':
								mR.status = mR.status || 'Dead or fled';
								mR.color = 'grey';
								break;
							case 'atk':
								monster.engageButtons[mR.md5] = newInputsDiv;
								mR.status = mR.status || (lpage == "ajax:player_monster_list.php?monster_filter=2" ? 'Join' : 'Attack');
								break;
							default:
								con.warn("Unknown engageButtonName status", engageButtonName, newInputsDiv.attr("src"));
						}
					}

					con.log(2, "Monster " + mR.name, link, mR.status, mR);
					monster.setItem(mR);
				}
				
            } else {
				// Raid page
				if (lastmd5) {
					con.log(1, "Deleting raid that has expired",lastmd5);
					monster.deleteItem(lastmd5);
				}

                tempText = buttonsDiv.eq(0).parent().attr("href");
                pageUserCheck = session.getItem('pageUserCheck', 0);
                if (pageUserCheck && tempText && !(new RegExp('user=' + caap.stats.FBID).test(tempText) || /alchemy\.php/.test(tempText))) {
                    con.log(2, "On another player's keep.", pageUserCheck);
                    buttonsDiv = null;
                    monsterRow = null;
                    newInputsDiv = null;
                    return false;
                }

                // Review monsters and find attack and fortify button
                con.log(2, "buttonsDiv", buttonsDiv);
                for (it = 0; it < buttonsDiv.length; it += 1) {
                    // Make links for easy clickin'
                    url = buttonsDiv.eq(it).parent().attr("href");
                    con.log(3, "url", url);
                    /*jslint continue: true */
                    if (!(url && /user=/.test(url) && (/mpool=/.test(url) || /raid\.php/.test(url)))) {
                        continue;
                    }
                    /*jslint continue: false */

                    url = url.replace(/http.*\//, '');
                    monsterRow = buttonsDiv.eq(it).parents().eq(3);
                    monsterFull = monsterRow.text().trim().innerTrim();
                    monsterName = monsterFull.replace(/Completed!/i, '').replace(/Fled!/i, '').replace(/COLLECTION: \d+:\d+:\d+/i, '').trim().innerTrim();
                    if (/^Your /.test(monsterName)) {
                        monsterText = monsterName.replace(/^Your /, '').trim().innerTrim().toLowerCase().ucWords();
                        userName = "Your";
                    } else {
                        monsterText = monsterName.replace(new RegExp(".+'s (.+)$"), '$1').replace(/,.*/,'');
                        userName = monsterName.replace(monsterText, '').trim();
                        monsterText = monsterText.trim().innerTrim().toLowerCase().ucWords();
                    }

                    tempText = $j("div[style*='.jpg']", monsterRow).eq(0).attr("style").regex(new RegExp(".*\\/(.*\\.jpg)"));
                    monsterText = $u.setContent(monster.getListName(tempText), monsterText);
                    mName = userName + ' ' + monsterText;
                    con.log(2, "Monster Name", mName);
                    userId = $u.setContent(url.regex(/user=(\d+)/), 0);
                    con.log(3, "checkResults_monsterList page", page.replace(/festival_tower\d*/, "festival_battle_monster"), url);
                    //md5 = (userId + ' ' + monsterText + ' ' + page.replace(/festival_tower\d*/, "festival_battle_monster")).toLowerCase().MD5();
                    md5 = url.MD5();
                    mR = monster.getItem(md5, 'monster');
                    mR.name = mName;
                    mR.userName = userName;
                    mR.monster = monsterText;
                    mR.userId = userId;
					mR.lpage = lpage;
                    engageButtonName = $u.setContent(buttonsDiv.eq(it).attr("src"), '').regex(/(dragon_list_btn_\d)/i);
					mR.listReviewed = now;

                    switch (engageButtonName) {
                        case 'collectbtn':
                        case 'dragon_list_btn_2':
                            mR.status = 'Collect';
                            mR.color = 'grey';

                            break;
                        case 'engagebtn':
                        case 'dragon_list_btn_3':
                            monster.engageButtons[mR.md5] = $j(buttonsDiv.eq(it));

                            break;
                        case 'viewbtn':
                        case 'dragon_list_btn_4':
                            if (page === 'raid' && !(/!/.test(monsterFull))) {
                                monster.engageButtons[mR.md5] = $j(buttonsDiv.eq(it));

                                break;
                            }

                            if ((page !== "festival_tower" && page !== "festival_tower2" && !$u.hasContent(monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].button)) ||
                                    !$u.hasContent(monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].md5)) {
                                monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].md5 = $u.setContent(mR.md5, '');
                                monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].name = $u.setContent(mR.name, '');
                                monster.completeButton[page.replace(/festival_tower\d*/, "battle_monster")].button = $u.setContent($j("img[src*='cancelButton.gif']", monsterRow), null);
                            }

                            mR.status = 'Done';
                            mR.color = 'grey';

                            break;
                        default:
                    }

                    mR.mpool = /mpool=\d+/.test(url) ? '&mpool=' + url.regex(/mpool=(\d+)/) : '';
                    mR.mid = /mid=\S+/.test(url) ? '&mid=' + url.regex(/mid=(\S+)[&]*/) : '';
                    mR.link = url;
                    monster.setItem(mR, 'monster');
                }
            }

			for (it = monster.records.length - 1; it >= 0; it -= 1) {
				mR = monster.records[it];
				if (mR.lpage === lpage && !publicList) {
					if (mR.listReviewed < now) {
						mR.lMissing = $u.setContent(mR.lMissing, 0) + 1;
						con.warn('Did not see monster ' + mR.name + ' on monster list ' + mR.lMissing + ' times.', mR);
					} else {
						mR.lMissing = 0;
					}
					monster.setItem(mR);
				}
			}
            caap.updateDashboard(true);
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_monsterList: " + err);
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
            con.error("ERROR in checkResults_battle: " + err);
            return false;
        }
    };

    caap.inLevelUpMode = function () {
        try {
            if (!config.getItem('EnableLevelUpMode', true)) {
                //if levelup mode is false then new level up mode is also false (kob)
                state.setItem("newLevelUpMode", false);
                return false;
            }

            if (!caap.stats.indicators.enl) {
                //if levelup mode is false then new level up mode is also false (kob)
                state.setItem("newLevelUpMode", false);
                return false;
            }

            // minutesBeforeLevelToUseUpStaEnergy : 5, = 30000
            if (((caap.stats.indicators.enl - Date.now()) < 30000) || (caap.stats.exp.dif <= config.getItem('LevelUpGeneralExp', 20))) {
                //detect if we are entering level up mode for the very first time (kob)
                if (!state.getItem("newLevelUpMode", false)) {
                    //set the current level up mode flag so that we don't call refresh monster routine more than once (kob)
                    state.setItem("newLevelUpMode", true);
                    caap.refreshMonstersListener();
                }

                return true;
            }

            //if levelup mode is false then new level up mode is also false (kob)
            state.setItem("newLevelUpMode", false);
            return false;
        } catch (err) {
            con.error("ERROR in inLevelUpMode: " + err);
            return false;
        }
    };

    caap.checkStamina = function (battleOrMonster, attackMinStamina) {
        try {
            con.log(4, "checkStamina", battleOrMonster, attackMinStamina);
            if (!attackMinStamina) {
                attackMinStamina = 1;
            }

            var when = config.getItem('When' + battleOrMonster, 'Never'),
                maxIdleStamina = 0,
                theGeneral = '',
                staminaMF = '',
                messDiv = battleOrMonster.toLowerCase() + "_mess";

            if (when === 'Never') {
                return false;
            }

            if (!caap.stats.stamina || !caap.stats.health) {
                caap.setDivContent(messDiv, 'Health or stamina not known yet.');
                return false;
            }

            if (caap.stats.health.num < 10) {
                if (battleOrMonster === "Conquest") {
                    schedule.setItem("conquest_delay_stats", (10 - caap.stats.health.num) *  180, 120);
                }

                caap.setDivContent(messDiv, "Need health to fight: " + caap.stats.health.num + "/10");
                return false;
            }

            if (((battleOrMonster === "Battle" && config.getItem("waitSafeHealth", false)) || (battleOrMonster === "Conquest" && config.getItem("conquestWaitSafeHealth", false))) && caap.stats.health.num < 13) {
                if (battleOrMonster === "Conquest") {
                    schedule.setItem("conquest_delay_stats", (13 - caap.stats.health.num) *  180, 120);
                }

                caap.setDivContent(messDiv, "Unsafe. Need health to fight: " + caap.stats.health.num + "/13");
                return false;
            }

            if (when === 'At X Stamina') {
                if (caap.inLevelUpMode() && caap.stats.stamina.num >= attackMinStamina) {
                    caap.setDivContent(messDiv, 'Burning stamina to level up');
                    return true;
                }

                staminaMF = battleOrMonster + 'Stamina';
                if (state.getItem('BurnMode_' + staminaMF, false) || caap.stats.stamina.num >= config.getItem('X' + staminaMF, 1)) {
                    if (caap.stats.stamina.num < attackMinStamina || caap.stats.stamina.num <= config.getItem('XMin' + staminaMF, 0)) {
                        state.setItem('BurnMode_' + staminaMF, false);
                        return false;
                    }

                    state.setItem('BurnMode_' + staminaMF, true);
                    return true;
                }

                state.setItem('BurnMode_' + staminaMF, false);

                caap.setDivContent(messDiv, 'Waiting for stamina: ' + caap.stats.stamina.num + "/" + config.getItem('X' + staminaMF, 1));
                return false;
            }

            if (when === 'At Max Stamina') {
                maxIdleStamina = caap.maxStatCheck('stamina');

                if (caap.stats.stamina.num >= maxIdleStamina) {
                    caap.setDivContent(messDiv, 'Using max stamina');
                    return true;
                }

                if (caap.inLevelUpMode() && caap.stats.stamina.num >= attackMinStamina) {
                    caap.setDivContent(messDiv, 'Burning all stamina to level up');
                    return true;
                }

                caap.setDivContent(messDiv, 'Waiting for max stamina: ' + caap.stats.stamina.num + "/" + maxIdleStamina);
                return false;
            }

            if (caap.stats.stamina.num >= attackMinStamina) {
                return true;
            }

            caap.setDivContent(messDiv, "Waiting for more stamina: " + caap.stats.stamina.num + "/" + attackMinStamina);
            return false;
        } catch (err) {
            con.error("ERROR in checkStamina: " + err);
            return false;
        }
    };

    /*-------------------------------------------------------------------------------------\
    needToHide will return true if the current stamina and health indicate we need to bring
    our health down through battles (hiding).  It also returns true if there is no other outlet
    for our stamina (currently this just means Monsters, but will eventually incorporate
    other stamina uses).
    \-------------------------------------------------------------------------------------*/
    caap.needToHide = function () {
        try {
            if (config.getItem('WhenMonster', 'Never') === 'Never') {
                con.log(1, 'Stay Hidden Mode: Monster battle not enabled');
                return true;
            }

            if (!state.getItem('targetFrombattle_monster', '')) {
                con.log(1, 'Stay Hidden Mode: No monster to battle');
                return true;
            }

            if (config.getItem('delayStayHidden', true) === false) {
                con.log(2, 'Stay Hidden Mode: Delay hide if "safe" not enabled');
                return true;
            }

            /*-------------------------------------------------------------------------------------\
             The riskConstant helps us determine how much we stay in hiding and how much we are willing
             to risk coming out of hiding.  The lower the riskConstant, the more we spend stamina to
             stay in hiding. The higher the risk constant, the more we attempt to use our stamina for
             non-hiding activities.  The below matrix shows the default riskConstant of 1.7

             S   T   A   M   I   N   A
             1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
             H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
             E   11  -   -   +   +   +   +   +   +   +
             A   12  -   -   +   +   +   +   +   +   +
             L   13  -   -   +   +   +   +   +   +   +
             T   14  -   -   -   +   +   +   +   +   +
             H   15  -   -   -   +   +   +   +   +   +
             16  -   -   -   -   +   +   +   +   +
             17  -   -   -   -   -   +   +   +   +
             18  -   -   -   -   -   +   +   +   +

             Setting our riskConstant down to 1 will result in us spending out stamina to hide much
             more often:

             S   T   A   M   I   N   A
             1   2   3   4   5   6   7   8   9        -  Indicates we use stamina to hide
             H   10  -   -   +   +   +   +   +   +   +        +  Indicates we use stamina as requested
             E   11  -   -   +   +   +   +   +   +   +
             A   12  -   -   -   +   +   +   +   +   +
             L   13  -   -   -   -   +   +   +   +   +
             T   14  -   -   -   -   -   +   +   +   +
             H   15  -   -   -   -   -   -   +   +   +
             16  -   -   -   -   -   -   -   +   +
             17  -   -   -   -   -   -   -   -   +
             18  -   -   -   -   -   -   -   -   -

            \-------------------------------------------------------------------------------------*/

            var riskConstant = gm ? gm.getItem('HidingRiskConstant', 1.7, hiddenVar) : 1.7;

            /*-------------------------------------------------------------------------------------\
            The formula for determining if we should hide goes something like this:

            If  (health - (estimated dmg from next attacks) puts us below 10)  AND
            (current stamina will be at least 5 using staminatime/healthtime ratio)
            Then stamina can be used/saved for normal process
            Else stamina is used for us to hide

            \-------------------------------------------------------------------------------------*/
            //if ((caap.stats.health.num - ((caap.stats.stamina.num - 1) * riskConstant) < 10) && (caap.stats.stamina.num * (5 / 3) >= 5)) {
            if ((caap.stats.health.num - ((caap.stats.stamina.num - 1) * riskConstant) < 10) && ((caap.stats.stamina.num + (gm ? gm.getItem('HideStaminaRisk', 1, hiddenVar) : 1)) >= state.getItem('MonsterStaminaReq', 1))) {
                return false;
            }

            return true;
        } catch (err) {
            con.error("ERROR in needToHide: " + err);
            return undefined;
        }
    };

    caap.monsters = function () {
        try {
		var whenMonster = config.getItem('WhenMonster', 'Never');

		if (whenMonster === 'Never' || whenMonster == 'Review Only') {
                caap.setDivContent('monster_mess', whenMonster == 'Never' ? 'Monster off' : 'No current review');
                return false;
            }
			
			monster.select(false);
			
            ///////////////// Reivew/Siege all monsters/raids \\\\\\\\\\\\\\\\\\\\\\

            if (config.getItem('WhenMonster', 'Never') === 'Stay Hidden' && caap.needToHide() && caap.checkStamina('Monster', 1)) {
                con.log(1, "Stay Hidden Mode: We're not safe. Go battle.");
                caap.setDivContent('monster_mess', 'Not Safe For Monster. Battle!');
                return false;
            }

            if (!schedule.check('NotargetFrombattle_monster')) {
                return false;
            }

            ///////////////// Individual Monster Page \\\\\\\\\\\\\\\\\\\\\\

            // Establish a delay timer when we are 1 stamina below attack level.
            // Timer includes 5 min for stamina tick plus user defined random interval

            if (!caap.inLevelUpMode() && caap.stats.stamina.num === (state.getItem('MonsterStaminaReq', 1) - 1) && schedule.check('battleTimer') && config.getItem('seedTime', 0) > 0) {
                schedule.setItem('battleTimer', 300, config.getItem('seedTime', 0));
                caap.setDivContent('monster_mess', 'Monster Delay Until ' + caap.displayTime('battleTimer'));
                return false;
            }

            if (!schedule.check('battleTimer')) {
                if (caap.stats.stamina.num < maxIdleStamina) {
                    caap.setDivContent('monster_mess', 'Monster Delay Until ' + caap.displayTime('battleTimer'));
                    return false;
                }
            }

            var fightMode = '',
                targetMonster = state.getItem('targetFromfortify', new monster.energyTarget()),
                monsterName = targetMonster.name,
                nodeNum = 0,
                energyRequire = 10,
				// In the interest of saving bits to be more environmentally friendly, currentMonster has been renamed cM
                cM = monster.getItem(targetMonster.md5, 'monster'), 
                monsterInfo = monster.getInfo(cM),
                attackButton = null,
                singleButtonList = [],
                buttonList = [],
                tacticsValue = 0,
                useTactics = false,
                attackMess = '',
                pageUserCheck = 0,
                it = 0,
                len = 0,
                buttonHref = '',
                theGeneral = config.getItem('FortifyGeneral', 'Use Current'),
                partsTargets,
                partsTarget,
                partsElem,
                partsElem1,
                partsElem2,
                orderPartsArray,
                max_index = -1,
                max_value,
                i = 0,
                ii = 0, 
				result = false;

            if ($u.hasContent(cM)) {
				monsterInfo = $u.hasContent(cM.type) ? (cM.type === "Raid II" ? monsterInfo.stage2 : monsterInfo.stage1) : monsterInfo;
                if ($u.hasContent(monsterInfo)) {
                    if (!caap.inLevelUpMode() && config.getItem('PowerFortifyMax', false) && monsterInfo.staLvl) {
                        for (nodeNum = monsterInfo.staLvl.length - 1; nodeNum >= 0; nodeNum = nodeNum - 1) {
                            if (caap.stats.stamina.max >= monsterInfo.staLvl[nodeNum]) {
                                break;
                            }
                        }
                    }

                    energyRequire = $u.isDefined(nodeNum) && nodeNum >= 0 && config.getItem('PowerAttackMax', false) && monsterInfo.nrgMax ? monsterInfo.nrgMax[nodeNum] : monsterInfo.nrgMax ? monsterInfo.nrgMax[0] : energyRequire;
                }
            }

            con.log(4, "Energy Required/Node", energyRequire, nodeNum);
            theGeneral = theGeneral === "Under Level" ? (config.getItem('ReverseLevelUpGenerals') ? general.GetLevelUpNames().reverse().pop() : general.GetLevelUpNames().pop()) : theGeneral;
            switch (theGeneral) {
                case 'Orc King':
                    energyRequire = energyRequire * (Math.min(4, general.GetLevel('Orc King')) + 1);
                    con.log(3, 'Monsters Fortify:Orc King', energyRequire);

                    break;
                case 'Barbarus':
                    energyRequire = energyRequire * (general.GetLevel('Barbarus') >= 4 ? 3 : 2);
                    con.log(3, 'Monsters Fortify:Barbarus', energyRequire);

                    break;
                case 'Maalvus':
                    energyRequire = energyRequire * (general.GetLevel('Maalvus') >= 3 ? 3 : 2);
                    con.log(2, 'Monsters Fortify:Maalvus', energyRequire);

                    break;
                default:
            }

            // Check to see if we should fortify or attack monster
            if ($u.hasContent(monsterName) && caap.checkEnergy(energyRequire, (gm ? gm.getItem('WhenFortify', 'Energy Available', hiddenVar) : 'Energy Available'), 'fortify_mess')) {
                fightMode = 'Fortify';
            } else {
                targetMonster = state.getItem('targetFrombattle_monster', '');
                cM = monster.getItem(targetMonster, 'monster');
                monsterName = cM.name;
                monsterInfo = monster.getInfo(cM);
                if ($u.hasContent(monsterName) && $u.hasContent(monsterInfo) && caap.checkStamina('Monster', state.getItem('MonsterStaminaReq', 1)) && cM.link.indexOf('raid') < 0) {
                    fightMode = 'Monster';
                } else {
                    schedule.setItem('NotargetFrombattle_monster', 60);
                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
                    partsTargets = null;
                    partsTarget = null;
                    partsElem = null;
                    return false;
                }
            }

            // Set general and go to monster page
			result = caap.navigate2('@' + fightMode + 'General,ajax:' + cM.link);
            if (result !== false) {
				attackButton = null;
                singleButtonList = null;
                buttonList = null;
                partsTargets = null;
                partsTarget = null;
                partsElem = null;
				if (result == 'fail') {
					monster.deleteItem(cM.md5);
					con.warn('Monster ' + cM.name + ' deleted after five attempts to navigate to it.', cM);
					return false;
				}
                return true;
            }

            // Check if on engage monster page
            if ($u.hasContent($j("#app_body div[style*='dragon_title_owner'],div[style*='nm_top'],div[style*='monster_header_'],div[style*='monster_'][style*='_title'],div[style*='monster_'][style*='_header'],div[style*='boss_'][style*='_header'],div[style*='boss_header'],div[style*='festival_monsters_top_']"))) {
                singleButtonList = ['button_nm_p_attack.gif', 'attack_monster_button.jpg', 'event_attack1.gif', 'seamonster_attack.gif', 'event_attack2.gif', 'attack_monster_button2.jpg'];

                // if the monster has parts, run through them in reverse order until we find one with health and hit it.
                partsTargets = $j("#app_body div[id^='monster_target_']");
                if ($u.hasContent(partsTargets)) {
                    con.log(2, "The monster has parts: partsTargets",partsTargets);
                    // Define if use user or default order parts
                    orderPartsArray = [];
                    if ($u.hasContent(cM) && /:po/i.test(cM.conditions)) {
                        orderPartsArray = cM.conditions.substring(cM.conditions.indexOf('[') + 1, cM.conditions.lastIndexOf(']')).split(".");
                        if (monsterInfo.bodyparts != orderPartsArray.length) {
                            // Wrong number of parts in monster condition.
                            // Set Default Order parts
                            orderPartsArray = monsterInfo.partOrder;
                        }
                    } else {
                        orderPartsArray = monsterInfo.partOrder;
                    }

                    // If minions dead, remove index of minions
                    if (orderPartsArray.length > partsTargets.length) {
                        max_index = -1;
                        max_value = Number.MIN_VALUE;
                        for (i = 0; i < orderPartsArray.length; i += 1) {
                            if (orderPartsArray[i] > max_value) {
                                max_value = orderPartsArray[i];
                                max_index = i;
                            }
                        }

                        if (max_index > -1) {
                            orderPartsArray.splice(max_index, 1);
                        }
                    }

                    // Click first order parts which have health
                    for (ii = 0; ii < orderPartsArray.length; ii += 1) {
                        partsTarget = partsTargets[orderPartsArray[ii] - 1];
                        partsElem = partsTarget.children[0].children[partsTarget.children[0].children.length - 1];
                        partsElem1 = partsElem.children[0].children[0];
                        partsElem2 = partsElem.children[1].children[0];
                        if ($u.hasContent(partsElem1) && $u.setContent($j(partsElem1).getPercent("width"), 0) > 0) {
                            caap.click(partsElem2);
                            break;
                        }
                    }
                }

                // Find the attack or fortify button
                if (fightMode === 'Fortify') {
                    buttonList = ['seamonster_fortify.gif', 'button_dispel.gif', 'attack_monster_button3.jpg'];

                    if (monsterInfo && monsterInfo.fortify_img) {
                        buttonList.unshift(monsterInfo.fortify_img[0]);
                    }
                    if (!cM.stunTarget) {
                        con.log(1, "No stun target time set");
                    }
                    
                    if (cM && cM.stunDo && cM.stunType !== '') {
                        buttonList.unshift("button_nm_s_" + cM.stunType);
                    } else {
                        buttonList.unshift("button_nm_s_");
                    }
                } else if (state.getItem('MonsterStaminaReq', 1) === 1) {
                    // not power attack only normal attacks
                    buttonList = singleButtonList;
                } else {
                    if ($u.hasContent(cM) && /:tac/i.test(cM.conditions) && caap.stats.level >= 50) {
                        useTactics = true;
                        tacticsValue = monster.parseCondition("tac%", cM.conditions);
                    } else if (config.getItem('UseTactics', false) && caap.stats.level >= 50) {
                        useTactics = true;
                        tacticsValue = config.getItem('TacticsThreshold', false);
                    }

                    if (tacticsValue !== false && $u.hasContent(cM) && cM.fortify && cM.fortify < tacticsValue) {
                        con.log(2, "Party health is below threshold value", cM.fortify, tacticsValue);
                        useTactics = false;
                    }

                    if (useTactics && caap.hasImage('nm_button_tactics.gif')) {
                        con.log(2, "Attacking monster using tactics buttons");
                        buttonList = ['nm_button_tactics.gif'].concat(singleButtonList);
                    } else {
                        con.log(2, "Attacking monster using regular buttons");
                        useTactics = false;
                        // power attack or if not seamonster power attack or if not regular attack -
                        // need case for seamonster regular attack?
                        buttonList = ['button_nm_p_power', 'button_nm_p_', 'power_button_', 'attack_monster_button2.jpg', 'event_attack2.gif', 'seamonster_power.gif', 'event_attack1.gif', 'attack_monster_button.jpg'].concat(singleButtonList);

                        if (monsterInfo && monsterInfo.attack_img) {
                            if (!caap.inLevelUpMode() && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false)) {
                                buttonList.unshift(monsterInfo.attack_img[1]);
                            } else {
                                buttonList.unshift(monsterInfo.attack_img[0]);
                            }
                        }
                    }
                }

                con.log(4, "monster/button list", cM, buttonList);
                nodeNum = 0;
                if (!caap.inLevelUpMode()) {
                    if (((fightMode === 'Fortify' && config.getItem('PowerFortifyMax', false)) || (fightMode !== 'Fortify' && config.getItem('PowerAttack', false) && config.getItem('PowerAttackMax', false))) && monsterInfo.staLvl) {
                        for (nodeNum = monsterInfo.staLvl.length - 1; nodeNum >= 0; nodeNum = nodeNum - 1) {
                            if (caap.stats.stamina.max >= monsterInfo.staLvl[nodeNum]) {
                                break;
                            }
                        }
                    }
                }

                for (it = 0, len = buttonList.length; it < len; it += 1) {
                    attackButton = caap.checkForImage(buttonList[it], null, null, nodeNum);
                    if ($u.hasContent(attackButton)) {
                        break;
                    }
                }

                if ($u.hasContent(attackButton)) {
                    if (fightMode === 'Fortify') {
                        attackMess = 'Fortifying ' + monsterName;
                    } else if (useTactics) {
                        attackMess = 'Tactic Attacking ' + monsterName;
                    } else {
                        attackMess = (state.getItem('MonsterStaminaReq', 1) >= 5 ? 'Power' : 'Single') + ' Attacking ' + monsterName;
                    }

                    con.log(1, attackMess);
                    caap.setDivContent('monster_mess', attackMess);
                    caap.click(attackButton);
                    // dashboard autorefresh fix
                    localStorage.AFrecentAction = true;

                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
                    partsTargets = null;
                    partsTarget = null;
                    partsElem = null;
                    return true;
                }

                con.warn('No button to attack/fortify with.');
                schedule.setItem('NotargetFrombattle_monster', 60);
                attackButton = null;
                singleButtonList = null;
                buttonList = null;
                partsTargets = null;
                partsTarget = null;
                partsElem = null;
                return false;
            }
/*
            ///////////////// Check For Monster Page \\\\\\\\\\\\\\\\\\\\\\
            
            if ($u.hasContent(cM) && cM.page === 'battle_monster') {
                if (caap.navigateTo('player_monster_list', 'tab_monster_list_on.gif')) {
                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
                    partsTargets = null;
                    partsTarget = null;
                    partsElem = null;
                    return true;
                }
            } else if ($u.hasContent(cM) && cM.page === 'festival_battle_monster' && cM.link.indexOf("tower=2") >= 0) {
                if (caap.navigateTo('soldiers,festival_home,festival_tower2', 'festival_monster2_towerlist_button.jpg')) {
                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
                    partsTargets = null;
                    partsTarget = null;
                    partsElem = null;
                    return true;
                }
            } else if ($u.hasContent(cM) && cM.page === 'festival_battle_monster') {
                if (caap.navigateTo('soldiers,festival_home,festival_tower', 'festival_monster_towerlist_button.jpg')) {
                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
                    partsTargets = null;
                    partsTarget = null;
                    partsElem = null;
                    return true;
                }
            } else if ($u.hasContent(cM) && cM.page === 'guildv2_monster_list') {
                var slot = cM.link.regex(/&slot=(\d+)/),
//                    link = "guildv2_monster_list.php?guild_id=" + caap.stats['guild']['id'] + "&slot=" + slot;
                    link = cM.link;

                if (caap.clickAjaxLinkSend(link, 1000)) {
                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
                    partsTargets = null;
                    partsTarget = null;
                    partsElem = null;
                    return true;
                }
            } else {
                con.warn('What kind of monster?', cM);
                attackButton = null;
                singleButtonList = null;
                buttonList = null;
                partsTargets = null;
                partsTarget = null;
                partsElem = null;
                return false;
            }

            buttonHref = $u.setContent($j("#app_body img[src*='dragon_list_btn_']").eq(0).parent().attr("href"), '');
            pageUserCheck = session.getItem('pageUserCheck', 0);
            if (pageUserCheck && (!buttonHref || !new RegExp('user=' + caap.stats.FBID).test(buttonHref) || !/alchemy\.php/.test(buttonHref))) {
                con.log(2, "On another player's keep.", pageUserCheck);

                if ($u.hasContent(cM) && cM.page === 'battle_monster') {
                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
                    partsTargets = null;
                    partsTarget = null;
                    partsElem = null;
                    return caap.navigateTo('player_monster_list', 'tab_monster_list_on.gif');
                }

                if ($u.hasContent(cM) && cM.page === 'festival_battle_monster') {
                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
                    partsTargets = null;
                    partsTarget = null;
                    partsElem = null;
                    return caap.navigateTo('soldiers,festival_home,festival_tower', 'festival_monster_towerlist_button.jpg');
                }

                if ($u.hasContent(cM) && cM.page === 'guildv2_monster_list') {
                    attackButton = null;
                    singleButtonList = null;
                    buttonList = null;
                    partsTargets = null;
                    partsTarget = null;
                    partsElem = null;
                }

                con.warn('What kind of monster?', cM);
                attackButton = null;
                singleButtonList = null;
                buttonList = null;
                partsTargets = null;
                partsTarget = null;
                partsElem = null;
                return false;
            }
*/
             if ($u.hasContent(cM) && $u.hasContent(monster.engageButtons[cM.md5])) {
                caap.setDivContent('monster_mess', 'Opening ' + monsterName);
                caap.click(monster.engageButtons[cM.md5]);
                attackButton = null;
                singleButtonList = null;
                buttonList = null;
                partsTargets = null;
                partsTarget = null;
                partsElem = null;
                return true;
            }
			con.log (1, "after button check:", monster, cM);
            schedule.setItem('NotargetFrombattle_monster', 60);
            con.warn('No "Engage" button for ', monsterName);
            attackButton = null;
            singleButtonList = null;
            buttonList = null;
            partsTargets = null;
            partsTarget = null;
            partsElem = null;
            return false;
        } catch (err) {
            con.error("ERROR in monsters: " + err);
            return false;
        }
    };

    /*-------------------------------------------------------------------------------------\
    MonsterReview is a primary action subroutine to manage the monster and raid list
    on the dashboard
    \-------------------------------------------------------------------------------------*/
    caap.monsterReview = function () {
        try {
            /*-------------------------------------------------------------------------------------\
            We do monster review once an hour.  Some routines may reset this timer to drive
            MonsterReview immediately.
            \-------------------------------------------------------------------------------------*/
			//con.log(2,'monster review',caap.stats.reviewPages);
            if (config.getItem('WhenMonster', 'Never') === 'Never' && ['No Monster', 'Demi Points Only'].indexOf(config.getItem('WhenBattle', 'Never')) < 0 &&  config.getItem('TargetType', 'Freshmeat') != 'Raid') {
                return false;
            }

            var link = '',
				siegeLimit = '0',
                result = false,
				i = 0,
				time = 60,
				cM = {},
				message = 'Reviewing ',
                monsterInfo = {};

//caap.stats.reviewPages = {};
            for (i = 0; i < caap.stats.reviewPages.length; i++) {
                if (schedule.since(caap.stats.reviewPages[i].review, 60 * 60)) {
                    con.log(2,'Reviewing monster list page',caap.stats.reviewPages[i].path, caap.stats.reviewPages,caap.stats.reviewPages[i].review);
                    return caap.navigateTo(caap.stats.reviewPages[i].path);
                }
            }
            //con.log(5,'monster review',caap.stats.reviewPages);

            if (monster.records.length === 0) {
                return false;
            }

            /*-------------------------------------------------------------------------------------\
            Now we step through the monsterOl objects. We set monsterReviewCounter to the next
            index for the next reiteration since we will be doing a click and return in here.
            \-------------------------------------------------------------------------------------*/
            for (i = 0; i < monster.records.length; i++) {
                cM = monster.records[i];
                /*jslint continue: true */
				
				// Skip monsters we haven't joined, unless in conquest lands
                if (cM.status == 'Join' && cM.lpage != "ajax:player_monster_list.php?monster_filter=2") {
                    continue;
                }
                if (cM.color === 'grey' && cM.life !== -1) {
                    cM.life = -1;
                    cM.fortify = -1;
                    cM.strength = -1;
                    cM.time = [];
                    cM.t2k = -1;
                    cM.phase = '';
                    monster.save();
                }

                /*-------------------------------------------------------------------------------------\
                If we looked at this monster more recently than an hour ago, skip it
                \-------------------------------------------------------------------------------------*/
				time = (cM.status === 'Attack' ? (monster.parseCondition('mnt', cM.conditions) || 60) : 60) * 60;
				//con.log(2,'PRE MONSTER REVIEW', cM.name, schedule.since(cM.review, time),  cM, time, monster.parseCondition('mnt', cM.conditions));

				link = "ajax:" + cM.link;

				/*-------------------------------------------------------------------------------------\
				If the autocollect token was specified then we set the link to do auto collect.
				\-------------------------------------------------------------------------------------*/
				if (['Collect', 'Dead or fled'].indexOf(cM.status)>=0) {
					if (/:collect\b/.test(cM.conditions) || (!/:!collect\b/.test(cM.conditions) && config.getItem('monsterCollectReward', false))) {
						if (general.Select('CollectGeneral')) {
							return true;
						}

						link += '&action=collectReward';
						con.log(2, 'Collecting reward on ' + cM.name, cM);
						if (cM.monster === 'The Deathrune Siege') {
							if (cM.rix !== -1) {
								link += '&rix=' + cM.rix;
							} else {
								link += '&rix=2';
							}
						}
						message = 'Collecting ';
					}

				} else if (cM.status == 'Done' && cM.lpage == "player_monster_list") {
					if (/:clear\b/.test(cM.conditions) || (!/:!clear\b/.test(cM.conditions) && config.getItem('clearCompleteMonsters', false))) {
						link = link.replace("battle_monster.php?casuser=", "player_monster_list.php?remove_list=").concat("&monster_filter=1");
						//caap.updateDashboard(true);
						message = 'Clearing ';
						monster.deleteItem(cM.md5);
					}

				} else if (cM.doSiege && caap.stats.stamina.num >= cM.siegeLevel && cM.monster !== 'The Deathrune Siege') {
					link += ',clickimg:siege_btn.gif';
					message = 'Sieging ';
				}
				
                if (message === 'Reviewing ' && (cM.status === 'Done' || !schedule.since(cM.review, time))) {
                    continue;
                }
                /*jslint continue: false */

                /*-------------------------------------------------------------------------------------\
                We get our monster link
                \-------------------------------------------------------------------------------------*/
                caap.setDivContent('monster_mess', message + (i + 1) + '/' + monster.records.length + ' ' + cM.name);

                /*-------------------------------------------------------------------------------------\
                If the link is good then we get the url and any conditions for monster
                \-------------------------------------------------------------------------------------*/
				
				/*-------------------------------------------------------------------------------------\
				Now we use ajaxSendLink to display the monsters page.
				\-------------------------------------------------------------------------------------*/
				con.log(1, message + (i + 1) + '/' + monster.records.length + ' ' + cM.name, link, cM);

				result = caap.navigate2(link);
				if (result == 'fail') {
					monster.deleteItem(monster.lastClick);
				}
				monster.lastClick = cM.md5;
				return result;
            }

            /*-------------------------------------------------------------------------------------\
            All done.  Set timer and tell monster.select and dashboard they need to do their thing.
            We set the monsterReviewCounter to do a full refresh next time through.
            \-------------------------------------------------------------------------------------*/

            caap.setDivContent('monster_mess', '');
            caap.updateDashboard(true);

            return false;
        } catch (err) {
            con.error("ERROR in monsterReview: " + err);
            return false;
        }
    };

    caap.checkResults_onMonster = function (ajax, aslice) {
        try {
            ajax = ajax || false;
            var slice = ajax ? $j(aslice) : $j("#app_body"),
                cM = {}, // In the interest of saving bits to be more environmentally friendly, currentMonster has been renamed cM
                time = [],
                tempDiv = $j(),
                tempText = '',
                tempSetting = 0,
                stunStart = 0,
                tempArr = [],
                counter = 0,
                totalCount = 0,
                ind = 0,
                len = 0,
                searchStr = '',
                searchRes = $j(),
                achLevel = 0,
                maxDamage = 0,
                maxToFortify = 0,
                isTarget = false,
                KOBenable = false,
                KOBbiasHours = 0,
                KOBach = false,
                KOBmax = false,
                KOBminFort = false,
                KOBtmp = 0,
                KOBtimeLeft = 0,
                KOBbiasedTF = 0,
                KOBPercentTimeRemaining = 0,
                KOBtotalMonsterTime = 0,
                monsterDiv = $j(),
                actionDiv = $j(),
                damageDiv = $j(),
                monsterInfo = {},
                targetFromfortify = {},
                tStr = '',
                tNum = 0,
				link = '',
                tBool = false,
                fMonstStyle = '',
                nMonstStyle = '',
                id = 0,
                userName = '',
                siegeLevel = 0,
                siegeLimit = 0,
                mName = '',
                feedMonster = '',
                md5 = '',
                page = $j(".game", ajax ? slice : $j("#globalContainer")).eq(0).attr("id"),
                matches = true,
                ctaDiv = $j(),
                dragonDiv = $j(".dragonContainer", slice),
                dleadersDiv = $j("td:eq(1) div[style*='bold']:eq(0) div:last", dragonDiv),
				dleadersDiv2,
                maxJoin = dleadersDiv.text().regex(/(\d+)/),
                countJoin = 0,
                it = 0,
                jt = 0,
                lastmd5 = monster.lastClick,
                groups = {},
                groupMatch = false,
                found = false;

            if ($u.hasContent($j("#app_body div[style*='no_monster_back.jpg']"))) {
                con.log(1, "Deleting monster that has expired",lastmd5);
				monster.deleteItem(lastmd5);
                return false;
            }

            monsterDiv = $j("div[style*='dragon_title_owner'],div[style*='monster_header_'],div[style*='monster_'][style*='_title'],div[style*='monster_'][style*='_header'],div[style*='boss_'][style*='_header'],div[style*='boss_header_'],div[style*='festival_monsters_top_']", slice);

            monster.lastClick = null;

            // new monster layout logic
            if (dleadersDiv.text() === '') {
                dleadersDiv2 = $j("div[id*='leaderboard_0']")[0].children;

                maxJoin = dleadersDiv2[0].children[1].innerHTML.regex(/(\d+)/);
                /* this is the begining of logic that will loop through the leaders and count them for the X/Y stuff, not really important so I'm skipping it for now
                for (var ii = 1; ii < dleadersDiv2.length; ii++) {              // start at 1 to skip the title 'Damage Leaders:'
                    if (dleadersDiv2[ii].children.length > 0) {
                        con.log (1, "dleadersDiv2 each", ii, dleadersDiv2[ii].children.length, dleadersDiv2[ii], dleadersDiv2[ii].innerHTML);
                    }
                }*/
            } else { // this is for monster still on the old style, Tower 1, Tower 2, Conquest
                con.log(3, "Damage Leaders", dleadersDiv.text(), maxJoin);
                tempDiv = $j("td[colspan='2']:contains('Levels'),td[colspan='2']:contains('Allies')", dragonDiv);
                if ($u.hasContent(tempDiv)) {
                    tempDiv.each(function (index) {
                        $j(this).parent().attr("id", "mark" + index);
                    });

                    tempDiv.each(function (index) {
                        var group = $j(this),
                            levels = $j("b", group).text(),
                            start = levels.regex(/Levels (\d+)/),
                            max = group.text().trim().innerTrim().replace(levels, '').trim(),
                            maxNum = max.regex(/(\d+)/),
                            count = group.parent().nextUntil("#mark" + (index + 1)).find("a[href*='keep.php']").length;

                        con.log(3, "groups", index, levels, start, maxNum, count);
                        groups[levels] = {
                            'level': start,
                            'max': maxNum,
                            'count': count
                        };

                        countJoin += count;
                        if (!feed.isScan && !ajax) {
                            group.html("<div><b>" + levels + "</b> [" + count + "/" + maxNum + " max]</div>");
                        }

                        group = null;
                        levels = null;
                    });
                } else {
                    tempDiv = $j("table:eq(1) a", dragonDiv);
                    countJoin = tempDiv.length;
                }
            }

            groups.total = {
                'max': maxJoin,
                'count': countJoin
            };

            con.log(3, "groups", groups);
            if (!feed.isScan && !ajax) {
                dleadersDiv.html("[" + countJoin + "/" + maxJoin + "max]");
            }

            if ((feed.isScan || ajax) && $u.hasContent(feed.scanRecord.page) && feed.scanRecord.page !== page) {
                page = feed.scanRecord.page;
                con.log(2, "Page mismatch so using feed.scanRecord page", page, feed.scanRecord.page);
                if (config.getItem("DebugLevel", 1) > 1) {
                    $j().alert("Page mismatch so using feed.scanRecord page<br />" + page + '<br />' + feed.scanRecord.page);
                }
            }

            if (!feed.isScan && !ajax) {
                battle.checkResults();
                caap.chatLink(slice, "#chat_log div[style*='hidden'] div[style*='320px']");
            }

            if ($u.hasContent(monsterDiv)) {
                fMonstStyle = monsterDiv.attr("style").regex(/(festival_monsters_top_\S+\.jpg)/);
                con.log(5, "fMonstStyle", fMonstStyle);
                if (!$u.hasContent(fMonstStyle)) {
                    nMonstStyle = monsterDiv.attr("style").regex(/(monster_header_\S+\.jpg|monster_\S+\_title.jpg|monster_\S+\_header.jpg|boss_\S+\_header.jpg|boss_header_\S+\.jpg)/);
                }

                if ($u.hasContent(fMonstStyle) || $u.hasContent(nMonstStyle)) {
                    tempDiv = monsterDiv.find(":contains('summoned'):last,:contains('Summoned'):last");
                    if ($u.hasContent(fMonstStyle)) {
                        tempDiv = $j( "div :contains('Summoned'),:contains('summoned')", monsterDiv).last();
                        if ($u.hasContent(tempDiv)) {
                            tempText = $u.setContent(tempDiv.text(), '').trim().innerTrim().replace(/summoned/i, monster.getFestName(fMonstStyle));
                        } else {
                            con.warn("1:Festival monster missing summoned string!");
                        }
                    } else {
                        tempDiv = $j( "div :contains('Summoned'),:contains('summoned')", monsterDiv).last();
                        if ($u.hasContent(tempDiv)) {
                            tempText = $u.setContent(tempDiv.text(), '').trim().innerTrim().replace(/ summoned/i, "'s " + monster.getNewName(nMonstStyle));
                        } else {
                            con.warn("1:Normal monster 1 missing summoned string!");
                        }
                    }
                } else {
                    // old pages - shouldn't exist any more
                    tempText = $u.setContent(monsterDiv.children(":eq(2)").text(), '').trim().innerTrim();
                }

                con.log(5, "summoned text", tempText);
            } else {
                monsterDiv = $j("div[style*='nm_top']", slice);
                if ($u.hasContent(monsterDiv)) {
                    tempText = $u.setContent(monsterDiv.children(":eq(0)").children(":eq(0)").text(), '').trim().innerTrim();
                    tempDiv = $j("div[style*='nm_bars']", slice);
                    if ($u.hasContent(tempDiv)) {
                        tempText += ' ' + $u.setContent(tempDiv.children(":eq(0)").children(":eq(0)").children(":eq(0)").siblings(":last").children(":eq(0)").text(), '').trim().replace("'s Life", "");
                    } else {
                        con.warn("Problem finding nm_bars");
                        slice = null;
                        tempDiv = null;
                        monsterDiv = null;
                        actionDiv = null;
                        damageDiv = null;
                        ctaDiv  = null;
                        dragonDiv = null;
                        dleadersDiv = null;
                        dleadersDiv2 = null;
                        return;
                    }
                } else {
                    if ($u.hasContent(fMonstStyle)) {
                        $j().alert(fMonstStyle + "<br />I do not know this monster!<br />Please inform me.");
                    }
					con.warn("Problem finding dragon_title_owner and nm_top");

					//feed.checked(monster.getItem(''));
                    slice = null;
                    tempDiv = null;
                    monsterDiv = null;
                    actionDiv = null;
                    damageDiv = null;
                    ctaDiv  = null;
                    dragonDiv = null;
                    dleadersDiv = null;
                    dleadersDiv2 = null;
                    return;
                }
            }

            if ($u.hasContent(monsterDiv)) {
                id = $u.setContent($j("input[name*='casuser']").eq(0).attr("value"), '');
                id = $u.setContent(id, $u.setContent($j("img[src*='profile.ak.fbcdn.net']", monsterDiv).attr("uid"), '').regex(/(\d+)/));
                id = $u.setContent(id, $u.setContent($j(".fb_link[href*='profile.php']", monsterDiv).attr("href"), '').regex(/id=(\d+)/));
                id = $u.setContent(id, $u.setContent($j("img[src*='graph.facebook.com']", monsterDiv).attr("src"), '').regex(/\/(\d+)\//));
                if ($j("input[name*='guild_creator_id']").length > 0) {
                    id = $u.setContent(id, $j("input[name*='guild_creator_id']")[0].value + '_' + $j("input[name='slot']")[0].value + '_' + $j("input[name*='monster_slot']")[0].value);
                }
id = $u.setContent(id, $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/guild_id=(\d+)/)
                        + '_' + $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/&slot=(\d+)/)
                        + '_' + $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/monster_slot=(\d+)/));
                id = $u.setContent(id, $u.setContent($j("#app_body #chat_log button[onclick*='ajaxSectionUpdate']").attr("onclick"), '').regex(/user=(\d+)/));
                id = $u.setContent(id, $u.setContent($j("#app_body #monsterChatLogs img[src*='ldr_btn_chatoff.jpg']").attr("onclick"), '').regex(/user=(\d+)/));
                id = $u.setContent(id, (feed.isScan || ajax) ? feed.scanRecord.id : 0);
                con.log(3, "USER ID", id);
                if (id === 0 || !$u.hasContent(id)) {
                    con.warn("1:Unable to get id!");
                    if (config.getItem("DebugLevel", 1) > 1) {
                        $j().alert("1:Unable to get id!");
                    }

                    slice = null;
                    tempDiv = null;
                    monsterDiv = null;
                    actionDiv = null;
                    damageDiv = null;
                    ctaDiv  = null;
                    dragonDiv = null;
                    dleadersDiv = null;
                    dleadersDiv2 = null;
                    return;
                }

                feedMonster = tempText.replace(new RegExp(".+'s (.+)$"), '$1').replace(/,.*/,'');
                userName = tempText.replace(feedMonster, '').trim();
                feedMonster = feedMonster.trim().innerTrim().toLowerCase().ucWords();

				if (!$u.hasContent(feedMonster)) {
                    con.warn("1:Unable to get monster string!!", tempText);
                }

                if (id === caap.stats.FBID) {
                    con.log(2, "Your monster found", tempText);
                    userName = 'Your';
                }
            } else {
                con.warn("checkResults_onMonster monsterDiv issue!");
            }

            mName = userName + ' ' + feedMonster;
/*            if (feed.isScan || ajax) {
                if (feed.scanRecord.id !== id) {
                    con.warn("User ID doesn't match!");
                    if (config.getItem("DebugLevel", 1) > 1) {
                        $j().alert("User ID doesn't match!<br />" + id + '<br />' + feed.scanRecord.id);
                    }
                    matches = false;
                }

                if (feed.scanRecord.monster !== feedMonster) {
                    con.warn("Monster doesn't match!");
                    if (config.getItem("DebugLevel", 1) > 1) {
                        $j().alert("Monster doesn't match!<br />" + feed.scanRecord.monster + '<br />' + feedMonster);
                    }
                    matches = false;
                }

                if (!feed.scanRecord.url.hasIndexOf(page)) {
                    con.warn("Page doesn't match!");
                    if (config.getItem("DebugLevel", 1) > 1) {
                        $j().alert("Page doesn't match!<br />" + page + '<br />' + feed.scanRecord.url);
                    }
                    matches = false;
                }

                if (!matches) {
                    //feed.checked(monster.getItem(''));
                }
            }
*/
			link = monster.cleanLink();
            md5 = link.MD5();
/*
            if ((feed.isScan || ajax) && matches && feed.scanRecord.md5 !== md5) {
                con.warn("MD5 mismatch!", md5, feed.scanRecord.md5);
                if (config.getItem("DebugLevel", 1) > 1) {
                    $j().alert("md5 mismatch!<br />" + md5 + '<br />' + feed.scanRecord.md5);
                }

                throw "MD5 mismatch!";
            }
*/
//            which = $u.hasContent($j("#action_logs td[class='dragonContainer']:first td[valign='top']:first a[href*='user=" + caap.stats.FBID + "'], #leaderboard_0 a[href*='user=" + caap.stats.FBID + "']", slice)) ? 'monster' : 'feed';

            cM = monster.getItem(md5); // In the interest of saving bits to be more environmentally friendly, currentMonster has been renamed cM
			cM.userId = cM.userId || id;
			cM.name = mName;
			cM.monster = feedMonster;
            cM.userName = userName;
            cM.md5 = md5;
			cM.link = link;
			tNum = cM.link.regex(/mpool=(\d+)/);
			cM.mpool = $u.hasContent(tNum) ? '&mpool=' + tNum : '';
			tStr = cM.link.regex(/mid=(\S+)[&]*/);
			cM.mid = $u.hasContent(tStr) ? '&mid=' + tStr : '';
			tNum = cM.link.regex(/rix=(\d+)/);
			cM.rix = $u.hasContent(tNum) ? tNum : -1;

            cM.hide = false;
            cM.fImg = $u.setContent(fMonstStyle, '');
            monsterInfo = monster.getInfo(cM);
            con.log(2, "On Monster info: " + mName, md5, cM, cM.monster, monsterInfo, caap.stats.reviewPages);
            if ($u.hasContent(monsterInfo) && $u.hasContent(monsterInfo.levels)) {
                for (it = 0; it < monsterInfo.levels.length; it += 1) {
                    groupMatch = false;
                    for (jt in groups) {
                        if (groups.hasOwnProperty(jt)) {
                            if (groups[jt].level === monsterInfo.levels[it]) {
                                cM.joinable['group' + it] = groups[jt];
                                groupMatch = true;
                            }
                        }
                    }

                    if (!groupMatch) {
                        cM.joinable['group' + it] = {
                            'level': monsterInfo.levels[it],
                            'max': monsterInfo.join[it],
                            'count': 0
                        };
                    }
                }
            }

            cM.joinable.total = groups.total;
            con.log(3, "Joinable", cM.joinable);
            if (cM.monster === 'The Deathrune Siege') {
                tempDiv = $j("div[style*='raid_back']", slice);
                if ($u.hasContent(tempDiv)) {
                    if ($u.hasContent($j("img[src*='raid_1_large.jpg']", tempDiv))) {
                        cM.type = 'Raid I';
                    } else if ($u.hasContent($j("img[src*='raid_b1_large.jpg']", tempDiv))) {
                        cM.type = 'Raid II';
                    } else if ($u.hasContent($j("img[src*='raid_1_large_victory.jpg']", tempDiv))) {
                        con.log(2, "Siege Victory!");
                        cM.hide = true;
                        cM.joinable = {};
                    } else {
                        con.log(2, "Problem finding raid image! Probably finished.");
                        cM.hide = true;
                        cM.joinable = {};
                    }

                    con.log(2, "Raid Type", cM.type);
                } else {
                    con.warn("Problem finding raid_back");
                    slice = null;
                    tempDiv = null;
                    monsterDiv = null;
                    actionDiv = null;
                    damageDiv = null;
                    ctaDiv  = null;
                    dragonDiv = null;
                    dleadersDiv = null;
                    dleadersDiv2 = null;
                    return;
                }
            }

            cM.review = Date.now();
            // Extract info
            tempDiv = $j("#monsterTicker", slice);
            if ($u.hasContent(tempDiv)) {
                time = $u.setContent(tempDiv.text(), '').regex(/(\d+):(\d+):(\d+)/);
            } else {
                if (caap.hasImage("dead.jpg")) {
                    cM.hide = true;
                    cM.joinable = {};
                } else {
                    con.warn("Could not locate Monster ticker.");
                }
            }

            if ($u.hasContent(time) && time.length === 3 && monsterInfo && monsterInfo.fort) {
                cM.fortify = cM.type === "Deathrune" || cM.type === 'Ice Elemental' ? 100 : 0;
                switch (monsterInfo.defense_img) {
                    case 'bar_dispel.gif':
                        tempDiv = $j("img[src*='" + monsterInfo.defense_img + "']", slice).parent();
                        if ($u.hasContent(tempDiv)) {
                            cM.fortify = (100 - tempDiv.getPercent('width')).dp(2);
                            tempDiv = tempDiv.parent().parent().siblings().eq(0).children().eq(0).children().eq(1);
                            found = true;
                        } else {
                            cM.fortify = 100;
                            con.warn("Unable to find defense bar", monsterInfo.defense_img);
                        }

                        break;
                    case 'seamonster_ship_health.jpg':
                        tempDiv = $j("img[src*='" + monsterInfo.defense_img + "']", slice).parent();
                        if ($u.hasContent(tempDiv)) {
                            cM.fortify = tempDiv.getPercent('width').dp(2);
                            found = true;
                            if (monsterInfo.repair_img) {
                                found = false;
                                tempDiv = $j("img[src*='" + monsterInfo.repair_img + "']", slice).parent();
                                if ($u.hasContent(tempDiv)) {
                                    cM.fortify = (cM.fortify * (100 / (100 - tempDiv.getPercent('width')))).dp(2);
                                    found = true;
                                } else {
                                    cM.fortify = 100;
                                    con.warn("Unable to find repair bar", monsterInfo.repair_img);
                                }
                            }

                            if (found) {
                                tempDiv = tempDiv.parent().parent().siblings().eq(0).children().eq(0).children().eq(1);
                            }
                        } else {
                            cM.fortify = 100;
                            con.warn("Unable to find defense bar", monsterInfo.defense_img);
                        }

                        break;
                    case 'nm_green.jpg':
                        tempDiv = $j("img[src*='" + monsterInfo.defense_img + "']", slice).parent();
                        if ($u.hasContent(tempDiv)) {
                            cM.fortify = tempDiv.getPercent('width').dp(2);
                            found = true;
                            tempDiv = tempDiv.parent();
                            if ($u.hasContent(tempDiv)) {
                                cM.strength = tempDiv.getPercent('width').dp(2);
                                tempDiv = tempDiv.parent().siblings().eq(0).children().eq(0);
                            } else {
                                cM.strength = 100;
                                con.warn("Unable to find defense bar strength");
                            }
                        } else {
                            cM.fortify = 100;
                            cM.strength = 100;
                            con.warn("Unable to find defense bar fortify");
                        }

                        break;
                    default:
                        con.warn("No match for defense_img", monsterInfo.defense_img);
                }

                if (!feed.isScan && !ajax && found && config.getItem("monsterEnableLabels", true)) {
                    tempText = tempDiv.text().trim();
                    if (!$u.hasContent(tempDiv.children()) && (tempText.toLowerCase().hasIndexOf('health') || tempText.toLowerCase().hasIndexOf('defense') || tempText.toLowerCase().hasIndexOf('armor'))) {
                        tempDiv.text(tempText + " (" + (monsterInfo.defense_img === 'bar_dispel.gif' ? (100 - cM.fortify).dp(2) : cM.fortify) + "%" +
                            (monsterInfo.defense_img === 'nm_green.jpg' ? '/' + cM.strength + '%' : '') + ")");
                    }
                }
            }

            // Get damage done to monster
            actionDiv = $j("#action_logs", slice);
            damageDiv = $j("td[class='dragonContainer']", actionDiv);
            if ($u.hasContent(damageDiv)) {
				damageDiv = $j("td[class='dragonContainer']:first td[valign='top']:first a[href*='user=" + caap.stats.FBID + "']:first", actionDiv);
				if ($u.hasContent(damageDiv)) { // Make sure player has done damage.
					if (monsterInfo && monsterInfo.defense) {
						tempArr = $u.setContent(damageDiv.parent().parent().siblings(":last").text(), '').trim().innerTrim().regex(/([\d,]+ dmg) \/ ([\d,]+ def)/);
						if ($u.hasContent(tempArr) && tempArr.length === 2) {
							cM.attacked = $u.setContent(tempArr[0], '0').numberOnly();
							cM.defended = $u.setContent(tempArr[1], '0').numberOnly();
							cM.damage = cM.attacked + cM.defended;
						} else {
							con.warn("Unable to get attacked and defended damage");
						}
					} else if (cM.monster === 'The Deathrune Siege') {
						cM.attacked = $u.setContent(damageDiv.parent().siblings(":last").text(), '0').numberOnly();
						cM.damage = cM.attacked;
					} else {
						cM.attacked = $u.setContent(damageDiv.parent().parent().siblings(":last").text(), '0').numberOnly();
						cM.damage = cM.attacked;
					}

					if (!feed.isScan && !ajax) {
						damageDiv.parents("tr").eq(0).css('background-color', (gm ? gm.getItem("HighlightColor", '#C6A56F', hiddenVar) : '#C6A56F'));
					}
					//cM.hide = true;
				}
            } else {
                damageDiv = $j("div[id*='leaderboard_0']");
                if ($u.hasContent(damageDiv)) {
                    damageDiv = $j("a[href*='user=" + caap.stats.FBID + "']", damageDiv[0].children);
					if ($u.hasContent(damageDiv)) {
						if (monsterInfo && monsterInfo.defense) {
							tempArr = $u.setContent(damageDiv.parent().parent()[0].children[4].innerHTML).trim().innerTrim().regex(/([\d,]+ dmg) \/ ([\d,]+ def)/);
							if ($u.hasContent(tempArr) && tempArr.length === 2) {
								cM.attacked = $u.setContent(tempArr[0], '0').numberOnly();
								cM.defended = $u.setContent(tempArr[1], '0').numberOnly();
								cM.damage = cM.attacked + cM.defended;
							} else {
								con.warn("Unable to get attacked and defended damage");
							}
						/*  Not sure if this needed for the new layout
						} else if(cM.monster === 'The Deathrune Siege') {
							cM.attacked = $u.setContent(damageDiv.parent().siblings(":last").text(), '0').numberOnly();
							cM.damage = cM.attacked;
						*/
						} else {
							tempArr = $u.setContent(damageDiv.parent().parent()[0].children[4].innerHTML).trim().innerTrim().regex(/([\d,]+ dmg) \/ ([\d,]+)/);
							con.log(2, "damageDiv.parent().parent()[0].children[4].innerHTML",damageDiv.parent().parent()[0].children[4].innerHTML);
							if ($u.hasContent(tempArr) && tempArr.length >0) {
								/* Cronus Astaroth damage count */
								cM.attacked = $u.setContent(tempArr[0], '0').numberOnly();
								cM.damage = cM.attacked;
							} else {
								cM.attacked = $u.setContent(damageDiv.parent().parent()[0].children[4].innerHTML, '0').numberOnly();
								cM.damage = cM.attacked;
							}
						}
						if (!feed.isScan && !ajax) {
							damageDiv.parent().parent().eq(0).css('background-color', (gm ? gm.getItem("HighlightColor", '#C6A56F', hiddenVar) : '#C6A56F'));
						}
						//cM.hide = true;
					}
                } else {
                    con.log(2, "Unable to find a damage table");
                }
            }
			if (monster.damaged(cM)) {
				if (cM.status == 'Join') {
					con.log(1, 'Joined a feed monster with ' + cM.damage, cM);
					cM.status = 'Attack';
				}
			} else { 
				cM.status = 'Join';
			}
			
            tBool = cM.monster === "The Deathrune Siege" ? true : false;

			monsterDiv = $j("img[src*='monster_health_background.jpg']", slice);
            monsterDiv = $u.hasContent(monsterDiv) ? monsterDiv.parent() : $j("img[src*='nm_red.jpg']", slice).parent();
            //con.log(2, 'monster time', monsterInfo, monsterDiv, monsterDiv, time);

            if ($u.hasContent(time) && time.length === 3 && $u.hasContent(monsterDiv)) {
                cM.time = time;
                if ($u.hasContent(monsterDiv)) {
                    cM.life = monsterDiv.getPercent('width').dp(2);
                    if (!feed.isScan && !ajax && config.getItem("monsterEnableLabels", true)) {
                        tempDiv = monsterDiv.siblings().eq(0).children().eq(0);
                        if (!$u.hasContent(tempDiv)) {
                            tempDiv = monsterDiv.parent().parent().siblings().eq(0);
                            if ($u.hasContent(tempDiv.children())) {
                                tempDiv = tempDiv.children().eq(0);
                            }
                        }

                        tempText = tempDiv.text().trim();
                        if (!$u.hasContent(tempDiv.children()) && (tempText.toLowerCase().hasIndexOf('life') || tempText.toLowerCase().hasIndexOf('soldiers'))) {
                            tempDiv.text(tempText + " (" + cM.life + "%)");
                        }
                    }
                } else {
                    con.warn("Could not find monster health div.");
                }

                if (cM.life && !monsterInfo) {
                    monster.setItem(cM);
                    con.warn('Unknown monster', cM);
                    slice = null;
                    tempDiv = null;
                    monsterDiv = null;
                    actionDiv = null;
                    damageDiv = null;
                    ctaDiv  = null;
                    dragonDiv = null;
                    dleadersDiv = null;
                    return;
                }

                if ($u.hasContent(damageDiv) && monsterInfo && monsterInfo.alpha) {
                    // Character type stuff
                    monsterDiv = $j("div[style*='nm_bottom'],div[style*='stance_plate_bottom']", slice);
                    if ($u.hasContent(monsterDiv)) {
                        tempText = $u.setContent(monsterDiv.children().eq(0).children().text(), '').trim().innerTrim();
                        if (tempText) {
                            con.log(4, "Character class text", tempText);
                            tStr = tempText.regex(/Class: (\S+) /);
                            if ($u.hasContent(tStr)) {
                                cM.charClass = tStr;
                                con.log(4, "character", cM.charClass);
                            } else {
                                cM.charClass = 'Cleric';
                                con.warn("Can't get character", tempText);
                            }

                            tStr = tempText.regex(/Tip: ([\w ]+) Status/);
                            if ($u.hasContent(tStr)) {
                                cM.tip = tStr;
                                con.log(4, "tip", cM.tip);
                            } else {
								cM.tip = 'fortify';
                                con.warn("Can't get tip", tempText);
                            }

                            tempArr = tempText.regex(/Status Time Remaining: (\d+):(\d+):(\d+)\s*/);
                            if ($u.hasContent(tempArr) && tempArr.length === 3) {
                                cM.stunTime = Date.now() + (tempArr[0] * 60 * 60 * 1000) + (tempArr[1] * 60 * 1000) + (tempArr[2] * 1000);
                                
                                // If we haven't set a target time for stunning yet, or the target time was for the phase before this one,
                                // or the WhenStun setting has changed, set a new stun target time.
                                tempSetting = monster.parseCondition("cd", cM.conditions);
                                tempSetting = $u.isNumber(tempSetting) ? tempSetting.toString() : config.getItem('WhenStun','Immediately');
                                tempSetting = tempSetting == 'Immediately' ? 6 : tempSetting == 'Never' ? 0 : tempSetting.parseFloat();
                                stunStart = cM.stunTime - 6 * 60 * 60 * 1000;
                                con.log(5,'Checking stuntarget',tempSetting, $u.makeTime(stunStart, caap.timeStr(true)),$u.makeTime(cM.stunTime, caap.timeStr(true)));
                                
                                if (!cM.stunTarget || cM.stunTarget < stunStart || cM.stunSetting !== tempSetting) {
                                    cM.stunSetting = tempSetting;

                                    // Add +/- 30 min so multiple CAAPs don't all stun at the same time
                                    cM.stunTarget = cM.stunSetting == 6 ? stunStart : cM.stunSetting == 0 ? cM.stunTime
                                            : cM.stunTime - (tempSetting - 0.5 + Math.random()) * 60 * 60 * 1000;
                                    con.log(5,'New stun target', $u.makeTime(cM.stunTarget, caap.timeStr(true)));
                                }

                            } else {
                                cM.stunTime = Date.now() + (cM.time[0] * 60 * 60 * 1000) + (cM.time[1] * 60 * 1000) + (cM.time[2] * 1000);
                                con.warn("Can't get statusTime", tempText);
                            }

                            tempDiv = $j("img[src*='nm_stun_bar']", monsterDiv);
                            if ($u.hasContent(tempDiv)) {
                                tempText = tempDiv.getPercent('width').dp(2);
                                con.log(4, "Stun bar percent text", tempText);
                                if (tempText >= 0) {
                                    cM.stun = tempText;
                                    con.log(4, "stun", cM.stun);
                                } else {
                                    con.warn("Can't get stun bar width");
                                }
                            } else {
                                tempArr = cM.tip.split(" ");
                                if ($u.hasContent(tempArr)) {
                                    tempText = tempArr[tempArr.length - 1].toLowerCase();
                                    tempArr = ["strengthen", "heal","fortify"];
                                    if (tempText && tempArr.hasIndexOf(tempText)) {
                                        if (tempText === tempArr[0]) {
                                            cM.stun = cM.strength;
                                        } else if (tempText === tempArr[1]) {
                                            cM.stun = cM.health;
                                        } else if (tempText === tempArr[2]) {
                                            cM.stun = cM.health;
                                        } else {
                                            con.warn("Expected strengthen or heal to match!", tempText);
                                        }
                                    } else {
                                        con.warn("Expected strengthen or heal from tip!", tempText);
                                    }
                                } else {
                                    con.warn("Can't get stun bar and unexpected tip!", cM.tip);
                                }
                            }

                            if (cM.charClass && cM.tip && cM.stun !== -1) {
                                cM.stunDo = cM.charClass === '?' ? '' : new RegExp(cM.charClass).test(cM.tip) && cM.stun < 100;
                                if (cM.stunDo) {
                                    con.log(2,"Cripple/Deflect after " + $u.makeTime(cM.stunTarget, caap.timeStr(true)), cM.stunTime, cM.stunTarget, tempSetting, cM.stunSetting, stunStart, Date.now() > cM.stunTarget);
                                }
                                cM.stunDo = cM.stunDo && Date.now() > cM.stunTarget;
                                cM.stunType = '';
                                if (cM.stunDo) {
                                    con.log(2, "Do character specific attack", cM.stunDo);
                                    tempArr = cM.tip.split(" ");
                                    if ($u.hasContent(tempArr)) {
                                        tempText = tempArr[tempArr.length - 1].toLowerCase();
                                        tempArr = ["strengthen", "cripple", "heal", "deflection","fortify"];
                                        if (tempText && tempArr.hasIndexOf(tempText)) {
                                            cM.stunType = tempText.replace("ion", '');
                                            con.log(2, "Character specific attack type", cM.stunType);
                                        } else {
                                            con.warn("Type does match list!", tempText);
                                        }
                                    } else {
                                        con.warn("Unable to get type from tip!", cM);
                                    }
                                } else {
                                    con.log(3, "Tip does not match class or stun maxed", cM);
                                }
                            } else {
                                con.warn("Missing 'class', 'tip' or 'stun'", cM);
                            }
                        } else {
                            con.warn("Missing tempText");
                        }
                    } else {
                        con.warn("Missing nm_bottom");
                    }
                }

                if (monsterInfo) {
                    if (monsterInfo.siege) {
                        cM.miss = $u.setContent($u.setContent($j("div[style*='monster_layout'],div[style*='nm_bottom'],div[style*='raid_back']", slice).text(), '').trim().innerTrim().regex(/Need (\d+) more/i), 0);
                        for (ind = 0, len = monsterInfo.siege_img.length; ind < len; ind += 1) {
                            searchStr += "img[src*='" + monsterInfo.siege_img[ind] + "']";
                            if (ind < len - 1) {
                                searchStr += ",";
                            }
                        }

                        searchRes = $j(searchStr, slice);
                        if ($u.hasContent(searchRes)) {
                            totalCount = cM.monster === "The Deathrune Siege" ? $u.setContent(searchRes.attr("src"), '').basename().replace(new RegExp(".*(\\d+).*", "gi"), "$1").parseInt() : searchRes.size() + ($j('#objective_list_section').length ? 0 : 1);
                        }

                        cM.phase = Math.min(totalCount, monsterInfo.siege);
                        if ($u.isNaN(cM.phase) || cM.phase < 1) {
                            cM.phase = 1;
                        }
						tempDiv = $j("#app_body div[style*='button_cost_stamina_']");
						if (tempDiv.length) {
							cM.siegeLevel = tempDiv.attr('style').match(/button_cost_stamina_(\d+)/)[1];
							siegeLimit = !cM.conditions ? false : cM.conditions.match(':!s') ? 0 : monster.parseCondition("s", cM.conditions);
							siegeLimit = siegeLimit !== false ? siegeLimit : config.getItem('siegeUpTo','Never') === 'Never' ? 0 : config.getItem('siegeUpTo','Never');
							
							cM.doSiege = cM.siegeLevel <= siegeLimit && cM.phase > 1 && caap.hasImage('siege_btn.gif') && cM.damage > 0;
							con.log(2, "Page Review " + (cM.doSiege ? 'DO siege ' : "DON'T siege ") + cM.name, cM.siegeLevel, siegeLimit, cM.phase, config.getItem('siegeUpTo','None'));
							
						} else {
							cM.doSiege = false;
							cM.siegeLevel = 1000;
						}
                    }

                    cM.t2k = monster.t2kCalc(cM);
                }
            } else {
				if (monster.damaged(cM)) {
					cM.status = (caap.hasImage('collect_reward', slice) || caap.hasImage('collectreward', slice)) ? 'Collect' : 'Done';
					cM.color = 'grey';
					cM.joinable = {};
					monster.setItem(cM);
				} else {
					con.log(2, "Deleting dead monster " + cM.name + " off Feed", cM)
					monster.deleteItem(cM.md5);
				}

                slice = null;
                tempDiv = null;
                monsterDiv = null;
                actionDiv = null;
                damageDiv = null;
                ctaDiv  = null;
                dragonDiv = null;
                dleadersDiv = null;
                return;
            }

            if ($u.hasContent(damageDiv)) {
                achLevel = monster.parseCondition('ach', cM.conditions);
                achLevel = achLevel === 0 ? 1 : achLevel; // Added to prevent ach === 0 defaulting to false 
                if (monsterInfo && achLevel === false) {
                    achLevel = monsterInfo.ach;
                }

                maxDamage = monster.parseCondition('max', cM.conditions);
                maxDamage = maxDamage === 0 ? 1 : maxDamage;  // Added to prevent max === 0 defaulting to false 
                maxToFortify = monster.parseCondition('f%', cM.conditions);
                maxToFortify = maxToFortify !== false ? maxToFortify : config.getItem('MaxToFortify', 0);
                targetFromfortify = state.getItem('targetFromfortify', new monster.energyTarget());

                // Start of Keep On Budget (KOB) code Part 1 -- required variables
                //con.log(2, 'Start of Keep On Budget (KOB) Code');

                //default is disabled for everything
                KOBenable = false;

                //default is zero bias hours for everything
                KOBbiasHours = 0;

                //KOB needs to follow achievement mode for this monster so that KOB can be skipped.
                KOBach = false;

                //KOB needs to follow max mode for this monster so that KOB can be skipped.
                KOBmax = false;

                //KOB needs to follow minimum fortification state for this monster so that KOB can be skipped.
                KOBminFort = false;

                //create a temp variable so we don't need to call parseCondition more than once for each if statement
                KOBtmp = monster.parseCondition('kob', cM.conditions);
                if (KOBtmp !== false && $u.isNaN(KOBtmp)) {
                    con.log(2, 'KOB NaN branch');
                    KOBenable = true;
                    KOBbiasHours = 0;
                } else if (KOBtmp === false) {
                    con.log(5, 'KOB false branch');
                    KOBenable = false;
                    KOBbiasHours = 0;
                } else {
                    con.log(2, 'KOB passed value branch');
                    KOBenable = true;
                    KOBbiasHours = KOBtmp;
                }

                //test if user wants kob active globally
                if (!KOBenable && (gm ? gm.getItem('KOBAllMonters', false, hiddenVar) : false)) {
                    KOBenable = true;
                }

                //disable kob if in level up mode or if we are within 5 stamina of max potential stamina
                if (caap.inLevelUpMode() || caap.stats.stamina.num >= caap.stats.stamina.max - 5) {
                    KOBenable = false;
                }

                if (KOBenable) {
                    con.log(2, 'Level Up Mode: ', caap.inLevelUpMode());
                    con.log(2, 'Stamina Avail: ', caap.stats.stamina.num);
                    con.log(2, 'Stamina Max: ', caap.stats.stamina.max);

                    //log results of previous two tests
                    con.log(2, 'KOBenable: ', KOBenable);
                    con.log(2, 'KOB Bias Hours: ', KOBbiasHours);
                }

                //Total Time alotted for monster
                KOBtotalMonsterTime = $u.setContent(monsterInfo.duration,196);
                if (KOBenable) {
                    con.log(2, 'Total Time for Monster: ', KOBtotalMonsterTime);

                    //Total Damage remaining
                    con.log(2, 'HP left: ', cM.life);
                }

                //Time Left Remaining
                KOBtimeLeft = time[0] + (time[1] * 0.0166);
                if (KOBenable) {
                    con.log(2, 'TimeLeft: ', KOBtimeLeft);
                }

                //calculate the bias offset for time remaining
                KOBbiasedTF = KOBtimeLeft - KOBbiasHours;

                //for 7 day monsters we want kob to not permit attacks (beyond achievement level) for the first 24 to 48 hours
                // -- i.e. reach achievement and then wait for more players and siege assist clicks to catch up
                if (KOBtotalMonsterTime >= 168) {
                    KOBtotalMonsterTime = KOBtotalMonsterTime - (gm ? gm.getItem('KOBDelayStart', 48, hiddenVar) : 48);
                }

                //Percentage of time remaining for the currently selected monster
                KOBPercentTimeRemaining = Math.round(KOBbiasedTF / KOBtotalMonsterTime * 1000) / 10;
                if (KOBenable) {
                    con.log(2, 'Percent Time Remaining: ', KOBPercentTimeRemaining);
                }

                // End of Keep On Budget (KOB) code Part 1 -- required variables

                isTarget = (cM.name === state.getItem('targetFromraid', '') || cM.name === state.getItem('targetFrombattle_monster', '') || cM.name === targetFromfortify.name);

				con.log(2, 'MAX DAMAGE', maxDamage, cM.damage);
                if (maxDamage && cM.damage >= maxDamage) {

                    cM.color = 'red';
                    cM.over = 'max';
                    //used with KOB code
                    KOBmax = true;
                    //used with kob debugging
                    if (KOBenable) {
                        con.log(2, 'KOB - max activated');
                    }

                } else if (cM.fortify !== -1 && cM.fortify < config.getItem('MinFortToAttack', 1)) {
                    cM.color = 'purple';
                    //used with KOB code
                    KOBminFort = true;
                    //used with kob debugging
                    if (KOBenable) {
                        con.log(2, 'KOB - MinFort activated');
                    }

                } else if (cM.damage >= achLevel && (config.getItem('AchievementMode', false) || monster.parseCondition('ach', cM.conditions) !== false)) {
                    cM.color = 'darkorange';
                    cM.over = 'ach';
                    //used with KOB code
                    KOBach = true;
                    //used with kob debugging
                    if (KOBenable) {
                        con.log(2, 'KOB - achievement reached');
                    }

                }

                //Start of KOB code Part 2 begins here
                if (KOBenable && !KOBmax && !KOBminFort && KOBach && cM.life < KOBPercentTimeRemaining) {
                    //kob color
                    cM.color = 'magenta';
                    // this line is required or we attack anyway.
                    cM.over = 'max';
                    //used with kob debugging
                    if (KOBenable) {
                        con.log(2, 'KOB - budget reached');
                    }

                } else {
                    if (!KOBmax && !KOBminFort && !KOBach) {
                        //the way that the if statements got stacked, if it wasn't kob it was painted black anyway
                        //had to jump out the black paint if max, ach or fort needed to paint the entry.
                        cM.color = $u.bestTextColor(state.getItem("StyleBackgroundLight", "#E0C961"));
                    }
                }
                //End of KOB code Part 2 stops here.
            } else {
                cM.color = $u.bestTextColor(state.getItem("StyleBackgroundLight", "#E0C961"));
            }

            monster.setItem(cM);
            con.log(3, "cM", cM);
            monster.select(true);
            caap.updateDashboard(true);
            if (schedule.check('battleTimer')) {
                window.setTimeout(function () {
                    caap.setDivContent('monster_mess', '');
                }, 2000);
            }

            slice = null;
            tempDiv = null;
            monsterDiv = null;
            actionDiv = null;
            damageDiv = null;
            ctaDiv  = null;
            dragonDiv = null;
            dleadersDiv = null;
        } catch (err) {
            con.error("ERROR in checkResults_onMonster: " + err);
        }
    };
	
    caap.checkResults_expansion_monster_class_choose = function (ajax, aslice) {
        try {
			// Nothing to see here.
			return false;
        } catch (err) {
            con.error("ERROR in checkResults_onMonster: " + err);
        }
    };
	
}());
