/////////////////////////////////////////////////////////////////////
//                              AUTOGIFT
/////////////////////////////////////////////////////////////////////

caap.checkResults_gift_accept = function() {
	return true;
};
caap.ajaxGiftCheck = function() {
	try {
		if(config.getItem('bookmarkMode', false) || !config.getItem('AutoGift', false) || !schedule.check("ajaxGiftCheck")) {
			return false;
		}

		return gifting.ajaxGiftCheck();
	} catch (err) {
		con.error("ERROR in AjaxGiftCheck: " + err);
		return false;
	}
};
caap.autoGift = function() {
	try {
		/*
		 var whenArena  = '',
		 arenaInfo  = {};

		 whenArena = config.getItem("WhenArena", 'Never');
		 if (whenArena !== 'Never') {
		 arenaInfo = arena.getItem();
		 }*/

		if(caap.checkAutoIncome(3) || caap.inLevelUpMode() || config.getItem('bookmarkMode', false) || !config.getItem('AutoGift', false) /*|| (!$j.isEmptyObject(arenaInfo) && arenaInfo['state'] !== 'Ready')*/) {
			return false;
		}

		return gifting.run();
	} catch (err) {
		con.error("ERROR in autoGift: " + err);
		return false;
	}
};
