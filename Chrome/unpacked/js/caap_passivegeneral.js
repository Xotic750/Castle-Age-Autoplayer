/////////////////////////////////////////////////////////////////////
//                          PASSIVE GENERALS
/////////////////////////////////////////////////////////////////////

caap.passiveGeneral = function() {
	try {
		if(config.getItem('IdleGeneral', 'Use Current') !== 'Use Current') {
			if(general.Select('IdleGeneral')) {
				return true;
			}
		}

		return false;
	} catch (err) {
		con.error("ERROR in passiveGeneral: " + err);
		return false;
	}
}; 