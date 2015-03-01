/*jslint white: true, browser: true, devel: true, undef: true,
nomen: true, bitwise: true, plusplus: true,
regexp: true, eqeq: true, newcap: true, forin: false */
/*global window,escape,jQuery,$j,rison,utility,
$u,chrome,CAAP_SCOPE_RUN,self,
schedule,gifting,state,army, general,session,monster,guild_monster */
/*jslint maxlen: 256 */

/////////////////////////////////////////////////////////////////////
//                              PLAYER RECON
/////////////////////////////////////////////////////////////////////

/*-------------------------------------------------------------------------------------\
									  RECON PLAYERS
battle.reconPlayers is an idle background process that scans the battle page for viable
battle.targets that can later be attacked.
\-------------------------------------------------------------------------------------*/


(function () {
    "use strict";
	worker.add('recon');

	worker.addRecordFunctions('recon');
	recon.recordIndex = 'userId';
    recon.record = function() {
        this.data = {
            'userId': 0,
            'nameStr': '',
            'rankNum': 0,
            'warRankNum': 0,
            'levelNum': 0,
            'armyNum': 0,
            'deityNum': 0,
            'aliveTime': 0,
			'arenaRankNum' : 0
        };
    };
	
	worker.addAction({worker : 'recon', priority : -1000, description : 'Player Recon'});
	
    recon.worker = function() {
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

            if (config.getItem("stopReconLimit", true) && recon.records.length >= config.getItem("LimitTargets", 100)) {
                schedule.setItem('PlayerReconTimer', (gm ? gm.getItem('PlayerReconRetry', 60, hiddenVar) : 60), 60);
                caap.setDivContent('idle_mess', 'Player Recon: Stop Limit');
                return false;
            }

            recon.inProgress = true;
            caap.setDivContent('idle_mess', 'Player Recon: In Progress');
            con.log(1, "Player Recon: In Progress");
            if (config.getItem('bgRecon', true)) {
                caap.ajax("battle.php", null, onError, onSuccess);
            } else {
                if (caap.navigateTo(battle.page, $j("#app_body img[src*='battle_tab_battle_on.jpg']").length ? '' : 'battle_tab_battle_on.jpg')) {
                    return true;
                }
            }

            return true;
        } catch (err) {
            con.error("ERROR in recon.worker:" + err);
            return false;
        }
    };
	
    recon.inProgress = false;

}());
