/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,gm,hiddenVar,
$u,chrome,CAAP_SCOPE_RUN,self,caap,config,con,battle,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              PLAYER RECON
/////////////////////////////////////////////////////////////////////

(function() {
    "use strict";

    caap.reconPlayers = function() {
        function onError(XMLHttpRequest, textStatus, errorThrown) {
            con.error("reconPlayers", [XMLHttpRequest, textStatus, errorThrown]);
        }

        function onSuccess(data, textStatus, XMLHttpRequest) {
            battle.freshmeat("recon", [data, textStatus, XMLHttpRequest]);
        }

        try {
            if (config.getItem('WhenBattle', 'Never') === 'Never' || !config.getItem('DoPlayerRecon', false) || !schedule.check('PlayerReconTimer') || caap.stats.stamina.num <= 0) {
                return false;
            }

            if (config.getItem("stopReconLimit", true) && battle.reconRecords.length >= config.getItem("LimitTargets", 100)) {
                schedule.setItem('PlayerReconTimer', (gm ? gm.getItem('PlayerReconRetry', 60, hiddenVar) : 60), 60);
                caap.setDivContent('idle_mess', 'Player Recon: Stop Limit');
                return false;
            }

            battle.reconInProgress = true;
            caap.setDivContent('idle_mess', 'Player Recon: In Progress');
            con.log(1, "Player Recon: In Progress");
            if (config.getItem('bgRecon', true)) {
                caap.ajax("battle.php", null, onError, onSuccess);
            } else {
                if (caap.navigateTo(caap.battlePage, $j("#app_body img[src*='battle_tab_battle_on.jpg']").length ? '' : 'battle_tab_battle_on.jpg')) {
                    return true;
                }
            }

            return true;
        } catch (err) {
            con.error("ERROR in reconPlayers:" + err);
            return false;
        }
    };

}());
