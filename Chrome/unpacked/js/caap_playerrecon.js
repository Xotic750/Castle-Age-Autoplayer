/////////////////////////////////////////////////////////////////////
//                              PLAYER RECON
/////////////////////////////////////////////////////////////////////

/* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
/*jslint sub: true */
caap.reconPlayers = function() {
	try {
		if(config.getItem('WhenBattle', 'Never') === 'Never' || !config.getItem('DoPlayerRecon', false) || !schedule.check('PlayerReconTimer') || caap.stats['stamina']['num'] <= 0) {
			return false;
		}

		if(config.getItem("stopReconLimit", true) && battle.reconRecords.length >= config.getItem("LimitTargets", 100)) {
			schedule.setItem('PlayerReconTimer', ( gm ? gm.getItem('PlayerReconRetry', 60, hiddenVar) : 60), 60);
			caap.setDivContent('idle_mess', 'Player Recon: Stop Limit');
			return false;
		}

		function onError(XMLHttpRequest, textStatus, errorThrown) {
			con.error("reconPlayers", textStatus);
            caap.tempAjax = null;
		}

		function onSuccess(data, textStatus, XMLHttpRequest) {
			battle.freshmeat("recon", true);
            caap.tempAjax = null;
		}


		battle.reconInProgress = true;
		caap.setDivContent('idle_mess', 'Player Recon: In Progress');
		con.log(1, "Player Recon: In Progress");
		if(config.getItem('bgRecon', true)) {
			caap.ajax("battle.php", null, onError, onSuccess);
		} else {
			if(caap.navigateTo(caap.battlePage, $j("#app_body img[src*='battle_on.gif']").length ? '' : 'battle_on.gif')) {
				return true;
			}
		}

		return true;
	} catch (err) {
		con.error("ERROR in reconPlayers:" + err);
		return false;
	}
};
