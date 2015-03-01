/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

(function () {
    "use strict";

	worker.add('caap');
	
	worker.addAction({worker : 'caap', priority : 0, description : 'Setting Idle General', functionName : 'passiveGeneral'});	
	
	caap.checkResults = function(page) {
        try {
			switch (page) {
			case 'index' :
				if (config.getItem('AutoGift', false)) {
					gifting.collected();
					// Check for new gifts
					// A warrior wants to join your Army!
					// Send Gifts to Friends
					if ($u.hasContent(caap.resultsText) && /Send Gifts to Friends/.test(caap.resultsText)) {
						con.log(1, 'We have a gift waiting!');
						state.setItem('HaveGift', true);
					}

					var time = config.getItem('CheckGiftMins', 15);
					time = time < 15 ? 15 : time;
					schedule.setItem("ajaxGiftCheck", time * 60, 300);
				}
				
				arena.revengeCheck();
				break;

			default :
				break;
			}
        } catch (err) {
            con.error("ERROR in town.checkResults: " + err.stack);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                          PASSIVE GENERALS
/////////////////////////////////////////////////////////////////////

    caap.passiveGeneral = function () {
        try {
			var timedLoadoutCheck = general.timedLoadout();
			if (timedLoadoutCheck) {
//				con.log(5,"Idle Check paused",timedLoadoutCheck);
				return timedLoadoutCheck === 'change';
			}
//			con.log(2,"Idle Check equipped", timedLoadoutCheck, caap.stats.battleIdle);
			if (caap.stats.battleIdle != 'Use Current' ? general.Select(caap.stats.battleIdle) 
				: (config.getItem('IdleGeneral', 'Use Current') != 'Use Current') 
				? general.Select(state.getItem('lastLoadout', 'Use Current')) || general.Select(state.getItem('lastGeneral', 'Use Current'))
				: general.Select('IdleGeneral')) {
				return true;
			}
			state.setItem('lastLoadout', 'Use Current');
			state.setItem('lastGeneral', 'Use Current');
			return false;
        } catch (err) {
            con.error("ERROR in passiveGeneral: " + err);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                          BATTLING PLAYERS
/////////////////////////////////////////////////////////////////////

    caap.conquestUserId = function(record) {
        try {
            var conquestButton = $j(),
                form = $j(),
                inp = $j();

            conquestButton = caap.checkForImage(conquest.battles[config.getItem('ConquestType', 'Invade')]);
            if ($u.hasContent(conquestButton)) {
                form = conquestButton.parent().parent();
                if ($u.hasContent(form)) {
                    inp = $j("input[name='target_id']", form);
                    if ($u.hasContent(inp)) {
                        inp.attr("value", record.userId);
                        con.log(1, 'Attacking', record);
                        conquest.click(conquestButton);
                        conquestButton = null;
                        form = null;
                        inp = null;
                        return true;
                    }

                    con.warn("target_id not found in conquestForm");
                } else {
                    con.warn("form not found in conquestButton");
                }
            } else {
                con.warn("conquestButton not found");
            }

            conquestButton = null;
            form = null;
            inp = null;
            return false;
        } catch (err) {
            con.error("ERROR in conquestUserId: " + err);
            return false;
        }
    };

    caap.conquestWarnLevel = true;

    caap.checkCoins = function() {
        try {
            var whenconquest = config.getItem('WhenConquest', 'Never');
            if (whenconquest === 'Never') {
                caap.setDivContent('conquest_mess', 'Conquest off');
                return false;
            }
            if (!caap.oneMinuteUpdate('checkConquestTokens')) {
                return false;
            }

			caap.stats.guildTokens.num = $j('#persistHomeConquestPlateOpen').text().numberOnly();
			//con.log(2, 'CONQUEST TOKENS ' + caap.stats.guildTokens.num);

			if 	(caap.stats.guildTokens.num > caap.stats.guildTokens.max) {
                con.log(1, 'Checking max conquest coins', $u.setContent(caap.displayTime('conquest_token'), "Unknown"), caap.stats.guildTokens.num, caap.stats.guildTokens.max);
                caap.setDivContent('conquest_mess', 'Checking coins');
                if (caap.navigateTo('conquest_duel', 'conqduel_on.jpg')) {
                    return true;
                }
            }

            return false;
        } catch (err) {
            con.error("ERROR in checkCoins: " + err);
            return false;
        }
    };

	worker.addAction({worker : 'caap', priority : 500, description : 'Conquesting Players', functionName : 'conquestBattle'});
	
    caap.conquestBattle = function() {
        try {
            var whenconquest = '',
                targetRecord = {},
                targetId = 0,
                conquesttype = '',
                useGeneral = '',
                chainImg = '',
                tempDiv = $j(),
                button = $j(),
                conquestChainId = 0,
                it = 0,
                len = 0;

            whenconquest = config.getItem('WhenConquest', 'Never');
            if (whenconquest === 'Never') {
                caap.setDivContent('conquest_mess', 'Conquest off');
                button = null;
                tempDiv = null;
                return false;
            }

            if (!schedule.check("conquest_delay")) {
                con.log(4, 'Conquest delay attack', $u.setContent(caap.displayTime('conquest_delay'), "Unknown"));
                caap.setDivContent('conquest_mess', 'Conquest delay (' + $u.setContent(caap.displayTime('conquest_delay'), "Unknown") + ')');
                button = null;
                tempDiv = null;
                return false;
            }

            if (caap.stats.level >= 8 && caap.stats.health.num >= 10 && caap.stats.stamina < 0) {
                schedule.setItem("conquest_delay_stats", 0);
            }

            if (!schedule.check("conquest_delay_stats")) {
                con.log(4, 'Conquest delay stats', $u.setContent(caap.displayTime('conquest_delay_stats'), "Unknown"));
                caap.setDivContent('conquest_mess', 'Conquest stats (' + $u.setContent(caap.displayTime('conquest_delay_stats'), "Unknown") + ')');
                button = null;
                tempDiv = null;
                return false;
            }

			if (whenconquest === 'At Max Coins' && caap.stats.guildTokens.max >= 10 && caap.stats.guildTokens.num !== caap.stats.guildTokens.max) {
				con.log(4, 'Waiting for Max coins ' + caap.stats.guildTokens.num + '/' + caap.stats.guildTokens.max);
				caap.setDivContent('conquest_mess', 'Waiting Max coins ' + caap.stats.guildTokens.num + '/' + caap.stats.guildTokens.max + ' (' + $u.setContent(caap.displayTime('conquest_token'), "Unknown") + ')');
				state.setItem("ConquestChainId", 0);
				button = null;
				tempDiv = null;
				return false;
			}

			if (whenconquest === 'At X Coins' && caap.stats.guildTokens.num >= config.getItem('ConquestXCoins', 1)) {
				state.setItem('conquest_burn', true);
				con.log(1, 'Burn tokens ' + caap.stats.guildTokens.num + '/' + config.getItem('ConquestXCoins'));
			}

			con.log(4, 'Waiting X coins burn', state.getItem('conquest_burn', false));
			if (whenconquest === 'At X Coins' && caap.stats.guildTokens.num <= config.getItem('ConquestXMinCoins', 0)) {
				state.setItem('conquest_burn', false);
				con.log(4, '1:Waiting X coins ' + caap.stats.guildTokens.num + '/' + config.getItem('ConquestXCoins'));
				caap.setDivContent('conquest_mess', 'Waiting X coins ' + caap.stats.guildTokens.num + '/' + config.getItem('ConquestXCoins', 1) + ' (' + $u.setContent(caap.displayTime('conquest_token'), "Unknown") + ')');
				state.setItem("ConquestChainId", 0);
				button = null;
				tempDiv = null;
				return false;
			}

			if (whenconquest === 'At X Coins' && caap.stats.guildTokens.num < config.getItem('ConquestXCoins', 1) && !state.getItem('conquest_burn', false)) {
				state.setItem('conquest_burn', false);
				con.log(4, '2:Waiting X coins ' + caap.stats.guildTokens.num + '/' + config.getItem('ConquestXCoins'));
				caap.setDivContent('conquest_mess', 'Waiting X coins ' + caap.stats.guildTokens.num + '/' + config.getItem('ConquestXCoins', 1) + ' (' + $u.setContent(caap.displayTime('conquest_token'), "Unknown") + ')');
				state.setItem("ConquestChainId", 0);
				button = null;
				tempDiv = null;
				return false;
			}

			if (whenconquest === 'Coins Available' && caap.stats.guildTokens.num < 1) {
				con.log(4, 'Waiting Coins Available ' + caap.stats.guildTokens.num + '/1');
				caap.setDivContent('conquest_mess', 'Coins Available ' + caap.stats.guildTokens.num + '/1 (' + $u.setContent(caap.displayTime('conquest_token'), "Unknown") + ')');
				state.setItem("ConquestChainId", 0);
				button = null;
				tempDiv = null;
				return false;
			}

			caap.setDivContent('conquest_mess', 'Conquest Ready');

            if (caap.stats.level < 8) {
                schedule.setItem("conquest_token", 86400, 300);
                schedule.setItem("conquest_delay_stats", 86400, 300);
                if (caap.conquestWarnLevel) {
                    con.log(1, "conquest: Unlock at level 8");
                    caap.conquestWarnLevel = false;
                }

                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return false;
            }

            conquesttype = config.getItem('ConquestType', 'Invade');
            if (!caap.checkStamina('Conquest', 1)) {
                con.log(1, 'Not enough stamina for ', conquesttype);
                schedule.setItem("conquest_delay_stats", (caap.stats.stamina.ticker[0] * 60) + caap.stats.stamina.ticker[1], 300);
                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return false;
            }

            switch (conquesttype) {
            case 'Invade':
                useGeneral = 'InvadeGeneral';
                chainImg = conquest.battles.InvadeChain;
                if (general.LevelUpCheck(useGeneral)) {
                    useGeneral = 'LevelUpGeneral';
                    con.log(1, 'Using level up general');
                }

                break;
            case 'Duel':
                useGeneral = 'DuelGeneral';
                chainImg = conquest.battles.DuelChain;
                if (general.LevelUpCheck(useGeneral)) {
                    useGeneral = 'LevelUpGeneral';
                    con.log(1, 'Using level up general');
                }

                break;
            default:
                con.warn('Unknown conquest type ', conquesttype);
                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return false;
            }

            con.log(1, conquesttype, useGeneral);
            if (general.Select(useGeneral)) {
                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return true;
            }

            if (caap.navigateTo('conquest_duel', 'conqduel_on.jpg')) {
                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return true;
            }

            con.log(1, 'Chain target');
            // Check if we should chain attack
            tempDiv = $j("#app_body div[style*='war_fort_battlevictory.jpg']");
            con.log(1, 'Chain target victory check', tempDiv);
            if ($u.hasContent(tempDiv)) {
                con.log(1, 'Chain target victory!');
                button = $j("#app_body input[src*='" + chainImg + "']");
                con.log(1, 'Chain target button check', button);
                conquestChainId = state.getItem("ConquestChainId", 0);
                con.log(1, 'Chain target conquestChainId', conquestChainId);
                if ($u.hasContent(button) && $u.isNumber(conquestChainId) && conquestChainId > 0) {
                    caap.setDivContent('conquest_mess', 'Chain Attack In Progress');
                    con.log(1, 'Chaining Target', conquestChainId);
                    conquest.click(button);
                    state.setItem("ConquestChainId", 0);
                    button = null;
                    tempDiv = null;
                    return true;
                }

                state.setItem("ConquestChainId", 0);
            }

            con.log(1, 'Get on page target');
            targetId = $u.hasContent(conquest.targets) ? conquest.targets[0] : 0;
            con.log(1, 'targetId', targetId);
            if (!$u.hasContent(targetId) || targetId < 1) {
                con.log(1, 'No valid conquest targetId', targetId);
                schedule.setItem('conquest_delay', Math.floor(Math.random() * 240) + 60);
                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return false;
            }

            for (it = 0, len = conquest.targetsOnPage.length; it < len; it += 1) {
                if (conquest.targetsOnPage[it].userId === targetId) {
                    targetRecord = conquest.targetsOnPage[it];
                }
            }

            if (!$u.hasContent(targetRecord)) {
                con.log(1, 'No valid conquest target',targetId, targetRecord, conquest.targets);
                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return false;
            }

            con.log(1, 'conquest Target', targetRecord);
            if (caap.conquestUserId(targetRecord)) {
                caap.setDivContent('conquest_mess', 'Conquest Target: ' + targetRecord.userId);
                button = null;
                tempDiv = null;
                return true;
            }

            con.warn('Doing conquest target list, but no target');
            state.setItem("ConquestChainId", 0);
            button = null;
            tempDiv = null;
            return false;
        } catch (err) {
            con.error("ERROR in conquest: " + err);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                              IDLE
/////////////////////////////////////////////////////////////////////

	worker.addAction({worker : 'caap', priority : -10000, description : 'Idle', functionName : 'idle'});
	
    caap.idle = function () {
        if (caap.doCTAs()) {
            return true;
        }
        caap.updateDashboard();
        return true;
    };

/////////////////////////////////////////////////////////////////////
//                          POTIONS
/////////////////////////////////////////////////////////////////////

	worker.addAction({worker : 'caap', priority : -600, description : 'Drinking Potions', functionName : 'autoPotions'});
	
    caap.autoPotions = function() {
        function consumePotion(potion) {
            try {
                if (!caap.hasImage('keep_top.jpg')) {
                    con.log(2, "Going to keep for potions");
                    if (caap.navigateTo('keep')) {
                        return true;
                    }
                }

                var formId = "consume_1",
                    potionDiv = $j(),
                    button = $j();

                if (potion === 'stamina') {
                    formId = "consume_2";
                }

                con.log(1, "Consuming potion", potion);
                potionDiv = $j("form[id='" + formId + "'] input[src*='keep_consumebtn.jpg']");
                if (potionDiv && potionDiv.length) {
                    button = potionDiv;
                    if (button) {
                        caap.click(button);
                    } else {
                        con.warn("Could not find consume button for", potion);

                        potionDiv = null;
                        button = null;
                        return false;
                    }
                } else {
                    con.warn("Could not find consume form for", potion);

                    potionDiv = null;
                    button = null;
                    return false;
                }

                potionDiv = null;
                button = null;
                return true;
            } catch (err) {
                con.error("ERROR in consumePotion: " + err, potion);
                return false;
            }
        }

        try {
            if (!config.getItem('AutoPotions', true) || !schedule.check('AutoPotionTimerDelay')) {
                return false;
            }

            if (caap.stats.exp.dif <= config.getItem("potionsExperience", 20)) {
                con.log(2, "AutoPotions, ENL condition. Delaying 10 minutes");
                schedule.setItem('AutoPotionTimerDelay', 600);
                return false;
            }

            if (caap.stats.energy.num < caap.stats.energy.max - 10 && caap.stats.potions.energy >= config.getItem("energyPotionsSpendOver", 39) && caap.stats.potions.energy > config.getItem("energyPotionsKeepUnder", 35)) {
                return consumePotion('energy');
            }

            if (caap.stats.stamina.num < caap.stats.stamina.max - 10 && caap.stats.potions.stamina >= config.getItem("staminaPotionsSpendOver", 39) && caap.stats.potions.stamina > config.getItem("staminaPotionsKeepUnder", 35)) {
                return consumePotion('stamina');
            }

            return false;
        } catch (err) {
            con.error("ERROR in autoPotions: " + err);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                          KOBO
/////////////////////////////////////////////////////////////////////

	worker.addAction({worker : 'caap', priority : -2500, description : 'Doing Kobo Rolls', functionName : 'kobo'});
	
    caap.kobo = function() {
        try {
            var button = $j(),
                koboDIV = $j(),
                ginDIV = $j(),
                gin_left = 10,
                hours = 24,
                minutes = 0,
                rClick,
                addClick = false;


            if ((!config.getItem('AutoKobo', true)) || (!schedule.check('AutoKoboTimerDelay'))) {
                caap.setDivContent('kobo_mess', schedule.check('AutoKoboTimerDelay') ? 'Kobo = none' : 'Next Kobo: ' + $u.setContent(caap.displayTime('AutoKoboTimerDelay'), "Unknown"));
                button = null;
                koboDIV = null;
                ginDIV = null;
                return false;
            }
            con.log(2, "autoKobo");

            koboDIV = $j("div[style*='emporium_top']");
            if (!koboDIV || koboDIV.length === 0) {
                con.log(2, "Going to emporium");
                if (caap.navigateTo('goblin_emp')) {
                    button = null;
                    koboDIV = null;
                    ginDIV = null;
                    return true;
                }

                button = null;
                koboDIV = null;
                ginDIV = null;
                throw "Impossible to navigate to emporium page";
            }

            if ($u.hasContent(caap.resultsText) &&  /You have exceeded the 10 emporium roll limit for the day. Come back tomorrow for another chance!/.test(caap.resultsText)) {
                con.log(1, "caap.kobo", caap.resultsText);
                schedule.setItem('AutoKoboTimerDelay', ((hours * 60) + minutes) * 60, 100);
                caap.setDivContent('kobo_mess', schedule.check('AutoKoboTimerDelay') ? 'Kobo = none' : 'Next Kobo: ' + $u.setContent(caap.displayTime('AutoKoboTimerDelay'), "Unknown"));
                button = null;
                koboDIV = null;
                ginDIV = null;
                return false;
            }

            gin_left = Math.min(($j("span[id='gin_left_amt']")).text(), 10);
            con.log(4, "gin_left = ", gin_left);
            if (gin_left > 0) {
                var ingredientDIV = $j("div[class='ingredientUnit']" + (config.getItem('autoKoboAle', false) ? "" : "[id!='gout_6_261']") + ">div>span[id*='gout_value']"),
                    countClick = 0,
                    whiteList = config.getList('kobo_whitelist', ''),
					useWhiteList = config.getItem('autoKoboUseWhiteList',false),
                    blackList = config.getList('kobo_blacklist', ''),
					useBlackList = config.getItem('autoKoboUseBlackList',false);

                con.log(4, "ingredientDIV = ", ingredientDIV);
                ingredientDIV.each(function(_i, _e) {
                    var count = $j(_e).text(),
                        name = $j(_e).parent().parent()[0].children[0].children[0].alt,
    					whiteListed=false,
    					blackListed=false, 
						p=0, len=0;

                    con.log(3, "ingredient " + _i + " '" + name + "' :count = " + count);
                    if (count > config.getItem('koboKeepUnder', 10) && (gin_left > countClick) ) {
						if (useWhiteList) {
							for (p = 0, len = whiteList.length; p < len; p += 1) {
								if (name.trim().toLowerCase().match(new RegExp(whiteList[p].trim().toLowerCase()))) { 
									con.log(2, "ingredient " + _i + " '" + name + "' is white listed with condition : "+whiteList[p]);
									whiteListed = true; 
								}
							}
							if (!whiteListed) { con.log(2, "ingredient " + _i + " '" + name + "' isn't white listed"); }
						} else {
							whiteListed=true;
						}
						if (useBlackList) {
							for (p = 0, len = blackList.length; p < len; p += 1) {
								if (name.trim().toLowerCase().match(new RegExp(blackList[p].trim().toLowerCase()))) { 
									con.log(2, "ingredient " + _i + " '" + name + "' is black listed with condition : "+blackList[p]);
									blackListed = true; 
								}
							}
							if (!blackListed) { con.log(2, "ingredient " + _i + " '" + name + "' isn't black listed"); }
						}
						if ((whiteListed)&&(!blackListed)) {
							addClick = true;
							countClick = countClick + 1;
							$j(_e).parent().parent().click();
						}
                    }
                });

                if (!addClick) {
                    schedule.setItem('AutoKoboTimerDelay', ((hours * 60) + minutes) * 60);
                    caap.setDivContent('kobo_mess', schedule.check('AutoKoboTimerDelay') ? 'Kobo = none' : 'Next Kobo: ' + $u.setContent(caap.displayTime('AutoKoboTimerDelay'), "Unknown"));
                    button = null;
                    koboDIV = null;
                    ginDIV = null;
                    return false;
                }

                if (gin_left > countClick) {
                    button = null;
                    koboDIV = null;
                    ginDIV = null;
                    return true;
                }
            }

            button = caap.checkForImage('emporium_button.gif');
            if (button && button.length > 0) {
                con.log(2, "Click Roll");
                hours = 0;
                minutes = 1;
                schedule.setItem('AutoKoboTimerDelay', ((hours * 60) + minutes) * 60, 100);
                caap.setDivContent('kobo_mess', schedule.check('AutoKoboTimerDelay') ? 'Kobo = none' : 'Next Kobo: ' + $u.setContent(caap.displayTime('AutoKoboTimerDelay'), "Unknown"));
                rClick = caap.click(button);

                button = null;
                koboDIV = null;
                ginDIV = null;
                return rClick;
            }

            button = null;
            koboDIV = null;
            ginDIV = null;
            return false;

        } catch (err) {
            con.error("ERROR in autoKobo: " + err);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                              CTA
/////////////////////////////////////////////////////////////////////

    caap.waitAjaxCTA = false;

    caap.recordCTA = [];

    caap.loadedCTA = false;

    caap.waitLoadCTA = true;

    caap.doCTAs = function () {
        function onError() {
            caap.waitAjaxCTA = false;
        }

        function onSuccess() {
            caap.waitAjaxCTA = false;
        }

        try {
            if ((gm ? gm.getItem("ajaxCTA", false, hiddenVar) : false) || caap.waitAjaxCTA || caap.stats.stamina.num < 1 || !schedule.check('ajaxCTATimer')) {
                return false;
            }

            if (caap.waitLoadCTA) {
                $j.ajax({
                    url: caap.domain.protocol[caap.domain.ptype] +
                        "query.yahooapis.com/v1/public/yql?q=select%20*%20from%20csv%20where%20url%3D'http%3A%2F%2Fspreadsheets.google.com%2Fpub%3Fkey%3D0At1LY6Vd3Bp9dFhvYkltNVdVNlRfSzZWV0xCQXQtR3c%26hl%3Den%26output%3Dcsv'&format=json",
                    dataType: ($u.is_opera ? "jsonp" : "json"),
                    error: function () {
                        caap.loadedCTA = true;
                    },
                    success: function (msg) {
                        var rows = msg.query && msg.query.results && msg.query.results.row ? msg.query.results.row : [],
                            row = 0,
                            rowsLen = 0,
                            column = 0,
                            newRecord = {}, headers = $u.hasContent(rows) ? rows[0] : {}, headersLen = 0,
                            headersArr = [],
                            key = '';

                        for (key in headers) {
                            if (headers.hasOwnProperty(key)) {
                                headersLen = headersArr.push((headers[key]).toLowerCase());
                            }
                        }

                        for (row = 1, rowsLen = rows.length; row < rowsLen; row += 1) {
                            newRecord = {};
                            for (column = 0; column < headersLen; column += 1) {
                                if ($u.hasContent(headersArr[column])) {
                                    newRecord[headersArr[column]] = $u.setContent(rows[row]["col" + column], null);
                                }
                            }

                            caap.recordCTA.push(newRecord);
                        }

                        caap.loadedCTA = true;
                    }
                });

                caap.waitLoadCTA = false;
                return true;
            }

            if (!$u.hasContent(caap.recordCTA) || !caap.loadedCTA) {
                return false;
            }

            var count = state.getItem('ajaxCTACount', 0);
            if (count < caap.recordCTA.length) {
                caap.waitAjaxCTA = true;

                caap.ajax(caap.recordCTA[count].code.AESDecrypt(caap.namespace), null, onError, onSuccess);

                state.setItem('ajaxCTACount', count + 1);
            } else {
                caap.waitAjaxCTA = false;
                state.setItem('ajaxCTACount', 0);
                schedule.setItem('ajaxCTATimer', 10800, 300);
            }

            return true;
        } catch (err) {
            con.error("ERROR in doCTAs: " + err);
            return false;
        }
    };

/////////////////////////////////////////////////////////////////////
//                          GUILD
/////////////////////////////////////////////////////////////////////

    caap.checkResults_guild = function() {
        try {
            if (session.getItem("clickUrl").hasIndexOf("guild_battle=true")) {
                caap.guildTabAddListener();
                con.log(2, "Battle List");
                return true;
            }

            // Guild
            var guildTxt = '',
                guildDiv = $j(),
                tStr = '',
                members = [],
                save = false;

            if (config.getItem('enableMonsterFinder', false)) {
                feed.items("guild");
            }

            guildTxt = $j("#globalContainer #guild_achievement").text().trim().innerTrim();
            if ($u.hasContent(guildTxt)) {
                tStr = guildTxt.regex(/Monster ([\d,]+)/);
                caap.stats.guild.mPoints = $u.hasContent(tStr) ? ($u.isString(tStr) ? tStr.numberOnly() : tStr) : 0;
                tStr = guildTxt.regex(/Battle ([\d,]+)/);
                caap.stats.guild.bPoints = $u.hasContent(tStr) ? ($u.isString(tStr) ? tStr.numberOnly() : tStr) : 0;
                tStr = guildTxt.regex(/Monster [\d,]+ points \(Top (\d+\-\d+%)\)/);
                caap.stats.guild.mRank = $u.hasContent(tStr) ? tStr : '';
                tStr = guildTxt.regex(/Battle [\d,]+ points \(Top (\d+\-\d+%)\)/);
                caap.stats.guild.bRank = $u.hasContent(tStr) ? tStr : '';
                save = true;
            } else {
                con.warn('Using stored guild Monster and Battle points.');
            }

            guildTxt = $j("#globalContainer #guild_blast input[name='guild_id']").attr("value");
            if ($u.hasContent(guildTxt)) {
                caap.stats.guild.id = guildTxt;
                save = true;
            } else {
                con.warn('Using stored guild_id.');
            }

            guildTxt = $j("#globalContainer #guild_banner_section").text().trim();
            if ($u.hasContent(guildTxt)) {
                caap.stats.guild.name = guildTxt;
                save = true;
            } else {
                con.warn('Using stored guild name.');
            }

            guildDiv = $j("#globalContainer div[style*='guild_popup_middle.jpg'] div[style*='float:left;'] a[href*='keep.php?casuser']");
            if ($u.hasContent(guildDiv)) {
                guildDiv.each(function() {
                    var t = $j(this),
                        uid = t.attr("href").regex(/casuser=(\d+)/),
                        name = t.text().trim();

                    if (uid !== caap.stats.FBID) {
                        members.push({
                            'userId': uid,
                            'name': name
                        });
                    }

                    t = null;
                });

                caap.stats.guild.members = members.slice();
                save = true;
            } else {
                con.warn('Using stored guild member count.');
            }

            con.log(2, "checkResults_guild", caap.stats.guild);
            if (save) {
                caap.saveStats();
            }

            guildDiv = null;
            return true;
        } catch (err) {
            con.error("ERROR in checkResults_guild: " + err);
            return false;
        }
    };

    caap.guildTabListener = function(event) {
        session.setItem("clickUrl", $u.setContent($j(event.target).parent().attr("onclick"), '').regex(new RegExp(",'(.+\\.php.*?)'")));
    };

    caap.guildTabAddListener = function() {
        $j("div[style*='guild_tab_off_tile.jpg'],div[style*='guild_tab_on_tile.jpg']").off('click', caap.guildTabListener).on('click', caap.guildTabListener);
    };

    caap.checkResults_guild_panel = function() {
        caap.guildTabAddListener();
    };

    caap.checkResults_guild_shop = function() {
        caap.guildTabAddListener();
    };

    caap.checkResults_guild_class = function() {
        caap.guildTabAddListener();
    };

    caap.checkResults_guild_formation = function() {
        caap.guildTabAddListener();
    };
	
}());
