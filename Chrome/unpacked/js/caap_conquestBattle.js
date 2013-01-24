/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
festival,feed,conquest,town,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,gm,hiddenVar,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                          BATTLING PLAYERS
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

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

            if (schedule.check("conquest_token")) {
                con.log(1, 'Checking coins', $u.setContent(caap.displayTime('conquest_token'), "Unknown"));
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

            if (!caap.inLevelUpMode()) {
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
            } else {
                if (caap.stats.guildTokens.num < 1) {
                    con.log(4, 'Waiting Coins ' + caap.stats.guildTokens.num + '/1');
                    caap.setDivContent('conquest_mess', 'Coins Available ' + caap.stats.guildTokens.num + '/1 (' + $u.setContent(caap.displayTime('conquest_token'), "Unknown") + ')');
                    state.setItem("ConquestChainId", 0);
                    button = null;
                    tempDiv = null;
                    return false;
                }

                con.log(1, 'Burn tokens level up ' + caap.stats.guildTokens.num + '/' + config.getItem('ConquestXCoins'));
                caap.setDivContent('conquest_mess', 'Conquest Level Up');
            }

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

            if (caap.checkKeep()) {
                state.setItem("ConquestChainId", 0);
                button = null;
                tempDiv = null;
                return true;
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

}());
