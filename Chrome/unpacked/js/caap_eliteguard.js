/////////////////////////////////////////////////////////////////////
//                          ELITE GUARD
/////////////////////////////////////////////////////////////////////

caap.checkResults_party = function() {
	try {
		if($u.hasContent($j("input[src*='elite_guard_request.gif']", caap.appBodyDiv))) {
			army.eliteCheckImg();
		} else {
			army.eliteResult();
		}

		return true;
	} catch (err) {
		con.error("ERROR in checkResults_army_member: " + err);
		return false;
	}
};
caap.autoElite = function() {
	try {
		if(!config.getItem("EnableArmy", true) || !config.getItem('AutoElite', true) || !schedule.check('AutoEliteGetList')) {
			return false;
		}

		return army.elite();
	} catch (err) {
		con.error("ERROR in autoElite: " + err);
		return false;
	}
}; 