/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true, sub: true,
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

    conquest.records = [];

    conquest.record = function() {
        this.data = {
            'userId': 0,
            'nameStr': '',
            'rankStr': '',
            'rankNum': 0,
            'arenaRankNum': 0,
            'conquestRankNum': 0,
            'warRankStr': '',
            'warRankNum': 0,
            'levelNum': 0,
            'armyNum': 0,
            'deityNum': 0,
            'deityStr': '',
            'invadewinsNum': 0,
            'invadelossesNum': 0,
            'ibp': 0,
            'duelwinsNum': 0,
            'duellossesNum': 0,
            'dbp': 0,
            'warwinsNum': 0,
            'warlossesNum': 0,
            'wbp': 0,
            'defendwinsNum': 0,
            'defendlossesNum': 0,
            'statswinsNum': 0,
            'statslossesNum': 0,
            'goldNum': 0,
            'chainCount': 0,
            'invadeLostTime': 0,
            'duelLostTime': 0,
            'warLostTime': 0,
            'deadTime': 0,
            'chainTime': 0,
            'ignoreTime': 0,
            'aliveTime': 0,
            'attackTime': 0,
            'selectTime': 0,
            'unknownTime': 0,
            'newRecord': true
        };
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

    conquest.hbest = 2;

    conquest.load = function() {
        try {
            conquest.records = gm.getItem('conquest.records', 'default');
            if (conquest.records === 'default' || !$j.isArray(conquest.records)) {
                conquest.records = gm.setItem('conquest.records', []);
            }

            conquest.hbest = conquest.hbest === false ? JSON.hbest(conquest.records) : conquest.hbest;
            con.log(3, "conquest.load Hbest", conquest.hbest);
            session.setItem("conquestDashUpdate", true);
            con.log(3, "conquest.load", conquest.records);
            return true;
        } catch (err) {
            con.error("ERROR in conquest.load: " + err);
            return false;
        }
    };

    conquest.save = function(src) {
        try {
            var compress = false;

            if (caap.domain.which === 3) {
                caap.messaging.setItem('conquest.records', conquest.records);
            } else {
                gm.setItem('conquest.records', conquest.records, conquest.hbest, compress);
                con.log(3, "conquest.save", conquest.records);
                if (caap.domain.which === 0 && caap.messaging.connected.hasIndexOf("caapif") && src !== "caapif") {
                    caap.messaging.setItem('conquest.records', conquest.records);
                }
            }

            if (caap.domain.which !== 0) {
                session.setItem("conquestDashUpdate", true);
            }

            return true;
        } catch (err) {
            con.error("ERROR in conquest.save: " + err);
            return false;
        }
    };

    conquest.clear = function() {
        try {
            conquest.records = [];
            conquest.save();
            session.setItem("conquestDashUpdate", true);
            return true;
        } catch (err) {
            con.error("ERROR in conquest.clear: " + err);
            return false;
        }
    };

    conquest.getItem = function(userId) {
        try {
            var it = 0,
                len = 0,
                success = false,
                newRecord = null;

            if (userId === '' || $u.isNaN(userId) || userId < 1) {
                con.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0, len = conquest.records.length; it < len; it += 1) {
                if (conquest.records[it]['userId'] === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                con.log(3, "Got conquest record", userId, conquest.records[it]);
                conquest.records[it]['newRecord'] = false;
                return conquest.records[it];
            }

            newRecord = new conquest.record();
            newRecord.data['userId'] = userId;
            con.log(3, "New conquest record", userId, newRecord.data);
            return newRecord.data;
        } catch (err) {
            con.error("ERROR in conquest.getItem: " + err);
            return false;
        }
    };

    conquest.setItem = function(record) {
        try {
            if (!record || !$j.isPlainObject(record)) {
                throw "Not passed a record";
            }

            if (record['userId'] === '' || $u.isNaN(record['userId']) || record['userId'] < 1) {
                con.warn("userId", record['userId']);
                throw "Invalid identifying userId!";
            }

            var it = 0,
                len = 0,
                success = false;

            for (it = 0, len = conquest.records.length; it < len; it += 1) {
                if (conquest.records[it]['userId'] === record['userId']) {
                    success = true;
                    break;
                }
            }

            record['newRecord'] = false;
            if (success) {
                conquest.records[it] = record;
                con.log(3, "Updated conquest record", record, conquest.records);
            } else {
                conquest.records.push(record);
                con.log(3, "Added conquest record", record, conquest.records);
            }

            conquest.save();
            return true;
        } catch (err) {
            con.error("ERROR in conquest.setItem: " + err, record);
            return false;
        }
    };

    conquest.deleteItem = function(userId) {
        try {
            var it = 0,
                len = 0,
                success = false;

            if (userId === '' || $u.isNaN(userId) || userId < 1) {
                con.warn("userId", userId);
                throw "Invalid identifying userId!";
            }

            for (it = 0, len = conquest.records.length; it < len; it += 1) {
                if (conquest.records[it]['userId'] === userId) {
                    success = true;
                    break;
                }
            }

            if (success) {
                conquest.records.splice(it, 1);
                conquest.save();
                con.log(3, "Deleted conquest record", userId, conquest.records);
                return true;
            }

            con.warn("Unable to delete conquest record", userId, conquest.records);
            return false;
        } catch (err) {
            con.error("ERROR in conquest.deleteItem: " + err);
            return false;
        }
    };

    // this function appears to have some serious bugs and really needs to be reworked!
    // it can try to click all 3 buttons, but the DOM could change after each click
    conquest.collect = function() {
        try {
            var button = caap.checkForImage("conq3_btn_collectpower_small.gif"),
                button2 = caap.checkForImage("conq3_btn_collect.gif"),
                buttonCrystal = caap.checkForImage("conq3_btn_pray.gif"),
                timeLeft;

            if ($u.hasContent(button)) {
                caap.click(button);
            }

            if ($u.hasContent(button2)) {
                con.log(1, "button exists");
                caap.click(button2);
            }

            con.log(1, "done with buttons", button, button2, buttonCrystal);
            if ($u.hasContent(buttonCrystal)) {
                caap.click(buttonCrystal);
            }

            timeLeft = $j("div[style*='conq3_mid_notop']")[0].children[0].children[0].children[2].children[0].innerHTML.match(/(\d+)/)[0];
            schedule.setItem('collectConquestTimer', timeLeft * 60 * 60);
            schedule.setItem('collectConquestCrystalTimer', timeLeft * 60 * 60);

            button = null;
            button2 = null;
            buttonCrystal = null;
        } catch (err) {
            con.error("ERROR in collect Conquest: " + err);
            return;
        }
    };

    conquest.battle = function() {
        var slice = $j("#app_body div[style*='war_conquest_header2.jpg']"),
            levelDiv = $j(),
            percentageDiv = $j(),
            rechargeDiv = $j(),
            rechargeSecs = 0,
            timeDiv = $j(),
            timeSecs = 0,
            tokensDiv = $j(),
            temptext = '',
            passedStats = true,
            passedTimes = true,
            opponentsSlice = $j("#app_body div[style*='war_conquest_mid']");

        if ($u.hasContent(slice)) {
            levelDiv = $j("div[style*='width:160px;height:12px;color:#80cfec']", slice);
            if ($u.hasContent(levelDiv)) {
                caap.stats['rank']['conquestLevel'] = $u.setContent(levelDiv.text(), '').regex(/(\d+)/);
            } else {
                con.warn("Unable to get conquest levelDiv");
                passedStats = false;
            }

            percentageDiv = $j("div[style*='war_redbar.jpg']", slice);
            if ($u.hasContent(percentageDiv)) {
                caap.stats['rank']['conquestLevelPercent'] = $u.setContent(percentageDiv.getPercent('width'), 0);
            } else {
                con.warn("Unable to get conquest percentageDiv");
                passedStats = false;
            }

            tokensDiv = $j("#guild_token_current_value", slice).parent();
            if ($u.hasContent(tokensDiv)) {
                temptext = $u.setContent(tokensDiv.text(), '').stripTRN();
                if ($u.hasContent(temptext)) {
                    caap.stats['guildTokens']['max'] = $u.setContent(temptext.regex(/(\d+)\/\d+/), 0);
                    caap.stats['guildTokens']['num'] = $u.setContent(temptext.regex(/\d+\/(\d+)/), 0);
                } else {
                    con.warn("Unable to get tokensDiv text", tokensDiv);
                    passedStats = false;
                }
            } else {
                con.warn("Unable to get conquest tokensMaxDiv");
                passedStats = false;
            }

            caap.stats['guildTokens']['dif'] = caap.stats['conquestT']['max'] - caap.stats['guildTokens']['num'];

            con.log(1, "conquest.battle", caap.stats['rank'], caap.stats['guildTokens']);
            if (passedStats) {
                caap.saveStats();
            }

            rechargeDiv = $j("#guild_token_current_recharge_time", slice);
            if ($u.hasContent(rechargeDiv)) {
                rechargeSecs = $u.setContent(rechargeDiv.val(), '').regex(/(\d+)/);
            } else {
                if (passedStats && caap.stats['conquestT']['num'] > 0 && caap.stats['guildTokens']['max'] > 0 && caap.stats['conquestT']['num'] === caap.stats['guildTokens']['max']) {
                    con.warn("Unable to get conquest rechargeDiv");
                    passedTimes = false;
                }
            }

            timeDiv = $j("#guild_token_time_sec", slice);
            if ($u.hasContent(timeDiv)) {
                timeSecs = $u.setContent(timeDiv.val(), '').regex(/(\d+)/);
            } else {
                if (passedStats && caap.stats['conquestT']['num'] > 0 && caap.stats['guildTokens']['max'] > 0 && caap.stats['conquestT']['num'] === caap.stats['guildTokens']['max']) {
                    con.warn("Unable to get conquest timeDiv");
                    passedTimes = false;
                }
            }

            con.log(1, "conquest.battle", rechargeSecs, timeSecs);
        } else {
            con.warn("Unable to get conquest slice");
        }

        con.log(1, "in battle", opponentsSlice);
        if ($u.hasContent(opponentsSlice)) {
            con.log(1, "My rank is", conquest.conquestRankTable[caap.stats['rank']['conquest']]);
            opponentsSlice.each(function() {
                var opponentDiv = $j(this),
                    boxesDiv = opponentDiv.children("div"),
                    idDiv = $j(),
                    playerDiv = $j(),
                    armyDiv = $j(),
                    tempDiv = $j(),
                    tempText = '',
                    duelNum = 0,
                    invadeNum = 0,
                    opponent = {
                        id: 0,
                        name: '',
                        level: 0,
                        rank: 0,
                        army: 0
                    };

                if ($u.hasContent(boxesDiv) && boxesDiv.length === 7 ) {
                    idDiv = boxesDiv.eq(1);
                    playerDiv = boxesDiv.eq(2);
                    armyDiv = boxesDiv.eq(3);
                } else {
                    con.warn("skipping opponent, missing boxes", opponentDiv);
                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                if ($u.hasContent(idDiv)) {
                    tempDiv = $j("a[href*='keep.php?casuser=']", idDiv);
                    if ($u.hasContent(tempDiv)) {
                        tempText = $u.setContent(tempDiv.attr('href'), '');
                        if ($u.hasContent(tempText)) {
                            opponent.id = $u.setContent(tempText.regex(/casuser=(\d+)/i), -1);

                            if (opponent.id < 1) {
                                con.warn("skipping opponent, unable to get userid", tempText);
                                opponentDiv = null;
                                boxesDiv = null;
                                idDiv = null;
                                playerDiv = null;
                                armyDiv = null;
                                tempDiv = null;
                                return;
                            }
                        } else {
                            con.warn("No text in idDiv");
                            opponentDiv = null;
                            boxesDiv = null;
                            idDiv = null;
                            playerDiv = null;
                            armyDiv = null;
                            tempDiv = null;
                            return;
                        }
                    }
                } else {
                    con.warn("skipping opponent, missing idDiv", opponentDiv);
                    opponentDiv = null;
                    boxesDiv = null;
                    idDiv = null;
                    playerDiv = null;
                    armyDiv = null;
                    tempDiv = null;
                    return;
                }

                if ($u.hasContent(playerDiv)) {
                    tempText = $u.setContent(playerDiv.text(), '');
                    if ($u.hasContent(tempText)) {
                        opponent.name = $u.setContent(tempText.regex(/(.+) \(Level/), '');
                        opponent.level = $u.setContent(tempText.regex(/Level (\d+)/i), -1);
                        opponent.rank = $u.setContent(tempText.regex(/Rank (\d+)/i), -1);

                        if (opponent.name === '') {
                            con.warn("Unable to match opponent's name", tempText);
                        }

                        if (opponent.level === -1 || opponent.rank === -1) {
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
                        opponent.army = $u.setContent(tempText.regex(/(\d+)/i), -1);

                        if (opponent.army === -1) {
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

                // kind of pointless
                duelNum = battle.getItem(opponent.id).duelwinsNum - battle.getItem(opponent.id).duellossesNum;
                invadeNum = battle.getItem(opponent.id).invadewinsNum - battle.getItem(opponent.id).invadelossesNum;

                con.log(1, opponent.id.lpad(' ', 15) + opponent.level.lpad(' ', 4) + conquest.conquestRankTable[opponent.rank].lpad(' ', 15) + opponent.army.lpad(' ', 4) + duelNum.lpad(' ', 3) + invadeNum.lpad(' ', 3));
            });
        } else {
            con.warn("missing opponentDiv");
        }

        slice = null;
        levelDiv = null;
        percentageDiv = null;
        rechargeDiv = null;
        timeDiv = null;
        tokensDiv = null;
    };


    conquest.menu = function() {
        try {
            var XConquestInstructions = "Start battling if Guild Coins is above this points",
                XMinConquestInstructions = "Do not conquest if Guild Coins is below this points",
                chainBPInstructions = "Number of conquest points won to initiate a chain attack. Specify 0 to always chain attack.",
                maxChainsInstructions = "Maximum number of chain hits after the initial attack.",
                FMRankInstructions = "The lowest relative rank below yours that " + "you are willing to spend your Guild Coins on. Leave blank to attack " + "any rank. (Uses Conquest Rank for invade and duel, War Rank for wars.)",
                FMARBaseInstructions = "This value sets the base for your Army " + "Ratio calculation [X * (Your Army Size/ Opponent Army Size)]. It is basically a multiplier for the army " +
                    "size of a player at your equal level. A value of 1 means you " + "will conquest an opponent the same level as you with an army the " + "same size as you or less. Default .5",
                FreshMeatARMaxInstructions = "This setting sets the highest value you will use for the Army Ratio [Math.min(Army Ratio, Army Ratio Max)] value. " +
                    "So, if you NEVER want to fight an army bigger than 80% your size, you can set the Max value to .8.",
                FreshMeatARMinInstructions = "This setting sets the lowest value you will use for the Army Ratio [Math.max(Army Ratio, Army Ratio Min)] value. " +
                    "So, if you NEVER want to pass up an army that is less than 10% the size of yours, you can set MIN value to .1.",
                FreshMeatMaxLevelInstructions = "This sets the highest relative level, above yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent above level 120, you would code 20.",
                FreshMeatMinLevelInstructions = "This sets the lowest relative level, below yours, that you are willing to attack. So if you are a level 100 and do not want to attack an opponent below level 60, you would code 40.",
                conquestList = ['Guild Coins Available', 'At Max Guild Coins', 'At X Guild Coins', 'Never'],
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
            htmlCode += caap.startDropHide('WhenConquest', '', 'Never', true);
            htmlCode += caap.startDropHide('WhenConquest', 'XStamina', 'At X Stamina', false);
            htmlCode += caap.makeNumberFormTR("Start At Or Above", 'XConquestStamina', XConquestInstructions, 1, '', '', true, false);
            htmlCode += caap.makeNumberFormTR("Stop At Or Below", 'XMinConquestStamina', XMinConquestInstructions, 0, '', '', true, false);
            htmlCode += caap.endDropHide('WhenConquest', 'XStamina');
            htmlCode += caap.makeDropDownTR("Conquest Type", 'ConquestType', typeList, typeInst, '', '', false, false, 62);
            htmlCode += caap.makeNumberFormTR("Chain Conquest Points", 'ChainBP', chainBPInstructions, '', '');
            htmlCode += caap.makeNumberFormTR("Max Chains", 'MaxConquestChains', maxChainsInstructions, 4, '', '');
            htmlCode += caap.makeTD("Attack targets that are not:");
            htmlCode += caap.makeNumberFormTR("Lower Than Rank Minus", 'FreshMeatConquestMinRank', FMRankInstructions, '', '', '');
            htmlCode += caap.makeNumberFormTR("Higher Than X*AR", 'FreshMeatConquestARBase', FMARBaseInstructions, 0.5, '', '');
            htmlCode += caap.makeCheckTR('Advanced', 'AdvancedFreshMeatConquestOptions', false);
            htmlCode += caap.startCheckHide('AdvancedFreshMeatConquestOptions');
            htmlCode += caap.makeNumberFormTR("Max Level", 'FreshMeatConquestMaxLevel', FreshMeatMaxLevelInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("Min Level", 'FreshMeatConquestMinLevel', FreshMeatMinLevelInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("Army Ratio Max", 'FreshMeatConquestARMax', FreshMeatARMaxInstructions, '', '', '', true);
            htmlCode += caap.makeNumberFormTR("Army Ratio Min", 'FreshMeatConquestARMin', FreshMeatARMinInstructions, '', '', '', true);
            htmlCode += caap.endCheckHide('AdvancedFreshMeatConquestOptions');
            htmlCode += caap.endDropHide('WhenConquest');
            htmlCode += caap.makeCheckTR("Modify Timers", 'conquestModifyTimers', false, "Advanced timers for how often Conquest functions are performed.");
            htmlCode += caap.startCheckHide('conquestModifyTimers');
            htmlCode += caap.makeNumberFormTR("Conquest retry", 'notSafeCountConquest', "Check the Conquest/Raid X times before release and delay for other processes. Minimum 1.", 20, '', '', true);
            htmlCode += caap.makeNumberFormTR("Conquest delay", 'NoTargetDelayConquest', "Check the Conquest/Raid every X seconds when no target available. Minimum 10.", 45, '', '', true);
            htmlCode += caap.endCheckHide('conquestModifyTimers');
            htmlCode += caap.endToggle;
            return htmlCode;
        } catch (err) {
            con.error("ERROR in conquest.menu: " + err);
            return '';
        }
    };

    conquest.dashboard = function() {
        function points(num) {
            num = $u.setContent(num, 0);
            return num >= 0 ? "+" + num : num;
        }

        try {
            /*-------------------------------------------------------------------------------------\
            Next we build the HTML to be included into the 'caap_infoConquest' div. We set our
            table and then build the header row.
            \-------------------------------------------------------------------------------------*/
            if (config.getItem('DBDisplay', '') === 'Conquest Stats' && session.getItem("ConquestDashUpdate", true)) {
                var headers = ['UserId', 'Name', 'BR', 'WR', 'Level', 'Army', 'Invade', 'Duel', 'War'],
                    values = ['userId', 'nameStr', 'rankNum', 'warRankNum', 'levelNum', 'armyNum', 'invadewinsNum', 'duelwinsNum', 'warwinsNum'],
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
                            width: '30%'
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
                            width: '10%'
                        });
                        break;
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
                for (i = 0, len = conquest.records.length; i < len; i += 1) {
                    row = "";
                    for (pp = 0, len1 = values.length; pp < len1; pp += 1) {
                        switch (values[pp]) {
                        case 'userId':
                            userIdLinkInstructions = "Clicking this link will take you to the user keep of " + conquest.records[i][values[pp]];
                            userIdLink = "keep.php?casuser=" + conquest.records[i][values[pp]];
                            data = {
                                text: '<span id="caap_conquest_' + i + '" title="' + userIdLinkInstructions + '" rlink="' + userIdLink +
                                    '" onmouseover="this.style.cursor=\'pointer\';" onmouseout="this.style.cursor=\'default\';">' + conquest.records[i][values[pp]] + '</span>',
                                color: 'blue',
                                id: '',
                                title: ''
                            };

                            row += caap.makeTd(data);
                            break;
                        case 'rankNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: conquest.records[i]['rankStr']
                            });
                            break;
                        case 'warRankNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: conquest.records[i]['warRankStr']
                            });
                            break;
                        case 'invadewinsNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]] + "/" + conquest.records[i]['invadelossesNum'] + " " + points(conquest.records[i]['ibp']),
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'duelwinsNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]] + "/" + conquest.records[i]['duellossesNum'] + " " + points(conquest.records[i]['dbp']),
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        case 'warwinsNum':
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]] + "/" + conquest.records[i]['warlossesNum'] + " " + points(conquest.records[i]['wbp']),
                                color: '',
                                id: '',
                                title: ''
                            });
                            break;
                        default:
                            row += caap.makeTd({
                                text: conquest.records[i][values[pp]],
                                color: '',
                                id: '',
                                title: ''
                            });
                        }
                    }

                    body += caap.makeTr(row);
                }

                $j("#caap_infoConquest", caap.caapTopObject).html(
                $j(caap.makeTable("conquest", head, body)).dataTable({
                    "bAutoWidth": false,
                    "bFilter": false,
                    "bJQueryUI": false,
                    "bInfo": false,
                    "bLengthChange": false,
                    "bPaginate": false,
                    "bProcessing": false,
                    "bStateSave": true,
                    "bSortClasses": false
                }));

                $j("span[id*='caap_conquest_']", caap.caapTopObject).click(function(e) {
                    var visitUserIdLink = {
                        rlink: '',
                        arlink: ''
                    },
                    i = 0,
                        len = 0;

                    for (i = 0, len = e.target.attributes.length; i < len; i += 1) {
                        if (e.target.attributes[i].nodeName === 'rlink') {
                            visitUserIdLink.rlink = e.target.attributes[i].nodeValue;
                            visitUserIdLink.arlink = visitUserIdLink.rlink;
                        }
                    }

                    caap.clickAjaxLinkSend(visitUserIdLink.arlink);
                });

                session.setItem("ConquestDashUpdate", false);
            }

            return true;
        } catch (err) {
            con.error("ERROR in conquest.dashboard: " + err);
            return false;
        }
    };

}());
