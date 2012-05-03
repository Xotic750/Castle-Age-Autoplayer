/////////////////////////////////////////////////////////////////////
//                          GUILD BATTLES
/////////////////////////////////////////////////////////////////////

caap.checkResults_guild_current_battles = function() {
	try {
		var tempDiv = $j();
		tempDiv = $j("img[src*='guild_symbol']");
		if(tempDiv && tempDiv.length) {
			tempDiv.each(function() {
				con.log(5, "name", $j(this).parent().parent().next().text().trim());
				con.log(5, "button", $j(this).parent().parent().parent().next().find("input[src*='guild_battle_']"));
			});
		} else {
			return false;
		}

		return true;
	} catch (err) {
		con.error("ERROR in checkResults_guild_current_battles: " + err);
		return false;
	}
}; 
