/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,sub: true,
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
            if (conquest.hashCheck(record)) {
                return true;
            }

            var conquestButton = $j(),
                form = $j(),
                inp = $j();

            conquestButton = caap.checkForImage(conquest.battles['Freshmeat'][config.getItem('conquestType', 'Invade')]);
            if ($u.hasContent(conquestButton)) {
                form = conquestButton.parent().parent();
                if ($u.hasContent(form)) {
                    inp = $j("input[name='target_id']", form);
                    if ($u.hasContent(inp)) {
                        inp.attr("value", record.userId);
                        state.setItem("lastconquestID", record.userId);
                        con.log(1, 'Here we click');
                        //conquest.click(conquestButton);
                        state.setItem("notSafeCount", 0);
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

    caap.conquestRefreshed = false;

    caap.conquestBattle = function() {
        try {
            var whenconquest = '',
                target = '',
                targetId = 0,
                conquesttype = '',
                useGeneral = '',
                chainImg = '',
                button = $j(),
                conquestChainId = 0,
                targetType = '',
                conquestRecord = {},
                tempTime = 0;

            if (caap.stats['level'] < 8) {
                if (caap.conquestWarnLevel) {
                    con.log(1, "conquest: Unlock at level 8");
                    caap.conquestWarnLevel = false;
                }

                return false;
            }

            whenconquest = config.getItem('WhenConquest', 'Never');
            switch (whenconquest) {
            case 'Never':
                caap.setDivContent('conquest_mess', 'Conquest off');
                button = null;
                return false;
            default:
            }

            if (caap.checkKeep()) {
                button = null;
                return true;
            }

            if (caap.stats['health']['num'] < 10) {
                con.log(1, 'Health is less than 10: ', caap.stats['health']['num']);
                button = null;
                return false;
            }

            conquesttype = config.getItem('ConquestType', 'Invade');
            if (caap.stats['stamina'] < 1) {
                con.log(1, 'Not enough stamina for ', conquesttype);
                button = null;
                return false;
            }

            switch (conquesttype) {
            case 'Invade':
                useGeneral = 'InvadeGeneral';
                chainImg = 'war_invadeagainbtn.gif';
                if (general.LevelUpCheck(useGeneral)) {
                    useGeneral = 'LevelUpGeneral';
                    con.log(1, 'Using level up general');
                }

                break;
            case 'Duel':
                useGeneral = 'DuelGeneral';
                chainImg = 'war_duelagainbtn.gif';
                if (general.LevelUpCheck(useGeneral)) {
                    useGeneral = 'LevelUpGeneral';
                    con.log(1, 'Using level up general');
                }

                break;
            default:
                con.warn('Unknown conquest type ', conquesttype);
                button = null;
                return false;
            }

            con.log(1, conquesttype, useGeneral);
            if (general.Select(useGeneral)) {
                return true;
            }

            if (caap.navigateTo('conquest_duel', 'conqduel_on.jpg')) {
                return true;
            }

            con.log(1, 'Chain target');
            // Check if we should chain attack
            if ($u.hasContent($j("#app_body #results_main_wrapper img[src*='war_fort_battlevictory.jpg']"))) {
                button = caap.checkForImage(chainImg);
                conquestChainId = state.getItem("conquestChainId", 0);
                if ($u.hasContent(button) && conquestChainId) {
                    caap.setDivContent('conquest_mess', 'Chain Attack In Progress');
                    con.log(1, 'Chaining Target', conquestChainId);
                    conquest.click(button);
                    state.setItem("conquestChainId", 0);
                    button = null;
                    return true;
                }

                state.setItem("conquestChainId", 0);
            }

            con.log(1, 'Get target');
            targetId = conquest.getTarget();
            con.log(1, 'targetId', targetId);
            if (!targetId) {
                con.log(1, 'No valid conquest targetId', targetId);
                button = null;
                return false;
            }

            target = conquest.targets[targetId];
            con.log(1, 'Target', target);
            if (!target) {
                con.log(1, 'No valid conquest target', target);
                button = null;
                return false;
            }

            con.log(1, 'conquest Target', target);

            conquestRecord = conquest.getItem(targetId);
            con.log(1, 'conquestRecord', conquestRecord);

            targetType = config.getItem('ConquestType', 'Invade');
            switch (targetType) {
            case 'Invade':
                tempTime = conquestRecord.invadeLostTime || tempTime;

                break;
            case 'Duel':
                tempTime = conquestRecord.duelLostTime || tempTime;

                break;
            default:
                con.warn("conquest type unknown!", config.getItem("conquestType", 'Invade'));
            }

            if (conquestRecord && conquestRecord.nameStr !== '' && !schedule.since(tempTime, 604800)) {
                con.log(1, 'Avoiding Losing Target', targetId);
                conquest.nextTarget();
                return true;
            }

            //state.setItem('conquestChainId', 0);
            if (caap.conquestUserId(target)) {
                conquest.nextTarget();
                return true;
            }

            con.warn('Doing default UserID list, but no target');
            return false;
        } catch (err) {
            con.error("ERROR in conquest: " + err);
            return false;
        }
    };

}());
