/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,gm,hiddenVar,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,battle,conquest,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

////////////////////////////////////////////////////////////////////
//                          CONQUEST OBJECT
// this is the main object for dealing with Conquest
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

	worker.add('conquest');
	
    conquest.targetsOnPage = [];

    conquest.targets = [];

	conquest.checkResults = function(page, resultsText) {
        try {
			// Check coins
            var whenconquest = config.getItem('WhenConquest', 'Never');
            if (whenconquest === 'Never') {
                caap.setDivContent('conquest_mess', 'Conquest off');
                return false;
            }
			switch (page) {
			case 'conquest_duel' :
				conquest.battle(page, resultsText);
				// Deliberate lack of break;
			case 'guild_conquest_castle_battlelist' :
			case 'guild_conquest_castle' :
			case 'guildv2_conquest_command' :
			case 'guildv2_conquest_expansion' :

				var tempDiv = $j("#guild_token_current_value");
				if ($u.hasContent(tempDiv)) {
					tempDiv = $j($j("#guild_token_current_value")[0].parentNode);
					 stats.guildTokens = caap.getStatusNumbers(tempDiv.text());
				} else {
					con.warn("Unable to get Conquest Tokens Div", tempDiv);
				}
				statsFunc.setRecord(stats);
				break;
				
			default :
				if (!caap.oneMinuteUpdate('checkConquestTokens')) {
					return false;
				}
				stats.guildTokens.num = $j('#persistHomeConquestPlateOpen').text().numberOnly();
				statsFunc.setRecord(stats);
				break;
			}

            return false;
        } catch (err) {
            con.error("ERROR in conquest.checkResults: " + err);
            return false;
        }
	};

    conquest.conquestUserId = function(record) {
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
						battle.setRecord(record);
                        conquest.click(conquestButton, record.userId);
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

    conquest.conquestWarnLevel = true;

	worker.addAction({worker : 'conquest', priority : 500, description : 'Conquesting Players'});
	
    conquest.worker = function() {
        try {
            var whenconquest = '',
                bR = {},
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
                return false;
            }

 			if 	(stats.guildTokens.num > stats.guildTokens.max) {
                con.log(1, 'Checking max conquest coins', $u.setContent(caap.displayTime('conquest_token'), "Unknown"), stats.guildTokens.num, stats.guildTokens.max);
                caap.setDivContent('conquest_mess', 'Checking coins');
                if (caap.navigateTo('conquest_duel')) {
                    return true;
                }
            }

			if (!schedule.check("conquest_delay")) {
                con.log(4, 'Conquest delay attack', $u.setContent(caap.displayTime('conquest_delay'), "Unknown"));
                caap.setDivContent('conquest_mess', 'Conquest delay (' + $u.setContent(caap.displayTime('conquest_delay'), "Unknown") + ')');
                return false;
            }

            if (stats.level >= 8 && stats.health.num >= 10 && stats.stamina < 0) {
                schedule.setItem("conquest_delay_stats", 0);
            }

            if (!schedule.check("conquest_delay_stats")) {
                con.log(4, 'Conquest delay stats', $u.setContent(caap.displayTime('conquest_delay_stats'), "Unknown"));
                caap.setDivContent('conquest_mess', 'Conquest stats (' + $u.setContent(caap.displayTime('conquest_delay_stats'), "Unknown") + ')');
                return false;
            }
			
			if (loe.worker()) {
				return true;
			}

			if (whenconquest === 'At Max Coins' && stats.guildTokens.max >= 10 && stats.guildTokens.num !== stats.guildTokens.max) {
				con.log(4, 'Waiting for Max coins ' + stats.guildTokens.num + '/' + stats.guildTokens.max);
				caap.setDivContent('conquest_mess', 'Waiting Max coins ' + stats.guildTokens.num + '/' + stats.guildTokens.max + ' (' + $u.setContent(caap.displayTime('conquest_token'), "Unknown") + ')');
				state.setItem("ConquestChainId", 0);
				return false;
			}

			if (whenconquest === 'At X Coins' && stats.guildTokens.num >= config.getItem('ConquestXCoins', 1)) {
				state.setItem('conquest_burn', true);
				con.log(1, 'Burn tokens ' + stats.guildTokens.num + '/' + config.getItem('ConquestXCoins'));
			}

			con.log(4, 'Waiting X coins burn', state.getItem('conquest_burn', false));
			if (whenconquest === 'At X Coins' && stats.guildTokens.num <= config.getItem('ConquestXMinCoins', 0)) {
				state.setItem('conquest_burn', false);
				con.log(4, '1:Waiting X coins ' + stats.guildTokens.num + '/' + config.getItem('ConquestXCoins'));
				caap.setDivContent('conquest_mess', 'Waiting X coins ' + stats.guildTokens.num + '/' + config.getItem('ConquestXCoins', 1) + ' (' + $u.setContent(caap.displayTime('conquest_token'), "Unknown") + ')');
				state.setItem("ConquestChainId", 0);
				button = null;
				tempDiv = null;
				return false;
			}

			if (whenconquest === 'At X Coins' && stats.guildTokens.num < config.getItem('ConquestXCoins', 1) && !state.getItem('conquest_burn', false)) {
				state.setItem('conquest_burn', false);
				con.log(4, '2:Waiting X coins ' + stats.guildTokens.num + '/' + config.getItem('ConquestXCoins'));
				caap.setDivContent('conquest_mess', 'Waiting X coins ' + stats.guildTokens.num + '/' + config.getItem('ConquestXCoins', 1) + ' (' + $u.setContent(caap.displayTime('conquest_token'), "Unknown") + ')');
				state.setItem("ConquestChainId", 0);
				button = null;
				tempDiv = null;
				return false;
			}

			if (whenconquest === 'Coins Available' && stats.guildTokens.num < 1) {
				con.log(4, 'Waiting Coins Available ' + stats.guildTokens.num + '/1');
				caap.setDivContent('conquest_mess', 'Coins Available ' + stats.guildTokens.num + '/1 (' + $u.setContent(caap.displayTime('conquest_token'), "Unknown") + ')');
				state.setItem("ConquestChainId", 0);
				button = null;
				tempDiv = null;
				return false;
			}

			caap.setDivContent('conquest_mess', 'Conquest Ready');

            if (stats.level < 8) {
                schedule.setItem("conquest_token", 86400, 300);
                schedule.setItem("conquest_delay_stats", 86400, 300);
                if (conquest.conquestWarnLevel) {
                    con.log(1, "conquest: Unlock at level 8");
                    conquest.conquestWarnLevel = false;
                }

                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return false;
            }

            conquesttype = config.getItem('ConquestType', 'Invade');
            if (!caap.checkStamina('Conquest', 1)) {
                con.log(1, 'Not enough stamina for ', conquesttype);
                schedule.setItem("conquest_delay_stats", (stats.stamina.ticker[0] * 60) + stats.stamina.ticker[1], 300);
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
                    conquest.click(button, conquestChainId);
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
                    bR = conquest.targetsOnPage[it];
                }
            }

            if (!$u.hasContent(bR)) {
                con.log(1, 'No valid conquest target',targetId, bR, conquest.targets);
                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return false;
            }

            con.log(1, 'conquest Target', bR);
            if (conquest.conquestUserId(bR)) {
                caap.setDivContent('conquest_mess', 'Conquest Target: ' + bR.userId);
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
	
    conquest.conquestRankTier = function(points) {
        var tier = 0;

        if (points >= 50000) {
            tier = 18;
        } else if (points >= 43000) {
            tier = 17;
        } else if (points >= 37000) {
            tier = 16;
        } else if (points >= 32500) {
            tier = 15;
        } else if (points >= 27000) {
            tier = 14;
        } else if (points >= 22500) {
            tier = 13;
        } else if (points >= 19500) {
            tier = 12;
        } else if (points >= 14000) {
            tier = 11;
        } else if (points >= 10000) {
            tier = 10;
        } else if (points >= 7500) {
            tier = 9;
        } else if (points >= 5000) {
            tier = 8;
        } else if (points >= 3000) {
            tier = 7;
        } else if (points >= 2000) {
            tier = 6;
        } else if (points >= 1200) {
            tier = 5;
        } else if (points >= 700) {
            tier = 4;
        } else if (points >= 450) {
            tier = 3;
        } else if (points >= 250) {
            tier = 2;
        } else if (points >= 100) {
            tier = 1;
        }

        return tier;
    };

    conquest.conquestRankTable = {
        0: 'Grunt',
        1: 'Scout',
        2: 'Soldier',
        3: 'Elite Soldier',
        4: 'Squire',
        5: 'Night',
        6: 'First Night',
        7: 'Legionnaire',
        8: 'Centurian',
        9: 'Champion',
        10: 'Lt Commander',
        11: 'Commander',
        12: 'High Commander',
        13: 'Lieutenant General',
        14: 'General',
        15: 'High General',
        16: 'Baron',
        17: 'Earl',
        18: 'Duke'
    };

    conquest.click = function(conquestButton, userId) {
        try {
            conquest.flagResult = true;
			state.setItem('lastBattleID', userId);
            caap.setDomWaiting("conquest_duel.php");
            caap.click(conquestButton);
            return true;
        } catch (err) {
            con.error("ERROR in conquest.click: " + err);
            return false;
        }
    };

    conquest.battles = {
        'Invade': 'war_conquest_invadebtn.gif',
        'Duel': 'war_conquest_duelbtn.gif',
        'InvadeChain': 'war_invadeagainbtn.gif',
        'DuelChain': 'war_duelagainbtn.gif'
    };

    conquest.getCommonInfos = function(slice) {
        try {
            var levelDiv = $j(),
                percentageDiv = $j(),
                rechargeDiv = $j(),
                rechargeSecs = 0,
                timeDiv = $j(),
                timeSecs = 0,
                tokensDiv = $j(),
                tempText = '',
                passedStats = true,
                passedTimes = true;

            if (!$u.hasContent(slice)) {
                con.warn("No slice passed to conquest.getCommonInfos");
                levelDiv = null;
                percentageDiv = null;
                rechargeDiv = null;
                timeDiv = null;
                tokensDiv = null;
                return;
            }

            if (caap.hasImage('guild_tab6_on.jpg')) {
                tempText = slice.text();
                if ($u.hasContent(tempText)) {
                    stats.resources.lumber = $u.setContent(tempText.regex(/^\s+(\d+)\s+\d+/i), 0);
                    stats.resources.iron = $u.setContent(tempText.regex(/^\s+\d+\s+(\d+)/i), 0);
                    stats.guild.level = $u.setContent(tempText.regex(/\s+GUILD LEVEL:\s+(\d+)/i), 0);
                    stats.rank.conquestLevel = $u.setContent(tempText.regex(/\s+CONQUEST LV:\s+(\d+)/i), 0);
                } else {
                    con.warn("Unable to get slice text", slice);
                    passedStats = false;
                }
            } else if (caap.hasImage('conqduel_on.jpg')) {
                levelDiv = $j("div[style*='width:160px;height:12px;color:#80cfec']", slice);
                if ($u.hasContent(levelDiv)) {
                    stats.rank.conquestLevel = $u.setContent(levelDiv.text(), '').regex(/(\d+)/);
                } else {
                    con.warn("Unable to get conquest levelDiv");
                    levelDiv = null;
                    percentageDiv = null;
                    rechargeDiv = null;
                    timeDiv = null;
                    tokensDiv = null;
                    return;
                }
            } else {
                con.warn("Unable to get infos from this page");
                passedStats = false;
            }

            percentageDiv = $j("div[style*='war_redbar.jpg']", slice);
            if ($u.hasContent(percentageDiv && percentageDiv.length === 2)) {
                stats.guild.levelPercent = $u.setContent(percentageDiv.getPercent('width'), 0);
            } else if ($u.hasContent(percentageDiv) && percentageDiv.length === 1) {
                stats.rank.conquestLevelPercent = $u.setContent(percentageDiv.getPercent('width'), 0);
            } else {
                con.warn("Unable to get conquest percentageDiv");
                passedStats = false;
            }

            tokensDiv = $j("#guild_token_current_value", slice).parent();
            if ($u.hasContent(tokensDiv)) {
                tempText = $u.setContent(tokensDiv.text(), '').stripTRN();
                if ($u.hasContent(tempText)) {
                    stats.guildTokens.num = $u.setContent(tempText.regex(/(\d+)\/\d+/), 0);
                    stats.guildTokens.max = $u.setContent(tempText.regex(/\d+\/(\d+)/), 0);
                } else {
                    con.warn("Unable to get tokensDiv text", tokensDiv);
                    passedStats = false;
                }
            } else {
                tokensDiv = $j("#guild_token_current_value_amount", slice);
                if ($u.hasContent(tokensDiv)) {
                    tempText = $u.setContent(tokensDiv.val(), '');
                    if ($u.hasContent(tempText)) {
                        stats.guildTokens.num = $u.setContent(tempText.regex(/(\d+)/), 0);
                    } else {
                        con.warn("Unable to get guild_token_current_value_amount text", tokensDiv);
                        passedStats = false;
                    }
                } else {
                    con.warn("Unable to get conquest tokensMaxDiv");
                    passedStats = false;
                }

                tokensDiv = $j("#guild_token_current_max", slice);
                if ($u.hasContent(tokensDiv)) {
                    tempText = $u.setContent(tokensDiv.val(), '');
                    if ($u.hasContent(tempText)) {
                        stats.guildTokens.max = $u.setContent(tempText.regex(/(\d+)/), 0);
                        if (stats.guildTokens.max < 10){
                            con.warn("guild_token_current_max is too low", stats.guildTokens.max);
                            passedStats = false;
                        }
                    } else {
                        con.warn("Unable to get guild_token_current_max text", tokensDiv);
                        passedStats = false;
                    }
                } else {
                    con.warn("Unable to get conquest tokensMaxDiv");
                    passedStats = false;
                }
            }

            stats.guildTokens.dif = stats.guildTokens.max - stats.guildTokens.num;

            con.log(1, "conquest.battle", stats.rank, stats.guildTokens);
            if (passedStats) {
                statsFunc.setRecord(stats);
            }

            if (passedStats && stats.guildTokens.max >= 10 && stats.guildTokens.num < stats.guildTokens.max) {
                rechargeDiv = $j("#guild_token_current_recharge_time", slice);
                if ($u.hasContent(rechargeDiv)) {
                    rechargeSecs = $u.setContent(rechargeDiv.val(), '').regex(/(\d+)/);
                } else {
                        con.warn("Unable to get conquest rechargeDiv");
                        passedTimes = false;
                }

                timeDiv = $j("#guild_token_time_sec", slice);
                if ($u.hasContent(timeDiv)) {
                    timeSecs = $u.setContent(timeDiv.val(), '').regex(/(\d+)/);
                    schedule.setItem("conquest_token", timeSecs, 300);
                } else {
                        con.warn("Unable to get conquest timeDiv");
                        passedTimes = false;
                }
            } else {
                schedule.setItem("conquest_token", 300, 0);
            }

            con.log(1, "conquest.getCommonInfos", stats, rechargeSecs, timeSecs);

            levelDiv = null;
            percentageDiv = null;
            rechargeDiv = null;
            timeDiv = null;
            tokensDiv = null;
        } catch (err) {
            con.error("ERROR in conquest.getCommonInfos: " + err);
        }
    };

    conquest.targeting = function() {
        function logOpponent(opponent, reason, conditions) {
            con.log(2, (reason === 'sorted' ? 1 : 2), (opponent.name.lpad(' ', 20) + opponent.userId.lpad(' ', 16) +
                opponent.level.lpad(' ', 4) + conquest.conquestRankTable[opponent.rank].lpad(' ', 16) +
                opponent.army.lpad(' ', 4) + opponent.score.dp().lpad(' ', 5)), reason, conditions);
        }

        try {
            var opponentsSlice = $j("#app_body div[style*='war_conquest_mid']"),
                minRank = 0,
                maxRank = 0,
                minLevel = 0,
                maxLevel = 0,
                ARBase = 0,
                ARMin = 0,
                ARMax = 0,
                it = 0,
                len = 0,
                conquesttype = config.getItem('ConquestType', 'Invade'),
                targets = [];

            con.log(1, "conquest.targeting begins", stats);

            conquest.targetsOnPage = [];
            conquest.targets = [];

            con.log(1, "in battle", opponentsSlice);
            if (!$u.hasContent(opponentsSlice)) {
                con.warn("missing opponentsSlice");
                opponentsSlice = null;
                return;
            }

            minLevel = config.getItem("ConquestMinLevel", 99999);
            con.log(1, "ConquestMinLevel", minLevel);
            if (minLevel === '' || $u.isNaN(minLevel)) {
                if (minLevel !== '') {
                    con.warn("ConquestMinLevel is NaN, using default", minLevel);
                }

                minLevel = 99999;
            }

            maxLevel = config.getItem("ConquestMaxLevel", 99999);
            con.log(1, "ConquestMaxLevel", maxLevel);
            if (maxLevel === '' || $u.isNaN(maxLevel)) {
                if (maxLevel !== '') {
                    con.warn("ConquestMaxLevel is NaN, using default", maxLevel);
                }

                maxLevel = 99999;
            }

            minRank = config.getItem("ConquestMinRank", 99);
            con.log(1, "ConquestMinRank", minRank);
            if (minRank === '' || $u.isNaN(minRank)) {
                if (minRank !== '') {
                    con.warn("ConquestMinRank is NaN, using default", 99);
                }

                minRank = 99;
            }

            maxRank = config.getItem("ConquestMaxRank", 99);
            con.log(1, "ConquestMaxRank", maxRank);
            if (maxRank === '' || $u.isNaN(maxRank)) {
                if (maxRank !== '') {
                    con.warn("ConquestMaxRank is NaN, using default", 99);
                }

                maxRank = 99;
            }

            ARBase = config.getItem("ConquestARBase", 0.7);
            con.log(1, "ConquestARBase", ARBase);
            if (ARBase === '' || $u.isNaN(ARBase)) {
                if (ARBase !== '') {
                    con.warn("ConquestARBase is NaN, using default", ARBase);
                }

                ARBase = 0.7;
            }

            ARMin = config.getItem("ConquestARMin", 0);
            con.log(1, "ConquestARMin", ARMin);
            if (ARMin === '' || $u.isNaN(ARMin)) {
                if (ARMin !== '') {
                    con.warn("ConquestARMin is NaN, using default", ARMin);
                }

                ARMin = 0;
            }

            ARMax = config.getItem("ConquestARMax", 99999);
            con.log(1, "ConquestARMax", ARMax);
            if (ARMax === '' || $u.isNaN(ARMax)) {
                if (ARMax !== '') {
                    con.warn("ConquestARMax is NaN, using default", ARMax);
                }

                ARMax = 99999;
            }

            con.log(1, "My rank/type is", conquest.conquestRankTable[stats.rank.conquest], stats.rank.conquest, conquesttype);

            opponentsSlice.each(function() {
                var opponentDiv = $j(this),
                    boxesDiv = opponentDiv.children("div"),
                    tempDiv = $j(),
                    tempText = '',
                    bR = {},
                    levelMultiplier = 0,
                    armyRatio = 0,
                    tempTime = 0;

                if ($u.hasContent(boxesDiv) && boxesDiv.length === 7 ) {
                    var playerDiv = boxesDiv.eq(2),
                        armyDiv = boxesDiv.eq(3),
                        idDiv = boxesDiv.eq(5);
                } else {
                    con.warn("skipping opponent, missing boxes", opponentDiv);
                    opponentDiv = null;
                    boxesDiv = null;
                    tempDiv = null;
                    return;
                }

                var userId = parseInt($j("input[name='target_id']",idDiv)[0].defaultValue,10);
                if (userId > 0) {
                    bR = battle.getRecord(userId);
                } else {
                    con.warn("skipping opponent, unable to get userid", tempText);
                    opponentDiv = null;
                    boxesDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    idDiv = null;
                    userId = null;
                    return;
                }

                if ($u.hasContent(playerDiv)) {
                    tempText = $u.setContent(playerDiv.text(), '');
                    if ($u.hasContent(tempText)) {
                        bR.name = $u.setContent(tempText.regex(/\s*(.+) \(Level/), '');
                        bR.level = $u.setContent(tempText.regex(/Level (\d+)/i), -1);
                        bR.conqRank = $u.setContent(tempText.regex(/Rank (\d+)/i), -1);

                        if (bR.name === '') {
                            con.warn("Unable to match opponent's name", tempText);
                        }

                        if (!$u.isNumber(bR.level) || !$u.isNumber(bR.conqRank) || bR.level === -1 || bR.conqRank === -1) {
                            con.warn("skipping opponent, unable to get level or rank", tempText);
                            opponentDiv = null;
                            boxesDiv = null;
                            idDiv = null;
                            playerDiv = null;
                            armyDiv = null;
                            tempDiv = null;
                            return;
                        }
                    } else {
                        con.warn("No text in playerDiv");
                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }
                } else {
                    con.warn("skipping opponent, missing playerDiv", opponentDiv);
                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                if ($u.hasContent(armyDiv)) {
                    tempText = $u.setContent(armyDiv.text(), '');
                    if ($u.hasContent(tempText)) {
                        bR.army = $u.setContent(tempText.regex(/(\d+)/i), -1);

                        if (bR.army=== -1) {
                            con.warn("skipping opponent, unable to get army", tempText);
                            opponentDiv = null;
                            boxesDiv = null;
                            idDiv = null;
                            playerDiv = null;
                            armyDiv = null;
                            tempDiv = null;
                            return;
                        }
                    } else {
                        con.warn("No text in armyDiv");
                        opponentDiv = null;
                        boxesDiv = null;
                        idDiv = null;
                        playerDiv = null;
                        armyDiv = null;
                        tempDiv = null;
                        return;
                    }
                } else {
                    con.warn("skipping opponent, missing armyDiv", opponentDiv);
                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }
                levelMultiplier = stats.level / bR.level;
                bR.score = bR.conqRank - (bR.army / levelMultiplier / stats.army.capped);
                conquest.targetsOnPage.push(bR);
                if (!$u.isNumber(stats.level) || (stats.level - minLevel > bR.level)) {
                    logOpponent(bR, "minLevel", {
                        'level': bR.level,
                        'levelDif': stats.level - bR.level,
                        'minLevel': minLevel
                    });

                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                if (!$u.isNumber(stats.level) || (stats.level + maxLevel <= bR.level)) {
                    logOpponent(bR, "maxLevel", {
                        opponent: bR,
                        'level': bR.level,
                        'levelDif': bR.level - stats.level,
                        'maxLevel': maxLevel
                    });

                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                if (!$u.isNumber(stats.rank.conquest) || (stats.rank.conquest - minRank > bR.conqRank)) {
                    logOpponent(bR, "minRank", {
                        opponent: bR,
                        'rankDif': stats.rank.conquest - bR.conqRank,
                        'minRank': minRank
                    });

                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                if (!$u.isNumber(stats.rank.conquest) || (stats.rank.conquest + maxRank <= bR.conqRank)) {
                    logOpponent(bR, "maxRank", {
                        opponent: bR,
                        'rankDif': bR.conqRank - stats.rank.conquest,
                        'minRank': minRank
                    });

                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                levelMultiplier = $u.setContent(stats.level, 0) / $u.setContent(bR.level, 1);
                armyRatio = ARBase * levelMultiplier;
                armyRatio = Math.min(armyRatio, ARMax);
                armyRatio = Math.max(armyRatio, ARMin);
                if (armyRatio <= 0) {
                    con.warn("Bad ratio", armyRatio, ARBase, ARMin, ARMax, levelMultiplier);
                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                // if we know our army size, and this one is larger than armyRatio, don't conquest
                if (conquesttype === 'Invade' && stats.army.capped && (bR.army > (stats.army.capped * armyRatio))) {
                    logOpponent(bR, "armyRatio", {
                        'armyRatio': armyRatio.dp(2),
                        'army': bR.army ,
                        'armyMax': (stats.army.capped * armyRatio).dp()
                    });

                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                if (!schedule.since(bR.lostTime, 604800)) {
                    logOpponent(bR, "We lost to this id this week", '');
                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                // don't conquest people that were dead or hiding in the last hour
                tempTime = $u.setContent(bR.deadTime, 0);
                if (bR && !bR.newRecord && !schedule.since(tempTime, 3600)) {
                    logOpponent(bR, "User was dead in the last hour", '');
                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                // don't conquest people we've already chained to max in the last 2 days
                tempTime = $u.setContent(bR.chainTime, 0);
                if (bR && !bR.newRecord && !schedule.since(tempTime, 86400)) {
                    logOpponent(bR, "We chained user within 2 days", '');
                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                conquest.targets.push(bR.userId);
                logOpponent(bR, "match", '');

                opponentDiv = null;
                boxesDiv = null;
                idDiv = null;
                playerDiv = null;
                armyDiv = null;
                tempDiv = null;
            });

            targets.sort($u.sortBy(true, "score"));

            for (it = 0, len = targets.length; it < len; it += 1) {
                logOpponent(targets[it], 'sorted', '');
                conquest.targets.push(targets[it].userId);
            }

            opponentsSlice = null;
        } catch (err) {
            con.error("ERROR in conquest.targeting: " + err);
        }
    };

	conquest.testList = [
		{ method : 'invade',
			type : 'conq',
			check : / Army(\d+) .* Army(\d+) .*(-?\d+) Conquest Rank Pts.* (\+1)? XP.*Health (.*) .?\d+ Conquest Rank/i,
			vars : ['myArmy', 'theirArmy', 'points', 'wl',  'name'],
			func : function(r) {
				r.wl = r.wl == '+1' ? 'won' : 'lost';
				r.att = stats.bonus.api * r.myArmy / r.theirArmy;
			}
		},
		{ method : 'duel',
			type : 'conq',
			check : /(\d+) Conquest Rank Pts.* (\+1)? XP.*Health (.*) .?\d+ Conquest Rank/i,
			vars : ['points', 'wl',  'name'],
			func : function(r) {
				r.wl = r.wl == '+1' ? 'won' : 'lost';
				r.att = stats.bonus.api;
			}
		}
	];

    conquest.getResults = function(page, resultsText) {
        try {
            var bottomDiv = $j(),
                buttonDiv = $j(),
                targetDiv = $j(),
                tempText = '',
                points = -1,
                it = 0,
                len = 0,
                r = {},
				bR = {},
                tempTime = 0,
                chainBP = '',
                maxChains = 0;

			r = battle.readWinLoss(resultsText, conquest.testList);
			
			if (!r) {
				return false;
			}

            con.log(1, "Conquest battle result: " + r.wl.ucWords() + ' against ' + r.name + ' in ' + r.type + ' for ' + r.points + ' Conquest Points', r);
			
			bR = battle.getRecord(r.userId);

			if (r.wl === 'won') {
				session.setItem('ReleaseControl', false);
				con.log(1, "Chain check");
				//Test if we should chain this guy
				tempTime = $u.setContent(bR.chainTime, 0);
				chainBP = config.getItem('ConquestChainBP', '');
				if (schedule.since(tempTime, 86400) && ((chainBP !== '' && !$u.isNaN(chainBP) && chainBP >= 0))) {
					if (chainBP !== '' && !$u.isNaN(chainBP) && chainBP >= 0) {
						if (r.points >= chainBP) {
							state.setItem("ConquestChainId", bR.userId);
							con.log(1, "Chain Attack:", bR.userId, "Conquest Points: " + r.points);
						} else {
							con.log(1, "Ignore Chain Attack:", bR.userId, "Conquest Points: " + r.points);
							bR.ignoreTime = Date.now();
						}
					}
				}

				bR.chainCount = bR.chainCount ? bR.chainCount += 1 : 1;
				maxChains = config.getItem('ConquestMaxChains', 4);
				if (maxChains === '' || $u.isNaN(maxChains) || maxChains < 0) {
					maxChains = 4;
				}

				if (bR.chainCount >= maxChains) {
					con.log(1, "Lets give this guy a break. Chained", bR.chainCount);
					bR.chainTime = Date.now();
					bR.chainCount = 0;
					bR.ignoreTime = 0;
					bR.unknownTime = 0;
				}
			} else {
				con.log(1, "Do Not Chain Attack:", bR.userId);
				bR.chainCount = 0;
				bR.chainTime = 0;
				bR.ignoreTime = 0;
				bR.unknownTime = 0;
			}

			battle.setRecord(bR);
	} catch (err) {
            con.error("ERROR in conquest.getResults: " + err);
        }
    };

    conquest.getLands = function() {
        var landCapsules = $j("div[style*='conq2_capsule']"),
            timeLeft,
			path,
			tmp = $j(),
			pathList = [],
			monsterFound = false,
			activePathlist = [];
		
		tmp = $j("#app_body #header_garrison_tab a[href*='slot=']");
		stats.LoMland = $u.hasContent(tmp) ? tmp.attr('href').regex(/slot=(\d+)/) - 1 : -1;
		landCapsules.each(function(index) {
			var currentCapsule = $j(this),
				arr = [],
				landRecord = conquestLands.getItem(index);
			
			landRecord.name = currentCapsule.children().eq(0).text().trim();
            tmp = $j("img[src*='conq2_btn']", currentCapsule)[0].src.split('/');
			landRecord.status = tmp[tmp.length - 1].match(/.+_(.+)\..+/)[1];
			if (landRecord.status == 'explore') {
				landRecord.timeLeft = 0;
				landRecord.stateTimeLeft = 0;
			} else {
				try{
					arr = currentCapsule.text().trim().regex(/(\d+) HR/gi);
					landRecord.timeLeft = arr.length ? arr.pop() : 999999;
					landRecord.phaseLeft = arr.length ? arr.pop() : 999999;
					landRecord.defenders = $j("div[onmouseout*='defenderc_text_']", currentCapsule).parent().text().regex(/(\d+)/);
				} catch (err) {
					con.error("ERROR in landRecord.timeLeft: " + err);
					landRecord.timeLeft = 999999;
				}	
			}
			landRecord.index = index;
			conquestLands.records[index] = landRecord;
        });
		conquestLands.records.splice(landCapsules.length, conquestLands.records.length - landCapsules.length);
		con.log(2, 'Conquest Lands Records', conquestLands.records);
		conquestLands.save();
    };

	conquest.categories = ['Conqueror','Guardian','Hunter','Engineer'];
	
    conquest.collect = function() {
        try {
            var check = conquest.categories.some( function(category) {
				return config.getItem('When' + category, 'Never') !== 'Never';
			});
		
			if (schedule.check('conquestCollectPage') && (check || config.getItem('doLoMmove',false))) {
				return caap.clickAjaxLinkSend('guildv2_conquest_command.php?tier=3', 1000);
			}
			
			check = false;
			if (schedule.check('conquestFail')) {
				conquest.categories.some( function(category) {
					if (stats.conquest[category] >= config.getItem('When' + category, 'Never')) {
						con.log(1, category + ' points are ' + stats.conquest[category] + ', which is over ' 
							+ (config.getItem('When' + category, 'Never')) + ' so clicking report collect');
						check = caap.navigate2("ajax:guildv2_conquest_command.php?tier=3,clickjq:input[name*='Report Collect!']");
						if (!check || check != 'fail') {
							schedule.setItem('conquestFail', 3600);
							check = false;
							return true;
							con.warn('Unable to complete conquest points Collect, waiting an hour to try again');
						} else if (check == 'done') {
							conquest.categories.forEach( function(category) {
								stats.conquest[category] = 0;
							});
						}
						check = true;
						return true;
					}
				});
			}
			return check;
        } catch (err) {
            con.error("ERROR in collect Conquest: " + err);
            return;
        }
    };
	
    conquest.battle = function(page, resultsText) {
        try {

			conquest.getResults(page, resultsText);

            var slice = $j("#app_body div[style*='war_conquest_header2.jpg']");
            if ($u.hasContent(slice)) {
                conquest.getCommonInfos(slice);
                conquest.targeting();
            } else {
                con.warn("conquest.battle: missing header slice");
            }

            slice = null;
        } catch (err) {
            con.error("ERROR in conquest.battle: " + err);
        }
    };

    conquest.menu = function() {
        try {
            var XConquestInstructions = "Start battling if Guild Coins is above this points",
                XMinConquestInstructions = "Do not conquest if Guild Coins is below this points",
                chainBPInstructions = "Number of conquest points won to initiate a chain attack. Specify 0 to always chain attack.",
                maxChainsInstructions = "Maximum number of chain hits after the initial attack.",
                FMRankInstructions = "The lowest relative rank below yours that " + "you are willing to spend your Guild Coins on. Leave blank to attack " + "any rank. (Uses Conquest Rank for invade and duel)",
                FMARBaseInstructions = "This value sets the base for your Army " + "Ratio calculation [X * (Your Army Size/ Opponent Army Size)]. It is basically a multiplier for the army " +
                    "size of a player at your equal level. A value of 1 means you " + "will conquest an opponent the same level as you with an army the " + "same size as you or less. Default .5",
                FreshMeatARMaxInstructions = "This setting sets the highest value you will use for the Army Ratio [Math.min(Army Ratio, Army Ratio Max)] value. " +
                    "So, if you NEVER want to fight an army bigger than 80% your size, you can set the Max value to .8.",
                FreshMeatARMinInstructions = "This setting sets the lowest value you will use for the Army Ratio [Math.max(Army Ratio, Army Ratio Min)] value. " +
                    "So, if you NEVER want to pass up an army that is less than 10% the size of yours, you can set MIN value to .1.",
                FreshMeatMaxLevelInstructions = "This sets the highest relative level, above yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent above level 120, you would code 20.",
                FreshMeatMinLevelInstructions = "This sets the lowest relative level, below yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent below level 60, you would code 40.",
                conquestList = ['Coins Available', 'At Max Coins', 'At X Coins', 'Never'],
                conquestInst = [
                    'Guild Coins Available will conquest whenever you have enough Guild Coins',
                    'At Max Guild Coins will conquest when Guild Coins is at max and will burn down all Guild Coins when able to level up',
                    'At X Guild Coins you can set maximum and minimum Guild Coins to conquest',
                    'Never - disables'
                ],
                typeList = ['Invade', 'Duel'],
                typeInst = ['Conquest using Invade button', 'Conquest using Duel button - no guarentee you will win though'],
                htmlCode = '';

            htmlCode = caap.startToggle('Conquesting', 'CONQUEST BATTLE');
            htmlCode += caap.makeDropDownTR("Conquest When", 'WhenConquest', conquestList, conquestInst, '', 'Never', false, false, 62);
            htmlCode += caap.display.start('WhenConquest', 'isnot', 'Never');
            htmlCode += caap.display.start('WhenConquest', 'is', 'At X Coins');
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'ConquestXCoins', '', 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'ConquestXMinCoins', '', 0, '', '', true, false);
            htmlCode += caap.display.end('WhenConquest', 'is', 'At X Coins');
            htmlCode += loe.conquestMenu();
            htmlCode += caap.display.start('WhenLoE', 'isnot', 'Always');
            htmlCode += caap.makeDropDownTR("Conquest Type", 'ConquestType', typeList, typeInst, '', '', false, false, 62);
            htmlCode += caap.makeCheckTR("Wait For Safe Health", 'conquestWaitSafeHealth', false, '');
            htmlCode += caap.makeNumberFormTR("Chain Conquest Points", 'ConquestChainBP', chainBPInstructions, '', '');
            htmlCode += caap.makeNumberFormTR("Max Chains", 'ConquestMaxChains', maxChainsInstructions, 4, '', '');
            htmlCode += caap.makeTD("Attack targets that are not:");
            htmlCode += caap.makeNumberFormTR("My Level Minus", 'ConquestMinLevel', FreshMeatMaxLevelInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("My Level Plus", 'ConquestMaxLevel', FreshMeatMinLevelInstructions, '', 50, '', true);
            htmlCode += caap.makeNumberFormTR("My Rank Minus", 'ConquestMinRank', '', 0, '', '', true);
            htmlCode += caap.makeNumberFormTR("My Rank Plus", 'ConquestMaxRank', '', 2, '', '', true);
            htmlCode += caap.makeNumberFormTR("Higher Than X*AR", 'ConquestARBase', FMARBaseInstructions, 0.7, '', '', true);
            htmlCode += caap.makeCheckTR('Advanced', 'ConquestAdvancedOptions', false);
            htmlCode += caap.display.start('ConquestAdvancedOptions');
            htmlCode += caap.makeNumberFormTR("Army Ratio Max", 'ConquestARMax', FreshMeatARMaxInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("Army Ratio Min", 'ConquestARMin', FreshMeatARMinInstructions, '', '', '', true);
            htmlCode += caap.display.end('ConquestAdvancedOptions');
            htmlCode += caap.display.end('WhenLoE', 'isnot', 'Always');
            htmlCode += caap.display.end('WhenConquest', 'isnot', 'Never');
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in conquest.menu: " + err);
            return '';
        }
    };

}());

(function() {
    conquestLands.records = [];

    conquestLands.record = function() {
        this.data = {
            'name': '',
            'index': 0,
            'status': 0,
            'timeLeft': 0,
            'phaseLeft': 0,
            'defenders': 0,
            'stateTimeLeft': 0,
            'newRecord': true
        };
    };

    conquestLands.hbest = 2;

    conquestLands.load = function() {
        try {
            conquestLands.records = gm.getItem('conquestLands.records', 'default');
            if (conquestLands.records === 'default' || !$j.isArray(conquestLands.records)) {
                conquestLands.records = gm.setItem('conquestLands.records', []);
            }

            conquestLands.hbest = conquestLands.hbest === false ? JSON.hbest(conquestLands.records) : conquestLands.hbest;
            con.log(2, "conquestLands.load Hbest", conquestLands.hbest);
            session.setItem("ConquestDashUpdate", true);
            con.log(1, "conquestLands.load", conquestLands.records);
            return true;
        } catch (err) {
            con.error("ERROR in conquestLands.load: " + err);
            return false;
        }
    };

    conquestLands.save = function(src) {
        try {
            var compress = false;
            if (caap.domain.which === 3) {
                caap.messaging.setItem('conquestLands.records', conquestLands.records);
            } else {
                gm.setItem('conquestLands.records', conquestLands.records, conquestLands.hbest, compress);
                con.log(2, "conquestLands.save", conquestLands.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    caap.messaging.setItem('conquestLands.records', conquestLands.records);
                }
            }

            if (caap.domain.which !== 0) {
                session.setItem("ConquestDashUpdate", true);
            }

            return true;
        } catch (err) {
            con.error("ERROR in conquestLands.save: " + err);
            return false;
        }
    };

    conquestLands.clear = function() {
        try {
            conquestLands.records = [];
            conquestLands.save();
            session.setItem("ConquestDashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in conquestLands.clear: " + err);
            return false;
        }
    };

    conquestLands.getItem = function(index) {
        try {
            var newRecord = null;

            if (index === '' || $u.isNaN(index) || index < 0) {
                con.warn("index", index);
                throw "Invalid identifying index!";
            }

            if (index < conquestLands.records.length) {
                con.log(2, "Got conquest land record", index, conquestLands.records[index]);
                conquestLands.records[index].newRecord = false;
                return conquestLands.records[index];
            }

            newRecord = new conquestLands.record().data;
            newRecord.index = index;
            con.log(2, "New conquest record", index, newRecord);
            return newRecord;
        } catch (err) {
            con.error("ERROR in conquestLands.getItem: " + err);
            return false;
        }
    };

    conquestLands.setItem = function(record) {
        try {
            var it = 0,
                success = false;

            for (it = 0; it < conquestLands.records.length; it += 1) {
                if (conquestLands.records[it].index === record.index) {
                    success = true;
                    break;
                }
            }

            record.newRecord = false;
            if (success) {
                conquestLands.records[it] = record;
                con.log(1, "Updated conquestLands record", record, conquestLands.records);
            } else {
                conquestLands.records.push(record);
                con.log(1, "Added conquestLands record", record, conquestLands.records);
            }
// this causes errors, need to look at it
//            conquestLands.save();
            return true;
        } catch (err) {
            con.error("ERROR in conquestLands.setItem: " + err, record);
            return false;
        }
    };
}());
