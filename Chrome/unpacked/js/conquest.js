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
                        //name: '',
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
                        //opponent.name = $u.setContent(tempText.regex(/(.+) \(Level/), '');
                        opponent.level = $u.setContent(tempText.regex(/Level (\d+)/i), -1);
                        opponent.rank = $u.setContent(tempText.regex(/Rank (\d+)/i), -1);

                        /*
                        if (opponent.name === '') {
                            con.warn("Unable to match opponent's name", tempText);
                        }
                        */

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

}());
