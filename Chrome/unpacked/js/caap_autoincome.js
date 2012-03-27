/////////////////////////////////////////////////////////////////////
//                          AUTOINCOME
/////////////////////////////////////////////////////////////////////

/* This section is formatted to allow Advanced Optimisation by the Closure Compiler */
/*jslint sub: true */
caap.checkAutoIncome = function(minutes) {
	try {
		return $u.hasContent(caap.stats['gold']['ticker']) && caap.stats['gold']['ticker'][0] < $u.setContent(minutes, 1);
	} catch (err) {
		con.error("ERROR in checkAutoIncome: " + err);
		return false;
	}
};
caap.autoIncome = function() {
	try {
		if(config.getItem("disAutoIncome", false) || (config.getItem("NoIncomeAfterLvl", true) && state.getItem('KeepLevelUpGeneral', false))) {
			return false;
		}

		if(caap.checkAutoIncome() && config.getItem('IncomeGeneral', 'Use Current') !== 'Use Current') {
			general.Select('IncomeGeneral');
			return true;
		}

		return false;
	} catch (err) {
		con.error("ERROR in autoIncome: " + err);
		return false;
	}
};
/*jslint sub: false */